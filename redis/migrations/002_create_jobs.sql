CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
