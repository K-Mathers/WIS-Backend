import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

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
      },
    });
    return { message: 'User register success', userId: user.id };
  }

  async login(loginDto: UserLoginDto) {
    const { email, password } = loginDto;

    const findUser = await this.prisma.user.findUnique({ where: { email } });
    if (!findUser) throw new BadRequestException('User not found');

    const isPassword = await bcrypt.compare(password, findUser.password);
    if (!isPassword) throw new BadRequestException('Invalid password');

    const payload = { email: findUser.email, sub: findUser.id };
    const token = this.jwtService.sign(payload);
    return { message: 'User is sign-in', token };
  }

  async createToken(user: { id: number; email: string }) {
    const payload = { id: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
