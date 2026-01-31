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

  constructor(
    @InjectModel(Paper.name) private paperModel: Model<Paper>,
    @InjectModel(QuestionBank.name)
    private questionBankModel: Model<QuestionBank>,
  ) {}

  async create(createPaperDto: CreatePaperDto): Promise<Paper> {
    try {
      const paper = await this.paperModel.create(createPaperDto);
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

  async fetchPapersForDepartment(
    departmentId: string,
    page: number = 1,
    limit: number = 10,
    query?: any,
  ): Promise<{
    paperCodes: string[];
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

      const result = await this.paperModel
        .aggregate([
          // Match documents based on search criteria
          { $match: searchQuery },

          // Create a facet to run multiple operations in parallel
          {
            $facet: {
              // Get unique paperCodes
              paperCodes: [
                { $group: { _id: '$paperCode' } },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, paperCode: '$_id' } },
              ],

              // Get paginated papers
              papers: [{ $skip: skip }, { $limit: limit }],

              // Get total count
              totalCount: [{ $count: 'count' }],
            },
          },
        ])
        .exec();

      const data = result[0];
      const paperCodes = data.paperCodes.map((item) => item.paperCode);
      const papers = data.papers;
      const total = data.totalCount[0]?.count || 0;
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
      const paper = await this.paperModel
        .findByIdAndUpdate(paperId, updatePaperDto, { new: true })
        .exec();
      if (!paper) {
        throw new NotFoundException(`Paper with ID ${paperId} not found`);
      }
      return paper;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update paper');
    }
  }
}
