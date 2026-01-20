import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateExamDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  examType?: string;

  @IsOptional()
  duration?: number;

  @IsOptional()
  totalMarks?: number;
}

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  examType?: string;

  @IsOptional()
  duration?: number;

  @IsOptional()
  totalMarks?: number;
}
