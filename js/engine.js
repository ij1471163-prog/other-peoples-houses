/* =====================================================================
   Other People's Houses — engine
   Data-driven point-and-click story engine:
   locations (with hotspots and exits), characters (with schedules),
   dialogue scripts (lines, menus, conditions, effects), time of day,
   stats, inventory, quests, events, phone menu, map, autosave, AR/EN.
   ===================================================================== */
'use strict';

/* ---------- text ---------- */
const T = (en, ar) => ({ en, ar });
const GAME = { lang: 'en', S: null, LOC: {}, CHAR: {}, TOPICS: {}, EVENTS: [], END: {}, QUESTS: {}, ITEMS: {}, UI: {}, H: {} };
try { const l = localStorage.getItem('oph.lang'); if (l === 'en' || l === 'ar') GAME.lang = l; else if ((navigator.language || '').startsWith('ar')) GAME.lang = 'ar'; } catch (e) {}

/* tx: picks the language, fills {name}, and resolves {male|female} gender markers */
function tx(o) {
  if (o == null) return '';
  if (typeof o === 'function') o = o(GAME.S);
  let s = typeof o === 'string' ? o : (o[GAME.lang] ?? o.en ?? '');
  const S = GAME.S;
  s = s.replace(/\{name\}/g, S && S.name ? S.name : '');
  s = s.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => (S && S.gender === 'f') ? f : m);
  return s;
}
const UI = k => tx(GAME.UI[k]);

/* ---------- state ---------- */
const SLOTS = ['morning', 'noon', 'afternoon', 'evening', 'night'];
const NIGHT = 4;
const WEEK = [T('Sunday', 'الأحد'), T('Monday', 'الإثنين'), T('Tuesday', 'الثلاثاء'), T('Wednesday', 'الأربعاء'), T('Thursday', 'الخميس'), T('Friday', 'الجمعة'), T('Saturday', 'السبت')];
const weekday = d => d % 7;
function newState() {
  return {
    v: 4, ch: 1, lessons: [], name: '', gender: 'm', day: 0, slot: 4, loc: 'station', money: 3,
    mood: 2, fear: 0, conscience: 0, inv: {}, f: {}, trust: {}, susp: {}, quests: {}, once: {}, ends: [],
    dayDone: {}, met: {}, need: { food: 60, clean: 50, energy: 60 }, done: {}, host: 'elias', lru: {}
  };
}
const S = () => GAME.S;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const roll = p => Math.random() < p;
function addMood(d) { const s = S(); s.mood = clamp(s.mood + d, 0, 10); }
function addTrust(c, d) { const s = S(); s.trust[c] = clamp((s.trust[c] || 0) + d, -5, 12); if (d > 0) toast(tx(T('+ Trust · ', '+ ثقة · ')) + tx(GAME.CHAR[c].name)); if (d < 0) toast(tx(T('− Trust · ', '− ثقة · ')) + tx(GAME.CHAR[c].name)); }
function addSusp(c, d) { const s = S(); s.susp[c] = clamp((s.susp[c] || 0) + d, 0, 5); }
function give(item, n = 1) { const s = S(); s.inv[item] = (s.inv[item] || 0) + n; if (n > 0) toast('+ ' + tx(GAME.ITEMS[item].name)); }
function take(item, n = 1) { const s = S(); s.inv[item] = Math.max(0, (s.inv[item] || 0) - n); }
function has(item) { return (S().inv[item] || 0) > 0; }
function pay(n) { const s = S(); if (s.money < n) return false; s.money -= n; return true; }
function quest(id, st) { const s = S(); const cur = s.quests[id]; if (cur === st) return; if (cur === 'done') return; s.quests[id] = st; toast((st === 'done' ? tx(T('Done: ', 'تم: ')) : tx(T('New: ', 'جديد: '))) + tx(GAME.QUESTS[id].title)); }
function flag(k) { return !!S().f[k]; }
function setFlag(k, v = true) { S().f[k] = v; }
function onceToday(k) { const s = S(); const key = k + '@' + s.day; if (s.once[key]) return false; s.once[key] = 1; return true; }
function doneToday(k) { return !!S().once[k + '@' + S().day]; }

/* needs: food, clean, energy (0-100). They fall as time passes; looking after them lifts your mood. */
function needs() { const s = S(); s.need = s.need || { food: 60, clean: 50, energy: 60 }; return s.need; }
function feed(n) { const nd = needs(); nd.food = clamp(nd.food + n, 0, 100); }
function wash() { needs().clean = 100; }
function rest(n) { const nd = needs(); nd.energy = clamp(nd.energy + n, 0, 100); }
function lowNeeds() { const nd = needs(); const out = []; if (nd.food < 25) out.push('hungry'); if (nd.clean < 25) out.push('grubby'); if (nd.energy < 20) out.push('tired'); return out; }

/* anti-repetition: picks an item not used recently for this key; resets once all have been used */
function fresh(key, arr) {
  const s = S(); s.lru = s.lru || {};
  let used = s.lru[key] || [];
  if (used.length >= arr.length) used = [];
  const free = arr.map((_, i) => i).filter(i => !used.includes(i));
  const i = free[Math.floor(Math.random() * free.length)];
  s.lru[key] = used.concat([i]);
  return arr[i];
}

/* time */
function slotName() { return SLOTS[S().slot]; }
function advance(n = 1) {
  const s = S(); const nd = needs();
  for (let i = 0; i < n; i++) { nd.food = clamp(nd.food - 9, 0, 100); nd.clean = clamp(nd.clean - 5, 0, 100); nd.energy = clamp(nd.energy - 8, 0, 100); }
  s.slot += n;
  while (s.slot > 4) { s.slot -= 5; s.day++; s.f.newDay = true; dayStartNeeds(); }
}
function sleepToMorning() { const s = S(); s.day++; s.slot = 0; s.f.newDay = true; const nd = needs(); nd.energy = 100; nd.food = clamp(nd.food - 15, 0, 100); nd.clean = clamp(nd.clean - 10, 0, 100); dayStartNeeds(); }
/* "once today" marks only matter for the current day; drop older ones so the save doesn't grow forever */
function pruneOnce() { const s = S(); if (!s || !s.once) return; for (const k of Object.keys(s.once)) { const d = +k.slice(k.lastIndexOf('@') + 1); if (d < s.day) delete s.once[k]; } }
function dayStartNeeds() { pruneOnce(); const nd = needs(); let pen = 0; if (nd.food < 25) pen++; if (nd.clean < 20) pen++; if (pen) addMood(-Math.min(2, pen)); if (nd.food >= 60 && nd.clean >= 60) addMood(1); }

/* ---------- save ---------- */
function save() { try { localStorage.setItem('oph.save', JSON.stringify(GAME.S)); } catch (e) {} }
function loadSave() { try { const j = localStorage.getItem('oph.save'); return j ? upgrade(JSON.parse(j)) : null; } catch (e) { return null; } }
function upgrade(sv) { const base = newState(); const o = Object.assign(base, sv); o.need = Object.assign({ food: 60, clean: 50, energy: 60 }, sv.need || {}); o.done = o.done || {}; o.lru = o.lru || {}; if (o.host === undefined) o.host = o.ch === 2 ? 'leo' : 'elias'; if (!GAME.LOC[o.loc]) o.loc = 'street'; if (o.f && o.f.metElias && !o.inv.postcard && GAME.ITEMS.postcard) o.inv.postcard = 1; o.money = Number(o.money) || 0; o.mood = clamp(Number(o.mood) || 0, 0, 10); return o; }
function slotKey(i) { return 'oph.slot' + i; }
function saveSlot(i) { try { const s = S(); const meta = { day: s.day, slot: s.slot, loc: s.loc, name: s.name, when: Date.now() }; localStorage.setItem(slotKey(i), JSON.stringify({ meta, state: s })); toast(tx(T('Saved to slot ', 'انحفظ في الخانة ')) + i); } catch (e) { toast(tx(T('Could not save on this device.', 'ما قدرت أحفظ على هالجهاز.'))); } }
function readSlot(i) { try { const j = localStorage.getItem(slotKey(i)); return j ? JSON.parse(j) : null; } catch (e) { return null; } }
function loadSlot(i) { const r = readSlot(i); if (!r) return false; GAME.S = upgrade(r.state); VIEW.sheet = null; RUN = null; resumeState(); return true; }
/* resume: if the save was made on an ending card, carry on from where the story continues */
function resumeState() { const s = S(); const pn = s.f.pendingNext; if (pn && GAME.SCRIPTS[pn]) { s.f.pendingNext = null; play(GAME.SCRIPTS[pn](s)); return; } if (s.f.pendingFinal) { s.f.pendingFinal = false; play(GAME.SCRIPTS.sandboxStart(s)); return; } afterScript(); }
function slotLabel(i) { const r = readSlot(i); if (!r) return tx(T('Slot ', 'خانة ')) + i + ' · ' + tx(T('empty', 'فاضية')); const m = r.meta; return tx(T('Slot ', 'خانة ')) + i + ' · ' + (m.name || '') + ' · ' + tx(WEEK[weekday(m.day)]) + ' ' + tx(GAME.UI['t_' + SLOTS[m.slot]]) + ' · ' + tx((GAME.LOC[m.loc] || {}).name || ''); }
function seenEnds() { try { return JSON.parse(localStorage.getItem('oph.ends') || '[]'); } catch (e) { return []; } }
function markEnd(id) { try { const a = new Set(seenEnds()); a.add(id); localStorage.setItem('oph.ends', JSON.stringify([...a])); } catch (e) {} }

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
/* replace a layer's markup only when it changed; remembers what it holds in _k */
function setLayer(node, html) { if (node._k === html) return; node.innerHTML = html; node._k = html; }
/* one action per tap: a second tap within 250 ms (a double tap, a bouncy finger) is ignored */
let TAP_AT = 0;
function tapOk(ev) { if (ev && ev.isTrusted === false) return true; const t = performance.now(); if (t - TAP_AT < 250) return false; TAP_AT = t; return true; }
function toast(msg) { const st = $('stage'); if (!st) return; const t = el('div', 'toast', msg); st.appendChild(t); setTimeout(() => t.remove(), 2300); }

/* ---------- presence ---------- */
function present(locId) {
  const out = [];
  for (const [id, c] of Object.entries(GAME.CHAR)) {
    if (!c.where) continue;
    const w = c.where(S());
    if (w === locId) out.push(id);
  }
  return out;
}
function houseOf(locId) { return GAME.LOC[locId] && GAME.LOC[locId].house; }
function atHouse(charId, house) { const w = GAME.CHAR[charId].where && GAME.CHAR[charId].where(S()); return !!w && houseOf(w) === house; }

/* daily life (js/life.js): an icon for what someone is doing right now; empty if unknown */
const lifeIcon = id => (typeof LIFE !== 'undefined' ? LIFE.icon(id) : '');

/* ---------- script runner ---------- */
let RUN = null;           // {stack:[{steps,i}], done}
let VIEW = { sheet: null, tab: 'quests', speaker: null, expr: null, stageChars: null };
/* display preferences, kept on this device: text size and whether object names are always shown */
const PREFS = (() => { let p = { text: 'm', labels: 'always' };
  try { Object.assign(p, JSON.parse(localStorage.getItem('oph.prefs') || '{}')); } catch (e) {}
  return { get: k => p[k], set(k, v) { p[k] = v; try { localStorage.setItem('oph.prefs', JSON.stringify(p)); } catch (e) {} applyPrefs(); } }; })();
function applyPrefs() {
  const h = document.documentElement; h.classList.remove('ts-s', 'ts-l'); if (PREFS.get('text') !== 'm') h.classList.add('ts-' + PREFS.get('text'));
  document.body.classList.toggle('lbl-tap', PREFS.get('labels') === 'tap');
}

function play(steps, done) {
  document.body.classList.remove('explore', 'titlemode');
  RUN = { stack: [{ steps: steps.slice(), i: 0 }], done };
  next();
}
function next() {
  while (RUN) {
    const top = RUN.stack[RUN.stack.length - 1];
    if (!top) { const d = RUN.done; RUN = null; VIEW.speaker = null; if (d) d(); else afterScript(); return; }
    if (top.i >= top.steps.length) { RUN.stack.pop(); continue; }
    const st = top.steps[top.i++];
    if (st == null) continue;
    if (typeof st === 'function') { const r = st(S()); if (Array.isArray(r)) RUN.stack.push({ steps: r, i: 0 }); continue; }
    if (st.if) { const ok = st.if(S()); const br = ok ? st.then : st.else; if (br) RUN.stack.push({ steps: br, i: 0 }); continue; }
    if (st.do) { const r = st.do(S()); if (Array.isArray(r)) RUN.stack.push({ steps: r, i: 0 }); continue; }
    if (st.go) { S().loc = st.go; VIEW.stageChars = null; continue; }
    if (st.time) { advance(st.time); continue; }
    if (st.end) { showEnding(st.end); return; }
    if (st.show !== undefined) { VIEW.stageChars = st.show; continue; }
    if (st.sfx && !st.n && !st.t) { AUDIO.sfx(st.sfx); continue; }
    if (st.scare) scare(st.scare);
    if (st.n || st.t) { renderLine(st); return; }
    if (st.menu) { renderMenu(st); return; }
    if (st.jump) { const sc = GAME.SCRIPTS[st.jump]; RUN.stack.push({ steps: typeof sc === 'function' ? sc(S()) : sc, i: 0 }); continue; }
    if (st.mini) { renderMini(st); return; }
  }
}

/* after a script ends: check events, then show the location */
function afterScript() { save(); if (!checkEvents()) renderLocation(); }
function checkEvents() {
  for (const ev of GAME.EVENTS) {
    if (ev.once && S().f['ev_' + ev.id]) continue;
    if (ev.when(S())) {
      if (ev.once) S().f['ev_' + ev.id] = true;
      play(typeof ev.run === 'function' ? ev.run(S()) : ev.run);
      return true;
    }
  }
  return false;
}
function goTo(locId) {
  S().loc = locId; VIEW.stageChars = null;
  const L = GAME.LOC[locId];
  if (L.onEnter) { const r = L.onEnter(S()); if (Array.isArray(r) && r.length) { play(r); return; } }
  for (const h of (GAME.ENTER_HOOKS || [])) { const r = h(S()); if (Array.isArray(r) && r.length) { play(r); return; } }
  afterScript();
}
/* mini-games: GAME.MINI[name](panel, done) renders into the panel and calls done(result) */
function renderMini(st) {
  const panel = $('panel'); panel.innerHTML = ''; panel.onclick = null; renderStage(); $('stage').onclick = null;
  GAME.MINI[st.mini](panel, res => { const r = st.then ? st.then(res, S()) : null; if (Array.isArray(r)) RUN.stack.push({ steps: r, i: 0 }); next(); }, st);
}

/* ---------- rendering ---------- */
function renderStage(charsOverride) {
  const s = S(), L = GAME.LOC[s.loc];
  const st = $('stage');
  const time = slotName();
  /* background: only rebuilt when it actually changes (a dialogue line used to re-parse the whole scene) */
  setLayer(st.querySelector('.bg'), ART.bg(L.bg, time, s));
  st.querySelector('.tint').style.background = ART.tint(L.bg, time);
  // characters
  const layer = st.querySelector('.chars');
  let list = charsOverride || VIEW.stageChars || present(s.loc).map(id => ({ id }));
  list = list.filter(c => c && GAME.CHAR[c.id] && GAME.CHAR[c.id].art);
  const n = list.length;
  const cast = list.map((c, i) => ({ id: c.id, x: n === 1 ? (L.charX || 62) : 30 + (i * 40) / Math.max(1, n - 1),
    expr: (VIEW.speaker === c.id && VIEW.expr) ? VIEW.expr : (c.e || 'neutral'), dim: !!(VIEW.speaker && VIEW.speaker !== c.id) }));
  const key = JSON.stringify([cast.map(c => [c.id, c.x, c.expr, lifeIcon(c.id)]), !!RUN, GAME.lang, PEOPLE.IMG.v || 0]);
  if (layer._k === key) {
    /* same people, same faces: just move the spotlight to whoever is talking (no re-entry animation, no image reload) */
    [...layer.children].forEach((d, i) => d.classList.toggle('dim', cast[i].dim));
  } else {
    layer.innerHTML = ''; layer._k = key;
    cast.forEach(c => {
      const d = el('div', 'char' + (c.dim ? ' dim' : '') + (GAME.CHAR[c.id].ghost ? ' ghost' : ''));
      d.style.left = c.x + '%';
      d.innerHTML = ART.portrait(c.id, c.expr);
      const hh = GAME.CHAR[c.id].height; if (hh && PEOPLE.IMG.chars[c.id]) d.style.setProperty('--h', hh);
      if (!RUN && !GAME.CHAR[c.id].ghost) { d.addEventListener('click', ev => { if (tapOk(ev)) talkTo(c.id); }); d.appendChild(el('span', 'tag', (lifeIcon(c.id) ? lifeIcon(c.id) + ' ' : '') + tx(GAME.CHAR[c.id].short || GAME.CHAR[c.id].name))); }
      layer.appendChild(d);
    });
  }
  // hud
  const chips = st.querySelector('.hud .chips'); chips.innerHTML = '';
  const ic = time === 'night' ? ART.ICON.moon : time === 'evening' ? ART.ICON.dusk : ART.ICON.sun;
  const tc = el('div', 'chip time'); tc.innerHTML = '<i class="ico">' + ic + '</i>' + (s.day > 0 ? '<b>' + tx(WEEK[weekday(s.day)]) + '</b> · ' : '') + tx(GAME.UI['t_' + time]);
  chips.appendChild(tc);
  chips.appendChild(Object.assign(el('div', 'chip'), { innerHTML: '$<b>' + (Number(s.money) | 0) + '</b>' }));
  if (s.day > 0) lowNeeds().forEach(k => chips.appendChild(el('div', 'chip warn', UI('need_' + k))));
  const btns = st.querySelector('.hud .btns'); btns.innerHTML = '';
  const ibtn = (icon, label, fn) => { const b = el('button', 'ibtn'); b.type = 'button'; b.innerHTML = ART.ICON[icon]; b.setAttribute('aria-label', label); b.title = label; b.onclick = ev => { ev.stopPropagation(); if (tapOk(ev)) fn(); }; btns.appendChild(b); };
  const L2 = GAME.LOC[s.loc];
  if (!RUN && !s.f.prologue && s.slot < NIGHT && L2.canWait !== false) ibtn('wait', UI('wait'), () => { advance(1); afterScript(); });
  if (!RUN && !s.f.prologue) ibtn('map', UI('map'), () => openSheet('map'));
  ibtn('bag', UI('bag'), () => { VIEW.tab = 'bag'; openSheet('phone'); });
  ibtn('phone', UI('phone'), () => { if (VIEW.tab === 'bag') VIEW.tab = 'quests'; openSheet('phone'); });
  // hotspots
  const sp = st.querySelector('.spots'); sp.innerHTML = '';
  if (!RUN && !VIEW.sheet) {
    for (const h of visibleSpots()) {
      const b = el('button', 'spot' + (h.exit ? ' exit' : '') + (h.risk && h.risk(S()) ? ' risk' : ''));
      b.type = 'button'; b.style.setProperty('--x', h.x + '%'); b.style.setProperty('--y', h.y + '%'); if (h.x > 55) b.classList.add('flip', 'flip0');
      b.appendChild(el('i')); b.appendChild(el('span', '', tx(h.label)));
      b.onclick = ev => { if (!tapOk(ev)) return;
        if (PREFS.get('labels') === 'tap' && !b.classList.contains('show')) { sp.querySelectorAll('.spot.show').forEach(o => o.classList.remove('show')); b.classList.add('show'); untangleSpots(sp); return; }
        useSpot(h); };
      sp.appendChild(b);
    }
    untangleSpots(sp);
  }
  renderSheet();
  if (typeof AUDIO !== 'undefined') AUDIO.scene(s);
}
/* labels of neighbouring spots must not sit on top of each other: first try the other side, then
   move the label up or down a little. The glowing circle itself never moves (it marks the object). */
function untangleSpots(sp) {
  const bs = [...sp.querySelectorAll('.spot')]; if (!bs.length) return;
  bs.forEach(b => { b.style.removeProperty('--ly'); b.style.removeProperty('--dy'); b.classList.toggle('flip', b.classList.contains('flip0')); });
  const box = b => b.querySelector('span').getBoundingClientRect();
  const hit = (p, q) => Math.min(p.right, q.right) - Math.max(p.left, q.left) > 2 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 2;
  const hud = [...document.querySelectorAll('#stage .hud .chip, #stage .hud .ibtn')].map(e => e.getBoundingClientRect());
  const clashes = b => hud.some(r => hit(box(b), r)) || bs.some(o => o !== b && (hit(box(b), box(o)) || hit(box(b), o.querySelector('i').getBoundingClientRect())));
  /* a circle hidden under the top bar slides down just below it */
  for (const b of bs) { const i = b.querySelector('i').getBoundingClientRect();
    const r = hud.find(r => i.right > r.left - 4 && i.left < r.right + 4 && i.top < r.bottom + 4);
    if (r) b.style.setProperty('--dy', Math.ceil(r.bottom + 6 - i.top) + 'px'); }
  for (const b of bs) {
    if (!clashes(b)) continue;
    b.classList.toggle('flip'); if (!clashes(b)) continue;
    b.classList.toggle('flip');
    const h = box(b).height + 2; let ok = false;
    for (const dy of [h, -h, 2 * h, -2 * h]) { b.style.setProperty('--ly', dy + 'px'); if (!clashes(b)) { ok = true; break; } }
    if (!ok) b.style.removeProperty('--ly');
  }
}
let _untT = 0;
window.addEventListener('resize', () => { clearTimeout(_untT); _untT = setTimeout(() => { const sp = document.querySelector('#stage .spots'); if (sp) untangleSpots(sp); placeCaption(); }, 150); });
function visibleSpots() {
  const L = GAME.LOC[S().loc]; const out = [];
  (L.spots || []).forEach(h => { if (!h.if || h.if(S())) out.push(h); });
  (L.exits || []).forEach(e => { if (!e.if || e.if(S())) { const to = GAME.LOC[e.to]; out.push({ exit: true, x: e.x, y: e.y, label: e.label || to.name, to: e.to, lock: e.lock, risk: e.risk }); } });
  return out;
}
function useSpot(h) {
  if (h.exit) {
    const lk = h.lock && h.lock(S());
    if (lk) { play(Array.isArray(lk) ? lk : [{ n: tx(lk) }]); return; }
    const a = houseOf(S().loc) || '', b = houseOf(h.to) || '';
    AUDIO.sfx(a !== b || (GAME.LOC[h.to] && /door|room|house|inside/i.test(tx(h.label || ''))) ? 'door' : 'steps');
    goTo(h.to); return;
  }
  AUDIO.sfx('tap');
  const r = h.run(S()); if (Array.isArray(r)) play(r); else afterScript();
}

function setSpeaker(id, expr) { VIEW.speaker = id; VIEW.expr = expr || 'neutral'; }
function renderLine(st) {
  const panel = $('panel'); panel.innerHTML = '';
  if (st.c) {
    setSpeaker(st.c, st.e);
    const shown = VIEW.stageChars || present(S().loc).map(id => ({ id }));
    const chars = shown.some(x => x.id === st.c) ? shown : shown.concat([{ id: st.c }]);
    renderStage(chars);
    panel.appendChild(el('div', 'who', tx(GAME.CHAR[st.c].name)));
    panel.appendChild(el('p', 'line', tx(st.t)));
  } else {
    VIEW.speaker = null; renderStage();
    panel.appendChild(el('p', 'line narr', tx(st.n)));
  }
  const b = el('button', 'tap', UI('next')); b.type = 'button'; b.onclick = ev => { ev.stopPropagation(); if (tapOk(ev)) next(); }; panel.appendChild(b);
  /* tapping anywhere on the dialogue box also continues */
  panel.onclick = ev => { if (ev.target.closest('button,a,input')) return; if (RUN && !panel.querySelector('.opt') && tapOk(ev)) next(); };
  AUDIO.line(st);
  $('stage').onclick = ev => { if (ev.target.closest('.hbtn,.ibtn,.sheet')) return; if (RUN && !$('panel').querySelector('.opt') && tapOk(ev)) next(); };
  b.focus({ preventScroll: true });
}
function renderMenu(st) {
  const panel = $('panel'); panel.innerHTML = ''; panel.onclick = null;
  if (st.c) { setSpeaker(st.c, st.e); }
  renderStage();
  if (st.q) panel.appendChild(el('p', 'line' + (st.c ? '' : ' narr'), tx(st.q)));
  if (st.q) AUDIO.line(st.c ? { c: st.c, t: st.q, e: st.e } : { n: st.q });
  const box = el('div', 'opts');
  st.menu.forEach(o => {
    if (o.hide && o.hide(S())) return;
    const ok = !o.need || o.need(S());
    const b = el('button', 'opt' + (o.cls ? ' ' + o.cls : '')); b.type = 'button';
    b.textContent = tx(o.t);
    if (!ok) { b.disabled = true; if (o.why) b.appendChild(el('small', '', tx(o.why))); }
    b.onclick = ev => { if (b.disabled || !RUN || !tapOk(ev)) return; box.querySelectorAll('.opt').forEach(x => { x.disabled = true; }); AUDIO.sfx('tap'); if (o.fx) o.fx(S()); if (o.then) RUN.stack.push({ steps: o.then.slice(), i: 0 }); next(); };
    box.appendChild(b);
  });
  if (box.children.length > 6) box.classList.add('many');
  panel.appendChild(box);
  $('stage').onclick = null;
}

/* location view: actions list in the panel mirrors the hotspots on the stage */
/* location view: no menu of buttons. The scene itself is the interface:
   tap people to talk, tap the glowing circles to look, use or go somewhere.
   The panel shrinks to a small caption (tap it to read more). */
function renderLocation() {
  const s = S(); const L = GAME.LOC[s.loc];
  VIEW.speaker = null; $('stage').onclick = null;
  document.body.classList.add('explore'); document.body.classList.remove('titlemode');
  renderStage();
  const panel = $('panel'); panel.innerHTML = ''; panel.onclick = null;
  const cap = el('div', 'caption'); cap.setAttribute('role', 'button'); cap.tabIndex = 0;
  cap.appendChild(el('div', 'place', tx(L.name) + (L.private ? ' · ' + UI('private') : '')));
  const acts = present(s.loc).map(id => GAME.CHAR[id].doing && GAME.CHAR[id].doing(s)).filter(Boolean);
  if (typeof LIFE !== 'undefined') { const h = LIFE.hear(s); if (h) acts.push(T(h, h)); }
  if (L.note) { const nt = L.note(s); if (nt) acts.push(nt); }
  const txt = (L.desc ? [L.desc] : []).concat(acts).map(a => tx(a)).join(' ');
  if (txt) cap.appendChild(el('p', 'line narr', txt));
  s.f.hintTaps = (s.f.hintTaps || 0) + 1;
  if (s.f.hintTaps <= 6) cap.appendChild(el('p', 'hint', UI('tapHint')));
  cap.onclick = () => { cap.classList.toggle('open'); placeCaption(); };
  panel.appendChild(cap);
  placeCaption();
  save();
}
/* the caption floats over a corner of the picture: it must never cover a glowing circle, or that
   circle can't be tapped. Try the usual corner, then the other one, then shrink it to just the
   place name. */
function placeCaption() {
  const b = document.body, panel = $('panel');
  const ALL = ['cap-end', 'cap-mini', 'cap-mid'];
  b.classList.remove(...ALL);
  if (!b.classList.contains('explore') || getComputedStyle(panel).position !== 'fixed') return;
  const spots = [...document.querySelectorAll('#stage .spots .spot i')].map(x => { const r = x.getBoundingClientRect(); return { left: r.left - 8, right: r.right + 8, top: r.top - 8, bottom: r.bottom + 8 }; });
  const covered = () => { const p = panel.getBoundingClientRect();
    return spots.filter(r => Math.min(p.right, r.right) - Math.max(p.left, r.left) > 0 && Math.min(p.bottom, r.bottom) - Math.max(p.top, r.top) > 0).length; };
  if (!covered()) return;
  const open = panel.querySelector('.caption.open');
  const tries = [['cap-end'], ['cap-mini'], ['cap-end', 'cap-mini'], ['cap-mid', 'cap-mini']].filter(c => !(open && c.includes('cap-mini')));
  let best = [], least = covered();
  for (const c of tries) { b.classList.remove(...ALL); b.classList.add(...c); const n = covered(); if (n < least) { least = n; best = c; } if (!n) return; }
  b.classList.remove(...ALL); if (best.length) b.classList.add(...best);
}

/* talking: a menu of topics for that character, built from GAME.TOPICS */
function talkTo(id) {
  if (RUN) return;
  const c = GAME.CHAR[id];
  const topics = (GAME.TOPICS[id] || []).filter(t => !(t.once && S().f['tp_' + id + '_' + t.id]) && (!t.if || t.if(S())));
  const menu = topics.map(t => ({
    t: t.label, need: t.need, why: t.why, cls: t.cls,
    fx: () => { if (t.once) S().f['tp_' + id + '_' + t.id] = true; },
    then: typeof t.run === 'function' ? [st => t.run(st)] : t.run
  }));
  menu.push({ t: UI('bye'), then: [] });
  const greet = c.greet ? c.greet(S()) : null;
  play([{ c: id, e: greet ? greet.e : 'neutral', q: greet ? greet.t : null, menu }]);
}

/* ---------- endings ---------- */
function showEnding(id) {
  const e = GAME.END[id]; const s = S();
  if (!s.ends.includes(id)) s.ends.push(id);
  markEnd(id); save();
  RUN = null; VIEW.speaker = null; AUDIO.sfx('end');
  renderStage([]);
  const panel = $('panel'); panel.innerHTML = '';
  const card = el('div', 'end-card');
  card.appendChild(el('small', '', UI('ending') + (e.who ? ' · ' + tx(GAME.CHAR[e.who].name) : '')));
  card.appendChild(el('strong', '', tx(e.title)));
  panel.appendChild(card);
  if (e.after) panel.appendChild(el('p', 'line narr', tx(e.after)));
  const box = el('div', 'opts');
  if (e.who) { s.done = s.done || {}; s.done[e.who] = id; if (s.host === e.who) s.host = null; }
  if (e.who === 'leo') s.f.leoEnded = true;
  if (e.final) {
    s.f.pendingFinal = true; save(); const k = el('button', 'opt main', UI('keepLiving')); k.type = 'button'; k.onclick = () => { S().f.pendingFinal = false; play(GAME.SCRIPTS.sandboxStart(S())); }; box.appendChild(k);
    const b2 = el('button', 'opt', UI('again')); b2.type = 'button'; b2.onclick = () => titleScreen(true); box.appendChild(b2);
    panel.appendChild(box); save(); return;
  }
  if (e.next && GAME.SCRIPTS[e.next]) {
    if (e.who === 'elias') s.f.eliasEnd = id;
    if (e.who === 'elias') { s.f.ended = true; s.ch = 2; s.host = null; }
    const add = e.lesson ? e.lesson : (GAME.CHAR[e.who] && GAME.CHAR[e.who].lesson);
    if (add && !(s.lessons || []).some(l => l.h === e.who)) (s.lessons = s.lessons || []).push({ h: e.who, t: add });
    save();
    s.f.pendingNext = e.next; save();
    const b0 = el('button', 'opt main', UI(e.nextLabel || 'continueStory')); b0.type = 'button'; b0.onclick = () => { S().f.pendingNext = null; play(GAME.SCRIPTS[e.next](S())); }; box.appendChild(b0);
    panel.appendChild(box);
    return;
  }
  if (e.who === 'leo') s.f.leoEnded = true;
  const b1 = el('button', 'opt main', UI('again')); b1.type = 'button'; b1.onclick = () => titleScreen(true); box.appendChild(b1);
  panel.appendChild(box);
  try { localStorage.removeItem('oph.save'); } catch (err) {}
}

/* ---------- sheets: phone & map ---------- */
function openSheet(k) { VIEW.sheet = k; AUDIO.sfx(k === 'map' ? 'map' : 'phone'); renderStage(); }
function closeSheet() { VIEW.sheet = null; if (RUN) renderStage(); else renderLocation(); }
function renderSheet() {
  const st = $('stage'); const old = st.querySelector('.sheet'); if (old) old.remove();
  document.body.classList.toggle('sheet-open', !!VIEW.sheet);
  if (!VIEW.sheet) return;
  const sh = el('div', 'sheet');
  const head = el('div', 'tabs');
  const close = el('button', 'tab', UI('close')); close.type = 'button'; close.onclick = closeSheet;
  if (VIEW.sheet === 'map') {
    /* the whole town fits on screen (no panning); a list of places beside/below it says who is where
       and why a place is closed. Tapping a pin or a list row does the same thing. */
    sh.classList.add('mapsheet');
    head.appendChild(close); sh.appendChild(head);
    const body = el('div', 'mapbody');
    const wrap = el('div', 'mapwrap'); wrap.innerHTML = ART.map(S());
    const list = el('div', 'maplist');
    const s = S(), here = s.loc, hereHouse = houseOf(here);
    /* a house's rooms count as "here" for the pin at its front door */
    const DOOR = { elias: 'elias_ext', leo: 'boathouse', margaret: 'cliff_road', evelyn: 'lh_ext', victor: 'hotel_lobby' };
    const isHere = to => to === here || (hereHouse && (DOOR[hereHouse] === to || houseOf(to) === hereHouse));
    const NUDGE = { florist: [0, -4], cemetery: [0, -1], beach: [-3, 2], margaret: [-2, 5], cliff_road: [-2, 5] };   /* keep neighbouring labels apart */
    const place = (x, b, k) => { const n = NUDGE[k] || [0, 0]; x = [x[0] + n[0], x[1] + n[1]]; b.style.left = x[0] + '%'; b.style.top = (x[1] + 7) + '%'; if (x[0] < 14) b.classList.add('edge-l'); else if (x[0] > 86) b.classList.add('edge-r'); };
    const go = (p) => ev => { if (!tapOk(ev)) return; VIEW.sheet = null; AUDIO.sfx('steps'); goTo(p.to); };
    const closed = (p) => ev => { if (!tapOk(ev)) return; toast(tx(p.lockMsg || GAME.UI.closedNow)); };
    const story = (p) => () => { VIEW.sheet = null; play([{ n: p.msg }]); };
    for (const p of GAME.MAP) {
      if (p.if && !p.if(s)) continue;
      const pos = ART.PLACES[p.place || p.to] || [p.x, p.y];
      if (!p.to) {
        const b = el('button', 'pin future'); b.type = 'button'; place(pos, b, p.place || p.to); b.textContent = tx(p.label);
        if (p.soon !== false) b.appendChild(el('em', '', ' · ' + UI('soon'))); b.onclick = story(p); wrap.appendChild(b);
        const r = el('button', 'mrow future'); r.type = 'button'; r.appendChild(el('span', 'mname', tx(p.label))); if (p.soon !== false) r.appendChild(el('span', 'mwho', UI('soon'))); r.onclick = story(p); list.appendChild(r);
        continue;
      }
      const L = GAME.LOC[p.to], name = tx(L.mapName || L.name);
      const ids = present(p.to).concat(...(L.rooms || []).map(r => present(r))), who = ids.map(w => tx(GAME.CHAR[w].short || GAME.CHAR[w].name));
      const whoI = ids.map((w, i) => (lifeIcon(w) ? lifeIcon(w) + ' ' : '') + who[i]);
      const lock = p.lock && p.lock(s), me = isHere(p.to);
      const b = el('button', 'pin' + (me ? ' here' : '') + (lock ? ' locked' : '')); b.type = 'button'; place(pos, b, p.to);
      b.textContent = name; if (who.length) b.appendChild(el('i', 'dot', String(who.length)));
      b.setAttribute('aria-label', name + (who.length ? ' · ' + who.join(', ') : '') + (lock ? ' · ' + UI('closed') : '')); if (lock) b.setAttribute('aria-disabled', 'true');
      b.onclick = lock ? closed(p) : go(p); wrap.appendChild(b);
      const r = el('button', 'mrow' + (me ? ' here' : '') + (lock ? ' locked' : '')); r.type = 'button';
      r.appendChild(el('span', 'mname', (me ? '● ' : '') + name));
      r.appendChild(el('span', 'mwho', lock ? UI('closed') : whoI.join('، ')));
      r.onclick = lock ? closed(p) : go(p); list.appendChild(r);
    }
    body.appendChild(wrap); body.appendChild(list); sh.appendChild(body);
    } else {
    const tabs = [['quests', UI('quests')], ['people', UI('people')], ['bag', UI('bag')], ['me', UI('me')], ['settings', UI('settings')]];
    tabs.forEach(([k, label]) => { const b = el('button', 'tab' + (VIEW.tab === k ? ' on' : ''), label); b.type = 'button'; b.onclick = () => { VIEW.tab = k; renderSheet(); }; head.appendChild(b); });
    head.appendChild(close); sh.appendChild(head);
    const body = el('div', '');
    const s = S();
    if (VIEW.tab === 'quests') {
      const act = Object.entries(s.quests).filter(([, v]) => v === 'active'), dn = Object.entries(s.quests).filter(([, v]) => v === 'done');
      if (!act.length && !dn.length) body.appendChild(el('p', 'line narr', UI('noQuests')));
      act.forEach(([k]) => { const q = el('div', 'q'); q.appendChild(el('strong', '', tx(GAME.QUESTS[k].title))); q.appendChild(el('div', '', tx(GAME.QUESTS[k].hint))); body.appendChild(q); });
      dn.forEach(([k]) => body.appendChild(el('div', 'q done', tx(GAME.QUESTS[k].title))));
    } else if (VIEW.tab === 'people') {
      const met = Object.keys(s.met);
      if (!met.length) body.appendChild(el('p', 'line narr', UI('noPeople')));
      met.forEach(id => {
        const c = GAME.CHAR[id]; const r = el('div', 'row');
        const left = el('div', ''); left.appendChild(el('strong', '', tx(c.name)));
        if (c.role) left.appendChild(el('div', '', tx(c.role)));
        if (typeof LIFE !== 'undefined') { const now = LIFE.nowLine(id); if (now) left.appendChild(el('div', 'now', now)); }
        if (c.host) {
          const tr = s.trust[id] || 0; const b = el('div', 'bar'); const i = el('i'); i.style.width = clamp(tr * 10, 0, 100) + '%'; b.appendChild(i); left.appendChild(b);
          const su = s.susp[id] || 0; if (su > 0) { const b2 = el('div', 'bar sus'); const i2 = el('i'); i2.style.width = su * 33 + '%'; b2.appendChild(i2); left.appendChild(b2); }
        }
        r.appendChild(left);
        r.appendChild(el('span', '', c.host ? tx(moodOf(id)) : ''));
        body.appendChild(r);
      });
    } else if (VIEW.tab === 'bag') {
      const items = Object.entries(s.inv).filter(([, n]) => n > 0);
      if (!items.length) body.appendChild(el('p', 'line narr', UI('emptyBag')));
      items.forEach(([k, n]) => { const r = el('div', 'row'); r.appendChild(el('span', '', tx(GAME.ITEMS[k].name) + (n > 1 ? ' ×' + n : ''))); r.appendChild(el('span', '', tx(GAME.ITEMS[k].desc))); body.appendChild(r); });
    } else if (VIEW.tab === 'me') {
      const ls = s.f.lastShower; const sh = ls == null ? UI('never') : (s.day - ls === 0 ? UI('today') : (s.day - ls) + ' ' + UI('daysAgo'));
      const rows = [[UI('feel'), tx(feelWord())], [UI('money'), '$' + s.money], [UI('day'), tx(WEEK[weekday(s.day)]) + ' · ' + s.day], [UI('shower'), sh]];
      rows.forEach(([a, b]) => { const r = el('div', 'row'); r.appendChild(el('span', '', a)); r.appendChild(el('span', '', b)); body.appendChild(r); });
      const nd = needs();
      [['food', UI('nFood')], ['clean', UI('nClean')], ['energy', UI('nEnergy')]].forEach(([k, label]) => { const r = el('div', 'row'); const left = el('div', ''); left.appendChild(el('strong', '', label)); const b = el('div', 'bar' + (nd[k] < 25 ? ' sus' : '')); const i = el('i'); i.style.width = nd[k] + '%'; b.appendChild(i); left.appendChild(b); r.appendChild(left); r.appendChild(el('span', '', Math.round(nd[k]) + '%')); body.appendChild(r); });
      const msg = el('p', 'line narr', tx(s.f.calledMother ? GAME.UI.momOk : GAME.UI.momMsgs)); body.appendChild(msg);
    } else {
      const mk = (label, fn) => { const b = el('button', 'opt', label); b.type = 'button'; b.onclick = fn; body.appendChild(b); };
      /* one row: a name, then a small switch of choices; the chosen one is lit */
      const seg = (label, choices, cur, pick) => { const r = el('div', 'setrow'); r.appendChild(el('span', '', label)); const g = el('div', 'seg'); g.setAttribute('role', 'radiogroup'); g.setAttribute('aria-label', label);
        choices.forEach(([v, t]) => { const b = el('button', v === cur ? 'on' : '', t); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', v === cur ? 'true' : 'false'); b.onclick = ev => { ev.stopPropagation(); if (v !== cur && tapOk(ev)) { pick(v); renderSheet(); } }; g.appendChild(b); });
        r.appendChild(g); body.appendChild(r); };
      const sec = k => body.appendChild(el('p', 'sec', UI(k)));
      sec('secSound');
      seg(UI('sound'), [[true, UI('on')], [false, UI('off')]], AUDIO.on, v => AUDIO.setOn(v));
      if (AUDIO.on) body.appendChild(soundSliders());
      sec('secDisplay');
      seg(UI('language'), [['ar', 'العربية'], ['en', 'English']], GAME.lang, v => { GAME.lang = v; try { localStorage.setItem('oph.lang', GAME.lang); } catch (e) {} applyLang(); renderStage(); if (!RUN) renderLocation(); else { const top = RUN.stack[RUN.stack.length - 1]; if (top) { top.i--; next(); } } });
      seg(UI('textSize'), [['s', UI('small')], ['m', UI('normal')], ['l', UI('large')]], PREFS.get('text'), v => PREFS.set('text', v));
      seg(UI('names'), [['always', UI('always')], ['tap', UI('onTap')]], PREFS.get('labels'), v => PREFS.set('labels', v));
      sec('secPlay');
      seg(UI('scares'), [[true, UI('on')], [false, UI('off')]], SCARES.on, v => { SCARES.on = v; });
      sec('secProgress');
      body.appendChild(el('p', 'setnote', UI('autoNote')));
      /* saving in the middle of a conversation would store half a scene; finish it first */
      body.appendChild(el('p', 'sub', UI('saveGame')));
      [1, 2, 3].forEach(i => { const b = el('button', 'opt', '💾 ' + slotLabel(i)); b.type = 'button'; if (RUN) { b.disabled = true; b.appendChild(el('small', '', UI('saveAfterTalk'))); } else b.onclick = () => { if (!readSlot(i)) { saveSlot(i); renderSheet(); return; } confirmIn(body, UI('overwriteSlot') + ' ' + i + '?', () => { saveSlot(i); renderSheet(); }, renderSheet); }; body.appendChild(b); });
      if ([1, 2, 3].some(i => readSlot(i))) body.appendChild(el('p', 'sub', UI('loadGame')));
      [1, 2, 3].forEach(i => { if (readSlot(i)) mk('↺ ' + slotLabel(i), () => confirmIn(body, UI('loadConfirm'), () => loadSlot(i), renderSheet)); });
      mk(UI('toTitle'), () => { if (RUN) confirmIn(body, UI('leaveTalk'), () => titleScreen(false), renderSheet); else { save(); titleScreen(false); } });
      const dl = appLink(); if (dl) body.appendChild(dl);
    }
    sh.appendChild(body);
  }
  st.appendChild(sh);
}
function feelWord() { const m = S().mood; return GAME.UI['feel' + Math.min(4, Math.floor(m / 2.5))]; }
function moodOf(id) { const s = S(); const su = s.susp[id] || 0, tr = s.trust[id] || 0; if (su >= 2) return T('Suspicious of you', 'يشك فيك'); if (su === 1) return T('Wary', 'حذر'); if (tr >= 6) return T('Close', 'قريب منك'); if (tr >= 3) return T('Warming up', 'يرتاح لك'); return T('A stranger', 'غريب'); }

/* sound lives in js/audio.js (AUDIO) */

/* ---------- Android app download ----------
   On GitHub Pages the repo is read from the address (user.github.io/repo/).
   Elsewhere it falls back to GAME.REPO (set in main.js). Hidden inside the app itself. */
function appRepo() {
  try {
    const h = location.hostname, seg = location.pathname.split('/').filter(Boolean)[0];
    if (h.endsWith('.github.io')) return h.split('.')[0] + '/' + (seg || h);
  } catch (e) {}
  return GAME.REPO || '';
}
function appLink() {
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return null;
  const repo = appRepo(); if (!repo) return null;
  const a = el('a', 'opt dl', UI('download'));
  a.href = 'https://github.com/' + repo + '/releases/latest/download/OtherPeoplesHouses.apk';
  a.target = '_blank'; a.rel = 'noopener';
  a.appendChild(el('small', '', UI('downloadHint')));
  return a;
}

/* ---------- jump scares (can be turned off in Settings; then only a soft sound) ---------- */
const SCARES = { get on() { try { return localStorage.getItem('oph.scares') !== '0'; } catch (e) { return true; } },
  set on(v) { try { localStorage.setItem('oph.scares', v ? '1' : '0'); } catch (e) {} } };
function scare(id) {
  if (!SCARES.on) { AUDIO.sfx('ghost'); return; }
  AUDIO.sfx('scream');
  try { if (navigator.vibrate) navigator.vibrate([60, 40, 140]); } catch (e) {}
  const st = $('stage'); const old = st.querySelector('.scare'); if (old) old.remove();
  const o = el('div', 'scare'); o.innerHTML = ART.portrait(id, 'angry'); st.appendChild(o);
  st.classList.remove('shake'); void st.offsetWidth; st.classList.add('shake');
  setTimeout(() => { o.remove(); st.classList.remove('shake'); }, 950);
}

/* ---------- small dialogs ---------- */
/* asks a yes/no question inside a container (the panel or the phone), never with a browser popup */
function confirmIn(box, text, yes, no) {
  box.innerHTML = '';
  box.appendChild(el('p', 'line narr', text));
  const row = el('div', 'opts');
  const y = el('button', 'opt main', UI('yes')); y.type = 'button'; y.onclick = ev => { if (tapOk(ev)) yes(); };
  const n = el('button', 'opt', UI('no')); n.type = 'button'; n.onclick = ev => { if (tapOk(ev)) no(); };
  row.appendChild(y); row.appendChild(n); box.appendChild(row); n.focus({ preventScroll: true });
}
function soundSliders() {
  const wrap = el('div', 'sliders');
  [['master', 'volMaster'], ['music', 'volMusic'], ['amb', 'volAmb'], ['sfx', 'volSfx'], ['voice', 'volVoice']].forEach(([k, label]) => {
    const row = el('label', 'slider'); row.appendChild(el('span', '', UI(label)));
    const r = el('input'); r.type = 'range'; r.min = 0; r.max = 100; r.step = 5; r.value = Math.round(AUDIO.settings[k] * 100); r.setAttribute('aria-label', UI(label));
    r.oninput = () => AUDIO.setVol(k, r.value / 100); r.onchange = () => { if (k !== 'master' && k !== 'music' && k !== 'amb') AUDIO.sfx(k === 'voice' ? 'tap' : 'phone'); };
    row.appendChild(r); wrap.appendChild(row);
  });
  return wrap;
}
/* Android back button / browser back: closes the phone or map first; leaving the game needs a second press */
let BACK_AT = 0;
const NATIVE_APP = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
function navArm() { if (NATIVE_APP()) return; try { if (!history.state || !history.state.oph) history.pushState({ oph: 1 }, ''); } catch (e) {} }
/* returns true when the press was used inside the game (sheet closed or "press again" shown) */
function backPressed() {
  if (VIEW.sheet) { closeSheet(); return true; }
  const now = Date.now();
  if (now - BACK_AT < 2500) return false;
  BACK_AT = now; toast(UI('backAgain')); return true;
}
window.addEventListener('popstate', () => { if (backPressed()) navArm(); else { try { history.back(); } catch (e) {} } });
/* inside the Android app the hardware back button comes from the Capacitor App plugin */
try { const A = NATIVE_APP(); if (A && A.addListener) A.addListener('backButton', () => { if (!backPressed()) A.exitApp(); }); } catch (e) {}

/* ---------- title & new game ---------- */
function applyLang() { document.documentElement.lang = GAME.lang; document.documentElement.dir = GAME.lang === 'ar' ? 'rtl' : 'ltr'; }
function titleScreen(fresh) {
  document.body.classList.remove('explore'); document.body.classList.add('titlemode');
  RUN = null; VIEW.sheet = null; VIEW.speaker = null; applyLang();
  GAME.S = GAME.S || newState();
  const st = $('stage');
  setLayer(st.querySelector('.bg'), ART.bg('harbor', 'evening', GAME.S));
  st.querySelector('.tint').style.background = ART.tint('harbor', 'evening');
  setLayer(st.querySelector('.chars'), ''); st.querySelector('.spots').innerHTML = ''; st.querySelector('.hud .chips').innerHTML = ''; st.querySelector('.hud .btns').innerHTML = '';
  const old = st.querySelector('.sheet'); if (old) old.remove();
  const panel = $('panel'); panel.innerHTML = ''; panel.onclick = null;
  const wrap = el('div', 'title-screen');
  wrap.appendChild(el('h1', 'logo', tx(T("Other People's Houses", 'بيوت الآخرين'))));
  wrap.appendChild(el('p', 'logo-sub', tx(T('You came to Saltmere on the last train, with nothing. The people here will open their doors to you. What you do inside is up to you.', 'وصلت سولتمير بآخر قطار، وما معك شي. ناس هالبلدة بيفتحون لك أبوابهم. ووش تسوي داخل بيوتهم، هذا قرارك.'))));
  const box = el('div', 'opts');
  const sv = fresh ? null : loadSave();
  if (sv) { const c = el('button', 'opt main', UI('continue')); c.type = 'button'; c.onclick = () => { GAME.S = sv; resumeState(); }; box.appendChild(c); }
  /* starting over or loading a slot replaces the autosave behind "Continue": ask first */
  const guard = (go) => () => { if (!sv) return go(); panel.innerHTML = ''; confirmIn(panel, UI('replaceAuto'), go, () => titleScreen(fresh)); };
  if ([1, 2, 3].some(i => readSlot(i))) { const lb = el('button', 'opt', UI('loadGame')); lb.type = 'button'; lb.onclick = () => { panel.innerHTML = ''; const lbx = el('div', 'opts'); [1, 2, 3].forEach(i => { if (readSlot(i)) { const b = el('button', 'opt', slotLabel(i)); b.type = 'button'; b.onclick = guard(() => loadSlot(i)); lbx.appendChild(b); } }); const bk = el('button', 'opt', UI('close')); bk.type = 'button'; bk.onclick = () => titleScreen(fresh); lbx.appendChild(bk); panel.appendChild(lbx); }; box.appendChild(lb); }
  const n = el('button', 'opt' + (sv ? '' : ' main'), UI('newGame')); n.type = 'button'; n.onclick = guard(setupScreen); box.appendChild(n);
  const snd = el('button', 'opt', AUDIO.on ? UI('soundOff') : UI('soundOn')); snd.type = 'button'; snd.onclick = () => { AUDIO.setOn(!AUDIO.on); snd.textContent = AUDIO.on ? UI('soundOff') : UI('soundOn'); }; box.appendChild(snd);
  const lg = el('button', 'opt', GAME.lang === 'ar' ? 'English' : 'العربية'); lg.type = 'button'; lg.onclick = () => { GAME.lang = GAME.lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('oph.lang', GAME.lang); } catch (e) {} titleScreen(fresh); }; box.appendChild(lg);
  const dl = appLink(); if (dl) box.appendChild(dl);
  wrap.appendChild(box);
  const se = seenEnds().length, tot = Object.keys(GAME.END).length;
  wrap.appendChild(el('p', 'sec', tx(T('Endings found: ', 'النهايات اللي اكتشفتها: ')) + se + ' / ' + tot));
  wrap.appendChild(el('p', 'sec', tx(T('Contains: grief, depression, illness, death and horror. No sexual content.', 'فيها: فقد، اكتئاب، مرض، موت، ورعب. بدون أي محتوى جنسي.'))));
  panel.appendChild(wrap);
  AUDIO.scene(GAME.S, true); navArm();
}
function setupScreen() {
  document.body.classList.remove('explore'); document.body.classList.add('titlemode');
  GAME.S = newState();
  const panel = $('panel'); panel.innerHTML = '';
  panel.appendChild(el('h2', '', tx(T('Who are you?', 'مين أنت؟'))));
  const box = el('div', 'opts grid');
  const pick = g => { GAME.S.gender = g; [...box.children].forEach(b => b.classList.toggle('main', b.dataset.g === g)); };
  [['m', T('A young man', 'شاب')], ['f', T('A young woman', 'شابة')]].forEach(([g, l]) => { const b = el('button', 'opt', tx(l)); b.type = 'button'; b.dataset.g = g; b.onclick = () => pick(g); box.appendChild(b); });
  panel.appendChild(box); pick('m');
  const lab = el('label', 'sec', tx(T('Your name', 'اسمك'))); lab.htmlFor = 'pname'; panel.appendChild(lab);
  const inp = el('input', 'name'); inp.id = 'pname'; inp.maxLength = 16; inp.placeholder = tx(T('Alex', 'أليكس')); panel.appendChild(inp);
  const go = el('button', 'opt main', tx(T('Begin · You are 20 years old', 'ابدأ · عمرك ٢٠ سنة'))); go.type = 'button';
  go.onclick = () => { GAME.S.name = (inp.value || '').trim().slice(0, 16) || tx(T('Alex', 'أليكس')); GAME.S.f.prologue = true; play(GAME.SCRIPTS.intro); };
  panel.appendChild(go);
}
function boot() { applyLang(); applyPrefs(); titleScreen(false); }
