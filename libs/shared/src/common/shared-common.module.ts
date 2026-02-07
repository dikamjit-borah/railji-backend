import { Module } from '@nestjs/common';
import { LoggerServiceProvider } from '../services/logger.service';
import { HttpClientService } from '../services/http-client.service';
import { CacheService } from '../services/cache.service';
import { ErrorHandlerService } from '../services/error-handler.service';

@Module({
  providers: [LoggerServiceProvider, HttpClientService, CacheService, ErrorHandlerService],
  exports: [LoggerServiceProvider, HttpClientService, CacheService, ErrorHandlerService],
})
export class SharedCommonModule {}
