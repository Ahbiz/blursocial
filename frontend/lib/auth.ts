import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import { User, UserWithoutPassword } from './models/User';

const SESSION_COOKIE = 'blur_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value || null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<UserWithoutPassword | null> {
  const userId = await getSession();
  if (!userId) return null;

  const db = await getDb();
  const user = await db.collection<User>('users').findOne(
    { _id: new ObjectId(userId) },
    { projection: { password: 0 } }
  );

  return user as UserWithoutPassword | null;
}
