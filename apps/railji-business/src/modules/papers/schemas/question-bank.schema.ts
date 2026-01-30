import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/* ---------- Sub Schemas ---------- */

@Schema({ _id: false })
export class LocalizedText {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  hi: string;
}

export const LocalizedTextSchema = SchemaFactory.createForClass(LocalizedText);

@Schema({ _id: false })
export class Option {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  hi: string;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@Schema({ _id: false })
export class QuestionDetail {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  hi: string;
}

export const QuestionDetailSchema =
  SchemaFactory.createForClass(QuestionDetail);

@Schema({ _id: false })
export class Question {
  @Prop({ required: true })
  id: number;

  @Prop({ type: LocalizedTextSchema, required: true })
  questions: LocalizedText;

  @Prop({ type: [OptionSchema], required: true })
  options: Option[];

  @Prop({ required: true })
  correct: number; // index of correct option

  @Prop({ type: [QuestionDetailSchema] })
  details: QuestionDetail[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

/* ---------- Main Schema ---------- */

@Schema({ collection: 'question-bank', timestamps: true })
export class QuestionBank extends Document {
  @Prop({ required: true })
  departmentId: string;

  @Prop({ required: true })
  paperId: string;

  @Prop({ required: true })
  paperCode: string;

  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];
}

export const QuestionBankSchema = SchemaFactory.createForClass(QuestionBank);
