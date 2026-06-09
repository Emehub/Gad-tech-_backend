import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CartService } from '../cart/cart.service';
import { PaginationDto, paginate, paginationMeta } from '../common/dto/pagination.dto';
import { OrderStatus, PaymentMethod, Role } from '@prisma/client';

export class CreateOrderDto {
  @IsString() addressId: string;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus) status: OrderStatus;
  @IsOptional() @IsString() trackingNumber?: string;
  @IsOptional() @IsString() shippingCarrier?: string;
  @IsOptional() @IsString() cancelReason?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private cartService: CartService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const address = await this.prisma.address.findUnique({ where: { id: dto.addressId } });
    if (!address || address.userId !== userId) throw new NotFoundException('Address not found');

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) throw new BadRequestException('Your cart is empty');

    // Validate stock and calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      const stock = item.variantId ? item.variant?.stock ?? 0 : item.product.stock;
      if (stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${item.product.name}"`);
      }
      subtotal += Number(item.price) * item.quantity;
    }

    let discount = 0;
    if (cart.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: cart.couponCode } });
      if (coupon && coupon.isActive) {
        discount = coupon.discountType === 'PERCENTAGE'
          ? (subtotal * Number(coupon.discountValue)) / 100
          : Number(coupon.discountValue);
        await this.prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const shippingFee = subtotal > 500 ? 0 : 20;
    const total = subtotal - discount + shippingFee;
    const orderNumber = `GTS-${Date.now()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: dto.addressId,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.PAYSTACK,
          notes: dto.notes,
          subtotal,
          discount,
          shippingFee,
          total,
          couponCode: cart.couponCode,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.product.name,
              image: item.product.images[0]?.url,
              price: Number(item.price),
              quantity: item.quantity,
              subtotal: Number(item.price) * item.quantity,
            })),
          },
        },
        include: { items: true, address: true },
      });

      // Decrement stock
      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
          });
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { couponCode: null, discount: 0 } });

      return newOrder;
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.mailService.sendOrderConfirmation(
      user.email, user.firstName, order.orderNumber, total.toFixed(2),
    );

    return { message: 'Order placed successfully', data: order };
  }

  async findAll(userId: string, dto: PaginationDto) {
    const { skip, take } = paginate(dto.page, dto.limit);
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take,
        include: { items: { take: 3 }, address: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { data: orders, meta: paginationMeta(total, dto.page, dto.limit) };
  }

  async findOne(id: string, userId: string, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, address: true, payment: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (role === Role.CUSTOMER && order.userId !== userId) throw new ForbiddenException();
    return { data: order };
  }

  async findByOrderNumber(orderNumber: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, address: true, payment: true },
    });
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found');
    return { data: order };
  }

  async cancelOrder(id: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found');
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException('This order can no longer be cancelled');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED, cancelReason: reason },
    });

    // Restore stock
    const items = await this.prisma.orderItem.findMany({ where: { orderId: id } });
    for (const item of items) {
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId }, data: { stock: { increment: item.quantity } },
        });
      } else {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
        });
      }
    }

    return { message: 'Order cancelled', data: updated };
  }

  // Admin methods
  async adminFindAll(dto: PaginationDto & { status?: OrderStatus }) {
    const { skip, take } = paginate(dto.page, dto.limit);
    const where: any = {};
    if (dto.status) where.status = dto.status;
    if (dto.search) {
      where.OR = [
        { orderNumber: { contains: dto.search, mode: 'insensitive' } },
        { user: { email: { contains: dto.search, mode: 'insensitive' } } },
      ];
    }
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: { take: 2 },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data: orders, meta: paginationMeta(total, dto.page, dto.limit) };
  }

  async adminUpdateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        trackingNumber: dto.trackingNumber,
        shippingCarrier: dto.shippingCarrier,
        cancelReason: dto.cancelReason,
        deliveredAt: dto.status === OrderStatus.DELIVERED ? new Date() : undefined,
      },
    });

    const user = await this.prisma.user.findUnique({ where: { id: order.userId } });
    await this.mailService.sendOrderStatusUpdate(user.email, user.firstName, order.orderNumber, dto.status);

    return { message: 'Order status updated', data: updated };
  }
}
