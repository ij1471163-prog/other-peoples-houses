/* =====================================================================
   Daily life: what people are DOING, not only where they are.
   This file is only the engine. Each character's day lives in that
   character's own file (js/chars/<id>.js) as a small table:

     GAME.CHAR.elias.life = {
       harbor: 'fish', kitchen: 'cook', bath: 'shower',
       living: s => s.slot === NIGHT ? 'radio' : 'rest',   // can depend on time
       away: s => s.slot === NIGHT ? 'sleep' : null         // when not on the map
     };

   The place comes from the character's existing `where` (the story
   depends on it, so it is never changed here); `life` only says what
   they are doing there. Shown as:
     · a small icon on the character's name tag in the scene
     · "Now: …" in the People tab of the phone
     · icons next to names in the map's list
     · a line in the caption when you can hear them elsewhere in the house
       (the shower, the kitchen, the radio)
     · bathrooms are sometimes occupied for a minute by someone at home
   Showers and baths are only ever heard, never shown.
   ===================================================================== */
'use strict';
const LIFE = (() => {
  /* what each activity looks like: icon, and words for a man / a woman */
  const ACTS = {
    fish:     ['🎣', 'Fishing', 'يصطاد', 'تصطاد'],
    shower:   ['🚿', 'In the shower', 'يتروّش', 'تتروّش'],
    bath:     ['🛁', 'In the bath', 'ياخذ حمام', 'تاخذ حمام'],
    cook:     ['🍳', 'Cooking', 'يطبخ', 'تطبخ'],
    eat:      ['🍽️', 'Eating', 'ياكل', 'تاكل'],
    table:    ['🍽️', 'Laying the table', 'يحط السفرة', 'تحط السفرة'],
    tea:      ['☕', 'Having tea', 'يشرب شاي', 'تشرب شاي'],
    mend:     ['🧵', 'Mending nets', 'يصلّح الشباك', 'تصلّح الشباك'],
    chess:    ['♟️', 'Playing chess', 'يلعب شطرنج', 'تلعب شطرنج'],
    rest:     ['🛋️', 'Resting', 'مرتاح', 'مرتاحة'],
    radio:    ['📻', 'Listening to the radio', 'يسمع الراديو', 'تسمع الراديو'],
    clean:    ['🧹', 'Cleaning', 'ينظف', 'تنظف'],
    laundry:  ['🧺', 'Doing the laundry', 'يغسل الملابس', 'تغسل الملابس'],
    sleep:    ['😴', 'Asleep', 'نايم', 'نايمة'],
    draw:     ['✏️', 'Drawing', 'يرسم', 'ترسم'],
    deliver:  ['🚲', 'Out delivering', 'يوصّل طلبات', 'توصّل طلبات'],
    game:     ['🎮', 'Playing video games', 'يلعب بلايستيشن', 'تلعب بلايستيشن'],
    work:     ['🔧', 'Working', 'يشتغل', 'تشتغل'],
    office:   ['💼', 'Busy in the office', 'مشغول في المكتب', 'مشغولة في المكتب'],
    grave:    ['🌼', 'Visiting a grave', 'عند قبر', 'عند قبر'],
    sit:      ['🕯️', 'Sitting alone', 'جالس لحاله', 'جالسة لحالها'],
    sick:     ['🤒', 'Unwell, in bed', 'تعبان في السرير', 'تعبانة في السرير'],
    walk:     ['🚶', 'Out walking', 'يتمشى', 'تتمشى'],
    phone:    ['📱', 'On the phone', 'على الجوال', 'على الجوال'],
    gulls:    ['🐦', 'Feeding the gulls', 'يأكّل النوارس', 'تأكّل النوارس'],
    watch:    ['🔦', 'Keeping the light', 'يحرس الضو', 'تحرس الضو'],
    host:     ['🤝', 'Greeting guests', 'يستقبل الضيوف', 'تستقبل الضيوف'],
    drive:    ['🚗', 'Driving', 'يسوق', 'تسوق'],
    guard:    ['🕴️', 'Standing guard', 'واقف حراسة', 'واقفة حراسة'],
    read:     ['📖', 'Reading', 'يقرا', 'تقرا'],
    desk:     ['☎️', 'At the front desk', 'على الاستقبال', 'على الاستقبال'],
    shop:     ['🛒', 'Minding the shop', 'في المحل', 'في المحل'],
    serve:    ['☕', 'Serving coffee', 'يقدّم قهوة', 'تقدّم قهوة'],
    doctor:   ['🩺', 'Seeing patients', 'يكشف على المرضى', 'تكشف على المرضى'],
    dig:      ['⛏️', 'Tending the graves', 'يرتب القبور', 'ترتب القبور'],
    surf:     ['🏄', 'Surfing', 'يركب موج', 'تركب موج'],
    scheme:   ['📝', 'Making a plan', 'يخطط', 'تخطط'],
    petition: ['📋', 'Collecting signatures', 'يجمع تواقيع', 'تجمع تواقيع'],
    patrol:   ['👮', 'On patrol', 'في دورية', 'في دورية'],
    flowers:  ['💐', 'Arranging flowers', 'يرتب ورد', 'ترتب ورد'],
    sing:     ['🎤', 'Singing', 'يغني', 'تغني'],
    home:     ['🏠', 'At home', 'في البيت', 'في البيت']
  };
  /* things you can hear (or smell) from another room of the same house */
  const HEAR = {
    shower: T('{n} is in the shower. You can hear the water through the wall.', '{n} يتروّش. {تسمع|تسمعين} صوت الموية من ورا الجدار.'),
    bath:   T('{n} is in the bath. A radio is playing behind the door.', '{n} في الحمام. وفيه راديو شغّال ورا الباب.'),
    cook:   T('Something is frying in the kitchen. {n} is cooking.', 'فيه شي ينقلي في المطبخ. {n} يطبخ.'),
    radio:  T('A radio is playing low in the other room. {n}.', 'راديو شغّال بصوت واطي في الغرفة الثانية. {n}.'),
    game:   T('Muffled explosions from the next room: {n} is playing games.', 'أصوات انفجارات مكتومة من الغرفة اللي جنبك: {n} يلعب.'),
    clean:  T('A vacuum cleaner is roaring somewhere in the house. {n}.', 'مكنسة كهربا تزمجر في مكان ما بالبيت. {n}.'),
    sleep:  T('From the next room, the slow breathing of {n}, asleep.', 'من الغرفة اللي جنبك، نفَس {n} البطيء، نايم.')
  };
  const BATHS = ['bath', 'bh_bath', 'marg_bath', 'lh_bath'];

  const female = id => PEOPLE.SPEC[id] && PEOPLE.SPEC[id].sex === 'f';
  const nameOf = id => tx(GAME.CHAR[id].short || GAME.CHAR[id].name);
  const fit = (str, id) => (female(id) && GAME.lang === 'ar') ? str.replace(/ يتروّش\./, ' تتروّش.').replace(/ يطبخ\./, ' تطبخ.').replace(/ يلعب\./, ' تلعب.').replace(/، نايم\./, '، نايمة.') : str;

  /* the activity of a character right now, or null */
  function act(id, s = S()) {
    const c = GAME.CHAR[id]; if (!c || !c.life || !c.where) return null;
    const w = c.where(s);
    let k = w ? c.life[w] : c.life.away;
    if (typeof k === 'function') k = k(s);
    if (!k || !ACTS[k]) return null;
    const [icon, en, arM, arF] = ACTS[k];
    return { key: k, icon, at: w, label: T(en, female(id) ? arF : arM) };
  }
  const icon = (id, s) => { const a = act(id, s); return a ? a.icon : ''; };
  /* the drawn pose for what they are doing (img/chars/<id>-<activity>.webp), if one was drawn */
  const ALIAS = { radio: 'rest' };   // the radio pose is the same as resting with a mug of tea
  const pose = (id, s) => { const a = act(id, s), im = PEOPLE.IMG.chars[id]; if (!a || !im) return null;
    return im[a.key] ? a.key : (ALIAS[a.key] && im[ALIAS[a.key]] ? ALIAS[a.key] : null); };

  /* "Now: 🍳 Cooking · Kitchen" for the People tab */
  function nowLine(id, s = S()) {
    const a = act(id, s); if (!a) return '';
    const place = a.at && GAME.LOC[a.at] ? ' · ' + tx(GAME.LOC[a.at].name) : '';
    return tx(T('Now: ', 'الحين: ')) + a.icon + ' ' + tx(a.label) + place;
  }

  /* one line about someone you can hear elsewhere in the same house */
  function hear(s = S()) {
    const h = houseOf(s.loc); if (!h) return null;
    for (const id of Object.keys(GAME.CHAR)) {
      const a = act(id, s); if (!a || !a.at || a.at === s.loc || houseOf(a.at) !== h || !HEAR[a.key]) continue;
      return fit(tx(HEAR[a.key]).replace('{n}', nameOf(id)), id);
    }
    return null;
  }

  /* real life: sometimes the bathroom is just occupied for a minute by someone who is home */
  function loo(to, s = S()) {
    if (!BATHS.includes(to) || RUN) return null;
    const h = houseOf(to); const key = s.day * 10 + s.slot;
    if (s.f.looAt === key) return null;                           // at most once per time of day
    const busy = ['sleep', 'sick', 'cook', 'watch', 'eat', 'table', 'shower', 'bath'];   // someone asleep or at the stove isn't in the bathroom
    const home = Object.keys(GAME.CHAR).filter(id => { const c = GAME.CHAR[id]; if (!c.life || !c.where) return false; const w = c.where(s); if (!w || w === s.loc || w === to || houseOf(w) !== h) return false; const a = act(id, s); return !a || !busy.includes(a.key); });
    if (!home.length || !roll(0.15)) return null;
    s.f.looAt = key;
    const id = home[Math.floor(Math.random() * home.length)], nm = GAME.CHAR[id].short || GAME.CHAR[id].name;
    return [{ n: T(nm.en + ' calls through the locked door: "One minute!"', nm.ar + ' ' + (female(id) ? 'تنادي' : 'ينادي') + ' من ورا الباب المقفول: «دقيقة وحدة!»') },
      { n: T('A flush, a tap, and the door opens. The bathroom is free.', 'صوت سيفون، وحنفية، والباب ينفتح. الحمام فاضي.') }, { go: to }];
  }

  /* bathrooms: keep each house's own lock (the host's shower), then the occasional "one minute!" */
  function wireBathrooms() {
    for (const L of Object.values(GAME.LOC)) for (const e of (L.exits || [])) {
      if (!BATHS.includes(e.to) || e._life) continue;
      const own = e.lock; e._life = true;
      e.lock = s => (own && own(s)) || loo(e.to, s);
    }
  }
  return { ACTS, act, icon, pose, nowLine, hear, wireBathrooms };
})();
LIFE.wireBathrooms();
