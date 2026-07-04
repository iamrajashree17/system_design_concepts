import { Request, Response } from 'express';
import { jobSchema } from '../validators/job.validator.js';
import { getAllJobs, createJob } from '../services/job.service.js';

export async function getJob(req: Request, res: Response) {
    try {
        const jobs = await getAllJobs();
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function insertJob(req: Request, res: Response) {
    const parsed = jobSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
        const job = await createJob(parsed.data);
        res.status(201).json(job);
    } catch (error) {
        console.error('Error inserting job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
