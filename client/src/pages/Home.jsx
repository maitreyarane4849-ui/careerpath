import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icons';
import Reveal from '../components/Reveal';
import CareerPathArt from '../components/CareerPathArt';

const careers = [
  'AI Engineer', 'Data Scientist', 'Data Analyst', 'Full Stack Developer',
  'Backend Developer', 'Cybersecurity Analyst', 'DevOps Engineer', 'UI/UX Designer',
];

const steps = [
  ['book', 'Build your profile', 'Add your degree, skills with levels, interests and a career goal.'],
  ['chart', 'Get your analysis', 'See matching careers, a compatibility score and your skill gaps.'],
  ['target', 'Follow your roadmap', 'Work through a phased plan, tick off tasks and track your progress.'],
];

const features = [
  ['briefcase', 'Career recommendations', 'Compare your best match with alternative careers side by side.'],
  ['chart', 'Transparent scoring', 'Scores come from a clear formula over skills and interests, not a guess.'],
  ['bulb', 'Skill-gap analysis', 'Know exactly which skills to learn and which to improve.'],
  ['cap', 'Personalized roadmap', 'A step-by-step plan generated for your profile by a local AI model.'],
  ['book', 'Curated resources', 'Verified learning links, project ideas and certifications.'],
  ['file', 'Reports and progress', 'Download or email PDF reports and watch your progress over time.'],
];

export default function Home() {
  const { user } = useAuth();
  const cta = user ? '/dashboard' : '/register';

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative pt-6 sm:pt-12">
        <div className="absolute -z-10 -top-10 -left-10 w-72 h-72 rounded-full bg-blue-300/40 blur-3xl animate-blob" />
        <div className="absolute -z-10 top-20 right-0 w-80 h-80 rounded-full bg-violet-300/40 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
              <Icon name="cap" className="w-4 h-4 text-blue-600" />
              Career guidance for students
            </span>
            <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
              Find your <span className="gradient-text">career path</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Tell us about your education, skills and interests. Get matching careers, your skill gaps,
              and a personalized roadmap you can track.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={cta}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 transition"
              >
                {user ? 'Go to dashboard' : 'Start career planning'}
              </Link>
              {!user && (
                <Link to="/login" className="px-7 py-3.5 rounded-xl border border-slate-300 bg-white font-semibold hover:bg-slate-50 transition">
                  Login
                </Link>
              )}
            </div>
          </div>
          <CareerPathArt />
        </div>
      </section>

      {/* Careers marquee */}
      <section aria-label="Supported careers" className="overflow-hidden -mx-4">
        <div className="flex w-max animate-marquee gap-3 py-2">
          {[...careers, ...careers].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
              <Icon name="briefcase" className="w-4 h-4 text-violet-600" />
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section>
        <Reveal>
          <h2 className="text-3xl font-extrabold text-center">How it works</h2>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {steps.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 150}>
              <div className="h-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center">
                    <Icon name={icon} />
                  </span>
                  <span className="font-display text-5xl font-extrabold text-slate-100">{i + 1}</span>
                </div>
                <h3 className="mt-4 font-bold text-lg">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <Reveal>
          <h2 className="text-3xl font-extrabold text-center">What you get</h2>
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(([icon, title, text], i) => (
            <Reveal key={title} delay={(i % 3) * 120}>
              <div className="group h-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
                <span className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-violet-600 group-hover:text-white transition">
                  <Icon name={icon} />
                </span>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <Reveal>
        <section className="rounded-3xl p-10 sm:p-14 text-center text-white bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 bg-[length:300%_100%] animate-gradient">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to plan your future?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">
            Build your profile in minutes and get a roadmap you can follow one step at a time.
          </p>
          <Link to={cta} className="inline-block mt-7 px-7 py-3.5 rounded-xl bg-white text-blue-700 font-bold shadow-lg hover:-translate-y-0.5 transition">
            {user ? 'Open dashboard' : 'Create free account'}
          </Link>
        </section>
      </Reveal>

      <footer className="border-t border-slate-200 pt-6 pb-4 text-center text-xs text-slate-500">
        CareerPath provides decision support only and is not a substitute for professional career counseling.
        Compatibility scores show how well a profile matches defined career requirements, not the chance of career success.
      </footer>
    </div>
  );
}