(function() {
  'use strict';
  try {
    var SITE_NAME = 'Armando Vanegas';
    var sep = ' - ';
    var t = document.title || '';
    if (t.indexOf(SITE_NAME) === -1) return;
    var parts = t.split(sep);
    if (parts.length < 2) return;
    var siteIdx = -1;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].trim() === SITE_NAME) { siteIdx = i; break; }
    }
    if (siteIdx <= 0) return;
    var pageParts = parts.slice(0, siteIdx).concat(parts.slice(siteIdx + 1));
    var pageTitle = pageParts.join(sep).trim();
    if (pageTitle.indexOf('VBC ') === 0) pageTitle = pageTitle.slice(4);
    document.title = SITE_NAME + sep + pageTitle;
  } catch (e) {}
})();
