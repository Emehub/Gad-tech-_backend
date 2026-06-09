import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService, CreateCategoryDto } from './categories.service';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active categories (tree)' })
  findAll() { return this.categoriesService.findAll(); }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a single category' })
  findOne(@Param('idOrSlug') idOrSlug: string) { return this.categoriesService.findOne(idOrSlug); }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Create category' })
  create(@Body() dto: CreateCategoryDto) { return this.categoriesService.create(dto); }

  @Put(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Update category' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) { return this.categoriesService.update(id, dto); }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Delete category' })
  delete(@Param('id') id: string) { return this.categoriesService.delete(id); }
}
