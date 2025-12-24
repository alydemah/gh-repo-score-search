import request from 'supertest';
import { app } from '../app';
import * as githubService from '../services/github.service';

/**
 * Integration tests for the /repositories endpoint.
 *
 * These tests verify the full request lifecycle:
 * - HTTP routing
 * - interaction with GitHubService
 * - application of the scoring algorithm
 *
 * External GitHub API calls are mocked to keep tests
 * fast, deterministic, and independent of network state.
 */
describe('GET /repositories (integration)', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('returns scored repositories', async () => {
    /**
     * Mock GitHubService to isolate the integration test
     * from external API calls.
     *
     * This allows us to focus on:
     * - request handling
     * - response structure
     * - scoring logic
     */
    jest.spyOn(githubService.GitHubService.prototype, 'searchRepositories').mockResolvedValue({
      total_count: 1,
      items: [
        {
          name: 'test-repo',
          full_name: 'user/test-repo',
          stargazers_count: 100,
          forks_count: 20,
          updated_at: new Date().toISOString(),
          html_url: 'https://github.com/user/test-repo',
        },
      ],
    });

    // Perform an in-memory HTTP request against the Express app
    const res = await request(app)
      .get('/repositories')
      .query({ language: 'typescript' })
      .expect(200);

    // Validate response envelope
    expect(res.body).toHaveProperty('meta');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(1);

    const repo = res.body.data[0];

    // Validate mapped and transformed repository fields
    expect(repo).toMatchObject({
      name: 'test-repo',
      fullName: 'user/test-repo',
      stars: 100,
      forks: 20,
      html_url: 'https://github.com/user/test-repo',
    });

    // Ensure scoring was applied
    expect(typeof repo.score).toBe('number');
  });

  it('returns empty data array when no repositories found', async () => {
    jest.spyOn(githubService.GitHubService.prototype, 'searchRepositories').mockResolvedValue({
      total_count: 0,
      items: [],
    });

    const res = await request(app)
      .get('/repositories')
      .query({ language: 'typescript' })
      .expect(200);

    expect(res.body).toHaveProperty('meta');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 400 for invalid date format', async () => {
    const res = await request(app)
      .get('/repositories')
      .query({ createdAfter: 'not-a-date' })
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 if GitHub API fails', async () => {
    jest.spyOn(githubService.GitHubService.prototype, 'searchRepositories').mockImplementation(() => {
      throw new Error('GitHub API error');
    });

    const res = await request(app)
      .get('/repositories')
      .expect(500);
    expect(res.body).toHaveProperty('error');
  });
});
