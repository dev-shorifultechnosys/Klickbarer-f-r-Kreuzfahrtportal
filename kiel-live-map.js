/* =====================================================================
  Kiel live map — genuine OpenStreetMap map in an interactive iframe.
  No Leaflet dependency, API key, external font or build step.
  OpenStreetMap frame provides drag-to-pan and zoom controls when online.
  Marker controls select verified PORT terminals; do not invent parking
  provider coordinates. Data: Port of Kiel / Color Line terminal references.
  Network required for live tiles; static map screenshots intentionally removed.
 ===================================================================== */
(()=>{'use strict';
  const frame=document.getElementById('kiel-map-iframe');
  const root=document.getElementById('kiel-live-map');
  if(!frame||!root)return;
  const buttons=[...root.querySelectorAll('[data-kiel-terminal]')];
  const link=document.getElementById('kiel-map-full');
  const current=document.getElementById('kiel-map-current');
  const T=Object.freeze({
    ostseekai:{name:'Ostseekai',lat:54.32593,lon:10.14693},
    norwegenkai:{name:'Norwegenkai',lat:54.3175283,lon:10.1411},
    schwedenkai:{name:'Schwedenkai',lat:54.319677,lon:10.139941}
  });
  const createEmbed=t=>{
    // approximately 2–3 km area visible; each iframe includes its own zoom widget.
    const bounds=[t.lon-0.020,t.lat-0.012,t.lon+0.020,t.lat+0.012].join(',');
    const params=new URLSearchParams({bbox:bounds,layer:'mapnik',marker:`${t.lat},${t.lon}`});
    return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
  };
  function showTerminal(key){
    const t=T[key];if(!t)return;
    buttons.forEach(btn=>{const isActive=btn.dataset.kielTerminal===key;btn.classList.toggle('is-selected',isActive);btn.setAttribute('aria-pressed',String(isActive));});
    frame.src=createEmbed(t); // true interactive map, not a map image
    current.textContent=`Terminal ${t.name}`;
    link.href=`https://www.openstreetmap.org/?mlat=${t.lat}&mlon=${t.lon}#map=15/${t.lat}/${t.lon}`;
  }
  buttons.forEach(b=>b.addEventListener('click',()=>showTerminal(b.dataset.kielTerminal)));
  showTerminal('ostseekai');
})();
