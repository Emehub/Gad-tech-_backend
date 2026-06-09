import { Controller, Post, Delete, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsletterService, SubscribeDto } from './newsletter.service';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '@prisma/client';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  subscribe(@Body() dto: SubscribeDto) { return this.newsletterService.subscribe(dto); }

  @Public()
  @Delete('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  unsubscribe(@Query('email') email: string) { return this.newsletterService.unsubscribe(email); }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Get all subscribers' })
  findAll(@Query() dto: PaginationDto) { return this.newsletterService.findAll(dto); }
}
