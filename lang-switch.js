(function () {
  'use strict';
  // VBC bilingual language switch: EN|ES glass pill + browser auto-detect (first visit) + remembers choice.
  // ES canonical at "/", "/free-trial/"; EN mirror at "/en/", "/en/free-trial/".
  var STORE = 'vbc_lang';       // remembered preference ('es' | 'en')
  var SEEN = 'vbc_lang_seen';   // '1' once auto-detect has run (prevents re-redirect / loops)

  // Equivalent page pairs [es, en]. Only pages that exist in BOTH languages.
  var MAP = [
    ['/', '/en/'],
    ['/free-trial/', '/en/free-trial/']
  ];

  function norm(p) {
    if (!p) return '/';
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }

  var path = norm(location.pathname);
  var curLang = (path === '/en/' || path.indexOf('/en/') === 0) ? 'en' : 'es';

  // Return the URL of `path` in the requested language, or null if this page has no mapping.
  function mapTo(lang) {
    for (var i = 0; i < MAP.length; i++) {
      var es = MAP[i][0], en = MAP[i][1];
      if (path === es) return lang === 'en' ? en : es;
      if (path === en) return lang === 'en' ? en : es;
    }
    return null;
  }

  // --- Auto-detect on the first ever visit, then never again ---
  try {
    if (!localStorage.getItem(SEEN)) {
      localStorage.setItem(SEEN, '1');
      var navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      var detected = navLang.indexOf('es') === 0 ? 'es' : 'en';
      localStorage.setItem(STORE, detected);
      if (detected !== curLang) {
        var t = mapTo(detected);
        if (t && norm(t) !== path) { location.replace(t); return; }
      }
    }
  } catch (e) {}

  // --- Render the EN|ES pill ---
  function render() {
    if (document.getElementById('vbc-lang-switch')) return;
    var enUrl = mapTo('en') || '/en/';
    var esUrl = mapTo('es') || '/';
    var wrap = document.createElement('div');
    wrap.id = 'vbc-lang-switch';
    wrap.setAttribute('role', 'navigation');
    wrap.setAttribute('aria-label', 'Language');
    wrap.innerHTML =
      '<a href="' + esUrl + '" data-lang="es" class="vbc-lang-opt' + (curLang === 'es' ? ' active' : '') + '">ES</a>' +
      '<span class="vbc-lang-div"></span>' +
      '<a href="' + enUrl + '" data-lang="en" class="vbc-lang-opt' + (curLang === 'en' ? ' active' : '') + '">EN</a>';
    var as = wrap.querySelectorAll('a');
    for (var i = 0; i < as.length; i++) {
      as[i].addEventListener('click', function () {
        try { localStorage.setItem(STORE, this.getAttribute('data-lang')); } catch (e) {}
      });
    }
    document.body.appendChild(wrap);
  }

  var css =
    '#vbc-lang-switch{position:fixed;top:16px;right:16px;z-index:10000;display:flex;align-items:center;gap:6px;' +
    'padding:5px 10px;border-radius:999px;background:rgba(255,255,255,0.06);' +
    '-webkit-backdrop-filter:saturate(180%) blur(24px);backdrop-filter:saturate(180%) blur(24px);' +
    'border:1px solid rgba(255,255,255,0.14);' +
    'box-shadow:0 1px 0 rgba(255,255,255,0.18) inset,0 -1px 0 rgba(0,0,0,0.25) inset,0 8px 24px rgba(0,0,0,0.4);' +
    'font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;}' +
    '#vbc-lang-switch .vbc-lang-opt{font-size:12px;font-weight:600;letter-spacing:0.06em;' +
    'color:rgba(255,255,255,0.55);text-decoration:none;padding:2px 7px;border-radius:7px;' +
    'transition:color .15s ease,background .15s ease;line-height:1;}' +
    '#vbc-lang-switch .vbc-lang-opt:hover{color:rgba(255,255,255,0.92);}' +
    '#vbc-lang-switch .vbc-lang-opt.active{color:#000;background:#c9a84c;}' +
    '#vbc-lang-switch .vbc-lang-div{width:1px;height:12px;background:rgba(255,255,255,0.22);}' +
    '@media (max-width:880px){#vbc-lang-switch{top:10px;right:10px;padding:4px 8px;}}';

  try {
    var st = document.createElement('style');
    st.id = 'vbc-lang-switch-css';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
