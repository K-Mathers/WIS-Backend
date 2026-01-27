import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('DISCORD_CLIENT_ID'),
      clientSecret: config.get('DISCORD_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/discord/callback',
      scope: ['identify', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      email: profile.email,
      discordId: profile.id,
    };
  }
}
