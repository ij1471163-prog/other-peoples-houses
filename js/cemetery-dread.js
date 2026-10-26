/* =====================================================================
   1. QUAKE: small ways for the picture (and the phone) to shake.
        QUAKE('tremor')  a faint shiver in the ground
        QUAKE('thud')    one heavy knock, then still
        QUAKE('rumble')  a low rolling shake
      Off with "reduce motion"; the phone only buzzes when jump scares are on.
   2. Quiet dread at the cemetery, in the afternoon and the evening, once a
      day at most and not every visit:
        afternoon  a whisper you can't make out
        evening    first a cat you can't find; after that, sometimes a hand
                   claws its way up out of the earth in front of a grave, the
                   ground shakes, it grips the soil and drags itself back down.
      The hand is drawn in layers (img/fx: the arm, each finger, the grip); the sounds
      are the real recordings in img/snd. Gregor has one line about it.
      Nothing here touches fear, trust, quests or endings.
   ===================================================================== */
'use strict';
(function () {
  const REDUCED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = p => { try { if (SCARES.on && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* no buzz */ } };
  const on = () => typeof AUDIO !== 'undefined' && AUDIO.on;
  const vol = k => { const s = (typeof AUDIO !== 'undefined' && AUDIO.settings) || {}; return Math.max(0, Math.min(1, (s.master || 0.8) * (s.sfx || 0.7) * k)); };

  /* a recorded sound from img/snd (works with or without the sound engine being awake) */
  function rec(name, k, rate) {
    if (!on()) return null;
    try { const a = new Audio('img/snd/' + name + '.mp3'); a.volume = vol(k); if (rate) { a.preservesPitch = false; a.playbackRate = rate; } a.play().catch(() => {}); return a; } catch (e) { return null; }
  }
  const pickOf = (base, n) => base + (1 + (Math.random() * n | 0));

  /* ---------- 1. shaking ---------- */
  window.QUAKE = function (kind) {
    const st = $('stage'); if (!st || REDUCED()) return;
    const cls = 'quake-' + kind; st.classList.remove('quake-tremor', 'quake-thud', 'quake-rumble'); void st.offsetWidth; st.classList.add(cls);
    const dur = { tremor: 1400, thud: 500, rumble: 2200 }[kind] || 800;
    setTimeout(() => st.classList.remove(cls), dur);
    if (kind === 'thud') buzz(70); else if (kind === 'rumble') buzz([40, 60, 40, 60, 40]); else buzz(25);
    if (kind !== 'tremor') rumbleSound(kind === 'thud' ? 0.35 : 1.6);
  };

  /* ---------- made-up sounds (the cat, the rumble) ---------- */
  let AC = null;
  const ac = () => { if (!on()) return null; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  function noise(c, len) { const b = c.createBuffer(1, Math.max(1, c.sampleRate * len | 0), c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; return s; }
  function rumbleSound(len) {
    const c = ac(); if (!c) return;
    try { const t = c.currentTime, s = noise(c, len), f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'lowpass'; f.frequency.value = 90; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol(0.9), t + Math.min(0.08, len / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      s.connect(f).connect(g).connect(c.destination); s.start(t); s.stop(t + len); } catch (e) { /* none */ }
  }
  /* a cat: a gliding tone through a mouth-like filter, "mrr-aow" */
  function meow() {
    const c = ac(); if (!c) return;
    try { const t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), p = c.createStereoPanner ? c.createStereoPanner() : null;
      o.type = 'sawtooth'; o.frequency.setValueAtTime(420, t); o.frequency.linearRampToValueAtTime(780, t + 0.25); o.frequency.linearRampToValueAtTime(520, t + 0.75);
      f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(1800, t + 0.3); f.frequency.linearRampToValueAtTime(1000, t + 0.75);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol(0.22), t + 0.08); g.gain.setValueAtTime(vol(0.22), t + 0.55); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      let n = o.connect(f).connect(g); if (p) { p.pan.value = 0.8; n = n.connect(p); } n.connect(c.destination); o.start(t); o.stop(t + 0.85); } catch (e) { /* none */ }
  }
  /* digging: wet earth breaking, a few times, a little faster each time */
  function dig() { [0, 380, 700, 960, 1180].forEach((ms, i) => setTimeout(() => rec('gravel', 0.55 + i * 0.08, 0.7 + Math.random() * 0.15), ms)); }

  /* ---------- the hand ---------- */
  /* drawn in layers: the arm and palm (hand_base) and each finger on its own (f_*), turning
     around its knuckle, so the fingers claw one by one */
  const FINGERS = { pinky: [33.6, 27.1, 9], ring: [39.6, 18.1, -7], middle: [46.7, 16.9, 6], index: [55.9, 17.5, -9], thumb: [61.4, 30.3, 11] };
  const TIPS = [[24, 20], [33, 8], [45, 4], [66, 14], [73, 30]];   /* where earth drips from (% of the picture) */
  let handTimer = 0, dirtTimer = 0;
  function dirt(box, n, from, spread, up) {
    const layer = box.querySelector('.gh-dirt'); if (!layer || REDUCED()) return;
    for (let i = 0; i < n; i++) {
      const d = el('i'); const big = Math.random() < 0.3;
      d.style.cssText = `left:${from[0] + (Math.random() - 0.5) * spread}%;top:${from[1] + (Math.random() - 0.5) * 4}%;` +
        `--dx:${((Math.random() - 0.5) * (up ? 70 : 14)).toFixed(0)}px;--dy:${up ? -(20 + Math.random() * 60).toFixed(0) : 0}px;--fall:${(60 + Math.random() * 90).toFixed(0)}px;` +
        `width:${big ? 8 : 4 + Math.random() * 3}px;height:${big ? 7 : 3 + Math.random() * 3}px;animation-delay:${(Math.random() * (up ? 0.5 : 1.2)).toFixed(2)}s;animation-duration:${(0.9 + Math.random() * 0.7).toFixed(2)}s`;
      layer.appendChild(d); setTimeout(() => d.remove(), 3000);
    }
  }
  function handScene() {
    const st = $('stage'); if (!st) return;
    const old = st.querySelector('.grave-hand'); if (old) old.remove();
    const box = el('div', 'grave-hand' + (SCARES.on ? '' : ' soft'));
    const fingers = Object.entries(FINGERS).map(([n, [x, y, a]], i) =>
      `<img class="gh-f" src="img/fx/f_${n}.webp" alt="" style="transform-origin:${x}% ${y}%;--a:${a}deg;animation-delay:${(2.1 + i * 0.17).toFixed(2)}s;animation-duration:${(1.1 + (i % 3) * 0.35).toFixed(2)}s">`).join('');
    box.innerHTML = '<div class="gh-pit"><div class="gh-up"><img src="img/fx/hand_base.webp" alt="">' + fingers + '</div><img class="gh-grip" src="img/fx/hand_grip.webp" alt=""></div><div class="gh-dirt"></div>';
    st.appendChild(box);
    QUAKE('tremor'); dig();
    /* the earth breaks: clods thrown up, then earth keeps dropping off the fingers */
    setTimeout(() => dirt(box, 22, [50, 88], 60, true), 300);
    setTimeout(() => dirt(box, 14, [50, 70], 40, true), 1100);
    let k = 0; dirtTimer = setInterval(() => { const t = TIPS[k++ % TIPS.length]; dirt(box, 2, t, 4, false); }, 260);
    setTimeout(() => rec(pickOf('whisper', 5), 0.5), 600);
    setTimeout(() => { if (SCARES.on) { QUAKE('rumble'); rec(pickOf('hit', 2), 0.75); } else rec(pickOf('moan', 3), 0.35, 0.85); }, 1000);
    /* it stays up until you look away (the next line), and never longer than 9 seconds */
    handTimer = setTimeout(sinkHand, 9000);
  }
  function sinkHand() {
    clearTimeout(handTimer); clearInterval(dirtTimer);
    const box = document.querySelector('#stage .grave-hand'); if (!box || box.classList.contains('grip')) return;
    /* it grabs the earth... and is yanked under, all at once */
    box.classList.add('grip'); rec('gravel', 0.6, 0.6);
    setTimeout(() => {
      box.classList.add('down'); QUAKE('thud'); dirt(box, 26, [50, 86], 70, true);
      if (SCARES.on) rec(pickOf('hit', 2), 0.6); else rec('gravel', 0.7, 0.5);
    }, 650);
    setTimeout(() => box.remove(), 1900);
  }

  /* ---------- 2. the cemetery ---------- */
  const N2 = (en, ar) => ({ n: T(en, ar) });
  const SCENE = {
    whisper: s => [st => { rec(pickOf('whisper', 5), 0.55); return null; },
      N2('Somewhere between the stones, someone is whispering. You can\'t make out a word. When you stop to listen, it stops too.', 'في مكان بين الحجارة، أحد يهمس. ما {تفهم|تفهمين} ولا كلمة. ولما {توقف|توقفين} {تسمع|تسمعين}، يوقف هو بعد.')],
    cat: s => [st => { meow(); return null; },
      N2('A cat, close by, behind the nearest grave. You look. Nothing. Then again, from the other side.', 'قطوة، قريبة، ورا أقرب قبر. {تطالع|تطالعين}. ولا شي. وبعدين مرة ثانية، من الجهة الثانية.'),
      st => { setTimeout(meow, 500); return null; },
      N2('There is no cat in the cemetery.', 'ما فيه قطوة في المقبرة.')],
    hand: s => [st => { handScene(); st.f.cdHand = (st.f.cdHand || 0) + 1; return null; },
      N2('The grass in front of an old grave shivers. Then the earth moves.', 'العشب قدام قبر قديم يرجف. وبعدين التراب يتحرك.'),
      N2('Something pale. Fingers.', 'شي أبيض باهت. أصابع.'),
      st => { sinkHand(); return null; },
      N2('You look again. The earth is still. As if nothing happened.', '{تطالع|تطالعين} مرة ثانية. التراب ساكن. كأن شي ما صار.')]
  };
  function pick(s) {
    const lvl = s.f.cd || 0;
    if (s.slot === 2) return 'whisper';
    if (s.slot === 3) return lvl === 0 ? 'cat' : (lvl === 1 || roll(0.5) ? 'hand' : 'whisper');
    return null;
  }
  GAME.ENTER_HOOKS = GAME.ENTER_HOOKS || [];
  GAME.ENTER_HOOKS.unshift(s => {   /* first, so a stuck-hint never talks over it */
    if (!s || s.loc !== 'cemetery' || s.f.prologue || RUN || s.f.cdDay === s.day) return null;
    if (!window.__cdForce && !roll(0.45)) return null;
    const k = window.__cdForce && SCENE[window.__cdForce] ? window.__cdForce : pick(s); if (!k) return null;
    s.f.cdDay = s.day; if (s.slot === 3) s.f.cd = (s.f.cd || 0) + 1;
    return SCENE[k](s);
  });
  window.__cdHand = handScene; window.__cdSink = sinkHand;   /* for tests */

  /* Gregor saw it too, years ago */
  if (GAME.CHAR.gregor) {
    GAME.CHAR.gregor.chat = GAME.CHAR.gregor.chat || [];
    GAME.CHAR.gregor.chat.unshift({ if: s => !!s.f.cdHand, e: 'neutral',
      t: T('You saw it, didn\'t you. Don\'t worry. It only comes up for people who look.', '{شفتها،|شفتيها،} صح؟ لا {تشيل|تشيلين} هم. ما تطلع إلا للي يطالعون.') });
  }
})();
