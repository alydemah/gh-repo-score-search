import { ScoreInput } from '../types/app.types';
import { SCORING_SIGNALS } from './scoring/signals';


/**
 * Calculates a normalized repository score (0–100)
 * based on a weighted combination of independent scoring signals.
 *
 * The algorithm is designed to be:
 * - deterministic (same input → same score)
 * - extensible (new signals can be added without changing this function)
 * - explainable (each signal contributes a weighted component)
 */
export function calculateScore(input: ScoreInput, now: Date = new Date()): number {
  /**
   * Raw score is the weighted sum of all signal scores.
   * Each signal is responsible for:
   * - extracting one aspect of repository quality
   * - returning a normalized, comparable value
   */
  let rawScore = 0;

  // Calculate weighted score for each signal
  for (const signal of SCORING_SIGNALS) {
    rawScore += signal.weight * signal.score(input, now);
  }

  /**
   * MAX_RAW_SCORE represents an upper-bound estimate of the
   * combined signal output under extreme conditions.
   *
   * It is used to normalize the raw score into a 0–100 range
   * and to cap outliers caused by unusually large repositories.
   */ const MAX_RAW_SCORE = 6;

  /**
   * Final score:
   * - normalized to a 0–100 scale
   * - capped at 100
   * - rounded to two decimal places for readability
   */
  return Number(Math.min(100, (rawScore / MAX_RAW_SCORE) * 100).toFixed(2));
}
