/* =====================================================================
   Kai — 23. Surfs badly. Plans worse. Has never been unhappy for more than ten minutes.
   Everything that is Kai's own: profile, where Kai is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (town.js).
   ===================================================================== */
'use strict';
(function () {
  { const { byDay, on } = GAME.H.town;
    /* who Kai is and Kai's daily routine (the town) */
    GAME.CHAR.kai = { name: T('Kai', 'كاي'), role: T('23. Surfs badly. Plans worse. Has never been unhappy for more than ten minutes.', '٢٣ سنة. يتزلج على الموج بشكل سيء. ويخطط بشكل أسوأ. وعمره ما زعل أكثر من عشر دقايق.'), art: true,
      where: s => (!on(s) ? null : [s.day % 3 ? 'beach' : 'harbor', 'beach', 'beach', 'cafe', null][s.slot]),
      doing: s => byDay(s, [T('Kai is waxing a surfboard and narrating it like a nature documentary.', 'كاي يشمّع لوح التزلج ويعلّق عليه مثل وثائقي طبيعة.'), T('Kai is doing push-ups and losing count around six.', 'كاي يسوي ضغط ويضيع العد عند ستة.'), T('Kai is explaining a plan to a gull. The gull looks unconvinced.', 'كاي يشرح خطة لنورس. والنورس شكله مو مقتنع.')]),
      greet: s => ({ e: 'smile', t: T('Legend! My legend! Have you ever thought about how gulls are basically dinosaurs with jobs?', 'أسطورة! أسطورتي! {فكرت|فكرتي} مرة إن النوارس أساساً ديناصورات عندهم شغل؟') }) };
  }
  { const { C, sign } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.kai = [
      { id: 'gull', label: T('Operation Seagull', 'عملية النورس'), if: s => !doneToday('gull') && (s.f.gullStage || 0) < 3 && (s.done || {}).victor !== 'VIC_EXPOSE' && (s.loc === 'beach' || s.loc === 'harbor') && s.slot <= 1, need: s => (s.f.gullStage || 0) < 2 || s.f.leoEnded, why: T('Kai says the target isn\'t "in range" yet. Victor\'s hotel terrace, later in the story.', 'كاي يقول الهدف مو «في المدى» للحين. تراس فندق فيكتور، بعدين في القصة.'), cls: 'main', run: [{ jump: 'seagull' }] },
      { id: 'surf', label: T('Let him teach you to surf', '{تخليه|تخلينه} يعلمك تزلج على الموج'), if: s => s.loc === 'beach' && s.slot <= 2 && !doneToday('surf'), run: s => { onceToday('surf'); advance(1); addMood(1); rest(-15); needs().clean = clamp(needs().clean + 15, 0, 100); return [{ n: fresh('surf', [T('You stand up for one glorious second. Then the sea removes you. Kai gives you a ten "for commitment".', '{توقف|توقفين} لثانية مجيدة. وبعدين البحر يشيلك. وكاي يعطيك عشرة «على الالتزام».'), T('You spend an hour falling off. You have never been so tired or so happy to be tired.', '{تقضي ساعة تطيح. عمرك ما تعبت كذا ولا انبسطت إنك تعبان كذا|تقضين ساعة تطيحين. عمرك ما تعبتي كذا ولا انبسطتي إنك تعبانة كذا}.'), T('Kai demonstrates. Kai also falls off. "That was ALSO a lesson," he says, spitting seaweed.', 'كاي يوريك. وكاي بعد يطيح. «هذا بعد كان درس،» يقول، ويتفل طحالب.')]) }]; } },
      { id: 'life', once: true, label: T('Ask him why he\'s always happy', '{تسأله|تسألينه} ليش دايم مبسوط'), run: [C('kai', 'neutral', 'Oh, I\'m not. I just figured out the sad bits don\'t last if you keep moving. Like waves. You stand still, they drown you. You paddle, they carry you.', 'لا، مو دايم. بس فهمت إن الأشياء الحزينة ما تدوم لو كملت تتحرك. مثل الموج. لو وقفت، يغرّقك. ولو جدّفت، يشيلك.'), C('kai', 'smile', 'Also I eat a lot of bananas. Unrelated.', 'وبعد آكل موز كثير. مالها علاقة.')] },
      sign('kai', T('Sign? Mate, I\'ll get it tattooed. No I won\'t. Maybe. Give me the pen.', 'أوقّع؟ {يا رجّال|يا بنت}، بسويها وشم. لا ما بسوي. يمكن. {عطني|عطيني} القلم.'))
    ];
  }
  /* how Kai looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.kai = { sex: 'm', skin: '#d8a07a', hair: '#f0d090', eye: '#2f7aa0', brow: '#c8a060', hairStyle: 'surfer', age: 23, sw: 100, ww: 76, hw: 78, pose: ['wave', 'down'], fit: { top: 'tee', c1: '#28b4bc', bottom: 'shorts', b: '#ee7a2c', print: '#fff4dc' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.kai.height = 1.01;
})();

/* Kai's day: what Kai is doing in each place (shown by js/life.js) */
if (GAME.CHAR.kai) GAME.CHAR.kai.life = { beach: 'surf', harbor: 'scheme', cafe: 'eat' };

/* small talk: what Kai says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.kai) GAME.CHAR.kai.chat = [
  { e: 'smile', t: T("Waves are flat today. Flat is just the sea having a nap, legend.", "الموج هادي اليوم. الهدوء يعني البحر ماخذ قيلولة، {يا بطل|يا بطلة}.") },
  { e: 'smile', t: T("Kevin stole my sandwich again. I respect him. He's an entrepreneur.", "كيفن سرق سندويشتي مرة ثانية. أحترمه. رجل أعمال.") },
  { if: s => s.host === 'victor', e: 'shock', t: T("You live at the Grand? Can you get me into the pool at night? For science.", "{ساكن|ساكنة} في الغراند؟ {تقدر|تقدرين} تدخلني المسبح بالليل؟ عشان العلم.") },
  { e: 'neutral', t: T("Surfing tip: fall off a lot. That's the whole tip.", "نصيحة ركوب الموج: {اطيح|طيحي} كثير. هذي النصيحة كلها.") }
];
