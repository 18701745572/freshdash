import { IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  openId: string;

  @IsString()
  @IsOptional()
  nickName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
