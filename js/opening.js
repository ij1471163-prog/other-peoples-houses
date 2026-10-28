/* =====================================================================
   A stronger opening.
     · On the train, your phone: your mother's messages, on screen,
       one after another, instead of a line saying you have some.
     · The postcard: you hold it and read it yourself.
     · The first night ends on a hook: through the floor, Elias says
       a name. Your father's.
   The story is the same; only how it is shown. Nothing here reads or
   changes trust, suspicion or any ending.
   ===================================================================== */
'use strict';
(function () {
  const intro = GAME.SCRIPTS.intro, meet = GAME.SCRIPTS.meet;
  const N1 = (en, ar) => ({ n: T(en, ar) });

  /* the phone, right after "The last train." */
  const i0 = intro.findIndex(st => st && st.n && /The last train/.test(st.n.en));
  if (i0 >= 0) intro.splice(i0 + 1, 0,
    N1('Your phone buzzes against the window. You already know who it is.', 'جوالك يهتز على الشباك. {وتدري|وتدرين} مين.'),
    { mini: 'texts', who: T('Mum', 'أمي'), sub: T('47 unread', '٤٧ ما انقرت'), msgs: [
      { t: T('Where are you?', 'وينك؟'), time: T('3 weeks ago', 'قبل ٣ أسابيع') },
      { t: T('I\'m sorry about the house. I should have told you. Please let me explain.', 'آسفة على البيت. كان لازم أقولك. {خلني|خليني} أشرح لك.'), time: T('last week', 'الأسبوع اللي فات') },
      { t: T('Your father had his reasons. I didn\'t understand them either.', 'أبوك كان عنده أسبابه. وأنا بعد ما فهمتها.'), time: T('yesterday', 'أمس') },
      { t: T('Just tell me you\'re okay. That\'s all I want.', 'بس {طمّني|طمّنيني} عليك. هذا كل اللي أبيه.'), time: T('now', 'الحين'), wait: 1800 },
      { me: true, type: true, drafts: [T('I\'m fine', 'أنا بخير'), T('Why didn\'t you tell me', 'ليش ما قلتي لي')], t: T('...', '...') }
    ] },
    N1('You turn the phone face down on your knee. The train slows.', '{تقلب|تقلبين} الجوال على وجهه فوق ركبتك. والقطار يهدّي.'));

  /* the postcard: read it in your own hands */
  const ip = intro.findIndex(st => st && st.n && /In one of the boxes, a postcard/.test(st.n.en));
  if (ip >= 0) intro.splice(ip, 1,
    N1('In one of the boxes, a postcard of a harbour you\'d never seen. SALTMERE. Your father\'s handwriting.', 'في واحد من الكراتين، كرت بريدي لميناء عمرك ما {شفته|شفتيه}. «سولتمير». وبخط أبوك.'),
    { mini: 'paper', kind: 'postcard', stamp: '⚓', body: T('V. — I saw the hotel today. You did it, like you always said you would. I\'ll pay you back, every cent. I\'m sorry.', 'ف. — شفت الفندق اليوم. سويتها، مثل ما كنت دايم تقول. برجّع لك كل قرش. آسف.'), sign: T('— J.   7 March', '— ج.   ٧ مارس') },
    N1('Dated the seventh of March. Never posted.', 'مؤرخ سبعة مارس. وعمره ما انرسل.'));

  /* the first night: a name through the floor */
  const iEnd = meet.findIndex(st => st && st.n && /The bed is made/.test(st.n.en));
  if (iEnd >= 0) meet.splice(iEnd + 1, 0,
    N1('Later, half asleep, you hear him downstairs. A drawer opens. A long silence. Then, very quietly, to nobody, a name.', 'بعدين، وأنت {نص نايم|نص نايمة}، {تسمعه|تسمعينه} تحت. درج ينفتح. سكوت طويل. وبعدين، بصوت واطي مرة، لولا أحد، اسم.'),
    N1('"...Jonah?"', '«...جونا؟»'),
    N1('Your father\'s name. You lie awake until the window goes grey.', 'اسم أبوك. {تجلس صاحي|تجلسين صاحية} لين الشباك يصير رمادي.'),
    s => { s.f.heardName = true; return null; });

  /* you can ask him. He isn't ready to say. (links.js tells it, once he trusts you) */
  GAME.TOPICS.elias = GAME.TOPICS.elias || [];
  GAME.TOPICS.elias.push({ id: 'heardName', once: true, label: T('"Who\'s Jonah?"', '«مين جونا؟»'), if: s => !!s.f.heardName && !s.f.knowJonah && s.f.metElias, run: [
    { c: 'elias', e: 'shock', t: T('Where did you hear that name?', 'وين {سمعت|سمعتي} هالاسم؟') },
    N1('"Downstairs. The first night."', '«تحت. أول ليلة.»'),
    { c: 'elias', e: 'neutral', t: T('Old men talk to the walls. The walls in this house have heard a lot of names.', 'الشياب يكلمون الجدران. وجدران هالبيت سمعت أسامي كثير.') },
    N1('He goes back to his tea. His hand isn\'t quite steady on the cup. He is not telling you something, and he knows you know.', 'يرجع لشايه. يده مو ثابتة على الكوب. فيه شي ما يبي يقوله لك، ويدري إنك {تدري|تدرين}.'),
    st => { st.f.askedJonah = true; return null; }
  ] });
})();
