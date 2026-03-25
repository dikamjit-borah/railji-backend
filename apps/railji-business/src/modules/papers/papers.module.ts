import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { Paper, PaperSchema, QuestionBank, QuestionBankSchema } from '@railji/shared';
import { SharedCommonModule } from '@railji/shared';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Paper.name, schema: PaperSchema },
      { name: QuestionBank.name, schema: QuestionBankSchema },
    ]),
    SharedCommonModule,
    SubscriptionsModule,
    UsersModule,
  ],
  controllers: [PapersController],
  providers: [PapersService],
  exports: [PapersService],
})
export class PapersModule {}
