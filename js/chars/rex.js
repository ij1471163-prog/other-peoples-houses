/* =====================================================================
   Officer Rex — Saltmere's only police officer. Tired, honest, and slightly afraid of his ten-year-old.
   Everything that is Officer Rex's own: profile, where Officer Rex is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (town.js).
   ===================================================================== */
'use strict';
(function () {
  { const { byDay, on } = GAME.H.town;
    /* who Officer Rex is and Officer Rex's daily routine (the town) */
    GAME.CHAR.rex = { name: T('Officer Rex', 'الضابط ريكس'), short: T('Rex', 'ريكس'), role: T('Saltmere\'s only police officer. Tired, honest, and slightly afraid of his ten-year-old.', 'الشرطي الوحيد في سولتمير. تعبان، ونزيه، وخايف شوي من بنته اللي عمرها عشر.'), art: true,
      where: s => (!on(s) ? null : ['police', 'police', 'police', 'street', null][s.slot]),
      doing: s => (s.slot === 3 ? T('Rex is walking his beat, which takes four minutes, very slowly.', 'ريكس يسوي جولته، اللي تاخذ أربع دقايق، ببطء شديد.') : byDay(s, [T('Rex is doing paperwork with a pen that doesn\'t work and won\'t admit it.', 'ريكس يكتب أوراق بقلم ما يكتب ورافض يعترف.'), T('Rex is on the phone: "No, madam, a gull taking your chips is not a robbery."', 'ريكس على التلفون: «لا يا مدام، النورس اللي أخذ بطاطسك مو سرقة.»'), T('Rex is eating a doughnut and looking guilty about the cliché.', 'ريكس ياكل دونات وحاس بالذنب من الكليشيه.')])),
      greet: s => ({ e: 'neutral', t: T('Something stolen, someone lost, or just bored? Two of those I can help with.', 'شي مسروق، أحد ضايع، ولا بس {طفشان|طفشانة}؟ اثنين منها أقدر أساعد فيها.') }) };
  }
  { const { C } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.rex = [
      { id: 'lily', once: true, label: T('"You look worried."', '«شكلك قلقان.»'), run: s => { quest('q_gift', 'active'); return [C('rex', 'sad', 'My daughter, Lily. Ten on Saturday. Last year I got her a pencil case. She said "thanks, Dad" in a voice I still hear at night.', 'بنتي، ليلي. بتصير عشر سنين السبت. السنة اللي فاتت جبت لها مقلمة. قالت «شكراً بابا» بصوت لسا أسمعه بالليل.'), C('rex', 'neutral', 'She likes the sea. And flowers. And being right. Help me.', 'تحب البحر. والورد. وإنها تطلع صح. ساعدني.')]; } },
      { id: 'gift', label: T('Give him something for Lily', '{تعطيه|تعطينه} شي لليلي'), if: s => s.quests.q_gift === 'active' && (has('shell') || has('bouquet')), cls: 'main', run: s => { const sh = has('shell'); take(sh ? 'shell' : 'bouquet'); quest('q_gift', 'done'); addTrust('rex', 2); addMood(1); return [N_(sh ? 'You give him the spiral shell. He holds it up to the light. "Pink inside," he says, as if that\'s a miracle. Maybe it is.' : 'You give him the bouquet. "Something brave, something soft, and one weird one," you explain. He nods slowly, like it\'s police procedure.', sh ? '{تعطيه|تعطينه} الصدفة الحلزونية. يرفعها للضو. «وردية من داخل،» يقول، كأنها معجزة. يمكن هي.' : '{تعطيه|تعطينه} الباقة. «شي شجاع، وشي ناعم، وواحد غريب،» {تشرح|تشرحين}. يهز راسه بهدوء، كأنها إجراءات شرطة.'), C('rex', 'smile', 'If you ever need the police, and you will, because this is Saltmere, you come to me first.', 'لو {احتجت|احتجتي} الشرطة يوم، {وبتحتاج|وبتحتاجين}، لأن هذي سولتمير، {تجي|تجين} لي أنا أول.')]; } },
      { id: 'victor', once: true, label: T('Ask about Victor', '{تسأله|تسألينه} عن فيكتور'), if: s => s.f.leoEnded, run: [C('rex', 'angry', 'Every complaint about the Grand lands on my desk and then goes up to the council and dies there. I can\'t touch him without proof a judge can hold in her hand.', 'كل شكوى عن الغراند توصل مكتبي وبعدين تطلع للمجلس وتموت هناك. ما أقدر ألمسه بدون دليل القاضية تقدر تمسكه بيدها.')] }
    ];
  }
  /* things to talk about (Victor's chapter) */
  GAME.TOPICS.rex.push(
    { id: 'env', label: T('Give him Victor\'s envelope', '{تعطيه|تعطينه} ظرف فيكتور'), if: s => has('envelope'), cls: 'risk', run: s => { take('envelope'); s.f.vEnvDone = 'given'; return [
      { c: 'rex', e: 'angry', t: T('From Victor? Let me guess. "For my daughter\'s birthday." He knows her name. He knows her birthday. That\'s the point.', 'من فيكتور؟ خلني أخمّن. «لعيد ميلاد بنتك.» يعرف اسمها. يعرف عيد ميلادها. وهذا المقصود.') },
      N_('He doesn\'t open it. He pushes it back across the desk with one finger.', 'ما يفتحه. يرجّعه على المكتب بإصبع واحد.'),
      { c: 'rex', e: 'sad', t: T('Tell him no. And kid, whatever he\'s giving you, it\'s not free.', '{قل|قولي} له لا. {ويا ولد|ويا بنت}، أي شي يعطيك إياه، مو ببلاش.') }]; } },
    { id: 'envOpen', label: T('Tell him what\'s in Victor\'s envelope instead', '{تقول|تقولين} له وش اللي في ظرف فيكتور بدال'), if: s => has('envelope'), run: s => { take('envelope'); s.f.vEnvDone = 'told'; addTrust('rex', 2); return [N_('You open it in front of him. Cash, and a card: "For Lily\'s birthday. Everyone is welcome. — V."', '{تفتحه|تفتحينه} قدامه. كاش، وكرت: «لعيد ميلاد ليلي. الكل مرحب فيه. — ف.»'), { c: 'rex', e: 'angry', t: T('I\'m keeping the card. Not the cash. You keep your head down, and you keep anything else like this for me. One day I\'ll need it.', 'بخلي الكرت. مو الكاش. {وأنت خلك هادي|وأنتِ خليك هادية}، وأي شي ثاني مثل هذا {خلّه|خليه} لي. يوم من الأيام بحتاجه.') }]; } }
  );
  /* how Officer Rex looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.rex = { sex: 'm', skin: '#c48a64', hair: '#3a2e28', eye: '#4a3a2a', brow: '#3a2e28', hairStyle: 'buzz', beard: 'mustache', age: 46, sw: 108, ww: 92, hw: 90, pose: ['hip', 'hip'], fit: { top: 'uniform', c1: '#2a3a5e', bottom: 'pants', b: '#22304a', badge: true } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.rex.height = 1.05;
})();

/* Rex's day: what Rex is doing in each place (shown by js/life.js) */
if (GAME.CHAR.rex) GAME.CHAR.rex.life = { police: 'office', street: 'patrol' };

/* small talk: what Rex says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.rex) GAME.CHAR.rex.chat = [
  { e: 'sad', t: T("Lily asked what I do all day. I said “keep the town safe”. She said “from what?” I didn't have an answer.", "ليلي سألتني وش أسوي طول اليوم. قلت «أحمي البلدة». قالت «من وشو؟» وما عرفت أرد.") },
  { e: 'neutral', t: T("Three reports today. Two lost cats, one stolen bin. The bin was found. In a tree. I have questions.", "ثلاث بلاغات اليوم. قطوتين ضايعات، وزبالة مسروقة. لقينا الزبالة. فوق شجرة. عندي أسئلة.") },
  { if: s => (s.ch || 1) >= 3, e: 'angry', t: T("I know what Victor is. Knowing isn't proof. Proof is paper.", "أعرف وش فيكتور. بس المعرفة مو دليل. الدليل ورق.") },
  { if: s => s.host === 'evelyn', e: 'shock', t: T("If you see anything strange at the lighthouse at night, don't tell me. I'm a man of reason and I'm scared.", "لو {شفت|شفتي} شي غريب في المنارة بالليل، {لا تقول|لا تقولين} لي. أنا رجّال عاقل وخايف.") },
  { if: s => s.mood <= 3, e: 'neutral', t: T("Eat something. Cops notice who isn't eating.", "{كل|كلي} لك شي. الشرطة ينتبهون مين ما ياكل.") },
  /* reacts to what happened (phase 2) */ { if: s => s.quests.q_gift === 'done', e: 'smile', t: T("Lily keeps your present on her windowsill. Best thing anyone ever got her, she says. Apart from the dog I still haven't got her.", "ليلي حاطة هديتك على الشباك. تقول إنها أحسن شي أحد جابه لها. غير الكلب اللي للحين ما جبته.") },
  /* reacts to what happened (phase 2) */ { if: s => !!s.f.sb_rex, e: 'neutral', t: T("Sami can't look me in the eye since the envelope. Good. Means it worked.", "سامي ما يقدر يطالع في عيوني من يوم الظرف. زين. يعني نفعت.") },
  /* reacts to what happened (phase 2) */ { if: s => s.quests.q_seagull === 'done', e: 'smile', t: T("Officially, I saw nothing on the hotel terrace. Unofficially, I've watched it eleven times.", "رسمياً، ما شفت شي في تراس الفندق. وغير رسمي، شفته إحدعش مرة.") },
  /* reacts to what happened (phase 2) */ { if: s => (s.trust.rex || 0) >= 4, e: 'neutral', t: T("If anyone gives you trouble, you tell me first. Before Victor's people hear about it.", "لو أحد ضايقك، {قل|قولي} لي أنا أول. قبل لا يسمعون جماعة فيكتور.") }
];
