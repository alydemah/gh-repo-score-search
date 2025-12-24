import { calculateScore } from '../services/scoring.service';
import { forksSignal, recencySignal, SCORING_SIGNALS, starsSignal } from '../services/scoring/signals';

/**
 * Tests for the composite scoring algorithm.
 * These tests verify relative behavior rather than exact numeric values,
 * ensuring stability even if weights or normalization change slightly.
 */
describe('calculateScore', () => {
  const now = new Date('2025-12-24');

  it('increases score when stars increase', () => {
    const a = calculateScore({ stars: 10, forks: 0, updatedAt: now }, now);
    const b = calculateScore({ stars: 100, forks: 0, updatedAt: now }, now);

    expect(b).toBeGreaterThan(a);
  });

  it('decreases score for old repositories', () => {
    const oldDate = new Date('2020-01-01');

    const recent = calculateScore({ stars: 100, forks: 10, updatedAt: now }, now);
    const old = calculateScore({ stars: 100, forks: 10, updatedAt: oldDate }, now);

    expect(recent).toBeGreaterThan(old);
  });

  it('never exceeds 100', () => {
    const score = calculateScore({ stars: 1_000_000, forks: 500_000, updatedAt: now }, now);

    expect(score).toBeLessThanOrEqual(100);
  });
});


/**
 * Tests for individual scoring signals.
 * Each signal is tested in isolation to guarantee
 */
describe('starsSignal', () => {
  it('increases with stars', () => {
    expect(
      starsSignal.score({ stars: 100, forks: 0, updatedAt: new Date() }, new Date())
    ).toBeGreaterThan(
      starsSignal.score({ stars: 10, forks: 0, updatedAt: new Date() }, new Date())
    );
  });
});

describe('forksSignal', () => {
  it('increases with forks', () => {
    const now = new Date('2025-12-23');

    const low = forksSignal.score({ stars: 0, forks: 5, updatedAt: now }, now);
    const high = forksSignal.score({ stars: 0, forks: 50, updatedAt: now }, now);

    expect(high).toBeGreaterThan(low);
  });
});

describe('recencySignal', () => {
  const now = new Date('2025-12-23');

  it('gives higher score to recent repositories', () => {
    const recent = recencySignal.score(
      { stars: 0, forks: 0, updatedAt: new Date('2025-12-01') },
      now
    );

    const old = recencySignal.score({ stars: 0, forks: 0, updatedAt: new Date('2020-01-01') }, now);

    expect(recent).toBeGreaterThan(old);
  });

  it('approaches zero for very old repositories', () => {
    const veryOld = recencySignal.score(
      { stars: 0, forks: 0, updatedAt: new Date('2000-01-01') },
      now
    );

    expect(veryOld).toBeLessThan(0.1);
  });
});


describe('scoring weights', () => {
  it('sum to 1', () => {
    let total = 0;

    for (const signal of SCORING_SIGNALS) {
      total += signal.weight;
    }

    expect(total).toBeCloseTo(1);
  });
});