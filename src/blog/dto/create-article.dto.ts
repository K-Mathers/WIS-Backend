import { IsString, IsEnum, IsArray, IsOptional, IsUrl, MinLength } from 'class-validator';
import { ArticleCategory } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'My awesome article', description: 'Article title' })
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({ example: 'This is a short description about...' })
  @IsString()
  @MinLength(10)
  shortDescription: string;

  @ApiProperty({ example: '# Header\nContent...', description: 'Markdown or HTML content' })
  @IsString()
  @MinLength(50)
  content: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg' })
  @IsUrl()
  coverImage: string;

  @ApiPropertyOptional({ example: ['https://example.com/img1.jpg'] })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ enum: ArticleCategory, default: ArticleCategory.USERS_ARTICLES })
  @IsEnum(ArticleCategory)
  @IsOptional()
  category?: ArticleCategory;
}