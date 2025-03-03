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
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createProduct(productData: {
    name: string;
    specification: string;
    openingQty: number;
    cost_price: number;
    selling_price: number;
    category: string;
    baseUnit: string;
  }) {
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
    return await this.productRepository.save(newProduct);
  }

  async getAllProduct() {
    const products = await this.productRepository.find({
      relations: ['category', 'unitConversion'],
    });
    return products.map((product) => ({
      productName: product.productName,
      specification: product.specification,
      baseUnit: product.baseUnit,
      containerUnit: product.unitConversion
        ? product.unitConversion.containerUnit
        : 'carton',
      category: product.category ? product.category.category : 'Unknown',
      openingQty: product.openingQty,
    }));
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

    // Apply Partial Update
    Object.assign(product, updateData);

    // Save Updated Product
    await this.productRepository.save(product);

    // Emit Event to Notify Other Microservices
    this.eventEmitter.emit(
      'product.updated',
      new ProductUpdatedEvent(productId, updateData),
    );

    return { message: `Product ID ${productId} updated successfully` };
  }
}
