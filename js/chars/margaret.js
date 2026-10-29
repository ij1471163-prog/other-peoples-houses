/* =====================================================================
   Margaret — 54. Lives in the white house on Cliff Road. Lays the table for three.
   Everything that is Margaret's own: profile, where Margaret is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (margaret.js).
   ===================================================================== */
'use strict';
(function () {
  { const { byDay, inM } = GAME.H.margaret;
    /* who Margaret is and Margaret's daily routine (Margaret's chapter) */
    GAME.CHAR.margaret = {
      name: T('Margaret', 'مارغريت'), role: T('40. Lives in the white house on Cliff Road. Lays the table for three.', '٤٠ سنة. ساكنة في البيت الأبيض بشارع الجرف. تحط السفرة لثلاثة.'), host: true, art: true,
      lesson: T('Margaret: grief isn\'t a room you lock. It\'s a window you open a little at a time.', 'مارغريت: الحزن مو غرفة تقفلها. هو شباك تفتحه شوي شوي.'),
      where: s => {
        if (!inM(s)) return (['MARG_OPEN', 'MARG_LEO'].includes(s.done.margaret) && weekday(s.day) === 0 && s.slot === 1) ? 'cafe' : null;
        if (!s.f.metMarg) return null;
        return [s.day % 2 ? 'marg_bath' : 'marg_kitchen', 'marg_living', s.f.mSick === s.day ? 'marg_bed' : 'cemetery', 'marg_kitchen', s.f.mCurtains ? 'marg_bed' : 'dan_room'][s.slot];
      },
      doing: s => {
        const w = GAME.CHAR.margaret.where(s);
        if (w === 'cafe') return T('Margaret is at the window table, curtains wide open, reading.', 'مارغريت على طاولة الشباك، والستارة مفتوحة على الآخر، تقرا.');
        return ({
          marg_bath: T('The bathroom door is shut.', 'باب الحمام مسكّر.'),
          marg_kitchen: s.slot === 0 ? byDay(s, [T('Margaret is eating toast standing up, looking at the third chair.', 'مارغريت تاكل توست وهي واقفة، وعينها على الكرسي الثالث.'), T('Margaret is making porridge. Enough for three.', 'مارغريت تسوي شوفان. يكفي ثلاثة.')]) : byDay(s, [T('Margaret is cooking. Roast chicken. His favourite, she says, to nobody.', 'مارغريت تطبخ. دجاج بالفرن. أكلته المفضلة، تقول، لولا أحد.'), T('Margaret is stirring soup and humming something from the radio twenty years ago.', 'مارغريت تحرك الشوربة وتدندن أغنية من راديو قبل عشرين سنة.'), T('Margaret is laying three plates, three forks, three glasses.', 'مارغريت تحط ثلاث صحون، ثلاث شوك، ثلاث كاسات.')]),
          marg_living: byDay(s, [T('Margaret is ironing a shirt that is already ironed.', 'مارغريت تكوي قميص مكوي أصلاً.'), T('Margaret is dusting a trophy: "D. Hart, under-15s, Most Improved".', 'مارغريت تنفض كأس: «د. هارت، تحت ١٥ سنة، أكثر لاعب تحسّن».'), T('Margaret is folding laundry. Some of it is yours. Some of it is his.', 'مارغريت تطوي غسيل. بعضه حقك. وبعضه حقه.')]),
          marg_bed: T('Margaret is lying down with a cloth on her forehead.', 'مارغريت متمددة وعلى جبهتها قطعة قماش.'),
          dan_room: T('A thin line of light under Daniel\'s door. Her voice, very low, in there.', 'خط ضو رفيع تحت باب دانيال. وصوتها، واطي مرة، هناك داخل.'),
          cemetery: T('Margaret is kneeling at a white stone, cleaning it with a toothbrush.', 'مارغريت راكعة عند حجر أبيض، تنظفه بفرشاة أسنان.')
        })[w] || null;
      },
      greet: s => {
        if ((s.susp.margaret || 0) >= 1 && (s.trust.margaret || 0) < 5) return { e: 'sad', t: T('I\'d rather you knocked. On everything. Always.', 'أفضّل إنك {تطق|تطقين}. على كل شي. دايم.') };
        if (s.f.mAnswered && s.slot >= 3) return { e: 'smile', t: T('There you are, love. Wash your hands, Danny.', 'هذا أنت يا عمري. اغسل يدينك يا داني.') };
        if ((s.trust.margaret || 0) >= 6) return { e: 'smile', t: T('Oh good. It\'s you. I mean that.', 'زين. {هذا أنت|هذي أنتِ}. وأعنيها.') };
        return { e: 'neutral', t: T('Yes? Is everything all right with the room?', 'نعم؟ كل شي تمام في الغرفة؟') };
      }
    };
  }
  { const { M, inM } = GAME.H.margaret;
    /* things to talk about (Margaret's chapter) */
    GAME.TOPICS.margaret = [
      { id: 'dinner', label: T('Sit down for dinner', '{تجلس|تجلسين} على العشا'), if: s => inM(s) && s.loc === 'marg_kitchen' && s.slot === 3 && !doneToday('mDinner'), cls: 'main', run: [{ jump: 'margDinner' }] },
      { id: 'cookhelp', label: T('Help her cook', '{تساعدها|تساعدينها} في الطبخ'), if: s => inM(s) && s.loc === 'marg_kitchen' && s.slot === 3 && !doneToday('mCook'), run: s => { onceToday('mCook'); addTrust('margaret', s.f.mCooked ? 0 : 1); s.f.mCooked = true; return [{ c: 'margaret', e: 'smile', t: fresh('mCookT', [T('Peel. No, towards you. No, away from you. Oh, give it here.', '{قشّر|قشّري}. لا، باتجاهك. لا، بعيد عنك. أوه، {عطني|عطيني} إياها.'), T('Stir it. Gently. It\'s gravy, not an enemy.', '{حرّكها|حرّكيها}. بشويش. هذي مرقة، مو عدو.'), T('Taste that. Too much pepper? Daniel would say too much pepper. He was wrong. Taste it again.', '{ذوقها|ذوقيها}. فلفل زايد؟ دانيال كان بيقول فلفل زايد. وكان غلطان. {ذوقها|ذوقيها} مرة ثانية.')]) }]; } },
      { id: 'daniel', once: true, label: T('Ask about Daniel', '{تسألها|تسألينها} عن دانيال'), if: s => inM(s), need: s => (s.trust.margaret || 0) >= 3, why: T('She changes the subject to the weather. Give it time.', 'تغير الموضوع للجو. {أعطها|أعطيها} وقت.'), run: s => { addTrust('margaret', 1); s.f.knowsDaniel = true; return [M('sad', 'He was seventeen. Funny. Lazy. Kind to old people and dogs and nobody else. He wanted to be a sound engineer. He made me a playlist for my birthday and then died before my birthday.', 'كان عمره سبعطعش. دمه خفيف. كسول. لطيف مع الكبار والكلاب وبس. كان يبي يصير مهندس صوت. سوى لي قائمة أغاني لعيد ميلادي وبعدين مات قبل عيد ميلادي.'), M('sad', 'There was a boy in the car with him. I can\'t say his name. I know it. I just can\'t say it.', 'كان فيه ولد معه في السيارة. ما أقدر أقول اسمه. أعرفه. بس ما أقدر أقوله.')]; } },
      { id: 'husband', once: true, label: T('Ask about the cut-out photograph', '{تسألها|تسألينها} عن الصورة المقصوصة'), if: s => inM(s) && (s.trust.margaret || 0) >= 4, run: [M('angry', 'Richard. He left when Daniel was six. Sent a card every birthday with ten dollars in it. Came to the funeral in sunglasses. I cut him out of the wedding photo with nail scissors that night. It took an hour. Best hour of the year.', 'ريتشارد. طلع لما دانيال كان عمره ست. يرسل بطاقة كل عيد ميلاد فيها عشر دولارات. وجا للعزا بنظارة شمسية. وقصّيته من صورة الزواج بمقص أظافر هذيك الليلة. أخذت ساعة. أحسن ساعة في السنة.')] },
      { id: 'pills', once: true, label: T('Ask about the gold "G" pills', '{تسألها|تسألينها} عن حبوب «G» الذهبية'), if: s => inM(s) && s.f.pillsIrene, need: s => (s.trust.margaret || 0) >= 4, why: T('If you bring it up now she\'ll shut the door on you. Literally.', 'لو {فتحت|فتحتي} الموضوع الحين بتسكّر الباب بوجهك. حرفياً.'), run: s => [
        M('shock', 'You went through my things.', '{فتشت|فتشتي} أغراضي.'),
        M('sad', '...They\'re from the spa at the Grand. A man there, a sort of pharmacist, Mr. Victor\'s friend. He said they\'d help me see Danny in my dreams. They do. Sometimes I see him when I\'m awake, too.', '...هي من السبا حق الفندق الكبير. فيه رجّال هناك، كأنه صيدلي، صاحب السيد فيكتور. قال إنها بتخليني أشوف داني في أحلامي. وصح. وأحياناً أشوفه وأنا صاحية بعد.'),
        { c: 'margaret', e: 'sad', menu: [
          { t: T('"Dr. Irene says they\'re dangerous. Take hers instead. Please."', '«الدكتورة إيرين تقول إنها خطيرة. خذي حقتها بدالها. تكفين.»'), cls: 'main', fx: st => { st.f.pillsDone = true; st.f.pillsVictor = true; quest('q_m_pills', 'done'); addTrust('margaret', 1); take('pillsM'); }, then: [M('sad', 'If I stop, will I still see him?', 'لو وقفت، بشوفه؟'), N_('"In photos," you say. "In the garden. In the card he wrote you." She doesn\'t understand the last part yet. She pours the rest of the gold bottle down the sink while you watch.', '«في الصور،» {تقول|تقولين}. «في الحديقة. في البطاقة اللي كتبها لك.» ما تفهم آخر جزء للحين. وتكب باقي العلبة الذهبية في المغسلة {وأنت تطالع|وأنتِ تطالعين}.')] },
          { t: T('Drop it', '{تترك|تتركين} الموضوع'), then: [N_('You let it go. She takes one with her tea that night, watching you over the cup.', '{تتركه|تتركينه}. وتاخذ وحدة مع الشاي هذيك الليلة، وهي تطالعك من فوق الكوب.')] }
        ] }] },
      { id: 'curtains', once: true, label: T('Ask why the curtains are always closed', '{تسألها|تسألينها} ليش الستاير دايم مسكّرة'), if: s => inM(s), run: [M('neutral', 'The sun fades the photographs. And people look in. They look in and they see a woman on her own, and they feel sorry for her, and I can\'t bear it.', 'الشمس تبهّت الصور. والناس يطالعون داخل. يطالعون ويشوفون امرأة لحالها، ويحزنون عليها، وما أتحمل.')] },
      { id: 'leo', once: true, label: T('Tell her Leo is sorry', '{تقول|تقولين} لها إن ليو آسف'), if: s => inM(s) && s.f.knowsDaniel && !s.f.margTruth && ['LEO_HOME', 'LEO_STAY'].includes(s.done.leo), need: s => (s.trust.margaret || 0) >= 5, why: T('She isn\'t ready to hear that name from you yet.', 'مو جاهزة تسمع هالاسم منك للحين.'), run: s => { addTrust('margaret', 1); return [M('sad', 'Leo. I know he is. He walks the long way round so he doesn\'t pass my house. Did you know that? Every single time.', 'ليو. أدري إنه آسف. يمشي الطريق الطويل عشان ما يمر قدام بيتي. {تدري|تدرين}؟ كل مرة.'), M('sad', 'I never blamed him. I just couldn\'t look at him. He\'s the last person who saw my son laugh.', 'عمري ما لمته. بس ما قدرت أطالعه. هو آخر واحد شاف ولدي يضحك.')]; } }
    ];
  }
  /* how Margaret looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.margaret = { sex: 'f', skin: '#f0c8a8', hair: '#8a7a6e', eye: '#5a6a7a', brow: '#6a5a50', hairStyle: 'bob', age: 40, sw: 90, ww: 74, hw: 90, pose: ['clasp', 'clasp'], fit: { top: 'cardigan', c1: '#9a7ab8', c2: '#f2ece0', bottom: 'skirt', b: '#5a5468', brooch: '#e2c07a' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.margaret.height = 0.82;
})();

/* Margaret's day: what Margaret is doing in each place (shown by js/life.js) */
if (GAME.CHAR.margaret) GAME.CHAR.margaret.life = { marg_bath: 'shower', marg_kitchen: s => (s.slot === 3 ? 'table' : 'cook'), marg_living: 'tea', marg_bed: s => (s.slot === NIGHT ? 'sleep' : 'sick'), dan_room: 'sit', cemetery: 'grave', cafe: 'tea' };
