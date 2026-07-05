import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

const connectionString = process.env.VERCEL_POSTGRES_URL || process.env.DATABASE_URL;

async function ensureTables(client: Client) {
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST allowed' });
    return;
  }

  if (!connectionString) {
    res.status(500).json({ error: 'No Postgres connection configured' });
    return;
  }

  const payload = req.body;
  const client = new Client({ connectionString });

  try {
    await client.connect();
    await ensureTables(client);
    await client.query(
      'INSERT INTO audit_logs (actor, action, resource, details) VALUES ($1,$2,$3,$4)',
      [payload.actor || null, payload.action, payload.resource || null, payload.details ? JSON.stringify(payload.details) : null]
    );
    await client.end();
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Audit error', err);
    try {
      await client.end();
    } catch {}
    res.status(500).json({ error: 'Unable to record audit' });
  }
}
