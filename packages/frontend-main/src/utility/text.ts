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
