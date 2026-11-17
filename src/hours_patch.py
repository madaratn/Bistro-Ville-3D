# v0.45 : les services de la journée — petit-déjeuner (8-11 h), midi (11-14 h), après-midi (14-18 h 30), soirée (18 h 30-23 h)
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('hours_patch',a[:70],c); js=js.replace(a,b)
RX("const DISHM=Object.fromEntries(DISH.map(d=>[d.id,d]));","""DISH.push(
 {id:'croissant',n:'Croissant pur beurre',e:'🥐',c:'Matin',ing:['ble','lait'],p:10,t:3,u:1},
 {id:'tartine',n:'Tartines et confiture',e:'🍞',c:'Matin',ing:['ble','fraise'],p:11,t:3,u:2},
 {id:'oeufsplat',n:'Œufs au plat',e:'🥓',c:'Matin',ing:['oeuf','ble'],p:15,t:4,u:3},
 {id:'granola',n:'Bol de fruits et yaourt',e:'🥣',c:'Matin',ing:['lait','fraise','pomme'],p:16,t:3,u:4},
 {id:'brunch',n:'Assiette brunch',e:'🍱',c:'Matin',ing:['oeuf','ble','laitue'],p:26,t:7,u:6},
 {id:'planche',n:'Planche apéro',e:'🫒',c:'Soir',ing:['fromage','viande'],p:24,t:4,u:4});
const DISHM=Object.fromEntries(DISH.map(d=>[d.id,d]));""")
RX("const DRINKM=Object.fromEntries(DRINKS.map(d=>[d.id,d]));","""DRINKS.splice(3,0,{id:'frappe',n:'Café frappé',e:'☕',p:5,u:1,src:'fridge'},{id:'theglace',n:'Thé glacé',e:'🍵',p:5,u:2,src:'fridge'});
const DRINKM=Object.fromEntries(DRINKS.map(d=>[d.id,d]));""")
RX("menu:['salade','pizza','crepe'],","menu:['croissant','salade','pizza','crepe'],")
RX("const menuSlots=()=>Math.min(6,3+Math.floor(state.level/3));","const menuSlots=()=>Math.min(8,4+Math.floor(state.level/3));")
RX("function placeOrder(c){","function placeOrder(c){ if(onlyDrink(c)) return;")
RX("c,dish:pick(state.menu),st:'wait'","c,dish:pickDish(c),st:'wait'")
RX("function serveDrink(d){ const c=d.c; d.st='served';","function serveDrink(d){ const c=d.c; d.st='served'; if(c.only&&c.st==='wait'){ c.st='eat'; c.t=c.eatT=rnd(9,13); c.thankT=1.1; c.phone=false; }")
RX("const d=DISHM[c.order.dish], L=lvl(d.id), price=dishPrice(d)+drinkPay(c);","const d=c.order?DISHM[c.order.dish]:null, L=d?lvl(d.id):3, price=(d?dishPrice(d):0)+drinkPay(c);")
RX("function sitDown(c){","function sitDown(c){ c.only=false;")
RX("if(!av.length||Math.random()>.6) return;","if(!av.length||(!c.only&&Math.random()>.6)) return; const sv=svcNow().k;")
RX("!(c.kidF&&!['eau','soda','jus'].includes(d.id))","!(c.kidF&&!['eau','soda','jus','theglace'].includes(d.id))")
RX(" const w=av.map(d=>d.src==='bar'?1.4:1),"," const w=av.map(d=>(d.src==='bar'?1.4:1)*(sv==='m'?(['jus','frappe','theglace'].includes(d.id)?4:d.src==='bar'||d.id==='biere'?.05:1):sv==='s'?(d.src==='bar'?3:d.id==='biere'?2.2:.7):sv==='a'?(['frappe','theglace','jus'].includes(d.id)?2:1):1)),")
RX(" spawnT-=dt*(rush?3:1)*storyMul();"," spawnT-=dt*(rush?3:1)*storyMul()*svcNow().flow; svcTick();")
RX("for(const cat of ['Entrée','Plat','Dessert']){\n    html+=`<h3>${cat}s</h3>`;","for(const cat of ['Matin','Entrée','Plat','Dessert','Soir']){\n    html+=`<h3>${({Matin:'Petit-déjeuner et brunch',Soir:'Soirée'})[cat]||cat+'s'}</h3>`;")
RX("html+=`<p>Places au menu : <b>${state.menu.length}/${menuSlots()}</b>. Les clients commandent au hasard parmi ces plats.</p>`;","{ const sv=svcNow(), now=menuNow(); html+=`<div class=\"svcH\"><b>${sv.n}</b> · ${hLabel(sv.h0)} – ${hLabel(sv.h1)}<div class=\"svcT\">${SVC.map(x=>`<i class=\"${x.k===sv.k?'on':''}\" style=\"flex:${x.h1-x.h0}\">${x.s}</i>`).join('')}</div>${now.length?'':'<div class=\"sub\">Aucun de tes plats ne correspond à ce service : les clients prennent ce qu’il y a, sans enthousiasme.</div>'}</div>`; }\n   html+=`<p class=\"sub\">Ta carte : ${state.menu.length}/${menuSlots()} plats.</p>`;")
RX("<div class=\"sub\">${d.c} · Niv. ${lvl(id)} · ","<div class=\"sub\">${svcBadges(d)} ")
RX("const PANELS={",r"""// --- les services de la journée ---
const SVC=[{k:'m',n:'Petit-déjeuner et brunch',s:'Matin',h0:8,h1:11,flow:.85,only:.15},{k:'d',n:'Service du midi',s:'Midi',h0:11,h1:14,flow:1.3,only:.04},
           {k:'a',n:'Après-midi, carte libre',s:'Après-midi',h0:14,h1:18.5,flow:.7,only:.2},{k:'s',n:'Soirée et cocktails',s:'Soirée',h0:18.5,h1:23,flow:1.15,only:.35}];
const gameHour=()=>8+Math.min(1,dayOf().t/DAY_LEN)*15;
const svcNow=()=>{ const h=gameHour(); return SVC.find(s=>h<s.h1)||SVC[3]; };
const hLabel=h=>Math.floor(h)+' h'+(h%1?' 30':'');
// à quelles heures un plat se sert : m matin, d midi, a après-midi, s soir
const dishSvc=d=>d.c==='Matin'?'ma':d.c==='Soir'?'as':(d.id==='crepe'||d.id==='omelette')?'mdas':'das';
const menuNow=()=>{ const k=svcNow().k; return state.menu.filter(id=>dishSvc(DISHM[id]).includes(k)); };
const svcBadges=d=>SVC.filter(s=>dishSvc(d).includes(s.k)).map(s=>`<span class="svB ${s.k}">${s.s}</span>`).join('')+' ';
function pickDish(c){ const m=menuNow(); if(m.length) return pick(m); c.pat=Math.max(20,(c.pat||80)-18); return pick(state.menu); }
// le soir surtout, certains clients ne viennent que pour boire un verre
function onlyDrink(c){ if(Math.random()>=svcNow().only||!DRINKS.some(drinkOK)) return false;
 c.only=true; c.order=null; c.pat=Math.max(c.pat,85); c.st='wait'; c.drink=null; c.drinkOn=null; orderDrink(c); if(!c.drink){ c.only=false; return false; } return true; }
let svcLast=null;
function svcTick(){ const s=svcNow(); if(svcLast===null){ svcLast=s.k; return; } if(s.k!==svcLast){ svcLast=s.k; if(!warming){ toast(hLabel(s.h0)+' · '+s.n); sfx('level'); hud(); } } }
const PANELS={""")
RX("$('#sJour').innerHTML='<b>Jour '+d.n+'</b><span>'+hh+' h '+String(mm).padStart(2,'0')+'</span>';","$('#sJour').innerHTML='<b>Jour '+d.n+'</b><span>'+hh+' h '+String(mm).padStart(2,'0')+'</span><em>'+svcNow().s+'</em>';")
RX("function gestionInit(){","function gestionInit(){\n Object.assign(STEPS,{croissant:[['oven',3]],tartine:[['prep',3]],oeufsplat:[['stove',4]],granola:[['prep',3]],brunch:[['prep',2.5],['stove',4.5]],planche:[['prep',4]]});")
RX("<div class=\"sub\">Une journée dure une heure de jeu. À la fermeture : salaires, électricité, et le bilan.</div></div>`;","<div class=\"sub\">Une journée dure une heure de jeu. À la fermeture : salaires, électricité, et le bilan.</div><div class=\"svcT\" style=\"margin-top:8px\">${SVC.map(x=>`<i class=\"${x.k===svcNow().k?'on':''}\" style=\"flex:${x.h1-x.h0}\">${x.s}<small>${hLabel(x.h0)}</small></i>`).join('')}</div></div>`;")
RX(" const NEWS=[];",""" const NEWS=[];
 if(!state.svc1){ state.svc1=1; if(loaded) NEWS.push(`<div class="row"><div class="emo">${foodIcon('🥐')}</div><div class="info"><div class="t">Quatre services par jour</div><div class="sub">Petit-déjeuner de 8 h à 11 h, midi jusqu’à 14 h, carte libre l’après-midi, soirée et cocktails à partir de 18 h 30. De nouveaux plats du matin et une planche apéro t’attendent dans Menu → Recettes.</div></div></div>`); }""")
