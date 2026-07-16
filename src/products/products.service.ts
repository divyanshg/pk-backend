import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const {
      brand,
      category,
      subcategory,
      search,
      badge,
      inStock,
      page = 1,
      pageSize = 20,
    } = query;

    const where: Prisma.ProductWhereInput = {};

    if (brand) where.brandSlug = brand;
    if (category) where.categorySlug = category;
    if (subcategory) where.subcategory = subcategory;
    if (badge) where.badge = badge;
    if (typeof inStock === 'boolean') where.inStock = inStock;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subcategory: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async findRelated(id: string, limit = 4) {
    const product = await this.findOne(id);

    return this.prisma.product.findMany({
      where: {
        brandSlug: product.brandSlug,
        id: { not: id },
      },
      take: limit,
      include: {
        brand: { select: { name: true, slug: true } },
      },
    });
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id: dto.id },
    });

    if (existing) {
      throw new ConflictException(`Product ${dto.id} already exists`);
    }

    return this.prisma.product.create({
      data: { ...dto, images: dto.images ?? [] },
      include: { brand: true, category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { ...dto, images: dto.images === null ? [] : dto.images },
      include: { brand: true, category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
