import { Gender } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsArray } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ProductQueryDto {
    @ApiPropertyOptional({ description: 'Search query, e.g., "air max"' })
    @IsOptional() @IsString()
    q?: string;

    @ApiPropertyOptional({ enum: Gender, description: 'Filter by gender: MALE, FEMALE, UNISEX, KIDS' })
    @IsOptional() @IsEnum(Gender)
    gender?: Gender;

    @ApiPropertyOptional({ description: 'Minimum price' })
    @IsOptional() @IsNumber() @Type(() => Number)
    minPrice?: number;

    @ApiPropertyOptional({ description: 'Maximum price' })
    @IsOptional() @IsNumber() @Type(() => Number)
    maxPrice?: number;

    @ApiPropertyOptional({ description: 'Filter by colors, comma separated, e.g., "Black,White"' })
    @IsOptional() @IsArray() @IsString({ each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
    colors?: string[];

    @ApiPropertyOptional({ description: 'Filter by sizes, comma separated, e.g., "39,40,41"' })
    @IsOptional() @IsArray() @IsString({ each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
    sizes?: string[];

    @ApiPropertyOptional({ description: 'Only show items with a discount' })
    @IsOptional() @IsBoolean() @Transform(({ value }) => value === 'true')
    onSale?: boolean;

    @ApiPropertyOptional({ description: 'Sorting strategy', enum: ['price_asc', 'price_desc', 'newest'] })
    @IsOptional() @IsString()
    sortBy?: 'price_asc' | 'price_desc' | 'newest';

    @ApiPropertyOptional({ description: 'Page number for pagination' })
    @IsOptional() @IsNumber() @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Number of items per page' })
    @IsOptional() @IsNumber() @Type(() => Number)
    limit?: number = 20;
}
