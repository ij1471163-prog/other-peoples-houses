/* =====================================================================
   Frightening places sound frightening after dark (sound only; nothing
   in the story, the scares or the endings changes).
     Cemetery      whispers, a low swell, steps on gravel that aren't
                   yours, and now and then a far-off scream
     Harbor, dock, the buoy bell in the dark, water slapping under the
     beach         boards, a rope pulling tight, a whisper off the water
     Lighthouse    steps on the floor above, a knock on the attic door
                   (the keeper's own sounds are left as they are)
   The scream only plays with Jump scares on (phone > Settings).
   Everything is made in the browser on the ambience volume.
   ===================================================================== */
'use strict';
(function () {
  if (typeof AUDIO === 'undefined' || !AUDIO.houseSounds) return;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const scaresOn = () => typeof SCARES === 'undefined' || SCARES.on;

  /* ---- recipes (k = the kit from js/audio.js) ---- */
  function noise(k, t, dur, buf, type, f, q, peak, attack = 0.05) {
    const c = k.ctx, s = c.createBufferSource(); s.buffer = buf; s.loop = true;
    const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(b).connect(g).connect(k.out); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.1);
    return { b, g };
  }
  /* breathy syllables, like someone whispering just behind you */
  function whisper(k, t) {
    const n = 4 + (Math.random() * 5 | 0); let at = t;
    for (let i = 0; i < n; i++) {
      const d = rnd(0.12, 0.32); const { b } = noise(k, at, d, k.white, 'bandpass', rnd(1400, 3200), 6, rnd(0.05, 0.1), 0.03);
      b.frequency.linearRampToValueAtTime(rnd(1200, 3400), at + d);
      at += d + rnd(0.03, 0.14);
    }
  }
  /* a low swell you feel more than hear */
  function swell(k, t) {
    const c = k.ctx;
    [41, 43.5].forEach(f => { const o = c.createOscillator(); o.frequency.value = f; const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.013, t + 2.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
      o.connect(g).connect(k.out); o.start(t); o.stop(t + 5.2); });
    noise(k, t, 4.5, k.brown, 'lowpass', 120, 0.7, 0.013, 2);
  }
  /* footsteps that aren't yours: gravel, or boards upstairs */
  function steps(k, t, gravel) {
    const n = 3 + (Math.random() * 4 | 0), gap = rnd(0.5, 0.72);
    for (let i = 0; i < n; i++) {
      const at = t + i * gap;
      if (!gravel) { noise(k, at, 0.22, k.brown, 'lowpass', 140, 1, 0.075, 0.012); continue; }
      /* a foot on gravel: a soft weight, then many tiny stones crunching, not one sharp hit */
      noise(k, at, 0.2, k.brown, 'lowpass', 160, 0.8, 0.03, 0.03);
      const grains = 14 + (Math.random() * 10 | 0);
      for (let g = 0; g < grains; g++) noise(k, at + 0.02 + Math.random() * 0.2, rnd(0.008, 0.02), k.white, 'bandpass', rnd(700, 1500), 2, rnd(0.004, 0.012), 0.002);
    }
  }
  /* three knocks on a door */
  function knocks(k, t) { for (let i = 0; i < 3; i++) noise(k, t + i * 0.42, 0.2, k.brown, 'lowpass', 180, 1.2, 0.065, 0.01); }
  /* a far scream on the wind: a voice that rises, wavers and breaks off */
  function scream(k, t) {
    const c = k.ctx, o = c.createOscillator(), o2 = c.createOscillator(); o.type = 'sawtooth'; o2.type = 'sawtooth';
    const f0 = rnd(520, 700); o.frequency.setValueAtTime(f0 * 0.7, t); o.frequency.exponentialRampToValueAtTime(f0, t + 0.35); o.frequency.exponentialRampToValueAtTime(f0 * 0.82, t + 1.6);
    o2.frequency.setValueAtTime(f0 * 0.71, t); o2.frequency.exponentialRampToValueAtTime(f0 * 1.01, t + 0.35); o2.frequency.exponentialRampToValueAtTime(f0 * 0.8, t + 1.6);
    const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 6.5; vg.gain.value = f0 * 0.03; vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 1100; f1.Q.value = 3;
    const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 2200;   /* far away: the top is gone */
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.021, t + 0.25); g.gain.setValueAtTime(0.021, t + 1.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.75);
    o.connect(f1); o2.connect(f1); f1.connect(f2).connect(g).connect(k.out);
    [o, o2, vib].forEach(x => { x.start(t); x.stop(t + 1.9); });
    noise(k, t + 0.2, 2.2, k.white, 'bandpass', 600, 0.8, 0.02, 0.5);   /* the wind carrying it */
  }
  /* the buoy bell out in the dark */
  function bell(k, t) { const n = 1 + (Math.random() * 2 | 0); for (let i = 0; i < n; i++) { const s = t + i * rnd(1.4, 2.2); k.tone(312, s, 3.2, 0.008, 'sine', 0.004); k.tone(745, s, 2.2, 0.0032, 'sine', 0.004); k.tone(1187, s, 1.2, 0.0016, 'sine', 0.004); } }
  /* water slapping under the boards */
  function slap(k, t) {
    /* slow water under the boards: a soft swell and a hollow gulp, never a sharp hit */
    for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) {
      const at = t + i * rnd(0.6, 1.1);
      noise(k, at, 0.7, k.brown, 'lowpass', 240, 0.7, 0.03, 0.18);
      const c = k.ctx, o = c.createOscillator(), g = c.createGain(); const f = rnd(160, 230);
      o.frequency.setValueAtTime(f, at + 0.12); o.frequency.exponentialRampToValueAtTime(f * 0.45, at + 0.32);
      g.gain.setValueAtTime(0.0001, at + 0.12); g.gain.exponentialRampToValueAtTime(0.012, at + 0.16); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.36);
      o.connect(g).connect(k.out); o.start(at + 0.12); o.stop(at + 0.4);
    }
  }
  /* a rope pulling tight */
  function rope(k, t) {
    const c = k.ctx, o = c.createOscillator(); o.type = 'sawtooth'; const f = rnd(55, 80); o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 2.4, t + 1.2);
    const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 520; b.Q.value = 9;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    o.connect(b).connect(g).connect(k.out); o.start(t); o.stop(t + 1.4);
  }

  AUDIO.houseSounds._dreadParts = { whisper, swell, steps, knocks, scream, bell, slap, rope };   /* for listening tests */
  const SHORE = ['harbor', 'dock', 'beach'];
  AUDIO.houseSounds._dread = (k, pr, t) => {
    const dark = pr.night, dusk = pr.evening, r = Math.random();
    if (pr.loc === 'cemetery' && (dark || dusk)) {
      const m = dark ? 1 : 0.5;
      if (r < 0.22 * m) { whisper(k, t); return true; }
      if (r < 0.38 * m) { swell(k, t); return true; }
      if (r < 0.52 * m) { steps(k, t, true); return true; }
      if (dark && r < 0.58 && scaresOn()) { scream(k, t); return true; }
      return false;
    }
    if (SHORE.includes(pr.loc) && dark) {
      if (r < 0.2) { bell(k, t); return true; }
      if (r < 0.34) { slap(k, t); return true; }
      if (r < 0.44) { rope(k, t); return true; }
      if (r < 0.52) { whisper(k, t); return true; }
      if (r < 0.58) { swell(k, t); return true; }
      return false;
    }
    if (pr.house === 'evelyn' && dark) {
      if (r < 0.14) { steps(k, t, false); return true; }
      if (pr.loc === 'lh_attic' && r < 0.24) { knocks(k, t); return true; }
      if (r < 0.3) { whisper(k, t); return true; }
      if (r < 0.34 && scaresOn()) { scream(k, t); return true; }
      return false;
    }
    return false;
  };
})();
