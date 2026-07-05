import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ref, push, get, remove, update } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { VillageRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';

function Villages() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { register, handleSubmit, reset, setValue } = useForm<VillageRecord>();
  const [message, setMessage] = useState('');
  const [villages, setVillages] = useState<VillageRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadVillages = async () => {
    try {
      const snapshot = await get(ref(db, 'villages'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setVillages(Object.entries(data).map(([id, val]) => ({ id, ...(val as any) })));
      } else {
        setVillages([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadVillages();
  }, []);

  const onSubmit = async (data: VillageRecord) => {
    setMessage('');
    
    // Duplicate check for new villages
    if (!editingId) {
      const exists = villages.some(v => v.name.toLowerCase() === data.name.toLowerCase() && v.district.toLowerCase() === data.district.toLowerCase());
      if (exists) {
        setMessage('A village with this name already exists in this district.');
        return;
      }
    }

    try {
      if (editingId) {
        await update(ref(db, `villages/${editingId}`), data);
        setMessage('Village updated.');
      } else {
        await push(ref(db, 'villages'), {
          ...data,
          createdAt: Date.now(),
        });
        setMessage('Village registered.');
      }
      reset();
      setEditingId(null);
      loadVillages();
    } catch (error) {
      setMessage('Unable to save village.');
      console.error(error);
    }
  };

  const handleEdit = (village: VillageRecord) => {
    setEditingId(village.id || null);
    setValue('name', village.name);
    setValue('authority', village.authority);
    setValue('district', village.district);
    setValue('population', village.population);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this village?')) return;
    try {
      await remove(ref(db, `villages/${id}`));
      loadVillages();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('villages')}</h2>
        <p className="mt-2 text-sm text-slate-600">Create village profiles and keep track of community forests.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {profile?.role !== 'Community Member' ? (
          <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5 h-fit" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">
                {editingId ? 'Edit Village' : t('villageName')}
              </p>
              {editingId && (
                <button type="button" onClick={() => { reset(); setEditingId(null); }} className="text-xs text-red-500 hover:underline">Cancel Edit</button>
              )}
            </div>
            <label className="block text-sm text-forest">
              {t('villageName')}
              <input {...register('name', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('traditionalAuthority')}
              <input {...register('authority')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('district')}
              <input {...register('district', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('population')}
              <input {...register('population')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <button type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth">
              {editingId ? 'Update Village' : t('submit')}
            </button>
            {message ? <p className="text-sm text-forest">{message}</p> : null}
          </form>
        ) : (
          <div className="rounded-3xl border border-earth/10 bg-sand p-5 h-fit">
            <p className="text-sm text-slate-600">Only officials can register or edit villages.</p>
          </div>
        )}

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('villages')}</p>
          <div className="mt-4 space-y-3">
            {villages.length ? (
              villages.map((village) => (
                <div key={village.id} className="rounded-3xl bg-sand p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-forest">{village.name}</p>
                    {profile?.role !== 'Community Member' && (
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => handleEdit(village)} className="text-forest hover:underline">Edit</button>
                        <button onClick={() => handleDelete(village.id)} className="text-red-500 hover:underline">Del</button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{village.authority || '—'} • {village.district}</p>
                  {village.population ? <p className="text-sm text-slate-600">{t('population')}: {village.population}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No villages registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Villages;
