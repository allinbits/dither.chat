import * as T from '../types/index';

export function getTransferMessage(messages: Array<T.MsgGeneric>) {
    const msgTransfer = messages.find((msg) => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend');
    if (!msgTransfer) {
        return null;
    }

    return msgTransfer as T.MsgTransfer;
}
