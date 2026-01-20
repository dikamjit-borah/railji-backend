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

  async create(
    createPaperDto: CreatePaperDto,
    questionKeyFile: Express.Multer.File,
    answerKeyFile: Express.Multer.File,
  ): Promise<Paper> {
    try {
      // Dummy S3 upload calls
      const questionKeyUrl = await this.uploadToS3(questionKeyFile, 'question-keys');
      const answerKeyUrl = await this.uploadToS3(answerKeyFile, 'answer-keys');

      this.logger.log(`Uploaded question key to S3: ${questionKeyUrl}`);
      this.logger.log(`Uploaded answer key to S3: ${answerKeyUrl}`);

      const paperData = {
        ...createPaperDto,
        questionKeyUrl,
        answerKeyUrl,
      };

      const paper = await this.paperModel.create(paperData);
      this.logger.log(`Paper created with ID: ${paper._id}`);
      return paper;
    } catch (error) {
      this.logger.error(`Error creating paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create paper');
    }
  }

  private async uploadToS3(file: Express.Multer.File, folder: string): Promise<string> {
    // Dummy S3 upload implementation
    try {
      const filename = `${folder}/${Date.now()}-${file.originalname}`;
      this.logger.log(`Uploading file to S3: ${filename}`);

      // Dummy call - replace with actual AWS SDK call
      const s3Url = `https://your-s3-bucket.s3.amazonaws.com/${filename}`;

      return s3Url;
    } catch (error) {
      this.logger.error(`Error uploading to S3: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload file to S3');
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

  async findByExamId(examId: string): Promise<Paper[]> {
    try {
      const papers = await this.paperModel
        .find({ examId })
        .populate('examId')
        .exec();
      this.logger.log(`Found ${papers.length} papers for exam ${examId}`);
      return papers;
    } catch (error) {
      this.logger.error(
        `Error finding papers by exam: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch papers');
    }
  }

  async update(id: string, updatePaperDto: UpdatePaperDto): Promise<Paper> {
    try {
      const paper = await this.paperModel
        .findByIdAndUpdate(id, updatePaperDto, { new: true })
        .populate('examId')
        .exec();
      if (!paper) {
        this.logger.warn(`Paper not found for update with ID: ${id}`);
        throw new NotFoundException(`Paper with ID ${id} not found`);
      }
      this.logger.log(`Paper updated with ID: ${id}`);
      return paper;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update paper');
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const paper = await this.paperModel.findByIdAndDelete(id).exec();
      if (!paper) {
        this.logger.warn(`Paper not found for deletion with ID: ${id}`);
        throw new NotFoundException(`Paper with ID ${id} not found`);
      }
      this.logger.log(`Paper deleted with ID: ${id}`);
      return { message: 'Paper deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error deleting paper: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete paper');
    }
  }
}
