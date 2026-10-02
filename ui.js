import { BARBERS } from './model.js';
import { t,esc } from './i18n.js';
export function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),3300);}
export function syncModalState(){document.body.classList.toggle('modal-open',Boolean(document.querySelector('dialog[open]')));}
export function buildSelector(container,{index=0,onChange=()=>{},onBook=null}={}){
  let active=index,drag=null,swiped=false;
  container.innerHTML=`<div class="editorial-image-stage" role="group" aria-label="${esc(t('swipe'))}">${BARBERS.map(b=>`<img src="${b.image}" alt="${b.name}" data-barber="${b.id}" draggable="false">`).join('')}<div class="portrait-shade"></div><span class="portrait-label">BRAVOCUTS / <span data-portrait-name></span></span></div><div class="editorial-copy"><span class="barber-number"></span><div aria-live="polite"><h3></h3><p class="barber-bio"></p></div><div class="specialties"><span class="tiny-label">${t('skills')}</span><div class="skill-chips"></div></div>${onBook?`<button class="button gold" data-book-selected></button>`:''}<div class="selector-controls"><button class="round-button" data-prev aria-label="${esc(t('previous'))}">←</button><button class="round-button" data-next aria-label="${esc(t('next'))}">→</button><small>${t('swipe')}</small><div class="selector-indicators">${BARBERS.map((b,i)=>`<button data-index="${i}" aria-label="${b.name}" aria-pressed="false"></button>`).join('')}</div></div></div>`;
  const stage=container.querySelector('.editorial-image-stage');
  const images=[...stage.querySelectorAll('img')];
  function draw(animate=false,direction=1){
    const b=BARBERS[active];
    images.forEach((img,i)=>{img.style.opacity=i===active?'1':'0';img.style.transform=i===active?'translateX(0) scale(1)':`translateX(${direction*12}%) scale(1.06)`;img.setAttribute('aria-hidden',String(i!==active));});
    container.querySelector('h3').textContent=b.name;
    container.querySelector('.barber-number').textContent=`${b.number} / 03`;
    container.querySelector('[data-portrait-name]').textContent=b.name.toUpperCase();
    container.querySelector('.barber-bio').textContent=t(b.id+'Bio');
    container.querySelector('.skill-chips').innerHTML=b.skills.map(key=>`<span class="skill-chip">${esc(t(key))}</span>`).join('');
    container.querySelectorAll('[data-index]').forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.dataset.index)===active)));
    const book=container.querySelector('[data-book-selected]');if(book)book.innerHTML=`${esc(t('chooseBarber'))} ${b.name} <span aria-hidden="true">↗</span>`;
    if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)container.querySelector('h3').animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
  }
  function select(next){const direction=next>active?1:-1;active=(next+3)%3;draw(true,direction);onChange(BARBERS[active].id);}
  container.querySelector('[data-prev]').onclick=()=>select(active-1);
  container.querySelector('[data-next]').onclick=()=>select(active+1);
  container.querySelectorAll('[data-index]').forEach(btn=>btn.onclick=()=>select(Number(btn.dataset.index)));
  const book=container.querySelector('[data-book-selected]');if(book)book.onclick=()=>onBook(BARBERS[active].id);
  container.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(active+(e.key==='ArrowRight'?1:-1));}};
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,horizontal:false};swiped=false;});
  stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.horizontal&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){drag=null;return;}if(Math.abs(dx)>8&&!drag.horizontal){drag.horizontal=true;stage.setPointerCapture(e.pointerId);}if(drag.horizontal){drag.dx=dx;images[active].style.transition='none';images[active].style.transform=`translateX(${dx*.12}px) scale(1)`;}});
  const release=e=>{if(!drag||drag.id!==e.pointerId)return;const dx=drag.dx;images[active].style.transition='';drag=null;if(Math.abs(dx)>40){swiped=true;select(active+(dx<0?1:-1));}else draw();};
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',()=>{drag=null;images[active].style.transition='';draw();});
  draw();return {getIndex:()=>active};
}
