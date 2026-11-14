import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
} from 'sequelize-typescript';

interface CategoryAttributes {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
}

interface CategoryCreationAttributes {
  id?: number;
  name: string;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
}

@Table({
  tableName: 'categories',
  timestamps: true,
  underscored: true,
})
export class Category extends Model<
  CategoryAttributes,
  CategoryCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(100))
  declare name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare image: string | null;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;
}
