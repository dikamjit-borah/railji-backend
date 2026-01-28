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

@Injectable()
export class PapersService {
  private readonly logger = new Logger(PapersService.name);

  constructor(@InjectModel(Paper.name) private paperModel: Model<Paper>) {}

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
        .populate('examId')
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
        .populate('examId')
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

  async findByDepartmentId(departmentId: string): Promise<Paper[]> {
    try {
      const papers = await this.paperModel
        .find({ departmentId })
        .populate('departmentId')
        .exec();
      this.logger.log(`Found ${papers.length} papers for exam ${departmentId}`);
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
        .populate('paperId')
        .exec();
      if (!paper) {
        this.logger.warn(`Paper not found for update with ID: ${paperId}`);
        throw new NotFoundException(`Paper with ID ${paperId} not found`);
      }
      this.logger.log(`Paper updated with ID: ${paperId}`);
      return paper;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update paper');
    }
  }
}
