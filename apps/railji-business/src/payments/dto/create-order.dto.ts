import {  IsString, IsOptional, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  planId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
