import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/auth-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registration(userDto: CreateUserDto) {
    const { email, password, confirmPassword } = userDto;

    if (userDto.password !== userDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exist');
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
        isVerified: false,
        verificationTokens: {
          create: {
            tokenHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // post
          },
        },
      },
    });

    return {
      message: 'User register success',
      userId: user.id,
      isVerified: user.isVerified,
      verificationToken, // post
    };
  }

  async login(loginDto: UserLoginDto) {
    const { email, password } = loginDto;

    const findUser = await this.prisma.user.findUnique({ where: { email } });
    if (!findUser) throw new BadRequestException('User not found');

    const isPassword = await bcrypt.compare(password, findUser.password);
    if (!isPassword) throw new BadRequestException('Invalid password');
    if (!findUser.isVerified)
      throw new BadRequestException('Email not verified');

    const payload = { email: findUser.email, sub: findUser.id };
    const token = this.jwtService.sign(payload);
    return {
      message: 'User is sign-in',
      token,
      user: {
        email: findUser.email,
        isVerified: findUser.isVerified,
        id: findUser.id,
      },
    };
  }

  async createToken(user: { id: number; email: string }) {
    const payload = { id: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async verifyEmail(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const verifToken = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (!verifToken) {
      throw new BadRequestException('Invalid token');
    }

    if (verifToken.expiresAt < new Date()) {
      throw new BadRequestException('Token is expried');
    }

    const user = await this.prisma.user.update({
      where: {
        id: verifToken.userId,
      },
      data: {
        isVerified: true,
      },
    });

    await this.prisma.verificationToken.delete({
      where: { id: verifToken.id },
    });

    return {
      message: 'Email verified',
      email: user.email,
    };
  }

  async resendVerif(email: string) {
    const findUser = await this.prisma.user.findUnique({ where: { email } });
    if (!findUser) throw new BadRequestException('User not found');
    if (findUser.isVerified)
      throw new BadRequestException("Email already verified'");

    await this.prisma.verificationToken.deleteMany({
      where: { userId: findUser.id },
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    await this.prisma.verificationToken.create({
      data: {
        userId: findUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return {
      message: 'Verif email resent',
      email: findUser.email,
      verificationToken,
    };
  }

  async forgotPass(email: string) {
    const findUser = await this.prisma.user.findUnique({ where: { email } });
    if (!findUser) throw new BadRequestException('User not found');
    if (!findUser.isVerified)
      throw new BadRequestException("Email already verified'");

    await this.prisma.verificationToken.deleteMany({
      where: { userId: findUser.id },
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    await this.prisma.passwordResetToken.create({
      data: {
        userId: findUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return {
      message: 'Forgot password',
      email: findUser.email,
      verificationToken,
    };
  }

  async resetPass(resetPassDto: ResetPasswordDto) {
    const { token, newPassword, confirmPassword } = resetPassDto;

    if (newPassword !== confirmPassword)
      throw new BadRequestException("Password don't exist");

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.used) {
      throw new BadRequestException('Token already used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 8);
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return {
      message: 'Password successful changed!',
    };
  }
}
