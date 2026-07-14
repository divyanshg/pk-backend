import { IsString, IsNotEmpty, IsOptional, IsIn, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShadeDto {
  @ApiProperty({ example: 'Pearl White' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '#FFFFFF' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'hex must be a valid hex color (e.g., #FFF or #FFFFFF)',
  })
  hex: string;

  @ApiProperty({ example: 'asian-paints' })
  @IsString()
  @IsNotEmpty()
  brandSlug: string;

  @ApiPropertyOptional({ example: 'light', enum: ['light', 'vibrant', 'dark'] })
  @IsString()
  @IsOptional()
  @IsIn(['light', 'vibrant', 'dark'])
  type?: string;
}
