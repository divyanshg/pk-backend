import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';

@ApiTags('discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private discountsService: DiscountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active discount rules (public)' })
  findAll() {
    return this.discountsService.findAll(true);
  }
}
