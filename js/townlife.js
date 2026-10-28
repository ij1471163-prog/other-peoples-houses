/* =====================================================================
   A living town.
     · People talk to each other. When two of them are in the same place
       as you, sometimes you catch a few lines between them, in speech
       bubbles over their heads. They don't stop for you; you can still
       tap anything. What they say follows the story: the petition, the
       storm, Marco's Thursday, Victor, you.
     · People pass by. In the street, the harbour and on the beach,
       now and then someone from town walks across in the background on
       their way somewhere else.
   Nothing here reads or changes trust, suspicion or endings.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = (who, en, ar) => ({ who, t: T(en, ar) });
  /* where, who has to be there, when it fits, the lines */
  const TALK = [
    /* the café */
    { id: 'mo1', at: 'cafe', need: ['marco', 'olivia'], lines: [L('olivia', 'Marco. Sign it again. In bigger letters.', 'ماركو. وقّع مرة ثانية. بحروف أكبر.'), L('marco', 'I signed it twice already. Once as Marcello.', 'وقعت مرتين. مرة باسم مارتشيلو.'), L('olivia', 'Exactly. Now sign it as someone brave.', 'بالضبط. الحين وقّع باسم أحد شجاع.')] },
    { id: 'mo2', at: 'cafe', need: ['marco', 'olivia'], when: s => s.quests.q_petition === 'done', lines: [L('olivia', 'Forty-one names. The council HAS to listen now.', 'واحد وأربعين اسم. المجلس لازم يسمع الحين.'), L('marco', 'Forty-two. I put the cat down. Stella\'s cat. He has strong opinions about the harbour.', 'اثنين وأربعين. حطيت القطو. قطو ستيلا. عنده آراء قوية عن الميناء.')] },
    { id: 'mi1', at: 'cafe', need: ['marco', 'ingrid'], when: s => !s.f.ingridSang, lines: [L('marco', 'Thursday, Ingrid. One song. I\'ll turn the lights down so nobody can see me cry.', 'الخميس يا إنغريد. أغنية وحدة. بطفي الأنوار عشان محد يشوفني أبكي.'), L('ingrid', 'You\'ll cry anyway, Marco. You cried at the weather forecast.', 'بتبكي على كل حال يا ماركو. بكيت على النشرة الجوية.')] },
    { id: 'mi2', at: 'cafe', need: ['marco', 'ingrid'], when: s => !!s.f.ingridSang, lines: [L('ingrid', 'Same table on Thursday. Henrik\'s table.', 'نفس الطاولة الخميس. طاولة هنريك.'), L('marco', 'It has a little sign on it now. RESERVED. It was going to say "for legends" but I ran out of chalk.', 'صار عليها لوحة صغيرة. محجوز. كانت بتقول «للأساطير» بس خلص الطباشير.')] },
    { id: 'mk1', at: 'cafe', need: ['marco', 'kai'], lines: [L('kai', 'Can I pay you tomorrow?', 'أقدر أدفع لك بكرة؟'), L('marco', 'You said that tomorrow. Yesterday.', 'قلت هالكلام بكرة. أمس.'), L('kai', 'And I meant it both times.', 'وكنت أعنيه بالمرتين.')] },
    { id: 'mk2', at: 'cafe', need: ['marco', 'kai'], when: s => !!s.f.mcDone, lines: [L('kai', 'Do the fish one again.', '{قل|قول} حقت السمك مرة ثانية.'), L('marco', 'No. An artist moves on.', 'لا. الفنان يتطور.'), L('kai', 'Please?', 'تكفى؟'), L('marco', '...Why don\'t fish play basketball?', '...ليش السمك ما يلعب كرة سلة؟')] },
    { id: 'mm1', at: 'cafe', need: ['marco', 'maya'], lines: [L('maya', 'Still no sign of the Gull\'s Luck. Somebody\'s painted over her name by now.', 'لسا ما فيه أثر لـ«حظ النورس». أكيد أحد صبغ اسمها.'), L('marco', 'Soup\'s on the house till you find her.', 'الشوربة على حسابي لين تلقينها.'), L('maya', 'Then I\'ll look slowly.', 'أجل بدور على مهلي.')] },
    { id: 'me1', at: 'cafe', need: ['marco', 'elias'], when: s => !!s.f.forgot, lines: [L('marco', 'Your move.', 'دورك.'), L('elias', 'I know it\'s my move. I\'m thinking.', 'أدري إنه دوري. قاعد أفكر.'), L('marco', '...Take your time.', '...على راحتك.')] },
    { id: 'me2', at: 'cafe', need: ['marco', 'elias'], lines: [L('elias', 'You moved that knight while I blinked.', 'حركت ذاك الحصان وأنا أرمش.'), L('marco', 'I would never.', 'مستحيل.'), L('elias', 'Your nonna did. Every Sunday.', 'جدتك كانت تسويها. كل أحد.')] },
    /* the beach */
    { id: 'ki1', at: 'beach', need: ['kai', 'ingrid'], lines: [L('kai', 'Ingrid! Watch this!', 'إنغريد! {شوفي} هذي!'), L('ingrid', 'I watched it yesterday. You fell off.', 'شفتها أمس. طحت.'), L('kai', 'This is a different falling off.', 'هذي طيحة غير.')] },
    { id: 'ks1', at: 'beach', need: ['kai', 'stella'], lines: [L('stella', 'You\'re sunburnt on exactly one half of your face.', 'محروق من الشمس على نص وجهك بالضبط.'), L('kai', 'I was thinking about something on that side.', 'كنت أفكر في شي من ذيك الجهة.')] },
    /* the cemetery */
    { id: 'gi1', at: 'cemetery', need: ['gregor', 'ingrid'], lines: [L('gregor', 'Lilies again, Ingrid?', 'زنبق مرة ثانية يا إنغريد؟'), L('ingrid', 'He hated lilies. That\'s why. He\'d have laughed.', 'كان يكره الزنبق. عشان كذا. كان بيضحك.')] },
    { id: 'gi2', at: 'cemetery', need: ['gregor', 'ingrid'], when: s => !!s.f.ingridSang, lines: [L('gregor', 'I heard you sang on Thursday.', 'سمعت إنك غنيتي الخميس.'), L('ingrid', 'I told Henrik first. Right here. He didn\'t say anything. He never did, when it was good.', 'قلت لهنريك أول. هنا بالضبط. ما قال شي. عمره ما كان يقول، لما يكون شي زين.')] },
    /* the street */
    { id: 'or1', at: 'street', need: ['olivia', 'rex'], lines: [L('olivia', 'Officer. You\'re a resident of Saltmere.', 'حضرة الضابط. {أنت|أنت} من سكان سولتمير.'), L('rex', 'I am in uniform, Olivia.', 'أنا لابس الرسمي يا أوليفيا.'), L('olivia', 'Uniforms have hands. Hands can sign.', 'الرسمي له يدين. واليدين توقّع.')] },
    { id: 'or2', at: 'street', need: ['olivia', 'rex'], when: s => !!s.f.storm, lines: [L('rex', 'Half the gear in the harbour gone in one night.', 'نص عدّة الميناء راحت في ليلة.'), L('olivia', 'And the Grand\'s windows didn\'t even rattle. Funny how the sea knows who to bother.', 'وشبابيك الغراند ما اهتزت حتى. غريب كيف البحر يعرف مين يزعج.')] },
    { id: 'ok1', at: 'street', need: ['olivia', 'kell'], lines: [L('olivia', 'Would you like to sign a petition to save Fisher\'s Row?', '{تبي|تبي} توقع عريضة لإنقاذ شارع الصيادين؟'), L('kell', '...', '...'), L('olivia', 'That\'s not a no.', 'هذا مو لا.')] },
    { id: 'ok2', at: 'street', need: ['olivia', 'kell'], when: s => !!s.f.sdRosa, lines: [L('kell', 'Give me the pen.', '{عطيني} القلم.'), L('olivia', 'You\'re... you work for him.', 'أنت... أنت تشتغل عنده.'), L('kell', 'Number 12 was my sister\'s. Give me the pen.', 'رقم ١٢ كان بيت أختي. {عطيني} القلم.')] },
    /* the hotel */
    { id: 'bk1', at: 'hotel_lobby', need: ['bella', 'kell'], lines: [L('bella', 'Read me one. Quick, before he comes down.', 'اقرا لي وحدة. بسرعة، قبل لا ينزل.'), L('kell', '"You must change your life."', '«لازم تغير حياتك.»'), L('bella', 'That\'s it? That\'s the whole poem?', 'بس؟ هذي القصيدة كلها؟'), L('kell', 'That\'s the part that matters.', 'هذا الجزء المهم.')] },
    { id: 'ak1', at: 'hotel_staff', need: ['ana', 'kell'], lines: [L('ana', 'You are carrying the towels wrong.', 'شايل الفوط غلط.'), L('kell', 'There\'s a right way?', 'فيه طريقة صح؟'), L('ana', 'There is my way.', 'فيه طريقتي.')] },
    /* the harbour */
    { id: 'mE1', at: 'harbor', need: ['maya', 'elias'], lines: [L('maya', 'Wind\'s turning, Elias.', 'الريح تنقلب يا إلياس.'), L('elias', 'Wind\'s always turning. That\'s what it\'s for.', 'الريح دايم تنقلب. هذا شغلها.')] },
    { id: 'mE2', at: 'harbor', need: ['maya', 'elias'], when: s => s.f.storm === 'saved', lines: [L('maya', 'Heard your lodger mended your net in the squall.', 'سمعت إن ساكنك صلّح شبكتك في العاصفة.'), L('elias', 'Heard that too. Don\'t tell them I told everyone.', 'وأنا سمعت بعد. لا {تقولين} لهم إني قلت للكل.')] },
    { id: 'mk3', at: 'harbor', need: ['maya', 'kai'], lines: [L('kai', 'Maya, does the sea have a favourite fish?', 'مايا، البحر عنده سمكة مفضلة؟'), L('maya', 'Go away, Kai.', '{روح} يا كاي.'), L('kai', 'It\'s you. You\'re the favourite fish.', 'أنتِ. أنتِ السمكة المفضلة.')] }
  ];
  /* lines about you, once you've done things */
  const YOU = [
    { id: 'y1', at: 'cafe', need: ['marco', 'kai'], when: s => (s.f.shifts || 0) >= 2, lines: [L('kai', 'Your new waiter gave me the right soup.', 'الجرسون الجديد عطاني الشوربة الصح.'), L('marco', 'They\'re better than me. I\'m going to have to fire them out of jealousy.', 'أحسن مني. لازم أفصلهم من الغيرة.')] },
    { id: 'y2', at: 'cemetery', need: ['gregor', 'ingrid'], when: s => !!s.f.nellRest, lines: [L('ingrid', 'Who left flowers on the Farrow stone?', 'مين حط ورد على حجر فارو؟'), L('gregor', 'Somebody who isn\'t from here. Which is how you know they are, now.', 'أحد مو من هنا. وهذا اللي يخليك تعرف إنه صار من هنا.')] },
    { id: 'y3', at: 'street', need: ['olivia', 'rex'], when: s => !!s.f.irNightDone, lines: [L('rex', 'Heard the new kid stitched the Doyle boy on the dock.', 'سمعت إن الجديد خيّط ولد دويل على الرصيف.'), L('olivia', 'Then they can sign my petition with a steady hand.', 'أجل يقدر يوقّع عريضتي بيد ثابتة.')] },
    { id: 'y4', at: 'cafe', need: ['marco', 'olivia'], when: s => !!s.f.jCall, lines: [L('olivia', 'Did you know the new one\'s dad grew up at number 9?', '{تدري} إن أبو الجديد تربى في رقم ٩؟'), L('marco', 'The whole town knows. The whole town also knows you put it in the petition.', 'البلد كله يدري. والبلد كله يدري إنك حطيتيها في العريضة.')] }
  ];
  const ALL = TALK.concat(YOU);

  const pos = id => { const layer = document.querySelector('#stage .chars'); if (!layer) return null;
    const ids = (VIEW.stageChars || present(S().loc).map(i => ({ id: i }))).filter(c => c && GAME.CHAR[c.id] && GAME.CHAR[c.id].art).map(c => c.id);
    const d = layer.children[ids.indexOf(id)]; if (!d) return null;
    const im = d.querySelector('img') || d; const r = im.getBoundingClientRect(), st = $('stage').getBoundingClientRect();
    return { x: r.left + r.width / 2 - st.left, y: r.top - st.top, w: st.width, cw: r.width, h: st.height }; };
  let timer = 0, playing = null;
  function stop() { clearTimeout(timer); playing = null; document.querySelectorAll('#stage .tl-bub').forEach(b => b.remove()); }
  function bubble(line) {
    const p = pos(line.who); if (!p) return false;
    const b = el('div', 'tl-bub'), right = p.x > p.w / 2; b.textContent = tx(line.t);
    b.classList.add(right ? 'r' : 'l');
    if (right) b.style.right = Math.max(8, p.w - p.x + p.cw * 0.22) + 'px'; else b.style.left = Math.max(8, p.x + p.cw * 0.22) + 'px';
    b.style.top = Math.max(58, p.y + p.h * 0.06) + 'px';
    $('stage').appendChild(b); requestAnimationFrame(() => b.classList.add('on'));
    setTimeout(() => { b.classList.remove('on'); setTimeout(() => b.remove(), 400); }, 2700 + tx(line.t).length * 18);
    return true;
  }
  function play(talk, s) {
    playing = talk.id; s.f['tl_' + talk.id] = s.day; let i = 0;
    const next = () => {
      if (playing !== talk.id || RUN || S().loc !== talk.at) { stop(); return; }
      if (i >= talk.lines.length) { playing = null; return; }
      const line = talk.lines[i++];
      bubble(line); timer = setTimeout(next, 2900 + tx(line.t).length * 18);
    };
    timer = setTimeout(next, 900);
  }
  const here = (s, id) => { try { return (present(s.loc) || []).includes(id); } catch (e) { return false; } };
  function pick(s) {
    if (s.f.tlDay === s.day + ':' + s.slot + ':' + s.loc) return null;
    const fit = ALL.filter(t => t.at === s.loc && t.need.every(id => here(s, id)) && (!t.when || t.when(s)) && s.f['tl_' + t.id] !== s.day);
    if (!fit.length) return null;
    /* story-aware ones first, then anything not heard for a while */
    fit.sort((a, b) => (b.when ? 1 : 0) - (a.when ? 1 : 0) || (s.f['tl_' + a.id] || -1) - (s.f['tl_' + b.id] || -1));
    return fit[0];
  }

  /* ---------- people passing by ---------- */
  const WALK = { street: [0.14, 0.42] };   /* where the path is (bottom of figure, % of stage height) and how tall */
  const NOWALK = ['keeper', 'nell', 'thomas', 'ada', 'henrik', 'victor'];
  /* walk cycles: a strip of frames, drawn facing right, made from a short video of the character walking in place */
  const SPRITE = { olivia: { n: 18, ar: 263 / 600, cyc: 1.5 } };
  let wTimer = 0;
  function walker(first) {
    clearTimeout(wTimer);
    const s = S(); if (!s || RUN || REDUCED() || s.slot >= NIGHT || s.f.prologue || !WALK[s.loc]) return;
    wTimer = setTimeout(() => {
      const s2 = S(); if (RUN || s2.loc !== s.loc || document.querySelector('#stage .tl-walk') || document.querySelector('.sheet')) { walker(); return; }
      const ids = Object.keys(SPRITE).filter(id => { const c = GAME.CHAR[id]; if (!c || id === s2.host || here(s2, id)) return false; try { return (c.where ? c.where(s2) : null) !== s2.loc; } catch (e) { return false; } });
      if (!ids.length) { walker(); return; }
      const id = ids[Math.floor(Math.random() * ids.length)], sp = SPRITE[id], [b, h] = WALK[s2.loc], ltr = Math.random() < 0.5;
      const stage = $('stage'), H = stage.clientHeight * h, W = H * sp.ar, SW = stage.clientWidth;
      const w = el('div', 'tl-walk'); w.style.cssText = `bottom:${b * 100}%;height:${H}px;width:${W}px;left:0`;
      const f = el('div', 'tl-frames'); f.style.backgroundImage = `url(img/chars/${id}-walk.webp)`; f.style.backgroundSize = `${sp.n * 100}% 100%`;
      f.style.setProperty('--end', (sp.n / (sp.n - 1) * 100) + '%'); f.style.animation = `tlStep ${sp.cyc}s steps(${sp.n}) infinite`; if (!ltr) f.style.transform = 'scaleX(-1)';
      w.appendChild(f);
      /* two steps per cycle, each about 0.42 of the body's height: the feet stay put on the ground */
      const speed = (H * 0.84) / sp.cyc, from = ltr ? -W : SW, to = ltr ? SW : -W, dur = Math.abs(to - from) / speed;
      const lay = stage.querySelector('.chars'); lay.parentNode.insertBefore(w, lay);
      w.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], { duration: dur * 1000, easing: 'linear', fill: 'forwards' }).onfinish = () => w.remove();
      walker();
    }, first ? 2500 : 9000 + Math.random() * 16000);
  }
  window.__walk = () => { clearTimeout(wTimer); wTimer = 0; walker(true); };

  const rs0 = renderStage;
  renderStage = function () {
    const r = rs0.apply(this, arguments);
    try {
      const s = S();
      if (RUN) { stop(); } else if (!playing) { const t = pick(s); if (t) { s.f.tlDay = s.day + ':' + s.slot + ':' + s.loc; play(t, s); } }
      if (!RUN && !wTimer) walker();
      if (RUN || !WALK[s.loc]) { clearTimeout(wTimer); wTimer = 0; document.querySelectorAll('#stage .tl-walk').forEach(x => x.remove()); }
    } catch (e) { console.error(e); }
    return r;
  };
  window.__townlife = { ALL, pick };
})();
