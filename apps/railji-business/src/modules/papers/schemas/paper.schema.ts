import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'papers', timestamps: true })
export class Paper extends Document {
  @Prop({ required: true })
  departmentId: string;

  @Prop({ required: true })
  paperCode: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  shift: string;

  @Prop({ required: true })
  zones: string; //17 zones

  @Prop({ required: true })
  examType: string;

  @Prop({ type: [String], required: true })
  sections: string[];

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  passMarks: number;

  @Prop({ required: true })
  negativeMarking: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: false })
  isFree: boolean;

  @Prop({ default: true })
  isNew: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PaperSchema = SchemaFactory.createForClass(Paper);
