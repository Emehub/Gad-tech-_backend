import {
  IsString, IsOptional, IsNumber, IsBoolean, IsArray,
  IsEnum, Min, ValidateNested, IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ProductSpecDto {
  @IsString() key: string;
  @IsString() value: string;
}

export class ProductVariantDto {
  @IsString() name: string;
  @IsString() value: string;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsString() sku?: string;
}

export class CreateProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortDesc?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sku?: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) comparePrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) stock?: number;
  @ApiPropertyOptional({ default: 5 }) @IsOptional() @IsInt() @Min(0) lowStockAlert?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional({ enum: ProductStatus }) @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isNewArrival?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isBestSeller?: boolean;
  @ApiProperty() @IsString() categoryId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brandId?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDesc?: string;
  @ApiPropertyOptional({ type: [ProductVariantDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductVariantDto) variants?: ProductVariantDto[];
  @ApiPropertyOptional({ type: [ProductSpecDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductSpecDto) specs?: ProductSpecDto[];
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() shortDesc?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsNumber() @Min(0) comparePrice?: number;
  @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsInt() @Min(0) lowStockAlert?: number;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isNewArrival?: boolean;
  @IsOptional() @IsBoolean() isBestSeller?: boolean;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDesc?: string;
}

export class ProductFilterDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brandId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() isNewArrival?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() isBestSeller?: boolean;
  @ApiPropertyOptional({ enum: ProductStatus }) @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
}
