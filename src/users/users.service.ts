import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,

    private readonly jwtService: JwtService,
  ) {}

  // CREATE: Register a new user
  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.trim().toLowerCase();

    const existingUser = await this.userModel.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.userModel.create({
      firstName: createUserDto.firstName.trim(),
      lastName: createUserDto.lastName.trim(),
      email,
      passwordHash,
      phone: createUserDto.phone,
      role: createUserDto.role ?? 'student',
      isActive: true,
    });

    return this.toPublicUser(user);
  }

  // LOGIN: Authenticate user and generate JWT
  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userModel.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account is inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  // READ: Get all users
  async findAll() {
    const users = await this.userModel.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
    });

    return users;
  }

  // READ: Get one user by ID
  async findOne(id: number) {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // UPDATE: Update an existing user
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updates: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      passwordHash?: string;
    } = {};

    if (updateUserDto.firstName !== undefined) {
      updates.firstName = updateUserDto.firstName.trim();
    }

    if (updateUserDto.lastName !== undefined) {
      updates.lastName = updateUserDto.lastName.trim();
    }

    if (updateUserDto.email !== undefined) {
      const email = updateUserDto.email.trim().toLowerCase();

      const existingUser = await this.userModel.findOne({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already registered');
      }

      updates.email = email;
    }

    if (updateUserDto.phone !== undefined) {
      updates.phone = updateUserDto.phone;
    }

    if (updateUserDto.password !== undefined) {
      updates.passwordHash = await bcrypt.hash(updateUserDto.password, 12);
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    await user.update(updates);

    return this.toPublicUser(user);
  }

  // DELETE: Delete a user permanently
  async remove(id: number) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await user.destroy();

    return {
      message: 'User deleted successfully',
      id,
    };
  }

  // Return public user information only
  private toPublicUser(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
