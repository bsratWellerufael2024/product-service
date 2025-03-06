import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterProductsDto } from 'src/dto/filter-products.dto';
import { Category } from 'src/entities/category.entity';
import { Products } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from 'src/dto/update-product.dto';
import { ProductUpdatedEvent } from 'src/events/product-updated.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiResponse } from 'src/common/api-response.dto';
import { RpcException } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private eventEmitter: EventEmitter2,
    @Inject('REDIS_CLIENT') private readonly redisClient: ClientProxy, // Ensure this is properly injected
  ) {}

  async createProduct(productData: {
    name: string;
    specification: string;
    openingQty: number;
    cost_price: number;
    selling_price: number;
    category: string;
    baseUnit: string;
  }): Promise<ApiResponse<any>> {
    try {
      if (
        !productData.name ||
        !productData.category ||
        !productData.baseUnit ||
        !productData.category
      ) {
        throw new RpcException(
          JSON.stringify({
            success: false,
            message:
              'Missing required fields: name, category, or baseUnit,category',
            error: 'ValidationError',
          }),
        );
      }

      const category = await this.categoryRepository.findOne({
        where: { category: productData.category },
      });

      if (!category) {
        throw new Error(`Category '${productData.category}' not found`);
      }

      const newProduct = this.productRepository.create({
        productName: productData.name,
        specification: productData.specification,
        openingQty: productData.openingQty,
        baseUnit: productData.baseUnit,
        cost_price: productData.cost_price,
        selling_price: productData.selling_price,
        category: category,
      });
      const savedProduct = await this.productRepository.save(newProduct);
      const eventPayload = {
        data: {
          productId: savedProduct.productId,
          name: savedProduct.productName,
          openingQty: savedProduct.openingQty,
        },
      };
      console.log('📢 Emitting product-created event:', eventPayload);
      this.redisClient.emit('product.created', eventPayload).subscribe({
        next: () => console.log('✅ Event successfully published to Redis'),
        error: (err) => console.error('❌ Error publishing event:', err),
      });
      return new ApiResponse(true, 'Product created  successfuly!');
    } catch (error) {
      throw new RpcException(
        JSON.stringify({
          success: false,
          message: error.message || 'Failed to create product',
          error: error.name || 'UnknownError',
        }),
      );
    }
  }

  async getAllProduct(): Promise<ApiResponse<any>> {
    try {
      const products = await this.productRepository.find({
        relations: ['category', 'unitConversion'],
      });
      const allProducts = products.map((product) => ({
        productName: product.productName,
        specification: product.specification,
        baseUnit: product.baseUnit,
        containerUnit: product.unitConversion
          ? product.unitConversion.containerUnit
          : 'carton',
        category: product.category ? product.category.category : 'Unknown',
        openingQty: product.openingQty,
      }));
      return new ApiResponse(true, 'Products Fetched Successfuly', allProducts);
    } catch (error) {
      throw new RpcException(
        JSON.stringify({
          success: false,
          message: error.message || 'Internal server error',
          error: error.name || 'UnknownError',
        }),
      );
    }
  }

  async findFiltered(filterDto: FilterProductsDto) {
    const {
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'productName',
      order = 'ASC',
    } = filterDto;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (category) {
      query.andWhere('category.category = :category', { category });
    }

    if (minPrice) {
      query.andWhere('product.cost_price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      query.andWhere('product.selling_price <= :maxPrice', { maxPrice });
    }
    const validSortFields = [
      'productName',
      'cost_price',
      'selling_price',
      'category',
    ];
    if (validSortFields.includes(sortBy)) {
      query.orderBy(`product.${sortBy}`, order as 'ASC' | 'DESC');
    } else {
      query.orderBy('product.productName', 'ASC');
    }
    query.skip((page - 1) * limit).take(limit);

    return query.getMany();
  }
  async getProductById(productId: number) {
    const product = await this.productRepository.findOne({
      where: { productId },
      relations: ['category', 'variants'],
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    return {
      productName: product.productName,
      specification: product.specification,
      baseUnit: product.baseUnit,
      openingQty: product.openingQty,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      type: product.type,
      category: product.category?.category ?? 'Unknown',
      createdAt: product.createdAt,
      variants: product.variants.map((variant) => ({
        variantId: variant.id,
        color: variant.color,
        additionalPrice: variant.price,
      })),
    };
  }
  async deleteProductByName(productName: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { productName },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with name "${productName}" not found`,
      );
    }

    await this.productRepository.remove(product);
    return {
      message: `Product "${productName}" has been deleted successfully`,
    };
  }

  async updateProduct(
    productId: number,
    updateData: UpdateProductDto,
  ): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    Object.assign(product, updateData);

    await this.productRepository.save(product);

    this.eventEmitter.emit(
      'product.updated',
      new ProductUpdatedEvent(productId, updateData),
    );

    return { message: `Product ID ${productId} updated successfully` };
  }

  async getProductsByIds(productIds: number[]) {
    return this.productRepository.findByIds(productIds);
  }
}
