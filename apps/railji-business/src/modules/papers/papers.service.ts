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

  async fetchPapersForDepartment(departmentId: string): Promise<Paper[]> {
    try {
      const papers = await this.paperModel.find({ departmentId }).exec();
      if (!papers || papers.length === 0) {
        throw new NotFoundException(
          `No papers found for department with ID ${departmentId}`,
        );
      }

      return papers;
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
        .find({ departmentId, paperId })
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
