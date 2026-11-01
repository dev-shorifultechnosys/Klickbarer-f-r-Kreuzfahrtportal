/**
 * Kiel Auswahl footer interactions (only this page's footer).
 * No backend/network dependency; placeholder pages do not pretend to exist.
 * Homepage footer is intentionally untouched and uses its own script.
 */
(() => {
  'use strict';
  const footer = document.getElementById('kiel-auswahl-footer');
  if (!footer) return;
  const status = footer.querySelector('#footer-message');
  const countryButton = footer.querySelector('#footer-country-toggle');
  const countryPanel = footer.querySelector('#footer-country-options');
  const results = document.getElementById('kiel-vergleich');

  function notice(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  footer.querySelectorAll('[data-footer-future]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      notice(`Die Seite „${anchor.dataset.footerFuture}“ ist nicht Teil des aktuellen Kiel-Prototyps. Weitere Häfen werden separat umgesetzt.`);
    });
  });
  footer.querySelectorAll('[data-footer-legal]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      notice(`Die Unterseite „${anchor.dataset.footerLegal}“ wird im vollständigen Portal angeschlossen. Hier wird noch keine rechtliche Seite vorgetäuscht.`);
    });
  });
  footer.querySelectorAll('[data-footer-route]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      // The standalone terminal or cruise-line SEO pages are not implemented.
      // Guide the user to the real Kiel results instead of a broken URL.
      const line = anchor.dataset.selectLine;
      if (line) {
        const option = document.querySelector(`#line-options [data-line-option="${CSS.escape(line)}"]`);
        option?.click();
      }
      results?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
  // The four harbor links in the Kiel footer are genuine in-page links.
  footer.querySelectorAll('[data-footer-kiel]:not([data-footer-route])').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      results?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
  function closeCountry() {
    if (!countryButton || !countryPanel) return;
    countryPanel.hidden = true;
    countryButton.setAttribute('aria-expanded','false');
  }
  countryButton?.addEventListener('click', () => {
    const isOpening = countryButton.getAttribute('aria-expanded') !== 'true';
    countryPanel.hidden = !isOpening;
    countryButton.setAttribute('aria-expanded',String(isOpening));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && countryPanel && !countryPanel.hidden) {
      closeCountry(); countryButton?.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (countryPanel && !countryPanel.hidden && !event.target.closest('#kiel-auswahl-footer .footer-country')) closeCountry();
  });
})();
