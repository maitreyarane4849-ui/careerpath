const SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    phases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                type: { type: 'string', enum: ['learn', 'practice', 'project'] },
              },
              required: ['title', 'type'],
            },
          },
        },
        required: ['title', 'description', 'tasks'],
      },
    },
  },
  required: ['summary', 'phases'],
};

const TASK_TYPES = ['learn', 'practice', 'project'];

function buildMessages(profile, primary) {
  const skills = profile.skills.map((s) => `${s.name} (${s.level})`).join(', ') || 'none';
  const gaps =
    primary.skillGaps
      .map((g) =>
        g.status === 'Missing'
          ? `${g.skill} - missing, needs ${g.requiredLevel}`
          : `${g.skill} - improve from ${g.currentLevel} to ${g.requiredLevel}`
      )
      .join('\n') || 'No gaps';

  const system =
    'You are a career guidance assistant for students. Reply ONLY with JSON in the requested format. ' +
    'Do not include URLs, specific course names, certification names, salaries, or promises about getting a job. ' +
    'Do not mention any percentage or score.';

  const user = `Student profile:
- Degree: ${profile.education?.degree || ''} ${profile.education?.specialization || ''}
- Current skills: ${skills}
- Interests: ${(profile.interests || []).join(', ') || 'none'}

Target career: ${primary.title}
Skills already matching: ${primary.matchedSkills.join(', ') || 'none'}
Skill gaps (most important first):
${gaps}

Write:
1. "summary": 3 to 4 sentences explaining how the student's profile fits this career and what to focus on.
2. "phases": 4 to 5 ordered roadmap phases. Start with fundamentals, cover the skill gaps in order of importance, and finish with a portfolio phase. Each phase has a short title, a one-sentence description, and 3 to 5 concrete tasks. Task "type" must be "learn", "practice" or "project".`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

async function callOllama(messages) {
  const url = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.2:3b';

  const res = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      format: SCHEMA,
      options: { temperature: 0.3 },
    }),
    signal: AbortSignal.timeout(5 * 60 * 1000),
  });

  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.message.content;
}

// Parse and clean the model output. Throws if unusable.
function validate(raw) {
  const data = JSON.parse(raw);
  if (typeof data.summary !== 'string' || !data.summary.trim()) {
    throw new Error('Missing summary');
  }
  if (!Array.isArray(data.phases) || data.phases.length < 2) {
    throw new Error('Too few phases');
  }

  const phases = data.phases
    .map((p) => ({
      title: String(p.title || '').trim(),
      description: String(p.description || '').trim(),
      tasks: (Array.isArray(p.tasks) ? p.tasks : [])
        .map((t) => ({
          title: String(t.title || '').trim(),
          type: TASK_TYPES.includes(t.type) ? t.type : 'learn',
        }))
        .filter((t) => t.title),
    }))
    .filter((p) => p.title && p.tasks.length > 0);

  if (phases.length < 2) throw new Error('Phases had no usable tasks');
  return { summary: data.summary.trim(), phases };
}

async function generateRoadmap(profile, primary, attempts = 3) {
  const messages = buildMessages(profile, primary);
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return validate(await callOllama(messages));
    } catch (err) {
      lastError = err;
      console.warn(`Roadmap attempt ${i} failed: ${err.message}`);
    }
  }
  throw new Error(`AI generation failed after ${attempts} attempts: ${lastError.message}`);
}

module.exports = { generateRoadmap };