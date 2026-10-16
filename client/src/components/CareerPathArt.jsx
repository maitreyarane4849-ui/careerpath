import Icon from './Icons';

const milestones = [
  { x: 40, y: 360, label: 'Learn', icon: 'book', delay: '0.4s' },
  { x: 240, y: 260, label: 'Build skills', icon: 'bulb', delay: '1.6s' },
  { x: 460, y: 80, label: 'Career goal', icon: 'target', delay: '3s' },
];

export default function CareerPathArt() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 520 420" className="w-full">
        <defs>
          <linearGradient id="pathGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="55%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* faint full track */}
        <path
          d="M40 360 C 140 360, 140 260, 240 260 S 360 160, 460 80"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* animated path that draws itself */}
        <path
          d="M40 360 C 140 360, 140 260, 240 260 S 360 160, 460 80"
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          className="animate-draw"
        />

        {milestones.map((m) => (
          <g
            key={m.label}
            className="animate-pop"
            style={{ animationDelay: m.delay, transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <circle cx={m.x} cy={m.y} r="22" fill="white" stroke="url(#pathGrad)" strokeWidth="5" />
            <circle cx={m.x} cy={m.y} r="8" fill="url(#pathGrad)" />
          </g>
        ))}
      </svg>

      {/* Labels sit on top of the SVG, positioned by percentage so they scale */}
      {milestones.map((m) => (
        <div
          key={m.label}
          className="absolute animate-pop -translate-x-1/2"
          style={{
            left: `${(m.x / 520) * 100}%`,
            top: `${(m.y / 420) * 100 + 8}%`,
            animationDelay: m.delay,
          }}
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-md border border-slate-100 text-xs font-semibold text-slate-700 whitespace-nowrap">
            <Icon name={m.icon} className="w-3.5 h-3.5 text-blue-600" />
            {m.label}
          </span>
        </div>
      ))}

      {/* Floating education and career icons */}
      <FloatChip icon="cap" className="top-2 left-4" delay="0s" color="from-blue-500 to-indigo-500" />
      <FloatChip icon="briefcase" className="top-1/3 right-0" delay="1.2s" color="from-violet-500 to-fuchsia-500" />
      <FloatChip icon="chart" className="bottom-6 right-10" delay="2.4s" color="from-cyan-500 to-blue-500" />
    </div>
  );
}

function FloatChip({ icon, className, delay, color }) {
  return (
    <div
      className={`absolute ${className} animate-float`}
      style={{ animationDelay: delay }}
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg`}>
        <Icon name={icon} className="w-6 h-6" />
      </div>
    </div>
  );
}