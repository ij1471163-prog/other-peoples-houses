/* =====================================================================
   Smart power saving, on top of js/power.js (look only).
     · The living details (js/ambient-fx.js) run at 30 frames a second,
       slow to 8 when nobody has touched the screen for a while, and stop
       when the app is in the background.
     · "Saver" mode turns the heavier decoration off (particles, shimmer,
       birds, glowing-spot pulses, breathing): on its own when the battery
       is low and not charging, or when the phone can't keep up. It comes
       back when the phone is charging again.
     · Deep sleep: when nobody has touched the screen for a minute and a
       half (reading, or the phone put down), everything the player isn't
       using sleeps: every decoration and animation is paused, the living
       details stop drawing, nobody walks past, the small ambience sounds
       stop (the soft background stays), and the picture dims a little.
       The first touch wakes it all, exactly where it was.
   Nothing here touches the story or the saves.
   ===================================================================== */
'use strict';
(function () {
  const root = document.documentElement;
  let byBattery = false;
  try {
    if (navigator.getBattery) navigator.getBattery().then(b => {
      const upd = () => {
        const low = !b.charging && b.level <= 0.2;
        if (low && !root.classList.contains('saver')) { root.classList.add('saver'); byBattery = true; }
        else if (!low && byBattery) { root.classList.remove('saver'); byBattery = false; }
      };
      upd(); b.addEventListener('levelchange', upd); b.addEventListener('chargingchange', upd);
    }).catch(() => {});
  } catch (e) { /* no battery information: nothing to do */ }

  /* deep sleep */
  const DEEP_MS = 90000;
  let t = 0;
  const wake = () => { if (root.classList.contains('deep')) root.classList.remove('deep'); clearTimeout(t); t = setTimeout(() => root.classList.add('deep'), DEEP_MS); };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(e => document.addEventListener(e, wake, { passive: true, capture: true }));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
  wake();
})();
