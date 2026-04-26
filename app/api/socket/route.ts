import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Message } from '@/lib/models/Room';

export const dynamic = 'force-dynamic';

let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer = (req as any).socket?.server as HTTPServer;
    
    if (!httpServer) {
      return new Response('Socket.IO server not available', { status: 500 });
    }

    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-room', (roomSlug: string) => {
        socket.join(roomSlug);
        console.log(`Socket ${socket.id} joined room ${roomSlug}`);
      });

      socket.on('leave-room', (roomSlug: string) => {
        socket.leave(roomSlug);
        console.log(`Socket ${socket.id} left room ${roomSlug}`);
      });

      socket.on('send-message', async (data: { roomSlug: string; content: string; tempId: string }) => {
        try {
          const db = await getDb();
          const room = await db.collection('rooms').findOne({ slug: data.roomSlug });

          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          const message: Message = {
            roomId: room._id as ObjectId,
            content: data.content,
            timestamp: new Date(),
            tempId: data.tempId,
          };

          const result = await db.collection<Message>('messages').insertOne(message);

          const savedMessage = {
            id: result.insertedId.toString(),
            content: message.content,
            timestamp: message.timestamp,
            tempId: data.tempId,
          };

          io!.to(data.roomSlug).emit('new-message', savedMessage);
        } catch (error) {
          console.error('Error saving message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}
