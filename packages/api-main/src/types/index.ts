export type MsgTransfer = {
    '@type': string;
    from_address: string;
    to_address: string;
    amounts: Array<{ amount: string; denom: string }>;
};

export type MsgGeneric = { [key: string]: any };
