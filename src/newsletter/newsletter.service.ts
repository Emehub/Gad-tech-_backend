import { Injectable, ConflictException } from '@nestjs/common';
import { IsEmail, IsString, IsOptional } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, paginate, paginationMeta } from '../common/dto/pagination.dto';

export class SubscribeDto {
  @IsEmail() email: string;
}

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(dto: SubscribeDto) {
    const existing = await this.prisma.newsletter.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      if (existing.isActive) throw new ConflictException('You are already subscribed');
      await this.prisma.newsletter.update({ where: { email: dto.email.toLowerCase() }, data: { isActive: true } });
      return { message: 'Welcome back! You have been re-subscribed.' };
    }
    await this.prisma.newsletter.create({ data: { email: dto.email.toLowerCase() } });
    return { message: 'Thank you for subscribing to our newsletter!' };
  }

  async unsubscribe(email: string) {
    await this.prisma.newsletter.updateMany({
      where: { email: email.toLowerCase() }, data: { isActive: false },
    });
    return { message: 'You have been unsubscribed.' };
  }

  async findAll(dto: PaginationDto) {
    const { skip, take } = paginate(dto.page, dto.limit);
    const [items, total] = await Promise.all([
      this.prisma.newsletter.findMany({ where: { isActive: true }, skip, take, orderBy: { subscribedAt: 'desc' } }),
      this.prisma.newsletter.count({ where: { isActive: true } }),
    ]);
    return { data: items, meta: paginationMeta(total, dto.page, dto.limit) };
  }
}
