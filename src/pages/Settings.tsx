import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { setStoredForestName, useForestName } from '../config';

type PasswordForm = {
  password: string;
  confirmPassword: string;
};

type BrandingForm = {
  forestName: string;
};

function Settings() {
  const { t } = useTranslation();
  const { profile, changePassword } = useAuth();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, watch } = useForm<PasswordForm>();
  const { register: registerBranding, handleSubmit: handleBrandingSubmit } = useForm<BrandingForm>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [brandingMessage, setBrandingMessage] = useState('');
  const [brandingError, setBrandingError] = useState('');
  const forestName = useForestName();

  const onSubmit = async (data: PasswordForm) => {
    setMessage('');
    setError('');
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await changePassword(data.password);
      setMessage('Password updated successfully.');
    } catch (err) {
      setError('Unable to update password. Please try again.');
      console.error(err);
    }
  };

  const onBrandingSubmit = (data: BrandingForm) => {
    setBrandingError('');
    setBrandingMessage('');
    try {
      setStoredForestName(data.forestName);
      setBrandingMessage('Forest name updated successfully.');
    } catch (err) {
      setBrandingError('Unable to update forest name. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">{t('settings')}</h2>
        <p className="mt-2 text-sm text-slate-600">Manage your account and security.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-earth/10 bg-sand p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('profile')}</p>
            <p className="mt-4 text-base text-forest">{profile?.name}</p>
            <p className="mt-1 text-sm text-slate-600">{profile?.email}</p>
            <p className="mt-1 text-sm text-slate-600">{profile?.role}</p>
          </div>

          <form className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm" onSubmit={handleBrandingSubmit(onBrandingSubmit)}>
            <p className="text-sm uppercase tracking-[0.2em] text-earth/70">System Branding</p>
            <label className="mt-4 block text-sm font-medium text-forest">
              Forest Name
              <input
                type="text"
                defaultValue={forestName}
                {...registerBranding('forestName', { required: true })}
                className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm outline-none focus:border-forest"
              />
            </label>
            {brandingError ? <p className="mt-3 text-sm text-red-600">{brandingError}</p> : null}
            {brandingMessage ? <p className="mt-3 text-sm text-forest">{brandingMessage}</p> : null}
            <button
              type="submit"
              className="mt-5 w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth"
            >
              Save
            </button>
          </form>
        </div>

        <form className="rounded-3xl border border-earth/10 bg-white p-5 shadow-sm" onSubmit={handlePasswordSubmit(onSubmit)}>
          <p className="text-sm uppercase tracking-[0.2em] text-earth/70">{t('changePassword')}</p>
          <label className="mt-4 block text-sm font-medium text-forest">
            {t('newPassword')}
            <input
              type="password"
              {...registerPassword('password', { required: true })}
              className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm outline-none focus:border-forest"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-forest">
            {t('confirmPassword')}
            <input
              type="password"
              {...registerPassword('confirmPassword', { required: true })}
              className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm outline-none focus:border-forest"
            />
          </label>
          {watch('password') && watch('confirmPassword') && watch('password') !== watch('confirmPassword') ? (
            <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          {message ? <p className="mt-3 text-sm text-forest">{message}</p> : null}
          <button
            type="submit"
            className="mt-5 w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth"
          >
            {t('changePassword')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
