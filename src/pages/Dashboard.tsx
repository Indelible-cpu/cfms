import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, limit, Timestamp } from 'firebase/firestore';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function buildSeries(docs: any[], dateField: string) {
  const series = months.map((name) => ({ name, value: 0 }));
  docs.forEach((doc) => {
    const data = doc.data();
    const timestamp = data[dateField] as Timestamp;
    const date = timestamp?.toDate?.();
    if (date) {
      const month = date.getMonth();
      const index = month < series.length ? month : 0;
      series[index].value += data.count || 1;
    }
  });
  return series;
}

function Dashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [stats, setStats] = useState({ forests: 0, trees: 0, permits: 0, incidents: 0, villages: 0 });
  const [plantingSeries, setPlantingSeries] = useState(months.map((name) => ({ name, value: 0 })));
  const [incidentSeries, setIncidentSeries] = useState(months.map((name) => ({ name, value: 0 })));
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [forestSnap, plantingSnap, incidentSnap, permitSnap, villageSnap] = await Promise.all([
          getDocs(collection(db, 'forests')),
          getDocs(collection(db, 'treePlanting')),
          getDocs(collection(db, 'incidents')),
          getDocs(collection(db, 'permits')),
          getDocs(collection(db, 'villages')),
        ]);

        const counts = {
          forests: forestSnap.size,
          trees: plantingSnap.docs.reduce((sum, doc) => sum + (doc.data().count || 0), 0),
          permits: permitSnap.docs.filter((doc) => doc.data().status === 'Approved').length,
          incidents: incidentSnap.size,
          villages: villageSnap.size,
        };

        setStats(counts);
        setPlantingSeries(buildSeries(plantingSnap.docs, 'plantingDate'));
        setIncidentSeries(buildSeries(incidentSnap.docs, 'incidentDate'));

        const activities = [
          ...incidentSnap.docs.slice(0, 2).map((doc) => `⚠️ ${doc.data().type} - ${doc.data().village}`),
          ...plantingSnap.docs.slice(0, 2).map((doc) => `🌱 ${doc.data().species} - ${doc.data().village}`),
          ...permitSnap.docs.slice(0, 2).map((doc) => `📝 ${doc.data().requestType} - ${doc.data().status}`),
        ];
        setRecent(activities);
      } catch (error) {
        console.warn('Unable to load dashboard data', error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: t('activeForests'), value: stats.forests },
          { label: t('treesPlanted'), value: stats.trees },
          { label: t('activePermits'), value: stats.permits },
          { label: t('incidentsReported'), value: stats.incidents },
          { label: t('villagesRegistered'), value: stats.villages },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold text-forest">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">{t('monthlyPlanting')}</p>
            <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-forest">{profile?.role}</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plantingSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d4" />
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#2f6b35" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">{t('monthlyIncidents')}</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d4" />
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#7b4f2a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">{t('quickActions')}</p>
            <span className="text-sm text-slate-500">{t('communityWork')}</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link
              to="/incidents"
              className="rounded-3xl bg-forest px-4 py-4 text-center text-sm font-semibold text-white transition hover:bg-earth"
            >
              {t('reportIncident')}
            </Link>
            <Link
              to="/planting"
              className="rounded-3xl border border-earth/20 bg-sand px-4 py-4 text-center text-sm font-semibold text-forest transition hover:bg-sand/80"
            >
              {t('registerPlanting')}
            </Link>
            <Link
              to="/permits"
              className="rounded-3xl border border-earth/20 bg-sand px-4 py-4 text-center text-sm font-semibold text-forest transition hover:bg-sand/80"
            >
              {t('requestPermit')}
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">{t('recentActivities')}</p>
          <div className="mt-4 space-y-3">
            {recent.length > 0 ? (
              recent.map((item, index) => (
                <div key={index} className="rounded-3xl bg-sand p-4 text-sm text-forest/80">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No recent activities yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
