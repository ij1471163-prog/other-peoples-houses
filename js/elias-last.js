/* =====================================================================
   The last of Elias's chapter (chapter 1). Three things, each once:
     1. The last morning. The day after he falls, before the last night:
        he asks you to take the Ada out on your own, and watches from
        the bench on the pier.
     2. Ada's stone. On Tuesday mornings (Martha cleans) he puts on his
        good jacket and goes to see her. You can go with him.
     3. "THE TREASURE (DO NOT LOOK)". The little key in the bowl in the
        hall opens Thomas's tin box on the wardrobe shelf.
   Its own flags (s.f.eLastSea, eAdaGrave, eTreasure); mood, and a little
   trust where you are kind (as his other scenes do). No quest, ending or
   ending-condition changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const E1 = (e, en, ar) => ({ c: 'elias', e, t: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);
  const home = s => houseOf(s.loc) === 'elias' || s.loc === 'elias_ext';

  /* ---------- 1. the last morning ---------- */
  GAME.EVENTS.push({ id: 'eLastSea', once: true,
    when: s => ch1(s) && !RUN && !!s.f.fallDone && !s.f.finaleDone && s.day === s.f.fallDay + 1 && s.slot === 0 && home(s),
    run: s => [{ show: [{ id: 'elias', e: 'neutral' }] },
      N1('Elias is up before you, in his coat, sitting very straight in the armchair as if that took some doing.', 'إلياس صاحي قبلك، لابس كوته، وجالس مستقيم مرة على كرسيه، كأن هالشي أخذ منه جهد.'),
      E1('neutral', 'Take her out. The Ada. On your own, this time.', '{طلّعها|طلّعيها}. «آدا». لحالك هالمرة.'),
      E1('smile', 'I\'ll watch from the bench. Somebody has to tell you what you did wrong.', 'وأنا بطالع من الكرسي اللي على الرصيف. لازم أحد يقول لك وش {غلطت|غلطتي} فيه.'),
      { go: 'harbor' }, { show: [] },
      N1('You walk him down slowly. He sits on the bench at the end of the pier with half a loaf in a paper bag, and waves you off with the other half.', '{تنزل|تنزلين} معه بشويش. يجلس على الكرسي اللي في آخر الرصيف ومعه نص خبزة في كيس ورق، ويأشر لك تطلع بالنص الثاني.'),
      st => st.f.adaPaint ? [N1('The engine catches on the second pull. The name on the bow is bright in the low sun. Your D is a little thicker than the A\'s.', 'المكينة تشتغل من ثاني سحبة. والاسم على المقدمة يلمع في شمس الصبح. والدال حقتك أعرض شوي من الألفين.')] : [N1('The engine catches on the second pull. The water is flat and grey and very quiet.', 'المكينة تشتغل من ثاني سحبة. الموية هادية ورمادية وساكتة مرة.')],
      N1('Past the harbour wall the town gets small behind you. You turn round. He is still there: a dark shape on the bench, one hand up.', 'ورا سور الميناء البلد تصغر وراك. {تلتفت|تلتفتين}. هو لسا هناك: شكل غامق على الكرسي، ويده مرفوعة.'),
      { menu: [
        { t: T('Wave back', '{لوّح|لوّحي} له'), then: [N1('You wave until your arm aches. He doesn\'t put his hand down first. You realise he isn\'t going to.', '{تلوّح|تلوّحين} لين تتعب يدك. وهو ما ينزّل يده أول. {وتنتبه|وتنتبهين} إنه ما راح ينزلها.')] },
        { t: T('Cut the engine and just float', '{طفّ|طفّي} المكينة {وخلّ|وخلّي} القارب يطفو'), then: [N1('You cut the engine. The Ada turns slowly on the swell, the way she must have turned for him ten thousand mornings. Gulls. Water. Nothing to do.', '{تطفي|تطفين} المكينة. «آدا» تلف بشويش مع الموج، مثل ما لفّت له عشرة آلاف صبح. نوارس. وموية. وما فيه شي تسويه.')] }
      ] },
      st => st.f.knowJonah ? [E1('smile', 'Your father went past that wall the first time at twelve. Came back soaked to the neck, pretending he hadn\'t been scared.', 'أبوك طلع ورا ذاك السور أول مرة وعمره اثنعش. ورجع مبلول لرقبته، ويسوي نفسه ما خاف.')] : null,
      { show: [{ id: 'elias', e: 'smile' }] },
      N1('When you tie up again he is half asleep in the sun. The bag is empty. The gulls look pleased with themselves.', 'لما {تربط|تربطين} القارب مرة ثانية هو نص نايم في الشمس. والكيس فاضي. والنوارس شكلها مبسوطة على نفسها.'),
      E1('smile', 'Not bad. You came back. That\'s most of it.', 'مو سيء. {رجعت|رجعتي}. وهذا أغلب السالفة.'),
      st => { st.f.eLastSea = true; addMood(2); advance(1); return null; }]
  });

  /* ---------- 2. Ada's stone ---------- */
  GAME.EVENTS.push({ id: 'eAdaGrave', once: true,
    when: s => ch1(s) && !RUN && weekday(s.day) === 2 && s.day >= 2 && s.slot === 0 && !s.f.fallDone && home(s) && s.loc !== 'elias_ext',
    run: s => [{ show: [{ id: 'elias', e: 'neutral' }] },
      N1('Tuesday. Elias is in a jacket you have never seen, brushing it down with his hand. It doesn\'t need brushing.', 'الثلاثاء. إلياس لابس جاكيت عمرك ما {شفتها|شفتيها}، ويمسحها بيده. وهي ما تحتاج مسح.'),
      E1('neutral', 'Tuesdays Martha cleans, so I get out of her way and see Ada. You can come. Or not. She won\'t mind either way. She never minded anything except the toast.', 'الثلاثاء مارثا تنظف، فأطلع من دربها وأزور آدا. {تقدر تجي|تقدرين تجين}. أو لا. ما بتفرق معها. عمرها ما فرق معها شي غير التوست.'),
      { menu: [
        { t: T('Go with him', '{تروح|تروحين} معه'), cls: 'main', then: [
          { go: 'cemetery' }, { show: [{ id: 'elias', e: 'sad' }] },
          N1('Her stone is near the wall, where the grass is kept short by someone who comes often. ADA. 1955–2014. Under it, smaller: "She laughed at the sea and the sea laughed back."', 'حجرها جنب السور، والعشب حوله قصير، كأن أحد يجي كثير. آدا. ١٩٥٥–٢٠١٤. وتحتها بخط أصغر: «ضحكت على البحر، والبحر ضحك لها.»'),
          N1('He takes a cloth out of his pocket and cleans the letters one by one, the way he mends a net: slowly, getting it right, as if it might be tested.', 'يطلّع خرقة من جيبه وينظف الحروف وحدة وحدة، مثل ما يصلّح الشبكة: بشويش، وبالضبط، كأن أحد بيختبرها.'),
          E1('sad', 'I tell her the weather. What I caught. That the boy hasn\'t called. Ten years, and I\'ve run out of weather.', 'أقول لها الجو. ووش صدت. وإن الولد ما اتصل. عشر سنين، وخلص عندي الجو.'),
          E1('neutral', 'Today I told her there\'s somebody in Thomas\'s room. She\'ll want to know if you fold the towels.', 'واليوم قلت لها إن فيه أحد في غرفة توماس. بتبي تعرف إذا {تطوي|تطوين} الفوط.'),
          { menu: [
            { t: T('"Tell her I fold them wrong."', '«{قل|قولي} لها إني أطويها غلط.»'), then: [E1('smile', '...She knows. She\'s laughing.', '...تدري. وقاعدة تضحك.')] },
            { t: T('Help him pull the weeds at the edge', '{تساعده|تساعدينه} يشيل الحشيش اللي على الطرف'), then: [N1('You kneel and pull the small weeds at the edge of the stone. He watches you do it and doesn\'t say anything, and then he gets down too, slowly, one knee and then the other.', '{تنزل|تنزلين} على ركبك {وتشيل|وتشيلين} الحشيش الصغير على طرف الحجر. يطالعك وما يقول شي، وبعدين ينزل هو بعد، بشويش، ركبة وبعدها الثانية.')] }
          ] },
          st => st.f.planted != null ? [N1('On the way out he says, to nobody: "Tulips by the side door this year. Somebody found her bulbs."', 'وهو طالع يقول، لولا أحد: «فيه توليب جنب الباب الجانبي هالسنة. أحد لقى بصيلاتها.»')] : null,
          { go: 'living' }, { show: [] },
          st => { st.f.eAdaGrave = 'went'; addTrust('elias', 1); addMood(1); advance(1); return null; }] },
        { t: T('"Tell her hello from me."', '«{سلّم|سلّمي} لي عليها.»'), then: [
          E1('smile', 'I\'ll tell her. She\'ll say you\'re too thin.', 'بقول لها. وبتقول إنك {ضعيف|ضعيفة} مرة.'),
          N1('He goes out. The door closes softly, the way you close a door on someone sleeping.', 'يطلع. والباب يتسكّر بشويش، مثل ما تسكّر باب على أحد نايم.'),
          st => { st.f.eAdaGrave = 'stayed'; return null; }] }
      ] }]
  });
  /* her stone stays in the churchyard, whatever happens */
  if (GAME.LOC.cemetery) GAME.LOC.cemetery.spots.push({ x: 30, y: 66, label: T('A stone by the wall: ADA', 'حجر جنب السور: آدا'),
    if: s => !!s.f.eAdaGrave || !!(s.done || {}).elias,
    run: s => [N1(...((s.done || {}).elias && ['ELIAS_LETTER', 'ELIAS_PEACE'].includes(s.f.eliasEnd)
      ? ['ADA. 1955–2014. And beside it now, new and still sharp at the edges: ELIAS. 1952–2024. The grass between them has been cut by somebody who comes often.', 'آدا. ١٩٥٥–٢٠١٤. وجنبها الحين، جديد وحوافه لسا حادة: إلياس. ١٩٥٢–٢٠٢٤. والعشب اللي بينهم مقصوص، كأن أحد يجي كثير.']
      : ['ADA. 1955–2014. "She laughed at the sea and the sea laughed back." The letters are clean. Someone polishes them on Tuesdays.', 'آدا. ١٩٥٥–٢٠١٤. «ضحكت على البحر، والبحر ضحك لها.» الحروف نظيفة. أحد يلمّعها كل ثلاثاء.']))] });

  /* ---------- 3. THE TREASURE (DO NOT LOOK) ---------- */
  GAME.ITEMS.trkey = { name: T('A small key: "THE TREASURE (DO NOT LOOK)"', 'مفتاح صغير: «الكنز (لا تطالع)»'), desc: T('The label is in a child\'s capitals, gone brown with age.', 'الورقة بحروف طفل كبيرة، صارت بنية من القدم.') };
  const hall = GAME.LOC.hall;
  if (hall) hall.spots.push({ x: 38, y: 62, label: T('Take the little key from the bowl', '{خذ|خذي} المفتاح الصغير من الصحن'),
    if: s => ch1(s) && !s.f.eTreasure && !has('trkey') && s.day >= 2,
    run: s => { give('trkey'); return [N1('You take it. DO NOT LOOK, it says. You will probably look.', '{تاخذه|تاخذينه}. «لا تطالع»، مكتوب. وأغلب الظن إنك {بتطالع|بتطالعين}.')]; } });
  const room = GAME.LOC.your_room;
  if (room) room.spots.push({ x: 56, y: 26, label: T('A tin box on top of the wardrobe', 'علبة صفيح فوق الدولاب'),
    if: s => ch1(s) && has('trkey') && !s.f.eTreasure,
    run: s => { take('trkey'); s.f.eTreasure = 'found'; addMood(1); return [
      N1('On top of the wardrobe, under a blanket of dust: a small tin box with a padlock no bigger than your thumbnail. The key turns as if it has been waiting.', 'فوق الدولاب، تحت طبقة غبار: علبة صفيح صغيرة عليها قفل ما يجي قد ظفرك. والمفتاح يلف كأنه كان ينتظر.'),
      N1('Inside: a shell. A baby tooth in a matchbox. A photo of a woman laughing on a boat, green in the face. And a page torn from a school exercise book.', 'داخلها: صدفة. وسن طفل في علبة كبريت. وصورة امرأة تضحك على قارب، ووجهها أخضر. وصفحة مقطوعة من دفتر مدرسة.'),
      { mini: 'paper', kind: 'letter', body: T('THINGS MY DAD IS GOOD AT\n1. fish\n2. knots\n3. not saying\n\nTHINGS HE IS BAD AT\n1. toast', 'أشياء أبوي شاطر فيها\n١. السمك\n٢. العُقد\n٣. إنه ما يقول\n\nأشياء هو مو شاطر فيها\n١. التوست') },
      N1('Thomas, about eight, in pencil. He pressed so hard on "not saying" that it came through to the other side.', 'توماس، تقريباً ثمان سنين، بالرصاص. ضغط على «إنه ما يقول» لدرجة إنها طلعت من الجهة الثانية.')
    ]; } });
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];
  GAME.TOPICS.elias.push({ id: 'eTreasure', once: true, label: T('Show him what was in the tin on the wardrobe', '{ورّه|ورّيه} وش كان في العلبة اللي فوق الدولاب'),
    if: s => ch1(s) && s.f.eTreasure === 'found' && GAME.CHAR.elias.where(s) === s.loc,
    run: s => [{ show: [{ id: 'elias', e: 'sad' }] },
      N1('He reads the list twice. At "not saying" his mouth does something that isn\'t quite a smile.', 'يقرا القايمة مرتين. وعند «إنه ما يقول» فمه يسوي شي مو بالضبط ابتسامة.'),
      E1('sad', 'He was eight. He had me in three words.', 'كان عمره ثمان. وعرفني بثلاث كلمات.'),
      N1('He takes the pencil from behind his ear and, under "THINGS HE IS BAD AT", very carefully, adds a line: "2. being wrong." Then he folds the page and gives it back to you.', 'ياخذ القلم اللي ورا أذنه، وتحت «أشياء هو مو شاطر فيها»، بشويش مرة، يضيف سطر: «٢. إنه يعترف إنه غلطان.» وبعدين يطوي الورقة ويرجعها لك.'),
      E1('neutral', 'Put it back where it was. In case he ever looks.', '{رجّعها|رجّعيها} مكانها. يمكن يطالع فيها يوم.'),
      st => { st.f.eTreasure = 'shown'; addTrust('elias', 1); return null; }]
  });
})();
