import { ScoringSignal } from '../../types/app.types';

/**
 * Default scoring weights.
 * Keeping them centralized makes tuning and experimentation easier.
 */
export const DEFAULT_SIGNAL_WEIGHTS = {
  stars: 0.55,
  forks: 0.25,
  recency: 0.2,
} as const;

/**
 * Stars signal
 *
 * Measures overall popularity of a repository.
 * Uses logarithmic scaling to avoid domination by extremely popular projects
 * and to ensure diminishing returns as star count grows.
 */
export const starsSignal: ScoringSignal = {
  name: 'stars',
  weight: DEFAULT_SIGNAL_WEIGHTS.stars,
  score(input) {
    // log10 smooths large values while preserving relative order
    return Math.log10(1 + Math.max(0, input.stars));
  },
};

/**
 * Forks signal
 *
 * Measures community engagement and reuse.
 * Forks indicate active interest but are weighted lower than stars
 * since they can be influenced by project structure or tooling.
 */
export const forksSignal: ScoringSignal = {
  name: 'forks',
  weight: DEFAULT_SIGNAL_WEIGHTS.forks,
  score(input) {
    return Math.log10(1 + Math.max(0, input.forks));
  },
};

/**
 * Recency signal
 *
 * Measures how recently a repository was updated.
 * Recent activity is rewarded, while older repositories decay smoothly over time.
 * A 30-day window acts as a soft half-life for freshness.
 */
export const recencySignal: ScoringSignal = {
  name: 'recency',
  weight: DEFAULT_SIGNAL_WEIGHTS.recency,
  score(input, now) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const days = (now.getTime() - input.updatedAt.getTime()) / MS_PER_DAY;

    return 1 / (1 + days / 30);
  },
};


// TODO: Add future signals (e.g., contributors, open issues, etc.) to enhance scoring model 

/**
 * List of active scoring signals.
 *
 * New signals can be added here without modifying the core scoring algorithm.
 */
export const SCORING_SIGNALS: ScoringSignal[] = [
  starsSignal, 
  forksSignal, 
  recencySignal
];
