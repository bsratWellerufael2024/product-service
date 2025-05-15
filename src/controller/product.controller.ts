import { Controller, UseGuards } from "@nestjs/common";
import { MessagePattern ,EventPattern} from "@nestjs/microservices";
import { ProductService } from "src/service/product.service";
import { Products } from "src/entities/product.entity";
import { Payload } from "@nestjs/microservices";
import { QrCodeService } from "src/service/qr-code.service"; 
 import * as QRCode from 'qrcode';
@Controller()
export class ProductController {
  constructor(
    private productService: ProductService,
    private readonly qrCodeService: QrCodeService,
  ) {}
  @MessagePattern('product-created')
  createProduct(productData: any) {
    return this.productService.createProduct(productData);
  }

  @MessagePattern('get-one-product')
  getOneProduct(id: any) {
    return this.productService.getProductById(id);
  }

  @MessagePattern('product-deleted')
  deleteProduct(productId: any) {
    return this.productService.deleteProductByName(productId);
  }

  @MessagePattern('product-updated') // <-- Use this instead of EventPattern
  async handleProductUpdate(payload: {
    productId: number;
    updateData: Partial<Products>;
  }) {
    const { productId, updateData } = payload;

    await this.productService.updateProduct(productId, updateData);

    console.log(`ProductService: Product ID ${productId} updated`);
    return { message: `Product ID ${productId} updated successfully` };
  }

  @MessagePattern('get_products_by_ids')
  async getProductsByIds(
    @Payload() ids: string[],
  ): Promise<Record<string, string>> {
    return this.productService.getProductNameMapByIds(ids);
  }

  //listning from inventory_summary
  @MessagePattern('get_produts_details')
  async getProductsDetail({ productIds }: { productIds: number[] }) {
    return this.productService.getProductsDetail(productIds);
  }

  @MessagePattern('generate_qr')
  async handleGenerateQr(@Payload() productId: number) {
    const product = await this.productService.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const qrData = `Product: ${product.productName}, Code: ${product.productCode}, Price: ${product.selling_price}`;
    const qrImage = await QRCode.toDataURL(qrData);
    return qrImage; // base64 string
  }
}