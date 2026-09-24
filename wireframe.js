/* A continuous 3D corridor, projected onto a transparent 2D canvas.
   The journey controller owns time; this renderer has no animation loop. */
(() => {
  'use strict';

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (from, to, progress) => from + (to - from) * progress;
  const smooth = value => value * value * (3 - 2 * value);
  const CYAN = '34, 211, 238';
  const VIOLET = '167, 139, 250';
  const SPACING = 4.8;
  const CHAPTER_DISTANCE = 28.8;
  const NEAR = 1.25;
  const FAR = 86;

  class WireframeJourney {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas?.getContext('2d', { alpha: true });
      this.state = { progress: 0, from: 0, to: 0, direction: 1, active: false };
      this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.destroyed = false;
      this.onResize = () => this.resize();
      this.onMotionChange = () => this.draw();
      window.addEventListener('resize', this.onResize, { passive: true });
      this.motion.addEventListener('change', this.onMotionChange);
      this.resize();
    }

    resize() {
      if (!this.context || this.destroyed) return;
      this.width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
      this.height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
      this.ratio = Math.min(window.devicePixelRatio || 1, this.width < 768 ? 1.25 : 1.75);
      this.canvas.width = Math.round(this.width * this.ratio);
      this.canvas.height = Math.round(this.height * this.ratio);
      this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
      this.focal = this.height * 0.98;

      const width = clamp(this.width / this.height * 3.25, 3.1, 6.8);
      const height = 3.25;
      const bevel = 0.68;
      // Clockwise cross-section, followed by subdivisions on the four flat walls.
      this.profile = [
        [-width + bevel, -height], [width - bevel, -height],
        [width, -height + bevel], [width, height - bevel],
        [width - bevel, height], [-width + bevel, height],
        [-width, height - bevel], [-width, -height + bevel],
      ];
      [0, 4].forEach(side => {
        for (let step = 1; step < 5; step++) {
          this.profile.push([
            mix(this.profile[side][0], this.profile[side + 1][0], step / 5),
            this.profile[side][1],
          ]);
        }
      });
      this.profile.push([width, 0], [-width, 0]);
      this.draw();
    }

    setState(next = {}) {
      if (this.destroyed) return;
      this.state = { ...this.state, ...next };
      this.state.progress = clamp(Number(this.state.progress) || 0);
      this.draw();
    }

    center(z) {
      return [Math.sin(z * 0.025) * 2.3, Math.sin(z * 0.018) * 0.55];
    }

    ring(z, camera) {
      const center = this.center(z);
      const twist = Math.sin(z * 0.028) * 0.06;
      const cos = Math.cos(twist);
      const sin = Math.sin(twist);
      return this.profile.map(([px, py]) => {
        const x = center[0] + px * cos - py * sin - camera.x;
        const y = center[1] + px * sin + py * cos - camera.y;
        const depth = z - camera.z;
        const yawX = x * camera.cosYaw - depth * camera.sinYaw;
        const yawZ = x * camera.sinYaw + depth * camera.cosYaw;
        const pitchY = y * camera.cosPitch - yawZ * camera.sinPitch;
        const pitchZ = y * camera.sinPitch + yawZ * camera.cosPitch;
        return [
          yawX * camera.cosRoll - pitchY * camera.sinRoll,
          yawX * camera.sinRoll + pitchY * camera.cosRoll,
          pitchZ,
        ];
      });
    }

    // Clip in camera space first, then to the viewport. No unbounded coordinates
    // reach the canvas when a frame passes through the camera's near plane.
    line(a, b) {
      if (a[2] < NEAR && b[2] < NEAR) return;
      let start = a;
      let end = b;
      if (start[2] < NEAR || end[2] < NEAR) {
        const t = (NEAR - start[2]) / (end[2] - start[2]);
        const intersection = [mix(start[0], end[0], t), mix(start[1], end[1], t), NEAR];
        if (start[2] < NEAR) start = intersection;
        else end = intersection;
      }

      const x = this.width * 0.5 + start[0] * this.focal / start[2];
      const y = this.height * 0.48 + start[1] * this.focal / start[2];
      const dx = this.width * 0.5 + end[0] * this.focal / end[2] - x;
      const dy = this.height * 0.48 + end[1] * this.focal / end[2] - y;
      let t0 = 0;
      let t1 = 1;
      const p = [-dx, dx, -dy, dy];
      const q = [x + 2, this.width + 2 - x, y + 2, this.height + 2 - y];
      for (let edge = 0; edge < 4; edge++) {
        if (Math.abs(p[edge]) < 0.00001) {
          if (q[edge] < 0) return;
        } else {
          const t = q[edge] / p[edge];
          if (p[edge] < 0) t0 = Math.max(t0, t);
          else t1 = Math.min(t1, t);
          if (t0 > t1) return;
        }
      }
      this.context.moveTo(x + dx * t0, y + dy * t0);
      this.context.lineTo(x + dx * t1, y + dy * t1);
    }

    stroke(segments, color, alpha, width = 0.8) {
      if (alpha < 0.002) return;
      const context = this.context;
      context.beginPath();
      segments.forEach(([a, b]) => this.line(a, b));
      context.strokeStyle = `rgba(${color}, ${clamp(alpha)})`;
      context.lineWidth = width;
      context.stroke();
    }

    draw() {
      if (!this.context || this.destroyed) return;
      const context = this.context;
      context.clearRect(0, 0, this.width, this.height);
      if (this.motion.matches) return;

      const { progress, from, to, direction, active } = this.state;
      const eased = smooth(progress);
      const chapter = active ? mix(from, to, eased) : to;
      const pulse = active ? Math.pow(Math.sin(Math.PI * progress), 0.85) : 0;
      const cameraZ = chapter * CHAPTER_DISTANCE;
      const center = this.center(cameraZ);
      const yaw = Math.atan(2.3 * 0.025 * Math.cos(cameraZ * 0.025)) + pulse * direction * 0.052;
      const pitch = Math.atan(0.55 * 0.018 * Math.cos(cameraZ * 0.018)) - pulse * 0.023;
      const roll = Math.sin(chapter * 0.7) * 0.012 + pulse * direction * 0.035;
      const camera = {
        x: center[0], y: center[1] - pulse * 0.1, z: cameraZ,
        cosYaw: Math.cos(yaw), sinYaw: Math.sin(yaw),
        cosPitch: Math.cos(pitch), sinPitch: Math.sin(pitch),
        cosRoll: Math.cos(roll), sinRoll: Math.sin(roll),
      };
      const intensity = 0.19 + pulse * 0.75;
      const first = Math.floor(cameraZ / SPACING) - 1;
      const rings = [];
      for (let index = 0; index < 20; index++) {
        const id = first + index;
        const z = id * SPACING;
        rings.push({ id, depth: z - cameraZ, points: this.ring(z, camera) });
      }

      // About 520 segments, batched by frame and hue; no shadow blur or particles.
      context.lineCap = 'butt';
      for (let index = rings.length - 1; index >= 0; index--) {
        const ring = rings[index];
        if (ring.depth > FAR || ring.depth < -SPACING) continue;
        const depthFade = Math.pow(clamp(1 - Math.max(0, ring.depth) / FAR), 1.55);
        const nearFade = smooth(clamp((ring.depth + 0.5) / 5));
        const emphasis = ring.id % 3 === 0;
        const ringAlpha = intensity * depthFade * nearFade * (emphasis ? 0.94 : 0.44);
        const edges = [];
        for (let side = 0; side < 8; side++) {
          edges.push([ring.points[side], ring.points[(side + 1) % 8]]);
        }
        this.stroke(edges, emphasis ? CYAN : VIOLET, ringAlpha, emphasis ? 1.15 : 0.7);

        const next = rings[index + 1];
        if (!next) continue;
        const cyanRails = [];
        const violetRails = [];
        ring.points.forEach((point, rail) => {
          const segments = this.profile[rail][0] < 0 ? cyanRails : violetRails;
          segments.push([point, next.points[rail]]);
        });
        const railAlpha = intensity * depthFade * 0.49;
        this.stroke(cyanRails, CYAN, railAlpha);
        this.stroke(violetRails, VIOLET, railAlpha);

        // Alternating braces expose the geometry of the walls during the flight.
        if (ring.id % 2 === 0) {
          this.stroke([
            [ring.points[2], next.points[3]],
            [ring.points[7], next.points[6]],
            [ring.points[12], next.points[13]],
            [ring.points[14], next.points[15]],
          ], VIOLET, intensity * depthFade * 0.21, 0.65);
        }
      }

      // Erase the center, not the background. Text stays legible at rest while
      // the tunnel opens naturally as the content planes move apart.
      context.save();
      context.globalCompositeOperation = 'destination-out';
      context.translate(this.width * 0.5, this.height * 0.48);
      context.scale(this.width * 0.61, this.height * 0.75);
      const clearCenter = context.createRadialGradient(0, 0, 0.03, 0, 0, 1);
      const mask = 0.99 - pulse * 0.89;
      clearCenter.addColorStop(0, `rgba(0, 0, 0, ${mask})`);
      clearCenter.addColorStop(0.37, `rgba(0, 0, 0, ${mask})`);
      clearCenter.addColorStop(0.78, `rgba(0, 0, 0, ${mask * 0.44})`);
      clearCenter.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = clearCenter;
      context.fillRect(-2, -2, 4, 4);
      context.restore();
    }

    destroy() {
      this.destroyed = true;
      window.removeEventListener('resize', this.onResize);
      this.motion.removeEventListener('change', this.onMotionChange);
      this.context?.clearRect(0, 0, this.width, this.height);
    }
  }

  window.WireframeJourney = WireframeJourney;
})();
