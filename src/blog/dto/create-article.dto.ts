import { IsString, IsEnum, IsArray, IsOptional, IsUrl, MinLength } from 'class-validator';
import { ArticleCategory } from '@prisma/client';

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  shortDescription: string;

  @IsString()
  @MinLength(50)
  content: string;

  @IsUrl()
  coverImage: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @IsEnum(ArticleCategory)
  @IsOptional()
  category?: ArticleCategory;
}