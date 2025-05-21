import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async find(email: string) {
    return this.userModel.findOne({ email }).exec();
  }
  async create(data: Partial<User>) {
    const user = new this.userModel(data);
    return user.save();
  }
}
