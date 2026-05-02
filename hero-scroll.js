(function() {
  'use strict';
  var TOTAL_FRAMES = 145;
  var FRAME_W = 1920, FRAME_H = 1080;
  var ASPECT = FRAME_W / FRAME_H;
  var FRAMES_BASE = "https://armandovanegas.github.io/vbc-public-assets/frames";

  var MAX_LOADED_FRAMES = 8;
  var IDLE_LOOP_FRAMES = 12;
  var IDLE_BASE_INTERVAL = 85;
  var IDLE_FRAME_HOLD = { 0: 240, 6: 210 };

  var section = document.getElementById('vbc-hero-section');
  var wrapper = document.getElementById('vbc-canvas-wrapper');
  var canvas = document.getElementById('vbc-frame-canvas');
  if (!section || !wrapper || !canvas) return;
  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  var frames = {};
  var loading = {};
  var currentFrame = -1, rafPending = false;
  var physW = 0, physH = 0;
  var idleTimeout = null;
  var idleFrame = 0;
  var scrollIsActive = false;
  var lastScrollAt = 0;
  var firstFrameRendered = false;

  function sizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    var vw = wrapper.clientWidth || window.innerWidth;
    var vh = wrapper.clientHeight || window.innerHeight;
    var cssW, cssH;
    if (vw / vh > ASPECT) { cssW = vw; cssH = vw / ASPECT; }
    else { cssH = vh; cssW = vh * ASPECT; }
    physW = Math.round(cssW * dpr);
    physH = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = physW;
    canvas.height = physH;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (currentFrame >= 0) {
      var slot = frames[currentFrame];
      if (slot) drawFrame(currentFrame);
    }
  }

  function drawFrame(i) {
    var slot = frames[i];
    if (!slot) return;
    if (!slot.img) return;
    slot.lastUsed = Date.now();
    var cssW = physW / (window.devicePixelRatio || 1);
    var cssH = physH / (window.devicePixelRatio || 1);
    try {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.drawImage(slot.img, 0, 0, cssW, cssH);
      if (!firstFrameRendered) {
        firstFrameRendered = true;
        wrapper.style.backgroundImage = 'none';
      }
    } catch (e) {}
  }

  function evictOldFrames() {
    var keys = Object.keys(frames);
    if (keys.length <= MAX_LOADED_FRAMES) return;
    keys.sort(function(a, b) { return frames[a].lastUsed - frames[b].lastUsed; });
    var toDrop = keys.length - MAX_LOADED_FRAMES;
    for (var k = 0; k < toDrop; k++) {
      delete frames[keys[k]];
    }
  }

  function padded(n) { return ('000' + n).slice(-4); }

  function loadFrame(i) {
    var slot = frames[i];
    if (slot) {
      if (slot.img) return Promise.resolve(slot.img);
    }
    if (loading[i]) return loading[i];
    var p = new Promise(function(resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = function() {
        frames[i] = { img: img, lastUsed: Date.now() };
        delete loading[i];
        evictOldFrames();
        resolve(img);
      };
      img.onerror = function() {
        delete loading[i];
        resolve(null);
      };
      img.src = FRAMES_BASE + '/frame_' + padded(i + 1) + '.webp';
    });
    loading[i] = p;
    return p;
  }

  function ensureFrame(i, andDraw) {
    var slot = frames[i];
    if (slot) {
      if (slot.img) {
        if (andDraw) drawFrame(i);
        return;
      }
    }
    loadFrame(i).then(function(img) {
      if (!img) return;
      if (currentFrame !== i) return;
      if (andDraw) drawFrame(i);
    });
  }

  function preloadWindow(centerIdx) {
    for (var offset = 0; offset <= 3; offset++) {
      var fwd = centerIdx + offset;
      var bwd = centerIdx - offset;
      if (fwd < TOTAL_FRAMES) {
        if (!frames[fwd]) {
          if (!loading[fwd]) loadFrame(fwd);
        }
      }
      if (offset > 0) {
        if (bwd >= 0) {
          if (!frames[bwd]) {
            if (!loading[bwd]) loadFrame(bwd);
          }
        }
      }
    }
  }

  function scheduleFrame(i) {
    if (i === currentFrame) return;
    currentFrame = i;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function() {
      rafPending = false;
      var slot = frames[currentFrame];
      if (slot) {
        if (slot.img) {
          drawFrame(currentFrame);
          return;
        }
      }
      ensureFrame(currentFrame, true);
    });
  }

  function tickIdle() {
    ensureFrame(idleFrame, true);
    var hold = IDLE_FRAME_HOLD[idleFrame] || IDLE_BASE_INTERVAL;
    idleFrame = (idleFrame + 1) % IDLE_LOOP_FRAMES;
    idleTimeout = setTimeout(tickIdle, hold);
  }
  function startIdleLoop() {
    stopIdleLoop();
    idleFrame = 0;
    tickIdle();
  }
  function stopIdleLoop() {
    if (idleTimeout) { clearTimeout(idleTimeout); idleTimeout = null; }
  }

  function onScroll() {
    var rect = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    var scrolled = Math.max(0, -rect.top);
    var progress = total > 0 ? Math.min(scrolled / total, 1) : 0;
    var idx = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1);
    lastScrollAt = Date.now();
    if (!scrollIsActive) {
      scrollIsActive = true;
      stopIdleLoop();
    }
    scheduleFrame(idx);
    preloadWindow(idx);
  }

  function watchScrollStop() {
    setInterval(function() {
      if (!scrollIsActive) return;
      if (Date.now() - lastScrollAt <= 1500) return;
      scrollIsActive = false;
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight;
      var scrolled = Math.max(0, -rect.top);
      var progress = total > 0 ? scrolled / total : 0;
      if (progress < 0.05) startIdleLoop();
    }, 600);
  }

  function init() {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    window.addEventListener('orientationchange', function() {
      setTimeout(sizeCanvas, 100);
    });

    loadFrame(0).then(function() {
      scheduleFrame(0);
      for (var k = 1; k < IDLE_LOOP_FRAMES; k++) loadFrame(k);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      watchScrollStop();
      startIdleLoop();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
