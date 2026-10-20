/* Job Quest shared data and helpers. Every page loads this first. */
(function () {
  const C = { BLACK: '#0b0c0c', YELLOW: '#ffdd00', GREEN: '#00703c', RED: '#d4351c', BLUE: '#1d70b8', PURPLE: '#4c2c92' };

  /* ---- The journey. Edit quests here; the map, profile and quest pages all read it. ---- */
  const WORLDS = [
    { name: 'Know yourself', place: 'Discovery Meadow', ground: '#8fae55', skill: 'Self-knowledge',
      stages: [
        { name: 'Personality type', note: 'Your personality type, goals and motivations' },
        { name: 'Map your skills', note: 'For your CV and job search: what you enjoy studying and where you get your best grades' },
        { name: 'Career suggestions', note: 'Swipe left or right on jobs to show what you like the look of' },
        { name: 'How and where you want to work', note: 'Location, working style, any adjustments you need, and whether you drive' },
      ],
      side: [{ name: 'Side quest TBC', at: .5 }],
      gate: ['Feel comfortable with what your skills are', 'Know what type of work you want'] },
    { name: 'Create a CV', place: 'CV Town', ground: '#b3c27a', skill: 'CV writing',
      stages: [
        { name: 'Build your personal statement', note: 'Options based on what you have told us, with help from an AI work assistant', link: { text: 'AI work assistant (link TBC)' } },
        { name: 'Add your experience and qualifications', link: { text: 'CV Builder', href: 'https://nationalcareers.service.gov.uk/careers-advice/cv-sections' } },
        { name: 'Get feedback on your CV', note: 'Based on applicant tracking system (ATS) checks and AI analysis of your CV' },
        { name: 'Work readiness check-in', note: 'A short quiz' },
      ],
      side: [],
      gate: ['Have a Core CV that you feel great about'],
      loop: 'If your CV is missing something, we send you back to a quest in Know yourself.' },
    { name: 'Search for jobs', place: 'Application City', ground: '#b1b4b6', skill: 'Job searching',
      stages: [
        { name: 'Find jobs that suit you', note: 'Job match shown as stars, plus what people like you applied for', link: { text: 'Find a job', href: 'https://findajob.dwp.gov.uk/' } },
        { name: '"Is this job right for me?" quiz', note: 'Understand the job spec, check your skills match and how relevant the role is' },
        { name: 'Job-specific test', note: 'Helping make sure the job is right for you' },
        { name: 'Apply for jobs', note: 'What to expect and how to get feedback on your applications', link: { text: 'Track your applications', href: 'applications.html', internal: true } },
        { name: 'Work readiness check-in', note: 'A short quiz' },
      ],
      side: [{ name: 'Stepping-stone roles', note: 'If a job is not right yet: similar roles and stories from people like you', at: .58 }],
      gate: ['Be applying for a range of jobs that are a good fit'],
      loop: 'If a job needs a tailored CV, go back to Create a CV, then return here.' },
    { name: 'Interviewing', place: 'Interview Peaks', ground: '#c9a46a', skill: 'Interview skills',
      stages: [
        { name: 'What to expect', note: 'No surprises: questions you might be asked, what to wear, arriving on time, and how being late or not turning up comes across' },
        { name: 'How to structure your answers', note: 'Use the STAR method to bring your skills into your answers and prove how you have shown them' },
        { name: 'Core questions', note: 'Tell me about yourself. Your strengths and weaknesses. What you like to do in your spare time' },
        { name: 'Role-based questions', note: 'Add the job spec and your CV and we give you example questions, with guidance on what the employer might be looking for' },
        { name: 'Practice interviews', note: 'Your feedback score improves as you build up practice' },
      ],
      side: [{ name: 'Get face to face support', note: 'Meet a careers adviser', at: .58 }],
      gate: ['Get a job offer'],
      loop: 'Not this time? Head back to Search for jobs. Do not be put off if this is a process of trial and error. It may take time to find your match.' },
  ];
  const FINISH_STEPS = ['Tell your network when you are successful', 'Share your tips with the Job Quest community'];
  const XP_QUEST = 100, XP_SIDE = 50, XP_LEVEL = 300;

  /* ---- Storage (this browser only) ---- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };

  /* ---- Quiz ---- */
  const QUESTIONS = [
    { id: 'confidence', q: 'How confident do you feel about finding a job?', options: [
      ['very', 'Very confident'], ['quite', 'Quite confident'], ['not-very', 'Not very confident'], ['not-at-all', 'Not at all confident']] },
    { id: 'work', q: 'Have you had a paid job before?', hint: 'Include part-time and weekend jobs.', options: [
      ['recent', 'Yes, in the last 2 years'], ['past', 'Yes, more than 2 years ago'], ['never', 'No, I have not had a paid job']] },
    { id: 'idea', q: 'Do you know what kind of work you want to do?', options: [
      ['yes', 'Yes, I know the job I want'], ['some', 'I have a few ideas'], ['no', 'No, not yet']] },
    { id: 'cv', q: 'Do you have a CV?', options: [
      ['good', 'Yes, and I am happy with it'], ['needs-work', 'Yes, but it needs work'], ['none', 'No']] },
    { id: 'interviews', q: 'Have you been invited to any job interviews in the last 6 months?', options: [
      ['yes', 'Yes'], ['no', 'No']] },
  ];
  const EXAMPLE_ANSWERS = { confidence: 'not-very', work: 'never', idea: 'no', cv: 'none', interviews: 'no' };
  const answers = () => store.get('jq-answers', null);
  const label = (id, v) => { const q = QUESTIONS.find(x => x.id === id); const o = q && q.options.find(o => o[0] === v); return o ? o[1] : 'Not answered'; };

  const SEGMENTS = {
    explorer: { title: 'Explorer', need: 'Know what you want', world: 0,
      about: 'You are still working out what kind of work would suit you. That is a great place to start, and most people begin here.',
      next: 'Find your strengths, skills and interests, then explore careers that match them.' },
    builder: { title: 'Builder', need: 'Get building a CV', world: 1,
      about: 'You know the kind of work you want. Now you need a CV that shows employers what you can do.',
      next: 'Build a CV with the CV team and get feedback on it.' },
    applier: { title: 'Go-getter', need: 'Start applying', world: 2,
      about: 'You know what you want and you have a CV. The next step is finding the right jobs and applying well.',
      next: 'Search for jobs that match you and make strong, tailored applications.' },
    performer: { title: 'Performer', need: 'Get interview ready', world: 3,
      about: 'You are getting interviews. Practice and preparation will help you turn them into offers.',
      next: 'Prepare for common questions and practise until you feel confident.' },
  };
  function segmentFor(a) {
    a = a || EXAMPLE_ANSWERS;
    if (a.idea !== 'yes') return 'explorer';
    if (a.cv !== 'good') return 'builder';
    if (a.interviews !== 'yes') return 'applier';
    return 'performer';
  }

  /* ---- Progress (shared with the map) ---- */
  const allStages = [];
  WORLDS.forEach((w, k) => w.stages.forEach((s, i) => allStages.push({ world: k, i, name: s.name, code: `${k + 1}-${i + 1}` })));
  const firstOfWorld = k => allStages.findIndex(s => s.world === k);
  function progress() {
    let cur = store.get('jq-gov2-cur', 4); if (!(cur >= 0 && cur <= allStages.length)) cur = 4;
    const side = new Set(store.get('jq-gov2-side', []));
    const xp = cur * XP_QUEST + side.size * XP_SIDE;
    const worldDone = WORLDS.map((_, k) => allStages.filter(s => s.world === k).length ? allStages.every((s, i) => s.world !== k || i < cur) : false);
    const worldRatio = WORLDS.map((_, k) => { const idx = allStages.map((s, i) => s.world === k ? i : -1).filter(i => i >= 0); return idx.filter(i => i < cur).length / idx.length; });
    return { cur, side, xp, level: Math.floor(xp / XP_LEVEL) + 1, levelXp: xp % XP_LEVEL, total: allStages.length, worldDone, worldRatio, stage: allStages[cur] || null };
  }
  function setProgress(cur) { store.set('jq-gov2-cur', cur); }

  /* ---- Avatar ---- */
  const AVATAR_OPTIONS = {
    suit: [[C.BLUE, 'Blue'], [C.GREEN, 'Green'], [C.PURPLE, 'Purple'], [C.RED, 'Red']],
    skin: [['#f1c4a0', 'Light'], ['#d9a27a', 'Medium light'], ['#a86b45', 'Medium dark'], ['#6b4329', 'Dark']],
    hair: [['cap', 'Cap'], ['short', 'Short'], ['long', 'Long'], ['bun', 'Bun']],
    hairColour: [[C.BLACK, 'Black'], ['#6b4f2a', 'Brown'], ['#d8a93a', 'Blonde'], ['#b5451b', 'Red']],
  };
  const DEFAULT_AVATAR = { name: 'Player', suit: C.BLUE, skin: '#f1c4a0', hair: 'cap', hairColour: C.BLACK };
  const avatar = () => Object.assign({}, DEFAULT_AVATAR, store.get('jq-avatar', {}));
  function figure(a) {
    a = Object.assign({}, DEFAULT_AVATAR, a || {});
    const B = C.BLACK, h = a.hairColour;
    let hairBack = '', hairFront = '';
    if (a.hair === 'long') hairBack = `<path d="M-12,-16 L-12,-31 Q-11,-44 0,-43 Q11,-44 12,-31 L12,-16 Z" fill="${h}"/>`;
    if (a.hair === 'cap') hairFront = `<path d="M-11,-31 Q-10,-44 0,-43 Q11,-44 11,-31 Z" fill="${h}"/><rect x="2" y="-35" width="14" height="5" rx="2" fill="${h}"/>`;
    if (a.hair === 'short' || a.hair === 'long' || a.hair === 'bun') hairFront = `<path d="M-11,-30 Q-11,-43 0,-42 Q11,-43 11,-30 Q6,-35 0,-35 Q-6,-35 -11,-30 Z" fill="${h}"/>`;
    if (a.hair === 'bun') hairFront += `<circle cx="0" cy="-44" r="6" fill="${h}"/>`;
    return `<ellipse cx="0" cy="18" rx="14" ry="4" fill="${B}" opacity=".25"/>` + hairBack +
      `<rect x="-8" y="2" width="6" height="14" fill="${B}"/><rect x="2" y="2" width="6" height="14" fill="${B}"/>` +
      `<rect x="-11" y="-20" width="22" height="24" rx="4" fill="${a.suit}"/>` +
      `<polygon points="0,-18 -3,-12 0,-2 3,-12" fill="${C.YELLOW}"/>` +
      `<circle cx="0" cy="-30" r="10" fill="${a.skin}"/>` + hairFront +
      `<circle cx="3" cy="-28" r="1.8" fill="${B}"/><path d="M1,-24 Q4,-22 7,-24" fill="none" stroke="${B}" stroke-width="1.5" stroke-linecap="round"/>` +
      `<rect x="12" y="-6" width="16" height="12" rx="2" fill="#6b4f2a"/><path d="M16,-6 L16,-10 L24,-10 L24,-6" fill="none" stroke="${B}" stroke-width="2.5"/>`;
  }
  function avatarSvg(a, size, bg) {
    return `<svg width="${size}" height="${size}" viewBox="-36 -56 72 78" aria-hidden="true" focusable="false">` +
      (bg ? `<circle cx="0" cy="-17" r="36" fill="${bg}"/>` : '') + figure(a) + `</svg>`;
  }

  /* ---- Trophies ---- */
  function trophies() {
    const p = progress(), a = answers();
    return [
      { name: 'First steps', how: 'Finish the career journey quiz', got: !!a },
      { name: 'Looking sharp', how: 'Create your avatar', got: !!store.get('jq-avatar', null) },
      { name: 'Know thyself', how: 'Complete Know yourself', got: p.worldDone[0] },
      { name: 'Paper trail', how: 'Complete Create a CV', got: p.worldDone[1] },
      { name: 'Explorer', how: 'Complete a side quest', got: p.side.size > 0 },
      { name: 'On the radar', how: 'Track 5 applications', got: store.get('jq-apps', []).filter(x => !x.example).length >= 5 },
      { name: 'Sent it', how: 'Complete Search for jobs', got: p.worldDone[2] },
      { name: 'Ready for anything', how: 'Complete Interviewing', got: p.worldDone[3] },
      { name: 'Team player', how: 'Share a tip with the community', got: store.get('jq-tips', []).length > 0 },
      { name: 'Hired', how: 'Get a job offer', got: p.cur >= p.total },
    ];
  }

  /* ---- Page chrome ---- */
  const PAGES = [['index.html', 'Quiz'], ['results.html', 'Your results'], ['quest.html', 'The quest'], ['map.html', 'Quest map'], ['applications.html', 'Applications'], ['profile.html', 'Profile']];
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function chrome(active) {
    const top = document.getElementById('jq-top');
    if (top) top.innerHTML =
      `<header class="header"><div class="width"><a class="service" href="index.html"><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="12" fill="#ffdd00"/><path d="M8 14.5l4 4 8-9" fill="none" stroke="#0b0c0c" stroke-width="3.5" stroke-linecap="square"/></svg>Job Quest</a>` +
      `<nav aria-label="Service"><ul class="nav">${PAGES.map(([h, t]) => `<li><a href="${h}"${h === active ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></nav></div></header>` +
      `<div class="phase"><div class="width"><span class="tag blue">Prototype</span><span>This is a draft for discussion. Names, numbers and people shown are examples.</span></div></div>`;
    const foot = document.getElementById('jq-foot');
    if (foot) foot.innerHTML = `<footer class="footer"><div class="width"><span>Job Quest prototype</span><button class="linkbtn" type="button" id="jq-reset">Reset this prototype</button></div></footer>`;
    const r = document.getElementById('jq-reset');
    if (r) r.addEventListener('click', () => { ['jq-answers', 'jq-avatar', 'jq-gov2-cur', 'jq-gov2-side', 'jq-confirmed', 'jq-cheers', 'jq-apps', 'jq-tips'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} }); location.href = 'index.html'; });
  }

  window.JQ = { C, WORLDS, FINISH_STEPS, XP_QUEST, XP_SIDE, XP_LEVEL, store, QUESTIONS, EXAMPLE_ANSWERS, answers, label, SEGMENTS, segmentFor,
    allStages, firstOfWorld, progress, setProgress, AVATAR_OPTIONS, avatar, figure, avatarSvg, trophies, chrome, esc };
})();
