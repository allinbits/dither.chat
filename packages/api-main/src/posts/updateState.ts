import { getDatabase } from '../../drizzle/db';
import { ReaderState } from '../../drizzle/schema';
import { isReaderAuthorizationValid } from '../utility';

export async function UpdateState(body: { last_block: string }, headers: Record<string, string | undefined>) {
  if (!isReaderAuthorizationValid(headers)) {
    return { status: 401, error: 'Unauthorized to make write request' };
  }

  try {
    await getDatabase()
      .insert(ReaderState)
      .values({ id: 0, last_block: body.last_block })
      .onConflictDoUpdate({
        target: ReaderState.id,
        set: {
          last_block: body.last_block,
        },
      })
      .execute();

    console.info(`Last Block Updated: ${body.last_block}`);
    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 500, error: 'failed to write to database' };
  }
}
