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
  async fetchPapersForDepartment(
    @Param('departmentId') departmentId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query() query: any = {},
  ) {
    // Remove pagination params from query object
    const { page: _, limit: __, ...searchQuery } = query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await this.papersService.fetchPapersForDepartment(
      departmentId,
      pageNum,
      limitNum,
      searchQuery,
    );

    return {
      message: 'Papers retrieved successfully',
      data: {
        papers: result.papers,
        metadata: { paperCodes: result.paperCodes },
        pagination: {
          page: result.page,
          limit: limitNum,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Get(':departmentId/:paperId')
  @HttpCode(HttpStatus.OK)
  async fetchQuestionsForDepartmentPaper(
    @Param('departmentId') departmentId: string,
    @Param('paperId') paperId: string,
  ) {
    const questions = await this.papersService.fetchQuestionsForDepartmentPaper(
      departmentId,
      paperId,
    );
    return {
      message: 'Questions retrieved successfully',
      data: questions,
    };
  }

  @Get(':paperId/questions/:questionId')
  @HttpCode(HttpStatus.OK)
  async fetchQuestionForPaper(
    @Param('paperId') paperId: string,
    @Param('questionId') questionId: string,
  ) {
    const question = await this.papersService.fetchQuestionForPaper(
      paperId,
      questionId,
    );
    return {
      message: 'Question retrieved successfully',
      data: question,
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
