import { Module } from '@nestjs/common';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierPortalController } from './supplier-portal.controller';
import { SupplierPortalService } from './supplier-portal.service';
import { SupplierAuthGuard } from './supplier-auth.guard';

@Module({
  controllers: [SupplierController, SupplierPortalController],
  providers: [SupplierService, SupplierPortalService, SupplierAuthGuard],
})
export class SupplierModule {}
