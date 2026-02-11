import { Controller, Post, Body } from '@nestjs/common';
import { CreationService } from './creation.service';
import { CreatePaperDto } from './dto/create-paper.dto';

@Controller('create')
export class CreationController {
  constructor(private readonly creationService: CreationService) {}

  @Post('paper')
  async createPaper(@Body() createPaperDto: CreatePaperDto) {
    return await this.creationService.createPaper(createPaperDto);
  }
}
