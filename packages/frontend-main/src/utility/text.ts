import BigNumber from 'bignumber.js';

export function shorten(text: string, start = 8, end = 8) {
    if (text.length <= 20) {
        return text;
    }
    else {
        return text.slice(0, start) + '...' + text.slice(-end);
    }
}

export function formatAmount(amount: string | number | undefined, precision: number) {
    const n = BigNumber(amount ?? 0).dividedBy(BigNumber(10 ** precision));
    return n.toFixed(precision);
}

export function formatCompactNumber(num: number | null) {
    if (!num) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
}
