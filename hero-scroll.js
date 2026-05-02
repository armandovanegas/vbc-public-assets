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

  // === Hero scroll animation ===
  var TOTAL_FRAMES = 145;
  var FRAME_W = 1920, FRAME_H = 1080;
  var ASPECT = FRAME_W / FRAME_H;
  var FRAMES_BASE = "https://armandovanegas.github.io/vbc-public-assets/frames";

  var MAX_LOADED_FRAMES = 16;
  var IDLE_LOOP_FRAMES = 12;
  var IDLE_BASE_INTERVAL = 85;
  var IDLE_FRAME_HOLD = { 0: 240, 6: 210 };
  var SCROLL_QUIET_MS = 250;

  var section = document.getElementById('vbc-hero-section');
  var wrapper = document.getElementById('vbc-canvas-wrapper');
  var canvas = document.getElementById('vbc-frame-canvas');
  if (!section) return;
  if (!wrapper) return;
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  var frames = {};
  var loading = {};
  var currentFrame = -1;
  var rafPending = false;
  var physW = 0, physH = 0;
  var idleFrame = 0;
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

  function scheduleScrollFrame(i) {
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

  function isAtTop() {
    var rect = section.getBoundingClientRect();
    var scrolled = Math.max(0, -rect.top);
    return scrolled < 50;
  }

  // Continuous idle loop — never stops, just gates whether to draw
  function tickIdle() {
    var quiet = Date.now() - lastScrollAt > SCROLL_QUIET_MS;
    if (isAtTop()) {
      if (quiet) {
        ensureFrame(idleFrame, true);
        currentFrame = idleFrame;
      }
    }
    var hold = IDLE_FRAME_HOLD[idleFrame] || IDLE_BASE_INTERVAL;
    idleFrame = (idleFrame + 1) % IDLE_LOOP_FRAMES;
    setTimeout(tickIdle, hold);
  }

  function onScroll() {
    var rect = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    var scrolled = Math.max(0, -rect.top);
    var progress = total > 0 ? Math.min(scrolled / total, 1) : 0;
    var idx = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1);
    lastScrollAt = Date.now();
    if (!isAtTop()) {
      scheduleScrollFrame(idx);
      preloadWindow(idx);
    }
  }

  function init() {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    window.addEventListener('orientationchange', function() {
      setTimeout(sizeCanvas, 100);
    });

    loadFrame(0).then(function() {
      // Draw frame 0 immediately
      currentFrame = 0;
      drawFrame(0);
      // Preload idle loop frames (1-11)
      for (var k = 1; k < IDLE_LOOP_FRAMES; k++) loadFrame(k);
      window.addEventListener('scroll', onScroll, { passive: true });
      tickIdle();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
