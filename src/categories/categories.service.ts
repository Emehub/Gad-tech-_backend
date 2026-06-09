import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';

export class CreateCategoryDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = await this.generateUniqueSlug(dto.name);
    const category = await this.prisma.category.create({ data: { ...dto, slug }, include: { parent: true } });
    return { message: 'Category created', data: category };
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    const categories = await this.prisma.category.findMany({
      where,
      include: {
        children: { where: includeInactive ? {} : { isActive: true }, orderBy: { sortOrder: 'asc' } },
        _count: { select: { products: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return { data: categories.filter((c) => !c.parentId) };
  }

  async findOne(idOrSlug: string) {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        parent: true,
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return { data: category };
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');

    let slug = existing.slug;
    if (dto.name && dto.name !== existing.name) slug = await this.generateUniqueSlug(dto.name, id);

    const category = await this.prisma.category.update({
      where: { id }, data: { ...dto, slug }, include: { parent: true },
    });
    return { message: 'Category updated', data: category };
  }

  async delete(id: string) {
    const existing = await this.prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
    if (!existing) throw new NotFoundException('Category not found');
    if (existing._count.products > 0) throw new ConflictException('Cannot delete category with products');
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted' };
  }

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let slug = slugify(name, { lower: true, strict: true });
    let count = 0;
    while (true) {
      const candidate = count === 0 ? slug : `${slug}-${count}`;
      const existing = await this.prisma.category.findFirst({
        where: { slug: candidate, id: excludeId ? { not: excludeId } : undefined },
      });
      if (!existing) return candidate;
      count++;
    }
  }
}
