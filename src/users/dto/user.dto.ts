import { IsString, IsOptional, IsEmail, MaxLength, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class CreateAddressDto {
  @ApiPropertyOptional({ default: 'Home' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsString()
  fullName: string;

  @ApiPropertyOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsString()
  street: string;

  @ApiPropertyOptional()
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsString()
  region: string;

  @ApiPropertyOptional({ default: 'Ghana' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
