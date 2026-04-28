import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { Room } from '@/lib/models/Room';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Room name and password are required' },
        { status: 400 }
      );
    }

    if (name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: 'Room name must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const slug = nanoid(10);
    const hashedPassword = await hashPassword(password);

    const result = await db.collection<Room>('rooms').insertOne({
      name,
      slug,
      password: hashedPassword,
      createdBy: user._id,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      room: {
        id: result.insertedId.toString(),
        name,
        slug,
      },
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const rooms = await db
      .collection<Room>('rooms')
      .find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      rooms: rooms.map((room) => ({
        id: room._id!.toString(),
        name: room.name,
        slug: room.slug,
        createdAt: room.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
