import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../hooks/useSystemSettings';

type LoginForm = {
  username: string;
  password: string;
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Login() {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm<LoginForm>();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { forestName } = useSystemSettings();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.username, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/configuration-not-found') {
        setError('Firebase Authentication is not enabled. Please enable Email/Password sign-in in Firebase Console.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Wrong username or password. Please try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a few minutes and try again.');
      } else {
        setError(`Sign-in failed: ${code || err?.message || 'Unknown error'}`);
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-sand px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-md rounded-[32px] border border-earth/10 bg-white p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-earth/70">Forest Platform</p>
          <h1 className="mt-2 text-3xl font-semibold text-forest">{forestName}</h1>
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-forest">{t('login')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('welcome')}</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-forest">
            {t('username')}
            <input
              type="text"
              {...register('username', { required: true })}
              className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm text-forest outline-none transition focus:border-forest"
            />
          </label>

          <label className="block text-sm font-medium text-forest">
            {t('password')}
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: true })}
                className="w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 pr-12 text-sm text-forest outline-none transition focus:border-forest"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-earth/60 hover:text-forest transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth"
          >
            {t('login')}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm text-forest/70">
          <span>{t('forgotPassword')}</span>
          <button
            type="button"
            onClick={() => navigate('/reset-password')}
            className="font-semibold text-forest underline"
          >
            {t('resetPassword')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
