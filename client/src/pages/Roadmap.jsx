import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

const TYPE_STYLE = {
  learn: 'bg-blue-50 text-blue-700',
  practice: 'bg-purple-50 text-purple-700',
  project: 'bg-emerald-50 text-emerald-700',
};

export default function Roadmap() {
  const { id, reportId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = id ? `/roadmap/${id}` : reportId ? `/roadmap/by-report/${reportId}` : '/roadmap';
    setLoading(true);
    api
      .get(url)
      .then((res) => setRoadmap(res.data.roadmap))
      .catch((err) => {
        if (err.response?.status === 404) setMissing(true);
        else setError(err.response?.data?.message || 'Could not load the roadmap');
      })
      .finally(() => setLoading(false));
  }, [id, reportId]);

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await api.post('/roadmap/generate', reportId ? { reportId } : {});
      setRoadmap(res.data.roadmap);
      setMissing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate the roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const setTaskDone = (taskId, value) =>
    setRoadmap((prev) => ({
      ...prev,
      phases: prev.phases.map((p) => ({
        ...p,
        tasks: p.tasks.map((t) => (t._id === taskId ? { ...t, done: value } : t)),
      })),
    }));

  const toggle = async (task) => {
    const next = !task.done;
    setTaskDone(task._id, next);
    try {
      await api.patch(`/roadmap/${roadmap._id}/tasks/${task._id}`, { done: next });
    } catch {
      setTaskDone(task._id, task.done);
      setError('Could not save that change. Please try again.');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  if (missing)
    return (
      <div className="text-center mt-16 space-y-4">
        <p className="text-gray-600">There is no roadmap here yet.</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-center gap-3">
          <button
            onClick={generate}
            disabled={generating}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {generating ? 'Generating (1-2 min)...' : 'Generate roadmap'}
          </button>
          <Link to="/profile" className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">
            Go to profile
          </Link>
        </div>
      </div>
    );

  if (!roadmap) return <p className="text-red-600">{error}</p>;

  const total = roadmap.phases.reduce((n, p) => n + p.tasks.length, 0);
  const done = roadmap.phases.reduce((n, p) => n + p.tasks.filter((t) => t.done).length, 0);
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">Roadmap for</p>
        <h1 className="text-2xl font-bold">{roadmap.careerTitle}</h1>
        <p className="mt-2 text-gray-600">{roadmap.summary}</p>
      </div>

      {error && <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}

      <div className="bg-white p-5 rounded-2xl border border-gray-200">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Overall progress</span>
          <span>{done} of {total} tasks · {percent}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {roadmap.phases.map((phase, i) => {
        const pDone = phase.tasks.filter((t) => t.done).length;
        return (
          <section key={phase._id} className="bg-white p-6 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-start gap-4">
              <h2 className="font-semibold">Phase {i + 1}: {phase.title}</h2>
              {pDone === phase.tasks.length ? (
  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold whitespace-nowrap">
    ✓ Complete
  </span>
) : (
  <span className="text-xs text-gray-500 whitespace-nowrap">{pDone}/{phase.tasks.length}</span>
)}
            </div>
            {phase.description && <p className="text-sm text-gray-600 mt-1">{phase.description}</p>}
            <ul className="mt-4 space-y-2">
              {phase.tasks.map((t) => (
                <li key={t._id}>
                  <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggle(t)}
                      className="mt-1 h-4 w-4 accent-blue-600"
                    />
                    <span className={`flex-1 text-sm ${t.done ? 'line-through text-gray-400' : ''}`}>{t.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_STYLE[t.type]}`}>{t.type}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Link to={`/results/${roadmap.report}`} className="inline-block text-blue-600 hover:underline text-sm">
        ← Back to results
      </Link>
    </div>
  );
}