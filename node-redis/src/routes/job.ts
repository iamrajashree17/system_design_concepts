import { Router } from 'express';
import { getJob, getJobById, insertJob, updateJob } from '../controllers/job.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { jobRateLimiter } from '../middleware/rateLimiter.middleware.js';

const jobRouter = Router();

jobRouter.use(jobRateLimiter);

jobRouter.get('/', requireAuth, getJob);
jobRouter.post('/', requireAuth, insertJob);
jobRouter.get('/:id', requireAuth, getJobById);
jobRouter.put('/:id', requireAuth, updateJob);

export default jobRouter;
