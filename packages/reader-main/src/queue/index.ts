import type { Action } from '@atomone/chronostate';

const queue: Array<Action> = [];

let retryCount = 0;

export function useQueue() {
  const add = (action: Action) => {
    queue.push(action);
  };

  const peek = () => {
    return queue[0];
  };

  const hasElements = () => {
    return queue.length >= 1;
  };

  const size = () => {
    return queue.length;
  };

  const addRetryCount = () => {
    retryCount += 1;
  };

  const getRetryCount = () => {
    return retryCount;
  };

  const remove = () => {
    retryCount = 0;
    return queue.shift();
  };

  const getBackoffPolicy = () => {
    if (retryCount <= 1) {
      return 5_000;
    }

    if (retryCount === 2) {
      return 15_000;
    }

    if (retryCount >= 3) {
      return 60_000;
    }
  };

  return {
    add,
    addRetryCount,
    getRetryCount,
    getBackoffPolicy,
    hasElements,
    peek,
    remove,
    retryCount,
    size,
  };
}
