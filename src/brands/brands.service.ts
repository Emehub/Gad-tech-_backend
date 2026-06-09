import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';

export class CreateBrandDto {
  @IsString() name: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() website?: string;
}

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Brand already exists');
    const slug = slugify(dto.name, { lower: true, strict: true });
    const brand = await this.prisma.brand.create({ data: { ...dto, slug } });
    return { message: 'Brand created', data: brand };
  }

  async findAll() {
    const brands = await this.prisma.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return { data: brands };
  }

  async findOne(idOrSlug: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return { data: brand };
  }

  async update(id: string, dto: Partial<CreateBrandDto>) {
    const existing = await this.prisma.brand.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Brand not found');
    const brand = await this.prisma.brand.update({ where: { id }, data: dto });
    return { message: 'Brand updated', data: brand };
  }

  async delete(id: string) {
    const existing = await this.prisma.brand.findUnique({
      where: { id }, include: { _count: { select: { products: true } } },
    });
    if (!existing) throw new NotFoundException('Brand not found');
    if (existing._count.products > 0) throw new ConflictException('Cannot delete brand with products');
    await this.prisma.brand.delete({ where: { id } });
    return { message: 'Brand deleted' };
  }
}
