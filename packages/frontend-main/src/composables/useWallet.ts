/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EncodeObject, OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import type { OfflineAminoSigner } from '@keplr-wallet/types';

import { type Ref, ref } from 'vue';
import { coins, type DeliverTxResponse, SigningStargateClient } from '@cosmjs/stargate';
import { getOfflineSigner } from '@cosmostation/cosmos-client';
import { storeToRefs } from 'pinia';

import { useConfigStore } from '@/stores/useConfigStore';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';
import { useWalletStateStore } from '@/stores/useWalletStateStore';
import { getChainConfigLazy } from '@/utility/getChainConfigLazy';

export enum Wallets {
    keplr = 'Keplr',
    leap = 'Leap',
    cosmostation = 'Cosmostation',
    addressOnly = 'AddressOnly',
}

export const getWalletHelp = (wallet: Wallets) => {
    switch (wallet) {
        case Wallets.keplr:
            return 'https://help.keplr.app/articles/advanced-troubleshooting-guidelines';
        case Wallets.leap:
            return 'https://leapwallet.notion.site/Leap-Cosmos-Wallet-Support-ba1da3c05d3341eaa44a1850ed3260ee';
        case Wallets.cosmostation:
            return 'https://guide.cosmostation.io/web_wallet_en.html';
    }
};

const isCredentialsValid = async () => {
    const configStore = useConfigStore();
    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';

    const resVerifyRaw = await fetch(apiRoot + '/auth-verify', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (resVerifyRaw.status !== 200) {
        return false;
    }

    const resVerify = await resVerifyRaw.json();
    if (resVerify.status !== 200) {
        return false;
    }

    return true;
};

const useWalletInstance = () => {
    const chainInfo = getChainConfigLazy();
    const configStore = useConfigStore();

    const apiRoot = configStore.envConfig.apiRoot ?? 'http://localhost:3000';
    const destinationWallet = configStore.envConfig.communityWallet ?? 'atone1uq6zjslvsa29cy6uu75y8txnl52mw06j6fzlep';

    const walletDialogStore = useWalletDialogStore();
    const walletState = storeToRefs(useWalletStateStore());

    const signOut = () => {
        walletState.address.value = '';
        walletState.used.value = null;
        walletState.loggedIn.value = false;
        walletState.processState.value = 'idle';
        document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    };
    const signer: Ref<OfflineSigner | null> = ref(null);

    const connect = async (walletType: Wallets, address?: string, signal?: AbortSignal) => {
        if (signal?.aborted) {
            return Promise.reject(new DOMException('Aborted', 'AbortError'));
        }
        signal?.addEventListener('abort', signOut);
        switch (walletType) {
            case Wallets.keplr:
                try {
                    await window.keplr?.experimentalSuggestChain(chainInfo.value);
                    await window.keplr?.enable(chainInfo.value.chainId);
                    if (window.getOfflineSignerOnlyAmino) {
                        walletState.address.value = (
                            await window.getOfflineSignerOnlyAmino(chainInfo.value.chainId).getAccounts()
                        )[0].address;
                        walletState.used.value = Wallets.keplr;
                        signer.value = window.getOfflineSignerOnlyAmino(chainInfo.value.chainId);
                        if (signal?.aborted) {
                            signOut();
                        }
                    }
                    else {
                        throw new Error('Could not connect to Keplr: getOfflineSigner method does not exist');
                    }
                }
                catch (e) {
                    throw new Error('Could not connect to Keplr: ' + e);
                }
                finally {
                    signal?.removeEventListener('abort', signOut);
                }
                break;
            case Wallets.leap:
                try {
                    await window.leap?.experimentalSuggestChain(chainInfo.value);
                    await window.leap?.enable(chainInfo.value.chainId);
                    walletState.address.value = (
                        await window.leap.getOfflineSignerOnlyAmino(chainInfo.value.chainId).getAccounts()
                    )[0].address;
                    walletState.used.value = Wallets.leap;
                    signer.value = window.leap.getOfflineSignerOnlyAmino(chainInfo.value.chainId);
                    if (signal?.aborted) {
                        signOut();
                    }
                }
                catch (e) {
                    throw new Error('Could not connect to Leap Wallet: ' + e);
                }
                finally {
                    signal?.removeEventListener('abort', signOut);
                }
                break;
            case Wallets.cosmostation:
                try {
                    await (window.cosmostation as any).cosmos.request({
                        method: 'cos_addChain',
                        params: {
                            chainId: chainInfo.value.chainId,
                            chainName: chainInfo.value.chainName,
                            addressPrefix: chainInfo.value.bech32Config.bech32PrefixAccAddr,
                            baseDenom: chainInfo.value.stakeCurrency.coinMinimalDenom,
                            displayDenom: chainInfo.value.stakeCurrency.coinDenom,
                            restURL: chainInfo.value.rest,
                            decimals: chainInfo.value.stakeCurrency.coinDecimals, // optional
                            coinType: '' + chainInfo.value.bip44.coinType, // optional
                        },
                    });
                }
                catch (e: unknown) {
                    if ((e as { code: number }).code != -32602) {
                        throw e;
                    }
                }
                try {
                    walletState.address.value = (
                        await (window.cosmostation as any).cosmos.request({
                            method: 'cos_requestAccount',
                            params: { chainName: chainInfo.value.chainId },
                        })
                    ).address;
                    walletState.used.value = Wallets.cosmostation;
                    const cosmostationSigner = (await getOfflineSigner(chainInfo.value.chainId)) as OfflineSigner;
                    if ((cosmostationSigner as OfflineDirectSigner).signDirect) {
                        const { signDirect: _signDirect, ...aminoSigner } = cosmostationSigner as OfflineDirectSigner;
                        signer.value = aminoSigner as OfflineAminoSigner;
                    }
                    else {
                        signer.value = cosmostationSigner;
                    }
                    if (signal?.aborted) {
                        signOut();
                    }
                }
                catch (e) {
                    throw new Error('Could not connect to Cosmostation: ' + e);
                }
                finally {
                    signal?.removeEventListener('abort', signOut);
                }
                break;
            case Wallets.addressOnly:
                if (address) {
                    walletState.address.value = address;
                    walletState.used.value = Wallets.addressOnly;
                }
                break;
        }

        if (walletState.address.value) {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            const postBody = {
                address: walletState.address.value,
            };

            const isValid = await isCredentialsValid();
            if (isValid) {
                walletState.loggedIn.value = true;
                walletDialogStore.hideDialog();
                return;
            }

            try {
                // Create the authentication request
                const responseRaw = await fetch(apiRoot + '/auth-create', {
                    body: JSON.stringify(postBody),
                    method: 'POST',
                    headers,
                });
                const response = (await responseRaw.json()) as { status: number; id: number; message: string };
                console.log(response);

                // Sign the authentication request
                const signedMsg = await signMessage(response.message);
                if (!signedMsg) {
                    walletState.loggedIn.value = false;
                    walletDialogStore.hideDialog();
                    console.error(`Failed to sign response`);
                    // TODO - Add Better Error Handling
                    return;
                }

                const data = { ...signedMsg, id: response.id };
                console.log(data);
                const resAuthRaw = await fetch(apiRoot + '/auth', {
                    body: JSON.stringify(data),
                    method: 'POST',
                    headers,
                    credentials: 'include',
                });

                if (resAuthRaw.status !== 200) {
                    walletState.loggedIn.value = false;
                    walletDialogStore.hideDialog();
                    console.error(`Failed to authenticate, invalid JSON response`);
                    // TODO - Add Better Error Handling
                    return;
                }

                const resAuth = await resAuthRaw.json();
                console.log(resAuth);
                if (resAuth.status !== 200) {
                    console.error(resAuth);
                    walletState.loggedIn.value = false;
                    return;
                }

                walletState.loggedIn.value = true;
            }
            catch (e) {
                signOut();
                throw e;
            }
        }

        walletDialogStore.hideDialog();
    };

    const sendTx = async (msgs: EncodeObject[], formattedMemo?: string) => {
        const response: { broadcast: boolean; tx?: DeliverTxResponse; msg?: string } = { broadcast: false };
        walletState.processState.value = 'starting';

        if (!signer.value) {
            walletState.processState.value = 'idle';
            throw new Error('Could not sign messages');
        }

        try {
            walletState.processState.value = 'connecting';
            const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer.value);

            walletState.processState.value = 'simulating';
            const simulate = await client.simulate(walletState.address.value, msgs, formattedMemo);
            const gasLimit = simulate && simulate > 0 ? '' + Math.ceil(simulate * 1.5) : '500000';

            walletState.processState.value = 'broadcasting';
            const result = await client.signAndBroadcast(
                walletState.address.value,
                msgs,
                {
                    amount: [{ amount: '10000', denom: chainInfo.value.feeCurrencies[0].coinMinimalDenom }],
                    gas: gasLimit,
                },
                formattedMemo,
            );

            response.msg = result.code === 0 ? 'successfully broadcast' : 'failed to broadcast transaction';
            response.broadcast = result.code === 0;
            response.tx = result;
            return response;
        }
        catch (err) {
            console.error(err);
            throw new Error('Could not sign messages');
        }
        finally {
            walletState.processState.value = 'idle';
        }
    };

    const sendBankTx = async (formattedMemo: string, amount: string) => {
        const response: { broadcast: boolean; tx?: DeliverTxResponse; msg?: string } = { broadcast: false };
        walletState.processState.value = 'starting';

        if (!signer.value) {
            walletState.processState.value = 'idle';
            response.msg = 'No valid signer available.';
            return response;
        }

        try {
            walletState.processState.value = 'connecting';
            const client = await SigningStargateClient.connectWithSigner(chainInfo.value.rpc, signer.value);

            walletState.processState.value = 'simulating';
            const simulate = await client.simulate(
                walletState.address.value,
                [
                    {
                        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
                        value: {
                            fromAddress: walletState.address.value,
                            toAddress: destinationWallet,
                            amount: coins(1, chainInfo.value.feeCurrencies[0].coinMinimalDenom),
                        },
                    },
                ],
                formattedMemo,
            );

            const gasLimit = simulate && simulate > 0 ? '' + Math.ceil(simulate * 2.0) : '500000';

            walletState.processState.value = 'broadcasting';
            const result = await client.sendTokens(
                walletState.address.value, // From
                destinationWallet, // To
                [{ amount: amount, denom: chainInfo.value.feeCurrencies[0].coinMinimalDenom }], // Amount
                {
                    amount: [{ amount: '10000', denom: chainInfo.value.feeCurrencies[0].coinMinimalDenom }],
                    gas: gasLimit,
                }, // Gas
                formattedMemo,
            );

            response.msg = result.code === 0 ? 'successfully broadcast' : 'failed to broadcast transaction';
            response.broadcast = result.code === 0;
            response.tx = result;
            return response;
        }
        catch (err) {
            response.msg = String(err);
            return response;
        }
        finally {
            walletState.processState.value = 'idle';
        }
    };

    const signMessage = async (text: string) => {
        if (!signer.value) {
            throw new Error('Could not sign messages');
        }

        if (walletState.used.value === Wallets.keplr) {
            return window.keplr?.signArbitrary(chainInfo.value.chainId, walletState.address.value, text);
        }

        if (walletState.used.value === Wallets.cosmostation) {
            return window.cosmostation.providers.keplr.signArbitrary(
                chainInfo.value.chainId,
                walletState.address.value,
                text,
            );
        }

        if (walletState.used.value === Wallets.leap) {
            return window.leap?.signArbitrary(chainInfo.value.chainId, walletState.address.value, text);
        }

        throw new Error(`No valid wallet connected to sign messages.`);
    };

    const refreshAddress = () => {
        console.log('refresh disconnected');
        // if (walletState.used.value) {
        //     if (walletState.used.value == Wallets.addressOnly) {
        //         connect(walletState.used.value, walletState.address.value);
        //     }
        //     else {
        //         console.log('forcing connection...');
        //         connect(walletState.used.value);
        //     }
        // }
    };

    const ditherPost = async (msg: string, amount = '1') => {
        const formattedMemo = `dither.Post("${msg}")`;
        return await sendBankTx(formattedMemo, amount);
    };

    const ditherReply = async (postHash: string, msg: string, amount = '1') => {
        const formattedMemo = `dither.Reply("${postHash}", "${msg}")`;
        return await sendBankTx(formattedMemo, amount);
    };

    const ditherPostRemove = async (postHash: string, amount = '1') => {
        const formattedMemo = `dither.PostRemove("${postHash}")`;
        return await sendBankTx(formattedMemo, amount);
    };

    const ditherFollow = async (address: string, amount = '1') => {
        const formattedMemo = `dither.Follow("${address}")`;
        return await sendBankTx(formattedMemo, amount);
    };

    const ditherUnfollow = async (address: string, amount = '1') => {
        const formattedMemo = `dither.Unfollow("${address}")`;
        return await sendBankTx(formattedMemo, amount);
    };

    const ditherTipUser = async (address: string, amount = '1') => {
        return sendTx(
            [
                {
                    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
                    value: {
                        fromAddress: walletState.address.value,
                        toAddress: address,
                        amount: coins(amount, chainInfo.value.feeCurrencies[0].coinMinimalDenom),
                    },
                },
            ],
            `dither.TipUser("${address}")`,
        );
    };

    const ditherLike = async (postHash: string, amount = '1') => {
        const formattedMemo = `dither.Like("${postHash}")`;
        return await sendBankTx(formattedMemo, amount);
    };

    const ditherDislike = async (postHash: string, amount = '1') => {
        const formattedMemo = `dither.Dislike("${postHash}")`;
        return await sendBankTx(formattedMemo, amount);
    };

    const ditherFlag = async (postHash: string, amount = '1') => {
        const formattedMemo = `dither.Flag("${postHash}")`;
        return await sendBankTx(formattedMemo, amount);
    };

    window.addEventListener('cosmostation_keystorechange', refreshAddress);
    window.addEventListener('keplr_keystorechange', refreshAddress);
    window.addEventListener('leap_keystorechange', refreshAddress);

    return {
        ...walletState,
        signOut,
        connect,
        sendTx,
        refreshAddress,
        signMessage,
        dither: {
            post: ditherPost,
            reply: ditherReply,
            dislike: ditherDislike,
            like: ditherLike,
            flag: ditherFlag,
            postRemove: ditherPostRemove,
            follow: ditherFollow,
            unfollow: ditherUnfollow,
            tipUser: ditherTipUser,
        },
    };
};

let walletInstance: ReturnType<typeof useWalletInstance>;

export const useWallet = () => {
    if (!walletInstance) {
        walletInstance = useWalletInstance();
    }
    return walletInstance;
};
