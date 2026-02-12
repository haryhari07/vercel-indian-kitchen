import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    if (await db.findUserByEmail(email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = await db.createUser(email, password, name);
    const session = await db.createSession(user.id);

    (await cookies()).set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(session.expiresAt),
      path: '/',
    });

    const { passwordHash, ...userInfo } = user;
    return NextResponse.json({ user: userInfo });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
