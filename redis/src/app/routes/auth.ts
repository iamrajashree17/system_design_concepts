import { Router } from 'express';
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);
router.get('/me', requireAuth, getCurrentUser);

export default router;
