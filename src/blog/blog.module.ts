import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './controllers/blog.controller';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
