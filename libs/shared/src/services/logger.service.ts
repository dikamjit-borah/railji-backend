import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class LoggerServiceProvider implements LoggerService {
  private format(context?: string, meta?: any) {
    const ctx = context ? `[${context}] ` : '';
    const metaText = meta ? ` ${JSON.stringify(meta)}` : '';
    const ts = new Date().toISOString();
    return { ctx, metaText, ts };
  }

  log(message: string, context?: string, meta?: any) {
    const { ctx, metaText, ts } = this.format(context, meta);
    console.log(`${ts} INFO ${ctx}${message}${metaText}`);
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    const { ctx, metaText, ts } = this.format(context, meta);
    const traceText = trace ? `\n${trace}` : '';
    console.error(`${ts} ERROR ${ctx}${message}${traceText}${metaText}`);
  }

  warn(message: string, context?: string, meta?: any) {
    const { ctx, metaText, ts } = this.format(context, meta);
    console.warn(`${ts} WARN ${ctx}${message}${metaText}`);
  }

  debug(message: string, context?: string, meta?: any) {
    const { ctx, metaText, ts } = this.format(context, meta);
    console.debug(`${ts} DEBUG ${ctx}${message}${metaText}`);
  }

  verbose(message: string, context?: string, meta?: any) {
    const { ctx, metaText, ts } = this.format(context, meta);
    console.log(`${ts} VERBOSE ${ctx}${message}${metaText}`);
  }
}
