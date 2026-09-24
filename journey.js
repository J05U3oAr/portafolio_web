/* Section planes and wireframe share one time-based camera journey. */
(() => {
  const stops = [...document.querySelectorAll('.timeline-stop')];
  const sections = stops.map(stop => document.querySelector(stop.hash));
  if (!sections.length || sections.some(section => !section)) return;

  const dock = document.querySelector('.timeline-dock');
  const counter = document.getElementById('journey-counter');
  const name = document.getElementById('journey-name');
  const percent = document.getElementById('timeline-percent');
  const transit = document.querySelector('.journey-transit');
  const route = document.getElementById('transit-route');
  const destination = document.getElementById('transit-destination');
  const motionButton = document.getElementById('motion-toggle');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const names = ['Órbita inicial', 'Perfil de misión', 'Archivo de proyectos', 'Laboratorio API', 'Canal de contacto'];
  const duration = 1650;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const ramp = (start, end, value) => smooth((value - start) / (end - start));
  let scene;
  try {
    scene = new window.WireframeJourney(document.getElementById('wireframe-canvas'));
  } catch (error) {
    console.warn('Wireframe unavailable; section navigation remains available.', error);
  }

  let manualReduced = false;
  try { manualReduced = localStorage.getItem('portfolio-reduced-motion') === 'true'; } catch { /* Storage is optional. */ }
  let active = Math.max(0, sections.findIndex(section => `#${section.id}` === location.hash));
  let flight = null;
  let pending = null;
  let frameId = 0;
  let lockedUntil = 0;
  let wheelAmount = 0;
  let lastWheelTime = 0;
  let lastWheelDirection = 0;
  let touch = null;
  const noMotion = () => manualReduced || motionPreference.matches;

  function setProgress(index) {
    const progress = sections.length > 1 ? index / (sections.length - 1) * 100 : 0;
    dock.style.setProperty('--journey-progress', `${progress}%`);
    percent.textContent = `${String(Math.round(progress)).padStart(2, '0')}%`;
  }

  function setActive(index) {
    active = index;
    sections.forEach((section, i) => {
      section.classList.toggle('plane-active', i === index);
      section.classList.remove('plane-arriving', 'plane-departing');
      section.style.removeProperty('transform');
      section.style.removeProperty('opacity');
      section.inert = i !== index;
      section.setAttribute('aria-hidden', String(i !== index));
      stops[i].classList.toggle('active', i === index);
      stops[i].classList.toggle('passed', i < index);
      if (i === index) stops[i].setAttribute('aria-current', 'step');
      else stops[i].removeAttribute('aria-current');
    });
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
    name.textContent = names[index];
    setProgress(index);
    scene?.setState({ active: false, from: index, to: index, progress: 0 });
  }

  function finish() {
    if (!flight) return;
    cancelAnimationFrame(frameId);
    const completed = flight;
    flight = null;
    setActive(completed.to);
    document.body.classList.remove('is-travelling');
    transit.style.removeProperty('--transit-opacity');
    if (completed.history && location.hash !== `#${sections[active].id}`) {
      history.pushState(null, '', `#${sections[active].id}`);
    }
    if (completed.focus) sections[active].focus({ preventScroll: true });
    lockedUntil = performance.now() + 380;
    wheelAmount = 0;
    if (pending) {
      const next = pending;
      pending = null;
      travel(next.index, next.options);
    }
  }

  function animate(time) {
    if (!flight) return;
    const { from, to, direction, start } = flight;
    const progress = clamp((time - start) / duration);
    const eased = smooth(progress);
    const bend = Math.sin(eased * Math.PI) * direction;
    const outgoing = sections[from];
    const incoming = sections[to];
    // Perspective is shared with the projected corridor. Forward travel passes
    // the current plane; backwards travel makes that plane recede instead.
    const exitZ = direction > 0 ? 1000 * eased : -2800 * eased;
    const enterZ = direction > 0 ? -2800 * (1 - eased) : 1000 * (1 - eased);
    outgoing.style.transform = `translate3d(${-bend * innerWidth * 0.08}px, 0, ${exitZ}px) rotateY(${-bend * 9}deg)`;
    incoming.style.transform = `translate3d(${bend * innerWidth * 0.08}px, 0, ${enterZ}px) rotateY(${bend * 9}deg)`;
    outgoing.style.opacity = direction > 0 ? 1 - ramp(0.02, 0.36, progress) : 1 - ramp(0.18, 0.65, progress);
    incoming.style.opacity = direction > 0 ? ramp(0.32, 0.84, progress) : ramp(0.65, 1, progress);
    transit.style.setProperty('--transit-opacity', String(ramp(0.12, 0.3, progress) * (1 - ramp(0.76, 0.94, progress))));
    setProgress(from + (to - from) * eased);
    scene?.setState({ progress, from, to, direction, active: true });
    if (progress < 1) frameId = requestAnimationFrame(animate);
    else finish();
  }

  function travel(index, options = {}) {
    if (index < 0 || index >= sections.length) return;
    if (flight) {
      pending = { index, options };
      return;
    }
    if (index === active) return;
    const current = sections[active];
    const target = sections[index];
    const direction = Math.sign(index - active);
    const moveFocus = current.contains(document.activeElement);
    if (moveFocus) document.activeElement.blur();
    // Going back by scroll returns to the bottom, so long chapters remain readable.
    target.scrollTop = options.edge && direction < 0 ? target.scrollHeight : 0;
    target.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    flight = { from: active, to: index, direction, start: performance.now(), history: options.history !== false, focus: moveFocus || options.keyboard };
    if (noMotion()) { finish(); return; }
    current.inert = true;
    current.setAttribute('aria-hidden', 'true');
    current.classList.add('plane-departing');
    target.classList.add('plane-arriving');
    document.body.classList.add('is-travelling');
    route.textContent = `${String(active + 1).padStart(2, '0')} ${direction > 0 ? '→' : '←'} ${String(index + 1).padStart(2, '0')}`;
    destination.textContent = stops[index].dataset.label;
    animate(flight.start);
  }

  function atEdge(section, direction) {
    const max = section.scrollHeight - section.clientHeight;
    return max <= 3 || (direction > 0 ? section.scrollTop >= max - 3 : section.scrollTop <= 3);
  }

  const isEditable = element => element instanceof Element && element.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), .email-tray');
  document.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || isEditable(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const direction = Math.sign(event.deltaY);
    if (!direction) return;
    const now = performance.now();
    if (flight || now < lockedUntil) { event.preventDefault(); return; }
    const section = sections[active];
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? section.clientHeight : 1);
    if (!atEdge(section, direction)) {
      wheelAmount = 0;
      if (!section.contains(event.target)) {
        event.preventDefault();
        section.scrollBy({ top: delta, behavior: 'instant' });
      }
      return;
    }
    if (active + direction < 0 || active + direction >= sections.length) return;
    event.preventDefault();
    if (direction !== lastWheelDirection || now - lastWheelTime > 180) wheelAmount = 0;
    lastWheelTime = now;
    lastWheelDirection = direction;
    wheelAmount += Math.abs(delta);
    if (wheelAmount >= 55) { wheelAmount = 0; travel(active + direction, { edge: true }); }
  }, { passive: false });

  document.addEventListener('keydown', event => {
    if (isEditable(event.target) || event.target.closest('button') || event.altKey || event.ctrlKey || event.metaKey) return;
    const down = ['ArrowDown', 'PageDown', ' '].includes(event.key);
    const up = ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey);
    if (!down && !up) return;
    event.preventDefault();
    if (flight || performance.now() < lockedUntil || event.repeat) return;
    const direction = up ? -1 : 1;
    const section = sections[active];
    if (atEdge(section, direction)) travel(active + direction, { edge: true, keyboard: true });
    else section.scrollBy({ top: direction * (event.key.startsWith('Arrow') ? 64 : section.clientHeight * 0.75), behavior: noMotion() ? 'instant' : 'smooth' });
  });

  document.addEventListener('touchstart', event => {
    touch = null;
    if (event.touches.length !== 1 || isEditable(event.target) || event.target.closest('button, a') || flight) return;
    const point = event.touches[0];
    touch = { x: point.clientX, y: point.clientY, index: active, top: atEdge(sections[active], -1), bottom: atEdge(sections[active], 1) };
  }, { passive: true });
  document.addEventListener('touchend', event => {
    const started = touch;
    touch = null;
    if (!started || event.touches.length || flight || started.index !== active || performance.now() < lockedUntil) return;
    const point = event.changedTouches[0];
    const distance = started.y - point.clientY;
    if (Math.abs(distance) < 65 || Math.abs(point.clientX - started.x) > Math.abs(distance) * 0.7) return;
    const direction = Math.sign(distance);
    if ((direction > 0 ? started.bottom : started.top) && atEdge(sections[active], direction)) travel(active + direction, { edge: true });
  }, { passive: true });
  document.addEventListener('touchcancel', () => { touch = null; }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const index = sections.findIndex(section => `#${section.id}` === link.hash);
    if (index < 0) return;
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      travel(index);
    });
  });
  function followHash() {
    const index = sections.findIndex(section => `#${section.id}` === location.hash);
    travel(index < 0 ? 0 : index, { history: false });
  }
  window.addEventListener('popstate', followHash);
  window.addEventListener('hashchange', followHash);

  function applyMotionPreference() {
    const reduced = noMotion();
    document.body.classList.toggle('motion-reduced', reduced);
    motionButton.setAttribute('aria-pressed', String(!reduced));
    motionButton.textContent = reduced ? '3D pausado' : '3D activo';
    motionButton.setAttribute('aria-label', reduced ? 'Animación 3D desactivada. Activar animación' : 'Animación 3D activada. Desactivar animación');
    motionButton.disabled = motionPreference.matches;
    motionButton.title = motionPreference.matches ? 'Movimiento reducido según la preferencia de tu sistema' : 'Activar o desactivar el movimiento';
    if (reduced) finish();
    document.dispatchEvent(new CustomEvent('journey-motion-change', { detail: { reduced } }));
  }
  motionButton.addEventListener('click', () => {
    manualReduced = !manualReduced;
    try { localStorage.setItem('portfolio-reduced-motion', String(manualReduced)); } catch { /* Storage is optional. */ }
    applyMotionPreference();
  });
  motionPreference.addEventListener('change', applyMotionPreference);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });

  sections.forEach(section => section.setAttribute('tabindex', '-1'));
  document.body.classList.add('plane-mode');
  sections[active].querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  setActive(active);
  applyMotionPreference();
})();
