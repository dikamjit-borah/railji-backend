import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { Paper, QuestionBank } from '@railji/shared';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { ErrorHandlerService } from '@railji/shared';

@Injectable()
export class PapersService {
  private readonly logger = new Logger(PapersService.name);

  constructor(
    @InjectModel(Paper.name) private paperModel: Model<Paper>,
    @InjectModel(QuestionBank.name)
    private questionBankModel: Model<QuestionBank>,
    private errorHandler: ErrorHandlerService,
  ) {}

  async createPaper(createPaperDto: CreatePaperDto): Promise<any> {
    try {
      const paperId = `paper-${nanoid(6)}`;

      // Extract questions from DTO
      const { questions, ...paperData } = createPaperDto;

      const promises = [
        this.paperModel.create({ paperId, ...paperData }),
        this.questionBankModel.create({
          departmentId: createPaperDto.departmentId,
          paperId,
          ...(createPaperDto.paperCode && {
            paperCode: createPaperDto.paperCode,
          }),
          questions,
        }),
      ];
      await Promise.all(promises);
      this.logger.log(`${paperId} created successfully`);
      return { paperId };
    } catch (error) {
      this.errorHandler.handle(error, {
        context: 'PapersService.createPaper',
      });
    }
  }

  async updatePaper(
    paperId: string,
    updatePaperDto: UpdatePaperDto,
  ): Promise<any> {
    try {
      const { questions, ...paperData } = updatePaperDto;

      const promises = [];

      // Update paper metadata if provided
      if (Object.keys(paperData).length > 0) {
        promises.push(
          this.paperModel
            .findOneAndUpdate({ paperId }, paperData, { new: true })
            .exec(),
        );
      }

      // Update questions if provided
      if (questions) {
        promises.push(
          this.questionBankModel
            .findOneAndUpdate({ paperId }, { questions }, { new: true })
            .exec(),
        );
      }

      await Promise.all(promises);
      this.logger.log(`${paperId} updated successfully`);
      return { paperId };
    } catch (error) {
      this.errorHandler.handle(error, {
        context: 'PapersService.updatePaper',
      });
    }
  }

  async deletePaper(paperId: string): Promise<void> {
    try {
      const promises = [
        this.paperModel.deleteOne({ paperId }).exec(),
        this.questionBankModel.deleteOne({ paperId }).exec(),
      ];

      await Promise.all(promises);
      this.logger.log(`${paperId} deleted successfully`);
    } catch (error) {
      this.errorHandler.handle(error, {
        context: 'PapersService.deletePaper',
      });
    }
  }
}
