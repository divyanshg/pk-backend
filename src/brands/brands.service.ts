import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true, shades: true } },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand ${slug} not found`);
    }

    return brand;
  }

  async create(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Brand ${dto.slug} already exists`);
    }

    return this.prisma.brand.create({ data: dto });
  }

  async update(slug: string, dto: UpdateBrandDto) {
    const existing = await this.findOne(slug);

    // If slug is being changed, cascade to products and shades
    if (dto.slug && dto.slug !== slug) {
      const newSlug = dto.slug;
      return this.prisma.$transaction(async (tx) => {
        await tx.product.updateMany({
          where: { brandSlug: slug },
          data: { brandSlug: newSlug },
        });

        await tx.shade.updateMany({
          where: { brandSlug: slug },
          data: { brandSlug: newSlug },
        });

        await tx.brand.delete({ where: { slug } });

        return tx.brand.create({
          data: {
            slug: newSlug,
            name: dto.name ?? existing.name,
            tagline: dto.tagline ?? existing.tagline,
            swatch: dto.swatch ?? existing.swatch,
            imageUrl: Object.prototype.hasOwnProperty.call(dto, 'imageUrl')
              ? dto.imageUrl
              : existing.imageUrl,
            sortOrder: dto.sortOrder ?? existing.sortOrder,
          },
        });
      });
    }

    return this.prisma.brand.update({
      where: { slug },
      data: dto,
    });
  }

  async remove(slug: string) {
    await this.findOne(slug);
    return this.prisma.brand.delete({ where: { slug } });
  }
}
