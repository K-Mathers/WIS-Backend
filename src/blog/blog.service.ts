import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleCategory, ArticleStatus } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(userId: string, dto: CreateArticleDto) {
    let slug = this.generateSlug(dto.title);
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    return this.prisma.article.create({
      data: {
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        coverImage: dto.coverImage,
        images: dto.images || [],
        slug,
        authorId: userId,
        status: ArticleStatus.PENDING,
        category: dto.category || ArticleCategory.USERS_ARTICLES,
        tags: [],
      },
    });
  }

  async findAllPublic(userId: string) {}
  async getOneBySlug() {}
  async moderate() {}
}
