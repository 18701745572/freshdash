import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('用户')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: '获取用户信息' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post('login')
  @ApiOperation({ summary: '微信登录' })
  login(@Body() body: LoginDto) {
    return this.userService.login(body.code);
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
}
