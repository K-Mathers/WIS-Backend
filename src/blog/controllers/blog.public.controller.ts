import { Controller, Get, Query, Param, Req } from '@nestjs/common';
import { BlogService } from '../blog.service';
import { ArticleQueryDto } from '../dto/article-query.dto';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('blog')
@Controller('blog')
export class BlogPublicController {
  constructor(private readonly blogService: BlogService) { }

  @ApiOperation({ summary: 'Get all public articles' })
  @ApiResponse({ status: 200, description: 'List of articles with pagination' })
  @Get()
  getAllBlog(@Query() query: ArticleQueryDto) {
    return this.blogService.findAllPublic(query);
  }

  @ApiOperation({ summary: 'Get article by slug' })
  @ApiResponse({ status: 200, description: 'Return article details' })
  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.blogService.getOneBySlug(slug);
  }
}
