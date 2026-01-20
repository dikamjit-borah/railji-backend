import { IsString, IsOptional, IsMongoId, IsNumber } from 'class-validator';

export class CreateExamDto {
  @IsString()
  examName: string;

  @IsString()
  examPosition: string;

  @IsString()
  examDepartment: string;

  @IsNumber()
  totalQuestions: number;

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
