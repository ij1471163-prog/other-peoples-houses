/* =====================================================================
   Maya — Fisherwoman. Third generation. Her boat went missing.
   Everything that is Maya's own: profile, where Maya is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (town.js).
   ===================================================================== */
'use strict';
(function () {
  { const { on } = GAME.H.town;
    /* who Maya is and Maya's daily routine (the town) */
    GAME.CHAR.maya = { name: T('Maya', 'مايا'), role: T('Fisherwoman. Third generation. Her boat went missing.', 'صيادة. الجيل الثالث. وقاربها اختفى.'), art: true,
      where: s => (!on(s) ? null : ['harbor', 'harbor', null, 'cafe', null][s.slot]),
      doing: s => (s.loc === 'cafe' ? T('Maya is eating fish soup and saying it\'s worse than hers, loudly.', 'مايا تاكل شوربة سمك وتقول إنها أسوأ من حقتها، بصوت عالي.') : T('Maya is mending nets on a borrowed boat, glaring at the Grand.', 'مايا تصلّح شباك على قارب مستلف، وتطالع الغراند بنظرة حادة.')),
      greet: s => ({ e: 'neutral', t: T('If you\'re from the hotel, keep walking. If you\'re not, sit down and hold this rope.', '{لو أنت|لو أنتِ} من الفندق، {كمل|كملي} مشيك. ولو لا، {اجلس وامسك|اجلسي وامسكي} هالحبل.') }) };
  }
  { const { C, sign } = GAME.H.town;
    /* things to talk about (the town) */
    GAME.TOPICS.maya = [
      { id: 'boat', once: true, label: T('"Where\'s your boat?"', '«وين قاربك؟»'), run: s => { quest('q_boat', 'active'); return [C('maya', 'angry', 'Gull\'s Luck. My grandmother\'s boat. Gone from her mooring a week ago. The harbor master says she sank. In a flat calm. In a harbor.', 'حظ النورس. قارب جدتي. اختفى من مرساه قبل أسبوع. مسؤول الميناء يقول غرق. والبحر هادي. وفي ميناء.'), C('maya', 'neutral', 'Boats don\'t sink in their sleep. Somebody moved her. And I know who wants every berth in this harbor.', 'القوارب ما تغرق وهي نايمة. أحد حرّكه. وأعرف مين يبي كل مرسى في هالميناء.')]; } },
      { id: 'found', label: T('Tell her where her boat is', '{تقول|تقولين} لها وين قاربها'), if: s => s.f.boatFound && s.quests.q_boat === 'active', cls: 'main', run: s => { quest('q_boat', 'done'); s.f.vMaya = true; s.money += 6; give('fish', 2); addTrust('maya', 3); return [C('maya', 'shock', 'In Victor\'s boathouse. Painted white. With his name on her.', 'في بيت قوارب فيكتور. مصبوغ أبيض. وعليه اسمه.'), C('maya', 'angry', 'Right. I\'m not going to do anything stupid. I\'m going to do something legal, which is slower and much more satisfying. And when the time comes, I\'ll stand up and say it in front of everyone.', 'طيب. ما راح أسوي شي غبي. بسوي شي قانوني، وهذا أبطأ وأمتع بكثير. ولما يجي الوقت، بقوم وأقولها قدام الكل.'), N_('She presses six dollars and two fish into your hands and won\'t take them back.', 'تحط في يدك ست دولارات وسمكتين وما ترضى ترجعها.')]; } },
      { id: 'fishTip', once: true, label: T('Ask for fishing tips', '{تطلب|تطلبين} نصايح صيد'), run: [C('maya', 'neutral', 'Watch the line, not the water. Pull when it tells you, not when you want. Same as people, really.', '{طالع|طالعي} الخيط، مو الموية. {اسحب|اسحبي} لما يقول لك، مو لما {تبي|تبين}. نفس الناس، صراحة.')] },
      sign('maya', T('Give it here. I\'ll press hard so it goes through to the next page.', '{عطني|عطيني}. بضغط قوي عشان يطلع على الصفحة اللي بعدها.'))
    ];
  }
  /* things to talk about (Victor's chapter) */
  GAME.TOPICS.maya.push(
    { id: 'berth', label: T('Give her Victor\'s message about the berth', '{تبلّغها|تبلّغينها} رسالة فيكتور عن المرسى'), if: s => s.f.vMayaTask && !s.f.vMayaDone, run: s => [{ menu: [
        { t: T('Deliver it, word for word', '{تبلّغها|تبلّغينها}، حرف بحرف'), cls: 'risk', then: [st => { st.f.vMayaDone = 'did'; addTrust('maya', -2); return null; }, { c: 'maya', e: 'angry', t: T('Reviewed. Two hundred. "The next offer is lower." You came all the way down here to say that to my face?', 'انراجع. مية وخمسين. «العرض الجاي أقل.» {نزلت|نزلتي} لين هنا عشان {تقولها|تقولينها} في وجهي؟') }, N_('She throws a mackerel at you. It\'s a good throw.', 'ترمي عليك سمكة إسقمري. رمية حلوة.')] },
        { t: T('Warn her instead', '{تحذرها|تحذرينها} بدال'), cls: 'main', then: [st => { st.f.vMayaDone = 'warned'; addTrust('maya', 2); return null; }, { c: 'maya', e: 'neutral', t: T('He sent you to scare me and you told me instead. Well. I owe you a fish. A thrown one, but gently.', 'أرسلك تخوّفني {وأنت قلت|وأنتِ قلتي} لي بدال. طيب. لك علي سمكة. مرمية، بس بلطف.') }] }
      ] }] }
  );
  /* how Maya looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.maya = { sex: 'f', skin: '#a87050', hair: '#2a1e1a', eye: '#2a1a12', brow: '#2a1e1a', hairStyle: 'ponytail', age: 41, sw: 98, ww: 80, hw: 88, pose: ['cross', 'cross'], fit: { top: 'coat', c1: '#e8722a', c2: '#2f4a5a', bottom: 'pants', b: '#3a4a3a' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.maya.height = 0.99;
})();

/* Maya's day: what Maya is doing in each place (shown by js/life.js) */
if (GAME.CHAR.maya) GAME.CHAR.maya.life = { harbor: 'mend', cafe: 'eat' };

/* small talk: what Maya says when you just chat (js/chatter.js picks one a day) */
if (GAME.CHAR.maya) GAME.CHAR.maya.chat = [
  { e: 'neutral', t: T("The fish are moving north. So am I, if Victor gets the harbor.", "السمك ينزح للشمال. وأنا بعد، لو فيكتور أخذ الميناء.") },
  { e: 'smile', t: T("My grandmother fished these waters with a wooden boat and a temper. I kept the temper.", "جدتي كانت تصيد هنا بقارب خشب وعصبية. وأنا ورثت العصبية.") },
  { if: s => s.host === 'elias', e: 'smile', t: T("Elias taught half this harbor to tie a knot. Me included. Don't tell him. He'll get proud.", "إلياس علّم نص الميناء يربطون عقدة. وأنا منهم. {لا تقول|لا تقولين} له. بيشوف نفسه.") },
  { e: 'neutral', t: T("A tip for free: never trust a calm sea before noon.", "نصيحة ببلاش: {لا تثق|لا تثقين} ببحر هادي قبل الظهر.") },
  /* reacts to what happened (phase 2) */ { if: s => s.quests.q_boat === 'done', e: 'smile', t: T("The Gull's Luck smells of new paint and old fish. Best smell in the world. Thank you.", "«حظ النورس» ريحته صبغ جديد وسمك قديم. أحلى ريحة في الدنيا. شكراً.") }
];
