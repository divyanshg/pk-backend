import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

const FREE_DELIVERY_THRESHOLD = 2500;
const SHIPPING_FEE = 149;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
  ) {}

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

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyOrder(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== userId) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async create(dto: CreateOrderDto, userId?: string) {
    // Calculate subtotal from items
    const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Calculate shipping: free if subtotal >= 2500, else 149
    const shipping = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : SHIPPING_FEE;

    // Validate coupon server-side if provided
    let couponDiscount = 0;
    let validatedCouponCode: string | null = null;
    if (dto.couponCode) {
      let accountType: string | null = null;
      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { accountType: true },
        });
        accountType = user?.accountType ?? null;
      }
      const result = await this.couponsService.validate(dto.couponCode, subtotal, accountType);
      couponDiscount = result.discountAmount;
      validatedCouponCode = dto.couponCode.toUpperCase();
      await this.couponsService.incrementUsage(validatedCouponCode);
    }

    // Auto rule-based discount (calculated client-side, stored as-is; we trust the value passed)
    const discount = dto.discount ?? 0;

    const total = Math.max(0, subtotal + shipping - couponDiscount - discount);

    // Convert items to plain JSON array for Prisma
    const itemsJson = dto.items.map((item: OrderItemDto) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      qty: item.qty,
      unit: item.unit,
      ...(item.shadeCode && { shadeCode: item.shadeCode }),
      ...(item.shadeName && { shadeName: item.shadeName }),
    })) as Prisma.InputJsonValue;

    return this.prisma.order.create({
      data: {
        userId: userId ?? null,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        shippingAddress: dto.shippingAddress,
        items: itemsJson,
        subtotal,
        shipping,
        couponCode: validatedCouponCode,
        couponDiscount,
        discount,
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
