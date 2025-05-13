/* eslint-disable @typescript-eslint/no-namespace */
import type { Posts } from '@atomone/dither-api-types';
import type amqplib from 'amqplib';

import { extractMemoContent } from '@atomone/chronostate';
import { EventConsumer } from '@atomone/event-consumer';
import { HandlerResponse } from '@atomone/event-consumer/dist/consumer';

import { useConfig } from './config';

declare module '@atomone/chronostate' {
    export namespace MemoExtractor {
        export interface TypeMap {
            'dither.Follow': [string];
        }
    }
}

const config = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000';

const followsHandler = async (msg: amqplib.Message) => {
    try {
        const content = msg.content.toString();
        const parsedContent = JSON.parse(content);
        const [following_address] = extractMemoContent(parsedContent.memo, 'dither.Follow');
        const postBody: Posts.FollowBody = {
            hash: parsedContent.hash,
            from: parsedContent.sender,
            address: following_address,
            timestamp: parsedContent.timestamp,
        };
        const rawResponse = await fetch(apiRoot + '/follow', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postBody),
        });
        if (rawResponse.status !== 200) {
            console.error('Error posting to API:', rawResponse);
            return HandlerResponse.REJECT;
        }
        else {
            console.log(`dither.Follow message processed successfully: ${parsedContent.hash}`);
            return HandlerResponse.SUCCESS;
        }
    }
    catch (error) {
        console.error('Error processing message:', error);
        return HandlerResponse.FAILURE;
    };
};

export const start = async () => {
    const consumer = new EventConsumer(config, followsHandler);
    await consumer.connect();
    await consumer.consume();
};
start();
