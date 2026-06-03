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
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        console.log('[TypeORM] Resolving database connection config...');
        console.log('[TypeORM] DATABASE_URL present:', !!databaseUrl);
        console.log(
          '[TypeORM] DB_HOST:',
          config.get<string>('DB_HOST') ?? '(not set)',
        );
        console.log(
          '[TypeORM] DB_PORT:',
          config.get<string>('DB_PORT') ?? '(not set)',
        );
        console.log(
          '[TypeORM] DB_USERNAME:',
          config.get<string>('DB_USERNAME') ?? '(not set)',
        );
        console.log(
          '[TypeORM] DB_NAME:',
          config.get<string>('DB_NAME') ?? '(not set)',
        );

        if (databaseUrl) {
          console.log('[TypeORM] Using DATABASE_URL for connection.');
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

        const host = config.get<string>('DB_HOST');
        const port = config.get<number>('DB_PORT') ?? 5432;
        const username = config.get<string>('DB_USERNAME');
        const password = config.get<string>('DB_PASSWORD');
        const database = config.get<string>('DB_NAME');

        if (!host || !username || !password || !database) {
          console.error(
            '[TypeORM] Missing required DB_* environment variables. ' +
              'Set DATABASE_URL or all of DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME.',
          );
        }

        console.log(
          `[TypeORM] Using individual DB_* vars — host: ${host}, port: ${port}, db: ${database}`,
        );

        return {
          type: 'postgres',
          host,
          port: Number(port),
          username,
          password,
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
