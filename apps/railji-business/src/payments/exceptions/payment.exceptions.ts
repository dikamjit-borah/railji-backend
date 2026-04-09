import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

export class InvalidSignatureException extends PaymentException {
  constructor(message: string = 'Invalid signature') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class MissingSignatureException extends PaymentException {
  constructor(message: string = 'Missing signature') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class PaymentGatewayException extends PaymentException {
  constructor(message: string = 'Payment gateway error') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class InvalidWebhookException extends PaymentException {
  constructor(message: string = 'Invalid webhook signature') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
