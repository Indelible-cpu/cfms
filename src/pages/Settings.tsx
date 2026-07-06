import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';


function Settings() {
  const { t, i18n } = useTranslation();
  const { profile, user } = useAuth();
  const { mode, setMode, resolvedTheme } = useTheme();

  const { forestName, logo } = useSystemSettings();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });
  const [profileMessage, setProfileMessage] = useState('');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [systemData, setSystemData] = useState({
    forestName: forestName,
  });
  const [systemMessage, setSystemMessage] = useState('');

  // Update local state when Firebase state loads
  useEffect(() => {
    setSystemData({ forestName });
  }, [forestName]);

  /* ── Profile update (any logged-in user) ────── */
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await update(ref(db, `users/${user.uid}`), {
        name: profileData.name,
        phone: profileData.phone,
      });
      setProfileMessage('Profile updated successfully.');
      setEditingProfile(false);
    } catch {
      setProfileMessage('Failed to update profile.');
    }
  };

  /* ── System Settings (Forestry Officer / VFC / National Director) ── */
  const canUploadLogo =
    profile?.role === 'National Director' ||
    profile?.role === 'Forestry Officer' ||
    profile?.role === 'Village Forest Committee';

  const handleSystemUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUploadLogo) return;

    try {
      const updates: any = {
        forestName: systemData.forestName,
      };

      if (logoFile) {
        // Compress and base64 encode the logo directly in browser
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoFile);
        });
        updates.logo = base64;
      }

      await update(ref(db, 'settings'), updates);
      setSystemMessage('System settings updated successfully.');
      setLogoFile(null);
    } catch (error) {
      setSystemMessage('Failed to update system settings.');
      console.error(error);
    }
  };

  /* ── Language ────────────────────────────────── */
  const switchLanguage = (lang: 'en' | 'ny') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('cfms-language', lang);
  };

  /* ── Theme ───────────────────────────────────── */
  const themeOptions: { value: ThemeMode; label: string; icon: string; desc: string }[] = [
    { value: 'light',  label: t('themeLight'),  icon: '☀️', desc: 'Always bright' },
    { value: 'dark',   label: t('themeDark'),   icon: '🌙', desc: 'Easy on the eyes' },
    { value: 'system', label: t('themeSystem'), icon: '💻', desc: 'Follows your device' },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('settings')}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Your profile, language and appearance preferences.
        </p>
      </div>

      {/* ── Profile ──────────────────────────────── */}
      <section className="rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-forest">{t('profile')}</h3>

        {!editingProfile ? (
          <div className="mt-4 flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium text-slate-900">{profile?.name}</p>
              <p className="text-sm text-slate-500">{profile?.email}</p>
              {profile?.phone && (
                <p className="text-sm text-slate-500">{profile.phone}</p>
              )}
              <span className="mt-2 inline-block rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                {profile?.role}
              </span>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="rounded-full bg-sand px-4 py-2 text-sm font-medium text-forest transition hover:bg-earth/20"
            >
              Edit
            </button>
          </div>
        ) : (
          <form onSubmit={handleProfileUpdate} className="mt-4 space-y-4">
            <label className="block text-sm text-forest">
              Name
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm"
                required
              />
            </label>
            <label className="block text-sm text-forest">
              Phone Number
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-3xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-earth"
              >
                {t('saveChanges')}
              </button>
              <button
                type="button"
                onClick={() => { setEditingProfile(false); setProfileMessage(''); }}
                className="rounded-3xl bg-sand px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-earth/20"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}
        {profileMessage && (
          <p className="mt-3 text-sm text-forest">{profileMessage}</p>
        )}
      </section>

      {/* ── Language ──────────────────────────────── */}
      <section className="rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-forest">{t('languageManagement')}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Switch between English and Chichewa (Chinyanja).
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => switchLanguage('en')}
            className={`flex-1 rounded-3xl border py-3 text-sm font-medium transition ${
              i18n.language === 'en'
                ? 'border-forest bg-forest text-white shadow-md'
                : 'border-earth/20 bg-white text-forest hover:border-forest'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => switchLanguage('ny')}
            className={`flex-1 rounded-3xl border py-3 text-sm font-medium transition ${
              i18n.language === 'ny'
                ? 'border-forest bg-forest text-white shadow-md'
                : 'border-earth/20 bg-white text-forest hover:border-forest'
            }`}
          >
            🇲🇼 Chichewa
          </button>
        </div>
      </section>

      {/* ── Appearance / Theme ───────────────────── */}
      <section className="rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-forest">{t('appearance')}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Choose a colour scheme. "Follow Device" automatically matches your OS.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`flex flex-col items-center gap-2 rounded-3xl border p-4 text-sm font-medium transition ${
                mode === opt.value
                  ? 'border-forest bg-forest text-white shadow-md'
                  : 'border-earth/20 bg-white text-forest hover:border-forest'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span>{opt.label}</span>
              <span className={`text-xs font-normal ${mode === opt.value ? 'text-white/80' : 'text-slate-500'}`}>
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-2xl bg-sand px-4 py-2 text-sm text-slate-600">
          {resolvedTheme === 'dark' ? '🌙' : '☀️'}{' '}
          Currently showing <strong>{resolvedTheme}</strong> theme
          {mode === 'system' ? ' (following your device)' : ''}
        </p>
      </section>

      {/* ── System Branding (Officers & VFC) ─────── */}
      {canUploadLogo && (
        <section className="rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-forest">System Settings</h3>
          <p className="mt-1 text-sm text-slate-600">
            Update the community forest name and logo. These settings apply globally to all users.
          </p>
          <form onSubmit={handleSystemUpdate} className="mt-4 space-y-4">
            <label className="block text-sm text-forest">
              Forest Name
              <input
                type="text"
                value={systemData.forestName}
                onChange={(e) => setSystemData({ ...systemData, forestName: e.target.value })}
                className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm"
                required
              />
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {logo && !logoFile && (
                <img
                  src={logo}
                  alt="Current logo"
                  className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                />
              )}
              <div className="flex flex-col gap-2">
                <label className="block text-sm text-forest">System Logo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-earth"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-fit rounded-3xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-earth"
            >
              Save System Settings
            </button>
          </form>
          {systemMessage && <p className="mt-3 text-sm text-forest">{systemMessage}</p>}
        </section>
      )}

      {/* ── System Version ─────────────── */}
      <div className="pt-4 text-center text-sm text-slate-400">
        Forest CFMS
      </div>
    </div>
  );
}


export default Settings;
