import { Controller, Post, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PlacementTestService } from './placement-test.service';
import { SubmitPlacementTestAnswerDto } from './dto/submit-placement-test-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('placement-test')
@UseGuards(JwtAuthGuard)
export class PlacementTestController {
  constructor(private readonly placementTestService: PlacementTestService) {}

  @Post('start/:lessonId')
  @HttpCode(HttpStatus.CREATED)
  startTest(
    @Req() req: { user: { id: string } },
    @Param('lessonId') lessonId: string,
  ) {
    return this.placementTestService.startPlacementTest(req.user.id, lessonId);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  submitAnswer(
    @Req() req: { user: { id: string } },
    @Body() dto: SubmitPlacementTestAnswerDto,
  ) {
    return this.placementTestService.submitAnswer(req.user.id, dto);
  }
}
