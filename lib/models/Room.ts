import { ObjectId } from 'mongodb';

export interface Room {
  _id?: ObjectId;
  name: string;
  slug: string;
  password: string;
  createdBy: ObjectId;
  createdAt: Date;
}

export interface Message {
  _id?: ObjectId;
  roomId: ObjectId;
  content: string;
  timestamp: Date;
  tempId?: string;
  reactions?: Record<string, string[]>;
}
