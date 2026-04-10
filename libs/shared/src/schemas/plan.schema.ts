import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'plans' })
export class Plan {
  @Prop({ required: true, unique: true })
  planId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  departmentId: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 'INR' })
  currency: string;

  @Prop({ required: true, default: 1 })
  durationMonths: number;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  features: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);

// Indexes
PlanSchema.index({ departmentId: 1 });
PlanSchema.index({ planId: 1 }, { unique: true });