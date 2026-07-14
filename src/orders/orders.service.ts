import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

const FREE_DELIVERY_THRESHOLD = 2500;
const SHIPPING_FEE = 149;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count(),
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
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async create(dto: CreateOrderDto) {
    // Calculate subtotal from items
    const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Calculate shipping: free if subtotal >= 2500, else 149
    const shipping = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : SHIPPING_FEE;

    const total = subtotal + shipping;

    // Convert items to plain JSON array for Prisma
    const itemsJson = dto.items.map((item: OrderItemDto) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      qty: item.qty,
      unit: item.unit,
    })) as Prisma.InputJsonValue;

    return this.prisma.order.create({
      data: {
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        shippingAddress: dto.shippingAddress,
        items: itemsJson,
        subtotal,
        shipping,
        total,
        notes: dto.notes,
        status: 'pending',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
