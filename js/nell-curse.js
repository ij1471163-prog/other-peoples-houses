/* =====================================================================
   Nell won't be ignored.
   Once you have seen her on the pier, her story is no longer something
   you can leave for later. If days go by and you do nothing for her:
     · after two days, you hear her: a whisper, in any place, now and
       then, with a line at the edge of the picture;
     · after three days, she is angry with you: wet footprints where you
       sleep, and she will not let you sleep. You wake up worn out
       (half your energy back, a little lower in mood).
   Any step you take in her story (the logbook, the radio, the page,
   telling Elias, the lantern) calms her again. Once she is at rest it
   stops for good.
   If Elias's chapter ends and she is still not at rest, she follows you
   to the next house, angry. At night, at the end of the harbour pier,
   you can light a candle for her; then she goes.
   No trust, suspicion, quest or ending changes: only your sleep, your
   energy and your mood.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const STEPS = ['nellSeen', 'nellLog', 'nellRadio', 'nellPage', 'nellTold', 'nellWith'];
  const atRest = s => !!(s.f.nellRest || s.f.nellFree || (s.quests && s.quests.q_nell === 'done'));
  const ch1Over = s => !!(s.f.ended || (s.done && s.done.elias));
  /* days since you last did something for her */
  function level(s) {
    if (!s || !s.f.nellSeen || atRest(s) || s.f.prologue) return 0;
    const p = STEPS.filter(k => s.f[k]).length;
    if (p !== s.f.ncP) { s.f.ncP = p; s.f.ncDay = s.day; }
    const d = s.day - (s.f.ncDay ?? s.day);
    return ch1Over(s) ? Math.max(d, 3) : d;
  }
  GAME.NELL_LEVEL = s => level(s || S());

  /* ---------- her voice ---------- */
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const st = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (st.master || 0.8) * (st.sfx || 0.7) * k)); };
  function whisper() { if (!on() || document.documentElement.classList.contains('deep')) return; try { const a = new Audio('img/snd/whisper' + (1 + (Math.random() * 5 | 0)) + '.mp3'); a.volume = vol(0.18); a.play().catch(() => {}); } catch (e) { /* none */ } }
  const SAYS = [
    T('The light. Please.', 'النور. الله يخليك.'),
    T('It\'s cold out here.', 'برد هنا برا.'),
    T('You saw me. I know you saw me.', '{شفتني|شفتيني}. أدري إنك {شفتني|شفتيني}.'),
    T('Don\'t leave me in the water.', 'لا تخليني في الموية.'),
    T('He said he saw nothing. Will you?', 'هو قال ما شاف شي. {وأنت|وأنتِ}؟'),
    T('I\'m still out here.', 'أنا لسا هنا برا.')
  ];
  const SIGNS = [
    T('Wet footprints on the floor, small and bare, leading to where you sleep.', 'آثار أقدام مبلولة على الأرض، صغيرة وحافية، رايحة لمكان نومك.'),
    T('The room smells of the sea. Your pillow is damp.', 'الغرفة ريحتها بحر. ومخدتك رطبة.'),
    T('A puddle under the window that wasn\'t there this morning. It isn\'t raining.', 'بركة موية تحت الشباك ما كانت هنا الصبح. وما فيه مطر.')
  ];
  const BEDS = ['your_room', 'boathouse', 'marg_guest', 'lh_living', 'hotel_suite', 'sami_attic'];
  function bubble(top, line) {
    const st = $('stage'); if (!st) return;
    st.querySelectorAll('.vcall.nellw').forEach(x => x.remove());
    const b = el('div', 'vcall vc-mid nellw');
    b.appendChild(el('small', '', tx(top)));
    b.appendChild(el('span', '', tx(line)));
    st.appendChild(b);
    setTimeout(() => b.classList.add('out'), 5200); setTimeout(() => b.remove(), 6200);
  }
  function haunt() {
    const s = S(); if (!s || RUN || VIEW.sheet) return;
    const n = level(s); if (n < 2) return;
    /* where you sleep, when she is angry: a sign, once a day */
    if (n >= 3 && BEDS.includes(s.loc) && onceToday('ncSign')) return bubble(T('Your room', 'غرفتك'), SIGNS[s.day % SIGNS.length]);
    /* her voice, a few times a day, never twice in a row */
    s.f.ncWn = (s.f.ncWn || 0) + 1;
    if ((s.once['ncWcount@' + s.day] || 0) >= (n >= 3 ? 4 : 2) || Math.random() > 0.3 || s.f.ncLast === s.loc) return;
    s.once['ncWcount@' + s.day] = (s.once['ncWcount@' + s.day] || 0) + 1; s.f.ncLast = s.loc;
    whisper();
    bubble(T('A girl\'s voice, very close', 'صوت بنت، قريب مرة'), SAYS[(s.day + (s.f.ncWn || 0)) % SAYS.length]);
  }
  const rl0 = renderLocation;
  renderLocation = function () { const r = rl0.apply(this, arguments); setTimeout(() => { try { haunt(); } catch (e) { console.error(e); } }, 1600); return r; };

  /* ---------- she won't let you sleep ---------- */
  const sl0 = sleepToMorning;
  sleepToMorning = function () {
    const s = S(), angry = level(s) >= 3;
    const r = sl0.apply(this, arguments);
    if (angry) { const nd = needs(); nd.energy = Math.min(nd.energy, 45); addMood(-1); s.f.ncNoSleep = s.day; }
    return r;
  };
  GAME.EVENTS.push({ id: 'ncWake', when: s => s.f.ncNoSleep === s.day && !RUN && !doneToday('ncWake'), run: s => { onceToday('ncWake'); return [
    N1(...[
      ['You didn\'t sleep. Every time you closed your eyes, water dripped somewhere in the room, and a girl\'s voice counted the waves.', 'ما {نمت|نمتي}. كل ما {غمضت|غمضتي} عيونك، موية تقطر في مكان بالغرفة، وصوت بنت يعد الموج.'],
      ['Someone sat on the end of your bed all night. Every time you looked, there was nobody, and the blanket was wet.', 'أحد جلس على طرف سريرك طول الليل. كل ما {طالعت|طالعتي}، ما فيه أحد، والبطانية مبلولة.'],
      ['At some point in the night the room filled with the sound of rain. Outside, the sky was clear. You are more tired than when you lay down.', 'بنص الليل الغرفة امتلت بصوت مطر. وبرا، السما صافية. {وأنت|وأنتِ} أتعب من يوم {تمددت|تمددتي}.']][s.day % 3]),
    N1('She isn\'t going to stop. Not until you do something for her.', 'هي ما راح توقف. لين {تسوي|تسوين} لها شي.')
  ]; } });

  /* ---------- after Elias's chapter: a candle at the end of the pier ---------- */
  if (GAME.LOC.harbor) GAME.LOC.harbor.spots.push({ x: 46, y: 64, label: T('Light a candle for her, at the end of the pier', '{ولّع|ولّعي} لها شمعة، في آخر الرصيف'),
    if: s => s.slot === NIGHT && ch1Over(s) && !!s.f.nellSeen && !atRest(s),
    run: s => { s.f.nellFree = true; addMood(1); return [
      N1('You walk to the end of the pier and set a candle on the last board, out of the wind, and light it.', '{تمشي|تمشين} لآخر الرصيف {وتحط|وتحطين} شمعة على آخر لوح، بعيد عن الهوا، {وتولعها|وتولعينها}.'),
      N1('For a moment there is someone standing on the water, barefoot, soaked through. She looks at the little light for a long time. Then at you.', 'للحظة فيه أحد واقف على الموية، حافي، مبلول من راسه لرجوله. تطالع النور الصغير وقت طويل. وبعدين تطالعك.'),
      N1('Then there is only the sea. That night, you sleep.', 'وبعدين ما فيه إلا البحر. وهالليلة، {تنام|تنامين}.')
    ]; } });
})();
