import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = db.findUserByEmail(email);

    if (!user || !db.validatePassword(user, password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const session = db.createSession(user.id);

    // Set cookie
    (await cookies()).set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(session.expiresAt),
      path: '/',
    });

    // Return user info (excluding password)
    const { passwordHash, ...userInfo } = user;
    return NextResponse.json({ user: userInfo });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
