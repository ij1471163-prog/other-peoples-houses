/* =====================================================================
   More of the lighthouse (Evelyn's chapter) and the people around it.
     1. Arthur's own stone, in the churchyard, next to Tobias's: turned
        to face the light. (Gregor said "the family doesn't come".)
     2. "You're not the only one." Evelyn has always believed she is the
        only person who hears the laugh. Kai and Olivia heard it once, on
        a dare, and the fishermen argue about it in the café.
     3. A marble for Tobias: leave one on his stone.
   Its own flags (s.f.evArthur, evNotAlone, evMarbleLeft); mood and a
   little trust. No quest, ending or ending-condition changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const C = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const inE = s => s.host === 'evelyn';
  const cem = GAME.LOC.cemetery;
  if (!cem) return;

  /* ---------- 1. Arthur's stone ---------- */
  cem.spots.push({ x: 88, y: 66, label: T('A grey stone turned towards the lighthouse', 'حجر رمادي ملتفت ناحية المنارة'),
    if: s => !!s.f.eGrave,
    run: s => { const first = !s.f.evArthur; s.f.evArthur = true; return [
      N1('ARTHUR WREN. 1939–2009. KEEPER. Not in line with the others: someone has set it at an angle, so that it faces the lighthouse across the bay.', 'آرثر رن. ١٩٣٩–٢٠٠٩. حارس. مو على خط الباقين: أحد حاطه مايل، عشان يكون وجهه للمنارة عبر الخليج.'),
      first ? N1('It is two steps from the small stone. Close enough to reach, if a stone could reach.', 'بينه وبين الحجر الصغير خطوتين. قريب لدرجة إنه يوصل له، لو الحجر يقدر يمد يده.') : null,
      (s.done || {}).evelyn === 'EVE_PEACE' || (s.done || {}).evelyn === 'EVE_STAY'
        ? N1('On top of it, a tin of sardines, unopened, and a cup of tea gone cold. Somebody has started visiting.', 'فوقه علبة سردين، ما انفتحت، وكوب شاي برد. فيه أحد بدا يزوره.')
        : null
    ].filter(Boolean); } });
  if (GAME.CHAR.gregor && Array.isArray(GAME.CHAR.gregor.chat)) {
    GAME.CHAR.gregor.chat.unshift({ if: s => !!s.f.evArthur, e: 'sad', t: T('Arthur Wren asked to face the light. Said he\'d been facing the wrong way long enough. I dug it crooked on purpose. The vicar complained. I said take it up with Arthur.', 'آرثر رن طلب يكون وجهه للنور. قال إنه طالع بالاتجاه الغلط كفاية. حفرته مايل بقصد. القسيس اشتكى. قلت له يروح يشتكي لآرثر.') });
    GAME.CHAR.gregor.chat.unshift({ if: s => !!s.f.evMarbleLeft, e: 'smile', t: T('Somebody\'s been playing marbles up the back. On the little stone. I\'ve left it. Seemed rude to move it.', 'أحد قاعد يلعب بلي ورا. على الحجر الصغير. خليتها. حسيت إنه قلة أدب أشيلها.') });
  }

  /* ---------- 2. you're not the only one ---------- */
  GAME.TOPICS.evelyn = GAME.TOPICS.evelyn || [];
  GAME.TOPICS.evelyn.push({ id: 'evNotAlone', once: true,
    label: T('Tell her she isn\'t the only one who has heard it', '{قل|قولي} لها إنها مو الوحيدة اللي سمعته'),
    if: s => inE(s) && !!s.f.eRecording && (s.trust.evelyn || 0) >= 3,
    run: s => [
      N1('You tell her what the town says, when it thinks no one from the lighthouse is listening. Kai and Olivia, on a dare, under the tower at three in the morning: something laughed, and they ran. The fishermen in the café who argue about it every winter.', '{تقول|تقولين} لها وش تقول البلد، لما تحسب محد من المنارة يسمع. كاي وأوليفيا، على تحدي، تحت البرج الساعة ثلاث الفجر: شي ضحك، وهربوا. والصيادين في المقهى اللي يتجادلون عليه كل شتا.'),
      C('evelyn', 'shock', 'Kai? Kai heard it?', 'كاي؟ كاي سمعه؟'),
      N1('She sits down on the bottom stair, very slowly, like someone much older.', 'تجلس على أول درجة، بشويش مرة، كأنها أكبر بكثير من عمرها.'),
      C('evelyn', 'sad', 'All my life I thought it was me. That there was something wrong in me, and the house had found it.', 'طول عمري وأنا أحسبه أنا. إن فيني شي غلط، والبيت لقاه.'),
      C('evelyn', 'smile', 'Thirty-eight years I thought I was mad. And it turns out I was just early.', 'ثمانية وثلاثين سنة وأنا أحسب نفسي مجنونة. وطلعت بس سابقة وقتي.'),
      st => { st.f.evNotAlone = true; addTrust('evelyn', 1); addMood(1); return null; }
    ] });

  /* ---------- 3. a marble for Tobias ---------- */
  cem.spots.push({ x: 84, y: 76, label: T('Leave a marble on the small stone', '{حط|حطي} بلية على الحجر الصغير'),
    if: s => !!s.f.eGrave && !s.f.evMarbleLeft && (has('marble') || (has('cupmarble') && !!(s.done || {}).evelyn)),
    run: s => { const k = has('marble') ? 'marble' : 'cupmarble'; take(k); s.f.evMarbleLeft = k; addMood(1); return [
      N1('You set it in the hollow at the top of the stone, where the rain has worn a little cup. It doesn\'t roll. It sits there as if it has been waiting for the right place.', '{تحطها|تحطينها} في النقرة اللي فوق الحجر، اللي حفرها المطر مثل كوب صغير. ما تتدحرج. تقعد مكانها كأنها كانت تنتظر المكان الصح.'),
      N1('TOBIAS WREN. 1949–1958. Nine years old. You say his name out loud, because probably nobody has in a long time.', 'توبياس رن. ١٩٤٩–١٩٥٨. تسع سنين. {تقول|تقولين} اسمه بصوت عالي، لأنه يمكن محد قاله من زمان.')
    ]; } });
})();
