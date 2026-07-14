import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getStats() {
    return this.adminService.getStats();
  }
}
