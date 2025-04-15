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
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @MessagePattern('update_category')
  async updateCategory(
    @Payload()
    payload: {
      id: number;
      updateData: Partial<{ category?: string; description?: string }>;
    },
  ) {
    return this.categoryService.updateCategory(payload.id, payload.updateData);
  }

  @MessagePattern('get_category_by_id')
  async getCategoryById(@Payload() categoryId: number) {
    return this.categoryService.getCategoryById(categoryId);
  }

  @MessagePattern('delete_category')
  async deleteCategory(
    @Payload() categoryId: number,
  ): Promise<{ message: string }> {
    return this.categoryService.deleteCategory(categoryId);
  }
}