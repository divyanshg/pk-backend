import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'asian-paints' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Asian Paints' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Har Ghar Kuch Kehta Hai' })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiPropertyOptional({ example: 'oklch(0.55 0.20 25)' })
  @IsString()
  @IsOptional()
  swatch?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
