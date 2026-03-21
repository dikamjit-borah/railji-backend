import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'subscriptions', timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  planId: string;

  // Denormalized for fast access checks — avoids joining Plan every time
  @Prop({ required: true })
  departmentId: string;

  @Prop({ enum: ['active', 'expired', 'cancelled'], default: 'active' })
  status: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date; // startDate + interval

  @Prop()
  paymentRef: string; // Razorpay/Stripe payment ID

  @Prop()
  paymentGateway: string; // 'razorpay' | 'stripe'
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
