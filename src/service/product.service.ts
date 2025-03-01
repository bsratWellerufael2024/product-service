import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Products } from "src/entities/product.entity";
import { Category } from "src/entities/category.entity";
import { UnitCoversion } from "src/entities/unitConversion.entity";
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
     console.log(productData.category_id);
    const newProduct=this.productRepository.create(
        {
            productName:productData.name,
            specification:productData.specification,
            openingQty:productData.openingQty,
            baseUnit:productData.baseUnit,
            cost_price:productData.cost_price,
            selling_price:productData.selling_price,
            categoryId:productData.category_id
        }
    )
   return await this.productRepository.save(newProduct)
  }
}