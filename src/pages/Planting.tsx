import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ref, push, get, remove, update } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { PlantingRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';

function Planting() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { register, handleSubmit, reset, setValue } = useForm<PlantingRecord>({
    defaultValues: { species: '', count: 0, status: 'Active' },
  });
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState<PlantingRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadRecords = async () => {
    try {
      const snapshot = await get(ref(db, 'treePlanting'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRecords(Object.entries(data).map(([id, val]) => ({ id, ...(val as any) })));
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const onSubmit = async (data: PlantingRecord) => {
    setMessage('');
    
    // Prevent duplicate planting records for the same day, village and species
    if (!editingId) {
      const exists = records.some(r => r.village === data.village && r.species === data.species && r.plantingDate === data.plantingDate);
      if (exists) {
        setMessage('A planting record for this species and date already exists in this village.');
        return;
      }
    }

    try {
      if (editingId) {
        await update(ref(db, `treePlanting/${editingId}`), data);
        setMessage('Planting activity updated.');
      } else {
        await push(ref(db, 'treePlanting'), {
          ...data,
          createdAt: Date.now(),
        });
        setMessage('Planting activity saved.');
      }

      reset({ species: '', count: 0, group: '', notes: '', village: '', plantingDate: '', status: 'Active' });
      setEditingId(null);
      loadRecords();
      
      if (!editingId) {
        try {
          const { sendAudit } = await import('../lib/audit');
          sendAudit({ action: 'planting_registered', resource: data.village, details: { species: data.species, count: data.count } });
        } catch {}
      }
    } catch (error) {
      setMessage('Unable to save activity.');
      console.error(error);
    }
  };

  const handleEdit = (record: PlantingRecord) => {
    setEditingId(record.id || null);
    setValue('species', record.species);
    setValue('count', record.count);
    setValue('group', record.group);
    setValue('notes', record.notes);
    setValue('village', record.village);
    setValue('plantingDate', record.plantingDate);
    setValue('status', record.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this planting record?')) return;
    try {
      await remove(ref(db, `treePlanting/${id}`));
      loadRecords();
    } catch (error) {
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
        <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5 h-fit" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">
              {editingId ? 'Edit Record' : 'New Record'}
            </p>
            {editingId && (
              <button type="button" onClick={() => { reset(); setEditingId(null); }} className="text-xs text-red-500 hover:underline">Cancel Edit</button>
            )}
          </div>
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
            {editingId ? 'Update Record' : t('submit')}
          </button>
          {message ? <p className="text-sm text-forest">{message}</p> : null}
        </form>

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">Recent Planting</p>
          <div className="mt-4 space-y-3">
            {records.length ? (
              records.map((record) => (
                <div key={record.id} className="rounded-3xl bg-sand p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-forest">{record.species}</p>
                    {profile?.role !== 'Community Member' && (
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => handleEdit(record)} className="text-forest hover:underline">Edit</button>
                        <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:underline">Del</button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{record.village} • {record.count} trees</p>
                  <p className="mt-1 text-xs text-slate-500">Planted by {record.group}</p>
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
