import type { DisplayableAuthor, DisplayableUser } from '@/types';

import { Decimal } from '@cosmjs/math';

export function shorten(text: string, start = 8, end = 8) {
  if (text.length <= 20) {
    return text;
  } else {
    return `${text.slice(0, start)}...${text.slice(-end)}`;
  }
}

export function formatCompactNumber(num: number | null) {
  if (!num)
    return '0';
  if (num < 1)
    return '<1';
  if (num > 1 && Math.round(num) < 1e3)
    return num.toFixed(1).replace(/\.0$/, '');
  if (Math.round(num) >= 1e9)
    return `${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  if (Math.round(num) >= 1e6)
    return `${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (Math.round(num) >= 1e3)
    return `${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toString();
}

export function formatCompactAtomics(amountAtomics: string | bigint | null, fractionalDigits: number) {
  if (!amountAtomics)
    return '0';
  return formatCompactNumber(Decimal.fromAtomics(amountAtomics.toString(), fractionalDigits).toFloatApproximation());
}

export function displayAuthor(item: DisplayableAuthor): string {
  const handle = item.author_handle ? `@${item.author_handle}` : undefined;
  return item.author_display || handle || item.author;
}

export function displayUser(item: DisplayableUser): string {
  const handle = item.handle ? `@${item.handle}` : undefined;
  return item.display || handle || item.address;
}
