import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 1500, description: 'Order subtotal (INR) before coupon discount' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderSubtotal: number;
}
