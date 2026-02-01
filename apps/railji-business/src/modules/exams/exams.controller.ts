import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { SubmitExamDto, StartExamDto } from './dto/exam.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // POST /exams/start - Start exam session
  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startExam(@Body() startExamDto: StartExamDto) {
    const result = await this.examsService.startExam(startExamDto);
    return {
      message: 'Exam session started successfully',
      data: result,
    };
  }

  // POST /exams/submit - Submit exam answers
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitExam(@Body() submitExamDto: SubmitExamDto) {
    const result = await this.examsService.submitExam(submitExamDto);
    return {
      message: 'Exam submitted successfully',
      data: result,
    };
  }
}
