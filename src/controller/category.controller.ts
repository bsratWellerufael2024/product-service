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
  @MessagePattern('get_all_categories') 
  async getAllCategories(): Promise<string[]> {
    return this.categoryService.getAllCategories();
  }

  @MessagePattern('update_category') 
  async updateCategory(
    @Payload() payload: { categoryId: number; category: string },
  ): Promise<{ message: string }> {
    return this.categoryService.updateCategory(
      payload.categoryId,
      payload.category,
    );
  }

  @MessagePattern('delete_category') 
  async deleteCategory(
    @Payload() categoryId: number,
  ): Promise<{ message: string }> {
    return this.categoryService.deleteCategory(categoryId);
  }
}