import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Exam extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  subject: string;

  @Prop()
  examType: string;

  @Prop()
  duration: number;

  @Prop()
  totalMarks: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
