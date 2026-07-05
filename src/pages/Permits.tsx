import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { PermitRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';

function Permits() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { register, handleSubmit, reset } = useForm<PermitRecord>({
    defaultValues: { requestType: 'Firewood Collection', status: 'Pending' },
  });
  const [message, setMessage] = useState('');
  const [permits, setPermits] = useState<PermitRecord[]>([]);

  const loadPermits = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'permits'));
      setPermits(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as PermitRecord) })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadPermits();
  }, []);

  const onSubmit = async (data: PermitRecord) => {
    setMessage('');
    try {
      const permitRef = await addDoc(collection(db, 'permits'), {
        ...data,
        permitNumber: `PER-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        createdAt: serverTimestamp(),
      });
      setMessage('Permit request submitted.');
      reset({ requestType: 'Firewood Collection', status: 'Pending', village: '', reason: '' });
      loadPermits();
      try {
        const { sendAudit } = await import('../lib/audit');
        sendAudit({ action: 'permit_requested', resource: data.village, details: { type: data.requestType, permitNumber: permitRef?.id || null } });
      } catch {}
    } catch (error) {
      setMessage('Unable to submit permit request.');
      console.error(error);
    }
  };

  const updateStatus = async (permit: PermitRecord, status: PermitRecord['status']) => {
    if (!permit.id) return;
    try {
      const permitDoc = doc(db, 'permits', permit.id);
      await updateDoc(permitDoc, { status });
      loadPermits();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('permits')}</h2>
        <p className="mt-2 text-sm text-slate-600">Request and manage permit applications for community forestry work.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm text-forest">
            {t('requestType')}
            <select {...register('requestType')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm">
              <option value="Firewood Collection">{t('firewoodCollection')}</option>
              <option value="Timber Harvesting">{t('timberHarvesting')}</option>
              <option value="Grass Collection">{t('grassCollection')}</option>
              <option value="Beekeeping">{t('beekeeping')}</option>
              <option value="Research Activities">{t('researchActivities')}</option>
            </select>
          </label>
          <label className="block text-sm text-forest">
            {t('village')}
            <input {...register('village', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            {t('reason')}
            <textarea {...register('reason', { required: true })} rows={3} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <button type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth">
            {t('submit')}
          </button>
          {message ? <p className="text-sm text-forest">{message}</p> : null}
        </form>

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('activePermits')}</p>
          <div className="mt-4 space-y-3">
            {permits.length ? (
              permits.map((permit) => (
                <div key={permit.id} className="rounded-3xl bg-sand p-4">
                  <p className="font-semibold text-forest">{permit.requestType}</p>
                  <p className="text-sm text-slate-600">{permit.village} • {permit.permitNumber}</p>
                  <p className="mt-2 text-sm text-slate-700">{permit.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-forest/10 px-3 py-1 text-xs text-forest">{permit.status}</span>
                    {profile?.role !== 'Community Member' && permit.status === 'Pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateStatus(permit, 'Approved')}
                          className="rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(permit, 'Rejected')}
                          className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No permit requests yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Permits;
