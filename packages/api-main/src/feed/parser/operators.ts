export const ALLOWED_OPERATORS = ['$eq', '$in', '$nin', '$search', '$gte', '$lte', '$gt', '$lt'] as const;

export type Operator = typeof ALLOWED_OPERATORS[number];

export function isOperator(key: string): key is Operator {
  return ALLOWED_OPERATORS.includes(key as Operator);
}
