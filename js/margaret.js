/* =====================================================================
   Chapter — Margaret (40), the white house on Cliff Road.
   Her son Daniel died two years ago. Every curtain is closed, his room
   is kept exactly as it was, and dinner is laid for three. Tragic,
   with a slow psychological chill. Nora (her sister) visits.
   ===================================================================== */
'use strict';
(function () {
  const M = (e, en, ar) => ({ c: 'margaret', e, t: T(en, ar) });
  const NR = (e, en, ar) => ({ c: 'nora', e, t: T(en, ar) });
  const LE = (e, en, ar) => ({ c: 'leo', e, t: T(en, ar) });
  const inM = s => s.host === 'margaret';
  const dM = s => s.day - (s.f.margDay || 0);
  const HOUSE = ['marg_living', 'marg_kitchen', 'marg_guest', 'marg_bed', 'dan_room', 'marg_bath'];
  const mHome = s => { const w = GAME.CHAR.margaret.where(s); return !!w && HOUSE.includes(w); };
  const byDay = (s, a) => a[s.day % a.length];
  const danPath = s => (s.f.mWore ? 1 : 0) + (s.f.mAnswered ? 1 : 0) + (s.f.mGoodnight ? 1 : 0);

  /* this chapter's people live in js/chars/<id>.js */

  Object.assign(GAME.ITEMS, {
    pillsM: { name: T('Unlabeled pill bottle', 'علبة حبوب بدون اسم'), desc: T('From Margaret\'s bathroom. No pharmacy label. Just a gold "G".', 'من حمام مارغريت. بدون ملصق صيدلية. بس حرف «G» ذهبي.') },
    dkey: { name: T('Small key marked "D"', 'مفتاح صغير عليه «D»'), desc: T('From Margaret\'s dresser.', 'من تسريحة مارغريت.') },
    danLetter: { name: T('Daniel\'s card', 'بطاقة دانيال'), desc: T('A birthday card he wrote and never gave.', 'بطاقة عيد ميلاد كتبها وما عطاها.') }
  });
  Object.assign(GAME.QUESTS, {
    q_m_room: { title: T('Dinner at seven', 'العشا الساعة سبعة'), hint: T('The rent at Margaret\'s is one thing: eat dinner with her in the kitchen every evening.', 'الإيجار عند مارغريت شي واحد: {تتعشى|تتعشين} معها في المطبخ كل مغرب.') },
    q_m_garden: { title: T('A garden nobody looks at', 'حديقة محد يطالعها'), hint: T('The front garden on Cliff Road is going wild. Mornings and noons, you could help.', 'الحديقة الأمامية في شارع الجرف قاعدة تخرب. الصبح والظهر، {تقدر تساعد|تقدرين تساعدين}.') },
    q_m_pills: { title: T('The gold "G"', 'حرف «G» الذهبي'), hint: T('Margaret takes pills from a bottle with no label. Dr. Irene would know what they are.', 'مارغريت تاخذ حبوب من علبة بدون ملصق. الدكتورة إيرين بتعرف وش هي.') },
    q_m_room2: { title: T('The locked room', 'الغرفة المقفولة'), hint: T('Daniel\'s room is locked by day. Margaret sits in it every night.', 'غرفة دانيال مقفولة بالنهار. ومارغريت تقعد فيها كل ليلة.') },
    q_m_final: { title: T('Seven o\'clock', 'الساعة سبعة'), hint: T('Margaret has asked you to be at dinner tonight. She says it matters.', 'مارغريت طلبت {تكون|تكونين} على العشا الليلة. تقول إنه مهم.') }
  });

  /* ---------- places ---------- */
  const doorLock = s => {
    if (inM(s)) return null;
    if (s.done.margaret) return T('The curtains are open now, or the house is empty. Either way, that part of your life has its ending.', 'الستاير صارت مفتوحة، أو البيت فاضي. على كل حال، هذاك الجزء من حياتك صار له نهايته.');
    if (s.host) return T('You\'re staying with someone else right now.', '{أنت ساكن|أنتِ ساكنة} عند أحد ثاني الحين.');
    if (!s.f.leoEnded) return T('Nobody answers. A curtain twitches upstairs, then goes still.', 'محد يرد. ستارة فوق تتحرك، وبعدين توقف.');
    if (s.slot === NIGHT) return T('It\'s too late to knock on a stranger\'s door.', 'الوقت متأخر {تطق|تطقين} باب أحد ما {تعرفه|تعرفينه}.');
    return [{ jump: 'margStart' }];
  };
  Object.assign(GAME.LOC, {
    cliff_road: {
      name: T('Cliff Road, number 7', 'شارع الجرف، رقم ٧'), mapName: T('Margaret\'s house', 'بيت مارغريت'), bg: 'cliff_road', charX: 70, rooms: HOUSE,
      exits: [{ to: 'marg_living', x: 46, y: 50, label: T('Front door', 'الباب'), lock: doorLock }, { to: 'street', x: 6, y: 86, label: T('Back to town', '{ارجع|ارجعي} للبلدة') }],
      spots: [
        { x: 18, y: 66, label: T('The garden', 'الحديقة'), run: s => GAME.SCRIPTS.margGarden(s) },
        { x: 67, y: 55, label: T('Postbox', 'صندوق البريد'), run: s => [N_('Two letters. One for Margaret Hart. One for Daniel Hart: a bank offering him a student card. Two years late.', 'رسالتين. وحدة لمارغريت هارت. ووحدة لدانيال هارت: بنك يعرض عليه بطاقة طالب. متأخرة سنتين.')] }
      ]
    },
    marg_living: {
      name: T('Margaret\'s sitting room', 'صالة مارغريت'), bg: 'marg_living', house: 'margaret', charX: 56,
      exits: [
        { to: 'cliff_road', x: 94, y: 76, label: T('Front door', 'باب البيت') },
        { to: 'marg_kitchen', x: 6, y: 50, label: T('Kitchen', 'المطبخ') },
        { to: 'marg_guest', x: 24, y: 18, label: T('Your room', 'غرفتك') },
        { to: 'marg_bath', x: 38, y: 18, label: T('Bathroom', 'الحمام'), lock: s => GAME.SCRIPTS.margBathLock(s) },
        { to: 'marg_bed', x: 68, y: 18, label: T('Margaret\'s room', 'غرفة مارغريت'), risk: s => mHome(s) },
        { to: 'dan_room', x: 84, y: 18, label: T('Daniel\'s room', 'غرفة دانيال'), risk: s => mHome(s), lock: s => GAME.SCRIPTS.danLock(s) }
      ],
      spots: [
        { x: 18, y: 30, label: T('Portrait', 'الصورة'), run: s => [N_('A boy of about seventeen in a school blazer, grinning like he\'s just got away with something. The glass has been cleaned so often it\'s gone cloudy at the edges.', 'ولد عمره تقريباً سبعطعش بجاكيت المدرسة، يبتسم كأنه توه نفد من شي. الزجاج انمسح كثير لدرجة إن أطرافه صارت مغبشة.')] },
        { x: 60, y: 28, label: T('The clock', 'الساعة'), run: s => [N_('Stopped at seven. Dinner time. Margaret winds every other clock in the house; never this one.', 'واقفة على سبعة. وقت العشا. مارغريت تعبّي كل ساعة في البيت؛ إلا هذي.')] },
        { x: 80, y: 60, label: T('Help with the ironing', '{تساعد|تساعدين} في الكوي'), if: s => inM(s) && GAME.CHAR.margaret.where(s) === 'marg_living' && !doneToday('mIron'), cls: 'main', run: s => GAME.SCRIPTS.margIron(s) },
        { x: 40, y: 40, label: T('Open the curtains', '{تفتح|تفتحين} الستارة'), if: s => inM(s) && !s.f.mCurtains, run: s => GAME.SCRIPTS.margCurtain(s) }
      ]
    },
    marg_kitchen: {
      name: T('Margaret\'s kitchen', 'مطبخ مارغريت'), bg: 'marg_kitchen', house: 'margaret', charX: 48, exits: [back('marg_living')],
      spots: [
        { x: 66, y: 56, label: T('The third plate', 'الصحن الثالث'), run: s => [{ n: fresh('m3rd', [T('The third plate is always the blue one. Nobody sits there. The fork is turned the way left-handed people like it.', 'الصحن الثالث دايم الأزرق. محد يجلس عنده. والشوكة مقلوبة مثل ما يحبها الأعسر.'), T('There\'s a glass of orange squash by the third plate. Every night. Every night it goes flat and gets poured away.', 'فيه كاسة عصير برتقال جنب الصحن الثالث. كل ليلة. وكل ليلة تفسد وتنكب.')]) }] },
        { x: 30, y: 56, label: T('Eat something', '{كل|كلي} شي'), run: s => GAME.SCRIPTS.eat(s) },
        { x: 88, y: 46, label: T('Fridge notes', 'أوراق الثلاجة'), run: s => [N_('Lists in neat handwriting: "milk, bread, D\'s squash, call Nora back (don\'t)". And an old one, curling: "MUM — football till 6, love you, D".', 'قوايم بخط مرتب: «حليب، خبز، عصير د، أرد على نورا (لا)». وورقة قديمة، ملفوفة: «ماما — كورة لين ٦، أحبك، د».')] }
      ]
    },
    marg_guest: {
      name: T('The spare room', 'الغرفة الزايدة'), bg: 'marg_guest', house: 'margaret', canWait: false, exits: [back('marg_living')],
      spots: [
        { x: 24, y: 58, label: s => (s.slot === NIGHT ? T('Sleep', '{نام|نامي}') : T('Lie down', '{تمدد|تمددي}')), run: s => GAME.SCRIPTS.bed(s) },
        { x: 64, y: 40, label: T('Wardrobe', 'الدولاب'), run: s => [N_(s.f.mWore ? 'Daniel\'s clothes hang next to yours now. You can\'t always tell which are which.' : 'Your one bag of clothes, and a row of empty hangers she must have bought for you. New. Still with the tags.', s.f.mWore ? 'ملابس دانيال معلقة جنب ملابسك الحين. أحياناً ما {تعرف|تعرفين} أيها حقك.' : 'شنطة ملابسك الوحيدة، وصف علاقات فاضية لازم إنها اشترتها لك. جديدة. لسا عليها السعر.')] },
        { x: 50, y: 26, label: T('Window', 'الشباك'), run: s => [N_('The only open curtain in the house. You opened it. Every morning you find it closed again.', 'الستارة الوحيدة المفتوحة في البيت. {أنت فتحتها|أنتِ فتحتيها}. وكل صبح {تلقاها|تلقينها} مسكّرة.')] }
      ]
    },
    marg_bath: {
      name: T('Bathroom', 'الحمام'), bg: 'marg_bath', house: 'margaret', canWait: false, exits: [back('marg_living')],
      spots: [
        { x: 18, y: 46, label: T('Take a shower', '{تروّش|تروّشي}'), run: s => GAME.SCRIPTS.shower(s) },
        { x: 84, y: 26, label: T('Mirror', 'المراية'), run: s => [{ n: s.f.mWore ? T('Someone in Daniel\'s jumper looks back at you. For half a second, you don\'t know who.', '{واحد لابس كنزة دانيال يطالعك|وحدة لابسة كنزة دانيال تطالعك}. لنص ثانية، ما {تعرف|تعرفين} مين.') : T('A tired face. Yours. You check, just to be sure.', 'وجه تعبان. وجهك. {تتأكد|تتأكدين}، بس عشان {تتأكد|تتأكدين}.') }] },
        { x: 88, y: 66, label: T('Medicine cabinet', 'دولاب الأدوية'), risk: s => mHome(s), run: s => GAME.SCRIPTS.margCabinet(s) }
      ]
    },
    marg_bed: {
      name: T('Margaret\'s bedroom', 'غرفة مارغريت'), bg: 'marg_bed', house: 'margaret', private: true, exits: [back('marg_living')],
      onEnter: s => GAME.SCRIPTS.margEnter(s, 'marg_bed'),
      spots: [
        { x: 92, y: 56, label: T('Dresser', 'التسريحة'), risk: s => mHome(s), run: s => GAME.SCRIPTS.margDresser(s) },
        { x: 82, y: 22, label: T('Photographs', 'الصور'), run: s => [N_('A wedding photo, the husband cut out with scissors, neatly. And Daniel at every age, in order, like a timeline that stops.', 'صورة زواج، والزوج مقصوص منها بالمقص، بترتيب. ودانيال بكل الأعمار، بالترتيب، مثل خط زمني يوقف فجأة.')] }
      ]
    },
    dan_room: {
      name: T('Daniel\'s room', 'غرفة دانيال'), bg: 'dan_room', house: 'margaret', private: true, exits: [back('marg_living')],
      onEnter: s => GAME.SCRIPTS.margEnter(s, 'dan_room'),
      spots: [
        { x: 18, y: 50, label: T('His desk', 'مكتبه'), risk: s => mHome(s), run: s => GAME.SCRIPTS.danDesk(s) },
        { x: 58, y: 54, label: T('Guitar', 'القيتار'), run: s => [N_('A cheap guitar with one string replaced and five left to rot. A sticker on it: "PROPERTY OF D. HART & L. (half)".', 'قيتار رخيص فيه وتر واحد متغير وخمسة متروكة تخرب. ستيكر عليه: «ملك د. هارت و L. (النص)».'), st => { st.f.mSawL = true; return null; }] },
        { x: 90, y: 30, label: T('School shirt', 'قميص المدرسة'), run: s => [N_('Ironed. Hung on the door. Ready for a Monday that is never coming. It smells of fabric softener, not of anyone.', 'مكوي. معلق على الباب. جاهز ليوم إثنين ما راح يجي. ريحته منعّم ملابس، مو ريحة أحد.')] }
      ]
    }
  });
  GAME.MAP.forEach(p => { if (p.place === 'margaret' && !p.to) p.if = s => !s.f.leoEnded; });
  GAME.MAP.push({ to: 'cliff_road', place: 'margaret', if: s => !!s.f.leoEnded });
  GAME.LOC.street.exits.push({ to: 'cliff_road', x: 34, y: 40, label: T('Cliff Road', 'شارع الجرف'), if: s => !!s.f.leoEnded });

  /* ---------- scripts ---------- */
  const startCommon = st => { st.host = 'margaret'; st.f.metMarg = true; st.met.margaret = true; st.f.margDay = st.day; st.trust.margaret = st.trust.margaret || 0; st.susp.margaret = 0; st.ch = Math.max(st.ch, 3); quest('q_m_room', 'active'); quest('q_m_garden', 'active'); if (st.quests.q_doors) quest('q_doors', 'active'); return null; };
  Object.assign(GAME.SCRIPTS, {
    margStart: s => [{ go: 'cliff_road' }, { show: [{ id: 'margaret', e: 'shock' }] },
      N_('You knock. A long pause. Then three locks, one after another.', '{تطق|تطقين}. سكوت طويل. وبعدين ثلاث أقفال، واحد ورا الثاني.'),
      M('shock', 'Oh.', 'أوه.'),
      N_('She looks at you the way people look at a photograph they thought they\'d lost.', 'تطالعك مثل ما الناس يطالعون صورة حسبوها ضاعت.'),
      M('neutral', 'Sorry. You\'re about his size. That\'s all. What can I do for you?', 'آسفة. {أنت|أنتِ} تقريباً بمقاسه. بس كذا. وش أقدر أسوي لك؟'),
      { c: 'margaret', e: 'neutral', menu: [
        { t: T('"Sami said you might have a room."', '«سامي قال يمكن عندك غرفة.»'), then: [] },
        { t: T('"I\'m new in town. I\'m looking for somewhere to stay."', '«أنا {جديد|جديدة} في البلدة. أدور مكان أسكن فيه.»'), then: [] }
      ] },
      M('neutral', 'I have a spare room. Clean sheets. Hot water. The rent is one thing only.', 'عندي غرفة زايدة. شراشف نظيفة. موية حارة. والإيجار شي واحد بس.'),
      M('sad', 'You eat dinner with me. Seven o\'clock. Every night. The house is too quiet at seven.', '{تتعشى|تتعشين} معي. الساعة سبعة. كل ليلة. البيت ساكت مرة الساعة سبعة.'),
      { menu: [
        { t: T('"Deal."', '«اتفقنا.»'), cls: 'main', then: [startCommon, { go: 'marg_living' }, { show: [{ id: 'margaret', e: 'smile' }] }, N_('Inside it\'s spotless and dim. Every curtain closed. A clock stopped at seven. A portrait of a grinning boy over the fireplace.', 'داخل نظيف مرة ومعتم. كل الستاير مسكّرة. ساعة واقفة على سبعة. وصورة ولد يبتسم فوق الدفاية.'), M('smile', 'Your room is upstairs on the left. The one on the right stays closed. That\'s the only rule.', 'غرفتك فوق على اليسار. اللي على اليمين تبقى مسكّرة. هذا القانون الوحيد.'), { show: [] }] },
        { t: T('"Let me think about it."', '«خليني أفكر.»'), then: [M('neutral', 'Of course. The door\'s here. It isn\'t going anywhere. Neither am I.', 'أكيد. الباب هنا. ما راح يروح مكان. ولا أنا.'), { go: 'street' }] }
      ] }],
    margStartTruth: s => [{ go: 'cliff_road' }, { show: [{ id: 'leo', e: 'sad' }, { id: 'margaret', e: 'shock' }] },
      M('shock', 'Leo.', 'ليو.'),
      LE('sad', 'Mrs Hart. I was in the car. I\'ve never told you what that night was like. I think you should know. And I think I should be the one.', 'يا مدام هارت. أنا كنت في السيارة. عمري ما قلت لك كيف كانت هذيك الليلة. وأحس لازم تعرفين. وأحس لازم أكون أنا اللي أقول.'),
      N_('For a long moment nobody moves. Then Margaret stands aside and holds the door open.', 'لحظة طويلة محد يتحرك. وبعدين مارغريت توخر وتمسك الباب مفتوح.'),
      { go: 'marg_living' }, { show: [{ id: 'leo', e: 'sad' }, { id: 'margaret', e: 'sad' }] },
      N_('Leo talks for an hour. The concert. The music. "Faster". The wet road. You sit on the stairs and listen to Margaret not interrupting.', 'ليو يتكلم ساعة. الحفلة. الأغاني. «أسرع». والطريق المبلول. {وأنت جالس|وأنتِ جالسة} على الدرج {تسمع|تسمعين} مارغريت وهي ما تقاطعه.'),
      M('sad', 'He was laughing? At the end, before. He was laughing?', 'كان يضحك؟ بالآخر، قبل. كان يضحك؟'),
      LE('sad', 'He was singing. Badly. He always sang badly.', 'كان يغني. بشكل سيء. دايم كان يغني بشكل سيء.'),
      N_('Leo leaves. Margaret watches him go down Cliff Road, and then looks at you.', 'ليو يمشي. ومارغريت تطالعه وهو ينزل شارع الجرف، وبعدين تطالعك.'),
      M('sad', 'You were with him through all that. Stay. I have a spare room. I need someone in this house who knows.', '{كنت|كنتي} معه في كل هذا. {اقعد|اقعدي}. عندي غرفة زايدة. أحتاج أحد في هالبيت يعرف.'),
      st => { startCommon(st); st.f.margTruth = true; st.f.knowsDaniel = true; addTrust('margaret', 2); return null; }, { show: [] },
      N_('The rent, she says, is dinner at seven. Every night.', 'والإيجار، تقول، عشا الساعة سبعة. كل ليلة.')],

    margGarden: s => {
      if (!inM(s)) return [N_('Roses gone wild, lavender gone woody, a gnome face-down in the bed. Someone used to love this garden.', 'ورد صاير بري، ولافندر صاير خشب، وقزم حديقة طايح على وجهه. أحد كان يحب هالحديقة مرة.')];
      if (s.slot > 1) return [N_('Too late in the day to start. Mornings and noons are better.', 'تأخر الوقت على البداية. الصبح والظهر أحسن.')];
      if (!onceToday('mGarden')) return [N_('You\'ve done enough for today. The roses will still be wild tomorrow.', '{سويت|سويتي} كفاية اليوم. الورد بيظل بري بكرة.')];
      s.f.mGarden = (s.f.mGarden || 0) + 1; advance(1); rest(-10); addMood(1); if (s.f.mGarden <= 3) addTrust('margaret', 1);
      if (s.f.mGarden === 3) quest('q_m_garden', 'done');
      return [{ n: fresh('mGard', [T('You pull weeds for an hour. A gnome turns out to be wearing a tiny football shirt. You stand him back up.', '{تقلع|تقلعين} الحشيش ساعة. يطلع قزم الحديقة لابس فانيلة كورة صغيرة. {ترجعه|ترجعينه} واقف.'), T('You cut back the roses. When you look up, a curtain upstairs has moved an inch. Margaret, watching.', '{تقص|تقصين} الورد. ولما {ترفع|ترفعين} راسك، ستارة فوق تحركت إنش. مارغريت، تطالع.'), T('Under the lavender you find a plastic dinosaur, sun-bleached. You put it on the windowsill. The next day it\'s gone, and the day after, it\'s back, washed.', 'تحت اللافندر {تلقى|تلقين} ديناصور بلاستيك، باهت من الشمس. {تحطه|تحطينه} على حافة الشباك. اليوم اللي بعده يختفي، واللي بعده يرجع، مغسول.'), T('You plant marigolds Sami gave you for free. "For the white house," he said, not looking at you.', '{تزرع|تزرعين} زهور القطيفة اللي عطاك سامي ببلاش. «للبيت الأبيض،» قال، وهو ما يطالعك.')]) }];
    },
    margIron: s => { onceToday('mIron'); advance(1); s.f.mIron = (s.f.mIron || 0) + 1; if (s.f.mIron <= 2) addTrust('margaret', 1);
      return [M('neutral', 'Collar first. Then the yoke, then the sleeves, then the body. Daniel never did it in the right order. Daniel never did it at all.', 'الياقة أول. بعدين الكتف، بعدين الأكمام، بعدين الجسم. دانيال عمره ما سواها بالترتيب. دانيال عمره ما سواها أصلاً.'),
        s.f.mIron === 1 ? N_('You iron in silence. It\'s the most relaxed you\'ve seen her. Her hands know exactly what to do, and that seems to be a mercy.', 'تكوون بصمت. هذا أريح شي {شفتها|شفتيها} فيه. يدينها تعرف بالضبط وش تسوي، وكأن هذا رحمة.') : N_('She tells you about the time he ironed a shirt with the iron set to "linen" and wore the scorch mark to school as "a fashion choice". She laughs, and then looks surprised that she did.', 'تقول لك عن المرة اللي كوى فيها قميص والمكوى على «كتان» ولبس الحرق للمدرسة وقال «ستايل». تضحك، وبعدين تستغرب إنها ضحكت.')]; },
    margCurtain: s => { s.f.mCurtTry = (s.f.mCurtTry || 0) + 1;
      if ((s.trust.margaret || 0) < 6 || !s.f.pillsDone) return [N_('You pull the curtain back. Daylight floods the sitting room, and the portrait\'s glass flashes white.', '{تسحب|تسحبين} الستارة. ضو النهار يغرق الصالة، وزجاج الصورة يلمع أبيض.'), mHome(s) ? M('shock', 'Close it. Close it, please, it fades the photographs.', '{سكّرها|سكّريها}. {سكّرها|سكّريها} {تكفى|تكفين}، تبهّت الصور.') : N_('When you come back later, it\'s closed again.', 'ولما {ترجع|ترجعين} بعدين، {تلقاها|تلقينها} مسكّرة.'), st => { if (mHome(st)) addTrust('margaret', -1); return null; }];
      return [N_('You pull the curtain back. Margaret watches, and doesn\'t stop you. She just stands in the light, blinking, like someone who\'s been underwater.', '{تسحب|تسحبين} الستارة. مارغريت تطالع، وما توقفك. بس توقف في الضو، ترمش، مثل أحد كان تحت الموية.'), st => { st.f.mCurtains = true; addMood(1); return null; }]; },
    margBathLock: s => {
      if (GAME.CHAR.margaret.where(s) !== 'marg_bath') return null;
      return [{ n: fresh('mBath', [T('Locked. The shower is running, and under it Margaret is talking quietly. Two voices\' worth of conversation, one voice.', 'مقفول. الدش شغال، وتحته مارغريت تتكلم بصوت واطي. سالفة حقت شخصين، بصوت واحد.'), T('Locked. "One minute!" A tap runs, stops. The extractor fan rattles like it has opinions.', 'مقفول. «دقيقة!» حنفية تشتغل وتوقف. والشفاط يطقطق كأن عنده رأي.'), T('Locked. Her voice, cheerful and too bright: "Just finishing! Help yourself to toast!"', 'مقفول. صوتها، مرح ولامع زيادة: «بخلّص الحين! {كل|كلي} توست!»')]) }];
    },
    danLock: s => {
      const w = GAME.CHAR.margaret.where(s);
      if (w === 'dan_room') return null; // she's in there: you can open it, at your own risk
      if (has('dkey') || s.f.mRoomOpen) return null;
      quest('q_m_room2', 'active');
      return [N_('Locked. A sticker on the door at the height of a ten-year-old: "KEEP OUT (this means MUM)".', 'مقفول. ستيكر على الباب بطول ولد عمره عشر سنين: «ممنوع الدخول (يعني ماما)».')];
    },
    margRisk: (s, extra = 0) => { const w = GAME.CHAR.margaret.where(s); const p = ({ marg_living: 0.35, marg_kitchen: 0.25, marg_bath: 0.12, dan_room: 0.5, marg_bed: 0.6 })[w] ?? 0.05; return clamp(p + extra, 0.02, 0.85); },
    margCaught: s => {
      addSusp('margaret', 1); addTrust('margaret', -1);
      const n = s.susp.margaret || 0;
      if (n >= 3) return [{ show: [{ id: 'margaret', e: 'angry' }] }, { jump: 'endMargKick' }];
      return [{ show: [{ id: 'margaret', e: n === 1 ? 'shock' : 'angry' }] },
        n === 1 ? M('shock', 'What are you doing in here? These are my things. These are HIS things.', 'وش {تسوي|تسوين} هنا؟ هذي أغراضي. هذي أغراضه هو.') : M('angry', 'I gave you a room and a seat at my table. I asked for one door. One.', 'عطيتك غرفة ومكان على سفرتي. وطلبت باب واحد. واحد.'),
        { go: 'marg_living' }];
    },
    margEnter: (s, room) => {
      const w = GAME.CHAR.margaret.where(s);
      if (room === 'dan_room' && w === 'dan_room') return [{ jump: 'margNightRoom' }];
      if (w === room) return [N_('She\'s in here.', 'هي هنا.'), { jump: 'margCaught' }];
      if (roll(GAME.SCRIPTS.margRisk(s, -0.15))) return [N_('A stair creaks behind you.', 'درجة تطق وراك.'), { jump: 'margCaught' }];
      if (room === 'dan_room' && !s.f.mRoomSeen) { s.f.mRoomSeen = true; return [N_('It smells of fabric softener and nothing else. The bed is made with hospital corners. A teenager\'s room, cleaned every day for two years.', 'ريحتها منعّم ملابس ولا شي غيره. السرير مرتب ترتيب مستشفى. غرفة مراهق، تنظفت كل يوم لمدة سنتين.')]; }
      return null;
    },
    margNightRoom: s => {
      if (s.f.mNightRoom) return [N_('She\'s on his bed again, talking to the dark. You close the door softly. She doesn\'t notice.', 'هي على سريره مرة ثانية، تكلم الظلام. {تسكّر|تسكّرين} الباب بهدوء. ما تنتبه.'), { go: 'marg_living' }];
      s.f.mNightRoom = true; addMood(-1); s.fear = (s.fear || 0) + 1;
      return [{ show: [{ id: 'margaret', e: 'sad' }] },
        N_('Margaret is sitting on Daniel\'s bed in the dark, facing the empty desk chair.', 'مارغريت جالسة على سرير دانيال بالظلام، ووجهها على كرسي المكتب الفاضي.'),
        M('sad', '...and Nora says I should sell the house, can you imagine. No, I didn\'t tell her you\'re back. She wouldn\'t understand.', '...ونورا تقول لازم أبيع البيت، تتخيل. لا، ما قلت لها إنك رجعت. ما بتفهم.'),
        N_('She pauses, listening to nothing, and laughs softly, as if at a joke.', 'توقف، تسمع ولا شي، وتضحك بشويش، كأنها سمعت نكتة.'),
        M('shock', 'Oh! Goodness. You gave me a fright. I was just... tidying. Go back to bed, love.', 'أوه! يا ربي. خرعتني. كنت بس... أرتب. {ارجع نام|ارجعي نامي} يا عمري.'),
        { go: 'marg_guest' }];
    },
    margCabinet: s => {
      if (roll(GAME.SCRIPTS.margRisk(s, -0.1))) return [N_('The cabinet hinge squeals.', 'مفصلة الدولاب تصيح.'), { jump: 'margCaught' }];
      if (s.f.mPills) return [N_('Plasters, cough syrup, her real prescription from Dr. Irene, half used. And the space where the gold "G" bottle was.', 'لزقات، شراب كحة، ووصفتها الحقيقية من الدكتورة إيرين، نصها مستخدم. والمكان اللي كانت فيه علبة «G» الذهبية.')];
      s.f.mPills = true; give('pillsM'); quest('q_m_pills', 'active');
      return [N_('Plasters. Cough syrup. Sleeping tablets from Dr. Irene, properly labeled, barely touched.', 'لزقات. شراب كحة. حبوب نوم من الدكتورة إيرين، عليها ملصق صحيح، وبالكاد انلمست.'),
        N_('And behind them, a heavy brown bottle with no label at all. Just a gold "G" on the cap. Half empty. You pocket it before you can think.', 'ووراها علبة بنية ثقيلة بدون أي ملصق. بس حرف «G» ذهبي على الغطا. نصها فاضي. {تحطها|تحطينها} في جيبك قبل لا {تفكر|تفكرين}.')];
    },
    margDresser: s => {
      if (roll(GAME.SCRIPTS.margRisk(s))) return [N_('You\'re sliding the drawer open when she says your name from the doorway.', '{أنت تفتح|أنتِ تفتحين} الدرج لما تقول اسمك من عند الباب.'), { jump: 'margCaught' }];
      if (has('dkey')) return [N_('Scarves, letters from the bank, a hospital wristband with "HART, D." on it. You close the drawer.', 'شالات، رسايل من البنك، وسوار مستشفى عليه «هارت، د.». {تسكّر|تسكّرين} الدرج.')];
      give('dkey'); quest('q_m_room2', 'active');
      return [N_('Under neatly folded scarves: a hospital wristband, "HART, D.", and a small brass key on a ribbon, marked "D".', 'تحت شالات مطوية بترتيب: سوار مستشفى، «هارت، د.»، ومفتاح نحاس صغير على شريطة، عليه «D».')];
    },
    danDesk: s => {
      if (roll(GAME.SCRIPTS.margRisk(s, 0.05))) return [N_('Downstairs, the front door opens.', 'تحت، الباب الأمامي ينفتح.'), { jump: 'margCaught' }];
      if (s.f.danLetter) return [N_('Revision notes, a guitar tab for a song you half know, a sticker sheet of dinosaurs.', 'ملخصات مذاكرة، ونوتة قيتار لأغنية {تعرفها|تعرفينها} نص معرفة، وورقة ستيكرات ديناصورات.')];
      s.f.danLetter = true; give('danLetter'); s.f.knowsDaniel = true;
      return [N_('In the drawer, under revision notes: a birthday card, never posted. "HAPPY BIRTHDAY MUM!"', 'في الدرج، تحت ملخصات المذاكرة: بطاقة عيد ميلاد، ما انرسلت أبداً. «كل عام وأنتِ بخير يا ماما!»'),
        N_('Inside, in a teenager\'s scrawl: "Sorry I\'m rubbish at saying stuff. You\'re the best person I know. Please open the curtains sometimes, it\'s like living in a cave. Love you. D. (Leo says hi.)"', 'داخلها، بخط مراهق: «آسف إني ما أعرف أقول أشياء. أنتِ أحسن شخص أعرفه. تكفين افتحي الستاير أحياناً، كأننا ساكنين في كهف. أحبك. د. (ليو يسلّم.)»'),
        N_('Her birthday was three weeks after the accident.', 'عيد ميلادها كان بعد الحادث بثلاث أسابيع.')];
    },

    /* ----- dinner: the rent ----- */
    margDinner: s => {
      onceToday('mDinner'); feed(50); s.f.mDinners = (s.f.mDinners || 0) + 1; if (s.f.mDinners <= 3) addTrust('margaret', 1); addMood(1);
      if (s.f.mDinners >= 3) quest('q_m_room', 'done');
      const d = s.f.mDinners;
      if (d === 1) return [N_('Roast chicken, potatoes, peas. Three plates. She serves the third one too, full, and doesn\'t explain.', 'دجاج بالفرن، بطاطس، بازلاء. ثلاث صحون. وتغرف للثالث بعد، مليان، وما تشرح.'),
        { c: 'margaret', e: 'neutral', menu: [
          { t: T('Ask who the third plate is for', '{تسألها|تسألينها} الصحن الثالث لمين'), fx: st => addTrust('margaret', -1), then: [M('sad', 'It\'s for whoever needs it. Eat your peas.', 'لأي أحد يحتاجه. {كل|كلي} بازلاءك.')] },
          { t: T('Say nothing, and eat', '{ما تقول شي، وتاكل|ما تقولين شي، وتاكلين}'), fx: st => addTrust('margaret', 1), then: [N_('She watches you eat with a strange, hungry gratitude. When you finish she says, "Seconds?" before you\'ve put the fork down.', 'تطالعك {وأنت تاكل|وأنتِ تاكلين} بامتنان غريب وجوعان. ولما {تخلص|تخلصين} تقول «{تبي|تبين} زيادة؟» قبل لا {تحط|تحطين} الشوكة.')] }
        ] }];
      return [{ n: fresh('mDin', [T('Fish pie. She asks about your day and listens to the whole answer, which almost nobody does.', 'فطيرة سمك. تسألك عن يومك وتسمع الجواب كله، وهذا شي محد تقريباً يسويه.'), T('Soup and bread. She tells you Daniel once tried to cook this and set fire to a tea towel. She smiles at the third plate while she says it.', 'شوربة وخبز. تقول لك إن دانيال مرة حاول يطبخها وحرّق فوطة. وتبتسم للصحن الثالث وهي تقولها.'), T('Shepherd\'s pie. You talk about Saltmere: Sami\'s debts, Marco\'s jokes, the gulls. For ten minutes she forgets to look at the clock.', 'فطيرة لحم وبطاطس. تتكلمون عن سولتمير: ديون سامي، ونكت ماركو، والنوارس. لعشر دقايق تنسى تطالع الساعة.'), T('Pasta, a little burnt. "I wasn\'t concentrating," she says. "I was listening for the door." You don\'t ask which door.', 'مكرونة، محروقة شوي. «ما كنت مركزة،» تقول. «كنت أسمع الباب.» وما {تسأل|تسألين} أي باب.')]) }];
    },

    /* ----- events ----- */
    margClothes: s => [N_('Your clothes are gone from the chair. "In the wash, love," calls Margaret from downstairs.', 'ملابسك مو على الكرسي. «في الغسالة يا عمري،» تصارخ مارغريت من تحت.'),
      N_('In their place, ironed and folded: a grey jumper, jeans, a t-shirt with a band you\'ve never heard of. Your size. Exactly your size.', 'وبمكانها، مكوية ومطوية: كنزة رمادية، جينز، وتيشيرت فرقة عمرك ما {سمعت|سمعتي} فيها. مقاسك. بالضبط مقاسك.'),
      { menu: [
        { t: T('Put them on', '{تلبسها|تلبسينها}'), fx: st => { st.f.mWore = true; addTrust('margaret', 1); }, then: [N_('They fit. At breakfast Margaret looks at you for a long time and then says, very brightly, "Well. Doesn\'t that look nice."', 'تجي مقاسك. على الفطور مارغريت تطالعك وقت طويل وبعدين تقول، بلمعة زايدة: «طيب. ما شاء الله، حلو عليك.»')] },
        { t: T('Wait for your own, even damp', '{تنتظر|تنتظرين} ملابسك، حتى لو مبلولة'), then: [N_('You wear your own clothes damp from the dryer. Margaret folds the grey jumper again without a word, and puts it back on the chair. It\'s there the next morning too.', '{تلبس|تلبسين} ملابسك وهي رطبة من النشافة. مارغريت تطوي الكنزة الرمادية مرة ثانية بدون كلمة، وترجعها على الكرسي. {وتلقاها|وتلقينها} هناك الصبح اللي بعده بعد.')] }
      ] }],
    margMusic: s => [N_('Three in the morning. Through the wall, from Daniel\'s room: a song starts. Stops halfway. Rewinds. Starts again.', 'الساعة ثلاث الفجر. من ورا الجدار، من غرفة دانيال: أغنية تبدأ. توقف بالنص. ترجع. وتبدأ من جديد.'),
      N_('Under it, Margaret, singing along, always half a beat behind, like she\'s following someone.', 'وتحتها، مارغريت تغني معها، دايم متأخرة نص نبضة، كأنها تتبع أحد.'),
      { menu: [
        { t: T('Knock on the wall', '{تطق|تطقين} على الجدار'), fx: st => { st.fear = (st.fear || 0) + 1; }, then: [N_('The music stops at once. Silence. Then, very softly, someone knocks back. Twice. You lie awake until the gulls start.', 'الموسيقى توقف فوراً. سكوت. وبعدين، بشويش مرة، أحد يطق يرد عليك. مرتين. {وتظل صاحي|وتظلين صاحية} لين تبدأ النوارس.')] },
        { t: T('Listen', '{تسمع|تسمعين}'), fx: st => addMood(-1), then: [N_('On the fortieth time through, she stops singing and starts crying instead. The song keeps playing to the end, finally. Then nothing.', 'في المرة الأربعين، توقف عن الغنا وتبدأ تبكي بدالها. والأغنية تكمل لآخرها، أخيراً. وبعدين ولا شي.')] },
        { t: T('Pillow over your head', '{تحط|تحطين} المخدة على راسك'), then: [N_('You sleep, eventually, and dream of a car radio.', '{تنام|تنامين}، بالآخر، {وتحلم|وتحلمين} براديو سيارة.')] }
      ] }],
    margGoodnight: s => [st => { VIEW.bgOver = Object.assign({}, VIEW.bgOver, { marg_guest: 'marg_bedside2' }); return null; }, { show: [] }, N_('Your door opens a crack. Margaret comes in without a sound and sits on the end of your bed, looking at the shape of you under the blanket.', 'بابك ينفتح شوي. مارغريت تدخل بدون صوت وتجلس على طرف سريرك، بروب النوم، تطالع شكلك تحت البطانية.'),
      Object.assign(M('smile', 'Night, Danny. Don\'t forget your inhaler. Big day tomorrow.', 'تصبح على خير يا داني. لا تنسى البخاخ. بكرة يوم كبير.'), { off: true }),
      { menu: [
        { t: T('"Night, Mum."', '«تصبحين على خير يا ماما.»'), cls: 'risk', fx: st => { if (VIEW.bgOver) delete VIEW.bgOver.marg_guest; st.f.mGoodnight = true; addTrust('margaret', 1); st.conscience = (st.conscience || 0) - 1; }, then: [N_('A sound from her like something unlocking. "Night, love." The door closes. You lie there with your heart going, feeling like you\'ve stolen something from a grave.', 'يطلع منها صوت كأن شي انفتح. «تصبح على خير يا عمري.» الباب يتسكّر. {وتظل متمدد|وتظلين متمددة} وقلبك يدق، {وتحس إنك سرقت|وتحسين إنك سرقتي} شي من قبر.')] },
        { t: T('"Margaret. It\'s me. {name}."', '«مارغريت. {هذا|هذي} أنا. {name}.»'), fx: st => { if (VIEW.bgOver) delete VIEW.bgOver.marg_guest; st.f.mCorrected = (st.f.mCorrected || 0) + 1; }, then: [M('shock', 'I... yes. Yes, of course. I\'m sorry. I\'m so tired. I\'m sorry.', 'أنا... إيه. إيه أكيد. آسفة. أنا تعبانة مرة. آسفة.'), N_('You hear her on the landing for a long time afterwards, not moving.', '{تسمعها|تسمعينها} في الممر وقت طويل بعدها، ما تتحرك.')] },
        { t: T('Pretend to be asleep', '{تسوي نفسك نايم|تسوين نفسك نايمة}'), fx: st => { if (VIEW.bgOver) delete VIEW.bgOver.marg_guest; }, then: [N_('She waits. Then she whispers "good boy", gets up and closes the door. You don\'t sleep after that.', 'تنتظر. وبعدين تهمس «ولد شاطر»، وتقوم وتسكّر الباب. ما {تنام|تنامين} بعدها.')] }
      ] }],
    margNora: s => [{ show: [{ id: 'nora', e: 'neutral' }, { id: 'margaret', e: 'neutral' }] },
      NR('neutral', 'So you\'re the lodger. I\'m Nora. The sister. The one who says things.', 'يعني {أنت الساكن|أنتِ الساكنة}. أنا نورا. الأخت. اللي تقول الأشياء.'),
      M('sad', 'Nora.', 'نورا.'),
      NR('neutral', 'What? Somebody has to. She\'s not sleeping. She\'s taking something that isn\'t from a doctor. And she called you Daniel twice on the phone to me yesterday.', 'وشو؟ لازم أحد يقول. ما تنام. تاخذ شي مو من دكتور. ونادتك دانيال مرتين وهي تكلمني أمس.'),
      M('angry', 'I did not.', 'ما سويت.'),
      NR('sad', 'Mags. Come to the city. Live with me. Sell this museum. Victor\'s people have been sending letters for a year, the money would set you up.', 'ماقز. تعالي المدينة. اسكني عندي. بيعي هالمتحف. ناس فيكتور يرسلون خطابات من سنة، والفلوس بتكفيك.'),
      M('angry', 'This is his HOUSE.', 'هذا بيته هو.'),
      N_('You think of your things in boxes by a gate. Somebody must have told your mother it was sensible, too.', '{تتذكر|تتذكرين} أغراضك في كراتين عند البوابة. أكيد أحد قال لأمك بعد إن هذا هو العقل.'), // links.js
      N_('Margaret leaves the room. Nora looks at you over her glasses, if she had glasses. She has the look of someone who would.', 'مارغريت تطلع من الغرفة. ونورا تطالعك كأنها تطالع من فوق نظارة، لو كان عندها نظارة. عندها شكل وحدة ممكن يكون عندها.'),
      NR('sad', 'You seem kind. Kind isn\'t enough here. If you find out what she\'s taking, tell me. Or tell the doctor. Just tell someone.', 'شكلك {طيب|طيبة}. والطيبة ما تكفي هنا. لو {عرفت|عرفتي} وش تاخذ، {قول|قولي} لي. أو {قول|قولي} للدكتورة. بس {قول|قولي} لأحد.'),
      st => { st.f.metNora = true; st.met.nora = true; return null; }],
    margGrave: s => [{ show: [{ id: 'margaret', e: 'sad' }] },
      N_('Margaret is on her knees at the white stone, scrubbing the D in DANIEL with a toothbrush.', 'مارغريت على ركبها عند الحجر الأبيض، تفرك حرف D في DANIEL بفرشاة أسنان.'),
      M('sad', 'Gregor says the salt eats the letters. If I don\'t do this, in ten years nobody will be able to read his name.', 'غريغور يقول الملح ياكل الحروف. إذا ما سويت كذا، بعد عشر سنين محد بيقدر يقرا اسمه.'),
      { c: 'margaret', e: 'sad', menu: [
        { t: T('Kneel and help her', '{تركع وتساعدها|تركعين وتساعدينها}'), fx: st => { addTrust('margaret', 2); addMood(1); }, then: [N_('You do the A and the N. She does the rest. Neither of you speaks. When you stand up your knees are wet and the name is very white.', '{تسوي|تسوين} حرف A وN. وهي تسوي الباقي. ولا واحد يتكلم. ولما تقومون ركبكم مبلولة والاسم أبيض مرة.'), M('smile', 'Danny, this is my lodger. They\'re nice. You\'d like them. You\'d steal their chips.', 'داني، {هذا الساكن عندي. لطيف.|هذي الساكنة عندي. لطيفة.} بيعجبك. وبتسرق {بطاطسه|بطاطسها}.')] },
        { t: T('Stand back and give her space', '{توقف بعيد وتعطيها|توقفين بعيد وتعطينها} مساحة'), fx: st => addTrust('margaret', 1), then: [N_('You wait by the gate. Gregor the gravedigger leans on his spade next to you and says, "Every day. Rain or not. Two years." Then nothing else.', '{تنتظر|تنتظرين} عند البوابة. وغريغور حفار القبور يتكى على مجرفته جنبك ويقول: «كل يوم. مطر أو لا. سنتين.» وبعدها ولا كلمة.')] }
      ] }],
    margName: s => [{ show: [{ id: 'margaret', e: 'smile' }] },
      N_('Dinner. Margaret is cheerful tonight. Too cheerful. She passes you the salt.', 'العشا. مارغريت مبسوطة الليلة. مبسوطة زيادة. تمد لك الملح.'),
      M('smile', 'Danny, you\'ll want salt on those, you always do.', 'داني، بتبي ملح عليها، دايم تبي.'),
      N_('She doesn\'t notice she said it. She\'s waiting for you to take the salt.', 'ما انتبهت إنها قالتها. تنتظرك {تاخذ|تاخذين} الملح.'),
      { menu: [
        { t: T('Take the salt. "Thanks, Mum."', '{تاخذ|تاخذين} الملح. «شكراً ماما.»'), cls: 'risk', fx: st => { st.f.mAnswered = true; st.conscience = (st.conscience || 0) - 1; addMood(-1); }, then: [N_('She glows. The rest of the meal is the happiest you\'ve ever seen her. You feel sick.', 'تنوّر. باقي العشا هو أسعد شي {شفتها|شفتيها} فيه. {وأنت تحس|وأنتِ تحسين} بغثيان.')] },
        { t: T('Gently: "It\'s {name}, Margaret."', 'بهدوء: «أنا {name} يا مارغريت.»'), fx: st => { addTrust('margaret', 1); st.f.mCorrected = (st.f.mCorrected || 0) + 1; }, then: [M('sad', 'I know. I know it is. I know.', 'أدري. أدري {إنه أنت|إنها أنتِ}. أدري.'), N_('She puts her fork down and cries quietly into her napkin. After a while she reaches across the table and squeezes your hand, once. "Thank you for saying it kindly."', 'تحط الشوكة وتبكي بهدوء في المنديل. بعد شوي تمد يدها عبر الطاولة وتضغط يدك، مرة وحدة. «شكراً إنك قلتها بلطف.»')] }
      ] }],
    margLeoVisit: s => [{ show: [{ id: 'leo', e: 'sad' }] },
      N_('Leo is at the garden gate with a bunch of supermarket daffodils, not knocking.', 'ليو واقف عند بوابة الحديقة ومعه باقة نرجس من السوبرماركت، وما يطق.'),
      LE('sad', 'Don\'t tell her I came. Or do. I don\'t know. Give her these. Say they\'re from you. No, say they\'re from me. No.', 'لا {تقول|تقولين} لها إني جيت. أو {قول|قولي}. ما أدري. {عطها|عطيها} هذي. {قول|قولي} إنها منك. لا، {قول|قولي} إنها مني. لا.'),
      st => { st.f.mLeoFlowers = true; addTrust('margaret', 1); return null; },
      N_('You give her the daffodils and say they\'re from Leo. She puts them in Daniel\'s favourite mug, on the table, by the third plate.', '{تعطيها|تعطينها} النرجس {وتقول|وتقولين} إنه من ليو. تحطه في كوب دانيال المفضل، على الطاولة، جنب الصحن الثالث.')],

    margFinale: s => {
      s.f.mFinaleDone = true; quest('q_m_final', 'active');
      const head = [{ go: 'marg_kitchen' }, { show: [{ id: 'margaret', e: 'sad' }] },
        N_('Seven o\'clock. Three plates. Margaret doesn\'t sit down. She stands with her hands on the back of the third chair.', 'الساعة سبعة. ثلاث صحون. مارغريت ما تجلس. واقفة ويدينها على ظهر الكرسي الثالث.'),
        M('sad', 'Victor\'s people have made an offer for the house. Nora wants me to take it. Dr. Irene wants me to "talk to someone". And you\'re here. And I don\'t know which of you is real some nights.', 'ناس فيكتور قدموا عرض على البيت. نورا تبيني أوافق. الدكتورة إيرين تبيني «أكلم أحد». {وأنت|وأنتِ} هنا. وبعض الليالي ما أعرف مين فيكم حقيقي.'),
        M('cry', 'Tell me what to do. Please. I\'ve been deciding everything alone for two years and I\'m so tired.', '{قل|قولي} لي وش أسوي. {تكفى|تكفين}. لي سنتين أقرر كل شي لحالي وأنا تعبانة مرة.')];
      if (danPath(s) >= 3) return head.concat([N_('Before you can answer, she reaches out and straightens your collar. Daniel\'s collar.', 'قبل لا {ترد|تردين}، تمد يدها وتعدل ياقتك. ياقة دانيال.'), { jump: 'endMargDaniel' }]);
      const leoOk = ['LEO_HOME', 'LEO_STAY', 'LEO_TRUTH'].includes(s.done.leo);
      return head.concat([{ c: 'margaret', e: 'sad', menu: [
        { t: T('Give her Daniel\'s card, and open the curtains together', '{تعطيها|تعطينها} بطاقة دانيال، وتفتحون الستاير مع بعض'), need: st => !!st.f.danLetter && !!st.f.pillsDone && (st.trust.margaret || 0) >= 6, why: T('You\'d need his words, her real medicine, and her full trust.', '{تحتاج|تحتاجين} كلامه هو، ودواها الحقيقي، وثقتها الكاملة.'), hide: st => !st.f.danLetter, then: [{ jump: 'endMargOpen' }] },
        { t: T('"There\'s someone who was there that night. Let him tell you about Daniel."', '«فيه أحد كان هناك هذيك الليلة. خليه يحكي لك عن دانيال.»'), need: st => (st.trust.margaret || 0) >= 5 && st.mood >= 4, why: T('She doesn\'t trust you enough to let anyone else in. Not yet.', 'ما تثق فيك كفاية عشان تدخّل أحد ثاني. للحين.'), hide: st => !(leoOk && st.f.knowsDaniel), then: [{ jump: 'endMargLeo' }] },
        { t: T('"Go with Nora. Let someone look after you."', '«روحي مع نورا. خلي أحد يهتم فيك.»'), hide: st => !st.f.metNora, then: [{ jump: 'endMargNora' }] },
        { t: T('Sit down in the third chair', '{تجلس|تجلسين} على الكرسي الثالث'), cls: 'risk', then: [{ jump: 'endMargDaniel' }] }
      ] }]);
    },

    /* ----- endings ----- */
    endMargOpen: [N_('You give her the card. She reads it standing up. Then sitting down. Then on the floor of the kitchen, with her back against the oven, three times more.', '{تعطيها|تعطينها} البطاقة. تقراها وهي واقفة. وبعدين جالسة. وبعدين على أرض المطبخ، وظهرها على الفرن، ثلاث مرات زيادة.'),
      M('cry', '"It\'s like living in a cave." The cheek of him.', '«كأننا ساكنين في كهف.» شوف الوقاحة.'),
      N_('Then she gets up, goes into the sitting room, and pulls the first curtain back herself. You do the rest. Every window. The house fills with a light it hasn\'t seen in two years, and you can see how much dust was hiding in the dark, and she laughs at that too.', 'وبعدين تقوم، تروح الصالة، وتسحب أول ستارة بنفسها. {وأنت تسوي|وأنتِ تسوين} الباقي. كل شباك. البيت يمتلي بضو ما شافه من سنتين، وتشوفون كم غبار كان مختبي بالظلام، وتضحك على هذا بعد.'),
      { mini: 'cg', src: 'img/fx/marg_hug1.jpg', full: true, cap: T('"Look at all that dust," she says, laughing, and opens her arms.', '«شوف كل هالغبار،» تقول وهي تضحك، وتفتح يدينها.') },
      N_('That week you box his room together. She keeps the guitar, one shirt, and the dinosaur. At seven o\'clock there are two plates. Then, on Sundays, three again: you, her, and Nora, arguing about salt.', 'هالأسبوع تفرّغون غرفته مع بعض. تخلي القيتار، وقميص واحد، والديناصور. والساعة سبعة صار فيه صحنين. وبعدين، أيام الأحد، ثلاثة مرة ثانية: {أنت|أنتِ}، وهي، ونورا، تتهاوشون على الملح.'),
      { end: 'MARG_OPEN' }],
    endMargLeo: [st => { st.f.mLeoEnd = true; return null; }, { show: [{ id: 'leo', e: 'sad' }, { id: 'margaret', e: 'sad' }] },
      N_('You bring Leo up Cliff Road the next evening. He has washed his hair. He is wearing a shirt with buttons. He looks about twelve.', '{تجيب|تجيبين} ليو لشارع الجرف المغرب اللي بعده. غاسل شعره. لابس قميص بأزرار. شكله عمره اثنعش.'),
      N_('Margaret sets the third plate in front of him. Leo stares at it, and then at her.', 'مارغريت تحط الصحن الثالث قدامه. ليو يطالعه، وبعدين يطالعها.'),
      M('sad', 'He\'d want you to have his chips. He\'d complain about it. But he\'d want you to.', 'كان بيبيك تاخذ بطاطسه. كان بيتشكى. بس كان بيبيك تاخذها.'),
      N_('They talk until midnight about a boy you never met. By the end you feel like you have. In spring the three of you plant a cherry tree at the grave. Gregor says it\'s against regulations, and helps dig.', 'يتكلمون لين نص الليل عن ولد عمرك ما {قابلته|قابلتيه}. وبالآخر {تحس إنك قابلته|تحسين إنك قابلتيه}. وفي الربيع الثلاثة تزرعون شجرة كرز عند القبر. غريغور يقول هذا ضد الأنظمة، ويساعدكم تحفرون.'),
      { end: 'MARG_LEO' }],
    endMargNora: [N_('You call Nora. She arrives the next morning in a car full of empty boxes, and for once she doesn\'t say anything clever.', '{تتصل|تتصلين} بنورا. توصل الصبح اللي بعده بسيارة مليانة كراتين فاضية، ولأول مرة ما تقول شي ذكي.'),
      N_('Margaret signs Victor\'s papers at the kitchen table without reading them. The pen shakes. Nora holds her other hand.', 'مارغريت توقّع أوراق فيكتور على طاولة المطبخ بدون ما تقراها. القلم يرجف. ونورا ماسكة يدها الثانية.'),
      N_('The last thing to go into the car is the portrait. Margaret holds it on her lap. As they pull away she lifts one hand to you through the window, and then, without looking, to the house.', 'آخر شي يدخل السيارة الصورة. مارغريت ماسكتها في حضنها. ولما يمشون ترفع يدها لك من الشباك، وبعدين، بدون ما تطالع، للبيت.'),
      N_('A week later a sign goes up on Cliff Road: "SOLD — another Saltmere Grand property."', 'بعد أسبوع تنحط لوحة في شارع الجرف: «تم البيع — عقار جديد من ممتلكات سولتمير غراند.»'),
      st => { st.f.margSold = true; return null; }, { end: 'MARG_NORA' }],
    endMargDaniel: [N_('You sit in the third chair. Margaret serves you. She calls you Danny, and you answer.', '{تجلس|تجلسين} على الكرسي الثالث. مارغريت تغرف لك. تناديك داني، {وترد|وتردين}.'),
      { mini: 'cg', src: 'img/fx/marg_hug2.jpg', full: true, cap: T('"There you are," she whispers. "There you are, Danny."', '«هذا أنت،» تهمس. «هذا أنت يا داني.»') },
      N_('It\'s easy. That\'s the frightening thing. His clothes fit. His bed is softer than yours. She is so happy.', 'سهل. وهذا الشي المخيف. ملابسه مقاسك. سريره أنعم من سريرك. وهي مبسوطة مرة.'),
      N_('Weeks later Sami passes you on Cliff Road and says "{name}?" and for a full second you don\'t know who he means.', 'بعد أسابيع سامي يمر جنبك في شارع الجرف ويقول «{name}؟» ولثانية كاملة ما {تعرف|تعرفين} مين يقصد.'),
      N_('That night you lie in Daniel\'s bed, under Daniel\'s posters, and somewhere in the house a song starts, stops, rewinds, and starts again. You find you know all the words.', 'هذيك الليلة {تتمدد|تتمددين} في سرير دانيال، تحت بوسترات دانيال، وفي مكان في البيت أغنية تبدأ، وتوقف، وترجع، وتبدأ. {وتكتشف إنك تعرف|وتكتشفين إنك تعرفين} كل كلماتها.'),
      st => { addMood(-3); st.conscience = (st.conscience || 0) - 1; return null; }, { end: 'MARG_DANIEL' }],
    endMargKick: [M('scream', 'Out. Get out of my house. Get out of HIS house.', '{اطلع|اطلعي}. {اطلع|اطلعي} من بيتي. {اطلع|اطلعي} من بيته هو.'),
      N_('She stands at the door while you pack, holding the brass key so tight it marks her palm. The three locks go behind you, one after another.', 'توقف عند الباب {وأنت تجمع|وأنتِ تجمعين} أغراضك، ماسكة المفتاح النحاس بقوة لدرجة إنه يعلّم كفها. والأقفال الثلاثة تتسكّر وراك، واحد ورا الثاني.'),
      { end: 'MARG_KICK' }]
  });

  /* ---------- topics ---------- */

  /* ---------- endings ---------- */
  Object.assign(GAME.END, {
    MARG_OPEN: { who: 'margaret', title: T('The curtains open', 'الستاير تنفتح'), after: T('Margaret\'s chapter is complete.', 'خلص فصل مارغريت.'), lesson: T('Margaret: grief isn\'t a room you lock. It\'s a window you open a little at a time.', 'مارغريت: الحزن مو غرفة تقفلها. هو شباك تفتحه شوي شوي.') },
    MARG_LEO: { who: 'margaret', title: T('A cherry tree', 'شجرة كرز'), after: T('Margaret\'s chapter is complete.', 'خلص فصل مارغريت.'), lesson: T('Margaret and Leo: the people who loved the same person can carry the weight together.', 'مارغريت وليو: اللي حبوا نفس الشخص يقدرون يشيلون الثقل مع بعض.') },
    MARG_NORA: { who: 'margaret', title: T('The house on Cliff Road is sold', 'البيت في شارع الجرف انباع'), after: T('Margaret\'s chapter is complete. Victor owns one more house.', 'خلص فصل مارغريت. وفيكتور صار يملك بيت زيادة.'), lesson: T('Margaret: sometimes leaving is how you survive. It still costs something.', 'مارغريت: أحياناً الرحيل هو طريقة النجاة. بس له ثمن.') },
    MARG_DANIEL: { who: 'margaret', title: T('Danny', 'داني'), after: T('Margaret\'s chapter is complete. Something of you stayed in that room.', 'خلص فصل مارغريت. وشي منك بقى في هذيك الغرفة.'), lesson: T('Margaret: you can\'t heal someone by disappearing into the hole they\'re grieving.', 'مارغريت: ما تقدر تعالج أحد إنك تختفي في الفراغ اللي هو حزين عليه.') },
    MARG_KICK: { who: 'margaret', title: T('Three locks', 'ثلاث أقفال'), after: T('Margaret\'s chapter is complete.', 'خلص فصل مارغريت.'), lesson: T('Margaret: some doors are closed for a reason you don\'t get to decide.', 'مارغريت: بعض الأبواب مسكّرة لسبب مو أنت اللي تقرره.') }
  });

  /* ---------- events ---------- */
  GAME.EVENTS.push(
    { id: 'kickMarg', when: s => inM(s) && (s.susp.margaret || 0) >= 3, run: [{ jump: 'endMargKick' }] },
    { id: 'wakeM', when: s => inM(s) && s.f.newDay, run: s => {
      s.f.newDay = false; s.loc = 'marg_guest';
      const out = [{ n: fresh('wakeM', [T('Morning. The window you opened last night is closed again.', 'صبح. الشباك اللي {فتحته|فتحتيه} أمس صار مسكّر مرة ثانية.'), T('The smell of toast. The sound of a radio turned down low, so as not to wake someone who isn\'t there.', 'ريحة توست. وصوت راديو مخفوض، عشان ما يصحّي أحد مو موجود.'), T('A cup of tea on the floor outside your door, still hot. A note: "Morning, love."', 'كوب شاي على الأرض عند بابك، لسا حار. وورقة: «صباح الخير يا عمري.»'), T('Somebody has polished your shoes in the night.', 'أحد لمّع جزمتك في الليل.')]) }];
      if (s.mood <= 3) out.push(N_('The house is so quiet you can hear your own heart. You get up anyway.', 'البيت ساكت لدرجة {تسمع|تسمعين} قلبك. {وتقوم|وتقومين} على كل حال.'));
      return out;
    } },
    { id: 'mClothes', once: true, when: s => inM(s) && dM(s) >= 1 && s.slot === 0 && s.loc === 'marg_guest', run: s => GAME.SCRIPTS.margClothes(s) },
    { id: 'mMusic', once: true, when: s => inM(s) && dM(s) >= 1 && s.slot === NIGHT && houseOf(s.loc) === 'margaret', run: s => GAME.SCRIPTS.margMusic(s) },
    { id: 'mNora', once: true, when: s => inM(s) && !!GAME.CHAR.nora.where(s) && houseOf(s.loc) === 'margaret', run: s => GAME.SCRIPTS.margNora(s) },
    { id: 'mGrave', once: true, when: s => inM(s) && s.loc === 'cemetery' && GAME.CHAR.margaret.where(s) === 'cemetery', run: s => GAME.SCRIPTS.margGrave(s) },
    { id: 'mGoodnight', once: true, when: s => inM(s) && dM(s) >= 2 && s.slot === NIGHT && s.loc === 'marg_guest', run: s => GAME.SCRIPTS.margGoodnight(s) },
    { id: 'mName', once: true, when: s => inM(s) && dM(s) >= 3 && s.slot === 3 && s.loc === 'marg_kitchen', run: s => GAME.SCRIPTS.margName(s) },
    { id: 'mLeo', once: true, when: s => inM(s) && dM(s) >= 2 && s.slot <= 2 && s.loc === 'cliff_road' && ['LEO_HOME', 'LEO_STAY', 'LEO_TRUTH'].includes(s.done.leo), run: s => GAME.SCRIPTS.margLeoVisit(s) },
    { id: 'mFinale', when: s => inM(s) && !s.f.mFinaleDone && dM(s) >= 4 && (s.f.mDinners || 0) >= 2 && s.slot === 3, run: s => (houseOf(s.loc) === 'margaret' || s.loc === 'cliff_road') ? GAME.SCRIPTS.margFinale(s) : [N_('Your phone buzzes. Margaret: "Dinner at seven. Please be there tonight. It matters." You walk up Cliff Road.', 'جوالك يهتز. مارغريت: «العشا الساعة سبعة. {تكفى كن موجود|تكفين كوني موجودة} الليلة. مهم.» {وتطلع|وتطلعين} شارع الجرف.')].concat(GAME.SCRIPTS.margFinale(s)) },
    { id: 'mFinaleLate', when: s => inM(s) && !s.f.mFinaleDone && dM(s) >= 7 && s.slot === 3, run: s => [N_('Margaret phones: "Seven o\'clock. Please."', 'مارغريت تتصل: «الساعة سبعة. {تكفى|تكفين}.»')].concat(GAME.SCRIPTS.margFinale(s)) }
  );

  /* helpers the character files (js/chars/*.js) borrow from this chapter */
  GAME.H.margaret = { byDay, inM, dM, M, NR };
})();
