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
      this.logger.log(`Paper created with ID: ${paper._id}`);
      return paper;
    } catch (error) {
      this.logger.error(`Error creating paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create paper');
    }
  }

  async findAll(query?: any): Promise<Paper[]> {
    try {
      const papers = await this.paperModel
        .find(query || {})
        .populate('paperCode')
        .exec();
      this.logger.log(`Found ${papers.length} papers`);
      return papers;
    } catch (error) {
      this.logger.error(`Error fetching papers: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch papers');
    }
  }

  async findById(id: string): Promise<Paper> {
    try {
      const paper = await this.paperModel
        .findById(id)
        .populate('paperCode')
        .exec();
      if (!paper) {
        this.logger.warn(`Paper not found with ID: ${id}`);
        throw new NotFoundException(`Paper with ID ${id} not found`);
      }
      return paper;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch paper');
    }
  }

  async fetchPapersForDepartment(departmentId: string): Promise<Paper[]> {
    try {
      const papers = await this.paperModel
        .find({ departmentId })
        .populate('departmentId')
        .exec();
      if (!papers || papers.length === 0) {
        this.logger.warn(`No papers found for department ID: ${departmentId}`);
        throw new NotFoundException(
          `No papers found for department with ID ${departmentId}`,
        );
      }
      this.logger.log(
        `Found ${papers.length} papers for department ${departmentId}`,
      );
      return papers;
    } catch (error) {
      this.logger.error(
        `Error finding papers by department: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to fetch papers: ${error.message}`);
    }
  }

  async fetchQuestionsForPaper(departmentId: string, paperCode: string) {
    try {
      const questions = await this.questionBankModel
        .find({ departmentId, paperCode })
        .exec();
      this.logger.log(
        `Found ${questions.length} questions for exam ${paperCode}`,
      );
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
    paperCode: string,
    questionId: string,
  ): Promise<Paper[]> {
    try {
      const papers = await this.paperModel
        .find({ paperCode, questionId })
        .populate('paperCode')
        .exec();
      this.logger.log(`Found SDSDSDSDSD ${papers.length} papers for exam ${paperCode}`);
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
    paperCode: string,
    updatePaperDto: UpdatePaperDto,
  ): Promise<Paper> {
    try {
      const paper = await this.paperModel
        .findByIdAndUpdate(paperCode, updatePaperDto, { new: true })
        .populate('paperCode')
        .exec();
      if (!paper) {
        this.logger.warn(`Paper not found for update with ID: ${paperCode}`);
        throw new NotFoundException(`Paper with ID ${paperCode} not found`);
      }
      this.logger.log(`Paper updated with ID: ${paperCode}`);
      return paper;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update paper');
    }
  }
}
