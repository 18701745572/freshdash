import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.banner.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sort: 'asc' },
    });
  }
}
