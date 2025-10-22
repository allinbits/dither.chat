import { eq } from 'drizzle-orm';
import { assert, describe, it } from 'vitest';

import { getDatabase } from '../drizzle/db';
import { ReaderState } from '../drizzle/schema';
import { post } from './shared';

describe('update state', () => {
  it('should update state', async () => {
    let response = await post<{ status: number; error: string }>(`update-state`, { last_block: '1' });
    assert.isOk(response?.status === 200, 'could not post to update state');

    let [state] = await getDatabase().select().from(ReaderState).where(eq(ReaderState.id, 0)).limit(1);
    assert.isOk(state.last_block === '1');

    response = await post<{ status: number; error: string }>(`update-state`, { last_block: '2' });
    assert.isOk(response?.status === 200, 'could not post to update state');

    [state] = await getDatabase().select().from(ReaderState).where(eq(ReaderState.id, 0)).limit(1);
    assert.isOk(state.last_block === '2');
  });
});
