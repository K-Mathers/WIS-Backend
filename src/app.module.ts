import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AiModule } from './ai/ai.module';
import { BlogModule } from './blog/blog.module';
import { SupportModule } from './support/support.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, MailModule, AiModule, BlogModule, SupportModule, ShopModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
