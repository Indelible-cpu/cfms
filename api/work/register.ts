import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

const connectionString = process.env.VERCEL_POSTGRES_URL || process.env.DATABASE_URL;

async function ensureTables(client: Client) {
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send({ error: 'POST only' });
  if (!connectionString) return res.status(500).json({ error: 'No Postgres connection configured' });

  const data = req.body;
  const client = new Client({ connectionString });

  try {
    await client.connect();
    await ensureTables(client);
    const result = await client.query(
      `INSERT INTO work_registrations (opportunity_id,name,phone,village,gender,age_group,availability,registration_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        data.opportunityId || null,
        data.name,
        data.phone || null,
        data.village || null,
        data.gender || null,
        data.ageGroup || null,
        data.availability || null,
        data.registrationNumber || null,
      ]
    );
    await client.end();
    res.status(200).json({ ok: true, record: result.rows[0] });
  } catch (err) {
    console.error('Work register error', err);
    try {
      await client.end();
    } catch {}
    res.status(500).json({ error: 'Unable to save registration' });
  }
}
