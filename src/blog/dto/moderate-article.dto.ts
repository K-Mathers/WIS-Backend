import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ModerationDecision {
    APPROVE = 'APPROVE',
    REJECT = 'REJECT'
}

export class ModerateArticleDto {
    @ApiProperty({ enum: ModerationDecision })
    @IsEnum(ModerationDecision)
    decision: ModerationDecision;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    feedback?: string;
}
