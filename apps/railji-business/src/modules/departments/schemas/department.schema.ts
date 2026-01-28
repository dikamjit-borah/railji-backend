import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'departments', timestamps: true })
export class Department extends Document {
  @Prop({ required: true, unique: true })
  departmentId: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  description: string;

  @Prop()
  icon: string;

  @Prop()
  img: string;

  @Prop({ default: 0 })
  paperCount: number;

  @Prop({ default: 0 })
  materialCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
