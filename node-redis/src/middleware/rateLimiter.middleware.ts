import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { redisClient } from '../redis/client.js';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts, please try again later' },
});

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 5;

export async function jobRateLimiter(req: Request, res: Response, next: NextFunction) {
    try {

        // each ip will get its own counter in redis
        // rate_limit:jobs:127.0.0.1
        // rate_limit:jobs:::1

        // lets say one user is crossing the limit, it will not going to block for everyone
        // real prod pattern - behind a proxy or load balancer

        const ip = req.ip || 'unknown';
        const rateLimiterKey = `rate_limit:jobs:${ip}`;

        const [requestCount] = await redisClient
            .multi()
            .incr(rateLimiterKey)
            .expire(rateLimiterKey, RATE_LIMIT_WINDOW_SECONDS, 'NX')
            .exec() as [number, unknown];

        res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX_REQUESTS - requestCount))

        if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
            return res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later"
            });
        }

        next();
    } catch (error) {
        console.error('Error in job rate limiter:', error);
        next(error);
    }
}
