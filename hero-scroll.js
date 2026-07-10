(function() {
  'use strict';

  // === Title fix — runs immediately, before DOMContentLoaded ===
  try {
    var SITE_NAME = 'Armando Vanegas';
    var t = document.title || '';
    var sep = ' - ';
    if (t.indexOf(SITE_NAME) !== -1) {
      var parts = t.split(sep);
      // current format: "Page - Site"  →  flip to "Site - Page"
      if (parts.length >= 2) {
        var siteIdx = -1;
        for (var pi = 0; pi < parts.length; pi++) {
          if (parts[pi].trim() === SITE_NAME) { siteIdx = pi; break; }
        }
        if (siteIdx > 0) {
          var pageParts = parts.slice(0, siteIdx).concat(parts.slice(siteIdx + 1));
          var pageTitle = pageParts.join(sep).trim();
          // Strip leading "VBC " if present (old branding)
          if (pageTitle.indexOf('VBC ') === 0) pageTitle = pageTitle.slice(4);
          document.title = SITE_NAME + sep + pageTitle;
        }
      }
    }
  } catch (e) {}

  // ============================================================
  // === Hero scroll animation — v14 (4K, two-mode, preloaded, orientation-aware) ===
  // Rebuild 2026-06-12: idle (alive, blink + floating cables, ping-pong)
  // + scroll arc (face up → camera travels cables → converge to light).
  // All frames preloaded (no fetch-on-scroll). Progressive: preview tier
  // (960px) loads first → scroll enabled fast → full tier (3840/1440px)
  // streams in background and upgrades each frame. Pure #000. DPR-aware.
  // Index-easing scrub (video-smooth, no frame-blend → keeps AI grain,
  // no ghosting). ~200ms crossfade on the idle↔arc seam (idle pose != arc
  // pose). prefers-reduced-motion → static.
  // ============================================================

  var BASE = window.__HERO_BASE__ || "https://armandovanegas.github.io/vbc-public-assets/frames-4k";

  // Orientation-aware asset set (v15): landscape keeps the 16:9 master
  // (arco/idle dirs, 241/80 frames, ping-pong idle); portrait phones/tablets
  // get a dedicated 9:16 composition (arco-v/idle-v dirs) so "cover" never
  // crops the subject. The portrait idle is anchored master→master (start=end)
  // with a baked crossfade seam, so it forward-loops (1..N..1); the portrait
  // arc ends on a pure-black fade for a clean handoff to the content below.
  var PORTRAIT = false;
  try { PORTRAIT = (window.innerHeight || 0) > (window.innerWidth || 0); } catch (e) {}

  var ARCO_N = PORTRAIT ? 153 : 241;   // arc frames (frame_0001..N)
  var IDLE_N = PORTRAIT ? 97 : 80;     // idle frames (frame_0001..N)
  var FRAME_W = PORTRAIT ? 1755 : 3840;   // 1755x3120 = pixel-perfect cover
  var FRAME_H = PORTRAIT ? 3120 : 2160;   // on the sharpest phone (S25U QHD+)
  var ASPECT = FRAME_W / FRAME_H;

  var IDLE_FPS = 24;                 // real-time idle playback
  var IDLE_DT = 1000 / IDLE_FPS;
  var SCRUB_EASE = 0.16;             // index glide toward scroll target
  var SETTLE_EPS = 0.02;             // when |target-cur| below this → settled
  var SEAM_FADE_MS = 220;            // crossfade across the idle↔arc seam
  var TOP_PX = 48;                   // scrollY below this = idle zone

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var section = document.getElementById('vbc-hero-section');
  var wrapper = document.getElementById('vbc-canvas-wrapper');
  var canvas  = document.getElementById('vbc-frame-canvas');
  if (!section || !wrapper || !canvas) return;
  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // ---- frame storage: 1-based arrays, preview + full per clip ----
  var prev = { arco: new Array(ARCO_N + 1), idle: new Array(IDLE_N + 1) };
  var full = { arco: new Array(ARCO_N + 1), idle: new Array(IDLE_N + 1) };

  // landscape: desktop (3840) vs mobile (1440) full tier; preview always 960.
  // portrait: single full tier (1440x2560) in arco-v/idle-v; preview -v-p.
  function fullSuffix() {
    if (PORTRAIT) return '';          // ''=/arco-v//idle-v/ (single tier)
    var dpr = window.devicePixelRatio || 1;
    var phys = (window.innerWidth || 1280) * dpr;
    return phys > 1500 ? '' : '-m';   // ''=/arco//idle/ (4k) ; '-m'=mobile
  }
  var FULL_SUF = fullSuffix();

  function pad(n) { return ('000' + n).slice(-4); }
  function dirFor(clip) { return PORTRAIT ? clip + '-v' : clip; }
  function url(clip, suf, i) { return BASE + '/' + dirFor(clip) + suf + '/frame_' + pad(i) + '.webp'; }

  function loadImg(src) {
    return new Promise(function(resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = function() { resolve(img); };
      img.onerror = function() { resolve(null); };
      img.src = src;
    });
  }

  // Get best available image for a clip frame (full if ready, else preview).
  function frameImg(clip, i) {
    if (i < 1) i = 1;
    var max = clip === 'arco' ? ARCO_N : IDLE_N;
    if (i > max) i = max;
    return full[clip][i] || prev[clip][i] || null;
  }

  // ---- canvas sizing (DPR-aware, cover) ----
  var physW = 0, physH = 0, cssW = 0, cssH = 0, dpr = 1;
  function sizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    var vw = wrapper.clientWidth || window.innerWidth;
    var vh = wrapper.clientHeight || window.innerHeight;
    if (vw / vh > ASPECT) { cssW = vw; cssH = vw / ASPECT; }
    else { cssH = vh; cssW = vh * ASPECT; }
    physW = Math.round(cssW * dpr);
    physH = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = physW;
    canvas.height = physH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    needsDraw = true;
  }

  var posterCleared = false;
  function draw(clip, i, overlayClip, overlayI, overlayAlpha) {
    var img = frameImg(clip, i);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cssW, cssH);
    if (img) {
      try { ctx.drawImage(img, 0, 0, cssW, cssH); } catch (e) {}
      if (!posterCleared) { posterCleared = true; wrapper.style.backgroundImage = 'none'; }
    }
    if (overlayClip && overlayAlpha > 0.001) {
      var oi = frameImg(overlayClip, overlayI);
      if (oi) {
        ctx.globalAlpha = overlayAlpha;
        try { ctx.drawImage(oi, 0, 0, cssW, cssH); } catch (e) {}
        ctx.globalAlpha = 1;
      }
    }
  }

  // ---- scroll helpers ----
  function getScrollY() { return window.pageYOffset || document.documentElement.scrollTop || 0; }
  function getBudget() { return Math.max(800, window.innerHeight * 2.5); }
  function arcTargetIndex() {
    var p = Math.min(getScrollY() / getBudget(), 1);
    return 1 + p * (ARCO_N - 1);   // float in [1, ARCO_N]
  }

  // ---- animation state ----
  var scrollReady = false;        // arc preview loaded → scrubbing allowed
  var mode = 'idle';              // 'idle' | 'arc'
  var curArc = 1;                 // eased arc index (float)
  var idleStartT = 0;            // perf clock origin for idle playback
  var seam = null;               // {t0, dur, fromClip, fromIdxFn}  active crossfade
  var running = false;
  var needsDraw = true;

  function idleIndexAt(now) {
    if (PORTRAIT) {
      // forward loop: 1..IDLE_N..1 — frames are anchored master→master with a
      // baked crossfade seam, so straight forward playback loops seamlessly.
      var stepF = Math.floor((now - idleStartT) / IDLE_DT) % IDLE_N;
      return stepF + 1;                     // 1..IDLE_N
    }
    // landscape ping-pong: 1..IDLE_N..2  (seamless, no jump)
    var period = IDLE_N * 2 - 2;            // 158 for 80
    var step = Math.floor((now - idleStartT) / IDLE_DT) % period;
    var idx = step < IDLE_N ? step : (period - step); // 0..N-1..1
    return idx + 1;
  }

  function ensureRunning() {
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function startSeam(fromClip, fromIdxFn) {
    if (reduceMotion) { seam = null; return; }
    seam = { t0: performance.now(), dur: SEAM_FADE_MS, fromClip: fromClip, fromIdxFn: fromIdxFn };
  }

  function tick(now) {
    running = false;
    var atTop = getScrollY() < TOP_PX;

    // --- reduced motion: static, no loop, direct scrub ---
    if (reduceMotion) {
      if (!scrollReady || atTop) { draw('idle', 1); }
      else { draw('arco', Math.round(arcTargetIndex())); }
      needsDraw = false;
      return;
    }

    // --- mode transitions (arm crossfade across the seam) ---
    if (atTop && mode === 'arc') {
      // leaving arc → idle: fade FROM current arc frame
      var arcAt = Math.round(curArc);
      startSeam('arco', function() { return arcAt; });
      mode = 'idle';
      idleStartT = now;            // restart idle clock so it begins fresh
    } else if (!atTop && mode === 'idle' && scrollReady) {
      // leaving idle → arc: fade FROM current idle frame
      var idleAt = idleIndexAt(now);
      startSeam('idle', function() { return idleAt; });
      mode = 'arc';
      curArc = arcTargetIndex();   // jump eased value to target to avoid double-glide
    }

    var seamAlpha = 0;
    if (seam) {
      var e = (now - seam.t0) / seam.dur;
      if (e >= 1) { seam = null; }
      else { seamAlpha = 1 - e; }   // outgoing layer fades out over the new base
    }

    var keepGoing = false;

    if (mode === 'idle') {
      var ii = idleIndexAt(now);
      if (seam) draw('idle', ii, seam.fromClip, seam.fromIdxFn(), seamAlpha);
      else      draw('idle', ii);
      keepGoing = true;            // idle always animates (alive)
    } else {
      // arc scrub with index easing toward scroll target (video-smooth)
      var target = arcTargetIndex();
      curArc += (target - curArc) * SCRUB_EASE;
      if (Math.abs(target - curArc) < SETTLE_EPS) curArc = target;
      var ai = Math.round(curArc);
      if (seam) draw('arco', ai, seam.fromClip, seam.fromIdxFn(), seamAlpha);
      else      draw('arco', ai);
      if (Math.abs(target - curArc) > SETTLE_EPS || seam) keepGoing = true;
    }

    needsDraw = false;
    if (keepGoing) ensureRunning();
  }

  // scroll/resize wake the loop
  function onScroll() { ensureRunning(); }
  function onResize() {
    // orientation flip → the other asset set applies; reload once to swap
    var p = false;
    try { p = (window.innerHeight || 0) > (window.innerWidth || 0); } catch (e) {}
    if (p !== PORTRAIT) { try { location.reload(); return; } catch (e) {} }
    sizeCanvas(); ensureRunning();
  }

  // ---- progressive loading ----
  var loader = null;
  function makeLoader() {
    loader = document.createElement('div');
    loader.setAttribute('aria-hidden', 'true');
    loader.style.cssText =
      'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:4;' +
      'font:600 11px/1 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif;' +
      'letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.55);' +
      'pointer-events:none;transition:opacity .5s ease;';
    wrapper.appendChild(loader);
  }
  function setLoader(pct) {
    if (!loader) return;
    loader.textContent = 'Cargando ' + pct + '%';
  }
  function removeLoader() {
    if (!loader) return;
    loader.style.opacity = '0';
    var el = loader; loader = null;
    setTimeout(function() { if (el && el.parentNode) el.parentNode.removeChild(el); }, 600);
  }

  // sequential-with-concurrency loader for an array of {clip,i,suf,store}
  function loadBatch(items, concurrency, onProgress) {
    return new Promise(function(resolve) {
      var idx = 0, done = 0, total = items.length, active = 0;
      if (total === 0) { resolve(); return; }
      function next() {
        while (active < concurrency && idx < total) {
          var it = items[idx++]; active++;
          loadImg(url(it.clip, it.suf, it.i)).then(function(t) {
            return function(img) {
              if (img) t.store[t.clip][t.i] = img;
              active--; done++;
              if (onProgress) onProgress(done, total);
              if (done === total) resolve(); else next();
            };
          }(it));
        }
      }
      next();
    });
  }

  function buildItems(clip, n, suf, store) {
    var a = [];
    for (var i = 1; i <= n; i++) a.push({ clip: clip, i: i, suf: suf, store: store });
    return a;
  }

  function boot() {
    sizeCanvas();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', function() { setTimeout(onResize, 100); });
    makeLoader();

    // Phase A: idle preview → draw frame 1, start idle loop
    var idlePrev = buildItems('idle', IDLE_N, '-p', prev);
    var arcoPrev = buildItems('arco', ARCO_N, '-p', prev);
    var totalPrev = idlePrev.length + arcoPrev.length;
    var seenPrev = 0;
    function prevProgress() { seenPrev++; setLoader(Math.round(seenPrev / totalPrev * 100)); }

    // load frame 1 of idle first for instant paint
    loadImg(url('idle', '-p', 1)).then(function(img) {
      if (img) { prev.idle[1] = img; draw('idle', 1); }
    });

    loadBatch(idlePrev, 8, prevProgress).then(function() {
      idleStartT = performance.now();
      if (!reduceMotion) ensureRunning();       // idle alive as soon as its frames exist
      return loadBatch(arcoPrev, 8, prevProgress);
    }).then(function() {
      scrollReady = true;
      removeLoader();
      window.addEventListener('scroll', onScroll, { passive: true });
      ensureRunning();
      // Phase B: full tier in background (idle first, then arc), upgrades silently
      var idleFull = buildItems('idle', IDLE_N, FULL_SUF, full);
      var arcoFull = buildItems('arco', ARCO_N, FULL_SUF, full);
      loadBatch(idleFull, 6, null).then(function() {
        return loadBatch(arcoFull, 6, null);
      }).then(function() { needsDraw = true; ensureRunning(); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // === Video click-to-play (hero presentation video — unchanged) ===
  function initVideo() {
    var box = document.getElementById('vbc-home-video');
    var vid = document.getElementById('vbc-home-video-el');
    if (!box) return;
    if (!vid) return;
    function play() {
      try {
        vid.controls = true;
        vid.play();
        box.classList.add('playing');
      } catch (e) {}
    }
    box.addEventListener('click', function(e) {
      if (box.classList.contains('playing')) return;
      e.preventDefault();
      play();
    });
    box.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideo);
  } else {
    initVideo();
  }
})();
