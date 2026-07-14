import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShadeDto } from './dto/create-shade.dto';
import { UpdateShadeDto } from './dto/update-shade.dto';
import { ImportShadesDto, ImportShadesResultDto } from './dto/import-shades.dto';
import { ShadeType } from '@prisma/client';

@Injectable()
export class ShadesService {
  constructor(private prisma: PrismaService) {}

  async findAll(brandSlug?: string) {
    const where = brandSlug ? { brandSlug } : {};

    return this.prisma.shade.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: { brand: { select: { name: true, slug: true } } },
    });
  }

  async findByBrandGrouped(brandSlug: string) {
    const shades = await this.prisma.shade.findMany({
      where: { brandSlug },
      orderBy: { name: 'asc' },
    });

    return {
      light: shades.filter((s) => s.type === 'light'),
      vibrant: shades.filter((s) => s.type === 'vibrant'),
      dark: shades.filter((s) => s.type === 'dark'),
    };
  }

  async findOne(id: string) {
    const shade = await this.prisma.shade.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!shade) {
      throw new NotFoundException(`Shade ${id} not found`);
    }

    return shade;
  }

  async create(dto: CreateShadeDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug: dto.brandSlug },
    });

    if (!brand) {
      throw new BadRequestException(`Brand ${dto.brandSlug} not found`);
    }

    return this.prisma.shade.create({
      data: {
        name: dto.name,
        hex: dto.hex,
        brandSlug: dto.brandSlug,
        type: (dto.type as ShadeType) || 'light',
      },
      include: { brand: true },
    });
  }

  async update(id: string, dto: UpdateShadeDto) {
    await this.findOne(id);

    if (dto.brandSlug) {
      const brand = await this.prisma.brand.findUnique({
        where: { slug: dto.brandSlug },
      });
      if (!brand) {
        throw new BadRequestException(`Brand ${dto.brandSlug} not found`);
      }
    }

    return this.prisma.shade.update({
      where: { id },
      data: {
        ...dto,
        type: dto.type as ShadeType | undefined,
      },
      include: { brand: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.shade.delete({ where: { id } });
  }

  async import(dto: ImportShadesDto): Promise<ImportShadesResultDto> {
    const { rows, defaultBrandSlug } = dto;
    const errors: string[] = [];
    let inserted = 0;
    let skipped = 0;

    const hexRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    const validTypes = ['light', 'vibrant', 'dark'];

    // Get all brand slugs for validation
    const brands = await this.prisma.brand.findMany({ select: { slug: true } });
    const brandSlugs = new Set(brands.map((b) => b.slug));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      // Validate name
      if (!row.name?.trim()) {
        errors.push(`Row ${rowNum}: name is required`);
        continue;
      }

      // Validate and normalize hex
      let hex = row.hex?.trim() || '';
      if (!hex) {
        errors.push(`Row ${rowNum}: hex is required`);
        continue;
      }

      if (!hex.startsWith('#')) {
        hex = '#' + hex;
      }

      if (!hexRegex.test(hex)) {
        errors.push(`Row ${rowNum}: invalid hex color "${row.hex}"`);
        continue;
      }

      // Normalize 3-char hex to 6-char
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }

      hex = hex.toUpperCase();

      // Validate brand_slug
      const brandSlug = row.brand_slug?.trim() || defaultBrandSlug;
      if (!brandSlug) {
        errors.push(`Row ${rowNum}: brand_slug is required (no default provided)`);
        continue;
      }

      if (!brandSlugs.has(brandSlug)) {
        errors.push(`Row ${rowNum}: brand "${brandSlug}" not found`);
        continue;
      }

      // Validate type
      const type = (row.type?.trim().toLowerCase() || 'light') as ShadeType;
      if (!validTypes.includes(type)) {
        errors.push(`Row ${rowNum}: type must be one of: light, vibrant, dark`);
        continue;
      }

      // Upsert
      try {
        await this.prisma.shade.upsert({
          where: {
            brandSlug_name: { brandSlug, name: row.name.trim() },
          },
          update: { hex, type },
          create: {
            name: row.name.trim(),
            hex,
            brandSlug,
            type,
          },
        });
        inserted++;
      } catch (e) {
        errors.push(`Row ${rowNum}: database error`);
        skipped++;
      }

      // Stop collecting errors after 25
      if (errors.length >= 25) break;
    }

    // If all rows failed, throw
    if (inserted === 0 && errors.length > 0) {
      throw new BadRequestException(errors.slice(0, 10).join('; '));
    }

    return { inserted, skipped, errors };
  }
}
