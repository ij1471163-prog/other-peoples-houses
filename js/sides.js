/* =====================================================================
   The people at the edges get the rest of their story. No games here:
   each one is told a different way.
     · Frank (Leo's chapter): his phone, face down on the bench. The
       messages he never answers, and the one he finally types.
     · Nora (Margaret's chapter): what you overhear from behind the
       café's menu board, the day she has "several words" with somebody.
     · Kell (Victor's chapter): the letter to his sister Rosa he never
       posts. You could post it. A postcard comes back.
     · Ana (Victor's chapter): her mother's new fabric needs a name.
     · Bella (Victor's chapter): who Room 12 is.
     · The keeper (Evelyn's chapter): a second cup of tea at three.
   Only their own flags. Nothing reads or changes an ending.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const C = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const blip = (f, d) => { if (!on()) return; try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.12, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + d); setTimeout(() => c.close(), d * 1000 + 200); } catch (e) { /* quiet */ } };

  /* ---------- a phone screen: messages arrive one by one ---------- */
  GAME.MINI.texts = function (panel, done, st) {
    panel.innerHTML = '';
    const box = el('div', 'cp sd-phone'); box.innerHTML = '<div class="sd-ph"><div class="sd-top"><b></b><small></small></div><div class="sd-msgs"></div><div class="sd-type"><span></span><i>➤</i></div></div>';
    box.querySelector('.sd-top b').textContent = tx(st.who); box.querySelector('.sd-top small').textContent = tx(st.sub || T('mobile', 'جوال'));
    $('stage').appendChild(box);
    const alt = el('button', 'opt main cp-alt', tx(T('Put it down', '{حطه|حطيه}'))); alt.type = 'button'; panel.appendChild(alt);
    const msgs = box.querySelector('.sd-msgs'), typing = box.querySelector('.sd-type span');
    let over = false, i = 0;
    const fin = ev => { if (ev) ev.stopPropagation(); if (over) return; over = true; alt.remove(); box.classList.add('out'); setTimeout(() => box.remove(), 300); done(1); };
    alt.onclick = fin;
    const add = m => { const b = el('div', 'sd-b ' + (m.me ? 'me' : 'them')); b.textContent = tx(m.t); if (m.time) { const s = el('small', '', tx(m.time)); b.appendChild(s); } msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight; blip(m.me ? 1320 : 880, 0.08); };
    const typeOut = (m, cb) => {   /* you see the words being typed, deleted, typed again */
      const tries = m.drafts || [], all = tries.concat([tx(m.t)]); let k = 0;
      const one = (txt, keep, next) => { let j = 0; const tk = () => { if (over) return; typing.textContent = txt.slice(0, ++j); if (j < txt.length) setTimeout(tk, 55); else setTimeout(() => { if (keep) { next(); return; } const del = () => { if (over) return; typing.textContent = typing.textContent.slice(0, -1); if (typing.textContent.length) setTimeout(del, 25); else setTimeout(next, 400); }; del(); }, 700); }; tk(); };
      const go = () => { const last = k === all.length - 1; one(k < tries.length ? tx(all[k]) : all[k], last, () => { if (last) { typing.textContent = ''; add(m); cb(); } else { k++; go(); } }); };
      go();
    };
    const step = () => {
      if (over) return;
      if (i >= st.msgs.length) { box.classList.add('end'); setTimeout(() => box.addEventListener('click', fin), 300); return; }
      const m = st.msgs[i++];
      if (m.me && m.type) typeOut(m, () => setTimeout(step, 900)); else { add(m); setTimeout(step, m.wait || 1200); }
    };
    setTimeout(step, 500);
  };

  /* ---------- a sheet of paper: a letter, a postcard ---------- */
  GAME.MINI.paper = function (panel, done, st) {
    panel.innerHTML = '';
    const box = el('div', 'cp sd-paper-wrap'); box.innerHTML = `<div class="sd-paper ${st.kind || 'letter'}"><p></p><em></em></div>`;
    box.querySelector('p').textContent = tx(st.body); if (st.sign) box.querySelector('em').textContent = tx(st.sign); if (st.stamp) box.querySelector('.sd-paper').dataset.stamp = st.stamp;
    $('stage').appendChild(box);
    const alt = el('button', 'opt main cp-alt', tx(T('Fold it', '{اطوها|اطويها}'))); alt.type = 'button'; panel.appendChild(alt);
    let over = false; const fin = ev => { if (ev) ev.stopPropagation(); if (over) return; over = true; alt.remove(); box.classList.add('out'); setTimeout(() => box.remove(), 300); done(1); };
    setTimeout(() => box.addEventListener('click', fin), 500); alt.onclick = fin;
  };

  const push = (loc, spot) => { if (GAME.LOC[loc]) GAME.LOC[loc].spots.push(spot); };
  const topic = (id, t) => { GAME.TOPICS[id] = GAME.TOPICS[id] || []; GAME.TOPICS[id].push(t); };
  const say = (who, line) => { const c = GAME.CHAR[who]; if (c) { c.chat = c.chat || []; c.chat.unshift(line); } };

  /* ================= Frank: the phone face down ================= */
  const ch2 = s => s.ch === 2 && !s.f.leoEnded;
  push('garage', { x: 70, y: 58, label: T('Frank\'s phone, face down on the bench', 'جوال فرانك، مقلوب على الطاولة'), if: s => ch2(s) && s.f.metFrank && !s.f.sdFrank && s.slot < NIGHT, cls: 'main', run: s => { s.f.sdFrank = 1; return [
    { show: [{ id: 'frank', e: 'neutral' }] },
    N1('It buzzes against the wood. Frank looks at it, and doesn\'t turn it over. It buzzes again.', 'يهتز على الخشب. فرانك يطالعه، وما يقلبه. يهتز مرة ثانية.'),
    C('frank', 'neutral', 'Go on, then. You\'re looking anyway.', 'يلا، أجل. {أنت تطالع|أنتِ تطالعين} على كل حال.'),
    { mini: 'texts', who: T('Carol', 'كارول'), sub: T('Leo\'s mum', 'أم ليو'), msgs: [
      { t: T('Have you heard from him?', 'وصلك شي منه؟'), time: T('Mon', 'الإثنين') },
      { t: T('Frank.', 'فرانك.'), time: T('Tue', 'الثلاثاء') },
      { t: T('I know you\'re reading these.', 'أدري إنك تقراها.'), time: T('Wed', 'الأربعاء') },
      { t: T('Just tell me if he\'s eating. That\'s all I want. Is he eating.', 'بس قل لي إذا ياكل. هذا كل اللي أبيه. ياكل؟'), time: T('today', 'اليوم') }
    ] },
    C('frank', 'sad', 'Thirty-one years married. I don\'t know what to write. Everything I write sounds like the garage.', 'واحد وثلاثين سنة زواج. وما أدري وش أكتب. كل شي أكتبه يطلع كأنه الكراج.'),
    { menu: [
      { t: T('"Tell her the truth. He\'s eating. He\'s drawing."', '«قل لها الحقيقة. ياكل. ويرسم.»'), cls: 'main', then: [
        st => { st.f.sdFrank = 2; return null; },
        N1('He picks the phone up as if it might go off. His thumbs are too big for it.', 'يرفع الجوال كأنه بينفجر. أصابعه أكبر منه.'),
        { mini: 'texts', who: T('Carol', 'كارول'), sub: T('Leo\'s mum', 'أم ليو'), msgs: [
          { t: T('Just tell me if he\'s eating. That\'s all I want. Is he eating.', 'بس قل لي إذا ياكل. هذا كل اللي أبيه. ياكل؟'), time: T('today', 'اليوم') },
          { me: true, type: true, drafts: [T('He is fine.', 'هو بخير.'), T('The boy made his choice', 'الولد اختار')], t: T('He\'s eating. Someone\'s looking after him. He\'s drawing again. I was wrong about the drawing.', 'ياكل. فيه أحد يهتم فيه. ورجع يرسم. كنت غلطان بموضوع الرسم.') },
          { t: T('...', '...'), wait: 2200 },
          { t: T('Come home for dinner, you stupid man.', 'تعال البيت تتعشى، يا الغبي.') }
        ] },
        N1('Frank reads it four times. Then he puts the phone in his top pocket, face up.', 'فرانك يقراها أربع مرات. وبعدين يحط الجوال في جيبه الفوقاني، ووجهه لفوق.')] },
      { t: T('"Not my business."', '«مو شغلي.»'), then: [C('frank', 'neutral', 'No. It\'s mine. That\'s the trouble.', 'لا. هو شغلي أنا. وهذي المشكلة.')] }
    ] },
    { show: null }
  ]; } });
  say('frank', { if: s => s.f.sdFrank === 2, e: 'smile', t: T('Carol\'s doing pasta tonight. With lemon. First time in a while I\'ve been home before nine.', 'كارول تسوي مكرونة الليلة. بالليمون. أول مرة من زمان أرجع البيت قبل تسع.') });

  /* ================= Nora: several words ================= */
  const inM = s => s.host === 'margaret';
  GAME.EVENTS.push({ id: 'sdNora', once: true, when: s => inM(s) && s.f.noraKnows && s.loc === 'cafe' && s.slot === 2 && !RUN, run: [
    N1('You\'re reading the menu board when the café door bangs open behind you. You know that voice. Nora. On her phone, and not quietly.', '{تقرا|تقرين} لوحة القائمة لما باب المقهى ينفتح بقوة وراك. {تعرف|تعرفين} هالصوت. نورا. على جوالها، ومو بهدوء.'),
    { menu: [
      { t: T('Stay behind the menu board and listen', '{خلك|خليك} ورا اللوحة {واسمع|واسمعي}'), cls: 'main', then: [
        C('nora', 'angry', '...No, Irene, I am not "calming down". Gold G. G for Grand. My sister thinks her dead son visits her at night because a man in a white coat sold her dreams in a bottle.', '...لا يا إيرين، ما راح «أهدى». حرف «G» الذهبي. G يعني غراند. أختي تحسب ولدها الميت يزورها بالليل لأن رجال لابس أبيض باع لها أحلام في علبة.'),
        C('nora', 'angry', 'Yes. Yes, I wrote it all down. Dates, the bottles, the "pharmacist" with the nice teeth. I\'m taking it to that hotel right now and I am going to have several words.', 'إيه. إيه، كتبت كل شي. التواريخ، والعلب، و«الصيدلي» أبو الأسنان الحلوة. وأنا رايحة فيها للفندق الحين، وبقول كم كلمة.'),
        N1('A pause. Whatever Irene says, it stops her. When she speaks again her voice is very small.', 'سكتة. اللي قالته إيرين، وقّفها. ولما تتكلم مرة ثانية صوتها صغير مرة.'),
        C('nora', 'sad', '...You\'re right. If I go in there shouting, he\'ll smile and I\'ll be the mad sister. Mags needs me at the house, not at the hotel. ...Thank you. Sorry. Thank you.', '...معك حق. لو دخلت أصارخ، بيبتسم وبصير أنا الأخت المجنونة. ماغز تحتاجني في البيت، مو في الفندق. ...شكراً. آسفة. شكراً.'),
        N1('She hangs up. Then she sees you, half behind the menu board, holding a chalk duster you picked up to look busy.', 'تسكّر. وبعدين تشوفك، نصك ورا اللوحة، {ماسك|ماسكة} ممسحة طباشير {شلتها|شلتيها} عشان تبين مشغول.'),
        C('nora', 'neutral', 'How much did you hear. ...All of it. Good. Then you know. Come for soup on Sunday. She eats when there\'s three of us.', 'كم {سمعت|سمعتي}. ...كله. زين. أجل {تعرف|تعرفين}. {تعال|تعالي} للشوربة يوم الأحد. هي تاكل لما نكون ثلاثة.'),
        st => { st.f.sdNora = true; return null; }] },
      { t: T('Turn round and say hello', '{التفت|التفتي} {وسلّم|وسلّمي}'), then: [C('nora', 'shock', 'Oh! You. Hello. I\'m... on the phone to the doctor. About a... knee.', 'آه! {أنت|أنتِ}. هلا. أنا... أكلم الدكتورة. عن... ركبة.'), N1('She leaves without ordering. You never find out what she was going to say.', 'تطلع بدون ما تطلب شي. وما {تعرف|تعرفين} أبد وش كانت بتقول.')] }
    ] }
  ] });
  say('nora', { if: s => !!s.f.sdNora, e: 'neutral', t: T('I kept the list. Every date, every bottle. One day somebody will want it, and I\'ll have it.', 'خليت القائمة عندي. كل تاريخ، وكل علبة. يوم من الأيام أحد بيبيها، وبتكون عندي.') });

  /* ================= Kell: the letter to Rosa ================= */
  const inV = s => s.host === 'victor';
  Object.assign(GAME.ITEMS, { kletter: { name: T('Kell\'s letter', 'رسالة كيل'), desc: T('To R. Kell. Sealed, stamped, never posted.', 'لـ ر. كيل. مختومة، وعليها طابع، وعمرها ما انرسلت.') } });
  push('hotel_staff', { x: 80, y: 46, label: T('An envelope inside Kell\'s paperback', 'ظرف داخل كتاب كيل'), if: s => inV(s) && (s.f.vKellPhoto || s.f.vSawRosa) && !s.f.sdKell, run: s => { s.f.sdKell = 1; return [
    N1('Tucked inside the Rilke, as a bookmark: an envelope. Stamped. Addressed in careful capitals to R. KELL, a flat above a laundrette in the city. The stamp is from two years ago. The flap has been opened and resealed, many times.', 'داخل كتاب ريلكه، كأنها علامة: ظرف. عليه طابع. والعنوان بحروف كبيرة مرتبة: ر. كيل، شقة فوق مغسلة في المدينة. الطابع من قبل سنتين. والظرف انفتح وانسكر، مرات كثيرة.'),
    { menu: [
      { t: T('Read it', '{اقراه|اقريه}'), then: [{ mini: 'paper', kind: 'letter', body: T('Rosa,\nI drive him every day past number 12. They painted the door grey. I wanted you to know I still look.\nI should have said no to him. I said "yes, sir" because it was easier than saying anything else. I am big and I am not brave.\nThere is a poem: "Perhaps all the dragons in our lives are princesses who are only waiting to see us act, just once, with beauty and courage." I have been waiting to act for two years.\nYour brother,\nK.', 'روزا،\nأوصله كل يوم من جنب رقم ١٢. صبغوا الباب رصاصي. حبيت تعرفين إني لسا أطالع.\nكان لازم أقول له لا. قلت «حاضر يا سيدي» لأنها أسهل من أي كلمة ثانية. أنا كبير، بس مو شجاع.\nفيه قصيدة: «يمكن كل التنانين في حياتنا أميرات ينتظرون يشوفوننا نتصرف، ولو مرة، بجمال وشجاعة.» وأنا أنتظر أتصرف من سنتين.\nأخوك،\nك.') }] },
      { t: T('Leave it where it is', '{خله|خليه} مكانه'), then: [N1('You put it back between the same two pages.', '{ترجعه|ترجعينه} بين نفس الصفحتين.')] }
    ] },
    { if: s2 => true, then: [{ menu: [
      { t: T('Take it, and post it at Sami\'s', '{خذه|خذيه}، {وارسله|وارسليه} من عند سامي'), cls: 'risk', then: [st => { st.f.sdKell = 2; give('kletter'); return null; }, N1('It weighs nothing. It feels like a brick.', 'ما يوزن شي. وكأنه طوبة.')] },
      { t: T('Put it back', '{رجعه|رجعيه}'), then: [N1('Some letters have to be posted by the person who wrote them.', 'فيه رسايل لازم اللي كتبها هو اللي يرسلها.')] }
    ] }] }
  ]; } });
  topic('sami', { id: 'sdPost', label: T('Post Kell\'s letter', '{ارسل|ارسلي} رسالة كيل'), cls: 'main', if: s => has('kletter'), run: s => { take('kletter'); s.f.sdKellPosted = s.day; return [
    C('sami', 'neutral', 'Two-year-old stamp. Still good. Stamps don\'t give up. It\'ll be in the city tomorrow.', 'طابع عمره سنتين. لسا يمشي. الطوابع ما تستسلم. بكرة بيكون في المدينة.')]; } });
  GAME.EVENTS.push({ id: 'sdRosa', once: true, when: s => s.f.sdKellPosted && s.day >= s.f.sdKellPosted + 2 && s.loc === 'hotel_staff' && !RUN, run: [
    { show: [{ id: 'kell', e: 'shock' }] },
    N1('Kell is standing very still in the laundry, holding a postcard as if it were made of glass. A picture of tomatoes on a windowsill.', 'كيل واقف بدون حركة في المغسلة، ماسك كرت كأنه من زجاج. صورة طماطم على شباك.'),
    { mini: 'paper', kind: 'postcard', body: T('You stupid lump. Two years! I thought you were ashamed of me for losing the house.\nCome on Sunday. Bring nothing. Bring a poem if you must.\nThe tomatoes grow just fine up here.\nR.', 'يا الثقيل الغبي. سنتين! كنت أحسبك مستحي مني لأني خسرت البيت.\nتعال يوم الأحد. لا تجيب شي. وإذا لازم، جيب قصيدة.\nالطماطم تطلع زينة هنا فوق.\nر.') },
    C('kell', 'shock', 'I didn\'t post it. I never post it.', 'أنا ما أرسلتها. عمري ما أرسلها.'),
    N1('He looks at you. You look at the ceiling, the way he did once at the office door.', 'يطالعك. {وتطالع|وتطالعين} السقف، مثل ما سوا هو مرة عند باب المكتب.'),
    C('kell', 'smile', '...Thank you. Don\'t do it again. Thank you.', '...شكراً. لا {تعيدها|تعيدينها}. شكراً.'),
    st => { st.f.sdRosa = true; addMood(2); return null; }, { show: null }
  ] });
  say('kell', { if: s => !!s.f.sdRosa, e: 'smile', t: T('Sunday. Rosa made me eat four tomatoes in a row and read her the dragon poem twice. I am not complaining.', 'الأحد. روزا خلتني آكل أربع طماطم ورا بعض وأقرا لها قصيدة التنين مرتين. وما أشتكي.') });

  /* ================= Ana: the name of a colour ================= */
  topic('ana', { id: 'sdColour', once: true, label: T('"What did your mother send this week?"', '«وش أرسلت لك أمك هالأسبوع؟»'), if: s => inV(s) && (s.trust.ana || 0) >= 2, run: [
    C('ana', 'smile', 'Look! A new cloth. She dyed it herself. Every colour has a name in her shop, and she says this one I must name. I cannot. I have been looking at it for three days.', '{شوف|شوفي}! قماش جديد. صبغته بنفسها. كل لون له اسم في محلها، وتقول هذا لازم أنا أسميه. ما أقدر. لي ثلاث أيام أطالعه.'),
    N1('On her phone: a length of cloth on a wooden counter, the green of the sea under the pier on a still morning, with a little gold in it where the light comes through.', 'على جوالها: قطعة قماش على كاونتر خشب، لونها أخضر مثل البحر تحت الرصيف في صبح هادي، وفيها شوي ذهبي مكان ما يدخل الضو.'),
    { menu: [
      { t: T('"Saltmere morning."', '«صبح سولتمير.»'), then: [st => { st.f.sdColour = 'saltmere'; return null; }] },
      { t: T('"Pistachio\'s brave little sister."', '«أخت الفستقي الصغيرة الشجاعة.»'), then: [st => { st.f.sdColour = 'sister'; return null; }] },
      { t: T('"Ana."', '«آنا.»'), cls: 'main', then: [st => { st.f.sdColour = 'ana'; return null; }] }
    ] },
    s => s.f.sdColour === 'ana' ? [C('ana', 'shock', '...Ana. She will laugh. She will cry, and then laugh.', '...آنا. بتضحك. بتبكي، وبعدين بتضحك.'), N1('She types it with both thumbs, slowly, and sends it before she can change her mind. Then she has to go and fold towels very fast for a while.', 'تكتبها بإبهامينها، على مهل، وترسلها قبل لا تغير رأيها. وبعدين لازم تروح تطوي فوط بسرعة مرة شوي.')]
      : [C('ana', 'smile', s.f.sdColour === 'sister' ? 'Ha! She will like that. She likes when things are brave.' : 'She has never seen the sea here. Now she will have a cloth of it.', s.f.sdColour === 'sister' ? 'ها! بيعجبها. تحب لما الأشياء تكون شجاعة.' : 'عمرها ما شافت البحر هنا. الحين بيكون عندها قماش منه.')],
    s => { addMood(1); return null; }
  ] });
  say('ana', { if: s => s.f.sdColour === 'ana', e: 'smile', t: T('My mother sold the whole roll of "Ana" in one day. She says people want to wear brave colours now. She says it is my fault.', 'أمي باعت لفة «آنا» كلها في يوم واحد. تقول الناس صاروا يبون يلبسون ألوان شجاعة. وتقول إنها غلطتي.') });

  /* ================= Bella: Room 12 ================= */
  topic('bella', { id: 'sdRoom12', once: true, label: T('"Who is Room 12?"', '«مين اللي في غرفة ١٢؟»'), if: s => (s.f.bellaChats || 0) >= 2, run: [
    C('bella', 'neutral', 'Room 12. Mr H. Lind. Checked in on the seventh of March, the day Victor bought the place. Pays cash, monthly, never complains, tips the maids "for your mother".', 'غرفة ١٢. السيد هـ. ليند. سجّل دخول سبعة مارس، اليوم اللي اشترى فيه فيكتور المكان. يدفع كاش، كل شهر، عمره ما اشتكى، ويعطي العاملات بقشيش «لأمك».'),
    C('bella', 'smile', 'And I\'ll tell you a secret, because you have an honest face, which in this lobby is a medical condition.', 'وبقول لك سر، لأن وجهك صادق، وهذا في هاللوبي يعتبر مرض.'),
    { mini: 'paper', kind: 'letter', body: T('THE SALTMERE GRAND — REGISTER, 1979\nOwner and manager: Harold Lind\nPorter: Harold Lind\nWaiter, on Sundays: Harold Lind', 'سولتمير غراند — سجل النزلاء، ١٩٧٩\nالمالك والمدير: هارولد ليند\nالشيّال: هارولد ليند\nالجرسون، أيام الأحد: هارولد ليند') },
    C('bella', 'neutral', 'He built this hotel. Lost it to the bank, then to Victor. Now he pays to sleep in it, and he writes down everything that happens here. Every night. He says somebody should remember what it was for.', 'هو اللي بنى هالفندق. خسره للبنك، وبعدين لفيكتور. والحين يدفع عشان ينام فيه، ويكتب كل شي يصير هنا. كل ليلة. يقول لازم أحد يتذكر ليش انبنى.'),
    { menu: [
      { t: T('"Why do you stay, Bella?"', '«وأنتِ ليش باقية يا بيلا؟»'), then: [C('bella', 'sad', 'Law school. Nights, in the city, by post. Two more years. "My lawyer says" is a joke. The lawyer is me, eventually.', 'كلية حقوق. بالليل، في المدينة، بالمراسلة. باقي سنتين. «محاميني يقول» نكتة. المحامي هو أنا، بعدين.'), C('bella', 'smile', 'And when I am one, Mr Lind has a very, very thick notebook.', 'ولما أصير، السيد ليند عنده دفتر سميك مرة مرة.'), st => { st.f.sdBella = true; return null; }] },
      { t: T('"Does Victor know who he is?"', '«فيكتور يدري مين هو؟»'), then: [C('bella', 'smile', 'Victor doesn\'t look at people who pay cash. He thinks they\'re furniture. Mr Lind is very good furniture.', 'فيكتور ما يطالع اللي يدفعون كاش. يحسبهم أثاث. والسيد ليند أثاث ممتاز.'), st => { st.f.sdBella = true; return null; }] }
    ] }
  ] });
  say('bella', { if: s => !!s.f.sdBella, e: 'smile', t: T('Mr Lind ordered tea for two today. I took it up. We talked about 1979 for an hour. Don\'t tell anyone I sat down.', 'السيد ليند طلب شاي لاثنين اليوم. طلعته له. وتكلمنا عن ١٩٧٩ ساعة كاملة. لا {تقول|تقولين} لأحد إني جلست.') });

  /* ================= the keeper: a second cup ================= */
  const inE = s => s.host === 'evelyn';
  Object.assign(GAME.ITEMS, { cupmarble: { name: T('A marble by the teacup', 'بلية جنب الكوب'), desc: T('Old, chipped, warm, for no reason.', 'قديمة، فيها شطفة، ودافية، بدون سبب.') } });
  push('lh_kitchen', { x: 62, y: 52, label: T('Put out a second cup of tea', '{حط|حطي} كوب شاي ثاني'), if: s => inE(s) && (s.f.sawKeeper || 0) >= 1 && !s.f.keeperPeace && !s.f.sdCup && s.slot === NIGHT, run: s => { s.f.sdCup = s.day; return [
    N1('You make tea at three, because that\'s what this house does. Two cups. You leave the second on the table across from you, black, the way the old men in Saltmere drink it.', '{تسوي|تسوين} شاي الساعة ثلاث، لأن هذا اللي يسويه هالبيت. كوبين. {وتخلي|وتخلين} الثاني على الطاولة قدامك، سادة، مثل ما يشربه شيبان سولتمير.'),
    N1('Nothing happens. The clock ticks. The lamp turns overhead. You go back to bed, and feel silly, and don\'t.', 'ولا شي يصير. الساعة تتكتك. والفانوس يلف فوق. {ترجع|ترجعين} للسرير، {وتحس|وتحسين} إنك سخيف، وما {تحس|تحسين}.')]; } });
  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.push(s => {
    if (!s || RUN || !inE(s) || !s.f.sdCup || s.f.sdCupSeen || s.day <= s.f.sdCup || s.loc !== 'lh_kitchen') return null;
    s.f.sdCupSeen = true; give('cupmarble');
    return [N1('The second cup is where you left it. Empty, and still warm. Beside it, set down carefully on a folded tea towel, a red glass marble.', 'الكوب الثاني مكان ما {خليته|خليتيه}. فاضي، ولسا دافي. وجنبه، محطوطة بعناية على فوطة مطوية، بلية زجاج حمرا.'),
      N1('The tea towel is folded the way a man folds a flag.', 'الفوطة مطوية مثل ما يطوي رجال علم.')];
  });
  topic('evelyn', { id: 'sdMarble', once: true, label: T('Show her the marble left by the teacup', 'ورّيها البلية اللي انحطت جنب الكوب'), if: s => inE(s) && has('cupmarble'), run: [
    C('evelyn', 'shock', 'Another one. Left by the cup? ...Grandad kept a bag of these. In his coat. He\'d roll one across the table to me when I was little and I wasn\'t allowed to ask why.', 'وحدة ثانية. جنب الكوب؟ ...جدي كان عنده كيس منها. في كوته. كان يدحرج لي وحدة على الطاولة وأنا صغيرة وما كان مسموح لي أسأل ليش.'),
    C('evelyn', 'sad', 'They were Toby\'s. Weren\'t they. They were Toby\'s marbles.', 'كانت حقت توبي. صح؟ كانت كرات توبي.'),
    N1('She closes her hand round it. Outside, for once, the lamp seems to turn a little slower.', 'تسكر يدها عليها. وبرا، ولأول مرة، الفانوس كأنه يلف أبطأ شوي.'),
    s => { addMood(1); return null; }
  ] });
})();
