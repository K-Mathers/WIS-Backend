import { Controller, Get, Query, Param, Req } from '@nestjs/common';
import { BlogService } from '../blog.service';
import { ArticleQueryDto } from '../dto/article-query.dto';

@Controller('blog')
export class BlogPublicController {
  constructor(private readonly blogService: BlogService) { }

  @Get()
  getAllBlog(@Query() query: ArticleQueryDto) {
    return this.blogService.findAllPublic(query);
  }

  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.blogService.getOneBySlug(slug);
  }
}
