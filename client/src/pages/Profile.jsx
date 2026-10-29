import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function Profile() {
  const navigate = useNavigate();
  const [education, setEducation] = useState({
    degree: '',
    specialization: '',
    institution: '',
    graduationYear: '',
  });
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [careerGoal, setCareerGoal] = useState('');

  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner' });
  const [newInterest, setNewInterest] = useState('');

  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(''); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  
  useEffect(() => {
    const load = async () => {
      try {
        const c = await api.get('/careers');
        setCareers(c.data.careers);
      } catch {
        
      }
      try {
        const res = await api.get('/profile');
        const p = res.data.profile;
        setEducation({
          degree: p.education?.degree || '',
          specialization: p.education?.specialization || '',
          institution: p.education?.institution || '',
          graduationYear: p.education?.graduationYear || '',
        });
        setSkills(p.skills || []);
        setInterests(p.interests || []);
        setCareerGoal(p.careerGoal || '');
      } catch (err) {
        if (err.response?.status !== 404) setError('Could not load your profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const skillSuggestions = [...new Set(careers.flatMap((c) => c.requiredSkills.map((s) => s.name)))].sort();
  const interestSuggestions = [...new Set(careers.flatMap((c) => c.interestTags))].sort();

  const addSkill = () => {
    const name = newSkill.name.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError(`"${name}" is already in your list`);
      return;
    }
    setError('');
    setSkills([...skills, { name, level: newSkill.level }]);
    setNewSkill({ name: '', level: newSkill.level });
  };

  const addInterest = () => {
    const value = newInterest.trim();
    if (!value) return;
    if (!interests.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setInterests([...interests, value]);
    }
    setNewInterest('');
  };

  const saveProfile = async () => {
    const payload = {
      education: {
        ...education,
        graduationYear: education.graduationYear ? Number(education.graduationYear) : undefined,
      },
      skills,
      interests,
      careerGoal,
    };
    await api.put('/profile', payload);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy('save');
    try {
      await saveProfile();
      setMessage('Profile saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server');
    } finally {
      setBusy('');
    }
  };

  const handleAnalyze = async () => {
    setError('');
    setMessage('');
    setBusy('analyze');
    try {
      await saveProfile();
      const res = await api.post('/analysis/full');
      if (res.data.warning) {
        
        sessionStorage.setItem('analysisWarning', res.data.warning);
      }
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server');
      setBusy('');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Your career profile</h1>

      {error && <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}
      {message && <p className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{message}</p>}

      {/* Education */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
        <h2 className="font-semibold">Education</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            placeholder="Degree (e.g. BTech, B.Sc., M.Sc.,other) *"
            value={education.degree}
            onChange={(e) => setEducation({ ...education, degree: e.target.value })}
            required
            className={inputClass}
          />
          <input
            placeholder="Specialization (e.g. Computer Science, Data Science, etc.)"
            value={education.specialization}
            onChange={(e) => setEducation({ ...education, specialization: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Institution"
            value={education.institution}
            onChange={(e) => setEducation({ ...education, institution: e.target.value })}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Graduation year"
            min="1990"
            max="2100"
            value={education.graduationYear}
            onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })}
            className={inputClass}
          />
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
        <h2 className="font-semibold">Skills *</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            list="skill-options"
            placeholder="Type or pick a skill"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            className={inputClass}
          />
          <datalist id="skill-options">
            {skillSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <select
            value={newSkill.level}
            onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {skills.length === 0 ? (
          <p className="text-sm text-gray-500">No skills added yet.</p>
        ) : (
          <ul className="space-y-2">
            {skills.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50">
                <span className="font-medium">{s.name}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={s.level}
                    onChange={(e) =>
                      setSkills(skills.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))
                    }
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  >
                    {LEVELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, j) => j !== i))}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Interests */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
        <h2 className="font-semibold">Interests</h2>
        <div className="flex gap-2">
          <input
            list="interest-options"
            placeholder="Type or pick an interest, then press Enter"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addInterest();
              }
            }}
            className={inputClass}
          />
          <datalist id="interest-options">
            {interestSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={addInterest}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {interests.map((it) => (
            <span key={it} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">
              {it}
              <button
                type="button"
                onClick={() => setInterests(interests.filter((x) => x !== it))}
                className="text-blue-500 hover:text-red-600"
                aria-label={`Remove ${it}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Career goal */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3">
        <h2 className="font-semibold">Career goal</h2>
        <input
          list="career-options"
          placeholder="Pick a career, or leave blank if unsure"
          value={careerGoal}
          onChange={(e) => setCareerGoal(e.target.value)}
          className={inputClass}
        />
        <datalist id="career-options">
          {careers.map((c) => (
            <option key={c._id} value={c.title} />
          ))}
        </datalist>
        <p className="text-xs text-gray-500">
          Your goal decides which career is shown first. It does not change the match score.
        </p>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          disabled={Boolean(busy)}
          className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
        >
          {busy === 'save' ? 'Saving...' : 'Save profile'}
        </button>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={Boolean(busy)}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy === 'analyze' ? 'Analyzing...' : 'Save and Analyze My Career'}
        </button>
      </div>

      {busy === 'analyze' && (
        <p className="text-sm text-gray-600">
          Building your analysis and roadmap. This can take one to two minutes, please keep this page open.
        </p>
      )}
    </form>
  );
}
<p className="text-sm text-gray-600">
  Not sure what interests you?{' '}
  <Link to="/interest-quiz" className="text-blue-600 font-medium hover:underline">
    Take the 2-minute interest quiz
  </Link>
</p>