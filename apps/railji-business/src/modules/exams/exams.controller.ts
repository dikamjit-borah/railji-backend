import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
//import { ExamsService } from './exams.service';
import { SubmitExamDto, StartExamDto } from './dto/exam.dto';

@Controller('exams')
export class ExamsController {
  constructor(/* private readonly examsService: ExamsService */) {}

  /*   // GET /exams - List available published exams
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllPublished() {
    const exams = await this.examsService.findAllPublished();
    return {
      message: 'Exams retrieved successfully',
      data: exams,
    };
  }

  // GET /exams/:id - Get exam details (without correct answers)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    const exam = await this.examsService.findPublishedById(id);
    return {
      message: 'Exam retrieved successfully',
      data: exam,
    };
  }

  // POST /exams/:id/start - Start exam session
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startExam(@Param('id') id: string, @Body() startExamDto: StartExamDto) {
    const session = await this.examsService.startExam(id, startExamDto.userId);
    return {
      message: 'Exam session started successfully',
      data: session,
    };
  }

  // POST /exams/:id/submit - Submit exam answers
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submitExam(@Param('id') id: string, @Body() submitExamDto: SubmitExamDto) {
    const result = await this.examsService.submitExam(id, submitExamDto);
    return {
      message: 'Exam submitted successfully',
      data: result,
    };
  }

  // GET /exams/:id/results - Get exam results for a user
  @Get(':id/results')
  @HttpCode(HttpStatus.OK)
  async getResults(@Param('id') id: string, @Query('userId') userId: string) {
    const results = await this.examsService.getExamResults(id, userId);
    return {
      message: 'Exam results retrieved successfully',
      data: results,
    };
  } */
}
