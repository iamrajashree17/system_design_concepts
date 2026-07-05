import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

redisClient.on('end', () => {
  console.log('Redis connection closed');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});


export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    const pong = await redisClient.ping();
    console.log('Redis ping response:', pong);
}

export async function  disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}
