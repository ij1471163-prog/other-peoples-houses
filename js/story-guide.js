/* =====================================================================
   Knowing where you are in the story (UI only; no story text, quest,
   condition or ending changes).
     1. A goal line under the top bar: which chapter and house you are in,
        and the story task that matters most right now (its own title).
        Tap it to open the tasks.
     2. The phone's Tasks tab is split: "The story so far" (what you have
        found out, from flags the story already sets), then story tasks,
        then side errands, then the finished ones.
   ===================================================================== */
'use strict';
(function () {
  const HOUSE = {
    elias: T('Elias\'s cottage', 'بيت إلياس'), leo: T('The boathouse', 'بيت القوارب'), margaret: T('Margaret\'s house', 'بيت مارغريت'),
    evelyn: T('The lighthouse', 'المنارة'), victor: T('The Saltmere Grand', 'فندق سولتمير غراند')
  };
  /* the task that matters most in each house, first match wins (all titles already exist in the game) */
  const MAIN = {
    elias: ['q_final', 'q_secret', 'q_thomas'], leo: ['q_final2', 'q_rent', 'q_father'], margaret: ['q_m_final', 'q_m_room2', 'q_m_room', 'q_m_pills'],
    evelyn: ['q_e_307', 'q_e_1958', 'q_e_lamp'], victor: ['q_v_expose', 'q_v_ana', 'q_v_suite'], none: ['q_bed', 'q_postcard', 'q_doors']
  };
  const STORY_EXTRA = ['q_postcard', 'q_doors', 'q_bed'];
  const AR_NUM = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const L = {
    chapter: n => T('Chapter ' + n, 'الفصل ' + AR_NUM(n)),
    between: T('Between houses', 'بين بيتين'),
    after: T('Saltmere', 'سولتمير'),
    sofar: T('The story so far', 'القصة إلى الآن'),
    story: T('Story', 'القصة'),
    side: T('Around town', 'في البلدة'),
    done: T('Finished', 'خلصت'),
    none: T('Nothing to do right now. Walk around, talk to people.', 'ما فيه شي الحين. {تمشّى|تمشّي} {وكلّم|وكلّمي} الناس.')
  };
  const isMain = k => !!(GAME.QUEST_OWNER || {})[k] || STORY_EXTRA.includes(k);

  function chapterOf(s) {
    if (s.host === 'elias') return 1;
    if (s.host === 'leo') return 2;
    if (s.host && HOUSE[s.host]) return 3 + ['margaret', 'evelyn', 'victor'].filter(h => (s.done || {})[h]).length;
    return 0;
  }
  function topTask(s) {
    const list = MAIN[s.host] || MAIN.none;
    return list.find(k => s.quests[k] === 'active' && GAME.QUESTS[k]) || null;
  }

  /* ---------- 1. the goal line ---------- */
  function goalLine() {
    const s = S(); const st = $('stage'); if (!s || !st) return;
    const chips = st.querySelector('.hud .chips'); if (!chips) return;
    chips.querySelectorAll('.chip.goal').forEach(c => c.remove());
    if (RUN || VIEW.sheet || s.f.prologue || !s.f.metElias || PREFS.get('goal') === false) return;
    const n = chapterOf(s);
    const head = s.host && HOUSE[s.host] ? tx(L.chapter(n)) + ' · ' + tx(HOUSE[s.host]) : tx(s.f.final ? L.after : L.between);
    const k = topTask(s);
    const c = el('button', 'chip goal'); c.type = 'button';
    c.innerHTML = '<span class="g-ico">★</span><b></b>' + (k ? '<span class="g-sep"> — </span><span class="g-task"></span>' : '');
    c.querySelector('b').textContent = head; if (k) c.querySelector('.g-task').textContent = tx(GAME.QUESTS[k].title);
    c.setAttribute('aria-label', head + (k ? ' — ' + tx(GAME.QUESTS[k].title) : ''));
    c.onclick = ev => { ev.stopPropagation(); if (!tapOk(ev)) return; VIEW.tab = 'quests'; openSheet('phone'); };
    chips.appendChild(c);
  }
  const rs0 = renderStage;
  renderStage = function () { const r = rs0.apply(this, arguments); try { goalLine(); } catch (e) { console.error(e); } return r; };

  /* ---------- 2. the tasks tab ---------- */
  function soFar(s) {
    const out = [];
    out.push(T('Your father, Jonah, died last year. You came to Saltmere with a postcard he never posted: "V. — I\'m sorry. — J."', 'أبوك جونا مات السنة اللي فاتت. {وجيت|وجيتي} سولتمير ومعك كرت ما أرسله: «ف. — آسف. — ج.»'));
    if (s.f.knowJonah) out.push(T('Elias knew him. Jonah grew up at No. 9, Fishermen\'s Row, and learned the nets from Elias.', 'إلياس يعرفه. جونا تربّى في رقم ٩ بشارع الصيادين، وتعلّم الشباك عند إلياس.'));
    if (s.f.knowV) out.push(T('Gregor says "V." was Victor, from No. 3, before he became Mr Grand.', 'غريغور يقول إن «ف.» هو فيكتور، من رقم ٣، قبل لا يصير «مستر غراند».'));
    if ((s.f.jm || 0) >= 1) out.push(T('Mum found a photo in Dad\'s things: two boys on Gregor\'s wall, "J. + V., 1989".', 'أمي لقت صورة في أغراض أبوي: ولدين على سور غريغور، «ج. + ف.، ١٩٨٩».'));
    if (s.f.jTicket) out.push(T('Elias told you: Victor sold his father\'s engine and took the beating so Dad could catch the train.', 'إلياس قال لك: فيكتور باع مكينة أبوه وأكل الضرب عشان أبوي يلحق القطار.'));
    if ((s.f.jm || 0) >= 2) out.push(T('The money never went out to "V.". For 25 years it came in, from Saltmere Grand Holdings.', 'الفلوس عمرها ما طلعت لـ«ف.». خمسة وعشرين سنة كانت تدخل، من سولتمير غراند القابضة.'));
    if ((s.f.jm || 0) >= 3) out.push(T('Dad\'s unsent letter: he never went in because he was ashamed he never said thank you.', 'رسالة أبوي اللي ما انرسلت: ما دخل أبد لأنه مستحي إنه ما قال شكراً.'));
    if (s.f.jCall) out.push(T('You called Mum and told her about Saltmere.', '{اتصلت|اتصلتي} على أمي {وقلت|وقلتي} لها عن سولتمير.'));
    if (s.f.vJonah) out.push(T('Victor told you the rest: the friendship, the money, and the claim he signed.', 'فيكتور قال لك الباقي: الصداقة، والفلوس، والمطالبة اللي وقّعها.'));
    else if (!s.f.knowV) out.push(T('Still unknown: who "V." is.', 'لسا ما تعرف: مين «ف.».'));
    if (s.f.calledMother) out.push(T('You called your mother.', '{اتصلت|اتصلتي} بأمك.'));
    const ends = Object.entries(s.done || {}).filter(([h, id]) => HOUSE[h] && GAME.END[id]);
    return { lines: out, ends };
  }
  function tasksTab(body) {
    const s = S(); body.innerHTML = ''; body.classList.add('tasks2');
    /* the story so far */
    const sf = soFar(s), card = el('div', 'sofar');
    card.appendChild(el('strong', '', tx(L.sofar)));
    sf.lines.forEach(t => card.appendChild(el('p', '', tx(t))));
    if (sf.ends.length) { const ul = el('div', 'sf-ends'); sf.ends.forEach(([h, id]) => ul.appendChild(el('span', '', '✓ ' + tx(HOUSE[h]) + ': ' + tx(GAME.END[id].title)))); card.appendChild(ul); }
    body.appendChild(card);
    const act = Object.keys(s.quests).filter(k => s.quests[k] === 'active' && GAME.QUESTS[k]);
    const own = GAME.QUEST_OWNER || {};
    const main = act.filter(isMain).sort((a, b) => (own[b] === s.host) - (own[a] === s.host));
    const side = act.filter(k => !isMain(k));
    const done = Object.keys(s.quests).filter(k => s.quests[k] === 'done' && GAME.QUESTS[k]);
    const section = (title, keys, cls) => {
      if (!keys.length) return;
      body.appendChild(el('h4', 'q-sec ' + cls, title));
      keys.forEach(k => { const q = el('div', 'q ' + cls); q.appendChild(el('strong', '', tx(GAME.QUESTS[k].title))); if (GAME.QUESTS[k].hint) q.appendChild(el('div', '', tx(GAME.QUESTS[k].hint))); body.appendChild(q); });
    };
    section('★ ' + tx(L.story), main, 'main');
    section(tx(L.side), side, 'side');
    if (!main.length && !side.length) body.appendChild(el('p', 'line narr', tx(L.none)));
    if (done.length) {
      const d = el('details', 'q-done'); d.appendChild(el('summary', '', tx(L.done) + ' (' + done.length + ')'));
      done.forEach(k => d.appendChild(el('div', 'q done', tx(GAME.QUESTS[k].title)))); body.appendChild(d);
    }
  }
  const rsh0 = renderSheet;
  renderSheet = function () {
    const r = rsh0.apply(this, arguments);
    try {
      if (VIEW.sheet === 'phone' && VIEW.tab === 'quests') {
        const sh = document.querySelector('#stage .sheet:not(.mapsheet)'); const body = sh && sh.lastElementChild;
        if (body && !body.classList.contains('tabs')) tasksTab(body);
      }
    } catch (e) { console.error(e); }
    return r;
  };
})();
