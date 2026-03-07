import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Get,
} from '@nestjs/common';
import { PapersService } from './papers.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';

@Controller('papers')
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaperDto: CreatePaperDto) {
    const result = await this.papersService.createPaper(createPaperDto);
    return {
      message: 'Paper created successfully',
      data: result,
    };
  }

  @Patch(':paperId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('paperId') paperId: string,
    @Body() updatePaperDto: UpdatePaperDto,
  ) {
    const result = await this.papersService.updatePaper(
      paperId,
      updatePaperDto,
    );
    return {
      message: 'Paper updated successfully',
      data: result,
    };
  }

  @Delete(':paperId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('paperId') paperId: string,
    @Body('username') username?: string,
  ) {
    await this.papersService.deletePaper(paperId, username);
    return {
      message: 'Paper deleted successfully',
    };
  }

  @Get('logs')
  @HttpCode(HttpStatus.OK)
  async getPaperLogs() {
    const result = await this.papersService.getPaperLogs();
    return {
      message: 'Paper logs retrieved successfully',
      data: result,
    };
  }
}
