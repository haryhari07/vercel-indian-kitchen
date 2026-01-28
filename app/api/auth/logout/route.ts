import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (sessionId) {
    db.deleteSession(sessionId);
  }

  cookieStore.delete('session_id');

  return NextResponse.json({ success: true });
}
