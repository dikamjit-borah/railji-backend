import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '@railji/shared';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  async findActiveForDepartment(
    userId: string,
    departmentId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionModel
      .findOne({
        userId,
        departmentId,
        status: 'active',
        endDate: { $gt: new Date() },
      })
      .exec();
  }
}
