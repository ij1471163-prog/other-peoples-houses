/* =====================================================================
   Other People's Houses — the world of Saltmere (v2)
   UI strings, items, quests, characters with daily lives, locations,
   map. Story scripts live in chapter files (elias.js).
   Time slots: 0 morning · 1 noon · 2 afternoon · 3 evening · 4 night.
   Gender markers: {male|female}. Player name: {name}.
   ===================================================================== */
'use strict';

GAME.UI = {
  next: T('Continue ›', 'متابعة ›'), talk: T('Talk to', 'تكلّم'), wait: T('Let time pass', 'خلّ الوقت يمشي'), bye: T('Leave it there', 'خلاص، بس كذا'),
  map: T('Map', 'الخريطة'), phone: T('Phone', 'الجوال'), close: T('Close', 'إغلاق'), private: T('private room', 'غرفة خاصة'), soon: T('soon', 'قريباً'),
  quests: T('Tasks', 'المهام'), people: T('People', 'الناس'), bag: T('Bag', 'الشنطة'), me: T('Me', 'أنا'), settings: T('Settings', 'الإعدادات'),
  noQuests: T('Nothing yet.', 'ولا شي للحين.'), noPeople: T('You haven\'t met anyone yet.', 'ما تعرفت على أحد للحين.'), emptyBag: T('Empty.', 'فاضية.'),
  feel: T('How you feel', 'وش تحس'), money: T('Money', 'الفلوس'), day: T('Day', 'اليوم'), shower: T('Last shower', 'آخر ترويش'), never: T('Not since you arrived', 'من يوم وصلت ولا مرة'), today: T('Today', 'اليوم'), daysAgo: T('days ago', 'أيام'),
  feel0: T('Numb', 'متخدّر'), feel1: T('Heavy', 'ثقيل'), feel2: T('Getting by', 'ماشي الحال'), feel3: T('Lighter', 'أخف'), feel4: T('Awake', 'صاحي من جد'),
  momMsgs: T('Mom · 47 unread · "Just tell me you\'re okay."', 'أمي · ٤٧ رسالة ما انقرت · «بس طمّني عليك.»'),
  soundOn: T('Sound: off · turn on', 'الصوت: مطفي · شغّل'), soundOff: T('Sound: on · turn off', 'الصوت: شغّال · طفّي'), toTitle: T('Save and quit to title', 'احفظ وارجع للبداية'),
  continue: T('Continue', 'كمّل'), newGame: T('New game', 'لعبة جديدة'), ending: T('Ending', 'نهاية'), again: T('Play again', 'العب من جديد'), nextChapter: T('Continue · Chapter 2: Leo', 'كمّل · الفصل الثاني: ليو'),
  download: T('Download the Android app (APK)', 'حمّل تطبيق أندرويد (APK)'), downloadHint: T('Opens the latest release on GitHub', 'يفتح آخر إصدار على GitHub'),
  t_morning: T('Morning', 'الصبح'), t_noon: T('Noon', 'الظهر'), t_afternoon: T('Afternoon', 'العصر'), t_evening: T('Evening', 'المغرب'), t_night: T('Night', 'الليل')
};

GAME.ITEMS = {
  bread: { name: T('Bread', 'خبز'), desc: T('Still warm.', 'لسا دافي.') },
  beans: { name: T('Good coffee', 'قهوة فاخرة'), desc: T('Elias drinks the cheap kind.', 'إلياس يشرب الرخيصة.') },
  fish: { name: T('A fish', 'سمكة'), desc: T('Beginner\'s share.', 'نصيب المبتدئ.') },
  water: { name: T('Water bottle', 'قارورة ماي'), desc: T('From Sami. On the house.', 'من سامي. على حسابه.') },
  postcard: { name: T('Your father\'s postcard', 'كرت أبوك البريدي'), desc: T('Saltmere harbor. "V. — I\'m sorry. — J." 7 March. Never posted.', 'ميناء سولتمير. «ف. — آسف. — ج.» ٧ مارس. ما انرسل.') }
};

GAME.QUESTS = {
  q_bed: { title: T('A place to sleep', 'مكان تنام فيه'), hint: T('Checkout is tomorrow. You have three dollars. Go outside.', 'لازم تطلع من الموتيل بكرة، ومعك ثلاث دولارات. اطلع برا.') },
  q_money: { title: T('Pocket money', 'مصروف'), hint: T('Sami might have work in the afternoons.', 'يمكن عند سامي شغل وقت العصر.') },
  q_care: { title: T('Look after yourself', 'اهتم بنفسك'), hint: T('Shower. Eat something. Small things count when everything feels heavy.', 'تروّش. كل شي. الأشياء الصغيرة تفرق لما يكون كل شي ثقيل.') },
  q_dawn: { title: T('Up before the gulls', 'قبل النوارس'), hint: T('Elias takes his boat out every morning (not Sundays). Meet him at the harbor.', 'إلياس يطلع بقاربه كل صبح (إلا الأحد). الحقه في الميناء.') },
  q_nets: { title: T('Mending', 'الشباك'), hint: T('Afternoons, Elias mends nets in the shed behind the cottage.', 'وقت العصر، إلياس يصلّح الشباك في المخزن ورا البيت.') },
  q_bread: { title: T('Bread for two', 'خبز لاثنين'), hint: T('The bread bin is empty. Buy bread at Sami\'s ($2) and give it to Elias.', 'صندوق الخبز فاضي. اشتر خبز من سامي (٢$) وعطه إلياس.') },
  q_chess: { title: T('The evening game', 'لعبة المغرب'), hint: T('Elias plays chess at Marco\'s café in the evenings.', 'إلياس يلعب شطرنج في مقهى ماركو وقت المغرب.') },
  q_secret: { title: T('What Elias hides', 'وش يخبي إلياس'), hint: T('Something is wrong with Elias. His bedroom is private. Snoop when he\'s busy, and watch out for Martha on Tuesdays and Fridays.', 'فيه شي في إلياس مو طبيعي. غرفته خاصة. فتّش لما يكون مشغول، وانتبه لمارثا يوم الثلاثاء والجمعة.') },
  q_thomas: { title: T('The son', 'الولد'), hint: T('Thomas hasn\'t spoken to his father in eight years.', 'توماس ما كلّم أبوه من ثمان سنين.') },
  q_postcard: { title: T('Who is "V."?', 'مين «ف.»؟'), hint: T('Your father wrote to someone in Saltmere and never posted it. Someone who has lived here a long time might remember him. Show people the postcard.', 'أبوك كتب لأحد في سولتمير وما أرسله. يمكن أحد عايش هنا من زمان يتذكره. ورّي الناس الكرت.') },
  q_final: { title: T('One more night', 'ليلة أخيرة'), hint: T('Elias wants to talk to you tonight, in the living room.', 'إلياس يبي يكلمك الليلة في الصالة.') }
};

/* ---------------- characters' days (the characters themselves are in js/chars/) ---------------- */
const isMarthaDay = s => [2, 5].includes(s.day % 7);

/* who is in the bathroom right now */
function bathOccupant(s) { for (const id of ['elias', 'martha']) { if (GAME.CHAR[id].where(s) === 'bath') return id; } return null; }

/* ---------------- locations ---------------- */
const back = (to, x = 6, y = 86) => ({ to, x, y });
const eliasHome = s => atHouse('elias', 'elias') || !!GAME.CHAR.martha.where(s);
GAME.LOC = {
  station: { name: T('Saltmere Station', 'محطة سولتمير'), bg: 'station', canWait: false },
  motel: {
    name: T('Harbor Motel, room 6', 'موتيل الميناء، غرفة ٦'), bg: 'motel', canWait: false,
    exits: [{ to: 'street', x: 92, y: 50, label: T('Go outside', 'اطلع برا') }],
    spots: [
      { x: 6, y: 47, label: T('Phone', 'الجوال'), run: s => [{ n: T('47 unread messages. 12 missed calls from "Mom".', '٤٧ رسالة ما انقرت. ١٢ مكالمة فايتة من «أمي».') }, { n: T('One from last week: "I\'m sorry about the house. I should have told you. Please let me explain."', 'وحدة من الأسبوع اللي فات: «آسفة على البيت. كان لازم أقولك. خلني أشرح لك.»') }, { n: T('The last one: "Just tell me you\'re okay. That\'s all I want."', 'آخر وحدة: «بس طمّني عليك. ما أبي شي ثاني.»') }, { n: T('You turn the phone face down.', 'تقلب الجوال على وجهه.') }] },
      { x: 72, y: 30, label: T('Window', 'الشباك'), run: s => [{ n: T('A red neon sign buzzes outside: VACANCY. One letter flickers. The sea is out there somewhere, black.', 'لوحة نيون حمرا تطن برا: «غرف شاغرة». حرف منها يرمش. البحر هناك في مكان ما، أسود.') }] },
      { x: 64, y: 64, label: T('Bed', 'السرير'), run: s => [{ n: T('You lie down. Sleep doesn\'t come. The checkout note on the door stares back at you.', 'تتمدد. النوم ما يجي. ورقة الخروج على الباب تطالعك.') }] }
    ]
  },
  street: {
    name: T('Main Street', 'الشارع الرئيسي'), mapName: T('Town square', 'ساحة البلدة'), bg: 'street',
    exits: [
      { to: 'grocery', x: 20, y: 62, lock: s => (s.slot === NIGHT ? T('The shutter is down. Sami\'s is closed for the night.', 'الباب مقفل. بقالة سامي مسكّرة الليل.') : null) },
      { to: 'cafe', x: 85, y: 64, lock: s => (s.slot === NIGHT ? T('Chairs on the tables. Marco\'s is closed.', 'الكراسي فوق الطاولات. مقهى ماركو مسكّر.') : null) },
      { to: 'harbor', x: 50, y: 50, label: T('Down to the harbor', 'انزل للميناء') },
      { to: 'elias_ext', x: 8, y: 86, label: T('Fisher\'s Row', 'شارع الصيادين'), if: s => !!s.f.metElias }
    ],
    spots: [
      { x: 63, y: 57, label: T('Notice board', 'لوحة الإعلانات'), run: s => [{ n: T('A glossy poster: "THE SALTMERE GRAND — luxury seafront living. Fisher\'s Row redevelopment: council vote pending." Someone has written across it in marker: NOT FOR SALE.', 'بوستر لامع: «فندق سولتمير غراند — حياة فاخرة على البحر. تطوير شارع الصيادين: بانتظار تصويت المجلس.» وأحد كاتب عليه بالقلم: «مو للبيع».') }] }
    ]
  },
  grocery: { name: T('Sami\'s Grocery', 'بقالة سامي'), bg: 'grocery', charX: 70, exits: [back('street')],
    spots: [{ x: 25, y: 35, label: T('Shelves', 'الرفوف'), run: s => [{ n: T('Half the shelves are full. The other half have price tags for things that aren\'t there anymore.', 'نص الرفوف مليانة. والنص الثاني عليه أسعار لأشياء ما عادت موجودة.') }] }] },
  cafe: { name: T('Marco\'s Café', 'مقهى ماركو'), bg: 'cafe', charX: 72, exits: [back('street')],
    spots: [{ x: 61, y: 25, label: T('Menu board', 'لوحة القائمة'), run: s => [{ n: T('Under the prices, in chalk: "OPEN MIC — THURSDAYS. (Please come.)"', 'تحت الأسعار، بالطباشير: «ليلة الميكروفون المفتوح — كل خميس. (تكفون تعالوا.)»') }] }] },
  harbor: {
    name: T('The Harbor', 'الميناء'), bg: 'harbor', charX: 40, exits: [back('street')],
    spots: [
      { x: 45, y: 70, label: T('The boat "Ada"', 'القارب «آدا»'), run: s => [{ n: T('A small blue boat, paint peeling, name freshly repainted: ADA. Whoever looks after it loves it more than it loves the sea.', 'قارب أزرق صغير، صبغه مقشّر، بس اسمه مصبوغ جديد: «آدا». اللي يهتم فيه يحبه أكثر من البحر.') }] },
      { x: 80, y: 52, label: T('The boathouse', 'بيت القوارب'), run: s => [{ n: T('Someone lives here. A delivery bike chained outside, gulls painted on the door, music behind it. A sign: "L." The door stays shut.', 'فيه أحد ساكن هنا. دراجة توصيل مربوطة برا، نوارس مرسومة على الباب، وموسيقى من وراه. لوحة صغيرة: «L.» الباب يبقى مقفول.') }, { n: T('(Leo\'s house opens in the next chapter.)', '(بيت ليو ينفتح في الفصل الجاي.)') }] },
      { x: 22, y: 55, label: T('Watch the sea', 'طالع البحر'), run: s => onceToday('sea') ? (addMood(1), [{ n: T('You watch the water for a while. It doesn\'t ask you anything. That helps more than you expected.', 'تطالع الموج شوي. ما يسألك عن شي. وهذا يريحك أكثر من ما توقعت.') }]) : [{ n: T('The sea keeps doing what it does.', 'البحر يكمل اللي يسويه.') }] }
    ]
  },
  elias_ext: {
    name: T('Elias\'s cottage', 'بيت إلياس'), mapName: T('Elias\'s cottage', 'بيت إلياس'), bg: 'elias_ext', rooms: ['living', 'kitchen', 'elias_bed', 'your_room', 'shed', 'bath'],
    exits: [{ to: 'living', x: 50, y: 58, label: T('Front door', 'الباب'), lock: s => (s.f.ended ? T('The cottage is shut. That part of your life has its own ending now.', 'البيت مسكّر. هذاك الجزء من حياتك صار له نهايته.') : null) }, back('street')],
    spots: [{ x: 80, y: 50, label: T('Nets on the wall', 'شباك على الجدار'), run: s => [{ n: T('Nets hung to dry, patched so many times they\'re more patch than net.', 'شباك معلقة تنشف، مرقّعة لدرجة إن الرقع صارت أكثر من الشبكة.') }] }]
  },
  living: {
    name: T('Elias\'s living room', 'صالة إلياس'), bg: 'living', house: 'elias', charX: 48,
    exits: [
      { to: 'elias_ext', x: 93, y: 74, label: T('Front door', 'باب البيت') },
      { to: 'kitchen', x: 6, y: 40, label: T('Kitchen', 'المطبخ') },
      { to: 'your_room', x: 26, y: 22, label: T('Your room', 'غرفتك') },
      { to: 'elias_bed', x: 52, y: 22, label: T('Elias\'s room', 'غرفة إلياس'), risk: s => eliasHome(s) },
      { to: 'bath', x: 76, y: 22, label: T('Bathroom', 'الحمام'), lock: s => GAME.SCRIPTS.bathLock(s) },
      { to: 'shed', x: 96, y: 42, label: T('The shed', 'المخزن') }
    ],
    spots: [
      { x: 18, y: 30, label: T('Photographs', 'صور'), run: s => { s.f.sawPhotos = true; return [{ n: T('A woman laughing on the deck of a boat: Ada. And a boy of nine on Elias\'s shoulders, holding a fish bigger than his arm.', 'امرأة تضحك على سطح قارب: آدا. وولد عمره تسع سنين على كتف إلياس، ماسك سمكة أكبر من ذراعه.') }]; } },
      { x: 73, y: 53, label: T('Radio', 'الراديو'), run: s => [{ n: T('An old radio. It only gets one station, and that station only plays songs older than you.', 'راديو قديم. ما يجيب إلا محطة وحدة، والمحطة ما تشغل إلا أغاني أقدم منك.') }] },
      { x: 87, y: 60, label: T('Telephone', 'الهاتف'), risk: s => s.slot === NIGHT, run: s => GAME.SCRIPTS.phoneSpot(s) }
    ]
  },
  kitchen: {
    name: T('Kitchen', 'المطبخ'), bg: 'kitchen', house: 'elias', exits: [back('living')],
    onEnter: s => { if (!s.quests.q_bread && s.f.metElias) { quest('q_bread', 'active'); return [{ n: T('The bread bin is empty. So is the fruit bowl. A man who lives alone, and has stopped noticing.', 'صندوق الخبز فاضي. وصحن الفواكه بعد. رجل عايش لحاله، ووقف ينتبه.') }]; } return null; },
    spots: [
      { x: 19, y: 25, label: T('Cupboard', 'الدولاب'), risk: s => eliasHome(s), run: s => GAME.SCRIPTS.cupboard(s) },
      { x: 76, y: 40, label: T('Kettle', 'الغلاية'), run: s => onceToday('tea') ? (addMood(1), [{ n: T('You make tea. Two cups, without thinking. You leave one on the table for him.', 'تسوي شاي. كوبين، بدون ما تفكر. وتترك واحد له على الطاولة.') }]) : [{ n: T('The kettle is still warm.', 'الغلاية لسا دافية.') }] },
      { x: 50, y: 64, label: T('Eat something', 'كل شي'), run: s => GAME.SCRIPTS.eat(s) }
    ]
  },
  bath: {
    name: T('Bathroom', 'الحمام'), bg: 'bath', house: 'elias', canWait: false, exits: [back('living')],
    spots: [
      { x: 25, y: 46, label: T('Take a shower', 'تروّش'), run: s => GAME.SCRIPTS.shower(s) },
      { x: 10, y: 26, label: T('Mirror', 'المراية'), run: s => [{ n: s.mood <= 3 ? T('Someone tired looks back at you. You don\'t hold eye contact.', 'واحد تعبان يطالعك. ما تطول النظرة.') : T('Someone looks back at you. They look a bit less tired than last week.', 'واحد يطالعك. شكله أقل تعب من الأسبوع اللي فات.') }] }
    ]
  },
  elias_bed: {
    name: T('Elias\'s bedroom', 'غرفة إلياس'), bg: 'elias_bed', house: 'elias', private: true, exits: [back('living')],
    onEnter: s => GAME.SCRIPTS.enterPrivate(s),
    spots: [
      { x: 30, y: 52, label: T('Dresser drawer', 'درج التسريحة'), risk: s => eliasHome(s), run: s => GAME.SCRIPTS.drawer(s) },
      { x: 63, y: 43, label: T('Photograph', 'صورة'), run: s => [{ n: T('Ada again. Older here, in a garden. On the back, in his handwriting: "Forty-one years. Not enough."', 'آدا مرة ثانية. أكبر بالعمر، في حديقة. ورا الصورة بخطه: «إحدى وأربعين سنة. ما كفّت.»') }] }
    ]
  },
  your_room: {
    name: T('Your room (Thomas\'s room)', 'غرفتك (غرفة توماس)'), bg: 'your_room', house: 'elias', canWait: false, exits: [back('living')],
    spots: [
      { x: 80, y: 60, label: s => (s.slot === NIGHT ? T('Sleep', 'نام') : T('Lie down', 'تمدد')), run: s => GAME.SCRIPTS.bed(s) },
      { x: 76, y: 80, label: T('Box under the bed', 'صندوق تحت السرير'), if: s => s.day >= 2, run: s => { s.f.sawBox = true; return [{ n: T('A shoebox of photographs. Thomas at every age, until about eighteen. Then nothing.', 'علبة جزمة مليانة صور. توماس بكل الأعمار، لين تقريباً ثمنطعش. وبعدها ولا شي.') }, { n: T('The last one: Thomas and Elias on the pier, not looking at each other.', 'آخر صورة: توماس وإلياس على الرصيف، كل واحد يطالع جهة.') }]; } },
      { x: 20, y: 48, label: T('Model ship', 'مجسم سفينة'), run: s => s.f.shipDone ? [{ n: T('The model ship, finished. The last mast is crooked, on purpose.', 'مجسم السفينة، مخلص. وآخر صاري معوج، بقصد.') }] /* links.js */ : [{ n: T('A model ship, half finished. The glue dried years ago. The instructions are still folded under it.', 'مجسم سفينة نصه مخلص. الغرا نشف من سنين. والتعليمات لسا مطوية تحته.') }] }
    ]
  },
  shed: {
    name: T('The shed', 'المخزن'), bg: 'shed', house: 'elias', charX: 40, exits: [back('living')],
    spots: [{ x: 76, y: 40, label: T('Nets', 'الشباك'), run: s => GAME.CHAR.elias.where(s) === 'shed' ? [{ n: T('Elias is working on them. Talk to him if you want to help.', 'إلياس شغال عليها. كلّمه إذا تبي تساعد.') }] : (s.f.netsLearned && onceToday('netsAlone')) ? (addMood(1), (s.f.netsAlone = (s.f.netsAlone || 0) + 1), [{ n: T('You mend a section on your own. Over, under, through, pull. He\'ll notice tomorrow and say nothing, which is how he says thank you.', 'تصلّح جزء لحالك. فوق، تحت، من خلال، اسحب. بكرة بينتبه وما راح يقول شي، وهذي طريقته يقول شكراً.') }]) : [{ n: T('A tangle of rope and knots you don\'t understand yet.', 'حبال وعُقد ما تفهمها للحين.') }] }]
  },
  clinic: { name: T('Saltmere Clinic', 'عيادة سولتمير'), bg: 'clinic', charX: 70, exits: [back('street')] }
};

/* map: real places, plus doors that open in later chapters */
GAME.MAP = [
  { to: 'street' },
  { to: 'grocery', lock: s => s.slot === NIGHT },
  { to: 'cafe', lock: s => s.slot === NIGHT },
  { to: 'harbor' },
  { to: 'elias_ext', if: s => !!s.f.metElias },
  { to: 'clinic', lock: s => s.slot > 2 },
  { to: 'station', lock: () => true, lockMsg: T('No train leaves Saltmere today. There\'s one every morning. It\'ll be there the day you\'re ready.', 'ما فيه قطار يطلع من سولتمير اليوم. فيه قطار كل صبح. بيكون موجود اليوم اللي تكون فيه جاهز.') },
  { place: 'margaret', label: T('Margaret\'s house', 'بيت مارغريت'), msg: T('A neat white house with every curtain closed. A pressed shirt hangs in an upstairs window. (Margaret\'s chapter is coming.)', 'بيت أبيض مرتب، وكل الستاير مسكّرة. وقميص مكوي معلق في شباك فوق. (فصل مارغريت جاي.)') },
  { place: 'hotel', label: T('The Saltmere Grand', 'فندق سولتمير غراند'), msg: T('Marble steps, a doorman, and a smile on every poster. Victor\'s hotel. (Victor\'s chapter is coming.)', 'درج رخام، وبواب، وابتسامة على كل بوستر. فندق فيكتور. (فصل فيكتور جاي.)') },
  { place: 'lighthouse', label: T('The lighthouse', 'المنارة'), msg: T('The old keeper\'s house at the foot of the lighthouse. Someone inside laughs at 3:07 every night. (Evelyn\'s chapter is coming.)', 'بيت الحارس القديم تحت المنارة. أحد داخله يضحك الساعة ٣:٠٧ كل ليلة. (فصل إيفلين جاي.)') },
  { place: 'motel', soon: false, label: T('Harbor Motel', 'موتيل الميناء'), msg: T('Your old room. Someone else\'s now. The V in VACANCY still flickers.', 'غرفتك القديمة. صارت لغيرك. وحرف «غرف شاغرة» لسا يرمش.') }
];
