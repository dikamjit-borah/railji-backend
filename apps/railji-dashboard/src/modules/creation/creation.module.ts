import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreationController } from './creation.controller';
import { CreationService } from './creation.service';
import {
  Paper,
  PaperSchema,
  QuestionBank,
  QuestionBankSchema,
} from '@railji/shared';
import { SharedCommonModule } from '@railji/shared';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Paper.name, schema: PaperSchema },
      { name: QuestionBank.name, schema: QuestionBankSchema },
    ]),
    SharedCommonModule,
  ],
  controllers: [CreationController],
  providers: [CreationService],
  exports: [CreationService],
})
export class CreationModule {}
