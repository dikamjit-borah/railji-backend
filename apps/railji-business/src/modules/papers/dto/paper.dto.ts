import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreatePaperDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  examId: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsOptional()
  totalQuestions?: number;

  @IsOptional()
  duration?: number;
}

export class UpdatePaperDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsOptional()
  examId?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsOptional()
  totalQuestions?: number;

  @IsOptional()
  duration?: number;
}
