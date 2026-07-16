import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDiscountDto {
  @ApiProperty({ example: 'Contractor Bulk Discount' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '10% off for contractors ordering 5+ units' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: ['CONTRACTOR', 'PAINTER'],
    description: 'Empty array means discount applies to ALL account types',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accountTypes?: string[];

  @ApiPropertyOptional({
    example: ['asian-paints', 'berger'],
    description: 'Empty array means discount applies to ALL brands',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brandSlugs?: string[];

  @ApiProperty({ example: 10, description: 'Discount percentage (0–100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercent: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Minimum cart quantity to trigger this discount',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  minQty?: number;

  @ApiPropertyOptional({
    example: 19,
    description: 'Maximum cart quantity (null = no upper limit)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxQty?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
