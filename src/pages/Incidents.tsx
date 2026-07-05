import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { IncidentRecord } from '../types';

function Incidents() {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<IncidentRecord>({
    defaultValues: { type: 'Illegal Tree Cutting', status: 'New' },
  });
  const [message, setMessage] = useState('');
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);

  const loadIncidents = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'incidents'));
      setIncidents(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as IncidentRecord) })));
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
      await addDoc(collection(db, 'incidents'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setMessage('Incident report submitted.');
      reset({ type: 'Illegal Tree Cutting', status: 'New', incidentDate: '', village: '', description: '' });
      loadIncidents();
      try {
        const { sendAudit } = await import('../lib/audit');
        sendAudit({ action: 'incident_report', resource: data.village, details: { type: data.type, village: data.village } });
      } catch {}
    } catch (error) {
      setMessage('Unable to send incident report.');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('incidents')}</h2>
        <p className="mt-2 text-sm text-slate-600">Report illegal forest activity quickly and clearly.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5" onSubmit={handleSubmit(onSubmit)}>
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
          <button type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth">
            {t('submit')}
          </button>
          {message ? <p className="text-sm text-forest">{message}</p> : null}
        </form>

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('recentActivities')}</p>
          <div className="mt-4 space-y-3">
            {incidents.length ? (
              incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="rounded-3xl bg-sand p-4">
                  <p className="font-semibold text-forest">{incident.type}</p>
                  <p className="text-sm text-slate-600">{incident.village} • {incident.status}</p>
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
