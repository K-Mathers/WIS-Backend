import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Shop')
@Controller('shop')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
  ) { }

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
