export type AuditPayload = {
  actor?: string;
  action: string;
  resource?: string;
  details?: Record<string, any> | string;
  ts?: string;
};

export async function sendAudit(payload: AuditPayload) {
  try {
    await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // fail silently in UI - audit is best-effort
    console.warn('Audit send failed', err);
  }
}
