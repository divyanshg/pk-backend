import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AccountType } from '@prisma/client';

export class AccountTypePriceDto {
  @ApiProperty({ enum: AccountType, example: AccountType.CONTRACTOR })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({ example: 1425 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'asian-paints-interior-luxury-emulsion' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Asian Paints Luxury Emulsion' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'asian-paints' })
  @IsString()
  @IsNotEmpty()
  brandSlug: string;

  @ApiProperty({ example: 'interior' })
  @IsString()
  @IsNotEmpty()
  categorySlug: string;

  @ApiPropertyOptional({ example: 'Luxury Emulsion' })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: '4 L', description: 'e.g. 1 L, 4 L, 10 L, 1 kg, 5 kg, piece' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 4.5 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  reviews?: number;

  @ApiPropertyOptional({ example: 'Matte', description: 'Matte, Satin, Gloss, or leave empty for non-paint products' })
  @IsString()
  @IsOptional()
  finish?: string;

  @ApiPropertyOptional({ example: '120 sq.ft / litre / coat' })
  @IsString()
  @IsOptional()
  coverage?: string;

  @ApiPropertyOptional({ example: 'Premium interior paint...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'oklch(0.85 0.08 60)' })
  @IsString()
  @IsOptional()
  swatch?: string;

  @ApiPropertyOptional({ example: 'Bestseller', enum: ['Bestseller', 'New'] })
  @IsString()
  @IsOptional()
  @IsIn(['Bestseller', 'New'])
  badge?: string;

  @ApiPropertyOptional({
    example: [
      'https://api.paintcart.in/uploads/products/1737043200000-a1b2c3.jpg',
      'https://api.paintcart.in/uploads/products/1737043200001-d4e5f6.webp',
    ],
    maxItems: 10,
  })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsOptional()
  images?: string[] | null;

  @ApiPropertyOptional({
    type: [AccountTypePriceDto],
    example: [{ accountType: AccountType.CONTRACTOR, price: 1425 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccountTypePriceDto)
  @IsOptional()
  accountTypePricing?: AccountTypePriceDto[] | null;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'If true, user must select a shade from the brand palette before checkout',
  })
  @IsBoolean()
  @IsOptional()
  requiresShade?: boolean;
}
