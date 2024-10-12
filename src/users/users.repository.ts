import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel('User') private userModel: Model<User>) { }

  async create(user: User): Promise<User> {
    const createdUser = new this.userModel(user);
    return await createdUser.save();
  }

  async update(user: User) {
    return this.userModel.findByIdAndUpdate(user._id.toString(), user).exec();
  }

  async find(query: { email: string, role: string }, limit = 5, page = 1): Promise<{
    users: Partial<User>[],
    total: number
  }> {
    // prepare query
    let preparedQuery = {};
    if (query.email) {
      preparedQuery = {
        ...preparedQuery,
        email: { $regex: query.email, $options: 'i' }
      };
    }
    if (query.role) {
      preparedQuery = {
        ...preparedQuery,
        role: query.role
      };
    }
    
    const users = await this.userModel.find(preparedQuery, {
      "password": 0,
      "createdAt": 0,
      "updatedAt": 0,
      "__v": 0
    }).limit(limit).skip(limit * (page - 1)).exec();

    return {
      users,
      total: await this.userModel.countDocuments().exec(),
    };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email: email }).lean().exec();
  }

  async searchByEmail(email: string, limit = 5): Promise<User[]> {
    return this.userModel.find({
      email: {
        "$regex": email, "$options": "i"
      }
    }, {
      "password": 0,
      "createdAt": 0,
      "updatedAt": 0,
      "__v": 0
    }).limit(limit).lean().exec();
  }

  async findById(userId: string): Promise<User> {
    return this.userModel.findById(userId).exec();
  }

  async delete(userId: string) {
    return this.userModel.findByIdAndDelete(userId).exec();
  }
}
