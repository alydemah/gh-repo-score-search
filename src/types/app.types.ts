/**
 * Shared application types.
 *
 * This file defines domain-level contracts used across
 * services, scoring logic, and API layers.
 * Keeping these types centralized ensures consistency
 * and prevents tight coupling between modules.
 */

/* ------------------------------------------------------------------
 * Scoring domain
 * ------------------------------------------------------------------ */

/**
 * Input data required to calculate a repository score.
 * This represents the minimal, normalized data extracted
 * from a GitHub repository needed by the scoring engine.
 */
export interface ScoreInput {
  stars: number;
  forks: number;
  updatedAt: Date;
}

/**
 * Represents a single scoring signal.
 *
 * Each signal:
 * - extracts one aspect of repository quality
 * - returns a normalized numeric score
 * - contributes to the final score via its weight
 *
 * Signals are designed to be composable and extensible.
 */
export interface ScoringSignal {
  name: string;
  weight: number;
  score: (input: ScoreInput, now: Date) => number;
}

/* ------------------------------------------------------------------
 * GitHub API domain
 * ------------------------------------------------------------------ */

/**
 * Subset of GitHub repository fields returned by the
 * Search Repositories API that are relevant to this application.
 *
 * Ref: https://docs.github.com/en/rest/search/search#search-repositories
 */
export interface GitHubRepository {
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
}

/**
 * Response shape of GitHub's search repositories endpoint.
 */
export interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepository[];
}
