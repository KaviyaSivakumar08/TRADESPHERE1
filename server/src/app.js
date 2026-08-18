import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import './middleware/errors.js';

import authRoutes from './routes/authRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import {
  notFound,
  errorHandler,
} from './middleware/errors.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.CLIENT_URL?.split(',') ||
      'http://localhost:5173',
  })
);

app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Strict limit only when deployed.
  limit: process.env.NODE_ENV === 'production' ? 300 : 10000,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: 'Too many requests. Please try again later.',
  },
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;