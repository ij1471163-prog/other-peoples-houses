/* =====================================================================
   Frank — Owns Frank's Motors. Leo's father.
   Everything that is Frank's own: profile, where Frank is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (leo.js).
   ===================================================================== */
'use strict';
(function () {
  /* who Frank is and Frank's daily routine (Chapter 2, Leo) */
  GAME.CHAR.frank = {
    name: T('Frank', 'فرانك'), role: T('Owns Frank\'s Motors. Leo\'s father.', 'صاحب كراج فرانك. أبو ليو.'), art: true,
    where: s => (s.ch === 2 && !s.f.prologue && s.slot < NIGHT ? 'garage' : null),
    doing: s => [T('Frank is under a car, swearing at it politely.', 'فرانك تحت سيارة، يسبها بأدب.'), T('Frank is eating a sandwich with greasy hands.', 'فرانك ياكل سندويشة بيدين مليانة شحم.'), T('Frank is staring at his phone, then putting it face down.', 'فرانك يطالع جواله، وبعدين يقلبه على وجهه.'), T('Frank is closing up, slower than he needs to.', 'فرانك يسكّر الكراج، أبطأ من اللازم.')][s.slot],
    greet: s => ({ e: s.f.metFrank ? 'neutral' : 'neutral', t: s.f.metFrank ? T('You again. Brakes? Tyres? Life advice? Only one of those is free.', '{أنت|أنتِ} مرة ثانية. فرامل؟ كفرات؟ نصيحة بالحياة؟ وحدة بس فيهم ببلاش.') : T('We\'re open. You need something fixed?', 'فاتحين. عندك شي يبي تصليح؟') })
  };
  /* things to talk about (Chapter 2, Leo) */
  GAME.TOPICS.frank = [
    { id: 'car', once: true, label: T('Ask about the car on the lift', '{تسأله|تسألينه} عن السيارة اللي فوق الرافعة'), run: s => { s.f.metFrank = true; s.met.frank = true; return [F_('neutral', 'Sixty-eight Mustang. Belonged to a man who loved it more than his kids. Now his kids are selling it. Funny how that works.', 'موستنج ٦٨. كانت لرجل يحبها أكثر من عياله. الحين عياله يبيعونها. غريبة الدنيا.')]; } },
    { id: 'son', once: true, label: T('Ask if he has kids', '{تسأله|تسألينه} إذا عنده عيال'), if: s => s.f.knowsFather || s.f.sawOffice, run: s => { s.f.metFrank = true; s.met.frank = true; s.f.fatherSick = true; return [
      { c: 'frank', e: 'sad', t: T('A son. Leo. He... he draws.', 'ولد. ليو. هو... يرسم.') },
      { c: 'frank', e: 'angry', t: T('He left. His choice. I\'m not chasing a grown man around town.', 'طلع. هذا اختياره. ما راح ألحق رجّال كبير في البلدة.') },
      N_('He rubs his chest like it hurts. "Blood pressure," he says, before you can ask. "Since... lately."', 'يفرك صدره كأنه يوجعه. «الضغط،» يقول، قبل ما {تسأل|تسألين}. «من... من فترة.»')]; } },
    { id: 'sketch', once: true, label: T('Show him Leo\'s drawing of you', '{توريه|تورينه} رسمة ليو لك'), if: s => has('sketch') && s.f.metFrank, run: s => { s.f.frankSoft = true; return [
      { c: 'frank', e: 'sad', t: T('He did this?', 'هو اللي رسمها؟') },
      N_('Frank holds the paper by the very edges, the way you hold something you\'re afraid to get grease on.', 'فرانك يمسك الورقة من أطرافها، مثل ما تمسك شي خايف توسخه بالشحم.'),
      { c: 'frank', e: 'sad', t: T('He got that from his mother. I burned three years of these. Three years.', 'أخذها من أمه. وأنا أحرقت ثلاث سنين من هذي. ثلاث سنين.') }]; } },
    { id: 'tell', once: true, label: T('Tell him where Leo is', '{تقول|تقولين} له وين ليو'), cls: 'risk', if: s => s.f.metFrank && s.f.knowsFather && !s.f.toldFrank, run: s => { s.f.toldFrank = true; s.conscience = (s.conscience || 0) - 1; return [
      { c: 'frank', e: 'shock', t: T('The boathouse? On the harbor? He\'s been two streets away this whole time?', 'بيت القوارب؟ في الميناء؟ كان على بعد شارعين طول هالوقت؟') },
      N_('He doesn\'t say thank you. He goes very quiet, and then he says he\'ll think about it. You feel like you\'ve set something in motion you can\'t stop.', 'ما يقول شكراً. يسكت مرة، وبعدين يقول إنه بيفكر. {وتحس إنك حركت شي ما تقدر توقفه|وتحسين إنك حركتي شي ما تقدرين توقفينه}.')]; } }
  ];
  /* how Frank looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.frank = { sex: 'm', skin: '#d39c78', hair: '#5e4e44', eye: '#4a5a6a', brow: '#4a3a30', hairStyle: 'receding', beard: 'bigMustache', age: 54, sw: 114, ww: 98, hw: 94, pose: ['cross', 'cross'], fit: { top: 'tee', c1: '#9a9ea6', overalls: '#2f4a72', bottom: 'pants', b: '#2f4a72', tag: 'FRANK' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.frank.height = 1;
})();

/* Frank's day: what Frank is doing in each place (shown by js/life.js) */
if (GAME.CHAR.frank) GAME.CHAR.frank.life = { garage: 'work' };

/* small talk: what Frank says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.frank) GAME.CHAR.frank.chat = [
  { e: 'neutral', t: T("A car's like a person. Make a noise long enough and somebody finally listens.", "السيارة مثل الإنسان. تسوي صوت مدة كافية، وأخيراً أحد يسمع.") },
  { if: s => s.host === 'leo', e: 'sad', t: T("How is he? Don't tell me. Just tell me if he's eating.", "كيفه؟ {لا تقول|لا تقولين} لي. بس {قل|قولي} لي إذا ياكل.") },
  { e: 'smile', t: T("Blood pressure's fine. Doctor says it isn't. Doctor's never fixed a Mustang.", "الضغط تمام. الدكتورة تقول لا. الدكتورة عمرها ما صلّحت موستنج.") },
  /* reacts to what happened (phase 2) */ { if: s => !!s.f.tp_frank_calendar, e: 'sad', t: T("That calendar in the office. Three years on the same month. I keep meaning to turn it.", "التقويم اللي في المكتب. ثلاث سنين على نفس الشهر. كل مرة أقول بقلبه.") },
  /* reacts to what happened (phase 2) */ { if: s => (s.done || {}).leo === 'LEO_HOME', e: 'smile', t: T("He comes in on Sundays now. Draws the cars instead of fixing them. I let him.", "صار يجي كل أحد. يرسم السيارات بدال ما يصلحها. وأنا أخليه.") }
];
