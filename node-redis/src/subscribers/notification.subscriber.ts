import dotenv from "dotenv";
import { createClient } from "redis";
import { redisClient } from "../redis/client.js";

const notification_channel = "notification";
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export interface NotificationsPayload {
    id: string;
    title: string;
    message: string;
    createdAt: string;
}

export async function publishNotificationSer(notification: NotificationsPayload): Promise<void> {
    await redisClient.publish(notification_channel, JSON.stringify(notification));

}

const subscriberClient = createClient({url: redisUrl})

subscriberClient.on("error", (err) => {
    console.log("subs redis error", err);
})

async function startNotification() {
    await subscriberClient.connect();

    await subscriberClient.subscribe(notification_channel, (message) => {
        try {
            const notification = JSON.parse(message) as NotificationsPayload;
            console.log("New notification recieved");
            console.log(notification);
        } catch(err) {
            console.log("new notification recieved", message)
        }
    })
}

startNotification().catch((err) => {
    console.log(err);
    process.exit(1)
})