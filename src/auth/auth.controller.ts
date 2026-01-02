import { UserLoginDto } from './../users/dto/create-user.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDto } from './dto/auth-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getMe(@Request() req) {
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
    };
  }

  @Post('registration')
  registration(@Body() dto: CreateUserDto) {
    return this.authService.registration(dto);
  }

  @Post('login')
  async login(@Res({ passthrough: true }) res, @Body() dto: UserLoginDto) {
    const { token, user } = await this.authService.login(dto);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
    return { message: 'Logged success!', user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res) {
    res.clearCookie('token');
    return { message: 'Logged out' };
  }

  @Post('forgot-password')
  async forgotPass(@Body('email') email: string) {
    return this.authService.forgotPass(email);
  }

  @Post('reset-password')
  async resetPass(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPass(
      dto.email,
      dto.code,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('send-code')
  async sendCode(@Body('email') email: string) {
    return this.authService.sendEmailCode(email, 'VERIFY_EMAIL');
  }

  @Post('verify-code')
  async verifyCode(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.verifyEmailCode(email, code, 'VERIFY_EMAIL');
  }
}
