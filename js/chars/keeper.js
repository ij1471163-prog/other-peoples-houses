/* =====================================================================
   The Keeper — the ghost of Arthur Wren (1939–2009), the old lighthouse
   keeper, Evelyn's grandfather. For fifty years he lay awake for 3:07,
   the minute his little brother Tobias died in 1958 (see evelyn.js).
   He still keeps the house: tea at three, the lens polished, the chair
   by the window. He only shows himself while you live at the lighthouse,
   in the evening and at night, and only in the house he kept.

   Three kinds of haunting, mixed:
     · quiet   — seen from a distance, things still moving after he's gone
     · medium  — he is right there doing something ordinary, then not
     · strong  — he turns and screams (jump scare: can be switched off in
                 the phone's settings; it then plays without the flash)
   He adds fear, but never pushes it past 6 on his own, so Evelyn's best
   ending stays reachable. Once the machine behind the attic clock is
   found, he appears one last time, at peace, and is never seen again.
   ===================================================================== */
'use strict';
(function () {
  const { E, fear, inE } = GAME.H.evelyn;
  const K = e => ({ show: [{ id: 'keeper', e }] });
  const GONE = { show: [] };
  const N2 = (en, ar) => ({ n: T(en, ar) });
  /* he frightens you, but never past 6 by himself */
  const spook = (s, n) => fear(s, Math.max(0, Math.min(n, 6 - (s.fear || 0))));
  const seen = s => { s.f.sawKeeper = (s.f.sawKeeper || 0) + 1; return null; };

  GAME.CHAR.keeper = {
    name: T('The Keeper', 'الحارس'), short: T('?', '؟'),
    role: T('An old man in a keeper\'s coat. Seen at the lighthouse, at night.', 'رجل كبير بمعطف حارس. ينشاف في المنارة، بالليل.'),
    art: true, ghost: true
    /* no `where`: he is never "present" on the map or in the people list — he only appears in his scenes */
  };
  PEOPLE.SPEC.keeper = { sex: 'm', skin: '#d6dde2', hair: '#eef2f4', eye: '#a9c6d6', brow: '#e2e8ea', hairStyle: 'receding', beard: 'full', age: 70, sw: 98, ww: 80, hw: 80, pose: ['down', 'hold'], item: 'cup', fit: { top: 'coat', c1: '#22304a', c2: '#c9a54a', bottom: 'pants', b: '#1b2638' } };
  GAME.CHAR.keeper.height = 1.07;

  /* ---------- the hauntings ---------- */
  const SCENES = [
    { id: 'kitchen', loc: 'lh_kitchen', kind: 'medium', run: s => [
      N2('Someone is at the stove. A tall old man in a long navy coat, his back to you, stirring a pot very slowly.', 'فيه أحد عند الطباخ. رجل كبير طويل بمعطف كحلي، معطيك ظهره، يحرك قدر بشويش.'),
      K('neutral'), { sfx: 'ghost' },
      N2('The kettle starts to sing. He turns his head towards the sound. Not towards you. Never towards you.', 'الغلاية تبدأ تصفّر. يلف راسه ناحية الصوت. مو ناحيتك. أبداً مو ناحيتك.'),
      GONE,
      N2('You blink, and the kitchen is empty. The stove is cold. The pot is dry. The kettle is still warm.', '{ترمش|ترمشين}، والمطبخ فاضي. الطباخ بارد. القدر ناشف. والغلاية لسا دافية.'),
      st => { spook(st, 1); return seen(st); }] },
    { id: 'living', loc: 'lh_living', kind: 'quiet', evening: true, run: s => [
      N2('In the armchair by the window, someone is sitting very still, watching the sea.', 'على الكرسي اللي جنب الشباك، فيه أحد جالس بدون حركة، يطالع البحر.'),
      K('sad'),
      N2('Lamp oil. Salt. Old pipe smoke. He doesn\'t turn round.', 'ريحة زيت فانوس. وملح. ودخان غليون قديم. وما يلتفت.'),
      GONE, { sfx: 'ghost' },
      N2('The chair is empty. It goes on rocking for a long time after.', 'الكرسي فاضي. ويضل يهتز وقت طويل بعدها.'),
      st => { spook(st, 1); return seen(st); }] },
    { id: 'tower', loc: 'lh_tower', kind: 'strong', run: s => [
      N2('Someone is up here, polishing the great lens with a rag. Round and round. Round and round.', 'فيه أحد هنا فوق، يلمّع العدسة الكبيرة بخرقة. يدوّر ويدوّر. يدوّر ويدوّر.'),
      K('neutral'),
      N2('You take one step closer.', '{تقرب|تقربين} خطوة وحدة.'),
      { scare: 'keeper', n: T('He turns, and SCREAMS, a sound like a gale tearing through a keyhole.', 'يلتفت، ويصرخ. صوت مثل عاصفة تنشق من ثقب مفتاح.') },
      GONE,
      N2('The rag drops to the floor. Nobody is holding it.', 'الخرقة تطيح على الأرض. وما أحد ماسكها.'),
      st => { spook(st, 2); return seen(st); }] },
    { id: 'mirror', loc: 'lh_bath', kind: 'strong', run: s => [
      N2('You splash your face. When you look up, the mirror shows the room behind you, and an old man standing right at your shoulder.', '{ترش|ترشين} وجهك بماي. ولما {ترفع|ترفعين} راسك، المراية توريك الغرفة اللي وراك، ورجل كبير واقف على كتفك بالضبط.'),
      { scare: 'keeper', n: T('His mouth opens far too wide.', 'فمه ينفتح أوسع مما يصير.') },
      GONE,
      N2('You spin round. Nobody. The mirror shows only you, and the fog of your own breath.', '{تلف|تلفين} بسرعة. ولا أحد. المراية توريك نفسك بس، وضباب نفَسك.'),
      st => { spook(st, 1); return seen(st); }] },
    { id: 'bed', loc: 'lh_living', kind: 'medium', night: true, run: s => [
      N2('You lie down on the camp bed for a minute. Footsteps on the tower stairs. Slow, heavy, careful, like someone carrying something hot. They come down, cross the room, and stop beside your camp bed.', '{تتمدد|تتمددين} على سرير المخيّم دقيقة. {وتسمع|وتسمعين} خطوات على درج البرج. بطيئة، وثقيلة، وحذرة، كأن أحد شايل شي حار. تنزل، وتمشي في الغرفة، وتوقف جنب سريرك.'),
      { sfx: 'knock' },
      K('sad'),
      N2('Someone is standing over you. You keep your eyes almost shut. He bends down and puts something on the floor, very gently.', 'فيه أحد واقف فوقك. {تخلي|تخلين} عيونك شبه مسكرة. ينحني ويحط شي على الأرض، بهدوء مرة.'),
      GONE,
      N2('When you dare to look, there is a cup of tea beside the bed, still steaming, and nobody in the room.', 'لما {تتجرأ وتطالع، تلقى|تتجرئين وتطالعين، تلقين} كوب شاي جنب السرير، لسا يطلع منه بخار، وما أحد في الغرفة.'),
      st => { spook(st, 1); return seen(st); }] },
    { id: 'window', loc: 'lh_ext', kind: 'quiet', run: s => [
      N2('High up in the lamp room, a lantern moves slowly past the windows, left to right, the way a keeper walks his round.', 'فوق في غرفة الفانوس، فيه ضو يمشي بشويش ورا الشبابيك، من اليسار لليمين، مثل حارس يسوي جولته.'),
      { sfx: 'ghost' },
      N2('Evelyn is asleep in her room. Nobody else lives here. Nobody else has lived here for fifteen years.', 'إيفلين نايمة في غرفتها. وما أحد غيرها ساكن هنا. من خمسطعش سنة ما سكن أحد غيرها.'),
      st => { spook(st, 1); return seen(st); }] }
  ];
  /* after the machine behind the attic clock is found: one last visit, then peace */
  const FAREWELL = s => [
    N2('In the armchair by the window, the old man is sitting again. This time he turns and looks straight at you.', 'على الكرسي اللي جنب الشباك، الرجل الكبير جالس مرة ثانية. وهالمرة يلتفت ويطالعك على طول.'),
    K('smile'),
    N2('He nods, once, the way you thank someone for carrying something heavy for you. Then he is just the shape of the curtain.', 'يهز راسه مرة وحدة، مثل ما تشكر أحد شال عنك شي ثقيل. وبعدين ما يبقى منه إلا شكل الستارة.'),
    GONE,
    st => { st.f.keeperPeace = true; st.fear = Math.max(0, (st.fear || 0) - 1); addMood(1); return null; }];

  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.push(s => {
    if (!inE(s) || !s.f.metEve || s.f.keeperPeace) return null;
    if (s.slot < 3) return null;                                   // evenings and nights only
    const now = s.day * 10 + s.slot;
    if (s.f.keeperAt === now) return null;                         // once per time of day at most
    if ((s.f.keeperDay === s.day ? s.f.keeperToday || 0 : 0) >= 2) return null;   // two a day at most
    if (s.f.eMech) {                                               // the secret is out: he says goodbye
      if (s.loc !== 'lh_living') return null;
      s.f.keeperAt = now; return FAREWELL(s);
    }
    const sc = SCENES.filter(x => x.loc === s.loc && (!x.night || s.slot === NIGHT) && (!x.evening || s.slot === 3) && s.f['kp_' + x.id] !== s.day);
    if (!sc.length) return null;
    const first = !s.f.sawKeeper && s.loc === 'lh_kitchen';         // the first one always happens
    if (!first && !roll(0.4)) return null;
    const x = sc[Math.floor(Math.random() * sc.length)];
    s.f.keeperAt = now; s.f['kp_' + x.id] = s.day;
    s.f.keeperToday = (s.f.keeperDay === s.day ? s.f.keeperToday || 0 : 0) + 1; s.f.keeperDay = s.day;
    return x.run(s);
  });

  /* Evelyn knows who he is */
  GAME.TOPICS.evelyn = GAME.TOPICS.evelyn || [];
  GAME.TOPICS.evelyn.push({ id: 'keeper', once: true, label: T('"Who is the old man in the navy coat?"', '«مين الرجل الكبير اللي لابس معطف كحلي؟»'), if: s => !!s.f.sawKeeper, run: s => { addTrust('evelyn', 1); fear(s, -1); return [
    E('neutral', 'Tall? Coat with brass buttons? Smells like lamp oil and bad tobacco?', 'طويل؟ معطفه أزاريره نحاس؟ ريحته زيت فانوس وتبغ رديء؟'),
    E('sad', 'That\'s Grandad. Arthur. He\'s been dead fifteen years and he still makes tea at three. I leave him a cup. He never drinks it. It\'s the thought.', 'هذا جدي. آرثر. له خمسطعش سنة ميت، ولسا يسوي شاي الساعة ثلاث. أحط له كوب. عمره ما شربه. بس المهم النية.'),
    E('smile', 'If he screams at you, it isn\'t personal. He screamed at everyone. Even the gulls.', 'لو صرخ عليك، لا {تاخذها|تاخذينها} على نفسك. كان يصرخ على الكل. حتى النوارس.'),
    { n: T('She isn\'t joking. You check her face twice.', 'ما تمزح. {تتأكد|تتأكدين} من وجهها مرتين.') }]; } });
})();
