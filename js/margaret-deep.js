/* =====================================================================
   Margaret, deeper: what frightens you, why she does it, and who she is
   when she isn't with you.
     · Quiet horror in her house, one at a time, over the days:
       your hair parted like his in the mirror; a new pencil line on his
       door frame, at your height, dated today; photos of you asleep at
       the back of his album; his voicemail, then one night your voice;
       your name on the third plate, then crossed out.
     · The reasons, found bit by bit, from the house and the people:
       Daniel's note on the fridge ("Back by ten. Don't be mad.") is why
       she asks where you were and stopped the clock at seven; the front
       door she heard close softly that night is why she locks it three
       times; the headlights coming up Cliff Road are why the curtains
       stay shut. Nora and Martha each tell you a piece.
     · Her own life: the organ at St Brigid's on Sunday mornings, the
       crossword with Martha on Thursdays, letters to the council about
       the road, with Olivia's help.
   Only its own flags (md*). Scenes, a little trust for kindness (as her
   other scenes do), nothing else. No ending or its conditions change.
   ===================================================================== */
'use strict';
(function () {
  const M = (e, en, ar) => ({ c: 'margaret', e, t: T(en, ar) });
  const C = (c, e, en, ar) => ({ c, e, t: T(en, ar) });
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const inM = s => s.host === 'margaret';
  const dM = s => s.day - (s.f.margDay || 0);
  const home = s => inM(s) && houseOf(s.loc) === 'margaret';
  const kind = (s, k) => { if (!s.f['mdK_' + k]) { s.f['mdK_' + k] = true; addTrust('margaret', 1); } };
  const knew = s => ['mdNote', 'mdDoor', 'mdLights', 'mdSeven'].filter(k => s.f[k]).length;
  const push = (loc, spot) => { if (GAME.LOC[loc]) GAME.LOC[loc].spots.push(spot); };
  const topic = (id, t) => { GAME.TOPICS[id] = GAME.TOPICS[id] || []; GAME.TOPICS[id].push(t); };

  /* a full-screen picture for a moment that matters; tap to go on */
  GAME.MINI.cg = function (panel, done, st) {
    panel.innerHTML = '';
    const box = el('div', 'cp md-cg'); box.innerHTML = `<i style="background-image:url(${st.src})"></i><img src="${st.src}" alt="">`;
    if (st.h) { const im = box.querySelector('img'); im.style.height = st.h + '%'; im.style.marginBottom = '0'; }
    if (st.cap) box.appendChild(el('p', '', tx(st.cap)));
    $('stage').appendChild(box); $('stage').classList.add('cg-on'); requestAnimationFrame(() => box.classList.add('on'));
    const alt = el('button', 'opt main cp-alt', tx(T('Go on', '{كمل|كملي}'))); alt.type = 'button'; panel.appendChild(alt);
    let over = false; const fin = ev => { if (ev) ev.stopPropagation(); if (over) return; over = true; alt.remove(); box.classList.add('out'); $('stage').classList.remove('cg-on'); setTimeout(() => box.remove(), 400); done(1); };
    setTimeout(() => box.addEventListener('click', fin), 700); alt.onclick = fin;
  };

  /* ---------- 1. the quiet horror, one a day at most ---------- */
  const H = [
    { id: 'mirror', when: s => dM(s) >= 1 && s.slot === 0 && (s.loc === 'marg_guest' || s.loc === 'marg_bath'), run: s => [
      N1('You wash your face and look up. In the mirror your hair is parted on the left, combed flat, neat as a school photo.', '{تغسل|تغسلين} وجهك {وترفع|وترفعين} راسك. في المراية شعرك مفروق على اليسار، ممشط ومرتب، مثل صورة مدرسة.'),
      N1('You have never parted your hair on the left in your life. The boy over the fireplace does.', 'عمرك ما فرقت شعرك على اليسار. الولد اللي فوق المدفأة يفرقه كذا.'),
      N1('On the edge of the sink: a comb you have never seen, with one grey hair in it, and one of yours.', 'على طرف المغسلة: مشط عمرك ما {شفته|شفتيه}، فيه شعرة رمادية وحدة، وشعرة منك.'),
      st => { st.f.mdMirror = true; return null; }] },
    { id: 'heights', when: s => dM(s) >= 2 && s.slot >= 2 && s.slot <= 3 && s.loc === 'marg_living', run: s => [
      N1('On the frame of Daniel\'s door, on the landing, pencil lines climb the paint: D. 4. D. 7. D. 11 (stood on tiptoe, still counts). D. 16.', 'على إطار باب دانيال، فوق الدرج، خطوط رصاص تطلع على الدهان: د. ٤. د. ٧. د. ١١ (على أطراف أصابعه، تنحسب). د. ١٦.'),
      N1('Above the last one, a new line. Fresh pencil, still shiny. Exactly your height. Next to it, in her careful hand, today\'s date.', 'وفوق آخر واحد، خط جديد. رصاص جديد، لسا يلمع. بطولك بالضبط. وجنبه، بخطها المرتب، تاريخ اليوم.'),
      N1('You don\'t remember standing against that door.', 'ما {تتذكر|تتذكرين} إنك {وقفت|وقفتي} على هالباب.'),
      st => { st.f.mdHeights = true; return null; }] },
    { id: 'album', when: s => dM(s) >= 2 && s.slot <= 2 && s.loc === 'marg_living' && GAME.CHAR.margaret.where(s) !== 'marg_living', run: s => [
      N1('A photo album lies open on the sofa. Daniel in a paddling pool. Daniel with no front teeth. Daniel at fifteen, pretending not to know the camera is there.', 'ألبوم صور مفتوح على الكنبة. دانيال في مسبح أطفال. دانيال بدون سنونه اللي قدام. دانيال وعمره خمسطعش، يسوي نفسه ما يدري عن الكاميرا.'),
      { menu: [
        { t: T('Keep turning the pages', '{كمل|كملي} تقليب الصفحات'), then: [
          N1('The last two pages are new. The photos are of a bed, in a dim room, taken from the doorway. Someone asleep under the blanket, one arm hanging down.', 'آخر صفحتين جديدة. الصور لسرير، في غرفة معتمة، متصورة من الباب. أحد نايم تحت البطانية، ويده متدلية.'),
          N1('It\'s you. Seven nights. Seven photos. Under each one, in pencil: "Home."', '{هذا أنت|هذي أنتِ}. سبع ليالي. سبع صور. وتحت كل وحدة، بالرصاص: «في البيت.»'),
          st => { st.f.mdAlbum = true; return null; }] },
        { t: T('Close it', '{سكّره|سكّريه}'), then: [N1('You close it. Later the album is gone, and the sofa cushion has been plumped as if no one ever sat there.', '{تسكّره|تسكّرينه}. وبعدين الألبوم يختفي، ومخدة الكنبة متعدلة كأن محد جلس عليها.')] }
      ] }] },
    { id: 'voice1', when: s => dM(s) >= 1 && s.slot === NIGHT && home(s), run: s => [
      N1('Late. Through the wall: the beep of a phone, and then a boy\'s voice, tinny, cheerful. "Hiya, it\'s Dan, I can\'t get to the phone, leave a message, or don\'t, I\'m not your boss."', 'متأخر. من ورا الجدار: صوت تيت جوال، وبعدين صوت ولد، رفيع ومبسوط. «هلا، هذا دان، ما أقدر أرد، اترك رسالة، أو لا، مو أنا مديرك.»'),
      N1('Beep. A pause. Then again from the start. Then again. You count eleven times before you fall asleep.', 'تيت. سكتة. وبعدين مرة ثانية من البداية. ومرة ثانية. {تعد|تعدين} إحدعش مرة قبل لا {تنام|تنامين}.'),
      st => { st.f.mdVoice = st.day; return null; }] },
    { id: 'voice2', when: s => !!s.f.mdVoice && s.day - s.f.mdVoice >= 2 && s.slot === NIGHT && home(s), run: s => [
      N1('The beep again, through the wall. You wait for the boy\'s voice.', 'التيت مرة ثانية، من ورا الجدار. {تنتظر|تنتظرين} صوت الولد.'),
      N1('"...yeah, I\'m fine, I\'m home, don\'t worry."', '«...إيه، أنا بخير، أنا في البيت، لا {تشيل|تشيلين} هم.»'),
      N1('It\'s your voice. Something you said on the phone in the kitchen, days ago. Recorded. Cut so it starts in the middle. Beep. Again. "...I\'m fine, I\'m home."', 'هذا صوتك. شي {قلته|قلتيه} في التلفون في المطبخ، قبل أيام. متسجل. ومقصوص عشان يبدأ من النص. تيت. مرة ثانية. «...أنا بخير، أنا في البيت.»'),
      { menu: [
        { t: T('Knock on her wall, softly', '{دق|دقي} على جدارها، بشويش'), then: [N1('The playing stops. A long silence. Then, very quietly, from the other side, she knocks back. Twice. Then the house is silent until morning.', 'التشغيل يوقف. سكوت طويل. وبعدين، بهدوء مرة، من الجهة الثانية، تدق هي. مرتين. وبعدها البيت ساكت لين الصبح.'), st => { kind(st, 'voice'); return null; }] },
        { t: T('Put the pillow over your head', '{حط|حطي} المخدة على راسك'), then: [N1('Through the pillow, faintly, all night: "...I\'m fine, I\'m home."', 'من ورا المخدة، خفيف، طول الليل: «...أنا بخير، أنا في البيت.»'), st => { addMood(-1); return null; }] }
      ] },
      st => { st.f.mdVoice2 = true; return null; }] },
    { id: 'plate', when: s => dM(s) >= 2 && s.slot === 3 && s.loc === 'marg_kitchen', run: s => [
      N1('The third plate tonight has a name on it, written in icing on a slice of cake the way you\'d do for a birthday. Your name.', 'الصحن الثالث الليلة عليه اسم، مكتوب بالكريمة على قطعة كيك مثل ما تسوي لعيد ميلاد. اسمك.'),
      M('smile', 'Sit, sit. That one\'s yours now. Somebody should have it.', '{اجلس|اجلسي}، {اجلس|اجلسي}. هذا حقك الحين. لازم أحد ياخذه.'),
      st => { st.f.mdPlate = st.day; return null; }] },
    { id: 'plate2', when: s => !!s.f.mdPlate && s.day - s.f.mdPlate >= 2 && s.slot === 3 && s.loc === 'marg_kitchen', run: s => [
      N1('The third plate again, with a slice of cake. Your name in icing, and a knife line through it. Above it, squeezed in, in a smaller, shakier hand: DANNY.', 'الصحن الثالث مرة ثانية، وعليه قطعة كيك. اسمك بالكريمة، وعليه خط سكين. وفوقه، محشور، بخط أصغر ومرتجف: داني.'),
      { show: [{ id: 'margaret', e: 'blank' }] },
      M('blank', 'Eat up, love. It\'s your favourite.', '{كل|كلي} يا عمري. هذي المفضلة عندك.'),
      { menu: [
        { t: T('"My name is {name}, Margaret."', '«اسمي {name} يا مارغريت.»'), then: [{ show: [{ id: 'margaret', e: 'worry' }] }, M('worry', 'I know. I know. I\'m sorry. I don\'t know who did that.', 'أدري. أدري. آسفة. ما أدري مين سوا كذا.'), st => { kind(st, 'plate'); return null; }] },
        { t: T('Eat the cake', '{كل|كلي} الكيك'), then: [N1('It\'s lemon. You hate lemon. You eat all of it, and she watches every bite, smiling.', 'ليمون. {تكره|تكرهين} الليمون. {تاكله|تاكلينه} كله، وهي تطالع كل لقمة، وتبتسم.'), st => { addMood(-1); return null; }] }
      ] }, { show: null }] }
  ];
  GAME.EVENTS.push({ id: 'mdHorror', when: s => {
    if (!inM(s) || RUN || s.f.mFinaleDone || !home(s) || s.f.mdDay === s.day) return false;
    if (s.f.mcDay === s.day + ':' + s.slot) return false;
    const e = H.find(x => !s.f['mdH_' + x.id] && x.when(s)); if (!e) return false;
    s.f.mdPick = e.id; return true;
  }, run: s => { const e = H.find(x => x.id === s.f.mdPick); s.f['mdH_' + e.id] = true; s.f.mdDay = s.day; return e.run(s); } });

  /* ---------- 2. the reasons ---------- */
  /* the note on the fridge, under the shopping lists */
  push('marg_kitchen', { x: 82, y: 32, label: T('Behind the fridge notes', 'ورا أوراق الثلاجة'), if: s => inM(s) && !s.f.mdNote, run: s => [
    N1('Under the shopping lists, held by a magnet shaped like a lighthouse, a note that has been folded and unfolded so many times it is soft as cloth.', 'تحت أوراق المقاضي، ماسكها مغناطيس على شكل منارة، ورقة انطوت وانفتحت مرات كثيرة لين صارت ناعمة مثل القماش.'),
    { mini: 'paper', kind: 'letter', body: T('Mum. Gone to the gig with Leo. I KNOW it\'s a school night. Back by ten. Don\'t be mad. Love you. D.', 'ماما. رحت الحفلة مع ليو. أدري إنه بكرة مدرسة. برجع الساعة عشر. لا تزعلين. أحبك. د.') },
    N1('In the corner, in her handwriting, very small: "7.00. Found this when I called him down for dinner."', 'في الزاوية، بخطها، صغير مرة: «٧:٠٠. لقيتها لما ناديته ينزل للعشا.»'),
    N1('Seven o\'clock. The clock in the sitting room. Dinner at seven, every night. "Where were you?" Back by ten.', 'الساعة سبعة. الساعة اللي في الصالة. العشا الساعة سبعة، كل ليلة. «وين كنت؟» برجع الساعة عشر.'),
    st => { st.f.mdNote = true; st.f.mdSeven = true; return null; }] });
  /* the headlights */
  push('marg_living', { x: 46, y: 52, label: T('A gap in the curtain', 'فتحة في الستارة'), if: s => inM(s) && s.slot >= 3 && !s.f.mdLights, run: s => [
    N1('Through the gap: the dark, and the long curve of Cliff Road coming up from town. A car turns onto it. Its headlights sweep up the hill towards the house.', 'من الفتحة: الظلام، ومنحنى شارع الجرف الطويل طالع من البلدة. سيارة تلف عليه. وأنوارها تطلع التلة جاية للبيت.'),
    { show: [{ id: 'margaret', e: 'worry' }] },
    M('worry', 'Don\'t. Please. Close it.', 'لا. {تكفى|تكفين}. {سكّرها|سكّريها}.'),
    N1('She is behind you. She isn\'t looking at the window. She is looking at the floor.', 'هي وراك. ما تطالع الشباك. تطالع الأرض.'),
    M('sad', 'That night I watched headlights come up that road for four hours. Every one of them was him. Then at eleven one of them was the police.', 'هذيك الليلة طالعت أنوار السيارات وهي تطلع هالطريق أربع ساعات. وكل وحدة فيها كانت هو. وبعدين الساعة إحدعش وحدة منها كانت الشرطة.'),
    M('sad', 'I can\'t look at headlights coming up the hill. That\'s all the curtains are. It\'s not mad. It\'s just that.', 'ما أقدر أطالع أنوار طالعة التلة. هذا كل سالفة الستاير. مو جنون. بس كذا.'),
    { menu: [
      { t: T('Close the curtain, and stay with her', '{سكّر|سكّري} الستارة، {واقعد|واقعدي} معها'), then: [N1('You close it. She lets out a breath she has been holding since you came in, and sits down, and so do you.', '{تسكّرها|تسكّرينها}. وتطلع نفَس كانت ماسكته من دخلت، وتجلس، {وتجلس|وتجلسين} معها.'), st => kind(st, 'lights')] },
      { t: T('"They\'re just cars, Margaret."', '«بس سيارات يا مارغريت.»'), then: [M('sad', 'I know. I know they are.', 'أدري. أدري إنها كذا.')] }
    ] },
    { show: null }, st => { st.f.mdLights = true; return null; }] });
  /* Nora: why she locks the door three times */
  topic('nora', { id: 'mdLocks', once: true, label: T('"Why does she lock the door three times?"', '«ليش تقفل الباب ثلاث مرات؟»'), if: s => inM(s) && ((s.f.mcI || 0) >= 2 || !!s.f.mdNote), run: s => [
    C('nora', 'sad', 'Because she heard it. The front door, that night. Closing very softly, the way you close a door when you don\'t want your mum to hear.', 'لأنها سمعته. الباب الأمامي، هذيك الليلة. يتسكر بهدوء مرة، مثل ما تسكر الباب لما ما تبي أمك تسمع.'),
    C('nora', 'sad', 'She was upstairs. She heard it, and she thought: he\'s nearly eighteen, let him go. She didn\'t go down. She didn\'t lock it.', 'كانت فوق. سمعته، وقالت في نفسها: قرب عمره ثمنطعش، خليه يروح. ما نزلت. وما قفلته.'),
    C('nora', 'neutral', 'So now she locks it three times. Once for every time she should have gone down the stairs.', 'فالحين تقفله ثلاث مرات. مرة عن كل مرة كان لازم تنزل فيها الدرج.'),
    st => { st.f.mdDoor = true; return null; }] });
  /* Martha, on Thursdays: who Margaret was, and who she still is for an hour */
  GAME.EVENTS.push({ id: 'mdMartha', once: true, when: s => inM(s) && !RUN && weekday(s.day) === 4 && s.slot === 2 && s.loc === 'marg_kitchen' && dM(s) >= 1, run: s => [
    { show: [{ id: 'martha', e: 'smile' }, { id: 'margaret', e: 'smile' }] },
    N1('Thursday. Martha and Margaret at the kitchen table with the newspaper folded to the crossword and a pot of tea between them, arguing.', 'الخميس. مارثا ومارغريت على طاولة المطبخ والجريدة مطوية على الكلمات المتقاطعة وإبريق شاي بينهم، ويتهاوشون.'),
    C('martha', 'smile', 'Seven letters, "a feeling of great happiness." It\'s ELATION.', 'سبع حروف، «شعور بفرح كبير.» بهجة.'),
    M('smile', 'It\'s RAPTURE, Martha, it\'s always rapture, you say elation every week and it\'s never elation.', 'نشوة يا مارثا، دايم نشوة، كل أسبوع {تقولين|تقولين} بهجة وعمرها ما كانت بهجة.'),
    N1('Margaret laughs. A real laugh, loud, a bit like a seal. You have never heard it before. Martha catches your eye over her glasses, and winks.', 'مارغريت تضحك. ضحكة حقيقية، عالية، شوي مثل الفقمة. عمرك ما {سمعتها|سمعتيها} قبل. ومارثا تطالعك من فوق نظارتها، وتغمز.'),
    C('martha', 'neutral', 'Twenty years we\'ve done this. She missed one Thursday. One. The week after. Then she turned up at my door with the paper and a pen and said "I need something with answers in it."', 'عشرين سنة نسويها. فوتت خميس واحد. واحد بس. الأسبوع اللي بعده. وبعدين جت عند بابي ومعها الجريدة والقلم وقالت «أحتاج شي له أجوبة.»'),
    { menu: [
      { t: T('Pull up a chair and help', '{جيب|جيبي} كرسي {وساعد|وساعدي}'), then: [N1('You get two clues and one wrong. Margaret corrects you in pen, with enormous satisfaction. For an hour, nobody in the kitchen is grieving.', '{تحل|تحلين} سؤالين {وتغلط|وتغلطين} في واحد. مارغريت تصححك بالقلم، وهي مبسوطة مرة. ولمدة ساعة، محد في المطبخ حزين.'), st => { kind(st, 'martha'); addMood(1); return null; }] },
      { t: T('Leave them to it', '{خلهم|خليهم} على راحتهم'), then: [N1('You leave them to it. All the way up the stairs you can hear them arguing about rapture.', '{تخليهم|تخلينهم}. وطول ما أنت {طالع|طالعة} الدرج {تسمعهم|تسمعينهم} يتهاوشون على النشوة.')] }
    ] },
    { show: null }, st => { st.f.mdMarthaSeen = true; return null; }] });
  /* Sunday mornings: the organ at St Brigid's */
  GAME.EVENTS.push({ id: 'mdOrgan', once: true, when: s => !!s.f.metMarg && !RUN && weekday(s.day) === 0 && s.slot === 0 && s.loc === 'cemetery', run: s => [
    N1('Music from the church: the organ, big and warm, a hymn played a little too fast, as if whoever is playing is enjoying themselves.', 'موسيقى من الكنيسة: الأورغ، كبير ودافي، ترنيمة تنعزف أسرع شوي من اللازم، كأن اللي يعزف مستانس.'),
    N1('Through the open door you see who it is. Margaret, at the keyboard, shoulders back, hair pinned up, playing without music, eyes closed. Nobody in the pews but three old men and Gregor.', 'من الباب المفتوح {تشوف|تشوفين} مين. مارغريت، عند الأورغ، ظهرها مستقيم، وشعرها مرفوع، تعزف بدون نوتة، ومغمضة عيونها. وما في المقاعد إلا ثلاث شياب وغريغور.'),
    { show: [{ id: 'gregor', e: 'smile' }] },
    C('gregor', 'smile', 'Every Sunday for twenty-two years. Even that one. She played the Sunday after the funeral and didn\'t miss a note. Then she went home and closed the curtains.', 'كل أحد من اثنين وعشرين سنة. حتى ذاك الأحد. عزفت الأحد اللي بعد الدفن وما فوتت ولا نغمة. وبعدين رجعت البيت وسكّرت الستاير.'),
    C('gregor', 'neutral', 'This is the one hour a week she\'s the person she was. Don\'t tell her you saw. She\'d stop.', 'هذي الساعة الوحيدة بالأسبوع اللي ترجع فيها نفسها. لا {تقول|تقولين} لها إنك {شفتها|شفتيها}. بتوقف.'),
    { show: null }, st => { st.f.mdOrgan = true; addMood(1); return null; }] });
  /* her letters about the road, with Olivia */
  topic('margaret', { id: 'mdRoad', once: true, label: T('Ask about the letters on the hall table', '{تسألها|تسألينها} عن الرسايل اللي على طاولة الممر'), if: s => inM(s) && dM(s) >= 2, run: s => [
    M('neutral', 'Oh. Those. To the council. About the bend on the city road, where it... There should be a barrier. A light. Something.', 'أوه. هذي. للبلدية. عن المنعطف في طريق المدينة، اللي... لازم يكون فيه حاجز. إشارة. أي شي.'),
    M('sad', 'Forty-one letters. They wrote back once. They said they\'d "note my concerns".', 'واحد وأربعين رسالة. ردوا مرة وحدة. قالوا بـ«يسجلون ملاحظاتي».'),
    M('smile', 'The young woman with the petition, Olivia, she helps me now. She says I write too politely. She puts the capitals in.', 'البنت اللي معها العريضة، أوليفيا، تساعدني الحين. تقول إني أكتب بأدب زيادة. وهي تحط الحروف الكبيرة.'),
    st => { st.f.mdRoad = true; return null; }] });
  topic('olivia', { id: 'mdRoad2', once: true, label: T('Ask about Margaret\'s letters', '{تسألها|تسألينها} عن رسايل مارغريت'), if: s => !!s.f.mdRoad, run: [
    C('olivia', 'smile', 'Mrs Hart is the most terrifying letter-writer I\'ve ever met. She cites the Highways Act. From memory.', 'مدام هارت أرعب كاتبة رسايل شفتها في حياتي. تستشهد بقانون الطرق. من راسها.'),
    C('olivia', 'sad', 'She asked me not to put Daniel\'s name in. "It\'s not about him. It\'s about the next one." I\'ve never respected anyone so much.', 'طلبت مني ما أحط اسم دانيال. «مو عنه. عن اللي بعده.» عمري ما احترمت أحد كذا.')
  ] });

  /* when you understand, she can feel it: one quiet scene once you know three of the reasons */
  GAME.EVENTS.push({ id: 'mdUnderstand', once: true, when: s => inM(s) && !RUN && knew(s) >= 3 && s.slot === 3 && home(s) && !s.f.mFinaleDone, run: s => [
    { show: [{ id: 'margaret', e: 'neutral' }] },
    N1('Seven o\'clock. Margaret has laid the table. She looks at you as you sit down, a long, careful look.', 'الساعة سبعة. مارغريت حاطة السفرة. تطالعك وأنت {تجلس|تجلسين}، نظرة طويلة ومتأنية.'),
    M('neutral', 'You know, don\'t you. Nora. Martha. The note. You know why I\'m like this.', '{تدري|تدرين}، صح. نورا. مارثا. الورقة. {تدري|تدرين} ليش أنا كذا.'),
    M('sad', 'And you\'re still here.', '{وأنت|وأنتِ} لسا هنا.'),
    N1('She stands, and comes round the table, and opens her arms.', 'توقف، وتلف حول الطاولة، وتفتح يدينها.'),
    { mini: 'cg', src: 'img/fx/marg_hug1.webp' },
    N1('She doesn\'t say anything else. She serves you first, which she has never done. Then she sits, and for the first time, she eats.', 'ما تقول شي ثاني. تغرف لك أول، وعمرها ما سوتها. وبعدين تجلس، ولأول مرة، تاكل.'),
    st => { kind(st, 'understand'); addMood(1); return null; }] });

  window.__margDeep = { H };
})();
