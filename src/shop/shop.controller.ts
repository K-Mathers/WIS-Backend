import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ShopService } from './shop.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CloudinaryProvider } from '../ai/providers/cloudinary.provider';

@ApiTags('Shop')
@Controller('shop')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly cloudinaryProvider: CloudinaryProvider,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new product (Admin Only)' })
  @ApiResponse({
    status: 201,
    description: 'Product and initial colorway successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation Error / Product exists.',
  })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.shopService.createProduct(dto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload images to Cloudinary (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { urls: [] };
    }
    const urls = await Promise.all(
      files.map((file) => this.cloudinaryProvider.uploadFile(file)),
    );
    return { urls };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get product catalog with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of product colorways based on filters.',
  })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.shopService.getCatalog(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get full product details by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Product slug URL (e.g. nike-air-max-90)',
  })
  @ApiResponse({
    status: 200,
    description: 'Full product details including all colorways and sizes.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.shopService.getProductBySlug(slug);
  }
}
