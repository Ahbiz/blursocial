import { Server as SocketIOServer } from 'socket.io';

const globalForSocket = globalThis as typeof globalThis & {
  _socketServer?: SocketIOServer | null;
};

export function getSocketServer(): SocketIOServer | null {
  return globalForSocket._socketServer ?? null;
}

export function setSocketServer(io: SocketIOServer) {
  globalForSocket._socketServer = io;
}
