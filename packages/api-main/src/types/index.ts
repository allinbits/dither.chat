export type MsgTransfer = {
    '@type': string;
    from_address: string;
    to_address: string;
    amount: Array<{ amount: string; denom: string }>;
};

export type MsgGeneric = { [key: string]: any };
