import { useTranslation } from 'react-i18next';

const resources = [
  { titleKey: 'treePlantingResources', description: 'Learn how to plant and care for tree seedlings in your village.' },
  { titleKey: 'firePreventionResources', description: 'Steps to prevent bush fires and protect forest patrols.' },
  { titleKey: 'forestConservationResources', description: 'Simple ways to keep community forests healthy long term.' },
  { titleKey: 'sustainableUseResources', description: 'Use forest resources wisely for people and nature.' },
];

function Education() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('educationCenter')}</h2>
        <p className="mt-2 text-sm text-slate-600">Easy forestry guidance for the whole village.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((item) => (
          <div key={item.titleKey} className="rounded-3xl border border-earth/10 bg-sand p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-forest">{t(item.titleKey)}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">{item.description}</p>
            <button className="mt-4 rounded-3xl bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-earth">
              {t('downloadPdf')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Education;
