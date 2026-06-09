/* js/quiz.js — Quiz engine: state, rendering, interactions, and boot animations */

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
const answers = {};
let step = 0;

/* ─────────────────────────────────────────
   STEP DOTS
───────────────────────────────────────── */
function updateDots(cur) {
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById('dot-' + i);
    if (!d) continue;
    d.className = 'sdot';
    if (i < cur)      d.classList.add('done');
    else if (i === cur) d.classList.add('active');
  }
}

/* ─────────────────────────────────────────
   RENDER
───────────────────────────────────────── */
function render() {
  const root = document.getElementById('quiz-root');
  const pct  = step >= 4 ? 100 : Math.round((step / 4) * 100);

  updateDots(step < 4 ? step : 4);
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-pct').textContent  = pct + '%';

  /* ── RESULT ── */
  if (step >= QUESTIONS.length) {
    const r = getResult(answers);
    document.getElementById('prog-label').textContent = 'All done!';

    root.innerHTML = `
      <div id="res-wrap">
        <div class="result-header" id="res-hdr">
          <div class="result-check">✓</div>
          <div>
            <div class="result-eyebrow">Your result</div>
            <div class="result-tier">${r.tier}</div>
          </div>
        </div>
        <div class="result-card" id="res-card">
          <div class="model-name">${r.model}</div>
          <div class="model-sub">DreamServer's auto-selected model for your hardware</div>
          <div class="use-tag">★ ${USE_LABELS[answers.use] || 'General use'}</div>
          <div class="stats-grid">
            <div class="stat" id="s0"><div class="stat-val" id="sv0">—</div><div class="stat-lbl">Context</div></div>
            <div class="stat" id="s1"><div class="stat-val" id="sv1">—</div><div class="stat-lbl">Speed</div></div>
            <div class="stat" id="s2"><div class="stat-val" id="sv2">—</div><div class="stat-lbl">Backend</div></div>
          </div>
          <div class="note-box">
            ${r.note}
            ${answers.use === 'all'
              ? ' <strong>Developer mode:</strong> chat UI, voice (Whisper + Kokoro), Hermes agents, n8n, RAG (Qdrant), and ComfyUI — all pre-wired, one install.'
              : ''}
          </div>
          <div class="action-row">
            <a class="btn-primary" href="https://github.com/Light-Heart-Labs/DreamServer" target="_blank">
              <svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              Install DreamServer
            </a>
            <a class="btn-ghost" href="https://discord.gg/qGVygYada3" target="_blank">
              <svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.02.01.04.027.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              Join Discord
            </a>
          </div>
        </div>
        <button class="reset-link" onclick="resetQuiz()">↺ retake the quiz</button>
      </div>
    `;

    /* Animate result panels in */
    anime({ targets: '#res-hdr',  opacity: [0,1], translateY: [12,0], duration: 500, easing: 'easeOutCubic' });
    anime({ targets: '#res-card', opacity: [0,1], translateY: [18,0], duration: 550, delay: 100, easing: 'easeOutCubic' });
    anime({ targets: ['#s0','#s1','#s2'], opacity: [0,1], translateY: [8,0], duration: 400, delay: anime.stagger(80, { start: 300 }), easing: 'easeOutCubic' });

    /* Pop stat values in */
    setTimeout(() => {
      document.getElementById('sv0').textContent = r.ctx;
      document.getElementById('sv1').textContent = r.speed;
      document.getElementById('sv2').textContent = (answers.gpu || '').toUpperCase();
      anime({ targets: ['#sv0','#sv1','#sv2'], scale: [0.7,1], opacity: [0,1], duration: 400, delay: anime.stagger(60), easing: 'easeOutBack' });
    }, 380);

    launchConfetti();
    return;
  }

  /* ── QUESTION ── */
  const q   = QUESTIONS[step];
  const sel = answers[q.id];

  document.getElementById('prog-label').textContent = `Question ${step + 1} of 4`;

  root.innerHTML = `
    <div id="qblock">
      <div class="q-eyebrow">${q.eyebrow}</div>
      <div class="q-text">${q.q}</div>
      <div class="opts" id="opts-grid">
        ${q.opts.map((o, i) => `
          <button class="opt${sel === o.val ? ' selected' : ''}" id="opt${i}" onclick="pick('${q.id}','${o.val}')">
            <div class="opt-check"><svg viewBox="0 0 12 10"><polyline points="1,5 4,8 11,1"/></svg></div>
            <span class="opt-emoji">${o.emoji}</span>
            <span class="opt-name">${o.name}</span>
            <span class="opt-desc">${o.desc}</span>
            ${o.badge ? `<span class="opt-badge">${o.badge}</span>` : ''}
          </button>
        `).join('')}
      </div>
      <div class="info-pill" id="info-pill">
        <span class="info-emoji">${q.hint.icon}</span>
        <div>
          <div class="info-title">${q.hint.title}</div>
          <div class="info-text">${q.hint.text}</div>
        </div>
      </div>
      <div id="next-wrap" style="min-height:50px">
        ${sel ? `
          <button class="next-btn" id="next-btn" onclick="advance()">
            ${step === QUESTIONS.length - 1 ? 'See my result' : 'Continue'}
            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        ` : ''}
      </div>
    </div>
  `;

  /* Stagger entrance animations */
  anime({ targets: '#qblock .q-eyebrow, #qblock .q-text', opacity: [0,1], translateY: [10,0], duration: 380, delay: anime.stagger(60), easing: 'easeOutCubic' });
  anime({ targets: '#opts-grid .opt', opacity: [0,1], translateY: [14,0], scale: [0.96,1], duration: 380, delay: anime.stagger(50, { start: 80 }), easing: 'easeOutCubic' });
  anime({ targets: '#info-pill', opacity: [0,1], translateX: [-10,0], duration: 380, delay: 220, easing: 'easeOutCubic' });
  if (sel) {
    anime({ targets: '#next-btn', opacity: [0,1], translateY: [6,0], duration: 320, delay: 280, easing: 'easeOutCubic' });
  }
}

/* ─────────────────────────────────────────
   INTERACTIONS
───────────────────────────────────────── */

/** Handle option selection */
function pick(qid, val) {
  answers[qid] = val;

  // Auto-fill derived answers
  if (qid === 'gpu') {
    if (val === 'apple') answers.os   = 'mac';
    if (val === 'none')  answers.vram = '8';
  }

  render();

  // Spring bounce on selected card
  requestAnimationFrame(() => {
    const sel = document.querySelector('.opt.selected');
    if (sel) anime({ targets: sel, scale: [0.93, 1], duration: 380, easing: 'easeOutBack' });
  });
}

/** Advance to the next question with a slide-out transition */
function advance() {
  anime({
    targets: '#qblock',
    opacity:    [1, 0],
    translateX: [0, -30],
    duration: 220,
    easing: 'easeInCubic',
    complete: () => {
      step++;
      const cur = QUESTIONS[step];
      // Skip VRAM step when CPU-only is selected
      if (cur && answers.gpu === 'none' && cur.id === 'vram') step++;
      render();
    }
  });
}

/** Reset all state and restart from question 1 */
function resetQuiz() {
  step = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  render();
}

/* ─────────────────────────────────────────
   PAGE BOOT ANIMATIONS
───────────────────────────────────────── */
window.addEventListener('load', () => {
  // Badge pill
  anime({ targets: '#pill', opacity: [0,1], translateY: [8,0], duration: 600, easing: 'easeOutCubic' });

  // Typewriter headline
  setTimeout(() => {
    const h1 = document.getElementById('h1-target');
    h1.style.opacity = '1';
    typewrite(h1);
  }, 400);

  // Subtitle and progress bar
  anime({ targets: '#sub',       opacity: [0,1], translateY: [8,0], duration: 600, delay: 1400, easing: 'easeOutCubic' });
  anime({ targets: '#prog-wrap', opacity: [0,1], translateY: [6,0], duration: 500, delay: 1600, easing: 'easeOutCubic' });

  // First question after typewriter finishes
  setTimeout(render, 1800);
});
