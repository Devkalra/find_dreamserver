/* js/quiz-data.js — Question definitions, use-case labels, and result logic */

/* ─────────────────────────────────────────
   QUESTIONS
───────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'os',
    eyebrow: 'Step 1 of 4 — platform',
    q: 'What operating system are you on?',
    hint: {
      icon: '💡',
      title: 'What is an OS?',
      text: 'Your <strong>operating system</strong> is the core software that runs your computer — Windows, macOS, or Linux. DreamServer installs differently on each. Windows needs Docker + WSL2, macOS requires an M-series Apple Silicon chip, and Linux has the broadest GPU support.'
    },
    opts: [
      { val: 'linux',   emoji: '🐧', name: 'Linux',   desc: 'Ubuntu, Debian, Arch, Fedora…' },
      { val: 'windows', emoji: '🪟', name: 'Windows', desc: 'Needs Docker Desktop + WSL2' },
      { val: 'mac',     emoji: '🍎', name: 'macOS',   desc: 'Apple Silicon M1 or newer only' }
    ]
  },
  {
    id: 'gpu',
    eyebrow: 'Step 2 of 4 — GPU',
    q: 'What GPU brand are you running?',
    hint: {
      icon: '🖥️',
      title: 'What is a GPU?',
      text: 'A <strong>GPU (Graphics Processing Unit)</strong> was built for gaming but its parallel compute is perfect for AI. Without a GPU, local AI models run very slowly. DreamServer supports <strong>NVIDIA</strong> (most common), <strong>AMD</strong> (including new AI laptops), <strong>Apple Silicon</strong> (GPU built into the M-chip), and <strong>Intel Arc</strong>. Not sure? Check Task Manager → Performance → GPU on Windows, or About This Mac on macOS.'
    },
    opts: [
      { val: 'nvidia', emoji: '🟢', name: 'NVIDIA',        desc: 'RTX, GTX, A-series' },
      { val: 'amd',    emoji: '🔴', name: 'AMD',           desc: 'Radeon or Ryzen AI MAX+' },
      { val: 'apple',  emoji: '⚡', name: 'Apple Silicon', desc: 'M1 / M2 / M3 / M4 chip' },
      { val: 'intel',  emoji: '🔵', name: 'Intel Arc',     desc: 'A380, A750, A770' },
      { val: 'none',   emoji: '💻', name: 'CPU only',      desc: 'No discrete GPU' }
    ]
  },
  {
    id: 'vram',
    eyebrow: 'Step 3 of 4 — memory',
    q: 'How much GPU or unified memory do you have?',
    hint: {
      icon: '🧠',
      title: 'Why does memory matter so much?',
      text: '<strong>VRAM</strong> is the memory on your GPU — and it\'s the single biggest factor in which AI model you can run. The entire model must fit in GPU memory to run at full speed. More memory = bigger, smarter model. On <strong>Apple Silicon</strong> and <strong>AMD Ryzen AI MAX+</strong>, this is called <strong>unified memory</strong> — CPU and GPU share one pool, so even a 16 GB M4 Mac Mini runs impressive models. To check yours: Windows → Task Manager → Performance → GPU. Mac → About This Mac → Memory.'
    },
    opts: [
      { val: '6',  emoji: '📦', name: '6 GB',     desc: 'Intel Arc A380' },
      { val: '8',  emoji: '📦', name: '8 GB',     desc: 'Entry level' },
      { val: '16', emoji: '📦', name: '12–16 GB', desc: 'Mid-range' },
      { val: '24', emoji: '📦', name: '24–32 GB', desc: 'High-end' },
      { val: '48', emoji: '📦', name: '48–64 GB', desc: 'Pro / unified memory' },
      { val: '90', emoji: '📦', name: '90–128 GB+', desc: 'Workstation / Strix Halo' }
    ]
  },
  {
    id: 'use',
    eyebrow: 'Step 4 of 4 — use case',
    q: 'What do you want to do with local AI?',
    hint: {
      icon: '🛠️',
      title: 'What does DreamServer actually include?',
      text: 'DreamServer is a <strong>full AI stack</strong> — not just a chatbot. It ships with: ChatGPT-style web UI, voice (Whisper STT + Kokoro TTS), AI agents (Hermes) that can browse and automate, n8n workflow automation with 400+ integrations, a vector database for chatting with your own documents (RAG via Qdrant), and local image generation via ComfyUI. Pick what excites you — or pick <strong>All of it</strong> for the full developer experience.'
    },
    opts: [
      { val: 'chat',   emoji: '💬', name: 'Chat & Q&A',      desc: 'Private AI assistant' },
      { val: 'code',   emoji: '👨‍💻', name: 'Code assistant',  desc: 'Pair programming & autocomplete' },
      { val: 'agents', emoji: '🤖', name: 'AI agents',        desc: 'Automate tasks & workflows' },
      { val: 'image',  emoji: '🎨', name: 'Image generation', desc: 'Run ComfyUI / Stable Diffusion' },
      { val: 'all',    emoji: '⚡', name: 'All of it',        desc: 'Full developer stack', badge: '⚡ developer mode' }
    ]
  }
];

/* ─────────────────────────────────────────
   USE-CASE LABELS  (for result display)
───────────────────────────────────────── */
const USE_LABELS = {
  chat:   'Chat & Q&A',
  code:   'Code assistant',
  agents: 'AI agents',
  image:  'Image generation',
  all:    'Full dev stack'
};

/* ─────────────────────────────────────────
   RESULT LOGIC
───────────────────────────────────────── */

/**
 * Returns the result object for the current set of answers.
 * Called from quiz.js after all questions are answered.
 *
 * @param {Object} answers - { os, gpu, vram, use }
 * @returns {{ tier, model, ctx, speed, note }}
 */
function getResult(answers) {
  const v = parseInt(answers.vram) || 8;
  const g = answers.gpu;

  if (g === 'none') {
    return {
      tier:  'T0 — CPU fallback',
      model: 'Qwen3.5 2B (Q4_K_M)',
      ctx:   '8K',
      speed: '~3 tok/s',
      note:  'No GPU detected — DreamServer boots in CPU-only mode. Works for testing and light chat. Any discrete GPU unlocks dramatically larger models.'
    };
  }

  if (g === 'apple') {
    if (v <= 8)  return { tier: 'Apple T0 — 8 GB',  model: 'Phi-4 Mini (Q4_K_M)',          ctx: '128K', speed: 'Fast (Metal)',  note: 'Your M-chip runs llama-server <strong>natively with Metal</strong> — no Docker for inference. The 128K context window is a hidden superpower for your RAM tier.' };
    if (v <= 16) return { tier: 'Apple T1 — 16 GB', model: 'Qwen3.5 9B (Q4_K_M)',          ctx: '32K',  speed: 'Fast (Metal)',  note: 'Sweet spot for M4 Mac Mini. A solid 9B model for chat, coding, and light agents — DreamServer auto-selects Metal acceleration.' };
    if (v <= 32) return { tier: 'Apple T2 — 32 GB', model: 'Phi-4 14B (Q4_K_M)',           ctx: '16K',  speed: 'Fast (Metal)',  note: 'M3/M4 Pro territory. Phi-4 14B punches well above its size for reasoning and code — great results from the open-source ecosystem.' };
    if (v <= 48) return { tier: 'Apple T3 — 48 GB', model: 'Qwen3.5 27B (Q4_K_M)',         ctx: '32K',  speed: 'Very fast',     note: 'M4 Pro or M2 Max class. Running a 27B model locally is genuinely impressive — comparable to smaller hosted cloud models.' };
    return         { tier: 'Apple T4 — 64 GB+',     model: 'Qwen3.6 35B-A3B (UD-Q4_K_M)', ctx: '128K', speed: 'Very fast',     note: 'M2 Ultra or M4 Max class. A 128K context window running locally is extraordinary for RAG, long documents, and multi-step agents.' };
  }

  if (g === 'intel') {
    if (v <= 6)  return { tier: 'ARC_LITE — 6 GB',  model: 'Phi-4 Mini (Q4_K_M)',  ctx: '128K', speed: 'Good (SYCL)', note: 'Arc A380 class. DreamServer auto-selects the SYCL backend. Phi-4 Mini is compact but punches above its weight — the 128K context window is a bonus at this tier.' };
    if (v <= 8)  return { tier: 'ARC_LITE — 8 GB',  model: 'Qwen3.5 9B (Q4_K_M)', ctx: '32K',  speed: 'Good (SYCL)', note: 'Arc A750 class. DreamServer auto-selects the SYCL backend for Intel Arc. Solid daily driver for chat and code.' };
    return         { tier: 'Arc — 16 GB',            model: 'Phi-4 14B (Q4_K_M)',  ctx: '16K',  speed: 'Good (SYCL)', note: 'Arc A770 16 GB. Intel Arc is underrated for local AI — DreamServer supports SYCL out of the box. A 14B model runs well here.' };
  }

  // AMD Strix Halo (Unified Memory) — three official sub-tiers
  if (g === 'amd' && v >= 90) {
    // SH_LARGE: 96 GB → DeepSeek R1 70B; 128 GB → Qwen3.6 35B-A3B
    // val='90' is the only bucket that covers both — use the 96 GB (most common) pick
    return { tier: 'AMD SH_LARGE — 96–128 GB', model: 'DeepSeek R1 Distill Llama 70B (Q4_K_M)', ctx: '32K', speed: 'Very fast', note: 'Ryzen AI MAX+ 395 (96 GB) territory. DreamServer uses a <strong>platform-specific accelerated backend</strong> for AMD unified memory. A frontier-class 70B reasoning model running fully on your own hardware.' };
  }
  if (g === 'amd' && v >= 48) {
    // SH_COMPACT: 64 GB → Qwen3.6 35B-A3B
    return { tier: 'AMD SH_COMPACT — 64 GB', model: 'Qwen3.6 35B-A3B (UD-Q4_K_M)', ctx: '128K', speed: 'Very fast', note: 'Ryzen AI MAX+ 395 (64 GB) territory. DreamServer uses a <strong>platform-specific accelerated backend</strong> for AMD unified memory — cutting-edge hardware, top-tier model with 128K context.' };
  }

  // NVIDIA / AMD (standard VRAM tiers)
  if (v <= 8)  return { tier: 'T1 — 8 GB VRAM',  model: 'Qwen3.5 9B (Q4_K_M)',                    ctx: '32K', speed: '~15 tok/s', note: 'RTX 4060 / 3060 class. A capable 9B model handles chat, code, and light agents well. Great entry point into private AI.' };
  if (v <= 16) return { tier: 'T2 — 12–16 GB',   model: 'Phi-4 14B (Q4_K_M)',                     ctx: '16K', speed: '~12 tok/s', note: 'RTX 4070 class. Phi-4 14B is efficient and surprisingly capable — strong at reasoning, math, and code. Sweet-spot territory.' };
  if (v <= 32) return { tier: 'T3 — 24 GB VRAM', model: 'Qwen3.5 27B (Q4_K_M)',                   ctx: '32K', speed: '~10 tok/s', note: 'RTX 4090 / A6000 class. A 27B model locally is equivalent to a small hosted cloud model — genuinely powerful for complex tasks.' };
  if (v <= 64) return { tier: 'T4 — 48 GB VRAM', model: 'DeepSeek R1 Distill Llama 70B (Q4_K_M)', ctx: '32K', speed: '~8 tok/s',  note: 'A6000 Ada / L40S class. Running a <strong>70B reasoning model</strong> fully on-premise is extraordinary — frontier-class reasoning, no cloud bill.' };
  return         { tier: 'NV Ultra — 90 GB+',     model: 'Qwen3 Coder Next (Q4_K_M)',              ctx: '128K', speed: 'Blazing',  note: 'Multi-GPU A100/H100 territory. A frontier-class coder model with 128K context running on your own hardware. Proper homelab royalty.' };
}
