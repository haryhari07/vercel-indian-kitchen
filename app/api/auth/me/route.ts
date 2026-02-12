import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    return NextResponse.json({ user: null });
  }

  const session = await db.getSession(sessionId);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await db.findUserById(session.userId);
  if (!user || user.status === 'blocked') {
    return NextResponse.json({ user: null });
  }

  const { passwordHash, ...userInfo } = user;
  return NextResponse.json({ user: userInfo });
}
