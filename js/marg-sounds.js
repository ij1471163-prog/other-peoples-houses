/* =====================================================================
   Margaret's house, heard (sound only).
   Besides her stopped-and-started clock, now and then, while she is home:
     · by day: dishes in the sink, the iron (steam and a thump), the kettle;
     · at seven: two plates set on the table, a chair pulled out;
     · at night: crying through the wall, muffled (her own recorded sob,
       far away), slow steps upstairs, a door that creaks.
   Real recordings can replace any of them later: put the file in img/snd/
   and add its name to REAL below.
   ===================================================================== */
'use strict';
(function () {
  if (typeof AUDIO === 'undefined' || !AUDIO.houseSounds) return;
  const H = AUDIO.houseSounds, rnd = (a, b) => a + Math.random() * (b - a);
  const REAL = {};   /* e.g. { hum: 'marg-hum', dishes: 'marg-dishes' } once recorded files are added */
  const S = () => GAME.S;
  const home = s => s && GAME.CHAR.margaret && !!GAME.CHAR.margaret.where && !!GAME.CHAR.margaret.where(s);

  const dishes = (k, t) => { k.burst(t, rnd(1.2, 1.8), 0.02, 'highpass', 1800, false); for (let i = 0; i < 3 + (Math.random() * 3 | 0); i++) k.tone(rnd(2400, 3600), t + rnd(0.1, 1.6), 0.12, 0.012, 'sine', 0.002); };
  const iron = (k, t) => { k.burst(t, 0.18, 0.05, 'lowpass', 240, true); k.burst(t + 0.25, 0.7, 0.018, 'highpass', 3000, false); k.burst(t + 1.4, 0.18, 0.05, 'lowpass', 240, true); };
  const kettle = (k, t) => { [1650, 1720, 1800, 1880, 1950, 2020].forEach((f, i) => k.tone(f, t + i * 0.3, 0.4, 0.004 + i * 0.0012, 'sine', 0.15)); };
  const plates = (k, t) => { k.tone(rnd(1800, 2200), t, 0.25, 0.015, 'sine', 0.002); k.tone(rnd(1800, 2200), t + 0.6, 0.25, 0.015, 'sine', 0.002); k.burst(t + 1.3, 0.45, 0.03, 'lowpass', 500, true); };
  const steps = (k, t) => { for (let i = 0; i < 4; i++) k.burst(t + i * rnd(0.55, 0.75), 0.1, 0.05, 'lowpass', 260, true); };
  /* a recording played far away: through a low-pass, quietly, on the ambience */
  function muffled(k, name, gain) {
    try {
      const a = new Audio('img/snd/' + name + '.mp3'); a.crossOrigin = 'anonymous';
      const src = k.ctx.createMediaElementSource(a), lp = k.ctx.createBiquadFilter(), g = k.ctx.createGain();
      lp.type = 'lowpass'; lp.frequency.value = 850; g.gain.value = gain;
      src.connect(lp).connect(g).connect(k.out); a.play().catch(() => {});
      return true;
    } catch (e) { return false; }
  }

  const d0 = H._dread;
  H._dread = (k, pr, t) => {
    try {
      const s = S();
      if (pr.house === 'margaret' && pr.loc !== 'dan_room' && home(s) && Math.random() < 0.45) {
        const r = Math.random();
        if (pr.night) {
          if (r < 0.4) return muffled(k, 'marg-sob', 0.35);
          if (r < 0.75) { steps(k, t); return true; }
          k.creak(t); return true;
        }
        if (s.slot === 3) { if (r < 0.6) { plates(k, t); return true; } return REAL.hum ? muffled(k, REAL.hum, 0.4) : false; }
        if (REAL.dishes && r < 0.25) return muffled(k, REAL.dishes, 0.5);
        if (r < 0.45) dishes(k, t); else if (r < 0.8) iron(k, t); else kettle(k, t);
        return true;
      }
    } catch (e) { /* fall through */ }
    return d0 ? d0(k, pr, t) : false;
  };
})();
