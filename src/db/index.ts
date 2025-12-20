import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema'; // 👈 IMPORT YOUR SCHEMA

const connectionString = process.env.DATABASE_URL!;

// "prepare: false" is strictly required for Supabase Transaction Pooler
const client = postgres(connectionString, { prepare: false });

// 👈 PASS THE SCHEMA TO DRIZZLE
export const db = drizzle(client, { schema });