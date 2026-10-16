import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

function ScoreRing({ score }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(score), 150);
    return () => clearTimeout(t);
  }, [score]);

  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <svg width="150" height="150" viewBox="0 0 140 140" className="shrink-0">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - shown / 100)}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1.3s ease-out' }}
      />
      <text x="70" y="78" textAnchor="middle" className="fill-slate-900" fontSize="30" fontWeight="800" fontFamily="Sora, sans-serif">
        {Math.round(score)}%
      </text>
    </svg>
  );
}

export default function Results() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [rec, setRec] = useState(null);
  const [recError, setRecError] = useState('');
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState(() => sessionStorage.getItem('analysisWarning'));

  const [email, setEmail] = useState('');
  const [mailMsg, setMailMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setRecError('');
      setRec(null);
      setEmpty(false);
      try {
        let reportId = id;
        if (!reportId) {
          const list = await api.get('/analysis');
          if (list.data.reports.length === 0) {
            setEmpty(true);
            return;
          }
          reportId = list.data.reports[0]._id;
        }
        const r = await api.get(`/analysis/${reportId}`);
        setReport(r.data.report);
        try {
          const res = await api.get('/resources/recommend', { params: { reportId } });
          setRec(res.data);
        } catch (err) {
          setRecError(err.response?.data?.message || 'Could not load resources');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load the report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const dismissWarning = () => {
    sessionStorage.removeItem('analysisWarning');
    setWarning(null);
  };

  const downloadPdf = async () => {
    setBusy('pdf');
    setMailMsg({ type: '', text: '' });
    try {
      const res = await api.get(`/reports/${report._id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careerpath-${report.primary.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMailMsg({ type: 'error', text: 'Could not download the PDF' });
    } finally {
      setBusy('');
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setBusy('email');
    setMailMsg({ type: '', text: '' });
    try {
      const res = await api.post(`/reports/${report._id}/email`, { email });
      setMailMsg({ type: 'ok', text: res.data.message });
    } catch (err) {
      setMailMsg({ type: 'error', text: err.response?.data?.message || 'Could not send the email' });
    } finally {
      setBusy('');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (empty)
    return (
      <div className="text-center mt-16">
        <p className="text-gray-600">You have no career analysis yet.</p>
        <Link to="/profile" className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-blue-600 text-white">
          Create your profile
        </Link>
      </div>
    );
  if (error) return <p className="text-red-600">{error}</p>;
  if (!report) return null;

  const p = report.primary;
  const card = 'bg-white p-6 rounded-2xl border border-gray-200';
  const gapsWithResources = rec ? rec.learning.filter((g) => g.resources.length) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {warning && (
        <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm flex justify-between gap-4">
          <span>{warning}</span>
          <button onClick={dismissWarning} className="font-medium">Dismiss</button>
        </div>
      )}

      {/* Primary career */}
      <section className={`${card} flex flex-col sm:flex-row gap-6 items-center sm:items-start`}>
        <ScoreRing score={p.score} />
        <div className="flex-1">
          <p className="text-sm text-gray-500">
            {report.goalMatched ? 'Your chosen career' : 'Best match for your profile'}
          </p>
          <h1 className="text-2xl font-bold">{p.title}</h1>
          <p className="mt-2 text-gray-600">{p.description}</p>
          <div className="mt-3 flex gap-4 text-sm text-gray-700">
            <span>Skills match: <b>{p.skillScore}%</b></span>
            <span>Interest match: <b>{p.interestScore}%</b></span>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            This score shows how closely your profile matches the career requirements in our database.
            It is not a prediction of employment or career success.
          </p>
          {!report.goalMatched && report.profileSnapshot?.careerGoal && (
            <p className="mt-2 text-xs text-amber-700">
              We could not match "{report.profileSnapshot.careerGoal}" to a supported career, so we show your top match.
            </p>
          )}
        </div>
      </section>

      {report.aiSummary && (
        <section className={card}>
          <h2 className="font-semibold mb-2">Summary</h2>
          <p className="text-gray-700">{report.aiSummary}</p>
        </section>
      )}

      {/* Skills */}
      <section className={`${card} grid sm:grid-cols-2 gap-6`}>
        <div>
          <h2 className="font-semibold mb-3">Skills you already meet</h2>
          {p.matchedSkills.length === 0 ? (
            <p className="text-sm text-gray-500">None yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {p.matchedSkills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-green-50 text-green-800 text-sm">{s}</span>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-semibold mb-3">Skill gaps</h2>
          {p.skillGaps.length === 0 ? (
            <p className="text-sm text-gray-500">No gaps. Great match.</p>
          ) : (
            <ul className="space-y-2">
              {p.skillGaps.map((g) => (
                <li key={g.skill} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    <b>{g.skill}</b>
                    <span className="text-gray-500">
                      {g.status === 'Missing'
                        ? ` needs ${g.requiredLevel}`
                        : ` ${g.currentLevel} → ${g.requiredLevel}`}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      g.status === 'Missing' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {g.status === 'Missing' ? 'Learn' : 'Improve'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Alternatives */}
      {report.alternatives.length > 0 && (
        <section className={card}>
          <h2 className="font-semibold mb-3">Alternative careers</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {report.alternatives.map((a) => (
              <div key={a.title} className="p-4 rounded-xl bg-gray-50">
                <p className="font-medium">{a.title}</p>
                <p className="text-2xl font-bold text-blue-700">{Math.round(a.score)}%</p>
                <p className="text-xs text-gray-500">{a.skillGaps.length} skill gaps</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resources */}
      {recError && <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{recError}</p>}

      {rec && (
        <section className={`${card} space-y-5`}>
          <h2 className="font-semibold">Learning resources</h2>
          {gapsWithResources.length === 0 && (
            <p className="text-sm text-gray-500">No curated resources for your current gaps yet.</p>
          )}
          {gapsWithResources.map((g) => (
            <div key={g.skill}>
              <p className="font-medium text-sm">{g.skill}</p>
              <ul className="mt-1 space-y-1">
                {g.resources.map((r) => (
                  <li key={r._id}>
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                      {r.title}
                    </a>
                    <span className="text-xs text-gray-500"> · {r.provider}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {rec.projects.length > 0 && (
            <div>
              <h3 className="font-semibold">Suggested projects</h3>
              <ul className="mt-1 space-y-2">
                {rec.projects.map((r) => (
                  <li key={r._id} className="text-sm">
                    <b>{r.title}</b>
                    <span className="text-gray-600"> — {r.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rec.certifications.length > 0 && (
            <div>
              <h3 className="font-semibold">Suggested certifications</h3>
              <ul className="mt-1 space-y-1">
                {rec.certifications.map((r) => (
                  <li key={r._id} className="text-sm">
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {r.title}
                    </a>
                    <span className="text-xs text-gray-500"> · {r.provider}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Links and certification details can change. Please verify them on the provider websites.
          </p>
        </section>
      )}

      {/* Actions */}
      <section className={`${card} space-y-4`}>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/roadmap/report/${report._id}`}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            View my roadmap
          </Link>
          <button
            onClick={downloadPdf}
            disabled={busy === 'pdf'}
            className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-60"
          >
            {busy === 'pdf' ? 'Preparing...' : 'Download PDF'}
          </button>
          <Link to="/profile" className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50">
            Update profile
          </Link>
        </div>

        <form onSubmit={sendEmail} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="Email this report to..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            disabled={busy === 'email'}
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-60"
          >
            {busy === 'email' ? 'Sending...' : 'Send PDF'}
          </button>
        </form>
        {mailMsg.text && (
          <p className={`text-sm ${mailMsg.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}>{mailMsg.text}</p>
        )}
      </section>
    </div>
  );
}