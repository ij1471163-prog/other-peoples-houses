/* =====================================================================
   Smart power saving, on top of js/power.js (look only).
     · The living details (js/ambient-fx.js) run at 30 frames a second,
       slow to 8 when nobody has touched the screen for a while, and stop
       when the app is in the background.
     · "Saver" mode turns the heavier decoration off (particles, shimmer,
       birds, glowing-spot pulses, breathing): on its own when the battery
       is low and not charging, or when the phone can't keep up. It comes
       back when the phone is charging again.
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
})();
