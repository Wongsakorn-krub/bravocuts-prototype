// Original lightweight interactions inspired by 21st.dev's shimmer/hover examples.
// Not gated to the booking page: home and booking share one interaction language.
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const WAVE_TARGETS='.primary,.secondary,.round,.shop-work-link,.days button,.time-grid button,.barber-tabs button';
document.addEventListener('pointerdown',event=>{
 if(reduced())return;
 const button=event.target.closest('button:not(:disabled),a.primary,a.shop-work-link');
 if(!button||!button.matches(WAVE_TARGETS))return;
 const rect=button.getBoundingClientRect(),wave=document.createElement('span');
 wave.className='click-wave';wave.setAttribute('aria-hidden','true');
 wave.style.left=`${event.clientX-rect.left}px`;wave.style.top=`${event.clientY-rect.top}px`;
 button.append(wave);wave.addEventListener('animationend',()=>wave.remove(),{once:true});
},{passive:true});
// iOS Safari only paints :active on touch when some touch listener exists.
document.addEventListener('touchstart',()=>{},{passive:true});
