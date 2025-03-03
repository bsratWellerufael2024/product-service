import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CategoryService } from "src/service/category.service";
import { Payload } from "@nestjs/microservices";
@Controller()
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @MessagePattern('category-created')
  createProduct(categoryData: any) {
    return this.categoryService.createCategory(categoryData);
  }
  @MessagePattern('get_all_categories') // 👈 Listening for this pattern
  async getAllCategories(): Promise<string[]> {
    return this.categoryService.getAllCategories();
  }
  
  @MessagePattern('delete_category') // 👈 Listening for this pattern
  async deleteCategory(
    @Payload() categoryId: number,
  ): Promise<{ message: string }> {
    return this.categoryService.deleteCategory(categoryId);
  }
}