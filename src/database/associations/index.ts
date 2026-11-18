import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Category } from '../../categories/entities/category.entity';

export function initializeAssociations() {
  User.hasMany(Course, {
    foreignKey: 'tutorId',
    as: 'courses',
  });

  Course.belongsTo(User, {
    foreignKey: 'tutorId',
    as: 'tutor',
  });

  Category.hasMany(Course, {
    foreignKey: 'categoryId',
    as: 'courses',
  });

  Course.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
  });
}
