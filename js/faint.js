/* =====================================================================
   Not eating has a cost.
     · When you are very hungry, your body tells you (once a day).
     · If you still don't eat and hunger reaches nothing, you faint the
       next time you go somewhere, and wake up in the clinic the next
       day. Dr Irene keeps you there until noon, and sends you out fed.
       A day is gone, and the mood it cost you.
   Never in the opening, in the middle of a scene, at night, or on a
   chapter's last night (that night waits; you stay just above empty).
   Food, rest and mood only. No trust, suspicion, quest or ending changes.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const I = (e, en, ar) => ({ c: 'irene', e, t: T(en, ar) });
  const FINALS = ['q_final', 'q_final2', 'q_m_final'];
  const busy = s => !s || RUN || s.f.prologue || !s.f.metElias || s.f.finale || FINALS.some(q => s.quests[q] === 'active') || !GAME.LOC.clinic;

  const WHO = {
    elias: T('Elias sat there all night. He told me you\'re "too stubborn to eat and too young to be stubborn". Then he went to buy bread.', 'إلياس جلس هنا الليل كله. قال لي إنك «{عنيد|عنيدة} لدرجة ما {تاكل|تاكلين}، وصغير على العناد». وبعدين راح يشتري خبز.'),
    leo: T('Leo carried you here on his bike. Don\'t ask me how. He drew you while you slept. It\'s not flattering.', 'ليو جابك هنا على سيكله. لا {تسألني|تسأليني} كيف. ورسمك وأنت {نايم|نايمة}. الرسمة مو حلوة.'),
    margaret: T('Margaret hasn\'t left that chair since they brought you in. I sent her home to sleep. She went home to cook.', 'مارغريت ما قامت من ذاك الكرسي من جابوك. قلت لها تروح تنام. راحت تطبخ.'),
    evelyn: T('Evelyn walked down from the lighthouse in the middle of the night. She doesn\'t do that. Think about that.', 'إيفلين نزلت من المنارة بنص الليل. هي ما تسوي كذا. {فكّر|فكّري} في هذا.'),
    victor: T('Someone from the hotel dropped you off and left before I could ask who. A very expensive car.', 'واحد من الفندق نزّلك هنا ومشى قبل لا أسأله مين. سيارة غالية مرة.')
  };

  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.unshift(s => {
    if (busy(s) || s.slot >= NIGHT) return null;
    const nd = needs();
    if (nd.food > 0) {
      if (nd.food < 10 && !s.once['hintHungry@' + s.day]) {
        s.once['hintHungry@' + s.day] = 1;
        return [N1(...[['Your hands are shaking a little. When did you last eat something? Properly?', 'يدينك ترجف شوي. متى آخر مرة {أكلت|أكلتي} شي؟ أكل صدق؟'],
          ['The ground does a small, polite tilt. Your stomach has stopped asking and started insisting.', 'الأرض تميل ميلة صغيرة ومؤدبة. وبطنك وقف يطلب وصار يصرّ.']][s.day % 2])];
      }
      return null;
    }
    if (s.f.faintDay !== undefined && s.day - s.f.faintDay < 3) { nd.food = 5; return null; }
    s.f.faintDay = s.day; s.f.faints = (s.f.faints || 0) + 1;
    const again = s.f.faints > 1;
    const who = s.host && WHO[s.host];
    return [
      N1('The edges of everything go soft and grey. You put a hand out for the wall. The wall isn\'t where you left it.', 'أطراف كل شي تصير رمادية وناعمة. {تمد|تمدين} يدك للجدار. والجدار مو في مكانه.'),
      { show: [] },
      N1('...', '...'),
      st => { st.day++; st.slot = 0; st.f.newDay = false; dayStartNeeds(); const n = needs(); n.food = 70; n.energy = 100; addMood(-1); st.slot = 1; return null; },
      { go: 'clinic' }, { show: [{ id: 'irene' }] },
      N1('A white ceiling. A drip in your arm. The smell of disinfectant and, somewhere, toast.', 'سقف أبيض. مغذي في يدك. ريحة معقم، ومن مكان ما، توست.'),
      again ? I('angry', 'You again. Same reason. I\'m starting to take this personally.', 'أنت مرة ثانية. نفس السبب. بدأت أحس إنها شخصية.')
            : I('neutral', 'Hello. I\'m Irene, the doctor. We\'d have met eventually. I\'d have preferred a coffee.', 'هلا. أنا آيرين، الدكتورة. كان بنتعرف على بعض في يوم. بس كنت أفضّل على قهوة.'),
      I('sad', 'You fainted. No food, not enough water, and a body that\'s been running on worry. You\'ve been asleep for a day.', '{أغمي عليك|أغمي عليكِ}. لا أكل، ولا موية كفاية، وجسم ماشي على القلق. {نمت|نمتي} يوم كامل.'),
      ...(who ? [I('smile', who.en, who.ar)] : []),
      I('smile', 'Now: toast. All of it. And then you eat three times a day like a person, or I come and find you.', 'الحين: توست. كله. وبعدين {تاكل|تاكلين} ثلاث مرات في اليوم مثل البشر، ولا أجي أدورك.'),
      N1('She doesn\'t charge you. She does watch you eat every bite.', 'ما تاخذ منك ولا شي. بس تطالعك وأنت {تاكل|تاكلين} كل لقمة.'),
      { show: null }
    ];
  });
})();
