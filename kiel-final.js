/**
 * Kiel V7 — small progressive enhancement for page navigation/controls.
 * The independent Anreise/Rückkehr calendars, filter, map, sorting and
 * reviews remain owned by the original individual JS modules.
 * No dates, claims of actual availability, or design copy are modified here.
 */
(() => {
  'use strict';
  const faqButton = document.getElementById('help-faq');
  const faq = document.getElementById('kiel-faq');
  // The existing help dropdown handler closes its panel. Keep this usable by
  // leading keyboard and touch users to the real FAQ block on this page.
  faqButton?.addEventListener('click', () => {
    faq?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  });
  // Never claim a reservation exists: all prices/ratings shown are the supplied
  // Kiel prototype examples, and availability is not a live backend feed.
})();
