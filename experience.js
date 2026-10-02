import {buildShopHome} from './shop-home.js';
import './booking-effects.js';
import {BARBERS,today,addDays,minutes,timeLabel,slots,workHours,available} from './model.js';
import {getBookings,createBooking,updateBooking,getSchedules,saveSchedules} from './store.js';
import {lang,setLanguage,esc} from './i18n.js';
const $=s=>document.querySelector(s);
const isBooking=/\/booking(\.html)?$/.test(location.pathname);
/* Customer walkthrough: hide anything that leaves the booking flow (the calendar
   download and the staff-facing studio desk). Set to false to bring them back. */
const presentationMode=true;
const portraitSource=()=>`assets/portrait-${person().id}.png`;
const L=(th,en,zh,ru)=>({th,en,zh,ru}[lang]||en);
const fmt=(date,options={weekday:'long',day:'numeric',month:'long'})=>new Intl.DateTimeFormat({th:'th-TH',en:'en-GB',zh:'zh-CN',ru:'ru-RU'}[lang],{timeZone:'Asia/Bangkok',...options}).format(new Date(date+'T12:00:00+07:00'));
const state={step:0,barber:0,chosen:false,date:today(),month:today().slice(0,7),time:'',style:'',note:'',name:'',phone:'',photos:[],payment:'promptpay',receipt:null};
const requestedBarber=new URLSearchParams(location.search).get('barber');
if(BARBERS.some(b=>b.id===requestedBarber))state.barber=BARBERS.findIndex(b=>b.id===requestedBarber);
const desk={date:today(),editor:null};
let spinning=false;
const person=()=>BARBERS[state.barber];
const times=(barber=person().id,date=state.date)=>slots(getBookings(),{barber,date,duration:45},new Date(),getSchedules());
const off=(barber,date)=>workHours(getSchedules(),barber,date).length===0;
const titleBarber=()=>L('เลือกช่างของคุณ','Meet your barber','选择理发师','Ваш барбер');
const titleTime=()=>L('เลือกวันและเวลา','Find your time','选择日期与时间','Дата и время');
const titleStyle=()=>L('ทรงที่เป็นคุณ','Make it your style','选择您的风格','Ваш стиль');
const titlePay=()=>L('ข้อมูลติดต่อและชำระเงิน','Your details & payment','联系方式与付款','Контакты и оплата');
const steps=()=>[titleBarber(),titleTime(),titleStyle(),titlePay()];
const statusText=s=>({confirmed:L('จองแล้ว','Booked','已预约','Записан'),arrived:L('มาถึงแล้ว','Arrived','已到店','Прибыл'),cutting:L('กำลังตัด','In the chair','服务中','В кресле'),done:L('เสร็จแล้ว','Finished','已完成','Завершено'),blocked:L('ไม่ว่าง / พัก','Unavailable / break','休息','Перерыв'),cancelled:L('ยกเลิก','Cancelled','已取消','Отменено')}[s]||s);
const styleData=()=>[
 ['fade','01','Curly Fade',L('เฟดด้านข้างสั้นสะอาด เก็บลอนด้านบนให้เด่น เหมาะกับคนผมหยักศกที่ชอบขอบทรงคม','Close faded sides with defined curls on top. A sharp shape for naturally curly hair.','两侧渐变，顶部保留卷度，适合喜欢利落轮廓的卷发。','Короткий фейд по бокам и выразительные кудри сверху. Для чёткого контура.')],
 ['texture','02','Textured Crop',L('ด้านบนสั้นเป็นช่อ มีหน้าม้าทิ้งมาด้านหน้า ลุคสบาย ๆ จัดทรงง่ายโดยไม่ต้องเสยสูง','Short, piecey texture with a forward fringe. An easy, casual style without extra height.','短碎层次搭配前刘海，自然休闲，无需向上定型。','Короткая текстура и чёлка вперёд. Непринуждённая форма без высокого объёма.')],
 ['classic','03','Classic Quiff',L('ด้านข้างเก็บสั้น เสยด้านหน้าขึ้นมีวอลุ่ม เปิดหน้าชัด ให้ลุคเนี้ยบและดูเป็นผู้ใหญ่','Tidy sides and a swept-up front. More volume, an open forehead and a polished finish.','两侧整洁，前额向上梳理，增加蓬松度，露出额头。','Аккуратные бока и приподнятый перед. Объём и открытый лоб для собранного образа.')],
 ['flow','04','Layered Flow',L('เก็บความยาวช่วงบนและท้ายทอย ไล่เลเยอร์ให้ผมมีทิศทาง ได้ลุคพลิ้วและมีคาแรกเตอร์','Longer on top and at the nape, with flowing layers. A relaxed shape with more movement.','顶部与后颈保留长度，用层次打造自然流动感。','Больше длины сверху и на затылке. Подвижные слои и расслабленный силуэт.')]
];
const styleImages={fade:'work-curl-fade.jpg',texture:'work-3.jpg',classic:'work-2.jpg',flow:'work-4.jpg'};
function skillCopy(i){return [
 {tags:['Precision Fade','Classic Cuts'],desc:L('งานเฟดคมสะอาดและทรงคลาสสิกที่ดูดีในทุกวัน เก็บรายละเอียดให้เข้ากับสไตล์ของคุณ','Clean fades, considered details and classic cuts that feel like you.','干净渐变与经典剪裁，注重每个细节。','Чёткий фейд, внимание к деталям и классические формы.')},
 {tags:['Korean Style','Texture & Flow'],desc:L('ทรงเกาหลีและเท็กซ์เจอร์ที่ดูเป็นธรรมชาติ เน้นรูปทรงและการเคลื่อนไหวของเส้นผม','Natural movement, soft texture and a fresh take on Korean-inspired cuts.','韩式造型与自然纹理，让发丝轻盈流动。','Корейские формы, мягкая текстура и естественное движение волос.')},
 {tags:['Skin Fade','Beard Design'],desc:L('สกินเฟดไล่ระดับเนียน พร้อมดีไซน์หนวดเคราให้ได้ลุคที่คมและลงตัว','Seamless skin fades and considered beard work for a sharper silhouette.','自然衔接的贴皮渐变与精致胡须设计。','Плавный скин-фейд и аккуратная работа с бородой.')}
 ][i];}
function jump(id){if(isBooking&&location.hash!=='#desk'&&stepIds.includes(id)){goStep(stepIds.indexOf(id));return;}document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
const stepIds=['barbers','calendar','style','payment'];
let changingStep=false;
function reachableStep(){return !state.chosen?0:!state.time?1:!state.style?2:3;}
function updateWizard(){
 const journey=$('.journey');if(!journey)return;
 journey.setAttribute('aria-label',L('ขั้นตอนการจอง','Booking progress','预约步骤','Этапы записи'));
 journey.innerHTML=steps().map((label,i)=>`<button type="button" data-step="${i}" ${i>reachableStep()||state.receipt?'disabled':''} ${i===state.step?'aria-current="step"':''} class="${i===state.step?'active':i<state.step?'complete':''}"><span>${i<state.step?'✓':'0'+(i+1)}</span><b>${label}</b></button>`).join('');
 journey.querySelectorAll('[data-step]').forEach(el=>el.onclick=()=>goStep(Number(el.dataset.step)));
 if($('#wizard-back')){$('#wizard-back').hidden=state.step===0||!!state.receipt;$('#wizard-back').onclick=()=>goStep(state.step-1);}
 if($('#wizard-context'))$('#wizard-context').textContent=state.step===0?L('เลือกคนที่ใช่สำหรับคุณ','Find your barber','选择您的理发师','Найдите своего мастера'):`${person().name}${state.time?' · '+fmt(state.date,{day:'numeric',month:'short'})+' · '+state.time:''}`;
 if($('#wizard-count'))$('#wizard-count').textContent=state.receipt?L('เรียบร้อย','Complete','完成','Готово'):`0${state.step+1} / 04`;
 document.querySelector('.skip').href='#'+stepIds[state.step];
}
function setupWizard(){
 const journey=$('.journey'),wrap=$('#main>.wrap');
 wrap.insertBefore(journey,$('#barbers'));
 journey.insertAdjacentHTML('afterend',`<div class="wizard-toolbar"><button id="wizard-back" type="button">← ${L('ย้อนกลับ','Back','返回','Назад')}</button><span id="wizard-context"></span><span id="wizard-count"></span></div><p class="wizard-status" id="wizard-status" role="status" aria-live="polite"></p>`);
 state.step=state.receipt?3:Math.min(state.step,reachableStep());
 stepIds.forEach((id,i)=>{const panel=document.getElementById(id);panel.hidden=i!==state.step;panel.inert=i!==state.step;panel.setAttribute('tabindex','-1');});
 updateWizard();history.replaceState(null,'','#'+stepIds[state.step]);
 requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
}
async function goStep(requested,{historyMode='push',animate=true}={}){
 if(changingStep||!$('#barbers'))return;
 let target=Math.max(0,Math.min(requested,reachableStep()));
 let expired=false;
 if(!state.receipt&&target>1&&state.time&&!times().includes(state.time)){state.time='';target=1;expired=true;renderCalendar();renderPayment();}
 if(state.receipt)target=3;
 const previous=state.step,outgoing=document.getElementById(stepIds[previous]),incoming=document.getElementById(stepIds[target]);
 if(!incoming)return;
 changingStep=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,direction=target>=previous?1:-1;
 try{
 if(animate&&!reduced&&target!==previous&&outgoing&&!outgoing.hidden)await settle(outgoing.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction*24}px)`}],{duration:140,easing:'ease-in'}),260);
 state.step=target;
 stepIds.forEach((id,i)=>{const panel=document.getElementById(id);if(panel){panel.hidden=i!==target;panel.inert=i!==target;}});
 updateWizard();
 if(location.hash!=='#'+stepIds[target])history[historyMode==='push'?'pushState':'replaceState'](null,'','#'+stepIds[target]);
 $('#wizard-status').textContent=expired?L('เวลานี้เพิ่งเต็ม กรุณาเลือกเวลาใหม่ ข้อมูลอื่นยังอยู่ครบ','This slot is no longer available. Choose a new time; your details are saved.','此时段已满，请重新选择。其他信息已保留。','Это время уже занято. Выберите другое — ваши данные сохранены.') : '';
 window.scrollTo({top:0,behavior:'instant'});
 if(animate&&!reduced&&target!==previous)await settle(incoming.animate([{opacity:0,transform:`translateX(${direction*32}px)`},{opacity:1,transform:'translateX(0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'}),500);
 const focusTarget=incoming.querySelector('h2,h1')||incoming;focusTarget.setAttribute('tabindex','-1');focusTarget.focus({preventScroll:true});
 }catch(err){if(err.name!=='AbortError')throw err;}finally{changingStep=false;}
}
function chrome(){
 $('#language').value=lang;
 document.body.className=location.hash==='#desk'?'desk-page':isBooking?'booking-page':'home-page';
 document.querySelector('.logo').href='./';
 $('#nav').innerHTML=`<a href="./">${L('หน้าหลัก','Home','首页','Главная')}</a><a href="./#work">${L('ผลงาน','The work','作品','Работы')}</a><a class="nav-book" href="booking.html">${L('จองคิว','Book a cut','预约','Запись')} ↗</a>`;
 $('#footer').innerHTML=`<span>© BRAVOCUTS · KATHU, PHUKET</span><span>${L('ต้นแบบทดลอง • คิวและราคาเป็นข้อมูลตัวอย่าง','Booking prototype • Sample appointments & prices','预约原型 · 示例预约与价格','Прототип · Примерные записи и цены')}</span>${presentationMode?'<span></span>':'<a href="booking.html#desk">STUDIO DESK ↗</a>'}`;
}
function render(){chrome();if(location.hash==='#desk'){renderDesk();return;}renderSite();}
function renderSite(){
 $('#main').innerHTML=`<div class="wrap"><div class="intro-line"><p class="eyebrow">GOOD PEOPLE. GREAT HAIRCUTS.</p><span class="prototype">BRAVOCUTS / EDITION 03</span></div>
 <section id="barbers" class="barber-hero theatre" aria-label="${titleBarber()}">
 <div class="hero-kicker"><span>INDEPENDENT BARBERSHOP</span><span>KATHU, PHUKET / THAILAND</span></div>
 <div class="hero-word" aria-hidden="true">BRAVO</div>
 <div id="portrait" class="portrait-area" tabindex="0" role="group" aria-label="${L('ปัดซ้ายขวาหรือใช้ปุ่มลูกศรเพื่อเปลี่ยนช่าง','Swipe or use arrow keys to change barber','滑动或使用方向键选择理发师','Листайте или используйте стрелки')}"><div class="portrait-card" id="portrait-card"><img id="barber-image" src="${portraitSource()}" alt="${person().name}" draggable="false" fetchpriority="high"></div></div>
 <div class="hero-person"><span class="eyebrow">${isBooking?'01 / '+titleBarber():'YOUR CUT. YOUR CHARACTER.'}</span><h1 id="portrait-name">${person().name.replace('Barber ','')}</h1>${isBooking?'':`<div class="rotation-hint"><button class="round" id="prev-barber" aria-label="${L('ช่างคนก่อน','Previous barber','上一位','Предыдущий')}">←</button><span id="barber-count">${person().number} / 03</span><button class="round" id="next-barber" aria-label="${L('ช่างคนถัดไป','Next barber','下一位','Следующий')}">→</button></div>`}</div>
 <div id="barber-copy" class="barber-copy"></div><div class="hero-bottom-line"><span>${L('ฝีมือชัด สไตล์คุณ','CRAFTED WITH PRECISION. WORN WITH CHARACTER.','精湛技艺，独特风格','ТОЧНОСТЬ В ДЕТАЛЯХ. ВАШ ХАРАКТЕР.')}</span><span>SCROLL TO EXPLORE ↓</span></div></section>
 <div class="journey">${steps().map((s,i)=>`<a href="#${['barbers','calendar','style','payment'][i]}" class="${i===0?'active':''}"><span>0${i+1}</span>${s}</a>`).join('')}</div>
 <section id="calendar" class="booking-section"></section><section id="style" class="booking-section"></section><section id="payment" class="booking-section"></section>
 <section id="work" class="portfolio"><div class="section-top"><div><p class="eyebrow">FROM THE CHAIR</p><h2>${L('งานจริง สไตล์จริง','Good cuts. Real people.','真实作品，真实风格','Настоящие люди. Наши работы.')}</h2></div><a class="secondary" href="https://www.instagram.com/bravocuts_phuket/" target="_blank" rel="noopener">@bravocuts_phuket ↗</a></div>
 <div class="gallery">${['Ddak93HTjBb','DdVZhbGzBeW','DdOvoDFzMS6','DdF78I8ThQe'].map((id,i)=>`<a href="https://www.instagram.com/bravocuts_phuket/reel/${id}/" target="_blank" rel="noopener"><img src="assets/work-${i+1}.jpg" alt="${L('ภาพผลงานจาก Instagram ของ BRAVOCUTS','BRAVOCUTS work from Instagram','BRAVOCUTS Instagram 作品','Работа BRAVOCUTS из Instagram')} ${i+1}" loading="lazy"><span class="gallery-caption">BRAVOCUTS JOURNAL / 0${i+1}<span>↗</span></span></a>`).join('')}</div>
 <div class="reviews"><article class="review"><span class="eyebrow">FACEBOOK RECOMMENDATION</span><p lang="th">“ร้านบริการดีมากช่างเอาใจใส่ลูกค้าทุกรายละเอียดจริงๆ”</p><small>Pornpichai Dx · 24 MAR 2025<br><a href="https://www.facebook.com/pornpichai.dx/posts/pfbid022RkdaLzSHbgPaci5sFgnZqv4efT37a3213DX8qttcj88TNwBFTGz8yFZyTyzoJUVl" target="_blank" rel="noopener">${L('อ่านรีวิวต้นฉบับ','Read original review','阅读原始评价','Оригинал отзыва')} ↗</a></small></article><article class="review"><span class="eyebrow">FACEBOOK RECOMMENDATION</span><p lang="en">“This barber shop uses clean, modern equipment, provides excellent service to my boyfriend, and is reasonably priced.”</p><small>Natasha Ngamriab · 18 MAR 2025<br><a href="https://www.facebook.com/fernfern.nustacha/posts/pfbid037Y3F6CKwMq3HGPAi9LaZoh179i78tN4zKvoi27znwd9R7UuDcM1otGyB1wwDcycpl" target="_blank" rel="noopener">${L('อ่านรีวิวต้นฉบับ','Read original review','阅读原始评价','Оригинал отзыва')} ↗</a></small></article></div></section></div>
 <section class="visit"><div><p class="eyebrow">FIND US IN KATHU, PHUKET</p><h2>Come as you are.<br>Leave a little sharper.</h2><p>${L('ถนนวิชิตสงคราม กะทู้ ภูเก็ต','Wichit Songkhram Road, Kathu, Phuket','普吉岛卡图区 Wichit Songkhram 路','Wichit Songkhram Road, Кату, Пхукет')}</p><a href="tel:+66654493994">065 449 3994 ↗</a></div><a class="primary" href="booking.html">${titleBarber()} <span>↗</span></a></section>`;
 if(!isBooking){document.querySelector('.journey')?.remove();['calendar','style','payment'].forEach(id=>document.getElementById(id)?.remove());buildShopHome(L);return;}
 else{$('#work')?.remove();document.querySelector('.visit')?.remove();}
 renderBarber();renderCalendar();renderStyle();renderPayment();setupWizard();
 if($('#prev-barber')){$('#prev-barber').onclick=()=>spinTo((state.barber+2)%3,-1);$('#next-barber').onclick=()=>spinTo((state.barber+1)%3,1);}
 let start=null;
 $('#portrait').onpointerdown=e=>{if(e.target.closest('button'))return;start={x:e.clientX,y:e.clientY};};
 $('#portrait').onpointerup=e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))spinTo((state.barber+(dx<0?1:2))%3,dx<0?1:-1);};
 $('#portrait').onpointercancel=()=>start=null;
 $('#portrait').onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();spinTo((state.barber+(e.key==='ArrowRight'?1:2))%3,e.key==='ArrowRight'?1:-1);}};
}
function renderBarber(){
 const b=person(),copy=skillCopy(state.barber),closed=off(b.id,state.date),free=times();
 if(!isBooking){
 $('#barber-copy').innerHTML=`<p class="eyebrow">MEET ${b.name.toUpperCase()}</p><p class="description">${copy.desc}</p><div class="chips">${copy.tags.map(s=>`<span>${s}</span>`).join('')}</div><a id="home-book" class="primary wide" href="booking.html?barber=${b.id}">${L('จองคิวกับ','Book with','预约','Записаться к')} ${b.name}<span>↗</span></a><p class="subtle">${L('ความถนัดตัวอย่าง รอช่างยืนยัน','Illustrative specialties, awaiting confirmation.','专长为演示内容，待确认','Примерные специализации, требуют подтверждения.')}</p><div class="barber-tabs">${BARBERS.map((p,i)=>`<button data-barber="${i}" aria-pressed="${state.barber===i}">${p.name.replace('Barber ','')}</button>`).join('')}</div>`;
 document.querySelectorAll('[data-barber]').forEach(el=>el.onclick=()=>spinTo(Number(el.dataset.barber),Number(el.dataset.barber)>state.barber?1:-1));return;
 }

 $('#barber-copy').innerHTML=`<div class="barber-details"><div class="detail-heading"><span class="eyebrow">${b.name.toUpperCase()}</span><h2>${L('ความถนัดและสไตล์','Craft & character','专长与风格','Мастерство и стиль')}</h2></div><div class="mini-step">01 / ${titleBarber()}</div><p class="description">${copy.desc}</p><div class="chips">${copy.tags.map(s=>`<span>${s}</span>`).join('')}</div><p class="subtle">${L('ความถนัดตัวอย่างสำหรับนำเสนอ รอช่างยืนยัน','Illustrative specialties, awaiting barber confirmation.','专长为演示内容，待理发师确认','Примерные специализации, требуют подтверждения.')}</p><label class="date-check">${L('เช็กวันเข้าร้าน','Check your visit date','查看到店日期','Проверить дату')}<button id="quick-date" class="date-link" type="button">${fmt(state.date,{day:'numeric',month:'short'})} ↘</button></label><div class="availability ${closed||!free.length?'off':''}" role="status">${closed?L('ช่างไม่อยู่ในวันที่เลือก — เลือกวันอื่นหรือช่างคนอื่น','Away on this date — choose another day or barber','当天休息，请选择其他日期或理发师','В этот день выходной — выберите другую дату или мастера'):free.length?`${L('รับคิว','Available','可预约','Доступен')} · ${fmt(state.date,{day:'numeric',month:'short'})} · ${L('ว่างเร็วสุด','First opening','最早时间','Ближайшее время')} ${free[0]}`:L('วันนี้ไม่มีคิวว่างแล้ว เลือกวันอื่นในขั้นตอนถัดไป','No openings on this date. Choose another day in the next step.','当天无空位，请在下一步选择其他日期','Нет свободного времени. Выберите другой день на следующем шаге.')}</div></div><div class="barber-picker"><span class="picker-label" id="barber-picker-label">${L('เลือกช่างของคุณ','Choose your barber','选择理发师','Выберите мастера')}</span><div class="barber-tabs" role="radiogroup" aria-labelledby="barber-picker-label">${BARBERS.map((p,i)=>`<button type="button" role="radio" data-barber="${i}" aria-checked="${state.barber===i}" tabindex="${state.barber===i?0:-1}">${p.number} / ${p.name.replace('Barber ','')}<small>${off(p.id,state.date)?L('หยุดวันที่เลือก','Day off','休息','Выходной'):times(p.id).length?L('มีคิวว่าง','Available','可预约','Есть места'):L('ไม่มีคิวว่าง','No slots','已满','Нет мест')}</small></button>`).join('')}</div></div><div class="step-commit"><p class="commit-line">${L('ช่างที่เลือก','Your barber','已选理发师','Ваш мастер')} · <b>${b.name}</b></p><button id="choose-barber" class="primary wide">${L('ถัดไป · เลือกวันและเวลา','Next · find your time','下一步 · 选择时间','Далее · выбрать время')}<span>→</span></button>${closed||!free.length?`<button class="secondary" id="other-date">${L('ดูปฏิทินวันอื่น','Explore other dates','查看其他日期','Другие даты')} ↓</button>`:''}</div>`;
 $('#quick-date').onclick=()=>{state.chosen=true;renderCalendar();jump('calendar');};
 $('#choose-barber').onclick=()=>{state.chosen=true;state.receipt=null;renderBarber();renderCalendar();renderPayment();jump('calendar');};
 $('#other-date')?.addEventListener('click',()=>{state.chosen=true;renderCalendar();jump('calendar');});
 document.querySelectorAll('[data-barber]').forEach(el=>el.onclick=()=>spinTo(Number(el.dataset.barber),Number(el.dataset.barber)>state.barber?1:-1));
 $('.barber-picker .barber-tabs')?.addEventListener('keydown',e=>{
  const move={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(!move)return;
  e.preventDefault();const next=(state.barber+move+BARBERS.length)%BARBERS.length;
  spinTo(next,move).then(()=>$(`.barber-picker [data-barber="${next}"]`)?.focus());
 });
}
/* A throttled or backgrounded tab never fires `finished`, so never await it alone:
   that would strand `spinning` at true and freeze the picker for good. */
const settle=(animation,ms)=>Promise.race([animation.finished.catch(()=>{}),new Promise(done=>setTimeout(done,ms))]);
async function spinTo(index,direction=1){
 if(spinning||index===state.barber)return;spinning=true;
 const card=$('#portrait-card'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const nextImage=new Image();nextImage.src=`assets/portrait-${BARBERS[index].id}.png`;
 try{
 await nextImage.decode().catch(()=>{});
 if(!card.isConnected)return;
 if(!reduced)await settle(card.animate([{opacity:1,filter:'blur(0px)',transform:'translateX(0) scale(1)'},{opacity:0,filter:'blur(22px)',transform:`translateX(${-direction*35}px) scale(1.06)`}],{duration:280,easing:'ease-in',fill:'forwards'}),400);
 if(!card.isConnected)return;
 state.barber=index;state.chosen=false;state.time='';state.receipt=null;
 $('#barber-image').src=portraitSource();$('#barber-image').alt=person().name;$('#portrait-name').textContent=person().name.replace('Barber ','');if($('#barber-count'))$('#barber-count').textContent=person().number+' / 03';renderBarber();renderCalendar();renderPayment();
 if(!reduced){card.getAnimations().forEach(a=>a.cancel());await settle(card.animate([{opacity:0,filter:'blur(22px)',transform:`translateX(${direction*35}px) scale(1.06)`},{opacity:1,filter:'blur(0px)',transform:'translateX(0) scale(1)'}],{duration:620,easing:'cubic-bezier(.16,1,.3,1)'}),760);}
 }finally{card.getAnimations().forEach(a=>a.cancel());spinning=false;}
}
function setVisitDate(date){state.date=date;state.time='';state.receipt=null;renderBarber();renderCalendar();renderPayment();}
function renderCalendar(){
 if(!$('#calendar'))return;
 const first=state.month+'-01',start=new Date(first+'T12:00:00+07:00').getUTCDay(),count=new Date(Number(state.month.slice(0,4)),Number(state.month.slice(5)),0).getDate(),valid=times(),hours=workHours(getSchedules(),person().id,state.date);
 const all=[];for(const [from,to] of hours){for(let n=minutes(from);n+45<=minutes(to);n+=15)all.push(timeLabel(n));}
 const every=[...new Set(all)],open=every.filter(t=>valid.includes(t)),fullCount=every.length-open.length;
 const periods=[[L('ช่วงเช้า','Morning','上午','Утро'),t=>minutes(t)<720],[L('ช่วงบ่าย','Afternoon','下午','День'),t=>minutes(t)>=720&&minutes(t)<1020],[L('ช่วงเย็น','Evening','晚上','Вечер'),t=>minutes(t)>=1020]];
 const confirmCard=state.time
  ?`<div class="booking-confirm is-set" role="status"><img src="${portraitSource()}" alt="" aria-hidden="true"><div class="confirm-body"><small>${L('นัดหมายของคุณ','Your appointment','您的预约','Ваша запись')}</small><strong>${state.time} – ${timeLabel(minutes(state.time)+45)}</strong><span>${fmt(state.date)} · ${person().name}</span><span class="confirm-meta">${L('ตัดผม 45 นาที','Haircut · 45 min','理发 45 分钟','Стрижка · 45 мин')} · ฿350</span></div><span class="confirm-check" aria-hidden="true">✓</span></div>`
  :`<div class="booking-confirm" role="status"><span>${L('เลือกเวลาที่สะดวก แล้วไปเลือกทรงผมของคุณ','Choose your time, then find your style.','选择时间后，继续选择发型。','Выберите время, затем ваш стиль.')}</span></div>`;
 $('#calendar').innerHTML=`<div class="section-top"><div><p class="eyebrow">02 / YOUR TIME</p><h2>${titleTime()}</h2></div><p class="muted">${L('วันนี้คือ','Today is','今天是','Сегодня')} ${fmt(today())}<br><small>${L('เวลาร้านประเทศไทย (GMT+7) • ตัดผม 45 นาที','Thailand time (GMT+7) • Haircut, 45 minutes','泰国时间 (GMT+7) · 理发45分钟','Время Таиланда (GMT+7) · Стрижка 45 минут')}</small></p></div>${!state.chosen?`<div class="inline-notice">${L('กำลังดูคิวของ','Viewing availability for','正在查看','Расписание')} <b>${person().name}</b> · ${L('เลือกวันได้ แล้วกดยืนยันช่างก่อนเลือกเวลา','Explore dates, then confirm your barber before selecting a time.','可先查看日期，再确认理发师以选择时间。','Выберите дату, затем подтвердите мастера для выбора времени.')} <button class="secondary" id="confirm-inline" ${off(person().id,state.date)||!valid.length?'disabled':''}>${L('เลือกช่างคนนี้','Choose this barber','选择该理发师','Выбрать мастера')}</button></div>`:''}
 <div class="calendar-layout"><div class="calendar"><div class="month-heading"><button id="prev-month" class="round" aria-label="${L('เดือนก่อน','Previous month','上个月','Предыдущий месяц')}" ${state.month<=today().slice(0,7)?'disabled':''}>←</button><h3>${fmt(first,{month:'long',year:'numeric'})}</h3><button id="next-month" class="round" aria-label="${L('เดือนถัดไป','Next month','下个月','Следующий месяц')}" ${state.month>=addDays(today(),90).slice(0,7)?'disabled':''}>→</button></div><div class="weekdays">${Array.from({length:7},(_,i)=>`<span>${fmt(addDays('2026-09-27',i),{weekday:'short'})}</span>`).join('')}</div><div class="days">${'<span></span>'.repeat(start)}${Array.from({length:count},(_,i)=>{const d=state.month+'-'+String(i+1).padStart(2,'0'),past=d<today()||d>addDays(today(),90),isOff=off(person().id,d),free=past||isOff?0:times(person().id,d).length,load=isOff?'day-off':free===0?'day-full':free<=3?'day-few':'day-open',note=isOff?L('ช่างหยุด','Barber away','理发师休息','Выходной'):free===0?L('คิวเต็ม','Fully booked','已满','Нет мест'):`${L('ว่าง','open','可预约','свободно')} ${free}`;return `<button data-day="${d}" class="${d===state.date?'selected':''} ${d===today()?'today':''} ${load}" aria-pressed="${d===state.date}" aria-label="${fmt(d)}${past?'':' · '+note}" ${past?'disabled':''}>${i+1}<i class="day-dot" aria-hidden="true"></i></button>`;}).join('')}</div><div class="legend"><span class="key key-open">${L('ว่างหลายช่วง','Plenty open','空位充足','Много мест')}</span><span class="key key-few">${L('เหลือน้อย','Few left','所剩不多','Мало мест')}</span><span class="key key-full">${L('คิวเต็ม','Full','已满','Занято')}</span><span class="key key-away">${L('ช่างหยุด','Barber away','休息','Выходной')}</span></div></div>
 <div class="time-panel"><p class="eyebrow">${person().name} / ${L('เวลาว่าง','AVAILABILITY','可预约时间','СВОБОДНОЕ ВРЕМЯ')}</p><p class="day-display">${fmt(state.date)}</p><div class="time-caption"><span>${L('เลือกเวลาเริ่มตัด','Choose a start time','选择开始时间','Начало стрижки')}</span><span>${open.length} ${L('ช่วงที่ว่าง','open','个空位','свободно')}</span></div>${!hours.length?`<div class="inline-notice">${L('ช่างไม่อยู่ในวันที่เลือก กรุณาเลือกวันอื่น','Your barber is away on this date. Please choose another day.','该理发师当天休息，请选择其他日期。','В этот день мастер не работает. Выберите другую дату.')}</div>`:!open.length?`<p class="availability off">${L('ไม่มีคิวว่างในวันนี้ เลือกวันอื่นได้เลย','No openings on this date. Try another day.','当天暂无空位，请选择其他日期。','Нет свободного времени. Попробуйте другую дату.')}</p>`:''}${periods.map(([label,test])=>{const list=open.filter(test);return list.length?`<div class="time-group"><p class="time-group-label">${label}<span>${list.length}</span></p><div class="time-grid">${list.map(time=>`<button data-time="${time}" class="${state.time===time?'selected':''}" aria-pressed="${state.time===time}" ${state.chosen?'':'disabled'}>${time}</button>`).join('')}</div></div>`:'';}).join('')}${fullCount&&open.length?`<p class="time-full-note">${L('เต็มแล้ว','Fully booked','已满','Занято')} ${fullCount} ${L('ช่วงในวันนี้','slots today','个时段','слотов')}</p>`:''}<div class="step-commit">${confirmCard}<button id="to-style" class="primary wide" ${!state.time?'disabled':''}>${L('ถัดไป · ','Next · ','下一步 · ','Далее · ')}${titleStyle()} <span>→</span></button></div></div></div>`;
 const monthMove=n=>{const d=new Date(first+'T12:00:00+07:00');d.setUTCMonth(d.getUTCMonth()+n);state.month=d.toISOString().slice(0,7);renderCalendar();};
 $('#prev-month').onclick=()=>monthMove(-1);$('#next-month').onclick=()=>monthMove(1);
 document.querySelectorAll('[data-day]').forEach(el=>el.onclick=()=>setVisitDate(el.dataset.day));
 document.querySelectorAll('[data-time]').forEach(el=>el.onclick=()=>{state.time=el.dataset.time;state.receipt=null;renderCalendar();renderPayment();});
 $('#confirm-inline')?.addEventListener('click',()=>{state.chosen=true;renderBarber();renderCalendar();renderPayment();});
 $('#to-style').onclick=()=>jump('style');updateWizard();
}
function renderStyle(){
 if(!$('#style'))return;
 $('#style').innerHTML=`<div class="section-top"><div><p class="eyebrow">03 / YOUR LOOK</p><h2>${titleStyle()}</h2></div><p class="muted">${L('เริ่มจากทรงที่ชอบ ส่งรูปเรฟ แล้วให้ช่างช่วยปรับให้เป็นคุณ','Start with a style you love. Bring a reference. Make it yours.','选择喜欢的发型，上传参考图，让理发师为您调整。','Выберите идею, добавьте фото — и найдём ваш образ.')}</p></div><p class="style-source">${L('4 ลุคจากผลงานร้าน · ตัวเลือกตัวอย่าง รอร้านยืนยันทรงยอดนิยม','4 looks from the studio · Sample selection; favourites to be confirmed','店内4款作品 · 示例选项，热门款式待确认','4 образа из работ студии · Популярные варианты уточняются')}</p><div class="style-options">${styleData().map(([id,n,name,desc])=>`<button data-style="${id}" class="style-choice ${state.style===id?'selected':''}" aria-pressed="${state.style===id}"><span class="style-photo"><img src="assets/${styleImages[id]}" alt="${name}" loading="lazy"><span class="style-number">${n}</span><span class="style-selected" aria-hidden="true">✓</span></span><span class="style-body"><b>${name}</b><small>${desc}</small><span class="style-pick">${state.style===id?L('เลือกทรงนี้แล้ว','Selected','已选择','Выбрано'):L('เลือกทรงนี้','Choose this look','选择此发型','Выбрать')} <span aria-hidden="true">${state.style===id?'✓':'↗'}</span></span></span></button>`).join('')}</div><div class="two-col"><div class="upload"><label for="reference">${L('รูปเรฟที่อยากให้ช่างดู (ถ้ามี)','Your reference photos (optional)','参考图片（选填）','Фото для примера (необязательно)')}<br><small class="muted">JPG / PNG / WEBP · ${L('สูงสุด 2 รูป รูปละ 1 MB','Up to 2 photos, 1 MB each','最多2张，每张1 MB','До 2 фото, по 1 МБ')}</small></label><input type="file" id="reference" accept="image/jpeg,image/png,image/webp" multiple><div id="photo-previews" class="photo-previews"></div><p class="error" id="upload-error" role="status"></p></div><label class="field">${L('บอกช่างเพิ่มเติม (ถ้ามี)','Anything else for your barber? (optional)','补充说明（选填）','Пожелания мастеру (необязательно)')}<textarea id="note" maxlength="1000" placeholder="${L('เช่น ด้านข้างสั้น แต่ขอเก็บความยาวด้านบนไว้','For example: short sides, keep some length on top.','例如：两侧短一些，顶部保留长度。','Например: короче по бокам, оставить длину сверху.')}" >${esc(state.note)}</textarea></label></div><div class="actions"><span class="subtle">${L('ตัดผม 45 นาที · ราคาตัวอย่าง ฿350','45-minute haircut · Sample price ฿350','理发45分钟 · 示例价格 ฿350','Стрижка 45 минут · Примерная цена ฿350')}</span><button id="to-payment" class="primary" ${!state.style?'disabled':''}>${L('กรอกข้อมูลและชำระเงิน','Details & payment','信息与付款','Контакты и оплата')} →</button></div>`;
 document.querySelectorAll('[data-style]').forEach(el=>el.onclick=()=>{state.style=el.dataset.style;state.receipt=null;renderStyle();renderPayment();});
 $('#note').oninput=e=>state.note=e.target.value;
 $('#to-payment').onclick=()=>{renderPayment();jump('payment');};
 $('#reference').onchange=async e=>{
 const files=[...e.target.files],error=$('#upload-error');
 if(files.length+state.photos.length>2||files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>1048576)){error.textContent=L('เพิ่มได้ไม่เกิน 2 รูป ใช้ JPG, PNG หรือ WEBP ขนาดไม่เกิน 1 MB ต่อรูป','Use up to 2 JPG, PNG or WEBP photos, no larger than 1 MB each.','最多2张JPG、PNG或WEBP，每张不超过1 MB。','До 2 файлов JPG, PNG или WEBP, до 1 МБ каждый.');e.target.value='';return;}
 try{const photos=await Promise.all(files.map(f=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const probe=new Image();probe.onload=()=>resolve({name:f.name,data:reader.result});probe.onerror=reject;probe.src=reader.result;};reader.readAsDataURL(f);})));state.photos.push(...photos);state.receipt=null;renderPreviews();error.textContent='';}catch{error.textContent=L('อ่านรูปไม่สำเร็จ ลองเลือกรูปใหม่','Could not read this image. Try another photo.','无法读取图片，请重试。','Не удалось прочитать фото. Выберите другое.');}e.target.value='';
 };
 renderPreviews();updateWizard();
}
function renderPreviews(){$('#photo-previews').innerHTML=state.photos.map((p,i)=>`<figure><img src="${p.data}" alt="${esc(p.name)}"><button data-remove="${i}" aria-label="${L('ลบรูป','Remove photo','删除图片','Удалить фото')} ${i+1}">×</button></figure>`).join('');document.querySelectorAll('[data-remove]').forEach(el=>el.onclick=()=>{state.photos.splice(Number(el.dataset.remove),1);renderPreviews();});}
function renderPayment(){
 if(!$('#payment'))return;
 if(state.receipt){const b=state.receipt;
  const barber=BARBERS.find(p=>p.id===b.barber),code=b.id.slice(0,8).toUpperCase();
  const ends=timeLabel(minutes(b.time)+b.duration),styleName=styleData().find(x=>x[0]===b.style)?.[2]||'—';
  const row=(label,value)=>`<div><dt>${label}</dt><dd>${value}</dd></div>`;
  $('#payment').innerHTML=`<div class="success reveal">
   <svg class="success-mark" viewBox="0 0 52 52" aria-hidden="true"><circle class="mark-ring" cx="26" cy="26" r="23"/><path class="mark-tick" d="M15 27.5l7.5 7.5L37 19"/></svg>
   <p class="eyebrow">${L('ยืนยันการจองแล้ว','BOOKING CONFIRMED','预约已确认','ЗАПИСЬ ПОДТВЕРЖДЕНА')} / DEMO</p>
   <h2>${L('แล้วพบกันที่เก้าอี้ตัวโปรด','See you in the chair.','期待您的到来。','До встречи в кресле.')}</h2>
   <div class="receipt">
    <div class="receipt-head"><img src="assets/portrait-${barber.id}.png" alt="" aria-hidden="true"><div><strong>${fmt(b.date)}</strong><span>${b.time} – ${ends} · ${barber.name}</span></div><span class="receipt-stamp">${L('ยืนยันแล้ว','CONFIRMED','已确认','ПОДТВЕРЖДЕНО')}</span></div>
    <dl class="receipt-rows">${row(L('ชื่อผู้จอง','Booked by','预约人','Имя'),esc(b.name))}${row(L('เบอร์ติดต่อ','Phone','电话','Телефон'),esc(b.phone))}${row(L('ทรงผม','Style','发型','Стиль'),esc(styleName))}${row(L('ระยะเวลา','Duration','时长','Длительность'),`${b.duration} ${L('นาที','min','分钟','мин')}`)}${row(L('ยอดชำระ (จำลอง)','Paid (demo)','已付（模拟）','Оплачено (демо)'),`฿${b.price}`)}</dl>
    <div class="receipt-code"><small>${L('เลขที่การจอง','Booking reference','预约编号','Номер записи')}</small><strong>${code}</strong></div>
   </div>
   <p class="subtle">${L('นี่คือการจองตัวอย่าง ไม่มีการตัดเงินจริง','This is a demo booking. No real charge was made.','这是演示预约，不会实际扣款。','Это тестовая запись. Деньги не списаны.')}</p>
   <div class="actions">${presentationMode?'':`<button id="save-calendar" class="primary">${L('บันทึกลงปฏิทิน','Add to calendar','添加到日历','В календарь')} <span aria-hidden="true">↓</span></button><a class="secondary" href="#desk">${L('ดูคิวในหลังบ้าน','View in studio desk','查看管理端','Открыть расписание')} ↗</a>`}<button id="new-booking" class="secondary">${L('ทดลองจองอีกครั้ง','Book again','再次预约','Ещё раз')}</button></div>
   <p class="save-note" id="save-note" role="status"></p>
  </div>`;
  if($('#save-calendar'))$('#save-calendar').onclick=()=>{
   const stamp=(date,time)=>date.replace(/-/g,'')+'T'+time.replace(':','')+'00';
   const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//BRAVOCUTS//Booking Demo//EN','BEGIN:VEVENT',`UID:${b.id}@bravocuts.demo`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').slice(0,15)}Z`,`DTSTART;TZID=Asia/Bangkok:${stamp(b.date,b.time)}`,`DTEND;TZID=Asia/Bangkok:${stamp(b.date,ends)}`,`SUMMARY:BRAVOCUTS · ${barber.name}`,`LOCATION:BRAVOCUTS, Wichit Songkhram Road, Kathu, Phuket`,`DESCRIPTION:${styleName} · ${b.duration} min · Ref ${code}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
   const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
   const link=document.createElement('a');link.href=url;link.download=`bravocuts-${b.date}-${b.time.replace(':','')}.ics`;link.click();
   setTimeout(()=>URL.revokeObjectURL(url),2000);
   $('#save-note').textContent=L('บันทึกไฟล์ปฏิทินแล้ว เปิดไฟล์เพื่อเพิ่มลงปฏิทินของคุณ','Calendar file saved. Open it to add the appointment.','日历文件已保存，打开即可添加。','Файл календаря сохранён. Откройте его, чтобы добавить запись.');
  };
  $('#new-booking').onclick=()=>{Object.assign(state,{step:0,receipt:null,chosen:false,time:'',style:'',note:'',name:'',phone:'',photos:[]});renderSite();jump('barbers');};return;}
 const style=styleData().find(s=>s[0]===state.style)?.[2]||'—';
 $('#payment').innerHTML=`<div class="section-top"><div><p class="eyebrow">04 / THE FINAL DETAILS</p><h2>${titlePay()}</h2></div><p class="muted">${L('อีกนิดเดียว แล้วเจอกันที่ BRAVOCUTS','Almost there. See you at BRAVOCUTS.','即将完成，期待在 BRAVOCUTS 见到您。','Почти готово. До встречи в BRAVOCUTS.')}</p></div><form id="payment-form" class="two-col"><div class="contact-card"><label class="field">${L('ชื่อที่ใช้จอง','Your name','姓名','Ваше имя')}<input id="client-name" autocomplete="name" required maxlength="80" value="${esc(state.name)}"></label><label class="field">${L('เบอร์โทรติดต่อ','Phone number','联系电话','Номер телефона')}<input id="client-phone" type="tel" autocomplete="tel" required maxlength="24" placeholder="+66 ..." value="${esc(state.phone)}"></label><p>${L('วิธีชำระเงินตัวอย่าง','Demo payment method','模拟支付方式','Способ тестовой оплаты')}</p>${['promptpay','card'].map(p=>`<label class="pay-option"><input type="radio" name="payment" value="${p}" ${state.payment===p?'checked':''}>${p==='promptpay'?'PromptPay':'Credit / Debit Card'} · DEMO</label>`).join('')}<p class="subtle">${L('ขั้นตอนทดลอง ไม่มีการเรียกเก็บเงินจริง และไม่ต้องกรอกข้อมูลบัตร','A simulation only. No real charge or card details required.','仅为模拟，不扣款，无需输入卡信息。','Только демонстрация. Без списания и ввода данных карты.')}</p></div><div class="payment-summary"><p class="eyebrow">YOUR APPOINTMENT</p><h3>${person().name}</h3><div class="summary-row"><span>${titleTime()}</span><span>${fmt(state.date,{day:'numeric',month:'short'})}<br>${state.time?`${state.time}–${timeLabel(minutes(state.time)+45)}`:'—'}</span></div><div class="summary-row"><span>${titleStyle()}</span><span>${style}</span></div><div class="summary-row"><span>${L('ตัดผม','Haircut','理发','Стрижка')}</span><span>45 ${L('นาที','minutes','分钟','минут')}</span></div><div class="total"><span>${L('รวม','Total','合计','Итого')}</span><span>฿350</span></div><p class="subtle">${L('ราคาสำหรับสาธิต รอร้านยืนยัน','Illustrative price, awaiting owner confirmation.','价格为演示用途，待店主确认。','Примерная цена, требует подтверждения.')}</p><button type="submit" class="primary wide">${L('ทดลองชำระเงินและยืนยันคิว','Simulate payment & book','模拟付款并确认预约','Тестовая оплата и запись')} <span>↗</span></button><p id="payment-error" class="error" style="color:#ffc2ad" role="alert"></p></div></form>`;
 $('#client-name').oninput=e=>state.name=e.target.value;$('#client-phone').oninput=e=>state.phone=e.target.value;document.querySelectorAll('[name=payment]').forEach(e=>e.onchange=()=>state.payment=e.value);
 $('#payment-form').onsubmit=e=>{e.preventDefault();const error=$('#payment-error');if(!state.chosen||!state.time||!state.style){error.textContent=L('กรุณาเลือกช่าง เวลา และทรงผมให้ครบก่อน','Please choose your barber, time and style first.','请先选择理发师、时间和发型。','Сначала выберите мастера, время и стиль.');return;}
 if(!state.name.trim()||!/^[+\d\s()-]{7,24}$/.test(state.phone)||state.phone.replace(/\D/g,'').length<7){error.textContent=L('กรุณากรอกชื่อและเบอร์โทรที่ติดต่อได้','Please enter your name and a valid phone number.','请输入姓名和有效电话号码。','Укажите имя и корректный номер телефона.');return;}
 try{const booking=createBooking({name:state.name.trim(),phone:state.phone.trim(),date:state.date,time:state.time,barber:person().id,service:'cut',duration:45,price:350,style:state.style,note:state.note,photos:state.photos,payment:'paid_demo',paymentMethod:state.payment,demo:true});state.receipt=booking;desk.date=booking.date;renderPayment();renderCalendar();renderBarber();jump('payment');}catch(err){error.textContent=err.message==='storage'?L('พื้นที่เก็บข้อมูลเต็ม ลองลดรูปเรฟแล้วส่งอีกครั้ง','Storage is full. Remove a reference photo and try again.','存储空间已满，请减少参考图片。','Хранилище заполнено. Удалите фото и повторите.'):L('ช่วงเวลานี้ไม่ว่างแล้ว กรุณาเลือกเวลาใหม่','This time is no longer available. Choose another slot.','该时间已不可用，请重新选择。','Это время уже недоступно. Выберите другое.');if(err.message!=='storage'){state.time='';renderCalendar();goStep(1).then(()=>{if($('#wizard-status'))$('#wizard-status').textContent=L('ช่วงเวลานี้ไม่ว่างแล้ว กรุณาเลือกเวลาใหม่ ข้อมูลที่กรอกไว้ยังอยู่ครบ','This slot is no longer available. Choose a new time; your details are saved.','该时段已满，请重新选择。其他信息已保留。','Время уже занято. Выберите другое — ваши данные сохранены.');});}}
 };
}

function renderDesk(){
 const appointments=getBookings().filter(b=>b.date===desk.date&&b.status!=='cancelled');
 $('#main').innerHTML=`<div class="wrap admin-panel"><div class="admin-top"><div><p class="eyebrow">BRAVOCUTS / STUDIO DESK</p><h2>${L('เปิดมา ก็เห็นทุกคิว','Your day, at a glance.','今日预约，一目了然','Весь день перед глазами.')}</h2></div><label>${L('วันที่','Date','日期','Дата')} <input id="desk-date" type="date" value="${desk.date}"></label></div><p class="muted">${fmt(desk.date)} · ${L('หลังบ้านสาธิตบนเครื่องนี้','Demo desk on this device','本设备演示管理端','Демо на этом устройстве')}</p><div class="stats"><div><b>${appointments.filter(b=>b.status!=='blocked').length}</b>${L('คิว','bookings','预约','записей')}</div><div><b>3</b>${L('ช่าง','barbers','理发师','мастера')}</div><div><b>${appointments.filter(b=>b.status==='blocked').length}</b>${L('ช่วงพัก','breaks','休息','перерывов')}</div></div><div class="actions"><a class="secondary" href="#barbers">← ${L('กลับหน้าจอง','Booking page','预约页面','Страница записи')}</a><button id="add-appointment" class="primary">+ ${L('เพิ่มคิว / ปิดเวลา','Add booking / block time','添加预约 / 锁定时间','Запись / перерыв')}</button></div><div class="desk-grid">${BARBERS.map(b=>`<section class="desk-column"><div class="desk-person"><img src="${b.image}" alt="${b.name}"><div><h3>${b.name}</h3><small class="muted">${off(b.id,desk.date)?L('หยุด / ไม่อยู่','Day off','休息','Выходной'):workHours(getSchedules(),b.id,desk.date).map(r=>r.join('–')).join(', ')}</small></div></div>${appointments.filter(a=>a.barber===b.id).sort((a,b)=>a.time.localeCompare(b.time)).map(a=>`<button class="appointment ${a.status==='blocked'?'blocked':''}" data-appointment="${a.id}"><span>${a.time}–${timeLabel(minutes(a.time)+a.duration)}</span><b>${esc(a.name)}</b><small>${statusText(a.status)}${a.style?' · '+esc(styleData().find(s=>s[0]===a.style)?.[2]||a.style):''}</small></button>`).join('')||`<p class="empty">${L('ยังไม่มีคิวในวันนี้','No bookings on this day','当天暂无预约','Записей пока нет')}</p>`}</section>`).join('')}</div><div id="appointment-editor"></div><section class="editor" id="schedule-editor"></section></div>`;
 $('#desk-date').onchange=e=>{if(e.target.value){desk.date=e.target.value;desk.editor=null;renderDesk();}};
 $('#add-appointment').onclick=()=>{desk.editor='new';renderAppointmentEditor();jump('appointment-editor');};
 document.querySelectorAll('[data-appointment]').forEach(el=>el.onclick=()=>{desk.editor=el.dataset.appointment;renderAppointmentEditor();jump('appointment-editor');});
 renderSchedule();if(desk.editor)renderAppointmentEditor();
}
function renderSchedule(){
 $('#schedule-editor').innerHTML=`<p class="eyebrow">WORKING HOURS</p><h3>${L('ตั้งเวลารับงานและวันหยุด','Working hours & days off','工作时间与休息日','Часы работы и выходные')}</h3><p class="schedule-note">${L('เลือกช่าง แล้วตั้งเฉพาะวันที่หรือทำซ้ำทุกสัปดาห์ เวลาที่ปิดจะหายจากหน้าจองทันที หากมีคิวเดิมอยู่ ระบบจะให้ย้ายหรือยกเลิกคิวก่อน','Set a specific date or a recurring weekday. Availability updates immediately. Existing appointments must be moved or cancelled before conflicting hours can be saved.','设置指定日期或每周工作日，即时更新预约时间。已有预约冲突时，需先调整或取消预约。','Настройте дату или день недели. Расписание обновится сразу. При конфликте сначала перенесите или отмените запись.')}</p><form id="schedule-form"><div class="form-grid"><label>${titleBarber()}<select id="schedule-barber">${BARBERS.map(b=>`<option value="${b.id}">${b.name}</option>`).join('')}</select></label><label>${L('รูปแบบ','Apply to','应用范围','Применить к')}<select id="schedule-scope"><option value="date">${L('เฉพาะวันที่เลือก','This date only','指定日期','Только эта дата')}</option><option value="weekly">${L('ซ้ำทุกสัปดาห์ในวันเดียวกัน','Same weekday, every week','每周同一天','Этот день каждой недели')}</option></select></label><label>${L('วันที่','Date','日期','Дата')}<input id="schedule-date" type="date" required min="${today()}" value="${desk.date<today()?today():desk.date}"></label></div><label class="checkbox"><input id="schedule-off" type="checkbox">${L('ช่างไม่อยู่ / หยุดทั้งวัน','Away / day off','全天休息','Выходной / отсутствует')}</label><div class="form-grid"><label>${L('เริ่มรับงาน','Starts at','开始时间','Начало')}<input id="work-from" type="time" required value="10:00"></label><label>${L('สิ้นสุดรับงาน','Ends at','结束时间','Конец')}<input id="work-to" type="time" required value="21:00"></label></div><div class="actions"><button type="button" class="secondary" id="reset-date">${L('ใช้ตารางประจำสำหรับวันนี้','Use weekly hours for this date','该日期使用每周时段','Использовать недельный график')}</button><button class="primary" type="submit">${L('บันทึกเวลารับงาน','Save working hours','保存工作时间','Сохранить часы')}</button></div><p id="schedule-message" role="status"></p></form>`;
 const loadHours=()=>{const id=$('#schedule-barber').value,date=$('#schedule-date').value;if(!date)return;const sc=getSchedules();const h=$('#schedule-scope').value==='weekly'?(sc[id]?.weekly?.[new Date(date+'T12:00:00+07:00').getUTCDay()]??[['10:00','21:00']]):workHours(sc,id,date);$('#schedule-off').checked=!h.length;$('#work-from').value=h[0]?.[0]||'10:00';$('#work-to').value=h[0]?.[1]||'21:00';$('#work-from').disabled=$('#work-to').disabled=!h.length;};
 ['schedule-barber','schedule-date','schedule-scope'].forEach(id=>$('#'+id).onchange=loadHours);$('#schedule-off').onchange=e=>{$('#work-from').disabled=$('#work-to').disabled=e.target.checked;};loadHours();
 const persist=reset=>{const id=$('#schedule-barber').value,date=$('#schedule-date').value,scope=$('#schedule-scope').value,sc=getSchedules(),message=$('#schedule-message');if(!date)return;
 const from=$('#work-from').value,to=$('#work-to').value,closed=$('#schedule-off').checked;
 if(!reset&&!closed&&(!Number.isFinite(minutes(from))||minutes(to)<=minutes(from))){message.className='error';message.textContent=L('เวลาสิ้นสุดต้องหลังเวลาเริ่ม','End time must be after start time.','结束时间须晚于开始时间。','Конец должен быть позже начала.');return;}
 sc[id]??={weekly:{},dates:{}};sc[id].dates??={};sc[id].weekly??={};
 if(reset)delete sc[id].dates[date];else if(scope==='date')sc[id].dates[date]=closed?[]:[[from,to]];else sc[id].weekly[new Date(date+'T12:00:00+07:00').getUTCDay()]=closed?[]:[[from,to]];
 try{saveSchedules(sc);desk.date=date;renderDesk();$('#schedule-message').className='saved';$('#schedule-message').textContent=L('บันทึกแล้ว หน้าจองใช้ตารางใหม่นี้ทันที','Saved. The booking page now uses these hours.','已保存，预约页面已更新。','Сохранено. Новые часы уже доступны на странице записи.');}catch(err){message.className='error';message.textContent=err.message==='storage'?L('บันทึกไม่สำเร็จ พื้นที่เก็บข้อมูลเต็ม','Storage full. Could not save.','存储已满，无法保存。','Хранилище заполнено.'):L('มีคิวหรือช่วงปิดเวลาเดิมทับกับตารางใหม่ กรุณาย้ายหรือยกเลิกรายการนั้นก่อน','Existing bookings or blocks conflict. Move or cancel those entries first.','现有预约或锁定时段冲突，请先调整或取消。','Есть конфликт с записями или перерывами. Сначала перенесите или отмените их.');}
 };
 $('#schedule-form').onsubmit=e=>{e.preventDefault();persist(false);};$('#reset-date').onclick=()=>persist(true);
}
function renderAppointmentEditor(){
 const editing=desk.editor!=='new',b=editing?getBookings().find(b=>b.id===desk.editor):{name:'',phone:'',barber:'yu',date:desk.date,time:'10:00',duration:45,status:'confirmed',note:'',photos:[]};if(!b){desk.editor=null;return;}
 const photos=(b.photos||[]).map(p=>typeof p==='string'?{data:p,name:'Reference'}:p);
 $('#appointment-editor').innerHTML=`<section class="editor reveal"><div class="admin-top"><h3>${editing?esc(b.name):L('เพิ่มคิวหรือปิดช่วงเวลา','Add a booking or break','添加预约或休息','Новая запись или перерыв')}</h3><button id="close-editor" class="secondary">${L('ปิดรายละเอียด','Close details','关闭详情','Закрыть')}</button></div><form id="appointment-form"><div class="form-grid"><label>${L('ประเภท','Type','类型','Тип')}<select id="edit-kind"><option value="booking" ${b.status!=='blocked'?'selected':''}>${L('คิวลูกค้า','Appointment','客户预约','Запись')}</option><option value="block" ${b.status==='blocked'?'selected':''}>${L('ปิดเวลา / พัก','Unavailable / break','锁定 / 休息','Перерыв')}</option></select></label><label>${titleBarber()}<select id="edit-barber">${BARBERS.map(p=>`<option value="${p.id}" ${b.barber===p.id?'selected':''}>${p.name}</option>`).join('')}</select></label><label>${L('วันที่','Date','日期','Дата')}<input id="edit-date" type="date" required value="${b.date}"></label><label>${L('ชื่อ / เหตุผลปิดเวลา','Name / reason','姓名 / 原因','Имя / причина')}<input id="edit-name" required maxlength="80" value="${esc(b.name)}"></label><label>${L('เบอร์โทร','Phone','电话','Телефон')}<input id="edit-phone" type="tel" value="${esc(b.phone||'')}"></label><label>${L('เวลาเริ่ม','Start','开始','Начало')}<input id="edit-time" required type="time" value="${b.time}"></label><label>${L('ระยะเวลา (นาที)','Duration (minutes)','时长（分钟）','Длительность (минуты)')}<input id="edit-duration" type="number" min="15" max="660" step="15" required value="${b.duration}"></label></div><label class="field" style="margin-top:20px">${L('รายละเอียดเพิ่มเติม','Notes','备注','Пожелания')}<textarea id="edit-note" maxlength="1000">${esc(b.note||'')}</textarea></label>${b.style?`<p>${titleStyle()}: <b>${esc(styleData().find(s=>s[0]===b.style)?.[2]||b.style)}</b></p>`:''}${b.payment?`<p class="subtle">${L('ชำระเงินจำลองแล้ว ไม่มีการตัดเงินจริง','Demo payment completed. No real charge.','模拟付款完成，无实际扣款。','Тестовая оплата завершена. Без списания.')}</p>`:''}<div class="reference-photos">${photos.filter(p=>/^data:image\/(jpeg|png|webp);base64,/.test(p.data||p.url||'')).map(p=>`<img src="${p.data||p.url}" alt="${esc(p.name||'Reference')}">`).join('')}</div><button type="submit" class="primary">${L('บันทึกคิว','Save appointment','保存预约','Сохранить запись')}</button><p class="error" id="appointment-error" role="alert"></p></form>${editing?`<p>${L('สถานะปัจจุบัน','Current status','当前状态','Статус')}: <b>${statusText(b.status)}</b></p><div class="status-actions">${(b.status==='blocked'?['cancelled']:['confirmed','arrived','cutting','done','cancelled']).map(s=>`<button class="secondary" data-status="${s}" ${s===b.status?'disabled':''}>${statusText(s)}</button>`).join('')}</div>`:''}</section>`;
 $('#close-editor').onclick=()=>{desk.editor=null;$('#appointment-editor').innerHTML='';};
 $('#appointment-form').onsubmit=e=>{e.preventDefault();const isBlock=$('#edit-kind').value==='block';const data={name:$('#edit-name').value.trim(),phone:$('#edit-phone').value,barber:$('#edit-barber').value,date:$('#edit-date').value,time:$('#edit-time').value,duration:Number($('#edit-duration').value),note:$('#edit-note').value,status:isBlock?'blocked':b.status==='blocked'?'confirmed':b.status,service:isBlock?'block':'cut',demo:true};
 try{if(editing)updateBooking(b.id,data);else createBooking(data);desk.date=data.date;desk.editor=null;renderDesk();}catch{$('#appointment-error').textContent=L('คิวชน ช่างหยุด หรือเวลานี้ผ่านไปแล้ว กรุณาเลือกเวลาใหม่','Time conflicts, barber is away, or time has elapsed. Choose another slot.','时间冲突、理发师休息或时间已过，请重新选择。','Время занято, прошло или мастер не работает. Выберите другое.');}};
 document.querySelectorAll('[data-status]').forEach(el=>el.onclick=()=>{try{updateBooking(b.id,{status:el.dataset.status});desk.editor=null;renderDesk();}catch{$('#appointment-error').textContent=L('คิวชนกับรายการอื่น กรุณาปรับวันเวลาก่อน','This conflicts with another entry. Adjust its time first.','与其他预约冲突，请先调整时间。','Есть конфликт. Сначала измените время.');}});
}
$('#language').onchange=e=>setLanguage(e.target.value);
window.addEventListener('load',()=>{if(isBooking&&location.hash!=='#desk')window.scrollTo({top:0,behavior:'instant'});},{once:true});
window.addEventListener('bravo:language',()=>render());
window.addEventListener('hashchange',()=>{
 if(location.hash==='#desk'){render();return;}
 const requested=stepIds.indexOf(location.hash.slice(1));
 if(isBooking){if(!$('#barbers'))render();goStep(requested<0?0:requested,{historyMode:'replace'});}
 else if(!$('#studio')){render();jump(location.hash.slice(1)||'studio');}
});
window.addEventListener('storage',()=>{
 if(location.hash==='#desk'){if(!desk.editor)renderDesk();}
 else if($('#barbers')){
 const expired=state.time&&!times().includes(state.time)&&!state.receipt;
 renderBarber();renderCalendar();renderPayment();
 if(expired&&state.step>1)goStep(state.step);else if(expired){state.time='';renderCalendar();}
 updateWizard();
 }
});
render();
