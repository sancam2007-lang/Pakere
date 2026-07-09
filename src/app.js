/* Pakere — interactive demo app logic */
const $ = id => document.getElementById(id);
const money = n => '$' + (Math.round(n*100)/100).toFixed(2).replace(/\.00$/,'');
const money2 = n => '$' + n.toFixed(2);
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const ICONS={
 pin:'<path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/>',
 car:'<path d="M5.4 16l1.3-4.5A2 2 0 0 1 8.6 10h6.8a2 2 0 0 1 1.9 1.5L18.6 16"/><path d="M4 16h16v2.6a1 1 0 0 1-1 1h-1.6a1 1 0 0 1-1-1V17H7.6v1.6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><circle cx="7.6" cy="16" r=".85"/><circle cx="16.4" cy="16" r=".85"/>',
 home:'<path d="M4 11l8-7 8 7"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.2-4.2"/>',
 zap:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 receipt:'<path d="M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21z"/><path d="M9 8h6M9 12h6"/>',
 award:'<circle cx="12" cy="9" r="5"/><path d="M8.5 13.2 7 21l5-3 5 3-1.5-7.8"/>',
 unlock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.7-1.6"/>',
 play:'<path d="M8 5l11 7-11 7z"/>',
 building:'<rect x="5" y="4" width="14" height="16" rx="1.5"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 20v-3h4v3"/>',
 card:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10.5h18"/>',
 clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4.2l2.8 1.8"/>',
 event:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
 check:'<path d="M5 13l4 4L19 7"/>',
 star:'<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19.5l1-5.8L3.6 9.6l5.8-.8z"/>'
};
function ic(n){ return '<svg class="i'+(n==='star'?' istar':'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[n]||'')+'</svg>'; }

/* ================= DATA ================= */
let SPOT_SEQ = 900;
// Each area holds spots. total>1 => multi-space lot. price = host floor / hourly rate.
const AREAS = [
  { name:"Memorial Stadium", lat:37.8716, lng:-122.2509, walk:"5 min walk", stadium:true,
    addr:"Piedmont Ave & Bancroft Way", access:"Gravel pad behind the house · gate code 4821",
    spots:[ {id:'s1',price:8,avail:1,total:1,type:'driveway'},{id:'s2',price:10,avail:0,total:2,type:'driveway'},{id:'s3',price:7.5,avail:2,total:2,type:'driveway'},{id:'s4',price:12,avail:3,total:4,type:'lot'},{id:'s5',price:6.5,avail:2,total:2,type:'garage'},{id:'s6',price:15,avail:3,total:3,type:'lot'} ] },
  { name:"Downtown Berkeley", lat:37.8709, lng:-122.2680, walk:"2 min walk",
    addr:"Kittredge St near Shattuck", access:"Covered garage · stall #3 · opener in lockbox 7714",
    spots:[ {id:'s7',price:6,avail:1,total:1,type:'garage'},{id:'s8',price:5.5,avail:0,total:1,type:'driveway'},{id:'s9',price:7,avail:2,total:3,type:'lot'},{id:'s10',price:4.5,avail:1,total:2,type:'driveway'} ] },
  { name:"UC Berkeley campus", lat:37.8694, lng:-122.2595, walk:"3 min walk",
    addr:"Hearst Ave & Euclid", access:"Driveway, pull to the left of the blue Civic",
    spots:[ {id:'s11',price:4.5,avail:1,total:1,type:'driveway'},{id:'s12',price:5,avail:1,total:1,type:'driveway'},{id:'s13',price:6,avail:0,total:2,type:'garage'} ] },
  { name:"Southside / Telegraph", lat:37.8662, lng:-122.2585, walk:"4 min walk",
    addr:"Dwight Way near Telegraph", access:"Open driveway · park nose-in behind the hedge",
    spots:[ {id:'s14',price:3.75,avail:2,total:2,type:'driveway'},{id:'s15',price:4,avail:0,total:1,type:'driveway'},{id:'s16',price:5,avail:1,total:1,type:'garage'} ] },
  { name:"North Berkeley BART", lat:37.8740, lng:-122.2837, walk:"1 min walk",
    addr:"Sacramento St & Delaware", access:"Assigned lot space · show pass QR to attendant",
    spots:[ {id:'s17',price:5,avail:1,total:2,type:'lot'},{id:'s18',price:5.5,avail:1,total:1,type:'driveway'} ] },
  { name:"Ashby BART", lat:37.8530, lng:-122.2700, walk:"2 min walk",
    addr:"Woolsey St near Adeline", access:"Side driveway, do not block the garage door",
    spots:[ {id:'s19',price:4,avail:0,total:1,type:'driveway'},{id:'s20',price:4.5,avail:1,total:1,type:'driveway'} ] },
  { name:"Elmwood", lat:37.8557, lng:-122.2540, walk:"6 min walk",
    addr:"College Ave & Ashby", access:"Rear carport · space #2",
    spots:[ {id:'s21',price:5.5,avail:1,total:1,type:'garage'},{id:'s22',price:6,avail:1,total:2,type:'driveway'},{id:'s23',price:7,avail:0,total:1,type:'lot'} ] }
];
const PHOTOS = ["linear-gradient(135deg,#dfe6d8,#9fae93)","linear-gradient(135deg,#e7e2d3,#b3a98d)","linear-gradient(135deg,#cfdcd2,#7f9a86)","linear-gradient(135deg,#e3ddce,#a3977c)"];
const photoOf = i => PHOTOS[i % PHOTOS.length];
const areaAvail = a => a.spots.reduce((n,s)=>n+s.avail,0);
const areaIndexOf = a => AREAS.indexOf(a);

/* Driver state */
const DRIVER = {
  name:'Jordan Reyes', trust:96, rating:4.9, trips:23, onTime:98, since:'Jan 2026',
  plate:'8ABC123', vehicles:['8ABC123 · Tesla Model 3','7XYZ990 · Toyota Prius'],
  session:null,
  trips_log:[
    { area:'Downtown Berkeley', when:'Yesterday · 3h', total:20.52, id:'PK-8HQ2R' },
    { area:'Memorial Stadium', when:'Sat · Gameday · 5h', total:78.40, id:'PK-1KD9M' },
    { area:'UC Berkeley campus', when:'Apr 2 · 2h', total:10.53, id:'PK-4LFHE' }
  ]
};
/* Host state — seeded listings so the dashboard is full */
const HOST = {
  founding:true, rating:4.9, payoutNext:'Fri', pending:186.40,
  listings:[
    { id:'h1', kind:'residential', label:'UC Berkeley campus', type:'driveway', price:6, spaces:1, booked:1, active:true, bookings7:12 },
    { id:'h2', kind:'urban', label:'Memorial Stadium', type:'lot', price:12, spaces:24, booked:17, active:true, bookings7:86, entity:'First Church of Berkeley', ein:'94-•••1287' }
  ]
};

/* ================= PRICING ENGINE (master doc) ================= */
let SURGE = false;
function multFor(area){ if(!SURGE) return 1; return area && area.stadium ? 2.8 : 1.55; }
function rateOf(area, spot){ const base = spot.price * multFor(area); return Math.round(Math.min(base, spot.price*2.5)*4)/4; } // surge ceiling 2.5x
function isSurging(area, spot){ return rateOf(area,spot) > spot.price + 1e-9; }
function feeOf(parking){ return Math.max(parking*0.17, 1.25); }               // max(17%, $1.25)
function quote(area, spot, hours){
  const rate = rateOf(area,spot); const parking = rate*hours; const fee = feeOf(parking);
  return { rate, parking, fee, driverPays: parking+fee, hostReceives: parking*0.80 };
}

/* ================= ROUTING ================= */
let currentPage='map';
function goPage(name, opts={}){
  const valid=['map','driver','host']; if(!valid.includes(name)) name='map';
  document.querySelectorAll('.page').forEach(p=>{ const on=p.dataset.page===name; p.classList.toggle('active',on); if(on){ p.classList.remove('pagefx'); void p.offsetWidth; if(!opts.instant) p.classList.add('pagefx'); } });
  currentPage=name;
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('active', a.dataset.nav===name));
  document.querySelectorAll('.menu-row[data-nav]').forEach(m=>m.classList.toggle('active', m.dataset.nav===name));
  try{ history.replaceState(null,'','#'+name); }catch(e){}
  closeDrawer();
  if(name==='map'){ loadMap(); }
  if(name==='driver') renderDriver();
  if(name==='host') renderHost();
  if(!opts.noScroll) window.scrollTo(0,0);
}
document.addEventListener('click', e=>{ const n=e.target.closest('[data-nav]'); if(n){ e.preventDefault(); goPage(n.dataset.nav); } });

/* ================= DRAWER + THEME ================= */
const drawer=$('drawer'), overlay=$('overlay');
function openDrawer(){ drawer.classList.add('open'); overlay.classList.add('show'); }
function closeDrawer(){ drawer.classList.remove('open'); if(!$('modal').classList.contains('show')&&!$('bsheet').classList.contains('open')) overlay.classList.remove('show'); }
$('openDrawer').addEventListener('click', openDrawer);
$('closeDrawer').addEventListener('click', closeDrawer);
overlay.addEventListener('click', ()=>{ closeDrawer(); });
const themeSwitch=$('themeSwitch');
function syncTheme(){ const d=document.documentElement.getAttribute('data-theme')==='dark'; themeSwitch.classList.toggle('on',d); themeSwitch.setAttribute('aria-checked', d?'true':'false'); }
themeSwitch.addEventListener('click', ()=>{ const d=document.documentElement.getAttribute('data-theme')==='dark';
  if(d){ document.documentElement.removeAttribute('data-theme'); localStorage.setItem('pakere-theme','light'); }
  else { document.documentElement.setAttribute('data-theme','dark'); localStorage.setItem('pakere-theme','dark'); }
  syncTheme(); setMapTheme(); });
syncTheme();

/* ================= SURGE toggle ================= */
$('surgeChip').addEventListener('click', ()=>{
  SURGE=!SURGE; const c=$('surgeChip'); c.classList.toggle('on',SURGE);
  c.innerHTML = SURGE ? `${ic('zap')} Gameday surge on` : '<span class="dotp"></span> Gameday off';
  refreshMap(); if($('spotPanel').classList.contains('open')&&openArea!=null) openSpotPanel(openArea);
  if($('bsheet').classList.contains('open')) renderRecs();
});

/* ================= MODAL + BOTTOM SHEET ================= */
const modal=$('modal'), msheet=$('msheet');
$('modalVeil').addEventListener('click', ()=>{ if(!modalLocked) closeModal(); });
let modalLocked=false;
function openModal(html, lock){ msheet.innerHTML=html; modal.classList.add('show'); modalLocked=!!lock; }
function closeModal(){ modal.classList.remove('show'); modalLocked=false; }

const bsheet=$('bsheet'), bsheetVeil=$('bsheetVeil');
function openSheet(){ bsheet.classList.add('open'); bsheetVeil.classList.add('show'); renderRecs(); }
function closeSheet(){ bsheet.classList.remove('open'); bsheetVeil.classList.remove('show'); }
$('findBtn').addEventListener('click', openSheet);
$('bsheetClose').addEventListener('click', closeSheet);
bsheetVeil.addEventListener('click', closeSheet);

/* ================= FIND A SPOT (recommended) ================= */
let recFilter='all', userLatLng=null;
function renderFilters(){
  const f=$('bsheetFilters');
  f.innerHTML=['all|All','driveway|Driveways','garage|Garages','lot|Lots']
    .map(x=>{const[k,l]=x.split('|');return `<button class="fchip ${recFilter===k?'on':''}" data-f="${k}">${l}</button>`;}).join('');
  f.querySelectorAll('.fchip').forEach(b=>b.onclick=()=>{ recFilter=b.dataset.f; renderFilters(); renderRecs(); });
}
function collectSpots(){
  const out=[];
  AREAS.forEach(a=>a.spots.forEach((s,si)=>{ if(recFilter==='all'||s.type===recFilter) out.push({a, s, ai:areaIndexOf(a), si}); }));
  return out;
}
function renderRecs(){
  renderFilters();
  const list=$('recScroll'); const items=collectSpots();
  items.forEach(it=>{ it.dist = userLatLng ? userLatLng.distanceTo([it.a.lat,it.a.lng])/1609.34 : null; it.rate=rateOf(it.a,it.s); });
  items.sort((x,y)=> userLatLng ? (x.dist-y.dist) : (x.rate-y.rate));
  $('bsheetSub').textContent = userLatLng ? 'Ranked by distance · tap to reserve' : 'Tap ◎ on the map to sort by distance · tap to reserve';
  const avail = items.filter(it=>it.s.avail>0).slice(0,12);
  if(!avail.length){ list.innerHTML='<p class="rec-empty">No spots match that filter right now.</p>'; return; }
  list.innerHTML='';
  avail.forEach((it,i)=>{
    const surging=isSurging(it.a,it.s);
    const meta = `${it.a.walk} from ${it.a.name}` + (it.dist!=null?` · ${it.dist.toFixed(1)} mi`:'') + ` · ${it.s.avail}/${it.s.total} open`;
    const btn=document.createElement('button'); btn.className='rec-item';
    btn.innerHTML=`<div class="rec-photo" style="background-image:${photoOf(i)}"></div>
      <div class="rec-info"><div class="rec-name">${money(it.rate)}/hr <span style="font-weight:500;color:var(--muted);font-size:13px">· ${it.s.type}</span> ${surging?('<span class="chip warnc" style="font-size:10px;padding:1px 7px">'+ic('zap')+' surge</span>'):''}</div>
      <div class="rec-meta">${esc(meta)}</div></div>
      <span class="shelf-dot ok"></span>`;
    btn.onclick=()=>{ closeSheet(); startBooking(it.ai, it.si); };
    list.appendChild(btn);
  });
}

/* ================= LEAFLET MAP ================= */
const CARTO_LIGHT="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const CARTO_DARK="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
const LABELS_LIGHT="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png";
const LABELS_DARK="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png";
const isDark=()=>document.documentElement.getAttribute('data-theme')==='dark';
let map=null, tileLayer=null, labelLayer=null, mapInited=false, areaMarkers=[], mapTries=0;
function bubbleHTML(a){
  const avail=areaAvail(a), lbl=avail>9?'9+':String(avail);
  const surge = SURGE && a.spots.some(s=>isSurging(a,s));
  return `<div class="area-bubble ${surge?'surge':''}"><span class="ab-count">${lbl}</span><div class="ab-text"><b>${avail>0?(surge?ic('zap')+' Surge pricing':'Spots available'):'Fully booked'}</b><span>${a.walk} from ${a.name}</span></div></div>`;
}
function refreshMap(){ if(!map) return; areaMarkers.forEach((m,i)=>m.setIcon(L.divIcon({className:'',html:bubbleHTML(AREAS[i]),iconSize:[0,0]}))); }
function loadMap(){
  if(typeof L==='undefined'){ if(mapTries++<40) setTimeout(loadMap,120); return; }
  if(!mapInited){
    mapInited=true;
    map=L.map('map',{scrollWheelZoom:true, zoomControl:true}).setView([37.8690,-122.2660],14);
    tileLayer=L.tileLayer(isDark()?CARTO_DARK:CARTO_LIGHT,{maxZoom:19,subdomains:'abcd',attribution:'&copy; OpenStreetMap, &copy; CARTO'}).addTo(map);
    labelLayer=L.tileLayer(isDark()?LABELS_DARK:LABELS_LIGHT,{maxZoom:19,subdomains:'abcd',className:'map-labels',zIndex:350}).addTo(map);
    AREAS.forEach((a,idx)=>{
      const m=L.marker([a.lat,a.lng],{icon:L.divIcon({className:'',html:bubbleHTML(a),iconSize:[0,0]})}).addTo(map);
      m.on('click',()=>openSpotPanel(idx)); areaMarkers.push(m);
    });
    const Locate=L.Control.extend({ options:{position:'topleft'}, onAdd:function(){
      const b=L.DomUtil.create('a','leaflet-bar leaflet-control map-locate'); b.href='#'; b.title='My location'; b.innerHTML='&#9678;';
      L.DomEvent.on(b,'click',ev=>{ L.DomEvent.stop(ev); map.locate({setView:true, maxZoom:15}); }); return b; }});
    map.addControl(new Locate());
    map.on('locationfound', e=>{ userLatLng=e.latlng; L.circleMarker(e.latlng,{radius:7,color:'#fff',weight:2,fillColor:'#1b6e45',fillOpacity:1}).addTo(map);
      if($('bsheet').classList.contains('open')) renderRecs(); });
    map.on('locationerror', ()=>{ userLatLng=null; });
  }
  setTimeout(()=>{ if(map) map.invalidateSize(); }, 60);
}
function setMapTheme(){ if(map&&tileLayer) tileLayer.setUrl(isDark()?CARTO_DARK:CARTO_LIGHT); if(map&&labelLayer) labelLayer.setUrl(isDark()?LABELS_DARK:LABELS_LIGHT); }

/* ================= SPOT PANEL ================= */
let openArea=null;
function openSpotPanel(ai){
  const a=AREAS[ai]; openArea=ai;
  const avail=areaAvail(a);
  $('spTitle').textContent = (avail>9?'9+':avail) + ' spots available';
  $('spSub').textContent = a.walk + ' from ' + a.name;
  const list=$('spList'); list.innerHTML='';
  a.spots.forEach((s,si)=>{
    const ok=s.avail>0, rate=rateOf(a,s), surging=isSurging(a,s);
    const card=document.createElement('div'); card.className='shelf'+(ok?'':' full');
    card.innerHTML=`<div class="shelf-photo" style="background-image:${photoOf(si)}">${surging?('<span class="surgetag">'+ic('zap')+'</span>'):''}</div>
      <div class="shelf-info"><div class="shelf-price">${money(rate)} / hour</div>
      <div class="shelf-avail"><span class="shelf-dot ${ok?'ok':'full'}"></span>${s.type} · ${s.avail}/${s.total} ${ok?'open':'full'}</div></div>`;
    const btn=document.createElement('button'); btn.className='btn btn-dark sm'; btn.textContent=ok?'Reserve':'Full'; btn.disabled=!ok;
    if(ok) btn.onclick=()=>startBooking(ai,si);
    card.appendChild(btn); list.appendChild(card);
  });
  $('spotPanel').classList.add('open');
}
function closeSpotPanel(){ $('spotPanel').classList.remove('open'); openArea=null; }
$('spClose').addEventListener('click', closeSpotPanel);

/* ================= BOOKING → PASS → SESSION → CHECKOUT ================= */
let booking=null;
function startBooking(ai, si){
  const a=AREAS[ai], s=a.spots[si];
  booking={ ai, si, a, s, hours:2 };
  closeSpotPanel(); closeSheet();
  renderBook();
}
function renderBook(){
  const {a,s,hours}=booking, si=booking.si, q=quote(a,s,hours), surging=isSurging(a,s);
  openModal(`
    <div class="msheet-photo" style="background-image:${photoOf(si)}">${surging?('<span class="stag">'+ic('zap')+' Gameday surge</span>'):''}</div>
    <div class="msheet-hd"><div>
      <div class="eyebrow">${esc(a.name)}</div>
      <h3 style="font-size:20px;margin-top:8px">${money(q.rate)} / hour</h3>
      <div class="note" style="margin-top:3px">${esc(a.walk)} · ${s.type} · ${s.avail}/${s.total} open${surging?` · floor ${money(s.price)}`:''}</div>
    </div><button class="x" onclick="closeModal()">&times;</button></div>
    <div class="msheet-bd">
      <label class="lbl">How long do you need it?</label>
      <div class="pill-toggle">${[1,2,3,4,6].map(h=>`<button class="${h===hours?'on':''}" onclick="setHours(${h})">${h}h</button>`).join('')}</div>
      <div class="pill-box" style="margin-top:16px">
        <div class="kv"><span class="k">Parking · ${money(q.rate)} × ${hours}h</span><span class="v">${money2(q.parking)}</span></div>
        <div class="kv"><span class="k">Service fee ${q.fee===1.25?'· $1.25 min':'· 17%'}</span><span class="v">${money2(q.fee)}</span></div>
        <div class="kv total"><span class="k">You pay</span><span class="v">${money2(q.driverPays)}</span></div>
      </div>
      <div class="note">Host earns ${money2(q.hostReceives)} — 80% of the parking price, always. Address unlocks after you reserve.</div>
      <button class="btn btn-dark btn-block lg" style="margin-top:16px" onclick="goPay()">Reserve · ${money2(q.driverPays)}</button>
    </div>`);
}
function setHours(h){ booking.hours=h; renderBook(); }
function goPay(){
  const {a,hours}=booking, q=quote(a,booking.s,hours);
  openModal(`
    <div class="msheet-hd"><div><div class="eyebrow">Checkout</div><h3 style="font-size:20px;margin-top:8px">Confirm &amp; pay</h3>
    <div class="note" style="margin-top:3px">${esc(a.name)} · ${hours}h · ${money2(q.driverPays)}</div></div>
    <button class="x" onclick="renderBook()">&times;</button></div>
    <div class="msheet-bd">
      <label class="lbl">Card number</label><input value="4242 4242 4242 4242" inputmode="numeric" />
      <div class="row2" style="margin-top:12px"><div><label class="lbl">Expiry</label><input value="04 / 27"/></div><div><label class="lbl">CVC</label><input value="123"/></div></div>
      <label class="lbl" style="margin-top:12px">Vehicle</label>
      <select id="bkPlate">${DRIVER.vehicles.map(v=>`<option>${v}</option>`).join('')}</select>
      <div class="chip" style="margin-top:14px">Demo mode · no real charge</div>
      <button class="btn btn-dark btn-block lg" id="payBtn" style="margin-top:16px" onclick="confirmPay()">Pay ${money2(q.driverPays)}</button>
      <button class="btn btn-block" style="margin-top:8px" onclick="renderBook()">Back</button>
    </div>`);
}
function confirmPay(){ const b=$('payBtn'); if(b){ b.textContent='Reserving…'; b.disabled=true; } setTimeout(finalizeBooking, 600); }
function finalizeBooking(){
  const {a,s,ai,si,hours}=booking, q=quote(a,s,hours);
  a.spots[si].avail=Math.max(0,s.avail-1); refreshMap();
  const id='PK-'+Math.random().toString(36).slice(2,7).toUpperCase();
  booking.id=id; booking.q=q;
  DRIVER.session={ ai, si, a, s, hours, q, id, elapsed:0, extended:0, active:false };
  showPass();
}
function showPass(){
  const {a,hours,q,id}=booking;
  openModal(`
    <div class="msheet-bd pass">
      <div class="tick"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
      <h3 style="font-size:22px;margin:14px 0 2px">You're booked.</h3>
      <div class="note">Booking ${id} · ${hours}h · ${money2(q.driverPays)} paid</div>
      <div class="qr">${qrSVG()}</div>
      <div class="note">Show this pass on arrival</div>
      <div class="unlock"><div class="k">${ic('unlock')} Address unlocked</div><div class="addr">${esc(a.addr)}</div><div class="n2"><b>Arrival:</b> ${esc(a.access)}</div></div>
      <button class="btn btn-dark btn-block lg" style="margin-top:16px" onclick="beginSession()">I've arrived — start session</button>
      <button class="btn btn-block" style="margin-top:8px" onclick="closeModal(); updateSessionMini()">Later</button>
    </div>`);
}
function qrSVG(){
  let r='', seed=(booking&&booking.id)?[...booking.id].reduce((a,c)=>a+c.charCodeAt(0),7):7;
  for(let y=0;y<11;y++)for(let x=0;x<11;x++){ seed=(seed*1103515245+12345)&0x7fffffff; if((seed>>7)&1) r+=`<rect x="${x*11}" y="${y*11}" width="11" height="11"/>`; }
  const c=(cx,cy)=>`<rect x="${cx}" y="${cy}" width="33" height="33" fill="none" stroke="currentColor" stroke-width="7"/><rect x="${cx+13}" y="${cy+13}" width="7" height="7"/>`;
  return `<svg viewBox="0 0 121 121" width="100%" height="100%" fill="currentColor" style="color:var(--ink)">${r}${c(0,0)}${c(88,0)}${c(0,88)}</svg>`;
}

/* ---- Active session (accelerated: 1s = 1min) ---- */
let sesTimer=null;
function beginSession(){
  const x=DRIVER.session; x.active=true; x.notified={};
  renderSession();
  clearInterval(sesTimer);
  sesTimer=setInterval(()=>{
    const s=DRIVER.session; if(!s||!s.active) return;
    s.elapsed++; const totalMin=s.hours*60+s.extended, left=totalMin-s.elapsed;
    if(left===15&&!s.notified[15]){ s.notified[15]=1; toast('15 minutes left — extend or head out.'); }
    if(left<=0&&!s.notified[0]){ s.notified[0]=1; toast('Session ended · grace 10 min, then 1.5×–3× overage.'); }
    updateSessionUI(); updateSessionMini();
  },1000);
  updateSessionMini();
}
function renderSession(){
  openModal(`
    <div class="msheet-hd"><div><div class="eyebrow">Active session</div>
    <h3 style="font-size:19px;margin-top:8px">${esc(DRIVER.session.a.name)}</h3></div>
    <button class="x" onclick="closeModal(); updateSessionMini()">&times;</button></div>
    <div class="msheet-bd">
      <div class="ses-hero">
        <div class="ring"><svg width="172" height="172"><circle cx="86" cy="86" r="76" stroke="var(--line)" stroke-width="10" fill="none"/>
          <circle id="ringArc" cx="86" cy="86" r="76" stroke="var(--accent)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="477" stroke-dashoffset="0"/></svg>
          <div class="tm"><span class="t" id="tLeft">--:--</span><span class="l">Remaining</span></div></div>
        <div class="note" style="font-weight:700;color:var(--muted)">CURRENT COST</div>
        <div class="cost-live" id="cLive">$0.00</div>
      </div>
      <div class="pill-toggle" style="margin-top:12px"><button onclick="openExtend()" style="flex:1">${ic('clock')} Stay longer</button><button class="on" onclick="startLeaving()" style="flex:1">I'm leaving</button></div>
      <div class="note">Overage: 0–10 min free, then 1.5× → 2× → 3×. Host earns 80% of the parking portion automatically.</div>
    </div>`);
  updateSessionUI();
}
function updateSessionUI(){
  const s=DRIVER.session; if(!s) return;
  const totalMin=s.hours*60+s.extended, left=Math.max(0,totalMin-s.elapsed), over=Math.max(0,s.elapsed-totalMin);
  const el=$('tLeft'); if(el) el.textContent= over>0?('+'+over+'m'):`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
  const arc=$('ringArc'); if(arc){ arc.setAttribute('stroke-dashoffset', String(477*(1-left/totalMin))); arc.setAttribute('stroke', left<=15?'var(--warn)':'var(--accent)'); }
  const cl=$('cLive'); if(cl) cl.textContent=money2(sessionCost());
}
function sessionCost(){
  const s=DRIVER.session, totalMin=s.hours*60+s.extended, over=Math.max(0,s.elapsed-totalMin); let oc=0;
  if(over>10){ oc+=(Math.min(over,20)-10)/60*s.q.rate*1.5; }
  if(over>20){ oc+=(Math.min(over,30)-20)/60*s.q.rate*2; }
  if(over>30){ oc+=(over-30)/60*s.q.rate*3; }
  return s.q.driverPays+oc;
}
function openExtend(){
  const s=DRIVER.session, cap=240-s.extended;
  const opts=[[30,'+30 min'],[60,'+1 hour'],[120,'+2 hours']].filter(o=>o[0]<=cap);
  openModal(`<div class="msheet-hd"><div><div class="eyebrow">Extend</div><h3 style="font-size:19px;margin-top:8px">Stay longer</h3></div><button class="x" onclick="renderSession()">&times;</button></div>
    <div class="msheet-bd"><div class="pill-toggle" style="flex-direction:column">
    ${opts.map(o=>{const c=o[0]/60*s.q.rate, f=feeOf(c); return `<button style="text-align:left;width:100%" onclick="doExtend(${o[0]})">${o[1]} · ${money2(c)} + ${money2(f)} fee = <b>${money2(c+f)}</b></button>`;}).join('')}
    </div><button class="btn btn-block" style="margin-top:12px" onclick="renderSession()">Back</button></div>`);
}
function doExtend(mins){ const s=DRIVER.session, c=mins/60*s.q.rate, f=feeOf(c); s.extended+=mins; s.q.driverPays+=c+f; s.notified={}; renderSession(); toast('Extended '+(mins>=60?mins/60+'h':mins+'m')+' · '+money2(c+f)+' charged.'); }
function startLeaving(){ DRIVER.session.active=false; openModal(`<div class="msheet-bd pass"><div class="eyebrow">Checkout · 1 of 2</div>
  <h3 style="font-size:20px;margin:12px 0 6px">Confirming departure</h3><div class="note">GPS geofence is verifying your vehicle left the spot…</div>
  <div class="geo"><span class="car">${ic('car')}</span><span class="ok">${ic('check')}</span></div></div>`, true);
  setTimeout(()=>{ toast('GPS confirmed — you left the geofence.'); photoStep(); }, 2500);
}
function photoStep(){
  openModal(`<div class="msheet-hd"><div><div class="eyebrow">Checkout · 2 of 2</div><h3 style="font-size:20px;margin-top:8px">Photo verification</h3></div></div>
  <div class="msheet-bd"><div class="note">Snap the empty spot — it's timestamped &amp; GPS-tagged, and becomes automatic evidence if a dispute is filed.</div>
  <div class="cam" id="cam"><div class="frame"></div><div class="hint">Point at the empty spot and tap the shutter</div><div class="meta">37.8688°N 122.2540°W</div></div>
  <button class="shutter" onclick="snap()"></button>
  <button class="btn btn-dark btn-block lg" id="finishBtn" disabled style="margin-top:12px" onclick="finishSession()">Complete checkout</button></div>`, true);
}
function snap(){ const c=$('cam'); c.classList.add('done'); c.innerHTML='<div class="big">'+ic('check')+'</div>'; $('finishBtn').disabled=false; toast('Photo saved · host notified of vacancy.'); }
function finishSession(){
  clearInterval(sesTimer); const s=DRIVER.session; const total=sessionCost();
  s.a.spots[s.si].avail=Math.min(s.s.total, s.a.spots[s.si].avail+1); refreshMap();
  DRIVER.trips++; DRIVER.trips_log.unshift({ area:s.a.name, when:'Just now · '+Math.floor(s.elapsed/60)+'h '+(s.elapsed%60)+'m', total, id:s.id });
  modalLocked=false;
  const over=Math.max(0,s.elapsed-(s.hours*60+s.extended));
  openModal(`<div class="msheet-bd pass">
    <div class="tick"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
    <h3 style="font-size:22px;margin:14px 0 2px">Session complete</h3>
    <div class="note">${esc(s.a.name)} · ${Math.floor(s.elapsed/60)}h ${s.elapsed%60}m</div>
    <div class="pill-box" style="margin-top:14px;text-align:left">
      <div class="kv"><span class="k">Booking + extensions</span><span class="v">${money2(s.q.driverPays)}</span></div>
      ${over>0?`<div class="kv"><span class="k">Overage (${over}m)</span><span class="v" style="color:var(--warn)">${money2(total-s.q.driverPays)}</span></div>`:`<div class="kv"><span class="k">Overage</span><span class="v" style="color:var(--accent)">None</span></div>`}
      <div class="kv total"><span class="k">Total</span><span class="v">${money2(total)}</span></div>
    </div>
    <div class="note">${money2(s.q.hostReceives)} paid to the host (80% of parking) via Stripe Connect.</div>
    <div style="font-weight:700;margin-top:14px">Rate your spot</div>
    <div class="stars">${[1,2,3,4,5].map(i=>`<button id="st${i}" onclick="rate(${i})">${ic('star')}</button>`).join('')}</div>
    <button class="btn btn-dark btn-block lg" onclick="endTrip()">Done</button>
  </div>`);
}
function rate(n){ for(let i=1;i<=5;i++) $('st'+i).classList.toggle('on', i<=n); DRIVER._rating=n; }
function endTrip(){ DRIVER.session=null; DRIVER._rating=0; closeModal(); updateSessionMini(); if(currentPage==='driver') renderDriver(); }

/* ---- session mini bar on map ---- */
function updateSessionMini(){
  const m=$('sessionMini'), s=DRIVER.session;
  if(s&&s.active){ const totalMin=s.hours*60+s.extended, left=Math.max(0,totalMin-s.elapsed), over=Math.max(0,s.elapsed-totalMin);
    m.style.display='flex';
    m.innerHTML=`<span class="live"></span><div class="sm-info"><div class="sm-t">Active · ${esc(s.a.name)}</div><div class="sm-s">${over>0?('+'+over+'m over'):(Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+' left')} · ${money2(sessionCost())}</div></div><button class="btn btn-dark sm" onclick="renderSession()">Manage</button>`;
  } else m.style.display='none';
}

/* ---- tiny toast ---- */
function toast(msg){
  let t=document.createElement('div'); t.textContent=msg;
  t.style.cssText='position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:1500;background:var(--ink);color:var(--bg);padding:11px 16px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:var(--shadow-lg);max-width:90vw;text-align:center;animation:sheetIn .25s ease';
  document.body.appendChild(t); setTimeout(()=>{ t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(()=>t.remove(),420); }, 3200);
}

/* ================= DRIVER DASHBOARD ================= */
function renderDriver(){
  const d=DRIVER, s=d.session;
  const sessionCard = s ? `
    <div class="panel-card" style="border-color:var(--accent)">
      <div class="pc-head"><h3>${s.active?'Active session':'Reserved — not started'}</h3><span class="chip">${esc(s.a.name)}</span></div>
      <div class="list-row" style="border:0;padding:4px 0">
        <div class="av">${ic('car')}</div>
        <div class="li-main"><div class="li-t">${money(s.q.rate)}/hr · ${s.hours}h${s.extended?` +${s.extended}m`:''}</div>
        <div class="li-s">Booking ${s.id} · ${s.active?(money2(sessionCost())+' so far'):'ready to start'}</div></div>
        <button class="btn btn-dark sm" onclick="${s.active?'renderSession()':'beginSession()'}">${s.active?'Manage':'Start'}</button>
      </div>
    </div>` : `
    <div class="panel-card"><div class="empty" style="padding:26px 20px">
      <div class="big-ico"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
      <div style="font-weight:700;color:var(--ink)">No active session</div>
      <div class="note">Find a private spot near where you're headed.</div>
      <button class="btn btn-dark" style="margin-top:14px" onclick="goPage('map'); setTimeout(openSheet,250)">Find a Spot</button>
    </div></div>`;
  const trips = d.trips_log.map(t=>`
    <div class="list-row"><div class="av">${ic('receipt')}</div>
      <div class="li-main"><div class="li-t">${esc(t.area)}</div><div class="li-s">${esc(t.when)} · ${t.id}</div></div>
      <span class="li-amt">${money2(t.total)}</span></div>`).join('');
  $('driverDash').innerHTML = `
    <div class="dash-head">
      <div><h1>Your parking</h1><div class="sub">Welcome back, ${esc(d.name.split(' ')[0])}.</div></div>
      <div class="trust">Trust score <span class="tscore">${d.trust}</span></div>
    </div>
    <div class="stat-grid">
      <div class="stat"><div class="n">${d.trips}</div><div class="l">Total trips</div></div>
      <div class="stat"><div class="n">${d.onTime}%</div><div class="l">On-time checkout</div><div class="sub2">Great standing</div></div>
      <div class="stat"><div class="n">${d.rating}</div><div class="l">Avg rating given</div></div>
      <div class="stat"><div class="n">${d.since}</div><div class="l">Member since</div></div>
    </div>
    ${sessionCard}
    <div class="two-col">
      <div class="panel-card"><div class="pc-head"><h3>Trip history</h3><button class="btn sm" onclick="goPage('map'); setTimeout(openSheet,250)">Book again</button></div>${trips}</div>
      <div>
        <div class="panel-card"><h3>Vehicles</h3>${d.vehicles.map(v=>`<div class="list-row" style="padding:10px 0"><div class="av">${ic('car')}</div><div class="li-main"><div class="li-t" style="font-size:13.5px">${esc(v)}</div></div></div>`).join('')}<button class="btn sm btn-block" style="margin-top:8px" onclick="toast('Demo · add vehicle')">${ic('plus')} Add vehicle</button></div>
        <div class="panel-card"><h3>Payment</h3><div class="list-row" style="padding:10px 0"><div class="av"></div><div class="li-main"><div class="li-t" style="font-size:13.5px">Apple Pay · Visa ···· 4242</div><div class="li-s">Default</div></div></div></div>
        <div class="panel-card"><h3>How pricing works</h3><div class="note">You pay the host's hourly rate for your booked time plus a service fee of <b>max(17%, $1.25)</b>. Gameday surge is capped at <b>2.5× the host's floor</b>. Hosts always keep 80%.</div></div>
      </div>
    </div>`;
}

/* ================= HOST DASHBOARD ================= */
let hostTab='overview';
function renderHost(){
  const h=HOST;
  const totalSpaces=h.listings.reduce((n,l)=>n+l.spaces,0);
  const bookedNow=h.listings.reduce((n,l)=>n+l.booked,0);
  const week=[42,58,48,74,96,150,70]; const max=Math.max(...week); const weekTotal=week.reduce((a,b)=>a+b,0);
  const listingsHTML = h.listings.map((l,i)=>`
    <div class="listing">
      <div class="lphoto" style="background-image:${photoOf(i)}"></div>
      <div class="lmain">
        <div class="lt">${esc(l.label)} <span class="tag ${l.kind==='urban'?'urban':'res'}">${l.kind==='urban'?'Urban supply':'Residential'}</span> ${l.active?'':'<span class="tag">Paused</span>'}</div>
        <div class="ls">${money(l.price)}/hr · ${l.type} · ${l.spaces} space${l.spaces>1?'s':''} · ${l.bookings7} bookings/wk</div>
        <div class="occ"><i style="width:${Math.round(l.booked/l.spaces*100)}%"></i></div>
        <div class="ls" style="margin-top:5px">${l.booked} of ${l.spaces} booked now${l.kind==='urban'?` · ${esc(l.entity)}`:''}</div>
      </div>
      <div class="lacts">
        ${l.kind==='urban'?`<button class="btn sm" onclick="showCert(${i})">Insurance cert</button>`:''}
        <button class="btn sm" onclick="toggleListing('${l.id}')">${l.active?'Pause':'Resume'}</button>
      </div>
    </div>`).join('');
  const upcoming = [
    {who:'Alex M.',plate:'8ABC123',when:'Today 2–4 PM',trust:96,amt:9.60,label:h.listings[0].label},
    {who:'Gameday · 14 bookings',plate:'multiple',when:'Sat 12–6 PM · surge',trust:null,amt:1092,label:h.listings[1]?h.listings[1].label:''},
    {who:'Priya S.',plate:'5JKL221',when:'Tomorrow 9–11 AM',trust:92,amt:8.00,label:h.listings[0].label}
  ].map(b=>`<div class="list-row"><div class="av">${b.trust?b.who[0]:ic('event')}</div>
    <div class="li-main"><div class="li-t">${esc(b.who)}${b.trust?` <span class="trust" style="font-size:11px">· ${b.trust}</span>`:''}</div>
    <div class="li-s">${esc(b.when)} · ${esc(b.label)}</div></div><span class="li-amt">+${money2(b.amt)}</span></div>`).join('');

  const overview = `
    <div class="stat-grid">
      <div class="stat"><div class="n">${money(weekTotal)}</div><div class="l">Earnings this week</div><div class="sub2">80% of parking, always</div></div>
      <div class="stat"><div class="n">${bookedNow}/${totalSpaces}</div><div class="l">Spaces booked now</div></div>
      <div class="stat"><div class="n">${h.rating}</div><div class="l">Host rating</div></div>
      <div class="stat"><div class="n">${money(h.pending)}</div><div class="l">Payout ${h.payoutNext}</div><div class="sub2">Stripe Connect</div></div>
    </div>
    <div class="two-col">
      <div class="panel-card"><div class="pc-head"><h3>Earnings · this week</h3><span class="chip">Sat surge ${ic('zap')}</span></div>
        <div class="bars">${week.map((v,i)=>`<div class="b ${v===max?'hi':''}" style="height:${Math.round(v/max*100)}%"><em>${'MTWTFSS'[i]}</em></div>`).join('')}</div>
      </div>
      <div class="panel-card"><h3>Upcoming bookings</h3>${upcoming}</div>
    </div>`;

  const listingsTab = `
    <div class="panel-card"><div class="pc-head"><h3>Your listings</h3><button class="btn btn-dark sm" onclick="startListing()">${ic('plus')} List a spot</button></div>${listingsHTML}</div>
    <div class="panel-card"><h3>Payouts</h3>
      <div class="list-row"><div class="av">${ic('building')}</div><div class="li-main"><div class="li-t">Next payout · ${h.payoutNext}</div><div class="li-s">Stripe Connect · Chase ···· 4821 · 24h hold</div></div><span class="li-amt">${money2(h.pending)}</span></div>
      <div class="note">Payouts are automatic after each completed booking. You keep 80% of the parking price on every transaction.</div>
    </div>`;

  $('hostDash').innerHTML = `
    <div class="dash-head">
      <div><h1>Host dashboard</h1><div class="sub">${h.listings.length} active listing${h.listings.length>1?'s':''} · Berkeley</div></div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${h.founding?('<span class="chip gold">'+ic('award')+' Founding host</span>'):''}<button class="btn btn-dark sm" onclick="startListing()">${ic('plus')} List a spot</button></div>
    </div>
    <div class="tabbar">
      <button class="${hostTab==='overview'?'on':''}" onclick="hostTab='overview';renderHost()">Overview</button>
      <button class="${hostTab==='listings'?'on':''}" onclick="hostTab='listings';renderHost()">Listings &amp; payouts</button>
    </div>
    ${hostTab==='overview'?overview:listingsTab}`;
}
function toggleListing(id){ const l=HOST.listings.find(x=>x.id===id); if(l){ l.active=!l.active; renderHost(); toast(l.active?'Listing resumed':'Listing paused'); } }
function showCert(i){
  const l=HOST.listings[i];
  openModal(`<div class="msheet-hd"><div><div class="eyebrow">Urban supply · coverage</div><h3 style="font-size:19px;margin-top:8px">You're covered</h3></div><button class="x" onclick="closeModal()">&times;</button></div>
  <div class="msheet-bd"><div class="cert"><div class="cn">Certificate of Coverage</div>
    <div class="note">${esc(l.entity||'Your organization')} · ${esc(l.label)}</div>
    <div class="amt">$1,000,000</div>
    <div class="note">Liability coverage per incident during all platform-booked hours. Only verified drivers with clean trust scores can book this lot.</div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn sm" onclick="toast('Demo · certificate PDF downloaded')">Download PDF</button><button class="btn sm" onclick="toast('Demo · 90-sec liability explainer')">${ic('play')} 90-sec explainer</button></div>
  </div>
  <button class="btn btn-dark btn-block" style="margin-top:14px" onclick="closeModal()">Done</button></div>`);
}

/* ================= LIST A SPOT (residential + urban supply) ================= */
let listing=null;
function startListing(){ listing={ step:0, kind:null, entity:'Institution', label:'UC Berkeley campus', type:'Driveway', price:6, spaces:1, hours:'9am–5pm weekdays' }; closeDrawer(); renderListBranch(); }
$('navList').addEventListener('click', startListing);
$('drawerList').addEventListener('click', startListing);

function renderListBranch(){
  openModal(`<div class="msheet-hd"><div><div class="eyebrow">List a spot</div><h3 style="font-size:20px;margin-top:8px">What are you listing?</h3>
  <div class="note" style="margin-top:3px">Fully self-serve — no sales calls. Address stays private.</div></div><button class="x" onclick="closeModal()">&times;</button></div>
  <div class="msheet-bd"><div class="pill-toggle" style="flex-direction:column">
    <button style="text-align:left;width:100%;padding:14px 16px" onclick="pickKind('residential')">${ic('home')} <b>My own driveway or garage</b><br><span class="note">One spot at your home or assigned apartment space.</span></button>
    <button style="text-align:left;width:100%;padding:14px 16px" onclick="pickKind('urban')">${ic('building')} <b>A lot or multiple spaces</b><br><span class="note">Church, school, business, or private lot — list up to 50 spaces.</span></button>
  </div></div>`);
}
function pickKind(k){ listing.kind=k; listing.step=0; if(k==='urban'){ listing.type='Lot'; listing.spaces=24; listing.price=5; listing.label='Memorial Stadium'; } renderList(); }

function renderList(){
  const l=listing;
  if(l.kind==='residential'){
    openModal(`<div class="msheet-hd"><div><div class="eyebrow">Residential host</div><h3 style="font-size:20px;margin-top:8px">Add your spot</h3></div><button class="x" onclick="renderListBranch()">&times;</button></div>
    <div class="msheet-bd">
      <label class="lbl">Public area label (drivers see this, not your address)</label>
      <select id="lArea">${AREAS.map(a=>`<option ${a.name===l.label?'selected':''}>${a.name}</option>`).join('')}</select>
      <label class="lbl" style="margin-top:12px">Spot type</label>
      <div class="seg">${['Driveway','Garage'].map((k,i)=>`<input type="radio" name="lk" id="lk${i}" ${k===l.type?'checked':''}><label for="lk${i}" onclick="listing.type='${k}'">${k}</label>`).join('')}</div>
      <div class="row2" style="margin-top:12px"><div><label class="lbl">Price / hour</label><input id="lPrice" type="number" min="1" step="0.5" value="${l.price}"/></div><div><label class="lbl">Spaces</label><input id="lSpaces" type="number" min="1" value="${l.spaces}"/></div></div>
      <label class="lbl" style="margin-top:12px">Availability</label><input id="lHours" value="${esc(l.hours)}"/>
      <button class="btn btn-dark btn-block lg" style="margin-top:16px" onclick="previewList()">Preview earnings →</button>
    </div>`);
  } else {
    openModal(`<div class="msheet-hd"><div><div class="eyebrow">Urban supply partner</div><h3 style="font-size:20px;margin-top:8px">List your lot</h3></div><button class="x" onclick="renderListBranch()">&times;</button></div>
    <div class="msheet-bd">
      <label class="lbl">Entity type</label>
      <select id="lEntity">${['Individual','Small business','Institution (church, school, nonprofit)','Commercial property'].map(o=>`<option ${o.startsWith(l.entity)?'selected':''}>${o}</option>`).join('')}</select>
      <label class="lbl" style="margin-top:12px">Public area label</label>
      <select id="lArea">${AREAS.map(a=>`<option ${a.name===l.label?'selected':''}>${a.name}</option>`).join('')}</select>
      <div class="row2" style="margin-top:12px"><div><label class="lbl">Total spaces (bulk)</label><input id="lSpaces" type="number" min="2" value="${l.spaces}"/></div><div><label class="lbl">Price / hour floor</label><input id="lPrice" type="number" min="1" step="0.5" value="${l.price}"/></div></div>
      <label class="lbl" style="margin-top:12px">Access method</label>
      <select id="lAccess"><option>Open / unattended</option><option>Gated · code entry</option><option>Attended · QR at gate</option><option>Permit / sticker</option></select>
      <div class="note" style="margin-top:10px">Recurring blocks (e.g. Sunday services) and a $1M insurance certificate are generated automatically.</div>
      <button class="btn btn-dark btn-block lg" style="margin-top:16px" onclick="previewList()">Preview earnings →</button>
    </div>`);
  }
}
function previewList(){
  const l=listing;
  l.label=$('lArea').value; l.price=Math.max(1,parseFloat($('lPrice').value)||6); l.spaces=Math.max(1,parseInt($('lSpaces').value)||1);
  if(l.kind==='residential'){ l.hours=$('lHours').value; } else { l.entity=$('lEntity').value; l.access=$('lAccess').value; }
  const keep=l.price*0.8, monthly=Math.round(keep*(l.kind==='urban'? l.spaces*18 : 25));
  openModal(`<div class="msheet-hd"><div><div class="eyebrow">Your earnings</div><h3 style="font-size:20px;margin-top:8px">You keep 80%.</h3>
  <div class="note" style="margin-top:3px">${l.type} · ${l.spaces} space${l.spaces>1?'s':''} · ${esc(l.label)}</div></div><button class="x" onclick="renderList()">&times;</button></div>
  <div class="msheet-bd"><div class="pill-box">
    <div class="kv"><span class="k">Your rate</span><span class="v">${money2(l.price)}</span></div>
    <div class="kv"><span class="k">Platform share (20%)</span><span class="v">−${money2(l.price*0.2)}</span></div>
    <div class="kv total"><span class="k">You earn / booking</span><span class="v">${money2(keep)}</span></div>
  </div>
  <div class="note">Estimated ≈ <b>${money(monthly)}/mo</b> at this rate${l.kind==='urban'?` across ${l.spaces} spaces`:''}, before gameday premiums. Illustrative only.</div>
  ${l.kind==='urban'?'<div class="cert" style="margin-top:12px"><div class="cn">Certificate of Coverage</div><div class="amt" style="font-size:20px">$1,000,000</div><div class="note">Auto-generated · active during booked hours.</div></div>':''}
  <div class="chip gold" style="margin-top:12px">${ic('award')} Eligible for the founding 25 · 0% fees for 6 months</div>
  <button class="btn btn-dark btn-block lg" style="margin-top:14px" onclick="publishList()">Publish listing</button>
  <button class="btn btn-block" style="margin-top:8px" onclick="renderList()">Back</button></div>`);
}
function publishList(){
  const l=listing;
  const ai=AREAS.findIndex(a=>a.name===l.label);
  if(ai>=0){ AREAS[ai].spots.unshift({ id:'s'+(++SPOT_SEQ), price:l.price, avail:l.spaces, total:l.spaces, type:l.type.toLowerCase() }); refreshMap(); }
  HOST.listings.unshift({ id:'h'+(++SPOT_SEQ), kind:l.kind, label:l.label, type:l.type.toLowerCase(), price:l.price, spaces:l.spaces, booked:0, active:true, bookings7:0, entity:l.entity, ein:'94-•••1287' });
  openModal(`<div class="msheet-bd pass">
    <div class="tick"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
    <h3 style="font-size:22px;margin:14px 0 2px">You're live.</h3>
    <div class="note">${money(l.price)}/hr ${esc(l.type.toLowerCase())} · ${esc(l.label)} · now on the map</div>
    <div class="stat-grid" style="margin-top:16px"><div class="stat"><div class="n">${money(l.price*0.8)}</div><div class="l">per booking</div></div><div class="stat"><div class="n">${l.spaces}</div><div class="l">space${l.spaces>1?'s':''}</div></div><div class="stat"><div class="n">4.9</div><div class="l">area avg</div></div></div>
    <button class="btn btn-dark btn-block lg" style="margin-top:16px" onclick="closeModal(); hostTab='listings'; goPage('host')">Open host dashboard</button>
    <button class="btn btn-block" style="margin-top:8px" onclick="closeModal(); goPage('map')">See it on the map</button>
  </div>`);
}

/* ================= BOOT ================= */
document.querySelectorAll('[data-ic]').forEach(el=>{ el.innerHTML=ic(el.getAttribute('data-ic')); });
goPage(location.hash.replace('#','')||'map', {instant:true, noScroll:true});
