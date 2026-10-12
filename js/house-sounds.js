/* =====================================================================
   House sounds: each house has its own small noises, now and then,
   on top of the background ambience in js/audio.js.
     Elias's cottage   kettle in the morning, the kitchen tap dripping,
                       the stove crackling and the radio in the evening
     Leo's boathouse   ropes creaking, the hull knocking on the water
     The Grand         the lift's bell, a few notes of the lobby piano
     The lighthouse    a foghorn far out at night (nothing else is touched:
                       the keeper and the 3:07 sounds stay exactly as they are)
     Sami's attic      the shop bell downstairs by day, the pipes at night
   Margaret's house already has its clock. Everything is made in the
   browser, quietly, on the ambience volume; nothing to download.
   ===================================================================== */
'use strict';
(function () {
  if (typeof AUDIO === 'undefined' || !AUDIO.houseSounds) return;
  const H = AUDIO.houseSounds, rnd = (a, b) => a + Math.random() * (b - a);
  const slot = () => (GAME.S ? GAME.S.slot : 2);

  /* small recipes */
  const drip = (k, t) => { const n = 2 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) k.tone(rnd(1350, 1650), t + i * rnd(0.7, 1.1), 0.06, 0.014, 'sine', 0.003); };
  const kettle = (k, t) => { [1650, 1720, 1800, 1880, 1950].forEach((f, i) => k.tone(f, t + i * 0.35, 0.4, 0.004 + i * 0.0012, 'sine', 0.15)); };
  const crackle = (k, t) => { const n = 4 + (Math.random() * 5 | 0); for (let i = 0; i < n; i++) k.burst(t + rnd(0, 1.6), 0.02, rnd(0.02, 0.05), 'highpass', rnd(2500, 4200)); };
  const radio = (k, t) => { for (let i = 0; i < 6; i++) k.burst(t + i * 0.28, 0.24, rnd(0.008, 0.016), 'bandpass', rnd(700, 1100)); };
  const hull = (k, t) => { k.burst(t, 0.35, 0.05, 'lowpass', 180, true); if (Math.random() < 0.5) k.burst(t + 0.6, 0.3, 0.035, 'lowpass', 160, true); };
  const lift = (k, t) => { k.tone(1318.5, t, 0.9, 0.012, 'sine', 0.005); k.tone(1046.5, t + 0.32, 1.1, 0.012, 'sine', 0.005); };
  const piano = (k, t) => { const scale = [261.6, 293.7, 329.6, 392, 440, 523.3]; for (let i = 0; i < 3 + (Math.random() * 3 | 0); i++) k.tone(scale[Math.random() * scale.length | 0], t + i * rnd(0.35, 0.6), 1.2, 0.006, 'triangle', 0.01); };
  const foghorn = (k, t) => { k.tone(92, t, 2.6, 0.03, 'sawtooth', 0.6); k.tone(184, t, 2.6, 0.008, 'sine', 0.6); };
  const shopBell = (k, t) => { k.tone(2093, t, 0.5, 0.008, 'sine', 0.003); k.tone(2637, t + 0.06, 0.45, 0.006, 'sine', 0.003); };
  const pipes = (k, t) => { for (let i = 0; i < 2 + (Math.random() * 3 | 0); i++) k.burst(t + i * rnd(0.15, 0.4), 0.08, 0.04, 'lowpass', 220, true); };

  H.elias = (k, pr, t) => {
    const s = slot(), r = Math.random();
    if (s <= 1 && r < 0.4) kettle(k, t);
    else if (pr.loc === 'kitchen' || pr.loc === 'bath' ? r < 0.7 : r < 0.3) drip(k, t);
    else if (s >= 3) (r < 0.65 ? crackle : radio)(k, t);
  };
  H.leo = (k, pr, t) => (Math.random() < 0.5 ? k.creak(t) : hull(k, t));
  H.victor = (k, pr, t) => (Math.random() < 0.55 ? lift(k, t) : piano(k, t));
  H.evelyn = (k, pr, t) => { if (pr.night && pr.loc !== 'lh_attic' && Math.random() < 0.35) foghorn(k, t); };
  H.sami_attic = (k, pr, t) => (pr.night ? pipes(k, t) : shopBell(k, t));
})();
