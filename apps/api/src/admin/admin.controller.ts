import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CreateSubjectDto, UpdateSubjectDto, AdjustResourcesDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─────────────────────────────────────────
  // Dashboard
  // ─────────────────────────────────────────

  @Get('metrics')
  getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('metrics/chart')
  getMetricsChart() {
    return this.adminService.getMetricsChart();
  }

  // ─────────────────────────────────────────
  // Users
  // ─────────────────────────────────────────

  @Get('users')
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
  }

  @Put('users/:id/resources')
  adjustResources(
    @Param('id') id: string,
    @Body() dto: AdjustResourcesDto,
  ) {
    return this.adminService.adjustResources(id, dto);
  }

  // ─────────────────────────────────────────
  // Curriculum
  // ─────────────────────────────────────────

  @Get('curriculum/subjects')
  getSubjects() {
    return this.adminService.getSubjects();
  }

  @Post('curriculum/subjects')
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.adminService.createSubject(dto);
  }

  @Patch('curriculum/subjects/:id')
  updateSubject(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.adminService.updateSubject(id, dto);
  }

  @Delete('curriculum/subjects/:id')
  deleteSubject(@Param('id') id: string) {
    return this.adminService.deleteSubject(id);
  }
}
