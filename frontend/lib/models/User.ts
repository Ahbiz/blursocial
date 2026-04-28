import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  password: string;
  createdAt: Date;
}

export interface UserWithoutPassword {
  _id: ObjectId;
  username: string;
  createdAt: Date;
}
