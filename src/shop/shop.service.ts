import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShopService {
    constructor(private prisma: PrismaService) { }

    async createProduct(dto: CreateProductDto) {
        const { colorway, ...productData } = dto;
        const slug = productData.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        const existing = await this.prisma.product.findUnique({ where: { slug } });
        if (existing) throw new BadRequestException('Product already exists');

        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    ...productData,
                    slug,
                },
            });

            const newColorway = await tx.productColorway.create({
                data: {
                    productId: product.id,
                    color: colorway.colorName,
                    hexCode: colorway.hexCode,
                    price: colorway.price,
                    originalPrice: colorway.originalPrice,
                    images: colorway.images,
                },
            });

            await tx.productSku.createMany({
                data: colorway.skus.map((sku) => ({
                    colorwayId: newColorway.id,
                    size: sku.size,
                    stock: sku.stock,
                })),
            });

            return product;
        });
    }

    async getCatalog(query: ProductQueryDto) {
        const { q, gender, minPrice, maxPrice, colors, sizes, onSale, sortBy, page = 1, limit = 20 } = query;

        const whereOptions: Prisma.ProductColorwayWhereInput = {};

        if (q) {
            whereOptions.product = { name: { contains: q, mode: 'insensitive' } };
        }

        if (gender) {
            whereOptions.product = {
                ...(whereOptions.product as any || {}),
                gender
            };
        }

        if (minPrice || maxPrice) {
            whereOptions.price = {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice }),
            };
        }

        if (onSale) {
            whereOptions.discountPercent = { gt: 0 };
        }

        if (colors && colors.length > 0) {
            whereOptions.color = { in: colors };
        }

        if (sizes && sizes.length > 0) {
            whereOptions.skus = { some: { size: { in: sizes }, stock: { gt: 0 } } };
        }

        let orderBy: Prisma.ProductColorwayOrderByWithRelationInput = { product: { createdAt: 'desc' } };
        if (sortBy === 'price_asc') orderBy = { price: 'asc' };
        if (sortBy === 'price_desc') orderBy = { price: 'desc' };

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.productColorway.findMany({
                where: whereOptions,
                include: {
                    product: { select: { name: true, slug: true, gender: true } },
                    skus: { select: { size: true, stock: true } }
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.productColorway.count({ where: whereOptions })
        ]);

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async getProductBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                colorways: {
                    include: { skus: true }
                },
                reviews: true,
            }
        });

        if (!product) throw new NotFoundException('Product not found');
        return product;
    }
}
