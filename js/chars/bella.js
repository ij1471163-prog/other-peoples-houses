/* =====================================================================
   Bella — Front desk at the Grand. Knows every guest's secrets and most of Victor's.
   Everything that is Bella's own: profile, where Bella is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (victor.js).
   ===================================================================== */
'use strict';
(function () {
  { const { inV } = GAME.H.victor;
    /* who Bella is and Bella's daily routine (Victor's chapter) */
    GAME.CHAR.bella = {
      name: T('Bella', 'بيلا'), role: T('Front desk at the Grand. Knows every guest\'s secrets and most of Victor\'s.', 'الاستقبال في الغراند. تعرف أسرار كل الضيوف وأغلب أسرار فيكتور.'), art: true,
      where: s => (s.f.leoEnded && !s.f.prologue && s.slot < NIGHT && s.done.victor !== 'VIC_EXPOSE' ? 'hotel_lobby' : null),
      doing: s => [T('Bella is answering the phone in her "luxury voice" and pulling faces at the receiver.', 'بيلا ترد على التلفون بـ«صوت الفخامة» وتسوي وجوه للسماعة.'), T('Bella is eating a croissant under the desk, very carefully.', 'بيلا تاكل كرواسون تحت الطاولة، بحذر شديد.'), T('Bella is filing her nails and the guest complaints, in that order.', 'بيلا تبرد أظافرها وشكاوي الضيوف، بهالترتيب.'), T('Bella is counting the minutes to the end of her shift out loud.', 'بيلا تعد الدقايق لنهاية شفتها بصوت عالي.')][s.slot],
      greet: s => ({ e: 'smile', t: inV(s) ? T('Suite 7 lives! Need towels? Gossip? A getaway car?', 'جناح ٧ عايش! {تبي|تبين} مناشف؟ سوالف؟ سيارة هروب؟') : T('Welcome to the Saltmere Grand, where everyone is welcome. My lawyer says I have to say that.', 'أهلاً بك في سولتمير غراند، حيث الكل مرحب فيه. محاميني يقول لازم أقولها.') })
    };
  }
  { const { B, inV } = GAME.H.victor;
    /* things to talk about (Victor's chapter) */
    GAME.TOPICS.bella = [
      { id: 'gossip', label: T('"Any gossip?"', '«فيه سوالف؟»'), if: s => !doneToday('bellaG'), run: s => { onceToday('bellaG'); s.f.bellaChats = (s.f.bellaChats || 0) + 1; return [{ c: 'bella', e: 'smile', t: fresh('bellaGo', [T('Room 12 hasn\'t left his room once in three weeks. Room service says he\'s writing a novel. Housekeeping says it\'s about us.', 'غرفة ١٢ ما طلع من غرفته ولا مرة من ثلاث أسابيع. خدمة الغرف تقول يكتب رواية. والتنظيف يقولون الرواية عننا.'), T('The councillor came in yesterday with an empty briefcase and left with a full one. I\'m sure it was sandwiches.', 'عضو المجلس دخل أمس بشنطة فاضية وطلع بشنطة مليانة. أكيد كانت سندويشات.'), T('Victor once fired a waiter for smiling with teeth. He says teeth are "for closing deals".', 'فيكتور مرة فصل جرسون لأنه ابتسم وأسنانه طالعة. يقول الأسنان «لإغلاق الصفقات».'), T('Kell reads poetry on his break. If you tell anyone I told you, I\'ll deny it, and so will Kell, terrifyingly.', 'كيل يقرا شعر في استراحته. {لو قلت لأحد|لو قلتي لأحد} إني قلت لك، بنكر، وكيل بينكر بعد، بشكل مرعب.')]) }]; } },
      { id: 'code', once: true, label: T('Ask what numbers Victor uses for everything', '{تسألها|تسألينها} وش الأرقام اللي يستخدمها فيكتور لكل شي'), if: s => inV(s) && (s.f.bellaChats || 0) >= 2, run: s => { s.f.vCode = true; return [B('neutral', 'Ha! Zero-three-zero-seven. March the seventh, the day he bought this place. Alarm, phone, luggage, probably his heart. Why?', 'ها! صفر-ثلاثة-صفر-سبعة. سبعة مارس، يوم اشترى المكان. الجرس، والجوال، والشنط، ويمكن قلبه بعد. ليش؟'), B('shock', '...Don\'t answer that.', '...{لا ترد|لا تردين}.')]; } },
      { id: 'card', once: true, label: T('Ask to borrow the master key card', '{تطلب تستلف|تطلبين تستلفين} كرت المفتاح الرئيسي'), if: s => inV(s) && (s.f.bellaChats || 0) >= 3, run: s => { give('keycard'); s.f.cardDay = s.day; return [B('neutral', 'For "towels"? Sure. For towels.', 'عشان «المناشف»؟ أكيد. عشان المناشف.'), B('sad', 'He docked Ana a week\'s pay because a guest lost an earring. Bring it back by Friday. Or don\'t, and I\'ll say you stole it.', 'خصم من آنا راتب أسبوع لأن ضيف ضيّع حلق. {رجّعه|رجّعيه} قبل الجمعة. أو لا، وبقول إنك {سرقته|سرقتيه}.')]; } }
    ];
  }
  /* how Bella looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.bella = { sex: 'f', skin: '#e0a888', hair: '#1a1416', eye: '#5a3a22', brow: '#1a1416', hairStyle: 'ponytail', age: 27, sw: 86, ww: 66, hw: 82, pose: ['clasp', 'clasp'], fit: { top: 'suit', c1: '#8a2438', c2: '#fbfaf6', bottom: 'skirt', b: '#2a2a2e', badge: true } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.bella.height = 0.9;
})();

/* Bella's day: what Bella is doing in each place (shown by js/life.js) */
if (GAME.CHAR.bella) GAME.CHAR.bella.life = { hotel_lobby: 'desk' };
