/**
 * KreuzfahrtParkplatz.de / Kiel Valet view.
 * Framework-free, event handlers attached once, no external dependencies.
 * This phase intentionally does NOT collect payments or send customer data.
 */
'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const photoFiles = [
  ['assets/valet/valet-gallery-main.webp', 'Valet-Mitarbeiter empfängt eine Kreuzfahrtkundin'],
  ['assets/valet/valet-gallery-keys.webp', 'Persönliche Fahrzeugübergabe'],
  ['assets/valet/valet-gallery-port.webp', 'Kreuzfahrtschiff am Terminal'],
  ['assets/valet/valet-gallery-parking.webp', 'Parkbereich des Valet-Service'],
  ['assets/valet/valet-gallery-employee.webp', 'Valet-Mitarbeiter am Kreuzfahrtterminal']
];
let currentPhoto = 0;
const gallery = $('#photo-dialog');
function showPhoto(index) {
  currentPhoto = (index + photoFiles.length) % photoFiles.length;
  $('#lightbox-image').src = photoFiles[currentPhoto][0];
  $('#lightbox-image').alt = photoFiles[currentPhoto][1];
  $('#lightbox-count').textContent = `${currentPhoto + 1} / ${photoFiles.length}`;
}
$$('[data-photo]').forEach(button => button.addEventListener('click', () => {
  showPhoto(Number(button.dataset.photo));
  gallery.showModal();
}));
$('#gallery-close').addEventListener('click', () => gallery.close());
$('#gallery-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
$('#gallery-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
gallery.addEventListener('click', e => { if (e.target === gallery) gallery.close(); });
gallery.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') {e.preventDefault();showPhoto(currentPhoto - 1);}
  if (e.key === 'ArrowRight') {e.preventDefault();showPhoto(currentPhoto + 1);}
});

// Header interactions work at desktop and mobile sizes.
const nav = $('#main-nav');
const menu = $('#menu-toggle');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', e => {
  if (e.target.closest('a')) {nav.classList.remove('is-open');menu.setAttribute('aria-expanded', 'false');}
});
$('#favorite-trigger').addEventListener('click', e => {
  const button=e.currentTarget;
  const active=button.getAttribute('aria-pressed')!=='true';
  button.setAttribute('aria-pressed', String(active));
  button.querySelector('span').textContent=active?'Favoriten (1)':'Favoriten';
});
$('#account-trigger').addEventListener('click', () => {
  // Future account screen is outside client-provided Kiel page scope.
  $('#info-dialog').showModal();
  $('#info-dialog h2').textContent = 'Mein Konto';
  $('#info-dialog p').textContent = 'Die Kontoansicht wird mit den vorgesehenen Kundenseiten verbunden.';
});

// Map button provides a genuinely navigable location in the browser.
$('#map-cta').addEventListener('click', () => {
  window.open('https://www.google.com/maps/search/?api=1&query=Ostseekai%20Kiel', '_blank', 'noopener,noreferrer');
});
// Booking is a local front-end preview, not a payment gateway or external form.
$('#book-valet').addEventListener('click', () => $('#booking-dialog').showModal());
$('#booking-continue').addEventListener('click', () => {
  const form=$('#booking-dialog form');
  if (!form.reportValidity()) return;
  $('#book-status').textContent = 'Daten geprüft. Der nächste Schritt „Bestellablauf 01 – Valet Parking“ wird in der nächsten Projektphase verbunden. Es wurde keine Buchung durchgeführt.';
});
$('#insurance-details').addEventListener('click', openInsurance);
$('#allianz-more').addEventListener('click', openInsurance);
function openInsurance() {
  $('#info-dialog h2').textContent = 'Allianz Parkplatzschutz';
  $('#info-dialog p').textContent = 'Allianz Parkplatzschutz ist bei qualifizierenden Buchungen inklusive. Der konkrete Leistungsumfang richtet sich nach den geltenden Versicherungsbedingungen.';
  $('#info-dialog').showModal();
}
$('#info-close').addEventListener('click', () => $('#info-dialog').close());
$('#info-ok').addEventListener('click', () => $('#info-dialog').close());

// The Customer Service destination is delivered with a later client screen.
$('#nav-service').addEventListener('click',()=>{
  $('#info-dialog h2').textContent='Kundenservice';
  $('#info-dialog p').textContent='Diese Service-Ansicht wird mit der vom Auftraggeber bereitgestellten Kundenservice-Seite verbunden.';
  $('#info-dialog').showModal();
});
