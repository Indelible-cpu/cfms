import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { VillageRecord } from '../types';

function Villages() {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<VillageRecord>();
  const [message, setMessage] = useState('');
  const [villages, setVillages] = useState<VillageRecord[]>([]);

  const loadVillages = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'villages'));
      setVillages(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as VillageRecord) })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadVillages();
  }, []);

  const onSubmit = async (data: VillageRecord) => {
    setMessage('');
    try {
      await addDoc(collection(db, 'villages'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setMessage('Village registered.');
      reset();
      loadVillages();
    } catch (error) {
      setMessage('Unable to save village.');
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
        <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5" onSubmit={handleSubmit(onSubmit)}>
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
            {t('submit')}
          </button>
          {message ? <p className="text-sm text-forest">{message}</p> : null}
        </form>

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('villages')}</p>
          <div className="mt-4 space-y-3">
            {villages.length ? (
              villages.map((village) => (
                <div key={village.id} className="rounded-3xl bg-sand p-4">
                  <p className="font-semibold text-forest">{village.name}</p>
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
