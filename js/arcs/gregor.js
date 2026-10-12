/* =====================================================================
   Gregor's story: "The blue door"  (docs/STORY.md §5)
   Gregor's mother came from Fisher's Row. If the council lets Victor
   have the street, forty houses come down, so Gregor is writing down
   who lived in each one. He has photos of nine hundred graves and not
   one of his mother's door, number 14, and his knees no longer do the
   hill. Taking the picture means turning your phone over.
     1. Gregor and his list                        (topic)
     2. Number 14, on Fisher's Row                 (spot)
     3. Show him the picture (and, if you know,     (topic)
        he writes your father into the book: Jonah, number 9)
   ===================================================================== */
'use strict';
(function () {
  const say = (e, en, ar) => ({ c: 'gregor', e, t: T(en, ar) });
  const G = s => s.f.gArc || 0;

  GAME.QUESTS.q_door = { title: T('The blue door', 'الباب الأزرق'),
    hint: T('Gregor has no picture of his mother\'s house: number 14, Fisher\'s Row. Blue door.', 'غريغور ما عنده صورة لبيت أمه: رقم ١٤، شارع الصيادين. باب أزرق.') };

  /* 1. the list */
  GAME.TOPICS.gregor.push({ id: 'gDoor', once: true, label: T('Ask what he\'s writing', '{تسأله|تسألينه} وش يكتب'),
    if: s => G(s) === 0 && s.day >= 3 && !!s.f.metElias,
    run: [
      say('neutral', 'A list. The council votes on Fisher\'s Row soon. If Victor gets it, forty houses come down.', 'قايمة. المجلس بيصوّت على شارع الصيادين قريب. لو فيكتور أخذه، أربعين بيت بينهدم.'),
      say('neutral', 'So I\'m writing them all down. Who lived where. Who was born, who left, who\'s in here with me.', 'فأنا أكتبهم كلهم. مين سكن وين. مين انولد، ومين طلع، ومين هنا عندي.'),
      say('sad', 'Number 14 was my mother\'s. Blue door. I have photographs of nine hundred graves and not one of my mother\'s door. Daft, isn\'t it?', 'رقم ١٤ كان بيت أمي. باب أزرق. عندي صور لتسعمية قبر، وولا صورة وحدة لباب أمي. سخافة، صح؟'),
      say('neutral', 'My knees don\'t do that hill anymore. If you\'re ever down there with that phone of yours...', 'ركبي ما عادت تطلع هالطلعة. لو {رحت|رحتي} هناك مرة ومعك جوالك...'),
      s => { s.f.gArc = 1; quest('q_door', 'active'); return null; }] });

  /* 2. number 14 */
  GAME.LOC.elias_ext.spots.push({ x: 37, y: 44, label: T('Number 14: a blue door', 'رقم ١٤: باب أزرق'),
    if: s => G(s) === 1 && s.slot < NIGHT,
    run: s => [
      N_('Number 14. The blue has gone grey in places, but someone has kept painting the frame. A planter by the step, with nothing in it.',
        'رقم ١٤. الأزرق صار رمادي في أماكن، بس فيه أحد مستمر يصبغ الإطار. وجنب الدرجة حوض زرع، ما فيه شي.'),
      s.f.calledMother
        ? N_('You take the picture.', '{تصوّر|تصوّرين}.')
        : N_('You turn your phone over for the first time in a long while. The screen lights up with your mother\'s name. You don\'t open anything. You take the picture.',
          '{تقلب|تقلبين} جوالك لأول مرة من زمان. الشاشة تنور باسم أمك. ما {تفتح|تفتحين} شي. بس {تصوّر|تصوّرين}.'),
      st => { st.f.gArc = 2; return null; }] });

  /* 3. the picture */
  GAME.TOPICS.gregor.push({ id: 'gPhoto', once: true, label: T('Show him the picture of number 14', '{توريه|تورينه} صورة رقم ١٤'), cls: 'main',
    if: s => G(s) === 2,
    run: s => [
      N_('Gregor holds your phone in both hands, the way people hold a hymn book.', 'غريغور يمسك جوالك بيدينه الثنتين، مثل ما الناس يمسكون كتاب ترانيم.'),
      say('sad', 'That\'s it. That\'s the door. She used to stand there and shout my name down the whole street. You could hear it at the harbor.', 'هو. هذا الباب. كانت توقف هناك وتصيح باسمي في الشارع كله. كانوا يسمعونها في الميناء.'),
      N_('He copies it into his book in pencil, slowly: the door, the frame, the empty planter.', 'ينسخها في دفتره بالرصاص، على مهله: الباب، والإطار، والحوض الفاضي.'),
      s.quests.q_petition === 'done'
        ? say('smile', 'And that girl Olivia got her signatures in. Maybe it won\'t come to a list.', 'وهالبنت أوليفيا سلّمت تواقيعها. يمكن ما نوصل للقايمة.')
        : null,
      (s.f.knowJonah || s.f.vJonah)
        ? { c: 'gregor', e: 'neutral', q: T('Number 9 is just up the street from hers. Your father\'s house. Shall I write him in?', 'رقم ٩ فوق بيتها بشوي في نفس الشارع. بيت أبوك. {تبيني|تبينني} أكتبه؟'), menu: [
          { t: T('"Yes. Jonah."', '«إيه. جونا.»'), cls: 'main', then: [
            say('neutral', 'Jonah. Number 9. Learnt the nets from Elias. Left on the last train at seventeen.', 'جونا. رقم ٩. تعلّم الشباك عند إلياس. وطلع بآخر قطار وعمره سبعطعش.'),
            N_('He writes it under the drawing of his mother\'s door. Then, after a moment, a line more: "Came back, in a way."', 'يكتبه تحت رسمة باب أمه. وبعد لحظة، يزيد سطر: «ورجع، بطريقة ما.»')] },
          { t: T('"Not yet."', '«مو الحين.»'), then: [say('neutral', 'The page will keep.', 'الصفحة بتنتظر.')] }] }
        : null,
      st => { st.f.gArc = 3; addTrust('gregor', 2); addMood(1); quest('q_door', 'done'); return null; }] });
})();
