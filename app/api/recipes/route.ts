
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { rename, stat } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUser() {
  // 1. Try NextAuth session
  const session = await getServerSession(authOptions);
  if (session && session.user && session.user.email) {
    return db.findUserByEmail(session.user.email);
  }

  // 2. Try Custom Auth (cookie) if no NextAuth user found
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (sessionId) {
    const dbSession = db.getSession(sessionId);
    if (dbSession) {
      return db.findUserById(dbSession.userId);
    }
  }
  return null;
}

export async function GET() {
  const recipes = db.getRecipes();
  return NextResponse.json({ recipes });
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'slug', 'state', 'region', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Move image from temp to recipes and rename
    if (body.imageUrl) {
        // Case 1: Image is in temp-uploads (New Upload)
        if (body.imageUrl.startsWith('/temp-uploads/')) {
            const oldFilename = body.imageUrl.split('/').pop();
            if (oldFilename) {
                const oldPath = path.join(process.cwd(), 'public', 'temp-uploads', oldFilename);
                const extension = path.extname(oldFilename);
                const newFilename = `${body.slug}${extension}`;
                const newPath = path.join(process.cwd(), 'public', 'recipes', newFilename);
                
                try {
                    // Check if temp file exists
                    await stat(oldPath);
                    // Move and Rename
                    await rename(oldPath, newPath);
                    // Update body
                    body.imageUrl = `/recipes/${newFilename}`;
                    console.log(`Moved and renamed image from ${oldFilename} to ${newFilename}`);
                } catch (err) {
                    console.error('Failed to move image from temp:', err);
                }
            }
        } 
        // Case 2: Image is already in recipes folder (e.g. from previous upload or edit)
        else if (body.imageUrl.startsWith('/recipes/')) {
             const oldFilename = body.imageUrl.split('/').pop();
             // Only rename if the filename doesn't match the new slug
             if (oldFilename && !oldFilename.startsWith(body.slug)) {
                 const oldPath = path.join(process.cwd(), 'public', 'recipes', oldFilename);
                 const extension = path.extname(oldFilename);
                 const newFilename = `${body.slug}${extension}`;
                 const newPath = path.join(process.cwd(), 'public', 'recipes', newFilename);
                 
                 try {
                     await stat(oldPath);
                     await rename(oldPath, newPath);
                     body.imageUrl = `/recipes/${newFilename}`;
                     console.log(`Renamed existing recipe image from ${oldFilename} to ${newFilename}`);
                 } catch (err) {
                     console.error('Failed to rename existing image:', err);
                 }
             }
        }
    }

    try {
      const newRecipe = db.createRecipe(body);
      return NextResponse.json({ recipe: newRecipe }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Failed to create recipe' }, { status: 400 });
    }

  } catch (error) {
    console.error('Create recipe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
