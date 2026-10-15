/* =====================================================================
   Helping around the house: small hands-on moments.

   1. Every chore in the game is now something you do with your finger,
      not a picture you watch:
        · washing up  — scrub the grime off each plate; it shines and goes
                        on the rack
        · sweeping    — sweep the sand off the floor
        · laundry     — tap each wet piece to peg it on the line
        · cooking     — tap the ingredients into the pan, then stir
        · ironing     — run the iron over the creases
      A few seconds each, with their own little sounds. "Skip" is always
      there for anyone who just wants to get on with the story.
   2. Elias's cottage and Leo's boathouse get everyday chores while you
      live there (the other houses and Sami's attic already had theirs,
      and they now play the same way).
      They never change trust, so every chapter's endings stay exactly as
      reachable as before: a little mood and food, a little energy and one
      time of day, and the person who lives there notices if they are in
      the room.
   Nothing here changes a quest, an ending or an existing line.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------------- little made-up sounds (only when sound is on) ---------------- */
  let AC = null;
  function ac() {
    if (typeof AUDIO === 'undefined' || !AUDIO.on) return null;
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; }
  }
  const vol = k => ((AUDIO.settings && AUDIO.settings.master) || 0.8) * ((AUDIO.settings && AUDIO.settings.sfx) || 0.7) * k;
  /* a short burst of filtered noise: scrubbing, sweeping, sizzling, splashing */
  function hiss(type, freq, len, k) {
    const c = ac(); if (!c) return;
    try {
      const t = c.currentTime, buf = c.createBuffer(1, Math.max(1, c.sampleRate * len | 0), c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = type; f.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol(k), t + Math.min(0.04, len / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      s.connect(f).connect(g).connect(c.destination); s.start(t); s.stop(t + len);
    } catch (e) { /* no sound is fine */ }
  }
  /* a soft tone: pegs, plops, the little chime at the end */
  function tone(freq, len, k, type) {
    const c = ac(); if (!c) return;
    try {
      const t = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol(k), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + len + 0.02);
    } catch (e) { /* no sound is fine */ }
  }
  const SND = {
    scrub: () => hiss('bandpass', rnd(1300, 1800), 0.12, 0.22),
    sweep: () => hiss('highpass', rnd(2200, 3000), 0.16, 0.18),
    steam: () => hiss('highpass', 4000, 0.35, 0.12),
    sizzle: () => hiss('bandpass', rnd(3000, 4200), 0.5, 0.18),
    plop: () => { tone(rnd(300, 380), 0.12, 0.25, 'triangle'); hiss('lowpass', 900, 0.15, 0.12); },
    peg: () => tone(rnd(1500, 1800), 0.05, 0.18, 'square'),
    drip: () => tone(rnd(900, 1300), 0.08, 0.10, 'sine'),
    clink: () => { tone(2400, 0.25, 0.10, 'sine'); tone(3600, 0.2, 0.06, 'sine'); },
    done: () => { tone(660, 0.18, 0.16); setTimeout(() => tone(990, 0.3, 0.14), 120); }
  };

  /* ---------------- words ---------------- */
  const W = {
    dishes: [T('Wash the dishes', '{اغسل|اغسلي} الصحون'), T('Scrub until it shines', '{افرك|افركي} الوسخ لين يلمع')],
    clean: [T('Sweep the floor', '{اكنس|اكنسي} الأرض'), T('Sweep the sand away', '{امسح|امسحي} الرمل بالمكنسة')],
    laundry: [T('Hang the washing', '{انشر|انشري} الغسيل'), T('Tap each piece to peg it on the line', '{اضغط|اضغطي} على كل قطعة عشان {تنشرها|تنشرينها}')],
    cook: [T('Cook', '{اطبخ|اطبخي}'), T('Tap the ingredients into the pan', '{حط|حطي} المكونات في المقلاة'), T('Now stir until it\'s done', 'الحين {قلّب|قلّبي} لين يستوي')],
    iron: [T('Iron the shirt', '{اكوِ|اكوي} القميص'), T('Run the iron over the creases', '{مرّر|مرّري} المكوى على التجاعيد')],
    skip: T('Skip', 'تخطّي')
  };

  /* ---------------- pictures (drawn here, small and flat, to match the game's lines) ---------------- */
  const INK = '#2a2430';
  const SVG = {
    plate: (rim, mid) => `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="104" rx="92" ry="88" fill="rgba(0,0,0,.18)"/><circle cx="100" cy="100" r="90" fill="${rim}" stroke="${INK}" stroke-width="4"/><circle cx="100" cy="100" r="62" fill="${mid}"/><circle cx="100" cy="100" r="62" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="3"/><path d="M38 70 q20 -40 70 -48" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/></svg>`,
    sponge: `<svg viewBox="0 0 80 60"><rect x="6" y="18" width="68" height="34" rx="8" fill="#f2c445" stroke="${INK}" stroke-width="3"/><rect x="6" y="10" width="68" height="16" rx="7" fill="#3aa86a" stroke="${INK}" stroke-width="3"/><circle cx="24" cy="38" r="3" fill="#d9a42c"/><circle cx="46" cy="42" r="2.5" fill="#d9a42c"/><circle cx="60" cy="34" r="3" fill="#d9a42c"/></svg>`,
    broom: `<svg viewBox="0 0 90 140"><rect x="40" y="0" width="10" height="84" rx="4" fill="#8a5a36" stroke="${INK}" stroke-width="3"/><path d="M14 84 h62 l10 46 h-82z" fill="#e2b030" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M22 92 v32 M36 92 v34 M50 92 v34 M64 92 v32" stroke="#b07a1a" stroke-width="3"/><rect x="12" y="80" width="66" height="10" rx="3" fill="#c23a34" stroke="${INK}" stroke-width="3"/></svg>`,
    iron: `<svg viewBox="0 0 120 80"><path d="M10 64 q8 -40 60 -42 h30 q12 0 12 14 v28z" fill="#cfd8dc" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M8 64 h106 v8 h-106z" fill="#9aa6b0" stroke="${INK}" stroke-width="3"/><path d="M48 22 q10 -20 40 -18 q10 2 8 18" fill="none" stroke="#3a78b8" stroke-width="8" stroke-linecap="round"/><circle cx="74" cy="44" r="5" fill="#e2483c"/></svg>`,
    spoon: `<svg viewBox="0 0 60 140"><rect x="25" y="40" width="10" height="100" rx="4" fill="#a8743e" stroke="${INK}" stroke-width="3"/><ellipse cx="30" cy="24" rx="20" ry="24" fill="#c08a4e" stroke="${INK}" stroke-width="3"/></svg>`,
    shirt: c => `<svg viewBox="0 0 120 120"><path d="M40 10 l-30 22 l14 18 l12 -8 v66 h48 v-66 l12 8 l14 -18 l-30 -22 q-20 14 -40 0z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M60 24 v86" stroke="rgba(0,0,0,.15)" stroke-width="3"/></svg>`,
    trousers: c => `<svg viewBox="0 0 120 120"><path d="M30 8 h60 l8 104 h-30 l-8 -70 l-8 70 h-30z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M30 18 h60" stroke="rgba(0,0,0,.2)" stroke-width="4"/></svg>`,
    towel: c => `<svg viewBox="0 0 120 120"><rect x="18" y="8" width="84" height="104" rx="6" fill="${c}" stroke="${INK}" stroke-width="4"/><path d="M18 92 h84 M18 98 h84" stroke="#fff" stroke-width="4" opacity=".7"/></svg>`,
    socks: c => `<svg viewBox="0 0 120 120"><path d="M26 8 h24 v62 q0 10 10 14 l16 6 q12 6 4 18 q-6 8 -20 4 l-26 -10 q-10 -4 -8 -16z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M66 8 h24 v56 q0 10 10 14 l6 2 q8 8 0 16 l-24 -8 q-16 -6 -16 -20z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round" opacity=".85"/><path d="M26 18 h24 M66 18 h24" stroke="#fff" stroke-width="4"/></svg>`,
    peg: `<svg viewBox="0 0 20 34"><rect x="5" y="0" width="10" height="34" rx="3" fill="#d9a46a" stroke="${INK}" stroke-width="2.5"/><rect x="5" y="14" width="10" height="5" fill="#a87440"/></svg>`,
    basket: `<svg viewBox="0 0 240 110"><path d="M10 20 h220 l-18 86 h-184z" fill="#c8a060" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M24 40 h192 M30 62 h180 M36 84 h168" stroke="#9a7438" stroke-width="4"/><rect x="4" y="12" width="232" height="14" rx="6" fill="#b08848" stroke="${INK}" stroke-width="4"/></svg>`,
    pan: `<svg viewBox="0 0 300 150"><rect x="236" y="62" width="64" height="16" rx="7" fill="#5a3a2a" stroke="${INK}" stroke-width="4"/><ellipse cx="128" cy="76" rx="120" ry="58" fill="#2b2f36" stroke="${INK}" stroke-width="5"/><ellipse cx="128" cy="72" rx="100" ry="44" fill="#3d434d"/><ellipse cx="96" cy="58" rx="40" ry="10" fill="#fff" opacity=".07"/></svg>`,
    fish: `<svg viewBox="0 0 120 70"><path d="M8 35 q40 -34 84 -6 l20 -18 v48 l-20 -18 q-44 28 -84 -6z" fill="#f2a07a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M40 24 q8 11 0 22 M58 22 q8 13 0 26" stroke="#e07a5a" stroke-width="3" fill="none"/></svg>`,
    potato: `<svg viewBox="0 0 120 80"><ellipse cx="44" cy="44" rx="34" ry="26" fill="#d8b070" stroke="${INK}" stroke-width="4"/><ellipse cx="86" cy="40" rx="26" ry="22" fill="#e4c084" stroke="${INK}" stroke-width="4"/><circle cx="36" cy="40" r="3" fill="#a07840"/><circle cx="90" cy="36" r="2.5" fill="#a07840"/></svg>`,
    herbs: `<svg viewBox="0 0 120 80"><path d="M60 76 v-40" stroke="#3a7a3a" stroke-width="5"/><ellipse cx="44" cy="30" rx="18" ry="11" fill="#6abf5a" stroke="${INK}" stroke-width="4" transform="rotate(-30 44 30)"/><ellipse cx="78" cy="26" rx="18" ry="11" fill="#7cc46a" stroke="${INK}" stroke-width="4" transform="rotate(25 78 26)"/><ellipse cx="60" cy="14" rx="14" ry="9" fill="#5aae4a" stroke="${INK}" stroke-width="4"/></svg>`,
    egg: `<svg viewBox="0 0 120 80"><ellipse cx="38" cy="44" rx="22" ry="28" fill="#fbf6e8" stroke="${INK}" stroke-width="4"/><ellipse cx="84" cy="46" rx="22" ry="27" fill="#f2e6cc" stroke="${INK}" stroke-width="4"/></svg>`,
    tomato: `<svg viewBox="0 0 120 80"><circle cx="60" cy="44" r="30" fill="#e2483c" stroke="${INK}" stroke-width="4"/><path d="M48 18 l12 8 l12 -8 l-6 12 h-12z" fill="#3a8a3a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M42 36 q6 -8 14 -8" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/></svg>`
  };
  const PATH_SHIRT = 'M40 10 l-30 22 l14 18 l12 -8 v66 h48 v-66 l12 8 l14 -18 l-30 -22 q-20 14 -40 0z';

  /* ---------------- the frame every chore plays in ---------------- */
  let busy = false, openAlt = null;
  function frame(kind) {
    const st = $('stage');
    const box = el('div', 'cp cp-' + kind); box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', tx(W[kind][0]));
    const card = el('div', 'cp-card');
    const head = el('div', 'cp-head');
    const title = el('strong', 'cp-title', tx(W[kind][0]));
    const hint = el('span', 'cp-hint', tx(W[kind][1]));
    const tt = el('div', 'cp-tt'); tt.appendChild(title); tt.appendChild(hint); head.appendChild(tt);
    const skip = el('button', 'cp-skip', tx(W.skip)); skip.type = 'button'; head.appendChild(skip);
    const area = el('div', 'cp-area');
    const bar = el('div', 'cp-bar'); const fill = el('i'); bar.appendChild(fill);
    card.appendChild(head); card.appendChild(area); card.appendChild(bar); box.appendChild(card); st.appendChild(box);
    /* nothing under the chore reacts while it is open */
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    return { box, area, hint, skip, setP: p => { fill.style.width = Math.round(Math.max(0, Math.min(1, p)) * 100) + '%'; } };
  }
  /* pieces that float away: bubbles, dust, steam, drops, sparkles */
  function puff(area, x, y, cls, n) {
    if (REDUCED()) n = Math.min(n, 1);
    for (let i = 0; i < n; i++) {
      const p = el('i', 'cp-p ' + cls);
      p.style.left = (x + rnd(-14, 14)) + 'px'; p.style.top = (y + rnd(-10, 10)) + 'px';
      p.style.setProperty('--dx', rnd(-30, 30) + 'px'); p.style.setProperty('--dy', rnd(-60, -20) + 'px'); p.style.setProperty('--s', rnd(0.6, 1.3).toFixed(2));
      area.appendChild(p); setTimeout(() => p.remove(), 900);
    }
  }
  function sparkle(area, x, y) { puff(area, x, y, 'spark', 6); }
  const local = (area, ev) => { const r = area.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top, w: r.width, h: r.height }; };
  function tool(area, svg, cls) { const t = el('div', 'cp-tool ' + (cls || '')); t.innerHTML = svg; area.appendChild(t); return t; }
  const moveTool = (t, x, y) => { t.style.transform = `translate(${x}px, ${y}px)`; };

  /* scrubbing: a canvas of dirt over a picture; rub it away. Resolves when it is clean.
     shape(ctx) clips the dirt to the object; paint(ctx, w, h) draws the dirt. */
  function scrub(area, o) {
    return new Promise(resolve => {
      const cv = el('canvas', 'cp-dirt'); area.appendChild(cv);
      const r = area.getBoundingClientRect(), k = Math.min(2, window.devicePixelRatio || 1);
      const W2 = Math.max(1, Math.round(r.width)), H2 = Math.max(1, Math.round(r.height));
      cv.width = W2 * k; cv.height = H2 * k; cv.style.width = W2 + 'px'; cv.style.height = H2 + 'px';
      const ctx = cv.getContext('2d'); ctx.scale(k, k);
      ctx.save(); if (o.shape) { const sp = o.shape(ctx, W2, H2); if (sp instanceof Path2D) ctx.clip(sp); else ctx.clip(); } o.paint(ctx, W2, H2); ctx.restore();
      const count = () => { try { const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 40) n++; return n; } catch (e) { return 0; } };
      const total = Math.max(1, count());
      const t = tool(area, o.tool, o.toolCls); moveTool(t, W2 * 0.7, H2 * 0.6);
      let down = false, last = null, moves = 0, over = false, sndAt = 0;
      const rub = (x, y) => {
        ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.lineWidth = o.brush * 2;
        ctx.beginPath(); if (last) ctx.moveTo(last.x, last.y); else ctx.moveTo(x - 0.1, y); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
        last = { x, y };
        const now = performance.now(); if (now - sndAt > 110) { sndAt = now; o.sound && o.sound(); if (o.puff) puff(area, x, y, o.puff, 2); }
        if (++moves % 6 === 0) {
          const left = count() / total; o.setP && o.setP(1 - left);
          if (left < (o.clean || 0.07) && !over) { over = true; cv.classList.add('gone'); t.classList.add('gone'); setTimeout(() => { cv.remove(); t.remove(); resolve(); }, 350); }
        }
      };
      area.onpointerdown = ev => { if (over) return; down = true; last = null; try { area.setPointerCapture(ev.pointerId); } catch (e) {} const p = local(area, ev); moveTool(t, p.x, p.y); rub(p.x, p.y); area.classList.add('active'); };
      area.onpointermove = ev => { const p = local(area, ev); moveTool(t, p.x, p.y); if (down && !over) rub(p.x, p.y); };
      area.onpointerup = area.onpointercancel = () => { down = false; last = null; };
    });
  }

  /* ---------------- the five chores ---------------- */
  const GAMES = {
    /* washing up: three plates, each with its own mess, scrubbed one after another */
    async dishes(f) {
      const MESS = [['#b5482e', '#d86a3c'], ['#7a5232', '#9a6a3a'], ['#c8a03a', '#7a9a3a']];
      const sink = el('div', 'cp-sink'); f.area.appendChild(sink);
      for (let n = 0; n < 3; n++) {
        const plate = el('div', 'cp-plate in'); plate.innerHTML = SVG.plate('#fbfbf7', '#eef2f2'); f.area.appendChild(plate);
        await wait(REDUCED() ? 50 : 380);
        const pr = plate.getBoundingClientRect(), ar = f.area.getBoundingClientRect();
        const cx = pr.left - ar.left + pr.width / 2, cy = pr.top - ar.top + pr.height / 2, rad = pr.width * 0.45;
        await scrub(f.area, {
          tool: SVG.sponge, toolCls: 'sponge', brush: Math.max(16, rad * 0.24), puff: 'bubble', sound: SND.scrub,
          setP: p => f.setP((n + p) / 3),
          shape: c => { c.beginPath(); c.arc(cx, cy, rad, 0, Math.PI * 2); },
          paint: c => {
            const [a, b] = MESS[n];
            for (let i = 0; i < 9; i++) { const ang = rnd(0, 6.28), d = rnd(0, rad * 0.7), x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d, s = rnd(rad * 0.18, rad * 0.42);
              const g = c.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, i % 2 ? a : b); g.addColorStop(0.7, (i % 2 ? a : b) + 'cc'); g.addColorStop(1, (i % 2 ? a : b) + '00');
              c.fillStyle = g; c.beginPath(); c.arc(x, y, s, 0, 6.28); c.fill(); }
            c.fillStyle = '#5a3a22';
            for (let i = 0; i < 26; i++) { const ang = rnd(0, 6.28), d = rnd(0, rad * 0.9); c.beginPath(); c.arc(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, rnd(1.5, 3.5), 0, 6.28); c.fill(); }
          }
        });
        SND.clink(); sparkle(f.area, cx, cy); plate.classList.add('shine');
        await wait(REDUCED() ? 100 : 450);
        plate.classList.add('out'); await wait(REDUCED() ? 50 : 350); plate.remove();
      }
    },
    /* sweeping: sand piles across the floor */
    async clean(f) {
      const floor = el('div', 'cp-floor'); f.area.appendChild(floor);
      await wait(30);
      await scrub(f.area, {
        tool: SVG.broom, toolCls: 'broom', brush: 34, puff: 'dust', sound: SND.sweep, setP: f.setP, clean: 0.06,
        paint: (c, w, h) => {
          for (let p = 0; p < 6; p++) {
            const px = rnd(w * 0.12, w * 0.88), py = rnd(h * 0.3, h * 0.88), R = rnd(28, 52);
            for (let i = 0; i < 140; i++) { const a = rnd(0, 6.28), d = Math.pow(Math.random(), 0.6) * R;
              c.fillStyle = ['#c9b186', '#b39a6c', '#d8c49a', '#8a7a5a'][i % 4]; c.beginPath(); c.arc(px + Math.cos(a) * d, py + Math.sin(a) * d * 0.6, rnd(1.2, 3.4), 0, 6.28); c.fill(); }
          }
        }
      });
      SND.done(); sparkle(f.area, f.area.clientWidth / 2, f.area.clientHeight / 2);
    },
    /* ironing: the creases on a shirt */
    async iron(f) {
      const board = el('div', 'cp-board'); f.area.appendChild(board);
      const shirt = el('div', 'cp-shirt'); shirt.innerHTML = SVG.shirt('#f4f1ea'); f.area.appendChild(shirt);
      await wait(30);
      const sr = shirt.getBoundingClientRect(), ar = f.area.getBoundingClientRect(), sx = sr.left - ar.left, sy = sr.top - ar.top, sc = sr.width / 120;
      await scrub(f.area, {
        tool: SVG.iron, toolCls: 'ironer', brush: Math.max(18, sr.width * 0.12), puff: 'steam', sound: SND.steam, setP: f.setP,
        shape: () => { const p = new Path2D(); p.addPath(new Path2D(PATH_SHIRT), new DOMMatrix([sc, 0, 0, sc, sx, sy])); return p; },
        paint: c => {
          c.strokeStyle = 'rgba(120,110,95,.55)'; c.lineWidth = 3; c.lineCap = 'round';
          for (let i = 0; i < 22; i++) { const x = sx + rnd(10, 110) * sc, y = sy + rnd(14, 112) * sc, l = rnd(14, 34) * sc;
            c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y + rnd(-8, 8) * sc, x + l, y + rnd(-6, 6) * sc); c.stroke(); }
          c.fillStyle = 'rgba(140,128,110,.18)'; c.fillRect(sx, sy, 120 * sc, 120 * sc);
        }
      });
      SND.done(); shirt.classList.add('shine'); sparkle(f.area, sx + 60 * sc, sy + 60 * sc); await wait(300);
    },
    /* laundry: tap each wet piece in the basket; it flies to the line and gets a peg */
    async laundry(f) {
      const line = el('div', 'cp-line'); f.area.appendChild(line);
      const basket = el('div', 'cp-basket'); basket.innerHTML = SVG.basket; f.area.appendChild(basket);
      const ITEMS = [SVG.shirt('#e2483c'), SVG.trousers('#3a5a8a'), SVG.towel('#f2c445'), SVG.socks('#7a4a8a')].sort(() => Math.random() - 0.5);
      let hung = 0;
      await new Promise(resolve => {
        ITEMS.forEach((svg, i) => {
          const it = el('button', 'cp-cloth wet'); it.type = 'button'; it.innerHTML = svg;
          it.style.left = (16 + i * 17) + '%'; it.style.setProperty('--r', rnd(-14, 14).toFixed(0) + 'deg');
          f.area.appendChild(it);
          it.onclick = ev => {
            ev.stopPropagation(); if (it.classList.contains('hung')) return;
            const slot = hung++; it.classList.add('hung'); it.style.left = (12 + slot * 21) + '%'; it.style.setProperty('--r', '0deg');
            SND.plop();
            setTimeout(() => {
              const pg = el('i', 'cp-peg'); pg.innerHTML = SVG.peg; it.appendChild(pg); SND.peg();
              const r = it.getBoundingClientRect(), ar = f.area.getBoundingClientRect();
              puff(f.area, r.left - ar.left + r.width / 2, r.bottom - ar.top - 6, 'drop', 3); setTimeout(SND.drip, 160);
            }, REDUCED() ? 0 : 420);
            f.setP(hung / ITEMS.length);
            if (hung === ITEMS.length) setTimeout(() => { f.area.classList.add('windy'); hiss('lowpass', 500, 0.9, 0.16); setTimeout(resolve, REDUCED() ? 100 : 900); }, 500);
          };
        });
      });
      SND.done();
    },
    /* cooking: three ingredients into the pan, then stir until it's golden */
    async cook(f) {
      const stove = el('div', 'cp-stove'); f.area.appendChild(stove);
      const pan = el('div', 'cp-pan'); pan.innerHTML = SVG.pan; f.area.appendChild(pan);
      const food = el('div', 'cp-food'); pan.appendChild(food); const fin = el('div', 'cp-food-in'); food.appendChild(fin);
      const steam = el('div', 'cp-steam'); steam.innerHTML = '<i></i><i></i><i></i>'; pan.appendChild(steam);
      const SETS = [[SVG.fish, SVG.potato, SVG.herbs], [SVG.egg, SVG.tomato, SVG.herbs], [SVG.potato, SVG.tomato, SVG.fish]];
      const set = SETS[Math.floor(Math.random() * SETS.length)];
      const COLORS = [['#f2a07a', '#e07a5a'], ['#d8b070', '#e4c084'], ['#e2483c', '#7cc46a']];
      let added = 0;
      await new Promise(resolve => {
        set.forEach((svg, i) => {
          const ing = el('button', 'cp-ing'); ing.type = 'button'; ing.innerHTML = svg; ing.style.top = (10 + i * 28) + '%';
          f.area.appendChild(ing);
          ing.onclick = ev => {
            ev.stopPropagation(); if (ing.classList.contains('used')) return;
            ing.classList.add('used'); added++; f.setP(added / 6); SND.plop();
            setTimeout(() => {
              ing.remove(); SND.sizzle();
              const [a, b] = COLORS[i % COLORS.length];
              for (let k = 0; k < 7; k++) { const bit = el('i', 'cp-bit'), an = rnd(0, 6.28), d = Math.sqrt(Math.random()) * 34; bit.style.left = (50 + Math.cos(an) * d) + '%'; bit.style.top = (50 + Math.sin(an) * d) + '%'; bit.style.background = k % 2 ? a : b; bit.style.setProperty('--r', rnd(0, 360) + 'deg'); fin.appendChild(bit); }
              const pr = pan.getBoundingClientRect(), ar = f.area.getBoundingClientRect(); puff(f.area, pr.left - ar.left + pr.width * 0.42, pr.top - ar.top + pr.height * 0.35, 'oil', 4);
              if (added === set.length) resolve();
            }, REDUCED() ? 0 : 380);
          };
        });
      });
      /* stir */
      f.hint.textContent = tx(W.cook[2]); pan.classList.add('hot');
      const sp = tool(f.area, SVG.spoon, 'spoon');
      const pr = pan.getBoundingClientRect(), ar = f.area.getBoundingClientRect();
      const pc = { x: pr.left - ar.left + pr.width * 0.42, y: pr.top - ar.top + pr.height * 0.5 };
      moveTool(sp, pc.x, pc.y);
      await new Promise(resolve => {
        let down = false, last = null, dist = 0, ang = 0, sndAt = 0, over = false;
        const need = pr.width * 4.5;
        const step = p => {
          moveTool(sp, p.x, p.y);
          if (!down || over) return;
          if (last) { const d = Math.hypot(p.x - last.x, p.y - last.y); dist += Math.min(d, 40); ang += d * 0.6; }
          last = p;
          const k = Math.min(1, dist / need);
          fin.style.transform = `translateY(-50%) scaleY(.46) rotate(${ang}deg)`; food.style.filter = `sepia(${(k * 0.7).toFixed(2)}) saturate(${(1 + k * 0.6).toFixed(2)}) brightness(${(1 - k * 0.12).toFixed(2)})`;
          steam.style.opacity = (0.25 + k * 0.75).toFixed(2);
          f.setP(0.5 + k / 2);
          const now = performance.now(); if (now - sndAt > 260) { sndAt = now; SND.sizzle(); if (Math.random() < 0.5) puff(f.area, p.x, p.y, 'oil', 1); }
          if (k >= 1) { over = true; sp.classList.add('gone'); setTimeout(resolve, 300); }
        };
        f.area.onpointerdown = ev => { down = true; last = null; try { f.area.setPointerCapture(ev.pointerId); } catch (e) {} step(local(f.area, ev)); };
        f.area.onpointermove = ev => step(local(f.area, ev));
        f.area.onpointerup = f.area.onpointercancel = () => { down = false; last = null; };
      });
      SND.done(); pan.classList.add('ready'); sparkle(f.area, pc.x, pc.y - 20); await wait(400);
    }
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function playChore(kind, done) {
    const st = $('stage');
    if (!st || !GAMES[kind]) { done(); return; }
    busy = true;
    const f = frame(kind);
    /* the game's automatic players (and screen readers) get a plain "skip" in the panel too */
    const alt = el('button', 'opt cp-alt', tx(W.skip)); alt.type = 'button'; const panel = $('panel'); if (panel) panel.appendChild(alt); openAlt = alt;
    let over = false;
    const finish = () => {
      if (over) return; over = true; alt.remove();
      /* the story carries on at once; the card just fades away on top */
      f.box.classList.add('out'); f.box.style.pointerEvents = 'none'; setTimeout(() => f.box.remove(), REDUCED() ? 0 : 220);
      busy = false; done();
    };
    f.skip.onclick = ev => { ev.stopPropagation(); finish(); };
    alt.onclick = finish;
    setTimeout(() => GAMES[kind](f).then(() => setTimeout(finish, REDUCED() ? 100 : 500), finish), REDUCED() ? 0 : 320);   /* after the card has popped in, so measurements are right */
  }

  /* which spots are chores: tagged here, by their (English) label, so no other file changes */
  const KIND = [[/^(Cook a meal|Make something|Cook for)/, 'cook'], [/^(Wash the dishes|Wash up)/, 'dishes'], [/^(Clean up|Tidy|Sweep|Clear up)/, 'clean'], [/(laundry|Wash your clothes)/i, 'laundry'], [/^Help with the ironing/, 'iron']];
  function tagAll() {
    for (const L of Object.values(GAME.LOC)) for (const sp of (L.spots || [])) {
      if (sp.anim || !sp.label || !sp.label.en) continue;
      const k = KIND.find(([re]) => re.test(sp.label.en)); if (k) sp.anim = k[1];
    }
  }

  const use0 = useSpot;
  useSpot = function (h) {
    /* the card was left some other way (the scene moved on under it): close it, never leave the house stuck */
    if (busy && (!openAlt || !openAlt.isConnected || !document.querySelector('#stage .cp:not(.out)'))) { document.querySelectorAll('#stage .cp').forEach(b => b.remove()); busy = false; }
    if (h && h.anim && !busy && !RUN) { AUDIO.sfx('tap'); playChore(h.anim, () => use0(h)); return; }
    if (busy) return;
    return use0(h);
  };

  /* ---------------- everyday chores in the houses ---------------- */
  const inElias = s => s.host === 'elias' && !s.f.ended;
  const inLeo = s => s.host === 'leo' && !s.f.leoEnded;
  const inMarg = s => s.host === 'margaret';
  const inEve = s => s.host === 'evelyn';
  const here = (s, id) => GAME.CHAR[id] && GAME.CHAR[id].where && GAME.CHAR[id].where(s) === s.loc;
  const say = (id, e, en, ar) => ({ c: id, e, t: T(en, ar) });
  /* a chore: once a day, one time of day, a little mood; `food`/`tired` optional; `react` when the host is in the room */
  const job = (key, o) => ({
    x: o.x, y: o.y, label: o.label, anim: o.anim,
    if: s => o.when(s) && (o.night || s.slot < NIGHT) && !doneToday(key),
    run: s => {
      onceToday(key); advance(1); addMood(1);
      if (o.food) feed(o.food);
      rest(-(o.tired || 8));
      const out = [{ n: fresh(key, o.lines) }];
      if (o.react && here(s, o.host)) out.push(o.react[s.day % o.react.length]);
      return out;
    }
  });
  const add = (loc, ...spots) => { if (GAME.LOC[loc]) GAME.LOC[loc].spots.push(...spots); };

  /* Elias */
  add('kitchen',
    job('eCook', { x: 90, y: 62, anim: 'cook', host: 'elias', when: inElias, food: 45, label: T('Cook for Elias', '{تطبخ|تطبخين} لإلياس'),
      lines: [T('Fish, potatoes, a lot of butter. The kitchen smells like somebody lives here.', 'سمك وبطاطس وزبدة كثير. المطبخ صارت ريحته كأن أحد ساكن فيه.'),
        T('Porridge with honey. You find the honey behind three tins of the same beans.', 'شوفان بالعسل. {تلقى|تلقين} العسل ورا ثلاث علب فاصوليا نفس النوع.'),
        T('Eggs and toast. You burn the first slice, then get it right. Practice.', 'بيض وتوست. {تحرق|تحرقين} أول شريحة، وبعدين {تضبطها|تضبطينها}. تمرين.')],
      react: [say('elias', 'smile', 'He eats a few bites and pushes the plate an inch away. "Lovely." It was more than yesterday.', 'ياكل كم لقمة ويبعّد الصحن شوي. «حلو.» بس أكثر من أمس.'),
        say('elias', 'neutral', '"You cook like a man who\'s been hungry," he says. It isn\'t a complaint.', '«{تطبخ|تطبخين} مثل واحد جاع قبل،» يقول. وما هي شكوى.')] }),
    job('eDish', { x: 62, y: 50, anim: 'dishes', host: 'elias', when: inElias, label: T('Wash the dishes', '{تغسل|تغسلين} الصحون'),
      lines: [T('Two cups, one plate, one spoon. A house for one, pretending to be a house for two.', 'كوبين، وصحن واحد، وملعقة. بيت لشخص واحد، يتظاهر إنه لشخصين.'),
        T('You dry the cups and hang them on their hooks. One hook stays empty. Ada\'s, probably.', '{تنشف|تنشفين} الأكواب {وتعلقها|وتعلقينها} في مكانها. فيه مسمار يبقى فاضي. حق آدا، غالباً.')],
      react: [say('elias', 'neutral', '"Leave them, {lad|lass}." You don\'t. He doesn\'t say it twice.', '«{خلها يا ولدي|خليها يا بنتي}.» ما {تخليها|تخلينها}. وما يقولها مرة ثانية.')] }));
  add('living',
    job('eSweep', { x: 40, y: 82, anim: 'clean', host: 'elias', when: inElias, label: T('Sweep the floor', '{تكنس|تكنسين} الأرض'),
      lines: [T('Sand everywhere. The sea gets into everything in this house, even the drawers.', 'رمل في كل مكان. البحر يدخل كل شي في هالبيت، حتى الأدراج.'),
        T('Under the armchair: a pencil, a button and a shell. You put the shell on the windowsill.', 'تحت الكرسي: قلم، وزر، وصدفة. {تحط|تحطين} الصدفة على الشباك.')],
      react: [say('elias', 'smile', '"Ada used to sweep that way. Corners first." He looks away.', '«آدا كانت تكنس كذا. الزوايا أول.» ويلف وجهه.')] }));
  add('bath',
    job('eWash', { x: 74, y: 62, anim: 'laundry', host: 'elias', when: inElias, night: true, label: T('Wash your clothes', '{تغسل|تغسلين} ملابسك'),
      lines: [T('You hang your shirts next to his. Everything here smells of salt, even after washing.', '{تعلق|تعلقين} قمصانك جنب قمصانه. كل شي هنا ريحته ملح، حتى بعد الغسيل.')] }));

  /* Leo */
  add('boathouse',
    job('lCook', { x: 22, y: 50, anim: 'cook', host: 'leo', when: inLeo, food: 45, label: T('Make something that isn\'t cereal', '{سوّ|سوّي} أكل غير الكورن فليكس'),
      lines: [T('Pasta with whatever is in the fridge, which is ketchup. It works.', 'مكرونة بالموجود في الثلاجة، اللي هو كاتشب. ويمشي.'),
        T('Pancakes. The first one is a disaster. The second one is art.', 'بان كيك. الأولى كارثة. الثانية فن.')],
      react: [say('leo', 'smile', 'Leo eats it out of the pan, standing up, like someone might take it away.', 'ليو ياكلها من المقلاة وهو واقف، كأن أحد بياخذها منه.'),
        say('leo', 'shock', '"You can COOK? Why didn\'t you say? I\'ve been eating cereal for a year."', '«{تعرف|تعرفين} {تطبخ|تطبخين}؟ ليش ما {قلت|قلتي}؟ صار لي سنة آكل كورن فليكس.»')] }),
    job('lClean', { x: 30, y: 72, anim: 'clean', host: 'leo', when: inLeo, label: T('Clear up the pizza boxes', '{تشيل|تشيلين} علب البيتزا'),
      lines: [T('Under the sofa: four pencils, one sock and a drawing of a seagull in a tie.', 'تحت الكنبة: أربع أقلام، وشراب واحد، ورسمة نورس لابس كرفتة.'),
        T('Seven pizza boxes. You stack them like a monument and take a photo before throwing them out.', 'سبع علب بيتزا. {ترصها|ترصينها} مثل نصب تذكاري {وتصورها|وتصورينها} قبل ما {ترميها|ترمينها}.')],
      react: [say('leo', 'sad', '"Daniel used to do that. Tidy up and pretend he wasn\'t." He goes quiet.', '«دانيال كان يسوي كذا. يرتب ويسوي نفسه ما يرتب.» ويسكت.')] }));
  add('bh_bath',
    job('lWash', { x: 78, y: 62, anim: 'laundry', host: 'leo', when: inLeo, night: true, label: T('Wash your clothes', '{تغسل|تغسلين} ملابسك'),
      lines: [T('Leo owns six of the same hoodie. You wash yours with them and now you can\'t tell which is which.', 'ليو عنده ست هوديات نفس الشي. {تغسل|تغسلين} حقك معها، والحين ما {تعرف|تعرفين} أيها حقك.')] }));

  tagAll();
})();
