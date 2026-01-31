import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MissionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMissionDto {
    @ApiProperty({ example: 'Fix CSS bugs on Landing Page', description: 'Текст задачи' })
    @IsString()
    title: string;
}

export class UpdateMissionDto {
    @ApiPropertyOptional({ example: 'Updated task title' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ enum: MissionStatus, example: MissionStatus.DONE })
    @IsEnum(MissionStatus)
    @IsOptional()
    status?: MissionStatus;
}