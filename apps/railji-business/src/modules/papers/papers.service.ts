import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Paper } from './schemas/paper.schema';
import { CreatePaperDto, UpdatePaperDto } from './dto/paper.dto';
import { QuestionBank } from './schemas/question-bank.schema';

@Injectable()
export class PapersService {
  private readonly logger = new Logger(PapersService.name);
  private readonly paperCodesCache = new Map<
    string,
    { general: string[]; nonGeneral: string[] }
  >();

  constructor(
    @InjectModel(Paper.name) private paperModel: Model<Paper>,
    @InjectModel(QuestionBank.name)
    private questionBankModel: Model<QuestionBank>,
  ) {}

  private clearDepartmentCache(departmentId: string): void {
    // Clear all cache entries for this department (with any filters)
    const keysToDelete: string[] = [];
    for (const key of this.paperCodesCache.keys()) {
      if (key.startsWith(`${departmentId}_`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.paperCodesCache.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.debug(
        `Cleared ${keysToDelete.length} cache entries for department: ${departmentId}`,
      );
    }
  }

  private clearAllDepartmentCaches(): void {
    // Clear all caches since general papers affect all departments
    this.paperCodesCache.clear();
    this.logger.debug(
      'Cleared all paper codes cache due to general paper changes',
    );
  }

  clearAllCache(): void {
    this.paperCodesCache.clear();
    this.logger.debug('Cleared all paper codes cache');
  }

  async create(createPaperDto: CreatePaperDto): Promise<Paper> {
    try {
      const paper = await this.paperModel.create(createPaperDto);

      // Clear cache appropriately based on paper type
      if (paper.paperType === 'general') {
        // General papers affect all departments, clear all caches
        this.clearAllDepartmentCaches();
      } else {
        // Non-general papers only affect specific department
        this.clearDepartmentCache(paper.departmentId);
      }

      return paper;
    } catch (error) {
      this.logger.error(`Error creating paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create paper');
    }
  }

  async findAll(query?: any): Promise<Paper[]> {
    try {
      const papers = await this.paperModel.find(query || {}).exec();
      return papers;
    } catch (error) {
      throw new BadRequestException('Failed to fetch papers');
    }
  }

  async findById(id: string): Promise<Paper> {
    try {
      const paper = await this.paperModel.findById(id).exec();
      if (!paper) {
        throw new NotFoundException(`Paper with ID ${id} not found`);
      }
      return paper;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch paper');
    }
  }

  async fetchPaperCodesByType(
    departmentId: string,
  ): Promise<{ general: string[]; nonGeneral: string[] }> {
    try {
      const cacheKey = `${departmentId}`;

      // Check if paper codes are already cached for this department
      /* if (this.paperCodesCache.has(cacheKey)) {
        this.logger.debug(
          `Returning cached paper codes for department: ${departmentId}`,
        );
        return this.paperCodesCache.get(cacheKey)!;
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
      const paperCodesByType = {
        general: [] as string[],
        nonGeneral: [] as string[],
      };
      result.forEach((item: { type: string; paperCodes: string[] }) => {
        if (item.type === 'general') {
          paperCodesByType.general = item.paperCodes;
        } else {
          paperCodesByType.nonGeneral = item.paperCodes;
        }
      });

      // Cache the paper codes for this department and filters
      this.paperCodesCache.set(cacheKey, paperCodesByType);
      this.logger.debug(
        `Cached ${paperCodesByType.general.length} general (from all departments) and ${paperCodesByType.nonGeneral.length} non-general paper codes for department: ${departmentId}`,
      );

      return paperCodesByType;
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
    query?: any,
  ): Promise<{
    paperCodes: { general: string[]; nonGeneral: string[] };
    papers: Paper[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      // Build the query with departmentId and any additional filters
      const searchQuery = {
        departmentId,
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

  async update(
    paperId: string,
    updatePaperDto: UpdatePaperDto,
  ): Promise<Paper> {
    try {
      const existingPaper = await this.paperModel.findById(paperId).exec();
      if (!existingPaper) {
        throw new NotFoundException(`Paper with ID ${paperId} not found`);
      }

      const paper = await this.paperModel
        .findByIdAndUpdate(paperId, updatePaperDto, { new: true })
        .exec();

      // Clear cache appropriately based on paper type changes
      const oldPaperType = existingPaper.paperType;
      const newPaperType = updatePaperDto.paperType || oldPaperType;

      if (oldPaperType === 'general' || newPaperType === 'general') {
        // If changing to/from general, clear all caches
        this.clearAllDepartmentCaches();
      } else {
        // Only non-general papers, clear specific department cache
        this.clearDepartmentCache(existingPaper.departmentId);
      }

      return paper!;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update paper');
    }
  }
}
