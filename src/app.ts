import express, { Request, Response, NextFunction } from 'express';
import { ValidationError } from './utils/validation';
import { GitHubService } from './services/github.service';
import { createRepositoriesRouter } from './routes/repositories.route';
export const app = express();

const githubService = new GitHubService(process.env.GITHUB_TOKEN);

app.use(express.json());

app.use(createRepositoriesRouter(githubService));

// Centralized error handler
// Ensures all thrown errors result in a consistent JSON response
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {

  
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message });
});
