
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';

export class CreateReactionDto {
    @ApiProperty({ enum: ReactionType, description: 'LIKE or DISLIKE' })
    @IsEnum(ReactionType)
    type: ReactionType;
}
