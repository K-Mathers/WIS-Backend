import { PrismaModule } from './../../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportGateway } from './support.gateway';
import { JwtModule } from '@nestjs/jwt';
import { SupportController } from './support.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET || 'jwt-secret',
        signOptions: { expiresIn: '14d' },
      }),
    }),
  ],
  providers: [SupportGateway, SupportService],
  controllers: [SupportController],
})
export class SupportModule {}
