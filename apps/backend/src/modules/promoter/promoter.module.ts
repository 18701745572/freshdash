import { Module } from '@nestjs/common';
import { PromoterController } from './promoter.controller';
import { PromoterService } from './promoter.service';

@Module({
  controllers: [PromoterController],
  providers: [PromoterService],
})
export class PromoterModule {}
