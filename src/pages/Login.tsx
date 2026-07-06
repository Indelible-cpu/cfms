import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useForestName } from '../config';

type LoginForm = {
  username: string;
  password: string;
};

function Login() {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm<LoginForm>();
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const forestName = useForestName();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.username, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Unable to sign in. Check your username and password.');
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
            <input
              type="password"
              {...register('password', { required: true })}
              className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm text-forest outline-none transition focus:border-forest"
            />
          </label>

          <p className="text-xs text-slate-500">
            Testing: username <span className="font-semibold text-forest">admin</span> and password{' '}
            <span className="font-semibold text-forest">admin123!</span>
          </p>

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
