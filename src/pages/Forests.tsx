import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { ForestRecord } from '../types';

function Forests() {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<ForestRecord>({
    defaultValues: { status: 'Active' as const },
  });
  const [message, setMessage] = useState('');
  const [forests, setForests] = useState<ForestRecord[]>([]);

  const loadForests = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'forests'));
      setForests(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ForestRecord) })));
    } catch (error) {
      console.error('Load forests error', error);
    }
  };

  useEffect(() => {
    loadForests();
  }, []);

  const onSubmit = async (data: ForestRecord) => {
    setMessage('');
    try {
      await addDoc(collection(db, 'forests'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setMessage('Forest registered successfully.');
      reset({ status: 'Active' as const });
      loadForests();
    } catch (error) {
      setMessage('Unable to save forest.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('forests')}</h2>
        <p className="mt-2 text-sm text-slate-600">Register new community forest and view existing records.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5" onSubmit={handleSubmit(onSubmit)}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">{t('forestName')}</p>
            <label className="block text-sm text-forest">
              {t('forestName')}
              <input {...register('name', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('forestCode')}
              <input {...register('code', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('village')}
              <input {...register('village', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('district')}
              <input {...register('district', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('forestSize')}
              <input {...register('size')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('gpsLocation')}
              <input {...register('gps')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('description')}
              <textarea {...register('description')} rows={3} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('status')}
              <select {...register('status')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm">
                <option value="Active">{t('active')}</option>
                <option value="Protected">{t('protected')}</option>
                <option value="Under Review">{t('underReview')}</option>
              </select>
            </label>
            <button type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth">
              {t('submit')}
            </button>
            {message ? <p className="text-sm text-forest">{message}</p> : null}
          </form>
        </div>

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">{t('forests')}</p>
          <div className="mt-4 space-y-3">
            {forests.length ? (
              forests.map((forest) => (
                <div key={forest.id} className="rounded-3xl bg-sand p-4">
                  <p className="font-semibold text-forest">{forest.name}</p>
                  <p className="text-sm text-slate-600">{forest.code} • {forest.village}</p>
                  <p className="mt-2 text-sm text-slate-700">{forest.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-white">
                    <span className="rounded-full bg-forest px-3 py-1">{forest.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No forests registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forests;
