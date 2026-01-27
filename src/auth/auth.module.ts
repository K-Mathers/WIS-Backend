import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { GithubStrategy } from './strategies/github.strategy';
import { DiscordStrategy } from './strategies/discord.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailService,
    GoogleStrategy,
    GithubStrategy,
    DiscordStrategy,
  ],
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET || 'jwt-secret',
        signOptions: { expiresIn: '14d' },
      }),
    }),
    UsersModule,
    PrismaModule,
    MailModule,
  ],
})
export class AuthModule {}
