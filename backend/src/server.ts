import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import recordsRoutes from './routes/records.routes.js';
import studentsRoutes from './routes/students.routes.js';
import { errorHandler, AppError } from './middleware/error-handler.js';

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/students', studentsRoutes);

// Catch-all 404 Not Found handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, 'NOT_FOUND', `Route '${req.method} ${req.originalUrl}' not found`));
});

// Centralized Express Error Handling Middleware (must be attached last)
app.use(errorHandler);

const PORT = env.PORT;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[AttendanceMatrix Backend] Server running on port ${PORT}`);
    console.log(`[AttendanceMatrix Backend] Environment: ${env.NODE_ENV}`);
    console.log(`[AttendanceMatrix Backend] Supabase URL: ${env.SUPABASE_URL}`);
  });
}

export default app;
