/* =====================================================================
   Chapter — Evelyn (38), the old lighthouse.
   Funny, odd, warm, and the strongest horror in Saltmere: every night
   at 3:07 a child laughs in the locked attic. Sounds only. The truth is
   a grief from 1958, and a machine an old man built so he'd never
   sleep through that minute again.
   ===================================================================== */
'use strict';
(function () {
  const E = (e, en, ar) => ({ c: 'evelyn', e, t: T(en, ar) });
  const inE = s => s.host === 'evelyn';
  const dE = s => s.day - (s.f.eveDay || 0);
  const HOUSE = ['lh_living', 'lh_kitchen', 'lh_room', 'lh_bath', 'lh_tower', 'lh_attic'];
  const eHome = s => { const w = GAME.CHAR.evelyn.where(s); return !!w && HOUSE.includes(w); };
  const byDay = (s, a) => a[s.day % a.length];
  const fear = (s, n) => { s.fear = clamp((s.fear || 0) + n, 0, 10); if (n > 0) toast(tx(T('Fear +', 'خوف +')) + n); };

  Object.assign(GAME.ITEMS, {
    akey: { name: T('Attic key', 'مفتاح العلية'), desc: T('Iron, cold, tied with a child\'s red shoelace.', 'حديد، بارد، مربوط بشريطة جزمة حمرا حق طفل.') },
    marble: { name: T('Red marble', 'بلية حمرا'), desc: T('It rolled down the attic stairs at 3:07.', 'تدحرجت من درج العلية الساعة ٣:٠٧.') }
  });
  Object.assign(GAME.QUESTS, {
    q_e_lamp: { title: T('The keeper\'s hours', 'ساعات الحارس'), hint: T('Evelyn keeps the lamp at night. Evenings and nights, you can help in the lantern room.', 'إيفلين تحرس الفانوس بالليل. المغرب والليل، تقدر تساعد في غرفة الفانوس.') },
    q_e_gulls: { title: T('Gerald, Mrs Pickles and Kevin', 'جيرالد، ومدام بيكلز، وكيفن'), hint: T('Afternoons, Evelyn feeds the gulls outside. They have names. They have opinions.', 'وقت العصر، إيفلين تأكّل النوارس برا. لهم أسماء. ولهم آراء.') },
    q_e_307: { title: T('3:07', '٣:٠٧'), hint: T('Every night at 3:07, a child laughs in the locked attic. Evelyn won\'t go up there.', 'كل ليلة الساعة ٣:٠٧، طفل يضحك في العلية المقفولة. وإيفلين ما تطلع لها.') },
    q_e_1958: { title: T('1958', '١٩٥٨'), hint: T('Something happened at the lighthouse in 1958. The keeper\'s logs are in Evelyn\'s room. Gregor at the cemetery knows the old stones.', 'صار شي في المنارة سنة ١٩٥٨. سجلات الحارس في غرفة إيفلين. وغريغور في المقبرة يعرف الحجارة القديمة.') }
  });

  const doorLock = s => {
    if (inE(s)) return null;
    if (s.done.evelyn) return T('The keeper\'s house is quiet. That part of your life has its ending.', 'بيت الحارس ساكت. هذاك الجزء من حياتك صار له نهايته.');
    if (s.host) return T('You\'re staying with someone else right now.', 'أنت ساكن عند أحد ثاني الحين.');
    if (!s.f.leoEnded) return T('A sign on the door: "KEEPER ASLEEP. GULLS ON DUTY."', 'ورقة على الباب: «الحارسة نايمة. النوارس مداومين.»');
    return [{ jump: 'eveStart' }];
  };
  Object.assign(GAME.LOC, {
    lh_ext: {
      name: T('The lighthouse', 'المنارة'), mapName: T('The lighthouse', 'المنارة'), bg: 'lh_ext', charX: 38, rooms: HOUSE,
      exits: [{ to: 'lh_living', x: 57, y: 56, label: T('Keeper\'s house door', 'باب بيت الحارس'), lock: doorLock }, { to: 'beach', x: 6, y: 86, label: T('Cliff path to the beach', 'طريق الجرف للشاطئ') }, { to: 'harbor', x: 30, y: 86, label: T('Back to the harbor', 'ارجع للميناء') }],
      spots: [
        { x: 40, y: 72, label: T('Feed the gulls', 'تأكّل النوارس'), if: s => inE(s) && s.slot === 2 && !doneToday('eGull'), cls: 'main', run: s => GAME.SCRIPTS.eveGulls(s) },
        { x: 75, y: 30, label: T('Look up at the tower', 'تطالع البرج'), run: s => [{ n: s.slot === NIGHT ? T('The beam turns over the sea every ten seconds. Under it, in the dark attic window of the keeper\'s house, nothing. You keep looking anyway.', 'الشعاع يلف على البحر كل عشر ثواني. وتحته، في شباك العلية المظلم حق بيت الحارس، ولا شي. وتظل تطالع على كل حال.') : T('Red and white bands, peeling. A brass plate: "SALTMERE LIGHT, 1872. KEPT BY THE WREN FAMILY, 1931–".  The end date has never been added.', 'أحزمة حمرا وبيضا، مقشّرة. لوحة نحاس: «منارة سولتمير، ١٨٧٢. حرستها عائلة رن، ١٩٣١–». وتاريخ النهاية ما انضاف أبداً.') }] }
      ]
    },
    lh_living: {
      name: T('The keeper\'s house', 'بيت الحارس'), bg: 'lh_living', house: 'evelyn', charX: 60,
      exits: [
        { to: 'lh_ext', x: 94, y: 76, label: T('Outside', 'برا') },
        { to: 'lh_kitchen', x: 6, y: 46, label: T('Kitchen', 'المطبخ') },
        { to: 'lh_room', x: 30, y: 18, label: T('Evelyn\'s room', 'غرفة إيفلين'), risk: s => eHome(s) },
        { to: 'lh_bath', x: 50, y: 18, label: T('Bathroom', 'الحمام'), lock: s => GAME.SCRIPTS.eveBathLock(s) },
        { to: 'lh_tower', x: 76, y: 18, label: T('Stairs up the tower', 'درج البرج') },
        { to: 'lh_attic', x: 90, y: 14, label: T('The attic door', 'باب العلية'), lock: s => GAME.SCRIPTS.atticLock(s) }
      ],
      spots: [
        { x: 30, y: 62, label: s => (s.slot === NIGHT ? T('Sleep on the camp bed', 'نام على سرير المخيّم') : T('Lie on the camp bed', 'تمدد على سرير المخيّم')), run: s => GAME.SCRIPTS.eveBed(s) },
        { x: 16, y: 26, label: T('Portrait', 'الصورة'), run: s => [N_('An old man in a keeper\'s jacket, white beard, eyes like he hasn\'t slept in decades. "Arthur Wren, Keeper, 1961–2009." Someone has stuck a tiny paper party hat on the frame.', 'رجّال كبير بجاكيت حارس، لحيته بيضا، وعيونه كأنه ما نام من عقود. «آرثر رن، حارس، ١٩٦١–٢٠٠٩.» وأحد لاصق طاقية حفلة ورق صغيرة على البرواز.')] },
        { x: 92, y: 40, label: T('Grandfather clock', 'الساعة الكبيرة'), run: s => [N_('It keeps perfect time. Next to it, on a card in old handwriting: "Never stop this clock. Never wind the attic one. — A.W."', 'تمشي بالضبط. وجنبها، على كرت بخط قديم: «لا توقف هالساعة أبداً. ولا تعبّي حقت العلية أبداً. — آ.ر.»')] },
        { x: 52, y: 66, label: T('Accordion', 'الأكورديون'), run: s => onceToday('eAcc') ? (addMood(1), [N_('You squeeze it once. It makes a sound like a cow sitting on a balloon. Somewhere above, a gull screams back in what you choose to believe is applause.', 'تضغطه مرة. يطلع صوت كأن بقرة جلست على بالونة. وفوق في مكان، نورس يصرخ، وتختار تصدق إنه تصفيق.')]) : [N_('It wheezes at you reproachfully.', 'يتنهّد عليك بعتاب.')] }
      ]
    },
    lh_kitchen: { name: T('Lighthouse kitchen', 'مطبخ المنارة'), bg: 'lh_kitchen', house: 'evelyn', charX: 44, exits: [back('lh_living')],
      spots: [{ x: 50, y: 60, label: T('Eat something', 'كل شي'), run: s => GAME.SCRIPTS.eat(s) }, { x: 70, y: 22, label: T('Jars on the shelf', 'المرطبانات على الرف'), run: s => [N_('Labels: "SALT", "SUGAR", "PROBABLY FLOUR", "DO NOT", "GERALD\'S".', 'الملصقات: «ملح»، «سكر»، «طحين غالباً»، «لا»، «حق جيرالد».')] }] },
    lh_bath: { name: T('Bathroom', 'الحمام'), bg: 'lh_bath', house: 'evelyn', canWait: false, exits: [back('lh_living')],
      spots: [{ x: 26, y: 46, label: T('Take a bath', 'تاخذ حمام'), run: s => GAME.SCRIPTS.shower(s) }, { x: 48, y: 44, label: T('Radio', 'الراديو'), run: s => [N_('"Viking, North Utsire, South Utsire: southwesterly, gale eight, occasionally severe gale nine." It sounds like a spell. Maybe it is.', '«فايكنغ، شمال أوتسيرا، جنوب أوتسيرا: رياح جنوبية غربية، عاصفة ثمانية، أحياناً عاصفة شديدة تسعة.» صوتها كأنها تعويذة. يمكن هي.')] }] },
    lh_room: {
      name: T('Evelyn\'s room', 'غرفة إيفلين'), bg: 'lh_room', house: 'evelyn', private: true, exits: [back('lh_living')],
      onEnter: s => GAME.SCRIPTS.eveEnter(s),
      spots: [
        { x: 56, y: 50, label: T('Keeper\'s logbooks', 'سجلات الحارس'), risk: s => eHome(s), run: s => GAME.SCRIPTS.eveLogs(s) },
        { x: 86, y: 40, label: T('Her diary', 'مذكراتها'), risk: s => eHome(s), run: s => GAME.SCRIPTS.eveDiary(s) },
        { x: 64, y: 56, label: T('Desk drawer', 'درج المكتب'), risk: s => eHome(s), if: s => !has('akey'), run: s => GAME.SCRIPTS.eveDrawer(s) }
      ]
    },
    lh_tower: {
      name: T('The lantern room', 'غرفة الفانوس'), bg: 'lh_tower', house: 'evelyn', charX: 70, exits: [{ to: 'lh_living', x: 22, y: 86, label: T('Down the stairs', 'انزل الدرج') }],
      spots: [
        { x: 55, y: 74, label: T('The lens', 'العدسة'), run: s => [N_('A beehive of glass taller than you, rings within rings. When it turns, the whole room turns with it, and your stomach takes a second to follow.', 'خلية زجاج أطول منك، حلقات داخل حلقات. لما تدور، الغرفة كلها تدور معها، وبطنك ياخذ ثانية عشان يلحق.')] },
        { x: 84, y: 70, label: T('The gallery door', 'باب الشرفة'), risk: s => !!s.f.eStormNow, run: s => GAME.SCRIPTS.eveGallery(s) }
      ]
    },
    lh_attic: {
      name: T('The attic', 'العلية'), bg: 'lh_attic', house: 'evelyn', canWait: false, exits: [back('lh_living')],
      onEnter: s => GAME.SCRIPTS.eveAtticEnter(s),
      spots: [
        { x: 66, y: 62, label: T('The trunk', 'الصندوق'), run: s => [N_('A child\'s things, folded with great care: a jumper for a nine-year-old, a tin boat, a comic from 1958, and a school report: "Tobias is cheerful, curious and talks too much."', 'أغراض طفل، مطوية بعناية كبيرة: كنزة لولد عمره تسع، وقارب صفيح، ومجلة مصورة من ١٩٥٨، وتقرير مدرسة: «توبياس مرح، فضولي، ويتكلم كثير.»'), st => { st.f.eTrunk = true; return null; }] },
        { x: 86, y: 48, label: T('The attic clock', 'ساعة العلية'), run: s => GAME.SCRIPTS.eveMachine(s) },
        { x: 50, y: 22, label: T('The little window', 'الشباك الصغير'), run: s => [N_('It looks out onto the gallery, three metres below. The latch is new. Somebody, a long time ago, screwed it shut.', 'يطل على الشرفة، تحته بثلاث أمتار. القفل جديد. أحد، من زمان، ثبّته بالمسامير.')] }
      ]
    }
  });
  GAME.MAP.forEach(p => { if (p.place === 'lighthouse' && !p.to) p.if = s => !s.f.leoEnded; });
  GAME.MAP.push({ to: 'lh_ext', place: 'lighthouse', if: s => !!s.f.leoEnded });
  GAME.LOC.harbor.exits.push({ to: 'lh_ext', x: 94, y: 64, label: T('Path to the lighthouse', 'طريق المنارة'), if: s => !!s.f.leoEnded });

  /* ---------- scripts ---------- */
  Object.assign(GAME.SCRIPTS, {
    eveStart: s => [{ go: 'lh_ext' }, { show: [{ id: 'evelyn', e: 'shock' }] },
      N_('You knock. The door flies open before your second knock. A woman in a fisherman\'s jumper and a red scarf, holding a fish slice like a sword.', 'تطق. الباب ينفتح بقوة قبل الطقة الثانية. امرأة لابسة كنزة صيادين وشال أحمر، ماسكة ملعقة قلي كأنها سيف.'),
      E('shock', 'Oh! A human. Sorry. I thought you were the gull. One of them knocks. Kevin. We\'re working on it.', 'أوه! إنسان. آسفة. حسبتك النورس. واحد منهم يطق. كيفن. قاعدين نشتغل على الموضوع.'),
      E('smile', 'Evelyn Wren. Keeper. Well, the lamp is automatic now, so "keeper" is more of a personality.', 'إيفلين رن. حارسة. يعني، الفانوس صار أوتوماتيكي، فـ«حارسة» صارت أكثر شخصية من وظيفة.'),
      { menu: [
        { t: T('"I\'m looking for somewhere to stay."', '«أدور مكان أسكن فيه.»'), then: [] },
        { t: T('"Sami says you might need help with the place."', '«سامي يقول يمكن تحتاجين مساعدة في المكان.»'), then: [] }
      ] },
      E('neutral', 'There\'s a camp bed by the fire. Food is whatever I\'ve invented. The rent is company. I work nights. It gets... quiet.', 'فيه سرير مخيّم جنب الدفاية. والأكل اللي أخترعه. والإيجار إنك تونّسني. أشتغل بالليل. ويصير... ساكت.'),
      E('sad', 'Two rules. Don\'t go in the attic. And if you wake up at seven minutes past three, don\'t go looking for anything. Just go back to sleep.', 'قانونين. لا تدخل العلية. ولو صحيت الساعة ثلاث وسبع دقايق، لا تدور على شي. ارجع نام وبس.'),
      { menu: [
        { t: T('"Deal. ...Why 3:07?"', '«اتفقنا. ...ليش ٣:٠٧؟»'), cls: 'main', then: [E('smile', 'Ha! You\'ll see. Or you won\'t. Most people do.', 'ها! بتشوف. أو ما بتشوف. أغلب الناس يشوفون.'), st => { st.host = 'evelyn'; st.f.metEve = true; st.met.evelyn = true; st.f.eveDay = st.day; st.trust.evelyn = st.trust.evelyn || 0; st.susp.evelyn = 0; st.ch = Math.max(st.ch, 3); quest('q_e_lamp', 'active'); quest('q_e_gulls', 'active'); return null; }, { go: 'lh_living' }, { show: [] }, N_('Stone walls, a fire, a grandfather clock ticking like a heartbeat, an accordion on the chair. And at the top of a narrow staircase, a small door with a heavy padlock.', 'جدران حجر، ودفاية، وساعة كبيرة تدق مثل نبض القلب، وأكورديون على الكرسي. وفوق درج ضيق، باب صغير عليه قفل ثقيل.')] },
        { t: T('"Maybe another time."', '«يمكن مرة ثانية.»'), then: [E('neutral', 'The light\'s always on. Literally. That\'s the job.', 'الضو دايم شغال. حرفياً. هذا الشغل.'), { go: 'harbor' }] }
      ] }],
    eveBathLock: s => GAME.CHAR.evelyn.where(s) !== 'lh_bath' ? null : [{ n: fresh('eBath', [T('Locked. Splashing, and Evelyn reading the shipping forecast aloud in a dramatic voice: "Dogger. FISHER. German Bight."', 'مقفول. صوت موية، وإيفلين تقرا نشرة الطقس البحري بصوت درامي: «دوغر. فيشر. خليج ألمانيا.»'), T('Locked. "OCCUPIED. Unless you\'re a gull. Kevin, is that you?"', 'مقفول. «مشغول. إلا إذا كنت نورس. كيفن، هذا أنت؟»'), T('Locked. A very long silence, then the sound of a rubber duck being squeezed, once, with feeling.', 'مقفول. سكوت طويل مرة، وبعدين صوت بطة مطاط تنعصر، مرة وحدة، بإحساس.')]) }],
    atticLock: s => {
      if (has('akey') && (s.slot < NIGHT || s.f.eFinaleNow)) return null;
      if (has('akey')) return [N_('You put the key in the padlock. Above you, very close, something small and quick runs across the floorboards. You take the key out again.', 'تحط المفتاح في القفل. وفوقك، قريب مرة، شي صغير وسريع يركض على الخشب. وتطلع المفتاح.'), st => { fear(st, 1); return null; }];
      quest('q_e_307', 'active');
      return [N_('A padlock as big as your fist. On the door, at the height of a child, the paint is worn pale, as if by a small hand, for years.', 'قفل بحجم قبضتك. وعلى الباب، بطول طفل، الصبغ باهت، كأن يد صغيرة لمسته، لسنين.')];
    },
    eveRisk: (s, extra = 0) => { const w = GAME.CHAR.evelyn.where(s); const p = ({ lh_room: 0.7, lh_kitchen: 0.25, lh_bath: 0.1, lh_tower: 0.08, lh_ext: 0.15 })[w] ?? 0.05; return clamp(p + extra, 0.02, 0.85); },
    eveCaught: s => { addSusp('evelyn', 1); addTrust('evelyn', -1); const n = s.susp.evelyn || 0;
      if (n >= 3) return [{ show: [{ id: 'evelyn', e: 'angry' }] }, { jump: 'endEveKick' }];
      return [{ show: [{ id: 'evelyn', e: 'angry' }] }, n === 1 ? E('angry', 'That\'s my room. I sleep in there. Mostly. Out, please. Now.', 'هذي غرفتي. أنام فيها. غالباً. اطلع لو سمحت. الحين.') : E('angry', 'Again? Gerald was right about you. I hate it when Gerald\'s right.', 'مرة ثانية؟ جيرالد كان صح عنك. أكره لما جيرالد يطلع صح.'), { go: 'lh_living' }]; },
    eveEnter: s => {
      const w = GAME.CHAR.evelyn.where(s);
      if (w === 'lh_room') { if (roll(0.5)) return [N_('She\'s asleep, face down, one arm hanging off the bed. She mumbles "Kevin, no" and doesn\'t wake.', 'نايمة، على وجهها، وذراعها متدلية من السرير. تتمتم «كيفن، لا» وما تصحى.')]; return [N_('A floorboard. Her eyes open.', 'خشبة تطق. عيونها تنفتح.'), { jump: 'eveCaught' }]; }
      if (roll(GAME.SCRIPTS.eveRisk(s, -0.1))) return [N_('Footsteps on the stairs.', 'خطوات على الدرج.'), { jump: 'eveCaught' }];
      return null;
    },
    eveLogs: s => {
      if (roll(GAME.SCRIPTS.eveRisk(s, 0.05))) return [N_('The logbook is heavier than it looks. It slips. The bang is enormous.', 'السجل أثقل من شكله. يطيح. والصوت ضخم.'), { jump: 'eveCaught' }];
      s.f.eLog = true; quest('q_e_1958', 'active');
      return [N_('Decades of logbooks. Weather, ships, lamp hours, in Arthur Wren\'s small neat hand.', 'سجلات عقود. الطقس، والسفن، وساعات الفانوس، بخط آرثر رن الصغير المرتب.'),
        N_('14 November 1958: "Storm. Lamp failed 02:40. Went up to mend it. Left T. in the attic, door locked, as punishment for the matches. He was frightened of the storm. I told him to stop crying and go to sleep."', '١٤ نوفمبر ١٩٥٨: «عاصفة. الفانوس تعطل ٠٢:٤٠. طلعت أصلحه. وخليت ت. في العلية، الباب مقفول، عقاب على الكبريت. كان خايف من العاصفة. قلت له وقف بكا ونام.»'),
        N_('The next line is in different ink, years later: "He climbed out of the window to find me. 03:07. I was ten metres away and did not hear him. I will never sleep through 03:07 again."', 'السطر اللي بعده بحبر مختلف، بعد سنين: «طلع من الشباك يدورني. ٠٣:٠٧. كنت على بعد عشر أمتار وما سمعته. ما راح أنام عن ٠٣:٠٧ مرة ثانية أبداً.»')];
    },
    eveDiary: s => {
      if (roll(GAME.SCRIPTS.eveRisk(s, 0.1))) return [N_('"Is that my diary?" From the doorway.', '«هذي مذكراتي؟» من عند الباب.'), { jump: 'eveCaught' }];
      s.f.eDiary = true;
      return [N_('"Night 4,018. It laughed again. Gran said never go up. Gran said Grandad was the only one allowed. Grandad has been dead fifteen years and it still laughs."', '«الليلة ٤٠١٨. ضحك مرة ثانية. جدتي قالت لا تطلعين أبداً. جدتي قالت جدي الوحيد اللي مسموح له. وجدي ميت من خمسطعش سنة وهو لسا يضحك.»'),
        N_('"Some nights I think if I went up there and said sorry, it would stop. I don\'t know who I\'d be saying sorry for."', '«بعض الليالي أحس لو طلعت وقلت آسفة، بيوقف. ما أدري عن مين بقول آسفة.»')];
    },
    eveDrawer: s => {
      if (roll(GAME.SCRIPTS.eveRisk(s, 0.12))) return [N_('The drawer sticks, then shrieks.', 'الدرج يعلق، وبعدين يصيح.'), { jump: 'eveCaught' }];
      give('akey');
      return [N_('Under spare lightbulbs and a gull feather collection, labeled: an iron key on a child\'s red shoelace. A luggage tag: "ATTIC. NO. — Gran."', 'تحت لمبات احتياط ومجموعة ريش نوارس، عليها ملصقات: مفتاح حديد على شريطة جزمة حمرا حقت طفل. وبطاقة: «العلية. لا. — جدتي.»')];
    },
    eveAtticEnter: s => {
      if (s.f.eFinaleNow) return null;
      s.f.eAttic = true;
      if (s.slot === NIGHT) { fear(s, 2); return [N_('The moment the door opens, the laughter starts, right beside you, at the height of your hip. Then it stops. Something warm and small takes your hand.', 'أول ما ينفتح الباب، الضحك يبدأ، جنبك بالضبط، بطول وركك. وبعدين يوقف. شي دافي وصغير يمسك يدك.'), N_('You are on the stairs. You don\'t remember leaving. The padlock is closed. You don\'t remember closing it.', 'أنت على الدرج. ما تتذكر إنك طلعت. والقفل مسكّر. ما تتذكر إنك سكّرته.'), { go: 'lh_living' }]; }
      return [N_('Dust, low beams, a small window full of sky. A trunk. A clock on the wall with its hands painted on, stuck forever at seven minutes past three.', 'غبار، وخشب سقف واطي، وشباك صغير مليان سما. وصندوق. وساعة على الجدار عقاربها مرسومة، واقفة للأبد على ثلاث وسبع دقايق.')];
    },
    eveMachine: s => {
      if (s.f.eMech) return [N_('The machine behind the panel ticks, patient, waiting for 3:07.', 'المكينة اللي ورا اللوح تدق، صبورة، تنتظر ٣:٠٧.')];
      s.f.eMech = true; quest('q_e_307', 'done'); fear(s, -2);
      return [N_('The painted clock is a cover. It swings out on a hinge. Behind it, in the wall: a reel-to-reel tape recorder from the 1950s, wired to a timer, wired to the house clock downstairs.', 'الساعة المرسومة غطا. تنفتح على مفصلة. ووراها، في الجدار: مسجل شريط بكرات من الخمسينات، مربوط بمؤقت، مربوط بساعة البيت اللي تحت.'),
        N_('A strip of masking tape on the reel, in Arthur Wren\'s hand: "T. laughing. Recorded 8 Nov 1958. Play at 03:07 so I never sleep through it again."', 'شريط لاصق على البكرة، بخط آرثر رن: «ت. يضحك. انسجل ٨ نوفمبر ١٩٥٨. يشتغل الساعة ٠٣:٠٧ عشان ما أنام عنه مرة ثانية أبداً.»'),
        N_('Every night for fifty years, an old man lay awake to hear his little brother laugh. And then he died, and the machine kept going, and nobody knew.', 'كل ليلة لمدة خمسين سنة، رجّال كبير يظل صاحي عشان يسمع أخوه الصغير يضحك. وبعدين مات، والمكينة كملت، ومحد درى.'),
        N_('You realise you\'re crying. It\'s the least frightening thing you\'ve found in Saltmere, and the saddest.', 'تنتبه إنك تبكي. هذا أقل شي مخيف لقيته في سولتمير، وأحزن شي.')];
    },
    eveGulls: s => { onceToday('eGull'); s.f.eGulls = (s.f.eGulls || 0) + 1; if (s.f.eGulls <= 3) addTrust('evelyn', 1); addMood(1); advance(1); if (s.f.eGulls >= 2) quest('q_e_gulls', 'done');
      return [{ c: 'evelyn', e: 'smile', t: fresh('eGullL', [T('That\'s Gerald. Gerald is a judge. That\'s Mrs Pickles, she\'s been widowed four times, all suspicious. And Kevin. Don\'t make eye contact with Kevin.', 'هذا جيرالد. جيرالد قاضي. وهذي مدام بيكلز، ترمّلت أربع مرات، وكلها مشبوهة. وكيفن. لا تطالع كيفن بعيونه.'), T('Bread is bad for them, so I give them sardines, and in return they give me gossip. Mrs Pickles says Victor has been on the beach at night. Mrs Pickles is never wrong.', 'الخبز يضرهم، فأعطيهم سردين، وبالمقابل يعطوني سوالف. مدام بيكلز تقول فيكتور كان على الشاطئ بالليل. ومدام بيكلز عمرها ما غلطت.'), T('Kevin stole a man\'s whole sandwich last summer and the man cried. I\'ve never been prouder of anyone.', 'كيفن سرق سندويشة رجّال كاملة الصيف اللي فات والرجّال بكى. عمري ما فخرت بأحد كذا.'), T('Throw it high. They like to show off. Like me, Gran used to say. She meant it nicely. Mostly.', 'ارمها عالي. يحبون يستعرضون. مثلي، كانت جدتي تقول. وكانت تقصدها بلطف. غالباً.')]) }]; },
    eveLens: s => { onceToday('eLens'); s.f.eLens = (s.f.eLens || 0) + 1; if (s.f.eLens <= 3) addTrust('evelyn', 1); advance(s.slot < NIGHT ? 1 : 0); quest('q_e_lamp', 'done');
      if (s.f.eLens === 2) { s.f.eHarness = true; return [E('neutral', 'If you ever go out on the gallery, you clip on. Here. This ring. Every time. Grandad lost a friend who didn\'t. Say it back.', 'لو طلعت الشرفة يوم، تشبك. هنا. هالحلقة. كل مرة. جدي خسر صاحب ما شبك. قولها ورايا.'), N_('"Clip on. Every time." She makes you say it three times, and then pretends to test you at random for the rest of the night.', '«أشبك. كل مرة.» تخليك تقولها ثلاث مرات، وبعدين تسوي نفسها تختبرك فجأة باقي الليل.')]; }
      return [{ n: fresh('eLensT', [T('You polish the prisms with chamois leather, one panel at a time. Every ten seconds the beam passes over your hands and turns them gold.', 'تلمّع المناشير بجلد الشمواه، لوح لوح. وكل عشر ثواني الشعاع يمر على يدينك ويخليها ذهبية.'), T('Evelyn tells you the names of the ships that pass, and then admits she made all of them up. "That one\'s the Unsinkable Margaret." It isn\'t.', 'إيفلين تقول لك أسماء السفن اللي تمر، وبعدين تعترف إنها ألّفتها كلها. «هذي اسمها مارغريت اللي ما تغرق.» مو صح.'), T('You sit with your backs to the warm glass and eat terrible soup out of a flask. Out at sea, a ship flashes its lights twice. "Thank you," Evelyn translates.', 'تجلسون وظهوركم على الزجاج الدافي وتاكلون شوربة سيئة من ترمس. وبعيد في البحر، سفينة ترمش أنوارها مرتين. «شكراً،» تترجم إيفلين.')]) }]; },
    eveSoup: s => { onceToday('eSoup'); feed(45); const r = Math.random(); addTrust('evelyn', s.f.eSoup ? 0 : 1); s.f.eSoup = true;
      return [E('smile', 'Tonight\'s soup is called "Tuesday". It has fish, apple, and a secret.', 'شوربة الليلة اسمها «الثلاثاء». فيها سمك، وتفاح، وسر.'), r < 0.4 ? N_('It\'s delicious. That\'s the worst part. You can\'t tell anyone because nobody would believe you.', 'لذيذة. وهذا أسوأ شي. ما تقدر تقول لأحد لأن محد بيصدقك.') : r < 0.8 ? N_('It tastes like the sea had a dream about a fruit bowl. You have seconds out of politeness and then thirds out of confusion.', 'طعمها كأن البحر حلم بصحن فواكه. تاخذ مرة ثانية من الأدب، وثالثة من الحيرة.') : N_('The secret is liquorice. You will never be the same.', 'السر عرق سوس. عمرك ما بترجع مثل قبل.')]; },
    eveBed: s => {
      if (s.slot !== NIGHT) return GAME.SCRIPTS.bed(s);
      const n = s.f.eLaugh || 0;
      if (s.f['e307_' + s.day] || n >= 3 || dE(s) < 1) return GAME.SCRIPTS.bed(s);
      s.f['e307_' + s.day] = true; s.f.eLaugh = n + 1; quest('q_e_307', s.quests.q_e_307 === 'done' ? 'done' : 'active');
      const scenes = [
        [N_('You wake. The fire is embers. The grandfather clock says 3:07.', 'تصحى. الدفاية جمر. والساعة الكبيرة تقول ٣:٠٧.'), N_('Above you, in the attic, a child laughs. Bright, delighted, like someone being tickled. Ten seconds. Then nothing but the sea.', 'فوقك، في العلية، طفل يضحك. ضحكة صافية ومبسوطة، كأن أحد يدغدغه. عشر ثواني. وبعدها ولا شي غير البحر.')],
        [N_('3:07. The laugh again, and this time footsteps with it, small and fast, running from one end of the attic to the other.', '٣:٠٧. الضحكة مرة ثانية، وهالمرة معها خطوات، صغيرة وسريعة، تركض من طرف العلية للطرف الثاني.'), N_('Something rolls down the attic stairs, bump, bump, bump, and stops against your camp bed. A red glass marble.', 'شي يتدحرج من درج العلية، طق، طق، طق، ويوقف عند سريرك. بلية زجاج حمرا.'), st => { give('marble'); return null; }],
        [N_('3:07. The laugh, then a knock. On the inside of the attic door. Low down. Knock-knock. Knock-knock. Like a game.', '٣:٠٧. الضحكة، وبعدين طق. من داخل باب العلية. تحت. طق طق. طق طق. كأنها لعبة.'), N_('Evelyn is standing at the bottom of the tower stairs in the dark, white as paper. She has heard it every night of her life. She\'s never seen anyone else hear it.', 'إيفلين واقفة تحت درج البرج بالظلام، بيضا مثل الورق. سمعته كل ليلة في حياتها. وعمرها ما شافت أحد ثاني يسمعه.')]
      ][n];
      return [{ show: [] }].concat(scenes, [{ menu: [
        { t: T('Pull the blanket over your head', 'تغطي راسك بالبطانية'), fx: st => fear(st, 1), then: [N_('You lie under the blanket until the gulls start. You might sleep. You might not.', 'تتمدد تحت البطانية لين تبدأ النوارس. يمكن تنام. يمكن لا.')] },
        { t: T('Go and knock on the attic door', 'تروح تطق على باب العلية'), cls: 'risk', fx: st => fear(st, 2), then: [N_('You climb the stairs and knock. The laughter stops at once, mid-breath, the way a recording stops. That\'s somehow worse.', 'تطلع الدرج وتطق. الضحك يوقف فوراً، بنص النفس، مثل ما يوقف التسجيل. وهذا بطريقة ما أسوأ.'), st => { st.f.eRecording = true; return null; }] },
        { t: T('Find Evelyn in the tower', 'تروح لإيفلين في البرج'), fx: st => { addTrust('evelyn', 1); fear(st, -1); }, then: [N_('She\'s sitting on the top step with a flask of tea, waiting, as if she always does this at 3:07. She pours you a cup without asking. You sit together until it gets light.', 'جالسة على آخر درجة ومعها ترمس شاي، تنتظر، كأنها دايم تسوي هذا الساعة ٣:٠٧. تصب لك كوب بدون ما تسأل. وتجلسون مع بعض لين يطلع الضو.')] },
        { t: T('Run. Out of the house, now.', 'اهرب. من البيت، الحين.'), cls: 'risk', hide: st => (st.fear || 0) < 5, then: [{ jump: 'endEveFlee' }] }
      ] }, st => { sleepToMorning(); return null; }]);
    },
    eveStorm: s => { s.f.eStormDay = s.day; s.f.eStormNow = true;
      return [{ go: 'lh_tower' }, { show: [{ id: 'evelyn', e: 'shock' }] },
        N_('The storm comes in fast, as if somebody opened a door on the sea. Rain hits the lantern glass sideways. The building hums.', 'العاصفة تجي بسرعة، كأن أحد فتح باب على البحر. المطر يضرب زجاج الفانوس بالعرض. والمبنى يطن.'),
        E('shock', 'The gallery shutter\'s come loose. If it smashes the glass, the lamp goes out. There\'s a boat out there. Maya\'s cousin. I can see his lights.', 'غطا الشرفة انفك. لو كسر الزجاج، الفانوس بيطفي. وفيه قارب هناك. ولد عم مايا. أشوف أنواره.'),
        E('sad', 'I\'ll go. You stay inside. I mean it.', 'أنا بروح. أنت اقعد داخل. أعنيها.'),
        st => { addTrust('evelyn', 1); return null; },
        N_('She goes out onto the gallery into the screaming dark. She\'s gone a long time.', 'تطلع للشرفة في الظلام اللي يصارخ. وتطول.')];
    },
    eveGallery: s => {
      if (!s.f.eStormNow) return [N_('The gallery: a narrow iron walkway around the lantern, a rail at waist height, and then nothing until the sea.', 'الشرفة: ممر حديد ضيق حول الفانوس، ودرابزين لين الخصر، وبعده ولا شي لين البحر.')];
      return [N_('The wind outside sounds like something alive. Evelyn has been out there too long. Her harness line is snapping against the glass.', 'الريح برا صوتها كأنها شي حي. إيفلين طولت برا. وحبل حزامها يضرب على الزجاج.'),
        N_('WARNING: Going out there could kill you.', 'تحذير: لو طلعت ممكن تموت.'),
        { menu: [
          { t: T('Clip on, every time, and go out after her', 'تشبك، كل مرة، وتطلع وراها'), hide: st => !st.f.eHarness, cls: 'main', then: [N_('You clip on. You say it out loud, like she taught you. The wind tries to lift you off the iron and can\'t.', 'تشبك. تقولها بصوت عالي، مثل ما علّمتك. والريح تحاول ترفعك من الحديد وما تقدر.'), N_('Together you drag the shutter back and pin it. Out at sea, the boat\'s lights turn towards the harbor. Evelyn hugs you so hard both your harnesses clank.', 'مع بعض تسحبون الغطا وتثبتونه. وبعيد في البحر، أنوار القارب تلف للميناء. وإيفلين تضمك بقوة لدرجة إن حزامينكم يطقون في بعض.'), st => { st.f.eStormNow = false; st.f.eHero = true; addTrust('evelyn', 3); addMood(2); return null; }] },
          { t: T('Go out without clipping on', 'تطلع بدون ما تشبك'), cls: 'risk', then: [{ jump: 'endEveDeath' }] },
          { t: T('Stay inside, like she said', 'تقعد داخل، مثل ما قالت'), then: [N_('You stay, palms flat on the trembling glass. After forever, she comes back in, soaked and laughing like a maniac. "Pinned it! Kevin would be proud!" The boat makes it home.', 'تقعد، وكفوفك على الزجاج اللي يرجف. وبعد دهر، ترجع داخل، مبلولة وتضحك مثل المجنونة. «ثبّته! كيفن بيفخر فيني!» والقارب يوصل البيت.'), st => { st.f.eStormNow = false; return null; }] }
        ] }];
    },
    eveFinale: s => {
      s.f.eFinaleDone = true; s.f.eFinaleNow = true;
      return [{ go: 'lh_living' }, { show: [{ id: 'evelyn', e: 'shock' }] },
        N_('3:07. The laughter starts, and it doesn\'t stop. Ten seconds. Thirty. A minute. Louder. Like it\'s calling.', '٣:٠٧. الضحك يبدأ، وما يوقف. عشر ثواني. ثلاثين. دقيقة. يعلى. كأنه ينادي.'),
        E('shock', 'It\'s never done this. Never. My whole life. Never this long.', 'عمره ما سوى كذا. أبداً. طول عمري. أبداً بهالطول.'),
        E('sad', 'I\'m going up. Tonight. I can\'t do another forty years. With you or without you.', 'بطلع. الليلة. ما أقدر أكمل أربعين سنة ثانية. معك أو بدونك.'),
        st => [{ c: 'evelyn', e: 'sad', menu: [
          { t: T('Take her hand, go up, and tell her what\'s behind the clock', 'تمسك يدها، تطلعون، وتقول لها وش ورا الساعة'), need: x => !!x.f.eMech && !!x.f.eLog && (x.trust.evelyn || 0) >= 6, why: T('You\'d need to know the whole truth, and she\'d need to trust you with it.', 'تحتاج تعرف الحقيقة كاملة، وتحتاج هي تثق فيك فيها.'), hide: x => !x.f.eMech, cls: 'main', then: [{ jump: 'endEvePeace' }] },
          { t: T('Go up with her, and laugh back', 'تطلع معها، وتضحك ترد عليه'), need: x => (x.trust.evelyn || 0) >= 5 && (x.fear || 0) <= 6, why: T('You\'re too frightened, or she doesn\'t trust you enough to share this.', 'أنت خايف زيادة، أو هي ما تثق فيك كفاية تشاركك هذا.'), then: [{ jump: 'endEveStay' }] },
          { t: T('Run', 'تهرب'), cls: 'risk', then: [{ jump: 'endEveFlee' }] }
        ] }]];
    },

    endEvePeace: [{ go: 'lh_attic' }, { show: [{ id: 'evelyn', e: 'sad' }] },
      N_('You open the attic together. The laugh is coming from the wall. You swing the painted clock aside, and she sees the machine, and the tape, and her grandfather\'s handwriting.', 'تفتحون العلية مع بعض. الضحكة طالعة من الجدار. تفتح الساعة المرسومة، وهي تشوف المكينة، والشريط، وخط جدها.'),
      E('sad', 'Oh, Grandad. Oh, you silly, sad old man.', 'آه يا جدي. يا الشايب الحزين الأهبل.'),
      N_('She listens to the end of the tape: a little boy laughing, and then a young man\'s voice, Arthur at nineteen, saying "Again? All right, Toby. Again." Then she presses STOP.', 'تسمع آخر الشريط: ولد صغير يضحك، وبعدين صوت شاب، آرثر بعمر تسعطعش، يقول «مرة ثانية؟ طيب يا توبي. مرة ثانية.» وبعدين تضغط إيقاف.'),
      st => has('postcard') ? [N_('Fifty years paying back something nobody asked him to pay. You think of a postcard in your pocket that was never posted.', 'خمسين سنة يسدد شي ما أحد طالبه فيه. وتتذكر كرت في جيبك ما انرسل أبداً.')] : null, // links.js
      N_('You unscrew the little window together. Cold air, the beam going over. She says goodbye to a great-uncle she never met, and sorry for a grandfather who couldn\'t, and then, for herself, goodnight.', 'تفكون مسامير الشباك الصغير مع بعض. هوا بارد، والشعاع يمر. تودّع عم جدها اللي عمرها ما قابلته، وتعتذر عن جد ما قدر، وبعدين، لنفسها، تقول تصبحين على خير.'),
      N_('The next night, at 3:07, there is silence. Evelyn sleeps through it for the first time in her life. Mostly silence. You could swear that, far out on the water, something laughed once. Happily.', 'الليلة اللي بعدها، الساعة ٣:٠٧، سكوت. وإيفلين تنام وما تصحى لأول مرة في حياتها. سكوت تقريباً. تقدر تحلف إن بعيد على الموية، شي ضحك مرة. مبسوط.'),
      { end: 'EVE_PEACE' }],
    endEveStay: [{ go: 'lh_attic' }, N_('You go up together. In the dark the laugh is everywhere. Evelyn grips your arm. And then, for no reason she can explain, she laughs back.', 'تطلعون مع بعض. بالظلام الضحكة في كل مكان. إيفلين ماسكة ذراعك. وبعدين، بدون سبب تقدر تشرحه، تضحك ترد.'),
      N_('So do you. It\'s ridiculous. Two adults in an attic at three in the morning, laughing at a ghost. It stops at 3:08 like it always does. "Same time tomorrow?" she says to the dark.', 'وأنت بعد. شي سخيف. اثنين كبار في علية الساعة ثلاث الفجر، يضحكون على شبح. ويوقف ٣:٠٨ مثل دايم. «نفس الوقت بكرة؟» تقول للظلام.'),
      N_('You become the assistant keeper of Saltmere Light. You never find out what laughs at 3:07. Every night, the two of you laugh back.', 'تصير مساعد حارس منارة سولتمير. وعمرك ما تعرف وش اللي يضحك الساعة ٣:٠٧. وكل ليلة، أنتم الاثنين تضحكون تردون عليه.'),
      { end: 'EVE_STAY' }],
    endEveFlee: [{ show: [] }, N_('You\'re out of the door before you decide to be. Down the cliff path in the dark, slipping, the beam sweeping over you every ten seconds like it\'s looking for you.', 'أنت برا الباب قبل لا تقرر. تنزل طريق الجرف بالظلام، تتزحلق، والشعاع يمر عليك كل عشر ثواني كأنه يدورك.'),
      N_('You sleep on Sami\'s bench. You never go back for your bag. Evelyn leaves it outside the grocery a week later, with a note: "It\'s all right. Most people run. Gerald says hi."', 'تنام على كرسي سامي. وعمرك ما ترجع تاخذ شنطتك. إيفلين تتركها قدام البقالة بعد أسبوع، ومعها ورقة: «عادي. أغلب الناس يهربون. جيرالد يسلّم.»'),
      N_('For a long time after, you wake at 3:07, wherever you are.', 'لفترة طويلة بعدها، تصحى الساعة ٣:٠٧، وين ما كنت.'),
      st => { st.fear = Math.min(10, (st.fear || 0) + 1); addMood(-1); return null; }, { end: 'EVE_FLEE' }],
    endEveDeath: [N_('You push the door open and the wind takes it out of your hands. You step onto the gallery without clipping on.', 'تدف الباب والريح تاخذه من يدك. وتطلع للشرفة بدون ما تشبك.'),
      N_('For one second you can see everything: Evelyn at the far side, turning, her mouth open; the boat\'s lights; the white water below.', 'لثانية وحدة تشوف كل شي: إيفلين في الطرف الثاني، تلتفت، وفمها مفتوح؛ وأنوار القارب؛ والموية البيضا تحت.'),
      N_('Then the wind lifts you like a hand, very gently, and there is no rail any more.', 'وبعدين الريح ترفعك مثل يد، بلطف مرة، وما يصير فيه درابزين.'),
      N_('Evelyn keeps the lamp every night after that. She doesn\'t sleep through 3:07 again. Neither, some say, do you.', 'إيفلين تحرس الفانوس كل ليلة بعدها. وما تنام عن ٣:٠٧ مرة ثانية. ولا أنت، يقولون بعض الناس.'),
      { end: 'EVE_DEATH' }],
    endEveKick: [E('angry', 'I gave you two rules. Two. I\'m not angry. I\'m... yes, I\'m angry.', 'عطيتك قانونين. اثنين. أنا مو معصبة. أنا... إيه، معصبة.'),
      N_('She walks you to the end of the cliff path in silence, carrying your bag. At the bottom she gives it back and says, not unkindly, "The light\'s always on. Just not for you. Not any more."', 'تمشيك لآخر طريق الجرف بصمت، شايلة شنطتك. وتحت تعطيك إياها وتقول، بدون قسوة: «الضو دايم شغال. بس مو لك. مو بعد الحين.»'),
      { end: 'EVE_KICK' }]
  });

  Object.assign(GAME.END, {
    EVE_PEACE: { who: 'evelyn', title: T('3:08', '٣:٠٨'), after: T('Evelyn\'s chapter is complete.', 'خلص فصل إيفلين.'), lesson: T('Evelyn: some hauntings are just love that never got to say goodbye.', 'إيفلين: بعض الأشباح بس حب ما قدر يودّع.') },
    EVE_STAY: { who: 'evelyn', title: T('The assistant keeper', 'مساعد الحارس'), after: T('Evelyn\'s chapter is complete.', 'خلص فصل إيفلين.'), lesson: T('Evelyn: you don\'t have to understand the dark to stop being alone in it.', 'إيفلين: ما تحتاج تفهم الظلام عشان ما تكون لحالك فيه.') },
    EVE_FLEE: { who: 'evelyn', title: T('Down the cliff path', 'نزول طريق الجرف'), after: T('Evelyn\'s chapter is complete.', 'خلص فصل إيفلين.'), lesson: T('Evelyn: running is allowed. The fear comes with you, though.', 'إيفلين: الهروب مسموح. بس الخوف يجي معك.') },
    EVE_DEATH: { who: 'evelyn', death: true, title: T('The gallery', 'الشرفة'), after: T('You died. The storm was fair: Evelyn told you to clip on, and to stay inside. Load a save to try again.', 'مت. العاصفة كانت عادلة: إيفلين قالت لك تشبك، وتقعد داخل. حمّل حفظ عشان تحاول مرة ثانية.') },
    EVE_KICK: { who: 'evelyn', title: T('Not for you', 'مو لك'), after: T('Evelyn\'s chapter is complete.', 'خلص فصل إيفلين.'), lesson: T('Evelyn: two rules is not a lot to ask.', 'إيفلين: قانونين مو كثير.') }
  });

  GAME.EVENTS.push(
    { id: 'kickEve', when: s => inE(s) && (s.susp.evelyn || 0) >= 3, run: [{ jump: 'endEveKick' }] },
    { id: 'wakeE', when: s => inE(s) && s.f.newDay, run: s => { s.f.newDay = false; s.loc = 'lh_living';
      const out = [{ n: fresh('wakeE', [T('Morning. Evelyn is coming down the tower stairs as you wake up, yawning: "Night, morning person."', 'صبح. إيفلين نازلة من درج البرج وأنت تصحى، تتثاوب: «تصبح على خير، يا اللي تحب الصبح.»'), T('Gulls on the windowsill, staring in. One of them is definitely Kevin.', 'نوارس على حافة الشباك، يطالعون داخل. واحد منهم أكيد كيفن.'), T('The fire has been relit while you slept. A cup of something hot and unidentifiable steams beside you.', 'الدفاية انشبّت وأنت نايم. وكوب شي حار ومجهول يطلع منه بخار جنبك.'), T('Fog against every window. The foghorn calls out, long and low, like something lonely.', 'ضباب على كل شباك. وبوق الضباب ينادي، طويل وواطي، مثل شي وحيد.')]) }];
      if ((s.fear || 0) >= 6) out.push(N_('Your hands are shaking a little. You hold the cup with both of them.', 'يدينك ترجف شوي. تمسك الكوب بالثنتين.'));
      return out; } },
    { id: 'eStorm', once: true, when: s => inE(s) && dE(s) >= 3 && s.slot === 3 && houseOf(s.loc) === 'evelyn', run: s => GAME.SCRIPTS.eveStorm(s) },
    { id: 'eStormEnd', when: s => inE(s) && s.f.eStormNow && s.f.eStormDay !== s.day, run: s => { s.f.eStormNow = false; return [N_('The storm blows itself out overnight. Evelyn is fine. Maya\'s cousin made it home. The gallery shutter is pinned with three of Evelyn\'s scarves.', 'العاصفة تهدى بالليل. إيفلين بخير. وولد عم مايا وصل البيت. وغطا الشرفة مثبت بثلاث من شالات إيفلين.')]; } },
    { id: 'eFinale', when: s => inE(s) && !s.f.eFinaleDone && dE(s) >= 4 && ((s.f.eLaugh || 0) >= 3 || dE(s) >= 6) && s.slot === NIGHT && houseOf(s.loc) === 'evelyn', run: s => GAME.SCRIPTS.eveFinale(s) },
    { id: 'eFinaleCall', when: s => inE(s) && !s.f.eFinaleDone && dE(s) >= 6 && s.slot === NIGHT && houseOf(s.loc) !== 'evelyn', run: s => [N_('Your phone: Evelyn. "Come back. Please. It\'s louder tonight."', 'جوالك: إيفلين. «ارجع. تكفى. أعلى الليلة.»'), { go: 'lh_living' }, st => { st.f.eLaugh = Math.max(3, st.f.eLaugh || 0); return null; }].concat(GAME.SCRIPTS.eveFinale(s)) }
  );

  /* helpers the character files (js/chars/*.js) borrow from this chapter */
  GAME.H.evelyn = { byDay, inE, E, fear };
})();
