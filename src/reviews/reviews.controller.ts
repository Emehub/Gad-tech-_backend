import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService, CreateReviewDto } from './reviews.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  findByProduct(@Param('productId') productId: string, @Query() dto: PaginationDto) {
    return this.reviewsService.findByProduct(productId, dto);
  }

  @Post('product/:productId')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Submit a review for a product' })
  create(@Param('productId') productId: string, @CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(productId, userId, dto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update your review' })
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: Partial<CreateReviewDto>) {
    return this.reviewsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete your review' })
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reviewsService.delete(id, userId);
  }

  @Patch(':id/visibility')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Toggle review visibility' })
  toggleVisibility(@Param('id') id: string) {
    return this.reviewsService.toggleVisibility(id);
  }
}
