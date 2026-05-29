import { Module } from '@nestjs/common';
import { GemsService } from './gems.service';

@Module({
  providers: [GemsService],
  exports: [GemsService],
})
export class GemsModule {}
