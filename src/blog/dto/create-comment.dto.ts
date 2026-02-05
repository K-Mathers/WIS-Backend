
import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ description: 'ID article', example: '1234567890' })
    @IsUUID()
    articleId: string;

    @ApiProperty({ description: 'Content comment', example: 'CRAZY SHOES' })
    @IsString()
    @MinLength(1)
    content: string;
}
