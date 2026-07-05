import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { db } from '../firebase';

function Reports() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [plantingSnap, incidentSnap, permitSnap] = await Promise.all([
          getDocs(collection(db, 'treePlanting')),
          getDocs(collection(db, 'incidents')),
          getDocs(collection(db, 'permits')),
        ]);
        setItems([
          { title: t('treePlanting'), count: plantingSnap.size },
          { title: t('incidents'), count: incidentSnap.size },
          { title: t('permits'), count: permitSnap.size },
        ]);
      } catch (error) {
        console.error(error);
      }
    };
    loadReports();
  }, [t]);

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(t('reports'), 14, 20);
    doc.setFontSize(12);
    items.forEach((item, index) => {
      doc.text(`${item.title}: ${item.count}`, 14, 35 + index * 10);
    });
    doc.save('cfms-report.pdf');
  };

  const downloadCsv = () => {
    const rows = [['Report', 'Count'], ...items.map((item) => [item.title, item.count])];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cfms-report.csv';
    link.click();
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('reports')}</h2>
        <p className="mt-2 text-sm text-slate-600">Generate simple forest reports for your community.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-3xl border border-earth/10 bg-sand p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{item.title}</p>
            <p className="mt-4 text-3xl font-semibold text-forest">{item.count}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={downloadPdf} className="rounded-3xl bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-earth">
          {t('downloadPdf')}
        </button>
        <button onClick={downloadCsv} className="rounded-3xl border border-earth/20 bg-sand px-6 py-3 text-sm font-semibold text-forest transition hover:bg-sand/80">
          {t('exportExcel')}
        </button>
      </div>
    </div>
  );
}

export default Reports;
