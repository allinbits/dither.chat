import { describe, expect, it } from 'vitest';

import { parse } from '../../src/feed/parser';

describe('feed Parser', () => {
  describe('basic parsing', () => {
    it('returns empty query for empty string', () => {
      const result = parse('');
      expect(result).toEqual({
        filters: [],
        sort: [],
        includes: {},
      });
    });

    it('parses simple equality filter', () => {
      const result = parse('author=user123');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: 'user123' },
      ]);
    });
  });

  describe('operators', () => {
    it('parses $eq operator', () => {
      const result = parse('author[$eq]=user123');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: 'user123' },
      ]);
    });

    it('parses $in operator', () => {
      const result = parse('author[$in]=user1,user2');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$in', value: 'user1,user2' },
      ]);
    });

    it('parses $nin operator', () => {
      const result = parse('author[$nin]=blocked_user');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$nin', value: 'blocked_user' },
      ]);
    });

    it('parses $search operator', () => {
      const result = parse('message[$search]=hello%20world');
      expect(result.filters).toEqual([
        { field: 'message', operator: '$search', value: 'hello world' },
      ]);
    });

    it('parses comparison operators', () => {
      const result = parse('likes[$gte]=10&likes[$lte]=100');
      expect(result.filters).toContainEqual(
        { field: 'likes', operator: '$gte', value: '10' },
      );
      expect(result.filters).toContainEqual(
        { field: 'likes', operator: '$lte', value: '100' },
      );
    });

    it('ignores invalid operators', () => {
      const result = parse('author[$invalid]=test');
      expect(result.filters).toEqual([]);
    });
  });

  describe('variables', () => {
    it('parses $me variable', () => {
      const result = parse('author[$eq]=$me');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: { type: 'variable', name: '$me' } },
      ]);
    });

    it('parses $following variable', () => {
      const result = parse('author[$in]=$following');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$in', value: { type: 'variable', name: '$following' } },
      ]);
    });

    it('treats unknown $ values as strings', () => {
      const result = parse('author[$eq]=$unknown');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: '$unknown' },
      ]);
    });

    it('treats $muted as string (not implemented)', () => {
      const result = parse('author[$nin]=$muted');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$nin', value: '$muted' },
      ]);
    });

    it('treats $blocked as string (not implemented)', () => {
      const result = parse('author[$nin]=$blocked');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$nin', value: '$blocked' },
      ]);
    });
  });

  describe('sort', () => {
    it('parses ascending sort', () => {
      const result = parse('sort=timestamp');
      expect(result.sort).toEqual([
        { field: 'timestamp', direction: 'asc' },
      ]);
    });

    it('parses descending sort with - prefix', () => {
      const result = parse('sort=-timestamp');
      expect(result.sort).toEqual([
        { field: 'timestamp', direction: 'desc' },
      ]);
    });

    it('parses multiple sort fields', () => {
      const result = parse('sort=-likes,timestamp');
      expect(result.sort).toEqual([
        { field: 'likes', direction: 'desc' },
        { field: 'timestamp', direction: 'asc' },
      ]);
    });
  });

  describe('timeframe', () => {
    it('parses hour timeframe', () => {
      const result = parse('timeframe=24h');
      expect(result.timeframe).toBe('24h');
    });

    it('parses day timeframe', () => {
      const result = parse('timeframe=7d');
      expect(result.timeframe).toBe('7d');
    });

    it('parses minute timeframe', () => {
      const result = parse('timeframe=30m');
      expect(result.timeframe).toBe('30m');
    });
  });

  describe('includes', () => {
    it('parses posts include', () => {
      const result = parse('include[posts]=true');
      expect(result.includes.posts).toBe(true);
    });

    it('parses replies include', () => {
      const result = parse('include[replies]=true');
      expect(result.includes.replies).toBe(true);
    });

    it('parses reposts include', () => {
      const result = parse('include[reposts]=true');
      expect(result.includes.reposts).toBe(true);
    });

    it('ignores non-true values', () => {
      const result = parse('include[posts]=false&include[replies]=yes');
      expect(result.includes.posts).toBeUndefined();
      expect(result.includes.replies).toBeUndefined();
    });

    it('parses multiple includes', () => {
      const result = parse('include[posts]=true&include[replies]=true');
      expect(result.includes).toEqual({
        posts: true,
        replies: true,
        reposts: undefined,
      });
    });
  });

  describe('complex queries', () => {
    it('parses global feed query', () => {
      const result = parse('sort=-timestamp&include[posts]=true');
      expect(result.sort).toEqual([{ field: 'timestamp', direction: 'desc' }]);
      expect(result.includes.posts).toBe(true);
    });

    it('parses following feed query', () => {
      const result = parse('author[$in]=$following&sort=-timestamp&include[reposts]=true');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$in', value: { type: 'variable', name: '$following' } },
      ]);
      expect(result.sort).toEqual([{ field: 'timestamp', direction: 'desc' }]);
      expect(result.includes.reposts).toBe(true);
    });

    it('parses trending feed query', () => {
      const result = parse('timeframe=6h&likes[$gte]=10&sort=-likes');
      expect(result.timeframe).toBe('6h');
      expect(result.filters).toEqual([
        { field: 'likes', operator: '$gte', value: '10' },
      ]);
      expect(result.sort).toEqual([{ field: 'likes', direction: 'desc' }]);
    });

    it('parses search with timeframe and sort', () => {
      const result = parse('message[$search]=bitcoin&timeframe=24h&sort=-likes');
      expect(result.filters).toEqual([
        { field: 'message', operator: '$search', value: 'bitcoin' },
      ]);
      expect(result.timeframe).toBe('24h');
      expect(result.sort).toEqual([{ field: 'likes', direction: 'desc' }]);
    });

    it('parses profile feed with reposts', () => {
      const result = parse('author[$eq]=$me&include[reposts]=true&sort=-timestamp');
      expect(result.filters).toHaveLength(1);
      expect(result.filters).toContainEqual(
        { field: 'author', operator: '$eq', value: { type: 'variable', name: '$me' } },
      );
      expect(result.includes.reposts).toBe(true);
      expect(result.sort).toEqual([{ field: 'timestamp', direction: 'desc' }]);
    });
  });

  describe('malformed queries', () => {
    it('handles empty field name as operator field', () => {
      // qs parses [$eq] as { $eq: value }, which becomes field "$eq"
      const result = parse('[$eq]=value');
      expect(result.filters).toEqual([
        { field: '$eq', operator: '$eq', value: 'value' },
      ]);
    });

    it('handles empty value', () => {
      const result = parse('author[$eq]=');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: '' },
      ]);
    });

    it('handles missing operator brackets', () => {
      const result = parse('author$eq=value');
      // Treated as equality filter with field "author$eq"
      expect(result.filters).toEqual([
        { field: 'author$eq', operator: '$eq', value: 'value' },
      ]);
    });

    it('handles unclosed brackets as literal field name', () => {
      const result = parse('author[$eq=value');
      // qs treats "author[$eq" as the field name
      expect(result.filters).toEqual([
        { field: 'author[$eq', operator: '$eq', value: 'value' },
      ]);
    });

    it('handles double operators as nested object', () => {
      const result = parse('author[$eq][$in]=value');
      // qs creates nested object { $eq: { $in: 'value' } }
      // Parser processes $eq with object value
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: { $in: 'value' } },
      ]);
    });

    it('handles empty sort value', () => {
      const result = parse('sort=');
      expect(result.sort).toEqual([{ field: '', direction: 'asc' }]);
    });

    it('handles sort with only dash', () => {
      const result = parse('sort=-');
      expect(result.sort).toEqual([{ field: '', direction: 'desc' }]);
    });

    it('handles empty timeframe', () => {
      const result = parse('timeframe=');
      expect(result.timeframe).toBe('');
    });

    it('handles invalid timeframe format', () => {
      // Parser accepts any string, validation happens in builder
      const result = parse('timeframe=invalid');
      expect(result.timeframe).toBe('invalid');
    });

    it('handles include with non-object value', () => {
      const result = parse('include=true');
      expect(result.includes).toEqual({});
    });

    it('handles special characters in values', () => {
      const result = parse('message[$search]=hello%26world');
      expect(result.filters).toEqual([
        { field: 'message', operator: '$search', value: 'hello&world' },
      ]);
    });

    it('handles unicode in values', () => {
      const result = parse('message[$search]=%E4%BD%A0%E5%A5%BD');
      expect(result.filters).toEqual([
        { field: 'message', operator: '$search', value: '你好' },
      ]);
    });

    it('handles very long field names gracefully', () => {
      const longField = 'a'.repeat(1000);
      const result = parse(`${longField}[$eq]=value`);
      expect(result.filters).toEqual([
        { field: longField, operator: '$eq', value: 'value' },
      ]);
    });

    it('handles array syntax in values', () => {
      const result = parse('author[$in][0]=user1&author[$in][1]=user2');
      // qs parses this as an array
      expect(result.filters[0]?.value).toEqual(['user1', 'user2']);
    });

    it('handles duplicate parameters as array', () => {
      const result = parse('author[$eq]=first&author[$eq]=second');
      // qs combines duplicate keys into array
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: ['first', 'second'] },
      ]);
    });

    it('handles null-like values', () => {
      const result = parse('author[$eq]=null');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: 'null' },
      ]);
    });

    it('handles undefined-like values', () => {
      const result = parse('author[$eq]=undefined');
      expect(result.filters).toEqual([
        { field: 'author', operator: '$eq', value: 'undefined' },
      ]);
    });
  });
});
