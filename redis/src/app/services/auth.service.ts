import db from '../db.js';

export interface UserRecord {
    id: number;
    email: string;
    password_hash: string;
    created_at: Date;
}

export interface PublicUser {
    id: number;
    email: string;
    created_at: Date;
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
    const result = await db.query<UserRecord>(
        'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0];
}

export async function findUserById(id: number): Promise<PublicUser | undefined> {
    const result = await db.query<PublicUser>('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

export async function createUser(email: string, passwordHash: string): Promise<PublicUser> {
    const result = await db.query<PublicUser>(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email, passwordHash]
    );
    return result.rows[0];
}
