import { Router, Request, Response, NextFunction } from 'express';
import { GitHubService } from '../services/github.service';

const MAX_GITHUB_RESULTS = 1000;

export function createRepositoriesRouter(githubService: GitHubService) {
  const router = Router();

  router.get('/repositories', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const language = req.query.language as string | undefined;

      const createdAfter = req.query.createdAfter
        ? new Date(req.query.createdAfter as string)
        : undefined;

      const page = req.query.page ? Number(req.query.page) : 1;
      const perPage = req.query.perPage ? Number(req.query.perPage) : 30;

      const sort = req.query.sort as string | undefined;
      const order = req.query.order as 'asc' | 'desc' | undefined;

      const offset = (page - 1) * perPage;

      // GitHub Search API only allows access to the first 1000 results
      if (offset >= MAX_GITHUB_RESULTS) {
        return res.status(400).json({
          error:
            'GitHub Search API only allows access to the first 1000 results. Please reduce page or perPage.',
        });
      }

      const result = await githubService.searchRepositories({
        language,
        createdAfter,
        page,
        perPage,
        sort,
        order,
      });

      res.json({
        meta: {
          total: result.total_count,
          page,
          perPage,
        },
        data: result.items,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
