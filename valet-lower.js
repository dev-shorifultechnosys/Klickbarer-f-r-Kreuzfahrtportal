
/** Valet Kiel source section 06–11: reviews modal + mobile single-card pager.
 *  No backend calls; all content is taken from the client-provided layout. */
(()=>{
  'use strict';
  const root=document.querySelector('#valet-reviews');
  if(!root) return;
  const cards=Array.from(root.querySelectorAll('.vp-review-card'));
  const indicator=document.querySelector('#vp-review-current');
  let current=0;
  function show(index){
    current=(index+cards.length)%cards.length;
    cards.forEach((card,i)=>card.classList.toggle('is-active',i===current));
    indicator.textContent=`${current+1} / ${cards.length}`;
  }
  show(0);
  document.querySelector('#vp-review-prev').addEventListener('click',()=>show(current-1));
  document.querySelector('#vp-review-next').addEventListener('click',()=>show(current+1));
  const dialog=document.querySelector('#vp-reviews-dialog');
  const dialogItems=document.querySelector('#vp-reviews-dialog-items');
  // Clones are read-only testimonials; visible source cards remain live text.
  cards.forEach(card=>dialogItems.appendChild(card.cloneNode(true)));
  dialogItems.querySelectorAll('.vp-review-card').forEach(c=>c.style.display='block');
  document.querySelector('#vp-reviews-all').addEventListener('click',()=>dialog.showModal());
  document.querySelector('#vp-reviews-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
