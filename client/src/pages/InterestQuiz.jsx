import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const QUESTIONS = [
  {
    q: 'Which activity sounds the most enjoyable?',
    options: [
      ['Training a model to recognise images', ['Artificial Intelligence', 'Machine Learning']],
      ['Finding patterns in numbers and charts', ['Data Science', 'Statistics', 'Analytics']],
      ['Building a website people can use', ['Web Development', 'Software Development']],
      ['Sketching a clean app screen', ['Design', 'User Experience', 'Creativity']],
    ],
  },
  {
    q: 'You have a free weekend. What do you build?',
    options: [
      ['A model that predicts something from real data', ['Data Science', 'Machine Learning']],
      ['A practice hacking challenge', ['Cybersecurity', 'Ethical Hacking']],
      ['A script that automates a boring task', ['Automation', 'Problem Solving']],
      ['A small server running in the cloud', ['Cloud Computing', 'Infrastructure']],
    ],
  },
  {
    q: 'Which school subject did you like most?',
    options: [
      ['Maths and statistics', ['Statistics', 'Research']],
      ['Computer networks and systems', ['Networking', 'Infrastructure']],
      ['Art and design', ['Design', 'Creativity']],
      ['Business and economics', ['Business', 'Analytics']],
    ],
  },
  {
    q: 'Which question would you rather answer?',
    options: [
      ['How can computers learn from examples?', ['Artificial Intelligence', 'Machine Learning']],
      ['How should an app store and organise its data?', ['Databases', 'Software Development']],
      ['How do we protect a system from attacks?', ['Cybersecurity', 'Networking']],
      ['How do we make a product pleasant to use?', ['User Experience', 'Design']],
    ],
  },
  {
    q: 'How do you like to work?',
    options: [
      ['Running experiments and researching deeply', ['Research', 'Artificial Intelligence']],
      ['Presenting insights to a team', ['Business', 'Analytics']],
      ['Building something end to end', ['Software Development', 'Web Development']],
      ['Keeping systems running smoothly', ['Infrastructure', 'Automation']],
    ],
  },
  {
    q: 'Which technology excites you most?',
    options: [
      ['Smart assistants and chatbots', ['Artificial Intelligence', 'Machine Learning']],
      ['Live dashboards and reports', ['Analytics', 'Data Science']],
      ['Secure, unbreakable systems', ['Cybersecurity', 'Ethical Hacking']],
      ['Beautiful, intuitive interfaces', ['Design', 'User Experience']],
    ],
  },
  {
    q: 'Which tool would you open first?',
    options: [
      ['A notebook with a dataset', ['Data Science', 'Statistics']],
      ['A code editor and an API', ['Software Development', 'Databases']],
      ['A terminal and network tools', ['Networking', 'Cybersecurity']],
      ['A design canvas', ['Design', 'Creativity']],
    ],
  },
  {
    q: 'Which sentence sounds most like you?',
    options: [
      ['I love solving puzzles.', ['Problem Solving']],
      ["I'm curious about why things work.", ['Research']],
      ['I like making things look great.', ['Creativity', 'Design']],
      ['I like organising systems and processes.', ['Infrastructure', 'Automation']],
    ],
  },
];

export default function InterestQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]); // chosen option index per question
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const done = step >= QUESTIONS.length;

  const choose = (optIndex) => {
    setAnswers([...answers.slice(0, step), optIndex]);
    setStep(step + 1);
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const restart = () => {
    setAnswers([]);
    setStep(0);
    setError('');
  };

  // Count how often each tag was picked, keep the top 5
  const topTags = () => {
    const counts = {};
    answers.forEach((optIndex, qIndex) => {
      QUESTIONS[qIndex].options[optIndex][1].forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const save = async (tags) => {
    setBusy(true);
    setError('');
    try {
      await api.patch('/profile/interests', { interests: tags });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your interests');
      setBusy(false);
    }
  };

  if (done) {
    const top = topTags();
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h1 className="text-2xl font-extrabold">Your interest results</h1>
        <p className="text-sm text-slate-600">
          Based on your answers, these areas match you best. They will be added to your profile and
          used in your career match.
        </p>
        <ul className="space-y-3">
          {top.map(([tag, count]) => (
            <li key={tag}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{tag}</span>
                <span className="text-slate-500">{count} pick{count > 1 ? 's' : ''}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-violet-600"
                  style={{ width: `${(count / top[0][1]) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        {error && (
          <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}{' '}
            {error.includes('Save your profile') && (
              <Link to="/profile" className="underline">Go to profile</Link>
            )}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => save(top.map(([t]) => t))}
            disabled={busy}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? 'Saving...' : 'Add to my profile'}
          </button>
          <button onClick={restart} className="px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50">
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  const current = QUESTIONS[step];
  const percent = Math.round((step / QUESTIONS.length) * 100);

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Question {step + 1} of {QUESTIONS.length}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <h1 className="text-xl font-extrabold">{current.q}</h1>

      <div className="space-y-3">
        {current.options.map(([label], i) => (
          <button
            key={label}
            onClick={() => choose(i)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition hover:border-blue-500 hover:bg-blue-50 ${
              answers[step] === i ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-sm">
        <button onClick={back} disabled={step === 0} className="text-slate-500 hover:text-slate-800 disabled:opacity-40">
          ← Back
        </button>
        <Link to="/profile" className="text-slate-500 hover:text-slate-800">Cancel</Link>
      </div>
    </div>
  );
}