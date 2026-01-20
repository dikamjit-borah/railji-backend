import { Module } from '@nestjs/common';
import { LoggerServiceProvider } from '../services/logger.service';
import { HttpClientService } from '../services/http-client.service';

@Module({
  providers: [LoggerServiceProvider, HttpClientService],
  exports: [LoggerServiceProvider, HttpClientService],
})
export class SharedCommonModule {}
