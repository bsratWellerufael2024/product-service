import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Category } from 'src/entities/category.entity';
import { Products } from 'src/entities/product.entity';
import { In, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from 'src/dto/update-product.dto';

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
    @Inject('REDIS_CLIENT') private readonly redisClient: ClientProxy,
  ) {}

  async createProduct(productData: {
    name: string;
    specification: string;
    openingQty: number;
    cost_price: number;
    selling_price: number;
    category?: string;
    baseUnit: string;
  }): Promise<ApiResponse<any>> {
    try {
      if (!productData.name || !productData.baseUnit) {
        throw new RpcException(
          JSON.stringify({
            success: false,
            message: 'Missing required fields: name or baseUnit',
            error: 'ValidationError',
          }),
        );
      }

      let category = null;
      if (productData.category) {
        category = await this.categoryRepository.findOne({
          where: { category: productData.category },
        });

        if (!category) {
          throw new Error(`Category '${productData.category}' not found`);
        }
      }

      const newProduct = this.productRepository.create({
        productName: productData.name,
        specification: productData.specification,
        openingQty: productData.openingQty,
        baseUnit: productData.baseUnit,
        cost_price: productData.cost_price,
        selling_price: productData.selling_price,
        category: category || null,
      });

      const savedProduct = await this.productRepository.save(newProduct);

      const eventPayload = {
        productId: savedProduct.productId,
        productName: savedProduct.productName,
        openingQty: savedProduct.openingQty,
      };

      console.log(
        '[ProductService] Emitting event: product.created with payload:',
        eventPayload,
      );
      
      this.redisClient.emit('product.created', eventPayload);

      return new ApiResponse(true, 'Product created successfully!');
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
      select: ['productId', 'productName'],
    });

    if (!product) {
      throw new NotFoundException(
        `Product with name "${productName}" not found`,
      );
    }

    console.log(' Deleting product:', product.productId);

    this.redisClient
      .emit('product.deleted', { productId: product.productId })
      .subscribe({
        next: () =>
          console.log(
            ` Event emitted: product.deleted for ID ${product.productId}`,
          ),
        error: (err) =>
          console.error(' Error emitting product.deleted event:', err),
      });

    await this.productRepository.remove(product);

    return {
      message: `Product "${productName}" has been deleted successfully`,
    };
  }

  async updateProduct(
    productId: number,
    updateData: UpdateProductDto,
  ): Promise<ApiResponse<any>> {
    const product = await this.productRepository.findOne({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException(
        new ApiResponse(false, `Product with ID ${productId} not found`, null),
      );
    }

    Object.assign(product, updateData);
    const updatedProduct = await this.productRepository.save(product);

    // Emitting event with consistent payload structure
    const eventPayload = {
      productId: updatedProduct.productId,
      productName: updatedProduct.productName,
      openingQty: updatedProduct.openingQty,
    };

    console.log(
      '[ProductService] Emitting event: product.updated with payload:',
      eventPayload,
    );

    // Emit the event without wrapping in `data`
    this.redisClient.emit('product.updated', eventPayload);

    return new ApiResponse(
      true,
      `Product ID ${productId} updated successfully`,
      updatedProduct,
    );
  }

  async getProductsDetail(productIds: number[]) {
    if (!productIds.length) return [];
    const products = await this.productRepository.find({
      where: { productId: In(productIds) },
    });
    console.log(' Found products:', products);
    return products;
  }
}
