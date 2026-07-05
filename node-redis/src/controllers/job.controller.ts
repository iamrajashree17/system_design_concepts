import { Request, Response } from 'express';
import { jobSchema } from '../validators/job.validator.js';
import { createJob, getJobs, getJobByIdFromSer, updateJobFromSer } from '../services/job.service.js';

export async function getJob(req: Request, res: Response) {
    try {
        const jobs = await getJobs();
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getJobById(req: Request, res: Response) {
    try {
        console.log('Fetching job by ID from controller', req.params);
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid job ID' });
        }

        const job = await getJobByIdFromSer(id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
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

export async function updateJob(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid job ID' });
    }

    const parsed = jobSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
        const updatedJob = await updateJobFromSer(id, parsed.data);
        if (!updatedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}