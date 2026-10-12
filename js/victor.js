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
    if (!inV(s)) return has('postcard') ? T('Locked. A brass plate: "V. — PRIVATE". The same V as on your postcard, in a better font.', 'مقفول. لوحة نحاس: «ف. — خاص». نفس الـ«ف.» اللي على كرتك، بخط أحلى.') : T('Locked. A brass plate: "V. — PRIVATE".', 'مقفول. لوحة نحاس: «ف. — خاص».'); // links.js
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
        { x: 60, y: 62, label: s => (s.slot === NIGHT ? T('Sleep', 'نام') : T('Lie down', 'تمدد')), run: s => GAME.SCRIPTS.bed(s) },
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
      return [N_('0-3-0-7. The date he bought the hotel. The safe opens. Cash, deeds, a revolver you don\'t touch, and a small stack of passports. Ana\'s is on top.', '٠-٣-٠-٧. تاريخ شرائه للفندق. الخزنة تنفتح. كاش، وصكوك، ومسدس ما تلمسه، ومجموعة جوازات صغيرة. جواز آنا فوق.'), N_('You take hers. The others aren\'t yours to decide. You make a note of the names.', 'تاخذ جوازها. الباقي مو لك تقرر فيه. وتسجل الأسماء.'),
        /* links.js: the safe code is the date on your father's postcard, and his file is inside */
        st => has('postcard') ? [N_('0307. 7 March. The date on your father\'s postcard.', '٠٣٠٧. ٧ مارس. نفس التاريخ اللي على كرت أبوك.')] : null,
        st => has('postcard') ? (st.f.vFile = true, [N_('Under the deeds, a thin folder with your father\'s name on it. "J. — personal loans, 1998–2023. Called in by Grand Holdings after death. Property sold. Settled." At the bottom, in Victor\'s handwriting: "Should have torn this up."', 'تحت الصكوك، ملف خفيف عليه اسم أبوك. «ج. — قروض شخصية، ١٩٩٨–٢٠٢٣. طالبت فيها غراند القابضة بعد الوفاة. العقار انباع. مسدّد.» وتحت، بخط فيكتور: «كان لازم أشقّه.»')]) : null]; },

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
      st => st.f.vPass ? [N_('Afterwards you give Officer Rex the names you copied from the safe. By Friday, four more people have their passports back.', 'بعدها تعطي الضابط ريكس الأسماء اللي سجلتها من الخزنة. وقبل الجمعة، أربعة ناس ثانيين يرجع لهم جوازهم.')] : null, // links.js
      st => st.f.bellaAlly ? [N_('Bella is the one who unlocked the ballroom doors. She told you she would.', 'بيلا هي اللي فتحت أبواب القاعة. قالت لك إنها بتفتحها.')] : null, // links.js
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
  /* favour targets in town: Rex, Olivia, Maya, Cliff Road */

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

  /* helpers the character files (js/chars/*.js) borrow from this chapter */
  GAME.H.victor = { inV, V, K, A, B };
})();
