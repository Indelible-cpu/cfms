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
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', labelKey: 'dashboard', icon: '📊' },
  { to: '/forests', labelKey: 'forests', icon: '🌲' },
  { to: '/planting', labelKey: 'planting', icon: '🌱' },
  { to: '/incidents', labelKey: 'incidents', icon: '⚠️' },
  { to: '/permits', labelKey: 'permits', icon: '📝' },
  { to: '/villages', labelKey: 'villages', icon: '🏘️' },
  { to: '/education', labelKey: 'education', icon: '📚' },
  { to: '/reports', labelKey: 'reports', icon: '📄' },
  { to: '/work', labelKey: 'work', icon: '🤝' },
  { to: '/settings', labelKey: 'settings', icon: '⚙️' },
];

function Layout() {
  const { t, i18n } = useTranslation();
  const { logout, profile } = useAuth();
  const location = useLocation();

  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-sand text-forest">
      <header className="border-b border-earth/30 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-earth/80">{t('appName')}</p>
            <h1 className="text-xl font-semibold sm:text-2xl">{t('welcomeDashboard')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sand px-3 py-2 text-sm shadow-sm">
              {profile?.name}
            </div>
            <button
              type="button"
              onClick={() => switchLanguage(i18n.language === 'en' ? 'ny' : 'en')}
              className="rounded-2xl border border-earth/30 bg-white px-3 py-2 text-sm shadow-sm"
            >
              {i18n.language === 'en' ? '🇲🇼 Chichewa' : '🇬🇧 English'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl bg-earth px-4 py-2 text-white shadow-sm transition hover:bg-forest"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-3 rounded-3xl bg-white/90 p-4 shadow-sm shadow-earth/5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">{t('communityWork')}</p>
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                  active
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-forest hover:bg-sand hover:text-forest'
                }`}
              >
                <span>{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
