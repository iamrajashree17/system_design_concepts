import { z } from 'zod';

export const jobSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(255),
    company: z.string().min(1).max(255),
    location: z.string().min(1).max(255),
    salary_min: z.number().optional(),
    salary_max: z.number().optional(),
});

export type JobInput = z.infer<typeof jobSchema>;
