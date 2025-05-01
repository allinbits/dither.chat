import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate";
import dotenv from "dotenv";
dotenv.config();

const mnemonic = process.env.MNEMONIC || "";
const rpcEndpoint = process.env.RPC_ENDPOINT || "";
const receiverAddress = "atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep";

if (!mnemonic) {
  throw new Error("MNEMONIC not found in .env");
}

if (!rpcEndpoint) {
  throw new Error("RPC_ENDPOINT not found in .env");
}

export async function getCosmosClient() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "atone",
  });

  const [firstAccount] = await wallet.getAccounts();

  const client = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    wallet
  );
  return {
    client,
    address: firstAccount.address,
  };
}

type spammer = {
  client: SigningStargateClient;
  address: string;
};

export async function sendMemo(
  spammer: spammer,
  memo: string
): Promise<DeliverTxResponse | undefined> {
  try {
    const fee = {
      amount: [{ denom: "uphoton", amount: "500" }],
      gas: "200000",
    };

    const result = await spammer.client.sendTokens(
      spammer.address,
      receiverAddress,
      [{ denom: "uatone", amount: "1" }],
      fee,
      memo
    );
    return result;
  } catch (err: any) {
    console.error("[tx] Error:", err.message);
  }
}
