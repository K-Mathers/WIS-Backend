import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, MailModule, AiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
