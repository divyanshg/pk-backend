import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ShadesService } from './shades.service';
import { CreateShadeDto } from './dto/create-shade.dto';
import { UpdateShadeDto } from './dto/update-shade.dto';
import { ImportShadesDto } from './dto/import-shades.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('shades')
@Controller('shades')
export class ShadesController {
  constructor(private shadesService: ShadesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all shades, optionally filtered by brand' })
  @ApiQuery({ name: 'brand', required: false })
  findAll(@Query('brand') brand?: string) {
    return this.shadesService.findAll(brand);
  }

  @Get('brand/:brandSlug/grouped')
  @ApiOperation({ summary: 'Get shades for a brand grouped by type (light/vibrant/dark)' })
  findByBrandGrouped(@Param('brandSlug') brandSlug: string) {
    return this.shadesService.findByBrandGrouped(brandSlug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shade by ID' })
  findOne(@Param('id') id: string) {
    return this.shadesService.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create shade (admin)' })
  create(@Body() dto: CreateShadeDto) {
    return this.shadesService.create(dto);
  }

  @Post('import')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import shades from CSV/JSON rows (admin)' })
  import(@Body() dto: ImportShadesDto) {
    return this.shadesService.import(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shade (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateShadeDto) {
    return this.shadesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete shade (admin)' })
  remove(@Param('id') id: string) {
    return this.shadesService.remove(id);
  }
}
