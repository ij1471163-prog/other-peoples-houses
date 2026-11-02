/* From the user's own project "صورة حيّة" (netlify-v40, js/person.js), unchanged. Loaded with js/vendor/jelly-engine.js. */
/* Finds a person's face in a picture, with no model and no internet, so touching it can feel human.
 *
 *   Person.detect(canvas) -> { found, face: { u, v, ru, rv }, skin }   (u, v, ru, rv are 0..1 of the picture)
 *
 * How: a skin-tone mask (YCbCr ranges) -> clean it -> connected blobs -> the most face-like blob
 * (big enough, compact, not too stretched). It is a heuristic: it works on ordinary skin tones in a
 * clear photo, and can miss a face in strong colour casts, filters, or when a hand is the largest
 * skin area. The optional recognition in ml.js (BlazeFace, needs internet) gives a better answer.
 */
(function () {
  'use strict';

  var MAX = 180;

  function detect(src) {
    var sc = Math.min(1, MAX / Math.max(src.width, src.height));
    var w = Math.max(8, Math.round(src.width * sc)), h = Math.max(8, Math.round(src.height * sc));
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(src, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data;
    var n = w * h, mask = new Uint8Array(n), opaque = 0, i;

    for (i = 0; i < n; i++) {
      var R = d[4 * i], G = d[4 * i + 1], B = d[4 * i + 2], A = d[4 * i + 3];
      if (A < 128) continue;
      opaque++;
      var Y = 0.299 * R + 0.587 * G + 0.114 * B;
      var Cb = 128 - 0.168736 * R - 0.331264 * G + 0.5 * B;
      var Cr = 128 + 0.5 * R - 0.418688 * G - 0.081312 * B;
      var mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      if (Cb >= 77 && Cb <= 127 && Cr >= 133 && Cr <= 173 && R > 80 && R > G && R > B && mx - mn > 12 && Y > 45) mask[i] = 1;
    }
    if (!opaque) return { found: false, skin: 0 };

    // open: drop speckles, keep blobs
    var m2 = new Uint8Array(n), x0, y0, k, c3;
    for (y0 = 1; y0 < h - 1; y0++) {
      for (x0 = 1; x0 < w - 1; x0++) {
        c3 = 0;
        for (k = -1; k <= 1; k++) c3 += mask[(y0 + k) * w + x0 - 1] + mask[(y0 + k) * w + x0] + mask[(y0 + k) * w + x0 + 1];
        m2[y0 * w + x0] = c3 >= 5 ? 1 : 0;
      }
    }
    var skin = 0;
    for (i = 0; i < n; i++) skin += m2[i];

    var seen = new Uint8Array(n), best = null, stack = [];
    for (i = 0; i < n; i++) {
      if (!m2[i] || seen[i]) continue;
      var area = 0, minx = w, maxx = 0, miny = h, maxy = 0, sx = 0, sy = 0;
      stack.length = 0; stack.push(i); seen[i] = 1;
      while (stack.length) {
        var p = stack.pop(), px = p % w, py = (p / w) | 0;
        area++; sx += px; sy += py;
        if (px < minx) minx = px; if (px > maxx) maxx = px;
        if (py < miny) miny = py; if (py > maxy) maxy = py;
        var nb = [p - 1, p + 1, p - w, p + w];
        for (k = 0; k < 4; k++) {
          var q = nb[k];
          if (q < 0 || q >= n || seen[q] || !m2[q]) continue;
          if ((k === 0 && px === 0) || (k === 1 && px === w - 1)) continue;
          seen[q] = 1; stack.push(q);
        }
      }
      var bw = maxx - minx + 1, bh = maxy - miny + 1;
      var fill = area / (bw * bh), asp = bw / bh;
      var share = area / opaque;
      if (share < 0.012 || fill < 0.55 || asp < 0.55 || asp > 1.5) continue;
      if (bh > bw * 1.2) { miny = miny; bh = Math.round(bw * 1.2); }   // head + neck blob: keep the head part
      var score = area * fill * (1 - 0.4 * ((miny + bh / 2) / h));   // faces sit high in the picture
      // a face has features (eyes, mouth, brows) that are not skin-coloured; a plain skin-coloured
      // patch (a wooden stem, a wall) has none, so it is not taken as a face
      var holes = 0, inside = 0;
      for (var yy = miny; yy < miny + bh && yy < h; yy++) {
        for (var xx = minx; xx <= maxx; xx++) {
          var ex = (xx - (minx + bw / 2)) / (bw / 2), ey = (yy - (miny + bh / 2)) / (bh / 2);
          if (ex * ex + ey * ey > 0.7) continue;
          var q2 = yy * w + xx;
          if (d[4 * q2 + 3] < 128) continue;
          inside++;
          if (!m2[q2]) holes++;
        }
      }
      if (!inside || holes / inside < 0.02) continue;
      if (!best || score > best.score) {
        best = { score: score, u: (minx + bw / 2) / w, v: (miny + bh / 2) / h, ru: bw / 2 / w * 1.12, rv: bh / 2 / h * 1.12 };
      }
    }
    if (!best) return { found: false, skin: skin / opaque };
    return { found: true, skin: skin / opaque, face: { u: best.u, v: best.v, ru: best.ru, rv: best.rv } };
  }

  window.Person = { detect: detect };
})();
