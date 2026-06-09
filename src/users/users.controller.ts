import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto } from './dto/user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get all addresses' })
  getAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add a new address' })
  createAddress(@CurrentUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(userId, dto);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update an address' })
  updateAddress(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: CreateAddressDto) {
    return this.usersService.updateAddress(userId, id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete an address' })
  deleteAddress(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.usersService.deleteAddress(userId, id);
  }

  @Get('wishlist')
  @ApiOperation({ summary: 'Get wishlist' })
  getWishlist(@CurrentUser('id') userId: string) {
    return this.usersService.getWishlist(userId);
  }

  @Post('wishlist/:productId')
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  toggleWishlist(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.usersService.toggleWishlist(userId, productId);
  }

  // Admin routes
  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] List all users' })
  getAllUsers(@Query() dto: PaginationDto) {
    return this.usersService.getAllUsers(dto);
  }

  @Put(':id/toggle-status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Toggle user active status' })
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleUserStatus(id);
  }
}
