/* =====================================================================
   Chapter — Victor (50), the Saltmere Grand.
   The villain who smiles. A free suite, then favours that cost a little
   more each time. Kell, his quiet enforcer. Ana, the maid whose passport
   he "keeps safe". Bella at the desk, who sees everything. How much of
   yourself will you sell for a soft bed?
   ===================================================================== */
'use strict';
(function () {
  const V = (e, en, ar) => ({ c: 'victor', e, t: T(en, ar) });
  const K = (e, en, ar) => ({ c: 'kell', e, t: T(en, ar) });
  const A = (e, en, ar) => ({ c: 'ana', e, t: T(en, ar) });
  const B = (e, en, ar) => ({ c: 'bella', e, t: T(en, ar) });
  const inV = s => s.host === 'victor';
  const dV = s => s.day - (s.f.vicDay || 0);
  const evidence = s => [s.f.vLedger, s.f.pillsVictor || s.f.vPills, s.f.vKell, s.f.vMaya, s.f.vAna].filter(Boolean).length;
  const vHere = s => ['hotel_office'].includes(GAME.CHAR.victor.where(s)) || GAME.CHAR.kell.where(s) === 'hotel_office';
  const dark = (s, n) => { s.conscience = (s.conscience || 0) - n; toast(tx(T('Conscience −', 'الضمير −')) + n); };

  GAME.CHAR.victor = {
    name: T('Victor', 'فيكتور'), role: T('Owns the Saltmere Grand and, slowly, the rest of Saltmere.', 'صاحب فندق سولتمير غراند، وشوي شوي، باقي سولتمير.'), host: true, art: true,
    where: s => {
      if (!s.f.leoEnded || s.f.prologue) return null;
      if (s.done.victor === 'VIC_EXPOSE') return null;
      if (!inV(s)) return s.slot === 2 ? 'street' : null;
      return ['hotel_lobby', 'hotel_office', 'street', 'hotel_office', 'hotel_lobby'][s.slot];
    },
    doing: s => ({ hotel_lobby: s.slot === NIGHT ? T('Victor is at the bar, buying drinks for people who will owe him later.', 'فيكتور عند البار، يشتري مشروبات لناس بيصيرون مديونين له بعدين.') : T('Victor is shaking hands in the lobby, two-handed, like a priest.', 'فيكتور يسلّم على الناس في اللوبي، بيدينه الثنتين، مثل القسيس.'), hotel_office: T('The office door is closed. Victor\'s laugh behind it, and someone else not laughing.', 'باب المكتب مسكّر. ضحكة فيكتور وراه، وأحد ثاني ما يضحك.'), street: T('Victor is walking down Main Street with a clipboard, smiling at buildings he doesn\'t own yet.', 'فيكتور يمشي في الشارع الرئيسي ومعه ورق، يبتسم لمباني لسا ما يملكها.') })[GAME.CHAR.victor.where(s)] || null,
    greet: s => {
      if ((s.susp.victor || 0) >= 2) return { e: 'smile', t: T('My favourite guest. I hear you\'ve been... curious. Curiosity is so expensive.', 'ضيفي المفضل. سمعت إنك... فضولي. الفضول غالي مرة.') };
      if ((s.conscience || 0) <= -3) return { e: 'smile', t: T('Ah, my protégé. You\'re learning so fast. It\'s almost moving.', 'آه، تلميذي. تتعلم بسرعة. شي يحرّك المشاعر تقريباً.') };
      return { e: 'smile', t: T('{name}! Everyone is welcome at the Grand. Especially you.', '{name}! الكل مرحب فيه في الغراند. خصوصاً أنت.') };
    }
  };
  GAME.CHAR.kell = {
    name: T('Kell', 'كيل'), role: T('Victor\'s driver, doorman, and quiet problem.', 'سواق فيكتور، وبوابه، ومشكلته الساكتة.'), art: true,
    where: s => (inV(s) ? ['hotel_staff', 'hotel_lobby', 'street', 'hotel_lobby', 'hotel_office'][s.slot] : null),
    doing: s => ({ hotel_staff: T('Kell is eating cereal in the laundry, standing up, reading a paperback.', 'كيل ياكل كورن فليكس في المغسلة، واقف، يقرا رواية.'), hotel_lobby: T('Kell is standing by the door like a wardrobe with opinions.', 'كيل واقف عند الباب مثل دولاب عنده آراء.'), street: T('Kell is two steps behind Victor, carrying nothing, looking at everything.', 'كيل وراء فيكتور بخطوتين، ما يشيل شي، ويطالع كل شي.'), hotel_office: T('Kell is sitting outside the office door, guarding it.', 'كيل جالس عند باب المكتب، يحرسه.') })[GAME.CHAR.kell.where(s)] || null,
    greet: s => ({ e: 'neutral', t: (s.trust.kell || 0) >= 3 ? T('Hey.', 'هلا.') : T('...', '...') })
  };
  GAME.CHAR.ana = {
    name: T('Ana', 'آنا'), role: T('Housekeeping at the Grand. Sends money home. Smiles at work because she has to.', 'تنظيف الغرف في الغراند. ترسل فلوس لأهلها. تبتسم في الشغل لأنها مجبورة.'), art: true,
    where: s => (inV(s) && s.slot < NIGHT ? (s.slot === 1 ? 'hotel_suite' : 'hotel_staff') : null),
    doing: s => (s.slot === 1 ? T('Ana is making your bed with hospital corners, very fast, apologising for being in your room.', 'آنا ترتب سريرك ترتيب مستشفى، بسرعة مرة، وتعتذر إنها في غرفتك.') : [T('Ana is folding towels into swans for guests who will unfold them in a second.', 'آنا تطوي المناشف على شكل بجع لضيوف بيفكونها بثانية.'), T('Ana is eating rice from a tub on her break, standing up, between the washing machines.', 'آنا تاكل رز من علبة في استراحتها، واقفة، بين الغسالات.'), T('Ana is on the phone in a language you don\'t know, laughing, then not.', 'آنا على الجوال بلغة ما تعرفها، تضحك، وبعدين لا.')][s.slot % 3]),
    greet: s => ({ e: (s.trust.ana || 0) >= 3 ? 'smile' : 'neutral', t: (s.trust.ana || 0) >= 3 ? T('Ah, my friend. You want towel swan? I make you one. Special.', 'آه يا صاحبي. تبي بجعة منشفة؟ أسوي لك وحدة. خاصة.') : T('Sorry, sorry. I finish quickly.', 'آسفة، آسفة. أخلّص بسرعة.') })
  };
  GAME.CHAR.bella = {
    name: T('Bella', 'بيلا'), role: T('Front desk at the Grand. Knows every guest\'s secrets and most of Victor\'s.', 'الاستقبال في الغراند. تعرف أسرار كل الضيوف وأغلب أسرار فيكتور.'), art: true,
    where: s => (s.f.leoEnded && !s.f.prologue && s.slot < NIGHT && s.done.victor !== 'VIC_EXPOSE' ? 'hotel_lobby' : null),
    doing: s => [T('Bella is answering the phone in her "luxury voice" and pulling faces at the receiver.', 'بيلا ترد على التلفون بـ«صوت الفخامة» وتسوي وجوه للسماعة.'), T('Bella is eating a croissant under the desk, very carefully.', 'بيلا تاكل كرواسون تحت الطاولة، بحذر شديد.'), T('Bella is filing her nails and the guest complaints, in that order.', 'بيلا تبرد أظافرها وشكاوي الضيوف، بهالترتيب.'), T('Bella is counting the minutes to the end of her shift out loud.', 'بيلا تعد الدقايق لنهاية شفتها بصوت عالي.')][s.slot],
    greet: s => ({ e: 'smile', t: inV(s) ? T('Suite 7 lives! Need towels? Gossip? A getaway car?', 'جناح ٧ عايش! تبي مناشف؟ سوالف؟ سيارة هروب؟') : T('Welcome to the Saltmere Grand, where everyone is welcome. My lawyer says I have to say that.', 'أهلاً بك في سولتمير غراند، حيث الكل مرحب فيه. محاميني يقول لازم أقولها.') })
  };

  Object.assign(GAME.ITEMS, {
    envelope: { name: T('Victor\'s envelope', 'ظرف فيكتور'), desc: T('Thick. Addressed to "Officer R. Hale".', 'سميك. لـ«الضابط ر. هيل».') },
    keycard: { name: T('Master key card', 'كرت المفتاح الرئيسي'), desc: T('Bella\'s. Gold. Opens every door in the Grand.', 'حق بيلا. ذهبي. يفتح كل باب في الغراند.') },
    passport: { name: T('Ana\'s passport', 'جواز آنا'), desc: T('From Victor\'s safe. It isn\'t his to keep.', 'من خزنة فيكتور. مو له يحتفظ فيه.') },
    gpack: { name: T('Spa package', 'طرد السبا'), desc: T('A brown paper parcel. It rattles. A gold "G" on the tape.', 'طرد ورق بني. يخشخش. وحرف «G» ذهبي على اللاصق.') }
  });
  Object.assign(GAME.QUESTS, {
    q_v_suite: { title: T('Everyone is welcome', 'الكل مرحب فيه'), hint: T('Victor gave you Suite 7 for free. He says he\'ll only ask small favours. Talk to him to hear the next one.', 'فيكتور عطاك جناح ٧ ببلاش. يقول بيطلب خدمات صغيرة بس. كلّمه عشان تسمع الجاية.') },
    q_v_ana: { title: T('Safekeeping', 'أمانة'), hint: T('Victor keeps Ana\'s passport in the safe in his office. Bella might know the code.', 'فيكتور يحتفظ بجواز آنا في الخزنة اللي في مكتبه. يمكن بيلا تعرف الرقم.') },
    q_v_expose: { title: T('The ledger', 'الدفتر'), hint: T('If you could prove what Victor does (the fake inspections, the "G" pills, Ana), Olivia and Officer Rex could stop him.', 'لو تقدر تثبت اللي يسويه فيكتور (الفحوصات المزورة، حبوب «G»، آنا)، أوليفيا والضابط ريكس يقدرون يوقفونه.') }
  });

  /* ---------- places ---------- */
  const officeLock = s => {
    if (!inV(s)) return T('Locked. A brass plate: "V. — PRIVATE".', 'مقفول. لوحة نحاس: «ف. — خاص».');
    if (has('keycard')) return null;
    if (GAME.CHAR.victor.where(s) === 'hotel_office') return [N_('Voices inside. Victor\'s, warm. Someone else\'s, pleading. You keep walking.', 'أصوات داخل. صوت فيكتور، دافي. وصوت أحد ثاني، يترجى. تكمل مشيك.')];
    if (s.slot === 0) return null; // the cleaners prop it open in the mornings
    return T('Locked. You\'d need a key card. Bella has every key in the building.', 'مقفول. تحتاج كرت مفتاح. بيلا عندها كل مفاتيح المبنى.');
  };
  Object.assign(GAME.LOC, {
    hotel_lobby: {
      name: T('The Saltmere Grand', 'سولتمير غراند'), mapName: T('The Saltmere Grand', 'سولتمير غراند'), bg: 'hotel_lobby', charX: 50, rooms: ['hotel_suite', 'hotel_office', 'hotel_staff'],
      exits: [
        { to: 'street', x: 6, y: 86, label: T('Out to Main Street', 'اطلع للشارع الرئيسي') },
        { to: 'hotel_suite', x: 84, y: 30, label: T('Lift to Suite 7', 'المصعد لجناح ٧'), if: s => inV(s) },
        { to: 'hotel_office', x: 16, y: 30, label: T('Victor\'s office', 'مكتب فيكتور'), risk: s => inV(s), lock: officeLock },
        { to: 'hotel_staff', x: 94, y: 62, label: T('Staff only', 'للموظفين فقط'), if: s => inV(s) }
      ],
      spots: [
        { x: 50, y: 56, label: T('Ask about a room', 'تسأل عن غرفة'), if: s => !s.host && !s.done.victor && !!s.f.leoEnded, cls: 'main', run: s => GAME.SCRIPTS.vicStart(s) },
        { x: 70, y: 20, label: T('Brochure stand', 'ستاند البروشورات'), run: s => [N_('"THE SALTMERE GRAND SPA VILLAGE — coming soon to Cliff Road and Fisher\'s Row. Wellness. Serenity. Everyone is welcome." The artist\'s drawing has no houses in it at all.', '«قرية سبا سولتمير غراند — قريباً في شارع الجرف وشارع الصيادين. عافية. سكينة. الكل مرحب فيه.» ورسمة المصمم ما فيها ولا بيت.')] }
      ]
    },
    hotel_suite: {
      name: T('Suite 7', 'جناح ٧'), bg: 'hotel_suite', house: 'victor', exits: [{ to: 'hotel_lobby', x: 6, y: 86, label: T('Lift down', 'المصعد تحت') }],
      spots: [
        { x: 30, y: 56, label: s => (s.slot === NIGHT ? T('Sleep', 'نام') : T('Lie down', 'تمدد')), run: s => GAME.SCRIPTS.bed(s) },
        { x: 94, y: 40, label: T('Marble bathroom', 'حمام رخام'), run: s => GAME.SCRIPTS.shower(s) },
        { x: 56, y: 62, label: T('Minibar', 'الثلاجة الصغيرة'), run: s => GAME.SCRIPTS.vicMinibar(s) },
        { x: 46, y: 22, label: T('Window', 'الشباك'), run: s => [N_('The whole of Saltmere, small and lit up, like a model on a table. From up here you can see exactly which houses Victor has circled on the brochure.', 'سولتمير كلها، صغيرة ومنوّرة، مثل مجسم على طاولة. ومن فوق تشوف بالضبط أي بيوت فيكتور حاط عليها دواير في البروشور.')] }
      ]
    },
    hotel_staff: {
      name: T('Laundry & staff corridor', 'المغسلة وممر الموظفين'), bg: 'hotel_staff', house: 'victor', charX: 56, exits: [{ to: 'hotel_lobby', x: 6, y: 86, label: T('Back to the lobby', 'ارجع للوبي') }],
      spots: [
        { x: 34, y: 58, label: T('Help with the laundry', 'تساعد في الغسيل'), if: s => !!GAME.CHAR.ana.where(s) && GAME.CHAR.ana.where(s) === 'hotel_staff' && !doneToday('vLaundry'), cls: 'main', run: s => GAME.SCRIPTS.vicLaundry(s) },
        { x: 86, y: 40, label: T('Staff lockers', 'خزانات الموظفين'), run: s => [N_('Names on tape: ANA, BELLA, KELL, and six others crossed out. Inside Kell\'s, which doesn\'t lock: a paperback, a child\'s drawing of a house, and a photo of a woman on a doorstep in Fisher\'s Row.', 'أسماء على لاصق: آنا، بيلا، كيل، وستة أسماء مشطوبة. وفي خزانة كيل، اللي ما تقفل: رواية، ورسمة طفل لبيت، وصورة امرأة على عتبة بيت في شارع الصيادين.'), st => { st.f.vKellPhoto = true; return null; }] }
      ]
    },
    hotel_office: {
      name: T('Victor\'s office', 'مكتب فيكتور'), bg: 'hotel_office', house: 'victor', private: true, exits: [{ to: 'hotel_lobby', x: 6, y: 86, label: T('Out, quickly', 'اطلع، بسرعة') }],
      onEnter: s => GAME.SCRIPTS.vicEnter(s),
      spots: [
        { x: 44, y: 50, label: T('The ledger on the desk', 'الدفتر على المكتب'), risk: s => true, run: s => GAME.SCRIPTS.vicLedger(s) },
        { x: 88, y: 56, label: T('The safe', 'الخزنة'), risk: s => true, run: s => GAME.SCRIPTS.vicSafe(s) },
        { x: 14, y: 40, label: T('Filing cabinet', 'خزانة الملفات'), risk: s => true, run: s => GAME.SCRIPTS.vicFiles(s) },
        { x: 50, y: 18, label: T('His portrait', 'صورته'), run: s => [N_('Victor, painted larger than life, smiling, one hand on a model of the Grand. The painter has given him kind eyes. Someone paid extra for that.', 'فيكتور، مرسوم أكبر من الحقيقة، يبتسم، ويده على مجسم الغراند. الرسام عطاه عيون طيبة. أحد دفع زيادة عشانها.')] }
      ]
    }
  });
  GAME.MAP.forEach(p => { if (p.place === 'hotel' && !p.to) p.if = s => !s.f.leoEnded; });
  GAME.MAP.push({ to: 'hotel_lobby', place: 'hotel', if: s => !!s.f.leoEnded });
  GAME.LOC.street.exits.push({ to: 'hotel_lobby', x: 72, y: 40, label: T('The Saltmere Grand', 'سولتمير غراند'), if: s => !!s.f.leoEnded && s.done.victor !== 'VIC_EXPOSE', lock: s => (s.host && !inV(s) ? T('The doorman looks at you, and through you.', 'البواب يطالعك، ويطالع من خلالك.') : null) });

  /* ---------- the favours ---------- */
  const FAV = [
    { id: 'env', ask: T('A small thing. Take this envelope to Officer Rex at the police station. Personally. He\'s expecting it. He doesn\'t know he is.', 'شي صغير. ودّ هالظرف للضابط ريكس في مركز الشرطة. بيدك. هو ينتظره. بس ما يدري إنه ينتظره.') },
    { id: 'photos', ask: T('Olivia has a little petition table on Main Street. Take some photos of the people who sign it. I like to know my neighbours.', 'أوليفيا عندها طاولة عريضة صغيرة في الشارع الرئيسي. صوّر الناس اللي يوقّعون. أحب أعرف جيراني.') },
    { id: 'maya', ask: T('Tell Maya at the harbor that her mooring permit has been "reviewed". Offer her two hundred for the berth. She\'ll say no. Tell her the next offer is lower.', 'قول لمايا في الميناء إن تصريح رسو قاربها «انراجع». واعرض عليها مية وخمسين على المرسى. بتقول لا. قول لها العرض الجاي أقل.') },
    { id: 'pack', ask: T('Pick up a parcel from the spa and drop it at a client\'s door on Cliff Road. Don\'t knock. She knows.', 'خذ طرد من السبا ونزّله عند باب عميلة في شارع الجرف. لا تطق. هي تدري.') },
    { id: 'sign', ask: T('The big one. Tomorrow the council votes on Fisher\'s Row. I need a witness to say they saw the inspector condemn those cottages. Sign here. You\'ll never pay for anything again.', 'الكبيرة. بكرة المجلس يصوّت على شارع الصيادين. أحتاج شاهد يقول إنه شاف المفتش يحكم إن البيوت غير صالحة. وقّع هنا. وعمرك ما بتدفع على شي مرة ثانية.') }
  ];
  Object.assign(GAME.SCRIPTS, {
    vicStart: s => [{ show: [{ id: 'victor', e: 'smile' }, { id: 'bella', e: 'neutral' }] },
      B('neutral', 'Rooms start at three hundred a night, and—', 'الغرف تبدأ من ثلاث مية بالليلة، و—'),
      V('smile', 'Bella. This is {name}. I know all about {name}. Elias\'s lodger. Leo\'s friend. The one the whole town keeps talking about.', 'بيلا. هذا {name}. أعرف كل شي عن {name}. ساكن إلياس. صاحب ليو. اللي البلدة كلها تتكلم عنه.'),
      V('smile', 'Suite 7. On the house. As long as you like. Everyone is welcome at the Grand.', 'جناح ٧. على حساب الفندق. قد ما تبي. الكل مرحب فيه في الغراند.'),
      V('neutral', 'All I ask is the occasional small favour. Between friends. You do understand favours?', 'كل اللي أطلبه خدمة صغيرة بين فترة وفترة. بين أصحاب. تفهم في الخدمات؟'),
      { menu: [
        { t: T('"A free suite? Yes."', '«جناح ببلاش؟ إيه.»'), cls: 'main', then: [st => { st.host = 'victor'; st.met.victor = true; st.met.bella = true; st.f.vicDay = st.day; st.trust.victor = st.trust.victor || 0; st.susp.victor = 0; st.ch = Math.max(st.ch, 3); quest('q_v_suite', 'active'); st.f.vFavDay = st.day; return null; }, { go: 'hotel_suite' }, { show: [] }, N_('A bed the size of Sami\'s whole shop. A marble bathroom. A bowl of fruit with a card: "Welcome home. — V." Somehow it\'s the coldest room you\'ve slept in since the motel.', 'سرير بحجم بقالة سامي كاملة. حمام رخام. وصحن فواكه عليه كرت: «أهلاً في بيتك. — ف.» وبطريقة ما هي أبرد غرفة نمت فيها من الموتيل.')] },
        { t: T('"I\'ll think about it."', '«بفكر.»'), then: [V('smile', 'Of course. Thinking is free. For now.', 'أكيد. التفكير ببلاش. للحين.')] }
      ] }],
    vicMinibar: s => { if (doneToday('vMini')) return [N_('You\'ve had today\'s chocolate. The minibar hums at you, disappointed.', 'أكلت شوكولاتة اليوم. والثلاجة تطن عليك، خايبة أملها.')]; onceToday('vMini'); feed(35); s.f.vMini = (s.f.vMini || 0) + 1;
      return [N_('Tiny chocolate, tiny crisps, tiny cheese. All "complimentary". On the fridge door, a tiny printed note: "Running total: $' + (s.f.vMini * 38) + '. Not that we\'re counting. — V."', 'شوكولاتة صغيرة، شيبس صغير، جبن صغير. كله «مجاني». وعلى باب الثلاجة، ورقة صغيرة مطبوعة: «المجموع: ' + (s.f.vMini * 38) + '$. مو إننا نحسب. — ف.»')]; },
    vicLaundry: s => { onceToday('vLaundry'); advance(1); s.f.vLaundry = (s.f.vLaundry || 0) + 1; if (s.f.vLaundry <= 3) addTrust('ana', 1);
      return [{ c: 'ana', e: 'smile', t: fresh('vLaun', [T('Fold like this. Corner, corner, middle. Mr Victor checks. He uses a ruler. I am not joking.', 'اطويها كذا. زاوية، زاوية، النص. السيد فيكتور يتأكد. يستخدم مسطرة. ما أمزح.'), T('You fold good. Better than Bella. Don\'t tell Bella. Do tell Bella.', 'تطوي زين. أحسن من بيلا. لا تقول لبيلا. لا، قول لبيلا.'), T('At home my mother has a shop. Small. Fabric. She sends me photos of every new colour. This one: pistachio. You like?', 'في بلدي أمي عندها محل. صغير. أقمشة. ترسل لي صورة كل لون جديد. هذا: فستقي. يعجبك؟')]) }]; },
    vicFavour: s => {
      const i = s.f.vFav || 0; const f = FAV[Math.min(i, FAV.length - 1)];
      s.f.vFavDay = s.day; s.f.vAsked = f.id;
      return [V('smile', f.ask.en, f.ask.ar), { jump: 'fav_' + f.id }];
    },
    fav_env: [{ menu: [
      { t: T('Take the envelope', 'تاخذ الظرف'), then: [st => { give('envelope'); return null; }, N_('It\'s heavy for an envelope. It doesn\'t feel like paper inside.', 'ثقيل بالنسبة لظرف. ما تحس إن داخله ورق.')] },
      { t: T('"No."', '«لا.»'), cls: 'risk', then: [{ jump: 'vicRefuse' }] }] }],
    fav_photos: [{ menu: [
      { t: T('"Fine."', '«طيب.»'), then: [st => { st.f.vPhotoTask = true; return null; }, N_('Olivia\'s petition table is on Main Street, mornings and afternoons.', 'طاولة عريضة أوليفيا في الشارع الرئيسي، الصبح والعصر.')] },
      { t: T('"No."', '«لا.»'), cls: 'risk', then: [{ jump: 'vicRefuse' }] }] }],
    fav_maya: [{ menu: [
      { t: T('"I\'ll tell her."', '«بقول لها.»'), then: [st => { st.f.vMayaTask = true; return null; }, N_('Maya is at the harbor in the mornings.', 'مايا في الميناء الصبح.')] },
      { t: T('"No."', '«لا.»'), cls: 'risk', then: [{ jump: 'vicRefuse' }] }] }],
    fav_pack: [{ menu: [
      { t: T('Take the parcel', 'تاخذ الطرد'), then: [st => { give('gpack'); st.f.vPills = true; return null; }, N_('Brown paper. It rattles like a pill bottle. On the tape: a gold "G". The address is the white house on Cliff Road.', 'ورق بني. يخشخش مثل علبة حبوب. وعلى اللاصق: حرف «G» ذهبي. والعنوان البيت الأبيض في شارع الجرف.')] },
      { t: T('"No."', '«لا.»'), cls: 'risk', then: [{ jump: 'vicRefuse' }] }] }],
    fav_sign: [{ jump: 'vicFinale' }],
    vicRefuse: s => { s.f.vAsked = null; s.f.vFavDay = s.day; s.f.vRef = (s.f.vRef || 0) + 1; addSusp('victor', 1); s.f.vFav = (s.f.vFav || 0) + 1;
      if (s.f.vRef >= 3) return [V('smile', 'Three times. You know, I admire it. I can\'t afford it, but I admire it.', 'ثلاث مرات. تدري، معجب. ما أقدر أتحمله، بس معجب.'), { jump: 'endVicKick' }];
      return [V('smile', s.f.vRef === 1 ? 'No? No. Of course. Everyone is welcome to say no. Once.' : 'Again? Kell, remind me how many nights {name} has had for free.', s.f.vRef === 1 ? 'لا؟ لا. أكيد. الكل مرحب فيه يقول لا. مرة.' : 'مرة ثانية؟ كيل، ذكّرني كم ليلة {name} قعد ببلاش.'), s.f.vRef === 2 ? K('neutral', 'Six.', 'ست.') : N_('His smile doesn\'t move at all.', 'ابتسامته ما تتحرك أبداً.')];
    },
    vicDone: (s, id, good) => { s.f.vFav = (s.f.vFav || 0) + 1; s.f.vFavDay = s.day; if (!good) { dark(s, id === 'pack' || id === 'photos' ? 2 : 1); s.money += 20; addTrust('victor', 1); } return null; },

    /* ----- snooping ----- */
    vicRisk: (s, extra = 0) => { const w = GAME.CHAR.victor.where(s), k = GAME.CHAR.kell.where(s); let p = 0.08; if (w === 'hotel_lobby') p = 0.3; if (k === 'hotel_lobby') p += 0.1; if (w === 'street') p = 0.05; return clamp(p + extra, 0.02, 0.85); },
    vicCaught: s => { addSusp('victor', 1); const n = s.susp.victor || 0;
      if (n >= 3) return [{ show: [{ id: 'victor', e: 'angry' }, { id: 'kell', e: 'neutral' }] }, { jump: 'endVicKick' }];
      return [{ show: [{ id: 'victor', e: 'smile' }] }, n === 1 ? V('smile', 'Lost? The lift is the other way. Everything in here is boring. Numbers. You hate numbers. Everyone does.', 'ضايع؟ المصعد من الجهة الثانية. كل شي هنا ممل. أرقام. أنت تكره الأرقام. الكل يكرهها.') : V('angry', 'I\'ve been very generous, {name}. Generosity has a shape. Learn it.', 'كنت كريم مرة يا {name}. والكرم له شكل. تعلّمه.'), { go: 'hotel_lobby' }]; },
    vicEnter: s => { if (GAME.CHAR.kell.where(s) === 'hotel_office') { if ((s.trust.kell || 0) >= 4) return [N_('Kell is in the chair by the door. He looks at you, then looks at the ceiling, very deliberately, for a long time.', 'كيل على الكرسي عند الباب. يطالعك، وبعدين يطالع السقف، بقصد، وقت طويل.')]; return [N_('Kell stands up from the chair by the door.', 'كيل يقوم من الكرسي اللي عند الباب.'), { jump: 'vicCaught' }]; }
      if (roll(GAME.SCRIPTS.vicRisk(s, -0.05))) return [N_('The door handle turns behind you.', 'مقبض الباب يلف وراك.'), { jump: 'vicCaught' }]; return null; },
    vicLedger: s => { if (roll(GAME.SCRIPTS.vicRisk(s))) return [N_('Footsteps in the corridor. Expensive shoes.', 'خطوات في الممر. جزمة غالية.'), { jump: 'vicCaught' }];
      s.f.vLedger = true; quest('q_v_expose', 'active');
      return [N_('A leather ledger. Columns of names, sums, and initials. "Inspector P. — 2,000 — Fisher\'s Row, all condemned." "Council, Cllr. B. — 5,000 — vote." "Spa (G) — 140 units — Cliff Road, Harbor."', 'دفتر جلد. أعمدة أسماء، ومبالغ، وحروف. «المفتش ب. — ٢٠٠٠ — شارع الصيادين، كلها غير صالحة.» «المجلس، العضو ب. — ٥٠٠٠ — تصويت.» «السبا (G) — ١٤٠ وحدة — شارع الجرف، الميناء.»'),
        N_('And on the last page: "Kell — R. Kell, 12 Fisher\'s Row — evicted. (Good. Keeps him hungry.)"', 'وفي آخر صفحة: «كيل — ر. كيل، ١٢ شارع الصيادين — طُردت. (زين. يخليه جوعان.)»'), st => { st.f.vSawRosa = true; return null; }]; },
    vicFiles: s => { if (roll(GAME.SCRIPTS.vicRisk(s, 0.05))) return [N_('The drawer runs out on its rails with a crash.', 'الدرج يطلع على سكته بصوت عالي.'), { jump: 'vicCaught' }];
      s.f.vPills = true; s.f.vBella = true;
      return [N_('Invoices from "Grand Wellness". Sedatives bought wholesale from abroad, relabeled with a gold "G", sold to "spa guests" at ten times the price. A list of clients. Margaret Hart is on it.', 'فواتير من «غراند للعافية». منومات مشتراة بالجملة من برا، وعليها ملصق «G» ذهبي، وتنباع لـ«ضيوف السبا» بعشر أضعاف السعر. وقائمة عملاء. مارغريت هارت فيها.'), N_('And a staff file: "Ana — passport held (security). Recruitment debt: $4,000. Remaining: $3,960."', 'وملف موظفة: «آنا — الجواز محفوظ (أمان). دين التوظيف: ٤٠٠٠$. المتبقي: ٣٩٦٠$.»'), st => { quest('q_v_ana', 'active'); return null; }]; },
    vicSafe: s => { if (!s.f.vCode) return [N_('A heavy steel safe with a four-digit dial. You try 1234. Nothing. You try 0000. Nothing. Bella would know. Bella knows everything.', 'خزنة حديد ثقيلة بقرص أربع أرقام. تجرب ١٢٣٤. ولا شي. ٠٠٠٠. ولا شي. بيلا بتعرف. بيلا تعرف كل شي.'), st => { quest('q_v_ana', 'active'); return null; }];
      if (has('passport')) return [N_('The safe is shut. You\'ve taken what wasn\'t his.', 'الخزنة مسكّرة. أخذت اللي مو له.')];
      if (roll(GAME.SCRIPTS.vicRisk(s, 0.1))) return [N_('The dial clicks loudly on the last number, and the door opens behind you at the same moment.', 'القرص يطق بقوة على آخر رقم، والباب ينفتح وراك بنفس اللحظة.'), { jump: 'vicCaught' }];
      give('passport'); s.f.vPass = true;
      return [N_('0-3-0-7. The date he bought the hotel. The safe opens. Cash, deeds, a revolver you don\'t touch, and a small stack of passports. Ana\'s is on top.', '٠-٣-٠-٧. تاريخ شرائه للفندق. الخزنة تنفتح. كاش، وصكوك، ومسدس ما تلمسه، ومجموعة جوازات صغيرة. جواز آنا فوق.'), N_('You take hers. The others aren\'t yours to decide. You make a note of the names.', 'تاخذ جوازها. الباقي مو لك تقرر فيه. وتسجل الأسماء.')]; },

    /* ----- events ----- */
    vicFire: s => [{ go: 'hotel_suite' }, { show: [] },
      N_('2 a.m. The fire alarm. Then the smell: hot plastic. Smoke is coming under the door, grey and then black.', 'الساعة ٢ الفجر. جرس الحريق. وبعدين الريحة: بلاستيك حار. والدخان يطلع من تحت الباب، رمادي وبعدين أسود.'),
      N_('The old wiring in the west wing. The wiring Victor\'s inspector signed off without looking.', 'التمديدات القديمة في الجناح الغربي. اللي مفتش فيكتور وقّع عليها بدون ما يطالع.'),
      { menu: [
        { t: T('Get out, now', 'اطلع، الحين'), then: [N_('Down the fire stairs with forty guests in dressing gowns. On the lawn Victor is already on the phone to his insurers, smiling.', 'تنزل درج الطوارئ مع أربعين ضيف بأرواب النوم. وعلى العشب فيكتور قاعد يكلم شركة التأمين، ويبتسم.')] },
        { t: T('Go to the staff rooms and wake Ana', 'تروح غرف الموظفين وتصحّي آنا'), hide: st => !st.met.ana, cls: 'main', then: [N_('The staff rooms have no alarm. Of course they don\'t. You bang on doors until people come out coughing. Ana last, holding her phone and a photo of her mother.', 'غرف الموظفين ما فيها جرس. أكيد ما فيها. تدق الأبواب لين يطلعون الناس يكحّون. وآنا آخر وحدة، ماسكة جوالها وصورة أمها.'), A('sad', 'No alarm in our rooms. He told us it was fixed. He said "everyone is welcome".', 'ما فيه جرس في غرفنا. قال لنا إنه انصلح. قال «الكل مرحب فيه».'), A('angry', 'I will tell anybody. Police, newspaper, anybody. I am done being quiet.', 'بقول لأي أحد. شرطة، جريدة، أي أحد. خلاص ما بسكت.'), st => { st.f.vAna = true; addTrust('ana', 3); addMood(1); return null; }] },
        { t: T('Go back up for the ledger in Victor\'s office', 'ترجع فوق تاخذ الدفتر من مكتب فيكتور'), cls: 'risk', then: [N_('WARNING: the smoke is black and low and the office is in the west wing.', 'تحذير: الدخان أسود وواطي، والمكتب في الجناح الغربي.'), { menu: [
          { t: T('Go anyway', 'تروح على كل حال'), cls: 'risk', then: [{ jump: 'endVicFire' }] },
          { t: T('Turn back', 'ترجع'), then: [N_('You turn back. Somewhere above you, glass breaks in the heat. You were right.', 'ترجع. وفوقك في مكان، زجاج ينكسر من الحرارة. كنت صح.')] }] }] }
      ] }, st => { st.f.vFireDone = true; return null; }],
    vicFinale: s => { s.f.vFinaleDone = true;
      return [{ go: 'hotel_office' }, { show: [{ id: 'victor', e: 'smile' }, { id: 'kell', e: 'neutral' }] },
        V('smile', FAV[4].ask.en, FAV[4].ask.ar),
        N_('He slides a pen across the desk. A heavy one, gold. On the paper, a space for your name, under "WITNESS".', 'يزحلق قلم على المكتب. ثقيل، ذهبي. وعلى الورقة، مكان لاسمك، تحت «شاهد».'),
        st => [{ c: 'victor', e: 'smile', menu: [
          { t: T('Sign it', 'توقّع'), cls: 'risk', then: [{ jump: 'endVicDark' }] },
          { t: T('Put the ledger, the pills and the witnesses in front of the whole town', 'تحط الدفتر، والحبوب، والشهود قدام البلدة كلها'), need: x => evidence(x) >= 3 && !!x.met.olivia, why: T('You need at least three kinds of proof, and someone with a microphone. (Olivia.)', 'تحتاج ثلاث أنواع دليل على الأقل، وأحد معه مايكروفون. (أوليفيا.)'), hide: x => evidence(x) < 1, cls: 'main', then: [{ jump: 'endVicExpose' }] },
          { t: T('Say nothing, and get Ana on the morning train', 'ما تقول شي، وتركّب آنا قطار الصبح'), hide: x => !has('passport'), then: [{ jump: 'endVicAna' }] },
          { t: T('Put the pen down and walk out', 'تحط القلم وتطلع'), then: [{ jump: 'endVicKick' }] }
        ] }]];
    },

    /* ----- endings ----- */
    endVicDark: [N_('You sign. The pen is heavier than it looks. Victor takes the paper before the ink is dry.', 'توقّع. القلم أثقل من شكله. وفيكتور ياخذ الورقة قبل لا ينشف الحبر.'),
      V('smile', 'Welcome to the family. You\'ll start Monday. Assistant to the director. Kell will show you how we talk to people who say no.', 'أهلاً في العيلة. تبدأ الإثنين. مساعد المدير. وكيل بيوريك كيف نكلم الناس اللي يقولون لا.'),
      N_('The next week the bulldozers come to Fisher\'s Row. You watch from the window of Suite 7, which is yours now, for as long as you\'re useful.', 'الأسبوع اللي بعده الجرافات توصل شارع الصيادين. تطالع من شباك جناح ٧، اللي صار لك الحين، قد ما أنت مفيد.'),
      st => { dark(st, 2); st.f.vicDark = true; return null; }, { end: 'VIC_DARK' }],
    endVicExpose: [N_('You don\'t sign. You stand up. "Bella," you say into your phone, "now."', 'ما توقّع. تقوم. «بيلا،» تقول في جوالك، «الحين.»'),
      N_('Downstairs in the ballroom, Olivia has packed the council meeting with half of Saltmere. Sami. Marco. Martha. Maya and her cousins. Margaret, or Nora. Evelyn in her fisherman\'s jumper, holding the accordion for some reason.', 'تحت في القاعة، أوليفيا معبية اجتماع المجلس بنص سولتمير. سامي. ماركو. مارثا. مايا وعيال عمها. مارغريت، أو نورا. وإيفلين بكنزة الصيادين، ماسكة الأكورديون لسبب ما.'),
      N_('You read the ledger out loud. Ana stands up and tells them about the passports. Kell, after a long silence, stands too: "He took my sister\'s house." Officer Rex is at the back. He walks to the front, slowly, like a man putting down something heavy.', 'تقرا الدفتر بصوت عالي. آنا تقوم وتحكي لهم عن الجوازات. وكيل، بعد سكوت طويل، يقوم بعد: «أخذ بيت أختي.» والضابط ريكس في الخلف. يمشي للقدام، بهدوء، مثل رجّال يحط شي ثقيل.'),
      N_('Victor is still smiling when they take him out. It\'s the only thing he has left that he paid for.', 'فيكتور لسا يبتسم وهم يطلعونه. هي الشي الوحيد اللي باقي له ودافع حقه.'),
      st => { st.f.vExposed = true; st.conscience = (st.conscience || 0) + 2; addMood(2); return null; }, { end: 'VIC_EXPOSE' }],
    endVicAna: [N_('At 5 a.m. you meet Ana at the staff door with her passport and her one suitcase. She doesn\'t say anything until you\'re at the station.', 'الساعة ٥ الصبح تقابل آنا عند باب الموظفين ومعك جوازها، ومعها شنطتها الوحيدة. ما تقول ولا كلمة لين توصلون المحطة.'),
      A('sad', 'My mother will open the shop late today. She will cry. Then she will make me try on every fabric. Pistachio first.', 'أمي بتفتح المحل متأخر اليوم. بتبكي. وبعدين بتخليني أجرّب كل قماش. الفستقي أول.'),
      N_('The train goes. You walk back into town with your bag. You never sleep at the Grand again. Victor never finds out who opened the safe. He suspects everyone, which is its own small kind of justice.', 'القطار يمشي. وترجع للبلدة بشنطتك. وعمرك ما تنام في الغراند مرة ثانية. فيكتور عمره ما يعرف مين فتح الخزنة. يشك في الكل، وهذا نوع صغير من العدالة.'),
      st => { take('passport'); addMood(1); return null; }, { end: 'VIC_ANA' }],
    endVicKick: [{ show: [{ id: 'kell', e: 'neutral' }] }, N_('Kell walks you to the door. He carries your bag for you, which is somehow more frightening than if he threw it.', 'كيل يمشيك للباب. يشيل شنطتك عنك، وهذا بطريقة ما أخوف من لو رماها.'),
      K('neutral', 'Don\'t come back. I mean that kindly.', 'لا ترجع. أقولها بلطف.'),
      { end: 'VIC_KICK' }],
    endVicFire: [N_('You go back in. The corridor is a tunnel of black. You find the office door by touch. It\'s hot.', 'ترجع داخل. الممر نفق أسود. تلقى باب المكتب باللمس. حار.'),
      N_('You never find the ledger. They find you, in the morning, with your hand still on the handle.', 'عمرك ما تلقى الدفتر. هم يلقونك، الصبح، ويدك لسا على المقبض.'),
      N_('Victor sends flowers to the funeral. A big wreath. The card says "Everyone is welcome."', 'فيكتور يرسل ورد للعزا. إكليل كبير. والكرت مكتوب فيه «الكل مرحب فيه».'),
      { end: 'VIC_FIRE' }]
  });

  /* ---------- topics ---------- */
  GAME.TOPICS.victor = [
    { id: 'meet', once: true, label: T('"Who are you?"', '«مين أنت؟»'), if: s => !inV(s), run: s => { s.met.victor = true; return [V('smile', 'Victor. I own the Grand, and a few other things. Most things, eventually. Come and see me at the hotel. Everyone is welcome.', 'فيكتور. أملك الغراند، وكم شي ثاني. وأغلب الأشياء، بالآخر. تعال زورني في الفندق. الكل مرحب فيه.')]; } },
    { id: 'favour', label: T('"What\'s the next favour?"', '«وش الخدمة الجاية؟»'), if: s => inV(s) && !s.f.vAsked && s.f.vFavDay !== s.day && (s.f.vFav || 0) < 4, cls: 'main', run: [{ jump: 'vicFavour' }] },
    { id: 'favour5', label: T('"You said there was a big one."', '«قلت فيه خدمة كبيرة.»'), if: s => inV(s) && !s.f.vAsked && (s.f.vFav || 0) >= 4 && !s.f.vFinaleDone, cls: 'main', run: [{ jump: 'vicFinale' }] },
    { id: 'reportEnv', label: T('Report on the envelope', 'تبلّغه عن الظرف'), if: s => inV(s) && s.f.vAsked === 'env' && s.f.vEnvDone, run: s => { const ok = s.f.vEnvDone === 'given'; s.f.vAsked = null; GAME.SCRIPTS.vicDone(s, 'env', !ok); return [V('smile', ok ? 'He gave it back? How sweet. Everyone has a price. We just haven\'t found his yet.' : 'You didn\'t give it to him. Interesting. I like interesting. Up to a point.', ok ? 'رجّعه؟ يا حلاته. الكل له سعر. بس للحين ما لقينا سعره.' : 'ما عطيته. مثير. أحب الأشياء المثيرة. لحد معين.')]; } },
    { id: 'reportPhotos', label: T('Hand over the petition photos', 'تسلّمه صور العريضة'), if: s => inV(s) && s.f.vAsked === 'photos' && s.f.vPhotoDone, run: s => { const real = s.f.vPhotoDone === 'real'; s.f.vAsked = null; GAME.SCRIPTS.vicDone(s, 'photos', !real); if (!real) addSusp('victor', 1); return [V(real ? 'smile' : 'angry', real ? 'Sami. Marco. That florist. The old lady with the scarf. Thank you. I\'ll pay them all a little visit.' : 'Every single one is blurred. Remarkable. Your hands must shake terribly.', real ? 'سامي. ماركو. بياعة الورد. والعجوز أم الشال. شكراً. بزورهم كلهم زيارة صغيرة.' : 'كلها مغبشة. شي عجيب. لازم يدينك ترجف بشكل فظيع.')]; } },
    { id: 'reportMaya', label: T('Report on Maya', 'تبلّغه عن مايا'), if: s => inV(s) && s.f.vAsked === 'maya' && s.f.vMayaDone, run: s => { const did = s.f.vMayaDone === 'did'; s.f.vAsked = null; GAME.SCRIPTS.vicDone(s, 'maya', !did); return [V('smile', did ? 'She threw a fish at you? Wonderful. Fish are cheap. Berths are not.' : 'She knew before you got there. I wonder who told her.', did ? 'رمت عليك سمكة؟ رائع. السمك رخيص. والمراسي لا.' : 'كانت تدري قبل لا توصل. يا ترى مين قال لها.')]; } },
    { id: 'reportPack', label: T('Report on the parcel', 'تبلّغه عن الطرد'), if: s => inV(s) && s.f.vAsked === 'pack' && s.f.vPackDone, run: s => { const did = s.f.vPackDone === 'did'; s.f.vAsked = null; GAME.SCRIPTS.vicDone(s, 'pack', !did); if (!did) addSusp('victor', 1); return [V(did ? 'smile' : 'angry', did ? 'Delivered. Mrs Hart will sleep well tonight. We all do our bit.' : 'The client never received it. Parcels don\'t just vanish, {name}. People make them vanish.', did ? 'وصل. مدام هارت بتنام زين الليلة. كلنا نسوي اللي علينا.' : 'العميلة ما استلمته. الطرود ما تختفي لحالها يا {name}. الناس يخفونها.')]; } },
    { id: 'whyme', once: true, label: T('"Why me?"', '«ليش أنا؟»'), if: s => inV(s), run: [V('smile', 'Because you\'ve been inside every house in Saltmere. You know where they keep their keys and their grief. That\'s worth more than a suite.', 'لأنك دخلت كل بيت في سولتمير. تعرف وين يحطون مفاتيحهم وحزنهم. وهذا يسوى أكثر من جناح.'), V('neutral', 'And because you came here with nothing. People with nothing are so easy to give things to.', 'ولأنك جيت هنا وما معك شي. الناس اللي ما معهم شي سهل مرة تعطيهم أشياء.')] },
    { id: 'past', once: true, label: T('Ask where he grew up', 'تسأله وين تربى'), if: s => inV(s) && (s.trust.victor || 0) >= 2, run: [V('neutral', 'Fisher\'s Row. Number 3. Damp, cold, six of us. My father fixed nets for men who laughed at him. I promised myself I\'d own the street one day. Now I will. Then I\'ll knock it down.', 'شارع الصيادين. رقم ٣. رطب، بارد، ستة أشخاص. أبوي كان يصلّح شباك لرجال يضحكون عليه. ووعدت نفسي إني بملك الشارع يوم. والحين بملكه. وبعدين بهده.')] }
  ];
  GAME.TOPICS.kell = [
    { id: 'talk', once: true, label: T('Ask him what he\'s reading', 'تسأله وش يقرا'), run: s => { addTrust('kell', 1); return [K('neutral', 'Poetry.', 'شعر.'), N_('He shows you. It\'s poetry. He doesn\'t explain.', 'يوريك. شعر. وما يشرح.')]; } },
    { id: 'rosa', once: true, label: T('Ask about the woman in the photo, in Fisher\'s Row', 'تسأله عن المرأة اللي في الصورة، في شارع الصيادين'), if: s => s.f.vKellPhoto || s.f.vSawRosa, run: s => { addTrust('kell', 2); return [K('sad', 'My sister. Rosa. Number 12. Twenty years. He bought the street, then an "inspector" said her house was unsafe. It isn\'t. I grew up in it.', 'أختي. روزا. رقم ١٢. عشرين سنة. اشترى الشارع، وبعدين «مفتش» قال بيتها مو آمن. وهو آمن. تربيت فيه.'), K('sad', 'He gave me a job the same week. So I\'d be grateful.', 'عطاني شغل بنفس الأسبوع. عشان أكون ممتن.')]; } },
    { id: 'turn', once: true, label: T('"Will you say that in front of the town?"', '«تقدر تقولها قدام البلدة؟»'), if: s => s.f.vSawRosa && (s.trust.kell || 0) >= 3, need: s => s.f.vLedger, why: T('He needs to see you have proof, not just words.', 'يحتاج يشوف إن معك دليل، مو بس كلام.'), run: s => { s.f.vKell = true; return [K('neutral', 'You read the ledger.', 'قريت الدفتر.'), K('neutral', 'If you stand up, I\'ll stand up. Not before. I\'m big, not brave.', 'لو قمت أنت، بقوم. مو قبل. أنا كبير، مو شجاع.')]; } }
  ];
  GAME.TOPICS.ana = [
    { id: 'home', once: true, label: T('Ask about home', 'تسألها عن بلدها'), need: s => (s.trust.ana || 0) >= 2, why: T('She smiles and says she must finish. Help her a few times first.', 'تبتسم وتقول لازم تخلّص. ساعدها كم مرة أول.'), run: s => { quest('q_v_ana', 'active'); return [A('sad', 'Mr Victor keeps my passport. For safety, he says. I owe the agency four thousand dollars. I make forty a week after "room and food". You do the sum.', 'السيد فيكتور يحتفظ بجوازي. عشان الأمان، يقول. علي للوكالة أربعة آلاف دولار. وأطلع أربعين بالأسبوع بعد «السكن والأكل». احسبها أنت.'), A('sad', 'One hundred weeks. If nothing breaks. Something always breaks.', 'مية أسبوع. إذا ما انكسر شي. ودايم ينكسر شي.')]; } },
    { id: 'swan', label: T('Ask for a towel swan', 'تطلب بجعة منشفة'), if: s => (s.trust.ana || 0) >= 3 && !doneToday('swan'), run: s => { onceToday('swan'); addMood(1); return [{ c: 'ana', e: 'smile', t: fresh('swanL', [T('A swan. With a tiny hat. Because you are special guest.', 'بجعة. بطاقية صغيرة. لأنك ضيف خاص.'), T('Today: a swan is angry. See his eyebrows? Is Mr Victor swan.', 'اليوم: البجعة معصبة. تشوف حواجبه؟ هذي بجعة السيد فيكتور.'), T('Two swans, kissing. Bella says is unprofessional. Bella is jealous.', 'بجعتين، يتباوسون. بيلا تقول مو احترافي. بيلا غيرانة.')]) }]; } },
    { id: 'pp', label: T('Give Ana her passport', 'تعطي آنا جوازها'), if: s => has('passport') && !s.f.vFinaleDone, run: s => [A('shock', 'This is... how? No. If he knows it\'s gone, he will know it was me.', 'هذا... كيف؟ لا. لو عرف إنه راح، بيعرف إنها أنا.'), A('sad', 'Keep it for me. Until the right day. Then, the morning train.', 'خله عندك لي. لين اليوم المناسب. وبعدين، قطار الصبح.')] }
  ];
  GAME.TOPICS.bella = [
    { id: 'gossip', label: T('"Any gossip?"', '«فيه سوالف؟»'), if: s => !doneToday('bellaG'), run: s => { onceToday('bellaG'); s.f.bellaChats = (s.f.bellaChats || 0) + 1; return [{ c: 'bella', e: 'smile', t: fresh('bellaGo', [T('Room 12 has been here three weeks and hasn\'t left the room once. Room service says he\'s writing a novel. Housekeeping says it\'s about us.', 'غرفة ١٢ له ثلاث أسابيع وما طلع من الغرفة ولا مرة. خدمة الغرف تقول يكتب رواية. والتنظيف يقولون الرواية عننا.'), T('The councillor came in yesterday with an empty briefcase and left with a full one. I\'m sure it was sandwiches.', 'عضو المجلس دخل أمس بشنطة فاضية وطلع بشنطة مليانة. أكيد كانت سندويشات.'), T('Victor once fired a waiter for smiling with teeth. He says teeth are "for closing deals".', 'فيكتور مرة فصل جرسون لأنه ابتسم وأسنانه طالعة. يقول الأسنان «لإغلاق الصفقات».'), T('Kell reads poetry on his break. If you tell anyone I told you, I\'ll deny it, and so will Kell, terrifyingly.', 'كيل يقرا شعر في استراحته. لو قلت لأحد إني قلت لك، بنكر، وكيل بينكر بعد، بشكل مرعب.')]) }]; } },
    { id: 'code', once: true, label: T('Ask what numbers Victor uses for everything', 'تسألها وش الأرقام اللي يستخدمها فيكتور لكل شي'), if: s => inV(s) && (s.f.bellaChats || 0) >= 2, run: s => { s.f.vCode = true; return [B('neutral', 'Ha! Zero-three-zero-seven. March the seventh, the day he bought this place. Alarm, phone, luggage, probably his heart. Why?', 'ها! صفر-ثلاثة-صفر-سبعة. سبعة مارس، يوم اشترى المكان. الجرس، والجوال، والشنط، ويمكن قلبه بعد. ليش؟'), B('shock', '...Don\'t answer that.', '...لا ترد.')]; } },
    { id: 'card', once: true, label: T('Ask to borrow the master key card', 'تطلب تستلف كرت المفتاح الرئيسي'), if: s => inV(s) && (s.f.bellaChats || 0) >= 3, run: s => { give('keycard'); return [B('neutral', 'For "towels"? Sure. For towels.', 'عشان «المناشف»؟ أكيد. عشان المناشف.'), B('sad', 'He docked Ana a week\'s pay because a guest lost an earring. Bring it back by Friday. Or don\'t, and I\'ll say you stole it.', 'خصم من آنا راتب أسبوع لأن ضيف ضيّع حلق. رجّعه قبل الجمعة. أو لا، وبقول إنك سرقته.')]; } }
  ];
  /* favour targets in town: Rex, Olivia, Maya, Cliff Road */
  GAME.TOPICS.irene.push({ id: 'gpack', label: T('Give her the "G" parcel', 'تعطيها طرد «G»'), if: s => has('gpack'), cls: 'main', run: s => { take('gpack'); s.f.vPackDone = 'irene'; s.f.vPills = true; return [{ c: 'irene', e: 'angry', t: T('A whole box. I\'ll keep this somewhere very safe. When someone finally asks, I\'ll have the label, the pills and the lab report. Thank you.', 'علبة كاملة. بحطها في مكان آمن مرة. ولما أحد أخيراً يسأل، بيكون عندي الملصق، والحبوب، وتقرير المختبر. شكراً.') }]; } });

  Object.assign(GAME.END, {
    VIC_DARK: { who: 'victor', title: T('Assistant to the director', 'مساعد المدير'), after: T('Victor\'s chapter is complete. You have a suite. You have no friends.', 'خلص فصل فيكتور. عندك جناح. وما عندك أصحاب.'), lesson: T('Victor: everything free costs something. Usually, you.', 'فيكتور: كل شي ببلاش له ثمن. وغالباً، الثمن أنت.') },
    VIC_EXPOSE: { who: 'victor', title: T('Everyone is welcome', 'الكل مرحب فيه'), after: T('Victor\'s chapter is complete. Fisher\'s Row is saved.', 'خلص فصل فيكتور. وشارع الصيادين انقذ.'), lesson: T('Victor: a town is just people who decide to stand up at the same time.', 'فيكتور: البلدة بس ناس قرروا يقومون بنفس الوقت.') },
    VIC_ANA: { who: 'victor', title: T('The morning train', 'قطار الصبح'), after: T('Victor\'s chapter is complete. One person got out.', 'خلص فصل فيكتور. وشخص واحد طلع.'), lesson: T('Victor: you can\'t always beat the man. You can sometimes open one door.', 'فيكتور: مو دايم تقدر تغلب الرجّال. بس أحياناً تقدر تفتح باب واحد.') },
    VIC_KICK: { who: 'victor', title: T('Shown the door', 'طلّعوك'), after: T('Victor\'s chapter is complete.', 'خلص فصل فيكتور.'), lesson: T('Victor: saying no is expensive. Saying yes costs more.', 'فيكتور: «لا» غالية. و«إيه» أغلى.') },
    VIC_FIRE: { who: 'victor', death: true, title: T('The west wing', 'الجناح الغربي'), after: T('You died. The game warned you: the smoke was black and low. Load a save to try again.', 'مت. اللعبة حذرتك: الدخان كان أسود وواطي. حمّل حفظ عشان تحاول مرة ثانية.') }
  });

  GAME.EVENTS.push(
    { id: 'kickVic', when: s => inV(s) && (s.susp.victor || 0) >= 3, run: [{ jump: 'endVicKick' }] },
    { id: 'wakeV', when: s => inV(s) && s.f.newDay, run: s => { s.f.newDay = false; s.loc = 'hotel_suite';
      return [{ n: fresh('wakeV', [T('Morning. A breakfast tray outside your door you didn\'t order. A card: "Rise and shine. — V."', 'صبح. صينية فطور عند بابك ما طلبتها. وكرت: «اصحَ ونوّر. — ف.»'), T('The curtains open by themselves at seven. You didn\'t know curtains could do that. You don\'t like it.', 'الستاير تنفتح لحالها الساعة سبعة. ما كنت تدري إن الستاير تقدر تسوي كذا. وما يعجبك.'), T('Gulls on the balcony, and below them the whole of Fisher\'s Row, very small.', 'نوارس على البلكونة، وتحتهم شارع الصيادين كله، صغير مرة.'), T('Somebody has unpacked your bag and hung your three shirts in a wardrobe built for fifty.', 'أحد فضّى شنطتك وعلّق قمصانك الثلاثة في دولاب يكفي خمسين.')]) }]; } },
    { id: 'vFire', once: true, when: s => inV(s) && dV(s) >= 3 && s.slot === NIGHT && houseOf(s.loc) === 'victor', run: s => GAME.SCRIPTS.vicFire(s) },
    { id: 'vFinaleForce', when: s => inV(s) && !s.f.vFinaleDone && dV(s) >= 7 && s.slot === 3, run: s => [N_('Kell finds you. "He wants you. Office. Now."', 'كيل يلقاك. «يبيك. المكتب. الحين.»')].concat(GAME.SCRIPTS.vicFinale(s)) }
  );

  /* favour hooks in town (Rex, Olivia, Maya, Margaret's door) are added in town.js data via flags; see GAME.TOPICS there */
  GAME.VIC = { evidence };
  /* ---------- favour targets around town ---------- */
  GAME.LOC.cliff_road.spots.push({ x: 50, y: 70, label: T('Leave the parcel at the door', 'تحط الطرد عند الباب'), if: s => has('gpack'), cls: 'risk', run: s => { take('gpack'); s.f.vPackDone = 'did'; return [N_('You put the parcel on the step and walk away fast. Behind you, three locks turn. You don\'t look back.', 'تحط الطرد على العتبة وتمشي بسرعة. ووراك، ثلاث أقفال تلف. ما تلتفت.')]; } });
  GAME.LOC.harbor.spots.push({ x: 64, y: 80, label: T('Throw the parcel in the sea', 'ترمي الطرد في البحر'), if: s => has('gpack'), run: s => { take('gpack'); s.f.vPackDone = 'sea'; return [N_('It floats for a second, then sinks. A gull dives after it, thinks better of it, and looks at you as if you\'ve wasted its time.', 'يطفو ثانية، وبعدين يغرق. نورس ينزل وراه، ويغير رايه، ويطالعك كأنك ضيعت وقته.')]; } });
  GAME.TOPICS.rex = GAME.TOPICS.rex || [];
  GAME.TOPICS.rex.push({ id: 'env', label: T('Give him Victor\'s envelope', 'تعطيه ظرف فيكتور'), if: s => has('envelope'), cls: 'risk', run: s => { take('envelope'); s.f.vEnvDone = 'given'; return [
    { c: 'rex', e: 'angry', t: T('From Victor? Let me guess. "For my daughter\'s birthday." He knows her name. He knows her birthday. That\'s the point.', 'من فيكتور؟ خلني أخمّن. «لعيد ميلاد بنتك.» يعرف اسمها. يعرف عيد ميلادها. وهذا المقصود.') },
    N_('He doesn\'t open it. He pushes it back across the desk with one finger.', 'ما يفتحه. يرجّعه على المكتب بإصبع واحد.'),
    { c: 'rex', e: 'sad', t: T('Tell him no. And kid, whatever he\'s giving you, it\'s not free.', 'قل له لا. ويا ولد، أي شي يعطيك إياه، مو ببلاش.') }]; } },
    { id: 'envOpen', label: T('Tell him what\'s in Victor\'s envelope instead', 'تقول له وش اللي في ظرف فيكتور بدال'), if: s => has('envelope'), run: s => { take('envelope'); s.f.vEnvDone = 'told'; addTrust('rex', 2); return [N_('You open it in front of him. Cash, and a card: "For Lily\'s birthday. Everyone is welcome. — V."', 'تفتحه قدامه. كاش، وكرت: «لعيد ميلاد ليلي. الكل مرحب فيه. — ف.»'), { c: 'rex', e: 'angry', t: T('I\'m keeping the card. Not the cash. You keep your head down, and you keep anything else like this for me. One day I\'ll need it.', 'بخلي الكرت. مو الكاش. وأنت خلك هادي، وأي شي ثاني مثل هذا خلّه لي. يوم من الأيام بحتاجه.') }]; } });
  GAME.TOPICS.olivia = GAME.TOPICS.olivia || [];
  GAME.TOPICS.olivia.push({ id: 'photos', label: T('Take photos of the petition signers (for Victor)', 'تصوّر الموقّعين على العريضة (لفيكتور)'), if: s => s.f.vPhotoTask && !s.f.vPhotoDone, run: s => [N_('Olivia is talking to Martha. Nobody is looking at you.', 'أوليفيا تكلم مارثا. محد يطالعك.'), { menu: [
      { t: T('Take clear photos', 'تصوّر صور واضحة'), cls: 'risk', then: [st => { st.f.vPhotoDone = 'real'; return null; }, N_('Click. Sami, signing with his tongue out. Click. Martha. Click. Stella from the florist. You feel like you\'re photographing them through a gun sight.', 'كليك. سامي، يوقّع ولسانه طالع. كليك. مارثا. كليك. ستيلا بياعة الورد. وتحس إنك تصوّرهم من منظار سلاح.')] },
      { t: T('Take blurry photos on purpose', 'تصوّر صور مغبشة بقصد'), then: [st => { st.f.vPhotoDone = 'blur'; return null; }, N_('You shake the phone a little each time. Ghosts at a table. Olivia sees you and waves. You wave back and feel terrible anyway.', 'تهز الجوال شوي كل مرة. أشباح عند طاولة. أوليفيا تشوفك وتأشر لك. وتأشر لها وتحس بشعور سيء على كل حال.')] },
      { t: T('Tell Olivia what Victor asked', 'تقول لأوليفيا وش طلب فيكتور'), cls: 'main', then: [st => { st.f.vPhotoDone = 'blur'; st.f.oliviaAlly = true; addTrust('olivia', 2); return null; }, { c: 'olivia', e: 'angry', t: T('He wants a list? Fine. Take a photo of THIS.', 'يبي قائمة؟ طيب. صوّر هذا.') }, N_('She holds up the petition: three hundred and twelve names. "Tell him it\'s growing."', 'ترفع العريضة: ثلاث مية واثنعش اسم. «قل له إنها تكبر.»')] }
    ] }] });
  GAME.TOPICS.maya = GAME.TOPICS.maya || [];
  GAME.TOPICS.maya.push({ id: 'berth', label: T('Give her Victor\'s message about the berth', 'تبلّغها رسالة فيكتور عن المرسى'), if: s => s.f.vMayaTask && !s.f.vMayaDone, run: s => [{ menu: [
      { t: T('Deliver it, word for word', 'تبلّغها، حرف بحرف'), cls: 'risk', then: [st => { st.f.vMayaDone = 'did'; addTrust('maya', -2); return null; }, { c: 'maya', e: 'angry', t: T('Reviewed. Two hundred. "The next offer is lower." You came all the way down here to say that to my face?', 'انراجع. مية وخمسين. «العرض الجاي أقل.» نزلت لين هنا عشان تقولها في وجهي؟') }, N_('She throws a mackerel at you. It\'s a good throw.', 'ترمي عليك سمكة إسقمري. رمية حلوة.')] },
      { t: T('Warn her instead', 'تحذرها بدال'), cls: 'main', then: [st => { st.f.vMayaDone = 'warned'; addTrust('maya', 2); return null; }, { c: 'maya', e: 'neutral', t: T('He sent you to scare me and you told me instead. Well. I owe you a fish. A thrown one, but gently.', 'أرسلك تخوّفني وأنت قلت لي بدال. طيب. لك علي سمكة. مرمية، بس بلطف.') }] }
    ] }] });

})();
