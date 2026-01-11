import { Body, Controller, Param, Patch, UseGuards, Get, Post, Delete } from "@nestjs/common";
import { BlogService } from "../blog.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../auth/roles.guard";
import { ModerateArticleDto } from "../dto/moderate-article.dto";

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('blog-admin')
@Controller('admin/blog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogAdminController {
    constructor(private readonly blogService: BlogService) { }

    @ApiOperation({ summary: 'Moderate article' })
    @ApiResponse({ status: 200, description: 'Article updated' })
    @Patch(':id/moderate')
    moderate(
        @Param('id') articleId: string,
        @Body() dto: ModerateArticleDto
    ) {
        return this.blogService.moderate(articleId, dto.decision);
    }

    @ApiOperation({ summary: 'Get pending articles' })
    @ApiResponse({ status: 200, description: 'List of pending articles' })
    @Get('pending')
    getPendingArticles() {
        return this.blogService.findAllPending();
    }

    @ApiOperation({ summary: 'Delete article' })
    @ApiResponse({ status: 200, description: 'Article deleted' })
    @Delete(":id")
    deleteArticle(@Param("id") articleId: string) {
        return this.blogService.deleteArticleById(articleId);
    }
}