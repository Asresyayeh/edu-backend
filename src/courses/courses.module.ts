import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Course } from './entities/course.entity';
import { User } from '../users/entities/user.entity';

import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [SequelizeModule.forFeature([Course, User])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
