/* ============================================================================
   VBC · Widget demo "Habla con Sara" — versión externalizada (GitHub Pages).
   Mismo patrón que lang-switch.js: el archivo vive aquí, Elementor solo lo llama.

   MONTAJE (una sola vez, dentro del HTML widget del popup 2655):
     <div id="vbc-demo"></div>
     <script src="https://armandovanegas.github.io/vbc-public-assets/demo-widget.js?v=1"></script>

   Para futuros cambios: editar este archivo → git push → subir el ?v=N. Sin tocar Elementor.

   - Voz en navegador vía @elevenlabs/client (WebRTC), token emitido por el gatekeeper.
   - Anti-abuso: Cloudflare Turnstile + límite IP 2/24h (en el gatekeeper n8n).
   - Idioma: detección multi-señal alineada al switcher propio (lang-switch.js):
       URL /en/ = inglés (autoritativo) · localStorage 'vbc_lang' · navigator.language · default EN.
       NO se usa <html lang> (Elementor lo hornea a en-US en ambas versiones).
   Gatekeeper: https://armandovanegas.app.n8n.cloud/webhook/vbc-demo-gatekeeper
============================================================================ */
(function () {
  'use strict';
  if (window.__vbcDemoLoaded) return;      // evita doble carga del script
  window.__vbcDemoLoaded = true;

  var GATEKEEPER = "https://armandovanegas.app.n8n.cloud/webhook/vbc-demo-gatekeeper";
  var SITEKEY = "0x4AAAAAADp3m1oyhdwzpN5A";
  var BOOKING = "https://armandovanegas.com/booking";
  var DEMO_SECONDS = 70, WRAP_AT = 56, HARD_STOP = 90;

  // --- idioma alineado al switcher propio del sitio (lang-switch.js) ---
  //   ES canónico en "/", EN mirror en "/en/"; elección recordada en localStorage 'vbc_lang';
  //   primera visita auto-detecta por navigator.language. NO confiamos en <html lang>.
  function detectLang() {
    var p = (location.pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
    if (p === "/en" || p.indexOf("/en/") === 0) return "en";   // mirror inglés = autoritativo
    if (p === "/" || p === "/free-trial") return "es";          // español canónico = autoritativo
    try { var s = localStorage.getItem("vbc_lang"); if (s === "en" || s === "es") return s; } catch (e) {}
    var n = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (n.indexOf("es") === 0) return "es";
    if (n.indexOf("en") === 0) return "en";
    return "en";  // default del caso borde (decisión Armando 2026-06-24)
  }

  var T = {
    es: { title: "Habla con Sara", sub: "Nuestra agente de voz con IA. Pruébala ahora mismo.",
      meta_dur: "Dura unos 70 segundos", meta_uses: "Puedes probarla 2 veces", meta_rec: "Se graba para control de calidad",
      accept: "Aceptar y hablar con Sara", text_opt: "Prefiero probar por texto",
      consent_fine: "Al aceptar, permites el uso de tu micrófono y que la demostración se grabe con fines de calidad y mejora.",
      connecting: "Conectando con Sara…", live: "Sara te está escuchando — háblale.", seconds: "seg", end: "Terminar",
      cta_title: "Eso fue solo una prueba", cta_sub: "Imagina a Sara atendiendo a todos tus clientes. Agenda tu llamada y activamos tu prueba gratis.", book: "Agendar mi llamada",
      limit_title: "Ya probaste el demo", book2: "Agendar mi llamada",
      retry: "Reintentar", or_book: "o agenda tu llamada",
      micdenied: "Para probar a Sara necesitas permitir tu micrófono — es lo que le da voz. Actívalo y reintenta, o agenda una llamada y la escuchas en vivo.",
      captcha: "No pudimos verificar que eres una persona. Recarga la página e inténtalo de nuevo.",
      generr: "Algo falló al conectar. Reintenta en un momento." },
    en: { title: "Talk to Sara", sub: "Our AI voice agent. Try her right now.",
      meta_dur: "Lasts about 70 seconds", meta_uses: "You can try it twice", meta_rec: "Recorded for quality control",
      accept: "Accept & talk to Sara", text_opt: "I'd rather try by text",
      consent_fine: "By accepting, you allow microphone use and that this demo is recorded for quality and improvement.",
      connecting: "Connecting to Sara…", live: "Sara is listening — talk to her.", seconds: "sec", end: "End",
      cta_title: "That was just a taste", cta_sub: "Imagine Sara handling every customer you have. Book your call and we activate your free trial.", book: "Book my call",
      limit_title: "You already tried the demo",
      retry: "Retry", or_book: "or book your call",
      micdenied: "To try Sara you need to allow your microphone — that's what gives her voice. Enable it and retry, or book a call to hear her live.",
      captcha: "We couldn't verify you're human. Please reload the page and try again.",
      generr: "Something went wrong connecting. Please retry in a moment." }
  };

  var CSS =
    '#vbc-demo{--vbc-accent:#19c39a;--vbc-ink:#0c1f1a;--vbc-glass:rgba(255,255,255,.14);' +
    'font-family:inherit;max-width:420px;margin:0 auto;color:#eafdf6;text-align:center}' +
    '#vbc-demo *{box-sizing:border-box}' +
    '#vbc-demo .vbc-card{position:relative;padding:30px 26px 26px;border-radius:24px;' +
    'background:linear-gradient(160deg,rgba(18,40,34,.65),rgba(8,20,17,.78));' +
    'backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);' +
    'border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 60px rgba(0,0,0,.45)}' +
    '#vbc-demo .vbc-title{font-size:1.5rem;line-height:1.2;margin:14px 0 6px;font-weight:700}' +
    '#vbc-demo .vbc-sub{font-size:1rem;opacity:.9;margin:0 0 14px}' +
    '#vbc-demo .vbc-meta{list-style:none;padding:0;margin:0 0 18px;display:flex;flex-direction:column;gap:8px;' +
    'font-size:.92rem;opacity:.85;align-items:center}' +
    '#vbc-demo .vbc-meta li{display:flex;align-items:center;gap:8px}' +
    '#vbc-demo .vbc-dot{width:6px;height:6px;border-radius:50%;background:var(--vbc-accent);box-shadow:0 0 8px var(--vbc-accent)}' +
    '#vbc-demo .vbc-fine{font-size:.72rem;opacity:.55;margin:14px 0 0;line-height:1.4}' +
    '#vbc-demo .vbc-glass{position:relative;display:inline-flex;align-items:center;justify-content:center;' +
    'width:100%;padding:15px 22px;border-radius:16px;border:1px solid rgba(255,255,255,.35);' +
    'background:linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,.08));' +
    'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
    'color:#fff;font-size:1.05rem;font-weight:600;letter-spacing:.2px;cursor:pointer;' +
    'text-decoration:none;overflow:hidden;transition:transform .15s ease,box-shadow .25s ease;' +
    'box-shadow:0 6px 24px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 8px rgba(0,0,0,.18)}' +
    '#vbc-demo .vbc-glass::before{content:"";position:absolute;inset:0;border-radius:inherit;' +
    'background:radial-gradient(120% 80% at 30% -10%,rgba(255,255,255,.55),transparent 60%);opacity:.7;pointer-events:none}' +
    '#vbc-demo .vbc-glass:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(25,195,154,.35),inset 0 1px 0 rgba(255,255,255,.6)}' +
    '#vbc-demo .vbc-glass:active{transform:translateY(0)}' +
    '#vbc-demo .vbc-cta{margin-top:4px}' +
    '#vbc-demo .vbc-link{background:none;border:0;color:#bfeede;opacity:.8;font-size:.9rem;' +
    'margin-top:12px;cursor:pointer;text-decoration:underline;display:inline-block}' +
    '#vbc-demo .vbc-link:hover{opacity:1}' +
    '#vbc-demo .vbc-orb{width:84px;height:84px;margin:0 auto;border-radius:50%;position:relative;' +
    'background:radial-gradient(circle at 35% 30%,#2af0c0,#0e8f72 70%);' +
    'box-shadow:0 0 30px rgba(25,195,154,.5),inset 0 2px 10px rgba(255,255,255,.4)}' +
    '#vbc-demo .vbc-orb--pulse{animation:vbcPulse 1.4s ease-in-out infinite}' +
    '#vbc-demo .vbc-orb--idle{animation:vbcFloat 4s ease-in-out infinite}' +
    '#vbc-demo .vbc-orb--live .vbc-ring{position:absolute;inset:-10px;border-radius:50%;' +
    'border:2px solid rgba(42,240,192,.6);animation:vbcRing 1.6s ease-out infinite}' +
    '@keyframes vbcPulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.08);opacity:1}}' +
    '@keyframes vbcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}' +
    '@keyframes vbcRing{0%{transform:scale(.9);opacity:.8}100%{transform:scale(1.5);opacity:0}}' +
    '#vbc-demo .vbc-timer{font-size:2.4rem;font-weight:700;margin:14px 0 6px}' +
    '#vbc-demo .vbc-timer small{font-size:.85rem;font-weight:400;opacity:.7;margin-left:6px}' +
    '#vbc-demo .vbc-ts{margin-top:10px;display:flex;justify-content:center;min-height:0}' +
    '#vbc-demo .vbc-view[hidden]{display:none}';

  var HTML =
    '<div class="vbc-card">' +
      '<div class="vbc-view" data-view="consent">' +
        '<div class="vbc-orb vbc-orb--idle"></div>' +
        '<h3 class="vbc-title" data-i18n="title"></h3>' +
        '<p class="vbc-sub" data-i18n="sub"></p>' +
        '<ul class="vbc-meta">' +
          '<li><span class="vbc-dot"></span><span data-i18n="meta_dur"></span></li>' +
          '<li><span class="vbc-dot"></span><span data-i18n="meta_uses"></span></li>' +
          '<li><span class="vbc-dot"></span><span data-i18n="meta_rec"></span></li>' +
        '</ul>' +
        '<button class="vbc-glass vbc-cta" data-act="accept" data-i18n="accept"></button>' +
        '<p class="vbc-fine" data-i18n="consent_fine"></p>' +
      '</div>' +
      '<div class="vbc-view" data-view="connecting" hidden>' +
        '<div class="vbc-orb vbc-orb--pulse"></div>' +
        '<p class="vbc-sub" data-i18n="connecting"></p>' +
      '</div>' +
      '<div class="vbc-view" data-view="live" hidden>' +
        '<div class="vbc-orb vbc-orb--live"><span class="vbc-ring"></span></div>' +
        '<p class="vbc-sub" data-i18n="live"></p>' +
        '<div class="vbc-timer"><span data-bind="count">70</span><small data-i18n="seconds"></small></div>' +
        '<button class="vbc-link" data-act="end" data-i18n="end"></button>' +
      '</div>' +
      '<div class="vbc-view" data-view="cta" hidden>' +
        '<div class="vbc-orb vbc-orb--idle"></div>' +
        '<h3 class="vbc-title" data-i18n="cta_title"></h3>' +
        '<p class="vbc-sub" data-i18n="cta_sub"></p>' +
        '<a class="vbc-glass vbc-cta" data-act="book" href="#"></a>' +
      '</div>' +
      '<div class="vbc-view" data-view="limit" hidden>' +
        '<div class="vbc-orb vbc-orb--idle"></div>' +
        '<h3 class="vbc-title" data-i18n="limit_title"></h3>' +
        '<p class="vbc-sub" data-bind="limitMsg"></p>' +
        '<a class="vbc-glass vbc-cta" data-act="book" href="#"></a>' +
      '</div>' +
      '<div class="vbc-view" data-view="error" hidden>' +
        '<div class="vbc-orb vbc-orb--idle"></div>' +
        '<p class="vbc-sub" data-bind="errMsg"></p>' +
        '<button class="vbc-glass vbc-cta" data-act="retry" data-i18n="retry"></button>' +
        '<a class="vbc-link" data-act="book" href="#" data-i18n="or_book"></a>' +
      '</div>' +
      '<div id="vbc-turnstile" class="vbc-ts"></div>' +
    '</div>';

  function injectCSS() {
    if (document.getElementById("vbc-demo-css")) return;
    var st = document.createElement("style");
    st.id = "vbc-demo-css";
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function loadTurnstile() {
    if (window.turnstile || document.getElementById("vbc-ts-api")) return;
    var s = document.createElement("script");
    s.id = "vbc-ts-api";
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  }

  // --- monta y arranca el widget sobre el host #vbc-demo ---
  function start(root) {
    if (root.__vbcStarted) return;
    root.__vbcStarted = true;

    injectCSS();
    loadTurnstile();
    root.innerHTML = HTML;
    root.dataset.state = "consent";

    var lang = detectLang();
    var t = T[lang];

    var show = function (v) { root.querySelectorAll(".vbc-view").forEach(function (el) { el.hidden = el.dataset.view !== v; }); root.dataset.state = v; };
    var bind = function (k, val) { root.querySelectorAll('[data-bind="' + k + '"]').forEach(function (el) { el.textContent = val; }); };

    // i18n fill
    root.querySelectorAll("[data-i18n]").forEach(function (el) { var k = el.dataset.i18n; if (t[k] != null) el.textContent = t[k]; });
    root.querySelectorAll('[data-act="book"]').forEach(function (a) { if (a.tagName === "A") { a.href = BOOKING + "?lang=" + lang; if (!a.textContent.trim()) a.textContent = t.book; } });
    root.querySelector('[data-view="cta"] [data-act="book"]').textContent = t.book;
    root.querySelector('[data-view="limit"] [data-act="book"]').textContent = t.book;

    var conv = null, tsWidgetId = null, timerInt = null, elapsed = 0, wrapSent = false;

    function fail(kind) { bind("errMsg", t[kind] || t.generr); show("error"); }

    function renderTurnstile(onToken) {
      var mount = root.querySelector("#vbc-turnstile");
      mount.innerHTML = "";
      var go = function () {
        tsWidgetId = window.turnstile.render(mount, {
          sitekey: SITEKEY, callback: onToken,
          "error-callback": function () { fail("captcha"); },
          "expired-callback": function () { if (tsWidgetId != null) window.turnstile.reset(tsWidgetId); }
        });
      };
      if (window.turnstile && window.turnstile.render) { go(); }
      else { var iv = setInterval(function () { if (window.turnstile && window.turnstile.render) { clearInterval(iv); go(); } }, 120); }
    }

    function gatekeep(token) {
      show("connecting");
      fetch(GATEKEEPER, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ turnstileToken: token }) })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data || data.allowed !== true) {
            if (data && data.reason === "limit") { bind("limitMsg", data.message || t.cta_sub); return show("limit"); }
            return fail(data && data.reason === "captcha" ? "captcha" : "generr");
          }
          startVoice(data.token);
        })
        .catch(function () { fail("generr"); });
    }

    function startVoice(conversationToken) {
      import("https://esm.sh/@elevenlabs/client@1.12.1").then(function (mod) {
        return mod.Conversation.startSession({
          conversationToken: conversationToken, connectionType: "webrtc",
          onConnect: function () { show("live"); startTimer(); },
          onDisconnect: function () { stopTimer(); show("cta"); },
          onError: function () { stopTimer(); fail("generr"); }
        });
      }).then(function (c) { conv = c; }).catch(function (e) {
        var denied = ("" + e).toLowerCase().match(/permission|denied|notallowed|microphone|getusermedia/);
        fail(denied ? "micdenied" : "generr");
      });
    }

    function startTimer() {
      elapsed = 0; wrapSent = false; bind("count", DEMO_SECONDS);
      timerInt = setInterval(function () {
        elapsed++;
        var left = Math.max(0, DEMO_SECONDS - elapsed); bind("count", left);
        if (elapsed >= WRAP_AT && !wrapSent && conv) { wrapSent = true;
          try { conv.sendContextualUpdate("[WRAP_UP] El tiempo de la demo casi termina. Cierra YA con tu remate: di que esto fue solo una prueba y que para verlo en su negocio agende una llamada para su prueba gratis. Hazlo en el idioma que la persona ha estado usando, breve y cálido."); } catch (e) {}
        }
        if (elapsed >= HARD_STOP) { endNow(); }
      }, 1000);
    }
    function stopTimer() { if (timerInt) { clearInterval(timerInt); timerInt = null; } }
    function endNow() { stopTimer(); try { if (conv) conv.endSession(); } catch (e) {} }

    root.addEventListener("click", function (e) {
      var hit = e.target.closest("[data-act]");
      var act = hit ? hit.dataset.act : null;
      if (!act) return;
      if (act === "accept") { renderTurnstile(function (token) { gatekeep(token); }); }
      if (act === "end") { endNow(); }
      if (act === "retry") { if (tsWidgetId != null && window.turnstile) { window.turnstile.reset(tsWidgetId); } show("consent"); }
    });

    show("consent");
  }

  // --- localiza el host #vbc-demo; si el popup carga tarde, lo espera ---
  function boot() {
    var existing = document.getElementById("vbc-demo");
    if (existing) return start(existing);
    var mo = new MutationObserver(function () {
      var el = document.getElementById("vbc-demo");
      if (el) { mo.disconnect(); start(el); }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
