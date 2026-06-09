import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CartService, AddToCartDto, UpdateCartItemDto } from './cart.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/roles.decorator';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Public()
  @Get()
  @ApiHeader({ name: 'X-Session-Id', required: false })
  @ApiOperation({ summary: 'Get cart (user or guest)' })
  getCart(@CurrentUser('id') userId: string, @Headers('x-session-id') sessionId: string) {
    return this.cartService.getCart(userId, sessionId);
  }

  @Public()
  @Post('items')
  @ApiHeader({ name: 'X-Session-Id', required: false })
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(@Body() dto: AddToCartDto, @CurrentUser('id') userId: string, @Headers('x-session-id') sessionId: string) {
    return this.cartService.addItem(dto, userId, sessionId);
  }

  @Public()
  @Put('items/:id')
  @ApiHeader({ name: 'X-Session-Id', required: false })
  @ApiOperation({ summary: 'Update cart item quantity (set 0 to remove)' })
  updateItem(@Param('id') id: string, @Body() dto: UpdateCartItemDto, @CurrentUser('id') userId: string, @Headers('x-session-id') sessionId: string) {
    return this.cartService.updateItem(id, dto, userId, sessionId);
  }

  @Public()
  @Delete('items/:id')
  @ApiHeader({ name: 'X-Session-Id', required: false })
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('id') id: string, @CurrentUser('id') userId: string, @Headers('x-session-id') sessionId: string) {
    return this.cartService.removeItem(id, userId, sessionId);
  }

  @Public()
  @Delete()
  @ApiHeader({ name: 'X-Session-Id', required: false })
  @ApiOperation({ summary: 'Clear entire cart' })
  clearCart(@CurrentUser('id') userId: string, @Headers('x-session-id') sessionId: string) {
    return this.cartService.clearCart(userId, sessionId);
  }

  @Public()
  @Post('coupon')
  @ApiHeader({ name: 'X-Session-Id', required: false })
  @ApiOperation({ summary: 'Apply coupon code' })
  applyCoupon(@Body('code') code: string, @CurrentUser('id') userId: string, @Headers('x-session-id') sessionId: string) {
    return this.cartService.applyCoupon(code, userId, sessionId);
  }

  @Public()
  @Delete('coupon')
  @ApiHeader({ name: 'X-Session-Id', required: false })
  @ApiOperation({ summary: 'Remove coupon' })
  removeCoupon(@CurrentUser('id') userId: string, @Headers('x-session-id') sessionId: string) {
    return this.cartService.removeCoupon(userId, sessionId);
  }
}
