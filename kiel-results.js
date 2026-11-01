/* ===========================================================================
 Kiel Parkplatzvergleich: presentation-only dataset from supplied reference.
 NOT a server, reservation engine, verified review source, price quote or live
 availability. Replace DEMO_OFFERS with trusted provider API later.
 Vanilla ES2021+, no dependencies. Filter/sort favourites/accessible modal.
 =========================================================================== */
(()=>{'use strict';
 const $=(s,scope=document)=>scope.querySelector(s);const $$=(s,scope=document)=>Array.from(scope.querySelectorAll(s));
 const root=$('#kiel-vergleich');if(!root)return;
 const DEMO_OFFERS=[
  {id:'port',name:'Port Parking Kiel',image:'port-parking-kiel',tag:'Direkt am Terminal',tagStyle:'standard',price:139,rating:4.8,reviewCount:'1.248',terminal:'Ostseekai Kiel',distanceKm:1.8,walk:2,type:'terminal',typeLine:'Außenstellplatz',services:['video','24h'],details:[['clock','24/7 geöffnet'],['shield','Videoüberwachung'],['lock','Schlüssel bleibt bei dir']],recommended:true},
  {id:'shuttle',name:'Kiel Shuttle Parking',image:'kiel-shuttle-parking',tag:'Shuttle-Service',tagStyle:'shuttle',price:89,rating:4.6,reviewCount:'892',terminal:'Ostuferhafen',distanceKm:4.1,walk:5,type:'shuttle',typeLine:'Shuttle-Service inkl.',services:['shuttle','video','24h'],details:[['clock','24/7 geöffnet'],['shield','Videoüberwachung'],['parking','Halle & Außenstellplätze']]},
  {id:'garage',name:'Ostsee Parkhaus Kiel',image:'ostsee-parkhaus-kiel',tag:'Halle & Parkhaus',tagStyle:'standard',price:119,rating:4.4,reviewCount:'621',terminal:'Norwegenkai',distanceKm:2.8,walk:3,type:'garage',typeLine:'Parkhaus (überdacht)',services:['covered','video','charging','24h'],details:[['clock','24/7 geöffnet'],['shield','Videoüberwachung'],['charging','E-Ladestation']]},
  {id:'valet',name:'Kiel Valet Service',image:'kiel-valet-service',tag:'Valet Parking',tagStyle:'standard',price:159,rating:4.7,reviewCount:'410',terminal:'Ostseekai Kiel',distanceKm:0,walk:0,type:'valet',typeLine:'Valet-Service',services:['valet','video','24h'],details:[['clock','24/7 geöffnet'],['shield','Videoüberwachung'],['car','Fahrzeugübergabe am Terminal']]},
  {id:'city',name:'City Parking Kiel',image:'city-parking-kiel',tag:'Günstiger Preis',tagStyle:'standard',price:69,rating:4.2,reviewCount:'326',terminal:'Schwedenkai',distanceKm:6.7,walk:7,type:'shuttle',typeLine:'Shuttle-Service inkl.',services:['shuttle','video','24h'],details:[['clock','24/7 geöffnet'],['shield','Videoüberwachung'],['parking','Außenstellplätze']]}
 ];
 const icon=(key,cls='result-icon')=>`<svg class="${cls}" aria-hidden="true"><use href="#result-${key}"></use></svg>`;
 const labelText=p=>p.distanceKm===0?'Direkt am Terminal':p.walk+' Min. zum Terminal';
 const favs=new Set();let current=[];
 const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const renderCard=p=>`<article class="parking-offer ${p.recommended?'is-recommended':''}" data-offer="${p.id}" aria-label="${escapeText(p.name)}: ${p.price} Euro für 7 Tage">
 ${p.recommended?'<div class="parking-offer__recommendation">★ &nbsp;UNSERE EMPFEHLUNG</div>':''}
 <div class="parking-offer__main">
  <div class="parking-offer__photo"><img src="assets/results/${p.image}.webp" srcset="assets/results/${p.image}-630.webp 630w, assets/results/${p.image}.webp 1260w" sizes="(max-width:700px) 34vw, (max-width:1100px) 26vw, 330px" alt="${escapeText(p.name)} – ${escapeText(p.tag)} (illustrative Designvisualisierung)" width="1260" height="546" loading="lazy" decoding="async"><span class="parking-offer__tag ${p.tagStyle==='shuttle'?'tag--shuttle':''}">${icon('check')}${escapeText(p.tag)}</span></div>
  <div class="parking-offer__detail">
   <div class="parking-offer__titleline"><h3>${p.id==='valet'?`<a class="offer-detail-link" href="valet-kiel.html?from=kiel">${escapeText(p.name)}</a>`:escapeText(p.name)}</h3><button type="button" class="parking-offer__heart" data-fav="${p.id}" aria-pressed="${favs.has(p.id)}" aria-label="${favs.has(p.id)?'Aus Merkliste entfernen':'Zur Merkliste hinzufügen'}: ${escapeText(p.name)}">${icon('heart')}</button></div>
   <div class="parking-offer__rating"><span class="parking-offer__stars" aria-label="Sterne">★★★★★</span><strong>${p.rating.toFixed(1).replace('.',',')}</strong> <span class="review-count">(${p.reviewCount} Bewertungen)</span></div>
   <div class="parking-offer__location">${icon('pin')} <span>${escapeText(p.terminal)}</span></div>
   <div class="parking-offer__primary"><span>${icon(p.type==='valet'?'walk':'pin')}${escapeText(labelText(p))}</span><span>${icon(p.type==='garage'?'parking':p.type==='valet'?'key':p.type==='terminal'?'parking':'car')}${escapeText(p.typeLine)}</span></div>
   <div class="parking-offer__secondary">${p.details.map(([ic,s])=>`<span>${icon(ic)}${escapeText(s)}</span>`).join('')}</div>
  </div>
  <div class="parking-offer__price"><strong>${p.price} €</strong><span class="parking-offer__duration">für 7 Tage</span><span class="parking-offer__cancel">${icon('check')} Kostenlos stornierbar</span><button type="button" class="parking-offer__cta" data-offer-click="${p.id}">Verfügbarkeit prüfen ${icon('arrow')}</button></div>
 </div>
 <div class="parking-offer__protection"><img class="parking-offer__allianz" src="assets/allianz-original.webp" alt="Allianz" width="2000" height="517" loading="lazy" decoding="async"><span class="parking-offer__separator" aria-hidden="true"></span><span class="parking-offer__shield">${icon('shield')}</span><span class="parking-offer__protection-copy"><strong>Parkplatzschutz inklusive</strong><span>Extra geschützt während der Parkdauer – ohne Zusatzkosten.</span></span><button class="parking-offer__info" data-allianz type="button" aria-label="Informationen zum Allianz Parkplatzschutz">${icon('info')}</button></div>
 </article>`;
 const form=$('#filter-groups');const results=$('#parking-results-list');const feedback=$('#results-feedback');
 const heading=$('#kiel-results-title');const total=$('#results-total');const price=$('#price-range');const priceLabel=$('#price-label');
 const selected=name=>$$(`input[name="${name}"]:checked`,form).map(e=>e.value);
 const matchMulti=(p,kind)=>{const values=selected(kind);if(!values.length||values.includes('all'))return true;if(kind==='type')return values.includes(p.type);if(kind==='distance')return values.some(v=>v==='direct'?p.distanceKm===0:v==='over5'?p.distanceKm>5:p.distanceKm<=Number(v));if(kind==='rating')return values.some(v=>p.rating>=Number(v));if(kind==='service')return values.some(v=>p.services.includes(v));return true;};
 const isFilterActive=()=>['type','distance','rating','service'].some(name=>selected(name).some(v=>v!=='all'))||Number(price.value)!==300;
 function announce(s){feedback.textContent=s;feedback.hidden=false;}
 function rerender(){
   priceLabel.textContent=`0 € – ${price.value} €`;
   current=DEMO_OFFERS.filter(p=>p.price<=Number(price.value)&&['type','distance','rating','service'].every(g=>matchMulti(p,g)));
   const sort=$('#kiel-sort').value;
   if(sort==='price-low')current.sort((a,b)=>a.price-b.price);else if(sort==='price-high')current.sort((a,b)=>b.price-a.price);else if(sort==='rating')current.sort((a,b)=>b.rating-a.rating);else if(sort==='distance')current.sort((a,b)=>a.distanceKm-b.distanceKm);else current.sort((a,b)=>(b.recommended||0)-(a.recommended||0));
   results.innerHTML=current.length?current.map(renderCard).join(''):'<div class="results-feedback" role="status">Für diese Filterkombination gibt es in den fünf Musterangeboten keinen Treffer. Bitte Filter zurücksetzen.</div>';
   if(isFilterActive()){heading.textContent=`${current.length} passende Musterangebote in Kiel`;total.textContent=`${current.length} von 5 Mustern`;}
   else{heading.textContent='73 Parkplätze in Kiel';total.textContent='73 Ergebnisse';}
   const favLabel=$('#favorites-trigger span');if(favLabel)favLabel.textContent=`Merkliste (${favs.size})`;
   const favPanel=$('#favorites-panel');if(favPanel)favPanel.textContent=favs.size?'Gemerkte Anbieter: '+DEMO_OFFERS.filter(p=>favs.has(p.id)).map(p=>p.name).join(', '):'Deine Merkliste ist noch leer.';
 }
 // Multiple selections within the same facet are OR, across facets are AND.
 form.addEventListener('change',e=>{const control=e.target;if(control.matches('input[type="checkbox"]')&&['type','distance','rating'].includes(control.name)){
    const same=$$(`input[name="${control.name}"]`,form);if(control.value==='all'&&control.checked)same.filter(x=>x!==control).forEach(x=>x.checked=false);else if(control.value!=='all'&&control.checked)same.find(x=>x.value==='all').checked=false;
    if(!same.some(x=>x.checked))same.find(x=>x.value==='all').checked=true;
   }rerender();feedback.hidden=true;
 });
 price.addEventListener('input',()=>{rerender();feedback.hidden=true;});
 $('#kiel-sort').addEventListener('change',()=>{rerender();announce('Die fünf Musterangebote wurden nach deiner Auswahl neu sortiert.');});
 form.addEventListener('reset',()=>{requestAnimationFrame(()=>{rerender();feedback.hidden=true;});});
 $$('button.filter-title',form).forEach(button=>button.addEventListener('click',()=>{const panel=$('#'+button.getAttribute('aria-controls'));const expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));panel.hidden=expanded;}));
 const filterToggle=$('#mobile-filter-toggle');filterToggle.addEventListener('click',()=>{const open=form.classList.toggle('is-open');filterToggle.setAttribute('aria-expanded',String(open));filterToggle.textContent=open?'Filter schließen ⌃':'Filter anzeigen ⌄';});
 const dialog=$('#provider-dialog');const dialogBody=$('#provider-dialog-body');const closeDialog=()=>{if(dialog.open)dialog.close();};$('#provider-dialog-close').addEventListener('click',closeDialog);
 results.addEventListener('click',e=>{
   const heart=e.target.closest('[data-fav]');if(heart){favs.has(heart.dataset.fav)?favs.delete(heart.dataset.fav):favs.add(heart.dataset.fav);rerender();return;}
   const info=e.target.closest('[data-allianz]');if(info){dialogBody.innerHTML='<h2 id="provider-dialog-heading">Allianz Parkplatzschutz inklusive</h2><p>Extra geschützt während der Parkdauer – ohne Zusatzkosten für dich.</p><p>Der genaue Leistungsumfang richtet sich nach den jeweiligen Versicherungsbedingungen.</p>';dialog.showModal();return;}
   const btn=e.target.closest('[data-offer-click]');if(btn){const p=DEMO_OFFERS.find(n=>n.id===btn.dataset.offerClick);if(!p)return;
     // The Valet listing is now connected to the new client-matched provider detail page.
     if(p.id==='valet'){window.location.assign('valet-kiel.html?from=kiel');return;}
     dialogBody.innerHTML=`<h2 id="provider-dialog-heading">${escapeText(p.name)}</h2><p><strong>${p.price} € / 7 Tage</strong> · ${escapeText(p.terminal)} · ${escapeText(p.tag)}</p><p>Dies ist ein anklickbarer Entwurf. Die echte Verfügbarkeitsprüfung und Anbieter-Detailseite werden erst nach Anbindung der offiziellen Kiel-Daten bereitgestellt.</p>`;
     dialog.showModal();
   }
 });
 $$('.results-pages [data-page]').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.page==='1')announce('Seite 1: Die fünf vom Auftraggeber vorgegebenen Musterangebote werden angezeigt.');
  else announce(`Die Designvorlage zeigt 15 Ergebnisseiten. Für Seite ${b.dataset.page==='next'?'2':b.dataset.page==='prev'?'1':b.dataset.page} sind noch keine weiteren echten Anbieterdaten vorhanden. Die Ansicht bleibt bei Seite 1.`);
 }));
 document.addEventListener('kiel:search',e=>{root.scrollIntoView({behavior:'smooth',block:'start'});announce('Suchdaten aktualisiert (Prototyp): Die angezeigten Preise und verfügbaren Plätze sind nicht live.');});
 // CROSS-PAGE ROUTING / Home -> Kiel + selected parking category.
 // Exact category URL is kept linkable and works with browser Back/Forward.
 // Existing editable template data and sort/filter UI remain unchanged.
 const incomingParams = new URLSearchParams(window.location.search);
 const requestedCategory = incomingParams.get('parkart');
 if (['terminal', 'shuttle', 'garage', 'valet'].includes(requestedCategory)) {
   const categoryInputs = $$('input[name="type"]', form);
   categoryInputs.forEach(input => {input.checked = input.value === requestedCategory;});
   if (window.matchMedia('(max-width: 700px)').matches) {
     // Only expand filters if visitor explicitly opens the panel.
     filterToggle.setAttribute('aria-expanded', 'false');
   }
 }
 rerender();
})();
