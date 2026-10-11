/* =====================================================================
   Sami — Runs the grocery. Gives everyone credit.
   Everything that is Sami's own: profile, where Sami is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (elias.js, town.js, systems.js).
   ===================================================================== */
'use strict';
(function () {
  /* who Sami is and Sami's daily routine (Chapter 1, Elias) */
  GAME.CHAR.sami = {
    name: T('Sami', 'سامي'), role: T('Runs the grocery. Gives everyone credit.', 'صاحب البقالة. يدين الكل.'), art: true,
    where: s => (!s.f.prologue && s.slot < NIGHT ? 'grocery' : null),
    doing: s => [T('Sami is unpacking the morning delivery.', 'سامي يفتح كراتين توصيلة الصبح.'), T('Sami is eating lunch behind the counter, standing up.', 'سامي ياكل غداه ورا الكاونتر، واقف.'), T('Sami is restocking shelves and doing sums in his head.', 'سامي يرص الرفوف ويحسب في راسه.'), T('Sami is counting the till, twice.', 'سامي يعد فلوس الكاشير، مرتين.')][s.slot],
    greet: s => ({ e: 'smile', t: T('Hey, {name}. What can I do for you?', 'هلا {name}. وش أقدر أسوي لك؟') })
  };
  /* things to talk about (Chapter 1, Elias) */
  GAME.TOPICS.sami = [
    { id: 'work', label: T('Ask for work', 'تسأله عن شغل'), if: s => s.slot === 2 && !doneToday('work'), cls: 'main', run: s => { onceToday('work'); const first = !s.f.worked; s.f.worked = true; s.money += 8; addMood(1); quest('q_money', 'done'); advance(1); return (first ? [
      { c: 'sami', e: 'smile', t: T('Can you lift boxes and not talk? Then yes. Eight dollars, afternoons.', 'تقدر تشيل كراتين وما تتكلم؟ إذن نعم. ثمان دولارات، كل ظهر.') }] : []).concat([
      pickOne([N_('You stack tins and sweep the back room. Sami pays you in cash and a banana.', 'ترص علب وتكنس المخزن. سامي يدفع لك كاش وموزة.'), N_('Deliveries, inventory, a customer who wants to argue about lemons. The afternoon goes fast.', 'توصيلات، وجرد، وزبون يبي يتجادل عن الليمون. الظهر يمر بسرعة.')]),
      N_('+ $8', '+ ٨$')]); } },
    { id: 'buybread', label: T('Buy bread ($2)', 'تشتري خبز (٢$)'), need: s => s.money >= 2, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(2); give('bread'); return [{ c: 'sami', e: 'smile', t: T('Fresh this morning. Well. This morning-ish.', 'طازج من الصبح. يعني. تقريباً من الصبح.') }]; } },
    { id: 'buybeans', label: T('Buy good coffee ($6)', 'تشتري قهوة فاخرة (٦$)'), if: s => s.f.metElias && !s.f.boughtBeans, need: s => s.money >= 6, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(6); give('beans'); s.f.boughtBeans = true; return [{ c: 'sami', e: 'shock', t: T('The good stuff? For Elias? He hasn\'t bought this since his wife passed.', 'الفاخرة؟ لإلياس؟ ما اشتراها من يوم ماتت زوجته.') }]; } },
    { id: 'sellfish', label: T('Sell him your fish ($4)', 'تبيع له السمكة (٤$)'), if: s => has('fish'), run: s => { take('fish'); s.money += 4; return [{ c: 'sami', e: 'smile', t: T('One of Elias\'s? Then it\'s a good fish. Four dollars.', 'من صيد إلياس؟ إذن سمكة زينة. أربع دولارات.') }]; } },
    { id: 'elias', once: true, label: T('Ask about Elias', 'تسأله عن إلياس'), if: s => s.f.metElias, run: [
      { c: 'sami', e: 'sad', t: T('He used to bring me fish every Friday. Wouldn\'t take money. Stopped in the spring.', 'كان يجيب لي سمك كل جمعة. وما يرضى ياخذ فلوس. وقف من الربيع.') },
      { c: 'sami', e: 'sad', t: T('And he\'s thinner. My father got thin like that before... Anyway. I\'m glad he has someone in the house.', 'وصار أنحف. أبوي نحف كذا قبل ما... المهم. مبسوط إن عنده أحد بالبيت.') }] },
    { id: 'town', once: true, label: T('Ask about the town', 'تسأله عن البلدة'), run: [
      { c: 'sami', e: 'neutral', t: T('Half the street owes me money. The other half owes Victor. Guess which half sleeps better.', 'نص الشارع مديون لي. والنص الثاني مديون لفيكتور. خمّن أي نص ينام أحسن.') },
      { c: 'sami', e: 'angry', t: T('Victor owns the Grand. Wants to own the rest. Smiles a lot. Never trust a man who smiles with his whole face and none of his eyes.', 'فيكتور صاحب الفندق الكبير. ويبي يملك الباقي. يبتسم كثير. لا تثق في واحد يبتسم بوجهه كله وعيونه لا.') }] }
  ];
  /* things to talk about (Chapter 2, Leo) */
  GAME.TOPICS.sami.push(
    { id: 'buygroceries', label: T('Buy groceries for a real dinner ($4)', 'تشتري مقاضي لعشا صدق (٤$)'), if: s => s.ch === 2, need: s => s.money >= 4, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(4); give('groceries'); return [{ c: 'sami', e: 'smile', t: T('Vegetables? For Leo? Tell him they won\'t bite.', 'خضار؟ لليو؟ قل له ما تعض.') }]; } }
  );
  { const { sign } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.sami.push(
      sign('sami', T('Sign? I\'ll sign, I\'ll photocopy it, I\'ll stick it in the window next to the price of eggs.', 'أوقّع؟ بوقّع، وبصوّرها، وبلصقها في الشباك جنب سعر البيض.')),
      { id: 'news', label: T('"Any news from the people I stayed with?"', '«فيه أخبار عن الناس اللي سكنت عندهم؟»'), if: s => !!s.f.leoEnded && !doneToday('samiNews'), run: s => { onceToday('samiNews'); const out = [];
        const e = s.f.eliasEnd; out.push({ c: 'sami', e: 'neutral', t: e === 'ELIAS_STAY' ? T('Elias rang from his sister\'s. Asked if the Ada still floats. Asked about you second. That\'s love, for Elias.', 'إلياس اتصل من عند أخته. سأل إذا «آدا» لسا تطفو. وسأل عنك ثاني شي. وهذا حب، بالنسبة لإلياس.') : e === 'ELIAS_KICK' ? T('Elias came in for tobacco. Looked at your bench a long time. Didn\'t say anything. Bought two tins instead of one.', 'إلياس جا ياخذ تبغ. طالع كرسيك وقت طويل. وما قال شي. واشترى علبتين بدال وحدة.') : T('Thomas sends a postcard sometimes, for "whoever\'s minding Dad\'s nets". I hang them by the till.', 'توماس يرسل بطاقة أحياناً، «لأي أحد يهتم بشباك أبوي». وأعلّقها جنب الكاشير.') });
        const l = s.done.leo; out.push({ c: 'sami', e: 'smile', t: l === 'LEO_HOME' ? T('Leo\'s working at Frank\'s on Saturdays and drawing the rest of the week. Frank put one of his drawings in the garage window. Customers ask to buy it. Frank says no.', 'ليو يشتغل عند فرانك أيام السبت ويرسم باقي الأسبوع. فرانك حط رسمة له في شباك الكراج. الزباين يطلبون يشترونها. وفرانك يقول لا.') : l === 'LEO_STAY' ? T('Leo sent me a drawing from the city: the grocery, with me in it, much thinner. He knows how to flatter a man.', 'ليو أرسل لي رسمة من المدينة: البقالة، وأنا فيها، أنحف بكثير. يعرف كيف يجامل الرجّال.') : l === 'LEO_TRUTH' ? T('Leo\'s been seen on Cliff Road. Walking past the white house, not the long way round. That\'s new.', 'ليو انشاف في شارع الجرف. يمر قدام البيت الأبيض، مو من الطريق الطويل. وهذا جديد.') : T('No word from Leo. His bike\'s gone. Frank comes in for milk and looks at the door every time it opens.', 'ما فيه خبر من ليو. دراجته راحت. وفرانك يجي ياخذ حليب ويطالع الباب كل مرة ينفتح.') });
        return out; } }
    );
  }
  /* things to talk about (daily life and jobs) */
  GAME.TOPICS.sami.push(
    { id: 'snack', label: T('Buy a snack ($2)', 'تشتري شي ياكل (٢$)'), need: s => s.money >= 2, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(2); feed(30); return [{ c: 'sami', e: 'smile', t: fresh('snack', [T('Sandwich. Cheese. The cheese is optimistic.', 'سندويشة جبن. الجبن متفائل.'), T('Banana and crisps. A balanced meal, if you\'re a pirate.', 'موز وشيبس. وجبة متوازنة، إذا كنت قرصان.'), T('Yesterday\'s bread, today\'s price. Joking. It\'s half price.', 'خبز أمس بسعر اليوم. أمزح. بنص السعر.')]) }]; } },
    { id: 'rod', label: T('Buy a fishing rod ($5)', 'تشتري سنارة (٥$)'), if: s => !has('rod'), need: s => s.money >= 5, why: T('Not enough money.', 'ما معك فلوس كفاية.'), run: s => { pay(5); give('rod'); return [{ c: 'sami', e: 'smile', t: T('My uncle\'s. He swore it caught a shark once. It did not.', 'حق عمي. حلف إنه صاد فيها قرش مرة. ما صاد.') }]; } }
  );
  /* how Sami looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.sami = { sex: 'm', skin: '#bf8253', hair: '#1d1715', eye: '#3a2618', brow: '#1d1715', hairStyle: 'fade', beard: 'short', age: 29, sw: 104, ww: 80, hw: 82, pose: ['hip', 'down'], fit: { top: 'tee', c1: '#f5f1e8', bottom: 'jeans', b: '#3c5a86', apron: '#2f9a66', pen: true } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.sami.height = 0.9;
})();
