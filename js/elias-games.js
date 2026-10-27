/* =====================================================================
   Two things to do with Elias, with your own hands (the stories after
   them stay exactly as they were; no trust or ending changes):
     · Mending the nets (the shed, afternoons): a real torn hole. Drag the
       twine across, wrap it round the knot, flick it tight; strand by
       strand, while Elias mends his own side. Skill: 🛠 Hands.
     · Chess (the café, evenings): Elias sets up a position from one of
       his old games. "One move wins it." Tap a piece, tap where it goes.
       Three tries. A different position every evening.
       Skill: ♟ Mind.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };
  let AC = null;
  const ac = () => { if (!on()) return null; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  function blip(f, d, k, type) { const c = ac(); if (!c) return; try { const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + d); g.gain.setValueAtTime(vol(k), t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.02); } catch (e) { /* none */ } }
  const rec = (name, k, rate) => { if (!on()) return; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); if (rate) { a.preservesPitch = false; a.playbackRate = rate; } a.play().catch(() => {}); } catch (e) { /* none */ } };

  /* ---------- two more skills ---------- */
  const LV = xp => Math.min(5, 1 + Math.floor(Math.sqrt(xp / 4)));
  function skillOf(key) { return LV(S().f[key] || 0); }
  function gain(key, n, sk) { const s = S(), b = skillOf(key); s.f[key] = (s.f[key] || 0) + n; const a = skillOf(key); if (a > b) toast(sk.icon + ' ' + tx(sk.name) + ' ' + a + ' ⬆'); }
  GAME.SKILLS = GAME.SKILLS || {};
  GAME.SKILLS.hands = { icon: '🛠', name: T('Hands', 'شغل اليد'), level: () => skillOf('skHands'), xp: () => S().f.skHands || 0, next: lv => 4 * lv * lv };
  GAME.SKILLS.mind = { icon: '♟', name: T('Mind', 'التفكير'), level: () => skillOf('skMind'), xp: () => S().f.skMind || 0, next: lv => 4 * lv * lv };

  function card(cls, title, hintText) {
    const st = $('stage');
    const box = el('div', 'cp ' + cls); box.setAttribute('role', 'dialog');
    box.innerHTML = '<div class="cp-card"><div class="cp-head"><div class="cp-tt"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div><div class="cp-area"></div><div class="fs-row"><span class="g-count"></span><span class="g-skill"></span></div></div>';
    st.appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = s => box.querySelector(s);
    q('.cp-title').textContent = tx(title); q('.cp-hint').textContent = tx(hintText); q('.cp-skip').textContent = tx(T('Skip', 'تخطّي'));
    return { box, q, area: q('.cp-area'), hint: t => { q('.cp-hint').textContent = tx(t); } };
  }
  function shell(f, done, altClicks) {
    const alt = el('button', 'opt main cp-alt', tx(T('Skip', 'تخطّي'))); alt.type = 'button'; const panel = $('panel'); if (panel) panel.appendChild(alt);
    let over = false, n = 0;
    const finish = res => { if (over) return; over = true; alt.remove(); f.box.classList.add('out'); f.box.style.pointerEvents = 'none'; setTimeout(() => f.box.remove(), 260); done(res); };
    f.q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(0); };
    alt.onclick = () => { if (++n >= (altClicks || 1)) finish(0); };
    return { finish, isOver: () => over };
  }

  /* ================= the net =================
     A real torn hole in a hanging net. Every broken strand has to be
     re-made by hand, the way it is really done:
       1. drag the twine from a knot on the edge of the hole to the next
          knot (stay on the line or it snags on the old mesh),
       2. wrap it around the knot (draw circles on it),
       3. pull it tight (one quick flick away from the knot).
     The hole closes from the edge inwards. Elias mends his own hole on
     the other side of the net at the same time; beat him and he notices.
     Hands skill: wider line, fewer wraps, longer time to pull. */
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; };
  const DX = 48, DY = 30, VW = 400, VH = 220;
  function lattice() {
    const nodes = [], segs = [], id = (r, c) => r + ':' + c;
    for (let r = 0; r <= 8; r++) for (let c = -1; c <= 9; c++) nodes.push({ id: id(r, c), r, c, x: c * DX + (r % 2 ? DX / 2 : 0) - 4, y: r * DY - 8 });
    const at = {}; nodes.forEach(n => { at[n.id] = n; });
    nodes.forEach(n => { if (n.r >= 8) return; const o = n.r % 2; [o ? n.c : n.c - 1, o ? n.c + 1 : n.c].forEach(c => { const m = at[id(n.r + 1, c)]; if (m) segs.push({ a: n.id, b: m.id }); }); });
    return { nodes, segs, at };
  }
  GAME.MINI.knot = function (panel, done, stp) {
    panel.innerHTML = '';
    const lv = skillOf('skHands'), storm = !!(stp && stp.storm);
    const f = storm ? card('cp-knot storm', T('The Ada\'s net, in the storm', 'شبكة «آدا»، في العاصفة'), T('Close the tear before the sea takes the net. It won\'t keep still.', '{سكّر|سكّري} الشق قبل لا ياخذ البحر الشبكة. وهي ما توقف.'))
      : card('cp-knot', T('Mending the net', 'تصليح الشبكة'), T('Drag the twine from a glowing knot across the hole.', '{اسحب|اسحبي} الخيط من عقدة تلمع لعقدة ثانية عبر الفتحة.'));
    const sh = shell(f, done, 3);
    f.q('.g-skill').textContent = '🛠 ' + lv;
    f.area.innerHTML = '<div class="kn-race">' + (storm ? '<b class="kn-sea">🌊</b>' : '<img src="img/chars/elias-smile.webp" alt="">') + '<div class="kn-bar el"><i></i></div><div class="kn-bar me"><i></i></div><span class="kn-you"></span></div>';
    f.q('.kn-you').textContent = tx(T('you', '{أنت|أنتِ}'));
    const svg = sv('svg', { viewBox: `0 0 ${VW} ${VH}`, class: 'kn-svg', preserveAspectRatio: 'xMidYMid meet' }, f.area);
    const defs = sv('defs', {}, svg);
    defs.innerHTML = '<linearGradient id="knWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3d24"/><stop offset="1" stop-color="#3b2716"/></linearGradient>' +
      '<linearGradient id="knSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2a33"/><stop offset="1" stop-color="#0b1217"/></linearGradient>' +
      '<radialGradient id="knGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>';
    sv('rect', { x: 0, y: 0, width: VW, height: VH, fill: storm ? 'url(#knSea)' : 'url(#knWood)' }, svg);
    const grain = sv('g', { stroke: storm ? '#05090c' : '#2c1d10', 'stroke-width': 1, opacity: .45, fill: 'none' }, svg);
    for (let y = 18; y < VH; y += 36) sv('path', { d: `M0 ${y} C 120 ${y - 6}, 260 ${y + 7}, ${VW} ${y - 2}` }, grain);
    for (let y = 0; y < VH; y += 72) sv('line', { x1: 0, y1: y, x2: VW, y2: y, stroke: '#1f140a', 'stroke-width': 2.5, opacity: .8 }, svg);
    const L = lattice();
    /* the hole: strands whose middle falls inside an ellipse near the centre, about 7 of them */
    const cx = 200 + (Math.random() * 40 - 20), cy = 112 + (Math.random() * 16 - 8);
    let rx = 40, miss = [];
    const mid = g => { const a = L.at[g.a], b = L.at[g.b]; return [(a.x + b.x) / 2, (a.y + b.y) / 2]; };
    L.segs.forEach(g => { g.j = 0.7 + Math.random() * 0.6; });
    const tilt = Math.random() * 0.8 - 0.4, ct = Math.cos(tilt), st2 = Math.sin(tilt);
    const pick = () => L.segs.filter(g => { const [x0, y0] = mid(g), x = (x0 - cx) * ct + (y0 - cy) * st2, y = -(x0 - cx) * st2 + (y0 - cy) * ct; return (x / rx) ** 2 + (y / (rx * 0.62)) ** 2 < g.j; });
    const want = storm ? 5 : (lv >= 4 ? 7 : 8);
    for (; rx < 90; rx += 3) { miss = pick(); if (miss.length >= want) break; }
    miss.forEach(g => { g.missing = true; });
    /* Elias's own hole, far side: decorative, closes with his bar */
    /* in the storm the whole net heaves with the boat, so the knots keep moving under your finger */
    const netG = sv('g', {}, svg);
    const ropeG = sv('g', {}, netG), ghostG = sv('g', {}, netG), knotG = sv('g', {}, netG), fxG = sv('g', {}, netG);
    let OX = 0, OY = 0;
    if (storm) { const rain = sv('g', { class: 'kn-rain' }, svg); for (let i = 0; i < 46; i++) { const x = Math.random() * (VW + 80), y = Math.random() * VH; sv('line', { x1: x, y1: y, x2: x - 14, y2: y + 26, style: `animation-delay:${(-Math.random()).toFixed(2)}s` }, rain); } }
    const segEl = new Map();
    const drawRope = (g, fresh) => {
      const a = L.at[g.a], b = L.at[g.b], grp = sv('g', { class: 'kn-rope' + (fresh ? ' fresh' : '') }, ropeG);
      sv('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '#2a1c0e', 'stroke-width': 6, 'stroke-linecap': 'round' }, grp);
      sv('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: fresh ? '#f1e6c8' : '#c69f62', 'stroke-width': 3.6, 'stroke-linecap': 'round' }, grp);
      sv('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: fresh ? '#fffaf0' : '#e2c48c', 'stroke-width': 1.3, 'stroke-dasharray': '2.5 3', opacity: .9 }, grp);
      segEl.set(g, grp);
    };
    L.segs.forEach(g => { if (!g.missing) drawRope(g); });
    /* faint guide of what is gone */
    miss.forEach(g => { const a = L.at[g.a], b = L.at[g.b]; g.ghost = sv('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'kn-ghost' }, ghostG); });
    const attached = n => L.segs.some(g => !g.missing && (g.a === n.id || g.b === n.id));
    const openFrom = n => miss.filter(g => g.missing && (g.a === n.id || g.b === n.id));
    const other = (g, n) => L.at[g.a === n.id ? g.b : g.a];
    const knotEl = new Map();
    const drawKnots = () => {
      knotG.innerHTML = ''; fxG.querySelectorAll('.kn-fray').forEach(e => e.remove());
      L.nodes.forEach(n => {
        if (n.x < -10 || n.x > VW + 10 || n.y < -10 || n.y > VH + 10 || !attached(n)) return;
        const live = openFrom(n).length > 0;
        if (live) { sv('circle', { cx: n.x, cy: n.y, r: 15, fill: 'url(#knGlow)', class: 'kn-live' }, knotG);
          openFrom(n).forEach(g => { const o = other(g, n), dx = o.x - n.x, dy = o.y - n.y, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
            sv('path', { d: `M${n.x} ${n.y} l${ux * 7 - uy * 2} ${uy * 7 + ux * 2} M${n.x} ${n.y} l${ux * 6 + uy * 3} ${uy * 6 - ux * 3}`, class: 'kn-fray' }, fxG); }); }
        const k = sv('circle', { cx: n.x, cy: n.y, r: n.fresh ? 4.4 : 3.6, fill: n.fresh ? '#f6ecd2' : '#7a5530', stroke: '#24170b', 'stroke-width': 1.4, 'data-n': n.id, class: live ? 'kn-k live' : 'kn-k' }, knotG);
        knotEl.set(n.id, k);
      });
    };
    drawKnots();
    const cord = sv('path', { class: 'kn-cord', d: '' }, fxG);
    const ring = sv('circle', { class: 'kn-ring', r: 20, cx: -99, cy: -99 }, fxG);
    const ringP = sv('circle', { class: 'kn-ringp', r: 20, cx: -99, cy: -99, 'stroke-dasharray': '0 999' }, fxG);
    const arrow = sv('path', { class: 'kn-arrow', d: '' }, fxG);
    const wrapsNeed = lv >= 3 ? 1 : 2, pullWin = 380 + lv * 70, tol = 9 + lv * 1.6 - (storm ? 1.5 : 0);
    const total = miss.length;
    let doneN = 0, snags = 0, state = 'drag', from = null, at = null, wrapA = 0, lastA = null, pull0 = null, cand = [];
    const count = () => { f.q('.g-count').textContent = tx(T(`Strands ${doneN} / ${total}`, `الخيوط ${doneN} / ${total}`)); f.q('.kn-bar.me i').style.width = (doneN / total * 100) + '%'; f.box.dataset.state = state; f.box.dataset.done = doneN; };
    count();
    /* Elias races you, pretending not to */
    /* in the storm the top bar is the sea: when it is full, the net is gone */
    const elT = storm ? total * (6400 + lv * 350) : total * (5600 - lv * 150), t0 = performance.now(); let elDone = false;
    const tick = () => { if (sh.isOver()) return; const now = performance.now(), k = Math.min(1, (now - t0) / elT); f.q('.kn-bar.el i').style.width = (k * 100) + '%';
      if (storm && state !== 'done') { OX = Math.sin(now / 640) * 7 + Math.sin(now / 230) * 1.6; OY = Math.cos(now / 860) * 4; netG.setAttribute('transform', `translate(${OX.toFixed(2)} ${OY.toFixed(2)})`); }
      if (k >= 1 && !elDone) { elDone = true; f.q('.kn-race').classList.add('elias-won'); if (storm && state !== 'done') { lost(); return; } } requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const pt = ev => { const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 }; const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; const q2 = p.matrixTransform(m.inverse()); return { x: q2.x - OX, y: q2.y - OY }; };
    const distSeg = (p, a, b) => { const vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy; let t = ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2; t = Math.max(0, Math.min(1, t)); return Math.hypot(p.x - a.x - t * vx, p.y - a.y - t * vy); };
    const nearLive = p => { let best = null, bd = 22; L.nodes.forEach(n => { if (!attached(n) || !openFrom(n).length) return; const d = Math.hypot(p.x - n.x, p.y - n.y); if (d < bd) { bd = d; best = n; } }); return best; };
    const showRing = n => { ring.setAttribute('cx', n.x); ring.setAttribute('cy', n.y); ringP.setAttribute('cx', n.x); ringP.setAttribute('cy', n.y); ringP.setAttribute('stroke-dasharray', '0 999'); };
    const hideRing = () => { [ring, ringP].forEach(e => { e.setAttribute('cx', -99); e.setAttribute('cy', -99); }); arrow.setAttribute('d', ''); };
    const snag = p => {
      snags++; state = 'drag'; from = null; cord.classList.add('snag'); blip(150, 0.18, 0.22, 'sawtooth'); rec('creak3', 0.35, 1.4);
      const b = sv('circle', { cx: p.x, cy: p.y, r: 6, class: 'kn-snag' }, fxG); setTimeout(() => b.remove(), 600);
      f.hint(T('Snagged on the old mesh. Keep to the line.', 'الخيط علق بالشبك القديم. {خلك|خليك} على الخط.'));
      setTimeout(() => { cord.classList.remove('snag'); cord.setAttribute('d', ''); }, 260); count();
    };
    const sag = (a, p) => { const mx = (a.x + p.x) / 2, my = (a.y + p.y) / 2 + Math.min(10, Math.hypot(p.x - a.x, p.y - a.y) * 0.18); return `M${a.x} ${a.y} Q${mx} ${my} ${p.x} ${p.y}`; };
    let down = false;
    svg.addEventListener('pointerdown', ev => {
      if (sh.isOver()) return; ev.preventDefault(); const p = pt(ev); down = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* none */ }
      if (state === 'drag') { const n = nearLive(p); if (n) { from = n; cand = openFrom(n); blip(660, 0.05, 0.08); } }
      else if (state === 'wrap') { lastA = Math.atan2(p.y - at.y, p.x - at.x); }
      else if (state === 'pull') { pull0 = { p, t: performance.now() }; }
    });
    svg.addEventListener('pointermove', ev => {
      if (!down || sh.isOver()) return; const p = pt(ev);
      if (state === 'drag' && from) {
        cord.setAttribute('d', sag(from, p));
        const off = Math.min(...cand.map(g => distSeg(p, from, other(g, from))));
        if (off > tol && Math.hypot(p.x - from.x, p.y - from.y) > 8) { snag(p); return; }
        for (const g of cand) { const o = other(g, from); if (Math.hypot(p.x - o.x, p.y - o.y) < 9) {
          /* reached: the strand lies across, now it has to be knotted */
          g.missing = false; g.ghost.remove(); drawRope(g, true); segEl.get(g).classList.add('loose');
          cord.setAttribute('d', ''); at = o; at.fresh = true; from = null; state = 'wrap'; wrapA = 0; lastA = Math.atan2(p.y - at.y, p.x - at.x); at.seg = g;
          showRing(at); drawKnots(); blip(520, 0.08, 0.12, 'triangle');
          f.hint(T('Wrap it: draw circles around the knot.', '{لف|لفي} الخيط: {ارسم|ارسمي} دواير حول العقدة.')); count(); return; } }
      } else if (state === 'wrap' && at) {
        const d = Math.hypot(p.x - at.x, p.y - at.y); if (d < 5 || d > 60) return;
        const a = Math.atan2(p.y - at.y, p.x - at.x); if (lastA !== null) { let da = a - lastA; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; wrapA += Math.abs(da);
          const before = Math.floor((wrapA - Math.abs(da)) / (Math.PI / 2)), after = Math.floor(wrapA / (Math.PI / 2)); if (after > before) blip(300 + after * 40, 0.04, 0.07); }
        lastA = a; const need = wrapsNeed * 2 * Math.PI, k = Math.min(1, wrapA / need), C = 2 * Math.PI * 20;
        ringP.setAttribute('stroke-dasharray', `${k * C} ${C}`);
        if (k >= 1) { state = 'pull'; pull0 = null; const pv = at.seg ? other(at.seg, at) : at, dx = at.x - pv.x, dy = at.y - pv.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
          at.pullDir = { x: ux, y: uy }; arrow.setAttribute('d', `M${at.x + ux * 12} ${at.y + uy * 12} l${ux * 26} ${uy * 26} m${-ux * 8 - uy * 6} ${-uy * 8 + ux * 6} l${ux * 8 + uy * 6} ${uy * 8 - ux * 6} l${-ux * 8 + uy * 6} ${-uy * 8 - ux * 6}`);
          f.hint(T('Now pull it tight: one quick flick along the arrow.', 'الحين {شدها|شديها}: سحبة سريعة مع السهم.')); count(); pull0 = { p, t: performance.now() }; }
      } else if (state === 'pull' && at && pull0) {
        const dx = p.x - pull0.p.x, dy = p.y - pull0.p.y, along = dx * at.pullDir.x + dy * at.pullDir.y, dt = performance.now() - pull0.t;
        if (along > 30) {
          if (dt <= pullWin) {
            /* tight */
            segEl.get(at.seg).classList.remove('loose'); doneN++; hideRing(); rec('creak1', 0.4, 1.6); blip(784, 0.12, 0.14, 'triangle');
            const pop = sv('circle', { cx: at.x, cy: at.y, r: 5, class: 'kn-pop' }, fxG); setTimeout(() => pop.remove(), 500);
            state = 'drag'; at = null; drawKnots(); gain('skHands', 1, GAME.SKILLS.hands); count();
            if (doneN >= total) { finishAll(); return; }
            f.hint(pickOne([T('Tight. Next strand.', 'مشدودة. الخيط الجاي.'), T('Good knot. Keep going.', 'عقدة زينة. {كمّل|كمّلي}.'), T('That one will hold a cod.', 'هذي تشيل سمكة كبيرة.')]));
          } else { pull0 = { p, t: performance.now() }; blip(220, 0.1, 0.12); f.hint(T('Too slow, it stays loose. Flick it!', 'بطيء، ظلت رخوة. {اسحبها|اسحبيها} بسرعة!')); }
        }
      }
    });
    const up = () => { down = false; if (state === 'drag' && from) { from = null; cord.setAttribute('d', ''); } if (state === 'pull') pull0 = null; };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    function lost() {
      state = 'done'; count(); cord.setAttribute('d', ''); hideRing(); rec('wave1', 0.6); f.box.classList.add('lost');
      f.hint(T('A wave lifts the rail and the net slides away into the dark.', 'موجة ترفع الحافة والشبكة تنزلق للظلام.'));
      setTimeout(() => sh.finish({ storm: true, ok: false, n: doneN, total }), 1600);
    }
    function finishAll() {
      state = 'done'; count(); const won = !elDone;
      if (storm) { f.hint(T('The tear is closed. The net holds.', 'الشق انسكر. الشبكة ماسكة.')); ghostG.innerHTML = ''; setTimeout(() => sh.finish({ storm: true, ok: true, snags }), 1300); return; }
      f.hint(won ? T('Closed, before Elias. He pretends not to notice.', 'انسكرت قبل إلياس. يسوي نفسه ما انتبه.') : T('Closed. Elias finished first, but he waited.', 'انسكرت. إلياس خلص قبلك، بس انتظرك.'));
      ghostG.innerHTML = ''; setTimeout(() => sh.finish(won && snags <= 2 ? 2 : 1), 1300);
    }
  };

  /* ================= chess ================= */
  /* positions from "Elias's old games": white to move, one move wins. Board as rows 8..1, files a..h.
     K Q R B N P = white, k q r b n p = black. */
  const PUZ = [
    { b: ['......k.', '.....ppp', '........', '........', '........', '........', '.....PPP', 'R.....K.'], ans: ['a1a8'],
      say: T('My father showed me this one. The back rank. Everybody forgets the back rank.', 'أبوي وراني هذي. الصف الأخير. الكل ينسى الصف الأخير.') },
    { b: ['rnbqkb.r', 'pppp.ppp', '.....n..', '....p..Q', '..B.P...', '........', 'PPPP.PPP', 'RNB.K.NR'], ans: ['h5f7'],
      say: T('The oldest trick there is. Marco fell for it in 1989. And 1990.', 'أقدم حيلة بالدنيا. ماركو طاح فيها سنة ٨٩. و٩٠.') },
    { b: ['......rk', '......pp', '........', '......N.', '........', '........', '........', '....K...'], ans: ['g5f7'],
      say: T('His own men around him like a wall. And the wall is what kills him.', 'رجاله حوله مثل الجدار. والجدار نفسه هو اللي يقتله.') },
    { b: ['k.......', '........', '.K......', '........', '........', '........', '........', '.......R'], ans: ['h1h8'],
      say: T('Two pieces against one. Slow, patient, then all at once.', 'قطعتين ضد وحدة. بشويش، وبصبر، وبعدين مرة وحدة.') },
    { b: ['.......k', 'Q.......', '......K.', '........', '........', '........', '........', '........'], ans: ['a7g7', 'a7h7', 'a7a8', 'a7b8'],
      say: T('The king walks up to help the queen. Even kings have to work, in the end.', 'الملك يمشي يساعد الوزير. حتى الملوك لازم يشتغلون، بالأخير.') },
    { b: ['......k.', '.r...ppp', '........', '........', '........', '........', '.....PPP', '...Q..K.'], ans: ['d1d8'],
      say: T('Same trick as the first night. You\'d be amazed how often it works.', 'نفس حيلة أول ليلة. {بتنصدم|بتنصدمين} كم مرة تنفع.') }
  ];
  const GLYPH = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  GAME.MINI.chessPuzzle = function (panel, done, stp) {
    panel.innerHTML = '';
    const s = S(), idx = (s.f.chessPuz || 0) % PUZ.length, P = PUZ[idx], help = !!(stp && stp.help);
    /* once his memory starts to go, the positions are his and he can no longer see them: you find the move for him */
    const f = card('cp-chess' + (help ? ' help' : ''), T('Chess with Elias', 'شطرنج مع إلياس'), help ? T('He stares at the board. He knows there is a move. He can\'t find it.', 'يطالع اللوحة. يدري إن فيه نقلة. وما يلقاها.') : T('"Your move. One move wins it."', '«دورك. نقلة وحدة وتفوز.»'));
    const sh = shell(f, done, 1);
    f.q('.g-skill').textContent = '♟ ' + skillOf('skMind');
    const board = el('div', 'ch-board'); f.area.appendChild(board);
    const side = el('div', 'ch-side'); side.innerHTML = '<img src="img/chars/elias-' + (help ? 'sad' : 'smile') + '.webp" alt="">'; f.area.appendChild(side);
    const grid = P.b.map(r => r.split(''));
    const files = 'abcdefgh';
    const sq = {};
    let sel = null, tries = 0;
    const draw = () => {
      board.innerHTML = '';
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const name = files[c] + (8 - r), d = el('button', 'ch-sq ' + ((r + c) % 2 ? 'dk' : 'lt')); d.type = 'button'; d.dataset.sq = name;
        const p = grid[r][c]; if (p !== '.') { d.textContent = GLYPH[p] + '\uFE0E'; d.classList.add(p === p.toUpperCase() ? 'w' : 'b'); }
        if (sel === name) d.classList.add('sel');
        d.onclick = ev => { ev.stopPropagation(); tap(name, r, c); };
        board.appendChild(d); sq[name] = d;
      }
    };
    const at = name => { const c = files.indexOf(name[0]), r = 8 - Number(name[1]); return { r, c, p: grid[r][c] }; };
    function tap(name) {
      if (sh.isOver()) return;
      const a = at(name);
      if (!sel) { if (a.p !== '.' && a.p === a.p.toUpperCase()) { sel = name; blip(880, 0.05, 0.08); draw(); } return; }
      if (name === sel) { sel = null; draw(); return; }
      if (a.p !== '.' && a.p === a.p.toUpperCase()) { sel = name; draw(); return; }
      const mv = sel + name;
      if (P.ans.includes(mv)) {
        const from = at(sel); grid[a.r][a.c] = grid[from.r][from.c]; grid[from.r][from.c] = '.'; sel = null; draw();
        sq[name].classList.add('mate'); blip(523, 0.2, 0.2, 'triangle'); setTimeout(() => blip(784, 0.3, 0.2, 'triangle'), 150);
        f.hint(T('Checkmate.', 'كش مات.'));
        s.f.chessPuz = idx + 1; gain('skMind', 3, GAME.SKILLS.mind);
        setTimeout(() => sh.finish({ win: true, say: P.say, help }), 1300);
      } else {
        tries++; sel = null; draw(); sq[name].classList.add('no'); blip(180, 0.2, 0.2, 'sawtooth');
        if (tries >= 3) {
          if (help) f.hint(T('Neither of you can find it. He starts putting the pieces away, very carefully.', 'ولا واحد فيكم لقاها. يبدأ يرجع القطع لعلبتها، بعناية مرة.'));
          else f.hint(T('Elias shows you. "There. See it now?"', 'إلياس يوريك. «هنا. {شفتها|شفتيها} الحين؟»'));
          const [fr, to] = [P.ans[0].slice(0, 2), P.ans[0].slice(2)];
          if (!help) setTimeout(() => { sq[fr] && sq[fr].classList.add('sel'); sq[to] && sq[to].classList.add('mate'); }, 200);
          s.f.chessPuz = idx + 1; gain('skMind', 1, GAME.SKILLS.mind);
          setTimeout(() => sh.finish({ win: false, say: P.say, help }), 2200);
        } else f.hint(help ? (tries === 1 ? T('"No... no, that\'s not it." His hand hovers over the board.', '«لا... لا، مو هذي.» يده معلقة فوق اللوحة.') : T('"It\'s right there. I know it\'s right there."', '«هي هنا. أدري إنها هنا.»'))
          : tries === 1 ? T('Elias raises an eyebrow. "Look again."', 'إلياس يرفع حاجبه. «{طالع|طالعي} زين.»') : T('"Last try. Where is his king weak?"', '«آخر محاولة. وين ملكه ضعيف؟»'));
      }
    }
    draw();
  };

  /* ---------- in the story: the game first, then the same scene as before ---------- */
  /* the hands-on part sits inside the old scene: the first time after Elias shows you the knot, later at the start;
     the chess position comes after the game itself, before the clock moves */
  const nets0 = GAME.SCRIPTS.nets;
  GAME.SCRIPTS.nets = s => {
    const steps = nets0(s), first = s.f.netsCount === 1;
    const m = { mini: 'knot', then: r => first ? null : r === 2 ? [N_('Not one slip. Elias checks every knot, twice, and says nothing, which from him is applause.', 'ولا غلطة. إلياس يفحص كل عقدة، مرتين، وما يقول شي، وهذا منه تصفيق.')]
      : r === 1 ? [N_('The hole is closed. One knot is a bit lumpy. Elias leaves it, which is a kind of trust.', 'الفتحة انسكرت. عقدة وحدة شوي معوجة. إلياس يخليها، وهذا نوع من الثقة.')] : null };
    steps.splice(first ? 2 : 0, 0, m); return steps;
  };
  const chess0 = GAME.SCRIPTS.chess;
  GAME.SCRIPTS.chess = s => {
    const steps = chess0(s), help = (s.f.chessCount || 0) >= 2, last = steps.length && steps[steps.length - 1] && steps[steps.length - 1].time ? steps.length - 1 : steps.length;
    steps.splice(last, 0,
      ...(help ? [
        N_('Later, when Marco has gone, Elias sets up a position from one of his old games. He has done this a hundred times. He looks at it for a long while.', 'بعدين، لما يروح ماركو، إلياس يرتب وضعية من لعباته القديمة. سواها مية مرة. ويطالعها وقت طويل.'),
        E('sad', 'One move wins it. I know this one. I know it.', 'نقلة وحدة وتفوز. أعرف هذي. أعرفها.')
      ] : [E('neutral', 'One more. Not a game, a position. One of my old ones. One move wins it.', 'وحدة بعد. مو لعبة، وضعية. من لعباتي القديمة. نقلة وحدة وتفوز.')]),
      { mini: 'chessPuzzle', help, then: r => {
        if (!r || !r.say) return null;
        s.f.chessHelped = (s.f.chessHelped || 0) + (r.help && r.win ? 1 : 0);
        if (r.help) return r.win ? [N_('You move the piece. He looks at it, and then all at once his face clears, like a window someone has wiped.', '{تحرك|تحركين} القطعة. يطالعها، وفجأة وجهه يصفى، مثل شباك أحد مسحه.'),
          E('shock', 'That\'s it. That\'s it!', 'هذي هي. هذي هي!'), { c: 'elias', e: 'sad', t: r.say },
          E('sad', 'Keep hold of that one for me. In case.', '{خلها عندك|خليها عندك} لي. احتياط.')]
          : [E('neutral', 'Another night. My head\'s full of tea.', 'ليلة ثانية. راسي مليان شاهي.'), N_('He closes the box and keeps his hand flat on the lid for a moment, as if something might get out.', 'يسكر العلبة ويخلي يده على الغطا لحظة، كأن شي ممكن يطلع.')];
        return [r.win ? E('smile', 'Ha! Good. Good.', 'ها! زين. زين.') : E('neutral', 'Next time.', 'المرة الجاية.'), { c: 'elias', e: 'neutral', t: r.say }];
      } });
    return steps;
  };
  window.MINIKIT = { card, shell, skillOf, gain, LV, blip, rec, wait };   /* shared with other little games (js/clinic.js) */
})();
