import type { FeedQuery } from '../../src/feed/types';

import { beforeAll, describe, expect, it } from 'vitest';

import { build } from '../../src/feed/builder';

beforeAll(() => {
  process.env.PG_URI = 'postgres://localhost/test';
});

describe('feed Builder', () => {
  describe('base query', () => {
    it('selects from feed table with removed_at check', () => {
      const query: FeedQuery = {
        filters: [],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where ("feed"."removed_at" is null and "feed"."post_hash" is null)",
        }
      `);
    });
  });

  describe('includes', () => {
    it('excludes replies by default (posts only)', () => {
      const query: FeedQuery = {
        filters: [],
        sort: [],
        includes: { posts: true },
      };
      const sql = build(query).toSQL().sql;
      expect(sql).toContain('"post_hash" is null');
    });

    it('includes replies when specified', () => {
      const query: FeedQuery = {
        filters: [],
        sort: [],
        includes: { posts: true, replies: true },
      };
      const result = build(query);
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where "feed"."removed_at" is null",
        }
      `);
    });
  });

  describe('filters', () => {
    it('applies $eq operator', () => {
      const query: FeedQuery = {
        filters: [{ field: 'author', operator: '$eq', value: 'user123' }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [
            "user123",
          ],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where ("feed"."removed_at" is null and "feed"."post_hash" is null and "feed"."author" = $1)",
        }
      `);
    });

    it('applies $in operator with multiple values', () => {
      const query: FeedQuery = {
        filters: [{ field: 'author', operator: '$in', value: ['user1', 'user2'] }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [
            "user1",
            "user2",
          ],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where ("feed"."removed_at" is null and "feed"."post_hash" is null and "feed"."author" in ($1, $2))",
        }
      `);
    });

    it('applies $search with plainto_tsquery', () => {
      const query: FeedQuery = {
        filters: [{ field: 'message', operator: '$search', value: 'hello world' }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [
            "hello world",
          ],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where ("feed"."removed_at" is null and "feed"."post_hash" is null and to_tsvector('english', "feed"."message") @@ plainto_tsquery('english', $1))",
        }
      `);
    });

    it('ignores invalid field names', () => {
      const query: FeedQuery = {
        filters: [{ field: 'invalid_field', operator: '$eq', value: 'test' }],
        sort: [],
        includes: { posts: true },
      };
      const sql = build(query).toSQL().sql;
      expect(sql).not.toContain('invalid_field');
    });
  });

  describe('variables', () => {
    it('resolves $me to authenticated user address', () => {
      const query: FeedQuery = {
        filters: [{ field: 'author', operator: '$eq', value: { type: 'variable', name: '$me' } }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query, { address: 'my-address' });
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [
            "my-address",
          ],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where ("feed"."removed_at" is null and "feed"."post_hash" is null and "feed"."author" = $1)",
        }
      `);
    });

    it('resolves $following to subquery with limit', () => {
      const query: FeedQuery = {
        filters: [{ field: 'author', operator: '$in', value: { type: 'variable', name: '$following' } }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query, { address: 'my-address' });
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [
            "my-address",
            1000,
          ],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where ("feed"."removed_at" is null and "feed"."post_hash" is null and "feed"."author" in (select "following" from "follows" where ("follows"."follower" = $1 and "follows"."removed_at" is null) order by "follows"."timestamp" desc limit $2))",
        }
      `);
    });
  });

  describe('sort', () => {
    it('applies descending sort', () => {
      const query: FeedQuery = {
        filters: [],
        sort: [{ field: 'timestamp', direction: 'desc' }],
        includes: { posts: true },
      };
      const result = build(query);
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where ("feed"."removed_at" is null and "feed"."post_hash" is null) order by "feed"."timestamp" desc",
        }
      `);
    });

    it('ignores invalid sort fields', () => {
      const query: FeedQuery = {
        filters: [],
        sort: [{ field: 'invalid_field', direction: 'desc' }],
        includes: { posts: true },
      };
      const sql = build(query).toSQL().sql;
      expect(sql).not.toContain('order by');
    });
  });

  describe('timeframe', () => {
    it('applies day timeframe with make_interval', () => {
      const query: FeedQuery = {
        filters: [],
        sort: [],
        includes: { posts: true },
        timeframe: '1d',
      };
      const result = build(query);
      expect(result.toSQL()).toMatchInlineSnapshot(`
        {
          "params": [
            1,
          ],
          "sql": "select "hash", "post_hash", "author", "timestamp", "message", "quantity", "replies", "likes", "dislikes", "flags", "likes_burnt", "dislikes_burnt", "flags_burnt", "removed_hash", "removed_at", "removed_by" from "feed" where ("feed"."removed_at" is null and "feed"."post_hash" is null and "feed"."timestamp" >= NOW() - make_interval(days => $1))",
        }
      `);
    });
  });

  describe('numeric text fields', () => {
    it('applies numeric CAST for quantity $gte', () => {
      const query: FeedQuery = {
        filters: [{ field: 'quantity', operator: '$gte', value: '1000000' }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      const sqlOutput = result.toSQL();
      expect(sqlOutput.sql).toContain('CAST("feed"."quantity" AS NUMERIC)');
      expect(sqlOutput.sql).toContain('CAST($1 AS NUMERIC)');
      expect(sqlOutput.params).toContain('1000000');
    });

    it('applies numeric CAST for likes_burnt $lt', () => {
      const query: FeedQuery = {
        filters: [{ field: 'likes_burnt', operator: '$lt', value: '500' }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      const sqlOutput = result.toSQL();
      expect(sqlOutput.sql).toContain('CAST("feed"."likes_burnt" AS NUMERIC)');
      expect(sqlOutput.sql).toContain('CAST($1 AS NUMERIC)');
    });

    it('applies numeric CAST for dislikes_burnt $lte', () => {
      const query: FeedQuery = {
        filters: [{ field: 'dislikes_burnt', operator: '$lte', value: '100' }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      const sqlOutput = result.toSQL();
      expect(sqlOutput.sql).toContain('CAST("feed"."dislikes_burnt" AS NUMERIC)');
    });

    it('applies numeric CAST for flags_burnt $gt', () => {
      const query: FeedQuery = {
        filters: [{ field: 'flags_burnt', operator: '$gt', value: '10' }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      const sqlOutput = result.toSQL();
      expect(sqlOutput.sql).toContain('CAST("feed"."flags_burnt" AS NUMERIC)');
    });

    it('does NOT apply CAST for non-numeric fields like author', () => {
      const query: FeedQuery = {
        filters: [{ field: 'author', operator: '$eq', value: 'user123' }],
        sort: [],
        includes: { posts: true },
      };
      const result = build(query);
      const sqlOutput = result.toSQL();
      expect(sqlOutput.sql).not.toContain('CAST');
      expect(sqlOutput.sql).toContain('"feed"."author" = $1');
    });
  });
});
