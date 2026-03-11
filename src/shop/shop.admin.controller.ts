import { Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CloudinaryProvider } from 'src/ai/providers/cloudinary.provider';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Shop Admin')
@Controller('shop/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShopAdminController {
    constructor(
        private readonly shopService: ShopService,
        private readonly cloudinaryProvider: CloudinaryProvider,
    ) { }

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
}
