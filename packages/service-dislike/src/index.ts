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
            'dither.Dislike': [string];
        }
    }
}

const config = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000';

const dislikesHandler = async (msg: amqplib.Message) => {
    try {
        const content = msg.content.toString();
        const parsedContent = JSON.parse(content);
        const [post_hash] = extractMemoContent(parsedContent.memo, 'dither.Dislike');
        const postBody: Posts.DislikeBody = {
            hash: parsedContent.hash,
            from: parsedContent.sender,
            post_hash: post_hash,
            timestamp: parsedContent.timestamp,
            quantity: parsedContent.quantity,
        };
        const rawResponse = await fetch(apiRoot + '/dislike', {
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

        const response = await rawResponse.json() as { status: number; error?: string };
        if (response.status === 200) {
            console.log(`dither.Dislike message processed successfully: ${parsedContent.hash}`);
            return HandlerResponse.SUCCESS;
        }

        if (response.status === 401) {
            console.log(`dither.Dislike message skipped, invalid post hash provided: ${parsedContent.hash}`);
            return HandlerResponse.SUCCESS;
        }

        if (response.status === 404) {
            console.log(`dither.Dislike message skipped, invalid post provided: ${parsedContent.hash}`);
            return HandlerResponse.SUCCESS;
        }

        console.warn(`dither.Dislike message failed to post: ${parsedContent.hash} (${parsedContent.error})`);
        return HandlerResponse.REJECT;
    }
    catch (error) {
        console.error('Error processing message:', error);
        return HandlerResponse.FAILURE;
    };
};

export const start = async () => {
    const consumer = new EventConsumer(config, dislikesHandler);
    await consumer.connect();
    await consumer.consume();
};
start();
