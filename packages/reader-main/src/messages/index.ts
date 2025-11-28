import { useConfig } from '../config';
import { Messages } from './messages';
import v1 from './v1';

const config = useConfig();

// Messages contains message handlers for different Dither protocol versions.
//
// Versions are defined by the address of the destination account used in the
// send messages.
//
// New versions must be created when the protocol changes because new functions
// are added, or because existing function parameters change. A new version means
// that the destination account for the send transactions must be changed to a
// different one.
//
// Dither protocol is open, it uses a memo field and a send message, so anyone
// can "polute" Dither namespace sending multiple transactions using different
// non existent function names, which might be expected to be supported in the
// future. Apart from poluting the namespace they could also generate issues
// when replaying historical transactions to restore the data.
export const messages = new Messages({
  [config.COMMUNITY_ACCOUNT_V1]: v1,
});
