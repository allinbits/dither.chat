import { and, eq, gt, lt, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { rateLimits } from '../../drizzle/schema';

const TIME_BETWEEN_CLEANUP_MS = 1_000;
const MAX_REQUEST_TIME_MS = 60_000; // 60 seconds
const MAX_REQUESTS = 10;

// This interval periodically cleans up old records from the database.
// It's a critical background process to prevent the table from growing indefinitely.
let cleanupInterval: NodeJS.Timeout | null = null;
let isCleaningUp = false;

async function cleanup() {
    if (isCleaningUp) {
        return;
    }

    isCleaningUp = true;
    try {
        const now = Date.now();
        // Delete records older than the MAX_REQUEST_TIME_MS
        const result = await getDatabase()
            .delete(rateLimits)
            .where(
                lt(rateLimits.lastRequest, now - MAX_REQUEST_TIME_MS),
            )
            .execute();

        // 📝 You might need to adjust this depending on your database adapter's result object.
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Cleaned Up Requests | Count: ${result.rowCount}`);
        }
    }
    catch (err) {
        console.error('Error during database cleanup:', err);
    }
    finally {
        isCleaningUp = false;
    }
}

export function useRateLimiter() {
    if (!cleanupInterval) {
        cleanupInterval = setInterval(cleanup, TIME_BETWEEN_CLEANUP_MS);
        // Ensure the process doesn't hang on this interval
        if (cleanupInterval.unref) {
            cleanupInterval.unref();
        }
    }

    /**
     * Updates the request count for a given IP address.
     * @param ip The IP address of the user.
     */
    async function update(ip: string) {
        const now = Date.now();

        // Use a transaction to ensure atomicity
        await getDatabase().transaction(async (tx) => {
            const existingRecord = await tx
                .select()
                .from(rateLimits)
                .where(eq(rateLimits.ip, ip))
                .limit(1)
                .execute();

            if (existingRecord.length > 0) {
                // If a record exists, update it.
                await tx
                    .update(rateLimits)
                    .set({
                        requests: sql`${rateLimits.requests} + 1`,
                        lastRequest: now,
                    })
                    .where(eq(rateLimits.ip, ip))
                    .execute();
            }
            else {
                // If no record exists, insert a new one.
                await tx
                    .insert(rateLimits)
                    .values({
                        ip: ip,
                        requests: 1,
                        lastRequest: now,
                    })
                    .execute();
            }
        });
    }

    /**
     * Checks if a given IP address is limited.
     * @param ip The IP address of the user.
     * @returns True if the IP is limited, otherwise false.
     */
    async function isLimited(ip: string): Promise<boolean> {
        const now = Date.now();
        const record = await getDatabase()
            .select()
            .from(rateLimits)
            .where(
                and(
                    eq(rateLimits.ip, ip),
                    gt(rateLimits.lastRequest, now - MAX_REQUEST_TIME_MS),
                ),
            )
            .limit(1)
            .execute();

        if (record.length === 0) {
            // No record, so it's not limited
            return false;
        }

        const { requests } = record[0];
        return requests >= MAX_REQUESTS;
    }

    return {
        update,
        isLimited,
    };
}
