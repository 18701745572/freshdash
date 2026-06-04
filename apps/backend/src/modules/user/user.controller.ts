import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.userService.login(body.code);
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
}
