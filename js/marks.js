/* =====================================================================
   What you leave behind in Saltmere (Elias's chapter).
   Two small things you can do with your hands that stay done:
     1. The Ada's name has nearly flaked off. One morning at the harbour
        you can repaint it with him. From then on the boat says so, and
        in later chapters it is still bright, whatever happened to him.
     2. In the shed, a paper bag in Ada's handwriting: tulip bulbs, "for
        the front". Plant them in the empty pot by the side door. Two days
        later they come up, Elias notices, and they are still there in
        every chapter after.
   And when Elias's chapter ends: one short night at the harbour that
   shows you whose house is next.
   Its own flags (s.f.adaPaint, s.f.planted, s.f.ch2Tease); mood only.
   No trust, suspicion, quest or ending changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const E1 = (e, en, ar) => ({ c: 'elias', e, t: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);
  const dead = s => ['ELIAS_LETTER', 'ELIAS_PEACE'].includes(s.f.eliasEnd);
  Object.assign(GAME.ITEMS, { bulbs: { name: T('A bag of tulip bulbs', 'كيس بصيلات توليب'), desc: T('"For the front, autumn." In Ada\'s handwriting.', '«للواجهة، الخريف.» بخط آدا.') } });

  /* ---------- 1. the Ada's name ---------- */
  const harbor = GAME.LOC.harbor, ada = harbor && harbor.spots.find(h => h.label && /The boat "Ada"/.test(h.label.en));
  if (ada) {
    const r0 = ada.run;
    ada.run = s => {
      if (!s.f.adaPaint && !s.f.ended) return [N1('A small blue boat, paint peeling. The name on the bow has nearly flaked away: A_A. A tin of white paint sits under the seat, still sealed.', 'قارب أزرق صغير، صبغه مقشّر. والاسم على المقدمة تقريباً راح: «آ_ا». وتحت الكرسي علبة صبغ بيضا، لسا مسكّرة.')];
      if (!s.f.ended) return r0(s).concat([N1('The D is a little thicker than the A\'s. That one is yours.', 'حرف الدال أعرض شوي من الألفين. هذا حقك.')]);
      if (!s.f.adaPaint) return r0(s);
      return [N1(...(dead(s)
        ? ['The Ada, tied up where she always was. Nobody has taken her out since. The name you painted is still bright, and someone has put a jar of wild flowers on the seat.', '«آدا» مربوطة مكانها. محد طلعها من بعده. والاسم اللي {صبغته|صبغتيه} لسا لامع، وأحد حاط مرطبان ورد بري على الكرسي.']
        : s.f.eliasEnd === 'ELIAS_KICK'
          ? ['The Ada. The name you painted together is still there. He could have painted over it. He hasn\'t.', '«آدا». الاسم اللي صبغتوه مع بعض لسا موجود. كان يقدر يصبغ فوقه. وما سوّاها.']
          : ['The Ada, rocking at her rope, the name on her bow still white and sharp. You painted the D.', '«آدا» تتمايل على حبلها، والاسم على مقدمتها لسا أبيض وواضح. {أنت|أنتِ} صبغت{|ي} الدال.']))];
    };
  }
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];
  GAME.TOPICS.elias.push({ id: 'adaPaint', once: true, label: T('Help him repaint her name', '{تساعده|تساعدينه} يصبغ اسمها'),
    if: s => ch1(s) && s.loc === 'harbor' && s.slot === 0 && !s.f.fallDone,
    run: s => { s.f.adaPaint = s.day; addMood(1); return [
      E1('neutral', 'Every spring. Every spring since she went. This year I kept finding reasons.', 'كل ربيع. كل ربيع من يوم راحت. وهالسنة قعدت ألقى أعذار.'),
      N1('He prises the tin open with a key and gives you the small brush. He takes the A\'s. You get the D.', 'يفتح العلبة بمفتاح ويعطيك الفرشاة الصغيرة. هو ياخذ الألفين. وأنت{|ِ} الدال.'),
      N1('The paint runs a little on your first stroke. He doesn\'t fix it.', 'الصبغ يسيل شوي في أول ضربة. وهو ما يصلحها.'),
      E1('smile', 'She\'d say it\'s crooked. Then she\'d say leave it.', 'كانت بتقول إنه معوج. وبعدين بتقول خلّه.'),
      N1('You sit on the edge of the pier while it dries. Neither of you says anything for a long time. It\'s a good long time.', '{تجلس|تجلسين} على طرف الرصيف لين ينشف. ولا واحد فيكم يقول شي وقت طويل. وقت طويل حلو.'),
      { time: 1 }
    ]; } });

  /* ---------- 2. Ada's tulips ---------- */
  const shed = GAME.LOC.shed, ext = GAME.LOC.elias_ext;
  if (shed) shed.spots.push({ x: 18, y: 40, label: T('A paper bag on the high shelf', 'كيس ورق على الرف العالي'),
    if: s => ch1(s) && !s.f.bulbsFound,
    run: s => { s.f.bulbsFound = true; give('bulbs'); return [
      N1('Behind the paint tins, a paper bag gone soft with damp. Inside, a dozen tulip bulbs, dry and papery and still alive. On the bag, in round handwriting: "For the front, autumn. A."', 'ورا علب الصبغ، كيس ورق صار طري من الرطوبة. داخله دزينة بصيلات توليب، ناشفة وخفيفة ولسا عايشة. وعلى الكيس، بخط مدوّر: «للواجهة، الخريف. آ.»'),
      N1('Autumn is now. You take the bag.', 'والخريف هو الحين. {تاخذ|تاخذين} الكيس.')
    ]; } });
  if (ext) ext.spots.push({ x: 32, y: 66, label: T('The empty pot by the side door', 'الحوض الفاضي جنب الباب الجانبي'),
    if: s => s.f.planted != null || (ch1(s) && has('bulbs')),
    run: s => {
      if (s.f.planted == null) { s.f.planted = s.day; take('bulbs'); addMood(1); return [
        N1('You turn the old soil with your hands and push the bulbs in, pointy end up, the way the bag doesn\'t tell you but you somehow know.', '{تقلب|تقلبين} التراب القديم بيدينك {وتدفن|وتدفنين} البصيلات، الراس المدبب لفوق، بطريقة الكيس ما يقولها بس {تعرفها|تعرفينها} بطريقة ما.'),
        N1('Your hands smell of earth for the rest of the day. It\'s the first thing you\'ve planted in your life.', 'يدينك ريحتها تراب باقي اليوم. وهذا أول شي {تزرعه|تزرعينه} في حياتك.')]; }
      const d = s.day - s.f.planted;
      if (d < 2) return [N1('Dark soil, patted flat. Nothing yet. You check anyway.', 'تراب غامق، مسطّح. ولا شي للحين. {وتشيك|وتشيكين} على كل حال.')];
      if (!s.f.ended) return [N1('Green shoots, a finger high, all twelve. One already has a closed red bud like a fist.', 'براعم خضرا، بطول إصبع، الاثنعش كلها. وحدة منها فيها زهرة حمرا مسكّرة مثل القبضة.')];
      return [N1(...(dead(s)
        ? ['The tulips are open, red, all twelve, by a door nobody uses now. Someone has been watering them.', 'التوليب مفتّح، أحمر، الاثنعش كلها، جنب باب محد يستخدمه الحين. وأحد قاعد يسقيها.']
        : ['The tulips are open, red, all twelve. Ada\'s, and yours.', 'التوليب مفتّح، أحمر، الاثنعش كلها. حق آدا، وحقك.']))];
    } });
  GAME.EVENTS.push({ id: 'tulipsSeen', once: true,
    when: s => ch1(s) && !RUN && s.f.planted != null && s.day - s.f.planted >= 2 && GAME.CHAR.elias.where && GAME.CHAR.elias.where(s) === s.loc,
    run: s => [{ show: [{ id: 'elias', e: 'sad' }] },
      E1('sad', 'There\'s something coming up by the side door.', 'فيه شي طالع جنب الباب الجانبي.'),
      E1('neutral', 'She bought those the autumn before. I couldn\'t. I put the bag on the shelf and I couldn\'t.', 'هي شرتها الخريف اللي قبل. وأنا ما قدرت. حطيت الكيس على الرف وما قدرت.'),
      N1('He doesn\'t say thank you. He goes out and stands by the pot for a while, with his hands in his pockets, the way people stand at a grave they like.', 'ما يقول شكراً. يطلع ويوقف جنب الحوض شوي، يدينه في جيوبه، مثل ما يوقف الناس عند قبر يحبونه.')] });

  /* the town notices */
  const chat = (id, when, e, en, ar) => { const c = GAME.CHAR[id]; if (c && Array.isArray(c.chat)) c.chat.unshift({ if: when, e, t: T(en, ar) }); };
  chat('gregor', s => !!s.f.adaPaint, 'smile', 'Saw the Ada this morning. Name\'s fresh. Somebody\'s D is a bit fat. I like it.', 'شفت «آدا» الصبح. الاسم جديد. والدال حق أحد عريض شوي. عجبني.');
  chat('kai', s => !!s.f.adaPaint, 'smile', 'You painted the old man\'s boat? Respect. He wouldn\'t let me touch it. I offered flames.', '{صبغت|صبغتي} قارب الشايب؟ احترام. ما خلاني ألمسه. عرضت عليه أرسم نار.');
  chat('martha', s => s.f.planted != null && s.day - s.f.planted >= 2, 'sad', 'Ada\'s tulips. I\'d have known them anywhere. Forty years she planted those, by that door.', 'توليب آدا. أعرفها من بين ألف. أربعين سنة وهي تزرعها جنب ذاك الباب.');

  /* ---------- 3. the end of Elias's chapter: whose door is next ---------- */
  const c0 = GAME.SCRIPTS.ch2start;
  if (c0) GAME.SCRIPTS.ch2start = function (s) {
    const out = c0.apply(this, arguments);
    if (!s || s.f.ch2Tease || !s.f.eliasEnd || !Array.isArray(out)) return out;
    s.f.ch2Tease = true;
    return [{ go: 'harbor' }, { show: [] },
      N1('That night, at the far end of the harbour, a boy in a black hoodie sits on the sea wall with a sketchbook on his knees.', 'هذيك الليلة، في آخر الميناء، ولد لابس هودي أسود جالس على سور البحر، ودفتر رسم على ركبه.'),
      N1('He draws for a long time. Then he tears the page out, tears it again, and again, and lets the pieces go into the black water.', 'يرسم وقت طويل. وبعدين يقطع الورقة، ويقطعها مرة ثانية، وثالثة، ويخلي القطع تطيح في الموية السودا.'),
      N1('One piece doesn\'t sink. It turns slowly on the water: half of a car, coloured in red. Under it, in pencil, a date two years ago.', 'قطعة وحدة ما تغرق. تلف بشويش على الموية: نص سيارة، ملوّنة أحمر. وتحتها، بالرصاص، تاريخ قبل سنتين.')
    ].concat(out);
  };
})();
