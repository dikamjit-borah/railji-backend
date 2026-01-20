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
