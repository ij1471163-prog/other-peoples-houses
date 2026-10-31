/* =====================================================================
   Never stuck between chapters.
   After Elias's chapter ends you always land somewhere: with Margaret
   if he threw you out, otherwise with Leo. If a game was ever left in
   between (closed in the middle of that scene, or an older save), the
   next time you are free to walk, that same scene simply plays.
   Also: when Elias throws you out, the button no longer says "Chapter 2:
   Leo" (it's Margaret who finds you).
   Story text, conditions and endings are unchanged.
   ===================================================================== */
'use strict';
(function () {
  if (GAME.END.ELIAS_KICK) GAME.END.ELIAS_KICK.nextLabel = 'continueStory';
  function stuck(s) {
    if (!s || RUN || s.f.prologue || s.f.finale || s.host || !s.f.eliasEnd) return null;
    const kicked = s.f.eliasEnd === 'ELIAS_KICK';
    if (kicked && !s.done.margaret && !s.f.metLeo && !s.f.leoStarted && GAME.SCRIPTS.margKicked) return 'margKicked';
    if (!s.f.metLeo && !s.f.leoEnded && !(s.done && s.done.leo) && (!kicked || s.done.margaret) && GAME.SCRIPTS.ch2start) return 'ch2start';
    return null;
  }
  const rl0 = renderLocation;
  renderLocation = function () {
    const s = S(), k = stuck(s);
    if (k) { if (k === 'ch2start') s.f.leoStarted = true; play(GAME.SCRIPTS[k](s)); return; }
    return rl0.apply(this, arguments);
  };
})();
