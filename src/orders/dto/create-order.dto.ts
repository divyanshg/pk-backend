import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ example: 'asian-paints-interior-luxury-emulsion' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'Asian Paints Luxury Emulsion' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  qty: number;

  @ApiProperty({ example: '4 L' })
  @IsString()
  @IsNotEmpty()
  unit: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ example: '123 Main St, Mumbai 400001' })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ example: 'Please deliver after 5pm' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'SAVE20' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  couponDiscount?: number;

  @ApiPropertyOptional({ example: 50, description: 'Auto rule-based discount amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discount?: number;
}
