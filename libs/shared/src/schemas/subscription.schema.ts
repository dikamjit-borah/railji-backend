import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'subscriptions', timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ enum: ['department', 'paper'], required: true })
  accessType: string;

  // For department-level access (single department per document)
  @Prop()
  departmentId: string;

  // For paper-level access (array of papers per document)
  @Prop({ type: [String] })
  paperIds: string[];

  @Prop({ enum: ['active', 'expired', 'cancelled'], default: 'active' })
  status: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  paymentRef: string; // Razorpay/Stripe payment ID

  @Prop()
  paymentGateway: string; // 'razorpay' | 'stripe'

  @Prop()
  description: string; // Optional description of what this subscription covers

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
