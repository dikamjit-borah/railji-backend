import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PapersController } from './papers.controller';
import { PapersService } from './papers.service';
import { Paper, PaperSchema } from './schemas/paper.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Paper.name, schema: PaperSchema }]),
  ],
  controllers: [PapersController],
  providers: [PapersService],
  exports: [PapersService],
})
export class PapersModule {}
