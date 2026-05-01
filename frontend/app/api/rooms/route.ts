import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { Room } from '@/lib/models/Room';
import { nanoid } from 'nanoid';

/**
 * POST: Create a new room with an optional duration
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract duration from the request (sent from your Durations component)
    const { name, password, duration } = await request.json();

    // --- Validations ---
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

    // --- Expiration Logic ---
    // If duration is 0, we treat it as infinite (null in DB).
    // Otherwise, we calculate current time + hours converted to milliseconds.
    const expiresAt = duration && duration > 0 
      ? new Date(Date.now() + duration * 60 * 60 * 1000) 
      : null;

    const result = await db.collection<Room>('rooms').insertOne({
      name,
      slug,
      password: hashedPassword,
      createdBy: user._id,
      createdAt: new Date(),
      expiresAt, // MongoDB TTL index handles auto-deletion based on this field
    });

    return NextResponse.json({
      success: true,
      room: {
        id: result.insertedId.toString(),
        name,
        slug,
        expiresAt,
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

/**
 * GET: Fetch all rooms created by the current user that haven't expired
 */
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
    
    // Filter logic:
    // 1. Must be created by the user.
    // 2. Either expiresAt is in the future ($gt now) OR expiresAt is null (permanent).
    const rooms = await db
      .collection<Room>('rooms')
      .find({ 
        createdBy: user._id,
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: null }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      rooms: rooms.map((room) => ({
        id: room._id!.toString(),
        name: room.name,
        slug: room.slug,
        createdAt: room.createdAt,
        expiresAt: room.expiresAt,
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