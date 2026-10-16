import CareerPathArt from './CareerPathArt';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
      <div className="hidden md:flex flex-col justify-center p-10 text-white bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-600 bg-[length:300%_100%] animate-gradient">
        <h2 className="text-3xl font-extrabold leading-tight">Plan your career, one step at a time</h2>
        <p className="mt-3 text-white/85 text-sm">
          Get matching careers, your skill gaps and a roadmap you can track.
        </p>
        <div className="mt-8 bg-white rounded-2xl p-4 shadow-lg">
          <CareerPathArt />
        </div>
      </div>
      <div className="p-8 sm:p-12 flex flex-col justify-center">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}