/* js/confetti.js — Canvas 2D confetti burst on quiz completion */

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx    = canvas.getContext('2d');
  const COLORS = ['#63b3ed', '#a78bfa', '#f472b6', '#4ade80', '#fbbf24', '#f87171'];

  const particles = Array.from({ length: 130 }, () => ({
    x:         Math.random() * canvas.width,
    y:         -20 - Math.random() * 200,
    r:         Math.random() * 6 + 2,
    d:         Math.random() * 8 + 2,
    color:     COLORS[Math.floor(Math.random() * COLORS.length)],
    tilt:      Math.random() * 10 - 5,
    tiltSpeed: Math.random() * 0.15 + 0.05,
    alpha:     1,
    shape:     Math.random() > 0.5 ? 'rect' : 'circle'
  }));

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.y         += p.d;
      p.tilt      += p.tiltSpeed;
      p.x         += Math.sin(frame * 0.02 + p.tilt) * 0.8;
      if (frame > 80) p.alpha = Math.max(0, p.alpha - 0.012);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tilt);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    frame++;
    if (frame < 200) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  draw();
}
