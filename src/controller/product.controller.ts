import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { ProductService } from "src/service/product.service";

@Controller()
export class ProductController {
  constructor(private productService: ProductService) {}
  @MessagePattern('product-created')
  createProduct(productData: any) {
    return this.productService.createProduct(productData);
  }
}