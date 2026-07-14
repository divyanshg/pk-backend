import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StoreService } from './store.service';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get store location and operating hours' })
  getInfo() {
    return this.storeService.getInfo();
  }
}
