
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  let user = null;

  if (session && session.user && session.user.email) {
    user = await db.findUserByEmail(session.user.email);
  } else {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (sessionId) {
      const dbSession = await db.getSession(sessionId);
      if (dbSession) {
        user = await db.findUserById(dbSession.userId);
      }
    }
  }

  return user && user.role === 'admin';
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await db.getAllUsers();
  return NextResponse.json({ users });
}
