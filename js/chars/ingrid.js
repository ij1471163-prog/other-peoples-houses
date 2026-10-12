/* =====================================================================
   Ingrid — 74. Used to sing at Marco's every Thursday. Stopped when Henrik died.
   Everything that is Ingrid's own: profile, where Ingrid is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (town.js).
   ===================================================================== */
'use strict';
(function () {
  { const { on } = GAME.H.town;
    /* who Ingrid is and Ingrid's daily routine (the town) */
    GAME.CHAR.ingrid = { name: T('Ingrid', 'إنغريد'), role: T('74. Used to sing at Marco\'s every Thursday. Stopped when Henrik died.', '٧٤ سنة. كانت تغني عند ماركو كل خميس. ووقفت لما مات هنريك.'), art: true,
      where: s => (!on(s) ? null : [(weekday(s.day) === 1 || weekday(s.day) === 4) ? 'cemetery' : null, null, 'cafe', 'beach', null][s.slot]),
      doing: s => ({ cemetery: T('Ingrid is sitting on a bench by a grave, knitting, chatting to it.', 'إنغريد جالسة على كرسي جنب قبر، تحيك، وتسولف معه.'), cafe: T('Ingrid is having tea with two sugars and reading the paper with a magnifying glass.', 'إنغريد تشرب شاي بملعقتين سكر وتقرا الجريدة بعدسة مكبرة.'), beach: T('Ingrid is standing at the edge of the water, mouthing the words to a song, no sound.', 'إنغريد واقفة على طرف الموية، تحرك شفايفها بكلمات أغنية، بدون صوت.') })[GAME.CHAR.ingrid.where(s)] || null,
      greet: s => ({ e: 'smile', t: T('Hello, dear. Sit, sit. Young people never sit. You\'ll all get varicose veins.', 'هلا يا {عزيزي|عزيزتي}. {اجلس، اجلس|اجلسي، اجلسي}. الشباب ما يجلسون أبداً. بتطلع لكم دوالي كلكم.') }) };
  }
  { const { C, sign } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.ingrid = [
      { id: 'tea', label: T('Have tea with her', '{تشرب|تشربين} شاي معها'), if: s => s.loc === 'cafe' && !doneToday('ingTea'), run: s => { onceToday('ingTea'); addTrust('ingrid', 1); feed(10); return [{ c: 'ingrid', e: 'smile', t: fresh('ingT', [T('My Henrik proposed to me in this café. On one knee. He couldn\'t get up again. Marco\'s grandfather had to help him.', 'هنريك خطبني في هالمقهى. على ركبة وحدة. وما قدر يقوم. جد ماركو ساعده.'), T('I was a singer, you know. Not famous. Thursday-famous. Saltmere-famous. It\'s the best kind. Nobody bothers you at the shops.', 'كنت مغنية، تدري. مو مشهورة. مشهورة يوم الخميس. مشهورة في سولتمير. وهذا أحسن نوع. محد يزعجك في السوق.'), T('Young people today, always looking at phones. I look at the paper. Same thing, slower, and you can swat flies with it.', 'شباب اليوم، دايم يطالعون الجوال. وأنا أطالع الجريدة. نفس الشي، بس أبطأ، وتقدر تهش فيها الذبان.')]) }]; } },
      { id: 'sing', once: true, label: T('"Will you sing again?"', '«بترجعين تغنين؟»'), need: s => (s.trust.ingrid || 0) >= 2, why: T('Have tea with her a few more times first.', '{اشرب|اشربي} معها شاي كم مرة زيادة أول.'), run: s => { quest('q_voice', 'active'); return [C('ingrid', 'sad', 'Henrik used to sit at the front table and mouth the words, out of time. Without him there, I\'d be singing to nobody.', 'هنريك كان يجلس على الطاولة الأمامية ويحرك شفايفه بالكلمات، غلط بالإيقاع. وبدونه، بغني لولا أحد.'), C('ingrid', 'neutral', '...Unless someone sat there. And mouthed it wrong. You\'d have to learn it wrong, mind.', '...إلا لو أحد جلس هناك. وحرك شفايفه غلط. بس لازم {تتعلمها|تتعلمينها} غلط، {انتبه|انتبهي}.')]; } },
      sign('ingrid', T('In ink? Of course in ink. I\'m seventy-four, dear, pencil is for cowards.', 'بالحبر؟ أكيد بالحبر. عمري أربعة وسبعين يا {عزيزي|عزيزتي}، الرصاص للجبناء.'))
    ];
  }
  /* how Ingrid looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.ingrid = { sex: 'f', skin: '#f2d4c4', hair: '#efede8', eye: '#5a7a9a', brow: '#d8d4cc', hairStyle: 'bun', glasses: true, age: 74, sw: 86, ww: 78, hw: 90, pose: ['clasp', 'clasp'], fit: { top: 'cardigan', c1: '#2f8a76', c2: '#f2ece0', bottom: 'skirt', b: '#4a3a50', brooch: '#d23f6a' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.ingrid.height = 0.84;
})();

/* Ingrid's day: what Ingrid is doing in each place (shown by js/life.js) */
if (GAME.CHAR.ingrid) GAME.CHAR.ingrid.life = { cemetery: 'grave', cafe: 'tea', beach: 'walk' };

/* small talk: what Ingrid says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.ingrid) GAME.CHAR.ingrid.chat = [
  { e: 'smile', t: T("Henrik used to say I sang like the sea: loud, and nobody asked.", "هنريك كان يقول إني أغني مثل البحر: بصوت عالي، وبدون ما أحد يطلب.") },
  { e: 'smile', t: T("Sit, dear. Young people never sit.", "{اجلس يا حبيبي|اجلسي يا حبيبتي}. الشباب عمرهم ما يجلسون.") },
  { e: 'neutral', t: T("Seventy-four years in Saltmere. I've seen three lighthouse keepers and one decent baker.", "أربعة وسبعين سنة في سولتمير. شفت ثلاث حراس منارة وخبّاز واحد يستاهل.") },
  { e: 'sad', t: T("I knit a scarf for everyone I lose. I have a lot of scarves.", "أحيك شال لكل أحد أفقده. وعندي شالات كثير.") },
  { if: s => weekday(s.day) === 4, e: 'sad', t: T("It's Thursday. On Thursdays my throat remembers.", "اليوم خميس. وفي الخميس حلقي يتذكر.") }
];
