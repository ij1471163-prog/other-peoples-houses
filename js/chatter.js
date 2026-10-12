/* =====================================================================
   Small talk: every town character always has something to say.
   Each character's lines live in their own file (js/chars/<id>.js) as

     GAME.CHAR.marco.chat = [
       { t: T('...', '...') },                              // any day
       { if: s => s.host === 'leo', e: 'sad', t: T(...) },   // only while you live with Leo
     ];

   This file only adds one topic, "Chat", to each of them: once a day, a
   line they haven't said yet, preferring the ones about your situation
   right now (who you live with, the time, what you've found out). The
   first two chats with someone earn a little trust; after that it's just
   company, like in real life.
   ===================================================================== */
'use strict';
(function () {
  for (const [id, c] of Object.entries(GAME.CHAR)) {
    if (!Array.isArray(c.chat) || !c.chat.length) continue;
    const pool = s => c.chat.filter(l => !l.if || l.if(s));
    GAME.TOPICS[id] = GAME.TOPICS[id] || [];
    GAME.TOPICS[id].push({
      id: 'chat', label: (PEOPLE.SPEC[id] && PEOPLE.SPEC[id].sex === 'f') ? T('Chat for a bit', '{تسولف|تسولفين} معها شوي') : T('Chat for a bit', '{تسولف|تسولفين} معه شوي'),
      if: s => !doneToday('chat_' + id) && pool(s).length > 0,
      run: s => {
        onceToday('chat_' + id);
        const n = s.f['chatN_' + id] = (s.f['chatN_' + id] || 0) + 1;
        if (n <= 2) addTrust(id, 1);
        const lines = pool(s);
        /* lines about right now come first, until each has been heard once */
        const seen = s.f['chatSeen_' + id] = s.f['chatSeen_' + id] || [];
        const key = l => c.chat.indexOf(l);
        const fresh_ = lines.filter(l => l.if && !seen.includes(key(l)));
        const pick = fresh_.length ? fresh_[0] : (lines.filter(l => !seen.includes(key(l)))[0] || lines[Math.floor(Math.random() * lines.length)]);
        if (!seen.includes(key(pick))) seen.push(key(pick));
        if (seen.length >= c.chat.length) s.f['chatSeen_' + id] = [];   // heard everything: start again
        return [{ c: id, e: pick.e || 'neutral', t: pick.t }];
      }
    });
  }
})();
