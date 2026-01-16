import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '..', '.env') });

export const config = {
  app: {
    name: process.env.APP_NAME || 'railji-backend',
    port: parseInt(process.env.APP_PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/railji',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    maxFiles: process.env.LOG_MAX_FILES || '14',
  },
};
