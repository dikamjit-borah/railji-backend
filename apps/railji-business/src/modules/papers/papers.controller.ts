import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PapersService } from './papers.service';
import { CreatePaperDto, UpdatePaperDto } from './dto/paper.dto';

@Controller('papers')
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaperDto: CreatePaperDto) {
    const paper = await this.papersService.create(createPaperDto);
    return {
      message: 'Paper created successfully',
      data: paper,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query?: any) {
    const papers = await this.papersService.findAll(query);
    return {
      message: 'Papers retrieved successfully',
      data: papers,
    };
  }

  @Get(':departmentId')
  @HttpCode(HttpStatus.OK)
  async fetchPapersForDepartment(@Param('departmentId') departmentId: string) {
    const papers =
      await this.papersService.fetchPapersForDepartment(departmentId);
    return {
      message: 'Papers retrieved successfully',
      data: papers,
    };
  }

  @Get(':departmentId/:paperCode')
  @HttpCode(HttpStatus.OK)
  async fetchQuestionsForPaper(
    @Param('departmentId') departmentId: string,
    @Param('paperCode') paperCode: string,
  ) {
    const questions = await this.papersService.fetchQuestionsForPaper(
      departmentId,
      paperCode,
    );
    return {
      message: 'Questions retrieved successfully',
      data: questions,
    };
  }

  @Get(':paperCode/questions/:questionId')
  @HttpCode(HttpStatus.OK)
  async fetchQuestionForPaper(
    @Param('paperCode') paperCode: string,
    @Param('questionId') questionId: string,
  ) {
    const question = await this.papersService.fetchQuestionForPaper(
      paperCode,
      questionId,
    );
    return {
      message: 'Question retrieved successfully',
      data: question,
    };
  }

  @Put(':paperCode')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('paperCode') paperCode: string,
    @Body() updatePaperDto: UpdatePaperDto,
  ) {
    const paper = await this.papersService.update(paperCode, updatePaperDto);
    return {
      message: 'Paper updated successfully',
      data: paper,
    };
  }
}
