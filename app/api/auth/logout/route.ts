
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (sessionId) {
    db.deleteSession(sessionId);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('session_id');
  return response;
}
