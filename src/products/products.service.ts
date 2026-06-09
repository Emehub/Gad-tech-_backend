import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';
import { paginate, paginationMeta } from '../common/dto/pagination.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private productSelect = {
    id: true, name: true, slug: true, shortDesc: true, price: true,
    comparePrice: true, stock: true, status: true, isFeatured: true,
    isNewArrival: true, isBestSeller: true, rating: true, reviewCount: true,
    soldCount: true, tags: true, createdAt: true,
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, logo: true } },
    images: { orderBy: { sortOrder: 'asc' as const }, take: 1, where: { isPrimary: true } },
  };

  private productFullSelect = {
    ...this.productSelect,
    description: true, sku: true, costPrice: true, weight: true,
    lowStockAlert: true, metaTitle: true, metaDesc: true,
    images: { orderBy: { sortOrder: 'asc' as const } },
    variants: { orderBy: { name: 'asc' as const } },
    specs: true,
    _count: { select: { reviews: true } },
  };

  async create(dto: CreateProductDto) {
    const slug = await this.generateUniqueSlug(dto.name);
    const { variants, specs, ...productData } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        slug,
        variants: variants ? { create: variants } : undefined,
        specs: specs ? { create: specs } : undefined,
      },
      include: { category: true, brand: true, variants: true, specs: true, images: true },
    });

    return { message: 'Product created', data: product };
  }

  async findAll(dto: ProductFilterDto) {
    const { skip, take } = paginate(dto.page, dto.limit);
    const where: any = {};

    if (dto.search) {
      where.OR = [
        { name: { contains: dto.search, mode: 'insensitive' } },
        { description: { contains: dto.search, mode: 'insensitive' } },
        { tags: { has: dto.search } },
      ];
    }
    if (dto.categoryId) where.categoryId = dto.categoryId;
    if (dto.brandId) where.brandId = dto.brandId;
    if (dto.isFeatured !== undefined) where.isFeatured = dto.isFeatured;
    if (dto.isNewArrival !== undefined) where.isNewArrival = dto.isNewArrival;
    if (dto.isBestSeller !== undefined) where.isBestSeller = dto.isBestSeller;
    if (dto.status) where.status = dto.status;
    else where.status = ProductStatus.PUBLISHED;
    if (dto.minPrice || dto.maxPrice) {
      where.price = {};
      if (dto.minPrice) where.price.gte = dto.minPrice;
      if (dto.maxPrice) where.price.lte = dto.maxPrice;
    }

    const validSortFields = ['price', 'createdAt', 'rating', 'soldCount', 'name'];
    const sortBy = validSortFields.includes(dto.sortBy) ? dto.sortBy : 'createdAt';

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        select: this.productSelect,
        orderBy: { [sortBy]: dto.sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, meta: paginationMeta(total, dto.page, dto.limit) };
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: ProductStatus.PUBLISHED,
      },
      select: this.productFullSelect,
    });
    if (!product) throw new NotFoundException('Product not found');

    const related = await this.prisma.product.findMany({
      where: { categoryId: product.category.id, id: { not: product.id }, status: ProductStatus.PUBLISHED },
      take: 8,
      select: this.productSelect,
      orderBy: { soldCount: 'desc' },
    });

    return { data: { ...product, related } };
  }

  async findOneAdmin(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true, variants: true, specs: true, images: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return { data: product };
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');

    let slug = existing.slug;
    if (dto.name && dto.name !== existing.name) {
      slug = await this.generateUniqueSlug(dto.name, id);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: { ...dto, slug },
      include: { category: true, brand: true },
    });
    return { message: 'Product updated', data: product };
  }

  async updateStock(id: string, quantity: number) {
    return this.prisma.product.update({ where: { id }, data: { stock: quantity } });
  }

  async delete(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted' };
  }

  async getFeatured() {
    const products = await this.prisma.product.findMany({
      where: { isFeatured: true, status: ProductStatus.PUBLISHED },
      take: 12,
      select: this.productSelect,
      orderBy: { createdAt: 'desc' },
    });
    return { data: products };
  }

  async getNewArrivals() {
    const products = await this.prisma.product.findMany({
      where: { isNewArrival: true, status: ProductStatus.PUBLISHED },
      take: 12,
      select: this.productSelect,
      orderBy: { createdAt: 'desc' },
    });
    return { data: products };
  }

  async getBestSellers() {
    const products = await this.prisma.product.findMany({
      where: { isBestSeller: true, status: ProductStatus.PUBLISHED },
      take: 12,
      select: this.productSelect,
      orderBy: { soldCount: 'desc' },
    });
    return { data: products };
  }

  async search(query: string, limit = 10) {
    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      take: limit,
      select: { id: true, name: true, slug: true, price: true, images: { where: { isPrimary: true }, take: 1 } },
    });
    return { data: products };
  }

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let slug = slugify(name, { lower: true, strict: true });
    let count = 0;
    while (true) {
      const candidate = count === 0 ? slug : `${slug}-${count}`;
      const existing = await this.prisma.product.findFirst({
        where: { slug: candidate, id: excludeId ? { not: excludeId } : undefined },
      });
      if (!existing) return candidate;
      count++;
    }
  }
}
