import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { cookies } from 'next/headers';

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

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      console.log('Upload failed: No valid session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Upload user check:', { email: user.email, role: user.role });

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Create unique filename base
    const filenameBase = file.name.replace(/\s+/g, '-').toLowerCase().replace(/\.[^/.]+$/, "");
    
    // Ensure directory exists - public/temp-uploads
    const uploadDir = path.join(process.cwd(), 'public', 'temp-uploads');
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (err) {
        // Ignore if exists
    }

    // CLEANUP: Delete files older than 1 hour in temp folder
    try {
      const { readdir, stat, unlink } = await import('fs/promises');
      const files = await readdir(uploadDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = await stat(filePath);
        if (now - stats.mtimeMs > oneHour) {
          await unlink(filePath).catch(() => {}); // Ignore errors
        }
      }
    } catch (cleanupErr) {
      console.error('Cleanup failed:', cleanupErr);
    }
    
    let finalFilename = `${Date.now()}-${filenameBase}.webp`;
    let filePath = path.join(uploadDir, finalFilename);
    
    try {
      // Try to optimize image: resize to max 1200px width/height, convert to WebP
      // Optimized for web speed: Quality 75, Max Effort (6), Smart Subsampling
      await sharp(buffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 75, 
          effort: 6, // Maximum effort for smallest file size
          smartSubsample: true 
        })
        .toFile(filePath);
    } catch (sharpError) {
      console.error('Sharp optimization failed, falling back to original file:', sharpError);
      // Fallback: save original file
      const originalExt = path.extname(file.name) || '.jpg';
      finalFilename = `${Date.now()}-${filenameBase}${originalExt}`;
      filePath = path.join(uploadDir, finalFilename);
      await writeFile(filePath, buffer);
    }

    return NextResponse.json({ url: `/temp-uploads/${finalFilename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url || !url.startsWith('/recipes/')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const filename = url.split('/').pop();
    if (!filename) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'recipes', filename);
    
    try {
      await unlink(filePath);
      console.log('Deleted temp image:', filename);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Failed to delete file:', err);
      return NextResponse.json({ error: 'File not found or cannot be deleted' }, { status: 404 });
    }

  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
