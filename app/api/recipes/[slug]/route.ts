
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { unlink } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUser() {
  // 1. Try NextAuth session
  const session = await getServerSession(authOptions);
  if (session && session.user && session.user.email) {
    return await db.findUserByEmail(session.user.email);
  }

  // 2. Try Custom Auth (cookie) if no NextAuth user found
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (sessionId) {
    const dbSession = await db.getSession(sessionId);
    if (dbSession) {
      return await db.findUserById(dbSession.userId);
    }
  }
  return null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get recipe before deleting to get image URL
    const recipe = await db.getRecipe(slug);
    const imageUrl = recipe?.imageUrl;

    const deleted = await db.deleteRecipe(slug);
    if (deleted) {
      // If recipe deleted successfully, try to delete image
      if (imageUrl && imageUrl.startsWith('/recipes/')) {
        const filename = imageUrl.split('/').pop();
        if (filename) {
          const filePath = path.join(process.cwd(), 'public', 'recipes', filename);
          try {
            await unlink(filePath);
            console.log(`Deleted image: ${filename}`);
          } catch (err) {
            console.error('Failed to delete image file:', err);
            // Don't fail the request if image delete fails, as recipe is already gone
          }
        }
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Delete recipe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedRecipe = await db.updateRecipe(slug, body);

    if (updatedRecipe) {
      return NextResponse.json({ recipe: updatedRecipe });
    } else {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Update recipe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
