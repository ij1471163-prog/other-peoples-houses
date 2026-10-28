/* =====================================================================
   Moments with a picture of their own.
     · Ingrid rehearsing alone in the closed café, the night before
       she sings (once Marco has kept her a Thursday spot).
   Only its own flags. Nothing here reads or changes trust, suspicion
   or any ending.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const say = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const inside = s => { VIEW.bgOver = Object.assign({}, VIEW.bgOver, { street: 'cafe_closed' }); return null; };
  const outside = s => { if (VIEW.bgOver) delete VIEW.bgOver.street; return null; };

  GAME.EVENTS.push({ id: 'ingRehearse', once: true, when: s => !RUN && s.loc === 'street' && s.slot === NIGHT && !!s.f.micBooked && !s.f.ingridSang, run: [
    N1('One window on the street is still lit: Marco\'s café, closed, the chairs up on the tables. Somebody is singing in there. Very quietly.', 'شباك واحد في الشارع لسا منوّر: مقهى ماركو، مسكّر، والكراسي فوق الطاولات. فيه أحد يغني جوا. بصوت واطي مرة.'),
    N1('The door isn\'t locked. You open it a crack.', 'الباب مو مقفل. {تفتحه|تفتحينه} شوي.'),
    inside,
    { show: [{ id: 'ingrid', e: 'sing' }] },
    N1('Ingrid, alone, at the microphone Marco has left set up for Thursday. Eyes shut. She doesn\'t know you\'re there.', 'إنغريد، لحالها، عند الميكروفون اللي ماركو خلاه جاهز للخميس. مغمضة عيونها. ما تدري إنك هنا.'),
    N1('She sings the first verse of something old, in a language you don\'t know. On the second verse her voice breaks. She keeps going anyway.', 'تغني أول مقطع من شي قديم، بلغة {ما تعرفها|ما تعرفينها}. وبالمقطع الثاني صوتها ينكسر. وتكمل على كل حال.'),
    { menu: [
      { t: T('Stay and listen to the end', '{اجلس|اجلسي} {واسمع|واسمعي} لين الأخير'), then: [
        N1('The last note goes on a long time. When it stops, the café is so quiet you can hear the fridge.', 'آخر نغمة تطول. ولما توقف، المقهى ساكت لدرجة {تسمع|تسمعين} صوت الثلاجة.'),
        { show: [{ id: 'ingrid', e: 'shock' }] },
        say('ingrid', 'shock', 'Oh! How long have you been standing there?', 'أوه! من متى {وأنت واقف|وأنتِ واقفة} هنا؟'),
        say('ingrid', 'sad', 'Henrik used to say I only sang well when nobody was listening. ...Was it all right?', 'هنريك كان يقول إني ما أغني زين إلا لما محد يسمع. ...كان زين؟'),
        { menu: [
          { t: T('"It was beautiful."', '«كان حلو مرة.»'), then: [say('ingrid', 'smile', 'Then come on Thursday. Sit at the front. I\'ll need one face I know.', 'أجل {تعال|تعالي} الخميس. {اجلس|اجلسي} قدام. بحتاج وجه واحد أعرفه.')] },
          { t: T('"He was wrong."', '«كان غلطان.»'), then: [say('ingrid', 'smile', 'He was wrong about a great many things. He\'d have been delighted to be wrong about this one.', 'كان غلطان في أشياء كثيرة. وكان بينبسط مرة إنه غلطان في هذي.')] }
        ] },
        st => { st.f.ingRehearse = 'heard'; addMood(1); return null; }
      ] },
      { t: T('Close the door before she sees you', '{سكّر|سكّري} الباب قبل لا تشوفك'), then: [
        N1('You close the door without a sound. Behind it, she starts the song again from the top.', '{تسكّر|تسكّرين} الباب بدون صوت. ووراه، ترجع تبدأ الأغنية من أولها.'),
        st => { st.f.ingRehearse = 'left'; return null; }
      ] }
    ] },
    { show: null }, outside
  ] });

  /* Thursday: when she sings, the room is full, and she is alone in the light */
  const sing0 = GAME.SCRIPTS.ingridSings;
  if (sing0) GAME.SCRIPTS.ingridSings = s => {
    const steps = sing0(s), i = steps.findIndex(st => st && st.n && /Then she sings/.test(st.n.en));
    if (i < 0) return steps;
    const L = GAME.LOC.cafe, x0 = L.charX;
    steps.splice(i, 0, () => { VIEW.bgOver = Object.assign({}, VIEW.bgOver, { cafe: 'cafe_stage_ing' }); L.charX = 36; return null; }, { show: [{ id: 'ingrid', e: 'sing' }] });
    steps.splice(i + 3, 0, () => { if (VIEW.bgOver) delete VIEW.bgOver.cafe; L.charX = x0; return null; }, { show: [{ id: 'ingrid', e: 'neutral' }, { id: 'marco', e: 'smile' }] });
    return steps;
  };

  const chat = (who, line) => { const c = GAME.CHAR[who]; if (c) { c.chat = c.chat || []; c.chat.unshift(line); } };
  chat('ingrid', { if: s => s.f.ingRehearse === 'heard' && !s.f.ingridSang, e: 'smile', t: T('Front row, Thursday. You promised. Well, I promised for you.', 'الصف الأول، الخميس. {وعدت|وعدتي}. يعني، أنا وعدت عنك.') });
})();
