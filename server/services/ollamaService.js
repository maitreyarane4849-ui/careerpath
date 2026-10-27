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
  // Hosted API mode (used on Render)
  if (process.env.LLM_API_KEY) {
    const base = process.env.LLM_BASE_URL; // e.g. https://provider.example/v1
    const shape =
      'Reply with JSON only, shaped like: {"summary": "text", "phases": [{"title": "text", "description": "text", "tasks": [{"title": "text", "type": "learn|practice|project"}]}]}';
    const msgs = messages.map((m, i) =>
      i === 0 ? { ...m, content: m.content + ' ' + shape } : m
    );

    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL,
        messages: msgs,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(2 * 60 * 1000),
    });
    if (!res.ok) throw new Error(`LLM error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  // Local Ollama mode (your laptop)
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

  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.message.content;
}