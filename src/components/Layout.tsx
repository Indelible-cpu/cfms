import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { useSystemSettings } from '../hooks/useSystemSettings';

const navItems = [
  { to: '/dashboard', icon: '📊', key: 'dashboard' },
  { to: '/announcements', icon: '📢', key: 'announcements' },
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
  const { forestName, logo } = useSystemSettings();
  const { resolvedTheme, mode, setMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const switchLanguage = (lang: 'en' | 'ny') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('cfms-language', lang);
  };

  const cycleTheme = () => {
    const next: Record<string, 'light' | 'dark' | 'system'> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    setMode(next[mode]);
  };

  const themeIcon = resolvedTheme === 'dark' ? '🌙' : '☀️';
  const themeLabel = mode === 'system' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light';

  return (
    <div className="min-h-screen bg-sand text-forest">
      <header className="sticky top-0 z-30 border-b border-sand bg-white/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {logo && <img src={logo} alt="System Logo" className="h-12 w-12 rounded-lg object-cover" />}
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-earth">{forestName}</p>
                <p className="mt-1 text-2xl font-semibold">{t('welcomeDashboard')}</p>
                <p className="text-sm text-slate-600">{profile?.name || t('communityWork')}</p>
              </div>
            </div>
            
            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-forest hover:bg-sand focus:outline-none"
              aria-label="Toggle Menu"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          <div className="hidden md:flex flex-wrap items-center gap-2">
            {/* Language switcher */}
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className={`rounded-full border px-3 py-2 text-sm shadow-sm transition ${
                i18n.language === 'en'
                  ? 'border-forest bg-forest text-white'
                  : 'border-forest/20 bg-white hover:border-forest'
              }`}
            >
              🇬🇧 EN
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('ny')}
              className={`rounded-full border px-3 py-2 text-sm shadow-sm transition ${
                i18n.language === 'ny'
                  ? 'border-forest bg-forest text-white'
                  : 'border-forest/20 bg-white hover:border-forest'
              }`}
            >
              🇲🇼 NY
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${themeLabel} — click to cycle`}
              className="rounded-full border border-forest/20 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-forest"
            >
              {themeIcon} {themeLabel}
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
        <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block space-y-3 rounded-3xl border border-sand bg-white/90 p-4 shadow-sm lg:sticky lg:top-24`}>
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
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
          
          <div className="mt-6 border-t border-sand pt-4 lg:hidden flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={() => switchLanguage('en')} className="flex-1 rounded-full border border-forest/20 py-2 text-xs font-semibold hover:bg-sand">🇬🇧 EN</button>
              <button onClick={() => switchLanguage('ny')} className="flex-1 rounded-full border border-forest/20 py-2 text-xs font-semibold hover:bg-sand">🇲🇼 NY</button>
            </div>
            <button onClick={cycleTheme} className="rounded-full border border-forest/20 py-2 text-xs font-semibold hover:bg-sand">{themeIcon} {themeLabel} Mode</button>
            <button onClick={handleLogout} className="rounded-full bg-forest py-2 text-xs font-semibold text-white hover:bg-earth">{t('logout')}</button>
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

