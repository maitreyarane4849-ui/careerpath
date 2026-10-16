import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const inputClass =
  'w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your career journey.">
      {error && <p className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className={inputClass} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className={inputClass} />
        <button
          disabled={busy}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-60"
        >
          {busy ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        New here? <Link to="/register" className="text-blue-600 font-medium hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}