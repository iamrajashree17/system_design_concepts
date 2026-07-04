import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'migrations');

async function ensureMigrationsTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
    const result = await db.query('SELECT filename FROM schema_migrations');
    return new Set(result.rows.map((row) => row.filename));
}

async function runMigration(filename: string) {
    const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf-8');
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log(`Applied: ${filename}`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function main() {
    await ensureMigrationsTable();
    const applied = await getAppliedMigrations();

    const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
        console.log('No pending migrations.');
        return;
    }

    for (const file of pending) {
        await runMigration(file);
    }

    console.log(`Applied ${pending.length} migration(s).`);
}

try {
    await main();
    process.exit(0);
} catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
}
