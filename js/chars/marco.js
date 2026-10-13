/* =====================================================================
   Marco — Owns the café. Wants to be a comedian. Should not.
   Everything that is Marco's own: profile, where Marco is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (elias.js, town.js, systems.js).
   ===================================================================== */
'use strict';
(function () {
  /* who Marco is and Marco's daily routine (Chapter 1, Elias) */
  GAME.CHAR.marco = {
    name: T('Marco', 'ماركو'), role: T('Owns the café. Wants to be a comedian. Should not.', 'صاحب المقهى. يبي يصير كوميدي. المفروض لا.'), art: true,
    where: s => (!s.f.prologue && s.slot < NIGHT ? 'cafe' : null),
    doing: s => [T('Marco is practising a joke on the coffee machine.', 'ماركو يجرب نكتة على مكينة القهوة.'), T('Marco is serving soup and opinions.', 'ماركو يقدم شوربة وآراء.'), T('Marco is wiping the same table for the fifth time.', 'ماركو يمسح نفس الطاولة للمرة الخامسة.'), T('Marco is pretending not to watch the chess game.', 'ماركو يسوي نفسه ما يتفرج على الشطرنج.')][s.slot],
    greet: s => (s.day >= 2 && s.day - (s.f.lastShower ?? -1) >= 2) ? { e: 'shock', t: T('You smell like the harbor. The bad part of the harbor.', 'ريحتك مثل الميناء. الجزء الخايس منه.') } : { e: 'smile', t: T('My favourite audience! Sit, sit.', 'جمهوري المفضل! {اجلس، اجلس|اجلسي، اجلسي}.') }
  };
  /* things to talk about (Chapter 1, Elias) */
  GAME.TOPICS.marco = [
    { id: 'coffee', label: T('Order a coffee ($2)', '{تطلب|تطلبين} قهوة (٢$)'), if: s => !doneToday('coffee'), need: s => s.money >= 2, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { onceToday('coffee'); pay(2); addMood(1); return [{ c: 'marco', e: 'smile', t: pickOne([T('Espresso. Like my jokes: short, bitter, and nobody asked for it.', 'إسبريسو. مثل نكتي: قصير، مر، ومحد طلبه.'), T('On the house. No. Two dollars. I have a business to run into the ground.', 'على حسابي. لا. دولارين. عندي مشروع لازم أفلّسه.')]) }]; } },
    { id: 'joke', once: true, label: T('Ask how the comedy is going', '{تسأله|تسألينه} عن الكوميديا'), run: s => { addMood(1); return [
      { c: 'marco', e: 'smile', t: T('Perfect timing. New material. Why don\'t fish play basketball?', 'توقيت مثالي. عندي جديد. ليش السمك ما يلعب كرة سلة؟') },
      N_('You wait.', '{تنتظر|تنتظرين}.'),
      { c: 'marco', e: 'smile', t: T('They\'re scared of the NET.', 'لأنهم خايفين من الشبكة.') },
      N_('You don\'t laugh. He frowns, drags a chair to the middle of the café and tells you to stand on it, "to feel the crowd."', '{ما تضحك|ما تضحكين}. يعبس، يسحب كرسي لنص المقهى، ويقول لك {توقف|توقفين} عليه «عشان {تحس|تحسين} بالجمهور».'),
      N_('The chair has three good legs. You find out about the fourth in front of everyone, and land in the pie display.', 'الكرسي عنده ثلاث رجول سليمة. {وتكتشف|وتكتشفين} الرابعة قدام الكل، {وتطيح|وتطيحين} في فاترينة الفطاير.'),
      N_('The whole café laughs. At you. Then you start laughing too, on the floor, covered in apple pie, and you can\'t stop.', 'المقهى كله يضحك. عليك. وبعدين {تبدأ تضحك أنت|تبدين تضحكين أنتِ} بعد، على الأرض، {مغطى|مغطاة} بفطيرة تفاح، وما {تقدر توقف|تقدرين توقفين}.'),
      { c: 'marco', e: 'shock', t: T('THAT. That\'s comedy. You\'re a natural. Also you owe me a pie.', 'هذا. هذي هي الكوميديا. {أنت|أنتِ} موهبة. وبعد عليك فطيرة.') }]; } },
    { id: 'openmic', once: true, label: T('Ask about open mic night', '{تسأله|تسألينه} عن ليلة الميكروفون'), if: s => s.f['tp_marco_joke'] && s.day >= 3, run: [
      { c: 'marco', e: 'smile', t: T('Funny you should ask. I signed you up. You\'re on in five minutes.', 'غريب إنك {تسأل|تسألين}. سجلتك. دورك بعد خمس دقايق.') },
      N_('Before you can argue, there\'s a microphone in your hand and eleven people looking at you, including an old woman who is already disappointed.', 'قبل ما {تعترض|تعترضين}، الميكروفون في يدك وإحدعش شخص يطالعونك، منهم عجوز شكلها خاب ظنها من الحين.'),
      { menu: [
        { t: T('Tell Marco\'s fish joke', '{تقول|تقولين} نكتة السمك حقت ماركو'), fx: s => addMood(1), then: [N_('A long groan from the whole room. Then one laugh, then three. Marco is crying with pride.', 'تنهيدة طويلة من الكل. وبعدين ضحكة وحدة، وبعدها ثلاث. ماركو يبكي من الفخر.')] },
        { t: T('Freeze', '{تتجمد|تتجمدين}'), fx: s => addMood(-1), then: [N_('You stand there for forty seconds. Someone coughs. You say "thank you" and sit down. It will haunt you at 3 a.m. for years.', '{توقف|توقفين} أربعين ثانية. أحد يكح. {تقول|تقولين} «شكراً» {وتجلس|وتجلسين}. هالموقف بيطاردك الساعة ثلاث الفجر لسنين.')] },
        { t: T('Tell the truth', '{تقول|تقولين} الحقيقة'), fx: s => addMood(2), then: [N_('"I came here on the last train with three dollars and my dad\'s postcard. An old man gave me half a loaf of bread. That\'s the whole act."', '«جيت هنا بآخر قطار، ومعي ثلاث دولارات وكرت بريدي حق أبوي. وعجوز عطاني نص خبزة. وهذا كل العرض.»'), N_('Silence. Then the disappointed old woman starts clapping, slowly, and doesn\'t stop until everyone joins in.', 'سكوت. وبعدين العجوز اللي خاب ظنها تبدأ تصفق، شوي شوي، وما توقف لين الكل يصفق معها.')] }
      ] }] },
    { id: 'elias', once: true, label: T('Ask about Elias', '{تسأله|تسألينه} عن إلياس'), if: s => s.f.metElias, run: [
      { c: 'marco', e: 'sad', t: T('Since I was a boy he\'s been beating me at chess. Lately he forgets moves.', 'من وأنا صغير وهو يغلبني بالشطرنج. وأخيراً صار ينسى النقلات.') },
      { c: 'marco', e: 'sad', t: T('Last week he called me Thomas. Then he pretended he didn\'t. I pretended too.', 'الأسبوع اللي فات ناداني توماس. وبعدين سوّى نفسه ما قال. وأنا بعد سويت نفسي ما سمعت.') },
      s => { s.f.forgot = true; if (!s.f.ended) quest('q_secret', 'active'); return null; }] }
  ];
  { const { C } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.marco.push(
      { id: 'openmic', label: T('Ask Marco to keep a Thursday spot for Ingrid', '{تطلب|تطلبين} من ماركو يحجز مكان الخميس لإنغريد'), if: s => s.quests.q_voice === 'active' && !s.f.micBooked, run: s => { s.f.micBooked = true; return [C('marco', 'shock', 'Ingrid? Singing? Here? I\'ll move my set. I\'ll CANCEL my set. No, I\'ll do a short set. Three jokes. Four. Leave it with me.', 'إنغريد؟ تغني؟ هنا؟ بأخّر فقرتي. بلغي فقرتي. لا، بسوي فقرة قصيرة. ثلاث نكت. أربع. خلها علي.')]; } }
    );
  }
  { const { sign } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.marco.push(
      sign('marco', T('Sign? With my whole heart. And my real name, which is Marcello, which you will tell NO ONE.', 'أوقّع؟ من كل قلبي. وباسمي الحقيقي، اللي هو مارتشيلو، واللي ما {بتقوله|بتقولينه} لأحد.'))
    );
  }
  /* things to talk about (daily life and jobs) */
  GAME.TOPICS.marco.push(
    { id: 'pie', label: T('Buy a slice of pie ($3)', '{تشتري|تشترين} قطعة فطيرة (٣$)'), need: s => s.money >= 3, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(3); feed(40); addMood(1); return [{ c: 'marco', e: 'smile', t: fresh('pie', [T('Apple pie. Baked this morning. By my mother. Don\'t tell anyone, they think it\'s me.', 'فطيرة تفاح. انخبزت الصبح. أمي سوتها. {لا تقول|لا تقولين} لأحد، يحسبونها أنا.'), T('Warm pie, cold coffee. That\'s the house special. It\'s also a mistake.', 'فطيرة حارة وقهوة باردة. هذا طبق البيت. وهو بعد غلطة.'), T('Eat. You look like a sad ghost. A sad ghost who could use pie.', '{كل|كلي}. شكلك شبح حزين. شبح حزين محتاج فطيرة.')]) }]; } },
    { id: 'shift', label: T('Work an evening shift ($4 + tips)', '{تشتغل|تشتغلين} شفت المغرب (٤$ + بقشيش)'), if: s => s.slot === 3 && s.day >= 2 && !doneToday('shift'), cls: 'main', run: s => { onceToday('shift'); s.f.shifts = (s.f.shifts || 0) + 1; return [
      { c: 'marco', e: 'smile', t: fresh('shiftIntro', [T('Apron\'s on the hook. Table four wants everything. Table six wants nothing but complains anyway.', 'المريلة على المسمار. طاولة أربعة تبي كل شي. وطاولة ستة ما تبي شي بس تتشكى على كل حال.'), T('Rush hour. By which I mean eight people. Go, go, go.', 'وقت الزحمة. يعني ثمان أشخاص. يلا، يلا، يلا.'), T('Remember: smile, serve, never tell them who baked the pie.', '{تذكر: ابتسم، قدّم، ولا تقول|تذكري: ابتسمي، قدّمي، ولا تقولين} لهم مين خبز الفطيرة.')]) },
      { mini: 'cafe', size: s.f.shifts > 2 ? 4 : 3, then: (r, st) => { const tip = r * 2; st.money += 4 + tip; addMood(r >= 2 ? 1 : 0); rest(-10); advance(1); return [N_(r >= 3 ? 'Every order right. Marco hugs you. You didn\'t agree to that.' : r >= 2 ? 'Mostly right. Someone got soup instead of lemonade and decided they preferred it.' : 'Chaos. A man got a pie in a teacup. Marco calls it "experimental service".', r >= 3 ? 'كل الطلبات صح. ماركو يضمك. ما {وافقت|وافقتي} على هذا.' : r >= 2 ? 'أغلبها صح. واحد جاه شوربة بدل الليمونادة وقرر إنه يحبها أكثر.' : 'فوضى. رجل جاته فطيرة في كوب شاي. ماركو يسميها «خدمة تجريبية».'), N_('+ $' + (4 + tip), '+ ' + (4 + tip) + '$')]; } }]; } }
  );
  /* Marco's coffee perks you up (daily needs) */
  { const co = GAME.TOPICS.marco.find(t => t.id === 'coffee'); if (co) { const f = co.run; co.run = s => { rest(15); return f(s); }; } }
  /* how Marco looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.marco = { sex: 'm', skin: '#e6b48c', hair: '#4f321f', eye: '#3f6a3c', brow: '#4a2e1c', hairStyle: 'curly', beard: 'mustache', age: 28, sw: 98, ww: 74, hw: 78, pose: ['down', 'hold'], item: 'cup', fit: { top: 'shirt', c1: '#2f62a0', stripes: '#e8e0cc', rolled: true, bottom: 'pants', b: '#2c2c34', apronWaist: '#1f1f24', towel: true } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.marco.height = 0.97;
})();

/* Marco's day: what Marco is doing in each place (shown by js/life.js) */
if (GAME.CHAR.marco) GAME.CHAR.marco.life = { cafe: 'serve', away: s => (s.slot === NIGHT ? 'sleep' : null) };

/* small talk: what Marco says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.marco) GAME.CHAR.marco.chat = [
  { e: 'smile', t: T("New joke: what does a gull say to a fisherman? “Thanks for lunch.” ...It's about Kevin. Everything is about Kevin.", "نكتة جديدة: وش يقول النورس للصياد؟ «شكراً على الغدا.» ...النكتة عن كيفن. كل شي عن كيفن.") },
  { if: s => s.slot <= 1, e: 'neutral', t: T("Morning rush: three fishermen and Ingrid. I call it a rush for morale.", "زحمة الصبح: ثلاث صيادين وإنغريد. أسميها زحمة عشان المعنويات.") },
  { if: s => s.host === 'elias', e: 'smile', t: T("Tell Elias the board's set up. He pretends he doesn't care. He's here at six, exactly.", "{قل|قولي} لإلياس إن الشطرنج جاهز. يسوي نفسه ما يهتم. ويجي الساعة ست بالضبط.") },
  { if: s => s.host === 'leo', e: 'neutral', t: T("Leo owes me for four sandwiches. I'm not asking. I'm just saying the number out loud. Often.", "ليو عليه أربع سندويشات. ما أطالب. بس أقول الرقم بصوت عالي. كثير.") },
  { if: s => (s.ch || 1) >= 3, e: 'neutral', t: T("Victor came in once. Ordered water. Tipped a hundred. I framed it. Then I unframed it and paid my rent.", "فيكتور جا مرة. طلب ماي. وعطاني بقشيش مية. برْوزتها. وبعدين طلّعتها ودفعت إيجاري.") },
  { e: 'sad', t: T("My nonna had this café before me. She said a café is a living room for people who don't have one.", "جدتي كانت تملك المقهى قبلي. كانت تقول المقهى صالة للناس اللي ما عندهم صالة.") },
  { if: s => s.slot >= 2, e: 'smile', t: T("Open mic on Thursday. Come. Laugh at the right bits. Or the wrong bits. I'm not proud.", "الأمسية المفتوحة يوم الخميس. {تعال|تعالي}. {اضحك|اضحكي} في الأماكن الصح. أو الغلط. ما عندي كرامة.") }
];
