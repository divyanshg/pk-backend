import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ShadeRowDto {
  @ApiProperty({ example: 'Pearl White' })
  @IsString()
  name: string;

  @ApiProperty({ example: '#FFFFFF' })
  @IsString()
  hex: string;

  @ApiPropertyOptional({ example: 'asian-paints' })
  @IsString()
  @IsOptional()
  brand_slug?: string;

  @ApiPropertyOptional({ example: 'light' })
  @IsString()
  @IsOptional()
  type?: string;
}

export class ImportShadesDto {
  @ApiProperty({ type: [ShadeRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShadeRowDto)
  rows: ShadeRowDto[];

  @ApiPropertyOptional({ example: 'asian-paints' })
  @IsString()
  @IsOptional()
  defaultBrandSlug?: string;
}

export class ImportShadesResultDto {
  @ApiProperty({ example: 25 })
  inserted: number;

  @ApiProperty({ example: 5 })
  skipped: number;

  @ApiProperty({ example: ['Row 3: invalid hex color'] })
  errors: string[];
}
