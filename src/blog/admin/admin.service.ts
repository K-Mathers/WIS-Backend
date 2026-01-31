import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMissionDto, UpdateMissionDto } from './dto/mission.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [totalUser, totalArticles, openChats, missions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.article.count(),
      this.prisma.supportChat.count({ where: { status: 'OPEN' } }),
      this.prisma.mission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      stats: {
        totalUser,
        totalArticles,
        newMessages: openChats,
      },
      missions,
    };
  }

  async createMission(dto: CreateMissionDto) {
    return this.prisma.mission.create({ data: dto });
  }

  async updateMission(id: string, dto: UpdateMissionDto) {
    return this.prisma.mission.update({
      where: { id },
      data: dto,
    });
  }

  async deleteMission(id: string) {
    return this.prisma.mission.delete({ where: { id } });
  }
}
