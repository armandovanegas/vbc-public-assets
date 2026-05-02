(function() {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function init() {
    var form = $('vbc-trial-form');
    if (!form) return;
    var submitBtn = $('vbc-trial-submit');
    var wrap = $('vbc-trial-form-wrap');
    var success = $('vbc-trial-success');

    function validate() {
      var name = $('ft-name').value.trim();
      var business = $('ft-business').value.trim();
      var email = $('ft-email').value.trim();
      var phone = $('ft-phone').value.trim();
      var industry = $('ft-industry').value;
      var language = $('ft-language').value;
      if (!name) return 'Nombre requerido';
      if (!business) return 'Nombre del negocio requerido';
      if (!email) return 'Correo requerido';
      if (email.indexOf('@') < 1) return 'Correo no v&aacute;lido';
      if (!phone || phone.length < 7) return 'Tel&eacute;fono requerido';
      if (!industry) return 'Industria requerida';
      if (!language) return 'Idioma requerido';
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
      submitBtn.textContent = 'Enviando...';
      var data = gather();
      persistLocal(data);
      submitToServer(data).then(function() {
        showSuccess();
        try { console.log('VBC lead captured', data); } catch (e) {}
        // Open mailto in new tab as backup so Armando also gets it directly
        try {
          var mailto = document.createElement('a');
          mailto.href = 'mailto:armando@armandovanegas.com?subject=' + encodeURIComponent('VBC Lead: ' + data.name) + '&body=' + encodeURIComponent(JSON.stringify(data, null, 2));
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
