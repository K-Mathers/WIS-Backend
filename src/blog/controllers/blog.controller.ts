import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { BlogService } from '../blog.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateArticleDto } from '../dto/create-article.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CreateReactionDto } from '../dto/create-reaction.dto';

@ApiTags('blog')
@Controller('blog')
@UseGuards(JwtAuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully created.' })
  createArticle(@Body() dto: CreateArticleDto, @Req() req) {
    return this.blogService.create(req.user.id, dto);
  }

  @Get('my-articles')
  @ApiOperation({ summary: 'Get current user articles' })
  getMyArticles(@Req() req) {
    return this.blogService.getMyArticles(req.user.id);
  }

  @Post('comments')
  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({ status: 201, description: 'Comment created.' })
  @ApiBody({ type: CreateCommentDto })
  createComment(@Req() req, @Body() dto: CreateCommentDto) {
    return this.blogService.createComment(req.user.id, dto);
  }

  @Post(':id/reaction')
  @ApiOperation({ summary: 'React to a comment (like/dislike)' })
  @ApiBody({ type: CreateReactionDto })
  reactToArticle(@Req() req, @Param('id') commentId, @Body() dto: CreateReactionDto) {
    return this.blogService.reactToComment(req.user.id, commentId, dto.type);
  }

  @Get('articles/:id/comments')
  @ApiOperation({ summary: 'Get comments for an article' })
  getArticleComments(@Param('id') articleId: string, @Req() req) {
    return this.blogService.getArticleComments(articleId, req.user.id);
  }

  @Get('my-comments')
  @ApiOperation({ summary: 'Get comments of the current user' })
  getMyComments(@Req() req) {
    return this.blogService.getMyComments(req.user.id);
  }
}
