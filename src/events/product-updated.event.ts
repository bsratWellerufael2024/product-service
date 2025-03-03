import { UpdateProductDto } from "src/dto/update-product.dto";
export class ProductUpdatedEvent {
  constructor(
    public readonly productId: number,
    public readonly updateData: Partial<UpdateProductDto>,
  ) {}
}
