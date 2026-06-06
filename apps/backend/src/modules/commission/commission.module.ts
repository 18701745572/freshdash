import { Module } from '@nestjs/common';
import { CommissionController, AdminCommissionController } from './commission.controller';
import { CommissionService } from './commission.service';

@Module({
  controllers: [CommissionController, AdminCommissionController],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
