import { Module } from '@nestjs/common';
import { LoggerServiceProvider } from '../services/logger.service';
import { HttpClientService } from '../services/http-client.service';
import { CacheService } from '../services/cache.service';

@Module({
  providers: [LoggerServiceProvider, HttpClientService, CacheService],
  exports: [LoggerServiceProvider, HttpClientService, CacheService],
})
export class SharedCommonModule {}
