/* =====================================================================
   Gregor — Gravedigger, caretaker, historian. Cheerful about death in a way that's oddly comforting.
   Everything that is Gregor's own: profile, where Gregor is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (town.js).
   ===================================================================== */
'use strict';
(function () {
  { const { byDay, on } = GAME.H.town;
    /* who Gregor is and Gregor's daily routine (the town) */
    GAME.CHAR.gregor = { name: T('Gregor', 'غريغور'), role: T('Gravedigger, caretaker, historian. Cheerful about death in a way that\'s oddly comforting.', 'حفار قبور، وحارس، ومؤرخ. مرح بخصوص الموت بشكل يريّح بغرابة.'), art: true,
      where: s => (!on(s) || s.slot === NIGHT ? null : 'cemetery'),
      doing: s => byDay(s, [T('Gregor is digging, whistling something jaunty.', 'غريغور يحفر، ويصفّر شي مرح.'), T('Gregor is eating a pork pie on a headstone. He apologises to the headstone.', 'غريغور ياكل فطيرة على شاهد قبر. ويعتذر للشاهد.'), T('Gregor is reading the old stones aloud, like a register.', 'غريغور يقرا الحجارة القديمة بصوت عالي، كأنه يحضّر.')]),
      greet: s => ({ e: 'smile', t: T('Visiting or reserving? Ha! Gravedigger joke. I have nine hundred of them.', 'زيارة ولا حجز؟ ها! نكتة حفار قبور. عندي تسع مية منها.') }) };
  }
  { const { C, sign } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.gregor = [
      { id: 'tobias', once: true, label: T('Ask about the small stone: Tobias Wren', 'تسأله عن الحجر الصغير: توبياس رن'), run: s => { s.f.eGrave = true; if (s.quests.q_e_1958) quest('q_e_1958', 'active'); return [C('gregor', 'sad', 'Ah. The Wren boy. 1958. Before my time, but my father dug it. Said the keeper, Arthur, stood here all night after. Didn\'t say a word. Then went back up his lighthouse and didn\'t sleep a night for fifty years.', 'آه. ولد عائلة رن. ١٩٥٨. قبل وقتي، بس أبوي هو اللي حفره. قال إن الحارس، آرثر، وقف هنا الليل كله بعدها. ولا قال كلمة. وبعدين رجع فوق منارته وما نام ليلة لمدة خمسين سنة.'), C('gregor', 'neutral', 'Clean it every week, I do. Somebody should. The family doesn\'t come. I think it\'s too heavy for them.', 'أنظفه كل أسبوع. لازم أحد يسويها. العيلة ما تجي. أحس إنه ثقيل عليهم.')]; } },
      { id: 'daniel', once: true, label: T('Ask about Daniel Hart\'s grave', 'تسأله عن قبر دانيال هارت'), run: [C('gregor', 'sad', 'His mother comes every day at three. Toothbrush, bucket, a little chat. Two years. I put the kettle on for her, she never drinks it. I keep putting it on.', 'أمه تجي كل يوم الساعة ثلاث. فرشاة أسنان، وسطل، وسوالف شوي. سنتين. أحط لها الغلاية، وعمرها ما شربت. وأكمل أحطها.')] },
      { id: 'jokes', label: T('"Tell me a gravedigger joke."', '«قل لي نكتة حفار قبور.»'), if: s => !doneToday('gJoke'), run: s => { onceToday('gJoke'); addMood(1); return [{ c: 'gregor', e: 'smile', t: fresh('gJokes', [T('Why is the cemetery so noisy? Because of all the coffin. ...Coughing. You see.', 'ليش المقبرة فيها إزعاج؟ عشان كل التوابيت تكح. ...تكح. فهمت.'), T('People are dying to get in here. Ha! Nine hundred of them, I said.', 'الناس يموتون عشان يدخلون هنا. ها! قلت لك تسع مية منها.'), T('What do you call a gravedigger who\'s lost his spade? Unemployed. That one\'s not a joke, that\'s my nightmare.', 'وش تسمي حفار قبور ضيّع مجرفته؟ عاطل. هذي مو نكتة، هذا كابوسي.')]) }]; } },
      sign('gregor', T('Fisher\'s Row? My mother was born on it. Give it here. Good, steady hand. Gravedigger\'s hand.', 'شارع الصيادين؟ أمي انولدت فيه. عطني. يد ثابتة. يد حفار قبور.'))
    ];
  }
  /* how Gregor looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.gregor = { sex: 'm', skin: '#e2c4a8', hair: '#9a9690', eye: '#4a5a5a', brow: '#8a8680', hairStyle: 'bald', beard: 'full', age: 66, sw: 102, ww: 90, hw: 90, pose: ['down', 'hold'], item: 'spade', fit: { top: 'coat', c1: '#3e3e34', c2: '#6a6a5a', bottom: 'pants', b: '#2a2a26' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.gregor.height = 1.06;
})();
