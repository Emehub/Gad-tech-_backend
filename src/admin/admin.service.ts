import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers, newUsersThisMonth,
      totalProducts, lowStockProducts,
      totalOrders, pendingOrders,
      revenueThisMonth, revenueLastMonth,
      recentOrders, topProducts, ordersByStatus,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } }),
      this.prisma.product.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.product.count({ where: { status: 'PUBLISHED', stock: { lte: 5, gt: 0 } } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.SUCCESS, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          paymentStatus: PaymentStatus.SUCCESS,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { take: 1, include: { product: { select: { name: true } } } },
        },
      }),
      this.prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { soldCount: 'desc' },
        select: {
          id: true, name: true, soldCount: true, price: true, stock: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.SUCCESS },
        _sum: { total: true },
      }),
    ]);

    const thisMonthRevenue = Number(revenueThisMonth._sum.total || 0);
    const lastMonthRevenue = Number(revenueLastMonth._sum.total || 0);
    const revenueGrowth = lastMonthRevenue > 0
      ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : '0';

    return {
      data: {
        overview: {
          totalUsers,
          newUsersThisMonth,
          totalProducts,
          lowStockProducts,
          totalOrders,
          pendingOrders,
          totalRevenue: Number(totalRevenue._sum.total || 0),
          revenueThisMonth: thisMonthRevenue,
          revenueGrowth: Number(revenueGrowth),
        },
        recentOrders,
        topProducts,
        ordersByStatus: ordersByStatus.reduce((acc: any, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
      },
    };
  }

  async getSalesChart(period: 'weekly' | 'monthly' = 'monthly') {
    const now = new Date();
    let startDate: Date;
    let groupByFormat: string;

    if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }

    const orders = await this.prisma.order.findMany({
      where: { paymentStatus: PaymentStatus.SUCCESS, createdAt: { gte: startDate } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day/month
    const groups: Record<string, number> = {};
    orders.forEach((order) => {
      const key = period === 'weekly'
        ? order.createdAt.toISOString().split('T')[0]
        : `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      groups[key] = (groups[key] || 0) + Number(order.total);
    });

    const chart = Object.entries(groups).map(([date, revenue]) => ({ date, revenue }));
    return { data: chart };
  }

  async getCoupons() {
    const coupons = await this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return { data: coupons };
  }

  async createCoupon(dto: any) {
    const coupon = await this.prisma.coupon.create({ data: { ...dto, code: dto.code.toUpperCase() } });
    return { message: 'Coupon created', data: coupon };
  }

  async toggleCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return;
    const updated = await this.prisma.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
    return { message: `Coupon ${updated.isActive ? 'activated' : 'deactivated'}`, data: updated };
  }

  async deleteCoupon(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted' };
  }
}
