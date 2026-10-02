import { seedBookings,today,resolveBarber,available } from './model.js';
const key='bravocuts-prototype-v1';
let memory;
export function getBookings(){try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed))return parsed;}}catch{}return memory||seedBookings(today());}
function save(data){try{localStorage.setItem(key,JSON.stringify(data));memory=data;}catch{throw new Error('storage');}window.dispatchEvent(new CustomEvent('bravo:bookings'));}
export function createBooking(input){const all=getBookings();const barber=resolveBarber(all,input,new Date(),getSchedules());if(!barber)throw new Error('conflict');const booking={...input,barber,id:crypto.randomUUID(),status:input.status||'confirmed',createdAt:new Date().toISOString()};save([...all,booking]);return booking;}
export function updateBooking(id,changes){const all=getBookings();const existing=all.find(b=>b.id===id);if(!existing)throw new Error('missing');const updated={...existing,...changes};if(updated.status!=='cancelled'&&!available(all,{...updated,excludeId:id},null,getSchedules()))throw new Error('conflict');save(all.map(b=>b.id===id?updated:b));return updated;}
export function getSchedules(){try{return JSON.parse(localStorage.getItem('bravocuts-schedules-v2'))||{};}catch{return {};}}
export function saveSchedules(data){
  if(getBookings().some(b=>b.date>=today()&&b.status!=='cancelled'&&!available([] ,b,null,data)))throw new Error('schedule-conflict');
  try{localStorage.setItem('bravocuts-schedules-v2',JSON.stringify(data));}catch{throw new Error('storage');}
  window.dispatchEvent(new CustomEvent('bravo:bookings'));
}
