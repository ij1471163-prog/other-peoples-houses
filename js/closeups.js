/* =====================================================================
   Living close-ups, for a few moments only.
   In these scenes the character on screen is not a still picture: they
   breathe, their head moves a little on its own and turns towards your
   finger (the user's own engine: js/vendor/jelly-*.js, via js/jelly-pet.js).
   Only here, so the rest of the game stays light on the phone:
     · Elias, the last night in the living room, and what follows;
     · Margaret, the first time she shows you Biscuit;
     · Mira, the first time you meet her at the café.
   When the scene ends the engine stops and the picture is a picture again.
   If the phone can't do it, nothing changes. Look only.
   ===================================================================== */
'use strict';
(function () {
  if (typeof JELLY === 'undefined') return;
  let want = null, live = null, busy = false;
  const on = id => s => { want = id; return null; };
  function off() { want = null; if (live) { live.detach(); live = null; } document.querySelectorAll('.char.live').forEach(d => d.classList.remove('live')); }
  async function sync() {
    if (!RUN) { if (want || live) off(); return; }
    if (!want || busy) return;
    const d = document.querySelector('#stage .chars .char[data-id="' + want + '"]'), img = d && d.querySelector('img');
    if (!d || !img) { if (live) { live.detach(); live = null; } return; }
    if (live && live.src === img.src && d.classList.contains('live')) return;
    busy = true;
    if (live) { live.detach(); live = null; }
    const p = await JELLY.portrait(d, img);
    busy = false;
    if (!p) return;
    if (!RUN || !d.isConnected) { p.detach(); return; }
    live = p; d.classList.add('live');
  }
  const rs0 = renderStage;
  renderStage = function () { const r = rs0.apply(this, arguments); try { sync(); } catch (e) { console.error(e); } return r; };
  const as0 = afterScript;
  afterScript = function () { off(); return as0.apply(this, arguments); };

  /* the moments */
  const SC = GAME.SCRIPTS;
  if (SC.finale) { const f0 = SC.finale; SC.finale = function (s) { const out = f0.apply(this, arguments); return Array.isArray(out) ? [on('elias')].concat(out) : out; }; }
  const cage = GAME.LOC.marg_garden && GAME.LOC.marg_garden.spots.find(h => h.label && /A small cage/.test(h.label.en));
  if (cage) { const r0 = cage.run; cage.run = s => { const first = !s.f.bisSeen, out = r0(s); return first && Array.isArray(out) ? [on('margaret')].concat(out) : out; }; }
  const mm = GAME.EVENTS.find(e => e.id === 'miraMeet');
  if (mm) { const r0 = mm.run; mm.run = s => { const out = typeof r0 === 'function' ? r0(s) : r0; return Array.isArray(out) ? [on('mira')].concat(out) : out; }; }
})();
