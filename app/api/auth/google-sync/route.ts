
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
    }

    const email = session.user.email;
    const name = session.user.name || 'Google User';

    let user = await db.findUserByEmail(email);

    if (user && user.status === 'blocked') {
      return NextResponse.json({ error: 'Your account has been blocked.' }, { status: 403 });
    }

    if (!user) {
      // Create new user for Google login
      // Generate a random password since they use Google to login
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await db.createUser(email, randomPassword, name);
    }

    // Create session for our app
    const appSession = await db.createSession(user.id);

    // Set cookie
    const response = NextResponse.json({ success: true, user });
    response.cookies.set('session_id', appSession.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Google sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
