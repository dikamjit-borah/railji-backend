import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Department extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  code: string;

  @Prop()
  head: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
