

export interface GitHubRepository {
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepository[];
}

/**
 * Service to interact with GitHub API
 * Ref: https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-repositories
 * 
*/
export class GitHubService {
  private readonly baseUrl = 'https://api.github.com/search/repositories';

  constructor(private readonly token?: string) {}

  async searchRepositories(params: {
    language?: string;
    createdAfter?: Date;
    page?: number;
    perPage?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<GitHubSearchResponse> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 30;
    const queryParts: string[] = [];
    const sort = params.sort ?? 'stars';
    const order = params.order ?? 'desc';

    if (params.language) {
      queryParts.push(`language:${params.language}`);
    }

    if (params.createdAfter) {
      queryParts.push(`created:>=${params.createdAfter.toISOString().split('T')[0]}`);
    }

    const query = queryParts.join(' ');

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

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as GitHubSearchResponse;
  }
}
