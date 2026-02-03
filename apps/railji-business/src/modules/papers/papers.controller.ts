import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PapersService } from './papers.service';
import { FetchPapersQueryDto } from './dto/paper.dto';

@Controller('papers')
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query?: any) {
    const papers = await this.papersService.findAll(query);
    return {
      message: 'Papers retrieved successfully',
      data: papers,
    };
  }

  @Get('top')
  @HttpCode(HttpStatus.OK)
  async getTopPapers() {
    const papers = await this.papersService.getTopPapers();
    return {
      message: 'Top papers retrieved successfully',
      data: papers,
    };
  }

  @Get(':departmentId')
  @HttpCode(HttpStatus.OK)
  async fetchPapersForDepartment(
    @Param('departmentId') departmentId: string,
    @Query() queryDto: FetchPapersQueryDto,
  ) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;

    // Build search query from optional filters
    const searchQuery: any = {};
    if (queryDto.paperCode) searchQuery.paperCode = queryDto.paperCode;
    if (queryDto.paperType) searchQuery.paperType = queryDto.paperType;
    if (queryDto.year) searchQuery.paperType = queryDto.year;

    const result = await this.papersService.fetchPapersForDepartment(
      departmentId,
      page,
      limit,
      searchQuery,
    );

    return {
      message: 'Papers retrieved successfully',
      data: {
        papers: result.papers,
        metadata: { paperCodes: result.paperCodes },
        pagination: {
          page: result.page,
          limit,
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

  @Get(':departmentId/:paperId/answers')
  @HttpCode(HttpStatus.OK)
  async fetchAnswersForPaper(
    @Param('departmentId') departmentId: string,
    @Param('paperId') paperId: string,
  ) {
    const answers = await this.papersService.fetchAnswersForDepartmentPaper(
      departmentId,
      paperId,
    );
    return {
      message: 'Answers retrieved successfully',
      data: answers,
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
}
