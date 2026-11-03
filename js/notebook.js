/* =====================================================================
   The notebook, and Elias remembers.
   1. Notebook (in the phone, Tasks tab). In Elias's chapter some of the
      things you look at are clues, in three threads: what is wrong with
      Elias, what happened with Thomas, and the boy who fished with Elias
      long ago. Each clue is noted the moment you find it. The third clue
      of a thread puts it together in your head: a thought, and who to
      ask next (always someone the story already lets you ask).
   2. Elias remembers what you did: the day after you were caught in his
      things, the day after you cooked or cleaned for him, the day after
      you were gone all day, his first words to you say so.
   Only its own flags (s.f.clue, s.f.ded_*, s.f.eTalk, s.f.eHelp,
   s.f.eCaught) and s.f.elIll, which the illness sightings already set.
   No trust, suspicion, quest or ending changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);

  /* ---------- 1. the notebook ---------- */
  const THREADS = {
    ill: { name: T('What is wrong with Elias', 'وش فيه إلياس') },
    son: { name: T('Thomas', 'توماس') },
    boy: { name: T('The boy in the boat', 'الولد اللي في القارب') }
  };
  /* [id, thread, place, label (English, start of), counts only if.., the note] */
  const CLUES = [
    ['cal', 'ill', 'kitchen', 'A calendar by the door', null, T('Hospital appointments, three a week. Every one crossed out.', 'مواعيد مستشفى، ثلاث بالأسبوع. وكلها مشطوبة.')],
    ['meds', 'ill', 'kitchen', 'Cupboard', s => !!s.f.meds, T('Pill boxes behind the tea. Half of them never opened.', 'علب دوا ورا الشاي. نصها ما انفتح.')],
    ['voices', 'ill', 'yard', 'Voices through the kitchen window', null, T('At night he talks to Ada: "I haven\'t told him. Either of them."', 'بالليل يكلم آدا: «ما قلت له. ولا لواحد منهم.»')],
    ['letters', 'ill', 'elias_bed', 'Dresser drawer', s => !!s.f.letters, T('A hospital letter: "Dialysis strongly recommended. Patient declined."', 'خطاب مستشفى: «ننصح بشدة بالغسيل. المريض رفض.»')],
    ['marks', 'son', 'hall', 'Pencil marks on the door frame', null, T('THOMAS, 18. Above it, a line with no name.', 'توماس، ١٨. وفوقه خط بدون اسم.')],
    ['box', 'son', 'your_room', 'Box under the bed', null, T('Photos of Thomas at every age, until eighteen. Then nothing.', 'صور توماس بكل الأعمار، لين ثمنطعش. وبعدها ولا شي.')],
    ['ship', 'son', 'your_room', 'Model ship', null, T('A model ship in Thomas\'s room, waiting to be finished.', 'مجسم سفينة في غرفة توماس، ينتظر أحد يكمله.')],
    ['tphone', 'son', 'living', 'Telephone', null, T('A number taped by the phone: "T.". The tape is yellow with age.', 'رقم ملصوق جنب الهاتف: «T.». والشريط صاير أصفر.')],
    ['cap', 'boy', 'hall', 'A yellow oilskin on the hook', null, T('A boy\'s fishing cap on Elias\'s hook. Nobody has moved it in thirty years.', 'كاب صيد ولد صغير على علاقة إلياس. محد حركه من ثلاثين سنة.')],
    ['photo', 'boy', 'living', 'Photographs', null, T('A boy of eleven or so on Elias\'s shoulders, holding a fish bigger than his arm.', 'ولد عمره تقريباً إحدعش على أكتاف إلياس، ماسك سمكة أكبر من ذراعه.')],
    ['drawing', 'son', 'living', 'A child\'s drawing on the mantelpiece', null, T('Thomas\'s drawing from the tin, where his father can see it from his chair.', 'رسمة توماس اللي كانت في العلبة، في مكان يشوفها أبوه من كرسيه.')],
    ['wall', 'boy', 'no9', 'The boarded window', null, T('Number 9: an empty child\'s room, wallpaper with little blue boats.', 'رقم ٩: غرفة طفل فاضية، ورق جدارها قوارب زرق صغيرة.')]
  ];
  const DED = {
    ill: s => [
      N1('📓 You put it together on the stairs. Appointments he crosses out. Pills he never opens. Elias isn\'t forgetting his treatment. He is refusing it.', '📓 {تركبها|تركبينها} في راسك {وأنت|وأنتِ} على الدرج. مواعيد يشطبها. ودوا ما يفتحه. إلياس ما نسى علاجه. هو رافضه.'),
      s.f.knowsIllness ? null : N1('Martha cleans for him on Tuesdays and Fridays. If anyone has noticed, she has.', 'مارثا تنظف عنده الثلاثاء والجمعة. إذا أحد انتبه، فهي.'),
      st => { st.f.elIll = true; return null; }],
    son: s => [
      N1('📓 Eighteen, and then nothing. No more photos, no more pencil lines. Something happened between Elias and Thomas, and he has been waiting ever since for it to un-happen.', '📓 ثمنطعش، وبعدها ولا شي. لا صور، ولا خطوط رصاص. صار شي بين إلياس وتوماس، ومن يومها وهو ينتظره ينمحي.'),
      s.f.thStep ? null : N1('This was Thomas\'s room. His desk is still in it. Desks keep things.', 'هذي كانت غرفة توماس. ومكتبه لسا فيها. والمكاتب تحفظ أشياء.')],
    boy: s => [
      N1('📓 A boy who fished with Elias, a long time ago. A cap nobody moves. A photo he never takes down. You don\'t know whose boy that was.', '📓 ولد كان يصيد مع إلياس، من زمان. كاب محد يحركه. وصورة عمره ما نزّلها. وما {تدري|تدرين} ولد مين.'),
      (s.f.knowV || s.f.knowJonah) ? null : N1('Someone who has been in Saltmere long enough would remember. Gregor, at the cemetery, has known everyone.', 'أحد عايش في سولتمير من زمان بيتذكر. غريغور اللي في المقبرة يعرف الكل.')]
  };
  const noteOf = id => CLUES.find(c => c[0] === id);
  const count = (s, t) => CLUES.filter(c => c[1] === t && s.f.clue && s.f.clue[c[0]]).length;

  function found(s, c) {
    s.f.clue = s.f.clue || {};
    if (s.f.clue[c[0]]) return null;
    s.f.clue[c[0]] = s.day;
    try { toast('📓 ' + tx(T('Noted', 'انكتب في الدفتر')) + ': ' + tx(THREADS[c[1]].name)); } catch (e) { /* none */ }
    if (count(s, c[1]) >= 3 && !s.f['ded_' + c[1]]) {
      s.f['ded_' + c[1]] = s.day; addMood(1);
      return DED[c[1]](s).filter(Boolean);
    }
    return null;
  }

  /* each clue is noted when its spot is looked at (and, for the risky ones, only if you weren't caught) */
  function wrap() {
    CLUES.forEach(c => {
      const L = GAME.LOC[c[2]]; if (!L || !L.spots) return;
      const h = L.spots.find(x => x.label && x.label.en && x.label.en.indexOf(c[3]) === 0); if (!h || h._nb) return;
      h._nb = true;
      const r0 = h.run;
      h.run = s => {
        const out = typeof r0 === 'function' ? r0(s) : r0;
        if (!ch1(s) || (c[4] && !c[4](s))) return out;
        const more = found(s, c);
        if (!more) return out;
        return (Array.isArray(out) ? out : out ? [out] : []).concat(more);
      };
    });
  }
  wrap();

  /* the notebook card in the Tasks tab, after the tasks, before "The story so far" */
  const rsh0 = renderSheet;
  renderSheet = function () {
    const r = rsh0.apply(this, arguments);
    try {
      const s = S();
      if (VIEW.sheet === 'phone' && VIEW.tab === 'quests' && s && s.host === 'elias' && s.f.clue && Object.keys(s.f.clue).length) {
        const sh = document.querySelector('#stage .sheet:not(.mapsheet)'); const body = sh && sh.lastElementChild;
        if (body && !body.querySelector('.notebook')) {
          const card = el('div', 'notebook');
          card.appendChild(el('strong', '', '📓 ' + tx(T('Notebook', 'الدفتر'))));
          Object.keys(THREADS).forEach(t => {
            const got = CLUES.filter(c => c[1] === t && s.f.clue[c[0]]); if (!got.length) return;
            const n = Math.min(3, got.length);
            const h = el('div', 'nb-th' + (s.f['ded_' + t] ? ' done' : ''));
            h.appendChild(el('b', '', tx(THREADS[t].name)));
            h.appendChild(el('span', 'nb-dots', '●'.repeat(n) + '○'.repeat(3 - n)));
            card.appendChild(h);
            got.forEach(c => card.appendChild(el('p', 'nb-clue', '· ' + tx(c[5]))));
          });
          const sf = body.querySelector('.sofar');
          if (sf) body.insertBefore(card, sf); else body.appendChild(card);
        }
      }
    } catch (e) { console.error(e); }
    return r;
  };

  /* ---------- 2. Elias remembers ---------- */
  /* when you last talked to him */
  const tt0 = talkTo;
  talkTo = function (id) { const s = S(); const out = tt0.apply(this, arguments); try { if (id === 'elias' && s) s.f.eTalk = s.day; } catch (e) { /* none */ } return out; };
  /* when he (or Martha, who tells him) caught you in his things */
  const SC = GAME.SCRIPTS;
  if (SC.caught) { const c0 = SC.caught; SC.caught = function (s) { if (s.f.caughtBy !== 'martha') s.f.eCaught = s.day; return c0.apply(this, arguments); }; }
  /* when you did something for him */
  const HELP = [['kitchen', 'Cook a real dinner for two', 'dinner'], ['kitchen', 'Cook for Elias', 'cook'], ['kitchen', 'Wash the dishes', 'dishes'], ['living', 'Sweep the floor', 'sweep']];
  HELP.forEach(([loc, lab, k]) => {
    const L = GAME.LOC[loc]; const h = L && (L.spots || []).find(x => x.label && x.label.en && x.label.en.indexOf(lab) === 0); if (!h) return;
    const r0 = h.run; h.run = s => { const out = typeof r0 === 'function' ? r0(s) : r0; if (ch1(s)) s.f.eHelp = { k, day: s.day }; return out; };
  });
  const SAY = {
    caught0: ['angry', 'Knock. I said it once, the first night. I won\'t say it again.', '{طق|طقي} الباب. قلتها مرة، أول ليلة. وما راح أعيدها.'],
    caught1: ['sad', 'I didn\'t sleep much. Kept listening for my drawer.', 'ما نمت زين. قعدت أتسمع على درجي.'],
    dinner: ['smile', 'That dinner last night. Ada used to put too much pepper in too. I never said thank you to her either. Thank you.', 'العشا أمس. آدا بعد كانت تكثر الفلفل. وعمري ما قلت لها شكراً. شكراً.'],
    cook: ['smile', 'Something smelled right in my kitchen yesterday. I\'d forgotten it could.', 'مطبخي كانت ريحته صح أمس. كنت ناسي إنه يقدر.'],
    dishes: ['neutral', 'Somebody put my cups back the wrong way round. ...The right way round. Ada\'s way.', 'أحد رجّع أكوابي بالمقلوب. ...بالعدل يعني. على طريقة آدا.'],
    sweep: ['neutral', 'The floor\'s seen a broom. It looks embarrassed. So am I, a bit.', 'الأرض شافت مكنسة. شكلها مستحية. وأنا بعد، شوي.'],
    away: ['sad', 'You were gone all day yesterday. I\'m not asking where. I made too much soup, that\'s all.', '{كنت غايب|كنتي غايبة} أمس طول اليوم. ما أسأل وين. بس سويت شوربة زيادة، هذا كل شي.']
  };
  const memory = s => {
    if (!ch1(s) || doneToday('eMem')) return null;
    let k = null;
    if (s.f.eCaught != null && s.day - s.f.eCaught <= 1) k = s.day === s.f.eCaught ? 'caught0' : 'caught1';
    else if (s.f.eHelp && s.f.eHelp.day === s.day - 1) k = s.f.eHelp.k;
    else if (s.day >= 3 && s.f.eTalk != null && s.f.eTalk < s.day - 1) k = 'away';
    if (!k) return null;
    onceToday('eMem');
    const [e, en, ar] = SAY[k];
    return { e, t: T(en, ar) };
  };
  const E = GAME.CHAR.elias;
  if (E) { const g0 = E.greet; E.greet = s => memory(s) || (g0 ? g0(s) : null); }
})();
