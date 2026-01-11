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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user' })
  @Get('profile')
  getMe(@Request() req) {
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
    };
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @Post('registration')
  registration(@Body() dto: CreateUserDto) {
    return this.authService.registration(dto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
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

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  @Post('logout')
  logout(@Res({ passthrough: true }) res) {
    res.clearCookie('token');
    return { message: 'Logged out' };
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @Post('forgot-password')
  async forgotPass(@Body('email') email: string) {
    return this.authService.forgotPass(email);
  }

  @ApiOperation({ summary: 'Reset password' })
  @Post('reset-password')
  async resetPass(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPass(
      dto.email,
      dto.code,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @ApiOperation({ summary: 'Send verification code' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' } } } })
  @Post('send-code')
  async sendCode(@Body('email') email: string) {
    return this.authService.sendEmailCode(email, 'VERIFY_EMAIL');
  }

  @ApiOperation({ summary: 'Verify code' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'user@example.com' }, code: { type: 'string', example: '123456' } } } })
  @Post('verify-code')
  async verifyCode(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.verifyEmailCode(email, code, 'VERIFY_EMAIL');
  }
}
