/* ─────────────────────────────────────────
   PORTFOLIO — ARODI VÁSQUEZ
   main.js — UI interactions
   Handles: custom cursor, scroll reveal,
            constellation canvas, contact form
───────────────────────────────────────── */

/* ── Custom Cursor ── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';

  setTimeout(() => {
    cursorRing.style.left = e.clientX + 'px';
    cursorRing.style.top  = e.clientY + 'px';
  }, 80);
});

document.querySelectorAll('a, button, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width      = '20px';
    cursor.style.height     = '20px';
    cursorRing.style.width  = '52px';
    cursorRing.style.height = '52px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width      = '12px';
    cursor.style.height     = '12px';
    cursorRing.style.width  = '36px';
    cursorRing.style.height = '36px';
  });
});

/* ── Scroll Reveal ── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Constellation Canvas ── */
const conCanvas = document.getElementById('constellation-canvas');
const conCtx    = conCanvas.getContext('2d');

const CONSTELLATIONS = [
  {
    name:  'ORION',
    stars: [[0.08,0.4],[0.12,0.55],[0.18,0.65],[0.25,0.72],[0.3,0.58],[0.35,0.45],[0.28,0.32],[0.22,0.28]],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[4,2],[1,4],[0,4]],
  },
  {
    name:  'GEMINI',
    stars: [[0.44,0.25],[0.5,0.2],[0.46,0.42],[0.52,0.38],[0.48,0.6],[0.54,0.56],[0.47,0.75],[0.53,0.72]],
    edges: [[0,2],[2,4],[4,6],[1,3],[3,5],[5,7],[0,1],[2,3],[4,5]],
  },
  {
    name:  'SCORPIUS',
    stars: [[0.68,0.2],[0.72,0.3],[0.7,0.42],[0.74,0.52],[0.72,0.63],[0.78,0.7],[0.82,0.72],[0.86,0.68],[0.9,0.62]],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
  },
];

function drawConstellation() {
  conCanvas.width  = conCanvas.offsetWidth;
  conCanvas.height = conCanvas.offsetHeight;

  const cW = conCanvas.width;
  const cH = conCanvas.height;

  conCtx.clearRect(0, 0, cW, cH);

  CONSTELLATIONS.forEach(con => {
    const pts = con.stars.map(([sx, sy]) => ({
      x: sx * cW,
      y: sy * cH,
    }));

    // Draw edges
    con.edges.forEach(([a, b]) => {
      const grad = conCtx.createLinearGradient(pts[a].x, pts[a].y, pts[b].x, pts[b].y);
      grad.addColorStop(0, 'rgba(167,139,250,0.3)');
      grad.addColorStop(1, 'rgba(34,211,238,0.15)');

      conCtx.beginPath();
      conCtx.moveTo(pts[a].x, pts[a].y);
      conCtx.lineTo(pts[b].x, pts[b].y);
      conCtx.strokeStyle = grad;
      conCtx.lineWidth   = 0.7;
      conCtx.stroke();
    });

    // Draw star dots
    pts.forEach((p, i) => {
      const r = (i === 0 || i === 1) ? 2.5 : 1.5;
      conCtx.beginPath();
      conCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
      conCtx.fillStyle = 'rgba(200,190,255,0.9)';
      conCtx.fill();
    });

    // Draw constellation label above centroid
    if (pts.length > 0) {
      const cx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
      const cy = Math.min(...pts.map(p => p.y)) - 14;

      conCtx.font        = '500 9px "DM Mono", monospace';
      conCtx.fillStyle   = 'rgba(167,139,250,0.5)';
      conCtx.textAlign   = 'center';
      conCtx.fillText(con.name, cx, cy);
    }
  });
}

// Initial draw + redraw on resize
setTimeout(drawConstellation, 500);
window.addEventListener('resize', drawConstellation);

/* ── Contact Form — API Simulation ──
   Simulates a Next.js API Route at POST /api/contact.
   In production this would be a real server-side call.
   Logic mirrors what the route would validate:
     - name required
     - email format via regex
     - message min 10 chars
     - returns structured JSON response
─────────────────────────────────────── */

/**
 * Simulates the server-side validation and response
 * that a real /api/contact Next.js route would return.
 * @param {{ name: string, email: string, message: string }} data
 * @returns {Promise<{ ok: boolean, status?: number, body?: object, error?: string, message?: string }>}
 */
function simulateApiCall(data) {
  return new Promise(resolve => {
    // Simulate network latency
    setTimeout(() => {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!data.name.trim()) {
        resolve({ ok: false, error: 'name', message: 'El campo "nombre" es requerido.' });
        return;
      }
      if (!EMAIL_REGEX.test(data.email)) {
        resolve({ ok: false, error: 'email', message: 'El formato del email no es válido.' });
        return;
      }
      if (data.message.trim().length < 10) {
        resolve({ ok: false, error: 'message', message: 'El mensaje debe tener al menos 10 caracteres.' });
        return;
      }

      resolve({
        ok:     true,
        status: 200,
        body: {
          success:   true,
          message:   'Mensaje recibido correctamente.',
          timestamp: new Date().toISOString(),
          recipient: 'arodi@example.com',
          sanitized: {
            name:          data.name.trim().substring(0, 80),
            email:         data.email.toLowerCase().trim(),
            messageLength: data.message.trim().length,
          },
        },
      });
    }, 800);
  });
}

/**
 * Recursively renders a JSON object as syntax-highlighted HTML log lines.
 * @param {object} obj
 * @param {number} indent
 * @returns {string[]}
 */
function renderJsonToLog(obj, indent) {
  const lines  = [];
  const prefix = '  '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object') {
      lines.push(`<div class="log-line">${prefix}<span class="log-key">"${key}"</span>: {</div>`);
      lines.push(...renderJsonToLog(value, indent + 1));
      lines.push(`<div class="log-line">${prefix}}</div>`);
    } else if (typeof value === 'string') {
      lines.push(`<div class="log-line">${prefix}<span class="log-key">"${key}"</span>: <span class="log-str">"${value}"</span></div>`);
    } else if (typeof value === 'number') {
      lines.push(`<div class="log-line">${prefix}<span class="log-key">"${key}"</span>: <span class="log-num">${value}</span></div>`);
    } else if (typeof value === 'boolean') {
      lines.push(`<div class="log-line">${prefix}<span class="log-key">"${key}"</span>: <span class="log-bool">${value}</span></div>`);
    } else {
      lines.push(`<div class="log-line">${prefix}<span class="log-key">"${key}"</span>: <span class="log-null">null</span></div>`);
    }
  }
  return lines;
}

/**
 * Handles the contact form submit button click.
 * Reads form values, calls simulateApiCall, and
 * updates the log panel and inline error messages.
 */
async function handleContactSubmit() {
  const name      = document.getElementById('cf-name').value;
  const email     = document.getElementById('cf-email').value;
  const message   = document.getElementById('cf-message').value;
  const submitBtn = document.getElementById('form-submit');
  const responseEl = document.getElementById('form-response');
  const logBody   = document.getElementById('api-log-body');
  const logDot    = document.getElementById('log-dot');

  // Clear previous errors
  ['err-name', 'err-email', 'err-message'].forEach(id => {
    document.getElementById(id).classList.remove('visible');
  });
  responseEl.className = 'form-response';

  // Loading state
  submitBtn.disabled     = true;
  submitBtn.textContent  = 'Enviando...';
  logDot.classList.add('active');
  logBody.innerHTML = '<div class="log-line" style="color:var(--text-muted); font-style:italic;">→ POST /api/contact</div>';

  const result = await simulateApiCall({ name, email, message });
  logDot.classList.remove('active');

  if (result.ok) {
    // Success: render full JSON response
    const lines = renderJsonToLog(result.body, 1);
    logBody.innerHTML = [
      `<div class="log-line"><span style="color:var(--accent-cyan)">HTTP 200 OK</span></div>`,
      `<div class="log-line">{</div>`,
      ...lines,
      `<div class="log-line">}</div>`,
    ].join('');

    responseEl.className = 'form-response success';
    responseEl.textContent = '✓ ' + result.body.message;

    // Reset fields
    document.getElementById('cf-name').value    = '';
    document.getElementById('cf-email').value   = '';
    document.getElementById('cf-message').value = '';

  } else {
    // Error: render 422 response
    logBody.innerHTML = [
      `<div class="log-line"><span style="color:var(--accent-rose)">HTTP 422 Unprocessable</span></div>`,
      `<div class="log-line">{</div>`,
      `<div class="log-line">  <span class="log-key">"error"</span>: <span class="log-str">"${result.error}"</span></div>`,
      `<div class="log-line">  <span class="log-key">"message"</span>: <span class="log-str">"${result.message}"</span></div>`,
      `<div class="log-line">}</div>`,
    ].join('');

    const errEl = document.getElementById('err-' + result.error);
    if (errEl) errEl.classList.add('visible');

    responseEl.className   = 'form-response error';
    responseEl.textContent = '✗ ' + result.message;
  }

  // Restore button
  submitBtn.disabled    = false;
  submitBtn.textContent = 'Enviar Request →';
}

// Expose to HTML onclick attribute
window.handleContactSubmit = handleContactSubmit;

/* ── Email Tray ── */
const emailToggle = document.getElementById('email-toggle');
const emailTray = document.getElementById('email-tray');

function setEmailTrayOpen(isOpen) {
  if (!emailToggle || !emailTray) return;

  emailTray.classList.toggle('open', isOpen);
  emailTray.setAttribute('aria-hidden', String(!isOpen));
  emailToggle.setAttribute('aria-expanded', String(isOpen));
}

if (emailToggle && emailTray) {
  emailToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setEmailTrayOpen(!emailTray.classList.contains('open'));
  });

  emailTray.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('click', () => setEmailTrayOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setEmailTrayOpen(false);
  });
}
