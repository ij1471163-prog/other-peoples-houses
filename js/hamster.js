/* =====================================================================
   Biscuit, Daniel's hamster (Margaret's house).
   In the sunroom, among the plants, a small cage with a note in a boy's
   handwriting: "BISCUIT — NO CHOCOLATE!! — D." Daniel's Biscuit died last
   spring. This one is tiny and new: Margaret bought him "so the cage
   wouldn't be empty", and gave him the same name. She keeps him the way
   she keeps the sunroom: alive, on purpose.
     · the first time: Margaret finds you at the cage and tells you whose
       he was (and smiles, for the first time);
     · once a day you can look after him: seeds, fresh water, or hold him
       in your hand; each time she tells you one small thing about Daniel;
     · one morning the cage is open and he is gone, and she is frightened;
       you find him asleep in the toe of Daniel's old trainer.
     · at night, from the sitting room, you can hear his wheel.
   Its own flags (s.f.bis*); mood only. No trust, suspicion, quest or
   ending changes.
   ===================================================================== */
'use strict';
(function () {
  const L = GAME.LOC; if (!L.marg_garden) return;
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const M = (e, en, ar) => ({ c: 'margaret', e, t: T(en, ar) });
  const inHouse = s => s && s.host === 'margaret';
  const home = s => GAME.CHAR.margaret && GAME.CHAR.margaret.where && !!GAME.CHAR.margaret.where(s);

  /* what Margaret tells you, one a day, while you look after him */
  const TELLS = [
    [M('smile', 'Daniel bought the first Biscuit with his own pocket money. Fifteen. Stood in the kitchen and said "Don\'t worry, Mum, he won\'t sleep in my room." He slept in his room every night for two years.', 'دانيال شرى بسكوت الأول بمصروفه. كان عمره خمستعش. وقف في المطبخ وقال «لا تخافين يمه، ما راح ينام في غرفتي.» ونام في غرفته كل ليلة سنتين.')],
    [M('neutral', 'Daniel used to talk to him at night, when he thought I was asleep. About school. About a girl. Mostly about the girl.', 'دانيال كان يكلمه بالليل، لما يحسبني نايمة. عن المدرسة. وعن بنت. أغلب الكلام عن البنت.')],
    [M('smile', 'Daniel taught the first one to come out of the cage and go back in when he whistled. Didn\'t tell me for a month. I found out because Biscuit was in my slipper.', 'دانيال علّم الأول يطلع من القفص ويرجع لما يصفر. وما قال لي إلا بعد شهر. عرفت لأني لقيت بسكوت في نعالي.')],
    [M('sad', 'After the funeral I didn\'t feed the old one for a day. I forgot he existed. Then I heard the wheel at three in the morning, and I sat on the floor by the cage until it was light.', 'بعد الجنازة ما أكّلت القديم يوم كامل. نسيت إنه موجود. وبعدين سمعت العجلة الساعة ثلاث الفجر، وجلست على الأرض جنب القفص لين طلع النور.')],
    [M('smile', 'This one bit me the first day. Daniel\'s never bit anyone. I said "well, you\'re your own hamster, then", and I think that\'s when I started to like him.', 'هذا عضني أول يوم. حق دانيال عمره ما عض أحد. قلت له «طيب، أنت همستر لحالك»، وأظن من يومها بديت أحبه.')],
    [M('smile', 'Thank you for looking after him. He likes you. He hides his seeds in your sleeve. That\'s how you know.', 'مشكور{|ة} إنك {تهتم|تهتمين} فيه. هو يحبك. يخبي بذوره في كمك. هذي الطريقة اللي تعرف فيها.')]
  ];

  L.marg_garden.spots.push({ x: 74, y: 52, label: T('A small cage among the plants', 'قفص صغير بين الزرع'),
    if: s => inHouse(s),
    run: s => {
      /* the first time */
      if (!s.f.bisSeen) {
        s.f.bisSeen = s.day;
        const out = [
          N1('A small cage among the hydrangeas, cleaner than anything else in the house. In the bedding, a tiny pink-and-white hamster, round as a dumpling, is asleep, breathing very fast. Taped to the bars, in a boy\'s capitals: "BISCUIT — NO CHOCOLATE!! — D."', 'قفص صغير بين الهيدرانجيا، أنظف من أي شي ثاني في البيت. وفي النشارة، همستر صغير وردي وأبيض، مدوّر مثل الكبة، نايم ويتنفس بسرعة. وملصوق على القضبان، بحروف ولد كبيرة: «بسكوت — لا تعطونه شوكولاتة!! — د.»')
        ];
        if (home(s)) out.push({ show: [{ id: 'margaret', e: 'neutral' }] },
          M('neutral', 'That\'s Biscuit. Well. Biscuit the second. Daniel\'s Biscuit died last spring. I couldn\'t stand the empty cage.', 'هذا بسكوت. يعني، بسكوت الثاني. بسكوت حق دانيال مات الربيع اللي فات. وما قدرت أتحمل القفص فاضي.'),
          M('smile', 'Don\'t wake him. He\'s three months old and he thinks he owns the house. He might be right.', 'لا {تصحيه|تصحينه}. عمره ثلاث شهور ويحسب إنه يملك البيت. يمكن معه حق.'),
          N1('It\'s the first time you have seen her smile. It doesn\'t last, but it was there.', 'هذي أول مرة {تشوفها|تشوفينها} تبتسم. ما طوّلت، بس كانت موجودة.'));
        return out;
      }
      /* the morning he gets out */
      if (!s.f.bisScare && (s.f.bisCare || 0) >= 3 && home(s) && s.slot <= 1) {
        s.f.bisScare = s.day; s.f.bisWell = true;
        return [{ show: [{ id: 'margaret', e: 'worry' }] },
          N1('The cage door is open. The bedding is empty. Margaret is on her knees looking under the plant pots, very fast, very quietly.', 'باب القفص مفتوح. والنشارة فاضية. ومارغريت على ركبها تدور تحت الأحواض، بسرعة، وبهدوء مرة.'),
          M('sad', 'I left it open. I left it open. He\'s so small, he could be anywhere, he could be in the walls—', 'تركته مفتوح. تركته مفتوح. هو صغير مرة، ممكن يكون في أي مكان، ممكن يكون داخل الجدران—'),
          { menu: [
            { t: T('Look under the wicker chair', '{تدور|تدورين} تحت كرسي الخيزران'), then: [N1('Nothing but a seed husk. He was here, though.', 'ما فيه إلا قشرة بذرة. بس كان هنا.')] },
            { t: T('Follow the seed husks', '{تتبع|تتبعين} قشور البذور'), then: [] }
          ] },
          N1('A trail of tiny seed husks goes across the floor, out of the sunroom, through the sitting room, to the shoe rack by the door. In the toe of an old trainer, much too big for anyone in this house now, there is a small warm ball of hamster, fast asleep.', 'خط قشور بذور صغيرة يمشي على الأرض، من غرفة الزرع، ويقطع الصالة، لين رف الجزم عند الباب. وفي مقدمة جزمة رياضية قديمة، كبيرة على أي أحد في البيت الحين، فيه كورة همستر صغيرة ودافية، نايمة بعمق.'),
          { show: [{ id: 'margaret', e: 'cry' }] },
          M('sad', 'That\'s Daniel\'s. That was Daniel\'s shoe.', 'هذي حق دانيال. هذي جزمة دانيال.'),
          N1('She doesn\'t take him out. She sits down on the floor next to the shoe rack and laughs and cries at the same time, and you sit down with her, and Biscuit sleeps through all of it.', 'ما تطلعه. تجلس على الأرض جنب رف الجزم، وتضحك وتبكي بنفس الوقت، {وتجلس|وتجلسين} معها، وبسكوت نايم وما درى بشي.'),
          st => { addMood(1); return null; }];
      }
      /* once a day: look after him */
      if (doneToday('bisCare')) return [N1(...fresh('bisZ', [
        ['He\'s asleep again, in a heap of bedding with one foot sticking out.', 'نايم مرة ثانية، في كومة نشارة ورجل وحدة طالعة.'],
        ['He is running on his wheel with total commitment and going nowhere. You know the feeling.', 'يركض على عجلته بكل جدية وما يوصل لأي مكان. {تعرف|تعرفين} هالإحساس.']]))];
      return [{ q: T('Biscuit is awake and looking at you, whiskers going.', 'بسكوت صاحي ويطالعك، وشواربه تتحرك.'), menu: [
        { t: T('Give him some seeds', '{تعطيه|تعطينه} بذور'), then: [N1('He takes each seed in both hands, turns it, and pushes it into his cheek. Then the next. Then the next. He is now mostly cheek.', 'ياخذ كل بذرة بيدينه الثنتين، ويلفها، ويدفها في خده. وبعدين اللي بعدها. واللي بعدها. والحين أغلبه خدود.'), st => care(st)] },
        { t: T('Change his water', '{تغير|تغيرين} مويته'), then: [N1('Fresh water in the little bottle. He comes over at once and drinks with tiny, serious clicks.', 'موية جديدة في القارورة الصغيرة. يجي على طول ويشرب بطقطقات صغيرة وجدية.'), st => care(st)] },
        { t: T('Take him out and play', '{تطلعه|تطلعينه} {وتلعب|وتلعبين} معه'), then: [{ mini: 'biscuit', then: (r, st) => [N1(...(r
          ? ['He falls asleep right there on the little table, a warm pink ball, his sides going up and down very fast. You don\'t move for a long time.', 'نام مكانه على الطاولة الصغيرة، كورة وردية دافية، وجنبه يطلع وينزل بسرعة. وما {تتحرك|تتحركين} وقت طويل.']
          : ['You put him back in his bedding. He starts building a nest out of it at once, very busy, very offended.', '{ترجعه|ترجعينه} لنشارته. ويبدأ يبني عش على طول، مشغول مرة، وزعلان مرة.']))] }, st => care(st)] },
        { t: T('Let him sleep', '{خله|خليه} ينام'), then: [] }
      ] }];
    } });

  function care(s) {
    onceToday('bisCare'); addMood(1);
    const n = s.f.bisCare = (s.f.bisCare || 0) + 1;
    if (!home(s) || n > TELLS.length) return null;
    return [{ show: [{ id: 'margaret', e: TELLS[n - 1][0].e }] }].concat(TELLS[n - 1]);
  }

  /* ---------- playing with him on the little table (frames from the user's video, img/fx/biscuit/00-25) ----------
     0-3 he sniffs about; tap = a seed: 4-15 he stuffs it in his cheek; stroke his back
     slowly and he gets sleepy: 16-25 his eyes close. Too fast and he freezes. */
  GAME.MINI.biscuit = function (panel, done) {
    panel.innerHTML = '';
    const FR = Array.from({ length: 26 }, (_, i) => 'img/fx/biscuit/' + String(i).padStart(2, '0') + '.webp');
    FR.forEach(u => { const im = new Image(); im.src = u; });
    const box = el('div', 'cp ho ho-pet ho-bis'); box.setAttribute('role', 'dialog');
    box.innerHTML = '<div class="cp-area"><div class="ho-bg"></div><div class="pet-body"><img class="pet-cat" alt=""></div><div class="pet-sub"><strong class="cp-title"></strong><span class="cp-hint"></span></div><button type="button" class="cp-skip"></button></div>';
    $('stage').appendChild(box);
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(e => box.addEventListener(e, ev => ev.stopPropagation()));
    const q = x => box.querySelector(x), img = q('.pet-cat'), area = q('.cp-area'), body = q('.pet-body');
    const hint = t => { q('.cp-hint').textContent = tx(t); };
    q('.cp-title').textContent = tx(T('Biscuit', 'بسكوت'));
    hint(T('Tap to give him a seed. Stroke his back, slowly.', '{انقر|انقري} عشان {تعطيه|تعطينه} بذرة. {وامسح|وامسحي} على ظهره، بشويش.'));
    q('.cp-skip').textContent = tx(T('Put him back', '{رجّعه|رجّعيه}'));
    const bg = (PEOPLE.IMG.bg && (PEOPLE.IMG.bg.marg_garden || '')) || '';
    q('.ho-bg').style.backgroundImage = bg ? `url(${bg})` : '';
    const alt = el('button', 'opt main cp-alt', tx(T('Put him back', '{رجّعه|رجّعيه}'))); alt.type = 'button'; panel.appendChild(alt);
    let over = false, won = false, cur = 0, seeds = 0, calm = 0, eating = -1, freeze = 0, last = null, travel = 0, downAt = 0, raf = 0, lastStep = 0;
    const show = i => { if (i !== cur || !img.src) { cur = i; img.src = FR[i]; } };
    show(0);
    const finish = r => { if (over) return; over = true; cancelAnimationFrame(raf); alt.remove(); box.classList.add('out'); box.style.pointerEvents = 'none'; setTimeout(() => box.remove(), 260); done(r); };
    q('.cp-skip').onclick = ev => { ev.stopPropagation(); finish(0); };
    alt.onclick = () => finish(0);
    const loop = now => {
      if (over) return; raf = requestAnimationFrame(loop);
      const fz = Math.max(0, freeze - now) / 900;
      body.style.transform = `translateX(-50%) scale(${(1 - fz * 0.04).toFixed(3)}, ${(1 + Math.sin(now / 420) * 0.008 - fz * 0.06).toFixed(3)})`;
      if (now - lastStep < 83) return; lastStep = now;
      if (eating >= 0) { const k = Math.floor((now - eating) / 83); if (k < 12) return show(4 + k); eating = -1; }
      const sleepy = Math.round(Math.min(1, calm / 100) * 9);
      if (sleepy > 0 && seeds > 0) {
        const t = 16 + sleepy;
        if (cur < 16) return show(16);
        if (cur < t) return show(cur + 1);
        if (cur > t) return show(cur - 1);
        if (t >= 25 && !won) { won = true; alt.remove(); hint(T('He\'s asleep.', 'نام.')); setTimeout(() => finish(1), 1600); }
        return;
      }
      if (cur > 3 && cur < 16) return show(cur === 15 ? 0 : cur);   /* cheeks full: rest on the last frame, then back */
      show((cur + (Math.random() < 0.35 ? 1 : 0)) % 4);            /* sniffing */
    };
    raf = requestAnimationFrame(loop);
    const onHim = ev => { const r = img.getBoundingClientRect(); return ev.clientX > r.left + r.width * 0.15 && ev.clientX < r.right - r.width * 0.15 && ev.clientY > r.top && ev.clientY < r.top + r.height * 0.72; };
    area.addEventListener('pointerdown', ev => { if (over || won) return; ev.preventDefault(); last = { x: ev.clientX, y: ev.clientY, t: performance.now() }; travel = 0; downAt = last.t; try { area.setPointerCapture(ev.pointerId); } catch (e) { /* none */ } });
    area.addEventListener('pointermove', ev => {
      if (over || won || !last || performance.now() < freeze) return;
      const now = performance.now(), d = Math.hypot(ev.clientX - last.x, ev.clientY - last.y), sp = d / Math.max(1, now - last.t);
      last = { x: ev.clientX, y: ev.clientY, t: now }; travel += d;
      if (!onHim(ev)) return;
      if (sp > 1.8 && d > 5) { freeze = now + 900; calm = Math.max(0, calm - 20); hint(T('Too fast. He freezes into a ball.', 'بسرعة زيادة. تجمّد وتكوّر.')); return; }
      if (seeds === 0) { hint(T('He\'s too busy sniffing for food. Give him a seed first.', 'مشغول يشم يدور أكل. {عطه|عطيه} بذرة أول.')); return; }
      if (sp < 1.2) { calm = Math.min(100, calm + d * 0.12); if (calm > 25 && calm < 90) hint(T('His eyes are getting heavy.', 'عيونه بدت تثقل.')); }
    });
    area.addEventListener('pointerup', ev => {
      if (over || won || !last) return;
      const quick = performance.now() - downAt < 220 && travel < 8; last = null;
      if (!quick || !onHim(ev) || eating >= 0) return;
      seeds++; eating = performance.now(); calm = Math.max(0, calm - 10);
      hint(seeds === 1 ? T('Into the cheek it goes. And another. He is now mostly cheek.', 'ودخلت في الخد. والثانية. والحين أغلبه خدود.') : T('Another seed. His cheeks can apparently hold the whole bag.', 'بذرة ثانية. واضح إن خدوده تشيل الكيس كله.'));
    });
    area.addEventListener('pointercancel', () => { last = null; });
  };

  /* at night, from the sitting room: his wheel */
  if (L.marg_living) L.marg_living.spots.push({ x: 84, y: 40, label: T('A tiny squeaking, from the sunroom', 'صرير صغير، من غرفة الزرع'),
    if: s => inHouse(s) && s.slot === NIGHT && !doneToday('bisWheel'),
    run: s => { onceToday('bisWheel'); return [N1(...(s.f.bisSeen
      ? ['Biscuit, on his wheel, at full speed, in the dark. It\'s the only thing in the house that sounds busy.', 'بسكوت على عجلته، بأقصى سرعة، في الظلام. هو الشي الوحيد في البيت اللي صوته مشغول.']
      : ['Squeak, squeak, squeak, very fast and very small, from the sunroom. Something in this house is alive and in a hurry.', 'صرير، صرير، صرير، سريع مرة وصغير مرة، من غرفة الزرع. فيه شي في هالبيت حي ومستعجل.']))]; } });
})();
