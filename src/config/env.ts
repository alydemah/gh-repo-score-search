import 'dotenv/config';

/**
 * Centralized environment configuration.
 * This file ensures environment variables are loaded once
 * and provides a single place for future validation.
 */

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};
