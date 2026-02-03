import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Paper } from './schemas/paper.schema';
import { QuestionBank } from './schemas/question-bank.schema';
import { CacheService } from '@railji/shared';
import { cleanObjectArrays, ensureCleanArray } from '../../utils/utils';
import { FetchPapersQueryDto } from './dto/paper.dto';

export interface PaperCodesByType {
  general: string[];
  nonGeneral: string[];
}

@Injectable()
export class PapersService {
  private readonly logger = new Logger(PapersService.name);
  private readonly PAPER_CODES_PREFIX = 'paper_codes';
  private readonly TOP_PAPERS_CACHE_KEY = 'top_papers';
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectModel(Paper.name) private paperModel: Model<Paper>,
    @InjectModel(QuestionBank.name)
    private questionBankModel: Model<QuestionBank>,
    private readonly cacheService: CacheService,
  ) {}

  private generateCacheKey(departmentId: string, filters?: any): string {
    const filtersStr = filters ? JSON.stringify(filters) : '{}';
    return `${this.PAPER_CODES_PREFIX}:${departmentId}:${filtersStr}`;
  }

  clearAllCache(): void {
    this.cacheService.clear();
    this.logger.debug('Cleared all paper codes cache and top papers cache');
  }

  async findAll(query?: any): Promise<Paper[]> {
    try {
      const papers = await this.paperModel.find(query || {}).exec();
      return papers;
    } catch (error) {
      throw new BadRequestException('Failed to fetch papers');
    }
  }

  async getTopPapers(): Promise<Paper[]> {
    try {
      // Check cache first
      const cached = this.cacheService.get<Paper[]>(this.TOP_PAPERS_CACHE_KEY);

      if (cached) {
        this.logger.debug('Returning cached top papers');
        return cached;
      }

      // Fetch from database
      const papers = await this.paperModel.find().limit(6).exec();

      // Cache the result
      this.cacheService.set(
        this.TOP_PAPERS_CACHE_KEY,
        papers,
        this.DEFAULT_TTL,
      );
      this.logger.debug(`Cached ${papers.length} top papers`);

      return papers;
    } catch (error) {
      this.logger.error(
        `Error fetching top papers: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch top papers');
    }
  }

  async findById(paperId: string): Promise<Paper> {
    try {
      const paper = await this.paperModel.findOne({ paperId }).exec();
      if (!paper) {
        throw new NotFoundException(`Paper with ID ${paperId} not found`);
      }
      return paper;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch paper');
    }
  }

  async fetchPaperCodesByType(departmentId: string): Promise<PaperCodesByType> {
    try {
      const cacheKey = this.generateCacheKey(departmentId);

      // Check if paper codes are already cached
      /* const cached = this.cacheService.get<PaperCodesByType>(cacheKey);
      if (cached) {
        this.logger.debug(
          `Returning cached paper codes for department: ${departmentId}`,
        );
        return cached;
      } */

      // Single aggregation with conditional logic for general vs non-general papers
      const result = await this.paperModel
        .aggregate([
          {
            $match: {
              $or: [
                // General papers from entire collection (no department filter)
                {
                  paperType: 'general',
                },
                // Non-general papers from specific department only
                {
                  departmentId,
                  paperType: { $ne: 'general' },
                },
              ],
            },
          },
          {
            $group: {
              _id: {
                paperCode: '$paperCode',
                paperType: '$paperType',
              },
            },
          },
          {
            $group: {
              _id: {
                $cond: {
                  if: { $eq: ['$_id.paperType', 'general'] },
                  then: 'general',
                  else: 'nonGeneral',
                },
              },
              paperCodes: { $addToSet: '$_id.paperCode' },
            },
          },
          {
            $project: {
              _id: 0,
              type: '$_id',
              paperCodes: { $sortArray: { input: '$paperCodes', sortBy: 1 } },
            },
          },
        ])
        .exec();

      // Process results
      const paperCodesByType: PaperCodesByType = {
        general: [],
        nonGeneral: [],
      };

      result.forEach((item: { type: string; paperCodes: string[] }) => {
        if (item.type === 'general') {
          paperCodesByType.general = ensureCleanArray(item.paperCodes);
        } else {
          paperCodesByType.nonGeneral = ensureCleanArray(item.paperCodes);
        }
      });

      // Clean the results to ensure no null values
      const cleanedPaperCodes = cleanObjectArrays(paperCodesByType);

      // Cache the results
      this.cacheService.set(cacheKey, cleanedPaperCodes, this.DEFAULT_TTL);
      this.logger.debug(
        `Cached ${cleanedPaperCodes.general.length} general and ${cleanedPaperCodes.nonGeneral.length} non-general paper codes for department: ${departmentId}`,
      );

      return cleanedPaperCodes;
    } catch (error) {
      this.logger.error(
        `Error fetching paper codes by type for department: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to fetch paper codes: ${error.message}`,
      );
    }
  }

  async fetchPapersForDepartment(
    departmentId: string,
    page: number = 1,
    limit: number = 10,
    query?: FetchPapersQueryDto,
  ): Promise<{
    paperCodes: PaperCodesByType;
    papers: Paper[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      // Build the query with departmentId and any additional filters
      const searchQuery = {
        ...(query.paperType !== 'general' && { departmentId }),
        ...query,
      };

      // Get cached paper codes by type
      const paperCodes = await this.fetchPaperCodesByType(departmentId);

      // Fetch paginated papers and total count
      const [papers, total] = await Promise.all([
        this.paperModel.find(searchQuery).skip(skip).limit(limit).exec(),
        this.paperModel.countDocuments(searchQuery).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        paperCodes,
        papers,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error(
        `Error finding papers by department: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to fetch papers: ${error.message}`);
    }
  }

  async fetchQuestionsForDepartmentPaper(
    departmentId: string,
    paperId: string,
  ) {
    try {
      const questions = await this.questionBankModel
        .find({ departmentId, paperId }, { 'questions.correct': 0 })
        .exec();
      return questions;
    } catch (error) {
      this.logger.error(
        `Error finding papers by exam: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch papers');
    }
  }

  async fetchAnswersForDepartmentPaper(departmentId: string, paperId: string) {
    try {
      const answers = await this.questionBankModel
        .aggregate([
          {
            $match: { departmentId, paperId },
          },
          {
            $project: {
              answers: {
                $map: {
                  input: '$questions',
                  as: 'question',
                  in: {
                    id: '$$question.id',
                    correct: '$$question.correct',
                  },
                },
              },
            },
          },
        ])
        .exec();
      return answers;
    } catch (error) {
      this.logger.error(
        `Error finding answers by department and paper: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch answers');
    }
  }

  async fetchQuestionForPaper(
    paperId: string,
    questionId: string,
  ): Promise<Paper[]> {
    try {
      const papers = await this.paperModel.find({ paperId, questionId }).exec();
      return papers;
    } catch (error) {
      this.logger.error(
        `Error finding papers by exam: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch papers');
    }
  }
}
