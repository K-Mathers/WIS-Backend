import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './controllers/blog.controller';
import { BlogPublicController } from './controllers/blog.public.controller';
import { BlogAdminController } from './admin/blog.admin.controller';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';


@Module({
  controllers: [
    BlogController,
    BlogPublicController,
    BlogAdminController,
    AdminController,
  ],
  providers: [BlogService, AdminService],
})
export class BlogModule {}
