import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { Paper, PaperSchema } from './schemas/paper.schema';
import {
  QuestionBank,
  QuestionBankSchema,
} from './schemas/question-bank.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Paper.name, schema: PaperSchema },
      { name: QuestionBank.name, schema: QuestionBankSchema },
    ]),
  ],
  controllers: [PapersController],
  providers: [PapersService],
  exports: [PapersService],
})
export class PapersModule {}
