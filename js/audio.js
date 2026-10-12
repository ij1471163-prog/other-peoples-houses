/* =====================================================================
   Other People's Houses — sound
   Everything is synthesised in the browser with the Web Audio API: the
   project has no recorded audio files and no voice acting, so nothing
   here pretends otherwise.
     · ambience  — per place and time (sea, wind, café murmur, room tone,
                   gulls by day, crickets at night, a clock in Margaret's
                   house, creaks in the lighthouse attic)
     · music     — a quiet theme for each host, heard in their house or
                   while they talk (Elias warm, Leo light, Margaret slow
                   and minor, Evelyn uneasy, Victor a controlled pulse)
     · voice     — short murmured "blips" while a character speaks, pitched
                   from their age and sex and coloured by their expression
     · effects   — doors, steps, phone, map, choices, endings, and the
                   3:07 laughter / knocking in the lighthouse (kept rare)
   Five volume controls (master, music, ambience, effects, voice) and an
   on/off switch, saved on the device. Sound starts only after a tap
   (mobile autoplay rules) and is suspended while the app is hidden.
   ===================================================================== */
'use strict';
const AUDIO = (() => {
  const KEY = 'oph.audio';
  const DEF = { on: true, master: 0.8, music: 0.5, amb: 0.7, sfx: 0.7, voice: 0.6 };
  const set = Object.assign({}, DEF);
  try { Object.assign(set, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(set)); } catch (e) {} };
  let ctx = null, out = null, unlocked = false;
  const bus = {};
  let white = null, brown = null;
  let amb = null, ambKey = '', mus = null, musKey = '', evTimer = 0, musTimer = 0, voice = [];
  const lastCue = {};
  const asleep = () => typeof POWER !== 'undefined' && POWER.asleep;

  /* ---------- graph ---------- */
  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
    ['music', 'amb', 'sfx', 'voice'].forEach(k => { bus[k] = ctx.createGain(); bus[k].connect(out); });
    const mk = (sec, brownish) => { const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0); let l = 0;
      for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brownish) { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; } else d[i] = w; } return b; };
    white = mk(2, false); brown = mk(5, true);
    applyVol();
    return ctx;
  }
  function applyVol() {
    if (!ctx) return; const t = ctx.currentTime;
    out.gain.setTargetAtTime(set.on ? set.master : 0, t, 0.08);
    bus.music.gain.setTargetAtTime(set.music * 0.55, t, 0.08); bus.amb.gain.setTargetAtTime(set.amb * 0.9, t, 0.08);
    bus.sfx.gain.setTargetAtTime(set.sfx, t, 0.08); bus.voice.gain.setTargetAtTime(set.voice * 0.8, t, 0.08);
  }
  const live = () => ctx && set.on && unlocked && !asleep() && ctx.state === 'running';
  function src(buf, loop = true) { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = loop; if (loop) s.loopStart = 0; return s; }
  function lfo(rate, depth, target, offset) { const o = ctx.createOscillator(); o.frequency.value = rate; const g = ctx.createGain(); g.gain.value = depth; o.connect(g).connect(target); if (offset != null) target.value = offset; o.start(); return o; }
  function filt(type, f, q = 0.7) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function tone(f, t, dur, peak, type = 'sine', dest = bus.sfx, a = 0.01) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); const g = ctx.createGain(); env(g, t, a, peak, dur);
    o.connect(g).connect(dest); o.start(t); o.stop(t + a + dur + 0.05); o.onended = () => { try { g.disconnect(); } catch (e) {} }; return o;
  }
  function burst(t, dur, peak, type, f, dest = bus.sfx, buf) {
    const s = src(buf || white, false); const b = filt(type, f, 0.8); const g = ctx.createGain(); env(g, t, 0.005, peak, dur);
    s.connect(b).connect(g).connect(dest); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.1); s.onended = () => { try { g.disconnect(); } catch (e) {} };
  }

  /* ---------- ambience ---------- */
  const SEA = ['harbor', 'beach', 'dock', 'lh_ext', 'elias_ext'];
  const WIND = ['cliff_road', 'cemetery', 'lh_tower'];
  const STREET = ['street', 'station'];
  const MURMUR = ['cafe', 'hotel_lobby'];
  function profileOf(loc, slot) {
    const night = slot >= 4, evening = slot === 3;
    const L = GAME.LOC[loc] || {}; const house = L.house || '';
    let p;
    if (SEA.includes(loc)) p = 'sea'; else if (WIND.includes(loc)) p = 'wind'; else if (STREET.includes(loc)) p = 'street';
    else if (MURMUR.includes(loc)) p = 'murmur'; else if (loc === 'lh_attic') p = 'attic'; else if (house === 'evelyn') p = 'lighthouse';
    else if (house === 'leo') p = 'boathouse'; else if (house === 'victor') p = 'hotel'; else p = 'room';
    return { p, night, evening, house, loc };
  }
  function buildAmb(pr) {
    const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(bus.amb); const nodes = [];
    const add = n => { nodes.push(n); return n; };
    const layer = (buf, type, f, lvl, q) => { const s = add(src(buf)); const b = filt(type, f, q); const lg = ctx.createGain(); lg.gain.value = lvl; s.connect(b).connect(lg).connect(g); s.start(0, Math.random() * 3); return lg; };
    const waves = (lvl, f = 520) => { const lg = layer(brown, 'lowpass', f, lvl); add(lfo(0.08 + Math.random() * 0.03, lvl * 0.55, lg.gain, lvl)); };
    const quiet = pr.night ? 0.6 : 1;
    switch (pr.p) {
      case 'sea': waves(0.5 * quiet); waves(0.25 * quiet, 900); break;
      case 'wind': { const lg = layer(white, 'bandpass', 520, 0.11 * quiet, 0.9); add(lfo(0.05, 0.06, lg.gain, 0.11 * quiet)); waves(0.12 * quiet, 300); break; }
      case 'street': layer(brown, 'lowpass', 380, 0.22 * quiet); waves(0.1 * quiet, 400); break;
      case 'murmur': { const lg = layer(white, 'bandpass', 650, 0.06, 1.1); add(lfo(3.1, 0.025, lg.gain, 0.06)); add(lfo(4.7, 0.02, lg.gain)); layer(brown, 'lowpass', 200, 0.18); break; }
      case 'lighthouse': layer(brown, 'lowpass', 170, 0.22); waves(0.14, 350); { const lg = layer(white, 'bandpass', 450, 0.025, 0.9); add(lfo(0.04, 0.02, lg.gain, 0.025)); } break;
      case 'attic': layer(brown, 'lowpass', 140, 0.16); waves(0.06, 300); break;
      case 'boathouse': layer(brown, 'lowpass', 180, 0.2); waves(0.16, 420); break;
      case 'hotel': { layer(brown, 'lowpass', 150, 0.12); const o = add(ctx.createOscillator()); o.frequency.value = 98; const hg = ctx.createGain(); hg.gain.value = 0.012; o.connect(hg).connect(g); o.start(); break; }
      default: layer(brown, 'lowpass', 160, 0.2 * quiet);
    }
    g.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
    return { g, nodes, pr };
  }
  function stopLayer(x, sec = 1) {
    if (!x) return; const t = ctx.currentTime; x.g.gain.cancelScheduledValues(t); x.g.gain.setTargetAtTime(0.0001, t, sec / 3);
    x.nodes.forEach(n => { try { n.stop(t + sec + 0.2); } catch (e) {} });
    setTimeout(() => { try { x.g.disconnect(); } catch (e) {} }, (sec + 0.5) * 1000);
  }
  /* small sounds that happen now and then in a place */
  function ambEvent() {
    evTimer = 0; if (!live() || !amb) return;
    const pr = amb.pr, t = ctx.currentTime + 0.05, r = Math.random();
    const outdoors = ['sea', 'street', 'wind'].includes(pr.p);
    if (outdoors && !pr.night && r < 0.55) gull(t);
    else if (outdoors && pr.night && pr.p !== 'sea' && r < 0.7) crickets(t);
    else if (pr.p === 'murmur' && r < 0.6) { tone(2400 + Math.random() * 900, t, 0.25, 0.03, 'sine', bus.amb); tone(3600 + Math.random() * 500, t + 0.02, 0.18, 0.015, 'sine', bus.amb); }
    else if ((pr.house === 'margaret' && pr.loc !== 'dan_room') || (pr.loc === 'lh_living' && pr.night)) clock(t, 6);
    else if ((pr.p === 'attic' || pr.p === 'lighthouse') && r < 0.45) creak(t);
    else if (pr.p === 'boathouse' && r < 0.5) burst(t, 0.6, 0.05, 'lowpass', 500, bus.amb, brown);
    evTimer = setTimeout(ambEvent, 3500 + Math.random() * 7000);
  }
  function gull(t) { const o = ctx.createOscillator(); o.type = 'triangle'; const g = ctx.createGain(); const f = 1400 + Math.random() * 500; const b = filt('bandpass', 1800, 2);
    for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) { const s = t + i * 0.32; o.frequency.setValueAtTime(f, s); o.frequency.exponentialRampToValueAtTime(f * 0.62, s + 0.22); g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.035, s + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.24); }
    o.connect(b).connect(g).connect(bus.amb); o.start(t); o.stop(t + 1.4); }
  function crickets(t) { for (let i = 0; i < 6; i++) tone(4300 + Math.random() * 200, t + i * 0.09, 0.04, 0.012, 'sine', bus.amb, 0.004); }
  function clock(t, n) { for (let i = 0; i < n; i++) { burst(t + i, 0.03, 0.05, 'bandpass', 2600, bus.amb); tone(1100, t + i, 0.04, 0.012, 'sine', bus.amb, 0.002); } }
  function creak(t) { const o = ctx.createOscillator(); o.type = 'sawtooth'; const b = filt('bandpass', 700, 6); const g = ctx.createGain(); const f = 70 + Math.random() * 50;
    o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.6, t + 0.6); env(g, t, 0.2, 0.025, 0.6); o.connect(b).connect(g).connect(bus.amb); o.start(t); o.stop(t + 1); }

  /* ---------- music: one quiet theme per host ---------- */
  const N = m => 440 * Math.pow(2, (m - 69) / 12);
  const THEMES = {
    elias: { chords: [[57, 61, 64, 68], [54, 57, 61, 64], [50, 54, 57, 61, 64], [52, 56, 59, 62]], bar: 8, pad: 'sine', lvl: 0.05, melody: [69, 71, 73, 76, 78], every: 2.6, mel: 'triangle' },
    leo: { chords: [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]], bar: 4, pad: 'triangle', lvl: 0.03, arp: true, step: 0.33, mel: 'triangle' },
    margaret: { chords: [[50, 53, 57, 64], [46, 50, 53, 57], [43, 46, 50, 55], [45, 49, 52, 57]], bar: 10, pad: 'sine', lvl: 0.045, melody: [62, 65, 69, 72, 74], every: 4.6, mel: 'sine', piano: true },
    evelyn: { chords: [[50, 54, 58], [52, 56, 60], [48, 52, 56], [46, 50, 54]], bar: 12, pad: 'sine', lvl: 0.04, detune: 3, melody: [74, 78, 82, 84], every: 5.5, mel: 'sine' },
    victor: { chords: [[45, 48, 52], [45, 46, 52], [41, 45, 48], [44, 47, 50]], bar: 6, pad: 'triangle', lvl: 0.03, pulse: 33, step: 1, mel: 'sine' }
  };
  let sticky = '';   // a host's theme stays for the whole conversation, not just their lines
  function themeFor(s) {
    if (!s) return '';
    const talking = typeof RUN !== 'undefined' && !!RUN;
    const sp = typeof VIEW !== 'undefined' && VIEW.speaker;
    if (sp && THEMES[sp]) sticky = sp; else if (!talking) sticky = '';
    if (sticky) return sticky;
    const h = (GAME.LOC[s.loc] || {}).house; if (h && THEMES[h]) return h;
    return '';
  }
  function startMusic(id) {
    const th = THEMES[id]; const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(bus.music);
    const lp = filt('lowpass', 2200); lp.connect(g);
    g.gain.setTargetAtTime(1, ctx.currentTime, 1.2);
    return { id, th, g, lp, next: ctx.currentTime + 0.1, chord: 0, nextMel: ctx.currentTime + 1.5, nodes: [] };
  }
  function note(m, f, t, dur, peak, type, detune = 0) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune; const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + Math.min(1.5, dur * 0.3)); g.gain.setTargetAtTime(0.0001, t + dur * 0.7, dur * 0.12);
    o.connect(g).connect(m.lp); o.start(t); o.stop(t + dur * 1.3); o.onended = () => { try { g.disconnect(); } catch (e) {} };
  }
  function pluck(m, f, t, peak, type, dec = 0.5) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; const g = ctx.createGain(); env(g, t, 0.006, peak, dec); o.connect(g).connect(m.lp); o.start(t); o.stop(t + dec + 0.1); }
  function schedule() {
    musTimer = 0; if (!live() || !mus) return;
    const m = mus, th = m.th, ahead = ctx.currentTime + 1.2;
    while (m.next < ahead) {
      const ch = th.chords[m.chord % th.chords.length]; const t = m.next;
      if (th.arp) { ch.concat([ch[0] + 12]).forEach((n, i) => { if (Math.random() < 0.8) pluck(m, N(n + 12), t + i * th.step, 0.05, th.mel, 0.55); }); ch.forEach(n => note(m, N(n), t, th.bar, th.lvl * 0.6, th.pad)); }
      else {
        ch.forEach(n => { note(m, N(n), t, th.bar, th.lvl, th.pad); if (th.detune) note(m, N(n), t, th.bar, th.lvl * 0.8, th.pad, th.detune * 10); });
        if (th.pulse) for (let b = 0; b < th.bar; b++) pluck(m, N(th.pulse), t + b * th.step, 0.09, 'sine', 0.35);
      }
      m.next += th.bar; m.chord++;
    }
    if (th.melody && m.nextMel < ahead) {
      const n = th.melody[Math.random() * th.melody.length | 0];
      if (th.piano) { pluck(m, N(n), m.nextMel, 0.035, 'sine', 2.2); pluck(m, N(n) * 2, m.nextMel, 0.008, 'sine', 1.2); } else note(m, N(n), m.nextMel, 3, 0.022, th.mel);
      m.nextMel += th.every * (0.7 + Math.random() * 0.6);
    }
    musTimer = setTimeout(schedule, 700);
  }

  /* ---------- the scene: pick ambience and music for where you are ---------- */
  let lastScene = null;
  function scene(s, forceTitle) {
    lastScene = { s, forceTitle };
    if (!live()) return;
    const pr = forceTitle ? profileOf('harbor', 3) : profileOf(s.loc, s.slot);
    const key = pr.p + '|' + pr.night + '|' + pr.house + '|' + pr.loc;
    if (key !== ambKey) { const old = amb; amb = buildAmb(pr); ambKey = key; stopLayer(old, 1.2); if (!evTimer) evTimer = setTimeout(ambEvent, 2500); }
    const th = forceTitle ? '' : themeFor(s);
    if (th !== musKey) { if (mus) stopLayer({ g: mus.g, nodes: [] }, 2); mus = th ? startMusic(th) : null; musKey = th; }
    /* restart the loops if they stopped while sound was briefly unavailable */
    if (amb && !evTimer) evTimer = setTimeout(ambEvent, 2500);
    if (mus && !musTimer) { if (mus.next < ctx.currentTime) { mus.next = ctx.currentTime + 0.1; mus.nextMel = ctx.currentTime + 1.5; } schedule(); }
  }
  function silenceAll() {
    if (evTimer) { clearTimeout(evTimer); evTimer = 0; } if (musTimer) { clearTimeout(musTimer); musTimer = 0; }
    if (amb) stopLayer(amb, 0.3); if (mus) stopLayer({ g: mus.g, nodes: [] }, 0.3); amb = null; mus = null; ambKey = ''; musKey = '';
    voice.forEach(o => { try { o.stop(); } catch (e) {} }); voice = [];
  }

  /* ---------- voices: murmured blips, never words ---------- */
  const VOICE = { elias: { f: 105, rate: 0.13, type: 'sawtooth' }, leo: { f: 165, rate: 0.085 }, margaret: { f: 205, rate: 0.12, type: 'sine' }, evelyn: { f: 230, rate: 0.095 }, victor: { f: 118, rate: 0.12, type: 'sine' } };
  function voiceOf(id) {
    if (VOICE[id]) return Object.assign({ type: 'triangle' }, VOICE[id]);
    const sp = (PEOPLE.SPEC || {})[id] || {}; const age = sp.age || 35;
    const f = sp.sex === 'f' ? 225 - (age - 30) * 0.7 : 135 - (age - 30) * 0.45;
    return { f: Math.max(80, f), rate: 0.09 + Math.max(0, age - 40) * 0.0008, type: 'triangle' };
  }
  function speak(id, text, expr) {
    voice.forEach(o => { try { o.stop(); } catch (e) {} }); voice = [];
    const v = voiceOf(id); let f = v.f, rate = v.rate, peak = 0.1;
    if (expr === 'angry') { f *= 0.94; rate *= 0.85; peak = 0.13; } else if (expr === 'sad') { f *= 0.92; rate *= 1.25; peak = 0.07; } else if (expr === 'smile') f *= 1.06; else if (expr === 'shock') { f *= 1.18; peak = 0.12; }
    const n = Math.max(2, Math.min(7, Math.round((text || '').length / 14)));
    const t0 = ctx.currentTime + 0.03; const b = filt('bandpass', 1100, 0.9); const g = ctx.createGain(); g.gain.value = 1; b.connect(g).connect(bus.voice);
    for (let i = 0; i < n; i++) {
      const t = t0 + i * rate * (0.8 + Math.random() * 0.5); const o = ctx.createOscillator(); o.type = v.type || 'triangle';
      const ff = f * (0.9 + Math.random() * 0.22); o.frequency.setValueAtTime(ff, t); o.frequency.linearRampToValueAtTime(ff * (i === n - 1 ? 0.88 : 1.03), t + rate * 0.7);
      const eg = ctx.createGain(); env(eg, t, 0.012, peak, rate * 0.75); o.connect(eg).connect(b); o.start(t); o.stop(t + rate + 0.05); voice.push(o);
    }
  }

  /* ---------- effects ---------- */
  const FX = {
    tap: t => tone(1900, t, 0.03, 0.025, 'sine'),
    door: t => { burst(t, 0.28, 0.12, 'lowpass', 320, bus.sfx, brown); tone(72, t, 0.25, 0.09, 'sine'); },
    steps: t => { for (let i = 0; i < 3; i++) burst(t + i * 0.27, 0.08, 0.07, 'lowpass', 420 + Math.random() * 120, bus.sfx, brown); },
    phone: t => { tone(880, t, 0.06, 0.04); tone(1320, t + 0.09, 0.07, 0.04); },
    map: t => burst(t, 0.22, 0.05, 'highpass', 2200),
    end: t => { [57, 61, 64, 69].forEach((m, i) => tone(N(m), t + i * 0.18, 3.2, 0.035, 'sine', bus.sfx, 0.4)); },
    knock: t => { [0, 0.22, 0.75, 0.97].forEach(d => { tone(95, t + d, 0.12, 0.14, 'sine'); burst(t + d, 0.04, 0.06, 'bandpass', 900); }); },
    clock: t => clock(t, 3),
    thunder: t => burst(t, 2.8, 0.22, 'lowpass', 180, bus.sfx, brown),
    /* the Keeper appears: a cold breath and a high glassy shimmer */
    ghost: t => { burst(t, 1.6, 0.09, 'bandpass', 420, bus.sfx, brown); [1760, 1864, 2637].forEach((f, i) => tone(f, t + 0.1 + i * 0.05, 1.4, 0.012, 'sine', bus.sfx, 0.5)); tone(55, t, 1.8, 0.05, 'sine', bus.sfx, 0.4); },
    /* the Keeper screams: a torn, falling howl with a noise blast. Loud, short, never stacked. */
    scream: t => {
      const ws = ctx.createWaveShaper(); const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 4); } ws.curve = c;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.03); g.gain.setTargetAtTime(0.0001, t + 0.7, 0.18);
      const lp = filt('lowpass', 3800); ws.connect(lp).connect(g).connect(bus.sfx);
      [[880, 0], [1245, 7], [660, -9]].forEach(([f, d]) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.detune.value = d * 10; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.45, t + 1.1);
        const v = ctx.createOscillator(); v.frequency.value = 13; const vg = ctx.createGain(); vg.gain.value = f * 0.05; v.connect(vg).connect(o.frequency); v.start(t); v.stop(t + 1.2); o.connect(ws); o.start(t); o.stop(t + 1.2); });
      burst(t, 0.5, 0.25, 'highpass', 1200);
      setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 2500);
    },
    /* 3:07: distant, delighted laughter through a wall — quiet, a few seconds, never stacked */
    laugh: t => {
      const lp = filt('lowpass', 1700); const dl = ctx.createDelay(1); dl.delayTime.value = 0.23; const fb = ctx.createGain(); fb.gain.value = 0.33;
      const g = ctx.createGain(); g.gain.value = 0.9; lp.connect(g).connect(bus.sfx); lp.connect(dl); dl.connect(fb).connect(dl); dl.connect(g);
      const base = 520 + Math.random() * 60;
      for (let i = 0; i < 7; i++) { const s = t + i * 0.17 + (i > 3 ? 0.35 : 0); const f = base * (1 + (i % 2) * 0.06) * (1 - i * 0.012);
        [1, 1.5].forEach((k, j) => { const o = ctx.createOscillator(); o.type = j ? 'sine' : 'triangle'; o.frequency.setValueAtTime(f * k, s); o.frequency.exponentialRampToValueAtTime(f * k * 0.86, s + 0.12);
          const eg = ctx.createGain(); env(eg, s, 0.015, j ? 0.025 : 0.06, 0.11); o.connect(eg).connect(lp); o.start(s); o.stop(s + 0.2); }); }
      setTimeout(() => { try { g.disconnect(); dl.disconnect(); } catch (e) {} }, 5000);
    }
  };
  function sfx(name) {
    if (!live() || !FX[name]) return;
    const now = performance.now(); const gap = name === 'laugh' || name === 'knock' || name === 'thunder' ? 20000 : name === 'scream' ? 8000 : name === 'tap' ? 60 : 250;
    if (now - (lastCue[name] || 0) < gap) return; lastCue[name] = now;
    FX[name](ctx.currentTime + 0.02);
  }
  /* sounds suggested by what the story says (English text is the reference; the story files are untouched) */
  const CUES = [
    [/a child laughs|the laughter starts|it laughed again|the laugh again|laugh is coming from the wall|the laugh is everywhere/i, 'laugh'],
    [/knock-knock/i, 'knock'],
    [/grandfather clock/i, 'clock'],
    [/thunder|lightning/i, 'thunder']
  ];
  function line(st) {
    if (!live() || !st) return;
    const raw = st.c ? st.t : st.n; const en = raw && typeof raw === 'object' ? (raw.en || '') : (typeof raw === 'string' ? raw : '');
    if (st.c) speak(st.c, en || tx(raw), st.e);
    for (const [re, name] of CUES) if (re.test(en)) { sfx(name); break; }
  }

  /* ---------- unlocking, sleep, settings ---------- */
  function unlock() {
    if (!set.on) return;
    if (!ensure()) return;
    const go = () => { unlocked = true; applyVol(); if (lastScene) scene(lastScene.s, lastScene.forceTitle); };
    if (ctx.state !== 'running') ctx.resume().then(go, () => {}); else go();
  }
  ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach(t => document.addEventListener(t, ev => { if (ev.isTrusted && set.on && (!ctx || ctx.state !== 'running' || !unlocked) && !asleep()) unlock(); }, { passive: true, capture: true }));
  if (typeof POWER !== 'undefined') POWER.onSleep(sleeping => {
    if (!ctx) return;
    if (sleeping) { silenceAll(); ctx.suspend().catch(() => {}); }
    else if (set.on && unlocked) ctx.resume().then(() => { if (lastScene) scene(lastScene.s, lastScene.forceTitle); }, () => {});
  });
  function setOn(v) {
    set.on = !!v; save();
    if (set.on) unlock(); else if (ctx) { applyVol(); silenceAll(); setTimeout(() => { if (!set.on && ctx) ctx.suspend().catch(() => {}); }, 200); }
  }
  function setVol(k, v) { set[k] = Math.max(0, Math.min(1, v)); save(); applyVol(); }
  return {
    get on() { return set.on; }, settings: set, setOn, setVol,
    scene, line, sfx, unlock,
    /* for tests */
    _state: () => ({ ctx: ctx && ctx.state, unlocked, amb: ambKey, music: musKey, evTimer: !!evTimer, musTimer: !!musTimer })
  };
})();
