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

  async hasAccessToPaper(
    userId: string,
    paperId: string,
    departmentId: string,
    isGeneralPaper: boolean = false,
  ): Promise<boolean> {
    // If it's a general paper, check if user has access to any department
    if (isGeneralPaper) {
      const anyDepartmentAccess = await this.subscriptionModel
        .findOne({
          userId,
          status: 'active',
          endDate: { $gt: new Date() },
          accessType: 'department',
        })
        .exec();
      
      if (anyDepartmentAccess) {
        return true;
      }
    }

    // Check for specific paper or department access
    const subscription = await this.subscriptionModel
      .findOne({
        userId,
        status: 'active',
        endDate: { $gt: new Date() },
        $or: [
          { accessType: 'paper', paperIds: { $in: [paperId] } }, // Direct paper access
          { accessType: 'department', departmentId }, // Department access
        ],
      })
      .exec();

    return !!subscription;
  }

  async getUserActiveSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionModel
      .find({
        userId,
        status: 'active',
        endDate: { $gt: new Date() },
      })
      .exec();
  }

  async getUserAccessibleDepartments(userId: string): Promise<string[]> {
    const subscriptions = await this.subscriptionModel
      .find({
        userId,
        accessType: 'department',
        status: 'active',
        endDate: { $gt: new Date() },
      })
      .select('departmentId')
      .exec();
    
    return subscriptions.map(sub => sub.departmentId).filter(Boolean);
  }

  async getUserAccessiblePapers(userId: string): Promise<string[]> {
    const subscriptions = await this.subscriptionModel
      .find({
        userId,
        accessType: 'paper',
        status: 'active',
        endDate: { $gt: new Date() },
      })
      .select('paperIds')
      .exec();
    
    const papers = new Set<string>();
    subscriptions.forEach(sub => {
      sub.paperIds.forEach(paperId => papers.add(paperId));
    });
    
    return Array.from(papers);
  }
}
