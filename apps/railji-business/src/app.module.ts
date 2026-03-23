import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AuthModule } from '@libs';
import { ExamsModule } from './modules/exams/exams.module';
import { PapersModule } from './modules/papers/papers.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import {
  SharedCommonModule,
  LoggingInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from '@libs';
import { config } from './config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MongooseModule.forRoot(config.database.uri),
    SharedCommonModule,
    AuthModule.forRoot({
      url: config.supabase.url,
      jwtAudience: config.supabase.jwtAudience,
    }),
    ExamsModule,
    PapersModule,
    DepartmentsModule,
    UsersModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorInterceptor,
    },
  ],
})
export class AppModule {}
