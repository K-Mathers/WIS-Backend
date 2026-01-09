import { Controller, Post, UseGuards, Body, Req } from '@nestjs/common';
import { BlogService } from '../blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}
}
