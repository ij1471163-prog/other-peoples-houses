/* =====================================================================
   Elias is ill, and you can see it if you look.
   His kidneys are failing (stage five; he has refused dialysis). Before
   anyone tells you, the house shows it, a little more each day:
     · days 1–2: half a plate; swollen ankles under a blanket; a small
       glass with pen marks he never drinks past;
     · days 3–4: out of breath on the stairs; cramps at night; tea that
       "tastes like coins"; his coat on by the fire;
     · day 5 on (or after his fall): asleep in the middle of a sentence;
       hands that can't hold the kettle still; calling you Thomas.
   One moment a day at most, only where he is. A hospital calendar in the
   kitchen. And when you know: why he refuses (Ada), whether he's scared,
   what Irene says will happen, what Martha has been hiding from him.
   Seeing any of it opens "Ask if he's ill" (as the pills, the chess and
   the armchair already do). Nothing here changes trust, suspicion or
   any ending or its conditions.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const E1 = (e, en, ar) => ({ c: 'elias', e, t: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !s.f.prologue;
  const here = s => GAME.CHAR.elias && GAME.CHAR.elias.where(s) === s.loc;
  const stage = s => (s.f.fallDone || s.day >= 4 ? 3 : s.day >= 2 ? 2 : 1);
  const saw = s => { s.f.elIll = true; if (!s.f.knowsIllness && s.quests.q_secret !== 'done') quest('q_secret', 'active'); return null; };

  /* id · stage · where (null = wherever he is) · needs him in the room · steps */
  const M = [
    ['plate', 1, 'kitchen', true, [N1('Elias pushes his plate away, half full. "Not hungry." He says it every meal. He hasn\'t been hungry for a while.', 'إلياس يبعّد صحنه، ونصه مليان. «مو جوعان.» يقولها كل وجبة. وصار له فترة مو جوعان.')]],
    ['ankles', 1, 'living', true, [N1('He has taken his boots off by the fire. His ankles are swollen, the skin shiny and tight. When he sees you looking, he pulls the blanket over his feet.', 'شال جزمته جنب الدفاية. كواحله منفوخة، والجلد لامع ومشدود. لما يشوفك {تطالع|تطالعين}، يسحب البطانية فوق رجوله.'),
      E1('neutral', 'Salt air. Makes everything puffy. Even my opinions.', 'هوا البحر المالح. ينفّخ كل شي. حتى آرائي.')]],
    ['glass', 1, 'kitchen', true, [N1('He drinks from a small glass with two pen marks on the side, and stops exactly at the second line. Every time. Like a rule someone gave him and he only half agreed to.', 'يشرب من كاس صغير عليه خطين بالقلم، ويوقف بالضبط عند الخط الثاني. كل مرة. كأنها قاعدة أحد عطاه إياها، ووافق عليها نص موافقة.')]],
    ['stairs', 2, null, true, [N1('Halfway across the room he stops, one hand on the back of a chair, breathing like he has run up a hill. He pretends to study a picture on the wall. He must have seen it ten thousand times.', 'بنص الغرفة يوقف، يده على ظهر كرسي، ويتنفس كأنه طالع جبل. يسوي نفسه يتأمل صورة على الجدار. أكيد شافها عشرة آلاف مرة.'),
      { menu: [
        { t: T('Offer him your arm', '{تمد|تمدين} له يدك'), then: [E1('smile', 'I\'m admiring the frame. ...Fine. Since you\'re here.', 'أتأمل البرواز. ...طيب. بما إنك هنا.'), N1('He leans on you more than he means to. You both pretend he doesn\'t.', 'يتكي عليك أكثر مما يبي. وانتوا الاثنين تسوون نفسكم ما انتبهتوا.')] },
        { t: T('Pretend you didn\'t notice', '{تسوي|تسوين} نفسك ما {انتبهت|انتبهتي}'), then: [N1('After a while he straightens up. "Lovely picture," he says, to nobody, and walks on.', 'بعد شوي يعتدل. «صورة حلوة،» يقول لولا أحد، ويكمل مشيه.')] }] }]],
    ['coins', 2, 'kitchen', true, [E1('neutral', 'Tea tastes like coins lately. Pennies. Ada would say I\'d been at the change jar again.', 'الشاي صار طعمه فلوس هالأيام. فكة. آدا كانت بتقول إني رجعت لمرطبان الفكة.')]],
    ['coat', 2, 'living', true, [N1('Elias sits by the fire in his coat. The fire is high. He is still cold.', 'إلياس جالس جنب الدفاية لابس كوته. النار عالية. وهو لسا بردان.'), E1('sad', 'Can\'t get warm. Spring, my foot.', 'ما أقدر أدفى. ربيع قال.')]],
    ['cramps', 2, 'morning', false, [N1('Last night, around three, you heard him in the hall: slow steps, up and down, stopping to rub his legs and swear very quietly at them.', 'البارحة، تقريباً الساعة ثلاث، {سمعته|سمعتيه} في الممر: خطوات بطيئة، رايح جاي، يوقف يفرك رجوله ويسبها بصوت واطي مرة.')]],
    ['asleep', 3, 'living', true, [E1('rest', '...and the gull, the gull takes the whole sandwich, out of her hand, and Ada says...', '...والنورس، النورس ياخذ السندويشة كلها من يدها، وآدا تقول...'),
      N1('He\'s asleep. Just like that, between one word and the next. You wait. He doesn\'t finish the story.', 'نام. كذا، بين كلمة والثانية. {تنتظر|تنتظرين}. وما يكمّل القصة.')]],
    ['kettle', 3, 'kitchen', true, [N1('He\'s pouring tea and the spout won\'t hold still. Tea on the saucer, on the table, on his hand. He doesn\'t seem to feel it.', 'يصب شاي والإبريق ما يثبت. شاي على الصحن، وعلى الطاولة، وعلى يده. وكأنه ما يحس.'),
      { menu: [
        { t: T('Take the kettle from him, gently', '{تاخذ|تاخذين} الإبريق منه، بهدوء'), then: [E1('sad', 'Thank you, {lad|lass}.', 'مشكور يا {ولدي|بنتي}.'), N1('He says it so quietly you almost miss it. He watches you pour. He doesn\'t correct how you do it, and that is the worst part.', 'يقولها بهدوء لدرجة كان بيفوتك. يطالعك {وأنت تصب|وأنتِ تصبين}. وما يصحح طريقتك، وهذا أسوأ شي.')] },
        { t: T('Pretend not to see, and wipe the table after', '{تسوي|تسوين} نفسك ما {شفت|شفتي}، {وتمسح|وتمسحين} الطاولة بعدين'), then: [N1('He drinks half a cup of tea and half a cup of saucer. You wipe the table when he goes. Neither of you mentions it.', 'يشرب نص كوب شاي ونص كوب من الصحن. {تمسح|تمسحين} الطاولة لما يطلع. ولا واحد فيكم يجيب طاريها.')] }] }]],
    ['thomas', 3, null, true, [E1('smile', 'Thomas, pass the—', 'توماس، عطني—'), E1('sad', '...You. Pass the salt. You know who I meant.', '...أنت. عطني الملح. {تدري|تدرين} مين قصدت.')]]
  ];

  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.push(s => {
    if (!ch1(s) || RUN || s.once['hintIll@' + s.day]) return null;
    const seen = s.f.elIllSeen = s.f.elIllSeen || [];
    const st = stage(s);
    const m = M.find(([id, stg, where, him]) => !seen.includes(id) && stg <= st &&
      (where === 'morning' ? s.slot === 0 && ['your_room', 'hall', 'kitchen'].includes(s.loc) : (him ? here(s) : true) && (!where || where === s.loc)));
    if (!m || Math.random() < 0.35) return null;
    s.once['hintIll@' + s.day] = 1; seen.push(m[0]);
    const show = m[3] ? [{ show: [{ id: 'elias', e: m[0] === 'asleep' ? 'rest' : 'neutral' }] }] : [];
    return show.concat(m[4], [saw, { show: null }]);
  });

  /* the hospital calendar in the kitchen */
  if (GAME.LOC.kitchen) GAME.LOC.kitchen.spots.push({ x: 30, y: 32, label: T('A calendar by the door', 'تقويم جنب الباب'), if: s => ch1(s),
    run: s => [N1('A calendar from the city hospital, the free kind they give out. Every Monday, Wednesday and Friday has a time written in: 09:00. Every one is crossed out.', 'تقويم من مستشفى المدينة، من النوع اللي يوزعونه ببلاش. كل اثنين وأربعاء وجمعة مكتوب فيها وقت: ٠٩:٠٠. وكلها مشطوبة.'),
      N1('In the margin of March, in his square capitals: NO.', 'وعلى طرف شهر مارس، بحروفه الكبيرة المربعة: لا.'), saw] });

  /* "Ask if he's ill" also opens once you've seen it for yourself */
  const sick = (GAME.TOPICS.elias || []).find(t => t.id === 'sick');
  if (sick && sick.if) { const i0 = sick.if; sick.if = s => i0(s) || (!!s.f.elIll && !s.f.knowsIllnessTalk); }

  /* when you know: why he refuses, and whether he's scared */
  GAME.TOPICS.elias.push(
    { id: 'whyNo', once: true, label: T('"Why won\'t you do the dialysis?"', '«ليش ما تبي تسوي الغسيل؟»'), if: s => ch1(s) && !!s.f.knowsIllness, run: [
      E1('neutral', 'Four hours, three times a week, in a chair in the city, watching your own blood go round a machine. That\'s not living, {lad|lass}. That\'s waiting, with extra steps.', 'أربع ساعات، ثلاث مرات بالأسبوع، على كرسي في المدينة، {تطالع|تطالعين} دمك يلف في مكينة. هذا مو عيش يا {ولدي|بنتي}. هذا انتظار، بخطوات زيادة.'),
      E1('sad', 'Ada spent her last four months in that hospital. Plugged into things. She stopped being Ada in the second month. I sat in the chair next to her bed every day.', 'آدا قضت آخر أربع شهور في ذاك المستشفى. موصّلة بأشياء. بطّلت تكون آدا بالشهر الثاني. وأنا جلست على الكرسي اللي جنب سريرها كل يوم.'),
      E1('sad', 'I know that chair. I\'m not going to be the one in the bed.', 'أعرف ذاك الكرسي. وما راح أكون أنا اللي على السرير.'),
      N1('He says it like it\'s decided. His hand, on the table, says something else.', 'يقولها كأنها شي انتهى. بس يده، على الطاولة، تقول شي ثاني.')] },
    { id: 'scared', once: true, label: T('"Are you scared?"', '«خايف؟»'), if: s => ch1(s) && !!s.f['tp_elias_whyNo'], run: [
      E1('neutral', 'Of dying? No. I\'ve been on the sea fifty years, I know what it does.', 'من الموت؟ لا. صار لي خمسين سنة على البحر، وأعرف وش يسوي.'),
      E1('sad', 'Of the bit before. Being a nuisance. Forgetting Ada\'s face before I get to see it again.', 'من اللي قبله. إني أصير عبء. إني أنسى وجه آدا قبل لا أشوفه مرة ثانية.'),
      E1('smile', 'And of you burning the toast after I\'m gone, with nobody to tell you. That one keeps me up at night.', 'ومنك {وأنت تحرق|وأنتِ تحرقين} التوست بعد ما أروح، وما أحد يقولك. هذي اللي ما تخليني أنام.')] });

  /* Irene: what will happen, and what you can do */
  GAME.TOPICS.irene = GAME.TOPICS.irene || [];
  GAME.TOPICS.irene.push({ id: 'elWhat', once: true, label: T('"What\'s going to happen to Elias?"', '«وش بيصير لإلياس؟»'), if: s => ch1(s) && !!s.f.knowsIllness, run: [
    { c: 'irene', e: 'sad', t: T('Without dialysis? Tired, then more tired. Confused some days. Cold, itchy, out of breath. Then one day he goes to sleep and doesn\'t wake up. If he\'s lucky, that\'s how.', 'بدون غسيل؟ تعب، وبعدين تعب أكثر. يتلخبط بعض الأيام. برد، وحكة، وضيق نفس. وبعدين يوم من الأيام ينام وما يقوم. إذا كان محظوظ، هذا اللي بيصير.') },
    { c: 'irene', e: 'neutral', t: T('Weeks. Maybe a couple of months. I\'ve stopped guessing with him; he does what he likes.', 'أسابيع. يمكن كم شهر. بطّلت أتوقع معه؛ يسوي اللي يبيه.') },
    { menu: [{ t: T('"What can I do?"', '«وش أقدر أسوي؟»'), then: [
      { c: 'irene', e: 'smile', t: T('Make sure he eats something. Keep him warm. Don\'t let him be alone at night. And if you can, get him to pick up when his son calls.', '{خله|خليه} ياكل شي. {دفّه|دفّيه}. لا {تخليه|تخلينه} لحاله بالليل. وإذا تقدر{|ين}، {خله|خليه} يرد لما يتصل ولده.') },
      { c: 'irene', e: 'sad', t: T('That\'s the whole prescription. It\'s more than most people get.', 'هذي الوصفة كلها. وهي أكثر من اللي يحصّله أغلب الناس.') }] }] }] });

  /* Martha has been fighting it her own way */
  GAME.TOPICS.martha = GAME.TOPICS.martha || [];
  GAME.TOPICS.martha.push({ id: 'elIll', once: true, label: T('"Has Elias been ill for long?"', '«إلياس صار له زمان مريض؟»'), if: s => ch1(s) && !!(s.f.elIll || s.f.noticed || s.f.knowsIllness), run: [
    { c: 'martha', e: 'sad', t: T('Since the winter. Grey in the face, and pretending he isn\'t.', 'من الشتا. وجهه رمادي، ويسوي نفسه مو كذا.') },
    { c: 'martha', e: 'angry', t: T('I take the salt off the table, he puts it back. I hide the crisps, he finds them. I water down the soup, he adds a stock cube. Stubborn old goat.', 'أشيل الملح من الطاولة، يرجعه. أخبي الشيبس، يلقاه. أخفف الشوربة بالماي، يحط مكعب مرق. تيس عنيد.') },
    { c: 'martha', e: 'sad', t: T('Ten years I\'ve cleaned this house. I\'d like to clean it for a few more. Tell him that. He won\'t listen to me.', 'عشر سنين وأنا أنظف هالبيت. ودي أنظفه كم سنة زيادة. {قله|قوليله} هالشي. ما يسمع مني.') }] });
})();

/* Irene at his bedside (img/fx/elias_irene.jpg): the night after the ambulance, and in his last week */
(function () {
  const SRC = 'img/fx/elias_irene.jpg';
  const cg = cap => ({ mini: 'cg', src: SRC, full: true, cap });
  const afterLine = (steps, re, add) => {
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      if (st && st.n && re.test(st.n.en)) { steps.splice(i + 1, 0, add); return true; }
      if (st && st.menu) for (const o of st.menu) if (o.then && afterLine(o.then, re, add)) return true;
    }
    return false;
  };
  const fall0 = GAME.SCRIPTS.fall;
  if (typeof fall0 === 'function') GAME.SCRIPTS.fall = where => {
    const steps = fall0(where);
    try { afterLine(steps, /doesn't speak to you on the way home/, cg(T('Late that night, Irene comes to the house herself. She doesn\'t argue with him. She sits by his bed until he falls asleep, and then a while longer.', 'آخر الليل، آيرين تجي البيت بنفسها. ما تتجادل معه. تجلس جنب سريره لين ينام، وشوي بعد.'))); } catch (e) { console.error(e); }
    return steps;
  };
  const peace = GAME.SCRIPTS.endPeace;
  if (Array.isArray(peace)) afterLine(peace, /songs older than you/, cg(T('Irene starts coming by in the evenings. She doesn\'t bring the machine. She sits with him until he falls asleep, and on the way out she squeezes your shoulder.', 'آيرين صارت تمر بالمسا. ما تجيب المكينة. تجلس معه لين ينام، وهي طالعة تشد على كتفك.')));
})();
