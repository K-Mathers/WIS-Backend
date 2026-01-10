import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ModerationDecision {
    APPROVE = 'APPROVE',
    REJECT = 'REJECT'
}

export class ModerateArticleDto {
    @IsEnum(ModerationDecision)
    decision: ModerationDecision;

    @IsOptional()
    @IsString()
    feedback?: string;
}
