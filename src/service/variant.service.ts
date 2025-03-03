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
  async createProductVariant(variantData: Partial<ProductVariant>) {
    const newVariant = this.variantRepository.create(variantData);
    return await this.variantRepository.save(newVariant);
  }
}
