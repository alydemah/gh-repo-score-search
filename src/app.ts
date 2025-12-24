import express, { Request, Response, NextFunction } from 'express';
import { GitHubService } from './services/github.service';
import { createRepositoriesRouter } from './routes/repositories.route';
export const app = express();

const githubService = new GitHubService(process.env.GITHUB_TOKEN);

app.use(express.json());

app.use(createRepositoriesRouter(githubService));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({
    error: err.message,
  });
});
