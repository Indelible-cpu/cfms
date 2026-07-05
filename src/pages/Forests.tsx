import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ref, push, get, remove, update } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../lib/storage';
import { ForestRecord } from '../types';


function Forests() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { register, handleSubmit, reset, setValue } = useForm<ForestRecord>({
    defaultValues: { status: 'Active' as const },
  });
  
  const [message, setMessage] = useState('');
  const [forests, setForests] = useState<ForestRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadForests = async () => {
    try {
      const snapshot = await get(ref(db, 'forests'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setForests(Object.entries(data).map(([id, val]) => ({ id, ...(val as any) })));
      } else {
        setForests([]);
      }
    } catch (error) {
      console.error('Load forests error', error);
    }
  };

  useEffect(() => {
    loadForests();
  }, []);

  const onSubmit = async (data: ForestRecord) => {
    setMessage('');
    
    // Duplicate check for new forests
    if (!editingId) {
      const exists = forests.some(f => f.name.toLowerCase() === data.name.toLowerCase() && f.village.toLowerCase() === data.village.toLowerCase());
      if (exists) {
        setMessage('A forest with this name already exists in this village.');
        return;
      }
    }

    try {
      setUploading(true);
      let imageUrl = data.imageUrl || '';
      if (file) {
        imageUrl = await uploadFile(file, 'forests');
      }

      const payload = { ...data, imageUrl };
      
      if (editingId) {
        await update(ref(db, `forests/${editingId}`), payload);
        setMessage('Forest updated successfully.');
      } else {
        await push(ref(db, 'forests'), {
          ...payload,
          createdAt: Date.now(),
        });
        setMessage('Forest registered successfully.');
      }
      
      reset({ status: 'Active' as const, name: '', code: '', village: '', district: '', size: '', gps: '', description: '' });
      setFile(null);
      setEditingId(null);
      loadForests();
    } catch (error) {
      setMessage('Unable to save forest.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (forest: ForestRecord) => {
    setEditingId(forest.id || null);
    setValue('name', forest.name);
    setValue('code', forest.code);
    setValue('village', forest.village);
    setValue('district', forest.district);
    setValue('size', forest.size);
    setValue('gps', forest.gps);
    setValue('description', forest.description);
    setValue('status', forest.status);
    setValue('imageUrl', forest.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this forest?')) return;
    try {
      await remove(ref(db, `forests/${id}`));
      loadForests();
    } catch (error) {
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
          {profile?.role === 'National Director' || profile?.role === 'Forestry Officer' || profile?.role === 'Village Forest Committee' ? (
            <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">
                  {editingId ? 'Edit Forest' : t('forestName')}
                </p>
                {editingId && (
                  <button type="button" onClick={() => { reset(); setEditingId(null); setFile(null); }} className="text-xs text-red-500 hover:underline">Cancel Edit</button>
                )}
              </div>
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
                Photo (Optional)
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2 w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-earth" />
              </label>
              <label className="block text-sm text-forest">
                {t('status')}
                <select {...register('status')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm">
                  <option value="Active">{t('active')}</option>
                  <option value="Protected">{t('protected')}</option>
                  <option value="Under Review">{t('underReview')}</option>
                </select>
              </label>
              <button disabled={uploading} type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth disabled:opacity-50">
                {uploading ? 'Saving...' : editingId ? 'Update Forest' : t('submit')}
              </button>
              {message ? <p className="text-sm text-forest">{message}</p> : null}
            </form>
          ) : (
            <div className="rounded-3xl border border-earth/10 bg-sand p-5">
              <p className="text-sm text-slate-600">You do not have permission to register new forests.</p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">{t('forests')}</p>
          <div className="mt-4 space-y-3">
            {forests.length ? (
              forests.map((forest) => (
                <div key={forest.id} className="overflow-hidden rounded-3xl bg-sand">
                  {forest.imageUrl && (
                    <img src={forest.imageUrl} alt={forest.name} className="h-32 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-forest">{forest.name}</p>
                      {(profile?.role === 'National Director' || profile?.role === 'Forestry Officer' || profile?.role === 'Village Forest Committee') && (
                        <div className="flex gap-2 text-xs">
                          <button onClick={() => handleEdit(forest)} className="text-forest hover:underline">Edit</button>
                          <button onClick={() => handleDelete(forest.id)} className="text-red-500 hover:underline">Del</button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{forest.code} • {forest.village}</p>
                    <p className="mt-2 text-sm text-slate-700">{forest.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white">
                      <span className="rounded-full bg-forest px-3 py-1">{forest.status}</span>
                    </div>
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
