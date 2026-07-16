import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @ApiPropertyOptional({ example: '4 L', enum: ['1 L', '4 L', '10 L', '20 L'] })
  @IsString()
  @IsOptional()
  @IsIn(['1 L', '4 L', '10 L', '20 L'])
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

  @ApiPropertyOptional({
    example: 'Matte',
    enum: ['Matte', 'Satin', 'Sheen', 'Gloss', 'High Gloss'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['Matte', 'Satin', 'Sheen', 'Gloss', 'High Gloss'])
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

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;
}
