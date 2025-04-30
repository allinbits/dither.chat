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

const flagsHandler = async (msg: amqplib.Message) => {
    try {
        const content = msg.content.toString();
        const parsedContent = JSON.parse(content);
        const [post_hash] = extractMemoContent(parsedContent.memo, "dither.Flag");
        const postBody = {
            hash: parsedContent.hash,
            from: parsedContent.sender,
            postHash: post_hash,
            //timestamp: parsedContent.timestamp,
            quantity: parsedContent.quantity,
        };
        const rawResponse = await fetch(apiRoot+'/flag', {
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
    const consumer = new EventConsumer(config, flagsHandler);
    await consumer.connect();
    await consumer.consume();
};
start();
