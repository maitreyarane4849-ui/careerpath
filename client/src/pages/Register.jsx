import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const inputClass =
  'w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It takes a minute. Then build your career profile.">
      {error && <p className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className={inputClass} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className={inputClass} />
        <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} required className={inputClass} />
        <button
          disabled={busy}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-60"
        >
          {busy ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Already registered? <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
      </p>
    </AuthLayout>
  );
}