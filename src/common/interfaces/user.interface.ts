import { Document } from 'mongoose';

export interface IUser {
  fullName: string;
  email: string;
  password?: string;
  provider: 'credentials' | 'google';
}

export type UserDto = IUser & Document;
