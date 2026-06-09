import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService, CreateBrandDto } from './brands.service';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Public() @Get() findAll() { return this.brandsService.findAll(); }
  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.brandsService.findOne(id); }

  @Post() @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth('JWT')
  create(@Body() dto: CreateBrandDto) { return this.brandsService.create(dto); }

  @Put(':id') @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth('JWT')
  update(@Param('id') id: string, @Body() dto: Partial<CreateBrandDto>) { return this.brandsService.update(id, dto); }

  @Delete(':id') @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth('JWT')
  delete(@Param('id') id: string) { return this.brandsService.delete(id); }
}
