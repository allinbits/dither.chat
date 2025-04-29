import { EventConsumer } from "@atomone/event-consumer";
import { useConfig } from "./config";
import amqplib from 'amqplib';

const config = useConfig();
const apiRoot = process.env.API_ROOT || 'http://localhost:3000';

const unfollowsHandler = async (msg: amqplib.Message) => {
    try {
        const content = msg.content.toString();
        const parsedContent = JSON.parse(content);
        const postBody = {
            hash: parsedContent.hash,
            height: parsedContent.height,
            timestamp: parsedContent.timestamp,
            memo: parsedContent.memo,
            messages: parsedContent.messages,
        };
        const rawResponse = await fetch(apiRoot+'/unfollow', {
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
    const consumer = new EventConsumer(config, unfollowsHandler);
    await consumer.connect();
    await consumer.consume();
};
start();
