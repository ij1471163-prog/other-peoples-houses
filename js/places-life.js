/* =====================================================================
   The new pictures get something to do in them:
     · the hallway: Thomas's heights on the door frame, and at night,
       Elias standing outside your door
     · the back yard at night: Elias talking to Ada through the window
     · the shed, while Elias mends: sit and watch him work
     · Irene on the pier on her Sunday afternoon: sit with her
   Only their own flags. No trust, suspicion or ending changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);
  const push = (loc, spot) => { if (GAME.LOC[loc]) GAME.LOC[loc].spots.push(spot); };

  /* ---------- the hallway ---------- */
  push('hall', { x: 56, y: 62, label: T('Pencil marks on the door frame', 'خطوط رصاص على إطار الباب'), run: s => [
    N1('On the frame of the far door, little pencil lines climb the wood, each with a name and a date. THOMAS, 3. THOMAS, 5 (on tiptoe — doesn\'t count). THOMAS, 9. THOMAS, 12, in a boy\'s own hand.', 'على إطار الباب اللي في الآخر، خطوط رصاص صغيرة تطلع على الخشب، كل واحد عليه اسم وتاريخ. توماس، ٣. توماس، ٥ (على أطراف أصابعه، ما تنحسب). توماس، ٩. توماس، ١٢، بخطه هو.'),
    N1('The last line says THOMAS, 18. Above it, much higher, someone has drawn a line and not written anything next to it.', 'آخر خط مكتوب عليه توماس، ١٨. وفوقه، أعلى بكثير، أحد رسم خط وما كتب جنبه شي.'),
    st => (st.f.thGiven ? [N1('Next to the empty line, in new pencil, in Elias\'s shaky capitals: "SOON?"', 'جنب الخط الفاضي، برصاص جديد، بحروف إلياس المرتجفة: «قريب؟»')] : null)
  ] });
  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.push(s => {
    if (!s || RUN || s.loc !== 'hall' || !ch1(s) || s.slot !== NIGHT || s.f.plHall || s.day < 2 || s.f.fallDone) return null;
    s.f.plHall = true;
    return [{ show: [{ id: 'elias', e: 'sad' }] },
      N1('Elias is standing in the dark hallway, outside the door of your room. Thomas\'s room. One hand flat on the wood, the way you\'d feel a wall for warmth.', 'إلياس واقف في الممر المظلم، قدام باب غرفتك. غرفة توماس. يده مفرودة على الخشب، مثل ما تحس جدار تدور فيه دفا.'),
      { menu: [
        { t: T('Say his name, softly', '{قل|قولي} اسمه، بهدوء'), then: [{ c: 'elias', e: 'shock', t: T('Hm? Oh. You. I thought... the floor creaks the same way his did. Go to bed.', 'هاه؟ آه. {أنت|أنتِ}. حسبت... الأرض تطقطق بنفس طريقة طقطقته. {روح|روحي} {نام|نامي}.') }] },
        { t: T('Step back and let him be', '{ارجع|ارجعي} {وخله|وخليه}'), then: [N1('You wait in the kitchen doorway until you hear his own door close. It takes a long time.', '{تنتظر|تنتظرين} عند باب المطبخ لين {تسمع|تسمعين} بابه يتسكر. ياخذ وقت طويل.')] }
      ] },
      { show: null }];
  });

  /* ---------- the back yard at night ---------- */
  push('yard', { x: 30, y: 40, label: T('Voices through the kitchen window', 'صوت من شباك المطبخ'), if: s => ch1(s) && s.slot === NIGHT && !s.f.plYard, run: s => { s.f.plYard = true; return [
    N1('The kitchen window is open a crack. Elias is at the table, alone, talking in the low voice people use on the telephone. There is no telephone.', 'شباك المطبخ مفتوح شوي. إلياس على الطاولة، لحاله، يتكلم بالصوت الواطي اللي الناس يتكلمون فيه بالتلفون. وما فيه تلفون.'),
    { c: 'elias', e: 'sad', t: T('...the boy upstairs, Ada. Not the boy. The other one. The lodger. They fold the towels wrong. You\'d like them.', '...الولد اللي فوق يا آدا. مو الولد. الثاني. الساكن. يطوي الفوط غلط. كان بيعجبك.') },
    { c: 'elias', e: 'sad', t: T('I haven\'t told him. Either of them. I know. I know what you\'d say.', 'ما قلت له. ولا لواحد منهم. أدري. أدري وش بتقولين.') },
    N1('A chair scrapes. You step back into the dark before the light can find you.', 'كرسي يتسحب. {ترجع|ترجعين} ورا في الظلام قبل لا يوصلك الضو.'),
    st => { st.f.noticed = true; return null; }
  ]; } });

  /* ---------- the shed, while he mends ---------- */
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];
  const SHED = [
    [N1('You sit on an upturned bucket and watch his hands. Over, under, through, pull. He doesn\'t look up, but he starts explaining, as if to the net.', '{تجلس|تجلسين} على سطل مقلوب {وتطالع|وتطالعين} يدينه. فوق، تحت، من خلال، اسحب. ما يرفع راسه، بس يبدأ يشرح، كأنه يكلم الشبكة.'),
      { c: 'elias', e: 'neutral', t: T('My father did it faster. His father faster still. By Thomas, it would have been a machine.', 'أبوي كان يسويها أسرع. وأبوه أسرع منه. ولو وصلت لتوماس، كانت بتصير مكينة.') }],
    [N1('He works for a long time without speaking. The only sounds are the twine and the gulls. It is the most restful twenty minutes you have had in a year.', 'يشتغل وقت طويل بدون ما يتكلم. الصوت الوحيد هو الخيط والنوارس. وهذي أريح عشرين دقيقة مرت عليك من سنة.')],
    [{ c: 'elias', e: 'smile', t: T('Ada mended better than me. Don\'t tell anybody. They think it was the other way round.', 'آدا كانت تصلح أحسن مني. لا {تقول|تقولين} لأحد. يحسبونها بالعكس.') },
      N1('He holds up a knot that is noticeably neater than the others. "Hers," he says. "Thirty years and it\'s still holding."', 'يرفع عقدة واضح إنها أرتب من الباقي. «حقتها،» يقول. «ثلاثين سنة ولسا ماسكة.»')]
  ];
  GAME.TOPICS.elias.push({ id: 'plWatch', label: T('Sit and watch him work', '{اجلس|اجلسي} {وطالع|وطالعي} شغله'), if: s => s.loc === 'shed' && !doneToday('plWatch'), run: s => {
    onceToday('plWatch'); const i = (s.f.plWatch || 0) % SHED.length; s.f.plWatch = (s.f.plWatch || 0) + 1; addMood(1);
    return SHED[i].slice();
  } });

  /* ---------- Irene on the pier ---------- */
  GAME.TOPICS.irene = GAME.TOPICS.irene || [];
  GAME.TOPICS.irene.push({ id: 'plPier', once: true, label: T('Sit with her on the pier', '{اجلس|اجلسي} معها على الرصيف'), if: s => s.loc === 'harbor', run: s => [
    N1('You sit down next to her. Your feet hang over the water. Hers don\'t reach; she pretends that\'s on purpose.', '{تجلس|تجلسين} جنبها. رجولك معلقة فوق الموية. رجولها ما توصل، وتسوي نفسها إنها بقصد.'),
    { c: 'irene', e: 'smile', t: T('You know what I miss? Nothing being my problem. For one hour a week, nothing on this harbour is my problem.', '{تدري|تدرين} وش أشتاق له؟ إن ولا شي يكون مشكلتي. ساعة وحدة بالأسبوع، ولا شي في هالميناء مشكلتي.') },
    N1('A man on the far pier slips on the wet planks, windmills, and saves himself. Irene\'s whole body goes tense. Then, very deliberately, she takes another bite of her sandwich.', 'رجال على الرصيف الثاني يزلق على الخشب المبلول، يلوّح بيدينه، ويلحق نفسه. جسم إيرين كله يشتد. وبعدين، بقصد مرة، تاخذ قضمة ثانية من سندويشتها.'),
    { c: 'irene', e: 'neutral', t: T('He\'s fine. He\'s fine. It\'s not my problem. ...Is he fine?', 'هو بخير. بخير. مو مشكلتي. ...هو بخير؟') },
    { menu: [
      { t: T('"He\'s fine. Eat your sandwich."', '«بخير. كلي سندويشتك.»'), then: [{ c: 'irene', e: 'smile', t: T('Doctor\'s orders. From the doctor\'s patient. This town is upside down.', 'أوامر الطبيبة. من مريض الطبيبة. هالبلد مقلوب.') }, st => { addMood(1); return null; }] },
      { t: T('"I\'ll go and check. You stay."', '«أنا بروح أشوفه. أنتِ اقعدي.»'), then: [N1('He is fine. He is also, it turns out, Gregor, who tells you he was "testing the planks, professionally". When you get back, Irene has saved you the crust.', 'هو بخير. وطلع، بعد، غريغور، ويقول لك إنه كان «يختبر الخشب، بشكل مهني». ولما {ترجع|ترجعين}، إيرين مخلية لك طرف الخبزة.'), st => { addMood(1); return null; }] }
    ] }
  ] });
})();
