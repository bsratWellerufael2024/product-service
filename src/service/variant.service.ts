import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from 'src/entities/variant.entity';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
  ) {}

  //   async createProductVariant(variantData: {
  //     size: string;
  //     color: string;
  //     price: number;
  //     weight: number;
  //   }) {
  //     const newVariant = this.variantRepository.create({
  //       size: variantData.size,
  //       color: variantData.color,
  //       price: variantData.price,
  //       weight: variantData.weight,
  //     });

  //     return await this.variantRepository.save(newVariant); // ✅ Save to database
  //   }
  async createProductVariant(variantData: Partial<ProductVariant>) {
    // ✅ Accept Partial<ProductVariant>
    const newVariant = this.variantRepository.create(variantData);
    return await this.variantRepository.save(newVariant);
  }
}
