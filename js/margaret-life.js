/* =====================================================================
   Margaret never stands in the same spot twice.
     · where she stands in the picture changes with the time and the day
       (by the window, at the table, in the doorway), and which way she
       faces
     · she moves about the house more: some days she is in the sitting
       room in the morning, some evenings by the window instead of the
       kitchen
     · her face when you walk in follows how she is: shy, worried, or
       staring at nothing at night
   Only how she is shown and which of her own rooms she is in. Nothing
   here reads or changes trust, suspicion or any ending.
   ===================================================================== */
'use strict';
(function () {
  const C = GAME.CHAR.margaret; if (!C) return;
  const inM = GAME.H && GAME.H.margaret ? GAME.H.margaret.inM : (s => s.host === 'margaret');
  const roll = (s, k) => ((s.day * 7 + s.slot * 3 + k) * 2654435761 >>> 0) % 1000 / 1000;

  /* 1. a little more moving about (only her own rooms, never the cemetery or Daniel's room, which the story needs) */
  const where0 = C.where;
  C.where = s => {
    const w = where0(s);
    if (!inM(s) || !s.f.metMarg) return w;
    if (s.slot === 0 && w === 'marg_kitchen' && roll(s, 1) < 0.35) return 'marg_living';
    if (s.slot === 1 && w === 'marg_living' && roll(s, 2) < 0.4) return 'marg_kitchen';
    if (s.slot === 3 && w === 'marg_kitchen' && roll(s, 3) < 0.35) return 'marg_living';
    return w;
  };

  /* 2. her face when nobody is talking */
  const pose0 = LIFE.pose;
  LIFE.pose = (id, s = S()) => {
    const p = pose0(id, s); if (id !== 'margaret' || p) return p;
    const im = PEOPLE.IMG.chars.margaret || {};
    if (!inM(s)) return null;
    const tense = (s.susp.margaret || 0) >= 1 || !!s.f.mAnswered;
    let e = 'neutral';
    if (s.slot === NIGHT) e = im.blank ? 'blank' : 'sad';
    else if (tense) e = roll(s, 5) < 0.5 && im.worry ? 'worry' : 'neutral';
    else if ((s.trust.margaret || 0) >= 5) e = roll(s, 6) < 0.6 ? 'smile' : 'neutral';
    else e = roll(s, 7) < 0.3 && im.worry ? 'worry' : 'neutral';
    return im[e] ? e : null;
  };

  /* 3. where she stands, and which way she faces */
  const SPOTS = {
    marg_living: [22, 40, 56, 74], marg_kitchen: [30, 48, 66], marg_bed: [40, 62], marg_guest: [34, 70], cemetery: [58, 70]
  };
  const rs0 = renderStage;
  renderStage = function () {
    const s = S(), L = GAME.LOC[s.loc], xs = SPOTS[s.loc];
    let x0 = null, alone = false;
    try {
      const list = (VIEW.stageChars || present(s.loc).map(id => ({ id }))).filter(c => c && GAME.CHAR[c.id] && GAME.CHAR[c.id].art);
      alone = list.length === 1 && list[0].id === 'margaret';
      if (alone && xs && L) { x0 = L.charX; L.charX = xs[Math.floor(roll(s, 9) * xs.length)]; }
    } catch (e) { /* none */ }
    const r = rs0.apply(this, arguments);
    if (x0 !== null) L.charX = x0;
    try {
      document.querySelectorAll('#stage .chars .char img[src*="/chars/margaret-"]').forEach(im => {
        const d = im.closest('.char'), x = parseFloat(d.style.left) || 50;
        /* she faces into the room: towards the middle of the picture */
        im.style.transform = (x > 52 ? 'scaleX(-1)' : '');
      });
    } catch (e) { /* none */ }
    return r;
  };
})();
