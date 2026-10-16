import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const card = 'bg-white p-6 rounded-2xl border border-slate-200';

function Stat({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold font-display text-slate-900">{value}</p>
    </div>
  );
}

function ScoreChart({ history }) {
  if (!history || history.length === 0) return null;
  const W = 600, H = 180, P = 28;
  const x = (i) => (history.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (history.length - 1));
  const y = (s) => H - P - (s / 100) * (H - 2 * P);
  const points = history.map((h, i) => `${x(i)},${y(h.score)}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[320px]">
        {[0, 50, 100].map((g) => (
          <g key={g}>
            <line x1={P} x2={W - P} y1={y(g)} y2={y(g)} stroke="#e5e7eb" />
            <text x={4} y={y(g) + 4} fontSize="10" fill="#6b7280">{g}</text>
          </g>
        ))}
        {history.length > 1 && <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2.5" />}
        {history.map((h, i) => (
          <g key={h.id}>
            <circle cx={x(i)} cy={y(h.score)} r="5" fill="#2563eb" />
            <title>{`${h.title}: ${Math.round(h.score)}% (${new Date(h.date).toLocaleDateString()})`}</title>
            <text x={x(i)} y={y(h.score) - 10} fontSize="10" textAnchor="middle" fill="#111827">
              {Math.round(h.score)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));

  useEffect(() => {
    load();
  }, []);

  const regenerate = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/analysis/full');
      if (res.data.warning) setError(res.data.warning);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not regenerate');
    } finally {
      setBusy(false);
    }
  };

  if (!data && error) return <p className="p-3 rounded-lg bg-red-50 text-red-700">{error}</p>;
  if (!data) return <p className="text-slate-500">Loading...</p>;

  const userName = data.user?.name || 'there';

  // ---------- Empty state: no profile yet ----------
  if (!data.profile) {
    return (
      <div className="max-w-2xl mx-auto text-center mt-10 bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h1 className="text-3xl font-extrabold">Welcome, {userName}</h1>
        <p className="text-slate-600">
          Your career profile hasn't been created yet, so there is nothing to show here.
        </p>
        <ol className="text-left text-sm text-slate-600 max-w-sm mx-auto space-y-1 list-decimal list-inside">
          <li>Create your career profile</li>
          <li>Take the interest quiz (optional)</li>
          <li>Run your career analysis</li>
        </ol>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/profile" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Create profile
          </Link>
          <Link to="/reports" className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50">
            Previous reports
          </Link>
        </div>
      </div>
    );
  }

  const { latestReport: lr, roadmap, profileChanged, scoreHistory, stats } = data;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-8 text-white bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 bg-[length:300%_100%] animate-gradient shadow-lg">
        <p className="text-white/80 text-sm">Your career dashboard</p>
        <h1 className="text-3xl font-extrabold">Welcome, {userName}</h1>
        {data.profile?.careerGoal && (
          <p className="mt-1 text-white/85 text-sm">Working towards: {data.profile.careerGoal}</p>
        )}
      </div>

      {error && <p className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">{error}</p>}

      {profileChanged && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-blue-900">
            You updated your profile after your last analysis. Regenerate to get fresh results. Your old reports are kept.
          </p>
          <button
            onClick={regenerate}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
          >
            {busy ? 'Regenerating (1-2 min)...' : 'Regenerate analysis'}
          </button>
        </div>
      )}

      {!lr ? (
        <div className={`${card} text-center space-y-3`}>
          <p className="text-slate-600">Your profile is saved, but you haven't run an analysis yet.</p>
          <button
            onClick={regenerate}
            disabled={busy}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? 'Analyzing (1-2 min)...' : 'Analyze My Career'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Top career" value={<span className="text-xl">{lr.primary.title}</span>} />
            <Stat label="Compatibility" value={`${Math.round(lr.primary.score)}%`} />
            <Stat label="Skill gaps" value={lr.primary.gapCount} />
            <Stat label="Tasks done" value={roadmap ? `${roadmap.progress.done}/${roadmap.progress.total}` : '-'} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <section className={card}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Roadmap progress</h2>
                {roadmap && <Link to="/roadmap" className="text-sm text-blue-600 hover:underline">Open roadmap</Link>}
              </div>
              {roadmap ? (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{roadmap.careerTitle}</span>
                    <span>{roadmap.progress.percent}%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${roadmap.progress.percent}%` }} />
                  </div>
                  <ul className="mt-4 space-y-3">
                    {roadmap.progress.phases.map((ph) => (
                      <li key={ph.title}>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>{ph.title}</span>
                          <span>{ph.done}/{ph.total}</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${ph.percent}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  No roadmap yet. It may have failed to generate (check that Ollama is running), then use Regenerate.
                </p>
              )}
            </section>

            <section className={card}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Top skill gaps</h2>
                <Link to="/results" className="text-sm text-blue-600 hover:underline">Full results</Link>
              </div>
              {lr.topGaps.length === 0 ? (
                <p className="text-sm text-slate-500">No gaps. Great match.</p>
              ) : (
                <ul className="space-y-2">
                  {lr.topGaps.map((g) => (
                    <li key={g.skill} className="flex justify-between text-sm">
                      <span>{g.skill}</span>
                      <span className={g.status === 'Missing' ? 'text-red-600' : 'text-amber-600'}>
                        {g.status === 'Missing' ? 'Learn' : 'Improve'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {lr.alternatives.length > 0 && (
                <>
                  <h3 className="font-semibold mt-5 mb-2 text-sm">Alternative careers</h3>
                  <ul className="space-y-1 text-sm">
                    {lr.alternatives.map((a) => (
                      <li key={a.title} className="flex justify-between">
                        <span>{a.title}</span>
                        <span className="text-slate-600">{Math.round(a.score)}%</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <section className={card}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Compatibility score history</h2>
              <span className="text-sm text-slate-500">{stats?.totalReports ?? 0} report(s)</span>
            </div>
            <ScoreChart history={scoreHistory} />
            <p className="text-xs text-slate-500 mt-2">
              Each point is one analysis. Scores rise as you add skills and update your profile.
            </p>
          </section>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to="/profile" className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50">
          Update profile
        </Link>
        <Link to="/interest-quiz" className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50">
          Interest quiz
        </Link>
        <Link to="/reports" className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50">
          Previous reports
        </Link>
      </div>
    </div>
  );
}