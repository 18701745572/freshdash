import { IsOptional, IsString } from 'class-validator';

export class ShipOrderDto {
  @IsOptional()
  @IsString()
  trackingNo?: string;
}
