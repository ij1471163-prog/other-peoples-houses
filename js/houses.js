/* =====================================================================
   More houses ("other people's houses"): from chapter 2 on, a few more
   doors in Saltmere open. You don't live in them; you are let in for an
   hour, and each has a small story of its own, told over two or three
   visits (one visit a day at most).
     · Leo's family home (chapter 2 only, after you meet his mother on a
       delivery): his room, untouched; the yard where the sketchbooks
       burned; the kitchen with the lemon tree. Carol saved some pages.
     · Ingrid's parlour: a record of her and Henrik at Marco's in 1979
       that has always skipped at the same words.
     · Rex's kitchen, above the police station: a dad on his own in term
       time, fish fingers, long division, and a French plait.
     · Stella's flat, above the florist: her mother's cactus flowers one
       night a year.
   Each house only appears once its picture is in img/bg (so nothing
   half-made ever shows). Own flags only (s.f.hs_*, hd_*, hvIn); items,
   mood, a little trust. No quest, ending or ending-condition changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const C = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const hasBg = k => !!(window.IMG_MANIFEST && IMG_MANIFEST.bg && IMG_MANIFEST.bg[k]);
  const step = (s, id) => s.f['hs_' + id] || 0;
  const setStep = (s, id, n) => { s.f['hs_' + id] = n; s.f['hd_' + id] = s.day; };
  const newDay = (s, id) => s.f['hd_' + id] == null || s.day > s.f['hd_' + id];

  /* while you are let in, the host is shown in the room you are in (for that part of the day) */
  const host = (id, rooms) => {
    const c = GAME.CHAR[id]; if (!c || typeof c.where !== 'function') return;
    const w0 = c.where;
    c.where = s => (s && s.f.hvIn === id + ':' + s.day + ':' + s.slot && rooms.includes(s.loc)) ? s.loc : w0(s);
  };
  const enter = (id) => st => { st.f.hvIn = id + ':' + st.day + ':' + st.slot; return null; };

  Object.assign(GAME.ITEMS, {
    burntpage: { name: T('A half-burned page', 'ورقة نصها محروق'), desc: T('Saved from the yard by Leo\'s mother. "When he\'s ready. Not before."', 'أمه أنقذتها من الحوش. «لما يكون جاهز. مو قبل.»') },
    ingscarf: { name: T('Ingrid\'s scarf', 'شال إنغريد'), desc: T('Green wool, still warm from her lap. She knits one for everyone she loses. This one is for someone she found.', 'صوف أخضر، لسا دافي من حضنها. تحيك شال لكل أحد تفقده. وهذا لأحد لقته.') },
    cactuscut: { name: T('A cutting in a jam jar', 'عقلة صبّار في مرطبان'), desc: T('From Stella\'s mother\'s queen of the night. One flower a year, if you are patient.', 'من صبّارة ملكة الليل حقت أم ستيلا. زهرة وحدة بالسنة، إذا {صبرت|صبرتي}.') }
  });

  /* ================= 1. Leo's family home ================= */
  const LH = ['leo_home_kitchen', 'leo_hall', 'leo_kidroom', 'leo_yard'];
  Object.assign(GAME.LOC, {
    leo_home_kitchen: { name: T('The big house: the kitchen', 'البيت الكبير: المطبخ'), bg: 'leo_home_kitchen', charX: 60,
      exits: [{ to: 'leo_hall', x: 6, y: 86, label: T('The hall', 'الممر') }, { to: 'leo_yard', x: 90, y: 74, label: T('The back yard', 'الحوش'), if: () => hasBg('leo_yard') }],
      spots: [
        { x: 66, y: 34, label: T('The window', 'الشباك'), run: s => [N1('The bay, and the lighthouse on its point. On the counter, a bowl of lemons from the tree in the garden. "Planted it the week he was born," Carol says. "Everybody gets lemons from me. Everybody."', 'الخليج، والمنارة على رأسها. وعلى الرخامة صحن ليمون من الشجرة اللي في الحديقة. «زرعتها الأسبوع اللي انولد فيه،» تقول كارول. «الكل ياخذ ليمون مني. الكل.»')] },
        { x: 50, y: 66, label: T('The table', 'الطاولة'), run: s => [N1('Four chairs, three cushions gone flat with sitting. The fourth chair is pushed in very neatly, the way you push in a chair nobody uses any more.', 'أربع كراسي، ثلاث مخداتها مفرودة من كثر الجلوس. والرابع مدخّل تحت الطاولة بترتيب مرة، مثل ما تدخّل كرسي محد يستخدمه.')] },
        { x: 12, y: 46, label: T('The fridge', 'الثلاجة'), run: s => [N1('Two photos under magnets: a sailing boat, and a boy of about eight on the deck of it, scowling at the camera with a lemon in each hand.', 'صورتين تحت مغناطيس: قارب شراعي، وولد عمره تقريباً ثمان على سطحه، معصب على الكاميرا وفي كل يد ليمونة.')] }
      ] },
    leo_hall: { name: T('The big house: the hall', 'البيت الكبير: الممر'), bg: 'leo_hall', charX: 50,
      exits: [{ to: 'street', x: 6, y: 86, label: T('Out to the street', '{اطلع|اطلعي} للشارع') }, { to: 'leo_home_kitchen', x: 22, y: 45, label: T('The kitchen', 'المطبخ') }, { to: 'leo_kidroom', x: 69, y: 45, label: T('Leo\'s room', 'غرفة ليو') }],
      spots: [
        { x: 50, y: 52, label: T('The bathroom', 'الحمّام'), run: s => [N1('Three toothbrush holders. Two toothbrushes.', 'ثلاث علب فرش أسنان. وفرشتين.')] },
        { x: 88, y: 62, label: T('The pink room at the end', 'الغرفة الوردية اللي في الآخر'), run: s => [N1('A pink room, a rabbit sitting very straight on the bed. "The spare room," Carol says behind you. "For guests. We don\'t have guests. Frank\'s mother made the rabbit, and you can\'t throw away something somebody\'s mother made."', 'غرفة وردية، وأرنب جالس مستقيم على السرير. «غرفة الضيوف،» تقول كارول وراك. «للضيوف. وإحنا ما عندنا ضيوف. أم فرانك خيّطت الأرنب، وما تقدر ترمي شي خيّطته أم أحد.»')] }
      ] },
    leo_kidroom: { name: T('Leo\'s old room', 'غرفة ليو القديمة'), bg: 'leo_kidroom', exits: [{ to: 'leo_hall', x: 6, y: 86, label: T('Back to the hall', '{ارجع|ارجعي} للممر') }],
      spots: [
        { x: 30, y: 30, label: T('The pictures on the wall', 'الصور اللي على الجدار'), run: s => [N1('Not prints. Drawings, his, in frames his mother bought: boats, the bay, the lighthouse, getting better year by year. The oldest is down by the bed, unframed, stuck on with tape: a gull shaped like an angry banana, signed "LEO 6".', 'مو صور مطبوعة. رسوماته هو، في براويز شرتها أمه: قوارب، والخليج، والمنارة، وكل سنة أحسن من اللي قبلها. وأقدمها تحت جنب السرير، بدون برواز، ملصوق بشريط: نورس على شكل موزة معصبة، موقّع «ليو ٦».'), N1('So that\'s where it comes from.', 'يعني من هنا جات.')] },
        { x: 52, y: 58, label: T('The bed', 'السرير'), run: s => [N1('Made with corners like a hotel. Somebody makes it every week, though nobody has slept in it for two years. The blanket at the foot still has a few long brown hairs on it, and they have been left there.', 'مرتب بزوايا مثل الفندق. أحد يرتبه كل أسبوع، مع إن محد نام فيه من سنتين. والبطانية اللي تحت فيها كم شعرة بنية طويلة، وأحد تركها مكانها.')] },
        { x: 86, y: 52, label: T('The wardrobe', 'الدولاب'), run: s => [N1('His clothes from two years ago, ironed. On the inside of the door, in pencil, a list of heights: LEO 8, LEO 11, LEO 14... and next to the last one, smaller, DAN 17, and a little drawing of a car.', 'ملابسه من قبل سنتين، مكوية. وداخل الباب، بالرصاص، قايمة أطوال: ليو ٨، ليو ١١، ليو ١٤... وجنب آخر واحد، بخط أصغر، دان ١٧، ورسمة صغيرة لسيارة.')] }
      ] },
    leo_yard: { name: T('The back yard', 'الحوش'), bg: 'leo_yard', charX: 40, exits: [{ to: 'leo_home_kitchen', x: 8, y: 60, label: T('Back inside', '{ارجع|ارجعي} داخل') }],
      spots: [
        { x: 58, y: 72, label: T('The black patch on the stones', 'البقعة السودا على البلاط'), run: s => [N1('Two years of rain and it hasn\'t come out. Next to it, an oil drum with a hole burned in its side.', 'سنتين مطر وما راحت. وجنبها برميل زيت فيه خرق محروق من جنب.'), N1('Somebody has tried to scrub it. Somebody else has put a pot of geraniums on the worst of it, and stopped there.', 'أحد حاول يفركها. وأحد ثاني حط حوض جيرانيوم على أسوأ جزء منها، ووقف لين هنا.')] }
      ] }
  });
  const leoDoor = { x: 74, y: 30, label: T('The big house with the wide garden', 'البيت الكبير اللي فيه حديقة واسعة'),
    if: s => s.ch === 2 && !!s.f.leoCarol && !s.f.leoEnded && hasBg('leo_home_kitchen') && s.slot >= 1 && s.slot <= 2 && GAME.CHAR.leo.where(s) !== 'street',
    run: s => {
      const n = step(s, 'leo');
      if (n >= 2 || !newDay(s, 'leo')) return [N1('Carol waves at you from the kitchen window, and holds up a lemon, and puts it on the gatepost for you.', 'كارول تلوّح لك من شباك المطبخ، وترفع ليمونة، وتحطها لك على عمود البوابة.')];
      if (n === 0) return [{ go: 'leo_home_kitchen' }, enter('carol'), { show: [{ id: 'carol', e: 'neutral' }] },
        N1('Carol opens the gate before you reach it. "Come in. He won\'t know. I won\'t tell him if you don\'t."', 'كارول تفتح البوابة قبل لا {توصلها|توصلينها}. «{ادخل|ادخلي}. ما بيدري. أنا ما بقول له إذا أنت{|ِ} ما {قلت|قلتي}.»'),
        N1('The kitchen smells of garlic and something sweet in the oven. She puts a cup of tea in front of you without asking how you take it, and gets it right.', 'المطبخ ريحته ثوم وشي حلو في الفرن. تحط قدامك كوب شاي بدون ما تسألك كيف {تبيه|تبينه}، وتطلع صح.'),
        N1('"Tell me one thing," she says. "Not where he is. I know where he is. Tell me if he laughs."', '«{قل|قولي} لي شي واحد،» تقول. «مو وينه. أنا أعرف وينه. {قل|قولي} لي إذا يضحك.»'),
        { menu: [
          { t: T('"He laughs at his own gull drawings."', '«يضحك على رسمات النوارس حقته.»'), then: [{ show: [{ id: 'carol', e: 'smile' }] }, N1('"Angry bananas," she says, and has to turn round to the sink for a while.', '«موز معصب،» تقول، وتلف للمغسلة شوي.')] },
          { t: T('"Not much. But more than when I got there."', '«مو كثير. بس أكثر من يوم جيت.»'), then: [{ show: [{ id: 'carol', e: 'sad' }] }, N1('"More than when you got there," she repeats, as if writing it down somewhere inside.', '«أكثر من يوم جيت،» تعيدها، كأنها تكتبها في مكان داخلها.')] }
        ] },
        { show: [{ id: 'carol', e: 'neutral' }] },
        N1('"His room is down the hall. I haven\'t changed anything. Frank wanted to. I told him he could change it over my dead body. He said that isn\'t funny in this family. He was right." She nods at the hall. "Go on. I\'ll be here."', '«غرفته آخر الممر. ما غيرت فيها شي. فرانك كان يبي يغيرها. قلت له على جثتي. قال هالكلام مو مضحك في هالعيلة. وكان معه حق.» وتأشر على الممر. «{روح|روحي}. أنا هنا.»'),
        st => { setStep(st, 'leo', 1); addMood(1); return null; }];
      return [{ go: 'leo_home_kitchen' }, enter('carol'), { show: [{ id: 'carol', e: 'neutral' }] },
        N1('Carol is at the table with a big envelope. She waits until you sit down.', 'كارول على الطاولة ومعها ظرف كبير. تنتظرك لين {تجلس|تجلسين}.'),
        N1('"The night Frank burned them, I put the fire out with the washing-up bowl. I got six pages. Five are just ash at the edges. This one is the only one you can see."', '«الليلة اللي حرقها فيها فرانك، طفيت النار بطشت الغسيل. لحقت ست صفحات. خمس منها رماد على الأطراف. وهذي الوحيدة اللي يبان فيها شي.»'),
        N1('Two boys on a bike, done in pencil, mid-laugh. The top half of the page is gone, burned in a clean curve, so all that is left of them is two pairs of legs and a back wheel.', 'ولدين على دراجة، بالرصاص، يضحكون. النص الفوقي من الورقة راح، محروق بقوس مرتب، فكل اللي باقي منهم رجلين ورجلين وكفر ورا.'),
        { show: [{ id: 'carol', e: 'sad' }] },
        N1('"Give it to him when he\'s ready. Not before. You\'ll know. I never did."', '«{أعطه|أعطيه} إياها لما يكون جاهز. مو قبل. بتعرف{|ين}. أنا عمري ما عرفت.»'),
        st => { give('burntpage'); setStep(st, 'leo', 2); addMood(1); return null; }];
    } };
  GAME.LOC.street.spots.push(leoDoor);
  host('carol', ['leo_home_kitchen']);   /* she stays in her kitchen; you go round on your own */
  GAME.TOPICS.leo.push({ id: 'burntpage', once: true, label: T('Give him the half-burned page from his mother', '{أعطه|أعطيه} الورقة النص محروقة من أمه'),
    if: s => has('burntpage') && s.ch === 2 && !s.f.leoEnded && (s.trust.leo || 0) >= 4,
    run: s => { take('burntpage'); return [{ show: [{ id: 'leo', e: 'shock' }] },
      L_('shock', 'Where did you... She kept this?', 'من وين... هي خلّتها؟'),
      N1('He holds it by the very edge, the way you would hold something still hot.', 'يمسكها من طرفها بالضبط، مثل ما تمسك شي لسا حار.'),
      L_('sad', 'That\'s me and Dan. On the bike, the summer before. The top\'s gone, so we\'re just legs. Two idiots\' legs.', 'هذا أنا ودان. على الدراجة، الصيف اللي قبل. الفوق راح، فصرنا رجول بس. رجول اثنين أغبياء.'),
      L_('neutral', 'She went into the fire for this. With the washing-up bowl. Of course she did.', 'دخلت النار عشانها. بطشت الغسيل. أكيد سوتها.'),
      N1('He pins it to the wall of the loft, next to the round window, and stands back to look at it for a long time.', 'يعلقها على جدار السطح، جنب الشباك الدائري، ويرجع خطوة ويطالعها وقت طويل.'),
      st => { st.f.leoPage = true; addTrust('leo', 1); addMood(1); return null; }]; } });
  if (GAME.LOC.loft) GAME.LOC.loft.spots.push({ x: 50, y: 30, label: T('A half-burned drawing by the window', 'رسمة نصها محروق جنب الشباك'), if: s => !!s.f.leoPage, run: s => [N1('Two pairs of legs on a bike, mid-laugh, under a clean curve of burn. He has drawn, very lightly, in pencil, the top half back in. Then rubbed it out. Then drawn it again.', 'رجلين ورجلين على دراجة، يضحكون، تحت قوس محروق. ورسم فوقها، بالرصاص الخفيف، النص الفوقي من جديد. وبعدين مسحه. وبعدين رسمه مرة ثانية.')] });

  /* ================= 2. Ingrid's parlour ================= */
  GAME.LOC.ingrid_home = { name: T('Ingrid\'s parlour', 'صالة إنغريد'), bg: 'ingrid_home', charX: 62,
    exits: [{ to: 'street', x: 6, y: 86, label: T('Out to the street', '{اطلع|اطلعي} للشارع') }],
    spots: [
      { x: 24, y: 30, label: T('The posters', 'البوسترات'), run: s => [N1('"INGRID LARS & THE HARBOUR BOYS. One night only." Six of them, all "one night only", from six different years.', '«إنغريد لارس وعيال الميناء. ليلة وحدة بس.» ستة منها، كلها «ليلة وحدة بس»، من ست سنين مختلفة.')] },
      { x: 50, y: 56, label: T('The record player', 'مشغّل الأسطوانات'), run: s => [N1(...(step(s, 'ingrid') >= 2 ? ['The record is still on it. There is a coin taped to the arm now. She has not taken it off.', 'الأسطوانة لسا عليه. وفيه عملة ملصوقة على الذراع الحين. وما شالتها.'] : ['A record on the turntable: "LIVE AT MARCO\'S, 1979". The label has a ring on it from a teacup.', 'أسطوانة على المشغّل: «مباشر من مقهى ماركو، ١٩٧٩». وعلى الورقة أثر دائرة من كوب شاي.']))] }
    ] };
  host('ingrid', ['ingrid_home']);
  GAME.LOC.street.spots.push({ x: 12, y: 40, label: T('Ingrid\'s green door', 'باب إنغريد الأخضر'),
    if: s => s.ch >= 2 && hasBg('ingrid_home') && s.slot === 1 && (s.trust.ingrid || 0) >= 1,
    run: s => {
      const n = step(s, 'ingrid');
      if (n >= 2 || !newDay(s, 'ingrid')) return [N1('Through the window you can hear a record playing all the way through, and somebody singing along, badly, on purpose.', 'من الشباك {تسمع|تسمعين} أسطوانة تشتغل لين آخرها، وأحد يغني معها، بشكل سيء، بقصد.')];
      if (n === 0) return [{ go: 'ingrid_home' }, enter('ingrid'), { show: [{ id: 'ingrid', e: 'smile' }] },
        C('ingrid', 'smile', 'You came! Sit, sit. Not that chair, that\'s Henrik\'s. He\'s not using it, but still.', '{جيت|جيتي}! {اجلس، اجلس|اجلسي، اجلسي}. مو هالكرسي، هذا حق هنريك. مو مستخدمه، بس برضو.'),
        N1('Tea, in cups so thin you can see the light through them. Then she puts a record on, very carefully, the way people light candles.', 'شاي، في كاسات رقيقة لدرجة إنك {تشوف|تشوفين} النور من خلالها. وبعدين تحط أسطوانة، بشويش مرة، مثل ما يولع الناس شموع.'),
        N1('A room full of people, glasses, a piano. Then a voice, young and enormous: Ingrid. You glance at her. She has her eyes shut.', 'غرفة مليانة ناس، وكاسات، وبيانو. وبعدين صوت، شاب وضخم: إنغريد. {تطالعها|تطالعينها}. ومغمضة عيونها.'),
        N1('Between songs a man\'s voice, close to the microphone, laughing: "And this last one\'s for—" Click. The needle jumps. The song starts again from the top.', 'بين الأغاني صوت رجّال، قريب من المايك، يضحك: «وهالأخيرة لـ—» تك. الإبرة تقفز. والأغنية تبدأ من أولها.'),
        C('ingrid', 'sad', 'Forty-five years it has done that. Every time. I have never heard who the last one was for.', 'خمسة وأربعين سنة وهي تسوي كذا. كل مرة. وعمري ما سمعت الأخيرة كانت لمين.'),
        C('ingrid', 'smile', 'Henrik said it was for the barman. Henrik was a liar. A lovely liar.', 'هنريك كان يقول إنها للي يصب المشروبات. وهنريك كان كذاب. كذاب حلو.'),
        st => { setStep(st, 'ingrid', 1); addMood(1); feed(5); return null; }];
      return [{ go: 'ingrid_home' }, enter('ingrid'), { show: [{ id: 'ingrid', e: 'neutral' }] },
        C('ingrid', 'neutral', 'Back for more of the same song? It\'s all it knows.', '{رجعت|رجعتي} عشان نفس الأغنية؟ ما تعرف غيرها.'),
        N1('You remember something your grandmother did, or somebody\'s grandmother: a coin on the arm of the record player, for weight, so the needle can\'t jump.', '{تتذكر|تتذكرين} شي كانت تسويه جدتك، أو جدة أحد: عملة على ذراع المشغّل، عشان تثقّله، والإبرة ما تقفز.'),
        { menu: [
          { t: T('Tape a coin to the arm', '{الصق|الصقي} عملة على الذراع'), then: [st => { if (st.money >= 1) st.money -= 1; return null; }] },
          { t: T('Tape a button from your coat to it', '{الصق|الصقي} زر من جاكيتك عليه'), then: [] }
        ] },
        N1('She watches you do it with her hands pressed together. "Again," she says. The room, the glasses, the piano. The man\'s voice, laughing: "And this last one\'s for—"', 'تطالعك {وأنت تسويها|وأنتِ تسوينها} ويدينها مضمومة. «مرة ثانية،» تقول. الغرفة، والكاسات، والبيانو. وصوت الرجّال يضحك: «وهالأخيرة لـ—»'),
        N1('"—for Ingrid, who never lets me finish a sentence. Next year I\'m going to ask you properly, in front of all these people, so don\'t you dare answer before I—"', '«—لإنغريد، اللي عمرها ما خلتني أكمل جملة. السنة الجاية بسألك صح، قدام كل هالناس، فلا تتجرئين تردين قبل لا—»'),
        N1('And a woman\'s voice from the back of the room, very loud: "YES." The whole café laughing. Then the song.', 'وصوت امرأة من آخر الغرفة، عالي مرة: «إيه.» والمقهى كله يضحك. وبعدها الأغنية.'),
        { show: [{ id: 'ingrid', e: 'laugh' }] },
        C('ingrid', 'laugh', 'I said yes before he finished. I always did. Oh, he was cross.', 'قلت إيه قبل لا يكمل. دايم كنت أسويها. وزعل مرة.'),
        N1('She laughs until she has to take her glasses off. Then she gets up, goes to a basket by the piano, and comes back with a green scarf.', 'تضحك لين تضطر تشيل نظارتها. وبعدين تقوم، تروح لسلة جنب البيانو، وترجع بشال أخضر.'),
        C('ingrid', 'smile', 'I knit one for everyone I lose. I thought I might start doing one for people I find.', 'أحيك شال لكل أحد أفقده. وقلت يمكن أبدأ أحيك للناس اللي ألقاهم.'),
        st => { give('ingscarf'); setStep(st, 'ingrid', 2); addTrust('ingrid', 1); addMood(2); return null; }];
    } });

  /* ================= 3. Rex's kitchen (above the police station) ================= */
  GAME.LOC.rex_kitchen = { name: T('Rex\'s kitchen', 'مطبخ ريكس'), bg: 'rex_kitchen', charX: 58,
    exits: [{ to: 'police', x: 6, y: 86, label: T('Down to the station', '{انزل|انزلي} للمركز') }],
    spots: [
      { x: 26, y: 40, label: T('The fridge', 'الثلاجة'), run: s => [N1(...(step(s, 'rex') >= 3 ? ['In the middle of the fridge, held by four magnets: Lily\'s school photo. The plait is a disaster. She is grinning like she has won something.', 'بنص الثلاجة، ماسكتها أربع مغناطيسات: صورة ليلي حقت المدرسة. الضفيرة كارثة. وهي تبتسم كأنها فازت بشي.'] : ['Drawings by a ten-year-old: a police car with wings, a cat in handcuffs, "DAD" with a very big moustache.', 'رسومات بنت عمرها عشر: سيارة شرطة بأجنحة، وقطو مكلبش، و«بابا» بشنب كبير مرة.']))] }
    ] };
  host('rex', ['rex_kitchen']);
  if (GAME.LOC.police) GAME.LOC.police.spots.push({ x: 82, y: 40, label: T('The stairs up to the flat', 'الدرج للشقة اللي فوق'),
    if: s => s.ch >= 2 && hasBg('rex_kitchen') && s.slot === 3,
    run: s => {
      const n = step(s, 'rex');
      if (n >= 2 || !newDay(s, 'rex')) return [N1('From upstairs: a smoke alarm, a ten-year-old shouting "DAD", and a man shouting "I KNOW".', 'من فوق: جهاز إنذار دخان، وبنت عمرها عشر تصارخ «بابا»، ورجّال يصارخ «أدري».')];
      if (n === 0) return [{ go: 'rex_kitchen' }, enter('rex'), { show: [{ id: 'rex', e: 'shock' }] },
        N1('The smoke alarm is going. Rex is waving a tea towel at it with one hand and holding a pan of fish fingers that are black on one side with the other. At the table, a girl with a pencil in her mouth doesn\'t even look up.', 'جهاز الإنذار يصيح. ريكس يهوّي عليه بفوطة بيد، وماسك باليد الثانية مقلاة أصابع سمك سودا من جهة. وعلى الطاولة، بنت حاطة قلم في فمها وما ترفع راسها حتى.'),
        C('rex', 'shock', 'It\'s fine! It\'s fine. This is just how they come.', 'عادي! عادي. هي كذا تجي.'),
        C('rex', 'sad', 'Her mum\'s in the city. In term time Lily\'s with me. I can stop a fight on the pier with one look. I cannot do long division. Or fish fingers, apparently.', 'أمها في المدينة. وأيام الدراسة ليلي عندي. أقدر أوقف هوشة على الرصيف بنظرة. بس ما أعرف القسمة المطولة. ولا أصابع السمك، واضح.'),
        { menu: [
          { t: T('Take over the pan', '{خذ|خذي} المقلاة منه'), then: [N1('You do the second batch at a sensible heat. Lily eats four and says "these are the good ones" in a voice designed to hurt.', '{تسوي|تسوين} الدفعة الثانية على نار معقولة. ليلي تاكل أربع وتقول «هذي الزينة» بصوت مقصود يجرح.'), st => { feed(10); return null; }] },
          { t: T('Help Lily with her long division', '{ساعد|ساعدي} ليلي في القسمة المطولة'), then: [N1('Lily explains long division to you, slowly, as if you are the one with homework. By the end you both understand it. Rex pretends he did all along.', 'ليلي تشرح لك القسمة المطولة، بشويش، كأنك {أنت اللي عليه|أنتِ اللي عليك} واجب. وفي الأخير تفهمونها الاثنين. وريكس يسوي نفسه فاهمها من أول.')] }
        ] },
        st => { setStep(st, 'rex', 1); addMood(1); return null; }];
      return [{ go: 'rex_kitchen' }, enter('rex'), { show: [{ id: 'rex', e: 'sad' }] },
        N1('Rex is at the table with his phone propped against the sugar bowl, a video paused on it, and a hairbrush in his hand like a weapon he doesn\'t trust.', 'ريكس على الطاولة وجواله مسنود على علبة السكر، وفيه فيديو موقّف، وفرشاة شعر في يده كأنها سلاح ما يثق فيه.'),
        C('rex', 'sad', 'School photo tomorrow. She wants a French plait. I have watched this video eleven times. The woman in it has four hands.', 'بكرة صور المدرسة. تبي ضفيرة فرنسية. شفت هالفيديو إحدعش مرة. والمرة اللي فيه عندها أربع أيادي.'),
        { menu: [
          { t: T('"Give me the brush."', '«{عطني|عطيني} الفرشاة.»'), then: [N1('Lily sits on a stool. You do your best. It goes left, then right, then somewhere that isn\'t a direction. Lily looks in the mirror for a long time and says "I love it", and you can\'t tell if she means it, which is the point.', 'ليلي تجلس على كرسي صغير. {تسوي|تسوين} اللي {تقدر|تقدرين} عليه. تروح يسار، وبعدين يمين، وبعدين لمكان ما هو اتجاه. ليلي تطالع المراية وقت طويل وتقول «عاجبتني»، وما {تقدر تعرف|تقدرين تعرفين} إذا تقصدها، وهذا المقصود.')] },
          { t: T('Talk him through it, one strand at a time', '{وجّهه|وجّهيه} خطوة خطوة، خصلة خصلة'), then: [N1('"Left over middle. Now right over middle. Pick up a bit more. No, more." Rex\'s tongue is out. His big hands go very careful. It\'s wonky, and it\'s his, and Lily keeps touching it.', '«اليسار فوق النص. والحين اليمين فوق النص. {خذ|خذي} زيادة شوي. لا، زيادة.» لسان ريكس طالع. ويدينه الكبار صارت حذرة مرة. طلعت معوجة، بس هي حقته، وليلي ما وقفت تلمسها.')] }
        ] },
        st => { setStep(st, 'rex', 2); addMood(1); return null; }];
    } });
  GAME.TOPICS.rex = GAME.TOPICS.rex || [];
  GAME.TOPICS.rex.push({ id: 'hsPhoto', once: true, label: T('Ask about the school photo', '{اسأله|اسأليه} عن صورة المدرسة'),
    if: s => step(s, 'rex') === 2 && s.day > (s.f.hd_rex || 0),
    run: s => [{ show: [{ id: 'rex', e: 'smile' }] },
      N1('He takes out his wallet before you have finished asking. A school photo, folded once: a girl with a plait that has given up halfway, grinning like she has won something.', 'يطلّع محفظته قبل لا {تكمل|تكملين} سؤالك. صورة مدرسة، مطوية مرة: بنت ضفيرتها استسلمت بالنص، وتبتسم كأنها فازت بشي.'),
      C('rex', 'smile', 'The photographer said "maybe we redo the hair". She said "no, my dad did it". I had to go and sit in the car for a bit.', 'المصور قال «يمكن نعيد الشعر». قالت «لا، أبوي سواه». واضطريت أروح أجلس في السيارة شوي.'),
      st => { setStep(st, 'rex', 3); addTrust('rex', 1); addMood(1); return null; }] });

  /* ================= 4. Stella's flat (above the florist) ================= */
  GAME.LOC.stella_flat = { name: T('Stella\'s flat', 'شقة ستيلا'), bg: 'stella_flat', charX: 40,
    exits: [{ to: 'florist', x: 6, y: 86, label: T('Down to the shop', '{انزل|انزلي} للمحل') }],
    spots: [
      { x: 72, y: 56, label: T('The cactus on the terrace', 'الصبّارة اللي في السطح'), run: s => [N1(...(step(s, 'stella') >= 2 ? ['The flower is closed now, folded down like a used umbrella. Next year, Stella says. It always says next year.', 'الزهرة مسكّرة الحين، منطوية مثل شمسية مستخدمة. السنة الجاية، تقول ستيلا. دايم تقول السنة الجاية.'] : ['A tall, untidy cactus in a cracked pot, and on it one fat white bud, as long as your hand, pointing at the sky.', 'صبّارة طويلة وشكلها مهمل، في حوض مشقوق، وعليها برعم أبيض واحد منتفخ، بطول يدك، يأشر للسما.']))] },
      { x: 30, y: 70, label: T('The Admiral\'s basket', 'سلة الأدميرال'), run: s => [N1('A basket with a cushion with a ginger hollow in it. The Admiral is not in it. The Admiral is on the good chair, which is his, the basket being for visitors.', 'سلة فيها مخدة عليها حفرة برتقالية. الأدميرال مو فيها. الأدميرال على الكرسي الزين، اللي هو حقه، والسلة للضيوف.')] }
    ] };
  host('stella', ['stella_flat']);
  if (GAME.LOC.florist) GAME.LOC.florist.spots.push({ x: 88, y: 36, label: T('The stairs up to Stella\'s flat', 'الدرج لشقة ستيلا'),
    if: s => s.ch >= 2 && hasBg('stella_flat') && s.slot === NIGHT && ((s.trust.stella || 0) >= 1 || s.quests.q_cat === 'done'),
    run: s => {
      const n = step(s, 'stella');
      if (n >= 2) return [N1('Her light is off. On the step, a jam jar of water with a single sprig of something in it, and a label: "for whoever comes up the stairs".', 'نورها مطفي. وعلى الدرجة مرطبان ماي فيه غصن واحد من شي، وعليه ورقة: «لأي أحد يطلع الدرج».')];
      if (n === 1 && (s.day - (s.f.hd_stella || 0)) < 2) return [N1('Her light is on. You can hear her talking to someone. It is the cactus. "Not tonight, then. Fine. Fine."', 'نورها مولّع. {تسمعها|تسمعينها} تكلم أحد. هي الصبّارة. «مو الليلة، أجل. طيب. طيب.»')];
      if (n === 0) return [{ go: 'stella_flat' }, enter('stella'), { show: [{ id: 'stella', e: 'smile' }] },
        C('stella', 'smile', 'Come up, come up! Mind the fern, he\'s sensitive. Mind the Admiral, he\'s worse.', '{اطلع، اطلع|اطلعي، اطلعي}! {انتبه|انتبهي} للسرخس، حساس. {وانتبه|وانتبهي} للأدميرال، أسوأ.'),
        N1('Every surface has something growing on it. Out through the terrace door, in a cracked pot, a tall untidy cactus with one fat white bud.', 'كل سطح عليه شي ينبت. ومن باب السطح، في حوض مشقوق، صبّارة طويلة شكلها مهمل، فيها برعم أبيض منتفخ.'),
        C('stella', 'neutral', 'Queen of the night. Flowers one night a year, and by morning it\'s over. It was my mother\'s. It\'s older than the shop. It\'s older than me, actually.', 'ملكة الليل. تزهر ليلة وحدة بالسنة، والصبح خلاص. كانت حقت أمي. أقدم من المحل. أقدم مني بعد، صراحة.'),
        C('stella', 'smile', 'Any night now. If you see my light on late, come up. Nobody should watch it alone. I tried, once. It\'s too much for one person.', 'أي ليلة الحين. إذا {شفت|شفتي} نوري مولّع متأخر، {اطلع|اطلعي}. ما أحد لازم يطالعها لحاله. جربت، مرة. كثير على شخص واحد.'),
        st => { setStep(st, 'stella', 1); addMood(1); return null; }];
      return [{ go: 'stella_flat' }, enter('stella'), { show: [{ id: 'stella', e: 'shock' }] },
        C('stella', 'shock', 'It\'s happening. Quick. Sit. Don\'t breathe on it. Breathe a bit. Okay, breathe.', 'قاعدة تصير. بسرعة. {اجلس|اجلسي}. لا {تتنفس|تتنفسين} عليها. {تنفس|تنفسي} شوي. طيب، {تنفس|تنفسي}.'),
        N1('You sit on the terrace with your backs to the wall and the Admiral between you, and the bud opens. Not all at once. Like a hand you didn\'t know was a fist.', '{تجلس|تجلسين} على السطح وظهوركم للجدار والأدميرال بينكم، والبرعم ينفتح. مو مرة وحدة. مثل يد ما كنت تدري إنها قبضة.'),
        N1('By midnight it is the size of a plate, white as paper, and the whole terrace smells of something you have no name for. The Admiral purrs at it like an engine.', 'بنص الليل صارت بحجم صحن، بيضا مثل الورق، والسطح كله ريحته شي ما عندك له اسم. والأدميرال يخرخر لها مثل مكينة.'),
        C('stella', 'sad', 'Mum bought it the week I was born. I opened the shop the year she died. I think I just wanted somewhere to put all the flowers people kept bringing.', 'أمي شرتها الأسبوع اللي انولدت فيه. وفتحت المحل السنة اللي ماتت فيها. أحس كنت بس أبي مكان أحط فيه كل الورد اللي الناس كانوا يجيبونه.'),
        C('stella', 'smile', 'Every year it does this for one night and nobody sees it except me. This year somebody did.', 'كل سنة تسوي كذا ليلة وحدة ومحد يشوفها غيري. هالسنة أحد شافها.'),
        N1('Before you go, she cuts a piece off with the kitchen scissors, puts it in a jam jar of water, and pushes it into your hands. "Plant it somewhere. Wait a few years. Don\'t tell it I said that."', 'قبل لا {تمشي|تمشين}، تقص منها قطعة بمقص المطبخ، وتحطها في مرطبان ماي، وتحطها في يدينك. «{ازرعها|ازرعيها} في مكان. {انتظر|انتظري} كم سنة. لا {تقول|تقولين} لها إني قلت كذا.»'),
        st => { give('cactuscut'); setStep(st, 'stella', 2); addTrust('stella', 1); addMood(2); return null; }];
    } });
})();
