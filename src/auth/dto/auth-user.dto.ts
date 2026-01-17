import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsString()
  email: string;

  @ApiProperty({ example: '123456', description: 'Verification code' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'newPass123', description: 'New password' })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ example: 'newPass123', description: 'Confirm new password' })
  @IsString()
  @MinLength(8)
  confirmPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPass123', description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPass123', description: 'New password' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}