import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyPassword } from '@/lib/auth';
import { Room } from '@/lib/models/Room';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const room = await db.collection<Room>('rooms').findOne({ slug });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const isValid = await verifyPassword(password, room.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room._id!.toString(),
        name: room.name,
        slug: room.slug,
      },
    });
  } catch (error) {
    console.error('Verify room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
