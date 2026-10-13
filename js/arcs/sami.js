/* =====================================================================
   Sami's story: "The credit book"  (docs/STORY.md §5)
   "Half the street owes me money." Sami gives everyone credit and never
   asks for it back. The book has grown too heavy. You ask three people
   who could pay and simply forgot; then Sami decides which pages to
   close for good. The money goes to Sami, never into your pocket.
     1. An evening at the grocery: the book under the counter   (topic)
     2. Marco, Kai and Rex: each gets a quiet word              (topics)
     3. Bring the envelope back (two of the three are enough)   (topic)
   ===================================================================== */
'use strict';
(function () {
  const say = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const B = s => s.f.samiBook || 0;
  const paid = s => ['marco', 'kai', 'rex'].filter(id => s.f['sb_' + id]).length;

  GAME.QUESTS.q_sami = { title: T('The credit book', 'دفتر الدين'),
    hint: T('Marco, Kai and Rex owe Sami and could pay. Have a quiet word with each, then bring the envelope back to the grocery.', 'ماركو وكاي وريكس عليهم دين لسامي ويقدرون يدفعون. {كلّم|كلّمي} كل واحد بهدوء، وبعدين {رجّع|رجّعي} الظرف للبقالة.') };

  /* 1. the book */
  GAME.TOPICS.sami.push({ id: 'book', label: T('Ask about the notebook under the counter', '{تسأله|تسألينه} عن الدفتر اللي تحت الكاونتر'),
    if: s => B(s) === 0 && s.day >= 4 && (s.slot === 2 || s.slot === 3) && !doneToday('samiBook'),   // afternoon or evening (evening alone clashed with chess)
    run: s => { onceToday('samiBook'); return [
      N_('Sami has counted the till twice. Now he is looking at a fat notebook, and not counting anything.', 'سامي عدّ الصندوق مرتين. والحين يطالع دفتر سمين، وما يعد شي.'),
      say('sami', 'neutral', 'This year\'s book. Since New Year, everyone in it owes me something. Eleven hundred and forty dollars, in a town where bread is two.', 'دفتر هالسنة. من رأس السنة، كل اللي فيه عليهم لي شي. ألف ومية وأربعين دولار، في بلدة الخبز فيها بدولارين.'),
      say('sami', 'sad', 'The delivery man wants paying. In money. Not in "next week, Sami".', 'رجّال التوصيل يبي فلوسه. فلوس. مو «الأسبوع الجاي يا سامي».'),
      say('sami', 'neutral', 'I won\'t ask them. You don\'t chase people for bread. My dad never did.', 'ما راح أطالبهم. ما تلاحق الناس على خبز. أبوي عمره ما سواها.'),
      { menu: [
        { t: T('"I could ask for you. Nicely."', '«أقدر أطلب عنك. بلطف.»'), cls: 'main',
          then: [say('sami', 'shock', 'You\'d do that? ...Three of them could pay and just forget. Marco. Kai. Rex.', '{بتسويها|بتسوينها}؟ ...فيه ثلاثة يقدرون يدفعون بس ناسين. ماركو. كاي. ريكس.'),
            say('sami', 'smile', 'Don\'t say I sent you. Well. Say I sent you a little.', '{لا تقول|لا تقولين} إني أرسلتك. طيب. {قل|قولي} إني أرسلتك شوي.'),
            st => { st.f.samiBook = 1; quest('q_sami', 'active'); return null; }] },
        { t: T('Leave it', '{تخليها|تخلينها}'),
          then: [say('sami', 'neutral', 'That\'s what I do. Every night.', 'هذا اللي أسويه. كل ليلة.')] }
      ] }]; } });

  /* 2. a quiet word with each */
  const ask = (id, lbl, lines, amount) => GAME.TOPICS[id].push({ id: 'samiDebt', once: true, label: lbl,
    if: s => B(s) === 1 && !s.f['sb_' + id],
    run: lines.concat([st => { st.f['sb_' + id] = amount; st.f.sbCash = (st.f.sbCash || 0) + amount; return null; }]) });

  ask('marco', T('"Sami\'s book has your name in it."', '«اسمك في دفتر سامي.»'), [
    say('marco', 'shock', 'Thirty-two dollars of flour and butter. For cakes I then sold. Oh no. I\'m a criminal.', 'اثنين وثلاثين دولار طحين وزبدة. لكيك بعته بعدين. يا ويلي. أنا مجرم.'),
    N_('He empties the tip jar onto the counter. It is mostly buttons. He makes up the rest from his own pocket and adds a slice of pie, "for the interest".', 'يفضّي برطمان البقشيش على الكاونتر. أغلبه أزرار. ويكمّل الباقي من جيبه، ويزيد قطعة فطيرة «على الفايدة».')
  ], 32);

  ask('kai', T('"Sami\'s book has your name in it."', '«اسمك في دفتر سامي.»'), [
    say('kai', 'shock', 'Fourteen dollars? Legend, I\'d pay that in a heartbeat. Let me just...', 'أربعطعش دولار؟ {يا بطل|يا بطلة}، أدفعها بدون تفكير. بس خلني...'),
    N_('He turns out his pockets: three dollars, a shell, and a key to something he can\'t remember.', 'يقلب جيوبه: ثلاث دولارات، وصدفة، ومفتاح لشي ما يتذكره.'),
    say('kai', 'smile', 'Three now. Tell him eleven on Sunday. Tell him I\'m a man of my word. Tell him I said that with a straight face.', 'ثلاثة الحين. {قل|قولي} له الباقي، إحدعش، يوم الأحد. {قل|قولي} له إني رجّال كلمة. {وقل|وقولي} له إني قلتها وأنا جاد.')
  ], 3);

  ask('rex', T('"Sami\'s book has your name in it."', '«اسمك في دفتر سامي.»'), [
    say('rex', 'shock', 'Sixty dollars. Lily\'s school lunches. I thought I\'d paid. I thought I\'d paid all of it.', 'ستين دولار. غدا ليلي في المدرسة. كنت أحسب إني دفعت. كنت أحسب إني دفعت كل شي.'),
    N_('He counts out sixty. Then he stops, and puts forty more on top.', 'يعد ستين. وبعدين يوقف، ويحط فوقها أربعين.'),
    say('rex', 'neutral', 'For the ones who can\'t. Don\'t tell him it was me. He\'ll know anyway.', 'هذي عن اللي ما يقدرون. {لا تقول|لا تقولين} له إنه أنا. بيعرف على كل حال.')
  ], 100);

  /* 3. the envelope */
  GAME.TOPICS.sami.push({ id: 'bookBack', once: true, label: T('Give him the envelope', '{تعطيه|تعطينه} الظرف'), cls: 'main',
    if: s => B(s) === 1 && paid(s) >= 2,
    run: s => [
      N_('Sami counts it. Then he counts it again, because he is Sami.', 'سامي يعدها. وبعدين يعدها مرة ثانية، لأنه سامي.'),
      say('sami', 'shock', s.f.sbCash + ' dollars. ...That\'s the delivery man. That\'s the delivery man and a bit.', s.f.sbCash + ' دولار. ...هذا رجّال التوصيل. هذا رجّال التوصيل وزيادة.'),
      N_('He opens the book. Slowly, carefully, he tears out a page. Then another. Ingrid\'s. The widower at number 20. A family whose name you don\'t catch.', 'يفتح الدفتر. ويشق صفحة، بهدوء وعلى مهله. وبعدها صفحة ثانية. صفحة إنغريد. والأرمل اللي في رقم ٢٠. وعيلة ما {لحقت|لحقتي} تسمع اسمها.'),
      say('sami', 'neutral', 'Some pages you don\'t collect. You close them. My dad burned his at New Year. I can\'t wait that long this time.', 'فيه صفحات ما تتحصّل. تتسكّر. أبوي كان يحرق دفتره في رأس السنة. هالسنة ما أقدر أنتظر.'),
      say('sami', 'smile', 'Take five. For the walking. Don\'t argue, it\'s not from the envelope, it\'s from me.', '{خذ|خذي} خمسة. على المشي. {لا تجادل|لا تجادلين}، مو من الظرف، مني أنا.'),
      st => { st.f.samiBook = 2; st.money += 5; addTrust('sami', 2); addMood(1); quest('q_sami', 'done'); return null; }] });

  GAME.CHAR.sami.chat = GAME.CHAR.sami.chat || [];
  /* a hint before it starts (phase 3): the book exists, and when to ask */
  GAME.CHAR.sami.chat.push({ if: s => B(s) === 0 && s.day >= 3, e: 'sad',
    t: T('That notebook under the counter gets heavier every week. Ask me about it some afternoon. Or don\'t.', 'الدفتر اللي تحت الكاونتر يثقل كل أسبوع. {اسألني|اسأليني} عنه عصرية من العصاري. أو لا.') });
  GAME.CHAR.sami.chat.push({ if: s => B(s) === 2, e: 'smile',
    t: T('The book\'s thinner. I sleep better. Turns out paper is heavy.', 'الدفتر صار أخف. وصرت أنام أحسن. طلع الورق ثقيل.') });
})();
