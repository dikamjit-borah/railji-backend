import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'plans', timestamps: true })
export class Plan extends Document {
  @Prop({ required: true })
  departmentId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number; // INR

  @Prop({ enum: ['monthly', 'yearly'], default: 'monthly' })
  interval: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
