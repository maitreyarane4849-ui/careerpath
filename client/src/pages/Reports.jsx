import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    api
      .get('/analysis')
      .then((res) => setReports(res.data.reports))
      .catch((err) => setError(err.response?.data?.message || 'Could not load reports'))
      .finally(() => setLoading(false));
  }, []);

  const downloadPdf = async (r) => {
    setBusyId(r._id);
    setError('');
    try {
      const res = await api.get(`/reports/${r._id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careerpath-${r.primary.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not download that PDF');
    } finally {
      setBusyId('');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Previous career reports</h1>
      {error && <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}

      {reports.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-gray-600">No reports yet.</p>
          <Link to="/profile" className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-blue-600 text-white">
            Create your profile
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r, i) => (
            <li
              key={r._id}
              className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold">
                  {r.primary.title}
                  {i === 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">Latest</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(r.createdAt).toLocaleString()} · {Math.round(r.primary.score)}% match
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/results/${r._id}`} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm">
                  View
                </Link>
                <button
                  onClick={() => downloadPdf(r)}
                  disabled={busyId === r._id}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 text-sm"
                >
                  {busyId === r._id ? 'Preparing...' : 'PDF'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}