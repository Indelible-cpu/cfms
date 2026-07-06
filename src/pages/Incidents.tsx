import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ref, push, get, remove, update } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { IncidentRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../lib/storage';

function Incidents() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { register, handleSubmit, reset } = useForm<IncidentRecord>({
    defaultValues: { type: 'Illegal Tree Cutting', status: 'New' },
  });
  const [message, setMessage] = useState('');
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const loadIncidents = async () => {
    try {
      const snapshot = await get(ref(db, 'incidents'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setIncidents(Object.entries(data).map(([id, val]) => ({ id, ...(val as any) })));
      } else {
        setIncidents([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const onSubmit = async (data: IncidentRecord) => {
    setMessage('');
    try {
      setUploading(true);
      let imageUrl = '';
      if (file) {
        imageUrl = await uploadFile(file, 'incidents');
      }

      await push(ref(db, 'incidents'), {
        ...data,
        imageUrl,
        createdAt: Date.now(),
      });
      setMessage('Incident report submitted.');
      reset({ type: 'Illegal Tree Cutting', status: 'New', incidentDate: '', village: '', description: '' });
      setFile(null);
      loadIncidents();
      
      try {
        const { sendAudit } = await import('../lib/audit');
        sendAudit({ action: 'incident_report', resource: data.village, details: { type: data.type, village: data.village } });
      } catch {}
    } catch (error) {
      setMessage('Unable to send incident report.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (id: string, status: IncidentRecord['status']) => {
    try {
      await update(ref(db, `incidents/${id}`), { status });
      loadIncidents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this incident report?')) return;
    try {
      await remove(ref(db, `incidents/${id}`));
      loadIncidents();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('incidents')}</h2>
        <p className="mt-2 text-sm text-slate-600">Report illegal forest activity quickly and clearly.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5 h-fit" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">New Report</p>
          <label className="block text-sm text-forest">
            {t('incidentType')}
            <select {...register('type')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm">
              <option value="Illegal Tree Cutting">{t('illegalTreeCutting')}</option>
              <option value="Bush Fire">{t('bushFire')}</option>
              <option value="Charcoal Burning">{t('charcoalBurning')}</option>
              <option value="Encroachment">{t('encroachment')}</option>
              <option value="Other">{t('other')}</option>
            </select>
          </label>
          <label className="block text-sm text-forest">
            {t('date')}
            <input type="date" {...register('incidentDate', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            {t('village')}
            <input {...register('village', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            {t('description')}
            <textarea {...register('description', { required: true })} rows={4} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm text-forest">
            Photo Evidence (Optional)
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2 w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-earth" />
          </label>
          <button disabled={uploading} type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth disabled:opacity-50">
            {uploading ? 'Submitting...' : t('submit')}
          </button>
          {message ? <p className="text-sm text-forest">{message}</p> : null}
        </form>

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('recentActivities')}</p>
          <div className="mt-4 space-y-4">
            {incidents.length ? (
              incidents.map((incident) => (
                <div key={incident.id} className="overflow-hidden rounded-3xl bg-sand shadow-sm">
                  {incident.imageUrl && (
                    <img src={incident.imageUrl} alt={incident.type} className="h-32 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-forest">{incident.type}</p>
                      {profile?.role !== 'Community Member' && (
                        <button onClick={() => handleDelete(incident.id)} className="text-xs text-red-500 hover:underline">Del</button>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{incident.village} • {incident.incidentDate}</p>
                    <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{incident.description}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">{incident.status}</span>
                      
                      {profile?.role !== 'Community Member' && incident.id && (
                        <select 
                          value={incident.status}
                          onChange={(e) => updateStatus(incident.id as string, e.target.value as IncidentRecord['status'])}
                          className="rounded-full border border-earth/20 bg-white px-2 py-1 text-xs text-forest outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Investigating">Investigating</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No incident reports yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Incidents;
