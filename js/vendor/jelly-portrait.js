/* From the user's own project "صورة حيّة" (netlify-v40, js/portrait.js), unchanged. Loaded with js/vendor/jelly-engine.js. */
/* "Alive 3D" for a picture with a face (a bust, a half body, a portrait): the head turns in 3D, the chest
 * breathes, the head moves a little on its own and turns to look at your finger.
 *
 *   Portrait.clean(v)                 -> a safe settings object, or null (off)
 *   Portrait.PRESETS / NAMES / label  -> calm / natural / lively
 *   Portrait.model(face, bw, bh)      -> the head in body px: centre, radii, the neck pivot
 *   Portrait.weights(M, lx, ly, out)  -> per mesh point: head weight, head depth (px), breathing weight
 *   Portrait.idle(t, amount)          -> the head's own small movements { yaw, pitch } at time t
 *
 * How the 3D turn works (and its honest limit): from where the face is, the head is modelled as a rounded
 * shape (an ellipsoid, a little more forward at the nose and beard). Turning the head is a real rotation of
 * that shape around the neck: points nearer to you (nose, beard) move more than the outline, so it reads as
 * a turn and not a slide. Only the front of the head was photographed, so the turn is kept small
 * (about 15 degrees left/right, 10 up/down): beyond that the picture would have to show an ear or a cheek
 * it does not have.
 *
 * Everything is a pure function of the fixed physics step and the settings: a recorded motion replays the same.
 */
(function () {
  'use strict';

  var MAX_YAW = 0.27, MAX_PITCH = 0.17;          // radians: ~15 and ~10 degrees
  var TAU = Math.PI * 2;

  // TUNE: the three presets (all 0..1). breath = chest, head = its own movement, look = turns to your
  // finger, depth = how round the head is (and so how much a turn shows)
  var PRESETS = {
    calm: { label: 'هادي', breath: 0.35, head: 0.25, look: 0.45, depth: 0.55 },
    natural: { label: 'طبيعي', breath: 0.55, head: 0.5, look: 0.7, depth: 0.7 },
    lively: { label: 'حيوي', breath: 0.75, head: 0.85, look: 1, depth: 0.85 }
  };
  var NAMES = ['calm', 'natural', 'lively'];

  function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? Math.max(0, Math.min(1, v)) : d; }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  // anything else (a string, an array, NaN, a getter that throws) is off or the default
  function clean(v) {
    try {
      if (!v || typeof v !== 'object' || Array.isArray(v) || v.on !== true) return null;
      var d = PRESETS.natural;
      return { on: true, breath: r3(num(v.breath, d.breath)), head: r3(num(v.head, d.head)), look: r3(num(v.look, d.look)), depth: r3(num(v.depth, d.depth)) };
    } catch (e) { return null; }
  }

  // face: { u, v, ru, rv } in picture units (Person.detect). The box usually covers the forehead to the
  // chin; the head goes a bit beyond it (hair, a hat, a beard).
  function model(face, bw, bh) {
    var fx = (face.u - 0.5) * bw, fy = (face.v - 0.5) * bh, frx = face.ru * bw, fry = face.rv * bh;
    var rx = frx * 1.12, ry = fry * 1.3, cy = fy + fry * 0.05;
    return {
      hx: fx, hy: cy, rx: rx, ry: ry, rz: Math.min(rx, ry) * 0.95,   // head centre and radii (px)
      px: fx, py: cy + ry * 0.95,                                      // the neck pivot, under the chin
      nose: { x: fx, y: fy + fry * 0.15, r: frx * 0.45 },
      chest: { x: fx, y: cy + ry * 2.1, rx: Math.max(rx * 2.6, bw * 0.35), ry: ry * 1.6 }
    };
  }

  // out: { w, z, t } Float32Arrays (count): head weight, head depth in px (in front of the head's middle),
  // breathing weight (the chest and shoulders)
  function weights(M, lx, ly, out) {
    var n = lx.length;
    for (var k = 0; k < n; k++) {
      var dx = (lx[k] - M.hx) / M.rx, dy = (ly[k] - M.hy) / M.ry, e = Math.sqrt(dx * dx + dy * dy);
      // inside the head: 1; it fades over the neck and the hair edge (below the chin a little faster)
      var fade = ly[k] > M.py ? 0.28 : 0.4;
      var w = e <= 0.92 ? 1 : Math.max(0, 1 - (e - 0.92) / fade);
      w = w * w * (3 - 2 * w);
      out.w[k] = w;
      var z = e < 1 ? M.rz * Math.sqrt(1 - e * e) : 0;
      var nx = (lx[k] - M.nose.x) / M.nose.r, ny = (ly[k] - M.nose.y) / M.nose.r;
      z += M.rz * 0.28 * Math.exp(-2 * (nx * nx + ny * ny));          // nose, mouth and beard come forward
      out.z[k] = z;
      var cx = (lx[k] - M.chest.x) / M.chest.rx, cy = (ly[k] - M.chest.y) / M.chest.ry;
      var t = Math.max(0, 1 - Math.sqrt(cx * cx + cy * cy));
      out.t[k] = t * t * (3 - 2 * t) * (1 - w);
    }
  }

  // its own small movements: a few slow, unrelated waves (no randomness: replays match)
  function idle(t, a) {
    var yaw = 0.55 * Math.sin(TAU * 0.071 * t) + 0.3 * Math.sin(TAU * 0.163 * t + 1.3) + 0.15 * Math.sin(TAU * 0.29 * t + 2.1);
    var pitch = 0.5 * Math.sin(TAU * 0.053 * t + 0.7) + 0.3 * Math.sin(TAU * 0.137 * t + 2.6);
    return { yaw: yaw * a * MAX_YAW * 0.7, pitch: pitch * a * MAX_PITCH * 0.6 };
  }

  window.Portrait = {
    PRESETS: PRESETS, NAMES: NAMES, MAX_YAW: MAX_YAW, MAX_PITCH: MAX_PITCH,
    clean: clean, model: model, weights: weights, idle: idle,
    label: function (n) { return Object.prototype.hasOwnProperty.call(PRESETS, n) ? PRESETS[n].label : n; }
  };
})();
