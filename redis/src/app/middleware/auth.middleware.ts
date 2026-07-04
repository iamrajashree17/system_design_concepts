import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice('Bearer '.length);

    try {
        req.user = verifyAccessToken(token);
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
