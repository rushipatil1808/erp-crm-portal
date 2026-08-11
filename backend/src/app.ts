import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { ApiError } from './utils/ApiError';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customers/customer.routes';
import productRoutes from './modules/products/product.routes';
import challanRoutes from './modules/challans/challan.routes';

const app: Application = express();

// CORS - support multiple allowed origins (comma-separated in env)
const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Welcome Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Mini ERP + CRM Operations Portal API',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth/login',
      customers: '/api/v1/customers',
      products: '/api/v1/products',
      challans: '/api/v1/challans',
    },
    documentation: 'See README.md & postman_collection.json for details',
  });
});

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API v1 Router Wiring
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/challans', challanRoutes);

// Catch 404 Handler
app.use((_req: Request, _res: Response) => {
  throw new ApiError(404, 'Route not found');
});

// Centralized Error Middleware
app.use(errorHandler);

export default app;
