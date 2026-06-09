import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService, CreateBannerDto } from './banners.service';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { BannerPosition, Role } from '@prisma/client';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private bannersService: BannersService) {}

  @Public() @Get()
  @ApiOperation({ summary: 'Get active banners (optionally by position)' })
  findActive(@Query('position') position?: BannerPosition) { return this.bannersService.findActive(position); }

  @Get('admin/all') @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth('JWT')
  findAll() { return this.bannersService.findAll(); }

  @Post() @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth('JWT')
  create(@Body() dto: CreateBannerDto) { return this.bannersService.create(dto); }

  @Put(':id') @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth('JWT')
  update(@Param('id') id: string, @Body() dto: Partial<CreateBannerDto>) { return this.bannersService.update(id, dto); }

  @Delete(':id') @Roles(Role.ADMIN, Role.SUPER_ADMIN) @ApiBearerAuth('JWT')
  delete(@Param('id') id: string) { return this.bannersService.delete(id); }
}
