import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          console.log('[TypeORM] Using DATABASE_URL for connection');
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }

        const host = configService.get<string>('DB_HOST');
        const port = configService.get<number>('DB_PORT') ?? 5432;
        const username = configService.get<string>('DB_USERNAME');
        const database = configService.get<string>('DB_NAME');

        console.log('[TypeORM] Using individual DB_* variables for connection');
        console.log(`[TypeORM] Host: ${host}`);
        console.log(`[TypeORM] Port: ${port}`);
        console.log(`[TypeORM] Username: ${username}`);
        console.log(`[TypeORM] Database: ${database}`);

        return {
          type: 'postgres',
          host,
          port,
          username,
          password: configService.get<string>('DB_PASSWORD'),
          database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),

    AuthModule,

    UsersModule,

    JobsModule,

    ApplicationsModule,

    AdminModule,

    AiModule,
  ],
})
export class AppModule {}
