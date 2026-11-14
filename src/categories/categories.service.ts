import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Category } from './entities/category.entity';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private readonly categoryModel: typeof Category,
  ) {}

  // CREATE
  async create(createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name.trim();

    const existingCategory = await this.categoryModel.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = await this.categoryModel.create({
      name,
      description: createCategoryDto.description?.trim() ?? null,
      image: createCategoryDto.image ?? null,
      isActive: true,
    });

    return category;
  }

  // READ ALL
  async findAll() {
    return this.categoryModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  // READ ONE
  async findOne(id: number) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  // UPDATE
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const updates: Partial<{
      name: string;
      description: string;
      image: string;
      isActive: boolean;
    }> = {};

    if (updateCategoryDto.name !== undefined) {
      const name = updateCategoryDto.name.trim();

      const existingCategory = await this.categoryModel.findOne({
        where: { name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category already exists');
      }

      updates.name = name;
    }

    if (updateCategoryDto.description !== undefined) {
      updates.description = updateCategoryDto.description.trim();
    }

    if (updateCategoryDto.image !== undefined) {
      updates.image = updateCategoryDto.image;
    }

    if (updateCategoryDto.isActive !== undefined) {
      updates.isActive = updateCategoryDto.isActive;
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    await category.update(updates);

    return category;
  }

  // DELETE
  async remove(id: number) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await category.destroy();

    return {
      message: 'Category deleted successfully',
      id,
    };
  }
}
