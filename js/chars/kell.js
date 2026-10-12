/* =====================================================================
   Kell — Victor's driver, doorman, and quiet problem.
   Everything that is Kell's own: profile, where Kell is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (victor.js).
   ===================================================================== */
'use strict';
(function () {
  { const { inV } = GAME.H.victor;
    /* who Kell is and Kell's daily routine (Victor's chapter) */
    GAME.CHAR.kell = {
      name: T('Kell', 'كيل'), role: T('Victor\'s driver, doorman, and quiet problem.', 'سواق فيكتور، وبوابه، ومشكلته الساكتة.'), art: true,
      where: s => (inV(s) ? ['hotel_staff', 'hotel_lobby', 'street', 'hotel_lobby', 'hotel_office'][s.slot] : null),
      doing: s => ({ hotel_staff: T('Kell is eating cereal in the laundry, standing up, reading a paperback.', 'كيل ياكل كورن فليكس في المغسلة، واقف، يقرا رواية.'), hotel_lobby: T('Kell is standing by the door like a wardrobe with opinions.', 'كيل واقف عند الباب مثل دولاب عنده آراء.'), street: T('Kell is two steps behind Victor, carrying nothing, looking at everything.', 'كيل وراء فيكتور بخطوتين، ما يشيل شي، ويطالع كل شي.'), hotel_office: T('Kell is sitting outside the office door, guarding it.', 'كيل جالس عند باب المكتب، يحرسه.') })[GAME.CHAR.kell.where(s)] || null,
      greet: s => ({ e: 'neutral', t: (s.trust.kell || 0) >= 3 ? T('Hey.', 'هلا.') : T('...', '...') })
    };
  }
  { const { K } = GAME.H.victor;
    /* things to talk about (Victor's chapter) */
    GAME.TOPICS.kell = [
      { id: 'talk', once: true, label: T('Ask him what he\'s reading', '{تسأله|تسألينه} وش يقرا'), run: s => { addTrust('kell', 1); return [K('neutral', 'Poetry.', 'شعر.'), N_('He shows you. It\'s poetry. He doesn\'t explain.', 'يوريك. شعر. وما يشرح.')]; } },
      { id: 'rosa', once: true, label: T('Ask about the woman in the photo, in Fisher\'s Row', '{تسأله|تسألينه} عن المرأة اللي في الصورة، في شارع الصيادين'), if: s => s.f.vKellPhoto || s.f.vSawRosa, run: s => { addTrust('kell', 2); return [K('sad', 'My sister. Rosa. Number 12. Twenty years. He bought the street, then an "inspector" said her house was unsafe. It isn\'t. I grew up in it.', 'أختي. روزا. رقم ١٢. عشرين سنة. اشترى الشارع، وبعدين «مفتش» قال بيتها مو آمن. وهو آمن. تربيت فيه.'), K('sad', 'He gave me a job the same week. So I\'d be grateful.', 'عطاني شغل بنفس الأسبوع. عشان أكون ممتن.')]; } },
      { id: 'turn', once: true, label: T('"Will you say that in front of the town?"', '«تقدر تقولها قدام البلدة؟»'), if: s => s.f.vSawRosa && (s.trust.kell || 0) >= 3, need: s => s.f.vLedger, why: T('He needs to see you have proof, not just words.', 'يحتاج يشوف إن معك دليل، مو بس كلام.'), run: s => { s.f.vKell = true; return [K('neutral', 'You read the ledger.', '{قريت|قريتي} الدفتر.'), K('neutral', 'If you stand up, I\'ll stand up. Not before. I\'m big, not brave.', 'لو {قمت أنت|قمتي أنتِ}، بقوم. مو قبل. أنا كبير، مو شجاع.')]; } }
    ];
  }
  /* how Kell looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.kell = { sex: 'm', skin: '#8a5a3c', hair: '#141214', eye: '#2a1a12', brow: '#141214', hairStyle: 'buzz', beard: 'short', age: 42, sw: 126, ww: 104, hw: 98, pose: ['cross', 'cross'], fit: { top: 'suit', c1: '#26262c', c2: '#3a3a42', bottom: 'pants', b: '#26262c' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.kell.height = 1.08;
})();

/* Kell's day: what Kell is doing in each place (shown by js/life.js) */
if (GAME.CHAR.kell) GAME.CHAR.kell.life = { hotel_staff: 'read', hotel_lobby: 'guard', street: 'guard', hotel_office: 'guard' };

/* small talk: what Kell says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.kell) GAME.CHAR.kell.chat = [
  { e: 'neutral', t: T("...Rilke. You wouldn't like him. He's honest.", "...ريلكه. ما بيعجبك. صادق زيادة.") },
  { e: 'neutral', t: T("Don't stand near the office door. For your sake.", "لا {توقف|توقفين} عند باب المكتب. عشانك.") },
  { e: 'sad', t: T("My sister grew tomatoes on the windowsill of number 12. I think about those tomatoes.", "أختي كانت تزرع طماط على شباك رقم ١٢. أفكر في هالطماط.") }
];
