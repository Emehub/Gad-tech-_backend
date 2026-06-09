import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService, CreateOrderDto, UpdateOrderStatusDto } from './orders.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my orders' })
  findAll(@CurrentUser('id') userId: string, @Query() dto: PaginationDto) {
    return this.ordersService.findAll(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: Role) {
    return this.ordersService.findOne(id, userId, role);
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Get order by order number' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string, @CurrentUser('id') userId: string) {
    return this.ordersService.findByOrderNumber(orderNumber, userId);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string, @Body('reason') reason: string) {
    return this.ordersService.cancelOrder(id, userId, reason);
  }

  // Admin routes
  @Get('admin/all')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get all orders' })
  adminFindAll(@Query() dto: PaginationDto & { status?: OrderStatus }) {
    return this.ordersService.adminFindAll(dto);
  }

  @Put('admin/:id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Update order status' })
  adminUpdateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.adminUpdateStatus(id, dto);
  }
}
