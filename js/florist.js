/* =====================================================================
   Stella's flowers, for real: help in the shop (mornings to afternoons,
   once a day, paid). A customer tells you who the flowers are for, in
   their own words. Every flower means something (Stella's chalkboard
   says what). Pick three stems, then tie it. Get the feeling right and
   they light up; put a lily in a birthday bouquet and they don't.
   Stella's own story (no game): who the bouquet she makes every Friday,
   and never sells, is for.
   No trust or ending changes.
   ===================================================================== */
'use strict';
(function () {
  const K = window.MINIKIT; if (!K) return;
  const { card, shell, blip } = K;
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const SL = (e, en, ar) => ({ c: 'stella', e, t: T(en, ar) });
  /* little drawn flowers (emoji for lilies and lavender are missing on older phones) */
  const petals = (n, r, w, col, mid) => { let p = ''; for (let i = 0; i < n; i++) p += `<ellipse cx="20" cy="${20 - r}" rx="${w}" ry="${r}" fill="${col}" stroke="#3a2a22" stroke-width="1.2" transform="rotate(${i * 360 / n} 20 20)"/>`; return p + `<circle cx="20" cy="20" r="${mid[0]}" fill="${mid[1]}" stroke="#3a2a22" stroke-width="1.2"/>`; };
  const SV = b => `<svg viewBox="0 0 40 40" class="fl-ic">${b}</svg>`;
  const ICON = {
    rose: SV('<circle cx="20" cy="20" r="13" fill="#d23a4a" stroke="#3a2a22" stroke-width="1.4"/><path d="M20 12c5 1 7 6 3 9-3 2-7 0-6-3 1-2 4-2 4 0" fill="none" stroke="#7a1626" stroke-width="1.6"/><path d="M10 22c2 6 9 9 16 5" fill="none" stroke="#7a1626" stroke-width="1.4"/>'),
    tulip: SV('<path d="M11 14c0 12 4 18 9 18s9-6 9-18l-5 5-4-8-4 8z" fill="#f08ab0" stroke="#3a2a22" stroke-width="1.4"/>'),
    sun: SV(petals(12, 8, 3.2, '#f4c430', [7, '#5a3a18'])),
    daisy: SV(petals(10, 8, 3, '#ffffff', [5, '#f4c430'])),
    lily: SV(petals(6, 10, 4.2, '#f7f5ee', [3, '#e8c25a']) + '<path d="M20 20l-3-6M20 20l3-6M20 20l0-7" stroke="#b48a2a" stroke-width="1.2"/>'),
    lav: SV('<path d="M20 36V10" stroke="#5a8a4a" stroke-width="2"/>' + [8, 12, 16, 20, 24].map((y, i) => `<ellipse cx="${17 + (i % 2) * 6}" cy="${y}" rx="3.2" ry="2.6" fill="#9a7ad8" stroke="#3a2a22" stroke-width="1"/>`).join(''))
  };
  const FL = {
    rose: { i: ICON.rose, t: T('Red rose', 'جوري أحمر'), m: T('love', 'حب') },
    tulip: { i: ICON.tulip, t: T('Tulip', 'توليب'), m: T('I\'m sorry', 'آسف') },
    sun: { i: ICON.sun, t: T('Sunflower', 'دوّار الشمس'), m: T('joy, thank you', 'فرح، وشكراً') },
    daisy: { i: ICON.daisy, t: T('Daisy', 'أقحوان'), m: T('friendship', 'صداقة') },
    lily: { i: ICON.lily, t: T('White lily', 'زنبق أبيض'), m: T('remembering', 'ذكرى') },
    lav: { i: ICON.lav, t: T('Lavender', 'لافندر'), m: T('calm', 'هدوء') }
  };
  const KEYS = Object.keys(FL);
  /* who comes in, what they say, which feelings it needs, and what would be wrong */
  const ASK = [
    { id: 'rex', say: T('It\'s Lily\'s tenth birthday. She likes everything yellow. And me, sometimes.', 'عيد ميلاد ليلي العاشر. تحب كل شي أصفر. وتحبني أنا، أحياناً.'), need: ['sun', 'daisy'], bad: ['lily'] },
    { id: 'kai', say: T('I forgot my mum\'s birthday. Again. I need flowers that say sorry AND that I love her. Mostly sorry.', 'نسيت عيد ميلاد أمي. مرة ثانية. أبي ورد يقول آسف وإني أحبها. أغلبه آسف.'), need: ['tulip', 'rose'], bad: ['lily'] },
    { id: 'gregor', say: T('For a grave at the back that nobody visits. Something quiet.', 'لقبر في الخلف محد يزوره. شي هادي.'), need: ['lily', 'lav'], bad: ['sun'] },
    { id: 'ingrid', say: T('For Henrik. It would have been our anniversary today. Fifty-one years.', 'لهنريك. كان بيكون عيد زواجنا اليوم. واحد وخمسين سنة.'), need: ['rose', 'lily'], bad: ['tulip'] },
    { id: 'irene', say: T('For my waiting room. People come in frightened. Something that calms them down.', 'لغرفة الانتظار. الناس يدخلون خايفين. شي يهديهم.'), need: ['lav', 'daisy'], bad: ['lily'] },
    { id: 'olivia', say: T('To say thank you to everyone who signed the petition. All four hundred and one of them.', 'عشان أقول شكراً لكل اللي وقعوا العريضة. الأربع مية وواحد كلهم.'), need: ['sun', 'daisy'], bad: ['lily'] },
    { id: 'marco', say: T('For me. For my nerves. Thursday. Don\'t ask.', 'لي أنا. لأعصابي. الخميس. لا {تسأل|تسألين}.'), need: ['lav', 'sun'], bad: ['lily'] }
  ];
  const IMG = id => { try { const c = PEOPLE.IMG.chars[id]; return c && (c.neutral || c.smile); } catch (e) { return null; } };

  GAME.MINI.bouquet = function (panel, done) {
    panel.innerHTML = '';
    const f = card('cp-flor', T('Stella\'s Flowers', 'ورد ستيلا'), T('Read what they want. Pick three flowers. Tie it.', '{اقرا|اقري} وش يبون. {اختر|اختاري} ثلاث وردات. {اربطها|اربطيها}.'));
    const sh = shell(f, done, 1);
    f.area.innerHTML = `<div class="fl-cust"><div class="fl-face"></div><div class="fl-say"><b></b><p></p></div></div>
      <div class="fl-mid"><div class="fl-board"></div><div class="fl-bq"><div class="fl-stems"></div><div class="fl-wrap"></div></div><div class="fl-act"><button type="button" class="fl-tie"></button><button type="button" class="fl-undo"></button></div></div>
      <div class="fl-buckets"></div>`;
    const q = f.q;
    q('.fl-tie').textContent = tx(T('Tie it 🎀', '{اربطها|اربطيها} 🎀')); q('.fl-undo').textContent = tx(T('Start again', 'من جديد'));
    /* Stella's chalkboard: what each flower means */
    q('.fl-board').innerHTML = KEYS.map(k => `<div><i>${FL[k].i}</i> ${tx(FL[k].m)}</div>`).join('');
    KEYS.forEach(k => { const b = el('button', 'fl-bk'); b.type = 'button'; b.dataset.k = k; b.innerHTML = `<i>${FL[k].i}</i><span>${tx(FL[k].t)}</span>`; q('.fl-buckets').appendChild(b); });
    let line = ASK.filter(a => IMG(a.id)).sort(() => Math.random() - 0.5).slice(0, 3); if (line.length < 3) line = ASK.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    let n = 0, stems = [], good = 0, busy = false;
    const show = () => {
      const a = line[n]; stems = []; draw(); busy = false;
      q('.fl-face').innerHTML = IMG(a.id) ? `<img src="${IMG(a.id)}" alt="">` : '<b class="fl-noface">🙂</b>'; q('.fl-say b').textContent = tx(GAME.CHAR[a.id].short || GAME.CHAR[a.id].name); q('.fl-say p').textContent = '“' + tx(a.say) + '”';
      q('.fl-cust').classList.remove('in'); void q('.fl-cust').offsetWidth; q('.fl-cust').classList.add('in');
      f.q('.g-count').textContent = tx(T(`Customer ${n + 1} / ${line.length}`, `الزبون ${n + 1} / ${line.length}`)); f.box.dataset.need = a.need.join(','); f.box.dataset.bad = a.bad.join(',');
    };
    const draw = () => { const s = q('.fl-stems'); s.innerHTML = ''; stems.forEach((k, i) => { const e = el('span', 'fl-stem'); e.innerHTML = FL[k].i; e.style.setProperty('--r', ((i - (stems.length - 1) / 2) * 16) + 'deg'); s.appendChild(e); }); q('.fl-tie').disabled = stems.length < 3; };
    q('.fl-buckets').addEventListener('click', ev => { const b = ev.target.closest('.fl-bk'); if (!b || busy) return; ev.stopPropagation(); if (stems.length >= 3) { blip(180, 0.1, 0.1, 'sawtooth'); return; } stems.push(b.dataset.k); draw(); blip(600 + stems.length * 120, 0.06, 0.08, 'triangle'); });
    q('.fl-undo').addEventListener('click', ev => { ev.stopPropagation(); if (busy) return; stems = []; draw(); });
    q('.fl-tie').addEventListener('click', ev => {
      ev.stopPropagation(); if (busy || stems.length < 3) return; busy = true;
      const a = line[n], hit = a.need.filter(k => stems.includes(k)).length, wrong = stems.some(k => a.bad.includes(k));
      const score = wrong ? 0 : hit; if (score === 2) good++;
      q('.fl-bq').classList.add('tied');
      const say = score === 2 ? pickOne([T('"Oh. Oh, that\'s exactly it."', '«آه. هذا بالضبط اللي أبيه.»'), T('"How did you know?"', '«كيف عرفت؟»')])
        : score === 1 ? T('"It\'s lovely. It\'s... nearly it."', '«حلو. هو... تقريباً.»') : wrong ? T('"...A lily? Are you trying to tell me something?"', '«...زنبق؟ {تبي تلمح|تبين تلمحين} لشي؟»') : T('"Hm. Not quite what I meant."', '«همم. مو بالضبط اللي قصدته.»');
      q('.fl-say p').textContent = tx(say); q('.fl-cust').classList.toggle('glad', score === 2);
      blip(score === 2 ? 784 : 220, 0.15, 0.12, score === 2 ? 'triangle' : 'sawtooth');
      setTimeout(() => { q('.fl-bq').classList.remove('tied'); q('.fl-cust').classList.remove('glad'); n++; if (n >= line.length) sh.finish({ good, total: line.length }); else show(); }, 2200);
    });
    show();
  };

  /* ================= in the story ================= */
  GAME.TOPICS.stella = GAME.TOPICS.stella || [];
  GAME.TOPICS.stella.unshift({ id: 'flShift', cls: 'main', label: T('Help in the shop (paid)', '{تساعد|تساعدين} في المحل (بفلوس)'), if: s => s.loc === 'florist' && s.slot <= 2 && !doneToday('flShift'), run: s => {
    onceToday('flShift'); s.f.flShifts = (s.f.flShifts || 0) + 1;
    return [SL('smile', s.f.flShifts === 1 ? 'An assistant! The roses will be furious. Rule one: every flower means something. It\'s all on the board. Rule two: never, ever put a lily in a happy bouquet.' : 'Board\'s there, buckets are full, the roses are behaving. Mostly.',
      s.f.flShifts === 1 ? 'مساعد! الجوري بيعصب. القاعدة الأولى: كل وردة لها معنى. كله مكتوب على اللوحة. القاعدة الثانية: أبداً، أبداً لا {تحط|تحطين} زنبق في باقة فرح.' : 'اللوحة هناك، والسطول مليانة، والجوري مؤدب. أغلب الوقت.'),
      { mini: 'bouquet', then: (r, st) => { const g = r ? r.good : 0, pay = r ? 4 + g * 2 : 3; st.money += pay; advance(1);
        return [N1(`Stella pays you $${pay} in coins from a jam jar, and a sprig of basil "for the soul".`, `ستيلا تعطيك ${pay}$ فكة من مرطبان مربى، وغصن ريحان «للروح».`),
          g === (r && r.total) ? SL('smile', 'Every single one! You speak flower. Most people only speak "roses, I suppose".', 'كلهم! {أنت تتكلم|أنتِ تتكلمين} لغة الورد. أغلب الناس ما يعرفون غير «جوري، يمكن».') : SL('neutral', 'Not bad. Flowers forgive. People mostly do too.', 'مو سيء. الورد يسامح. والناس غالباً بعد.')]; } }];
  } });
  /* her story: the Friday bouquet */
  GAME.TOPICS.stella.push({ id: 'flMum', once: true, label: T('Ask about the bouquet she never sells', '{تسألها|تسألينها} عن الباقة اللي ما تبيعها'), if: s => (s.f.flShifts || 0) >= 2 && s.loc === 'florist', run: s => [
    N1('Behind the counter there is always one bouquet in a jug of water, never priced. Freesias, sweet peas, and one sprig of rosemary. A new one every Friday.', 'ورا الكاونتر دايم فيه باقة وحدة في إبريق موية، بدون سعر. فريزيا، وبازلاء عطرية، وغصن إكليل جبل. وحدة جديدة كل جمعة.'),
    SL('neutral', 'That\'s Mum\'s. This was her shop. She\'s in a home in the city now. She doesn\'t know who I am any more.', 'هذي حقت أمي. هذا كان محلها. الحين هي في دار رعاية في المدينة. ما عادت تعرف مين أنا.'),
    SL('sad', 'But she knows the flowers. Every one. I send them every Friday and the nurse holds the phone up, and she names them all, perfectly. Freesia. Sweet pea. Rosemary, for remembrance.', 'بس تعرف الورد. كل وحدة. أرسله كل جمعة والممرضة ترفع الجوال، وتسميهم كلهم، بدون غلطة. فريزيا. بازلاء عطرية. إكليل الجبل، للذكرى.'),
    SL('sad', 'Then she asks me what my name is. And I tell her. Every Friday.', 'وبعدين تسألني وش اسمي. وأقول لها. كل جمعة.'),
    { menu: [
      { t: T('"Can I be there on Friday, when she calls?"', '«أقدر أكون معك الجمعة، لما تتصل؟»'), cls: 'main', then: [st => { st.f.flCall = true; return null; }, SL('smile', '...Yes. Yes, I\'d like that. Three o\'clock. Bring nothing. Well. Bring a face.', '...إيه. إيه، أبي هذا. الساعة ثلاث. لا {تجيب|تجيبين} شي. يعني. {جيب|جيبي} وجهك.')] },
      { t: T('"She knows you. Somewhere in the flowers, she does."', '«تعرفك. في مكان داخل الورد، تعرفك.»'), then: [SL('sad', 'That\'s the nicest thing anyone has said to me in a year. I don\'t believe it. Say it again sometime.', 'هذي أحلى جملة أحد قالها لي من سنة. وما أصدقها. {قلها|قوليها} مرة ثانية بعدين.')] }
    ] }
  ] });
  GAME.SCRIPTS.stellaCall = s => { s.f.flCallDone = true; return [
    { show: [{ id: 'stella', e: 'neutral' }] },
    N1('Three o\'clock. Stella props her phone against the till. The screen fills with a small room, a window, and a woman with Stella\'s eyes, very old, very neat, looking at the camera as if it might bite.', 'الساعة ثلاث. ستيلا تسند جوالها على الكاشير. الشاشة تتعبى بغرفة صغيرة، وشباك، ومرة عيونها عيون ستيلا، كبيرة بالعمر مرة، ومرتبة مرة، تطالع الكاميرا كأنها بتعضها.'),
    SL('smile', 'Hello, Mum. Look what came today.', 'هلا يمه. شوفي وش وصل اليوم.'),
    N1('The nurse holds the bouquet up. The old woman\'s face changes completely. "Freesia," she says. "Sweet pea. Oh, and rosemary. Rosemary\'s for remembrance, you know."', 'الممرضة ترفع الباقة. ووجه العجوز يتغير كله. «فريزيا،» تقول. «بازلاء عطرية. وإكليل الجبل. إكليل الجبل للذكرى، تدرين.»'),
    N1('Then she looks past Stella, at you, and frowns. "Who\'s that, at my till?"', 'وبعدين تطالع ورا ستيلا، تطالعك {أنت|أنتِ}، وتعبس. «مين {هذا اللي|هذي اللي} عند كاشيري؟»'),
    { menu: [
      { t: T('"I help in the shop. Stella taught me what every flower means."', '«أساعد في المحل. ستيلا علمتني معنى كل وردة.»'), then: [N1('"Stella," the old woman says slowly, and something moves behind her eyes, like a fish under ice. "Stella always put lavender in the wrong bucket."', '«ستيلا،» تقول العجوز ببطء، وشي يتحرك ورا عيونها، مثل سمكة تحت الثلج. «ستيلا دايم تحط اللافندر في السطل الغلط.»'),
        SL('shock', '...I did. I DID. Mum. That was me.', '...صح. صح! يمه. هذي أنا.'),
        N1('It lasts maybe ten seconds. Then she asks the nurse what time lunch is. Stella doesn\'t mind. Stella is laughing and crying into a tea towel, and she doesn\'t mind at all.', 'تدوم يمكن عشر ثواني. وبعدين تسأل الممرضة متى الغدا. وستيلا ما يهمها. ستيلا تضحك وتبكي في فوطة، وما يهمها أبد.'), st => { st.f.flRemember = true; addMood(2); return null; }] },
      { t: T('Just wave, and let them talk', '{أشّر|أشّري} بيدك بس، {وخلهم|وخليهم} يتكلمون'), then: [N1('You wave. The old woman waves back, politely, the way you wave at a train. She tells Stella about the rosemary again. Stella listens as if it were the first time.', '{تأشّر|تأشّرين}. والعجوز تأشّر لك، بأدب، مثل ما تأشّر لقطار. وتحكي لستيلا عن إكليل الجبل مرة ثانية. وستيلا تسمع كأنها أول مرة.'), st => { addMood(1); return null; }] }
    ] },
    { show: null }
  ]; };
  GAME.EVENTS.push({ id: 'stellaCall', once: true, when: s => s.f.flCall && !s.f.flCallDone && weekday(s.day) === 5 && s.slot === 2 && s.loc === 'florist' && !RUN, run: s => GAME.SCRIPTS.stellaCall(s) });
  const say = (who, line) => { const c = GAME.CHAR[who]; if (c && Array.isArray(c.chat)) c.chat.unshift(line); };
  say('stella', { if: s => !!s.f.flRemember, e: 'smile', t: T('Lavender in the wrong bucket. Ten seconds. I\'ve been living on those ten seconds all week.', 'لافندر في السطل الغلط. عشر ثواني. عايشة على هالعشر ثواني الأسبوع كله.') });
  say('stella', { if: s => !!s.f.flCall && !s.f.flCallDone, e: 'neutral', t: T('Friday. Three o\'clock. I\'ve changed the sweet peas four times.', 'الجمعة. الساعة ثلاث. غيرت البازلاء العطرية أربع مرات.') });
})();
