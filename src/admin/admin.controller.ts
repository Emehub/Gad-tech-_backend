import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats overview' })
  getDashboard() { return this.adminService.getDashboardStats(); }

  @Get('sales-chart')
  @ApiOperation({ summary: 'Get sales chart data' })
  getSalesChart(@Query('period') period: 'weekly' | 'monthly') {
    return this.adminService.getSalesChart(period);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'Get all coupons' })
  getCoupons() { return this.adminService.getCoupons(); }

  @Post('coupons')
  @ApiOperation({ summary: 'Create coupon' })
  createCoupon(@Body() dto: any) { return this.adminService.createCoupon(dto); }

  @Patch('coupons/:id/toggle')
  @ApiOperation({ summary: 'Toggle coupon active status' })
  toggleCoupon(@Param('id') id: string) { return this.adminService.toggleCoupon(id); }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Delete coupon' })
  deleteCoupon(@Param('id') id: string) { return this.adminService.deleteCoupon(id); }
}
