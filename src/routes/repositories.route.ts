import { Router, Request, Response, NextFunction } from 'express';
import { GitHubService } from '../services/github.service';
import { calculateScore } from '../services/scoring.service';
import { parseDate, parseNumber, ValidationError } from '../utils/validation';
import { logger } from '../utils/logger';

// GitHub Search API hard limit: only first 1000 results are accessible
const MAX_GITHUB_RESULTS = 1000;

/**
 * Creates the repositories search router.
 * Dependencies are injected to keep the route testable and decoupled.
 */
export function createRepositoriesRouter(githubService: GitHubService) {
  const router = Router();

  /**
   * GET /repositories
   * Searches GitHub repositories, applies scoring, and returns ranked results.
   */
  router.get('/repositories', async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now(); // ⏱ start timing
    try {
      logger.info(`Received request: ${req.method} ${req.originalUrl}`);
      // Extract and normalize query parameters using validation utils
      const language = req.query.language as string | undefined;
      let createdAfter: Date | undefined;
      try {
        createdAfter = parseDate(req.query.createdAfter as string | undefined);
      } catch (err) {
        return next(err);
      }

      let page: number;
      let perPage: number;
      try {
        page = parseNumber(req.query.page, 1, { min: 1 });
        perPage = parseNumber(req.query.perPage, 30, { min: 1, max: 100 });
      } catch (err) {
        return next(err);
      }

      const sort = req.query.sort as string | undefined;
      const order = req.query.order as 'asc' | 'desc' | undefined;

      // Enforce GitHub Search API pagination limits
      const offset = (page - 1) * perPage;
      if (offset >= MAX_GITHUB_RESULTS) {
        return next(
          new ValidationError(
            'GitHub Search API only allows access to the first 1000 results. Please reduce page or perPage.'
          )
        );
      }
      logger.info(
        `Fetching repositories with language=${language}, createdAfter=${createdAfter}, page=${page}, perPage=${perPage}, sort=${sort}, order=${order}`
      );

      // Fetch repositories from GitHub
      const result = await githubService.searchRepositories({
        language,
        createdAfter,
        page,
        perPage,
        sort,
        order,
      });

      // Apply scoring algorithm to each repository
      // TODO: Include scoring breakdown per signal in the API response for better transparency
      const scored = result.items.map((repo) => {
        const score = calculateScore({
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: new Date(repo.updated_at),
        });

        return {
          name: repo.name,
          fullName: repo.full_name,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: repo.updated_at,
          score,
          html_url: repo.html_url,
        };
      });

      // Sort results by computed score (descending)
      scored.sort((a, b) => b.score - a.score);

      logger.info(`Returning ${scored.length} repositories (page=${page}, perPage=${perPage})`);

      // Return paginated response
      res.json({
        meta: {
          total: result.total_count,
          page,
          perPage,
        },
        data: scored,
      });
      logger.info(
        `Request completed in ${Date.now() - startTime}ms (returned ${scored.length} repos)`
      );
    } catch (err) {
      next(err);
    }
  });

  return router;
}
