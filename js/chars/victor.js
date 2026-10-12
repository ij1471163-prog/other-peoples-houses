/* =====================================================================
   Victor — Owns the Saltmere Grand and, slowly, the rest of Saltmere.
   Everything that is Victor's own: profile, where Victor is at each
   time of day, the greeting, every conversation topic (from every
   chapter, in the order they were added), the drawn look and the
   height. Story scripts, places and endings stay in the chapter
   files (victor.js).
   ===================================================================== */
'use strict';
(function () {
  { const { inV } = GAME.H.victor;
    /* who Victor is and Victor's daily routine (Victor's chapter) */
    GAME.CHAR.victor = {
      name: T('Victor', 'فيكتور'), role: T('Owns the Saltmere Grand and, slowly, the rest of Saltmere.', 'صاحب فندق سولتمير غراند، وشوي شوي، باقي سولتمير.'), host: true, art: true,
      where: s => {
        if (!s.f.leoEnded || s.f.prologue) return null;
        if (s.done.victor === 'VIC_EXPOSE') return null;
        if (!inV(s)) return s.slot === 2 ? 'street' : null;
        return ['hotel_lobby', 'hotel_office', 'street', 'hotel_office', 'hotel_lobby'][s.slot];
      },
      doing: s => ({ hotel_lobby: s.slot === NIGHT ? T('Victor is at the bar, buying drinks for people who will owe him later.', 'فيكتور عند البار، يشتري مشروبات لناس بيصيرون مديونين له بعدين.') : T('Victor is shaking hands in the lobby, two-handed, like a priest.', 'فيكتور يسلّم على الناس في اللوبي، بيدينه الثنتين، مثل القسيس.'), hotel_office: T('The office door is closed. Victor\'s laugh behind it, and someone else not laughing.', 'باب المكتب مسكّر. ضحكة فيكتور وراه، وأحد ثاني ما يضحك.'), street: T('Victor is walking down Main Street with a clipboard, smiling at buildings he doesn\'t own yet.', 'فيكتور يمشي في الشارع الرئيسي ومعه ورق، يبتسم لمباني لسا ما يملكها.') })[GAME.CHAR.victor.where(s)] || null,
      greet: s => {
        if ((s.susp.victor || 0) >= 2) return { e: 'smile', t: T('My favourite guest. I hear you\'ve been... curious. Curiosity is so expensive.', 'ضيفي المفضل. سمعت إنك... فضولي. الفضول غالي مرة.') };
        if ((s.conscience || 0) <= -3) return { e: 'smile', t: T('Ah, my protégé. You\'re learning so fast. It\'s almost moving.', 'آه، تلميذي. تتعلم بسرعة. شي يحرّك المشاعر تقريباً.') };
        return { e: 'smile', t: T('{name}! Everyone is welcome at the Grand. Especially you.', '{name}! الكل مرحب فيه في الغراند. خصوصاً أنت.') };
      }
    };
  }
  { const { V, inV } = GAME.H.victor;
    /* things to talk about (Victor's chapter) */
    GAME.TOPICS.victor = [
      { id: 'meet', once: true, label: T('"Who are you?"', '«مين أنت؟»'), if: s => !inV(s), run: s => { s.met.victor = true; return [V('smile', 'Victor. I own the Grand, and a few other things. Most things, eventually. Come and see me at the hotel. Everyone is welcome.', 'فيكتور. أملك الغراند، وكم شي ثاني. وأغلب الأشياء، بالآخر. تعال زورني في الفندق. الكل مرحب فيه.')]; } },
      { id: 'favour', label: T('"What\'s the next favour?"', '«وش الخدمة الجاية؟»'), if: s => inV(s) && !s.f.vAsked && s.f.vFavDay !== s.day && (s.f.vFav || 0) < 4, cls: 'main', run: [{ jump: 'vicFavour' }] },
      { id: 'favour5', label: T('"You said there was a big one."', '«قلت فيه خدمة كبيرة.»'), if: s => inV(s) && !s.f.vAsked && (s.f.vFav || 0) >= 4 && !s.f.vFinaleDone, cls: 'main', run: [{ jump: 'vicFinale' }] },
      { id: 'reportEnv', label: T('Report on the envelope', 'تبلّغه عن الظرف'), if: s => inV(s) && s.f.vAsked === 'env' && s.f.vEnvDone, run: s => { const ok = s.f.vEnvDone === 'given'; s.f.vAsked = null; GAME.SCRIPTS.vicDone(s, 'env', !ok); return [V('smile', ok ? 'He gave it back? How sweet. Everyone has a price. We just haven\'t found his yet.' : 'You didn\'t give it to him. Interesting. I like interesting. Up to a point.', ok ? 'رجّعه؟ يا حلاته. الكل له سعر. بس للحين ما لقينا سعره.' : 'ما عطيته. مثير. أحب الأشياء المثيرة. لحد معين.')]; } },
      { id: 'reportPhotos', label: T('Hand over the petition photos', 'تسلّمه صور العريضة'), if: s => inV(s) && s.f.vAsked === 'photos' && s.f.vPhotoDone, run: s => { const real = s.f.vPhotoDone === 'real'; s.f.vAsked = null; GAME.SCRIPTS.vicDone(s, 'photos', !real); if (!real) addSusp('victor', 1); return [V(real ? 'smile' : 'angry', real ? 'Sami. Marco. That florist. The old lady with the scarf. Thank you. I\'ll pay them all a little visit.' : 'Every single one is blurred. Remarkable. Your hands must shake terribly.', real ? 'سامي. ماركو. بياعة الورد. والعجوز أم الشال. شكراً. بزورهم كلهم زيارة صغيرة.' : 'كلها مغبشة. شي عجيب. لازم يدينك ترجف بشكل فظيع.')]; } },
      { id: 'reportMaya', label: T('Report on Maya', 'تبلّغه عن مايا'), if: s => inV(s) && s.f.vAsked === 'maya' && s.f.vMayaDone, run: s => { const did = s.f.vMayaDone === 'did'; s.f.vAsked = null; GAME.SCRIPTS.vicDone(s, 'maya', !did); return [V('smile', did ? 'She threw a fish at you? Wonderful. Fish are cheap. Berths are not.' : 'She knew before you got there. I wonder who told her.', did ? 'رمت عليك سمكة؟ رائع. السمك رخيص. والمراسي لا.' : 'كانت تدري قبل لا توصل. يا ترى مين قال لها.')]; } },
      { id: 'reportPack', label: T('Report on the parcel', 'تبلّغه عن الطرد'), if: s => inV(s) && s.f.vAsked === 'pack' && s.f.vPackDone, run: s => { const did = s.f.vPackDone === 'did'; s.f.vAsked = null; GAME.SCRIPTS.vicDone(s, 'pack', !did); if (!did) addSusp('victor', 1); return [V(did ? 'smile' : 'angry', did ? 'Delivered. Mrs Hart will sleep well tonight. We all do our bit.' : 'The client never received it. Parcels don\'t just vanish, {name}. People make them vanish.', did ? 'وصل. مدام هارت بتنام زين الليلة. كلنا نسوي اللي علينا.' : 'العميلة ما استلمته. الطرود ما تختفي لحالها يا {name}. الناس يخفونها.')]; } },
      { id: 'whyme', once: true, label: T('"Why me?"', '«ليش أنا؟»'), if: s => inV(s), run: [V('smile', 'Because you\'ve been inside every house in Saltmere. You know where they keep their keys and their grief. That\'s worth more than a suite.', 'لأنك دخلت كل بيت في سولتمير. تعرف وين يحطون مفاتيحهم وحزنهم. وهذا يسوى أكثر من جناح.'), V('neutral', 'And because you came here with nothing. People with nothing are so easy to give things to.', 'ولأنك جيت هنا وما معك شي. الناس اللي ما معهم شي سهل مرة تعطيهم أشياء.')] },
      { id: 'past', once: true, label: T('Ask where he grew up', 'تسأله وين تربى'), if: s => inV(s) && (s.trust.victor || 0) >= 2, run: [V('neutral', 'Fisher\'s Row. Number 3. Damp, cold, six of us. My father fixed nets for men who laughed at him. I promised myself I\'d own the street one day. Now I will. Then I\'ll knock it down.', 'شارع الصيادين. رقم ٣. رطب، بارد، ستة أشخاص. أبوي كان يصلّح شباك لرجال يضحكون عليه. ووعدت نفسي إني بملك الشارع يوم. والحين بملكه. وبعدين بهده.')] }
    ];
  }
  /* how Victor looks when drawn in code (used when there is no AI picture in img/chars) */
  PEOPLE.SPEC.victor = { sex: 'm', skin: '#e8c0a0', hair: '#1c1a1e', eye: '#5a5a62', brow: '#1c1a1e', hairStyle: 'slick', age: 50, sw: 104, ww: 86, hw: 86, pose: ['pocket', 'hold'], item: 'glass', fit: { top: 'suit', c1: '#1e2434', c2: '#f6f4ee', tie: '#b0243c', bottom: 'pants', b: '#1e2434', pocket: '#b0243c' } };
  /* body height for the AI pictures (1 = average) */
  GAME.CHAR.victor.height = 0.98;
})();

/* Victor's day: what Victor is doing in each place (shown by js/life.js) */
if (GAME.CHAR.victor) GAME.CHAR.victor.life = { hotel_lobby: 'host', hotel_office: 'office', street: 'walk' };
