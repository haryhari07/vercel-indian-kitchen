import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { recipes } from '@/data/recipes';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarkedSlugs = await db.getUserBookmarks(session.userId);
    
    // Enrich with recipe details
    const savedRecipes = recipes.filter(r => bookmarkedSlugs.includes(r.slug));

    return NextResponse.json({ recipes: savedRecipes });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
