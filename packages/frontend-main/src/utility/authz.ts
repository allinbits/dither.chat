/* eslint-disable no-case-declarations */
import type { AminoConverters, Coin } from '@cosmjs/stargate';

import { GenericAuthorization } from 'cosmjs-types/cosmos/authz/v1beta1/authz';
import { MsgExec, MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';
import { fromJsonTimestamp, fromTimestamp } from 'cosmjs-types/helpers';

/**
 * CosmJS removes authz Amino messages by default, see:
 * https://github.com/cosmos/cosmjs/blob/v0.37.0/packages/stargate/src/modules/authz/aminomessages.ts
 * so we reintroduce explicit converters here to support Amino-based signers
 */
export function createAuthzAminoConverters(): AminoConverters {
  return {
    [MsgGrant.typeUrl]: {
      aminoType: 'cosmos-sdk/MsgGrant',
      toAmino: ({ granter, grantee, grant }: MsgGrant) => {
        if (!grant || !grant.authorization) {
          throw new Error(`Unsupported grant type: '${grant?.authorization?.typeUrl}'`);
        }
        let authorizationValue: { type: string; value: any };
        switch (grant?.authorization?.typeUrl) {
          case GenericAuthorization.typeUrl:
            const generic = GenericAuthorization.decode(grant.authorization.value);
            authorizationValue = {
              type: 'cosmos-sdk/GenericAuthorization',
              value: { msg: generic.msg },
            };
            break;
          case SendAuthorization.typeUrl:
            const spend = SendAuthorization.decode(grant.authorization.value);
            authorizationValue = {
              type: 'cosmos-sdk/SendAuthorization',
              value: {
                spend_limit: spend.spendLimit,
                allow_list: spend.allowList?.length ? spend.allowList : undefined,
              },
            };
            break;
          default:
            throw new Error(`Unsupported grant type: '${grant.authorization.typeUrl}'`);
        }

        return {
          granter,
          grantee,
          grant: {
            authorization: authorizationValue,
            expiration: grant.expiration
              ? fromTimestamp(grant.expiration)
                  .toISOString()
                  .replace(/\.\d{3}Z$/, 'Z')
              : undefined,
          },
        };
      },
      fromAmino: ({
        granter,
        grantee,
        grant,
      }: {
        granter: string;
        grantee: string;
        grant: {
          authorization: { type: string; value: Record<string, unknown> };
          expiration: { seconds: any; nanos: any } | undefined;
        };
      }) => {
        const authorizationType = grant?.authorization?.type;
        let authorizationValue: { typeUrl: string; value: any };
        switch (authorizationType) {
          case 'cosmos-sdk/GenericAuthorization':
            authorizationValue = {
              typeUrl: GenericAuthorization.typeUrl,
              value: GenericAuthorization.encode({
                msg: grant.authorization.value.msg as string,
              }).finish(),
            };
            break;
          case 'cosmos-sdk/SendAuthorization':
            authorizationValue = {
              typeUrl: SendAuthorization.typeUrl,
              value: SendAuthorization.encode(
                SendAuthorization.fromPartial({
                  spendLimit: grant.authorization.value.spend_limit as Coin[],
                  allowList: grant.authorization.value.allow_list as string[] | undefined,
                }),
              ).finish(),
            };
            break;
          default:
            throw new Error(`Unsupported grant type: '${grant?.authorization?.type}'`);
        }
        return MsgGrant.fromPartial({
          granter,
          grantee,
          grant: {
            authorization: authorizationValue,
            expiration: grant.expiration ? Timestamp.fromPartial(fromJsonTimestamp(grant.expiration)) : undefined,
          },
        });
      },
    },
    [MsgRevoke.typeUrl]: {
      aminoType: 'cosmos-sdk/MsgRevoke',
      toAmino: ({ granter, grantee, msgTypeUrl }: MsgRevoke) => {
        return {
          granter,
          grantee,
          msg_type_url: msgTypeUrl,
        };
      },
      fromAmino: ({ granter, grantee, msg_type_url }: { granter: string; grantee: string; msg_type_url: string }) =>
        MsgRevoke.fromPartial({
          granter,
          grantee,
          msgTypeUrl: msg_type_url,
        }),
    },
    [MsgExec.typeUrl]: {
      aminoType: 'cosmos-sdk/MsgExec',
      toAmino: ({ grantee, msgs }: MsgExec) => {
        return {
          grantee,
          msgs: msgs.map(msg => ({
            type_url: msg.typeUrl,
            value: msg.value,
          })),
        };
      },
      fromAmino: ({ grantee, msgs }: { grantee: string; msgs: Array<{ type_url: string; value: any }> }) =>
        MsgExec.fromPartial({
          grantee,
          msgs: msgs.map(msg => ({
            typeUrl: msg.type_url,
            value: msg.value,
          })),
        }),
    },
  };
}
