import { EventConsumer } from "@atomone/event-consumer";
import { useConfig } from "./config";
import amqplib from 'amqplib';
import { extractMemoContent } from "@atomone/chronostate";
import { DitherActions } from '@atomone/indexer-feed';
declare module '@atomone/chronostate' {
  export namespace MemoExtractor {
    export interface TypeMap extends DitherActions {
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
            author: parsedContent.sender,
            postHash: post_hash,
            msg: message,
            quantity: parsedContent.quantity,
            timestamp: parsedContent.timestamp,
        };
        const rawResponse = await fetch(apiRoot+'/reply', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(postBody)
        });
        if (rawResponse.status !== 200) {
            console.error('Error posting to API:', rawResponse.statusText);
            return false;
        }else{
            return true;
        }
    } catch (error) {
        console.error('Error processing message:', error);
        return false
    };
};

export const start = async() => {
    const consumer = new EventConsumer(config, repliesHandler);
    await consumer.connect();
    await consumer.consume();
};
start();
