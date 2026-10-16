import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const card = 'bg-white p-6 rounded-2xl border border-slate-200 space-y-4';
const input =
  'w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [includeReports, setIncludeReports] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const deleteProfile = async () => {
    const extra = includeReports ? ' Your reports and roadmaps will also be deleted.' : '';
    if (!window.confirm(`Delete your career profile?${extra} This cannot be undone.`)) return;

    setBusy('profile');
    setError('');
    setMessage('');
    try {
      await api.delete('/profile', { params: { includeReports } });
      setMessage('Your career profile was deleted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the profile');
    } finally {
      setBusy('');
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm('Permanently delete your account and all your data? This cannot be undone.')) return;

    setBusy('account');
    setError('');
    setMessage('');
    try {
      await api.delete('/auth/me', { data: { password } });
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the account');
      setBusy('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <p className="text-sm text-slate-500">Signed in as {user?.email}</p>

      {error && <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}
      {message && <p className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{message}</p>}

      <section className={card}>
        <h2 className="font-semibold">Delete my career data</h2>
        <p className="text-sm text-slate-600">
          Removes your education, skills, interests and career goal. Your account stays, so you can
          start again with a fresh profile.
        </p>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeReports}
            onChange={(e) => setIncludeReports(e.target.checked)}
            className="mt-1 accent-red-600"
          />
          Also delete my previous reports and roadmaps
        </label>
        <button
          onClick={deleteProfile}
          disabled={Boolean(busy)}
          className="px-5 py-2.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {busy === 'profile' ? 'Deleting...' : 'Delete profile'}
        </button>
      </section>

      <section className="p-6 rounded-2xl border border-red-200 bg-red-50/50 space-y-4">
        <h2 className="font-semibold text-red-800">Delete my account</h2>
        <p className="text-sm text-slate-700">
          Permanently deletes your account, profile, reports, roadmaps and progress. This cannot be undone.
        </p>
        <form onSubmit={deleteAccount} className="space-y-3">
          <input
            type="password"
            placeholder="Enter your password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={input}
          />
          <button
            disabled={Boolean(busy)}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy === 'account' ? 'Deleting...' : 'Delete my account'}
          </button>
        </form>
      </section>
    </div>
  );
}