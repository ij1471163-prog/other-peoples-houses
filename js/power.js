/* =====================================================================
   Other People's Houses — power saving (idle and background)
   The game has no game loop: time in Saltmere only moves when the player
   acts (talk, wait, sleep, travel), so nothing has to be "caught up" when
   the screen comes back. What does burn battery on a phone is decoration
   that animates forever: the characters' breathing and the pulsing
   hotspots. This file pauses that decoration:
     · idle   — no touch or key for IDLE_MS while reading a scene
     · asleep — the tab/app is hidden or the screen is locked
   Gameplay animation (the fishing bar) is never paused. Sound is
   suspended while asleep and resumed on return (see js/audio.js).
   One timer, three listeners, all registered once.
   ===================================================================== */
'use strict';
const POWER = (() => {
  const IDLE_MS = 20000;
  const root = document.documentElement;
  let last = performance.now(), timer = 0, idle = false, asleep = false;
  const listeners = [];
  function setIdle(v) { if (idle === v) return; idle = v; root.classList.toggle('idle', v); }
  function check() { timer = 0; const left = IDLE_MS - (performance.now() - last); if (left <= 0) setIdle(true); else timer = setTimeout(check, left); }
  function poke() { last = performance.now(); if (idle) setIdle(false); if (!timer && !asleep) timer = setTimeout(check, IDLE_MS); }
  function setAsleep(v) {
    if (asleep === v) return; asleep = v;
    root.classList.toggle('asleep', v);
    if (v) { if (timer) { clearTimeout(timer); timer = 0; } }
    else poke();
    listeners.forEach(fn => { try { fn(v); } catch (e) {} });
  }
  const hidden = () => document.visibilityState === 'hidden';
  document.addEventListener('visibilitychange', () => setAsleep(hidden()));
  window.addEventListener('pagehide', () => setAsleep(true));
  window.addEventListener('pageshow', () => setAsleep(hidden()));
  ['pointerdown', 'keydown', 'wheel'].forEach(t => document.addEventListener(t, poke, { passive: true, capture: true }));
  poke();
  return {
    get idle() { return idle; }, get asleep() { return asleep; },
    /* fn(asleep:boolean) is called when the app goes to the background or comes back */
    onSleep(fn) { listeners.push(fn); },
    poke
  };
})();
