import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocalizedTextDto {
  @IsString()
  en: string;

  @IsString()
  hi: string;
}

class OptionDto {
  @IsString()
  en: string;

  @IsString()
  hi: string;
}

class QuestionDto {
  @IsNumber()
  id: number;

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  question: LocalizedTextDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @ArrayMinSize(4)
  options: OptionDto[];

  @IsNumber()
  correct: number;
}

export class CreatePaperDto {
  @ValidateIf((o) => o.paperType !== 'general')
  @IsString()
  departmentId?: string;

  @IsString()
  paperCode: string;

  @IsEnum(['general', 'sectional', 'full'])
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[];
}
