/* =====================================================================
   More of Leo's chapter (chapter 2). Four small scenes, each once:
     1. The anniversary. One morning the sofa is empty and there is a
        note with today's date, two years ago. Follow him, or don't.
        (Pays off the torn red-car drawing from the end of chapter 1.)
     2. The big house with the wide garden, on the deliveries: it is
        his mother's. She tips in lemons. She always has.
     3. The "V." on the eviction letter and the "V." on your postcard.
     4. The night of the bike crash: a siren far off, and the breathing
        Dr. Irene showed you.
   Plus people who notice (Margaret, Kai).
   Its own flags only (s.f.leoGrave, leoCarol, leoV, leoBreath); a little
   trust and mood. No quest, ending or ending-condition changes.
   ===================================================================== */
'use strict';
(function () {
  if (!GAME.CHAR.leo) return;
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const in2 = s => s.ch === 2 && s.f.metLeo && !s.f.leoEnded;
  const home = s => ['boathouse', 'loft', 'bh_bath', 'dock'].includes(s.loc);

  /* ---------- 1. the anniversary ---------- */
  GAME.EVENTS.push({ id: 'leoGrave', once: true,
    when: s => in2(s) && !RUN && d2(s) >= 2 && s.slot === 0 && !s.f.crashDone && s.f.restDayLeo !== s.day && home(s),
    run: s => [{ show: [] },
      N1('The sofa blanket is folded. Leo\'s bike is gone. On the table, on the back of a takeaway menu: "Back by noon. Don\'t follow me."', 'بطانية الكنب مطوية. ودراجة ليو مو موجودة. وعلى الطاولة، على ظهر منيو مطعم: «راجع الظهر. {لا تلحقني|لا تلحقيني}.»'),
      N1('Under it, a date. Today\'s date, two years ago.', 'وتحتها تاريخ. تاريخ اليوم، قبل سنتين.'),
      { menu: [
        { t: T('Follow him', '{تلحقه|تلحقينه}'), cls: 'main', then: [
          { go: 'cemetery' }, { show: [{ id: 'leo', e: 'sad' }] },
          N1('You find him in the churchyard, at the white stone. DANIEL HART. "Sang badly, loved well." The flowers on it are yesterday\'s.', '{تلقاه|تلقينه} في المقبرة، عند الحجر الأبيض. دانيال هارت. «غنّى بشكل سيء، وحب بشكل حلو.» والورد اللي عليه حق أمس.'),
          L_('sad', 'I come at seven. She comes at three. Two years and we\'ve never once been here at the same time. That\'s the deal I made with myself.', 'أنا أجي الساعة سبع. وهي تجي الساعة ثلاث. سنتين وعمرنا ما كنا هنا بنفس الوقت. هذا الاتفاق اللي سويته مع نفسي.'),
          N1('He takes something out of his hoodie pocket: a scrap of drawing paper, stiff from the sea. Half a car, coloured in red.', 'يطلّع شي من جيب الهودي: قطعة ورق رسم، ناشفة ومتكسرة من البحر. نص سيارة، ملوّنة أحمر.'),
          L_('sad', 'Every year I draw his car, and every year I tear it up and throw it off the harbour wall. This bit came back on the tide. Kai found it on the beach and brought it to me like a cat with a bird.', 'كل سنة أرسم سيارته، وكل سنة أقطّعها وأرميها من سور الميناء. هالقطعة رجعت مع المد. كاي لقاها على الشاطي وجابها لي مثل قطو جايب طير.'),
          L_('neutral', 'Like the sea\'s saying: not yet.', 'كأن البحر يقول: مو الحين.'),
          { menu: [
            { t: T('Sit with him and say nothing', '{تجلس|تجلسين} معه وما {تقول|تقولين} شي'), then: [
              N1('You sit on the wet grass beside him until the church clock does eight. He tucks the scrap under the flowers, and he is the one who stands up first.', '{تجلس|تجلسين} على العشب المبلول جنبه لين ساعة الكنيسة تدق ثمان. يدخّل القطعة تحت الورد، وهو اللي يقوم أول.'),
              st => { st.f.leoGrave = 'sat'; addTrust('leo', 1); addMood(1); return null; }] },
            { t: T('"Maybe she\'d want to see it."', '«يمكن هي تبي تشوفها.»'), then: [
              L_('sad', 'Maybe. Not today.', 'يمكن. مو اليوم.'),
              N1('But he doesn\'t leave it, and he doesn\'t throw it away. He puts it back in his pocket, carefully, like something that could still break.', 'بس ما يخليها، وما يرميها. يرجعها لجيبه، بشويش، كأنها شي ممكن لسا ينكسر.'),
              st => { st.f.leoGrave = 'said'; return null; }] }
          ] },
          { go: 'boathouse' }, { show: [] }, st => { advance(1); return null; }] },
        { t: T('Leave him be', '{تخليه|تخلينه} على راحته'), then: [
          N1('You leave the note where it is. Just before noon the bike comes back. Leo is quieter than usual, and kinder than usual, and makes you toast without asking.', '{تخلي|تخلين} الورقة مكانها. قبل الظهر بشوي ترجع الدراجة. ليو أهدى من العادة، وألطف من العادة، ويسوي لك توست بدون ما {تطلب|تطلبين}.'),
          st => { st.f.leoGrave = 'left'; advance(1); return null; }] }
      ] }]
  });

  /* ---------- 2. the big house with the wide garden ---------- */
  GAME.TOPICS.leo.push({ id: 'carol', once: true, cls: 'main',
    label: T('The order for the big house with the garden', 'الطلب حق البيت الكبير اللي فيه حديقة'),
    if: s => in2(s) && s.loc === 'street' && (s.f.deliverCount || 0) >= 2 && !s.f.crashDone && s.f.restDayLeo !== s.day && !doneToday('deliver'),
    run: s => { onceToday('deliver'); advance(1); return [
      N1('One order is for the big house with the wide garden. Leo reads the address twice, then holds the bag out to you without looking at it. "You do this one."', 'فيه طلب للبيت الكبير اللي فيه حديقة واسعة. ليو يقرا العنوان مرتين، وبعدين يمد لك الكيس بدون ما يطالعه. «هذا {عليك|عليكِ}.»'),
      { show: [{ id: 'carol', e: 'neutral' }] },
      N1('The door opens before you knock, as if someone has been watching the road. A woman of about fifty, flour on her sleeve. She looks past you, at the boy by the bike pretending to fix the chain.', 'الباب ينفتح قبل لا {تطق|تطقين}، كأن أحد كان يطالع الطريق. امرأة في الخمسين تقريباً، على كمها طحين. تطالع من وراك، الولد اللي جنب الدراجة يسوي نفسه يصلح السلسلة.'),
      N1('"Is he eating?" she asks. Not who are you. Is he eating.', '«ياكل؟» تسأل. مو مين {أنت|أنتِ}. ياكل؟'),
      { menu: [
        { t: T('"Pasta, mostly. I make it with lemon."', '«مكرونة، أغلب الوقت. أسويها بليمون.»'), then: [{ show: [{ id: 'carol', e: 'smile' }] },
          N1('Something in her face lets go. "With lemon," she says. "Then tell him the sauce is the same. Don\'t tell him I asked."', 'شي في وجهها يرتخي. «بليمون،» تقول. «أجل {قل|قولي} له الصوص نفسه. {ولا تقول|ولا تقولين} له إني سألت.»')] },
        { t: T('"Not enough."', '«مو كفاية.»'), then: [{ show: [{ id: 'carol', e: 'sad' }] },
          N1('She nods, as if you have confirmed something she already knew, and goes back inside. She comes out with a foil tray still warm. "Lasagne. He\'ll say he isn\'t hungry. Leave it on the table and walk away."', 'تهز راسها، كأنك {أكدت|أكدتي} شي هي تعرفه، وتدخل. وتطلع بصينية ألمنيوم لسا حارة. «لازانيا. بيقول ما هو جوعان. {حطها|حطيها} على الطاولة {وامش|وامشي}.»')] }
      ] },
      N1('She tips ten dollars and a lemon.', 'تعطيك بقشيش عشر دولارات وليمونة.'),
      N1('A lemon. The same as the third house, on your very first day.', 'ليمونة. نفس البيت الثالث، أول يوم {اشتغلت|اشتغلتي} معه.'),
      { show: [{ id: 'leo', e: 'sad' }] },
      L_('sad', 'Don\'t.', 'لا.'),
      L_('sad', 'She leaves the porch light on. Every night, since I left. You can see it from the dock, if you know where to look. I always know where to look.', 'تخلي نور الحوش مولّع. كل ليلة، من طلعت. تقدر تشوفه من الرصيف، إذا تعرف وين تطالع. وأنا دايم أعرف وين أطالع.'),
      st => { st.f.leoCarol = true; st.money += 5; addMood(1); return null; },
      N1('+ $5 (he won\'t take his half)', '+ ٥$ (ما رضى ياخذ نصه)')
    ]; } });

  /* ---------- 3. two V.s ---------- */
  GAME.TOPICS.leo.push({ id: 'leoV', once: true,
    label: T('Show him the "V." on your father\'s postcard', '{ورّه|ورّيه} «ف.» اللي على كرت أبوك'),
    if: s => in2(s) && !!s.f.knowsDebt && has('postcard') && (s.trust.leo || 0) >= 3,
    run: s => [
      N1('You put the postcard next to the eviction letter. Two V.s. One careful, in a hand you grew up with. One with a little smile in it.', '{تحط|تحطين} الكرت جنب خطاب الإخلاء. حرفين «ف.». واحد مرتب، بخط {تربيت|تربيتي} عليه. والثاني فيه ابتسامة صغيرة.'),
      L_('shock', 'That\'s him. That\'s Victor. He signs everything like that, like he\'s pleased with himself.', 'هذا هو. هذا فيكتور. يوقّع كل شي كذا، كأنه مبسوط على نفسه.'),
      N1('You tell him about the house that was sold while you were away. The letters your mother never showed you. He listens with his chin on his good hand.', '{تقول|تقولين} له عن البيت اللي انباع وأنت{|ِ} مسافر{|ة}. والرسايل اللي أمك ما ورّتك إياها. يسمع وذقنه على يده السليمة.'),
      L_('sad', 'So he had your dad too. He\'s got half this town on a piece of paper somewhere.', 'يعني كان ماسك أبوك بعد. عنده نص البلد على ورقة في مكان ما.'),
      L_('smile', 'Welcome to the club. The club is everyone. We meet at Marco\'s. Nobody pays.', 'هلا بك في النادي. النادي هو الكل. نجتمع عند ماركو. ومحد يدفع.'),
      st => { st.f.leoV = true; addMood(1); return null; }
    ] });

  /* ---------- 4. the siren ---------- */
  GAME.EVENTS.push({ id: 'leoSiren', once: true,
    when: s => in2(s) && !RUN && !!s.f.crashDone && s.day === s.f.crashDay && s.slot === NIGHT && !s.f.finale2Done && home(s),
    run: s => [{ show: [{ id: 'leo', e: 'shock' }] },
      N1('Late. Somewhere up on the coast road, a siren. Far away. Leo, on the floor by the sofa, stops moving.', 'متأخر. فوق في طريق الساحل، صفارة. بعيدة. ليو، على الأرض جنب الكنب، يوقف عن الحركة.'),
      N1('His good hand is flat on the boards, white at the knuckles. He is breathing like someone running.', 'يده السليمة مفرودة على الخشب، ومفاصلها بيضا. ويتنفس كأنه يركض.'),
      { menu: [
        { t: T('Breathe with him: in for four, out for six', '{تتنفس|تتنفسين} معه: شهيق لأربع، زفير لست'), cls: 'main', then: [
          N1('You sit in front of him and breathe out loud, slow and silly: in for four, out for six. He glares at you. Then he copies you. Four. Six. Four. Six. The siren goes somewhere else.', '{تجلس|تجلسين} قدامه {وتتنفس|وتتنفسين} بصوت عالي، بطيء وسخيف: شهيق لأربع، زفير لست. يطالعك بقهر. وبعدين يقلدك. أربع. ست. أربع. ست. والصفارة تروح لمكان ثاني.'),
          L_('sad', '...That was so embarrassing.', '...كان محرج مرة.'),
          N1('He doesn\'t let go of your sleeve for a while.', 'وما يفك كمك لفترة.'),
          st => { st.f.leoBreath = 'breathe'; addTrust('leo', 1); return null; }] },
        { t: T('Put the TV on, loud', '{تشغل|تشغلين} التلفزيون، بصوت عالي'), then: [
          N1('You put on the loudest thing you can find: a cooking show, a man shouting about butter. Leo laughs, wetly. The siren is gone underneath it.', '{تشغل|تشغلين} أعلى شي {تلقاه|تلقينه}: برنامج طبخ، رجّال يصارخ عن الزبدة. ليو يضحك، وعيونه مبلولة. والصفارة تختفي تحته.'),
          st => { st.f.leoBreath = 'tv'; return null; }] }
      ] }]
  });

  /* ---------- people notice ---------- */
  const chat = (id, when, e, en, ar) => { const c = GAME.CHAR[id]; if (c && Array.isArray(c.chat)) c.chat.unshift({ if: when, e, t: T(en, ar) }); };
  chat('kai', s => !!s.f.leoGrave, 'neutral', 'Found a bit of drawing on the beach a while back. Half a red car. Gave it to Leo. He went a weird colour. Did I do bad?', 'لقيت قطعة رسمة على الشاطي من فترة. نص سيارة حمرا. عطيتها ليو. لونه صار غريب. سويت شي غلط؟');
  /* Margaret, whenever her chapter comes: somebody visits Daniel early */
  if (GAME.CHAR.margaret) {
    GAME.TOPICS.margaret = GAME.TOPICS.margaret || [];
    GAME.TOPICS.margaret.push({ id: 'mEarly', once: true, label: T('Ask who leaves things at Daniel\'s stone', '{تسألها|تسألينها} مين يحط أشياء عند حجر دانيال'),
      if: s => s.host === 'margaret' && s.f.leoGrave === 'sat',
      run: [
        { c: 'margaret', e: 'sad', t: T('Somebody comes before me. Early. Every year on the day, and some Sundays. A ticket stub once. Once a piece of a drawing, all salt. I never see who.', 'أحد يجي قبلي. بدري. كل سنة بنفس اليوم، وبعض الآحاد. مرة كعب تذكرة. ومرة قطعة من رسمة، كلها ملح. وعمري ما شفت مين.') },
        { c: 'margaret', e: 'sad', t: T('I could come at seven. I never have. I think whoever it is needs it to be theirs.', 'أقدر أجي الساعة سبع. وعمري ما جيت. أحس اللي يجي يحتاج هالوقت يكون حقه.') }
      ] });
  }
})();
