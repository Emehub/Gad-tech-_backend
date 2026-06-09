import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ─── Public routes ──────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published products with filters' })
  findAll(@Query() dto: ProductFilterDto) {
    return this.productsService.findAll(dto);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  getFeatured() {
    return this.productsService.getFeatured();
  }

  @Public()
  @Get('new-arrivals')
  @ApiOperation({ summary: 'Get new arrivals' })
  getNewArrivals() {
    return this.productsService.getNewArrivals();
  }

  @Public()
  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best sellers' })
  getBestSellers() {
    return this.productsService.getBestSellers();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false })
  search(@Query('q') q: string, @Query('limit') limit: number) {
    return this.productsService.search(q, limit);
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get single product by ID or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.findOne(idOrSlug);
  }

  // ─── Admin routes ────────────────────────────────────────────────────────────

  @Get(':id/admin-detail')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Get product by ID regardless of status' })
  findOneAdmin(@Param('id') id: string) {
    return this.productsService.findOneAdmin(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Create a product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Update a product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/stock')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Update product stock' })
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Delete a product' })
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
