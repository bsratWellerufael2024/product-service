import { Controller } from "@nestjs/common";
import { MessagePattern ,EventPattern} from "@nestjs/microservices";
import { ProductService } from "src/service/product.service";
import { FilterProductsDto } from "src/dto/filter-products.dto";
import { Products } from "src/entities/product.entity";
@Controller()
export class ProductController {
  constructor(private productService: ProductService) {}
  @MessagePattern('product-created')
  createProduct(productData: any) {
    return this.productService.createProduct(productData);
  }

  @MessagePattern('get-all-product')
  getAllProduct() {
    return this.productService.getAllProduct();
  }

  @MessagePattern({ cmd: 'get_filtered_products' })
  async handleGetFilteredProducts(filterDto: FilterProductsDto) {
    return this.productService.findFiltered(filterDto);
  }

  @MessagePattern('get-one-product')
  getOneProduct(id: any) {
    return this.productService.getProductById(id);
  }

  @MessagePattern('product-deleted')
  deleteProduct(productName: any) {
    return this.productService.deleteProductByName(productName);
  }

  @EventPattern('product-updated')
  async handleProductUpdate(payload: {
    productId: number;
    updateData: Partial<Products>;
  }) {
    const { productId, updateData } = payload;

    await this.productService.updateProduct(productId, updateData);

    console.log(`✅ ProductService: Product ID ${productId} updated`);
    return { message: `Product ID ${productId} updated successfully` };
  }
  @MessagePattern('get.products.by.ids')
  async getProductsByIds(productIds: number[]) {
    return this.productService.getProductsByIds(productIds);
  }
}