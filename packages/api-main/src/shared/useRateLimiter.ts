export type RateLimit = { [ip: string]: { requests: number; lastRequest: number } };

const TIME_BETWEEN_CLEANUP_MS = 1_000;
const MAX_REQUEST_TIME_MS = 60_000;
const MAX_REQUESTS = 10;
const rateLimits: RateLimit = {};

let interval: NodeJS.Timeout;
let isCleaningUp = false;

function cleanup() {
    if (isCleaningUp) {
        return;
    }

    const keys = Object.keys(rateLimits);
    if (keys.length <= 0) {
        return;
    }

    isCleaningUp = true;

    const now = Date.now();
    for (const key of Object.keys(rateLimits)) {
        if (rateLimits[key].lastRequest + MAX_REQUEST_TIME_MS < now) {
            continue;
        }

        delete rateLimits[key];
    }

    isCleaningUp = false;
}

export function useRateLimiter() {
    if (typeof interval === 'undefined') {
        interval = setInterval(cleanup, TIME_BETWEEN_CLEANUP_MS);
    }

    function update(ip: string) {
        const now = Date.now();

        if (!rateLimits[ip]) {
            rateLimits[ip] = { requests: 0, lastRequest: now };
        }

        rateLimits[ip].lastRequest = Date.now();
        rateLimits[ip].requests += 1;

        console.log(rateLimits);
    }

    function isLimited(ip: string) {
        if (!rateLimits[ip]) {
            return false;
        }

        if (rateLimits[ip].requests >= MAX_REQUESTS) {
            return true;
        }

        return false;
    }

    function remove(ip: string) {
        if (!rateLimits[ip]) {
            return;
        }

        delete rateLimits[ip];
    }

    return {
        update,
        isLimited,
        remove,
    };
}
