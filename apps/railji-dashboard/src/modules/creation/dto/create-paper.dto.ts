import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreatePaperDto {
  @IsString()
  departmentId: string;

  @IsString()
  paperCode: string;

  @IsEnum(['general', 'sectional', 'full-paper'])
  paperType: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  year: number;

  @IsString()
  shift: string;

  @IsString()
  zones: string;

  @IsArray()
  @IsString({ each: true })
  sections: string[];

  @IsNumber()
  totalQuestions: number;

  @IsNumber()
  duration: number;

  @IsNumber()
  passMarks: number;

  @IsNumber()
  negativeMarking: number;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  usersAttempted?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
}
