import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-sand px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[32px] border border-earth/15 bg-white/95 p-6 shadow-xl sm:p-10">
        <section className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-earth/70">{t('appName')}</p>
          <h1 className="text-4xl font-semibold text-forest sm:text-5xl">{t('welcome')}</h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {t('homeSubtitle')}
          </p>
          <div className="mx-auto grid w-full max-w-xl gap-3 sm:grid-cols-3">
            <Link
              to="/login"
              className="rounded-3xl bg-forest px-5 py-4 text-white shadow-lg transition hover:bg-earth"
            >
              {t('login')}
            </Link>
            <Link
              to="/login"
              className="rounded-3xl border border-forest px-5 py-4 text-forest transition hover:bg-sand"
            >
              {t('reportIncident')}
            </Link>
            <Link
              to="/education"
              className="rounded-3xl border border-forest px-5 py-4 text-forest transition hover:bg-sand"
            >
              {t('education')}
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            { title: t('forests'), description: t('activeForests') },
            { title: t('planting'), description: t('treesPlanted') },
            { title: t('incidents'), description: t('incidentsReported') },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-earth/10 bg-sand p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-earth/70">{card.title}</p>
              <p className="mt-4 text-xl font-semibold text-forest">{card.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Home;
