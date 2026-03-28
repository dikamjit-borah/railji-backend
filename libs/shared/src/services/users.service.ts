import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { IUserService } from '../utils/auth.utils';

@Injectable()
export class SharedUsersService implements IUserService {
  constructor(
    @InjectModel(User.name)
    protected readonly userModel: Model<User>,
  ) {}

  async findUserBySupabaseId(supabaseId: string): Promise<{ userId: string }> {
    try {
      const user = await this.userModel.findOne({ supabaseId }).exec();

      if (!user) {
        throw new NotFoundException(`User with supabaseId ${supabaseId} not found`);
      }

      if (!user.userId) {
        throw new NotFoundException(`User with supabaseId ${supabaseId} has no userId`);
      }

      return { userId: user.userId };
    } catch (error) {
      throw error;
    }
  }

  async findUserById(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ userId }).exec();

      if (!user) {
        throw new NotFoundException(`User with userId ${userId} not found`);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
