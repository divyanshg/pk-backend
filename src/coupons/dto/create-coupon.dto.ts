import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, Min, IsBoolean, IsInt, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '20% off for all users' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: ['CONTRACTOR'],
    description: 'Empty array means coupon applies to ALL account types',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accountTypes?: string[];

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 20, description: 'Discount amount (percent or flat INR)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountValue: number;

  @ApiPropertyOptional({ example: 500, description: 'Minimum order subtotal (INR) required' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum number of uses (null = unlimited)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxUses?: number;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({ example: '2027-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
