import { Body, Controller, Param, Patch, UseGuards, Get, Post, Delete } from "@nestjs/common";
import { BlogService } from "../blog.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../auth/roles.guard";
import { ModerateArticleDto } from "../dto/moderate-article.dto";

@Controller('admin/blog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogAdminController {
    constructor(private readonly blogService: BlogService) { }

    @Patch(':id/moderate')
    moderate(
        @Param('id') articleId: string,
        @Body() dto: ModerateArticleDto
    ) {
        return this.blogService.moderate(articleId, dto.decision);
    }

    @Get('pending')
    getPendingArticles() {
        return this.blogService.findAllPending();
    }

    @Delete(":id")
    deleteArticle(@Param("id") articleId: string) {
        return this.blogService.deleteArticleById(articleId);
    }
}