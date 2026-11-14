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

export type UserRole = 'student' | 'tutor' | 'parent' | 'admin';

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
}

interface UserCreationAttributes {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  role?: UserRole;
  isActive?: boolean;
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare lastName: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(150))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare passwordHash: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  declare phone: string | null;

  @Default('student')
  @AllowNull(false)
  @Column({
    type: DataType.ENUM('student', 'tutor', 'parent', 'admin'),
  })
  declare role: UserRole;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;
}
