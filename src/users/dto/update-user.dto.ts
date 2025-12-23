import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUser {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
