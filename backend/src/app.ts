import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoute from './routes/health.route';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Routes
app.use('/health', healthRoute);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

export default app;
