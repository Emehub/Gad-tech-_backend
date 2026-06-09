import { Injectable, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { BannerPosition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateBannerDto {
  @IsString() title: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsString() image: string;
  @IsOptional() @IsString() mobileImage?: string;
  @IsOptional() @IsString() link?: string;
  @IsOptional() @IsString() buttonText?: string;
  @IsOptional() @IsEnum(BannerPosition) position?: BannerPosition;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async findActive(position?: BannerPosition) {
    const now = new Date();
    const banners = await this.prisma.banner.findMany({
      where: {
        isActive: true,
        position: position ?? undefined,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { sortOrder: 'asc' },
    });
    return { data: banners };
  }

  async findAll() {
    const banners = await this.prisma.banner.findMany({ orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }] });
    return { data: banners };
  }

  async create(dto: CreateBannerDto) {
    const banner = await this.prisma.banner.create({ data: dto });
    return { message: 'Banner created', data: banner };
  }

  async update(id: string, dto: Partial<CreateBannerDto>) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Banner not found');
    const banner = await this.prisma.banner.update({ where: { id }, data: dto });
    return { message: 'Banner updated', data: banner };
  }

  async delete(id: string) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Banner not found');
    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Banner deleted' };
  }
}
