import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Course } from './entities/course.entity';
import { User } from '../users/entities/user.entity';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course)
    private readonly courseModel: typeof Course,

    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  // CREATE: Create a new course
  async create(createCourseDto: CreateCourseDto) {
    // Check whether the tutor exists
    const tutor = await this.userModel.findByPk(createCourseDto.tutorId);

    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }

    // Ensure the user is actually a tutor
    if (tutor.role !== 'tutor') {
      throw new BadRequestException('Only tutors can create courses');
    }

    const course = await this.courseModel.create({
      title: createCourseDto.title.trim(),
      description: createCourseDto.description.trim(),
      price: createCourseDto.price,
      thumbnail: createCourseDto.thumbnail ?? null,
      tutorId: createCourseDto.tutorId,
      categoryId: createCourseDto.categoryId ?? null,
      status: 'draft',
    });

    return course;
  }

  // READ: Get all courses
  async findAll() {
    return this.courseModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  // READ: Get one course by ID
  async findOne(id: number) {
    const course = await this.courseModel.findByPk(id);

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  // UPDATE: Update an existing course
  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseModel.findByPk(id);

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const updates: Partial<{
      title: string;
      description: string;
      price: number;
      thumbnail: string | null;
      categoryId: number | null;
      status: 'draft' | 'published' | 'archived';
    }> = {};

    if (updateCourseDto.title !== undefined) {
      updates.title = updateCourseDto.title.trim();
    }

    if (updateCourseDto.description !== undefined) {
      updates.description = updateCourseDto.description.trim();
    }

    if (updateCourseDto.price !== undefined) {
      updates.price = updateCourseDto.price;
    }

    if (updateCourseDto.thumbnail !== undefined) {
      updates.thumbnail = updateCourseDto.thumbnail;
    }

    if (updateCourseDto.categoryId !== undefined) {
      updates.categoryId = updateCourseDto.categoryId;
    }

    if (updateCourseDto.status !== undefined) {
      updates.status = updateCourseDto.status;
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    await course.update(updates);

    return course;
  }

  // DELETE: Delete an existing course
  async remove(id: number) {
    const course = await this.courseModel.findByPk(id);

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    await course.destroy();

    return {
      message: 'Course deleted successfully',
      id,
    };
  }
}
