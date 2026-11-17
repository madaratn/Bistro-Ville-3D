# v0.14 : coin boissons — frigo (eau, soda, jus, bière) puis bar à cocktails avec barman

RP(" counter:{n:'Comptoir passe-plat',cat:'Cuisine',p:150,d:0,u:1,kind:'counter',col:'#a8693a'},",
r""" counter:{n:'Comptoir passe-plat',cat:'Cuisine',p:150,d:0,u:1,kind:'counter',col:'#a8693a'},
 fridge:{n:'Frigo à boissons',cat:'Bar',p:180,d:1,u:1,kind:'fridge',col:'#c8323a'},
 fridge2:{n:'Vitrine réfrigérée',cat:'Bar',p:520,d:3,u:4,kind:'fridge',col:'#2f3d35',big:1},
 bar:{n:'Bar à cocktails',cat:'Bar',p:900,d:4,u:5,kind:'bar',col:'#7a4a2c',speed:1},
 bar2:{n:'Bar en marbre',cat:'Bar',p:2200,d:8,u:8,kind:'bar',col:'#3b2a22',speed:1.5,marble:1},""")
RP("const ROLES={chef:{n:'Cuisinier',e:'👨‍🍳',u:1},waiter:{n:'Serveur',e:'🤵',u:1},",
   "const ROLES={chef:{n:'Cuisinier',e:'👨‍🍳',u:1},waiter:{n:'Serveur',e:'🤵',u:1},barman:{n:'Barman',e:'🍸',u:5},")
RP("DINING_KINDS=['table','chair','wbench'];","DINING_KINDS=['table','chair','wbench','fridge','bar'];")
RP("  if(k==='table'&&!near(f,seen,true)) return false;\n }\n return true;",
   "  if(k==='table'&&!near(f,seen,true)) return false;\n  if((k==='fridge'||k==='bar')&&!near(f,seen,true)) return false;\n }\n return true;")
RP("garden:[null,null,null,null],staff:[],store:{},","garden:[null,null,null,null],staff:[],store:{},bar:0,")
RP("TABS={shop:[['Tables','Tables'],['Chaises','Chaises'],['Cuisine','Cuisine'],['Déco','Déco'],",
   "TABS={shop:[['Tables','Tables'],['Chaises','Chaises'],['Cuisine','Cuisine'],['Bar','Bar'],['Déco','Déco'],")
RP("menu:[['carte','Ma carte'],['plats','Recettes']]}","menu:[['carte','Ma carte'],['plats','Recettes'],['boissons','Boissons']]}")
RP("['Cuisine','🥘','Équipement'],","['Cuisine','🥘','Équipement'],['Bar','🍹','Bar'],")
RP("if(['Tables','Chaises','Cuisine','Déco'].includes(FURN[f.t].cat)) etab=FURN[f.t].cat;","if(['Tables','Chaises','Cuisine','Bar','Déco'].includes(FURN[f.t].cat)) etab=FURN[f.t].cat;")
RP("Cuisine:'Le matériel se pose dans la cuisine (zone orange). Le passe-plat va sur son bord, côté salle.',",
   "Cuisine:'Le matériel se pose dans la cuisine (zone orange). Le passe-plat va sur son bord, côté salle.',Bar:'Le frigo sert eau, sodas, jus et bière. Le bar prépare les cocktails (niv. 5).',")

# ---------- boissons ----------
RP("function bfs(sx,sy,isGoal,goalPass,zone){", r"""const DRINKS=[
 {id:'eau',n:'Eau minérale',e:'💧',p:3,u:1,src:'fridge'},
 {id:'soda',n:'Soda',e:'🥤',p:4,u:1,src:'fridge'},
 {id:'jus',n:"Jus d'orange",e:'🧃',p:5,u:2,src:'fridge'},
 {id:'biere',n:'Bière',e:'🍺',p:6,u:3,src:'fridge'},
 {id:'vin',n:'Verre de vin',e:'🍷',p:10,u:5,src:'bar',t:2.5},
 {id:'mojito',n:'Mojito',e:'🍹',p:15,u:5,src:'bar',t:6},
 {id:'cosmo',n:'Cosmopolitan',e:'🍸',p:17,u:6,src:'bar',t:6},
 {id:'spritz',n:'Spritz',e:'🥂',p:16,u:7,src:'bar',t:5},
 {id:'whisky',n:'Whisky',e:'🥃',p:19,u:8,src:'bar',t:3}];
const DRINKM=Object.fromEntries(DRINKS.map(d=>[d.id,d]));
let drinkOrders=[]; const barBusy=new Set(), fridgeOpen=new Map();
const hasKind=k=>state.furn.some(f=>kindOf(f)===k);
function drinkOK(d){ return state.level>=d.u&&hasKind(d.src); }
function orderDrink(c){
 const av=DRINKS.filter(drinkOK); if(!av.length||Math.random()>.6) return;
 // les cocktails sont plus demandés quand le bar existe
 const w=av.map(d=>d.src==='bar'?1.4:1), tot=w.reduce((a,b)=>a+b,0); let r=Math.random()*tot, k=av[0];
 for(let i=0;i<av.length;i++){ r-=w[i]; if(r<=0){ k=av[i]; break; } }
 const d={id:uid++,c,k:k.id,st:'wait'}; c.drink=d; drinkOrders.push(d);
}
function dropDrink(c){ if(c.drink&&c.drink.st!=='served') c.drink.cancel=true; if(c.drink&&c.drink.w&&c.drink.w.job&&c.drink.w.job.d===c.drink&&c.drink.st!=='served'){ /* le serveur abandonne au prochain pas */ } }
function serveDrink(d){ const c=d.c; d.st='served'; c.drinkOn=DRINKM[d.k].e; c.pat=Math.min(100,(c.pat||0)+20); sfx('pop'); }
function drinkPay(c){ return c.drink&&c.drink.st==='served'?DRINKM[c.drink.k].p:0; }
function toSeat(a,c){ return (c.seat&&pathToFurn(a,c.seat))||[]; }
function mixJob(a){
 const d=drinkOrders.find(d=>d.st==='wait'&&DRINKM[d.k].src==='bar'); if(!d) return false;
 const r=bestPath(a,state.furn.filter(f=>kindOf(f)==='bar'&&!barBusy.has(f.id))); if(!r) return false;
 barBusy.add(r.f.id); d.st='mixing'; d.w=a; a.job={d,s:'mgo',st:r.f}; a.path=r.p; return true;
}
function drinkJob(a,isBarman,urgent){
 const U=d=>!urgent||(d.c&&d.c.st==='wait');
 let d=drinkOrders.find(d=>d.st==='ready'&&!d.w&&d.at&&state.furn.includes(d.at)&&U(d));
 if(d){ const p=pathToFurn(a,d.at); if(p){ d.w=a; a.job={d,s:'dpick'}; a.path=p; return true; } }
 d=drinkOrders.find(d=>d.st==='wait'&&DRINKM[d.k].src==='fridge'&&U(d));
 if(d){ const r=bestPath(a,state.furn.filter(f=>kindOf(f)==='fridge')); if(r){ d.st='fetch'; d.w=a; a.job={d,s:'dfetch',f:r.f}; a.path=r.p; return true; } }
 if(!urgent&&!isBarman&&!crew.some(c=>c.s.role==='barman')&&mixJob(a)) return true;
 return false;
}
function drinkWork(a,j,dt){
 const d=j.d;
 if(d.cancel){ if(j.st) barBusy.delete(j.st.id); a.job=null; a.carry=null; return; }
 if(j.s==='dfetch'){ if(!j.op&&!a.path.length){ j.op=1; fridgeOpen.set(j.f.id,performance.now()); } if(arrived(a,dt,.9,j.f)){ d.st='carried'; a.carry=DRINKM[d.k].e; a.path=toSeat(a,d.c); j.s='dserve'; } return; }
 if(j.s==='dpick'){ if(!state.furn.includes(d.at)){ d.st='wait'; d.w=null; a.job=null; return; } if(arrived(a,dt,.35,d.at)){ d.st='carried'; a.carry=DRINKM[d.k].e; a.path=toSeat(a,d.c); j.s='dserve'; } return; }
 if(j.s==='dserve'){ if(arrived(a,dt,.45,d.c)){ serveDrink(d); faceTo(a,d.c); a.carry=null; a.job=null; gainStaff(a); } return; }
 if(j.s==='mgo'){ if(arrived(a,dt,.25,j.st)){ j.s='mix'; j.T=j.t=(DRINKM[d.k].t||4)/(FURN[j.st.t].speed||1)/staffMul(a); } return; }
 if(j.s==='mix'){ j.t-=dt; if(j.t<=0){ barBusy.delete(j.st.id); gainStaff(a);
   if(a.s.role==='barman'){ d.st='ready'; d.at=j.st; d.w=null; a.job=null; sfx('bell'); }
   else { d.st='carried'; a.carry=DRINKM[d.k].e; a.path=toSeat(a,d.c); j.s='dserve'; j.st=null; } } return; }
}
function barmanAI(a,dt){
 if(!a.job){ if(mixJob(a)) return; drinkJob(a,true); return; }
 if(a.job.d) drinkWork(a,a.job,dt);
}
function resetDrinks(){
 barBusy.clear();
 for(const d of drinkOrders){ if(d.cancel||d.st==='served') continue; d.w=null; if(d.st==='ready'&&d.at&&state.furn.includes(d.at)) continue; d.st='wait'; d.at=null; }
}
function resetDrinkJobOf(id){ const a=crew.find(c=>c.s.id==id); if(a&&a.job&&a.job.d){ if(a.job.st) barBusy.delete(a.job.st.id); const d=a.job.d; if(!d.cancel&&d.st!=='served'){ d.st='wait'; d.w=null; d.at=null; } a.job=null; a.carry=null; } }
// pose automatique d'un meuble contre un mur de la salle (frigo offert)
function autoPlace(t){
 const cand=[]; for(let y=0;y<S;y++) for(let x=0;x<S;x++){ if(fAt(x,y)||(x===DX&&y>=S-2)||zoneErr(t,x,y)) continue; const wall=(y===0?1:0)+(x===0?1:0); if(!wall) continue; const dk=Math.hypot(x-(KR.x0+KR.w),y-(KR.y0+KR.d)); cand.push([x,y,dk]); }
 cand.sort((a,b)=>a[2]-b[2]);
 for(const [x,y] of cand){ const f={id:state.nid++,t,x,y}; state.furn.push(f); rebuildOcc(); if(layoutOK()&&!diningBad()) return f; state.furn.pop(); rebuildOcc(); }
 return null;
}
function drinksHTML(){
 let h='<p class="sub">Tes clients peuvent commander une boisson avec leur plat. Servie rapidement, elle les fait patienter et rapporte un petit supplément.</p>';
 for(const [src,t,need] of [['fridge','🧊 Au frigo','Pose un frigo à boissons (Déco → Bar).'],['bar','🍸 Au bar','Pose un bar à cocktails (niveau 5). Un barman les prépare plus vite.']]){
  const has=hasKind(src); h+=`<h3>${t}</h3>`;
  if(!has) h+=`<p class="sub">${need}</p>`;
  h+=DRINKS.filter(d=>d.src===src).map(d=>{ const lock=state.level<d.u, ok=!lock&&has;
   return `<div class="row" ${ok?'':'style="opacity:.6"'}><div class="emo">${d.e}</div><div class="info"><div class="t">${d.n}</div><div class="sub">${lock?'🔒 Niveau '+d.u:d.p+' 🪙'+(d.t?' · '+d.t+' s de préparation':'')}</div></div>${ok?'<span class="tag gr">À la carte</span>':''}</div>`; }).join('');
 }
 return h;
}
function bfs(sx,sy,isGoal,goalPass,zone){""")

# commande, service et paiement
RP("c.order=o; c.pat=100; c.st='wait'; orders.push(o);","c.order=o; c.pat=100; c.st='wait'; orders.push(o); c.drink=null; c.drinkOn=null; orderDrink(c);")
RP("function leave(c){\n if(c.sitting&&c.seatGeo&&!c.seq){","function leave(c){\n dropDrink(c);\n if(c.sitting&&c.seatGeo&&!c.seq){")
RP("const d=DISHM[c.order.dish], L=lvl(d.id), price=dishPrice(d);","const d=DISHM[c.order.dish], L=lvl(d.id), price=dishPrice(d)+drinkPay(c);")
RP("let sat=40+c.pat*.35+L*2.5+rParts.d*8-(c.dirtyStart?12:0);","let sat=40+c.pat*.35+L*2.5+rParts.d*8-(c.dirtyStart?12:0)+(drinkPay(c)?6:0);")
RP(" c.order=null;\n if(c.grp&&c.grp.m.some("," dropDrink(c); c.drinkOn=null; c.order=null;\n if(c.grp&&c.grp.m.some(")
RP("orders=orders.filter(o=>!o.cancel&&o.st!=='served');","orders=orders.filter(o=>!o.cancel&&o.st!=='served'); drinkOrders=drinkOrders.filter(d=>!d.cancel&&d.st!=='served');")
RP("function resetSim(){\n stoveBusy.clear(); cleaning.clear();","function resetSim(){\n stoveBusy.clear(); cleaning.clear(); resetDrinks();")
# serveurs : plats prêts d'abord, puis boissons
RP("  if(o){ const p=pathToFurn(a,o.at); if(p){ o.waiter=a; a.job={o,s:'pick'}; a.path=p; return; } }\n  if(dirtyJob(a)) return;",
   "  if(o){ const p=pathToFurn(a,o.at); if(p){ o.waiter=a; a.job={o,s:'pick'}; a.path=p; return; } }\n  if(drinkJob(a,false,true)||drinkJob(a,false)) return;\n  if(dirtyJob(a)) return;")
RP(" if(j.s==='trash') return doTrash(a,j,dt);\n const o=j.o;\n if(o.cancel){ a.job=null; a.carry=null; return; }\n if(j.s==='pick')",
   " if(j.s==='trash') return doTrash(a,j,dt);\n if(j.d) return drinkWork(a,j,dt);\n const o=j.o;\n if(o.cancel){ a.job=null; a.carry=null; return; }\n if(j.s==='pick')")
RP(" if(r==='chef') chefAI(a,dt); else if(r==='waiter') waiterAI(a,dt); else cleanerAI(a,dt);",
   " if(r==='chef') chefAI(a,dt); else if(r==='waiter') waiterAI(a,dt); else if(r==='barman') barmanAI(a,dt); else cleanerAI(a,dt);")
RP("const used=new Set([DX+','+(S-1)]), cnt={chef:0,waiter:0,cleaner:0};","const used=new Set([DX+','+(S-1)]), cnt={chef:0,waiter:0,cleaner:0,barman:0};")
RP("kindOf(f)===(r==='chef'?'stove':r==='waiter'?'counter':'none')), zk=r==='chef';","kindOf(f)===(r==='chef'?'stove':r==='waiter'?'counter':r==='barman'?(hasKind('bar')?'bar':'fridge'):'none')), zk=r==='chef';")
RP(" role:id=>{ "," role:id=>{ resetDrinkJobOf(id); ")
RP(" menu(){\n  let html='';\n  if(ui.tab==='carte'){"," menu(){\n  let html='';\n  if(ui.tab==='boissons') return {title:'📖 Menu & recettes',html:drinksHTML()};\n  if(ui.tab==='carte'){")
# nouvelle partie : un frigo près de la cuisine ; ancienne sauvegarde : frigo offert
RP(" setSize(); installKitchen(); state.kit=1;\n}"," setSize(); installKitchen(); state.kit=1; autoPlace('fridge'); state.bar=1;\n}")
RP(" else fixZones();\n buildCrew();",""" else fixZones();
 const NEWS=[];
 if(!state.bar){ state.bar=1; const f=autoPlace('fridge'); if(!f) state.store.fridge=(state.store.fridge||0)+1;
  NEWS.push(`<div class="row"><div class="emo">🥤</div><div class="info"><div class="t">Coin boissons</div><div class="sub">Un frigo t'est offert${f?', déjà installé dans la salle':', il t\\'attend dans ta réserve (Déco)'}. Eau, soda, jus, bière… puis cocktails au niveau 5 avec un barman.</div></div></div>`); }
 buildCrew();""")
