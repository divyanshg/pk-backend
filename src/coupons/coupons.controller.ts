import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate a coupon code against the current user and cart subtotal' })
  async validate(@Body() dto: ValidateCouponDto, @Request() req: any) {
    // Fetch the user's accountType from DB so it can't be spoofed
    const userId: string = req.user.userId;
    // We'll look up accountType from the DB via the service
    return this.couponsService.validateForUser(dto.code, dto.orderSubtotal, userId);
  }
}
