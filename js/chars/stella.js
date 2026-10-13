/* =====================================================================
   Stella — Runs the florist. Talks to plants, customers and herself, in that order.
   Everything that is Stella's own: profile, where Stella is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (town.js).
   ===================================================================== */
'use strict';
(function () {
  { const { byDay, on } = GAME.H.town;
    /* who Stella is and Stella's daily routine (the town) */
    GAME.CHAR.stella = { name: T('Stella', 'ستيلا'), role: T('Runs the florist. Talks to plants, customers and herself, in that order.', 'صاحبة محل الورد. تكلم النباتات، والزباين، ونفسها، بهالترتيب.'), art: true,
      where: s => (!on(s) ? null : weekday(s.day) === 0 ? (s.slot === 2 ? 'beach' : null) : (s.slot < NIGHT ? 'florist' : null)),
      doing: s => (s.loc === 'beach' ? T('Stella is lying on the sand with a hat over her face, "recharging".', 'ستيلا متمددة على الرمل وقبعة على وجهها، «تشحن».') : byDay(s, [T('Stella is arranging lilies and telling them they\'re doing great.', 'ستيلا ترتب زنابق وتقول لهم إنهم ماشين زين.'), T('Stella is on the phone to a supplier, very politely furious.', 'ستيلا على التلفون مع مورّد، معصبة بأدب شديد.'), T('Stella is eating a sandwich and staring at the door as if her cat might walk in.', 'ستيلا تاكل سندويشة وتطالع الباب كأن قطوتها ممكن تدخل.')])),
      greet: s => ({ e: 'smile', t: s.quests.q_cat === 'active' ? T('Any sign of Admiral? Ginger, fat, judgemental. You\'d know him.', 'فيه أثر للأدميرال؟ برتقالي، سمين، ويحكم على الناس. {بتعرفه|بتعرفينه}.') : T('Hello, hello! Flowers for someone? Flowers for you? Flowers for no reason is my favourite reason.', 'هلا هلا! ورد لأحد؟ ورد لك؟ ورد بدون سبب هو سببي المفضل.') }) };
  }
  { const { C, sign } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.stella = [
      { id: 'cat', once: true, label: T('"Is that your cat on the poster?"', '«هذا قطوك اللي في الإعلان؟»'), run: s => { quest('q_cat', 'active'); return [C('stella', 'sad', 'The Admiral. Ginger, fat, judgemental. He\'s been gone four days. He does this. He goes on "tours". But four days.', 'الأدميرال. برتقالي، سمين، ويحكم على الناس. له أربع أيام غايب. يسويها. يروح «جولات». بس أربع أيام.'), C('stella', 'neutral', 'He\'ll come for fish. Only fish. He has standards. Unlike me.', 'يجي عشان السمك. بس السمك. عنده معايير. مو مثلي.')]; } },
      { id: 'cat2', label: T('Give her the Admiral back', '{ترجع|ترجعين} لها الأدميرال'), if: s => has('admiral'), cls: 'main', run: s => { take('admiral'); quest('q_cat', 'done'); s.money += 8; addMood(2); give('bouquet'); return [N_('Stella makes a noise only dogs should be able to hear. The Admiral endures the hug with the face of a man at a dull wedding.', 'ستيلا تطلع صوت المفروض بس الكلاب يسمعونه. والأدميرال يتحمل الضمة بوجه رجّال في عرس ممل.'), C('stella', 'smile', 'Flowers forever. I mean it. Also eight dollars, because flowers don\'t pay rent.', 'ورد للأبد. أعنيها. وثمان دولارات بعد، لأن الورد ما يدفع إيجار.')]; } },
      sign('stella', T('Of course! I\'ll sign twice. No? Once. Fine. Once, but with flowers drawn round it.', 'أكيد! بوقّع مرتين. لا؟ مرة. طيب. مرة، بس برسم ورد حولها.'))
    ];
  }
  /* how Stella looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.stella = { sex: 'f', skin: '#f6d8c0', hair: '#e0882e', eye: '#4a8a3a', brow: '#b06a2a', hairStyle: 'wavy', age: 32, sw: 88, ww: 70, hw: 86, pose: ['hold', 'hip'], item: 'flower', fit: { top: 'tee', c1: '#f598b0', bottom: 'jeans', b: '#4a6a9a', apron: '#4f8a3e' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.stella.height = 0.93;
})();

/* Stella's day: what Stella is doing in each place (shown by js/life.js) */
if (GAME.CHAR.stella) GAME.CHAR.stella.life = { florist: 'flowers', beach: 'walk' };

/* small talk: what Stella says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.stella) GAME.CHAR.stella.chat = [
  { e: 'smile', t: T("Flowers for no reason are the best kind. Nobody can say no to them.", "الورد اللي بدون سبب هو أحلى ورد. ما أحد يقدر يرفضه.") },
  { e: 'neutral', t: T("The roses are sulking. I moved them away from the tulips. They're very political.", "الورد الجوري زعلان. بعّدته عن التوليب. سياسة.") },
  { if: s => s.host === 'margaret', e: 'sad', t: T("Margaret buys one white lily every Saturday. Never says who for. I know who for.", "مارغريت تشتري زنبقة بيضا وحدة كل سبت. عمرها ما قالت لمين. وأنا أعرف لمين.") },
  { e: 'smile', t: T("If you're sad, smell basil. Instant summer. That's science. Probably.", "إذا {زعلان|زعلانة}، {شم|شمي} ريحان. صيف فوري. هذا علم. تقريباً.") },
  /* reacts to what happened (phase 2) */ { if: s => s.quests.q_cat === 'done', e: 'smile', t: T("The Admiral sleeps on the till now. He's decided he's management. You did that.", "الأدميرال صار ينام على الكاشير. قرر إنه هو المدير. وهذا بسببك.") },
  /* reacts to what happened (phase 2) */ { if: s => s.quests.q_gift === 'done', e: 'smile', t: T("Rex came back for more flowers. \"For no reason,\" he said. The reason is ten and has pigtails.", "ريكس رجع ياخذ ورد ثاني. قال «بدون سبب». والسبب عمرها عشر سنين وعندها ضفاير.") },
  /* reacts to what happened (phase 2) */ { if: s => (s.trust.stella || 0) >= 3, e: 'neutral', t: T("Take a bruised rose. Free. Don't tell the other roses.", "{خذ|خذي} وردة مكسورة. ببلاش. {لا تقول|لا تقولين} للورود الثانية.") }
];
