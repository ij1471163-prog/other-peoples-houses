/* =====================================================================
   Martha — Cleans for Elias on Tuesdays and Fridays. Knows everything.
   Everything that is Martha's own: profile, where Martha is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (elias.js).
   ===================================================================== */
'use strict';
(function () {
  /* who Martha is and Martha's daily routine (Chapter 1, Elias) */
  GAME.CHAR.martha = {
    name: T('Martha', 'مارثا'), role: T('Cleans for Elias on Tuesdays and Fridays. Knows everything.', 'تنظف لإلياس الثلاثاء والجمعة. تعرف كل شي.'), art: true,
    where: s => (s.f.metElias && !s.f.ended && !s.f.prologue && isMarthaDay(s) ? [null, 'living', 'kitchen', null, null][s.slot] : null),
    doing: s => (s.slot === 1 ? T('Martha is dusting things that aren\'t dusty and talking to them.', 'مارثا تنفض أشياء ما فيها غبار، وتكلمها.') : T('Martha is scrubbing the kitchen and humming loudly.', 'مارثا تفرك المطبخ وتدندن بصوت عالي.')),
    greet: s => (s.day >= 2 && s.day - (s.f.lastShower ?? -1) >= 2) ? { e: 'shock', t: T('Oh, love. When did you last see soap?', 'يا عمري. متى آخر مرة {شفت|شفتي} صابونة؟') } : { e: 'smile', t: T('There you are! Elias said he had a lodger. He didn\'t say a nice one.', '{هذا أنت|هذي أنتِ}! إلياس قال عنده {ساكن|ساكنة}. ما قال {إنه لطيف|إنها لطيفة}.') }
  };
  /* things to talk about (Chapter 1, Elias) */
  GAME.TOPICS.martha = [
    { id: 'clean', label: T('Help her clean', '{تساعدها|تساعدينها} بالتنظيف'), if: s => !doneToday('clean'), cls: 'main', run: s => {
        onceToday('clean'); addMood(1); s.money += 5; s.f.marthaHelp = (s.f.marthaHelp || 0) + 1; advance(1);
        const n = s.f.marthaHelp;
        const gossip = [
          [{ c: 'martha', e: 'smile', t: T('Ada was my best friend, you know. Forty years. She\'d have liked you. She liked strays.', 'آدا كانت أعز صديقاتي، {تدري|تدرين}. أربعين سنة. كانت بتحبك. كانت تحب المتشردين.') }],
          [{ c: 'martha', e: 'sad', t: T('He stopped eating properly in the spring. And there\'s a letter from a city hospital in his dresser. I dust. I don\'t read. Mostly.', 'وقف ياكل زين من الربيع. وفيه خطاب من مستشفى بالمدينة في تسريحته. أنا أنفض الغبار. ما أقرا. يعني، غالباً.') }, s2 => { s2.f.marthaHint = true; quest('q_secret', 'active'); return null; }],
          [{ c: 'martha', e: 'sad', t: T('Thomas used to climb out of that window to go to parties. Elias always knew. Always left the window unlocked.', 'توماس كان يطلع من هالشباك عشان الحفلات. وإلياس دايم يدري. ودايم يخلي الشباك مفتوح.') }, { c: 'martha', e: 'neutral', t: T('Stubborn, the pair of them. Somebody has to go first. It\'s never the stubborn one.', 'عنيدين الاثنين. لازم واحد يبدأ. وعمره ما يكون العنيد.') }]
        ];
        return [N_('You scrub, she talks. She does most of the talking and, honestly, most of the scrubbing.', '{أنت تفرك|أنتِ تفركين}، وهي تسولف. هي تسوي أغلب السوالف، وبصراحة، أغلب الفرك.'), N_('She presses five dollars into your hand: "Don\'t argue."', 'تحط في يدك خمس دولارات: «{لا تجادل|لا تجادلين}.»')].concat(n <= 3 ? gossip[n - 1] : [{ c: 'martha', e: 'smile', t: T('You\'re getting good at this. Don\'t tell anyone, they\'ll make you do it.', '{صرت شاطر|صرتي شاطرة}. {لا تقول|لا تقولين} لأحد، بيخلونك {تسويه|تسوينه}.') }]);
      } },
    { id: 'ada', once: true, label: T('Ask about Ada', '{تسألها|تسألينها} عن آدا'), run: [
        { c: 'martha', e: 'sad', t: T('Loud. Funny. Terrible cook. She\'s why Elias laughs the way he does, when he does.', 'صوتها عالي. ومضحكة. وطبخها سيء. هي السبب إن إلياس يضحك بهالطريقة، لما يضحك.') },
        { c: 'martha', e: 'neutral', t: T('He repaints her name on that boat every spring. Silly old man.', 'يصبغ اسمها على القارب كل ربيع. عجوز سخيف.') }] }
  ];
  /* Martha also cleans Margaret's house (Mondays and Thursdays) */
  { const mw = GAME.CHAR.martha.where;
    GAME.CHAR.martha.where = s => {
      const w = mw(s); if (w) return w;
      if (s.host === 'margaret' && s.f.metMarg && (weekday(s.day) === 1 || weekday(s.day) === 4) && (s.slot === 1 || s.slot === 2)) return s.slot === 1 ? 'marg_living' : 'marg_kitchen';
      return null;
    };
    const md = GAME.CHAR.martha.doing;
    GAME.CHAR.martha.doing = s => (s.host === 'margaret' ? (s.slot === 1 ? T('Martha is hoovering round Margaret\'s feet and talking over the noise.', 'مارثا تشغّل المكنسة حول رجول مارغريت وتسولف فوق الإزعاج.') : T('Martha is scrubbing Margaret\'s oven and singing to it.', 'مارثا تفرك فرن مارغريت وتغني له.')) : md(s));
  }
  /* her chats from Elias's time only make sense while he's alive */
  GAME.TOPICS.martha.forEach(t => { const f = t.if; t.if = s => !s.f.ended && (!f || f(s)); });
  { const { CH } = GAME.H.systems;
    /* things to talk about (daily life and jobs) */
    GAME.TOPICS.martha.push(
      { id: 'help2', label: T('Help her clean', '{تساعدها|تساعدينها} بالتنظيف'), if: s => s.host === 'margaret' && !doneToday('marthaM'), cls: 'main', run: s => { onceToday('marthaM'); advance(1); s.money += 5; addMood(1); addTrust('margaret', 1); return [{ c: 'martha', e: 'smile', t: fresh('marthaM', [T('Margaret pays me to clean, and I pay her in gossip. Fair trade. Pass me that cloth, love.', 'مارغريت تدفع لي عشان أنظف، وأنا أدفع لها سوالف. تبادل عادل. {ناولني|ناوليني} هالقماشة يا عمري.'), T('Two years she\'s let me in here and never once let me touch his room. I dust round that door like it\'s a church.', 'لها سنتين تخليني أدخل وعمرها ما خلتني ألمس غرفته. أنفض الغبار حول هالباب كأنه كنيسة.'), T('You\'re good for her. She bought biscuits last week. Biscuits! For guests!', '{أنت زين|أنتِ زينة} لها. اشترت بسكويت الأسبوع اللي فات. بسكويت! للضيوف!')]) }, N_('+ $5', '+ ٥$')]; } },
      { id: 'sami2', once: true, label: T('"How do you know everyone?"', '«كيف تعرفين الكل؟»'), if: s => !!s.f.ended, run: [CH('martha', 'smile', 'I clean half the houses in Saltmere. You can learn more from a person\'s bathroom cabinet than from their priest. I don\'t look, mind. Much.', 'أنظف نص بيوت سولتمير. تتعلم من دولاب حمام الشخص أكثر من قسيسه. بس ما أطالع، {انتبه|انتبهي}. كثير.')] }
    );
  }
  /* how Martha looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.martha = { sex: 'f', skin: '#efbf9e', hair: '#bdbab4', eye: '#6a4a36', brow: '#9a9690', hairStyle: 'scarf', age: 62, sw: 94, ww: 92, hw: 102, pose: ['hip', 'hip'], fit: { top: 'cardigan', c1: '#e47a9e', c2: '#fffaf0', bottom: 'skirt', b: '#4a3a50', apron: '#fffaf0', floral: true, gloves: '#ffd23a' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.martha.height = 0.86;
})();

/* Martha's day: what Martha is doing in each place (shown by js/life.js) */
if (GAME.CHAR.martha) GAME.CHAR.martha.life = { living: 'clean', kitchen: 'clean' };

/* small talk: what Martha says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.martha) GAME.CHAR.martha.chat = [
  { e: 'smile', t: T("I clean half the houses in Saltmere. I know who irons their socks. I'll take it to my grave. Most of it.", "أنظف نص بيوت سولتمير. أعرف مين يكوي شرّاباته. وبآخذ هالسر معي للقبر. أغلبه.") },
  { e: 'sad', t: T("Ada used to hum while she dried the dishes. Same song every time. I hum it now, so somebody does.", "آدا كانت تدندن وهي تنشّف الصحون. نفس الأغنية كل مرة. وأنا أدندنها الحين، عشان أحد يدندنها.") },
  { if: s => s.host === 'elias', e: 'sad', t: T("He's eating less. Don't tell him I said. Put an extra sugar in his tea. He won't notice.", "صار ياكل أقل. {لا تقول|لا تقولين} له إني قلت. {حط|حطي} له سكر زيادة في الشاي. ما بينتبه.") },
  { if: s => s.host === 'margaret', e: 'neutral', t: T("That house is too clean. Clean like nobody's allowed to touch anything.", "هالبيت نظيف زيادة. نظيف كأن ما أحد مسموح له يلمس شي.") },
  { e: 'neutral', t: T("Rubber gloves are the secret. And never clean a mirror in the sun. Streaks. Write that down.", "السر في القفازات. {ولا تنظف|ولا تنظفين} مراية والشمس عليها أبداً. تطلع خطوط. {اكتبها|اكتبيها}.") },
  /* reacts to what happened (phase 2) */ { if: s => (s.f.mArc || 0) >= 4, e: 'sad', t: T("He ate it all, you know. Burnt top and all. Don't tell him I cried in his kitchen.", "أكلها كلها، {تدري|تدرين}. بالوجه المحروق وكل شي. {لا تقول|لا تقولين} له إني بكيت في مطبخه.") }
];
