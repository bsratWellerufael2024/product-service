import { Injectable } from "@nestjs/common";
import { InjectRepository} from "@nestjs/typeorm";
import { Category } from "src/entities/category.entity";
import { Repository } from "typeorm";
import { NotFoundException,BadRequestException } from "@nestjs/common";
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async createCategory(categoryData: {
    category: string;
    description: string;
  }) {
    const newCategory = this.categoryRepository.create({
      category: categoryData.category,
      description: categoryData.description,
    });
    return await this.categoryRepository.save(newCategory);
  }

  async getAllCategories() {
    const categories = await this.categoryRepository.find();

    return categories.map((category) => ({
      id: category.id,
      category: category.category,
      description: category.description,
    }));
  }

  async updateCategory(
    categoryId: number,
    updateData: Partial<{ category?: string; description?: string }>,
  ): Promise<{ message: string }> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    if (updateData.category !== undefined) {
      if (!updateData.category.trim()) {
        throw new BadRequestException('Category name cannot be empty');
      }
      category.category = updateData.category;
    }

    if (updateData.description !== undefined) {
      category.description = updateData.description;
    }

    await this.categoryRepository.save(category);

    return {
      message: `Category with ID ${categoryId} updated successfully.`,
    };
  }

  // async updateCategory(
  //   categoryId: number,
  //   name: string,
  // ): Promise<{ message: string }> {
  //   const category = await this.categoryRepository.findOne({
  //     where: { id: categoryId },
  //   });

  //   if (!category) {
  //     throw new NotFoundException(`Category with ID ${categoryId} not found`);
  //   }

  //   if (!name) {
  //     throw new BadRequestException('Category name cannot be empty');
  //   }

  //   category.category = name;
  //   await this.categoryRepository.save(category);

  //   return {
  //     message: `Category with ID ${categoryId} updated successfully to '${name}'`,
  //   };
  // }

  async deleteCategory(categoryId: number): Promise<{ message: string }> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    try {
      await this.categoryRepository.remove(category);
      return { message: `Category ${categoryId} deleted successfully` };
    } catch (error) {
      throw new BadRequestException(
        `Error deleting category: ${error.message}`,
      );
    }
  }
}