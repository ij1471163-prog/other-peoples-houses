/* =====================================================================
   Dr. Irene — The only doctor between here and the city.
   Everything that is Dr. Irene's own: profile, where Dr. Irene is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (elias.js and every later chapter).
   ===================================================================== */
'use strict';
(function () {
  /* who Dr. Irene is and Dr. Irene's daily routine (Chapter 1, Elias) */
  GAME.CHAR.irene = {
    name: T('Dr. Irene', 'الدكتورة إيرين'), short: T('Irene', 'إيرين'), role: T('The only doctor between here and the city.', 'الطبيبة الوحيدة بين هنا والمدينة.'), art: true,
    where: s => (!s.f.prologue && s.slot <= 2 ? 'clinic' : null),
    doing: s => T('Dr. Irene is writing notes standing up.', 'الدكتورة إيرين تكتب ملاحظات وهي واقفة.'),
    greet: s => ({ e: 'neutral', t: T('Make it quick, I have a waiting room.', 'بسرعة لو سمحت، عندي ناس ينتظرون.') })
  };
  /* things to talk about (Chapter 1, Elias) */
  GAME.TOPICS.irene = [
    { id: 'self', once: true, label: T('Ask how she is', 'تسألها عن حالها'), run: [
      { c: 'irene', e: 'neutral', t: T('How I am? Fourteen-hour days. Only doctor between here and the city. I eat standing up. Next question.', 'حالي؟ أربعطعش ساعة باليوم. الطبيبة الوحيدة بين هنا والمدينة. آكل وأنا واقفة. السؤال الجاي.') },
      { c: 'irene', e: 'sad', t: T('...Nobody asks that. Thank you.', '...محد يسأل هالسؤال. شكراً.') }] },
    { id: 'elias', once: true, label: T('Ask about Elias', 'تسألها عن إلياس'), if: s => s.f.metElias, run: s => s.f.ambulance || s.f.knowsIllness ? [
      { c: 'irene', e: 'sad', t: T('His kidneys are failing. Dialysis would give him years. He\'s refused it twice.', 'كلاه تفشل. الغسيل يعطيه سنين. ورفضه مرتين.') },
      { c: 'irene', e: 'neutral', t: T('I can treat a body. I can\'t give a man a reason. That part\'s not medicine.', 'أقدر أعالج جسم. ما أقدر أعطي رجل سبب. هذا الجزء مو طب.') },
      st => { st.f.knowsIllness = true; return null; }] : [
      { c: 'irene', e: 'neutral', t: T('I can\'t talk about my patients. ...But if you live with him, make sure he eats. And watch his breathing.', 'ما أقدر أتكلم عن مرضاي. ...بس إذا ساكن معه، تأكد إنه ياكل. وانتبه لتنفسه.') }] }
  ];
  /* things to talk about (Margaret's chapter) */
  GAME.TOPICS.irene.push(
    { id: 'gpills', label: T('Show her the gold "G" pills', 'توريها حبوب «G» الذهبية'), if: s => has('pillsM') && !s.f.pillsIrene, cls: 'main', run: s => { s.f.pillsIrene = true; quest('q_m_pills', 'active'); return [
      { c: 'irene', e: 'angry', t: T('Where did you get these? No, don\'t tell me. Margaret Hart. I prescribed her something gentle and she barely touches it.', 'من وين جبتها؟ لا، لا تقول. مارغريت هارت. وصفت لها شي خفيف وبالكاد تلمسه.') },
      { c: 'irene', e: 'angry', t: T('This isn\'t from any pharmacy. A strong sedative, cut with something that causes vivid dreams. Hallucinations, in some people. Grief plus this is a very bad night waiting to happen.', 'هذي مو من أي صيدلية. منوّم قوي، مخلوط بشي يسبب أحلام واضحة. وهلوسة، عند بعض الناس. حزن مع هذا يعني ليلة سيئة مرة تنتظر.') },
      { c: 'irene', e: 'sad', t: T('Get her to stop. Gently. And if you find out who\'s selling them, I want a name.', 'خلها توقف. بلطف. ولو عرفت مين يبيعها، أبي اسم.') }]; } }
  );
  { const { fear } = GAME.H.evelyn;
    /* things to talk about (Evelyn's chapter) */
    GAME.TOPICS.irene.push(
      { id: 'sleep307', once: true, label: T('Ask about waking at 3:07 every night', 'تسألها عن الصحيان الساعة ٣:٠٧ كل ليلة'), if: s => s.host === 'evelyn' && (s.fear || 0) >= 3, run: s => { fear(s, -1); return [{ c: 'irene', e: 'neutral', t: T('Fear wakes you at the same time every night if you expect it to. The body is very obedient that way. Sleep somewhere with a light on. Talk to someone at 3:07 instead of lying there. And eat something before bed.', 'الخوف يصحّيك نفس الوقت كل ليلة إذا كنت متوقعه. الجسم مطيع بهالشكل. نام في مكان فيه ضو. وكلّم أحد الساعة ٣:٠٧ بدال ما تتمدد. وكل شي قبل النوم.') }, { c: 'irene', e: 'sad', t: T('The lighthouse? Ah. Arthur Wren was my patient. He never slept. I never found out why.', 'المنارة؟ آه. آرثر رن كان مريضي. عمره ما نام. وما عرفت ليش أبداً.') }]; } }
    );
  }
  /* things to talk about (Victor's chapter) */
  GAME.TOPICS.irene.push(
    { id: 'gpack', label: T('Give her the "G" parcel', 'تعطيها طرد «G»'), if: s => has('gpack'), cls: 'main', run: s => { take('gpack'); s.f.vPackDone = 'irene'; s.f.vPills = true; return [{ c: 'irene', e: 'angry', t: T('A whole box. I\'ll keep this somewhere very safe. When someone finally asks, I\'ll have the label, the pills and the lab report. Thank you.', 'علبة كاملة. بحطها في مكان آمن مرة. ولما أحد أخيراً يسأل، بيكون عندي الملصق، والحبوب، وتقرير المختبر. شكراً.') }]; } }
  );
  /* how Dr. Irene looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.irene = { sex: 'f', skin: '#f2c6a3', hair: '#9a3a1c', eye: '#3c7a6a', brow: '#6e2e18', hairStyle: 'bun', glasses: true, age: 45, sw: 88, ww: 68, hw: 84, pose: ['hold', 'down'], item: 'clipboard', fit: { top: 'labcoat', c1: '#fbfbf9', c2: '#2fa898', bottom: 'pants', b: '#2fa898', steth: true } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.irene.height = 1.04;
})();
