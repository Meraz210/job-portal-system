import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const databaseUrl = process.env.DATABASE_URL;

const baseOptions: Omit<DataSourceOptions, 'type'> = {
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
};

const connectionOptions: DataSourceOptions = databaseUrl
  ? ({
      ...baseOptions,
      type: 'postgres',
      url: databaseUrl,
    } as DataSourceOptions)
  : ({
      ...baseOptions,
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    } as DataSourceOptions);

export const AppDataSource = new DataSource(connectionOptions);
