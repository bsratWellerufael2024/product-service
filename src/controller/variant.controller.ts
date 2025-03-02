import { Controller } from "@nestjs/common";
import { ProductVariantService } from "src/service/variant.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class VariantController {
  constructor(private variantService: ProductVariantService) {}
  @MessagePattern('variant-created')
  createProduct(variantData: any) {
    return this.variantService.createProductVariant(variantData);
  }
}