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
  async findByDepartmentId(@Param('departmentId') departmentId: string) {
    const papers = await this.papersService.findByDepartmentId(departmentId);
    return {
      message: 'Papers retrieved successfully',
      data: papers,
    };
  }

  @Put(':paperId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('paperId') paperId: string,
    @Body() updatePaperDto: UpdatePaperDto,
  ) {
    const paper = await this.papersService.update(paperId, updatePaperDto);
    return {
      message: 'Paper updated successfully',
      data: paper,
    };
  }
}
