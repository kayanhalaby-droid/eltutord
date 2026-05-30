import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { ParentsService } from './parents.service';
import { LinkChildDto } from './dto/link-child.dto';
import { ParentChildrenDto } from './dto/parent-children.dto';
import { ChildProgressDto } from './dto/child-progress.dto';
import { WeeklyReportDto } from './dto/weekly-report.dto';

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

class EncourageDto {
  message: string;
  gems: number;
  fromName: string;
}

@ApiTags('Parents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARENT)
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('children')
  @ApiOperation({ summary: 'جلب قائمة أبناء الوالد' })
  @ApiResponse({ status: 200, type: [ParentChildrenDto] })
  getChildren(@Req() req: AuthRequest): Promise<ParentChildrenDto[]> {
    return this.parentsService.getChildren(req.user.id);
  }

  @Post('children/link')
  @ApiOperation({ summary: 'ربط طالب بكود الوالد' })
  @ApiResponse({ status: 201, description: 'تم الربط بنجاح' })
  linkChild(@Req() req: AuthRequest, @Body() dto: LinkChildDto) {
    return this.parentsService.linkChild(req.user.id, dto.parentCode);
  }

  @Get('children/:childId/progress')
  @ApiOperation({ summary: 'تفاصيل تقدم الطالب' })
  @ApiResponse({ status: 200, type: ChildProgressDto })
  getChildProgress(
    @Req() req: AuthRequest,
    @Param('childId') childId: string,
  ): Promise<ChildProgressDto> {
    return this.parentsService.getChildProgress(req.user.id, childId);
  }

  @Get('children/:childId/weekly-report')
  @ApiOperation({ summary: 'تقرير أسبوعي بالذكاء الاصطناعي' })
  @ApiResponse({ status: 200, type: WeeklyReportDto })
  getWeeklyReport(
    @Req() req: AuthRequest,
    @Param('childId') childId: string,
  ): Promise<WeeklyReportDto> {
    return this.parentsService.generateWeeklyReport(req.user.id, childId);
  }

  @Get('children/:childId/today-summary')
  @ApiOperation({ summary: 'ملخص نشاط الطالب اليوم' })
  getTodaySummary(
    @Req() req: AuthRequest,
    @Param('childId') childId: string,
  ) {
    return this.parentsService.getTodaySummary(req.user.id, childId);
  }

  @Get('children/:childId/weekly-progress')
  @ApiOperation({ summary: 'تقدم الطالب خلال 7 أيام' })
  getWeeklyProgress(
    @Req() req: AuthRequest,
    @Param('childId') childId: string,
  ) {
    return this.parentsService.getWeeklyProgress(req.user.id, childId);
  }

  @Get('children/:childId/skill-radar')
  @ApiOperation({ summary: 'رادار المهارات لكل مادة' })
  getSkillRadar(
    @Req() req: AuthRequest,
    @Param('childId') childId: string,
  ) {
    return this.parentsService.getSkillRadar(req.user.id, childId);
  }

  @Get('children/:childId/activities')
  @ApiOperation({ summary: 'آخر 20 نشاط للطالب' })
  getActivities(
    @Req() req: AuthRequest,
    @Param('childId') childId: string,
  ) {
    return this.parentsService.getActivities(req.user.id, childId);
  }

  @Post('encourage/:childId')
  @ApiOperation({ summary: 'إرسال رسالة تشجيعية للطالب' })
  sendEncouragement(
    @Req() req: AuthRequest,
    @Param('childId') childId: string,
    @Body() dto: EncourageDto,
  ) {
    return this.parentsService.sendEncouragement(
      req.user.id,
      childId,
      dto.message,
      dto.gems ?? 0,
      dto.fromName,
    );
  }
}
