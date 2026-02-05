import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum MaterialType {
  VIDEO = 'video',
  PDF = 'pdf',
  OTHER = 'other',
}

@Schema({ collection: 'materials', timestamps: true })
export class Material extends Document {
  @Prop({ required: true })
  materialId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: MaterialType })
  type: MaterialType;

  @Prop({ required: true })
  departmentId: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  thumbnailUrl: string;

  @Prop()
  duration: number; // in seconds for videos

  @Prop()
  fileSize: number; // in bytes

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop()
  tags: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);