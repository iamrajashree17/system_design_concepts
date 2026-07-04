import {kafka} from "./kafka";
import { ORDER_PLACED_TOPIC } from "../events/order-placed.event";

const admin = kafka.admin();

async function main() {
    await admin.connect();

    await admin.createTopics({
        topics: [
            {
                topic: ORDER_PLACED_TOPIC,
                numPartitions: 3,
                replicationFactor: 1
            }
        ]
    })
    console.log(`Topic ${ORDER_PLACED_TOPIC} created successfully!`);

    await admin.disconnect();
}

main().catch(async (error) => {
    console.error('Error creating topic', error);
    await admin.disconnect();
    process.exit(1);
});
