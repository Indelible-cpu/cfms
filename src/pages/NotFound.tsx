import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-sand px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl rounded-[32px] border border-earth/10 bg-white p-8 text-center shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-earth">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-forest">{t('notFoundMessage')}</h1>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-3xl bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-earth"
        >
          {t('dashboard')}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
