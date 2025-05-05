/* eslint-disable @typescript-eslint/no-namespace */
import type amqplib from 'amqplib';

import { extractMemoContent } from '@atomone/chronostate';
import { EventConsumer } from '@atomone/event-consumer';

import { useConfig } from './config';

declare module '@atomone/chronostate' {
    export namespace MemoExtractor {
        export interface TypeMap {
            'dither.Reply': [string, string];
        }
    }
}
const config = useConfig();
const apiRoot = process.env.API_ROOT || 'http://localhost:3000';

const repliesHandler = async (msg: amqplib.Message) => {
    try {
        const content = msg.content.toString();
        const parsedContent = JSON.parse(content);
        const [post_hash, message] = extractMemoContent(parsedContent.memo, 'dither.Reply');
        const postBody = {
            hash: parsedContent.hash,
            from: parsedContent.sender,
            postHash: post_hash,
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
        if (rawResponse.status !== 200) {
            console.error('Error posting to API:', rawResponse);
            return false;
        }
        else {
            console.log(`dither.Reply message processed successfully: ${parsedContent.hash}`);
            return true;
        }
    }
    catch (error) {
        console.error('Error processing message:', error);
        return false;
    };
};

export const start = async () => {
    const consumer = new EventConsumer(config, repliesHandler);
    await consumer.connect();
    await consumer.consume();
};
start();
