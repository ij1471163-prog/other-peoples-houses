/* =====================================================================
   Other People's Houses — systems (v4)
   Needs hooks, jobs, mini-games, random town events, Sami's attic,
   the bench, chapter flow between houses, the finale and "keep living".
   Loads after all chapter files.
   ===================================================================== */
'use strict';
Object.assign(GAME.UI, {
  tapHint: T('Tap people to talk. Tap the glowing circles to look around or go somewhere. ⌛ passes time, the map takes you anywhere.', 'اضغط على الناس عشان تكلمهم، وعلى الدواير المضيئة عشان تشوف أو تروح مكان. ⌛ يمشّي الوقت، والخريطة توديك أي مكان.'),
  need_hungry: T('Hungry', 'جوعان'), need_grubby: T('Needs a shower', 'يبي ترويش'), need_tired: T('Tired', 'تعبان'),
  nFood: T('Food', 'الأكل'), nClean: T('Clean', 'النظافة'), nEnergy: T('Energy', 'الطاقة'),
  momOk: T('Mom · "Call me whenever. I\'m here."', 'أمي · «اتصل متى ما تبي. أنا هنا.»'),
  saveGame: T('Save game', 'حفظ اللعبة'), loadGame: T('Load game', 'تحميل لعبة'),
  keepLiving: T('Keep living in Saltmere', 'كمّل حياتك في سولتمير'), continueStory: T('Continue the story', 'كمّل القصة'),
  reel: T('Reel in', 'اسحب'), gotIt: T('Got it', 'حفظتها'), fishTitle: T('Tap when the light is in the green.', 'اضغط لما يكون الضو في الأخضر.'), cafeTitle: T('Remember the order.', 'احفظ الطلب.'), cafePick: T('Now serve it, in order.', 'الحين قدّمه، بالترتيب.')
});

/* ---------------- needs hooks on existing actions ---------------- */
(function () {
  const sc = GAME.SCRIPTS;
  const sh = sc.shower; sc.shower = s => { const had = s.f.lastShower === s.day; const r = sh(s); if (!had) wash(); return r; };
  const ea = sc.eat; sc.eat = s => { const had = doneToday('ate'); const r = ea(s); if (!had) feed(45); return r; };
  const bd = sc.bed; sc.bed = s => { const night = s.slot === NIGHT; const r = bd(s); if (!night) rest(25); return r; };
  const ck = GAME.TOPICS.elias.find(t => t.id === 'cook'); if (ck) { const f = ck.run; ck.run = s => { feed(40); return f(s); }; }
  const cl = sc.cookLeo; sc.cookLeo = s => { feed(40); return cl(s); };
  const co = GAME.TOPICS.marco.find(t => t.id === 'coffee'); if (co) { const f = co.run; co.run = s => { rest(15); return f(s); }; }
})();

/* ---------------- mini-games ---------------- */
GAME.MINI = {
  /* fishing: a light sweeps a bar; tap when it's in the green zone. 3 tries. */
  fish(panel, done) {
    const per = 1.3 + Math.random() * 0.5, zs = 12 + Math.random() * 56, zw = 18;
    const box = el('div', 'mini'); box.appendChild(el('p', 'line narr', UI('fishTitle')));
    const tr = el('div', 'track'); const z = el('div', 'zone'); z.style.left = zs + '%'; z.style.width = zw + '%'; tr.appendChild(z);
    const m = el('div', 'mark run'); m.style.setProperty('--per', per + 's'); tr.appendChild(m); box.appendChild(tr);
    const info = el('p', 'sec', '0 / 3'); box.appendChild(info);
    const b = el('button', 'opt main', UI('reel')); b.type = 'button'; box.appendChild(b);
    let t0 = performance.now(), tries = 0, hits = 0;
    b.onclick = () => {
      const t = (performance.now() - t0) / 1000, ph = (t / per) % 2, pos = (ph <= 1 ? ph : 2 - ph) * 100;
      if (pos >= zs - 3 && pos <= zs + zw + 3) { hits++; toast('🐟'); } else toast('…');
      tries++; info.textContent = hits + ' / ' + tries;
      if (tries >= 3) { b.disabled = true; done(hits); }
    };
    panel.appendChild(box);
  },
  /* café shift: memorise an order, then serve it in the same order */
  cafe(panel, done, st) {
    const MENU = [T('Espresso', 'إسبريسو'), T('Tea', 'شاي'), T('Apple pie', 'فطيرة تفاح'), T('Fish soup', 'شوربة سمك'), T('Lemonade', 'ليمونادة'), T('Toast', 'توست'), T('Hot chocolate', 'شوكولاتة حارة'), T('Sandwich', 'سندويشة')];
    const n = (st && st.size) || 3;
    const idx = MENU.map((_, i) => i).sort(() => Math.random() - 0.5);
    const order = idx.slice(0, n);
    const box = el('div', 'mini'); box.appendChild(el('p', 'line narr', UI('cafeTitle')));
    const row = el('div', 'order'); order.forEach(i => row.appendChild(el('span', '', tx(MENU[i])))); box.appendChild(row);
    const go = el('button', 'opt main', UI('gotIt')); go.type = 'button'; box.appendChild(go);
    panel.appendChild(box);
    go.onclick = () => {
      box.innerHTML = ''; box.appendChild(el('p', 'line narr', UI('cafePick')));
      const opts = idx.slice(0, Math.min(6, MENU.length)).sort(() => Math.random() - 0.5);
      let k = 0, right = 0; const prog = el('p', 'sec', '0 / ' + n);
      const g = el('div', 'opts grid');
      opts.forEach(i => { const b = el('button', 'opt', tx(MENU[i])); b.type = 'button'; b.onclick = () => { if (k >= n) return; if (i === order[k]) right++; k++; b.disabled = true; prog.textContent = right + ' / ' + n; if (k >= n) done(right); }; g.appendChild(b); });
      box.appendChild(g); box.appendChild(prog);
    };
  }
};
Object.assign(GAME.ITEMS, { rod: { name: T('Fishing rod', 'سنارة'), desc: T('Second-hand. Mostly works.', 'مستعملة. تشتغل غالباً.') } });

/* jobs & food in town */
GAME.TOPICS.marco.push(
  { id: 'pie', label: T('Buy a slice of pie ($3)', 'تشتري قطعة فطيرة (٣$)'), need: s => s.money >= 3, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(3); feed(40); addMood(1); return [{ c: 'marco', e: 'smile', t: fresh('pie', [T('Apple pie. Baked this morning. By my mother. Don\'t tell anyone, they think it\'s me.', 'فطيرة تفاح. انخبزت الصبح. أمي سوتها. لا تقول لأحد، يحسبونها أنا.'), T('Warm pie, cold coffee. That\'s the house special. It\'s also a mistake.', 'فطيرة حارة وقهوة باردة. هذا طبق البيت. وهو بعد غلطة.'), T('Eat. You look like a sad ghost. A sad ghost who could use pie.', 'كل. شكلك شبح حزين. شبح حزين محتاج فطيرة.')]) }]; } },
  { id: 'shift', label: T('Work an evening shift ($4 + tips)', 'تشتغل شفت المغرب (٤$ + بقشيش)'), if: s => s.slot === 3 && s.day >= 2 && !doneToday('shift'), cls: 'main', run: s => { onceToday('shift'); s.f.shifts = (s.f.shifts || 0) + 1; return [
    { c: 'marco', e: 'smile', t: fresh('shiftIntro', [T('Apron\'s on the hook. Table four wants everything. Table six wants nothing but complains anyway.', 'المريلة على المسمار. طاولة أربعة تبي كل شي. وطاولة ستة ما تبي شي بس تتشكى على كل حال.'), T('Rush hour. By which I mean eight people. Go, go, go.', 'وقت الزحمة. يعني ثمان أشخاص. يلا، يلا، يلا.'), T('Remember: smile, serve, never tell them who baked the pie.', 'تذكر: ابتسم، قدّم، ولا تقول لهم مين خبز الفطيرة.')]) },
    { mini: 'cafe', size: s.f.shifts > 2 ? 4 : 3, then: (r, st) => { const tip = r * 2; st.money += 4 + tip; addMood(r >= 2 ? 1 : 0); rest(-10); advance(1); return [N_(r >= 3 ? 'Every order right. Marco hugs you. You didn\'t agree to that.' : r >= 2 ? 'Mostly right. Someone got soup instead of lemonade and decided they preferred it.' : 'Chaos. A man got a pie in a teacup. Marco calls it "experimental service".', r >= 3 ? 'كل الطلبات صح. ماركو يضمك. ما وافقت على هذا.' : r >= 2 ? 'أغلبها صح. واحد جاه شوربة بدل الليمونادة وقرر إنه يحبها أكثر.' : 'فوضى. رجل جاته فطيرة في كوب شاي. ماركو يسميها «خدمة تجريبية».'), N_('+ $' + (4 + tip), '+ ' + (4 + tip) + '$')]; } }]; } }
);
GAME.TOPICS.sami.push(
  { id: 'snack', label: T('Buy a snack ($2)', 'تشتري شي ياكل (٢$)'), need: s => s.money >= 2, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(2); feed(30); return [{ c: 'sami', e: 'smile', t: fresh('snack', [T('Sandwich. Cheese. The cheese is optimistic.', 'سندويشة جبن. الجبن متفائل.'), T('Banana and crisps. A balanced meal, if you\'re a pirate.', 'موز وشيبس. وجبة متوازنة، إذا كنت قرصان.'), T('Yesterday\'s bread, today\'s price. Joking. It\'s half price.', 'خبز أمس بسعر اليوم. أمزح. بنص السعر.')]) }]; } },
  { id: 'rod', label: T('Buy a fishing rod ($5)', 'تشتري سنارة (٥$)'), if: s => !has('rod'), need: s => s.money >= 5, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(5); give('rod'); return [{ c: 'sami', e: 'smile', t: T('My uncle\'s. He swore it caught a shark once. It did not.', 'حق عمي. حلف إنه صاد فيها قرش مرة. ما صاد.') }]; } }
);
GAME.LOC.harbor.spots.push({ x: 30, y: 72, label: T('Fish from the pier', 'تصيد من الرصيف'), if: s => has('rod') && s.slot < NIGHT, run: s => [
  { mini: 'fish', then: (hits, st) => { advance(1); rest(-8); if (hits) { give('fish', hits); addMood(1); } return [N_(hits === 3 ? 'Three bites, three fish. A gull watches you with open respect.' : hits ? 'You land ' + hits + '. The others get away and, you assume, tell their friends.' : 'Nothing. The sea keeps its fish and its opinions.', hits === 3 ? 'ثلاث مرات، ثلاث سمكات. نورس يطالعك باحترام واضح.' : hits ? 'تصيد ' + hits + '. والباقي يهرب، ويمكن يعلّم أصحابه.' : 'ولا شي. البحر يحتفظ بسمكه وبرأيه.')]; } }] });

/* ---------------- the bench: you can always sleep somewhere ---------------- */
GAME.LOC.street.spots.push({ x: 52, y: 74, label: T('Sleep on the bench', 'نام على الكرسي'), if: s => s.slot === NIGHT && !s.f.prologue && !s.host, run: s => { sleepToMorning(); addMood(-1); needs().clean = clamp(needs().clean - 20, 0, 100); return [N_('You sleep on the bench outside Sami\'s. You wake up to Sami putting a blanket over you that you didn\'t notice arrive.', 'تنام على الكرسي قدام بقالة سامي. وتصحى على سامي يحط عليك بطانية ما انتبهت متى جات.')]; } });

/* ---------------- Sami's attic: home between houses ---------------- */
GAME.LOC.sami_attic = {
  name: T('Your attic room above Sami\'s', 'غرفتك فوق بقالة سامي'), bg: 'sami_attic', canWait: true, exits: [{ to: 'grocery', x: 6, y: 86, label: T('Downstairs to the shop', 'انزل للبقالة') }],
  spots: [
    { x: 74, y: 62, label: s => (s.slot === NIGHT ? T('Sleep', 'نام') : T('Lie down', 'تمدد')), run: s => GAME.SCRIPTS.bed(s) },
    { x: 30, y: 58, label: T('Tiny kitchen: eat something', 'مطبخ صغير: كل شي'), run: s => GAME.SCRIPTS.eat(s) },
    { x: 16, y: 40, label: T('Tiny shower', 'دش صغير'), run: s => GAME.SCRIPTS.shower(s) },
    { x: 50, y: 30, label: T('Window over the harbor', 'شباك على الميناء'), run: s => [] },
    { x: 84, y: 30, label: T('Call your mother', 'تتصل بأمك'), if: s => !s.f.calledMother, need: null, run: s => s.mood >= 5 ? (s.f.calledMother = true, addMood(1), [N_('It rings twice. "...Hello?" You can\'t speak at first. She understands. "It\'s alright. Just stay on the line."', 'يرن مرتين. «...ألو؟» ما تقدر تتكلم بالبداية. هي تفهم. «خلاص. بس خلك على الخط.»'), N_('You stay on the line for an hour. You tell her about Saltmere. She tells you about the neighbour\'s new dog. It\'s the best hour in a long time.', 'تبقى على الخط ساعة. تحكي لها عن سولتمير. وهي تحكي لك عن كلب الجيران الجديد. أحسن ساعة من زمان.')]) : [N_('You look at her name for a long time. Not yet. But closer than yesterday.', 'تطالع اسمها وقت طويل. مو الحين. بس أقرب من أمس.')] }
  ]
};
GAME.LOC.grocery.exits.push({ to: 'sami_attic', x: 92, y: 30, label: T('Upstairs (your room)', 'فوق (غرفتك)'), if: s => !!s.f.hasAttic });
/* the attic has its own side door, so you can always get home, even after Sami closes */
GAME.LOC.street.exits.push({ to: 'sami_attic', x: 30, y: 30, label: T('Side stairs to your attic', 'الدرج الجانبي لغرفتك'), if: s => !!s.f.hasAttic && s.slot === NIGHT });
GAME.LOC.sami_attic.exits.push({ to: 'street', x: 94, y: 86, label: T('Side stairs to the street', 'الدرج الجانبي للشارع') });
GAME.LOC.sami_attic.mapName = T('Your attic', 'غرفتك');
ART.PLACES.sami_attic = [44, 27];
GAME.MAP.push({ to: 'sami_attic', if: s => !!s.f.hasAttic });
GAME.LOC.sami_attic.spots[3].run = s => [{ n: fresh('atticWin', [T('Boats, gulls, the lighthouse turning. From up here the town looks like a model someone is still finishing.', 'قوارب، نوارس، والمنارة تدور. من فوق البلدة تبين كأنها مجسم أحد لسا يكمله.'), T('Rain on the glass. Somewhere below, Sami is singing to the tomatoes.', 'مطر على الزجاج. وتحت في مكان ما، سامي يغني للطماطم.'), T('The sea is silver this morning. You notice that you noticed.', 'البحر فضي هالصبح. وتنتبه إنك انتبهت.')]) }];

/* ---------------- chapter flow ---------------- */
const HOSTS_LATE = ['margaret', 'evelyn', 'victor'];
Object.assign(GAME.SCRIPTS, {
  afterLeo: s => {
    s.host = null; s.ch = 3;
    return [{ go: 'grocery' }, { show: [{ id: 'sami', e: 'smile' }] },
      { c: 'sami', e: 'smile', t: T('There\'s a little room above the shop. Bed, a shower the size of a phone box, a window full of gulls. It\'s yours. Pay me when you can. Or never. Probably never.', 'فيه غرفة صغيرة فوق البقالة. سرير، ودش بحجم كابينة تلفون، وشباك مليان نوارس. لك. ادفع لي متى ما قدرت. أو أبداً. غالباً أبداً.') },
      st => { st.f.hasAttic = true; quest('q_doors', 'active'); return null; },
      N_('Three doors in Saltmere still stand closed to you: the white house on Cliff Road, the old lighthouse, and the Grand Hotel. You can knock on any of them, in any order, whenever you\'re ready.', 'فيه ثلاث أبواب في سولتمير لسا مسكّرة عليك: البيت الأبيض في شارع الجرف، والمنارة القديمة، والفندق الكبير. تقدر تطق أي واحد فيهم، بأي ترتيب، متى ما كنت جاهز.')];
  },
  afterHost: s => {
    s.host = null; s.f.hasAttic = true; if (!s.quests.q_doors) quest('q_doors', 'active');
    const left = HOSTS_LATE.filter(h => !s.done[h]);
    if (!left.length) return [{ jump: 'finaleStart' }];
    return [{ go: 'sami_attic' }, { show: [] }, N_(left.length === 2 ? 'Back in your attic above Sami\'s. Two doors left in Saltmere.' : 'Back in your attic. One door left.', left.length === 2 ? 'رجعت لغرفتك فوق بقالة سامي. باقي بابين في سولتمير.' : 'رجعت لغرفتك. باقي باب واحد.'),
      N_(left.map(h => tx(GAME.CHAR[h].name)).join(' · '), left.map(h => tx(GAME.CHAR[h].name)).join(' · '))];
  },
  finaleStart: s => {
    s.host = null; s.f.finale = true; if (s.quests.q_doors) quest('q_doors', 'done');
    const dark = (s.conscience || 0) <= -3 || s.done.victor === 'VIC_DARK';
    const lost = s.mood <= 2;
    const lessons = (s.lessons || []).map(l => ({ n: l.t }));
    return [{ go: 'sami_attic' }, { show: [] }, N_('Weeks pass. Saltmere has learned your name, and mostly says it kindly.', 'تمر أسابيع. سولتمير تعلّمت اسمك، وأغلب الوقت تقوله بلطف.')].concat(lessons).concat([
      { go: 'street' }, { time: 0 },
      st => { st.slot = NIGHT; return null; },
      N_('An ordinary night. You walk past Sami\'s. On the bench where you once sat, a young man is sitting, thobe creased, eyes on the ground.', 'ليلة عادية. تمر قدام بقالة سامي. على الكرسي اللي جلست عليه مرة، شاب جالس، ثيابه مكرمشة، وعيونه في الأرض.'),
      N_('You know that look. You\'ve seen it in the mirror.', 'تعرف هالنظرة. شفتها بالمراية.'),
      dark ? { jump: 'endDark' } : lost ? { jump: 'endLost' } : { menu: [
        { t: T('Sit beside him, and hold out half a loaf', 'تجلس جنبه، وتمد له نص خبزة'), need: st => st.mood >= 5 && (st.conscience || 0) >= 0, why: T('You want to. But you have nothing to give. Not yet.', 'تبي. بس ما عندك شي تعطيه. بعد.'), then: [{ jump: 'endHost' }] },
        { t: T('Take the morning train home to your mother', 'تركب قطار الصبح وترجع لأمك'), need: st => !!st.f.calledMother, why: T('You haven\'t spoken to her yet.', 'ما كلمتها للحين.'), then: [{ jump: 'endHome' }] },
        { t: T('Keep walking', 'تكمل طريقك'), then: [{ jump: 'endPass' }] }
      ] }]);
  },
  endHost: [N_('You sit down. You tear the loaf in two. He looks at you, puzzled.', 'تجلس. تقسم الخبزة نصين. يطالعك مستغرب.'), N_('"When did you last eat?" "...A while ago." "My place is small. It\'s above a grocery. There\'s room."', '«متى آخر مرة أكلت؟» «...من زمان.» «مكاني صغير. فوق بقالة. بس فيه مكان.»'), N_('You were a guest in other people\'s lives. Now you have a door to open.', 'كنت ضيف في حياة غيرك. الحين عندك باب تفتحه.'), { end: 'END_HOST' }],
  endHome: [N_('You buy two coffees from Marco and give one to the young man on the bench, with Sami\'s number on the cup. Then you walk to the station.', 'تشتري قهوتين من ماركو، وتعطي وحدة للشاب اللي على الكرسي، ومكتوب على الكوب رقم سامي. وبعدين تمشي للمحطة.'), N_('The morning train. The line runs the other way this time. Your mother is on the platform at the other end, holding a sign with your name on it, as if you might not recognise her.', 'قطار الصبح. الخط يمشي بالاتجاه الثاني هالمرة. وأمك على الرصيف في الطرف الثاني، ماسكة لوحة عليها اسمك، كأنك ممكن ما تعرفها.'), { end: 'END_HOME' }],
  endPass: [N_('You walk on. A few steps later you look back. He\'s still there.', 'تكمل. بعد كم خطوة تلتفت. هو لسا هناك.'), N_('Maybe someone else will sit with him tonight. Maybe tomorrow it\'ll be you. Some people need longer before they can become a home. That\'s no failing.', 'يمكن أحد ثاني يجلس معه الليلة. يمكن بكرة أنت. بعض الناس يحتاجون وقت أطول عشان يصيرون بيت. وهذا مو عيب.'), { end: 'END_PASS' }],
  endLost: [N_('You look at him, and you can\'t move. You sit at the other end of the bench. Neither of you says anything until the sky goes grey.', 'تطالعه، وما تقدر تتحرك. تجلس على الطرف الثاني من الكرسي. ولا واحد فيكم يقول شي لين السما تصير رمادية.'), N_('In the morning, Sami finds two people on his bench instead of one, and puts the kettle on for both.', 'الصبح، سامي يلقى شخصين على الكرسي بدل واحد، ويحط الغلاية على النار للاثنين.'), { end: 'END_LOST' }],
  endDark: [N_('You look at him and think: useful. Desperate people do what they\'re told. Victor taught you that.', 'تطالعه وتفكر: مفيد. الناس اليائسين يسوون اللي ينقال لهم. فيكتور علّمك هذا.'), N_('You sit beside him and smile with your whole face and none of your eyes. "I know a man at the Grand Hotel," you say. "He could use someone like you."', 'تجلس جنبه وتبتسم بوجهك كله، وعيونك لا. «أعرف رجّال في الفندق الكبير،» تقول. «يحتاج واحد مثلك.»'), { end: 'END_DARK' }],
  sandboxStart: s => { s.f.sandbox = true; s.host = null; s.slot = 0; s.day++; return [{ go: 'sami_attic' }, { show: [] }, N_('Life in Saltmere goes on. Sami needs boxes lifted. Marco needs an audience. The sea needs nothing, as usual. You can keep living here as long as you like.', 'الحياة في سولتمير تكمل. سامي يبي أحد يشيل كراتين. ماركو يبي جمهور. والبحر ما يبي شي، مثل العادة. تقدر تكمل تعيش هنا قد ما تبي.')]; }
});
Object.assign(GAME.QUESTS, { q_doors: { title: T('Three closed doors', 'ثلاث أبواب مسكّرة'), hint: T('Margaret\'s white house on Cliff Road, the lighthouse, the Grand Hotel. Knock on any of them, in any order.', 'بيت مارغريت الأبيض في شارع الجرف، والمنارة، والفندق الكبير. اطرق أي واحد، بأي ترتيب.') } });
Object.assign(GAME.END, {
  END_HOST: { title: T('The Host', 'المضيف'), final: true, after: T('Your ending. Every house you lived in is part of it.', 'نهايتك أنت. وكل بيت سكنت فيه جزء منها.') },
  END_HOME: { title: T('The one who went home', 'اللي رجع'), final: true, after: T('Your ending. Every house you lived in is part of it.', 'نهايتك أنت. وكل بيت سكنت فيه جزء منها.') },
  END_PASS: { title: T('Passing through', 'عابر'), final: true, after: T('Your ending. Every house you lived in is part of it.', 'نهايتك أنت. وكل بيت سكنت فيه جزء منها.') },
  END_LOST: { title: T('Still on the bench', 'لسا على الكرسي'), final: true, after: T('Your ending. Every house you lived in is part of it.', 'نهايتك أنت. وكل بيت سكنت فيه جزء منها.') },
  END_DARK: { title: T('Victor\'s apprentice', 'تلميذ فيكتور'), final: true, after: T('Your ending. Every house you lived in is part of it.', 'نهايتك أنت. وكل بيت سكنت فيه جزء منها.') }
});
/* Leo's endings now continue the story */
['LEO_HOME', 'LEO_STAY', 'LEO_RUN', 'LEO_KICK'].forEach(k => { GAME.END[k].next = 'afterLeo'; GAME.END[k].after = T('Chapter 2 complete. Sami has a room for you, and three doors in Saltmere are still closed.', 'خلص الفصل الثاني. سامي عنده غرفة لك، وفيه ثلاث أبواب في سولتمير لسا مسكّرة.'); });
GAME.END.LEO_TRUTH.next = 'margStartTruth'; GAME.END.LEO_TRUTH.after = T('Chapter 2 complete. The door opens on Margaret\'s chapter.', 'خلص الفصل الثاني. والباب ينفتح على فصل مارغريت.');
GAME.END.ELIAS_STAY.nextLabel = GAME.END.ELIAS_LETTER.nextLabel = GAME.END.ELIAS_PEACE.nextLabel = GAME.END.ELIAS_KICK.nextLabel = GAME.END.ELIAS_GO.nextLabel = 'nextChapter';
(function () { const go = GAME.SCRIPTS.endGo; GAME.SCRIPTS.endGo = go.concat ? go.slice(0, -1).concat([s => { s.f.calledMother = true; return null; }, go[go.length - 1]]) : go; })();
['MARG', 'EVE', 'VIC'].forEach(p => Object.keys(GAME.END).filter(k => k.startsWith(p + '_')).forEach(k => { if (!GAME.END[k].next && !GAME.END[k].death) GAME.END[k].next = 'afterHost'; }));

/* sandbox / between-chapter wake: wake where you slept */
GAME.EVENTS.push({ id: 'wakeFree', when: s => s.f.newDay && !s.host && s.f.hasAttic, run: s => {
  s.f.newDay = false; if (s.loc !== 'street') s.loc = 'sami_attic';
  const out = [{ n: fresh('wakeFree', [T('Gulls on the roof. Sami downstairs, arguing with the radio.', 'نوارس على السطح. وسامي تحت يتجادل مع الراديو.'), T('Morning. The smell of bread comes up through the floorboards.', 'صبح. ريحة الخبز تطلع من بين خشب الأرض.'), T('Rain. You lie and listen to it for a while. It\'s allowed.', 'مطر. تتمدد وتسمعه شوي. وهذا مسموح.'), T('The lighthouse goes off as the sun comes up. A new day in Saltmere.', 'المنارة تطفي مع طلوع الشمس. يوم جديد في سولتمير.')]) }];
  if (lowNeeds().length) out.push(N_('Your body is asking for things. Food, water, rest. You can listen to it today.', 'جسمك يطلب أشياء. أكل، وموية، وراحة. تقدر تسمعه اليوم.'));
  return out;
} });

/* ---------------- random town events: short, never repeated until the pool runs out ---------------- */
GAME.RANDOM = GAME.RANDOM || [];
GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
GAME.ENTER_HOOKS.push(s => {
  if (s.f.prologue || !s.f.metElias) return null;
  const L = GAME.LOC[s.loc]; if (!L || L.private || L.house) return null;
  const key = s.day * 10 + s.slot; if (s.f.rvKey === key) return null;
  if (!roll(0.3)) return null;
  const pool = GAME.RANDOM.filter(e => (!e.where || e.where.includes(s.loc)) && (!e.when || e.when(s)) && (s.f['rv_' + e.id] == null || (e.repeat && s.day - s.f['rv_' + e.id] >= e.repeat)));
  if (!pool.length) return null;
  const e = pool[Math.floor(Math.random() * pool.length)];
  s.f['rv_' + e.id] = s.day; s.f.rvKey = key;
  return typeof e.run === 'function' ? e.run(s) : e.run;
});
