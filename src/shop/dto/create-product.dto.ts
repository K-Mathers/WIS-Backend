import { Gender } from "@prisma/client";
import {
    IsBoolean, IsEnum, IsNumber, IsOptional, IsString,
    IsArray, IsNotEmpty, ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class CreateSkuDto {
    @ApiProperty({ description: 'Shoe size, e.g., 39 or US 9' })
    @IsString() @IsNotEmpty()
    size: string;

    @ApiProperty({ description: 'Stock quantity' })
    @IsNumber() @IsNotEmpty()
    stock: number;
}

class CreateColorwayDto {
    @ApiProperty({ description: 'Name of the colorway, e.g., "White/Black"' })
    @IsString() @IsNotEmpty()
    colorName: string;

    @ApiProperty({ description: 'Hex code for the color circle filter, e.g., "#FFFFFF"' })
    @IsString() @IsNotEmpty()
    hexCode: string;

    @ApiProperty({ description: 'Current selling price' })
    @IsNumber() @IsNotEmpty()
    price: number;

    @ApiPropertyOptional({ description: 'Original price crossed out (if discounted)' })
    @IsOptional() @IsNumber()
    originalPrice?: number;

    @ApiProperty({ description: 'Array of Cloudinary string URLs for this colorway' })
    @IsArray() @IsString({ each: true })
    images: string[];

    @ApiProperty({ type: [CreateSkuDto], description: 'Sizes available for this colorway' })
    @ValidateNested({ each: true })
    @Type(() => CreateSkuDto)
    skus: CreateSkuDto[];
}

export class CreateProductDto {
    @ApiProperty({ description: 'Main product name, e.g., "Nike Air Max 90"' })
    @IsString() @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Product description HTML or plain text' })
    @IsString() @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: Gender, description: 'Target gender' })
    @IsEnum(Gender)
    gender: Gender;

    @ApiPropertyOptional({ description: 'Category UUID (if applicable)' })
    @IsOptional() @IsString()
    categoryId?: string;

    @ApiProperty({ type: CreateColorwayDto })
    @ValidateNested()
    @Type(() => CreateColorwayDto)
    colorway: CreateColorwayDto;
}
