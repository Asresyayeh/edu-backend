import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (!databaseUrl) {
          throw new Error('DATABASE_URL is missing from .env');
        }

        const dbUrl = new URL(databaseUrl);

        return {
          dialect: 'postgres',
          host: dbUrl.hostname,
          port: Number(dbUrl.port || 5432),
          username: decodeURIComponent(dbUrl.username),
          password: decodeURIComponent(dbUrl.password),
          database: dbUrl.pathname.replace(/^\//, ''),
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: true,
            },
          },
          autoLoadModels: true,
          synchronize: true,
          logging: false,
        };
      },
    }),

    UsersModule,

    CoursesModule,

    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
