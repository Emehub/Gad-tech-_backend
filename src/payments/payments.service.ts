import { Injectable, NotFoundException, BadRequestException, Logger, RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackBase = 'https://api.paystack.co';

  constructor(private prisma: PrismaService, private configService: ConfigService) {}

  async initializePayment(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Unauthorized');
    if (order.paymentStatus === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Order is already paid');
    }

    const reference = `GTS-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const amountInKobo = Math.round(Number(order.total) * 100);

    const response = await axios.post(
      `${this.paystackBase}/transaction/initialize`,
      {
        email: order.user.email,
        amount: amountInKobo,
        currency: 'GHS',
        reference,
        callback_url: `${this.configService.get('FRONTEND_URL')}/orders/${order.orderNumber}?payment=success`,
        metadata: { orderId: order.id, orderNumber: order.orderNumber, userId },
      },
      { headers: { Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}` } },
    );

    // Create or update payment record
    await this.prisma.payment.upsert({
      where: { orderId },
      create: { orderId, reference, amount: order.total, method: 'PAYSTACK', status: PaymentStatus.PENDING },
      update: { reference, status: PaymentStatus.PENDING },
    });

    return {
      data: {
        authorizationUrl: response.data.data.authorization_url,
        reference,
        accessCode: response.data.data.access_code,
      },
    };
  }

  async verifyPayment(reference: string, userId: string) {
    const response = await axios.get(
      `${this.paystackBase}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}` } },
    );

    const txData = response.data.data;
    const payment = await this.prisma.payment.findUnique({ where: { reference } });
    if (!payment) throw new NotFoundException('Payment record not found');

    if (txData.status === 'success') {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { reference },
          data: { status: PaymentStatus.SUCCESS, paystackData: txData, paidAt: new Date() },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.SUCCESS, status: OrderStatus.CONFIRMED },
        }),
      ]);
      return { message: 'Payment verified successfully', data: { status: 'success', reference } };
    }

    return { message: 'Payment not completed', data: { status: txData.status, reference } };
  }

  async handleWebhook(req: RawBodyRequest<Request>) {
    const hash = crypto
      .createHmac('sha512', this.configService.get('PAYSTACK_WEBHOOK_SECRET'))
      .update(req.rawBody)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(req.rawBody.toString());
    this.logger.log(`Paystack webhook: ${event.event}`);

    if (event.event === 'charge.success') {
      const { reference } = event.data;
      const payment = await this.prisma.payment.findUnique({ where: { reference } });
      if (payment && payment.status !== PaymentStatus.SUCCESS) {
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { reference },
            data: { status: PaymentStatus.SUCCESS, paystackData: event.data, paidAt: new Date() },
          }),
          this.prisma.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: PaymentStatus.SUCCESS, status: OrderStatus.CONFIRMED },
          }),
        ]);
      }
    }

    return { received: true };
  }

  async getPaymentByOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found');

    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('No payment found for this order');
    return { data: payment };
  }
}
