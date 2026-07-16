import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'interior' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Interior Paints' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Walls that feel like home.' })
  @IsString()
  @IsOptional()
  blurb?: string;

  @ApiProperty({ example: ['Luxury Emulsion', 'Premium Emulsion'] })
  @IsArray()
  @IsString({ each: true })
  subcategories: string[];

  @ApiPropertyOptional({
    example:
      'https://api.paintcart.in/uploads/categories/1737043200000-a1b2c3.png',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
