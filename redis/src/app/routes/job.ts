import { Router } from 'express';
import { getJob, insertJob } from '../controllers/job.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const jobRouter = Router();

jobRouter.get('/', requireAuth, getJob);
jobRouter.post('/', requireAuth, insertJob);

export default jobRouter;
