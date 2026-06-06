import { Module } from '@nestjs/common';
import { PromoterController, AdminPromoterController } from './promoter.controller';
import { PromoterService } from './promoter.service';

@Module({
  controllers: [PromoterController, AdminPromoterController],
  providers: [PromoterService],
  exports: [PromoterService],
})
export class PromoterModule {}
