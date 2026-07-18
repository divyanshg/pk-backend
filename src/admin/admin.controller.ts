import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { DiscountsService } from '../discounts/discounts.service';
import { CouponsService } from '../coupons/coupons.service';
import { StoreService, UpdateStoreDto } from '../store/store.service';
import { CreateDiscountDto } from '../discounts/dto/create-discount.dto';
import { CreateCouponDto } from '../coupons/dto/create-coupon.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private adminService: AdminService,
    private discountsService: DiscountsService,
    private couponsService: CouponsService,
    private storeService: StoreService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getStats() {
    return this.adminService.getStats();
  }

  // ── Store Settings ─────────────────────────────────────────────────────────

  @Get('store')
  @ApiOperation({ summary: 'Get store settings (admin)' })
  getStore() {
    return this.storeService.getInfo();
  }

  @Put('store')
  @ApiOperation({ summary: 'Update store settings (admin)' })
  updateStore(@Body() dto: UpdateStoreDto) {
    return this.storeService.update(dto);
  }

  // ── Discounts ──────────────────────────────────────────────────────────────

  @Get('discounts')
  @ApiOperation({ summary: 'List all discounts (admin, includes inactive)' })
  listDiscounts() {
    return this.discountsService.findAll(false);
  }

  @Post('discounts')
  @ApiOperation({ summary: 'Create a discount rule' })
  createDiscount(@Body() dto: CreateDiscountDto) {
    return this.discountsService.create(dto);
  }

  @Put('discounts/:id')
  @ApiOperation({ summary: 'Update a discount rule' })
  updateDiscount(@Param('id') id: string, @Body() dto: Partial<CreateDiscountDto>) {
    return this.discountsService.update(id, dto);
  }

  @Delete('discounts/:id')
  @ApiOperation({ summary: 'Delete a discount rule' })
  removeDiscount(@Param('id') id: string) {
    return this.discountsService.remove(id);
  }

  // ── Coupons ────────────────────────────────────────────────────────────────

  @Get('coupons')
  @ApiOperation({ summary: 'List all coupons (admin)' })
  listCoupons() {
    return this.couponsService.findAll();
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create a coupon' })
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Put('coupons/:id')
  @ApiOperation({ summary: 'Update a coupon' })
  updateCoupon(@Param('id') id: string, @Body() dto: Partial<CreateCouponDto>) {
    return this.couponsService.update(id, dto);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Delete a coupon' })
  removeCoupon(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
