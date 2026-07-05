import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ref, push, get, remove, update } from 'firebase/database';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { WorkOpportunity, WorkRegistration } from '../types';

function Work() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [opportunities, setOpportunities] = useState<WorkOpportunity[]>([]);
  const [registrations, setRegistrations] = useState<WorkRegistration[]>([]);
  
  const [oppMessage, setOppMessage] = useState('');
  const [regMessage, setRegMessage] = useState('');
  
  const [editingOppId, setEditingOppId] = useState<string | null>(null);

  const { register: registerOpp, handleSubmit: handleSubmitOpp, reset: resetOpp, setValue: setOppValue } = useForm<WorkOpportunity>({
    defaultValues: { type: '', status: 'Open' as const },
  });
  
  const { register: registerVolunteer, handleSubmit: handleSubmitVolunteer, reset: resetVolunteer } = useForm<WorkRegistration>({
    defaultValues: { gender: '', ageGroup: '', availability: '', village: '' },
  });

  const loadWork = async () => {
    try {
      const [oppSnap, regSnap] = await Promise.all([
        get(ref(db, 'workOpportunities')),
        get(ref(db, 'workRegistrations')),
      ]);
      if (oppSnap.exists()) {
        const data = oppSnap.val();
        setOpportunities(Object.entries(data).map(([id, val]) => ({ id, ...(val as any) })));
      } else {
        setOpportunities([]);
      }
      if (regSnap.exists()) {
        const data = regSnap.val();
        setRegistrations(Object.entries(data).map(([id, val]) => ({ id, ...(val as any) })));
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadWork();
  }, []);

  const onCreateOpportunity = async (data: WorkOpportunity) => {
    setOppMessage('');
    
    // Duplicate check
    if (!editingOppId) {
      const exists = opportunities.some(o => o.title.toLowerCase() === data.title.toLowerCase() && o.village.toLowerCase() === data.village.toLowerCase() && o.date === data.date);
      if (exists) {
        setOppMessage('This work opportunity already exists for this date and village.');
        return;
      }
    }

    try {
      if (editingOppId) {
        await update(ref(db, `workOpportunities/${editingOppId}`), data);
        setOppMessage('Work opportunity updated.');
      } else {
        await push(ref(db, 'workOpportunities'), {
          ...data,
          createdAt: Date.now(),
        });
        setOppMessage('Work opportunity created.');
      }
      resetOpp({ type: '', status: 'Open', title: '', description: '', village: '', date: '', startTime: '', endTime: '', requiredParticipants: 0, coordinator: '' });
      setEditingOppId(null);
      loadWork();
    } catch (error) {
      setOppMessage('Unable to save opportunity.');
      console.error(error);
    }
  };

  const handleEditOpp = (opp: WorkOpportunity) => {
    setEditingOppId(opp.id || null);
    setOppValue('title', opp.title);
    setOppValue('type', opp.type);
    setOppValue('description', opp.description);
    setOppValue('village', opp.village);
    setOppValue('date', opp.date);
    setOppValue('startTime', opp.startTime);
    setOppValue('endTime', opp.endTime);
    setOppValue('requiredParticipants', opp.requiredParticipants);
    setOppValue('coordinator', opp.coordinator);
    setOppValue('status', opp.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteOpp = async (id?: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await remove(ref(db, `workOpportunities/${id}`));
      loadWork();
    } catch (error) {
      console.error(error);
    }
  };

  const onRegisterVolunteer = async (data: WorkRegistration) => {
    setRegMessage('');
    
    const exists = registrations.some(r => r.name === data.name && r.phone === data.phone && r.village === data.village);
    if (exists) {
      setRegMessage('You are already registered for a work opportunity.');
      return;
    }

    try {
      await push(ref(db, 'workRegistrations'), {
        ...data,
        registrationNumber: `WORK-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        createdAt: Date.now(),
      });
      setRegMessage('Registration saved.');
      resetVolunteer({ gender: '', ageGroup: '', availability: '', name: '', phone: '', village: '' });
      loadWork();
      
      try {
        const { sendAudit } = await import('../lib/audit');
        sendAudit({ action: 'work_registered', resource: data.village, details: { name: data.name, village: data.village } });
      } catch {}
    } catch (error) {
      setRegMessage('Unable to save registration.');
      console.error(error);
    }
  };

  const markAttendance = async (registration: WorkRegistration, attendance: 'Present' | 'Absent') => {
    if (!registration.id) return;
    try {
      await update(ref(db, `workRegistrations/${registration.id}`), { attendance });
      loadWork();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteReg = async (id?: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this registration?')) return;
    try {
      await remove(ref(db, `workRegistrations/${id}`));
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
          <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5 h-fit" onSubmit={handleSubmitOpp(onCreateOpportunity)}>
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">
                {editingOppId ? 'Edit Opportunity' : t('workOpportunities')}
              </p>
              {editingOppId && (
                <button type="button" onClick={() => { resetOpp(); setEditingOppId(null); }} className="text-xs text-red-500 hover:underline">Cancel Edit</button>
              )}
            </div>
            <label className="block text-sm text-forest">
              {t('activityTitle')}
              <input {...registerOpp('title', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('activityType')}
              <input {...registerOpp('type', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('description')}
              <textarea {...registerOpp('description')} rows={3} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              {t('village')}
              <input {...registerOpp('village', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-forest">
                {t('date')}
                <input type="date" {...registerOpp('date', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
              </label>
              <label className="block text-sm text-forest">
                {t('startTime')}
                <input type="time" {...registerOpp('startTime', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-forest">
                {t('endTime')}
                <input type="time" {...registerOpp('endTime', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
              </label>
              <label className="block text-sm text-forest">
                {t('numberOfRequiredParticipants')}
                <input type="number" {...registerOpp('requiredParticipants', { required: true, min: 1 })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
              </label>
            </div>
            <label className="block text-sm text-forest">
              {t('coordinator')}
              <input {...registerOpp('coordinator', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <button type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth">
              {editingOppId ? 'Update' : t('submit')}
            </button>
            {oppMessage ? <p className="text-sm text-forest">{oppMessage}</p> : null}
          </form>
        ) : null}

        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm h-fit">
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
          {regMessage ? <p className="mt-3 text-sm text-forest">{regMessage}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-earth/10 bg-sand p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('workOpportunities')}</p>
          <div className="mt-4 space-y-3">
            {opportunities.length ? (
              opportunities.map((opp) => (
                <div key={opp.id} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-forest">{opp.title}</p>
                    {profile?.role !== 'Community Member' && (
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => handleEditOpp(opp)} className="text-forest hover:underline">Edit</button>
                        <button onClick={() => handleDeleteOpp(opp.id)} className="text-red-500 hover:underline">Del</button>
                      </div>
                    )}
                  </div>
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
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-forest">{reg.name}</p>
                    {profile?.role !== 'Community Member' && (
                      <button onClick={() => handleDeleteReg(reg.id)} className="text-xs text-red-500 hover:underline">Del</button>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{reg.village} • {reg.registrationNumber}</p>
                  {profile?.role !== 'Community Member' && (
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
                    </div>
                  )}
                  {reg.attendance ? <p className="mt-2 inline-block rounded-full bg-sand px-3 py-1 text-xs text-forest">{reg.attendance}</p> : null}
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
