import { EventConsumer } from "@atomone/event-consumer";
import { useConfig } from "./config";
import amqplib from 'amqplib';

const config = useConfig();

const postsHandler = async (msg: amqplib.Message) => {
    try {
        const content = msg.content.toString();
        console.log("Received message:", content);
        // Process the message here
        // For example, you can parse the JSON content and perform some action
        // const data = JSON.parse(content);
        // Perform your processing logic here
        // Return true if the message was processed successfully
        return true;
    } catch (error) {
        return false
    };
};

export const start = async() => {
    const consumer = new EventConsumer(config, postsHandler);
    await consumer.connect();
    await consumer.consume();
};
start();
