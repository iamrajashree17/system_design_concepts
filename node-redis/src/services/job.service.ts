
import db from '../db.js';
import { redisClient } from '../redis/client.js';
import { JobInput } from '../validators/job.validator.js';

export interface JobRecord extends JobInput {
    id: number;
    created_at: Date;
}

const JOBS_ALL_CACHE_KEY = 'jobs:all';

const JOBS_CACHE_TTL_SECONDS = 60; // Cache TTL in seconds

export async function getJobs(): Promise<JobRecord[]> {
    const cachedJobs = await redisClient.get(JOBS_ALL_CACHE_KEY);
    if (cachedJobs) {
        console.log('Cache hit for jobs');
        return JSON.parse(cachedJobs) as JobRecord[];
    }
    console.log('Cache miss for jobs, fetching from database');
    const jobs = await getAllJobs();
    await redisClient.setEx(
        JOBS_ALL_CACHE_KEY, 
        JOBS_CACHE_TTL_SECONDS, 
        JSON.stringify(jobs)
    );
    return jobs;
}

function getCacheKey(id: number): string {
    return `jobs:id:${id}`;
}

export async function getJobByIdFromSer(id: number): Promise<JobRecord | undefined> {

    const cacheKey = getCacheKey(id);
    const cachedJob = await redisClient.get(cacheKey);

    if (cachedJob) {
        console.log(`Cache hit for job with id ${id}`);
        return JSON.parse(cachedJob) as JobRecord;
    }

    console.log(`Cache miss for job with id ${id}, fetching from database`);
    const job = await getJobFromDB(id);
    
    await redisClient.setEx(
        cacheKey, 
        JOBS_CACHE_TTL_SECONDS, 
        JSON.stringify(job)
    );

    return job;
}

async function getJobFromDB(id: number): Promise<JobRecord | undefined> {
    const result = await db.query<JobRecord>('SELECT * from jobs WHERE id = $1', [id]);
    return result.rows[0];
}

export async function getAllJobs(): Promise<JobRecord[]> {
    const result = await db.query<JobRecord>('SELECT * FROM jobs');
    return result.rows;
}

async function deleteAllJobsCache(): Promise<void> {
    await redisClient.del(JOBS_ALL_CACHE_KEY);
    console.log('Deleted all jobs cache');
}

async function deleteJobCache(id: number): Promise<void> {
    const cacheKey = getCacheKey(id);
    await redisClient.del(cacheKey);
    console.log(`Deleted cache for job with id ${id}`);
}

export async function createJob(data: JobInput): Promise<JobRecord> {
    const { title, description, company, location, salary_min, salary_max } = data;
    const result = await db.query<JobRecord>(
        'INSERT INTO jobs (title, description, company, location, salary_min, salary_max) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, description, company, location, salary_min, salary_max]
    );
    await deleteAllJobsCache(); // Invalidate the cache after inserting a new job
    return result.rows[0];
}

export async function updateJobFromSer(id: number, data: Partial<JobInput>): Promise<JobRecord | undefined> {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
        return Promise.resolve(undefined);
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE jobs SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`; 

    const result = await db.query<JobRecord>(query, [...values, id]);

    await deleteAllJobsCache(); // Invalidate the cache after updating a job
    await deleteJobCache(id); // Delete the specific job cache
        
    return result.rows[0];
}