import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'Railji Business API',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'Railji Business API',
      timestamp: new Date().toISOString(),
    };
  }
}
