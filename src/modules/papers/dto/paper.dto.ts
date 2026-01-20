import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreatePaperDto {
  @IsString()
  examName: string;

  @IsString()
  departmentName: string;

  @IsString()
  paperName: string;

  @IsString()
  @IsOptional()
  description?: string;

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
