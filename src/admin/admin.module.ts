import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DiscountsModule } from '../discounts/discounts.module';
import { CouponsModule } from '../coupons/coupons.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [DiscountsModule, CouponsModule, StoreModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
