import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
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

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
        isVerified: false,
      },
    });

    return {
      message: 'User register success',
      userId: user.id,
      isVerified: user.isVerified,
    };
  }

  async login(loginDto: UserLoginDto) {
    const { email, password } = loginDto;

    const findUser = await this.prisma.user.findUnique({ where: { email } });
    if (!findUser) throw new BadRequestException('User not found');

    const isPassword = await bcrypt.compare(password, findUser.password);
    if (!isPassword) throw new BadRequestException('Invalid password');

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

  async forgotPass(email: string) {
    const findUser = await this.prisma.user.findUnique({ where: { email } });
    if (!findUser) throw new BadRequestException('User not found');

    return this.sendEmailCode(email, 'RESET_PASSWORD');
  }

  async resetPass(
    email: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword)
      throw new BadRequestException('Passwords do not match');

    await this.verifyEmailCode(email, code, 'RESET_PASSWORD');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated' };
  }

  async sendEmailCode(
    email: string,
    EmailCodeProps: 'VERIFY_EMAIL' | 'RESET_PASSWORD',
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    if (EmailCodeProps === 'VERIFY_EMAIL' && user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.prisma.emailCode.deleteMany({
      where: { userId: user.id, EmailCodeProps },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    await this.prisma.emailCode.create({
      data: {
        userId: user.id,
        codeHash,
        EmailCodeProps,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.mailService.sendVerificationCode(email, code);

    return { message: 'Code sent' };
  }

  async verifyEmailCode(
    email: string,
    code: string,
    EmailCodeProps: 'VERIFY_EMAIL' | 'RESET_PASSWORD',
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    const emailCode = await this.prisma.emailCode.findFirst({
      where: {
        userId: user.id,
        codeHash,
        EmailCodeProps,
        used: false,
      },
    });

    if (!emailCode) throw new BadRequestException('Invalid code');
    if (emailCode.expiresAt < new Date())
      throw new BadRequestException('Code expired');

    if (EmailCodeProps === 'VERIFY_EMAIL') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    await this.prisma.emailCode.update({
      where: { id: emailCode.id },
      data: { used: true },
    });

    return { message: 'Code verified' };
  }
}
