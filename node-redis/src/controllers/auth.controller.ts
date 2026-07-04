import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { createUser, findUserByEmail, findUserById } from '../services/auth.service.js';

const SALT_ROUNDS = 10;
const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function refreshCookieOptions() {
    return {
        httpOnly: true as const,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'strict' as const,
    };
}

export async function registerUser(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    try {
        const existing = await findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await createUser(email, passwordHash);

        return res.status(201).json(user);
    } catch (err) {
        console.error('registerUser failed:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function loginUser(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = signAccessToken({ userId: user.id });
        const refreshToken = signRefreshToken({ userId: user.id });

        res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
            ...refreshCookieOptions(),
            maxAge: REFRESH_COOKIE_MAX_AGE_MS,
        });

        return res.status(200).json({ accessToken });
    } catch (err) {
        console.error('loginUser failed:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
        return res.status(401).json({ error: 'Missing refresh token' });
    }

    try {
        const payload = verifyRefreshToken(refreshToken);
        const accessToken = signAccessToken({ userId: payload.userId });
        return res.status(200).json({ accessToken });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
}

export async function logoutUser(req: Request, res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
    return res.status(200).json({ message: 'Logged out' });
}

export async function getCurrentUser(req: Request, res: Response) {
    try {
        const user = await findUserById(req.user!.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (err) {
        console.error('getCurrentUser failed:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
