/* ============================================================================
   SEO KIEL — independent and accessible vanilla JavaScript behaviors.
   Visual reference dates are May 2026; in this November 2026 build those
   dates are historical. Keep the client design visible, but require future
   dates before simulating offer search. NO backend, availability or payment.
   ============================================================================ */
(()=>{'use strict';
  const $=(s,scope=document)=>scope.querySelector(s);
  const $$=(s,scope=document)=>[...scope.querySelectorAll(s)];
  const dateFormat=new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
  const monthFormat=new Intl.DateTimeFormat('de-DE',{month:'long',year:'numeric'});
  const today=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());};
  const dateISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseISO=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);};
  const state={arrival:null,departure:null,line:'',visible:null,month:{arrival:new Date(today().getFullYear(),today().getMonth(),1),departure:new Date(today().getFullYear(),today().getMonth(),1)}};
  const els={arrival:{button:$('#kiel-arrival-trigger'),panel:$('#kiel-arrival-calendar'),text:$('#kiel-arrival-value')},departure:{button:$('#kiel-departure-trigger'),panel:$('#kiel-departure-calendar'),text:$('#kiel-departure-value')}};
  const status=$('#kiel-search-status');
  const feedback=(txt,error=false)=>{status.textContent=txt;status.dataset.error=String(error);status.hidden=false;};
  const menuButtons=$$('[data-menu]');
  function hideAll(except){
    menuButtons.forEach(b=>{const panel=$('#'+b.dataset.menu),keep=panel===except;panel.hidden=!keep;b.setAttribute('aria-expanded',String(keep));});
    Object.values(els).forEach(e=>{const keep=e.panel===except;e.panel.hidden=!keep;e.button.setAttribute('aria-expanded',String(keep));});
    const line=$('#kiel-line-options');line.hidden=line!==except;$('#kiel-line-trigger').setAttribute('aria-expanded',String(line===except));
    for(const id of ['favorites-panel','account-panel','help-panel']) $('#'+id).hidden=$('#'+id)!==except;
    for(const id of ['favorites-trigger','account-trigger']){let b=$('#'+id);b.setAttribute('aria-expanded',String($('#'+b.getAttribute('aria-controls'))===except));}
  }
  menuButtons.forEach(b=>b.addEventListener('click',()=>{const panel=$('#'+b.dataset.menu);hideAll(panel.hidden?panel:null);}));
  for(const id of ['favorites-trigger','account-trigger'])$('#'+id).addEventListener('click',()=>{const p=$('#'+$('#'+id).getAttribute('aria-controls'));hideAll(p.hidden?p:null);});
  for(const id of ['help-faq','help-service'])$('#'+id).addEventListener('click',()=>{hideAll($('#help-panel'));});
  const mt=$('#mobile-menu-trigger');mt.addEventListener('click',()=>{const open=$('#hauptnavigation').classList.toggle('is-open');mt.setAttribute('aria-expanded',String(open));mt.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');});
  function renderCalendar(kind){
    const panel=els[kind].panel,month=state.month[kind],grid=$('.calendar-days',panel);grid.replaceChildren();
    $('.current-month',panel).textContent=monthFormat.format(month);
    const dayZero=(new Date(month.getFullYear(),month.getMonth(),1).getDay()+6)%7;
    for(let i=0;i<dayZero;i++){const sp=document.createElement('span');sp.className='calendar-empty';grid.append(sp);}
    const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    const minimum=kind==='departure'&&state.arrival?new Date(parseISO(state.arrival).getTime()+86400000):today();
    for(let n=1;n<=count;n++){
      const date=new Date(month.getFullYear(),month.getMonth(),n);
      const button=document.createElement('button');button.type='button';button.className='calendar-day';button.textContent=String(n);
      button.disabled=date<minimum;button.setAttribute('aria-label',dateFormat.format(date));
      if(state[kind]===dateISO(date))button.classList.add('selected');
      button.addEventListener('click',()=>{
        state[kind]=dateISO(date);els[kind].text.textContent=dateFormat.format(date);
        if(kind==='arrival'&&state.departure&&parseISO(state.departure)<=date){state.departure=null;els.departure.text.textContent='Datum wählen';}
        hideAll();
        if(kind==='arrival'){openCalendar('departure');}
        else status.hidden=true;
      });grid.append(button);
    }
    $('.month-control[data-month-shift="-1"]',panel).disabled=month.getFullYear()===minimum.getFullYear()&&month.getMonth()<=minimum.getMonth();
  }
  function openCalendar(kind){const panel=els[kind].panel;const min=kind==='departure'&&state.arrival?parseISO(state.arrival):today();let baseline=state[kind]?parseISO(state[kind]):min;if(baseline<today())baseline=today();state.month[kind]=new Date(baseline.getFullYear(),baseline.getMonth(),1);hideAll(panel);renderCalendar(kind);}
  for(const [kind,e] of Object.entries(els)){
    e.button.addEventListener('click',()=>{const wasHidden=e.panel.hidden;hideAll();if(wasHidden)openCalendar(kind);});
    $$('[data-month-shift]',e.panel).forEach(b=>b.addEventListener('click',()=>{const m=state.month[kind];state.month[kind]=new Date(m.getFullYear(),m.getMonth()+Number(b.dataset.monthShift),1);renderCalendar(kind);}));
  }
  $('#kiel-line-trigger').addEventListener('click',()=>{const panel=$('#kiel-line-options');hideAll(panel.hidden?panel:null);});
  const setLine=value=>{state.line=value;$('#kiel-line-value').textContent=value||'z. B. AIDA';$$('#kiel-line-options [role=option]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.line===value)));hideAll();};
  $$('[data-line]').forEach(b=>b.addEventListener('click',()=>setLine(b.dataset.line)));
  $$('[data-choose-line]').forEach(b=>b.addEventListener('click',()=>{setLine(b.dataset.chooseLine);$('#hauptnavigation').classList.remove('is-open');}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideAll();$('#hauptnavigation').classList.remove('is-open');mt.setAttribute('aria-expanded','false');}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-item,.kiel-search__field,.header-actions,.header-panel,.kiel-date'))hideAll();});
  // Home → Kiel is a true local navigation with selected query parameters.
  const query=new URLSearchParams(location.search);
  if(query.has('anreise')&&/^\d{4}-\d{2}-\d{2}$/.test(query.get('anreise'))){const date=parseISO(query.get('anreise'));if(date>=today()){state.arrival=query.get('anreise');els.arrival.text.textContent=dateFormat.format(date);}}
  if(query.has('rueckkehr')&&/^\d{4}-\d{2}-\d{2}$/.test(query.get('rueckkehr'))){const date=parseISO(query.get('rueckkehr'));if(date>=today()&&(!state.arrival||date>parseISO(state.arrival))){state.departure=query.get('rueckkehr');els.departure.text.textContent=dateFormat.format(date);}}
  if(query.has('reederei')){const r=query.get('reederei');if(['AIDA','Mein Schiff','MSC','Costa'].includes(r))setLine(r);}
  $('#kiel-search').addEventListener('submit',event=>{
    event.preventDefault();hideAll();
    if(!state.arrival||!state.departure){feedback('Bitte wähle ein zukünftiges Anreise- und Rückreisedatum aus. Die angezeigten Referenzdaten aus Mai 2026 sind bereits vergangen.',true);if(!state.arrival)openCalendar('arrival');return;}
    if(parseISO(state.departure)<=parseISO(state.arrival)){feedback('Die Rückkehr muss nach der Anreise liegen.',true);return;}
    const p=new URLSearchParams({hafen:'Kiel',anreise:state.arrival,rueckkehr:state.departure});if(state.line)p.set('reederei',state.line);
    try{sessionStorage.setItem('kreuzfahrt-search',p.toString());}catch(e){};
    // A UI-only acknowledgement, NOT a claim of inventory or availability. The
    // approved Kiel comparison listing must be built in the next section.
    feedback(`Suchdaten übernommen: Kiel · ${dateFormat.format(parseISO(state.arrival))} bis ${dateFormat.format(parseISO(state.departure))}${state.line?' · '+state.line:''}. Die Beispiele unten enthalten keine live geprüfte Verfügbarkeit.`);
    document.dispatchEvent(new CustomEvent('kiel:search',{detail:{arrival:state.arrival,departure:state.departure,line:state.line}}));
  });
})();
