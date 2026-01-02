import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  email: string;

  @IsString()
  code: string;

  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;
}