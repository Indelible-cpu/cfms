import { auth, db } from '../firebase';
import { ref, push } from 'firebase/database';

export async function sendAudit(payload: { action: string; resource?: string; details?: any }) {
  try {
    const user = auth.currentUser;
    await push(ref(db, 'audit_logs'), {
      actor: user ? user.uid : 'anonymous',
      action: payload.action,
      resource: payload.resource || null,
      details: payload.details || null,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('Audit log failed', error);
  }
}
