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
            'dither.Reply': [string, string];
        }
    }
}
const config = useConfig();
const apiRoot = process.env.API_ROOT ?? 'http://localhost:3000';

const repliesHandler = async (msg: amqplib.Message) => {
    try {
        const content = msg.content.toString();
        const parsedContent = JSON.parse(content);
        const [post_hash, message] = extractMemoContent(parsedContent.memo, 'dither.Reply');
        const postBody: Posts.ReplyBody = {
            hash: parsedContent.hash,
            from: parsedContent.sender,
            post_hash: post_hash,
            msg: message,
            quantity: parsedContent.quantity,
            timestamp: parsedContent.timestamp,
        };
        const rawResponse = await fetch(apiRoot + '/reply', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postBody),
        });

        const response = await rawResponse.json() as { status: number, error?: string };
        if (response.status === 200) {
            console.log(`dither.Reply message processed successfully: ${parsedContent.hash}`);
            return HandlerResponse.SUCCESS
        }

        if (response.status === 401) {
            console.log(`dither.Reply message skipped, invalid post hash provided: ${parsedContent.hash}`);
            return HandlerResponse.SUCCESS
        }

        if (response.status === 404) {
            console.log(`dither.Reply message skipped, invalid post provided: ${parsedContent.hash}`);
            return HandlerResponse.SUCCESS
        }

        console.warn(`dither.Reply message failed to post: ${parsedContent.hash} (${parsedContent.error})`)
        return HandlerResponse.REJECT;
    }
    catch (error) {
        console.error('Error processing message:', error);
        return HandlerResponse.FAILURE;
    };
};

export const start = async () => {
    const consumer = new EventConsumer(config, repliesHandler);
    await consumer.connect();
    await consumer.consume();
};
start();
