/* =====================================================================
   Saltmere, the town: more people with their own lives, side quests,
   jobs, new places (beach, cemetery, florist, police), news of old hosts,
   and a pool of short random moments that never repeat back to back.
   Loads after leo.js, before the late chapters.
   ===================================================================== */
'use strict';
(function () {
  const on = s => !s.f.prologue;
  const C = (id, e, en, ar) => ({ c: id, e, t: T(en, ar) });
  const byDay = (s, a) => a[s.day % a.length];

  /* the town's people live in js/chars/<id>.js */

  Object.assign(GAME.ITEMS, {
    fish: GAME.ITEMS.fish || { name: T('Fish', 'سمك'), desc: T('Fresh. Smells it.', 'طازج. وريحته تقول.') },
    admiral: { name: T('Admiral (a cat)', 'الأدميرال (قطو)'), desc: T('Ginger, heavy, deeply unimpressed with you.', 'برتقالي، ثقيل، ومو منبهر فيك أبداً.') },
    bouquet: { name: T('Bouquet', 'باقة ورد'), desc: T('From Stella\'s. Smells like a better day.', 'من محل ستيلا. ريحتها يوم أحسن.') },
    shell: { name: T('Spiral shell', 'صدفة حلزونية'), desc: T('Perfect. Pink inside. From the beach.', 'كاملة. وردية من داخل. من الشاطئ.') }
  });
  Object.assign(GAME.QUESTS, {
    q_cat: { title: T('Where is the Admiral?', 'وين الأدميرال؟'), hint: T('Stella\'s ginger cat is missing. He likes fish and high places, and moves around town day to day.', 'قطو ستيلا البرتقالي ضايع. يحب السمك والأماكن العالية، ويتنقل في البلدة من يوم ليوم.') },
    q_gift: { title: T('A present for Lily', 'هدية لليلي'), hint: T('Officer Rex\'s daughter turns ten and he has no idea what to get her. Flowers? Something from the beach?', 'بنت الضابط ريكس بتصير عشر سنين وهو ما عنده فكرة وش يجيب لها. ورد؟ شي من الشاطئ؟') },
    q_voice: { title: T('Thursday night', 'ليلة الخميس'), hint: T('Ingrid used to sing at Marco\'s open mic. Get to know her, and ask Marco to keep a spot on a Thursday evening.', 'إنغريد كانت تغني في ليلة الميكروفون عند ماركو. تعرّف عليها، واطلب من ماركو يحجز لها مكان مساء خميس.') },
    q_petition: { title: T('Save Fisher\'s Row', 'أنقذوا شارع الصيادين'), hint: T('Olivia needs signatures. Ask people around town: Sami, Marco, Stella, Maya, Gregor, Kai, Ingrid. Five will do.', 'أوليفيا تحتاج تواقيع. اسأل الناس في البلدة: سامي، ماركو، ستيلا، مايا، غريغور، كاي، إنغريد. خمسة تكفي.') },
    q_boat: { title: T('The Gull\'s Luck', 'حظ النورس'), hint: T('Maya\'s boat vanished from the harbor. The harbor master says it sank. Maya says boats don\'t sink in calm water. Look around the boathouses at night.', 'قارب مايا اختفى من الميناء. مسؤول الميناء يقول غرق. ومايا تقول القوارب ما تغرق في موية هادية. دوّر حول بيوت القوارب بالليل.') },
    q_seagull: { title: T('Operation Seagull', 'عملية النورس'), hint: T('Kai has a plan involving a gull, a fish and Victor. It is a terrible plan. You\'re in.', 'كاي عنده خطة فيها نورس، وسمكة، وفيكتور. خطة فظيعة. وأنت معه.') }
  });

  /* ---------------- places ---------------- */
  const catSpot = (loc, x, y) => ({ x, y, label: T('A ginger cat', 'قطو برتقالي'), if: s => s.quests.q_cat === 'active' && !has('admiral') && ['harbor', 'beach', 'cemetery', 'street'][s.day % 4] === loc && s.slot < NIGHT, run: s => GAME.SCRIPTS.catTry(s) });
  Object.assign(GAME.LOC, {
    beach: { name: T('Saltmere beach', 'شاطئ سولتمير'), bg: 'beach', charX: 60,
      exits: [{ to: 'harbor', x: 92, y: 66, label: T('Along to the harbor', 'على الميناء') }, { to: 'lh_ext', x: 94, y: 40, label: T('Cliff path to the lighthouse', 'طريق الجرف للمنارة'), if: s => !!s.f.leoEnded }],
      spots: [
        { x: 30, y: 78, label: T('Look for shells', 'تدور أصداف'), if: s => s.slot < NIGHT && !doneToday('shell'), run: s => { onceToday('shell'); advance(1); addMood(1); if (roll(0.55) && !has('shell')) { give('shell'); return [N_('Half buried, perfect, pink inside: a spiral shell. You hold it to your ear out of habit. It sounds like the inside of your own head, but calmer.', 'نصها مدفونة، كاملة، وردية من داخل: صدفة حلزونية. تحطها على إذنك من العادة. صوتها مثل داخل راسك، بس أهدى.')]; } return [{ n: fresh('shellNo', [T('Broken shells, a bottle cap, and a rubber duck wearing sunglasses. You leave the duck. It seems happy.', 'أصداف مكسورة، وغطا قارورة، وبطة مطاط لابسة نظارة شمسية. تخلي البطة. شكلها مبسوطة.'), T('Nothing but sea glass, green and smooth. You keep one piece anyway.', 'ولا شي غير زجاج بحر، أخضر وناعم. وتخلي قطعة على كل حال.'), T('A crab threatens you. You respect its boundaries and move along.', 'سلطعون يهددك. تحترم حدوده وتكمل طريقك.')]) }]; } },
        { x: 50, y: 60, label: T('Swim', 'تسبح'), if: s => s.slot > 0 && s.slot < NIGHT && !doneToday('swim'), run: s => { onceToday('swim'); advance(1); addMood(1); rest(-15); needs().clean = clamp(needs().clean + 25, 0, 100); return [{ n: fresh('swim', [T('The water is so cold it knocks every thought out of your head. For thirty seconds you are only a body in the sea. It\'s wonderful.', 'الموية باردة لدرجة إنها تطيّر كل فكرة من راسك. لثلاثين ثانية أنت بس جسم في البحر. شي رائع.'), T('You float on your back and look at the sky until you forget which way is down.', 'تطفو على ظهرك وتطالع السما لين تنسى وين تحت.'), T('A wave knocks you over in front of Kai, who scores it a solid seven.', 'موجة تطيحك قدام كاي، ويعطيها سبعة من عشرة.')]) }]; } },
        { x: 80, y: 74, label: T('Sit and watch the waves', 'تجلس تطالع الموج'), run: s => onceToday('waves') ? (addMood(1), [{ n: T('The waves come in and go out. Nobody asks them to do better.', 'الموج يجي ويروح. ومحد يطلب منه يسوي أحسن.') }]) : [{ n: T('Still coming in. Still going out.', 'لسا يجي. لسا يروح.') }] },
        catSpot('beach', 12, 62)
      ] },
    cemetery: { name: T('St. Brigid\'s churchyard', 'مقبرة كنيسة سانت بريجيد'), mapName: T('Cemetery', 'المقبرة'), bg: 'cemetery', charX: 70, exits: [back('street')],
      spots: [
        { x: 41, y: 70, label: T('A white stone: DANIEL', 'حجر أبيض: دانيال'), run: s => [N_('DANIEL HART. "Sang badly, loved well." Fresh flowers. Always fresh flowers.', 'دانيال هارت. «كان يغني بشكل سيء، ويحب بشكل زين.» ورد جديد. دايم ورد جديد.')] },
        { x: 80, y: 60, label: T('The old stones', 'الحجارة القديمة'), run: s => { s.f.eGrave = true; if (s.quests.q_e_1958) quest('q_e_1958', 'active'); return [N_('Lichen, salt, names worn almost flat. One small stone, newer than its neighbours, kept clean: "TOBIAS WREN, 1949–1958. Lost to the sea. Found by God."', 'أشنات، وملح، وأسماء ممسوحة تقريباً. حجر صغير، أجد من اللي حوله، ونظيف: «توبياس رن، ١٩٤٩–١٩٥٨. أخذه البحر. ولقاه الله.»')]; } },
        { x: 16, y: 56, label: T('Tidy graves (job, $5)', 'تنظف القبور (شغل، ٥$)'), if: s => s.slot < 3 && !doneToday('graves') && !!GAME.CHAR.gregor.where(s), cls: 'main', run: s => GAME.SCRIPTS.gravesJob(s) },
        catSpot('cemetery', 60, 30)
      ] },
    florist: { name: T('Stella\'s Flowers', 'ورد ستيلا'), bg: 'florist', charX: 62, exits: [back('street')],
      spots: [{ x: 22, y: 56, label: T('Buy a bouquet ($4)', 'تشتري باقة ورد (٤$)'), need: null, if: s => !has('bouquet'), run: s => s.money >= 4 ? (pay(4), give('bouquet'), [N_('Stella builds it like an engineer: "Something brave, something soft, and one weird one for personality."', 'ستيلا تبنيها مثل مهندسة: «شي شجاع، وشي ناعم، وواحد غريب عشان الشخصية.»')]) : [N_('You count your coins. Not enough. Stella pretends not to see, which is kind.', 'تعد فلوسك. ما تكفي. وستيلا تسوي نفسها ما شافت، وهذا لطف.')] },
        { x: 60, y: 30, label: T('The window', 'الشباك'), run: s => [N_('A sign: "LOST: ADMIRAL. Ginger. Large. Answers to nothing. Reward: flowers forever."', 'ورقة: «مفقود: الأدميرال. برتقالي. كبير. ما يرد على شي. المكافأة: ورد للأبد.»')] }] },
    police: { name: T('Saltmere Police', 'شرطة سولتمير'), bg: 'police', charX: 50, exits: [back('street')],
      spots: [{ x: 18, y: 30, label: T('Notice board', 'لوحة الإعلانات'), run: s => [N_('LOST: one cat (ginger). FOUND: one false tooth (enquire within). WANTED: a gull, "known as Kevin", for theft of a sandwich. There\'s a sketch. It is very good.', 'مفقود: قطو (برتقالي). موجود: سن تركيب (استفسر داخل). مطلوب: نورس، «معروف باسم كيفن»، بتهمة سرقة سندويشة. فيه رسمة. حلوة مرة.')] }] }
  });
  GAME.LOC.harbor.exits.push({ to: 'beach', x: 8, y: 62, label: T('The beach', 'الشاطئ') });
  GAME.LOC.harbor.spots.push(catSpot('harbor', 70, 30), { x: 86, y: 40, label: T('Peer through the boathouse windows', 'تطل من شبابيك بيوت القوارب'), if: s => s.slot === NIGHT && s.quests.q_boat === 'active' && !s.f.boatFound, run: s => { s.f.boatFound = true; return [N_('Through the salt-crusted glass of the end boathouse: a blue fishing boat, half-repainted white. You can still read the old name under the new paint: GULL\'S LUCK. Stencilled on the side: SALTMERE GRAND — HARBOR TOURS.', 'من ورا الزجاج المليان ملح في آخر بيت قوارب: قارب صيد أزرق، نصه مصبوغ أبيض. لسا تقدر تقرا الاسم القديم تحت الصبغ: «حظ النورس». ومكتوب على جنبه: سولتمير غراند — جولات الميناء.')]; } });
  GAME.LOC.street.spots.push(catSpot('street', 40, 28));
  GAME.MAP.push({ to: 'beach' }, { to: 'cemetery', lock: s => s.slot === NIGHT }, { to: 'florist', lock: s => s.slot === NIGHT }, { to: 'police', lock: s => s.slot === NIGHT });

  /* ---------------- scripts ---------------- */
  Object.assign(GAME.SCRIPTS, {
    catTry: s => {
      if (has('fish')) { take('fish'); give('admiral'); return [N_('You hold out a fish. The cat considers you, the fish, and the meaning of life, in that order. Then he walks into your arms like he\'s doing you a favour.', 'تمد سمكة. القطو يفكر فيك، وفي السمكة، وفي معنى الحياة، بهالترتيب. وبعدين يمشي لحضنك كأنه يسوي لك خدمة.')]; }
      return [{ n: fresh('catNo', [T('He\'s on a wall, out of reach, looking at you as if you owe him money. Cats like this don\'t come for nothing. Maybe a fish.', 'هو على جدار، بعيد عن يدك، يطالعك كأنك مديون له. القطاوة اللي مثله ما يجون ببلاش. يمكن سمكة.'), T('You get within a metre. He yawns, enormously, and leaves. You\'ve been dismissed.', 'توصل لمتر منه. يتثاوب، تثاوب ضخم، ويمشي. انطردت.'), T('He lets you look at him for exactly four seconds, then vanishes into a hedge. You hear purring. Mocking purring.', 'يخليك تطالعه أربع ثواني بالضبط، وبعدين يختفي في شجيرة. وتسمع خرخرة. خرخرة ساخرة.')]) }];
    },
    gravesJob: s => { onceToday('graves'); advance(1); rest(-10); s.money += 5; s.f.graves = (s.f.graves || 0) + 1; addTrust('gregor', s.f.graves <= 2 ? 1 : 0);
      return [{ c: 'gregor', e: 'smile', t: fresh('gravesL', [T('Weeds out, moss off, names readable. That\'s the job. The dead don\'t complain, which is more than I can say for the living.', 'الحشيش يطلع، والطحالب تنشال، والأسماء تنقرا. هذا الشغل. والميتين ما يتشكون، وهذا أكثر من اللي أقدر أقوله عن الأحياء.'), T('That one\'s Mrs Ferris. Ran the post office for forty years. Read every postcard. Never said a word. A saint, or a spy.', 'هذي مدام فيريس. كانت تدير البريد أربعين سنة. قرت كل بطاقة. وما قالت ولا كلمة. قديسة، أو جاسوسة.'), T('Careful with that row, it\'s sailors. They liked things shipshape. They\'ll know.', 'انتبه لهالصف، كلهم بحّارة. يحبون الأشياء مرتبة. بيعرفون.'), T('You work in silence. It\'s the most peaceful hour of your week. Gregor pays you in coins and a pork pie.', 'تشتغل بصمت. أهدى ساعة في أسبوعك. وغريغور يدفع لك فكة وفطيرة لحم.')]) }, N_('+ $5', '+ ٥$')]; },
    ingridSings: s => { s.f.ingridSang = true; quest('q_voice', 'done'); addMood(2);
      return [{ go: 'cafe' }, { show: [{ id: 'ingrid', e: 'neutral' }, { id: 'marco', e: 'smile' }] },
        N_('Thursday. Open mic. Marco tells four jokes and gets one laugh, from himself. Then he says, more quietly than you\'ve ever heard him: "Ladies and gentlemen. Ingrid."', 'خميس. ليلة الميكروفون. ماركو يقول أربع نكت ويضحك عليها واحد، هو نفسه. وبعدين يقول، بهدوء ما سمعته منه أبداً: «سيداتي سادتي. إنغريد.»'),
        N_('She stands by the piano for a long time. Then she sings. Her voice is cracked and thin and true, an old song about a sailor coming home, and every person in the café stops eating.', 'توقف عند البيانو وقت طويل. وبعدين تغني. صوتها مشقوق ورفيع وصادق، أغنية قديمة عن بحّار يرجع البيت، وكل شخص في المقهى يوقف أكل.'),
        { c: 'ingrid', e: 'smile', t: T('Henrik always said I sang that one too slow. Well. Henrik isn\'t here to complain.', 'هنريك دايم كان يقول إني أغنيها بطيء. طيب. هنريك مو هنا يتشكى.') },
        N_('Afterwards Marco cries into a tea towel and says it\'s onions. There are no onions.', 'بعدها ماركو يبكي في فوطة ويقول إنه بصل. ما فيه بصل.')];
    },
    seagull: s => { s.f.gullStage = (s.f.gullStage || 0) + 1; const st = s.f.gullStage; onceToday('gull');
      if (st === 1) { quest('q_seagull', 'active'); return [{ c: 'kai', e: 'smile', t: T('Phase one: recruit a gull. I\'ve chosen Kevin. Kevin has a criminal record. Kevin has range.', 'المرحلة الأولى: نجنّد نورس. اخترت كيفن. كيفن عنده سوابق. كيفن موهوب.') }, N_('You spend an hour throwing chips at a gull while Kai shouts "GOOD BOY, KEVIN". Evelyn, passing on the cliff path, shouts "HE\'S NOT A BOY, HE\'S AN ARTIST".', 'تقضي ساعة ترمي بطاطس على نورس وكاي يصارخ «شاطر يا كيفن». وإيفلين، ماشية على طريق الجرف، تصارخ «هو مو شاطر، هو فنان».')]; }
      if (st === 2) return [{ c: 'kai', e: 'smile', t: T('Phase two: Victor eats a smoked salmon bagel on the hotel terrace at noon every day. Every day. Like a man who has never met a gull.', 'المرحلة الثانية: فيكتور ياكل بيغل سلمون مدخن على تراس الفندق الساعة ١٢ كل يوم. كل يوم. مثل رجّال عمره ما قابل نورس.') }, N_('You practise by putting a bagel on a bench. Kevin takes it in 0.8 seconds. Kai weeps with pride.', 'تتدربون إنكم تحطون بيغل على كرسي. كيفن ياخذه في ٠٫٨ ثانية. وكاي يبكي من الفخر.')];
      quest('q_seagull', 'done'); addMood(2);
      return [N_('Noon. The hotel terrace. Victor lifts the bagel. Kai, behind a bin, whispers "now". You throw one chip, perfectly.', 'الظهر. تراس الفندق. فيكتور يرفع البيغل. وكاي، ورا زبالة، يهمس «الحين». ترمي حبة بطاطس وحدة، بإتقان.'),
        N_('Kevin comes out of the sun like a fighter jet. The bagel is gone. So, briefly, is Victor\'s dignity. He stands there with cream cheese on his tie while forty tourists film it.', 'كيفن يطلع من الشمس مثل طيارة حربية. البيغل راح. ومعه، لفترة، كرامة فيكتور. يوقف وعلى كرفتته جبن كريمي وأربعين سايح يصورونه.'),
        N_('That evening the video is on every phone in Saltmere. Bella sends it to you eleven times. Kai has it printed on a t-shirt by Friday.', 'المغرب الفيديو في كل جوال في سولتمير. بيلا ترسله لك إحدعش مرة. وكاي يطبعه على تيشيرت قبل الجمعة.')];
    }
  });

  /* ---------------- topics ---------------- */
  const sign = (id, line) => ({ id: 'sign', once: true, label: T('Ask them to sign Olivia\'s petition', 'تطلب منهم يوقّعون عريضة أوليفيا'), if: s => s.quests.q_petition === 'active', run: s => { s.f.sigs = (s.f.sigs || 0) + 1; if (s.f.sigs >= 5) { quest('q_petition', 'done'); s.f.oliviaAlly = true; } return [{ c: id, e: 'smile', t: line }].concat(s.f.sigs === 5 ? [N_('Five signatures. Olivia is going to be unbearable about this.', 'خمس تواقيع. أوليفيا بتصير ما تنطاق من الفرحة.')] : [N_(s.f.sigs + ' / 5', s.f.sigs + ' / ٥')]); } });

  /* ---------------- Thursday: Ingrid sings ---------------- */
  GAME.EVENTS.push({ id: 'ingridSings', once: true, when: s => s.f.micBooked && weekday(s.day) === 4 && s.slot === 3 && s.loc === 'cafe', run: s => GAME.SCRIPTS.ingridSings(s) });

  /* ---------------- random moments in public places (non-repeating) ---------------- */
  const R = (id, where, en, ar, extra) => Object.assign({ id, where, run: s => [N_(en, ar)].concat(extra ? extra(s) : []) }, {});
  GAME.RANDOM = (GAME.RANDOM || []).concat([
    R('gullChips', ['harbor', 'beach'], 'A gull lands next to you, looks you dead in the eye, and takes the chip out of your hand with the confidence of a tax inspector.', 'نورس ينزل جنبك، يطالعك في عيونك، وياخذ البطاطس من يدك بثقة مفتش ضرايب.'),
    R('wrongName', ['street', 'grocery', 'cafe'], 'A woman waves at you across the street and shouts "DAVID!" You wave back. You are not David. It\'s too late now. You are David to her forever.', 'امرأة تأشر لك من الطرف الثاني من الشارع وتصارخ «ديفيد!» تأشر لها. أنت مو ديفيد. فات الأوان. صرت ديفيد عندها للأبد.'),
    R('trip', ['street', 'harbor'], 'You trip on absolutely nothing in front of four people. You pretend to inspect the pavement, as if that was the plan.', 'تتعثر على ولا شي قدام أربع أشخاص. تسوي نفسك تفحص الرصيف، كأن هذا كان المخطط.'),
    R('busker', ['street'], 'A busker plays the same three chords for an hour. By the end you know them better than your own phone number. You give him a coin for his commitment.', 'عازف شارع يعزف نفس الثلاث نوتات ساعة. وبالآخر تعرفها أحسن من رقم جوالك. تعطيه فكة على التزامه.', s => (s.money > 0 ? (s.money -= 1, []) : [])),
    R('kidKite', ['beach'], 'Somewhere a kite has escaped. Its owner, unseen, yells "COME BACK!" at it with real betrayal in their voice. The kite does not come back.', 'في مكان طيارة ورق هربت. وصاحبها، اللي ما تشوفه، يصارخ «ارجعي!» بخيانة حقيقية في صوته. والطيارة ما ترجع.'),
    R('oldCouple', ['cafe'], 'An old couple at the next table share one slice of cake with two forks, very slowly, not speaking, holding hands under the table. You look away so you don\'t cry about it.', 'زوجين كبار على الطاولة اللي جنبك يتقاسمون قطعة كيك بشوكتين، ببطء، بدون كلام، وماسكين يدين بعض تحت الطاولة. تشيح بوجهك عشان ما تبكي.', s => (addMood(1), [])),
    R('marcoJoke', ['cafe'], 'Marco tries a new joke on you: "Why did the fish blush? Because it saw the ocean\'s bottom." He laughs for a full minute. You laugh because he\'s laughing.', 'ماركو يجرب عليك نكتة جديدة: «ليش السمكة استحت؟ لأنها شافت قاع البحر.» يضحك دقيقة كاملة. وتضحك لأنه يضحك.'),
    R('samiRadio', ['grocery'], 'Sami is arguing with the radio about football. The radio is winning.', 'سامي يتجادل مع الراديو عن الكورة. والراديو قاعد يفوز.'),
    R('dogAdopts', ['street', 'harbor', 'beach'], 'A scruffy dog follows you for three streets, then sits down and watches you go, as if to say: I\'ve seen enough, you\'ll be fine.', 'كلب منكوش يتبعك ثلاث شوارع، وبعدين يجلس ويطالعك وأنت تمشي، كأنه يقول: شفت كفاية، بتكون بخير.', s => (addMood(1), [])),
    R('fogHorn', ['harbor', 'beach', 'lh_ext'], 'Fog rolls in so thick you can\'t see your hands. The foghorn sounds. For a minute the whole town is just sound: gulls, rigging, someone laughing on a boat.', 'ضباب يدخل لدرجة ما تشوف يدينك. بوق الضباب يصوّت. ولدقيقة البلدة كلها بس أصوات: نوارس، وحبال، وأحد يضحك على قارب.'),
    R('letterWind', ['street'], 'A sheet of paper blows against your leg. A child\'s handwriting: "THINGS I AM GOOD AT: 1. hiding 2. soup 3." Number three is blank. You put it back in the wind.', 'ورقة تطير وتلزق على رجلك. بخط طفل: «أشياء أنا شاطر فيها: ١. الاستخباء ٢. الشوربة ٣.» رقم ثلاثة فاضي. ترجعها للريح.'),
    R('sockShop', ['grocery'], 'Sami has started selling socks, for reasons he refuses to explain. "Diversification," he says, darkly.', 'سامي صار يبيع شرابات، لأسباب يرفض يشرحها. «تنويع،» يقول، بنبرة غامضة.'),
    R('ghostStory', ['cafe'], 'Two fishermen at the counter argue about whether the lighthouse is haunted. "It laughs," says one. "So does my wife," says the other. "Not at 3:07." Silence.', 'صيادين عند الكاونتر يتجادلون إذا المنارة مسكونة. «تضحك،» يقول واحد. «حتى زوجتي تضحك،» يقول الثاني. «مو الساعة ٣:٠٧.» سكوت.', s => (s.f.heard307 = true, [])),
    R('hotelBrochure', ['street'], 'A man in a Grand Hotel blazer hands out leaflets: "Your house could be worth MORE to us than to you!" Someone has drawn a moustache on every one of Victor\'s smiling faces.', 'رجّال بجاكيت فندق الغراند يوزّع أوراق: «بيتك ممكن يسوى لنا أكثر منك!» وأحد راسم شنب على كل وجه مبتسم لفيكتور.'),
    R('rainDash', ['street', 'harbor'], 'Sudden rain. Everyone runs. You don\'t, for once. You just get wet. It\'s weirdly great.', 'مطر فجأة. الكل يركض. وأنت لا، لأول مرة. بس تتبلل. وغريبة، بس حلو.', s => (needs().clean = clamp(needs().clean - 5, 0, 100), addMood(1), [])),
    R('phoneDrop', ['harbor'], 'You nearly drop your phone off the pier. You catch it. A fisherman who saw says "lucky" and then, after a pause, "or not, depending what\'s on it."', 'كان بيطيح جوالك من الرصيف. تلقفه. صياد شاف يقول «محظوظ» وبعد سكوت: «أو لا، على حسب وش فيه.»'),
    R('marthaGossip', ['street', 'grocery'], 'Martha catches you by the sleeve: "Did you hear? Stella\'s cat was seen on the church roof. And the Grand\'s manager wears a hairpiece. I\'m not saying who told me. It was the cat."', 'مارثا تمسكك من كمك: «سمعت؟ قطو ستيلا انشاف على سطح الكنيسة. ومدير الغراند يلبس باروكة. ما راح أقول مين قال لي. القطو.»'),
    R('tourists', ['harbor', 'street'], 'A tourist asks you for directions. You give them, confidently, and realise as they walk away that you\'ve sent them into the sea. You run after them. Everyone survives.', 'سايح يسألك عن الطريق. تدلّه، بثقة، وتنتبه وهو يمشي إنك ودّيته للبحر. تركض وراه. والكل ينجو.'),
    R('kidsLaugh', ['beach'], 'From somewhere behind the dunes, children laughing. You can\'t see them. For a second it sounds like the lighthouse. Then a frisbee comes over the top, and it\'s just kids.', 'من مكان ورا الكثبان، أطفال يضحكون. ما تشوفهم. لثانية يصير صوته مثل المنارة. وبعدين فريزبي يطلع من فوق، ويطلعون بس أطفال.', s => (s.host === 'evelyn' ? (s.fear = clamp((s.fear || 0) + 1, 0, 10), []) : [])),
    R('graveFlowers', ['cemetery'], 'Fresh flowers on every grave in one row, all the same: yellow, cheap, from Sami\'s. Gregor says someone does it once a year and he\'s never caught them. "I don\'t try very hard," he admits.', 'ورد جديد على كل قبر في صف واحد، كله نفس النوع: أصفر، رخيص، من سامي. غريغور يقول أحد يسويها مرة بالسنة وعمره ما مسكه. «ما أحاول كثير،» يعترف.'),
    R('crowSteal', ['cemetery'], 'A crow lands on a headstone and steals a coin someone left there. Gregor shouts "THAT\'S FOR THE FERRYMAN" after it.', 'غراب ينزل على شاهد قبر ويسرق فكة أحد تاركها. وغريغور يصارخ وراه «هذي حق المعدّاوي!»'),
    R('floristSneeze', ['florist'], 'A customer comes in for lilies and sneezes nine times. Stella sells him a cactus instead. "Emotional support plant," she says. "Doesn\'t make you sneeze. Doesn\'t make you happy either. Balance."', 'زبون يدخل يبي زنابق ويعطس تسع مرات. ستيلا تبيعه صبارة بدالها. «نبتة دعم نفسي،» تقول. «ما تخليك تعطس. وما تخليك مبسوط بعد. توازن.»'),
    R('policeCall', ['police'], 'The phone rings. Rex listens, sighs, says "No, madam, the moon is not following you specifically," and hangs up. He looks at you. "Tuesday."', 'التلفون يرن. ريكس يسمع، يتنهد، يقول «لا يا مدام، القمر مو يتبعك أنتِ بالذات»، ويقفل. يطالعك. «يوم ثلاثاء.»'),
    R('mirrorShop', ['street'], 'You catch your reflection in a shop window and, for a second, don\'t recognise yourself. Then you do. You look less like a ghost than you did on the train.', 'تشوف انعكاسك في شباك محل، ولثانية ما تعرف نفسك. وبعدين تعرفها. شكلك أقل شبح من يوم القطار.', s => (s.mood >= 5 ? (addMood(1), []) : [])),
    R('momText', ['street', 'harbor', 'beach', 'cafe'], 'Your phone buzzes. Mom: "Saw a seagull today. Thought of you, for no reason. Hope you\'re eating."', 'جوالك يهتز. أمي: «شفت نورس اليوم. وتذكرتك، بدون سبب. أتمنى إنك تاكل.»', s => (s.f.calledMother ? [] : [N_('You don\'t answer. But you don\'t turn the phone face down, either.', 'ما ترد. بس ما تقلب الجوال على وجهه بعد.')])),
    R('gullWar', ['harbor'], 'Two gulls fight over a single chip with the energy of a medieval war. A third gull takes the chip while they\'re busy. Kai, somewhere, applauds.', 'نورسين يتهاوشون على حبة بطاطس وحدة بطاقة حرب من القرون الوسطى. ونورس ثالث ياخذها وهم مشغولين. وكاي، في مكان ما، يصفق.'),
    R('busStop', ['street'], 'An old man at the bus stop tells you the bus hasn\'t come since 1997. He waits anyway. "Habit," he says. "And the bench is nice."', 'شايب عند موقف الباص يقول لك إن الباص ما جا من ١٩٩٧. وينتظر على كل حال. «عادة،» يقول. «والكرسي حلو.»'),
    R('sandcastle', ['beach'], 'Someone has built an enormous sandcastle with a sign: "THE SALTMERE GRAND (DEMOLITION SCHEDULED: HIGH TIDE)". Several people are photographing it lovingly.', 'أحد بانٍ قلعة رمل ضخمة ومعها لوحة: «سولتمير غراند (الهدم مجدول: وقت المد)». وكم واحد يصورونها بحب.'),
    R('hotelPiano', ['hotel_lobby'], 'Someone plays the lobby piano badly and with great feeling. Bella mouths "every day" at you over the desk.', 'أحد يعزف على بيانو اللوبي بشكل سيء وبإحساس كبير. بيلا تحرك شفايفها لك من ورا الطاولة: «كل يوم».'),
    R('lostTooth', ['police', 'street'], 'A man asks if anyone has handed in a false tooth. You point him to Rex. He leaves smiling, with a gap where his smile should be.', 'رجّال يسأل إذا أحد سلّم سن تركيب. تدلّه على ريكس. يطلع مبتسم، وفيه فراغ مكان ابتسامته.'),
    R('starNight', ['harbor', 'beach', 'lh_ext', 'street'], 'The sky clears and there are more stars than you have ever seen. You stand with your head back until your neck hurts, which takes a while.', 'السما تصفى وفيه نجوم أكثر من أي مرة شفتها. توقف وراسك لورا لين يوجعك رقبتك، وهذا ياخذ وقت.', s => (addMood(1), []))
  ]);
  GAME.RANDOM.find(e => e.id === 'starNight').when = s => s.slot === NIGHT;
  GAME.RANDOM.find(e => e.id === 'kidKite').when = s => s.slot < NIGHT;
  GAME.RANDOM.find(e => e.id === 'busker').when = s => s.slot < NIGHT;

  /* ---------------- living houses: small moments with your host ---------------- */
  GAME.HOUSE_RANDOM = [
    { host: 'margaret', id: 'mOven', run: [N_('The smoke alarm goes off. Margaret fans it with a tea towel, furious with it: "I KNOW. I KNOW the toast is burnt. Thank you."', 'جرس الدخان يصيح. مارغريت تهوّي عليه بفوطة، معصبة منه: «أدري! أدري إن التوست انحرق. شكراً.»')] },
    { host: 'margaret', id: 'mQueue', run: [N_('You both reach the bathroom door at the same moment. A long, very British standoff. "After you." "No, after you." She wins by simply going in.', 'توصلون باب الحمام بنفس اللحظة. مواجهة طويلة ومؤدبة جداً. «تفضل.» «لا، تفضلي.» وتفوز هي إنها تدخل وبس.')] },
    { host: 'margaret', id: 'mHum', run: [N_('Margaret is humming while she dusts. She notices you noticing and stops. Then, after a moment, starts again, a little louder.', 'مارغريت تدندن وهي تنفض الغبار. تنتبه إنك انتبهت وتوقف. وبعد لحظة، ترجع تدندن، أعلى شوي.')] },
    { host: 'margaret', id: 'mSocks', run: [N_('She has matched your socks. All of them. Even the ones that didn\'t have a pair. You don\'t know how. You don\'t ask.', 'رتبت شراباتك أزواج. كلها. حتى اللي ما كان لها زوج. ما تدري كيف. وما تسأل.')] },
    { host: 'evelyn', id: 'eSing', run: [N_('Evelyn is singing in the bath to the shipping forecast. She is harmonising with the man reading it. It is genuinely beautiful and you will never tell her.', 'إيفلين تغني في الحمام مع نشرة الطقس البحري. تسوي هارموني مع المذيع. وصدق حلو، وعمرك ما بتقول لها.')] },
    { host: 'evelyn', id: 'eGullIn', run: [N_('There is a gull in the kitchen. Evelyn is sitting at the table with it, sharing toast, having a quiet conversation. "Kevin had a bad day," she explains.', 'فيه نورس في المطبخ. إيفلين جالسة على الطاولة معه، يتقاسمون توست، يسولفون بهدوء. «كيفن يومه كان سيء،» تشرح.')] },
    { host: 'evelyn', id: 'eNap', run: [N_('Evelyn has fallen asleep sitting up in the armchair, accordion still on her lap. Every time she breathes out, it wheezes one note.', 'إيفلين نامت وهي جالسة على الكرسي، والأكورديون لسا في حضنها. كل ما تزفر، يطلع نوتة وحدة.')] },
    { host: 'evelyn', id: 'eLight', run: [N_('Every ten seconds the beam passes over the house and the whole room goes bright, then dark. You stop noticing it. Then you notice that you stopped noticing it.', 'كل عشر ثواني الشعاع يمر على البيت والغرفة كلها تنوّر، وبعدين تظلم. توقف تنتبه له. وبعدين تنتبه إنك وقفت تنتبه.')] },
    { host: 'victor', id: 'vStaff', run: [N_('Two cleaners stop talking the moment you walk past. Then one of them says, quietly, in English: "Be careful in this building." Then they go back to work as if nothing happened.', 'عاملتين نظافة يسكتون أول ما تمر. وبعدين وحدة منهم تقول، بهدوء، بالإنجليزي: «انتبه في هالمبنى.» ويرجعون للشغل كأن ما صار شي.')] },
    { host: 'victor', id: 'vBill', run: [N_('A folded note slid under your door: "Complimentary stay — running value: $2,140. No obligation. — V." The word "obligation" has been underlined twice.', 'ورقة مطوية تحت بابك: «إقامة مجانية — القيمة الحالية: ٢١٤٠$. بدون أي التزام. — ف.» وكلمة «التزام» تحتها خطين.')] },
    { host: 'victor', id: 'vKell', run: [N_('Kell passes you in the corridor carrying a tray of tiny sandwiches. He offers you one without breaking stride. It\'s cucumber. It\'s the nicest thing that\'s happened in this hotel.', 'كيل يمر جنبك في الممر شايل صينية سندويشات صغيرة. يعرض عليك وحدة بدون ما يوقف. خيار. وأحلى شي صار في هالفندق.')] }
  ];
  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.push(s => {
    const L = GAME.LOC[s.loc]; if (!L || !L.house || L.house !== s.host || L.private) return null;
    const key = 'h' + (s.day * 10 + s.slot); if (s.f.hrvKey === key) return null;
    if (!roll(0.22)) return null;
    const pool = GAME.HOUSE_RANDOM.filter(e => e.host === s.host && s.f['hr_' + e.id] == null);
    if (!pool.length) return null;
    const e = pool[Math.floor(Math.random() * pool.length)];
    s.f['hr_' + e.id] = s.day; s.f.hrvKey = key;
    return e.run;
  });

  /* helpers the character files (js/chars/*.js) borrow from this chapter */
  GAME.H.town = { byDay, on, C, sign };
})();
