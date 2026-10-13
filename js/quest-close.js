/* =====================================================================
   Closing a chapter's tasks when its host's story ends.
   Before this, tasks like "One more night" or "Deadline" stayed open in
   the phone for the rest of the game, and the stuck-hints kept pointing
   at people who were gone. Now, when a host's ending is reached:
     · tasks the chapter's last night settles are marked done
       (only if that ending really settles them, see DONE below);
     · tasks that can no longer be done (that house's chores, its
       mysteries left unsolved) leave the phone quietly.
   Tasks that carry on into later chapters are not in these lists and
   are never touched: Who is "V."?, Pocket money, Look after yourself,
   the town errands, Three closed doors.
   Nothing here reads or changes an ending's conditions or text. It runs
   right after the ending card, and after every scene or move for older
   saves (s.done remembers which endings were reached).
   ===================================================================== */
'use strict';
(function () {
  const kicked = e => /_KICK$/.test(e);

  /* host -> { tasks: every task that belongs to that house, done: task -> (state, ending) => settled? } */
  const CH = {
    elias: { tasks: ['q_final', 'q_secret', 'q_thomas', 'q_nets', 'q_chess', 'q_dawn', 'q_bread', 'q_pie'],
      done: {
        q_final: (s, e) => !kicked(e),                                                   // the last night happened
        q_secret: (s, e) => !kicked(e) && (!!s.f.knowsIllness || ['ELIAS_STAY', 'ELIAS_LETTER', 'ELIAS_PEACE'].includes(e)),
        q_thomas: (s, e) => e === 'ELIAS_LETTER'                                         // Thomas gets the letter
      } },
    leo: { tasks: ['q_final2', 'q_rent', 'q_father', 'q_secret2', 'q_couch', 'q_deliver', 'q_draw'],
      done: {
        q_final2: (s, e) => !kicked(e),                                                  // the deadline night happened
        q_rent: (s, e) => e === 'LEO_STAY',                                              // only there is the rent paid (Sami's loan)
        q_father: (s, e) => e === 'LEO_HOME'                                             // only there does Leo go back to Frank
      } },
    margaret: { tasks: ['q_m_final', 'q_m_room', 'q_m_room2', 'q_m_garden', 'q_m_pills'],   // the pills can only be settled with Margaret, in her chapter
      done: { q_m_final: (s, e) => !kicked(e) } },                                       // the seven o'clock dinner happened
    evelyn: { tasks: ['q_e_lamp', 'q_e_gulls', 'q_e_307', 'q_e_1958'],
      done: {} },                                                                        // 3:07 is only done by finding the machine (evelyn.js); never at the ending
    victor: { tasks: ['q_v_suite', 'q_v_ana', 'q_v_expose'],
      done: {
        q_v_ana: (s, e) => e === 'VIC_ANA' || (e === 'VIC_EXPOSE' && !!s.f.vPass),     // Ana gets out; at the exposé only if you took the passports from the safe
        q_v_expose: (s, e) => e === 'VIC_EXPOSE'
      } }
  };

  /* which house each task belongs to (js/hints.js only hints a house's tasks while you live there) */
  GAME.QUEST_OWNER = {};
  for (const [host, c] of Object.entries(CH)) c.tasks.forEach(q => { GAME.QUEST_OWNER[q] = host; });
  /* not in any list on purpose, because they carry on whatever order the chapters come in: the town errands */

  function tidy(s) {
    if (!s || !s.done || !s.quests) return;
    for (const [host, endId] of Object.entries(s.done)) {
      const c = CH[host]; if (!c || !endId) continue;
      for (const q of c.tasks) {
        if (s.quests[q] !== 'active') continue;                                          // done ones and untouched ones stay as they are
        const settled = c.done[q] && c.done[q](s, endId);
        if (settled) s.quests[q] = 'done'; else delete s.quests[q];
      }
    }
    /* Operation Seagull needs Victor on his terrace; after "Everyone is welcome" he is gone for good */
    if (s.done.victor === 'VIC_EXPOSE' && s.quests.q_seagull === 'active') delete s.quests.q_seagull;
  }
  GAME.tidyQuests = tidy;

  /* right after an ending */
  const base = showEnding;
  showEnding = function (id) { base(id); tidy(S()); save(); };
  /* and for saves made before this existed: every time a scene ends or you arrive somewhere
     (afterScript runs before events and before the place is drawn, so nothing can skip it) */
  const after = afterScript;
  afterScript = function () { tidy(S()); return after(); };
})();
