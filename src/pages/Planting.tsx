import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { PlantingRecord } from '../types';

function Planting() {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<PlantingRecord>({
    defaultValues: { species: '', count: 0, status: 'Active' },
  });
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState<PlantingRecord[]>([]);

  const loadRecords = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'treePlanting'));
      setRecords(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as PlantingRecord) })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const onSubmit = async (data: PlantingRecord) => {
    setMessage('');
    try {
      await addDoc(collection(db, 'treePlanting'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setMessage('Planting activity saved.');
      reset({ species: '', count: 0, group: '', notes: '', village: '', plantingDate: '', status: 'Active' });
      loadRecords();
      try {
        const { sendAudit } = await import('../lib/audit');
        sendAudit({ action: 'planting_registered', resource: data.village, details: { species: data.species, count: data.count } });
      } catch {}
    } catch (error) {
      setMessage('Unable to save activity.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('planting')}</h2>
        <p className="mt-2 text-sm text-slate-600">Record tree planting activity in your community.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm text-forest">
            {t('plantingDate')}
            <input type="date" {...register('plantingDate', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            {t('village')}
            <input {...register('village', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            {t('treeSpecies')}
            <input {...register('species', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            {t('numberOfTrees')}
            <input type="number" {...register('count', { required: true, min: 1 })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            {t('groupResponsible')}
            <input {...register('group', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            {t('description')}
            <textarea {...register('notes')} rows={3} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <button type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth">
            {t('submit')}
          </button>
          {message ? <p className="text-sm text-forest">{message}</p> : null}
        </form>

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">Recent Planting</p>
          <div className="mt-4 space-y-3">
            {records.length ? (
              records.slice(0, 5).map((record) => (
                <div key={record.id} className="rounded-3xl bg-sand p-4">
                  <p className="font-semibold text-forest">{record.species}</p>
                  <p className="text-sm text-slate-600">{record.village} • {record.count} trees</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No planting records yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planting;
