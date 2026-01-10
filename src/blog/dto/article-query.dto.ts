import { ArticleCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ArticleQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ArticleCategory)
  category?: ArticleCategory;

  @IsOptional()
  @IsString()
  page?: string;
}
