import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '📊', key: 'dashboard' },
  { to: '/forests', icon: '🌳', key: 'forests' },
  { to: '/planting', icon: '🌱', key: 'planting' },
  { to: '/incidents', icon: '⚠️', key: 'incidents' },
  { to: '/permits', icon: '📝', key: 'permits' },
  { to: '/villages', icon: '🏘️', key: 'villages' },
  { to: '/education', icon: '📚', key: 'education' },
  { to: '/reports', icon: '📄', key: 'reports' },
  { to: '/work', icon: '🤝', key: 'work' },
  { to: '/settings', icon: '⚙️', key: 'settings' },
];

function Layout() {
  const { t, i18n } = useTranslation();
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const switchLanguage = (lang: 'en' | 'ny') => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-sand text-forest">
      <header className="sticky top-0 z-30 border-b border-sand bg-white/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-earth">{t('appName')}</p>
            <p className="mt-1 text-2xl font-semibold">{t('welcomeDashboard')}</p>
            <p className="text-sm text-slate-600">{profile?.name || t('communityWork')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className="rounded-full border border-forest/20 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-forest"
            >
              🇬🇧 {t('english')}
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('ny')}
              className="rounded-full border border-forest/20 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-forest"
            >
              🇲🇼 {t('chichewa')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-earth"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-3 rounded-3xl border border-sand bg-white/90 p-4 shadow-sm md:sticky md:top-24">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-forest text-white' : 'text-forest hover:bg-sand'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{t(item.key)}</span>
              </NavLink>
            ))}
          </div>
        </aside>

        <main className="space-y-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
