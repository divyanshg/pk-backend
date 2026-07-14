import { IsString, IsOptional, IsInt, Min, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class QueryProductsDto {
  @ApiPropertyOptional({ example: 'asian-paints' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'interior' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Luxury Emulsion' })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiPropertyOptional({ example: 'emulsion' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'Bestseller', enum: ['Bestseller', 'New'] })
  @IsString()
  @IsOptional()
  @IsIn(['Bestseller', 'New'])
  badge?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  inStock?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 20;
}
