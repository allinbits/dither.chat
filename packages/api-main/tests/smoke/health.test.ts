import { describe, expect, it } from 'vitest';

describe('smoke', () => {
    it('GET /v1/health returns 200', async () => {
        const res = await fetch(`https://${process.env.APP_NAME}.fly.dev/v1/health`);
        const json = await res.json().catch(() => null as any);

        expect(res.ok).toBe(true);
        expect(json).toBeTruthy();
    });
});
