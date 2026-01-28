import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    let userRating = null;

    if (sessionId) {
      const session = db.getSession(sessionId);
      if (session) {
        const rating = db.getRating(session.userId, slug);
        if (rating) {
          userRating = rating.rating;
        }
      }
    }

    const average = db.getRecipeAverageRating(slug);
    
    return NextResponse.json({
      userRating,
      averageRating: average?.average || null,
      reviewCount: average?.count || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const { rating } = await request.json();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = db.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    db.upsertRating(session.userId, slug, rating);
    
    const average = db.getRecipeAverageRating(slug);

    return NextResponse.json({
      success: true,
      averageRating: average?.average,
      reviewCount: average?.count
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
