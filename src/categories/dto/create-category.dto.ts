import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, Min } from 'class-validator';
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

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
