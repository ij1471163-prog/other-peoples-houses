/* =====================================================================
   Nell Farrow, when she was alive.
   Once you have seen her on the pier, the people who knew her in 1981
   can tell you who she was, a piece each:
     · Martha: her best friend at school. Nell saved her bus fare to
       London in a jam jar, to sing. The jar is still on Martha's shelf.
     · Ingrid: they sang together on Thursdays at the café, when it was
       still Marco's nonna's. Nell's song was "Light on the Water".
     · Gregor: Joe Farrow carved her name into a pier board the week
       after, because there was no body to put a name over.
   Her traces in town: the carved board at the end of the pier, an old
   photo in the café of a girl in a yellow oilskin at the microphone,
   Marco humming his nonna's song without knowing whose it was.
   And at the end, when she goes: you hear her sing it, once.
   Only its own flags (nl*). Nothing here reads or changes trust,
   suspicion or any ending, and the mystery's own steps are untouched.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const C = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const seen = s => !!s.f.nellSeen;
  const knew = s => ['nlMartha', 'nlIngrid', 'nlGregor'].filter(k => s.f[k]).length;
  const topic = (id, t) => { GAME.TOPICS[id] = GAME.TOPICS[id] || []; GAME.TOPICS[id].push(t); };
  const push = (loc, spot) => { if (GAME.LOC[loc]) GAME.LOC[loc].spots.push(spot); };
  const SONG = T('Light on the Water', 'ضو على الموية');

  /* ---------- the people who knew her ---------- */
  topic('martha', { id: 'nlNell', once: true, label: T('"Did you know a girl called Nell Farrow?"', '«كنتي تعرفين بنت اسمها نيل فارو؟»'), if: seen, run: [
    C('martha', 'shock', 'Nell? Now there\'s a name nobody\'s said in this kitchen for... where did you hear that?', 'نيل؟ هذا اسم محد قاله في هالمطبخ من... وين {سمعته|سمعتيه}؟'),
    C('martha', 'sad', 'We sat together at school. She was the loud one, I was the one who got told off for her. She was going to London to sing. Not "wanted to". Was going.', 'كنا نجلس جنب بعض في المدرسة. هي الصوت العالي، وأنا اللي تنهزأ عشانها. كانت بتروح لندن تغني. مو «تبي». بتروح.'),
    C('martha', 'neutral', 'She kept her bus fare in a jam jar. Coins, mostly. Eleven dollars and forty cents, the last time we counted it, on her bed, the week before.', 'كانت تجمع أجرة الباص في مرطبان مربى. فكة، أغلبها. إحدعش دولار وأربعين سنت، آخر مرة عدّيناها، على سريرها، الأسبوع اللي قبل.'),
    C('martha', 'sad', 'Joe gave me the jar after. He couldn\'t look at it. It\'s still on my shelf. I\'ve never spent a cent of it.', 'جو عطاني المرطبان بعدين. ما كان يقدر يطالعه. لسا على رفي. عمري ما صرفت منه ولا سنت.'),
    st => { st.f.nlMartha = true; return null; }
  ] });
  topic('ingrid', { id: 'nlNell', once: true, label: T('Ask Ingrid about Nell Farrow', '{اسأل|اسألي} إنغريد عن نيل فارو'), if: seen, run: [
    C('ingrid', 'sad', 'Nell. Oh, Nell. Before Marco, before his nonna\'s knees went, Thursdays were ours. Me, Henrik on the piano, and a girl in her father\'s yellow oilskin who sang like she was angry at the roof for being there.', 'نيل. آه يا نيل. قبل ماركو، قبل لا تتعب ركب جدته، الخميس كان حقنا. أنا، وهنريك على البيانو، وبنت لابسة كوت أبوها الأصفر تغني كأنها زعلانة على السقف إنه موجود.'),
    C('ingrid', 'smile', 'She wrote one song. "Light on the Water". About a girl on the shore with a lantern, waiting for a boat. Everyone in the café knew the words by the end of the summer.', 'كتبت أغنية وحدة. «ضو على الموية». عن بنت على الشط معها فانوس، تنتظر قارب. الكل في المقهى حفظ كلماتها لين آخر الصيف.'),
    C('ingrid', 'sad', 'After, nobody could sing it. It felt like stealing. So it just... stopped. Forty-three years. I don\'t know if anyone alive still remembers how it goes.', 'وبعدين، محد قدر يغنيها. كأنها سرقة. فوقفت... كذا. ثلاثة وأربعين سنة. ما أدري إذا فيه أحد عايش لسا يتذكر كيف تمشي.'),
    st => { st.f.nlIngrid = true; return null; }
  ] });
  topic('gregor', { id: 'nlNell', once: true, label: T('"Who was Nell Farrow?"', '«مين كانت نيل فارو؟»'), if: seen, run: [
    C('gregor', 'neutral', 'Joe Farrow\'s girl. I dug the hole for that stone myself, and put nothing in it. The sea kept her. You know what that does to a father.', 'بنت جو فارو. أنا حفرت الحفرة حقت ذاك الحجر بنفسي، وما حطيت فيها شي. البحر خذاها. {تدري|تدرين} وش يسوي هذا بالأب.'),
    C('gregor', 'sad', 'The week after, Joe took his knife to the end of the pier and carved her name into the last board. Took him all night. He said a stone was for people who were somewhere. She was out there.', 'الأسبوع اللي بعده، جو خذ سكينته لآخر الرصيف وحفر اسمها في آخر خشبة. خذ منه الليل كله. قال الحجر للناس اللي موجودين في مكان. وهي هناك برا.'),
    C('gregor', 'neutral', 'They\'ve replaced every board on that pier twice since. Not that one. Nobody\'s ever said why. Nobody needs to.', 'غيّروا كل خشب الرصيف مرتين من وقتها. إلا ذيك. ومحد قال ليش. ومحد يحتاج يقول.'),
    st => { st.f.nlGregor = true; return null; }
  ] });

  /* ---------- her traces in town ---------- */
  push('harbor', { x: 84, y: 74, label: T('The last board of the pier', 'آخر خشبة في الرصيف'), if: s => seen(s), run: s => [
    N1('The last board is darker and older than the rest, worn smooth by forty-three winters. Cut deep into it, in letters a man made with a fishing knife:', 'آخر خشبة أغمق وأقدم من الباقي، صارت ناعمة من ثلاثة وأربعين شتا. محفور فيها بعمق، بحروف سواها رجّال بسكين صيد:'),
    { mini: 'paper', kind: 'letter', body: T('NELL · 1962–1981 · KEEP SINGING, GIRL', 'نيل · ١٩٦٢–١٩٨١ · كملي غناك يا بنت') },
    st => (st.f.nellRest ? [N1('Someone has pressed a small flower into the crack beside the letters. It is fresh.', 'أحد حاط وردة صغيرة في الشق اللي جنب الحروف. جديدة.')] : null),
    st => { st.f.nlBoard = true; return null; }
  ] });
  push('cafe', { x: 18, y: 30, label: T('An old photo by the door', 'صورة قديمة جنب الباب'), if: s => s.f.nlIngrid || s.f.nlMartha, run: s => [
    N1('Behind the coat hooks, a photo gone orange with age: the café, years ago, full and smoky. A woman at the piano; a younger, laughing Ingrid; and at the microphone a girl in a yellow oilskin far too big for her, mid-note, eyes shut.', 'ورا علاقات الكوتات، صورة صارت برتقالية من القدم: المقهى، من سنين، مليان ودخان. امرأة على البيانو؛ وإنغريد أصغر وتضحك؛ وعند الميكروفون بنت لابسة كوت أصفر كبير عليها مرة، بنص نغمة، ومغمضة عيونها.'),
    N1('On the frame, in ballpoint: "Thursday, July 1980".', 'على الإطار، بالقلم: «خميس، يوليو ١٩٨٠».'),
    st => { st.f.nlPhoto = true; return null; }
  ] });
  /* Marco hums it, and doesn't know */
  const chat = (who, line) => { const c = GAME.CHAR[who]; if (c) { c.chat = c.chat || []; c.chat.unshift(line); } };
  chat('marco', { if: s => !!s.f.nlIngrid, e: 'smile', t: T('(humming) ...light on the water, light on the water... Hm? Oh, it\'s a thing my nonna used to sing while she cleaned. No idea where it\'s from. Why are you looking at me like that?', '(يدندن) ...ضو على الموية، ضو على الموية... هاه؟ آه، شي كانت جدتي تغنيه وهي تنظف. ما أدري من وين. ليش {تطالعني|تطالعيني} كذا؟') });
  chat('ingrid', { if: s => !!s.f.nellRest && !!s.f.nlIngrid, e: 'smile', t: T('I sang it last night. Nell\'s song. Just to the kitchen. I got all the way to the end. I didn\'t think I still knew it.', 'غنيتها البارحة. أغنية نيل. للمطبخ بس. وصلت لين آخرها. ما كنت أحسب إني لسا أعرفها.') });
  chat('martha', { if: s => !!s.f.nellRest && !!s.f.nlMartha, e: 'sad', t: T('I took the jam jar down this morning. Eleven dollars forty. I think I\'ll buy a ticket to London with it. Not to go. Just to have it.', 'نزّلت المرطبان الصبح. إحدعش دولار وأربعين. أحس بشتري فيه تذكرة لندن. مو عشان أروح. بس عشان تكون عندي.') });

  /* ---------- at the end: she sings ---------- */
  const SC = GAME.NELL_SC || {}, lantern0 = SC.lantern;
  if (lantern0) SC.lantern = s => {
    const steps = lantern0(s), i = steps.findIndex(st => st && st.n && /walks out into the fog/.test(st.n.en));
    if (i < 0 || !knew(s)) return steps;
    steps.splice(i + 1, 0,
      N1('From somewhere out in the fog, very faint, a girl\'s voice. Singing.', 'من مكان ما في الضباب، خفيف مرة، صوت بنت. تغني.'),
      { mini: 'paper', kind: 'letter', body: T('...light on the water, light on the water,\nhold it up high so he knows where to steer.\nLight on the water, I\'m still on the water,\nI\'ll keep it burning till somebody\'s here.', '...ضو على الموية، ضو على الموية،\nارفعه عالي عشان يعرف وين يجي.\nضو على الموية، أنا لسا على الموية،\nبخليه مولّع لين أحد يجي.') },
      N1('Somebody was here. The song ends, for the first time in forty-three years, on the last line.', 'وأحد جا. الأغنية تخلص، لأول مرة من ثلاثة وأربعين سنة، على آخر سطر.'),
      st => { st.f.nlSang = true; return null; });
    return steps;
  };
})();
