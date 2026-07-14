import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  findOne(@Param('slug') slug: string) {
    return this.brandsService.findOne(slug);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create brand (admin)' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Put(':slug')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update brand (admin)' })
  update(@Param('slug') slug: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(slug, dto);
  }

  @Delete(':slug')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete brand (admin)' })
  remove(@Param('slug') slug: string) {
    return this.brandsService.remove(slug);
  }
}
