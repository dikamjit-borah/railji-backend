import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { Paper, QuestionBank } from '@railji/shared';
import { CreatePaperDto } from './dto/create-paper.dto';
import { ErrorHandlerService } from '@railji/shared';

@Injectable()
export class CreationService {
  private readonly logger = new Logger(CreationService.name);

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
          paperCode: createPaperDto.paperCode,
          questions,
        }),
      ];
      await Promise.all(promises);
      this.logger.log(`${paperId} created successfully`);
      return { paperId };
    } catch (error) {
      this.errorHandler.handle(error, {
        context: 'CreationService.createPaper',
      });
    }
  }
}
