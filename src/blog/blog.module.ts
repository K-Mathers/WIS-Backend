import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './controllers/blog.controller';
import { BlogPublicController } from './controllers/blog.public.controller';
import { BlogAdminController } from './admin/blog.admin.controller';

@Module({
  controllers: [BlogController, BlogPublicController, BlogAdminController],
  providers: [BlogService],
})
export class BlogModule {}
