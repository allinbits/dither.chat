import { assert, describe, it } from 'vitest';

import { generateFakeData, getAtomOneAddress } from '../../api-main/tests/shared';
import { useQueue } from '../src/queue/index';

const queue = useQueue();

describe('queue tests', () => {
    const userA = getAtomOneAddress();
    const userB = getAtomOneAddress();

    it('should add elements to queue', () => {
        queue.add(generateFakeData(`first`, userA, userB));
        queue.add(generateFakeData(`${Math.floor(Math.random() * 1000)}`, userA, userB));
        queue.add(generateFakeData(`${Math.floor(Math.random() * 1000)}`, userA, userB));
        queue.add(generateFakeData(`${Math.floor(Math.random() * 1000)}`, userA, userB));
        assert.isOk(queue.hasElements(), 'queue does not have any elements');
    });

    it('should ensure first element is peeked', () => {
        assert.isOk(queue.peek().memo === 'first', 'first element was not actually first element');
    });

    it('should ensure peeked element is not removed', () => {
        assert.isOk(queue.peek().memo === 'first', 'first element got removed after peek');
    });

    it('should remove first element', () => {
        queue.remove();
        assert.isOk(queue.peek().memo !== 'first', 'first element from peek was still first element, never removed');
    });

    it('should increase retry count', () => {
        queue.addRetryCount();
        assert.isOk(queue.getRetryCount() === 1, 'retry count did not increment');
    });

    it('should reset retry count', () => {
        queue.remove();
        assert.isOk(queue.getRetryCount() === 0, 'retry count did not reset');
    });
});
