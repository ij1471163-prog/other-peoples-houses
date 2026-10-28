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

  /* Thursday: when she sings, she is on the little stage where Marco stood, in the light,
     moving and singing (frames cut from a short video), with the audience in front of her */
  const PIC = { w: 1600, h: 900 }, CELL = { n: 31, cols: 8, rows: 4, x: 463.4, y: 205, w: 233.2, h: 420.2 }, HEADS = { x: 380, y: 440, w: 420, h: 460 };
  const pct = (v, of) => (v / of * 100) + '%';
  let cine = null;
  function singOn() {
    singOff();
    const sc = document.querySelector('#stage .scene'), bg = sc && sc.querySelector('.bg'); if (!bg) return null;
    const box = el('div', 'sing-cine');
    const fit = () => { const W = sc.clientWidth, H = sc.clientHeight, k = Math.max(W / PIC.w, H / PIC.h); box.style.width = PIC.w * k + 'px'; box.style.height = PIC.h * k + 'px'; };
    const f = el('div', 'sing-frames'), hd = el('img', 'sing-heads');
    Object.assign(f.style, { left: pct(CELL.x, PIC.w), top: pct(CELL.y, PIC.h), width: pct(CELL.w, PIC.w), height: pct(CELL.h, PIC.h), backgroundSize: `${CELL.cols * 100}% ${CELL.rows * 100}%` });
    hd.src = 'img/fx/cafe-heads.webp'; hd.alt = '';
    Object.assign(hd.style, { left: pct(HEADS.x, PIC.w), top: pct(HEADS.y, PIC.h), width: pct(HEADS.w, PIC.w), height: pct(HEADS.h, PIC.h) });
    box.append(f, hd); bg.after(box); fit();
    /* forwards, then backwards, twelve frames a second: she never jumps */
    let i = 0, d = 1, t0 = 0, raf = 0; const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = k => { f.style.backgroundPosition = `${(k % CELL.cols) / (CELL.cols - 1) * 100}% ${Math.floor(k / CELL.cols) / (CELL.rows - 1) * 100}%`; };
    const tick = t => { if (!cine) return; if (t - t0 > 83) { t0 = t; i += d; if (i >= CELL.n - 1 || i <= 0) d = -d; show(i); } raf = requestAnimationFrame(tick); };
    show(still ? 22 : 0); if (!still) raf = requestAnimationFrame(tick);
    addEventListener('resize', fit);
    cine = { box, stop: () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); box.remove(); } };
    return null;
  }
  function singOff() { if (cine) { const c = cine; cine = null; c.stop(); } return null; }
  const sing0 = GAME.SCRIPTS.ingridSings;
  if (sing0) GAME.SCRIPTS.ingridSings = s => {
    const steps = sing0(s), i = steps.findIndex(st => st && st.n && /Then she sings/.test(st.n.en));
    if (i < 0) return steps;
    steps.splice(i, 0, () => { VIEW.bgOver = Object.assign({}, VIEW.bgOver, { cafe: 'cafe_sing' }); return null; }, { show: [] }, () => { setTimeout(singOn, 60); return null; });
    steps.splice(i + 4, 0, singOff, () => { if (VIEW.bgOver) delete VIEW.bgOver.cafe; return null; }, { show: [{ id: 'ingrid', e: 'neutral' }, { id: 'marco', e: 'smile' }] });
    return steps;
  };
  window.__sing = { on: singOn, off: singOff };

  const chat = (who, line) => { const c = GAME.CHAR[who]; if (c) { c.chat = c.chat || []; c.chat.unshift(line); } };
  chat('ingrid', { if: s => s.f.ingRehearse === 'heard' && !s.f.ingridSang, e: 'smile', t: T('Front row, Thursday. You promised. Well, I promised for you.', 'الصف الأول، الخميس. {وعدت|وعدتي}. يعني، أنا وعدت عنك.') });
})();
