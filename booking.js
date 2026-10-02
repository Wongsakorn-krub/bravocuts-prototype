import { BARBERS,SERVICES,today,addDays,slots,resolveBarber,timeLabel,minutes } from './model.js';
import { t,esc,prettyDate,locale,lang,setLanguage } from './i18n.js';
import { getBookings,createBooking } from './store.js';
import { buildSelector,syncModalState } from './ui.js';
const dialog=document.getElementById('booking-dialog');
const content=document.getElementById('booking-content');
content.addEventListener('change',e=>{if(e.target.matches('[data-booking-language]')){capture();setLanguage(e.target.value);}});
let state={};
const steps=['stepService','stepBarber','stepTime','stepDetails','stepReview'];
const titles=['pickService','pickBarber','pickTime','pickDetails','pickReview'];
const service=()=>SERVICES.find(s=>s.id===state.service)||SERVICES[0];
const barberName=()=>BARBERS.find(b=>b.id===state.barber)?.name||t('any');
export function openBooking(options={}){state={step:0,service:options.service||'cut',barber:options.barber||'yu',date:today(),time:'',name:'',phone:'',note:'',photos:[],error:'',success:null,uploading:false};render();dialog.showModal();syncModalState();}
function close(){dialog.close();syncModalState();}
dialog.addEventListener('close',syncModalState);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
window.addEventListener('bravo:language',()=>{if(dialog.open){capture();render();}});
function capture(){if(state.step===3){['name','phone','note'].forEach(key=>{const el=content.querySelector(`[name="${key}"]`);if(el)state[key]=el.value;});}}
function summary(){return `<span>${esc(t(state.service))} · ${service().duration} ${t('min')}</span><small>${esc(barberName())}${state.time?' · '+esc(prettyDate(state.date))+' '+state.time:''}</small>`;}
function shell(body){return `<div class="dialog-top"><span class="dialog-brand">BRAVOCUTS</span><small>${t('bookingDemo')}</small><select data-booking-language aria-label="Language">${[['en','EN'],['th','TH'],['zh','中文'],['ru','RU']].map(([value,label])=>`<option value="${value}" ${lang===value?'selected':''}>${label}</option>`).join('')}</select><button class="icon-button" data-close aria-label="${t('close')}">×</button></div>${state.success?'':`<nav class="booking-steps" aria-label="Booking progress">${steps.map((key,i)=>`<span class="booking-step ${i===state.step?'active':i<state.step?'complete':''}" ${i===state.step?'aria-current="step"':''}>${i+1}. ${t(key)}</span>`).join('')}</nav>`}<div class="booking-body">${body}<p class="error" role="alert">${esc(state.error)}</p></div>${state.success?'':`<div class="booking-footer"><div class="summary">${summary()}</div><div class="booking-buttons">${state.step>0?`<button class="button secondary small" data-back>${t('back')}</button>`:''}<button class="button dark" data-continue ${state.uploading?'disabled':''}>${t(state.step===4?'confirm':'continue')} <span aria-hidden="true">${state.step===4?'✓':'→'}</span></button></div></div>`}`;}
function render(){
  if(state.success){renderSuccess();return;}
  let body=`<h2 id="booking-title">${t(titles[state.step])}</h2><p class="booking-helper">${t(state.step===2?'timezone':state.step===3?'contactHint':'bookingDemo')}</p>`;
  if(state.step===0)body+=SERVICES.map((s,i)=>`<button class="booking-service ${s.id===state.service?'selected':''}" aria-pressed="${s.id===state.service}" data-service="${s.id}"><span class="radio-mark"></span><span><strong>${t(s.id)}</strong><small>${s.duration} ${t('min')}</small></span><span class="price">${s.price}<small>${t('from')}</small></span></button>`).join('');
  if(state.step===1)body+=`<div class="booking-barber"><div class="editorial-selector" id="booking-barber-selector"></div><p class="fine-print">${t('skillNote')}</p></div><button class="any-barber" data-any aria-pressed="${state.barber==='any'}">${state.barber==='any'?'✓ ':''}${t('any')}</button>`;
  if(state.step===2){
    const choices=slots(getBookings(),{date:state.date,barber:state.barber,duration:service().duration},new Date());
    if(state.time&&!choices.includes(state.time))state.time='';
    body+=`<label class="date-input-label">${t('date')}<input type="date" name="date" min="${today()}" max="${addDays(today(),30)}" value="${state.date}" required></label><div class="booking-dates">${Array.from({length:7},(_,i)=>addDays(today(),i)).map(date=>{const d=new Date(date+'T12:00:00+07:00');return `<button class="date-option" data-date="${date}" aria-pressed="${state.date===date}"><span>${new Intl.DateTimeFormat(locale(),{weekday:'short'}).format(d)}</span><strong>${d.getDate()}</strong></button>`;}).join('')}</div><span class="tiny-label">${t('available')}</span>${choices.length?`<div class="time-grid">${choices.map(time=>`<button class="time-slot" data-time="${time}" aria-pressed="${state.time===time}">${time}</button>`).join('')}</div>`:`<p class="empty-state">${t('noSlots')}</p>`}`;
  }
  if(state.step===3)body+=`<form id="customer-form" class="form-grid" autocomplete="off"><label>${t('name')}<input name="name" value="${esc(state.name)}" maxlength="80" required placeholder="Alex"></label><label>${t('phone')}<input name="phone" value="${esc(state.phone)}" type="tel" maxlength="25" required placeholder="+66 81 234 5678"></label><label class="span-2">${t('note')} <textarea name="note" maxlength="600" placeholder="${esc(t('notePlaceholder'))}">${esc(state.note)}</textarea></label><div class="span-2"><label class="upload-zone"><strong>＋ ${t('upload')}</strong><small>${t('uploadHint')}</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="${t('upload')}"></label><div class="photo-preview">${photoMarkup()}</div><small class="booking-helper">${t('photoNotice')}</small></div></form>`;
  if(state.step===4){
    const b=BARBERS.find(b=>b.id===resolveBarber(getBookings(),{barber:state.barber,date:state.date,time:state.time,duration:service().duration},new Date()));
    body+=`${b?`<div class="review-card"><img src="${b.image}" alt="${b.name}"><div><small class="tiny-label">${t('bookedBarber')}</small><h3>${b.name}</h3><p>${esc(t(state.service))}</p><p>${esc(prettyDate(state.date))} · ${state.time}–${timeLabel(minutes(state.time)+service().duration)}</p></div></div>`:`<p class="error">${t('conflict')}</p><button class="button secondary" data-return-time>${t('returnToTime')}</button>`}<div class="review-list"><div><small>${t('name')}</small>${esc(state.name)}</div><div><small>${t('phone')}</small>${esc(state.phone)}</div></div><small class="tiny-label">${t('notes')}</small><p class="review-note">${esc(state.note||t('noteEmpty'))}</p><div class="photo-preview">${state.photos.map(p=>`<img class="admin-photo" src="${p.data}" alt="${t('reference')}">`).join('')}</div><p class="booking-helper">${t('timezone')}</p><div class="review-total"><span>${t('total')}</span><strong>${service().price} ${t('from')}</strong></div>`;
  }
  content.innerHTML=shell(body);bind();
}
function photoMarkup(){return state.photos.map((p,i)=>`<div class="photo-item"><img src="${p.data}" alt="${esc(p.name)}"><button type="button" data-remove-photo="${i}" aria-label="${t('clearPhoto')} ${i+1}">×</button></div>`).join('');}
function bind(){
  content.querySelector('[data-close]').onclick=close;
  content.querySelector('[data-back]')?.addEventListener('click',()=>{capture();state.error='';state.step--;render();dialog.scrollTop=0;});
  content.querySelector('[data-continue]')?.addEventListener('click',next);
  content.querySelectorAll('[data-service]').forEach(btn=>btn.onclick=()=>{state.service=btn.dataset.service;state.time='';render();});
  if(state.step===1){buildSelector(content.querySelector('#booking-barber-selector'),{index:Math.max(0,BARBERS.findIndex(b=>b.id===state.barber)),onChange:id=>{state.barber=id;state.time='';content.querySelector('[data-any]').setAttribute('aria-pressed','false');content.querySelector('[data-any]').textContent=t('any');content.querySelector('.summary').innerHTML=summary();}});content.querySelector('[data-any]').onclick=()=>{state.barber=state.barber==='any'?'yu':'any';state.time='';render();};}
  content.querySelector('input[name=date]')?.addEventListener('change',e=>{if(e.target.value>=today()&&e.target.value<=addDays(today(),30)){state.date=e.target.value;state.time='';state.error='';}else state.error=t('selectDate');render();});
  content.querySelectorAll('[data-date]').forEach(btn=>btn.onclick=()=>{state.date=btn.dataset.date;state.time='';state.error='';render();});
  content.querySelectorAll('[data-time]').forEach(btn=>btn.onclick=()=>{state.time=btn.dataset.time;state.error='';content.querySelectorAll('[data-time]').forEach(el=>el.setAttribute('aria-pressed',String(el===btn)));content.querySelector('.summary').innerHTML=summary();content.querySelector('.error').textContent='';});
  content.querySelector('#customer-form')?.addEventListener('submit',e=>{e.preventDefault();next();});
  content.querySelector('input[type=file]')?.addEventListener('change',upload);
  content.querySelectorAll('[data-remove-photo]').forEach(btn=>btn.onclick=()=>{capture();state.photos.splice(Number(btn.dataset.removePhoto),1);render();});
  content.querySelector('[data-return-time]')?.addEventListener('click',()=>{state.step=2;render();});
}
async function upload(e){
  capture();const files=[...e.target.files];
  if(files.length+state.photos.length>2||files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>1024*1024)){state.error=t('photoError');render();return;}
  state.uploading=true;const button=content.querySelector('[data-continue]');button.disabled=true;
  try{const photos=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,data:reader.result});reader.onerror=reject;reader.readAsDataURL(file);})));state.photos.push(...photos);state.error='';}catch{state.error=t('photoError');}
  state.uploading=false;render();
}
function next(){
  capture();state.error='';
  if(state.step===2&&(!state.time||!resolveBarber(getBookings(),{barber:state.barber,date:state.date,time:state.time,duration:service().duration},new Date())))state.error=t('timeError');
  if(state.step===3&&(!state.name.trim()||!/^\+\d[\d\s()-]{6,23}$/.test(state.phone.trim())))state.error=t('detailsError');
  if(state.error){render();return;}
  if(state.step<4){state.step++;render();dialog.scrollTop=0;return;}
  const button=content.querySelector('[data-continue]');button.disabled=true;
  try{state.success=createBooking({service:state.service,duration:service().duration,price:service().price,barber:state.barber,date:state.date,time:state.time,name:state.name.trim(),phone:state.phone.trim(),note:state.note.trim(),photos:state.photos,demo:true});render();dialog.scrollTop=0;}catch(error){state.error=t(error.message==='storage'?'storage':'conflict');if(error.message==='conflict')state.step=2;render();}
}
function renderSuccess(){const b=state.success;const barber=BARBERS.find(x=>x.id===b.barber);content.innerHTML=shell(`<div class="success-view"><div class="success-mark">✓</div><h2 id="booking-title">${t('success')}</h2><p class="booking-helper">${t('successText')}</p><div class="review-card"><img src="${barber.image}" alt="${barber.name}"><div><h3>${barber.name}</h3><p>${esc(t(b.service))}</p><p>${esc(prettyDate(b.date))} · ${b.time}</p><p>${t('timezone')}</p></div></div><small class="tiny-label">${t('referenceCode')}</small><p>${b.id.slice(0,8).toUpperCase()}</p><div class="success-actions"><button class="button dark" data-desk>${t('viewDesk')} ↗</button><button class="button secondary" data-home>${t('done')}</button></div></div>`);content.querySelector('[data-close]').onclick=close;content.querySelector('[data-home]').onclick=close;content.querySelector('[data-desk]').onclick=()=>{close();window.dispatchEvent(new CustomEvent('bravo:desk-date',{detail:b.date}));location.hash='desk';};}
