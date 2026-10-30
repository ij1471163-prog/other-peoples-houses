/* =====================================================================
   Buying things, out in the open.
     · Marco's menu board and Sami's counter open a list with prices
       (the same things you can already buy by talking to them, plus a
       few new ones). When nobody is behind the counter, it's closed.
     · New at the café: tea, hot chocolate, a bowl of soup.
     · New at Sami's: groceries for a real dinner while you live with
       Elias (cook it in his kitchen, eat it together), and a packet of
       biscuits to give to someone.
     · At night, when everything is shut, a vending machine at the
       harbor sells chocolate.
     · People mention the thing worth doing next, once a day, in their
       own words, when you go up to them (only for tasks that are theirs
       and only at a time of day when it can be done).
   Food, rest and mood only. Nothing here reads or changes trust,
   suspicion, any quest's state or any ending.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const C = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const cost = n => ({ need: s => s.money >= n, why: T('Not enough money.', 'ما معك فلوس كفاية.') });
  const topic = (who, t) => { GAME.TOPICS[who] = GAME.TOPICS[who] || []; GAME.TOPICS[who].push(t); };
  /* the new things are bought at the counter only, so talking menus don't get longer */
  let SHOPPING = false;
  const at = (id, s) => GAME.CHAR[id] && GAME.CHAR[id].where && GAME.CHAR[id].where(s) === s.loc;

  GAME.ITEMS.biscuits = { name: T('Biscuits', 'بسكويت'), desc: T('A packet of shortbread. For someone.', 'باكيت بسكويت زبدة. لأحد.') };
  GAME.ITEMS.groceries = GAME.ITEMS.groceries || { name: T('Groceries', 'مقاضي'), desc: T('Enough for one real dinner.', 'تكفي لعشا حقيقي واحد.') };

  /* ---------- new at the café ---------- */
  topic('marco', Object.assign({ id: 'tea', label: T('Order a pot of tea ($1)', '{تطلب|تطلبين} إبريق شاي (١$)'), if: s => SHOPPING && !doneToday('cTea'),
    run: s => { onceToday('cTea'); pay(1); rest(10); return [C('marco', 'serve', ...fresh('cTea', [
      ['Tea. The drink of people who have given up on excitement. Respect.', 'شاي. مشروب الناس اللي استسلموا من الحماس. احترام.'],
      ['English breakfast. It\'s three in the afternoon. I don\'t judge.', 'شاي إنجليزي للفطور. والساعة ثلاث العصر. ما أحكم على أحد.'],
      ['Pot for one. The cup is chipped on the side you won\'t drink from. Probably.', 'إبريق لشخص واحد. الكوب مكسور من الجهة اللي ما {بتشرب|بتشربين} منها. غالباً.']]))]; } }, cost(1)));
  topic('marco', Object.assign({ id: 'cocoa', label: T('Order a hot chocolate ($2)', '{تطلب|تطلبين} شوكولاتة حارة (٢$)'), if: s => SHOPPING && !doneToday('cCocoa'),
    run: s => { onceToday('cCocoa'); pay(2); rest(5); addMood(1); return [C('marco', 'blow', 'Careful, there\'s a cream mountain. I may have got carried away. Climb it slowly.', '{انتبه|انتبهي}، فيه جبل كريمة. يمكن تحمّست شوي. {اطلعه|اطلعيه} على مهلك.')]; } }, cost(2)));
  topic('marco', Object.assign({ id: 'soup', label: T('Order a bowl of soup ($3)', '{تطلب|تطلبين} صحن شوربة (٣$)'), if: s => SHOPPING,
    run: s => { pay(3); feed(45); return [C('marco', 'serve', ...fresh('cSoup', [
      ['Fish soup. My nonna\'s. With bread. Eat it all or she\'ll know.', 'شوربة سمك. حقت جدتي. مع خبز. {كلها|كليها} كلها ولا بتدري.'],
      ['Tomato today. It\'s the only red thing in Saltmere that isn\'t a sunburn.', 'طماط اليوم. الشي الأحمر الوحيد في سولتمير اللي مو حرق شمس.'],
      ['Leek and potato. Hot enough to make you forget the wind for ten minutes.', 'كراث وبطاطس. حارة لدرجة {تنسيك|تنسيك} الهوا عشر دقايق.']]))]; } }, cost(3)));

  /* ---------- new at Sami's ---------- */
  topic('sami', Object.assign({ id: 'buygroc1', label: T('Buy groceries for a real dinner ($4)', '{تشتري|تشترين} مقاضي لعشا صدق (٤$)'),
    if: s => SHOPPING && s.host === 'elias' && !s.f.ended && !has('groceries'),
    run: s => { pay(4); give('groceries'); return [C('sami', 'give', 'Potatoes, onions, a piece of cod, real butter. For Elias? Make him eat the vegetables. He hides them under the fish.', 'بطاطس، وبصل، وقطعة سمك، وزبدة صدق. لإلياس؟ {خله|خليه} ياكل الخضار. يخبيها تحت السمك.')]; } }, cost(4)));
  topic('sami', Object.assign({ id: 'biscuits', label: T('Buy a packet of biscuits ($2)', '{تشتري|تشترين} باكيت بسكويت (٢$)'), if: s => SHOPPING && !has('biscuits'),
    run: s => { pay(2); give('biscuits'); return [C('sami', 'laugh', 'Shortbread. Nobody buys these for themselves. Who\'s the lucky one?', 'بسكويت زبدة. محد يشتريه لنفسه. مين المحظوظ؟')]; } }, cost(2)));

  /* biscuits make a small visit nicer (flavour only, nothing else) */
  const gift = (who, lines) => topic(who, { id: 'giftBiscuits', once: true, label: T('Give the biscuits', '{تعطي|تعطين} البسكويت'), if: s => has('biscuits'),
    run: s => { take('biscuits'); addMood(1); return lines; } });
  gift('margaret', [C('margaret', 'smile', 'Shortbread. Oh, you shouldn\'t have. I\'ll put them on a plate. A proper plate. Sit down, I\'ll make tea.', 'بسكويت زبدة. آه، ما كان له داعي. بحطه في صحن. صحن صدق. {اجلس|اجلسي}، بسوي شاي.')]);
  gift('martha', [C('martha', 'smile', 'For me? Well. Now I have to like you. That\'s very unfair of you.', 'لي أنا؟ طيب. الحين لازم أحبك. هذا ظلم منك.')]);
  gift('gregor', [C('gregor', 'smile', 'Biscuits. At a cemetery. You\'re a strange one. Sit, then. Half each. The dead don\'t eat much.', 'بسكويت. في مقبرة. {أنت غريب|أنتِ غريبة}. {اجلس|اجلسي} طيب. نص لكل واحد. الأموات ما ياكلون كثير.')]);
  gift('evelyn', [C('evelyn', 'smile', 'Gerald will want one. Gerald will not get one. These are for keepers only.', 'جيرالد بيبي واحد. وجيرالد ما بياخذ. هذا للحرّاس بس.')]);

  /* ---------- dinner for two at Elias's ---------- */
  const DINNER = [
    ['You cook the cod with the potatoes and too much butter. Halfway through, Elias appears in the doorway, sniffs, and sits at the table without a word. He eats everything. Then he eats what you left.', '{تطبخ|تطبخين} السمك مع البطاطس وزبدة كثير. بالنص، إلياس يطل من الباب، يشم، ويجلس على الطاولة بدون ولا كلمة. ياكل كل شي. وبعدين ياكل اللي {تركته|تركتيه}.'],
    ['A fish pie, more or less. Elias lays two plates without being asked, then a third out of habit, then puts the third one back very quietly.', 'فطيرة سمك، تقريباً. إلياس يحط صحنين بدون ما أحد يطلب، وبعدين ثالث من العادة، وبعدين يرجّع الثالث بهدوء مرة.'],
    ['Soup, bread, and the last of the butter. Neither of you talks much. The radio does it for you. It\'s the best evening in a while.', 'شوربة، وخبز، وآخر الزبدة. ولا واحد فيكم يتكلم كثير. الراديو يتكلم عنكم. أحلى مسا من زمان.']];
  if (GAME.LOC.kitchen) GAME.LOC.kitchen.spots.push({ x: 82, y: 76, label: T('Cook a real dinner for two', '{اطبخ|اطبخي} عشا صدق لاثنين'),
    if: s => s.host === 'elias' && !s.f.ended && has('groceries') && (s.slot === 2 || s.slot === 3) && !doneToday('eCook'),
    run: s => {
      onceToday('eCook'); take('groceries'); advance(1); feed(60); addMood(1);
      const out = [N1(...fresh('eDinner', DINNER))];
      if (eliasHome(s)) out.push(C('elias', 'smile', ...fresh('eDinnerE', [
        ['That was a proper dinner, {lad|lass}. I\'d forgotten.', 'هذا عشا صدق يا {ولدي|بنتي}. كنت ناسي.'],
        ['Don\'t tell Martha I had seconds. She\'ll want to know who cooked.', '{لا تقول|لا تقولين} لمارثا إني أخذت مرتين. بتبي تعرف مين طبخ.'],
        ['Ada used to put pepper on everything. Yours is better. Don\'t tell her either.', 'آدا كانت تحط فلفل على كل شي. حقك أحسن. ولا تقول لها بعد.']])));
      return out;
    } });

  /* ---------- the menu board and the counter ---------- */
  function shop(owner, ids, head, closed) {
    return s => {
      if (!at(owner, s)) return [N1(...closed)];
      SHOPPING = true; let list;
      try { list = ids.map(id => GAME.TOPICS[owner].find(t => t.id === id)).filter(t => t && (!t.if || t.if(s))); } finally { SHOPPING = false; }
      const menu = list.map(t => ({ t: t.label, need: t.need, why: t.why, then: [st => t.run(st)] }));
      menu.push({ t: T('Nothing, thanks', 'ولا شي، مشكور'), then: [] });
      return [{ c: owner, e: 'neutral', q: T(...head), menu }];
    };
  }
  const board = GAME.LOC.cafe && GAME.LOC.cafe.spots.find(h => /Menu board/.test(h.label.en));
  if (board) {
    const r0 = board.run;
    board.run = s => (at('marco', s) ? shop('marco', ['coffee', 'tea', 'cocoa', 'pie', 'soup'], ['What can I get you?', 'وش {تبي|تبين}؟'])(s) : r0(s));
  }
  if (GAME.LOC.grocery) GAME.LOC.grocery.spots.push({ x: 50, y: 62, label: T('The counter', 'الكاونتر'),
    run: shop('sami', ['buybread', 'snack', 'buygroc1', 'buygroceries', 'biscuits', 'buybeans', 'rod', 'buybait', 'buymints'], ['What do you need?', 'وش تحتاج{|ين}؟'],
      ['Nobody behind the counter. A note: "BACK SOON. (Probably.)"', 'محد ورا الكاونتر. فيه ورقة: «راجع بعد شوي. (غالباً.)»']) });

  /* ---------- at night: a vending machine at the harbor ---------- */
  if (GAME.LOC.harbor) GAME.LOC.harbor.spots.push({ x: 27, y: 41, label: T('Vending machine', 'مكينة بيع'),
    if: s => s.slot === NIGHT && !s.f.prologue && !doneToday('vend'),
    run: s => [{ q: T('An old vending machine by the ferry shelter, humming to itself. Most of the rows are empty.', 'مكينة بيع قديمة جنب مظلة العبّارة، تطن لحالها. أغلب الصفوف فاضية.'), menu: [
      Object.assign({ t: T('A chocolate bar ($1)', 'لوح شوكولاتة (١$)'), hide: s => doneToday('vend'), fx: s => { onceToday('vend'); pay(1); feed(15); },
        then: [N1(...fresh('vend', [['It drops with a clunk. Slightly soft. The best thing you\'ve ever eaten, at this hour.', 'يطيح بصوت. ليّن شوي. أحلى شي {أكلته|أكلتيه} في حياتك، في هالساعة.'],
          ['The machine thinks about it for a long time, then gives you the chocolate. And, out of nowhere, a second coin back.', 'المكينة تفكر وقت طويل، وبعدين تعطيك الشوكولاتة. ومن لا مكان، ترجع لك فكة زيادة.']]))] }, cost(1)),
      { t: T('Leave it', '{خلها|خليها}'), then: [] }] }] });

  /* ---------- people mention what's worth doing next ---------- */
  /* who · task · times of day it fits · the line */
  const NUDGE = {
    elias: [['q_dawn', [3, 4], 'neutral', 'Boat goes out at first light. Harbor. If you\'re up.', 'القارب يطلع مع أول ضو. الميناء. إذا {صحيت|صحيتي}.'],
      ['q_nets', [0, 1, 2], 'neutral', 'Nets in the shed this afternoon. Bring your fingers.', 'الشباك في المخزن العصر. {جب|جيبي} أصابعك معك.'],
      ['q_chess', [1, 2, 3], 'smile', 'Marco owes me a game tonight. Café, after six. Come and watch him lose.', 'ماركو عليه لي دق شطرنج الليلة. المقهى، بعد ست. {تعال|تعالي} {شوفه|شوفيه} وهو يخسر.'],
      ['q_bread', [0, 1, 2, 3], 'neutral', 'Bread bin\'s empty again. Don\'t look at me. I forget.', 'صندوق الخبز فاضي مرة ثانية. {لا تطالعني|لا تطالعيني}. أنا أنسى.']],
    sami: [['q_money', [0, 1, 2], 'smile', 'I could use a hand in the afternoons, if you want work. Pay\'s terrible. Company\'s great.', 'أحتاج أحد يساعدني العصر، إذا {تبي|تبين} شغل. الفلوس زفت. بس الصحبة حلوة.'],
      ['q_postcard', [0, 1, 2, 3], 'neutral', 'Still carrying that postcard? Show the old-timers. The cemetery\'s full of people who remember things. Some of them are even alive.', 'لسا {شايل|شايلة} الكرت؟ {ورّه|ورّيه} الشياب. المقبرة مليانة ناس يتذكرون أشياء. وبعضهم حتى عايشين.']],
    leo: [['q_deliver', [0, 1, 2], 'neutral', 'Deliveries this afternoon. Main Street. Bring arms.', 'توصيلات العصر. الشارع الرئيسي. {جب|جيبي} يدينك.'],
      ['q_draw', [2, 3], 'smile', 'I\'ll be on the dock tonight, drawing gulls. They\'re terrible models. Come anyway.', 'بكون على الرصيف الليلة، أرسم نوارس. موديلز فاشلين. {تعال|تعالي} على كل حال.']],
    margaret: [['q_m_room', [1, 2, 3], 'smile', 'Dinner\'s at seven. I\'ll set two places. Don\'t be late, it gets cold.', 'العشا الساعة سبع. بحط صحنين. {لا تتأخر|لا تتأخرين}، يبرد.'],
      ['q_m_garden', [0, 1], 'neutral', 'The garden\'s gone wild out front. I don\'t have the knees for it anymore.', 'الحديقة اللي قدام صارت غابة. ما عاد عندي ركب لها.']],
    evelyn: [['q_e_gulls', [0, 1, 2], 'smile', 'Gerald will be expecting you this afternoon. He\'s very punctual. For a gull.', 'جيرالد بينتظرك العصر. دقيق في مواعيده مرة. بالنسبة لنورس.'],
      ['q_e_lamp', [2, 3], 'neutral', 'The lamp needs minding tonight, if you\'ve got hands.', 'الفانوس يبي أحد يراقبه الليلة، إذا عندك يدين.']]
  };
  for (const [id, list] of Object.entries(NUDGE)) {
    const c = GAME.CHAR[id]; if (!c) continue;
    const g0 = c.greet;
    c.greet = s => {
      try {
        if (!RUN && (s.susp[id] || 0) < 1 && !(id === 'margaret' && (s.f.mt || 0) >= 3) && !s.once['hintNudge_' + id + '@' + s.day]) {
          const own = GAME.QUEST_OWNER || {};
          const n = list.find(([q, slots]) => s.quests[q] === 'active' && slots.includes(s.slot) && (!own[q] || own[q] === s.host));
          if (n) { s.once['hintNudge_' + id + '@' + s.day] = 1; return { e: n[2], t: T(n[3], n[4]) }; }
        }
      } catch (e) { console.error(e); }
      return g0 ? g0(s) : null;
    };
  }
})();
