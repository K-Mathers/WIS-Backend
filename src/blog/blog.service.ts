import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleCategory, ArticleStatus } from '@prisma/client';
import { ArticleQueryDto } from './dto/article-query.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) { }

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

  async findAllPublic(query: ArticleQueryDto) {
    const limit = 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;
    const where: any = {
      status: ArticleStatus.PUBLISHED,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { shortDescription: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          coverImage: true,
          category: true,
          createdAt: true,
          publishedAt: true,
          views: true,
          author: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getOneBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException('Article not found (unpublished)');
    }

    this.prisma.article
      .update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => { });
    const related = await this.prisma.article.findMany({
      where: {
        category: article.category,
        status: ArticleStatus.PUBLISHED,
        id: { not: article.id },
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        createdAt: true,
      },
    });
    return { article, related };
  }

  async moderate(articleId: string, decision: 'APPROVE' | 'REJECT') {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');

    const newData: any = {};

    if (decision === 'APPROVE') {
      newData.status = ArticleStatus.PUBLISHED;
      newData.publishedAt = new Date();
    } else {
      newData.status = ArticleStatus.REJECTED;
      newData.publishedAt = null;
    }

    return this.prisma.article.update({
      where: { id: articleId },
      data: newData,
    });
  }

  async findAllPending() {
    return this.prisma.article.findMany({
      where: { status: ArticleStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, email: true }
        }
      }
    });
  }

  async deleteArticleById(articleId: string) {
    return this.prisma.article.delete({ where: { id: articleId } })
  }

  async getMyArticles(userId: string) {
    return this.prisma.article.findMany({ where: { authorId: userId } })
  }
}
