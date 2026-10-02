import { SERVICES } from './model.js';
import { t,translateDOM,setLanguage,esc } from './i18n.js';
import { buildSelector } from './ui.js';
import { openBooking } from './booking.js';
import { renderDesk } from './admin.js';
let selectedIndex=0;
function renderMarketing(){
  translateDOM();
  document.getElementById('service-cards').innerHTML=SERVICES.map((s,i)=>`<article class="service-card"><div class="service-top"><span>0${i+1} / ${s.duration} ${t('min')}</span><span class="service-glyph" aria-hidden="true">${['✂','⌁','✳'][i]}</span></div><h3>${t(s.id)}</h3><p>${t(s.id+'Desc')}</p><div class="service-card-bottom"><span class="price">${s.price} <small>${t('from')}</small></span><button class="round-button" data-book-service="${s.id}" aria-label="${esc(t('chooseService')+' '+t(s.id))}">↗</button></div></article>`).join('');
  buildSelector(document.getElementById('team-selector'),{index:selectedIndex,onChange:id=>{selectedIndex=['yu','jeng','min'].indexOf(id);},onBook:barber=>openBooking({barber})});
  document.querySelectorAll('[data-book-service]').forEach(btn=>btn.onclick=()=>openBooking({service:btn.dataset.bookService}));
}
function route(){const desk=location.hash==='#desk';document.getElementById('website-view').hidden=desk;document.getElementById('desk-view').hidden=!desk;document.body.classList.toggle('desk-mode',desk);let back=document.querySelector('.header-home');if(desk){renderDesk();if(!back){back=document.createElement('a');back.href='#';back.className='header-home';document.querySelector('.header-actions').prepend(back);}back.textContent='← '+t('home');window.scrollTo(0,0);}else if(back)back.remove();}
document.querySelectorAll('[data-book]').forEach(btn=>btn.onclick=()=>openBooking());
document.querySelectorAll('[data-language]').forEach(select=>select.onchange=()=>setLanguage(select.value));
window.addEventListener('bravo:language',()=>{renderMarketing();route();});
window.addEventListener('hashchange',route);
const hero=document.querySelector('.hero');const coin=document.querySelector('.hero-coin');
hero.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=hero.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;coin.style.transform=`rotateY(${x*27-12}deg) rotateX(${-y*19}deg) rotateZ(8deg)`;});
hero.addEventListener('pointerleave',()=>{coin.style.transform='';});
renderMarketing();route();
