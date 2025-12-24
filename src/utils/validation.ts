
/**
 * Custom error class for validation errors.
*/
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}


/**
 * 
 * Validation rules
 * language: optional, string
 * createdAfter: optional, valid ISO date
 * page: optional, ≥ 1
 * perPage: optional, 1–100

*/

export function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError('Invalid date format. Use ISO format.');
  }
  return date;
}

export function parseNumber(
  value: unknown,
  defaultValue: number,
  options?: { min?: number; max?: number }
): number {
  const num = Number(value);
  if (isNaN(num)) return defaultValue;

  if (options?.min !== undefined && num < options.min) {
    throw new ValidationError(`Value must be >= ${options.min}`);
  }

  if (options?.max !== undefined && num > options.max) {
    throw new ValidationError(`Value must be <= ${options.max}`);
  }

  return num;
}
