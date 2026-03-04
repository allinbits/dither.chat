import type { Variable } from '../types';

const ALLOWED_VARIABLES = new Set(['$me', '$following']);

/**
 * Check if a value is a variable reference (starts with $ and is in allowed list)
 */
export function isVariable(value: unknown): value is string {
  return typeof value === 'string' && ALLOWED_VARIABLES.has(value);
}

/**
 * Parse a string value, converting variable references to Variable objects
 */
export function parseVariable(value: string): Variable | string {
  if (!isVariable(value)) {
    return value;
  }

  return {
    type: 'variable',
    name: value as Variable['name'],
  };
}
