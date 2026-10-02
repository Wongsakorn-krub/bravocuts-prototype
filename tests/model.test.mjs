import test from 'node:test';
import assert from 'node:assert/strict';
import {available,resolveBarber,slots,minutes,addDays,seedBookings} from '../model.js';
const date='2026-10-02';
const bookings=[{id:'1',date,barber:'yu',time:'11:00',duration:60,status:'confirmed'},{id:'2',date,barber:'jeng',time:'11:00',duration:60,status:'blocked'}];
test('overlaps are rejected, adjacent appointments are allowed',()=>{
 assert.equal(available(bookings,{date,barber:'yu',time:'10:30',duration:45}),false);
 assert.equal(available(bookings,{date,barber:'yu',time:'11:30',duration:45}),false);
 assert.equal(available(bookings,{date,barber:'yu',time:'10:15',duration:45}),true);
 assert.equal(available(bookings,{date,barber:'yu',time:'12:00',duration:45}),true);
});
test('any barber resolves only to someone free for the full service',()=>assert.equal(resolveBarber(bookings,{date,barber:'any',time:'11:15',duration:60}),'min'));
test('breaks block booking and cancelled appointments release time',()=>{
 assert.equal(available(bookings,{date,barber:'jeng',time:'11:15',duration:30}),false);
 assert.equal(available([{...bookings[0],status:'cancelled'}],{date,barber:'yu',time:'11:15',duration:30}),true);
});
test('rescheduling ignores own booking, still checks other appointments',()=>{
 assert.equal(available(bookings,{date,barber:'yu',time:'11:15',duration:45,excludeId:'1'}),true);
 assert.equal(available(bookings,{date,barber:'jeng',time:'11:15',duration:45,excludeId:'1'}),false);
});
test('closing time, invalid inputs and elapsed times are rejected',()=>{
 assert.equal(available([],{date,barber:'yu',time:'20:30',duration:45}),false);
 assert.equal(available([],{date,barber:'yu',time:'20:15',duration:45}),true);
 assert.equal(available([],{date,barber:'unknown',time:'12:00',duration:45}),false);
 assert.equal(available([],{date,barber:'yu',time:'12:00',duration:-1}),false);
 assert.equal(available([],{date,barber:'yu',time:'12:00',duration:45},'2026-10-02T12:01:00+07:00'),false);
 assert.ok(Number.isNaN(minutes('12:99')));
});
test('slots reflect full duration and Thailand timezone',()=>{
 const times=slots([],{date,barber:'any',duration:60},'2026-10-02T19:01:00+07:00');
 assert.deepEqual(times,['19:15','19:30','19:45','20:00']);
 assert.equal(addDays('2026-12-31',1),'2027-01-01');
});
test('demo appointments do not overlap per barber',()=>{
 const seed=seedBookings(date);
 seed.forEach(b=>assert.equal(available(seed,{...b,excludeId:b.id}),true));
});
test('dated absence takes priority over weekly working hours',()=>{
 const schedule={yu:{weekly:{5:[['09:00','17:00']]},dates:{[date]:[]}}};
 assert.deepEqual(slots([],{date,barber:'yu',duration:45},null,schedule),[]);
 assert.equal(available([],{date:'2026-10-09',barber:'yu',time:'09:00',duration:45},null,schedule),true);
 assert.equal(available([],{date:'2026-10-09',barber:'yu',time:'16:30',duration:45},null,schedule),false);
});
test('split working hours must contain the full appointment',()=>{
 const schedule={min:{dates:{[date]:[['09:00','12:00'],['14:00','18:00']]}}};
 assert.equal(available([],{date,barber:'min',time:'11:30',duration:45},null,schedule),false);
 assert.equal(available([],{date,barber:'min',time:'13:30',duration:45},null,schedule),false);
 assert.equal(available([],{date,barber:'min',time:'14:00',duration:45},null,schedule),true);
 assert.equal(available([],{date:'2026-02-30',barber:'yu',time:'14:00',duration:45}),false);
});
test('availability combines configured hours with blocked and elapsed slots',()=>{
 const schedule={yu:{dates:{[date]:[['09:00','12:00']]}}};
 assert.deepEqual(slots(bookings,{date,barber:'yu',duration:45},'2026-10-02T10:01:00+07:00',schedule),['10:15']);
});
