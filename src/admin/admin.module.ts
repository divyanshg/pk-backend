import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DiscountsModule } from '../discounts/discounts.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [DiscountsModule, CouponsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
