/* =====================================================================
   Under the bed (Nell's mystery, step 2, the new way).
   After you have seen her on the pier, the next night in your room:
   dripping, water spreading out from under the bed, a face in the dark
   under it that you may or may not notice, and Elias's wet 1981 logbook
   sliding out against your foot, open at the torn page.
   It sets the same flag as the logbook in the shed (nellLog), so the
   mystery carries on exactly as before. Nothing here reads or changes
   trust, suspicion or any ending.
   ===================================================================== */
'use strict';
(function () {
  const N1 = (en, ar) => ({ n: T(en, ar) });
  const ch1 = s => s && s.host === 'elias' && s.f.metElias && !s.f.ended && !(s.done && s.done.elias);
  const PIC = { w: 1600, h: 901 };
  const pct = (v, of) => (v / of * 100) + '%';
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };
  const rec = (name, k, rate) => { if (!on()) return; try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); if (rate) { a.preservesPitch = false; a.playbackRate = rate; } a.play().catch(() => {}); } catch (e) { /* none */ } };

  /* a drop of water, made on the spot */
  let ac = null, dripT = 0;
  function drop(k = 1) {
    if (!on()) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1400 + Math.random() * 500, t); o.frequency.exponentialRampToValueAtTime(380, t + 0.09);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22 * vol(k), t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.2);
    } catch (e) { /* no sound */ }
  }
  const drips = (gap) => { clearTimeout(dripT); if (!gap) return; const go = () => { drop(); dripT = setTimeout(go, gap * (0.7 + Math.random() * 0.6)); }; go(); };

  /* the picture's own layer, sized like the background (cover) */
  let box = null;
  function layer() {
    const sc = document.querySelector('#stage .scene'), bg = sc && sc.querySelector('.bg'); if (!bg) return null;
    if (box && box.isConnected) return box;
    box = el('div', 'ub-cine');
    const fit = () => { if (!box) return; const W = sc.clientWidth, H = sc.clientHeight, k = Math.max(W / PIC.w, H / PIC.h); box.style.width = PIC.w * k + 'px'; box.style.height = PIC.h * k + 'px'; };
    box.innerHTML = '<i class="ub-water"></i><img class="ub-face" src="img/fx/underbed-face.webp" alt=""><img class="ub-face ub-stare" src="img/fx/underbed-stare.webp" alt=""><div class="ub-book"><b></b><span>THE ADA · 1981</span></div>';
    box.querySelectorAll('.ub-face').forEach(f => Object.assign(f.style, { left: pct(870, PIC.w), top: pct(265, PIC.h), width: pct(160, PIC.w), height: pct(160, PIC.h) }));
    bg.after(box); fit(); box._fit = fit;
    try { box.style.filter = getComputedStyle(bg).filter; } catch (e) { /* none */ } addEventListener('resize', fit);
    return box;
  }
  const cls = (c, onOff = true) => () => { const b = layer(); if (b) b.classList.toggle(c, onOff); return null; };
  function end() {
    drips(0);
    if (box) { removeEventListener('resize', box._fit); box.remove(); box = null; }
    if (VIEW.bgOver) delete VIEW.bgOver.your_room;
    return null;
  }

  const SCENE = s => [
    st => { VIEW.bgOver = Object.assign({}, VIEW.bgOver, { your_room: 'underbed' }); return null; },
    { show: [] },
    st => { setTimeout(() => { layer(); drips(1400); }, 80); return null; },
    N1('A sound wakes you. Drip. Drip. Not the tap in the bathroom. Closer than that. Under you.', 'صوت يصحيك. قطرة. قطرة. مو الحنفية اللي في الحمام. أقرب من كذا. تحتك.'),
    cls('wet'),
    N1('You lean over the edge of the bed. In the moonlight, water is spreading across the floorboards from under the bed. Slowly. Like something breathing out.', '{تميل|تميلين} على طرف السرير. في ضو القمر، فيه موية تنتشر على الخشب من تحت السرير. شوي شوي. كأن شي يطلع نفَسه.'),
    st => { drips(900); rec('whisper2', 0.18, 0.8); return null; },
    cls('face'),
    N1('It is very dark under the bed. Darker than it should be.', 'تحت السرير ظلام مرة. أظلم من اللازم.'),
    { menu: [
      { t: T('Look closer', '{قرّب|قرّبي} {وطالع|وطالعي}'), then: [
        cls('stare'),
        st => { drips(0); rec('scream', 1.2, 1.15); return null; },
        N1('Two eyes. Open. Looking back at you from the dark, a hand\'s width from your face.', 'عيونين. مفتوحة. تطالعك من الظلام، على بعد شبر من وجهك.')
      ] },
      { t: T('Don\'t look. Don\'t look.', 'لا {تطالع|تطالعين}. لا {تطالع|تطالعين}.'), then: [
        st => { drips(0); return null; },
        N1('You stare at the ceiling and count. You get to eleven before you hear it: something moving, under you, against the wood.', '{تطالع|تطالعين} السقف {وتعد|وتعدين}. توصل لإحدعش قبل لا {تسمعه|تسمعينه}: شي يتحرك، تحتك، على الخشب.')
      ] }
    ] },
    cls('face', false), cls('stare', false),
    st => { rec('wood2', 0.7, 0.75); setTimeout(() => { const b = layer(); if (b) b.classList.add('book'); }, 30); return null; },
    N1('Something slides out from under the bed and stops against your foot. A book. Wet through, heavy, swollen with water.', 'شي يتزحلق من تحت السرير ويوقف عند رجلك. كتاب. مبلول كله، ثقيل، منفوخ من الموية.'),
    N1('One of Elias\'s old logbooks. THE ADA, 1981. Weather, catch, hours. Then, 2 March: "Storm coming in. Joe Farrow still out. On watch at the pier tonight."', 'واحد من دفاتر إلياس القديمة. «آدا»، ١٩٨١. الطقس، والصيد، والساعات. وبعدين، ٢ مارس: «عاصفة جاية. جو فارو لسا برا. عليّ حراسة الرصيف الليلة.»'),
    N1('The next page has been torn out, close to the spine. Whoever did it did it carefully.', 'الصفحة اللي بعدها ممزوعة، من قريب الكعب. اللي مزعها، مزعها بعناية.'),
    cls('dry'),
    N1('When you dare to look under the bed again, there is nothing there. Only the water, already soaking into the wood. And the smell of the sea.', 'لما {تتجرأ|تتجرئين} {وتطالع|وتطالعين} تحت السرير مرة ثانية، ما فيه شي. بس الموية، اللي بدت تنشف في الخشب. وريحة البحر.'),
    st => { st.f.nellLog = true; st.f.nellBed = true; return null; },
    end, { show: null }
  ];

  /* it happens the first time you go to your room at night after seeing her (instead of the shed) */
  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.unshift(s => {
    if (!s || RUN || s.f.prologue || !ch1(s) || s.slot !== NIGHT) return null;
    if (s.loc === 'your_room' && s.f.nellSeen && !s.f.nellLog && s.f.nellSeenDay !== s.day) return SCENE(s);
    return null;
  });
  /* remember which night you saw her on the pier, so it waits until the next one */
  GAME.EVENTS.push({ id: 'ubSeenDay', when: s => { if (s.f.nellSeen && s.f.nellSeenDay === undefined) s.f.nellSeenDay = s.day; return false; }, run: [] });
  window.__underbed = { SCENE, end };
})();
