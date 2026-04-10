import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentGatewayFactory } from './payment-gateway.factory';
import { PaymentTransactionService } from './payment-transaction.service';
import { InvalidWebhookException } from '../exceptions/payment.exceptions';
import { SharedSubscriptionsService, GrantAccessDto, Plan } from '@railji/shared';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly gatewayFactory: PaymentGatewayFactory,
    private readonly transactionService: PaymentTransactionService,
    private readonly subscriptionsService: SharedSubscriptionsService,
    @InjectModel(Plan.name)
    private planModel: Model<Plan>,
  ) {}

  async createOrder(planId: string, userId: string, metadata: Record<string, any> = {}) {
    this.logger.log(`Creating order for plan: ${planId}`);

    // Fetch plan details
    const plan = await this.planModel.findOne({ planId, isActive: true }).exec();
    
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found or inactive`);
    }

    const gateway = this.gatewayFactory.getGateway();
    const gatewayType = this.gatewayFactory.getActiveGatewayType();

    // Add plan and user info to metadata
    const orderMetadata = {
      ...metadata,
      planId: plan.planId,
      departmentId: plan.departmentId,
      userId,
      durationMonths: plan.durationMonths,
      price: plan.price,
    };

    const order = await gateway.createOrder(plan.price, plan.currency, orderMetadata);

    await this.transactionService.logOrderCreation(gatewayType, order, {
      userId,
      customerEmail: metadata.email,
      customerPhone: metadata.phone,
    });

    return order;
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    this.logger.log(`Verifying payment: ${paymentId}`);

    const gateway = this.gatewayFactory.getGateway();
    const gatewayType = this.gatewayFactory.getActiveGatewayType();

    const isValid = await gateway.verifyPayment(orderId, paymentId, signature);

    await this.transactionService.logPaymentVerification(
      gatewayType,
      paymentId,
      orderId,
      isValid,
      { signature },
    );

    // If payment is valid, grant department access
    if (isValid) {
      await this.grantDepartmentAccessFromOrder(orderId, paymentId, gatewayType);
    }

    return isValid;
  }

  private async grantDepartmentAccessFromOrder(orderId: string, paymentId: string, gateway: string) {
    try {
      // Get transaction details to extract departmentId and userId
      const transactions = await this.transactionService.getTransactionsByOrderId(orderId);
      
      if (!transactions || transactions.length === 0) {
        this.logger.error(`No transaction found for order ${orderId}`);
        return;
      }

      const transaction = transactions[0];
      const departmentId = transaction.metadata?.departmentId;
      const userId = transaction.userId;
      const durationMonths = transaction.metadata?.durationMonths || 12;

      if (!departmentId || !userId) {
        this.logger.error(`Missing departmentId or userId in transaction ${orderId}`);
        return;
      }

      // Create subscription using the shared service
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      await this.subscriptionsService.grantAccess({
        userId,
        departmentId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        paymentRef: paymentId,
        paymentGateway: gateway,
        description: `${durationMonths} month access to department ${departmentId}`,
      });

      this.logger.log(`Granted department ${departmentId} access to user ${userId} until ${endDate}`);
    } catch (error) {
      this.logger.error(`Failed to grant department access: ${error.message}`, error);
      throw error;
    }
  }

  async handleWebhook(payload: Buffer, signature: string) {
    this.logger.log('Processing webhook');

    const gateway = this.gatewayFactory.getGateway();
    const gatewayType = this.gatewayFactory.getActiveGatewayType();

    const isValid = gateway.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new InvalidWebhookException();
    }

    const event = gateway.parseWebhookEvent(payload);
    this.logger.log(`Webhook event: ${event.event}`);

    await this.transactionService.logWebhookEvent(gatewayType, event.event, event.data);

    // Handle payment captured event
    if (event.event === 'payment.captured' && event.orderId && event.paymentId) {
      await this.grantDepartmentAccessFromOrder(event.orderId, event.paymentId, gatewayType);
    }

    return { success: true, event: event.event };
  }

  async getTransaction(orderId: string) {
    return this.transactionService.getTransactionsByOrderId(orderId);
  }

  async getUserTransactions(userId: string) {
    return this.transactionService.getTransactionsByUserId(userId);
  }

  async grantSubscriptionAccess(grantAccessDto: GrantAccessDto) {
    this.logger.log(`Granting subscription access to user ${grantAccessDto.userId}`);
    return this.subscriptionsService.grantAccess(grantAccessDto);
  }

  async getPlans() {
    return this.planModel.find({ isActive: true }).sort({ departmentId: 1 }).exec();
  }
}
