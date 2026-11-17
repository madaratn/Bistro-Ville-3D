# v0.14 : service à table réaliste
#  accueil et placement par un serveur -> lecture du menu -> prise de commande sur tablette (envoyée à l'écran
#  de la cuisine) -> service -> addition au terminal de paiement -> débarrassage discret (bac) -> retour plonge
#  -> un cuisinier lave la vaisselle à l'évier

# ---------- retour plonge (desserte au bord de la cuisine) ----------
RP(" counter:{n:'Comptoir passe-plat',cat:'Cuisine',p:150,d:0,u:1,kind:'counter',col:'#a8693a'},",
   " counter:{n:'Comptoir passe-plat',cat:'Cuisine',p:150,d:0,u:1,kind:'counter',col:'#a8693a'},\n desserte:{n:'Retour plonge',cat:'Cuisine',p:120,d:0,u:1,kind:'dish',col:'#9aa3ad'},")
RP("const KITCHEN_KINDS=['stove','oven','prep','sink','counter'],","const KITCHEN_KINDS=['stove','oven','prep','sink','counter','dish'],")
RP(" if(k==='counter'&&!kitchenEdge(x,y)) return 'Le passe-plat doit être au bord de la cuisine, côté salle.';",
   " if(k==='counter'&&!kitchenEdge(x,y)) return 'Le passe-plat doit être au bord de la cuisine, côté salle.';\n if(k==='dish'&&!kitchenEdge(x,y)) return 'Le retour plonge doit être au bord de la cuisine, côté salle.';")
RP("  if(['stove','oven','prep','counter'].includes(k)&&!near(f,kseen,true)) return false;\n  if(k==='counter'&&!near(f,seen,true)) return false;",
   "  if(['stove','oven','prep','counter','dish'].includes(k)&&!near(f,kseen,true)) return false;\n  if((k==='counter'||k==='dish')&&!near(f,seen,true)) return false;")
RP(" if(k==='counter') return ({nw:0,ne:3,sw:1,se:2})[state.kz?state.kz.c:'nw'];"," if(k==='counter'||k==='dish') return ({nw:0,ne:3,sw:1,se:2})[state.kz?state.kz.c:'nw'];")
RP("let [u,v]=kUV(f.x,f.y,oR,oc); const isC=kindOf(f)==='counter';","let [u,v]=kUV(f.x,f.y,oR,oc); const isC=kindOf(f)==='counter'||kindOf(f)==='dish';")
RP(" const ord=['counter','stove','oven','prep','sink'];"," const ord=['counter','dish','stove','oven','prep','sink'];")
RP("Cuisine:'Le matériel se pose dans la cuisine (zone orange). Le passe-plat va sur son bord, côté salle.',",
   "Cuisine:'Le matériel se pose dans la cuisine (zone orange). Le passe-plat et le retour plonge vont sur son bord, côté salle.',")

# ---------- état du service ----------
RP("let dirty=new Map(),stoveBusy=new Set(),cleaning=new Set();",
   "let dirty=new Map(),stoveBusy=new Set(),cleaning=new Set(),dishStack=new Map(),freeSince=new Map(),simT=0;")
RP("const ACTIVE=['wait','eat','walkIn','enter','look'];","const ACTIVE=['wait','eat','walkIn','enter','look','host','menu','order','bill'];")
RP("  const seated=g.m.filter(m=>!m.dead&&m.sitting&&(m.st==='wait'||m.st==='eat'||m.st==='done'));",
   "  const seated=g.m.filter(m=>!m.dead&&m.sitting&&['wait','eat','done','order','bill'].includes(m.st));")
RP("function update(dt){","function update(dt){\n simT+=dt;")

# on installe les clients de préférence à une table propre
RP(" const seats=state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&seatTable(f));\n const inside=c.y<S-1,",
   " const seats=freeSeats();\n const inside=c.y<S-1,")
RP(" const seats=state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&seatTable(f));\n for(const s of seats){ if(bfs(DX,S-1,",
   " const seats=freeSeats();\n for(const s of seats){ if(bfs(DX,S-1,")
RP(" const tables=state.furn.filter(f=>kindOf(f)==='table').sort(()=>Math.random()-.5);",
   " const tables=state.furn.filter(f=>kindOf(f)==='table'&&!tableBusy(f)).sort(()=>Math.random()-.5).sort((a,b)=>((dirty.get(a.id)||0)>0)-((dirty.get(b.id)||0)>0));")
RP("function takenSeats(){","// places libres : une seule tablée par table, les tables propres d'abord\nfunction freeSeats(){ const tk=takenSeats(), r=state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&seatTable(f)&&!tableBusy(seatTable(f))).sort(()=>Math.random()-.5); return r.sort((a,b)=>((dirty.get(seatTable(a).id)||0)>0)-((dirty.get(seatTable(b).id)||0)>0)); }\nfunction takenSeats(){")

# ---------- côté clients ----------
# à l'entrée : on attend qu'un serveur vienne nous accueillir (sinon on s'installe seul au bout d'un moment)
RP("""   if(c.t<=0){ const s=c.seat, p=s&&state.furn.includes(s)&&bfs(c.x,c.y,(x,y)=>x===s.x&&y===s.y,true);
    if(p){ c.path=p; c.st='walkIn'; c.hes=p.length>4&&Math.random()<.35?Math.floor(p.length/2):0; } else { c.seat=null; leave(c); } }
   break;""","""   if(c.t<=0){ if(hostOn()){ c.st='host'; c.hostT=0; c.hostBy=null; } else goSeat(c); }
   break;
  case 'host':
   c.hostT+=dt; c.lt=(c.lt||0)+dt; c.headT=Math.sin(c.lt*.6+c.id)*.45;
   if(c.hostBy&&!(c.hostBy.job&&c.hostBy.job.svc==='greet'&&c.hostBy.job.ms.includes(c))) c.hostBy=null;
   if(c.hostBy){ c.rotT=Math.atan2(c.hostBy.fx-c.fx,c.hostBy.fy-c.fy); }
   else if(c.hostT>10||!hostOn()) goSeat(c);
   break;""")
RP("function sitDown(c){","""function hostOn(){ return crew.some(a=>a.s.role==='waiter'); }
function goSeat(c,delay){
 const s=c.seat, p=s&&state.furn.includes(s)&&bfs(c.x,c.y,(x,y)=>x===s.x&&y===s.y,true);
 c.hostBy=null;
 if(p){ c.path=p; c.st='walkIn'; c.hes=!delay&&p.length>4&&Math.random()<.35?Math.floor(p.length/2):0; c.pause=Math.max(c.pause||0,delay||0); } else { c.seat=null; leave(c); }
}
// commande prise par le serveur : elle part directement à l'écran de la cuisine
function placeOrder(c){
 const o={id:uid++,c,dish:pick(state.menu),st:'wait',tNo:tableNo(c.table)};
 c.order=o; c.pat=Math.max(c.pat,85); c.st='wait'; orders.push(o); c.drink=null; c.drinkOn=null; orderDrink(c);
}
function tableNo(t){ if(!t) return 0; const ts=state.furn.filter(f=>kindOf(f)==='table').sort((a,b)=>a.id-b.id); return ts.indexOf(t)+1; }
function sitDown(c){""")
RP(""" const o={id:uid++,c,dish:pick(state.menu),st:'wait'};
 c.order=o; c.pat=100; c.st='wait'; orders.push(o); c.drink=null; c.drinkOn=null; orderDrink(c);
}""",""" c.pat=100; c.st='menu'; c.t=rnd(3,5); c.drink=null; c.drinkOn=null; c.orderBy=null; c.billBy=null; c.phone=false;
}""")
RP("  case 'done': if(!c.grp) leave(c); break;\n  case 'eat': c.t-=dt; if(c.t<=0) finishMeal(c); break;",
"""  case 'done': if(!c.grp) leave(c); break;
  case 'menu': c.t-=dt; c.lt=(c.lt||0)+dt; c.headT=Math.sin(c.lt*.35+c.id)*.15; if(c.t<=0){ c.st='order'; c.ordT=0; c.hand=1.5; } break;
  case 'order':
   c.ordT+=dt; c.lt=(c.lt||0)+dt; if(c.hand>0) c.hand-=dt;
   if(c.orderBy&&!(c.orderBy.job&&c.orderBy.job.svc==='order'&&c.orderBy.job.cs.includes(c))) c.orderBy=null;
   if(!c.orderBy){ c.pat-=dt*patRate()*.7; if(c.ordT>3&&(c.ordT%7)<dt) c.hand=1.3; c.headT=Math.sin(c.lt*.9+c.id)*.6; }
   if(c.pat<=0) angry(c); break;
  case 'bill':
   c.billT+=dt; c.lt=(c.lt||0)+dt;
   if(c.billBy&&!(c.billBy.job&&c.billBy.job.svc==='bill'&&c.billBy.job.cs.includes(c))) c.billBy=null;
   if(!c.billBy&&(c.billT>16||!hostOn())) finishMeal(c);
   break;
  case 'eat': c.t-=dt; if(c.t<=0){ c.st='bill'; c.billT=0; c.billBy=null; c.drinkOn=c.drink&&c.drink.st==='served'?c.drinkOn:null; if(c.table&&state.furn.includes(c.table)) dirty.set(c.table.id,(dirty.get(c.table.id)||0)+1); } break;""")
RP(" if(c.table&&state.furn.includes(c.table)) dirty.set(c.table.id,(dirty.get(c.table.id)||0)+1);\n if(Math.random()<.1){"," if(Math.random()<.1){")

# ---------- côté serveurs ----------
a=js.index("function waiterAI(a,dt){"); b=js.index("function trashJob(a){")
js=js[:a]+r"""// clients d'un même groupe prêts ensemble (ou un client seul)
function partyOf(c,st){ if(!c.grp) return c[st+'By']?null:[c]; const ms=c.grp.m.filter(m=>!m.dead&&ACTIVE.includes(m.st)); if(!ms.length||ms.some(m=>m.st!==st&&m.st!=='done')) return null; const r=ms.filter(m=>m.st===st&&!m[st+'By']); return r.length?r:null; }
function greetJob(a){
 for(const c of custs){ if(c.st!=='host'||c.hostBy) continue;
  const p=bfs(a.x,a.y,(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-c.x)+Math.abs(y-c.y)===1,false,'d'); if(!p) continue;
  const ms=c.grp?c.grp.m.filter(m=>!m.dead&&(m.st==='host'||m.st==='look')):[c]; ms.forEach(m=>m.hostBy=a);
  a.job={svc:'greet',c,ms,s:'go'}; a.path=p; return true; }
 return false;
}
function orderJob(a){
 for(const c of custs){ if(c.st!=='order'||c.orderBy||!c.table) continue; const ps=partyOf(c,'order'); if(!ps) continue;
  const p=pathToFurn(a,c.table); if(!p) continue; ps.forEach(m=>m.orderBy=a); a.job={svc:'order',t:c.table,cs:ps,s:'go'}; a.path=p; return true; }
 return false;
}
function billJob(a){
 for(const c of custs){ if(c.st!=='bill'||c.billBy||!c.table) continue; const ps=partyOf(c,'bill'); if(!ps) continue;
  const p=pathToFurn(a,c.table); if(!p) continue; ps.forEach(m=>m.billBy=a); a.job={svc:'bill',t:c.table,cs:ps,s:'go'}; a.path=p; return true; }
 return false;
}
function svcWork(a,j,dt){
 if(j.svc==='greet'){
  const c=j.c;
  if(c.dead||c.st!=='host'&&j.s==='go'){ j.ms.forEach(m=>{ if(m.hostBy===a) m.hostBy=null; }); a.job=null; return; }
  if(j.s==='go'){ if(arrived(a,dt,.4,c)){ a.wave=1; c.say='👋'; c.sayT=1; j.s='hello'; j.t=.65; } return; }
  if(j.s==='hello'){ j.t-=dt; if(j.t>0) return;
   // le serveur part devant, les clients suivent jusqu'à leur table
   const t=c.seat&&seatTable(c.seat);
   j.ms.forEach((m,i)=>{ if(!m.dead&&(m.st==='host'||m.st==='look')) goSeat(m,.45+i*.4); });
   const p=t&&pathToFurn(a,t); if(!p){ a.job=null; return; }
   j.t2=t; a.path=p; j.s='lead'; return; }
  if(j.s==='lead'){ if(arrived(a,dt,.6,j.t2)){ if(dirty.get(j.t2.id)>0&&!cleaning.has(j.t2.id)){ cleaning.add(j.t2.id); j.s='clear'; j.t=1.3; a.wipe=1; } else { gainStaff(a); a.job=null; } } return; }
  if(j.s==='clear'){ j.t-=dt; if(j.t>0) return; a.wipe=0; const n=dirty.get(j.t2.id)||0; dirty.delete(j.t2.id); cleaning.delete(j.t2.id); const r=dishReturns()[0]; if(r) dishStack.set(r.id,Math.min(12,(dishStack.get(r.id)||0)+n*2)); gainStaff(a); a.job=null; return; }
 }
 if(j.svc==='order'||j.svc==='bill'){
  const key=j.svc==='order'?'orderBy':'billBy', want=j.svc;
  j.cs=j.cs.filter(c=>!c.dead&&c.st===want&&c[key]===a);
  if(!j.cs.length||!state.furn.includes(j.t)){ a.tab=0; a.job=null; return; }
  if(j.s==='go'){ if(arrived(a,dt,.3,j.t)){ j.s='do'; j.T=j.tt=(want==='order'?1+.5*j.cs.length:.9+.3*j.cs.length)/Math.sqrt(staffMul(a)); a.tab=want==='order'?1:2; } return; }
  if(j.s==='do'){ j.tt-=dt; for(const c of j.cs){ c.lookAt=a; c.hand=0; }
   if(j.tt>0) return;
   if(want==='order'){ for(const c of j.cs) placeOrder(c); sfx('send'); }
   else { for(const c of j.cs) finishMeal(c); }
   a.tab=0; gainStaff(a); a.job=null; return; }
 }
}
// débarrassage discret : seulement quand la table est libre, avec un bac, puis retour plonge
function tableBusy(t){ return custs.some(c=>!c.dead&&c.seat&&c.st!=='leave'&&c.st!=='pass'&&c.st!=='queue'&&seatTable(c.seat)===t); }
const SEATED_ST=['menu','order','wait','eat','bill','done','standUp'];
function tableOccupied(t){ return custs.some(c=>!c.dead&&c.seat&&(c.sitting||c.seq||SEATED_ST.includes(c.st))&&c.st!=='leave'&&seatTable(c.seat)===t); }
function dishReturns(){ const d=state.furn.filter(f=>kindOf(f)==='dish'); return d.length?d:state.furn.filter(f=>kindOf(f)==='counter'); }
function cleanJob(a){
 for(const [id,n] of dirty){ if(n<=0||cleaning.has(id)) continue; const t=state.furn.find(f=>f.id===id); if(!t) continue;
  if(tableOccupied(t)){ freeSince.delete(id); continue; }
  if(!freeSince.has(id)){ freeSince.set(id,simT); continue; }
  if(simT-freeSince.get(id)<1.5) continue;
  const p=pathToFurn(a,t); if(!p) continue;
  cleaning.add(id); a.job={cl:1,s:'go',t}; a.path=p; a.tub=1; return true; }
 return false;
}
function cleanWork(a,j,dt){
 const t=j.t;
 if(!state.furn.includes(t)){ cleaning.delete(t.id); a.tub=0; a.job=null; return; }
 if(j.s==='go'){ if(tableOccupied(t)){ cleaning.delete(t.id); a.tub=0; a.job=null; return; } if(arrived(a,dt,.25,t)){ j.s='wipe'; j.tt=2.2/Math.sqrt(staffMul(a)); j.n=dirty.get(t.id)||1; } return; }
 if(j.s==='wipe'){ j.tt-=dt; a.wipe=1; if(j.tt>0) return;
  a.wipe=0; dirty.delete(t.id); cleaning.delete(t.id); freeSince.delete(t.id); a.tub=2; gainStaff(a);
  const r=bestPath(a,dishReturns()); if(r){ j.s='drop'; j.r=r.f; a.path=r.p; } else { a.tub=0; a.job=null; } return; }
 if(j.s==='drop'){ if(!state.furn.includes(j.r)){ a.tub=0; a.job=null; return; }
  if(arrived(a,dt,.45,j.r)){ dishStack.set(j.r.id,Math.min(12,(dishStack.get(j.r.id)||0)+j.n*2)); a.tub=0; a.job=null; } }
}
function waiterAI(a,dt){
 const j=a.job;
 if(!j){
  a.tab=0;
  const o=orders.find(o=>o.st==='ready'&&!o.waiter);
  if(o){ const p=pathToFurn(a,o.at); if(p){ o.waiter=a; a.job={o,s:'pick'}; a.path=p; return; } }
  if(greetJob(a)||orderJob(a)||billJob(a)) return;
  if(drinkJob(a,false,true)||drinkJob(a,false)) return;
  if(!crew.some(c=>c.s.role==='cleaner')){ if(cleanJob(a)) return; if(trash.length>2) trashJob(a); }
  return;
 }
 if(j.svc) return svcWork(a,j,dt);
 if(j.cl) return cleanWork(a,j,dt);
 if(j.s==='trash') return doTrash(a,j,dt);
 if(j.d) return drinkWork(a,j,dt);
 const o=j.o;
 if(o.cancel){ a.job=null; a.carry=null; return; }
 if(j.s==='pick'){ if(arrived(a,dt,.35,o.at)){ o.st='carried'; a.carry=DISHM[o.dish].e; a.path=(o.c.seat&&pathToFurn(a,o.c.seat))||[]; j.s='serve'; } }
 else if(j.s==='serve'){ if(arrived(a,dt,.45,o.c)){ serve(o); faceTo(a,o.c); a.carry=null; a.job=null; gainStaff(a);} }
}
"""+js[b:]
a=js.index("function cleanerAI(a,dt){"); b=js.index("function updStaff(a,dt){")
js=js[:a]+r"""function cleanerAI(a,dt){
 const j=a.job;
 if(!j){ if(cleanJob(a)) return; trashJob(a); return; }
 if(j.cl) return cleanWork(a,j,dt);
 if(j.s==='trash') doTrash(a,j,dt);
}
"""+js[b:]
# le cuisinier fait la plonge quand il n'a pas de commande
RP("""function chefAI(a,dt){
 const j=a.job;
 if(!j){
  const o=orders.find(o=>o.st==='wait'); if(!o) return;""","""function plongeJob(a){
 const sinks=state.furn.filter(f=>kindOf(f)==='sink'&&!stoveBusy.has(f.id));
 for(const [id,n] of dishStack){ if(n<=0) continue; const r=state.furn.find(f=>f.id===id); if(!r){ dishStack.delete(id); continue; }
  if(crew.some(c=>c!==a&&c.job&&c.job.pl&&c.job.r===r)) continue;
  const p=pathToFurn(a,r); if(!p) continue;
  a.job={pl:1,s:'go',r,sink:sinks[0]||null}; a.path=p; return true; }
 return false;
}
function plongeWork(a,j,dt){
 if(j.s==='go'){ if(arrived(a,dt,.4,j.r)){ j.n=Math.min(6,dishStack.get(j.r.id)||0); dishStack.set(j.r.id,(dishStack.get(j.r.id)||0)-j.n); if(!(dishStack.get(j.r.id)>0)) dishStack.delete(j.r.id); a.tub=2;
   const r=j.sink&&state.furn.includes(j.sink)&&!stoveBusy.has(j.sink.id)?{f:j.sink,p:pathToFurn(a,j.sink)}:null;
   if(r&&r.p){ stoveBusy.add(r.f.id); j.st=r.f; a.path=r.p; j.s='tosink'; } else { a.tub=0; a.job=null; } } return; }
 if(j.s==='tosink'){ if(arrived(a,dt,.25,j.st)){ j.s='wash'; j.T=j.t=(1.6+j.n*.35)/staffMul(a); a.tub=0; } return; }
 if(j.s==='wash'){ j.t-=dt; if(j.t<=0){ stoveBusy.delete(j.st.id); a.job=null; } }
}
function chefAI(a,dt){
 const j=a.job;
 if(j&&j.pl) return plongeWork(a,j,dt);
 if(!j){
  const o=orders.find(o=>o.st==='wait'); if(!o){ plongeJob(a); return; }""")

# ---------- personnel : vitesse, postes de repos discrets ----------
RP("function updStaff(a,dt){\n a.moving=false; a.speed=1.25*staffMul(a);","function updStaff(a,dt){\n a.moving=false; a.speed=(a.s.role==='waiter'?1.5:1.25)*staffMul(a); if(a.wave>0) a.wave-=dt;")
RP("   a.homed=r!=='cleaner'; a.idle=0;","   a.homed=true; a.idle=0;")
RP("   if(r==='cleaner'){ const x=ri(0,S-1),y=ri(0,S-1); if(!blocked(x,y)&&!inKitchen(x,y)) p=bfs(a.x,a.y,(X,Y)=>X===x&&Y===y,false); }\n   else if(a.home","   if(a.home")
RP("r==='barman'?(hasKind('bar')?'bar':'fridge'):'none')), zk=r==='chef';","r==='barman'?(hasKind('bar')?'bar':'fridge'):r==='cleaner'?(hasKind('dish')?'dish':'counter'):'none')), zk=r==='chef';")
RP(" for(const a of crew){ a.job=null; a.carry=null; a.path=[];"," dishStack.forEach((n,id)=>{ if(!state.furn.some(f=>f.id===id)) dishStack.delete(id); }); freeSince.clear();\n for(const c of custs){ c.hostBy=null; c.orderBy=null; c.billBy=null; }\n for(const a of crew){ a.job=null; a.carry=null; a.path=[]; a.tab=0; a.tub=0; a.wipe=0;")
RP("  } else if(c.st==='wait'||c.st==='eat'||c.st==='done'){","  } else if(['wait','eat','done','menu','order','bill'].includes(c.st)){")
RP("  if(c.st==='enter'||c.st==='look') c.st='walkIn';","  if(c.st==='enter'||c.st==='look'||c.st==='host') c.st='walkIn';")
RP("  else if(k==='bad'){","  else if(k==='send'){ tone(1175,0,.07,'sine',.035); tone(1568,.06,.1,'sine',.03); }\n  else if(k==='bad'){")


# ---------- nouvelle partie / ancienne sauvegarde : un retour plonge à côté du passe-plat ----------
RP("function autoPlace(t){","""function autoPlaceEdge(t){
 const ctr=state.furn.filter(f=>kindOf(f)==='counter'), cand=[];
 for(let y=KR.y0;y<KR.y0+KR.d;y++) for(let x=KR.x0;x<KR.x0+KR.w;x++){ if(fAt(x,y)||zoneErr(t,x,y)) continue; const d=Math.min(9,...ctr.map(c=>Math.abs(c.x-x)+Math.abs(c.y-y))); cand.push([x,y,d]); }
 cand.sort((a,b)=>a[2]-b[2]);
 for(const [x,y] of cand){ const f={id:state.nid++,t,x,y}; state.furn.push(f); rebuildOcc(); if(layoutOK()) return f; state.furn.pop(); rebuildOcc(); }
 return null;
}
function autoPlace(t){""")
RP(" setSize(); installKitchen(); state.kit=1; autoPlace('fridge'); state.bar=1;\n}"," setSize(); installKitchen(); state.kit=1; autoPlace('fridge'); state.bar=1; autoPlaceEdge('desserte'); state.svc=1;\n}")
RP("garden:[null,null,null,null],staff:[],store:{},bar:0,","garden:[null,null,null,null],staff:[],store:{},bar:0,svc:0,")
RP(" buildCrew();\n resize();",""" if(!state.svc){ state.svc=1; if(!autoPlaceEdge('desserte')) state.store.desserte=(state.store.desserte||0)+1;
  NEWS.push(`<div class="row"><div class="emo">🤵</div><div class="info"><div class="t">Service à table</div><div class="sub">Les serveurs accueillent et installent les clients, prennent la commande sur tablette (elle s'affiche sur l'écran de la cuisine) et apportent l'addition. Une place d'équipe en plus t'attend.</div></div></div>`,
   `<div class="row"><div class="emo">🧺</div><div class="info"><div class="t">Débarrassage et plonge</div><div class="sub">Une fois les clients partis, la table est débarrassée avec un bac, la vaisselle va au retour plonge et un cuisinier la lave.</div></div></div>`,
   `<div class="row"><div class="emo">🎨</div><div class="info"><div class="t">Mode déco revu</div><div class="sub">Catalogue en bas de l'écran, glisser-déposer, pivoter, réserve, annuler, et cuisine réglable (coin et taille).</div></div></div>`,
   `<div class="row"><div class="emo">👁️</div><div class="info"><div class="t">Mode Regarder</div><div class="sub">Le bouton en forme d'œil cache l'interface : la caméra se promène dans ton restaurant.</div></div></div>`); }
 if(NEWS.length) queueModal(()=>({title:'Quoi de neuf ?',html:`<div class="hero">✨</div>${NEWS.join('')}<p class="center"><button class="b" data-a="close">C'est parti</button></p>`}));
 buildCrew();
 resize();""")
RP("  const s=seats.splice(Math.floor(Math.random()*seats.length),1)[0];\n  const p=bfs(fx,fy,","  const s=seats.shift();\n  const p=bfs(fx,fy,")
RP("const maxStaff=()=>Math.min(8,2+Math.floor(state.level/2));","const maxStaff=()=>Math.min(9,3+Math.floor(state.level/2));")
RP(" state.staff.push(mkStaffData('chef'),mkStaffData('waiter'));\n setSize();"," state.staff.push(mkStaffData('chef'),mkStaffData('waiter'),mkStaffData('waiter'));\n setSize();")
RP("const dishPrice=d=>Math.round(d.p*(1+.18*(lvl(d.id)-1)));","const dishPrice=d=>Math.round(d.p*1.4*(1+.18*(lvl(d.id)-1)));")
