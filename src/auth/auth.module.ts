import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jwt-secret',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    PrismaModule,
    MailModule,
  ],
})
export class AuthModule {}
