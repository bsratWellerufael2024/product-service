import { Injectable } from "@nestjs/common";
import { InjectRepository} from "@nestjs/typeorm";
import { Category } from "src/entities/category.entity";
import { Repository } from "typeorm";
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async createCategory(categoryData: { name: string; description:string }) {
    const newCategory= this.categoryRepository.create(
        {
            name:categoryData.name,
            description:categoryData.description
        }
    )
     return  await this.categoryRepository.save(newCategory)
  }
}