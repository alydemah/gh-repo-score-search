import express, { Request, Response, NextFunction } from 'express';
import { ValidationError } from './utils/validation';
import { GitHubService } from './services/github.service';
import { createRepositoriesRouter } from './routes/repositories.route';
import { logger } from "./utils/logger";
export const app = express();

// Initialize shared services (can later be replaced with DI container)
const githubService = new GitHubService(process.env.GITHUB_TOKEN);

// --------------------------------------------------
// Global middleware
// --------------------------------------------------
app.use(express.json());

// Register application routes
app.use(createRepositoriesRouter(githubService));

// --------------------------------------------------
// Centralized error handler
// --------------------------------------------------
// - Logs errors once
// - Maps known errors to correct HTTP status codes
// - Prevents leaking stack traces to clients
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Error handling ${req.method} ${req.originalUrl}: ${err.message}`);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message,
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
  });
});