import { Controller, Post, UseGuards, Body, Req } from '@nestjs/common';
import { BlogService } from '../blog.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateArticleDto } from '../dto/create-article.dto';

@Controller('blog')
@UseGuards(JwtAuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Post('create')
  createArticle(@Body() dto: CreateArticleDto, @Req() req) {
    return this.blogService.create(req.user.id, dto);
  }
}
