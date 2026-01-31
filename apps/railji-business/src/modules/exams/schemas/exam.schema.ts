import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/* ---------- Sub Schemas ---------- */

@Schema({ _id: false })
export class Response {
  @Prop({ required: true })
  questionId: number;

  @Prop({ required: true })
  selectedOption: number;

  @Prop({ default: false })
  isFlagged: boolean;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);

@Schema({ _id: false })
export class DeviceInfo {
  @Prop({ required: true })
  browser: string;

  @Prop({ required: true })
  os: string;

  @Prop({ required: true })
  device: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;
}

export const DeviceInfoSchema = SchemaFactory.createForClass(DeviceInfo);

/* ---------- Main Schema ---------- */

@Schema({ collection: 'exams', timestamps: true })
export class Exam extends Document {
  @Prop({ required: true, unique: true })
  attemptId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  departmentId: string;

  @Prop({ required: true })
  paperCode: string;

  @Prop({ type: [ResponseSchema], default: [] })
  responses: Response[];

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ default: 0 })
  attemptedQuestions: number;

  @Prop({ default: 0 })
  unattemptedQuestions: number;

  @Prop({ default: 0 })
  correctAnswers: number;

  @Prop({ default: 0 })
  incorrectAnswers: number;

  @Prop({ default: 0 })
  score: number;

  @Prop({ required: true })
  maxScore: number;

  @Prop({ default: 0 })
  percentage: number;

  @Prop({ default: 0 })
  accuracy: number;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ default: 0 })
  timeTaken: number; // in minutes

  @Prop({
    required: true,
    enum: ['in-progress', 'submitted', 'abandoned', 'timeout'],
    default: 'in-progress',
  })
  status: string;

  @Prop({ default: 0 })
  percentile: number;

  @Prop({ default: false })
  isPassed: boolean;

  @Prop({ required: true })
  passingScore: number;

  /*  @Prop({ 
    required: true,
    enum: ['mock', 'practice', 'final', 'assessment']
  })
  examType: string; */

  @Prop({ type: DeviceInfoSchema, required: true })
  deviceInfo: DeviceInfo;

  @Prop({ default: false })
  isFlagged: boolean;

  @Prop()
  flagReason: string;

  @Prop()
  remarks: string;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// Create indexes for better query performance
ExamSchema.index({ userId: 1, paperCode: 1 });
ExamSchema.index({ departmentId: 1, examType: 1 });
ExamSchema.index({ attemptId: 1 }, { unique: true });
ExamSchema.index({ status: 1, createdAt: -1 });
