import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { WorkOpportunity, WorkRegistration } from '../types';

function Work() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [opportunities, setOpportunities] = useState<WorkOpportunity[]>([]);
  const [registrations, setRegistrations] = useState<WorkRegistration[]>([]);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, reset } = useForm<WorkOpportunity>({
    defaultValues: { type: '', status: 'Open' as const },
  });
  const { register: registerVolunteer, handleSubmit: handleSubmitVolunteer, reset: resetVolunteer } = useForm<WorkRegistration>({
    defaultValues: { gender: '', ageGroup: '', availability: '', village: '' },
  });

  const loadWork = async () => {
    try {
      const [oppSnap, regSnap] = await Promise.all([
        getDocs(collection(db, 'workOpportunities')),
        getDocs(collection(db, 'workRegistrations')),
      ]);
      setOpportunities(oppSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as WorkOpportunity) })));
      setRegistrations(regSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as WorkRegistration) })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadWork();
  }, []);

  const onCreateOpportunity = async (data: WorkOpportunity) => {
    setMessage('');
    try {
      await addDoc(collection(db, 'workOpportunities'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setMessage('Work opportunity created.');
      reset({ type: '', status: 'Open', title: '', description: '', village: '', date: '', startTime: '', endTime: '', requiredParticipants: 0, coordinator: '' });
      loadWork();
    } catch (error) {
      setMessage('Unable to create opportunity.');
      console.error(error);
    }
  };

  const onRegisterVolunteer = async (data: WorkRegistration) => {
    setMessage('');
    try {
      await addDoc(collection(db, 'workRegistrations'), {
        ...data,
        registrationNumber: `WORK-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        createdAt: serverTimestamp(),
      });
      setMessage('Registration saved.');
      resetVolunteer({ gender: '', ageGroup: '', availability: '', name: '', phone: '', village: '' });
      loadWork();
      try {
        // send to Postgres work registration endpoint
        await fetch('/api/work/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opportunityId: data.opportunityId || null,
            name: data.name,
            phone: data.phone,
            village: data.village,
            gender: data.gender,
            ageGroup: data.ageGroup,
            availability: data.availability,
            registrationNumber: `WORK-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          }),
        });
      } catch (err) {
        console.warn('Work registration replicate failed', err);
      }
      try {
        const { sendAudit } = await import('../lib/audit');
        sendAudit({ action: 'work_registered', resource: data.village, details: { name: data.name, village: data.village } });
      } catch {}
    } catch (error) {
      setMessage('Unable to save registration.');
      console.error(error);
    }
  };

  const markAttendance = async (registration: WorkRegistration, attendance: 'Present' | 'Absent') => {
    if (!registration.id) return;
    try {
      const ref = doc(db, 'workRegistrations', registration.id);
      await updateDoc(ref, { attendance });
      loadWork();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('work')}</h2>
        <p className="mt-2 text-sm text-slate-600">Manage community forestry work and volunteer participation.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {profile?.role !== 'Community Member' ? (
          <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5" onSubmit={handleSubmit(onCreateOpportunity)}>
            <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('workOpportunities')}</p>
            <label className="block text-sm text-forest">
              {t('activityTitle')}
              <input {...register('title', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('activityType')}
              <input {...register('type', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('description')}
              <textarea {...register('description')} rows={3} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('village')}
              <input {...register('village', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-forest">
                {t('date')}
                <input type="date" {...register('date', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
              </label>
              <label className="block text-sm text-forest">
                {t('startTime')}
                <input type="time" {...register('startTime', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-forest">
                {t('endTime')}
                <input type="time" {...register('endTime', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
              </label>
              <label className="block text-sm text-forest">
                {t('numberOfRequiredParticipants')}
                <input type="number" {...register('requiredParticipants', { required: true, min: 1 })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
              </label>
            </div>
            <label className="block text-sm text-forest">
              {t('coordinator')}
              <input {...register('coordinator', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <button type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth">
              {t('submit')}
            </button>
          </form>
        ) : null}

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('registerForWork')}</p>
          <form className="mt-4 space-y-4" onSubmit={handleSubmitVolunteer(onRegisterVolunteer)}>
            <label className="block text-sm text-forest">
              {t('fullName')}
              <input {...registerVolunteer('name', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('phoneNumber')}
              <input {...registerVolunteer('phone', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('village')}
              <input {...registerVolunteer('village', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-forest">
                {t('gender')}
                <input {...registerVolunteer('gender')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm" />
              </label>
              <label className="block text-sm text-forest">
                {t('ageGroup')}
                <input {...registerVolunteer('ageGroup', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm" />
              </label>
            </div>
            <label className="block text-sm text-forest">
              {t('availability')}
              <input {...registerVolunteer('availability', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm" />
            </label>
            <button type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth">
              {t('submit')}
            </button>
          </form>
          {message ? <p className="mt-3 text-sm text-forest">{message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-earth/10 bg-sand p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('workOpportunities')}</p>
          <div className="mt-4 space-y-3">
            {opportunities.length ? (
              opportunities.map((opp) => (
                <div key={opp.id} className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-forest">{opp.title}</p>
                  <p className="text-sm text-slate-600">{opp.type} • {opp.village}</p>
                  <p className="mt-2 text-sm text-slate-700">{opp.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-earth/70">{opp.status}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No open opportunities.</p>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-earth/10 bg-sand p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('registeredParticipants')}</p>
          <div className="mt-4 space-y-3">
            {registrations.length ? (
              registrations.map((reg) => (
                <div key={reg.id} className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-forest">{reg.name}</p>
                  <p className="text-sm text-slate-600">{reg.village} • {reg.registrationNumber}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => markAttendance(reg, 'Present')}
                      className="rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white"
                    >
                      {t('present')}
                    </button>
                    <button
                      type="button"
                      onClick={() => markAttendance(reg, 'Absent')}
                      className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      {t('absent')}
                    </button>
                    {reg.attendance ? <span className="rounded-full bg-sand px-3 py-1 text-xs text-forest">{reg.attendance}</span> : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No registrations yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Work;
