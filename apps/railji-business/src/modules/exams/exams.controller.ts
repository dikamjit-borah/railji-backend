import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExamDto: CreateExamDto) {
    const exam = await this.examsService.create(createExamDto);
    return {
      message: 'Exam created successfully',
      data: exam,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query?: any) {
    const exams = await this.examsService.findAll(query);
    return {
      message: 'Exams retrieved successfully',
      data: exams,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    const exam = await this.examsService.findById(id);
    return {
      message: 'Exam retrieved successfully',
      data: exam,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    const exam = await this.examsService.update(id, updateExamDto);
    return {
      message: 'Exam updated successfully',
      data: exam,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const result = await this.examsService.delete(id);
    return {
      message: result.message,
      data: null,
    };
  }
}
