import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function ensureTables() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // Create audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    console.log("Verified audit_logs table.");

    // Create work_registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_registrations (
        id SERIAL PRIMARY KEY,
        opportunity_id TEXT,
        name TEXT NOT NULL,
        phone TEXT,
        village TEXT,
        gender TEXT,
        age_group TEXT,
        availability TEXT,
        registration_number TEXT,
        attendance TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    console.log("Verified work_registrations table.");

    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Initialization error:", err);
  } finally {
    await client.end();
  }
}

ensureTables();
