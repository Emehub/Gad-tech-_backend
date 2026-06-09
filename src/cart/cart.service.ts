import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class AddToCartDto {
  @IsString() productId: string;
  @IsOptional() @IsString() variantId?: string;
  @IsInt() @Min(1) quantity: number;
}

export class UpdateCartItemDto {
  @IsInt() @Min(0) quantity: number;
}

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private cartInclude = {
    items: {
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true, stock: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'asc' as const },
    },
  };

  async getCart(userId?: string, sessionId?: string) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    return { data: this.computeCart(cart) };
  }

  async addItem(dto: AddToCartDto, userId?: string, sessionId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    const price = dto.variantId
      ? (product.variants.find((v) => v.id === dto.variantId)?.price ?? product.price)
      : product.price;

    const cart = await this.findOrCreateCart(userId, sessionId);

    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
    });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (product.stock < newQty) throw new BadRequestException('Insufficient stock');
      await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId, quantity: dto.quantity, price: Number(price) },
      });
    }

    return this.getCart(userId, sessionId);
  }

  async updateItem(itemId: string, dto: UpdateCartItemDto, userId?: string, sessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item) throw new NotFoundException('Cart item not found');
    this.verifyCartOwnership(item.cart, userId, sessionId);

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (product.stock < dto.quantity) throw new BadRequestException('Insufficient stock');
      await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity: dto.quantity } });
    }

    return this.getCart(userId, sessionId);
  }

  async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item) throw new NotFoundException('Cart item not found');
    this.verifyCartOwnership(item.cart, userId, sessionId);
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId, sessionId);
  }

  async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared', data: { items: [], subtotal: 0, total: 0, itemCount: 0 } };
  }

  async applyCoupon(code: string, userId?: string, sessionId?: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Invalid or expired coupon code');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon has expired');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');

    const cart = await this.findOrCreateCart(userId, sessionId);
    await this.prisma.cart.update({ where: { id: cart.id }, data: { couponCode: coupon.code } });
    return { message: 'Coupon applied', coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue } };
  }

  async removeCoupon(userId?: string, sessionId?: string) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    await this.prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null, discount: 0 } });
    return { message: 'Coupon removed' };
  }

  async mergeGuestCart(userId: string, sessionId: string) {
    const guestCart = await this.prisma.cart.findUnique({
      where: { sessionId }, include: { items: true },
    });
    if (!guestCart) return;

    const userCart = await this.findOrCreateCart(userId, undefined);

    for (const item of guestCart.items) {
      const existing = await this.prisma.cartItem.findUnique({
        where: { cartId_productId_variantId: { cartId: userCart.id, productId: item.productId, variantId: item.variantId } },
      });
      if (existing) {
        await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + item.quantity } });
      } else {
        await this.prisma.cartItem.create({
          data: { cartId: userCart.id, productId: item.productId, variantId: item.variantId, quantity: item.quantity, price: item.price },
        });
      }
    }
    await this.prisma.cart.delete({ where: { id: guestCart.id } });
  }

  private async findOrCreateCart(userId?: string, sessionId?: string) {
    let cart: any;

    if (userId) {
      cart = await this.prisma.cart.findUnique({ where: { userId }, include: this.cartInclude });
      if (!cart) cart = await this.prisma.cart.create({ data: { userId }, include: this.cartInclude });
    } else if (sessionId) {
      cart = await this.prisma.cart.findUnique({ where: { sessionId }, include: this.cartInclude });
      if (!cart) cart = await this.prisma.cart.create({ data: { sessionId }, include: this.cartInclude });
    } else {
      throw new BadRequestException('User ID or session ID is required');
    }

    return cart;
  }

  private computeCart(cart: any) {
    const subtotal = cart.items.reduce((sum: number, item: any) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    const discount = Number(cart.discount) || 0;
    const shippingFee = subtotal > 500 ? 0 : 20;
    const total = subtotal - discount + shippingFee;
    const itemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items: cart.items,
      subtotal: Number(subtotal.toFixed(2)),
      discount,
      shippingFee,
      total: Number(total.toFixed(2)),
      itemCount,
      couponCode: cart.couponCode,
    };
  }

  private verifyCartOwnership(cart: any, userId?: string, sessionId?: string) {
    if (userId && cart.userId !== userId) throw new NotFoundException('Cart item not found');
    if (sessionId && cart.sessionId !== sessionId) throw new NotFoundException('Cart item not found');
  }
}
