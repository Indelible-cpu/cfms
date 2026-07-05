import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

type ResetForm = {
  email: string;
};

function ResetPassword() {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm<ResetForm>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const onSubmit = async (data: ResetForm) => {
    setMessage('');
    setError('');
    try {
      await resetPassword(data.email);
      setMessage('A password reset link was sent to your email.');
    } catch (err) {
      setError('Unable to send reset email. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-sand px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-md rounded-[32px] border border-earth/10 bg-white p-6 shadow-xl sm:p-8">
        <h1 className="text-3xl font-semibold text-forest">{t('resetPassword')}</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your email to get a reset link.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-forest">
            {t('email')}
            <input
              type="email"
              {...register('email', { required: true })}
              className="mt-2 w-full rounded-3xl border border-earth/20 bg-sand px-4 py-3 text-sm text-forest outline-none transition focus:border-forest"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-forest">{message}</p> : null}

          <button
            type="submit"
            className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth"
          >
            {t('resetPassword')}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-forest/70">
          <Link to="/login" className="font-semibold text-forest underline">
            {t('login')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
