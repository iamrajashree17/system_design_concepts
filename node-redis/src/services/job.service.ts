import db from '../db.js';
import { JobInput } from '../validators/job.validator.js';

export interface JobRecord extends JobInput {
    id: number;
    created_at: Date;
}

export async function getAllJobs(): Promise<JobRecord[]> {
    const result = await db.query<JobRecord>('SELECT * FROM jobs');
    return result.rows;
}

export async function createJob(data: JobInput): Promise<JobRecord> {
    const { title, description, company, location, salary_min, salary_max } = data;
    const result = await db.query<JobRecord>(
        'INSERT INTO jobs (title, description, company, location, salary_min, salary_max) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, description, company, location, salary_min, salary_max]
    );
    return result.rows[0];
}
