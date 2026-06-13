import { ApiProperty } from '@nestjs/swagger';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录临时凭证 code' })
  code: string;
}
