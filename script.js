/* ============================================================================
   KreuzfahrtParkplatz.de | Progressive interaction layer
   No external libraries; small isolated methods; no backend or real booking.
   The later Kiel comparison page can read the selected search parameters.
   ============================================================================ */
(() => {
  'use strict';

  const state = { port: '', arrival: '', departure: '', line: '', parkingType: '', activeDate: null, calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1) };
  const $ = (id) => document.getElementById(id);
  const buttons = [...document.querySelectorAll('[data-menu]')];
  const datePanels = { arrival: $('arrival-calendar'), departure: $('departure-calendar') };
  const dateTriggers = [$('arrival-trigger'), $('departure-trigger')];
  const dateFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const monthFormat = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
  const pad = (number) => String(number).padStart(2, '0');
  const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const fromISO = (text) => { const [year, month, day] = text.split('-').map(Number); return new Date(year, month - 1, day); };

  function closePopups(except = '') {
    for (const button of buttons) {
      if (button.dataset.menu !== except) button.setAttribute('aria-expanded', 'false');
    }
    for (const element of document.querySelectorAll('.nav-dropdown, .field-options')) {
      if (element.id !== except) element.hidden = true;
    }
    for (const button of [...dateTriggers, $('port-trigger'), $('line-trigger')]) {
      if (button.id !== except) button.setAttribute('aria-expanded', 'false');
    }
    for (const panel of Object.values(datePanels)) { if (except !== panel.id) panel.hidden = true; }
    for (const id of ['favorites-panel', 'account-panel', 'hilfe-panel']) {
      if (except !== id) $(id).hidden = true;
    }
  }

  // Header menu buttons. Items only cover the current, Kiel-only prototype scope.
  buttons.forEach((button) => button.addEventListener('click', () => {
    const panel = $(button.dataset.menu);
    const open = panel.hidden;
    closePopups();
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  }));

  $('mobile-menu-trigger').addEventListener('click', (event) => {
    const open = $('hauptnavigation').classList.toggle('is-open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });

  for (const [trigger, panel] of [['favorites-trigger', 'favorites-panel'], ['account-trigger', 'account-panel']]) {
    $(trigger).addEventListener('click', () => {
      const open = $(panel).hidden;
      closePopups();
      $(panel).hidden = !open;
      $(trigger).setAttribute('aria-expanded', String(open));
    });
  }

  function selectPort(value) {
    state.port = value;
    $('port-display').textContent = value;
    $('port-trigger').setAttribute('aria-expanded', 'false');
    $('port-options').querySelectorAll('[role="option"]').forEach((item) => item.setAttribute('aria-selected', String(item.dataset.portOption === value)));
    closePopups();
  }
  function selectLine(value) {
    state.line = value;
    $('line-display').textContent = value || 'z. B. AIDA';
    closePopups();
  }

  $('port-trigger').addEventListener('click', () => {
    const open = $('port-options').hidden;
    closePopups();
    $('port-options').hidden = !open;
    $('port-trigger').setAttribute('aria-expanded', String(open));
  });
  $('line-trigger').addEventListener('click', () => {
    const open = $('line-options').hidden;
    closePopups();
    $('line-options').hidden = !open;
    $('line-trigger').setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('[data-port-option], [data-select-port]').forEach((node) => node.addEventListener('click', () => selectPort(node.dataset.portOption ?? node.dataset.selectPort)));
  document.querySelectorAll('[data-line-option], [data-select-line]').forEach((node) => node.addEventListener('click', () => selectLine(node.dataset.lineOption ?? node.dataset.selectLine)));
  document.querySelectorAll('[data-parking-type]').forEach((node) => node.addEventListener('click', () => {
    state.parkingType = node.dataset.parkingType;
    closePopups();
    showMessage(`Parkart „${state.parkingType}“ ausgewählt. Bitte Reisedaten eingeben.`);
  }));
  // These are REAL fragment links to the existing search interface, not dead links.
  // Later screens will replace them with their approved Kiel detail/SEO URLs.
  document.querySelectorAll('[data-select-port], [data-select-line], [data-parking-type]').forEach((node) => {
    node.addEventListener('click', () => { $('hauptnavigation').classList.remove('is-open'); $('mobile-menu-trigger').setAttribute('aria-expanded', 'false'); });
  });
  document.querySelectorAll('[data-open-help]').forEach((node) => node.addEventListener('click', (event) => {
    event.preventDefault(); closePopups('hilfe-panel'); $('hilfe-panel').hidden = false;
  }));
  document.querySelectorAll('[data-close-panel]').forEach((node) => node.addEventListener('click', () => { closePopups(); }));

  /* ========================================================================
     GERMAN DATE PICKERS: Two independent calendars for Anreise and Rückkehr.
     Each popup is anchored to its own search field.  The controls and months
     use genuine German labels (no English browser-dependent text).  Dates
     are stored as ISO YYYY-MM-DD for later Kiel comparison integration.
     ======================================================================== */
  function renderCalendar(type) {
    const panel = datePanels[type];
    const month = state.calendarMonths[type];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    panel.querySelector('.current-month').textContent = monthFormat.format(month);
    const grid = panel.querySelector('.calendar-days');
    grid.replaceChildren();
    // Monday-first layout is the German convention.
    const emptyDays = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    for (let i = 0; i < emptyDays; i++) {
      const placeholder = document.createElement('span');
      placeholder.className = 'calendar-empty';
      placeholder.setAttribute('aria-hidden', 'true');
      grid.append(placeholder);
    }
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    for (let day = 1; day <= lastDay; day++) {
      const chosen = new Date(year, monthIndex, day);
      const iso = toISO(chosen);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-day';
      button.textContent = String(day);
      button.setAttribute('aria-label', dateFormat.format(chosen));
      const earlierThanArrival = type === 'departure' && state.arrival && iso < state.arrival;
      button.disabled = chosen < today || Boolean(earlierThanArrival);
      button.setAttribute('aria-pressed', String(state[type] === iso));
      if (state[type] === iso) button.classList.add('selected');
      button.addEventListener('click', () => {
        state[type] = iso;
        $(type === 'arrival' ? 'arrival-display' : 'departure-display').textContent = dateFormat.format(chosen);
        // Prevent silently retaining an impossible return date.
        if (type === 'arrival' && state.departure && state.departure < iso) {
          state.departure = '';
          $('departure-display').textContent = 'Datum wählen';
        }
        closePopups();
        // After choosing arrival, open the second separate date bar.
        if (type === 'arrival') {
          const departureBase = state.departure ? fromISO(state.departure) : chosen;
          state.calendarMonths.departure = new Date(departureBase.getFullYear(), departureBase.getMonth(), 1);
          datePanels.departure.hidden = false;
          $('departure-trigger').setAttribute('aria-expanded', 'true');
          renderCalendar('departure');
        }
      });
      grid.append(button);
    }
    // Earlier months are not accessible, preserving the min(today) constraint.
    const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    panel.querySelector('[data-month-shift="-1"]').disabled = month <= firstDayCurrentMonth;
  }
  state.calendarMonths = {
    arrival: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    departure: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  };
  dateTriggers.forEach((trigger) => {
    const type = trigger.dataset.dateType;
    const panel = datePanels[type];
    trigger.addEventListener('click', () => {
      const shouldOpen = panel.hidden;
      closePopups();
      if (!shouldOpen) return;
      const selected = state[type] || (type === 'departure' && state.arrival);
      const base = selected ? fromISO(selected) : new Date();
      state.calendarMonths[type] = new Date(base.getFullYear(), base.getMonth(), 1);
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      renderCalendar(type);
    });
    panel.querySelectorAll('[data-month-shift]').forEach((control) => {
      control.addEventListener('click', () => {
        const current = state.calendarMonths[type];
        state.calendarMonths[type] = new Date(current.getFullYear(), current.getMonth() + Number(control.dataset.monthShift), 1);
        renderCalendar(type);
      });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closePopups(); $('hauptnavigation').classList.remove('is-open'); $('mobile-menu-trigger').setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.nav-item, .search-field, .date-panel, .header-actions, .header-panel')) closePopups();
  });

  const message = $('search-message');
  function showMessage(text, error = false) {
    message.textContent = text;
    message.classList.toggle('error', error);
    message.hidden = false;
  }
  // Port cards: the current commissioning scope covers Kiel only. The other
  // reference cards remain visible and clickable, but do not point to invented
  // live results. Their status is announced accessibly in a local panel.
  const portsFeedback = $('ports-feedback');
  function setPortsFeedback(text) {
    portsFeedback.textContent = text;
    portsFeedback.hidden = false;
  }
  document.querySelectorAll('[data-future-port]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const name = link.dataset.futurePort;
      setPortsFeedback(`Parkplätze in ${name} werden in einer späteren, separat beauftragten Phase ergänzt. Aktuell ist Kiel verfügbar.`);
      portsFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
  document.querySelector('[data-port-directory]')?.addEventListener('click', (event) => {
    event.preventDefault();
    setPortsFeedback('Die Übersicht zeigt derzeit Kiel, Hamburg, Warnemünde und Bremerhaven. Buchbare Vergleichsinhalte werden zunächst für Kiel umgesetzt.');
  });

  // -------------------------------------------------------------------------
  // HOME 05/06 progressive enhancement: selecting a parking category or cruise
  // line prepares the Kiel-only search form. No fabricated comparison pages.
  // Data attributes are shared with the existing navigation handlers above.
  // -------------------------------------------------------------------------
  document.querySelectorAll('[data-home-card]').forEach((link) => {
    link.addEventListener('click', () => {
      selectPort('Kiel');
      const type = link.dataset.homeCard === 'parkplatz' ? link.dataset.parkingType : '';
      if (type) showMessage(`Parkart „${type}“ ausgewählt. Bitte wähle deinen Reisezeitraum.`);
      if (link.dataset.homeCard === 'reederei') showMessage(`Reederei „${link.dataset.selectLine}“ ausgewählt. Bitte wähle deinen Reisezeitraum.`);
    });
  });
  // The "all cruise lines" link keeps its original look but explains the
  // presently implemented list instead of navigating to a missing page.
  $('all-cruiselines')?.addEventListener('click', (event) => {
    event.preventDefault();
    const feedback = $('cruise-lines-feedback');
    feedback.textContent = 'Derzeit stehen AIDA, Mein Schiff, MSC Cruises und Costa zur Auswahl. Kreuzfahrtparkplätze werden in dieser Projektphase für Kiel umgesetzt.';
    feedback.hidden = false;
  });

  $('parkplatzsuche').addEventListener('submit', (event) => {
    event.preventDefault();
    closePopups();
    if (!state.port) return showMessage('Bitte wähle zuerst einen Abfahrtshafen aus.', true);
    if (!state.arrival || !state.departure) return showMessage('Bitte wähle Anreise- und Rückreisedatum aus.', true);
    if (state.departure < state.arrival) return showMessage('Das Rückreisedatum muss nach dem Anreisedatum liegen.', true);

    const query = new URLSearchParams({ hafen: state.port, anreise: state.arrival, rueckkehr: state.departure });
    if (state.line) query.set('reederei', state.line);
    if (state.parkingType) query.set('parkart', state.parkingType);
    // The next project phase will implement the real comparison listing from Kiel Auswahl 01.
    // A nonfunctional page is NOT linked prematurely; saved parameters are ready for integration.
    try { sessionStorage.setItem('kreuzfahrt-search', query.toString()); } catch (_) { /* private-mode storage may be blocked */ }
    window.location.assign('kiel.html?' + query.toString());
  });
})();


/* ==========================================================================
   HOME 08 — Review carousel (progressive enhancement, no dependencies).
   Rotate the three APPROVED testimonials. The desktop shows all three and
   changes their visual ordering. Tablet shows the next two, mobile one.
   Buttons are native keyboard-accessible controls and have ARIA labels.
   ========================================================================== */
(() => {
  'use strict';
  const cards = [...document.querySelectorAll('#review-list .review-card')];
  const next = document.getElementById('review-next');
  const previous = document.getElementById('review-previous');
  const live = document.getElementById('review-update');
  if (cards.length !== 3 || !next || !previous) return;
  let index = 0;
  const render = () => {
    cards.forEach((card, original) => {
      const slot = ((original - index + cards.length) % cards.length) + 1;
      card.style.order = String(slot);
      card.dataset.visualSlot = String(slot);
    });
    live.textContent = `Kundenstimme ${index + 1} von ${cards.length}: ${cards[index].querySelector('.review-person strong').textContent}`;
  };
  next.addEventListener('click', () => { index = (index + 1) % cards.length; render(); });
  previous.addEventListener('click', () => { index = (index - 1 + cards.length) % cards.length; render(); });
  document.getElementById('all-reviews-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    const message = document.getElementById('reviews-feedback');
    message.hidden = false;
    message.textContent = 'Hier siehst du die drei in der Designvorlage enthaltenen Kundenstimmen. Weitere Bewertungen werden mit der vollständigen Plattform angebunden.';
  });
  render();
})();


/* ========================================================================
   V9 HOME FOOTER / progressive, accessible interactions.
   The Kiel prototype is the only committed port in the brief. Other ports,
   legal contents and partner application are not invented here; we show a
   clear inline note instead of broken links or a fake functional workflow.
   ======================================================================== */
(() => {
  'use strict';
  const footer = document.getElementById('startseite-footer');
  if (!footer) return;
  const feedback = document.getElementById('footer-message');
  const countryButton = document.getElementById('footer-country-toggle');
  const countryPanel = document.getElementById('footer-country-options');
  const showFeedback = (message) => {
    feedback.textContent = message;
    feedback.hidden = false;
    feedback.scrollIntoView({behavior:'smooth',block:'nearest'});
  };
  footer.querySelectorAll('[data-footer-future]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showFeedback(`Die Seite für ${link.dataset.footerFuture} ist für eine spätere, separat beauftragte Phase vorgesehen. Der interaktive Prototyp umfasst zunächst Kiel.`);
    });
  });
  footer.querySelectorAll('[data-footer-legal]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showFeedback(`„${link.dataset.footerLegal}“ ist in den übergebenen Kiel-Designvorlagen noch nicht als fertige Unterseite enthalten. Dieser Link wird in der vollständigen Plattform angeschlossen.`);
    });
  });
  footer.querySelectorAll('[data-footer-kiel]').forEach((link) => {
    link.addEventListener('click', () => {
      // Existing V8 [data-select-line] delegates selection in the shared app;
      // port selection explicitly requested only when not already on the form.
      if (link.dataset.selectLine) {
        // Original cruise-line behavior is already connected by V8 script.
      }
      const currentPort = document.getElementById('port-display');
      if (currentPort && currentPort.textContent.trim() !== 'Kiel') {
        const originalKiel = document.querySelector('#port-options [data-port-option="Kiel"]');
        originalKiel?.click();
      }
    });
  });
  countryButton?.addEventListener('click', () => {
    const expand = countryButton.getAttribute('aria-expanded') !== 'true';
    countryPanel.hidden = !expand;
    countryButton.setAttribute('aria-expanded',String(expand));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && countryPanel && !countryPanel.hidden) {
      countryPanel.hidden = true;
      countryButton.setAttribute('aria-expanded','false');
      countryButton.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (countryPanel && !event.target.closest('.footer-country')) {
      countryPanel.hidden = true;
      countryButton.setAttribute('aria-expanded','false');
    }
  });
})();
