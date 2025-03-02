import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Products } from "src/entities/product.entity";
import { Repository } from "typeorm";
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
  ) {}
  async createProduct(productData: {
    name: string;
    specification: string;
    openingQty: number;
    cost_price: number;
    selling_price: number;
    category_id: number;
    baseUnit: string;
  }) {
    const newProduct = this.productRepository.create({
      productName: productData.name,
      specification: productData.specification,
      openingQty: productData.openingQty,
      baseUnit: productData.baseUnit,
      cost_price: productData.cost_price,
      selling_price: productData.selling_price,
      categoryId: productData.category_id,
    });
    return await this.productRepository.save(newProduct);
  }
  async getAllProduct() {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.unitConversion', 'unitConversion')
      .leftJoinAndSelect('product.category', 'category')
      .getMany();
    return products.map((product) => ({
      productName: product.productName,
      specification: product.specification,
      baseUnit: product.baseUnit,
      containerUnit: product.unitConversion
        ? product.unitConversion.containerUnit
        : 'cartonn', // Safe check
      category: product.category ? product.category.name : 'Electronicss', // Safe check
      openingQty: product.openingQty,
    }));
  }

  async getProductById(productId: number) {
    const product = await this.productRepository.findOne({
      where: { productId },
      relations: ['variants'], // Include variants in the query
    });

    // if (!product) {
    //   throw new NotFoundException(`Product with ID ${productId} not found`);
    // }

    return {
      productName: product.productName,
      specification: product.specification,
      baseUnit: product.baseUnit,
      openingQty: product.openingQty,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      type: product.type,
      category: product.category?.name ?? 'Unknown',
      createdAt: product.createdAt,
      variants: product.variants.map((variant) => ({
        variantId: variant.id,
        color: variant.color,
        additionalPrice: variant.price,
      })),
    };
  }
}