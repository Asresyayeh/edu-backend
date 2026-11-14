import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { User } from '../../users/entities/user.entity';

export type CourseStatus = 'draft' | 'published' | 'archived';

interface CourseAttributes {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string | null;
  tutorId: number;
  categoryId: number | null;
  status: CourseStatus;
}

interface CourseCreationAttributes {
  id?: number;
  title: string;
  description: string;
  price: number;
  thumbnail?: string | null;
  tutorId: number;
  categoryId?: number | null;
  status?: CourseStatus;
}

@Table({
  tableName: 'courses',
  timestamps: true,
  underscored: true,
})
export class Course extends Model<CourseAttributes, CourseCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  declare title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  declare price: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare thumbnail: string | null;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare tutorId: number;

  @BelongsTo(() => User)
  declare tutor: User;

  // Category relationship will be added
  // when we create the Category entity.
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare categoryId: number | null;

  @Default('draft')
  @AllowNull(false)
  @Column({
    type: DataType.ENUM('draft', 'published', 'archived'),
  })
  declare status: CourseStatus;
}
