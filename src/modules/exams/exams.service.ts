import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam } from './schemas/exam.schema';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(@InjectModel(Exam.name) private examModel: Model<Exam>) {}

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    try {
      const exam = await this.examModel.create(createExamDto);
      this.logger.log(`Exam created with ID: ${exam._id}`);
      return exam;
    } catch (error) {
      this.logger.error(`Error creating exam: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create exam');
    }
  }

  async findAll(query?: any): Promise<Exam[]> {
    try {
      const exams = await this.examModel.find(query || {}).exec();
      this.logger.log(`Found ${exams.length} exams`);
      return exams;
    } catch (error) {
      this.logger.error(`Error fetching exams: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch exams');
    }
  }

  async findById(id: string): Promise<Exam> {
    try {
      const exam = await this.examModel.findById(id).exec();
      if (!exam) {
        this.logger.warn(`Exam not found with ID: ${id}`);
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }
      return exam;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding exam: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch exam');
    }
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    try {
      const exam = await this.examModel
        .findByIdAndUpdate(id, updateExamDto, { new: true })
        .exec();
      if (!exam) {
        this.logger.warn(`Exam not found for update with ID: ${id}`);
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }
      this.logger.log(`Exam updated with ID: ${id}`);
      return exam;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating exam: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update exam');
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const exam = await this.examModel.findByIdAndDelete(id).exec();
      if (!exam) {
        this.logger.warn(`Exam not found for deletion with ID: ${id}`);
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }
      this.logger.log(`Exam deleted with ID: ${id}`);
      return { message: 'Exam deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error deleting exam: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete exam');
    }
  }
}
