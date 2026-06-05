import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AddressService } from './address.service';

@ApiTags('地址')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: '获取地址列表' })
  findAll(@Body('userId') userId: string) {
    return this.addressService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取地址详情' })
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增地址' })
  create(@Body() body: {
    userId: string;
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    isDefault?: boolean;
  }) {
    return this.addressService.create(body.userId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新地址' })
  update(@Param('id') id: string, @Body() body: {
    userId: string;
    name?: string;
    phone?: string;
    province?: string;
    city?: string;
    district?: string;
    detail?: string;
    isDefault?: boolean;
  }) {
    return this.addressService.update(id, body.userId, body);
  }

  @Put(':id/default')
  @ApiOperation({ summary: '设为默认地址' })
  setDefault(@Param('id') id: string, @Body('userId') userId: string) {
    return this.addressService.setDefault(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除地址' })
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }
}
