import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CategoryService } from "src/service/category.service";
@Controller()
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @MessagePattern('category-created')
  createProduct(categoryData: any) {
    return this.categoryService.createCategory(categoryData);
  }
}