import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { initStore } from './db/store.js';
import { authRouter } from './routes/auth.js';
import { inventoryRouter } from './routes/inventory.js';
import { categoriesRouter } from './routes/categories.js';
import { salesRouter } from './routes/sales.js';
import { paymentsRouter } from './routes/payments.js';
import { customersRouter } from './routes/customers.js';
import { analyticsRouter } from './routes/analytics.js';
import { uploadRouter } from './routes/upload.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/upload', uploadRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Declutter Business Management System',
    time: new Date().toISOString(),
  });
});

// Start server
async function startServer() {
  try {
    await initStore();
    app.listen(env.port, '0.0.0.0', () => {
      console.log(`🚀 Declutter Business API server running on port ${env.port}`);
    });
  } catch (err: any) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
