/* =====================================================================
   Gentle hints: when nothing has moved for a whole day.
   The game watches for progress (a quest starting or finishing, a new
   thing learned or found). If a full day (five times of day) passes
   without any, the next time you arrive somewhere a thought comes back
   to you: one of your open tasks, with the hint the phone already has.
   At most once a day; never during the opening; never in the middle of
   a scene. Story tasks come first, side errands last.
   ===================================================================== */
'use strict';
(function () {
  const WAIT = 3;   // times of day without progress before a hint
  const MOVES = 8;  // or this many moves from place to place without progress
  /* errands around town: only hinted when no story task is open */
  const SIDE = ['q_cat', 'q_gift', 'q_voice', 'q_petition', 'q_boat', 'q_seagull', 'q_kai', 'q_sami', 'q_irene', 'q_pie', 'q_door'];
  /* always open, slow by nature: hinted after the story tasks */
  const SLOW = ['q_postcard', 'q_care', 'q_money'];

  /* what counts as progress: quests, things learned (flags), things carried.
     Counters that change by themselves (chatting, random moments, bathrooms) don't count. */
  const NOISE = /^(chat|loo|rv|last|newDay|hint|ev_)/;
  const sig = s => JSON.stringify([s.quests, Object.keys(s.f).filter(k => !NOISE.test(k) && s.f[k]).length, Object.keys(s.inv).filter(k => s.inv[k] > 0).sort()]);
  const now = s => s.day * 5 + s.slot;

  function pick(s) {
    /* a house's own tasks are only hinted while you live in that house (js/quest-close.js says which house):
       the hint must never send you to a door that isn't open to you, or to someone who is gone */
    const own = GAME.QUEST_OWNER || {};
    const open = Object.keys(s.quests).filter(k => s.quests[k] === 'active' && GAME.QUESTS[k] && GAME.QUESTS[k].hint && (!own[k] || own[k] === s.host));
    if (!open.length) return null;
    const rank = k => (SIDE.includes(k) ? 2 : SLOW.includes(k) ? 1 : 0);
    const best = Math.min(...open.map(rank));
    const pool = open.filter(k => rank(k) === best).reverse();   // newest first
    return pool.find(k => k !== s.f.hintLast) || pool[0];
  }

  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.push(s => {
    if (!s || s.f.prologue || !s.f.metElias || RUN || PREFS.get('hints') === false) return null;
    const g = sig(s);
    if (s.f.hintSig !== g) { s.f.hintSig = g; s.f.hintAt = now(s); s.f.hintMoves = 0; return null; }
    /* lost: walking from place to place without anything moving also counts, not only time passing */
    s.f.hintMoves = (s.f.hintMoves || 0) + 1;
    const lost = s.f.hintMoves >= MOVES;
    if (!lost && (now(s) - (s.f.hintAt || 0) < WAIT || s.f.hintDay === s.day)) return null;
    const k0 = GAME.NOW_TASK && GAME.NOW_TASK(s);
    const k = (k0 && GAME.QUESTS[k0] && GAME.QUESTS[k0].hint && k0 !== s.f.hintLast) ? k0 : pick(s); if (!k) return null;
    s.f.hintDay = s.day; s.f.hintAt = now(s); s.f.hintLast = k; s.f.hintMoves = 0;
    const Q = GAME.QUESTS[k];
    return [{ n: T('A thought keeps coming back. ' + Q.title.en + ': ' + Q.hint.en,
      'فيه فكرة ترجع لك كل شوي. ' + Q.title.ar + ': ' + Q.hint.ar) }];
  });
})();
