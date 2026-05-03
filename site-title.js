(function() {
  'use strict';

  // Title flip: "Page - Site" -> "Site - Page", strip "VBC " prefix
  try {
    var SITE_NAME = 'Armando Vanegas';
    var sep = ' - ';
    var t = document.title || '';
    if (t.indexOf(SITE_NAME) !== -1) {
      var parts = t.split(sep);
      if (parts.length >= 2) {
        var siteIdx = -1;
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].trim() === SITE_NAME) { siteIdx = i; break; }
        }
        if (siteIdx > 0) {
          var pageParts = parts.slice(0, siteIdx).concat(parts.slice(siteIdx + 1));
          var pageTitle = pageParts.join(sep).trim();
          if (pageTitle.indexOf('VBC ') === 0) pageTitle = pageTitle.slice(4);
          document.title = SITE_NAME + sep + pageTitle;
        }
      }
    }
  } catch (e) {}

  // Header button label fix: "ARMANDO BUSINESS CENTER" -> "VANEGAS BUSINESS CENTER"
  function fixHeaderLabel() {
    try {
      var nodes = document.querySelectorAll('.elementor-button-text, .menu-item a, span, a');
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!n) continue;
        if (n.children && n.children.length > 0) continue;
        var txt = n.textContent || '';
        var trimmed = txt.replace(/\s+/g, ' ').trim().toUpperCase();
        if (trimmed === 'ARMANDO BUSINESS CENTER') {
          n.textContent = 'VANEGAS BUSINESS CENTER';
        }
      }
    } catch (e) {}
  }

  function init() {
    fixHeaderLabel();
    // Run again after a short delay in case Elementor renders late
    setTimeout(fixHeaderLabel, 300);
    setTimeout(fixHeaderLabel, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
