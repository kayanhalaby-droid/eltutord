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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParentsService } from './parents.service';
import { LinkChildDto } from './dto/link-child.dto';
import { ParentChildrenDto } from './dto/parent-children.dto';
import { ChildProgressDto } from './dto/child-progress.dto';
import { WeeklyReportDto } from './dto/weekly-report.dto';

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

@ApiTags('Parents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
}
