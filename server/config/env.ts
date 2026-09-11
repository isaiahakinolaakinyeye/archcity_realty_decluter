import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt((process.env.PORT || '5000').trim(), 10),
  jwtSecret: (process.env.JWT_SECRET || 'super-secret-declutter-key-2026').trim(),
  db: {
    host: (process.env.DB_HOST || process.env.PGHOST || 'localhost').trim(),
    port: parseInt((process.env.DB_PORT || process.env.PGPORT || '5432').trim(), 10),
    user: (process.env.DB_USER || process.env.PGUSER || 'postgres').trim(),
    password: (process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres').trim(),
    database: (process.env.DB_NAME || process.env.PGDATABASE || 'declutter_db').trim(),
  },
  isProduction: (process.env.NODE_ENV || '').trim() === 'production',
  cloudinary: {
    cloudName: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    apiKey: (process.env.CLOUDINARY_API_KEY || '').trim(),
    apiSecret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  },
};

