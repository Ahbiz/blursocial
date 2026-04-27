import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { Room } from '@/lib/models/Room';
import { Message } from '@/lib/models/Room';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const db = await getDb();
    const room = await db.collection<Room>('rooms').findOne({ slug });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const messages = await db
      .collection<Message>('messages')
      .find({ roomId: room._id })
      .sort({ timestamp: 1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg._id!.toString(),
        content: msg.content,
        timestamp: msg.timestamp,
        tempId: msg.tempId,
      })),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { content, tempId } = await request.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
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

    const message: Message = {
      roomId: room._id as ObjectId,
      content: content.trim(),
      timestamp: new Date(),
      tempId,
    };

    const result = await db.collection<Message>('messages').insertOne(message);

    return NextResponse.json(
      {
        message: {
          id: result.insertedId.toString(),
          content: message.content,
          timestamp: message.timestamp,
          tempId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
