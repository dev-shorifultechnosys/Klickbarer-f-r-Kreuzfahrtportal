/**
 * KreuzfahrtParkplatz.de — Kiel informational content and interactions.
 * All data and labels are authored in HTML. This module only manages card
 * filter shortcuts, accessible FAQ state and the customer-review carousel.
 * No API calls, provider inventory, payment or fabricated live reservations.
 */
(()=>{'use strict';
  const root=document.querySelector('#kiel-extra-content');
  if(!root)return;
  const $=(s,context=document)=>context.querySelector(s);
  const $$=(s,context=document)=>Array.from(context.querySelectorAll(s));
  // Parking-category shortcuts activate the actual comparison filter panel.
  // Preserve existing sort and other selections unless the visitor explicitly
  // chooses a new category.
  $$('.kiel-type-card__cta',root).forEach(link=>{
    link.addEventListener('click',event=>{
      const type=link.dataset.filterType;
      const form=$('#filter-groups');
      if(!type||!form)return;
      event.preventDefault();
      $$('input[name="type"]',form).forEach(input=>{input.checked=input.value===type;});
      const select=form.querySelector(`input[name="type"][value="${type}"]`);
      if(select)select.dispatchEvent(new Event('change',{bubbles:true}));
      const toggle=$('#mobile-filter-toggle');
      if(toggle&&window.matchMedia('(max-width:700px)').matches){
        form.classList.add('is-open');toggle.setAttribute('aria-expanded','true');toggle.textContent='Filter schließen ⌃';
      }
      document.getElementById('kiel-vergleich')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
    });
  });
  // Use native HTML <details> for keyboard support, focus and announcement.
  // Close the other FAQ panel when one opens, matching the compact reference.
  const questions=$$('.kiel-faq__item',root);
  let multipleFaqOpen=false;
  questions.forEach(item=>item.addEventListener('toggle',()=>{
    if(item.open&&!multipleFaqOpen)questions.forEach(other=>{if(other!==item)other.open=false;});
  }));
  const allFaq=$('#kiel-faq-all');
  if(allFaq)allFaq.addEventListener('click',event=>{
    event.preventDefault();
    const opening=!questions.every(item=>item.open);
    multipleFaqOpen=opening;
    questions.forEach(item=>item.open=opening);
    // Distinct explicitly requested action, standard German wording.
    allFaq.textContent=opening?'FAQs schließen ↑':'Alle FAQs anzeigen →';
  });
  // Display each of the THREE client-supplied testimonials only. No extra
  // reviews or invented customer details. Desktop rotates ordering of all 3;
  // mobile presents one at a time with the same arrow controls.
  const track=$('#kiel-reviews-track');const status=$('#kiel-review-status');
  const cards=$$('.kiel-review',track);let first=0;
  function update(){
    const mobile=window.matchMedia('(max-width:700px)').matches;
    cards.forEach((card,i)=>{
      const position=(i-first+cards.length)%cards.length;
      card.style.order=String(position);
      card.classList.toggle('is-visible',position===0);
      card.setAttribute('aria-hidden',mobile&&position!==0?'true':'false');
      // Only visible review remains in keyboard navigation on mobile.
      card.inert=mobile&&position!==0;
    });
    if(status)status.textContent=`Bewertung ${first+1} von ${cards.length}: ${cards[first].dataset.reviewer}`;
  }
  $$('[data-review-direction]',root).forEach(button=>button.addEventListener('click',()=>{
    first=(first+Number(button.dataset.reviewDirection)+cards.length)%cards.length;
    update();
  }));
  let wasMobile=window.matchMedia('(max-width:700px)').matches;
  window.addEventListener('resize',()=>{const mobile=window.matchMedia('(max-width:700px)').matches;if(mobile!==wasMobile){wasMobile=mobile;update();}},{passive:true});
  const allReviews=$('#kiel-reviews-all');
  const reviewDialog=$('#kiel-review-dialog');
  if(allReviews&&reviewDialog){
    allReviews.addEventListener('click',event=>{
      event.preventDefault();
      const content=$('#kiel-review-dialog-content');
      content.replaceChildren(...cards.map(card=>{
        const copy=card.cloneNode(true);copy.removeAttribute('aria-hidden');copy.inert=false;copy.removeAttribute('style');return copy;
      }));
      if(typeof reviewDialog.showModal==='function')reviewDialog.showModal();
    });
    $('#kiel-review-dialog-close').addEventListener('click',()=>reviewDialog.close());
    reviewDialog.addEventListener('click',event=>{if(event.target===reviewDialog)reviewDialog.close();});
  }
  update();
})();
