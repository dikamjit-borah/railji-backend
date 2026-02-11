import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { Paper } from '@railji/shared';
import { CreatePaperDto } from './dto/create-paper.dto';
import { ErrorHandlerService } from '@railji/shared';

@Injectable()
export class CreationService {
  private readonly logger = new Logger(CreationService.name);

  constructor(
    @InjectModel(Paper.name) private paperModel: Model<Paper>,
    private errorHandler: ErrorHandlerService,
  ) {}

  async createPaper(createPaperDto: CreatePaperDto): Promise<Paper> {
    try {
      const paperId = `paper-${nanoid(6)}`;
      const paper = await this.paperModel.create({
        ...createPaperDto,
        paperId,
      });
      this.logger.log(`Paper created successfully with ID: ${paper.paperId}`);
      return paper;
    } catch (error) {
      this.errorHandler.handle(error, {
        context: 'CreationService.createPaper',
      });
    }
  }
}
