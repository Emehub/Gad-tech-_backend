import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, paginate, paginationMeta } from '../common/dto/pagination.dto';

export class CreateReviewDto {
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() body?: string;
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(productId: string, userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    // Only buyers who received the product can review
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: 'DELIVERED' },
      },
    });

    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
    if (existing) throw new BadRequestException('You have already reviewed this product');

    const review = await this.prisma.review.create({
      data: { productId, userId, ...dto, isVerified: !!hasPurchased },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });

    await this.updateProductRating(productId);
    return { message: 'Review submitted', data: review };
  }

  async findByProduct(productId: string, dto: PaginationDto) {
    const { skip, take } = paginate(dto.page, dto.limit);
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, isVisible: true },
        skip, take,
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { productId, isVisible: true } }),
    ]);

    const ratingDist = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId, isVisible: true },
      _count: true,
    });

    return {
      data: reviews,
      ratingDistribution: ratingDist.reduce((acc, r) => ({ ...acc, [r.rating]: r._count }), {}),
      meta: paginationMeta(total, dto.page, dto.limit),
    };
  }

  async update(reviewId: string, userId: string, dto: Partial<CreateReviewDto>) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.review.update({ where: { id: reviewId }, data: dto });
    await this.updateProductRating(review.productId);
    return { message: 'Review updated', data: updated };
  }

  async delete(reviewId: string, userId: string, isAdmin = false) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (!isAdmin && review.userId !== userId) throw new ForbiddenException();

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.updateProductRating(review.productId);
    return { message: 'Review deleted' };
  }

  async toggleVisibility(reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    const updated = await this.prisma.review.update({
      where: { id: reviewId }, data: { isVisible: !review.isVisible },
    });
    await this.updateProductRating(review.productId);
    return { message: `Review ${updated.isVisible ? 'shown' : 'hidden'}`, data: updated };
  }

  private async updateProductRating(productId: string) {
    const result = await this.prisma.review.aggregate({
      where: { productId, isVisible: true },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: Number((result._avg.rating || 0).toFixed(1)),
        reviewCount: result._count,
      },
    });
  }
}
