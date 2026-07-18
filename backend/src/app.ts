import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import prisma from './lib/prisma';

const app = express();

// Trust reverse proxy (Nginx) headers for rate limiter
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use(generalLimiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Modules Routing
import authRoutes from './modules/auth/routes';
import bandwidthProfilesRoutes from './modules/bandwidth-profiles';
import plansRoutes from './modules/plans';
import vouchersRoutes from './modules/vouchers';
import hotspotRoutes from './modules/hotspot';
import logsRoutes from './modules/logs';
import settingsRoutes from './modules/settings';
import routerRoutes from './modules/router';
import dashboardRoutes from './modules/dashboard';
import { activate as activateVoucher } from './modules/vouchers/controller';

app.post('/api/v1/activate', activateVoucher); // Public endpoint

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bandwidth-profiles', bandwidthProfilesRoutes);
app.use('/api/v1/plans', plansRoutes);
app.use('/api/v1/vouchers', vouchersRoutes);
app.use('/api/v1/hotspot', hotspotRoutes);
app.use('/api/v1/logs', logsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/router', routerRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Health Check API
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'System is healthy',
    data: {
      api: 'online',
      database: 'connected_placeholder',
      router: 'offline_placeholder',
      version: '1.0.0',
      serverTime: new Date().toISOString()
    }
  });
});

// Root/API v1 welcome route
app.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to DeRoyal Hotspot OS API v1',
    data: {}
  });
});

// Centralized 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.url}`
  });
});

// Centralized Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  
  const statusCode = err.statusCode || 500;
  
  // Auto-log server errors to DB activity log
  if (statusCode === 500) {
    prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'VPS Server Error',
        module: 'SYSTEM',
        description: `Server Error: ${err.message || 'Internal server error'}. Stack: ${err.stack || 'No stack trace'}`,
        ipAddress: req.ip || null
      }
    }).catch(e => console.error('Failed to log unhandled VPS exception to DB:', e));
  }

  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

export default app;
