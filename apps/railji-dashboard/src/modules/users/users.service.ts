import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, ErrorHandlerService } from '@railji/shared';
import { calculateSkip, pagination } from '@railji/shared';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private errorHandler: ErrorHandlerService,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const skip = calculateSkip(page, limit);

      const [users, total] = await Promise.all([
        this.userModel
          .find()
          .select('-password -supabaseId')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
        this.userModel.countDocuments().exec(),
      ]);

      return {
        users,
        ...pagination(page, limit, total),
      };
    } catch (error) {
      this.errorHandler.handle(error, {
        context: 'UsersService.findAll',
      });
    }
  }

  async toggle(userId: string) {
    try {
      const user = await this.userModel.findById(userId).exec();
      
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Toggle the isActive field (default to true if not set)
      const currentActiveStatus = (user as any).isActive ?? true;
      const newActiveStatus = !currentActiveStatus;
      
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          { isActive: newActiveStatus },
          { new: true }
        )
        .select('-password -supabaseId')
        .lean()
        .exec();

      this.logger.log(`User ${userId} active status toggled to ${newActiveStatus}`);
      
      return {
        userId,
        isActive: newActiveStatus,
        user: updatedUser,
      };
    } catch (error) {
      this.errorHandler.handle(error, {
        context: 'UsersService.toggleActive',
      });
    }
  }
}