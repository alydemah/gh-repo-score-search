import { GitHubSearchResponse } from '../types/app.types';
import { logger } from '../utils/logger';


/**
 * Service responsible for querying the GitHub Search API.
 *
 * - Encapsulates request construction and authentication
 * - Applies sensible defaults for pagination and sorting
 * - Throws on non-success responses to allow centralized error handling
 *
 * GitHub API reference:
 * https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-repositories
 */
export class GitHubService {
  private readonly baseUrl = 'https://api.github.com/search/repositories';

  constructor(private readonly token?: string) {}

  /**
   * Searches public GitHub repositories using the Search API.
   *
   * Notes:
   * - Pagination is limited by GitHub to the first 1000 results
   * - Sorting and ordering are delegated to GitHub
   * - Authentication is optional but strongly recommended to avoid rate limits
   */
  async searchRepositories(params: {
    language?: string;
    createdAfter?: Date;
    page?: number;
    perPage?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<GitHubSearchResponse> {
    // Apply defaults to keep API usage predictable
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 30;
    const queryParts: string[] = [];
    const sort = params.sort ?? 'stars';
    const order = params.order ?? 'desc';

    if (params.language) {
      queryParts.push(`language:${params.language}`);
    }

    if (params.createdAfter) {
      // GitHub expects YYYY-MM-DD format
      queryParts.push(`created:>=${params.createdAfter.toISOString().split('T')[0]}`);
    }

    // Fallback ensures GitHub Search API always receives a valid query
    const query = queryParts.join(' ') || 'stars:>0';

    const url = new URL(this.baseUrl);
    url.searchParams.set('q', query || 'stars:>0');
    url.searchParams.set('sort', sort);
    url.searchParams.set('order', order);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(this.token && {
          Authorization: `Bearer ${this.token}`,
        }),
      },
    });

    // Fail fast and surface meaningful errors to the caller
    if (!res.ok) {
     logger.error(`GitHub API error: ${res.status} ${res.statusText}`, { status: res.status });
     throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as GitHubSearchResponse;
  }
}
