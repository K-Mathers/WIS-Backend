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

            return tx.productColorway.findUnique({
                where: { id: newColorway.id },
                include: {
                    product: { select: { name: true, slug: true, gender: true } },
                    skus: { select: { size: true, stock: true } },
                },
            });
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
                select: {
                    id: true,
                    color: true,
                    hexCode: true,
                    price: true,
                    originalPrice: true,
                    images: true,
                    discountPercent: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            slug: true,
                            gender: true,
                            categoryId: true,
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true
                                }
                            }
                        }
                    },

                    skus: {
                        select: {
                            size: true,
                            stock: true
                        }
                    }
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.productColorway.count({ where: whereOptions })
        ]);


        const formattedItems = items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            slug: item.product.slug,
            gender: item.product.gender,
            categoryId: item.product.categoryId,
            category: item.product.category,
            colorway: {
                id: item.id,
                colorName: item.color,
                hexCode: item.hexCode,
                price: item.price,
                originalPrice: item.originalPrice,
                discountPercent: item.discountPercent,
                images: item.images,
                skus: item.skus
            }
        }));

        return {
            data: formattedItems,
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

    async deleteProduct(productId: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } })
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.product.delete({ where: { id: productId } });
    }
}
