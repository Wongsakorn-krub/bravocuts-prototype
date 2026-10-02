export const BARBERS = [
  {id:'yu',name:'Barber Yu',image:'assets/barber-yu.webp',skills:['fade','classic'],number:'01'},
  {id:'jeng',name:'Barber Jeng',image:'assets/barber-jeng.webp',skills:['korean','texture'],number:'02'},
  {id:'min',name:'Barber Min',image:'assets/barber-min.webp',skills:['skin','beardwork'],number:'03'}
];
export const SERVICES = [{id:'cut',price:350,duration:45},{id:'beard',price:200,duration:30},{id:'combo',price:500,duration:60}];
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function addDays(date,days){const d=new Date(date+'T12:00:00+07:00');d.setUTCDate(d.getUTCDate()+days);return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
export const minutes = time => {if(!/^\d{2}:\d{2}$/.test(time))return NaN;const [h,m]=time.split(':').map(Number);return h>=0&&h<24&&m>=0&&m<60?h*60+m:NaN;};
export const timeLabel = n => `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export function workHours(schedules,barber,date){
  const person=schedules?.[barber];
  const weekday=new Date(date+'T12:00:00+07:00').getUTCDay();
  return person?.dates?.[date] ?? person?.weekly?.[weekday] ?? [['10:00','21:00']];
}
export function available(bookings,{date,time,duration,barber,excludeId},now=null,schedules={}){
  const start=minutes(time);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||!Number.isFinite(start)||!Number.isFinite(duration)||duration<=0||!BARBERS.some(b=>b.id===barber))return false;
  if(!workHours(schedules,barber,date).some(([from,to])=>start>=minutes(from)&&start+duration<=minutes(to)))return false;
  if(now&&new Date(`${date}T${time}:00+07:00`).getTime()<=new Date(now).getTime())return false;
  return !bookings.some(b=>b.id!==excludeId&&b.date===date&&b.barber===barber&&b.status!=='cancelled'&&start<minutes(b.time)+b.duration&&start+duration>minutes(b.time));
}
export function resolveBarber(bookings,request,now=null,schedules={}){return BARBERS.find(b=>(request.barber==='any'||request.barber===b.id)&&available(bookings,{...request,barber:b.id},now,schedules))?.id||null;}
export function slots(bookings,request,now=null,schedules={}){const out=[];for(let n=0;n+request.duration<1440;n+=15){const time=timeLabel(n);if(resolveBarber(bookings,{...request,time},now,schedules))out.push(time);}return out;}
export function seedBookings(date){return [
  {id:'sample-1',name:'Alex M.',barber:'yu',time:'10:00',service:'cut',duration:45,status:'done'},
  {id:'sample-2',name:'Narin',barber:'yu',time:'11:15',service:'combo',duration:60,status:'confirmed'},
  {id:'sample-3',name:'James',barber:'yu',time:'14:00',service:'cut',duration:45,status:'confirmed'},
  {id:'sample-4',name:'Ploy',barber:'jeng',time:'10:30',service:'cut',duration:45,status:'arrived'},
  {id:'sample-5',name:'Dmitri',barber:'jeng',time:'13:00',service:'combo',duration:60,status:'confirmed'},
  {id:'sample-6',name:'Lunch break',barber:'jeng',time:'12:00',service:'block',duration:60,status:'blocked'},
  {id:'sample-7',name:'Daniel',barber:'min',time:'10:00',service:'combo',duration:60,status:'cutting'},
  {id:'sample-8',name:'คุณต้น',barber:'min',time:'12:15',service:'cut',duration:45,status:'confirmed'},
  {id:'sample-9',name:'Lee',barber:'min',time:'15:00',service:'cut',duration:45,status:'confirmed'}
].map(b=>({...b,date,phone:'',note:'',photos:[],demo:true}));}
