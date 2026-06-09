import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, CreateAddressDto } from './dto/user.dto';
import { PaginationDto, paginate, paginationMeta } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, isEmailVerified: true,
        createdAt: true, addresses: true,
        _count: { select: { orders: true, reviews: true, wishlist: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { data: user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true },
    });
    return { message: 'Profile updated successfully', data: user };
  }

  async getAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return { data: addresses };
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const address = await this.prisma.address.create({ data: { ...dto, userId } });
    return { message: 'Address added', data: address };
  }

  async updateAddress(userId: string, addressId: string, dto: CreateAddressDto) {
    const existing = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) throw new NotFoundException('Address not found');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const address = await this.prisma.address.update({ where: { id: addressId }, data: dto });
    return { message: 'Address updated', data: address };
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: 'Address removed' };
  }

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 }, brand: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: items };
  }

  async toggleWishlist(userId: string, productId: string) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { message: 'Removed from wishlist', inWishlist: false };
    }

    await this.prisma.wishlistItem.create({ data: { userId, productId } });
    return { message: 'Added to wishlist', inWishlist: true };
  }

  // Admin: get all users
  async getAllUsers(dto: PaginationDto) {
    const { skip, take } = paginate(dto.page, dto.limit);
    const where: any = {};
    if (dto.search) {
      where.OR = [
        { email: { contains: dto.search, mode: 'insensitive' } },
        { firstName: { contains: dto.search, mode: 'insensitive' } },
        { lastName: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, role: true, isActive: true, isEmailVerified: true,
          createdAt: true, _count: { select: { orders: true } },
        },
        orderBy: { [dto.sortBy]: dto.sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: paginationMeta(total, dto.page, dto.limit) };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });
    return { message: `User ${updated.isActive ? 'activated' : 'deactivated'}`, data: updated };
  }
}
