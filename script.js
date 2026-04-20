/* ============================================
   KING CORE — Canvas Scroll-Driven Animation

   Scenes (by scroll progress 0→1):
   0.00–0.08  Hero
   0.08–0.22  Floating paper strips
   0.22–0.40  Spiral winding onto mandrel
   0.40–0.55  Grinding (sparks, surface smoothing)
   0.55–0.68  Waxing (glossy coat)
   0.68–0.80  Cutting (blade slices tube)
   0.80–0.92  Chamfering (edge beveling)
   0.92–1.00  Finished product reveal
   ============================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const progressBar = document.getElementById('progressBar');

  let W, H, cx, cy;
  let progress = 0;
  let animFrame;

  // Colors
  const COL = {
    bg: '#08080a',
    gold: '#c8a44e',
    goldLight: '#e0c878',
    goldDim: 'rgba(200,164,78,0.12)',
    straw: '#b89550',
    strawLight: '#d4b06a',
    core: '#7a6030',
    coreDark: '#5a4420',
    finish: '#d8c8a8',
    white: '#fafaf7',
    spark: '#ffdd88',
    wax: 'rgba(255,240,200,0.25)',
    blade: '#e0e0e0',
  };

  // Scene boundaries
  const SCENES = {
    hero:    [0.00, 0.08],
    float:   [0.08, 0.22],
    wind:    [0.22, 0.40],
    grind:   [0.40, 0.55],
    wax:     [0.55, 0.68],
    cut:     [0.68, 0.80],
    chamfer: [0.80, 0.92],
    finish:  [0.92, 1.00],
  };

  /* --- Paper Strips (pre-generated) --- */
  const strips = [];
  const STRIP_COUNT = 18;

  function initStrips() {
    strips.length = 0;
    for (let i = 0; i < STRIP_COUNT; i++) {
      strips.push({
        x: Math.random() * W,
        y: Math.random() * H,
        w: 120 + Math.random() * 180,
        h: 12 + Math.random() * 16,
        angle: (Math.random() - 0.5) * 0.8,
        speed: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        color: [COL.straw, COL.strawLight, COL.core, COL.finish, COL.coreDark][Math.floor(Math.random() * 5)],
        opacity: 0.5 + Math.random() * 0.5,
      });
    }
  }

  /* --- Spark Particles --- */
  const sparks = [];
  const SPARK_COUNT = 60;

  function initSparks() {
    sparks.length = 0;
    for (let i = 0; i < SPARK_COUNT; i++) {
      sparks.push({
        x: 0, y: 0,
        vx: (Math.random() - 0.3) * 6,
        vy: (Math.random() - 0.5) * 8,
        life: Math.random(),
        size: 1 + Math.random() * 2.5,
        brightness: 0.5 + Math.random() * 0.5,
      });
    }
  }

  /* --- Wax drip particles --- */
  const waxDrops = [];
  const WAX_COUNT = 30;

  function initWaxDrops() {
    waxDrops.length = 0;
    for (let i = 0; i < WAX_COUNT; i++) {
      waxDrops.push({
        angle: Math.random() * Math.PI * 2,
        offset: Math.random() * 20,
        speed: 0.5 + Math.random(),
        size: 2 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ============================================
     RESIZE
     ============================================ */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2;
    initStrips();
    initSparks();
    initWaxDrops();
  }

  /* ============================================
     UTILITY
     ============================================ */
  function sceneProgress(sceneName) {
    const [start, end] = SCENES[sceneName];
    if (progress < start) return 0;
    if (progress > end) return 1;
    return (progress - start) / (end - start);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ============================================
     DRAW: PAPER STRIP
     ============================================ */
  function drawStrip(x, y, w, h, angle, color, opacity, wave) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = opacity;

    // Wavy strip using bezier
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);

    // Top edge with wave
    const waveAmt = wave * 6;
    ctx.bezierCurveTo(
      -w / 4, -h / 2 - waveAmt,
      w / 4, -h / 2 + waveAmt,
      w / 2, -h / 2
    );
    ctx.lineTo(w / 2, h / 2);

    // Bottom edge with wave
    ctx.bezierCurveTo(
      w / 4, h / 2 + waveAmt * 0.5,
      -w / 4, h / 2 - waveAmt * 0.5,
      -w / 2, h / 2
    );
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Fiber texture lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const yy = -h / 2 + (h / 4) * (i + 0.5);
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 5, yy);
      ctx.lineTo(w / 2 - 5, yy);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ============================================
     DRAW: TUBE (side view — rectangle with rings)
     ============================================ */
  function drawTube(x, y, tubeW, tubeH, layers, smoothness, waxCoat, chamferAmt) {
    ctx.save();
    ctx.translate(x, y);

    const radius = chamferAmt * 12;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    roundedRect(-tubeW / 2 + 4, -tubeH / 2 + 6, tubeW, tubeH, radius);
    ctx.fill();

    // Tube body layers
    for (let i = layers - 1; i >= 0; i--) {
      const t = i / Math.max(layers - 1, 1);
      const layerColors = [COL.coreDark, COL.core, COL.straw, COL.strawLight, COL.finish];
      const color = layerColors[Math.min(i, layerColors.length - 1)];
      const shrink = i * 2;

      ctx.fillStyle = color;
      ctx.beginPath();
      roundedRect(
        -tubeW / 2 + shrink,
        -tubeH / 2 + shrink,
        tubeW - shrink * 2,
        tubeH - shrink * 2,
        radius
      );
      ctx.fill();
    }

    // Surface roughness (decreases with smoothness)
    const roughness = 1 - smoothness;
    if (roughness > 0.05) {
      ctx.globalAlpha = roughness * 0.4;
      for (let i = 0; i < 40; i++) {
        const rx = (Math.random() - 0.5) * tubeW * 0.9;
        const ry = (Math.random() - 0.5) * tubeH * 0.9;
        const rs = 1 + Math.random() * 3 * roughness;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.15)';
        ctx.fillRect(rx - rs / 2, ry - rs / 2, rs, rs);
      }
      ctx.globalAlpha = 1;
    }

    // Spiral wind lines on surface
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const yy = -tubeH / 2 + (tubeH / 12) * (i + 0.5);
      ctx.beginPath();
      ctx.moveTo(-tubeW / 2 + 8, yy);
      ctx.lineTo(tubeW / 2 - 8, yy + 3);
      ctx.stroke();
    }

    // Wax coat (glossy overlay)
    if (waxCoat > 0) {
      ctx.globalAlpha = waxCoat * 0.5;

      // Sheen gradient
      const grad = ctx.createLinearGradient(-tubeW / 2, 0, tubeW / 2, 0);
      grad.addColorStop(0, 'rgba(255,240,200,0)');
      grad.addColorStop(0.3, 'rgba(255,240,200,0.3)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
      grad.addColorStop(0.7, 'rgba(255,240,200,0.3)');
      grad.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      roundedRect(-tubeW / 2, -tubeH / 2, tubeW, tubeH, radius);
      ctx.fill();

      // Highlight streak
      ctx.globalAlpha = waxCoat * 0.6;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      roundedRect(-tubeW / 2 + tubeW * 0.2, -tubeH / 2 + 3, tubeW * 0.15, tubeH - 6, radius);
      ctx.fill();

      ctx.globalAlpha = 1;
    }

    // Chamfered edges highlight
    if (chamferAmt > 0) {
      ctx.globalAlpha = chamferAmt * 0.7;
      ctx.strokeStyle = COL.goldLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      roundedRect(-tubeW / 2 + 1, -tubeH / 2 + 1, tubeW - 2, tubeH - 2, radius);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function roundedRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
  }

  /* ============================================
     DRAW: MANDREL (steel rod)
     ============================================ */
  function drawMandrel(x, y, length, radius) {
    ctx.save();
    ctx.translate(x, y);

    const grad = ctx.createLinearGradient(0, -radius, 0, radius);
    grad.addColorStop(0, '#888');
    grad.addColorStop(0.3, '#ccc');
    grad.addColorStop(0.5, '#eee');
    grad.addColorStop(0.7, '#ccc');
    grad.addColorStop(1, '#888');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, length / 2, radius, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  /* ============================================
     DRAW: GRINDING WHEEL
     ============================================ */
  function drawGrinder(x, y, radius, spin) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);

    // Wheel body
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#555';
    ctx.fill();

    // Inner ring
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#777';
    ctx.fill();

    // Grit texture
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 / 8) * i;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * radius * 0.35, Math.sin(a) * radius * 0.35);
      ctx.lineTo(Math.cos(a) * radius * 0.9, Math.sin(a) * radius * 0.9);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ============================================
     DRAW: BLADE
     ============================================ */
  function drawBlade(x, y, size, cutProgress) {
    ctx.save();
    ctx.translate(x, y);

    // Blade
    ctx.fillStyle = COL.blade;
    ctx.beginPath();
    ctx.moveTo(-size / 2, -size);
    ctx.lineTo(0, 0);
    ctx.lineTo(size / 2, -size);
    ctx.closePath();
    ctx.fill();

    // Edge highlight
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -size * 0.3);
    ctx.lineTo(0, 0);
    ctx.lineTo(2, -size * 0.3);
    ctx.stroke();

    ctx.restore();
  }

  /* ============================================
     DRAW: CHAMFER TOOL
     ============================================ */
  function drawChamferTool(x, y, angle, active) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = active ? '#aaa' : '#777';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, -8);
    ctx.lineTo(25, -4);
    ctx.lineTo(8, 4);
    ctx.closePath();
    ctx.fill();

    if (active) {
      ctx.fillStyle = COL.spark;
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
          3 + Math.random() * 8,
          -2 + Math.random() * 4,
          0.5 + Math.random() * 1.5, 0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  /* ============================================
     RENDER FRAME
     ============================================ */
  const time = { now: 0 };

  function render(timestamp) {
    time.now = timestamp || 0;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle radial glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
    glow.addColorStop(0, 'rgba(200,164,78,0.03)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Scene rendering
    const heroP = sceneProgress('hero');
    const floatP = sceneProgress('float');
    const windP = sceneProgress('wind');
    const grindP = sceneProgress('grind');
    const waxP = sceneProgress('wax');
    const cutP = sceneProgress('cut');
    const chamferP = sceneProgress('chamfer');
    const finishP = sceneProgress('finish');

    // ---- HERO: Concentric rings ----
    if (progress < SCENES.float[1]) {
      const ringAlpha = progress < SCENES.hero[1]
        ? 1
        : 1 - easeOut(floatP);

      ctx.globalAlpha = ringAlpha * 0.5;
      for (let i = 0; i < 5; i++) {
        const r = 40 + i * 70 + Math.sin(time.now / 2000 + i) * 5;
        ctx.strokeStyle = COL.gold;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // ---- FLOATING STRIPS ----
    if (floatP > 0 && windP < 1) {
      const fadeIn = easeOut(clamp(floatP / 0.3, 0, 1));
      const converge = windP > 0 ? easeInOut(windP) : 0;

      strips.forEach((s, i) => {
        const t = time.now / 1000;
        const floatX = Math.sin(t * s.speed + s.phase) * 30;
        const floatY = Math.cos(t * s.speed * 0.7 + s.phase) * 20;

        // Converge toward center mandrel during wind phase
        const targetX = cx + (Math.random() - 0.5) * 40;
        const targetY = cy;

        const drawX = lerp(s.x + floatX, targetX, converge);
        const drawY = lerp(s.y + floatY, targetY, converge);
        const drawAngle = lerp(s.angle, converge * Math.PI * 2 * (i % 2 ? 1 : -1), converge);
        const drawW = lerp(s.w, s.w * (1 - converge * 0.6), converge);
        const drawH = lerp(s.h, s.h * (1 - converge * 0.4), converge);

        const wave = Math.sin(t * 2 + s.phase) * (1 - converge);

        drawStrip(drawX, drawY, drawW, drawH, drawAngle, s.color, s.opacity * fadeIn, wave);
      });
    }

    // ---- SPIRAL WINDING ----
    if (windP > 0.2 && grindP < 1) {
      const buildUp = easeOut(clamp((windP - 0.2) / 0.6, 0, 1));
      const tubeW = lerp(0, 300, buildUp);
      const tubeH = lerp(0, 100, buildUp);
      const layerCount = Math.floor(lerp(1, 5, buildUp));

      // Mandrel (fades as tube builds)
      if (buildUp < 0.8) {
        const mandrelAlpha = 1 - easeOut(clamp(buildUp / 0.8, 0, 1)) * 0.7;
        ctx.globalAlpha = mandrelAlpha;
        drawMandrel(cx, cy, 320, 8);
        ctx.globalAlpha = 1;
      }

      // Spiraling strip being wound
      if (buildUp < 0.9) {
        const spiralAngle = time.now / 200 + windP * 20;
        const spiralR = lerp(180, 50, buildUp);
        const sx = cx + Math.cos(spiralAngle) * spiralR;
        const sy = cy + Math.sin(spiralAngle) * spiralR * 0.3;

        ctx.globalAlpha = 0.6;
        drawStrip(sx, sy, 80, 10, spiralAngle, COL.straw, 0.7, Math.sin(time.now / 300) * 0.5);
        ctx.globalAlpha = 1;

        // Trail line from strip to tube
        ctx.strokeStyle = 'rgba(200,164,78,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }

      // The forming tube
      const smoothness = grindP > 0 ? easeOut(grindP) : 0;
      const waxCoat = waxP > 0 ? easeOut(waxP) : 0;
      const chamfer = chamferP > 0 ? easeOut(chamferP) : 0;

      if (tubeW > 10) {
        drawTube(cx, cy, tubeW, tubeH, layerCount, smoothness, waxCoat, chamfer);
      }
    }

    // ---- GRINDING ----
    if (grindP > 0 && grindP < 1) {
      const gp = easeInOut(grindP);
      const grinderX = cx + 200;
      const grinderY = cy - 60 + Math.sin(time.now / 500) * 5;
      const approachX = lerp(grinderX + 100, grinderX, clamp(gp / 0.3, 0, 1));
      const spin = time.now / 80;

      // Grinder approaches from right
      drawGrinder(approachX, grinderY, 40, spin);

      // Sparks!
      if (gp > 0.2 && gp < 0.9) {
        const sparkIntensity = clamp((gp - 0.2) / 0.3, 0, 1) * (1 - clamp((gp - 0.7) / 0.2, 0, 1));
        const contactX = cx + 150;
        const contactY = cy - 50;

        sparks.forEach((spark, i) => {
          const t = (time.now / 1000 + spark.life * 10) % 1;
          const px = contactX + spark.vx * t * 30;
          const py = contactY + spark.vy * t * 20 + t * t * 40; // gravity

          const alpha = (1 - t) * sparkIntensity * spark.brightness;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = COL.spark;
          ctx.beginPath();
          ctx.arc(px, py, spark.size * (1 - t * 0.5), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Contact glow
        ctx.globalAlpha = sparkIntensity * 0.4;
        const contactGlow = ctx.createRadialGradient(contactX, contactY, 0, contactX, contactY, 60);
        contactGlow.addColorStop(0, 'rgba(255,220,100,0.5)');
        contactGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = contactGlow;
        ctx.fillRect(contactX - 60, contactY - 60, 120, 120);
        ctx.globalAlpha = 1;
      }
    }

    // ---- WAXING ----
    if (waxP > 0 && waxP < 1) {
      const wp = easeInOut(waxP);

      // Wax applicator bar sweeping across
      const barX = lerp(cx - 200, cx + 200, wp);
      ctx.fillStyle = 'rgba(255,240,200,0.6)';
      ctx.fillRect(barX - 4, cy - 60, 8, 120);

      // Dripping wax particles
      if (wp > 0.1 && wp < 0.9) {
        waxDrops.forEach(drop => {
          const t = (time.now / 1000 * drop.speed + drop.phase) % 1;
          const dx = barX + Math.sin(drop.angle) * 30;
          const dy = cy - 50 + t * 100;

          ctx.globalAlpha = (1 - t) * 0.4;
          ctx.fillStyle = 'rgba(255,240,200,0.5)';
          ctx.beginPath();
          ctx.arc(dx, dy, drop.size * (1 - t), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Sheen sweep effect
      ctx.globalAlpha = wp * 0.15;
      const sheenGrad = ctx.createLinearGradient(barX - 100, 0, barX + 40, 0);
      sheenGrad.addColorStop(0, 'transparent');
      sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0.3)');
      sheenGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(barX - 100, cy - 60, 140, 120);
      ctx.globalAlpha = 1;
    }

    // ---- CUTTING ----
    if (cutP > 0 && cutP < 1) {
      const cp = easeInOut(cutP);

      // Draw a second tube piece separating
      if (cp > 0.4) {
        const separation = easeOut((cp - 0.4) / 0.6) * 80;
        // Left piece
        ctx.globalAlpha = 0.8;
        drawTube(cx - separation / 2 - 40, cy, 140, 100, 5, 1, 1, chamferP > 0 ? easeOut(chamferP) : 0);
        ctx.globalAlpha = 1;
      }

      // Blade descending
      const bladeY = lerp(cy - 200, cy, clamp(cp / 0.4, 0, 1));
      drawBlade(cx + (cp > 0.4 ? 40 : 0), bladeY, 30, cp);

      // Cut flash
      if (cp > 0.35 && cp < 0.5) {
        const flash = 1 - (cp - 0.35) / 0.15;
        ctx.globalAlpha = flash * 0.5;
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - 2, cy - 55, 4, 110);
        ctx.globalAlpha = 1;
      }
    }

    // ---- CHAMFERING ----
    if (chamferP > 0 && chamferP < 1) {
      const chp = easeInOut(chamferP);

      // Chamfer tools at the edges
      const toolActive = chp > 0.2 && chp < 0.8;

      // Top-left edge
      drawChamferTool(
        cx - 150 + chp * 10,
        cy - 50 - chp * 5,
        -0.3,
        toolActive
      );

      // Top-right edge
      drawChamferTool(
        cx + 150 - chp * 10,
        cy - 50 - chp * 5,
        Math.PI + 0.3,
        toolActive
      );

      // Bottom-left edge
      drawChamferTool(
        cx - 150 + chp * 10,
        cy + 50 + chp * 5,
        0.3,
        toolActive
      );

      // Bottom-right edge
      drawChamferTool(
        cx + 150 - chp * 10,
        cy + 50 + chp * 5,
        Math.PI - 0.3,
        toolActive
      );

      // Edge sparks
      if (toolActive) {
        const sparkAlpha = 0.5;
        ctx.globalAlpha = sparkAlpha;
        ctx.fillStyle = COL.spark;
        const corners = [
          [cx - 150, cy - 50],
          [cx + 150, cy - 50],
          [cx - 150, cy + 50],
          [cx + 150, cy + 50]
        ];
        corners.forEach(([px, py]) => {
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(
              px + (Math.random() - 0.5) * 20,
              py + (Math.random() - 0.5) * 20,
              0.5 + Math.random() * 2,
              0, Math.PI * 2
            );
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1;
      }
    }

    // ---- FINISH: Golden glow around final product ----
    if (finishP > 0) {
      const fp = easeOut(finishP);

      // Grand glow
      ctx.globalAlpha = fp * 0.3;
      const finGlow = ctx.createRadialGradient(cx, cy, 50, cx, cy, 300);
      finGlow.addColorStop(0, 'rgba(200,164,78,0.3)');
      finGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = finGlow;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;

      // Final tube with full treatment
      drawTube(cx, cy, 300, 100, 5, 1, 1, 1);

      // "KING CORE" emboss on tube
      ctx.globalAlpha = fp * 0.6;
      ctx.font = '600 11px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(200,164,78,0.5)';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText('K I N G   C O R E', cx, cy + 3);
      ctx.globalAlpha = 1;
    }

    // Film grain overlay
    ctx.globalAlpha = 0.015;
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(
        Math.random() * W,
        Math.random() * H,
        1, 1
      );
    }
    ctx.globalAlpha = 1;

    animFrame = requestAnimationFrame(render);
  }

  /* ============================================
     LABEL MANAGEMENT
     ============================================ */
  const labels = document.querySelectorAll('.label');
  let currentScene = '';

  function updateLabels() {
    let activeScene = 'hero';

    for (const [name, [start, end]] of Object.entries(SCENES)) {
      if (progress >= start && progress <= end) {
        activeScene = name;
        break;
      }
    }

    if (activeScene === currentScene) return;
    currentScene = activeScene;

    labels.forEach(label => {
      const scene = label.dataset.scene;
      label.classList.toggle('active', scene === activeScene);
    });
  }

  /* ============================================
     SCROLL HANDLER
     ============================================ */
  function onScroll() {
    const scrollTop = window.scrollY;
    const spacer = document.getElementById('scrollSpacer');
    const maxScroll = spacer.offsetTop + spacer.offsetHeight - window.innerHeight;

    progress = clamp(scrollTop / maxScroll, 0, 1);
    progressBar.style.width = (progress * 100) + '%';
    updateLabels();
  }

  /* ============================================
     CONTACT FORM
     ============================================ */
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    const orig = btn.textContent;
    btn.textContent = 'Message Sent';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      e.target.reset();
    }, 3000);
  });

  /* ============================================
     INIT
     ============================================ */
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  render();

})();
