import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { DiscountType as PrismaDiscountType } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException(`Coupon code "${dto.code}" already exists`);

    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description ?? '',
        accountTypes: dto.accountTypes ?? [],
        discountType: dto.discountType as PrismaDiscountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue ?? 0,
        maxUses: dto.maxUses ?? null,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: Partial<CreateCouponDto>) {
    await this.findOne(id);
    const updateData: any = { ...dto };
    if (dto.code) updateData.code = dto.code.toUpperCase();
    if (dto.validFrom) updateData.validFrom = new Date(dto.validFrom);
    if (dto.validUntil) updateData.validUntil = new Date(dto.validUntil);
    return this.prisma.coupon.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({ where: { id } });
  }

  /**
   * Validate for a known userId (fetches accountType from DB).
   * Used by the REST controller so accountType can't be spoofed.
   */
  async validateForUser(
    code: string,
    orderSubtotal: number,
    userId: string,
  ): Promise<{ discountAmount: number; discountType: string; discountValue: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { accountType: true },
    });
    return this.validate(code, orderSubtotal, user?.accountType ?? null);
  }

  /**
   * Validate a coupon code for a given user (by accountType) and order subtotal.
   * Returns the computed discount amount if valid, or throws BadRequestException.
   */
  async validate(
    code: string,
    orderSubtotal: number,
    userAccountType?: string | null,
  ): Promise<{ discountAmount: number; discountType: string; discountValue: number }> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive coupon code');
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      throw new BadRequestException('Coupon has expired');
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    if (Number(coupon.minOrderValue) > 0 && orderSubtotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException(
        `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      );
    }

    // Check account type restriction
    if (coupon.accountTypes.length > 0) {
      if (!userAccountType || !coupon.accountTypes.includes(userAccountType)) {
        throw new BadRequestException('This coupon is not applicable for your account type');
      }
    }

    const value = Number(coupon.discountValue);
    const discountAmount =
      coupon.discountType === 'PERCENTAGE'
        ? Math.round((orderSubtotal * value) / 100)
        : Math.min(value, orderSubtotal); // FIXED: cannot exceed order total

    return {
      discountAmount,
      discountType: coupon.discountType,
      discountValue: value,
    };
  }

  /** Increment usedCount after a successful order. Called from OrdersService. */
  async incrementUsage(code: string) {
    await this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }
}
