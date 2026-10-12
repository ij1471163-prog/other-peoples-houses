/* =====================================================================
   Chapter 2 — Leo
   Leo (19) lives in the old boathouse on the harbor. He draws, does
   deliveries, owes rent to Victor's company, has stopped answering his
   father, and carries a secret about the night Daniel died.
   ===================================================================== */
'use strict';
const L_ = (e, en, ar) => ({ c: 'leo', e, t: T(en, ar) });
const F_ = (e, en, ar) => ({ c: 'frank', e, t: T(en, ar) });
const ch2 = s => s.ch === 2 && !s.f.leoEnded;
const d2 = s => s.day - (s.f.ch2Day || 0); // days since chapter 2 began

/* Leo and Frank live in js/chars/leo.js and js/chars/frank.js */
Object.assign(GAME.ITEMS, {
  sketch: { name: T('Leo\'s drawing of you', 'رسمة ليو لك'), desc: T('You look less sad in it than you feel.', 'شكلك فيها أقل حزن من اللي {تحسه|تحسينه}.') },
  groceries: { name: T('Groceries', 'مقاضي'), desc: T('Enough for one real dinner.', 'تكفي لعشا حقيقي واحد.') }
});
Object.assign(GAME.QUESTS, {
  q_couch: { title: T('A sofa by the sea', 'كنب جنب البحر'), hint: T('Leo said you can sleep on his sofa in the boathouse. No questions.', 'ليو قال {تقدر تنام|تقدرين تنامين} على كنبته في بيت القوارب. بدون أسئلة.') },
  q_deliver: { title: T('Ride along', 'معه بالتوصيل'), hint: T('Afternoons, Leo does deliveries from Main Street. He could use a second pair of hands.', 'وقت العصر، ليو يوصّل من الشارع الرئيسي. يحتاج يد ثانية.') },
  q_draw: { title: T('The gull lesson', 'درس النوارس'), hint: T('Evenings, Leo draws on the dock behind the boathouse.', 'وقت المغرب، ليو يرسم على الرصيف ورا بيت القوارب.') },
  q_rent: { title: T('Three months behind', 'متأخر ثلاث شهور'), hint: T('Someone from Victor\'s company wants the rent. Leo doesn\'t have it.', 'أحد من شركة فيكتور يبي الإيجار. وليو ما عنده.') },
  q_father: { title: T('Frank\'s Motors', 'كراج فرانك'), hint: T('Leo\'s father runs the garage at the top of town. Leo won\'t go near it.', 'أبو ليو عنده الكراج اللي فوق في البلدة. وليو ما يقرّب منه.') },
  q_secret2: { title: T('What Leo won\'t draw', 'اللي ما يرسمه ليو'), hint: T('Leo tears up one drawing every time: a car. His loft is private.', 'ليو يقطّع رسمة وحدة كل مرة: سيارة. والسطح حقه خاص.') },
  q_final2: { title: T('Deadline', 'آخر موعد'), hint: T('The rent, the scholarship, his father. Talk to Leo tonight, at the boathouse.', 'الإيجار، والمنحة، وأبوه. كلّم ليو الليلة في بيت القوارب.') }
});

/* ---------------- locations ---------------- */
const leoHome = s => { const w = GAME.CHAR.leo.where(s); return !!w && ['boathouse', 'loft', 'bh_bath', 'dock'].includes(w); };
Object.assign(GAME.LOC, {
  boathouse: {
    name: T('Leo\'s boathouse', 'بيت القوارب حق ليو'), mapName: T('The boathouse', 'بيت القوارب'), bg: 'boathouse', house: 'leo', charX: 52, rooms: ['loft', 'bh_bath', 'dock'],
    exits: [
      { to: 'harbor', x: 6, y: 86, label: T('Out to the harbor', '{اطلع|اطلعي} للميناء') },
      { to: 'loft', x: 84, y: 18, label: T('The loft (Leo\'s room)', 'السطح (غرفة ليو)'), risk: s => leoHome(s) },
      { to: 'bh_bath', x: 60, y: 86, label: T('Bathroom', 'الحمام'), lock: s => GAME.SCRIPTS.bathLock2(s) },
      { to: 'dock', x: 94, y: 70, label: T('Back door to the dock', 'الباب الخلفي للرصيف') }
    ],
    spots: [
      { x: 52, y: 28, label: T('The mural', 'الجدارية'), run: s => [{ n: T('Gulls over a blue sea, painted straight onto the wall. Signed in the corner: "L. — not for sale, not for Victor."', 'نوارس فوق بحر أزرق، مرسومة على الجدار مباشرة. موقّعة في الزاوية: «L. — مو للبيع، ومو لفيكتور.»') }] },
      { x: 80, y: 46, label: T('The easel', 'الحامل'), run: s => [{ n: T('A half-finished painting of a sunrise. Or a house on fire. Hard to say yet. Maybe that\'s the point.', 'لوحة نصها مخلص لشروق شمس. أو بيت يحترق. صعب تعرف للحين. يمكن هذا المقصود.') }] },
      { x: 48, y: 58, label: s => (s.slot === NIGHT ? T('Sleep on the sofa', '{نام|نامي} على الكنب') : T('Lie on the sofa', '{تمدد|تمددي} على الكنب')), run: s => GAME.SCRIPTS.bed(s) }
    ]
  },
  loft: {
    name: T('The loft', 'السطح'), bg: 'loft', house: 'leo', private: true, exits: [{ to: 'boathouse', x: 6, y: 86 }],
    onEnter: s => GAME.SCRIPTS.enterLoft(s),
    spots: [
      { x: 68, y: 62, label: T('Sketchbooks', 'دفاتر الرسم'), risk: s => leoHome(s), run: s => GAME.SCRIPTS.sketchbooks(s) },
      { x: 84, y: 56, label: T('His phone, charging', 'جواله، على الشاحن'), risk: s => leoHome(s), run: s => GAME.SCRIPTS.leoPhone(s) },
      { x: 30, y: 70, label: T('Envelope under the mattress', 'ظرف تحت المرتبة'), risk: s => leoHome(s), run: s => GAME.SCRIPTS.envelope(s) }
    ]
  },
  bh_bath: {
    name: T('The boathouse bathroom', 'حمام بيت القوارب'), bg: 'bh_bath', house: 'leo', canWait: false, exits: [{ to: 'boathouse', x: 6, y: 86 }],
    spots: [{ x: 54, y: 60, label: T('Take a shower', '{تروّش|تروّشي}'), run: s => GAME.SCRIPTS.shower(s) }, { x: 24, y: 38, label: T('Mirror', 'المراية'), run: s => [{ n: T('Stickers all round the mirror: gulls, a skull with a party hat, "YOU\'RE DOING FINE (probably)".', 'ستيكرات حول المراية: نوارس، جمجمة لابسة طاقية حفلة، و«أنت ماشي زين (غالباً)».') }] }]
  },
  dock: {
    name: T('The dock', 'الرصيف'), bg: 'dock', house: 'leo', charX: 34, exits: [{ to: 'boathouse', x: 76, y: 66, label: T('Back inside', '{ارجع|ارجعي} داخل') }],
    spots: [{ x: 22, y: 50, label: T('Watch the sea', '{طالع|طالعي} البحر'), run: s => onceToday('sea2') ? (addMood(1), [{ n: T('The water slaps the posts underneath you. It sounds like someone patiently knocking.', 'الموج يضرب الأعمدة تحتك. صوته كأن أحد يطق بصبر.') }]) : [{ n: T('Still knocking.', 'لسا يطق.') }] }]
  },
  garage: { name: T('Frank\'s Motors', 'كراج فرانك'), bg: 'garage', charX: 30, exits: [{ to: 'street', x: 6, y: 86 }],
    spots: [{ x: 84, y: 30, label: T('Office window', 'شباك المكتب'), run: s => { s.f.sawOffice = true; return [{ n: T('Through the glass: a desk, a calendar from three years ago, and a child\'s drawing of a car taped to the wall, yellowed. Signed "LEO, 7".', 'من ورا الزجاج: مكتب، ورزنامة من ثلاث سنين، ورسمة طفل لسيارة ملصوقة على الجدار، صايرة صفرا. موقّعة «ليو، ٧ سنين».') }]; } }] }
});
/* harbor gets a real door to the boathouse once you know Leo */
(function () {
  const H = GAME.LOC.harbor;
  H.spots.forEach(sp => { if (sp.x === 80 && sp.y === 52) sp.if = s => !s.f.metLeo; });
  H.exits.push({ to: 'boathouse', x: 80, y: 54, label: T('Leo\'s boathouse', 'بيت القوارب حق ليو'), if: s => !!s.f.metLeo && !s.f.leoEnded, lock: s => (s.f.leoEnded ? T('Locked.', 'مقفول.') : null) });
  GAME.MAP.push({ to: 'boathouse', if: s => !!s.f.metLeo && !s.f.leoEnded }, { to: 'garage', place: 'garage', if: s => s.ch === 2, lock: s => s.slot === NIGHT });
  ART.PLACES.boathouse = [58, 68]; ART.PLACES.garage = [63, 15];
  const m0 = ART.map;
  ART.map = s => m0(s).replace(/<rect width="1600" height="900" fill="#0a1030"|<rect width="1600" height="900" fill="#ff7a3a"|<text x="800" y="880"/, m => {
    const t = (typeof slotName === 'function' && GAME.S) ? slotName() : 'noon';
    const x = 63 * 16, y = 15 * 9;
    return `<g stroke="#241f2b" stroke-width="4" stroke-linejoin="round"><rect x="${x - 80}" y="${y - 10}" width="160" height="70" fill="#c8ccd2"/><rect x="${x - 86}" y="${y - 26}" width="172" height="20" fill="#2f4a72"/><rect x="${x - 50}" y="${y + 14}" width="100" height="46" fill="${ART.H.lit(t) ? '#ffd27a' : '#6a6e76'}"/></g>` + m;
  });
})();

/* ---------------- scripts ---------------- */
Object.assign(GAME.SCRIPTS, {
  ch2start: s => {
    s.ch = 2; s.f.ended = true; s.f.ch2Day = s.day + 1; s.trust.leo = 0; s.susp.leo = 0;
    const e = s.f.eliasEnd;
    const intro = {
      ELIAS_STAY: N_('Elias goes into the hospital in the city for a month, to get used to the machine. Before he gets on the train he points at the harbor: "The boy in the boathouse needs someone more than I do. Go on."', 'إلياس يدخل مستشفى المدينة شهر، عشان يتعود على الجهاز. قبل ما يركب القطار يأشر على الميناء: «الولد اللي في بيت القوارب محتاج أحد أكثر مني. {روح|روحي}.»'),
      ELIAS_LETTER: N_('Thomas stays a week to sort the house, then locks it and gives you a hug you didn\'t expect. The cottage isn\'t yours. You walk down to the harbor because your legs know the way.', 'توماس يقعد أسبوع يرتب البيت، وبعدين يقفله ويضمك ضمة ما {توقعتها|توقعتيها}. البيت مو لك. {تنزل|تنزلين} للميناء لأن رجولك تعرف الطريق.'),
      ELIAS_PEACE: N_('You post the letters, one by one, at the little post office. Then you have nowhere to be. You walk down to the harbor because your legs know the way.', '{ترسل|ترسلين} الرسايل، وحدة وحدة، من مكتب البريد الصغير. وبعدها ما عندك مكان. {تنزل|تنزلين} للميناء لأن رجولك تعرف الطريق.'),
      ELIAS_KICK: N_('Two nights on the bench outside Sami\'s. Sami brings you tea in the mornings and doesn\'t ask. On the third night, you walk down to the harbor.', 'ليلتين على الكرسي قدام بقالة سامي. سامي يجيب لك شاي الصبح وما يسأل. والليلة الثالثة، {تنزل|تنزلين} للميناء.'),
      ELIAS_GO: N_('You told your mother you\'d come back to her at the end of the month. She cried. You need somewhere to sleep until then, and money for the ticket.', '{قلت|قلتي} لأمك إنك {بترجع|بترجعين} آخر الشهر. بكت. {وتحتاج مكان تنام|وتحتاجين مكان تنامين} فيه لين ذاك الوقت، وفلوس للتذكرة.')
    }[e] || N_('You walk down to the harbor.', '{تنزل|تنزلين} للميناء.');
    return [{ go: 'harbor' }, { show: [] }, intro,
      N_('A delivery bike comes round the corner too fast, skids on the wet boards, and dumps its rider, a bag of noodles and a cracked helmet at your feet.', 'دراجة توصيل تلف الزاوية بسرعة، تتزحلق على الخشب المبلول، وترمي راكبها وكيس نودلز وخوذة مشقوقة عند رجولك.'),
      { show: [{ id: 'leo', e: 'shock' }] },
      L_('shock', 'Okay. Okay. The noodles are fine. That\'s the main thing.', 'طيب. طيب. النودلز سليمة. هذا المهم.'),
      L_('neutral', 'You look like you got kicked out of somewhere. Me too. Well. I walked out. Same thing, different paperwork.', 'شكلك {مطرود|مطرودة} من مكان. أنا بعد. يعني، أنا طلعت بنفسي. نفس الشي، بس الأوراق غير.'),
      { c: 'leo', e: 'neutral', menu: [
        { t: T('Help him pick up the bike', '{تساعده|تساعدينه} يرفع الدراجة'), fx: st => { addTrust('leo', 1); addMood(1); }, then: [L_('smile', 'Respect.', 'احترام.')] },
        { t: T('"Are you alright?"', '«أنت بخير؟»'), then: [L_('neutral', 'Define alright.', 'عرّف «بخير».')] }
      ] },
      L_('neutral', 'I\'ve got a boathouse. There\'s a sofa. It smells like the sea and paint. Rule one: don\'t ask questions. Rule two: I don\'t ask either.', 'عندي بيت قوارب. فيه كنب. ريحته بحر وألوان. القانون الأول: {لا تسأل|لا تسألين} أسئلة. الثاني: وأنا بعد ما أسأل.'),
      L_('smile', 'Rule three: the loft is mine. Stay out of it.', 'الثالث: السطح لي. {لا تطلع|لا تطلعين} له.'),
      { go: 'boathouse' }, { show: [{ id: 'leo', e: 'smile' }] },
      N_('Inside: a sofa the colour of a traffic cone, a mural of gulls on the wall, a TV older than Leo, and a ladder up to the loft.', 'داخل: كنب بلون قمع المرور، وجدارية نوارس على الجدار، وتلفزيون أقدم من ليو، وسلّم للسطح.'),
      st => { st.f.metLeo = true; st.met.leo = true; quest('q_couch', 'done'); quest('q_deliver', 'active'); quest('q_draw', 'active'); return null; },
      { show: [] }, N_('You can sleep on the sofa. Tonight, you actually do.', '{تقدر تنام|تقدرين تنامين} على الكنب. والليلة، {تنام|تنامين} فعلاً.')];
  },
  bathLock2: s => {
    if (GAME.CHAR.leo.where(s) !== 'bh_bath') return null;
    return [N_('Locked. Water running, and Leo singing the same four words of a song he clearly doesn\'t know.', 'مقفول. صوت موية، وليو يغني نفس الأربع كلمات من أغنية واضح إنه ما يعرفها.'), { menu: [
      { t: T('Knock', '{تطق|تطقين}'), then: [{ c: 'leo', e: 'shock', t: T('OCCUPIED. Unless you\'re the plumber. Are you the plumber? Please be the plumber.', 'مشغول! إلا إذا {أنت السباك|أنتِ السباكة}. {أنت السباك|أنتِ السباكة}؟ {تكفى|تكفين} {كن السباك|كوني السباكة}.') }] },
      { t: T('Come back later', '{ترجع|ترجعين} بعدين'), then: [] }] }];
  },
  riskLeo: (s, extra = 0) => {
    const w = GAME.CHAR.leo.where(s);
    const p = ({ loft: 0.3, bh_bath: 0.12, boathouse: 0.42, dock: 0.18 })[w] ?? 0.06;
    return clamp(p + extra, 0.02, 0.85);
  },
  caughtLeo: s => {
    addSusp('leo', 1); addTrust('leo', -1);
    const n = s.susp.leo || 0;
    const pre = [{ show: [{ id: 'leo', e: 'angry' }] }];
    if (n >= 3) return pre.concat([{ jump: 'endLeoKickSnoop' }]);
    if (n === 1) return pre.concat([L_('angry', 'Rule three. The loft. It was literally rule three.', 'القانون الثالث. السطح. كان حرفياً القانون الثالث.'), { go: 'boathouse' }]);
    return pre.concat([L_('angry', 'Twice. I didn\'t ask you one thing. Not one. And you keep going through my stuff.', 'مرتين. ما سألتك ولا شي. ولا شي. {وأنت تفتش|وأنتِ تفتشين} أغراضي.'), L_('angry', 'Next time, you\'re on Sami\'s bench again.', 'المرة الجاية، {ترجع|ترجعين} لكرسي سامي.'), { go: 'boathouse' }]);
  },
  enterLoft: s => {
    const w = GAME.CHAR.leo.where(s);
    if (w === 'loft') { if (roll(0.3)) return [N_('A floorboard creaks. Leo opens one eye.', 'خشبة تطق. ليو يفتح عين وحدة.'), { jump: 'caughtLeo' }]; return [N_('Leo is asleep up here, one arm hanging off the mattress. He doesn\'t move.', 'ليو نايم هنا، ذراعه متدلية من المرتبة. ما يتحرك.')]; }
    if (roll(GAME.SCRIPTS.riskLeo(s, -0.05))) return [N_('You\'re halfway up the ladder when the front door opens.', '{أنت|أنتِ} بنص السلّم لما ينفتح الباب.'), { jump: 'caughtLeo' }];
    if (!s.f.enteredLoft) { s.f.enteredLoft = true; quest('q_secret2', 'active'); return [N_('His room: a mattress, a round window, a tower of sketchbooks, and the smell of turpentine.', 'غرفته: مرتبة، وشباك دائري، وبرج دفاتر رسم، وريحة تنر.')]; }
    return null;
  },
  sketchbooks: s => {
    if (roll(GAME.SCRIPTS.riskLeo(s, 0.08))) return [N_('You\'re turning pages when you hear him on the ladder.', '{أنت تقلب|أنتِ تقلبين} الصفحات لما {تسمعه|تسمعينه} على السلّم.'), { jump: 'caughtLeo' }];
    s.f.sawSketchbook = true; quest('q_secret2', 'active');
    return [N_('Gulls, boats, Sami, Marco mid-joke, Elias on the Ada. Hundreds of drawings. He\'s really good.', 'نوارس، قوارب، سامي، ماركو بنص نكتة، إلياس على «آدا». مئات الرسومات. وهو شاطر من جد.'),
      N_('Then, page after page of the same thing: a car on its side at night. And a boy your age in the driver\'s seat. Under one, very small: "Daniel. I\'m sorry."', 'وبعدين، صفحة ورا صفحة لنفس الشي: سيارة مقلوبة على جنبها بالليل. وولد بعمرك في كرسي السواق. وتحت وحدة، بخط صغير جداً: «دانيال. آسف.»')];
  },
  leoPhone: s => {
    if (roll(GAME.SCRIPTS.riskLeo(s, 0.12))) return [N_('The phone lights up in your hand. "What are you doing?"', 'الجوال ينور في يدك. «وش {تسوي|تسوين}؟»'), { jump: 'caughtLeo' }];
    s.f.fatherSick = true; s.f.knowsMother = true;
    return [N_('Messages from "Mum", every day: "Did you eat?" He always answers "yes".', 'رسايل من «أمي»، كل يوم: «أكلت؟» ودايم يرد «إيه».'),
      N_('The latest: "Your dad\'s blood pressure has been bad since you left. He won\'t say it. He wants you home."', 'آخر وحدة: «أبوك ضغطه تعبان من يوم طلعت. ما يقولها. بس يبيك ترجع.»')];
  },
  envelope: s => {
    if (roll(GAME.SCRIPTS.riskLeo(s))) return [N_('Paper rustles, too loud.', 'الورق يخشخش، بصوت عالي.'), { jump: 'caughtLeo' }];
    s.f.knowsDebt = true; quest('q_rent', 'active');
    return [N_('A letter on thick cream paper: "Saltmere Grand Holdings. Notice of arrears. Three months. Vacate by Friday." Signed with a smile-shaped flourish: V.', 'خطاب على ورق كريمي سميك: «شركة سولتمير غراند القابضة. إشعار متأخرات. ثلاث شهور. أخلِ المكان قبل الجمعة.» وموقّع بتوقيع على شكل ابتسامة: V.')];
  },

  deliveries: s => {
    s.f.deliverCount = (s.f.deliverCount || 0) + 1; onceToday('deliver'); quest('q_deliver', 'done');
    s.money += 6; addMood(1); if (s.f.deliverCount <= 2) addTrust('leo', 1); advance(1);
    if (s.f.deliverCount === 1) return [
      N_('You ride on the back of the bike, holding six pizzas and your life. A dog chases you down Fisher\'s Row. Leo screams more than you do.', '{تركب|تركبين} ورا على الدراجة، {شايل|شايلة} ست بيتزات وحياتك. كلب يطاردكم في شارع الصيادين. ليو يصارخ أكثر منك.'),
      N_('Wrong address twice. The third house tips you ten dollars and a lemon. Leo splits it with you: six for you, the lemon for him.', 'العنوان غلط مرتين. البيت الثالث يعطيكم عشر دولارات وليمونة. ليو يقسمها معك: ست لك، والليمونة له.'),
      L_('smile', 'You\'re hired. Unpaid. Well, six dollars. And emotional support.', 'تم توظيفك. ببلاش. يعني، ست دولارات. ودعم نفسي.')];
    return [pickOne([
      N_('A big house with a wide garden. Leo stares at it for a long time while you wait for the customer. "Nothing," he says, when you ask.', 'بيت كبير بحديقة واسعة. ليو يطالعه وقت طويل وأنتم تنتظرون الزبون. «ولا شي،» يقول، لما {تسأله|تسألينه}.'),
      N_('You deliver soup to Martha. She tips in biscuits and gossip.', 'توصّلون شوربة لمارثا. تدفع بقشيش بسكويت وسوالف.'),
      N_('Leo takes the long way round so he doesn\'t have to pass the white house on Cliff Road. Every time.', 'ليو ياخذ الطريق الطويل عشان ما يمر قدام البيت الأبيض في شارع الجرف. كل مرة.')]), N_('+ $6', '+ ٦$')];
  },
  drawing: s => {
    s.f.drawCount = (s.f.drawCount || 0) + 1; onceToday('draw'); quest('q_draw', 'done'); addMood(1);
    if (s.f.drawCount <= 2) addTrust('leo', 1);
    advance(1);
    if (s.f.drawCount === 1) return [
      L_('neutral', 'Gulls. Everyone draws them as a "v". They\'re not a "v". They\'re angry bananas with wings.', 'النوارس. الكل يرسمها على شكل «ڤ». هي مو «ڤ». هي موزات معصبة بأجنحة.'),
      N_('Your first gull looks like a croissant. Your second looks like an angry banana. He applauds like you\'ve won an award.', 'أول نورس {رسمته|رسمتيه} شكله كرواسون. الثاني شكله موزة معصبة. ويصفق لك كأنك {فزت|فزتي} بجائزة.')];
    if (s.f.drawCount === 2) { give('sketch'); s.f.sawCrashSketch = true; quest('q_secret2', 'active'); return [
      N_('He draws you without asking, fast, tongue sticking out. Then he tears the page out and gives it to you.', 'يرسمك بدون ما يسأل، بسرعة، ولسانه طالع. وبعدين يقطع الصفحة ويعطيك إياها.'),
      L_('smile', 'You look less sad than when you got here. I drew you how you look now. It\'s a documentary.', 'شكلك أقل حزن من يوم {جيت|جيتي}. رسمتك مثل ما {أنت|أنتِ} الحين. هذا فلم وثائقي.'),
      N_('Then he starts another page: headlights, a wet road. Halfway through he stops and tears it into small pieces.', 'وبعدين يبدأ صفحة ثانية: أنوار سيارة، وطريق مبلول. وبالنص يوقف ويقطّعها قطع صغيرة.')]; }
    s.f.sawCrashSketch = true; quest('q_secret2', 'active');
    return [N_('He starts a car. Headlights, a wet road. Halfway through he stops, tears the page into small pieces, and drops them in the sea.', 'يبدأ يرسم سيارة. أنوار، وطريق مبلول. وبالنص يوقف، يقطّع الورقة قطع صغيرة، ويرميها بالبحر.'),
      L_('sad', 'Bad angle.', 'الزاوية غلط.')];
  },
  games: s => {
    onceToday('games'); addMood(1); s.f.gamesCount = (s.f.gamesCount || 0) + 1; if (s.f.gamesCount <= 2) addTrust('leo', 1);
    return [pickOne([
      N_('Racing game. He cheats by unplugging your controller. You cheat by hiding his. You both lose to a man in Finland.', 'لعبة سباق. يغش بإنه يفصل يدك. {وأنت تغش بإنك تخبي|وأنتِ تغشين بإنك تخبين} يده. والاثنين تخسرون قدام واحد من فنلندا.'),
      N_('A horror game. He makes you play while he hides behind a cushion and screams at you for "going in the obvious door".', 'لعبة رعب. يخليك {تلعب|تلعبين} وهو مختبي ورا مخدة ويصارخ عليك لأنك «{دخلت|دخلتي} الباب الواضح».'),
      N_('You lose eleven times in a row. On the twelfth, you win, and he pretends to cry. Then actually laughs. So do you.', '{تخسر|تخسرين} إحدعش مرة ورا بعض. والثانية عشر {تفوز|تفوزين}، ويسوي نفسه يبكي. وبعدين يضحك صدق. {وأنت|وأنتِ} بعد.')])];
  },
  cookLeo: s => {
    take('groceries'); onceToday('cookLeo'); s.f.cookedLeo = (s.f.cookedLeo || 0) + 1; if (s.f.cookedLeo <= 2) addTrust('leo', 1); addMood(1);
    return [N_('You make pasta with actual vegetables. Leo eats it in silence, very fast, like someone might take it away.', '{تسوي|تسوين} مكرونة فيها خضار صدق. ليو ياكلها ساكت، بسرعة، كأن أحد بياخذها منه.'),
      L_('sad', 'My mum makes it like this. She puts lemon in the sauce. Don\'t tell her I said that.', 'أمي تسويها كذا. تحط ليمون في الصوص. {لا تقول|لا تقولين} لها إني قلت.'), st => { st.f.knowsMother = true; return null; }];
  },

  /* ----- events ----- */
  ownerVisit: s => [{ show: [{ id: 'leo', e: 'shock' }] },
    N_('Someone hammers on the door. "SALTMERE GRAND HOLDINGS. I know you\'re in there, Leo."', 'أحد يدق الباب بقوة. «شركة سولتمير غراند القابضة. أدري إنك داخل يا ليو.»'),
    N_('Leo kills the lights and signals you to keep quiet.', 'ليو يطفي الأنوار ويأشر لك {تسكت|تسكتين}.'),
    { menu: [
      { t: T('Stay quiet with him', '{تسكت|تسكتين} معه'), fx: st => addTrust('leo', 1), then: [N_('You sit on the floor in the dark, backs to the wall. The banging stops. A car leaves. Leo laughs under his breath, and you laugh too, and you don\'t know why.', 'تجلسون على الأرض بالظلام، ظهوركم للجدار. الدق يوقف. سيارة تمشي. ليو يضحك بصوت واطي، {وأنت تضحك|وأنتِ تضحكين} معه، وما {تدري|تدرين} ليش.'), L_('sad', 'Three months. I owe them three months. Victor bought every boathouse on this harbor last year. Then he tripled the rent.', 'ثلاث شهور. علي لهم ثلاث شهور. فيكتور اشترى كل بيوت القوارب في الميناء السنة اللي فاتت. وبعدين ضاعف الإيجار ثلاث مرات.'), st => { st.f.knowsDebt = true; quest('q_rent', 'active'); return null; }] },
      { t: T('Open the door', '{تفتح|تفتحين} الباب'), fx: st => { addTrust('leo', -1); st.f.knowsDebt = true; quest('q_rent', 'active'); }, then: [N_('A man in a good suit with a bad smile. "Three months. Friday, or the locks change. Mr. Victor sends his regards."', 'رجل ببدلة حلوة وابتسامة سيئة. «ثلاث شهور. الجمعة، أو تتغير الأقفال. السيد فيكتور يسلّم عليكم.»'), N_('Leo doesn\'t look at you for the rest of the day.', 'ليو ما يطالعك باقي اليوم.')] }
    ] }],
  dadCall: s => [{ show: [{ id: 'leo', e: 'neutral' }] },
    N_('Leo\'s phone rings. The screen says "Dad". He watches it ring out, then throws the phone onto the sofa.', 'جوال ليو يرن. الشاشة تقول «أبوي». يطالعه لين يوقف، وبعدين يرمي الجوال على الكنب.'),
    { menu: [
      { t: T('"Might be important."', '«يمكن شي مهم.»'), fx: st => { addTrust('leo', -1); st.f.knowsFather = true; quest('q_father', 'active'); }, then: [L_('angry', 'Important to him. Not to me.', 'مهم له. مو لي.'), L_('sad', 'He burned my sketchbooks in the yard. Said drawing was for kids and I start at the garage Monday. I left Sunday.', 'أحرق دفاتري في الحوش. قال الرسم لعب عيال وإني أبدأ في الكراج يوم الإثنين. وطلعت يوم الأحد.')] },
      { t: T('"I get it."', '«فاهمك.»'), fx: st => addTrust('leo', 1), then: [L_('sad', 'You\'re the only one who hasn\'t told me "but he loves you".', '{أنت الوحيد اللي ما قال|أنتِ الوحيدة اللي ما قالت} لي «بس هو يحبك».')] }
    ] }],
  scholarship: s => [{ show: [{ id: 'leo', e: 'neutral' }] },
    N_('Leo shows you an email on his phone, trying to look like he doesn\'t care: an art scholarship in the city. Full fees. Housing.', 'ليو يوريك إيميل على جواله، ويحاول يبين إنه ما يهتم: منحة فن في المدينة. رسوم كاملة. وسكن.'),
    L_('neutral', 'Deadline\'s in three days. Needs a parent\'s signature. So. That\'s that.', 'آخر موعد بعد ثلاث أيام. يبي توقيع ولي الأمر. فـ. خلاص.'),
    st => { st.f.scholarship = true; return null; }],
  crash: s => [
    N_('Your phone buzzes. A number you don\'t know. "This is Dr. Irene. Leo gave me your name. He came off his bike on the hill. He\'s fine. Mostly. Can you come?"', 'جوالك يهتز. رقم ما {تعرفه|تعرفينه}. «معك الدكتورة إيرين. ليو عطاني اسمك. طاح من دراجته في الطلعة. هو بخير. تقريباً. {تقدر تجي|تقدرين تجين}؟»'),
    { go: 'clinic' }, { show: [{ id: 'leo', e: 'sad' }, { id: 'irene', e: 'neutral' }] },
    { c: 'irene', e: 'neutral', t: T('Sprained wrist. No more deliveries for a week. That\'s the easy part.', 'التواء في المعصم. ممنوع توصيل أسبوع. وهذا الجزء السهل.') },
    { c: 'irene', e: 'sad', t: T('When the ambulance braked outside, he went white and couldn\'t breathe for two minutes. That\'s not the wrist.', 'لما الإسعاف فرمل برا، وجهه صار أبيض وما قدر يتنفس دقيقتين. وهذا مو من المعصم.') },
    L_('sad', 'Can we go home. Please.', 'نقدر نرجع البيت. {تكفى|تكفين}.'),
    { go: 'boathouse' },
    st => { st.f.crashDone = true; st.f.crashDay = st.day; st.f.restDayLeo = st.day; quest('q_final2', 'active'); advance(1); return null; }],

  finale2: s => {
    s.f.finale2Done = true;
    const steps = [{ go: 'boathouse' }, { show: [{ id: 'leo', e: 'sad' }] },
      N_('The rent is due tomorrow. The scholarship closes tomorrow. Leo sits on the floor with his strapped wrist, surrounded by drawings he can\'t finish one-handed.', 'الإيجار يستحق بكرة. والمنحة تقفل بكرة. ليو جالس على الأرض بيده المربوطة، حوله رسومات ما يقدر يكملها بيد وحدة.'),
      L_('sad', 'Tell me what to do. You\'re the only one who doesn\'t want something from me.', '{قل|قولي} لي وش أسوي. {أنت الوحيد اللي ما يبي|أنتِ الوحيدة اللي ما تبي} مني شي.')];
    if (s.f.toldFrank) return steps.concat([N_('A knock. Not Victor\'s man. A slower knock.', 'طق على الباب. مو رجّال فيكتور. طق أبطأ.'), { show: [{ id: 'leo', e: 'shock' }, { id: 'frank', e: 'sad' }] }, F_('sad', 'Son.', 'ولدي.'), st => [{ jump: (st.trust.leo || 0) >= 6 || st.f.frankSoft ? 'endLeoHomeFrank' : 'endLeoKickFrank' }]]);
    return steps.concat([{ c: 'leo', e: 'sad', menu: [
      { t: T('Help him tell Margaret the truth about Daniel', '{تساعده|تساعدينه} يقول لمارغريت الحقيقة عن دانيال'), need: st => st.f.knowsDaniel && (st.trust.leo || 0) >= 6 && st.mood >= 5, why: T('You\'d need to know everything, and he\'d need to trust you completely.', 'لازم {تعرف|تعرفين} كل شي، ولازم يثق فيك تماماً.'), hide: st => !st.f.knowsDaniel, then: [{ jump: 'endLeoTruth' }] },
      { t: T('Convince him to go home', '{تقنعه|تقنعينه} يرجع البيت'), need: st => st.f.knowsFather && (st.f.fatherSick || st.f.frankSoft || st.f.knowsMother) && (st.trust.leo || 0) >= 6, why: T('You don\'t know enough about his family yet, or he doesn\'t trust you enough.', 'ما {تعرف|تعرفين} كفاية عن أهله للحين، أو هو ما يثق فيك كفاية.'), then: [{ jump: 'endLeoHome' }] },
      { t: T('Apply for the scholarship without his father', 'تقدمون على المنحة بدون أبوه'), need: st => st.mood >= 4, why: T('You don\'t have the energy to fight for this. Not yet.', 'ما عندك طاقة {تقاتل|تقاتلين} عشان هذا. بعد.'), then: [st => roll(0.3 + 0.07 * (st.trust.leo || 0)) ? [{ jump: 'endLeoStay' }] : [{ jump: 'endLeoRun' }]] },
      { t: T('Call his father behind his back', '{تتصل|تتصلين} بأبوه من وراه'), cls: 'risk', hide: st => !(st.f.knowsFather || st.f.metFrank), then: [st => roll(0.3) ? [{ jump: 'endLeoHomeCall' }] : [{ jump: 'endLeoKick' }]] },
      { t: T('Just stay with him tonight', '{تقعد|تقعدين} معه الليلة وبس'), then: [{ jump: 'endLeoRun' }] }
    ] }]);
  },

  /* ----- endings ----- */
  endLeoHome: [L_('sad', 'You know what the worst part is? I know he loves me. In his stupid, burning-things way.', 'تدري وش أسوأ شي؟ إني أعرف إنه يحبني. بطريقته الغبية اللي يحرق فيها الأشياء.'),
    N_('In the morning he starts the bike one-handed, which is illegal, and rides up the hill to Frank\'s Motors.', 'الصبح يشغّل الدراجة بيد وحدة، وهذا ممنوع، ويطلع الطلعة لكراج فرانك.'),
    N_('Later, a message: a photo of Frank holding the scholarship form, pen in hand, eyes red. "He signed. He also cried. Never tell anyone."', 'بعدين، رسالة: صورة فرانك ماسك ورقة المنحة، والقلم بيده، وعيونه حمرا. «وقّع. وبكى بعد. {لا تقول|لا تقولين} لأحد أبداً.»'),
    N_('He leaves you the boathouse key and the drawing of the house. The figure who stood outside the door is inside now.', 'يترك لك مفتاح بيت القوارب ورسمة البيت. الشخص اللي كان واقف برا الباب، صار داخل.'),
    { end: 'LEO_HOME' }],
  endLeoHomeFrank: [F_('sad', 'Your friend came to the garage. Told me where you were. Showed me a drawing.', '{صديقك جا|صديقتك جت} الكراج. {قال|قالت} لي وينك. {وراني|ورتني} رسمة.'),
    F_('sad', 'I burned the wrong things, son.', 'أحرقت الأشياء الغلط يا ولدي.'),
    N_('Leo doesn\'t say anything. He just walks into his father, the way you walk into the sea when it\'s cold: all at once, so you can\'t change your mind.', 'ليو ما يقول شي. بس يمشي لأبوه، مثل ما تمشي للبحر وهو بارد: مرة وحدة، عشان ما تغير رايك.'),
    { end: 'LEO_HOME' }],
  endLeoHomeCall: [N_('You step outside and call Frank\'s Motors. Your heart is going so fast it hurts.', '{تطلع|تطلعين} برا {وتتصل|وتتصلين} على كراج فرانك. قلبك يدق لدرجة يوجع.'),
    { show: [{ id: 'leo', e: 'shock' }, { id: 'frank', e: 'sad' }] },
    N_('Frank comes. He stops at the door and doesn\'t come in. All he says is: "Your mum made pasta. With lemon."', 'فرانك يجي. يوقف عند الباب وما يدخل. كل اللي يقوله: «أمك سوت مكرونة. بليمون.»'),
    L_('sad', 'You should\'ve asked me.', 'كان المفروض {تسألني|تسأليني}.'),
    L_('smile', '...Thanks.', '...شكراً.'),
    { end: 'LEO_HOME' }],
  endLeoStay: [N_('You fill in the forms at the kitchen table. He does the portfolio; you write the letter, because he "can\'t talk about himself without sounding like a cereal advert".', 'تعبون الأوراق على طاولة المطبخ. هو يرتب الملف، {وأنت تكتب|وأنتِ تكتبين} الرسالة، لأنه «ما يقدر يتكلم عن نفسه بدون ما يطلع مثل دعاية كورن فليكس».'),
    N_('There\'s a box for "guardian or sponsor". You write your own name. It\'s allowed. You checked twice.', 'فيه خانة «ولي الأمر أو الكفيل». {تكتب اسمك أنت|تكتبين اسمك أنتِ}. ومسموح. {تأكدت|تأكدتي} مرتين.'),
    N_('Two weeks later: accepted. With housing. And Sami lends you the rent money until the stipend arrives, "because I like a happy ending, and a guaranteed loan".', 'بعد أسبوعين: مقبول. ومعه سكن. وسامي يسلّفكم الإيجار لين توصل المكافأة، «لأني أحب النهايات السعيدة، والقروض المضمونة».'),
    N_('On the fridge, a new drawing: two figures inside the house, eating pasta with lemon.', 'على الثلاجة، رسمة جديدة: شخصين داخل البيت، ياكلون مكرونة بليمون.'),
    { end: 'LEO_STAY' }],
  endLeoRun: [{ show: [] }, N_('You wake up and the bike is gone.', '{تصحى|تصحين} والدراجة مو موجودة.'),
    N_('On the sofa: the drawing of the house, the figure still standing outside the door. Underneath: "Sorry. I couldn\'t. Keep the PlayStation."', 'على الكنب: رسمة البيت، والشخص لسا واقف برا الباب. وتحتها: «آسف. ما قدرت. {خذ|خذي} البلايستيشن.»'),
    N_('His phone is off. At noon, Victor\'s man changes the locks with you still holding the drawing.', 'جواله مطفي. الظهر، رجّال فيكتور يغير الأقفال {وأنت لسا ماسك|وأنتِ لسا ماسكة} الرسمة.'),
    { end: 'LEO_RUN' }],
  endLeoKick: [N_('You call his father behind his back. Frank arrives in twenty minutes. Leo sees the truck from the window, and turns to you.', '{تتصل|تتصلين} بأبوه من وراه. فرانك يوصل بعد عشرين دقيقة. ليو يشوف الشاحنة من الشباك، ويلتفت لك.'),
    L_('sad', 'You too?', 'حتى {أنت|أنتِ}؟'),
    N_('He doesn\'t shout. That\'s worse. He goes out the back door to the dock, and you leave by the front with your bag. The boathouse is empty of both of you.', 'ما يصارخ. وهذا أسوأ. يطلع من الباب الخلفي للرصيف، {وأنت تطلع|وأنتِ تطلعين} من الأمامي بشنطتك. بيت القوارب يفضى من الاثنين.'),
    { end: 'LEO_KICK' }],
  endLeoKickFrank: [L_('angry', 'You told him where I was?', '{قلت|قلتي} له وين أنا؟'),
    L_('angry', 'I said no questions. I didn\'t say "go and tell my dad". Get out. Both of you.', 'قلت بدون أسئلة. ما قلت «روح قول لأبوي». اطلعوا. أنتم الاثنين.'),
    { end: 'LEO_KICK' }],
  endLeoKickSnoop: [L_('angry', 'Three times. Get your stuff.', 'ثلاث مرات. {خذ|خذي} أغراضك.'),
    N_('He doesn\'t look at you while you pack. At the door he says, to the wall: "I would\'ve told you everything. If you\'d waited."', 'ما يطالعك {وأنت ترتب|وأنتِ ترتبين} أغراضك. وعند الباب يقول، للجدار: «كنت بقول لك كل شي. لو {صبرت|صبرتي}.»'),
    { end: 'LEO_KICK' }],
  endLeoTruth: [L_('sad', 'If I tell her, she\'ll hate me.', 'لو قلت لها، بتكرهني.'),
    N_('"Maybe," you say. "And maybe she\'s been waiting two years for someone to tell her what his last night was like."', '«يمكن،» {تقول|تقولين}. «ويمكن هي تنتظر من سنتين أحد يقول لها كيف كانت آخر ليلة له.»'),
    N_('In the morning you walk with him up Cliff Road. He has never taken this road. At the white house with every curtain closed, he stops.', 'الصبح {تمشي|تمشين} معه في شارع الجرف. عمره ما مشى هالطريق. وعند البيت الأبيض اللي كل ستايره مسكّرة، يوقف.'),
    N_('He knocks. The door opens. A woman in her fifties looks at Leo, and then at you, as if she has seen a ghost.', 'يطق. الباب ينفتح. امرأة في الخمسين تطالع ليو، وبعدين تطالعك، كأنها شافت شبح.'),
    { end: 'LEO_TRUTH' }]
});

/* ---------------- topics ---------------- */

/* ---------------- endings ---------------- */
const SOON3 = T('Margaret\'s house, the lighthouse and the Grand Hotel open in the next chapters. Your save keeps everything you\'ve done.', 'بيت مارغريت، والمنارة، والفندق الكبير، ينفتحون في الفصول الجاية. والحفظ يحتفظ بكل اللي {سويته|سويتيه}.');
Object.assign(GAME.END, {
  LEO_HOME: { who: 'leo', title: T('He goes home', 'يرجع لأهله'), after: SOON3, chapter: 2 },
  LEO_STAY: { who: 'leo', title: T('He stays with you', 'يضل معك'), after: SOON3, chapter: 2 },
  LEO_RUN: { who: 'leo', title: T('He runs', 'يهرب'), after: SOON3, chapter: 2 },
  LEO_KICK: { who: 'leo', title: T('He throws you out', 'يطردك'), after: SOON3, chapter: 2 },
  LEO_TRUTH: { who: 'leo', title: T('The knock on Margaret\'s door', 'الطقة على باب مارغريت'), after: T('To be continued in Margaret\'s chapter.', 'تكملتها في فصل مارغريت.'), chapter: 2 }
});

/* ---------------- events ---------------- */
GAME.EVENTS.push(
  { id: 'kickLeo', when: s => ch2(s) && (s.susp.leo || 0) >= 3, run: [{ jump: 'endLeoKickSnoop' }] },
  { id: 'wake2', when: s => ch2(s) && s.f.metLeo && s.f.newDay, run: s => {
      s.f.newDay = false; s.loc = 'boathouse';
      const lines = [N_('Gulls on the roof, arguing. Leo snoring in the loft like a small engine.', 'نوارس على السطح تتهاوش. وليو يشخر فوق مثل مكينة صغيرة.'), N_('The sea is loud this morning. The boathouse creaks like a ship.', 'البحر صوته عالي اليوم الصبح. وبيت القوارب يطقطق مثل سفينة.')];
      if ((s.trust.leo || 0) >= 4) lines.push(N_('There\'s a note on your sofa: a drawing of a gull holding a cup of coffee. "Kettle\'s on."', 'فيه ورقة على كنبتك: رسمة نورس ماسك كوب قهوة. «الغلاية شغالة.»'));
      const out = [pickOne(lines)];
      if (s.mood <= 3) out.push(N_('Getting up feels like lifting the whole boathouse. You do it anyway.', 'القومة {تحس كأنك تشيل|تحسين كأنك تشيلين} بيت القوارب كله. {وتقوم|وتقومين} على كل حال.'));
      return out;
    } },
  { id: 'owner', once: true, when: s => ch2(s) && d2(s) >= 1 && (s.slot === 1 || s.slot === 2) && s.loc === 'boathouse', run: s => GAME.SCRIPTS.ownerVisit(s) },
  { id: 'dadCall', once: true, when: s => ch2(s) && d2(s) >= 1 && s.slot === NIGHT && s.loc === 'boathouse', run: s => GAME.SCRIPTS.dadCall(s) },
  { id: 'scholar', once: true, when: s => ch2(s) && d2(s) >= 2 && (s.loc === 'dock' || s.loc === 'boathouse') && s.slot >= 3, run: s => GAME.SCRIPTS.scholarship(s) },
  { id: 'crash', once: true, when: s => ch2(s) && d2(s) >= 3 && s.slot === 2 && !s.f.crashDone, run: s => GAME.SCRIPTS.crash(s) },
  { id: 'finale2', when: s => ch2(s) && s.f.crashDone && !s.f.finale2Done && s.day > s.f.crashDay && s.slot === NIGHT, run: s => (['boathouse', 'loft', 'bh_bath', 'dock', 'harbor'].includes(s.loc)) ? GAME.SCRIPTS.finale2(s) : [N_('Your phone buzzes. Leo: "come home. please. need to talk."', 'جوالك يهتز. ليو: «{تعال|تعالي} البيت. {تكفى|تكفين}. أبي أتكلم.»')].concat(GAME.SCRIPTS.finale2(s)) }
);
