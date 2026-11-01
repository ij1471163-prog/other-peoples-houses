/* =====================================================================
   Small living details on top of the pictures (look only).
   Each place can list a few: a fire or lamp that flickers and throws its
   glow, steam from a cup, dust turning in a sunbeam, water that shimmers
   (the sea through a window, a fountain), droplets, embers, a gull going
   past. Positions are in % of the picture, like the spots, so they move
   with it. Nothing here touches the story; it stops for reduced motion.
   ===================================================================== */
'use strict';
(function () {
  const RM = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* kinds: glow [x,y,r,colour,strength] · steam [x,y] · dust [x0,y0,x1,y1] · shimmer [x0,y0,x1,y1] · splash [x,y] · embers [x,y,w] · gulls [x0,y0,x1,y1] */
  const FX = {
    living: [
      ['glow', 53, 57, 13, '255,150,60', 0.55], ['embers', 53, 54, 4],
      ['glow', 35, 58, 8, '255,150,60', 0.4],
      ['glow', 97, 43, 10, '255,190,110', 0.45, 'night'], ['glow', 95, 63, 5, '255,170,90', 0.35, 'night'],
      ['steam', 7.6, 66],
      ['shimmer', 66, 41, 83, 52], ['shimmer', 13, 38, 19, 47],
      ['dust', 38, 45, 78, 92, 'day']
    ],
    marg_garden: [
      ['glow', 14, 22, 9, '255,190,110', 0.5],
      ['splash', 58, 46], ['shimmer', 52, 56, 64, 63],
      ['steam', 11, 67],
      ['shimmer', 72, 40, 100, 50],
      ['dust', 22, 38, 92, 92, 'day'],
      ['gulls', 40, 8, 100, 28, 'day']
    ]
  };

  let raf = 0, key = '', cv = null, parts = [], cfg = [], t0 = 0;
  const night = () => typeof slotName === 'function' && slotName() === 'night';
  function build() {
    const s = S(), st = $('stage'); if (!s || !st) return;
    const L = GAME.LOC[s.loc], sc = st.querySelector('.scene');
    const list = (L && FX[L.bg] || []).filter(f => { const w = typeof f[f.length - 1] === 'string' && /^(day|night)$/.test(f[f.length - 1]) ? f[f.length - 1] : null; return !w || (w === 'night') === night(); });
    const k = (L && L.bg) + '|' + night() + '|' + list.length;
    if (k === key && sc && sc.querySelector('.ambfx')) return;
    key = k; stop();
    sc && sc.querySelectorAll('.ambfx').forEach(x => x.remove());
    if (!sc || !list.length || RM()) return;
    const layer = el('div', 'ambfx'); const ch = sc.querySelector('.chars');
    if (ch) sc.insertBefore(layer, ch); else sc.appendChild(layer);
    cfg = []; parts = [];
    for (const f of list) {
      const [kind, a, b, c, d] = f;
      if (kind === 'glow') { const g = el('i', 'afx-glow'); g.style.cssText = `left:${a}%;top:${b}%;width:${c * 2}%;--c:${d};--k:${f[5]};animation-delay:-${(Math.random() * 3).toFixed(2)}s`; layer.appendChild(g); }
      else if (kind === 'shimmer') { const g = el('i', 'afx-shim'); g.style.cssText = `left:${a}%;top:${b}%;width:${c - a}%;height:${d - b}%`; layer.appendChild(g); }
      else if (kind === 'gulls') { const g = el('i', 'afx-gull'); g.style.cssText = `--x0:${a}%;--y0:${b}%;--x1:${c}%;--y1:${d}%;animation-delay:${(2 + Math.random() * 6).toFixed(1)}s`; g.innerHTML = '<svg viewBox="0 0 40 14"><path d="M1 9 Q10 0 20 9 Q30 0 39 9" fill="none" stroke="#2b2b33" stroke-width="2.4" stroke-linecap="round"/></svg>'; layer.appendChild(g); }
      else cfg.push(f);
    }
    if (cfg.length) { cv = document.createElement('canvas'); cv.className = 'afx-cv'; layer.appendChild(cv); t0 = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; cv = null; }
  const R = (a, b) => a + Math.random() * (b - a);
  function spawn(f, W, H) {
    const [kind, a, b, c, d] = f;
    if (kind === 'steam') return { k: 'steam', x: a / 100 * W + R(-4, 4), y: b / 100 * H, vx: R(-0.08, 0.08), vy: R(-0.35, -0.22), r: R(3, 6), life: 0, max: R(140, 220) };
    if (kind === 'dust') return { k: 'dust', x: R(a, c) / 100 * W, y: R(b, d) / 100 * H, vx: R(-0.08, 0.08), vy: R(-0.06, 0.04), r: R(0.8, 1.8), life: 0, max: R(400, 900) };
    if (kind === 'splash') return { k: 'drop', x: a / 100 * W + R(-3, 3), y: b / 100 * H, vx: R(-0.7, 0.7), vy: R(-1.4, -0.6), r: R(0.9, 1.6), life: 0, max: 60 };
    if (kind === 'embers') return { k: 'ember', x: (a + R(-c, c) / 2) / 100 * W, y: b / 100 * H, vx: R(-0.15, 0.15), vy: R(-0.6, -0.3), r: R(0.8, 1.6), life: 0, max: R(50, 110) };
  }
  const RATE = { steam: 0.12, dust: 0.25, splash: 0.9, embers: 0.12 }, CAP = { steam: 26, dust: 60, splash: 40, embers: 16 };
  function tick(now) {
    if (!cv || !cv.isConnected) { stop(); return; }
    raf = requestAnimationFrame(tick);
    if (RUN && VIEW.sheet) return;
    const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const x = cv.getContext('2d'); x.clearRect(0, 0, W, H);
    for (const f of cfg) { const n = parts.filter(p => p.src === f).length; if (n < CAP[f[0] === 'splash' ? 'splash' : f[0]] && Math.random() < RATE[f[0]]) { const p = spawn(f, W, H); if (p) { p.src = f; parts.push(p); } } }
    parts = parts.filter(p => p.life < p.max);
    for (const p of parts) {
      p.life++; p.x += p.vx; p.y += p.vy;
      const u = p.life / p.max;
      if (p.k === 'steam') { p.vx += R(-0.02, 0.02); p.r += 0.05; x.fillStyle = `rgba(255,255,255,${(0.16 * Math.sin(Math.PI * u)).toFixed(3)})`; }
      else if (p.k === 'dust') { p.vx += R(-0.01, 0.01); p.vy += R(-0.008, 0.008); x.fillStyle = `rgba(255,240,200,${(0.55 * Math.sin(Math.PI * u)).toFixed(3)})`; }
      else if (p.k === 'drop') { p.vy += 0.06; x.fillStyle = `rgba(220,240,255,${(0.75 * (1 - u)).toFixed(3)})`; }
      else if (p.k === 'ember') { p.vx += R(-0.03, 0.03); x.fillStyle = `rgba(255,${(150 + 80 * (1 - u)) | 0},60,${(0.9 * (1 - u)).toFixed(3)})`; }
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
    }
  }
  const rs0 = renderStage;
  renderStage = function () { const r = rs0.apply(this, arguments); try { build(); } catch (e) { console.error(e); } return r; };
})();
