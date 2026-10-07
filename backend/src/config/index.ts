import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'librixa_super_secret_jwt_key_2026_academic_prod',
  dbPath: process.env.DB_PATH || path.resolve(__dirname, '../../database/librixa.db'),
  nodeEnv: process.env.NODE_ENV || 'development',
};
