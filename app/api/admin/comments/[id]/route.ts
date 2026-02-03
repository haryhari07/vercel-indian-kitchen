
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  let user = null;

  if (session && session.user && session.user.email) {
    user = db.findUserByEmail(session.user.email);
  } else {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (sessionId) {
      const dbSession = db.getSession(sessionId);
      if (dbSession) {
        user = db.findUserById(dbSession.userId);
      }
    }
  }

  return user && user.role === 'admin';
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: Props) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const success = db.deleteComment(id);

  if (success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }
}
