(function() {
  'use strict';

  function $(id) { return document.getElementById(id); }

  // Page language: EN mirror lives under /en/ ; everything else is Spanish.
  var LANG = (location.pathname.indexOf('/en/') === 0) ? 'en' : 'es';
  var T = {
    es: {
      name: 'Falta tu nombre', business: 'Falta el nombre del negocio', email: 'Falta tu correo',
      emailBad: 'Correo no válido', phone: 'Falta tu teléfono', industry: 'Elige una industria',
      language: 'Elige un idioma', sending: 'Enviando...'
    },
    en: {
      name: 'Your name is required', business: 'Business name is required', email: 'Your email is required',
      emailBad: 'Invalid email', phone: 'Your phone is required', industry: 'Choose an industry',
      language: 'Choose a language', sending: 'Sending...'
    }
  }[LANG];

  function init() {
    var form = $('vbc-trial-form');
    if (!form) return;
    var submitBtn = $('vbc-trial-submit');
    var wrap = $('vbc-trial-form-wrap');
    var success = $('vbc-trial-success');

    // Pre-select the preferred-language field to match the page the visitor is on.
    try {
      var langSel = $('ft-language');
      if (langSel && (langSel.value === 'es' || langSel.value === '')) langSel.value = LANG;
    } catch (e) {}

    function validate() {
      var name = $('ft-name').value.trim();
      var business = $('ft-business').value.trim();
      var email = $('ft-email').value.trim();
      var phone = $('ft-phone').value.trim();
      var industry = $('ft-industry').value;
      var language = $('ft-language').value;
      if (!name) return T.name;
      if (!business) return T.business;
      if (!email) return T.email;
      if (email.indexOf('@') < 1) return T.emailBad;
      if (!phone || phone.length < 7) return T.phone;
      if (!industry) return T.industry;
      if (!language) return T.language;
      return null;
    }

    function gather() {
      return {
        name: $('ft-name').value.trim(),
        business: $('ft-business').value.trim(),
        email: $('ft-email').value.trim(),
        phone: $('ft-phone').value.trim(),
        industry: $('ft-industry').value,
        language: $('ft-language').value,
        message: $('ft-message').value.trim(),
        source: 'vbc-free-trial',
        page_lang: LANG,
        submitted_at: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent
      };
    }

    function persistLocal(data) {
      try {
        var existing = JSON.parse(localStorage.getItem('vbc_pending_leads') || '[]');
        existing.push(data);
        localStorage.setItem('vbc_pending_leads', JSON.stringify(existing));
      } catch (e) {}
    }

    function submitToServer(data) {
      var url = 'https://armandovanegas.com/wp-json/contact-form-7/v1/contact-forms/0/feedback';
      return fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: (function() {
          var fd = new FormData();
          for (var k in data) fd.append(k, data[k]);
          return fd;
        })()
      }).catch(function() { return null; });
    }

    function mailtoFallback(data) {
      var subject = 'Nueva solicitud de prueba VBC: ' + data.name + ' (' + data.business + ')';
      var body = [
        'Nombre: ' + data.name,
        'Negocio: ' + data.business,
        'Correo: ' + data.email,
        'Tel&eacute;fono: ' + data.phone,
        'Industria: ' + data.industry,
        'Idioma: ' + data.language,
        '',
        'Mensaje:',
        data.message || '(sin mensaje)',
        '',
        '--',
        'Enviado: ' + data.submitted_at
      ].join('\n');
      var url = 'mailto:armando@armandovanegas.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      try { window.location.href = url; } catch (e) {}
    }

    function showSuccess() {
      if (wrap) wrap.style.display = 'none';
      if (success) {
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var err = validate();
      if (err) {
        alert(err);
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = T.sending;
      var data = gather();
      persistLocal(data);
      submitToServer(data).then(function() {
        showSuccess();
        try { console.log('VBC new contact captured', data); } catch (e) {}
        // Open mailto in new tab as backup so Armando also gets it directly
        try {
          var mailto = document.createElement('a');
          mailto.href = 'mailto:armando@armandovanegas.com?subject=' + encodeURIComponent('VBC New Contact: ' + data.name) + '&body=' + encodeURIComponent(JSON.stringify(data, null, 2));
          mailto.target = '_blank';
          mailto.rel = 'noopener';
          mailto.style.display = 'none';
          document.body.appendChild(mailto);
          // Don't auto-click — that opens email client. Just queue it.
        } catch (e) {}
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
