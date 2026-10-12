/* =====================================================================
   Nora — Margaret's younger sister. Says the thing everyone else is thinking.
   Everything that is Nora's own: profile, where Nora is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (margaret.js).
   ===================================================================== */
'use strict';
(function () {
  { const { dM, inM } = GAME.H.margaret;
    /* who Nora is and Nora's daily routine (Margaret's chapter) */
    GAME.CHAR.nora = {
      name: T('Nora', 'نورا'), role: T('Margaret\'s younger sister. Says the thing everyone else is thinking.', 'أخت مارغريت الصغيرة. تقول الشي اللي الكل يفكر فيه.'), art: true,
      where: s => (inM(s) && s.f.metMarg && (weekday(s.day) === 3 || weekday(s.day) === 6 || dM(s) === 2) && (s.slot === 1 || s.slot === 2) ? (s.slot === 1 ? 'marg_kitchen' : 'cliff_road') : null),
      doing: s => (s.slot === 1 ? T('Nora is opening every cupboard and tutting.', 'نورا تفتح كل الدواليب وتتأفف.') : T('Nora is in the front garden on the phone, saying "I know, I KNOW" a lot.', 'نورا في الحديقة على الجوال، وتقول «أدري، أدري!» كثير.')),
      greet: s => ({ e: s.f.metNora ? 'smile' : 'neutral', t: s.f.metNora ? T('The lodger. Still alive. Good.', '{الساكن. لسا حي.|الساكنة. لسا حية.} زين.') : T('And who are you, then?', '{وأنت|وأنتِ} مين بالضبط؟') })
    };
  }
  { const { NR } = GAME.H.margaret;
    /* things to talk about (Margaret's chapter) */
    GAME.TOPICS.nora = [
      { id: 'sister', once: true, label: T('Ask what Margaret was like before', '{تسألها|تسألينها} كيف كانت مارغريت قبل'), run: s => { addTrust('margaret', 0); return [NR('smile', 'Loud. Bossy. Laughed like a seal. Ran the school bake sale like a military operation. Daniel used to say she could make a cake surrender.', 'صوتها عالي. تتأمر. تضحك مثل الفقمة. كانت تدير بيع الكيك في المدرسة كأنه عملية عسكرية. دانيال كان يقول تقدر تخلي الكيكة تستسلم.'), NR('sad', 'I want my sister back. Not him. I know he\'s not coming. Her.', 'أبي أختي ترجع. مو هو. أدري إنه ما راح يرجع. هي.')]; } },
      { id: 'victor', once: true, label: T('Ask about Victor\'s offer', '{تسألها|تسألينها} عن عرض فيكتور'), run: [NR('neutral', 'Twice what it\'s worth. Which tells you it\'s worth three times. He wants the whole of Cliff Road for a "spa village". He\'s very charming about it. I\'d trust him about as far as I could throw the hotel.', 'ضعف قيمته. يعني قيمته ثلاث أضعاف. يبي شارع الجرف كله عشان «قرية سبا». ولطيف مرة وهو يقولها. وأثق فيه قد ما أقدر أرمي الفندق.')] },
      { id: 'pillsN', once: true, label: T('Tell her about the gold "G" bottle', '{تقول|تقولين} لها عن علبة «G» الذهبية'), if: s => s.f.mPills, run: s => { s.f.noraKnows = true; return [NR('angry', 'G for Grand. I KNEW it. That spa sells "wellness". I\'m going to have a word with Dr. Irene and then I\'m going to have several words with somebody else.', 'G يعني غراند. كنت أدري! هالسبا يبيع «عافية». بكلم الدكتورة إيرين وبعدين بكلم أحد ثاني بكلمات كثيرة.')]; } }
    ];
  }
  /* how Nora looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.nora = { sex: 'f', skin: '#e8b892', hair: '#2e2420', eye: '#4a3a2a', brow: '#2e2420', hairStyle: 'pixie', age: 50, sw: 92, ww: 76, hw: 88, pose: ['hip', 'down'], fit: { top: 'coat', c1: '#c8322e', c2: '#2a2a32', bottom: 'pants', b: '#2a2a32', scarf: '#f2c445' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.nora.height = 1.02;
})();

/* Nora's day: what Nora is doing in each place (shown by js/life.js) */
if (GAME.CHAR.nora) GAME.CHAR.nora.life = { marg_kitchen: 'tea', cliff_road: 'phone' };

/* small talk: what Nora says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.nora) GAME.CHAR.nora.chat = [
  { e: 'neutral', t: T("Mags was the clever one. I was the loud one. Now she's quiet and I'm still loud.", "ماقز كانت الذكية. وأنا الصوت العالي. الحين هي ساكتة وأنا لسا صوتي عالي.") },
  { e: 'sad', t: T("I bring her soup. She doesn't eat it. I bring it anyway. That's sisters.", "أجيب لها شوربة. ما تاكلها. وأجيبها على كل حال. هذي الأخوات.") }
];
