/* =====================================================================
   The town talks about the other houses.
   When you "Chat for a bit", people sometimes tell you about someone
   else's story: in Elias's chapter, about the white house on Cliff Road,
   the boy in the boathouse and the Grand; in Leo's, about Margaret and
   the lighthouse; in Margaret's, about the lighthouse and Victor; and so
   on. Small pieces, so that when a door finally opens, you already know
   a little about who is behind it. Nobody gives away a secret the story
   keeps for later (who drove that night, who "V." is, what is in the
   attic at 3:07).
   Only small-talk lines; nothing here changes any flag, quest or ending.
   ===================================================================== */
'use strict';
(function () {
  const c1 = s => s.host === 'elias' && !s.f.ended;
  const c2 = s => !!s.f.metLeo && !s.f.leoEnded;
  const cM = s => s.host === 'margaret';
  const cE = s => s.host === 'evelyn';
  const cV = s => s.host === 'victor';
  const notMet = id => s => !(s.met && s.met[id]);
  const and = (...f) => s => f.every(g => g(s));
  const say = (who, when, e, en, ar) => { const c = GAME.CHAR[who]; if (c && Array.isArray(c.chat)) c.chat.unshift({ if: when, e, t: T(en, ar) }); };

  /* ---------- in Elias's chapter: the houses you haven't knocked on yet ---------- */
  say('sami', and(c1, notMet('margaret')), 'neutral', 'Mrs Hart, up on Cliff Road, orders food for three. Every week, for two years. I stopped asking. I just pack it.', 'مسز هارت، فوق في شارع الجرف، تطلب أكل لثلاثة. كل أسبوع، من سنتين. وقفت أسأل. بس أجهّزه.');
  say('gregor', and(c1, notMet('margaret')), 'sad', 'There\'s a woman comes up here every afternoon with a sandwich cut into triangles. Puts it on her boy\'s grave. Daniel liked triangles, apparently. The gulls do too.', 'فيه امرأة تجي هنا كل عصر ومعها سندويشة مقطعة مثلثات. تحطها على قبر ولدها. دانيال كان يحب المثلثات، على ما يبدو. والنوارس بعد.');
  say('marco', c1, 'sad', 'The Hart boy played my open mic once. Daniel. Terrible voice. His mum clapped like it was the Albert Hall. She hasn\'t been in since the accident.', 'ولد هارت غنى عندي في الميكروفون المفتوح مرة. دانيال. صوته فظيع. وأمه صفقت كأنه أكبر مسرح بالعالم. وما دخلت المقهى من بعد الحادث.');
  say('ingrid', c1, 'sad', 'Margaret Hart sang alto in the church choir for twenty years. Lovely low voice. Two years ago she stopped singing. She still plays the organ on Sundays. Plays it like she\'s angry at it. Nobody had the heart to ask.', 'مارغريت هارت غنّت ألتو في كورال الكنيسة عشرين سنة. صوت واطي حلو. قبل سنتين وقفت تغني. لسا تعزف الأورغ كل أحد، تعزفه كأنها زعلانة منه. ومحد طاوعه قلبه يسألها.');
  say('kai', and(c1, notMet('leo')), 'smile', 'The kid in the boathouse, Leo? He paints gulls on the harbour wall at night. Rex pretends he doesn\'t know who. Everyone knows who.', 'الولد اللي في بيت القوارب، ليو؟ يرسم نوارس على سور الميناء بالليل. ريكس يسوي نفسه ما يدري مين. والكل يدري مين.');
  say('olivia', c1, 'angry', 'The Grand wants the whole of Fisher\'s Row. Number 9 went last month. They send Elias letters every week. He uses them to light the stove.', 'الفندق يبي شارع الصيادين كله. رقم ٩ راح الشهر اللي فات. ويرسلون لإلياس رسايل كل أسبوع. ويولّع فيها الدفاية.');
  say('stella', c1, 'neutral', 'Mr Grand sends flowers to every house on Fisher\'s Row at Christmas. Big, expensive ones. Nobody puts them in water.', 'مستر غراند يرسل ورد لكل بيت في شارع الصيادين بالكريسماس. باقات كبيرة وغالية. ومحد يحطها في موية.');

  /* ---------- in Leo's chapter ---------- */
  say('rex', c2, 'sad', 'Two years ago I worked a crash on the coast road. Wet night, a bend you can\'t see round. I still drive it slower than I need to.', 'قبل سنتين اشتغلت على حادث في طريق الساحل. ليلة مطر، ومنعطف ما تشوف وراه. لليوم أسوقه أبطأ من اللازم.');
  say('sami', c2, 'smile', 'The lighthouse woman buys forty tins of sardines a month. Not for her. She\'s got gulls with names. One of them has a favourite brand.', 'مرة المنارة تشتري أربعين علبة سردين بالشهر. مو لها. عندها نوارس بأسامي. وواحد منهم عنده نوع مفضل.');
  say('gregor', c2, 'neutral', 'There\'s a little stone up the back from 1958. A boy of nine. My father dug that one. Said the lighthouse keeper came every Sunday after, until he died, and never once said why.', 'فيه حجر صغير ورا من سنة ١٩٥٨. ولد عمره تسع. أبوي اللي حفره. يقول حارس المنارة صار يجي كل أحد بعدها، لين مات، وعمره ما قال ليش.');
  say('marco', c2, 'neutral', 'Margaret Hart walked past the window yesterday. Stopped. Looked in at the stage for a long time. Then she went home.', 'مارغريت هارت مرت من قدام الشباك أمس. وقفت. طالعت المسرح وقت طويل. وبعدين رجعت بيتها.');

  /* ---------- in Margaret's chapter ---------- */
  say('kai', cM, 'shock', 'Me and Olivia sat under the lighthouse at three in the morning once, for a dare. Something laughed. A kid. We ran. Olivia says it was a gull. Gulls don\'t giggle.', 'أنا وأوليفيا جلسنا تحت المنارة الساعة ثلاث الفجر مرة، تحدي. شي ضحك. طفل. هربنا. أوليفيا تقول نورس. النوارس ما تضحك كذا.');
  say('olivia', cM, 'angry', 'I saw the map on Victor\'s office wall when I delivered the petition. Every house he wants has a red circle. Cliff Road, number 7, has two.', 'شفت الخريطة على جدار مكتب فيكتور لما سلّمت العريضة. كل بيت يبيه عليه دائرة حمرا. شارع الجرف رقم ٧ عليه دائرتين.');
  say('stella', cM, 'smile', 'Margaret bought white lilies every Sunday for years. Then nothing, for two years. Then this week, one yellow rose. I nearly cried into the till.', 'مارغريت كانت تشتري زنابق بيضا كل أحد لسنين. وبعدين ولا شي، سنتين. وبعدين هالأسبوع، وردة صفرا وحدة. كنت بصيح على الكاشير.');

  /* ---------- with the lighthouse, or at the Grand ---------- */
  say('sami', cV, 'sad', 'That suite Victor gave you? Three people had it before you. Every one of them left town owing him something. Be careful what you say yes to.', 'الجناح اللي عطاك إياه فيكتور؟ ثلاث ناس سكنوه قبلك. وكل واحد منهم طلع من البلدة وعليه له شي. {انتبه|انتبهي} وش {توافق|توافقين} عليه.');
  say('ingrid', cE, 'smile', 'Evelyn came to the café once, years ago, at closing time. Ordered tea, didn\'t drink it, asked me what time it was four times. Then she left before three.', 'إيفلين جت المقهى مرة، من سنين، وقت التسكير. طلبت شاي وما شربته، وسألتني كم الساعة أربع مرات. وطلعت قبل الثلاث.');
  say('maya', cE, 'neutral', 'The lighthouse lamp hasn\'t been needed since the GPS. She keeps it lit anyway. Every night. Some of us are glad she does.', 'فانوس المنارة ما عاد له حاجة من جا الـGPS. وهي تولّعه على كل حال. كل ليلة. وبعضنا مبسوط إنها تسوي كذا.');
})();
