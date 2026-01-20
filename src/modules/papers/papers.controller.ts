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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PapersService } from './papers.service';
import { CreatePaperDto, UpdatePaperDto } from './dto/paper.dto';

@Controller('papers')
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'questionKey', maxCount: 1 },
      { name: 'answerKey', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createPaperDto: CreatePaperDto,
    @UploadedFiles() files: { questionKey?: Express.Multer.File[]; answerKey?: Express.Multer.File[] },
  ) {
    if (!files?.questionKey || !files?.answerKey) {
      throw new BadRequestException('Both questionKey and answerKey PDF files are required');
    }

    const paper = await this.papersService.create(createPaperDto, files.questionKey[0], files.answerKey[0]);
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

  @Get('exam/:examId')
  @HttpCode(HttpStatus.OK)
  async findByExamId(@Param('examId') examId: string) {
    const papers = await this.papersService.findByExamId(examId);
    return {
      message: 'Papers retrieved successfully',
      data: papers,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    const paper = await this.papersService.findById(id);
    return {
      message: 'Paper retrieved successfully',
      data: paper,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updatePaperDto: UpdatePaperDto,
  ) {
    const paper = await this.papersService.update(id, updatePaperDto);
    return {
      message: 'Paper updated successfully',
      data: paper,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const result = await this.papersService.delete(id);
    return {
      message: result.message,
      data: null,
    };
  }
}
