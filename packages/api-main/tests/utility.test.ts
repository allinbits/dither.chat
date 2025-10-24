import { describe, expect, it } from 'vitest';

import { getTransferMessage, getTransferQuantities } from '../src/utility';
import { generateFakeData, getAtomOneAddress } from './shared';

describe('utility tests', () => {
  it('getTransferMessage', () => {
    const userA = getAtomOneAddress();
    const userB = getAtomOneAddress();

    const msgTransfer = getTransferMessage([generateFakeData('whatever', userA, userB)]);

    expect(msgTransfer && msgTransfer.from_address === userA, 'from address did not match');
    expect(msgTransfer && msgTransfer.to_address === userB, 'to address did not match');
  });

  it('getAtomOneAddress', () => {
    for (let i = 0; i < 100; i++) {
      expect(getAtomOneAddress().length === 44, 'address length was incorrect');
    }
  });

  it('getTransferQuantities', () => {
    let totalQuantity = BigInt('0');

    for (let i = 0; i < 100; i++) {
      totalQuantity += BigInt(
        getTransferQuantities([generateFakeData('whatever', getAtomOneAddress(), getAtomOneAddress())]),
      );
    }

    expect(totalQuantity === BigInt('100'));
  });
});
