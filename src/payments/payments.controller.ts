import { Controller, Post, Get, Param, Body, Req, HttpCode, HttpStatus, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initialize/:orderId')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Initialize Paystack payment for an order' })
  initialize(@Param('orderId') orderId: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.initializePayment(orderId, userId);
  }

  @Get('verify/:reference')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Verify payment by reference' })
  verify(@Param('reference') reference: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.verifyPayment(reference, userId);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook endpoint' })
  webhook(@Req() req: RawBodyRequest<Request>) {
    return this.paymentsService.handleWebhook(req);
  }

  @Get('order/:orderId')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get payment for an order' })
  getByOrder(@Param('orderId') orderId: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.getPaymentByOrder(orderId, userId);
  }
}
