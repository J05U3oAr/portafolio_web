/* ─────────────────────────────────────────
   PORTFOLIO — ARODI VÁSQUEZ
   space.js — Animated space background
   Handles: star particles, shooting stars,
            nebula clouds, canvas resize
───────────────────────────────────────── */

const canvas = document.getElementById('space-canvas');
const ctx    = canvas.getContext('2d');

let W, H;
const particles     = [];
const shootingStars = [];

/* ── Utilities ── */
function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

/* ── Star Particle ── */
class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x             = Math.random() * W;
    this.y             = Math.random() * H;
    this.r             = randomBetween(0.3, 1.6);
    this.baseAlpha     = randomBetween(0.2, 0.9);
    this.alpha         = this.baseAlpha;
    this.twinkleSpeed  = randomBetween(0.005, 0.02);
    this.twinkleOffset = Math.random() * Math.PI * 2;
    this.hue           = Math.random() < 0.2 ? randomBetween(240, 290) : 0;
    this.colored       = this.hue !== 0;
  }

  draw(t) {
    this.alpha = this.baseAlpha * (0.5 + 0.5 * Math.sin(t * this.twinkleSpeed + this.twinkleOffset));

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.colored
      ? `hsla(${this.hue}, 80%, 75%, ${this.alpha})`
      : `rgba(230, 225, 255, ${this.alpha})`;
    ctx.fill();
  }
}

/* ── Shooting Star ── */
class ShootingStar {
  constructor() { this.reset(); }

  reset() {
    this.x        = Math.random() * W;
    this.y        = Math.random() * H * 0.5;
    this.len      = randomBetween(80, 200);
    this.speed    = randomBetween(8, 16);
    this.alpha    = 0.9;
    this.angle    = randomBetween(0.15, 0.45);
    this.active   = false;
    this.timer    = 0;
    this.maxTimer = randomBetween(3, 10) * 60;
  }

  update() {
    if (!this.active) {
      this.timer++;
      if (this.timer > this.maxTimer) {
        this.active = true;
        this.timer  = 0;
      }
      return;
    }

    this.x     += Math.cos(this.angle) * this.speed;
    this.y     += Math.sin(this.angle) * this.speed;
    this.alpha -= 0.025;

    if (this.alpha <= 0 || this.x > W + 100 || this.y > H) {
      this.reset();
    }
  }

  draw() {
    if (!this.active) return;

    const tailX = this.x - Math.cos(this.angle) * this.len;
    const tailY = this.y - Math.sin(this.angle) * this.len;

    const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, `rgba(200, 190, 255, ${this.alpha})`);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
}

/* ── Nebula Cloud Configs ── */
const nebulaClouds = [
  { x: 0.15, y: 0.25, rx: 0.35, ry: 0.22, hue: 270, alpha: 0.04 },
  { x: 0.80, y: 0.65, rx: 0.28, ry: 0.20, hue: 220, alpha: 0.05 },
  { x: 0.50, y: 0.45, rx: 0.20, ry: 0.15, hue: 280, alpha: 0.025 },
];

function drawNebulaClouds() {
  nebulaClouds.forEach(n => {
    const grd = ctx.createRadialGradient(
      n.x * W, n.y * H, 0,
      n.x * W, n.y * H, n.rx * W
    );
    grd.addColorStop(0,   `hsla(${n.hue}, 70%, 50%, ${n.alpha})`);
    grd.addColorStop(0.5, `hsla(${n.hue}, 60%, 40%, ${n.alpha * 0.4})`);
    grd.addColorStop(1,   'transparent');

    ctx.save();
    ctx.scale(1, n.ry / n.rx);
    ctx.beginPath();
    ctx.arc(n.x * W, (n.y * H) * (n.rx / n.ry), n.rx * W, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
  });
}

/* ── Init ── */
for (let i = 0; i < 280; i++) particles.push(new Particle());
for (let i = 0; i < 4;   i++) shootingStars.push(new ShootingStar());

/* ── Render Loop ── */
let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, W, H);

  drawNebulaClouds();
  particles.forEach(p => p.draw(frame));
  shootingStars.forEach(s => { s.update(); s.draw(); });

  frame++;
}

animate();
