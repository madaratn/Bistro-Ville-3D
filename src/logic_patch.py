# Patch de la logique : déplacements naturels, vitesse réduite, comportement à l'entrée
def RP(old,new):
    global js
    assert old in js, 'introuvable: '+old[:70]
    js=js.replace(old,new,1)

RP("function mkAgent(o){return Object.assign({x:0,y:0,fx:0,fy:0,path:[],speed:2.2,ph:Math.random()*6,dir:1,moving:false},o);}",
"""function mkAgent(o){return Object.assign({x:0,y:0,fx:0,fy:0,path:[],speed:1.1,ph:Math.random()*6,moving:false,v:0,pause:0,headT:0},o);}
function angDiff(a,b){ return ((b-a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI; }
function lerpAng(a,b,t){ return a+angDiff(a,b)*Math.min(1,t); }""")

# déplacement : accélération, virages progressifs, coins arrondis, ralentissement à l'arrivée
a=js.index("function moveAgent(a,dt){"); b=js.index("const PANTS=")
js=js[:a]+"""function moveAgent(a,dt){
 if(a.pause>0){ a.pause-=dt; a.v=0; a.moving=false; return false; }
 if(!a.path.length){ a.v=0; return true; }
 while(a.path.length>1&&Math.hypot(a.path[0][0]-a.fx,a.path[0][1]-a.fy)<.3){ const q=a.path.shift(); a.x=q[0]; a.y=q[1]; }
 const n=a.path[0], dx=n[0]-a.fx, dy=n[1]-a.fy, d=Math.hypot(dx,dy);
 if(d<.001){ a.fx=a.x=n[0]; a.fy=a.y=n[1]; a.path.shift(); if(!a.path.length){ a.v=0; a.moving=false; return true; } return false; }
 const want=Math.atan2(dx,dy); if(a.rot===undefined) a.rot=want;
 a.rot=lerpAng(a.rot,want,dt*7); a.rotT=a.rot;
 const al=Math.max(0,Math.cos(angDiff(a.rot,want)));
 const rem=d+(a.path.length-1);
 const vmax=a.speed*(rem<.7?Math.max(.3,rem/.7):1)*al*al;
 a.v=Math.min(vmax,(a.v||0)+dt*a.speed*2);
 a.moving=a.v>.04; a.ph+=dt*a.v*6.2; a.headT=(a.headT||0)*Math.max(0,1-dt*3);
 const st=a.v*dt;
 if(d<=st){ a.fx=a.x=n[0]; a.fy=a.y=n[1]; a.path.shift(); if(!a.path.length){ a.v=0; a.moving=false; return true; } return false; }
 a.fx+=dx/d*st; a.fy+=dy/d*st; return false;
}
function arrived(a,dt,d,f){ if(!moveAgent(a,dt)){ a.arr=0; return false; } if(!a.arr&&f) faceTo(a,f); a.arr=(a.arr||0)+dt; if(a.arr>=d){ a.arr=0; return true; } return false; }
"""+js[b:]

RP("function randLook(){return {skin:pick(SKINS),hair:pick(HAIRS),body:pick(BODIES),pants:pick(PANTS),hs:ri(0,3),",
   "function randLook(){return {skin:pick(SKINS),hair:pick(HAIRS),body:pick(BODIES),pants:pick(PANTS),hs:ri(0,5),skirt:Math.random()<.25,shoe:pick(['#2b2b30','#6b4a33','#f2f2f2','#c0392b','#3a5a8c']),")
RP("body:pick(BODIES),hs:ri(0,3)};","body:pick(BODIES),hs:ri(0,5)};")
RP("a.speed=2.4*staffMul(a); }","a.speed=1.25*staffMul(a); }")
RP(" a.moving=false; a.speed=2.4*staffMul(a);"," a.moving=false; a.speed=1.25*staffMul(a);")
RP("speed:rnd(1.8,2.4)","speed:rnd(.95,1.2)")

# choix de la place : on réserve, puis on entre et on regarde autour
a=js.index("function tryGetSeat(c){"); b=js.index("function spawnCust(pass){")
js=js[:a]+"""function tryGetSeat(c){
 const tk=takenSeats();
 const seats=state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&seatTable(f));
 const inside=c.y<S-1, fx=inside?c.x:DX, fy=inside?c.y:S-1;
 for(let i=0;i<4&&seats.length;i++){
  const s=seats.splice(Math.floor(Math.random()*seats.length),1)[0];
  const p=bfs(fx,fy,(x,y)=>x===s.x&&y===s.y,true);
  if(p){ c.seat=s; c.sx=s.x; c.sy=s.y;
   if(inside){ c.path=p; c.st='walkIn'; c.hes=0; }
   else { c.path=bfs(c.x,c.y,(x,y)=>x===DX&&y===S-1,false)||[]; c.st='enter'; }
   return true; }
 }
 return false;
}
"""+js[b:]

RP("function leave(c){\n c.st='leave'; c.sitting=false; c.seat=null;","function leave(c){\n if(c.sitting) c.pause=.55;\n c.st='leave'; c.sitting=false; c.seat=null; c.headT=0;")
RP("function patRate(){ return 2.6-rating*.25; }","function patRate(){ return (2.6-rating*.25)*.6; }")
RP("c.st='eat'; c.t=rnd(5,7);","c.st='eat'; c.t=rnd(7,10); c.headT=0;")
RP("sparkle(c.fx,c.fy,6); c.mood='happy';","sparkle(c.fx,c.fy,6); c.mood='happy'; c.hop=.5;")
RP("c.order=null; leave(c); c.back=false;","c.order=null; leave(c);")

RP("""   moveAgent(c,dt); c.pat-=dt*2.2; c.tt=(c.tt||0)-dt;""","""   if(moveAgent(c,dt)){ c.lt=(c.lt||0)+dt; c.headT=Math.sin(c.lt*.8)*.6; c.rotT=Math.PI; } c.pat-=dt*1.4; c.tt=(c.tt||0)-dt;""")
RP("""  case 'walkIn':
   if(moveAgent(c,dt)){""","""  case 'enter':
   if(moveAgent(c,dt)){ c.st='look'; c.t=rnd(1.8,2.8); c.lt=0; c.rotT=Math.PI; }
   break;
  case 'look':
   c.t-=dt; c.lt+=dt;
   if(c.t>.6){ c.headT=Math.sin(c.lt*2.3)*.9; c.rotT=Math.PI+Math.sin(c.lt*1.1)*.5; }
   else { c.headT=0; if(c.seat) c.rotT=Math.atan2(c.seat.x-c.x,c.seat.y-c.y); }
   if(c.t<=0){ const s=c.seat, p=s&&state.furn.includes(s)&&bfs(c.x,c.y,(x,y)=>x===s.x&&y===s.y,true);
    if(p){ c.path=p; c.st='walkIn'; c.hes=p.length>4&&Math.random()<.35?Math.floor(p.length/2):0; } else { c.seat=null; leave(c); } }
   break;
  case 'walkIn':
   if(c.hes&&c.path.length<=c.hes){ c.hes=0; c.pause=rnd(.7,1.2); c.headT=Math.random()<.5?.8:-.8; }
   if(moveAgent(c,dt)){""")
RP("  case 'wait': c.pat-=dt*patRate(); if(c.pat<=0) angry(c); break;",
   "  case 'wait': c.pat-=dt*patRate(); c.lt=(c.lt||0)+dt; c.headT=c.pat<40?Math.sin(c.lt*2.2)*.75:Math.sin(c.lt*.45+c.id)*.35; if(c.pat<=0) angry(c); break;")

RP("function faceTo(a,f){ const dx=f.x-a.x, dy=f.y-a.y; a.hx=dx; a.hy=dy; if(dx-dy) a.dir=(dx-dy)>0?1:-1; a.back=(dx+dy)<0; }",
   "function faceTo(a,f){ const dx=f.x-a.x, dy=f.y-a.y; if(dx||dy) a.rotT=Math.atan2(dx,dy); }")
# petites pauses naturelles à chaque action du personnel
RP("if(j.s==='go'){ if(moveAgent(a,dt)){ j.s='cook';","if(j.s==='go'){ if(arrived(a,dt,.3,j.stove)){ j.s='cook';")
RP("else if(j.s==='bring'){ if(moveAgent(a,dt)){","else if(j.s==='bring'){ if(arrived(a,dt,.4,j.ctr)){")
RP("if(j.s==='clean'){ if(moveAgent(a,dt)) finishClean(a,j); return; }\n if(j.s==='trash') return doTrash(a,j,dt);",
   "if(j.s==='clean'){ if(arrived(a,dt,.6,j.table)) finishClean(a,j); return; }\n if(j.s==='trash') return doTrash(a,j,dt);")
RP("if(j.s==='pick'){ if(moveAgent(a,dt)){","if(j.s==='pick'){ if(arrived(a,dt,.35,o.at)){")
RP("else if(j.s==='serve'){ if(moveAgent(a,dt)){ serve(o);","else if(j.s==='serve'){ if(arrived(a,dt,.45,o.c)){ serve(o);")
RP("function doTrash(a,j,dt){ if(!trash.includes(j.t)){a.job=null;return;} if(moveAgent(a,dt)){",
   "function doTrash(a,j,dt){ if(!trash.includes(j.t)){a.job=null;return;} if(arrived(a,dt,.7)){")
RP(" if(j.s==='clean'){ if(moveAgent(a,dt)) finishClean(a,j); return; }\n if(j.s==='trash') doTrash(a,j,dt);",
   " if(j.s==='clean'){ if(arrived(a,dt,.6,j.table)) finishClean(a,j); return; }\n if(j.s==='trash') doTrash(a,j,dt);")
# remise à zéro après le mode déco
RP("for(const a of crew){ a.job=null; a.carry=null; a.path=[];","for(const a of crew){ a.job=null; a.carry=null; a.path=[]; a.v=0; a.pause=0; a.arr=0;")
RP("  c.path=[]; c.fx=c.x; c.fy=c.y;","  c.path=[]; c.fx=c.x; c.fy=c.y; c.v=0; c.pause=0;\n  if(c.st==='enter'||c.st==='look') c.st='walkIn';")
RP("const dirt=Math.min(1.5,trash.length*.15+dn*.08);","const dirt=Math.min(1,trash.length*.08+dn*.03);")
RP("if(Math.random()<.15){ const opts=","if(Math.random()<.1){ const opts=")

# ---------- v0.5 : groupes, discussions, téléphone, coins sans traverser les meubles ----------
RP("while(a.path.length>1&&Math.hypot(a.path[0][0]-a.fx,a.path[0][1]-a.fy)<.3){ const q=a.path.shift(); a.x=q[0]; a.y=q[1]; }",
   "while(a.path.length>1&&Math.hypot(a.path[0][0]-a.fx,a.path[0][1]-a.fy)<.3){ const n0=a.path[0], n1=a.path[1], gx=a.x+n1[0]-n0[0], gy=a.y+n1[1]-n0[1]; if((gx!==n0[0]||gy!==n0[1])&&inRest(gx,gy)&&blocked(gx,gy)) break; const q=a.path.shift(); a.x=q[0]; a.y=q[1]; }")

a=js.index("function spawnCust(pass){"); b=js.index("function leave(c){")
js=js[:a]+"""const TOPICS=['💬','😂','☕','⚽','🎬','❤️','🐶','✈️','🎵','📸','🌞','🍷','👍','🏖️','🎮','📚'];
function spawnCust(pass){}
const ACTIVE=['wait','eat','walkIn','enter','look'];
function grpCheck(g){
 if(!g) return;
 const alive=g.m.filter(m=>!m.dead&&(ACTIVE.includes(m.st)||m.st==='done'));
 if(alive.length&&alive.every(m=>m.st==='done')) alive.forEach((m,i)=>{ leave(m); m.pause+=i*.4; m.hop=.5; });
}
function updGroups(dt){
 const gs=new Set(); for(const c of custs) if(c.grp) gs.add(c.grp);
 for(const g of gs){
  for(const m of g.m){ m.talk=false; m.lookAt=null; }
  if(g.laugh>0) g.laugh-=dt;
  const seated=g.m.filter(m=>!m.dead&&m.sitting&&(m.st==='wait'||m.st==='eat'||m.st==='done'));
  if(seated.length<2) continue;
  g.tt=(g.tt||0)-dt;
  if(g.tt<=0||!seated.includes(g.spk)||!seated.includes(g.lis)){
   const prev=g.spk; g.spk=pick(seated.filter(m=>m!==prev))||seated[0]; g.lis=pick(seated.filter(m=>m!==g.spk)); g.tt=rnd(1.6,3.4);
   if(Math.random()<.45){ g.spk.say=pick(TOPICS); g.spk.sayT=1.7; }
   if(Math.random()<.12){ g.laugh=1.3; seated.forEach(m=>m.hop=.35); floatAt(g.spk.fx,g.spk.fy,'😂'); }
  }
  for(const m of seated) m.lookAt=m===g.spk?g.lis:g.spk;
  g.spk.talk=true;
 }
 for(const c of custs) if(c.sayT>0){ c.sayT-=dt; if(c.sayT<=0) c.say=null; }
}
"""+js[b:]
RP(" for(const c of custs) updCust(c,dt);"," for(const c of custs) updCust(c,dt);\n updGroups(dt);")
RP("c.order=null; leave(c);\n}","c.order=null;\n if(c.grp&&c.grp.m.some(m=>m!==c&&!m.dead&&ACTIVE.includes(m.st))){ c.st='done'; c.hop=0; } else leave(c);\n grpCheck(c.grp);\n}")
RP("addSat(0); c.mood='angry'; floatAt(c.fx,c.fy,'😠','#e5484d'); leave(c);","addSat(0); c.mood='angry'; c.phone=false; floatAt(c.fx,c.fy,'😠','#e5484d'); leave(c); grpCheck(c.grp);")
RP("c.st='eat'; c.t=rnd(7,10); c.headT=0;","c.st='eat'; c.t=rnd(7,10); c.headT=0; c.phone=false;")
RP("  case 'wait': c.pat-=dt*patRate(); c.lt=(c.lt||0)+dt; c.headT=c.pat<40?Math.sin(c.lt*2.2)*.75:Math.sin(c.lt*.45+c.id)*.35; if(c.pat<=0) angry(c); break;",
"""  case 'wait': c.pat-=dt*patRate(); c.lt=(c.lt||0)+dt;
   if(!c.lookAt){ c.phT=(c.phT??rnd(1.5,4))-dt; if(c.phT<=0){ c.phone=!c.phone&&c.pat>40; c.phT=c.phone?rnd(4,8):rnd(2,4); } } else c.phone=false;
   c.headT=c.phone?0:c.pat<40?Math.sin(c.lt*2.2)*.75:Math.sin(c.lt*.45+c.id)*.35;
   if(c.pat<=0) angry(c); break;
  case 'done': if(!c.grp) leave(c); break;""")
RP("  case 'look':\n   c.t-=dt; c.lt+=dt;","  case 'look':\n   c.t-=dt; c.lt+=dt;\n   if(c.grp&&c.grp.lead!==c&&!c.grp.lead.dead&&(c.grp.lead.st==='enter'||c.grp.lead.st==='look')) c.t=Math.max(c.t,.5+c.grp.m.indexOf(c)*.3);")
RP("  } else if(c.st==='wait'||c.st==='eat'){","  } else if(c.st==='wait'||c.st==='eat'||c.st==='done'){")

# ---------- v0.6 : file d'attente équitable, banquettes, places du personnel ----------
RP(" chair4:{"," wbench:{n:'Banquette d\\'attente',cat:'Chaises',p:160,d:1.5,u:2,kind:'wbench',col:'#d0643f'},\n chair4:{")
RP("const k=kindOf(f); if(!['chair','stove','counter','table'].includes(k)) continue;","const k=kindOf(f); if(!['chair','stove','counter','table','wbench'].includes(k)) continue;")
RP("if(k==='chair'&&dx&&dy) continue;","if((k==='chair'||k==='wbench')&&dx&&dy) continue;")
RP("function buildCrew(){ crew=state.staff.map(mkCrew); }","""function buildCrew(){ crew=state.staff.map(mkCrew); assignHomes(); for(const a of crew){ a.x=a.fx=a.home[0]; a.y=a.fy=a.home[1]; a.rot=a.rotT=Math.PI/4; } }
function assignHomes(){
 const used=new Set([DX+','+(S-1)]), cnt={chef:0,waiter:0,cleaner:0};
 for(const a of crew){
  const r=a.s.role, i=cnt[r]++;
  const an=state.furn.filter(f=>kindOf(f)===(r==='chef'?'stove':r==='waiter'?'counter':'none'));
  let ax=DX, ay=S-2;
  if(an.length){ const f=an[i%an.length]; ax=f.x; ay=f.y; }
  else if(r==='waiter'){ const f=state.furn.find(f=>kindOf(f)==='stove'); if(f){ ax=f.x+1; ay=f.y+1; } }
  let best=null,bd=1e9;
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ if(blocked(x,y)||used.has(x+','+y)) continue; let d=Math.hypot(x-ax,y-ay); if(r!=='cleaner'&&Math.abs(x-ax)+Math.abs(y-ay)<1) d+=5; for(const [dx,dy] of D4){ const f=fAt(x+dx,y+dy); if(f&&kindOf(f)==='chair') d+=1.5; } if(d<bd){ bd=d; best=[x,y]; } }
  a.home=best||[DX,S-2]; used.add(a.home.join());
 }
}""")
RP("   else { const h=state.furn.find(f=>kindOf(f)===(r==='chef'?'stove':'counter')); if(h) p=pathToFurn(a,h); }",
   "   else if(a.home&&(a.x!==a.home[0]||a.y!==a.home[1])) p=bfs(a.x,a.y,(X,Y)=>X===a.home[0]&&Y===a.home[1],false);")
RP("function update(dt){","let homeT=0;\nfunction update(dt){\n homeT-=dt; if(homeT<=0){ homeT=2; assignHomes(); }")
RP("  if(state.menu.length&&active<seatCount()+3) spawnCust(false);","  if(state.menu.length&&active<seatCount()+waitSpots().length+3) spawnCust(false);")
RP("function leave(c){\n if(c.sitting) c.pause=.55;","function leave(c){\n if(c.sitting) c.pause=.55;\n c.wspot=null;")

# arrivée : la file d'attente passe avant les nouveaux venus
a=js.index("function spawnCust(pass){"); b=js.index("const ACTIVE=")
js=js[:a]+"""let qSeq=0;
function waitSpots(){
 const out=[];
 for(const f of state.furn) if(kindOf(f)==='wbench') for(const o of [-.22,.22]) out.push({key:'w'+f.id+'_'+o,x:f.x,y:f.y,ox:o,inside:true});
 for(const bx of [DX-2,DX+2]) if(bx>=0&&bx<S) for(const o of [-.22,.22]) out.push({key:'b'+bx+'_'+o,x:bx,y:S,ox:o,inside:false});
 return out;
}
function freeWaitSpot(c){
 const used=new Set(custs.filter(k=>k!==c&&k.wspot).map(k=>k.wspot.key));
 const sp=waitSpots().filter(s=>!used.has(s.key)).sort((a,b)=>(b.inside-a.inside));
 for(const s of sp){ const p=bfs(c.x,c.y,(x,y)=>x===s.x&&y===s.y,s.inside); if(p) return {s,p}; }
 return null;
}
function joinQueue(c,qT){
 c.st='queue'; c.qT=qT; c.pat=100; c.sitting=false;
 const w=freeWaitSpot(c);
 if(w){ c.wspot=w.s; c.path=w.p; }
 else { c.wspot=null; const qx=clamp(DX+ri(-3,3),0,S-1); c.path=bfs(c.x,c.y,(x,y)=>x===qx&&y===S,false)||[]; }
}
function isQueueFront(c){ return !custs.some(k=>k.st==='queue'&&(!k.grp||k.grp.lead===k)&&k.qT<c.qT); }
function routeToSeat(m,i){
 const s=m.seat, wasSit=m.sitting; m.sitting=false; m.wspot=null;
 if(m.y<S-1){ m.path=bfs(m.x,m.y,(x,y)=>x===s.x&&y===s.y,true)||[]; m.st='walkIn'; m.hes=0; }
 else { m.path=bfs(m.x,m.y,(x,y)=>x===DX&&y===S-1,false)||[]; m.st='enter'; }
 m.pause=(wasSit?.5:0)+i*.5;
}
function admitFromQueue(c){
 if(c.grp){ const ms=c.grp.m.filter(m=>m.st==='queue'); const seats=groupSeats(ms.length); if(!seats) return false;
  ms.forEach((m,i)=>{ m.seat=seats[i]; m.sx=seats[i].x; m.sy=seats[i].y; routeToSeat(m,i); }); return true; }
 const tk=takenSeats();
 const seats=state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&seatTable(f));
 for(const s of seats){ if(bfs(DX,S-1,(x,y)=>x===s.x&&y===s.y,true)){ c.seat=s; c.sx=s.x; c.sy=s.y; routeToSeat(c,0); return true; } }
 return false;
}
function groupSeats(n){
 const tk=takenSeats();
 const tables=state.furn.filter(f=>kindOf(f)==='table').sort(()=>Math.random()-.5);
 for(const t of tables){
  const ch=state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&seatTable(f)===t);
  if(ch.length<n) continue;
  const ok=ch.filter(s=>bfs(DX,S-1,(x,y)=>x===s.x&&y===s.y,true));
  if(ok.length>=n) return ok.slice(0,n);
 }
 return null;
}
function spawnCust(pass){
 const sx=Math.random()<.5?0:S-1, ex=Math.random()<.5?0:S-1;
 const mk=()=>mkAgent({id:uid++,kind:'cust',look:randLook(),x:sx,y:S+1,fx:sx,fy:S+1,speed:rnd(.95,1.15),ex,pat:100});
 if(!pass){
  const qn=custs.filter(k=>k.st==='queue').length, cap=waitSpots().length+3, queued=qn>0;
  const r=Math.random(), gs=r<.45?1:r<.84?2:r<.95?3:4;
  if(gs>1){ const seats=queued?null:groupSeats(gs);
   if(seats||qn+gs<=cap){ const g={id:uid++,m:[]}, sp=rnd(.95,1.1), qT=qSeq++;
    for(let i=0;i<gs;i++){ const c=mk(); c.speed=sp; c.grp=g; g.m.push(c); custs.push(c);
     if(seats){ const s=seats[i]; c.seat=s; c.sx=s.x; c.sy=s.y; c.st='enter'; c.path=bfs(c.x,c.y,(x,y)=>x===DX&&y===S-1,false)||[]; }
     else joinQueue(c,qT);
     c.pause+=i*.6; }
    g.lead=g.m[0]; return; } }
  const c=mk();
  if(!queued&&tryGetSeat(c)){ custs.push(c); return; }
  if(qn<cap){ joinQueue(c,qSeq++); custs.push(c); return; }
 }
 const c=mk(); c.st='pass'; c.ex=S-1-sx; c.path=bfs(c.x,c.y,(x,y)=>x===c.ex&&y===S+1,false)||[]; if(!c.path.length) return; custs.push(c);
}
"""+js[b:]

a=js.index("  case 'queue':"); b=js.index("  case 'enter':")
js=js[:a]+"""  case 'queue':{
   const arr=moveAgent(c,dt);
   if(arr&&c.wspot&&!c.sitting){ c.sitting=true; c.rotT=0; }
   c.lt=(c.lt||0)+dt;
   if(arr) c.headT=c.sitting?Math.sin(c.lt*.5+c.id)*.5:Math.sin(c.lt*.8)*.6;
   if(arr&&!c.wspot) c.rotT=Math.PI;
   c.pat-=dt*(c.sitting?(c.wspot&&c.wspot.inside?.5:.8):1.4);
   const lead=c.grp?c.grp.lead:c;
   if(lead===c){ c.tt=(c.tt||0)-dt; if(c.tt<=0){ c.tt=.6; if(isQueueFront(c)&&admitFromQueue(c)) break; } }
   if(c.st==='queue'&&lead===c&&c.pat<=0){ addSat(20); for(const m of (c.grp?c.grp.m:[c])) if(m.st==='queue'){ floatAt(m.fx,m.fy,'😤'); leave(m); } }
   break;}
"""+js[b:]
RP("  } else if(c.st==='leave'||c.st==='pass'){","  } else if(c.st==='queue'){ c.sitting=false; joinQueue(c,c.qT);\n  } else if(c.st==='leave'||c.st==='pass'){")
RP("function groupSeats(n){","function maxTableCap(){ let m=0; for(const t of state.furn) if(kindOf(t)==='table'){ const n=state.furn.filter(f=>kindOf(f)==='chair'&&seatTable(f)===t).length; if(n>m) m=n; } return m; }\nfunction groupSeats(n){")
RP("  const r=Math.random(), gs=r<.45?1:r<.84?2:r<.95?3:4;","  const r=Math.random(), gs=Math.min(maxTableCap(),r<.45?1:r<.84?2:r<.95?3:4);")
RP(" if(c.grp){ const ms=c.grp.m.filter(m=>m.st==='queue'); const seats=groupSeats(ms.length); if(!seats) return false;",
   " if(c.grp){ const ms=c.grp.m.filter(m=>m.st==='queue');\n  if(ms.length>maxTableCap()){ const g=c.grp; for(const m of g.m) m.grp=null; return false; }\n  const seats=groupSeats(ms.length); if(!seats) return false;")

# ---------- v0.7 : couleurs chaudes, file plus courte ----------
RP("{n:'Damier crème',a:'#f6e9d0',b:'#ecd9b8',","{n:'Damier miel',a:'#f6dcae',b:'#eac58a',")
RP("{n:'Crème',c:'#f8ecd6',w:'#e0c49b',","{n:'Abricot',c:'#f6d3a4',w:'#b8743f',")
RP("kind:'table',col:'#c98b52',cloth:'#ffffff'}","kind:'table',col:'#b8743f',cloth:'#fff0d6'}")
RP("{n:'Carreaux bleus',a:'#e3f0fa',b:'#c3dbf0',","{n:'Tomettes',a:'#e0915f',b:'#cf7a4a',")
RP("  if(state.menu.length&&active<seatCount()+waitSpots().length+3) spawnCust(false);","  if(state.menu.length&&active<seatCount()+waitSpots().length+1) spawnCust(false);")
RP("const qn=custs.filter(k=>k.st==='queue').length, cap=waitSpots().length+3,","const qn=custs.filter(k=>k.st==='queue').length, cap=waitSpots().length+1,")

# ---------- v0.10 : s'asseoir et se relever de façon naturelle ----------
RP("function leave(c){\n if(c.sitting) c.pause=.55;","""const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function seatSeq(c,P,A,face){ c.seatGeo={P,A,face}; c.seq={ph:'walk',t:0}; c.sitK=0; }
function updSeat(c,dt){
 const q=c.seq, G=c.seatGeo, ch=G.ch;
 if(q.ph==='walk'){
  const dx=G.A[0]-c.fx, dy=G.A[1]-c.fy, d=Math.hypot(dx,dy);
  if(d<.02){ q.ph='turn'; c.moving=false; c.v=0; c.rotT=G.face; return false; }
  const want=Math.atan2(dx,dy); if(c.rot===undefined) c.rot=want; c.rot=lerpAng(c.rot,want,dt*7); c.rotT=c.rot;
  const al=Math.max(0,Math.cos(angDiff(c.rot,want)));
  c.v=Math.min(c.speed*Math.max(.35,Math.min(1,d/.45))*al*al,(c.v||0)+dt*c.speed*2); c.moving=c.v>.04; c.ph+=dt*c.v*6.2;
  const st=Math.min(d,c.v*dt); c.fx+=dx/d*st; c.fy+=dy/d*st; return false;
 }
 c.moving=false;
 if(q.ph==='turn'){ c.rot=lerpAng(c.rot,G.face,dt*6); c.rotT=G.face; if(Math.abs(angDiff(c.rot,G.face))<.1){ q.ph=ch?'pull':'sit'; q.t=0; } return false; }
 if(q.ph==='pull'){ q.t=Math.min(1,q.t+dt/.7); c.reachW=Math.min(1,q.t*3); ch.pull=ease(Math.max(0,(q.t-.25)/.75)); if(q.t>=1){ q.ph='sit'; q.t=0; } return false; }
 if(q.ph==='sit'){
  q.t=Math.min(1,q.t+dt/.95); const e=ease(q.t), S1=ch?G.P0:G.P;
  c.fx=G.A[0]+(S1[0]-G.A[0])*e; c.fy=G.A[1]+(S1[1]-G.A[1])*e; c.sitK=e; c.lean=Math.sin(q.t*Math.PI)*.4;
  c.reachW=ch?Math.max(0,1-q.t*1.25):0;
  if(q.t>=1){ c.lean=0; c.reachW=0; if(ch){ q.ph='scoot'; q.t=0; return false; } c.seq=null; c.sitK=1; return true; }
  return false;
 }
 q.t=Math.min(1,q.t+dt/.7); const e=ease(q.t);
 c.fx=G.P0[0]+(G.P[0]-G.P0[0])*e; c.fy=G.P0[1]+(G.P[1]-G.P0[1])*e; ch.pull=1-e; c.scoot=Math.sin(q.t*Math.PI);
 if(q.t>=1){ c.seq=null; c.sitK=1; c.scoot=0; ch.pull=0; return true; }
 return false;
}
function startStand(c,after,i){ c.sitting=false; c.seq={ph:'stand',t:0,sub:null}; c.st='standUp'; c.after=after; c.afterI=i||0; c.headT=0; }
function updStand(c,dt){
 const q=c.seq, G=c.seatGeo, ch=G.ch&&state.furn.includes(G.ch)?G.ch:null;
 if(!q.sub) q.sub=ch?'back':'up';
 c.moving=false;
 const fin=()=>{ c.seq=null; c.sitK=0; c.lean=0; c.reachW=0; c.scoot=0; if(ch) ch.pull=0; c.seatGeo=null; return true; };
 if(q.sub==='back'){ q.t=Math.min(1,q.t+dt/.6); const e=ease(q.t); c.fx=G.P[0]+(G.P0[0]-G.P[0])*e; c.fy=G.P[1]+(G.P0[1]-G.P[1])*e; ch.pull=e; c.scoot=Math.sin(q.t*Math.PI); if(q.t>=1){ q.sub='up'; q.t=0; c.scoot=0; } return false; }
 if(q.sub==='up'){ q.t=Math.min(1,q.t+dt/.85); const e=ease(q.t), S0=ch?G.P0:G.P; c.fx=S0[0]+(G.A[0]-S0[0])*e; c.fy=S0[1]+(G.A[1]-S0[1])*e; c.sitK=1-e; c.lean=Math.sin(q.t*Math.PI)*.4; c.reachW=ch?Math.max(0,(q.t-.35)/.65):0; if(q.t>=1){ c.lean=0; if(ch){ q.sub='push'; q.t=0; return false; } return fin(); } return false; }
 q.t=Math.min(1,q.t+dt/.6); ch.pull=1-ease(Math.min(1,q.t/.8)); c.reachW=q.t<.75?1:(1-q.t)/.25;
 if(q.t>=1) return fin();
 return false;
}
function chairGeo(c,ch){
 const t=seatTable(ch), d=[t.x-ch.x,t.y-ch.y], P=[ch.x+d[0]*.27,ch.y+d[1]*.27], P0=[ch.x+d[0]*.02,ch.y+d[1]*.02];
 let best=null,bs=1e9;
 for(const l of [[d[1],-d[0]],[-d[1],d[0]]]){ const lx=ch.x+l[0], ly=ch.y+l[1]; let sc=Math.hypot(c.fx-lx,c.fy-ly); if(!inRest(lx,ly)||blocked(lx,ly)) sc+=3; if(sc<bs){ bs=sc; best=l; } }
 return {P,P0,A:[P0[0]+best[0]*.5,P0[1]+best[1]*.5],face:Math.atan2(d[0],d[1]),ch};
}
function leave(c){
 if(c.sitting&&c.seatGeo&&!c.seq){ c.wspot=null; startStand(c,'leave'); return; }
 if(c.sitting) c.pause=.55;""")
RP("""   if(c.hes&&c.path.length<=c.hes){ c.hes=0; c.pause=rnd(.7,1.2); c.headT=Math.random()<.5?.8:-.8; }
   if(moveAgent(c,dt)){ if(c.seat&&c.x===c.seat.x&&c.y===c.seat.y) sitDown(c); else leave(c); }""",
"""   if(c.seq){ if(updSeat(c,dt)) sitDown(c); break; }
   if(c.hes&&c.path.length<=c.hes){ c.hes=0; c.pause=rnd(.7,1.2); c.headT=Math.random()<.5?.8:-.8; }
   if(c.pause<=0&&c.seat&&c.path.length===1&&c.path[0][0]===c.seat.x&&c.path[0][1]===c.seat.y&&seatTable(c.seat)){
    const g=chairGeo(c,c.seat); c.path=[]; c.x=c.seat.x; c.y=c.seat.y; seatSeq(c,g.P,g.A,g.face); Object.assign(c.seatGeo,{P0:g.P0,ch:g.ch}); break; }
   if(moveAgent(c,dt)){ if(c.seat&&c.x===c.seat.x&&c.y===c.seat.y) sitDown(c); else leave(c); }""")
RP("""  case 'enter':
   if(moveAgent(c,dt)){""","""  case 'standUp':
   if(c.pause>0){ c.pause-=dt; break; }
   if(!c.seq||updStand(c,dt)){
    const rx=Math.round(c.fx), ry=Math.round(c.fy); if(inWalk(rx,ry)&&!blocked(rx,ry)){ c.x=rx; c.y=ry; }
    c.seq=null; c.seatGeo=null; c.sitK=0;
    if(c.after==='route') routeToSeat(c,c.afterI); else leave(c);
   }
   break;
  case 'enter':
   if(moveAgent(c,dt)){""")
RP("""   const arr=moveAgent(c,dt);
   if(arr&&c.wspot&&!c.sitting){ c.sitting=true; c.rotT=0; }
   c.lt=(c.lt||0)+dt;
   if(arr) c.headT=""","""   let arr=false;
   if(c.seq){ if(updSeat(c,dt)) c.sitting=true; }
   else { arr=moveAgent(c,dt); if(arr&&c.wspot&&!c.sitting&&!c.seatGeo){ const s=c.wspot; seatSeq(c,[s.x+s.ox,s.y],[s.x+s.ox,s.y+.48],0); arr=false; } }
   c.lt=(c.lt||0)+dt;
   if(arr||c.sitting) c.headT=""")
RP("""function routeToSeat(m,i){
 const s=m.seat, wasSit=m.sitting; m.sitting=false; m.wspot=null;""","""function routeToSeat(m,i){
 if(m.sitting&&m.seatGeo&&!m.seq){ m.wspot=null; startStand(m,'route',i); m.pause=i*.35; return; }
 const s=m.seat, wasSit=m.sitting; m.sitting=false; m.wspot=null;""")
RP(" for(const s of sp){ const p=bfs(c.x,c.y,(x,y)=>x===s.x&&y===s.y,s.inside); if(p) return {s,p}; }",
   " for(const s of sp){ const fy=s.y+1, front=!s.inside||(inRest(s.x,fy)&&!blocked(s.x,fy)); const gx=s.x, gy=front?fy:s.y; const p=bfs(c.x,c.y,(x,y)=>x===gx&&y===gy,!front); if(p) return {s,p}; }")
RP("  c.path=[]; c.fx=c.x; c.fy=c.y; c.v=0; c.pause=0;\n  if(c.st==='enter'||c.st==='look') c.st='walkIn';",
   "  c.path=[]; c.fx=c.x; c.fy=c.y; c.v=0; c.pause=0;\n  if(c.st==='standUp'){ c.st='leave'; c.sitting=false; }\n  if(c.seq||c.st==='queue'||c.st==='leave'){ c.seq=null; c.seatGeo=null; c.sitK=0; c.lean=0; c.reachW=0; c.scoot=0; }\n  if(c.st==='enter'||c.st==='look') c.st='walkIn';")
RP("   if(!seatOK){ if(c.order){c.order.cancel=true;c.order=null;} const n=nearestFree(c.x,c.y); c.x=c.fx=n[0]; c.y=c.fy=n[1]; leave(c); }",
   "   if(!seatOK){ if(c.order){c.order.cancel=true;c.order=null;} c.sitting=false; c.seatGeo=null; c.sitK=0; const n=nearestFree(c.x,c.y); c.x=c.fx=n[0]; c.y=c.fy=n[1]; leave(c); }\n   else if(c.seatGeo){ c.fx=c.seatGeo.P[0]; c.fy=c.seatGeo.P[1]; }")
RP(" for(const t of trash) t.tg=null;"," for(const t of trash) t.tg=null;\n for(const f of state.furn) if(f.pull) f.pull=0;")

# ---------- v0.12 : moins de monde, évitement entre personnages, attente à l'écart de la porte ----------
RP(" const vmax=a.speed*(rem<.7?Math.max(.3,rem/.7):1)*al*al;"," let vmax=a.speed*(rem<.7?Math.max(.3,rem/.7):1)*al*al;\n if(a.slowTo!==undefined) vmax=Math.min(vmax,a.slowTo);")
RP("  spawnT=rnd(.75,1.25)*9/(.6+rating*.4);","  spawnT=rnd(.8,1.3)*11/(.6+rating*.4);")
RP("  if(state.menu.length&&active<seatCount()+waitSpots().length+1) spawnCust(false);","  if(state.menu.length&&active<seatCount()+queueCap()) spawnCust(false);")
RP(" passT-=dt; if(passT<=0){ passT=rnd(5,12); spawnCust(true); }"," passT-=dt; if(passT<=0){ passT=rnd(12,24); spawnCust(true); }")
RP("const qn=custs.filter(k=>k.st==='queue').length, cap=waitSpots().length+1,","const qn=custs.filter(k=>k.st==='queue').length, cap=queueCap(),")
RP("   else { c.path=bfs(c.x,c.y,(x,y)=>x===DX&&y===S-1,false)||[]; c.st='enter'; }","   else { const g=lookGoal(c); c.path=bfs(c.x,c.y,(x,y)=>x===g[0]&&y===g[1],false)||[]; c.st='enter'; }")
RP(" else { m.path=bfs(m.x,m.y,(x,y)=>x===DX&&y===S-1,false)||[]; m.st='enter'; }"," else { const g=lookGoal(m); m.path=bfs(m.x,m.y,(x,y)=>x===g[0]&&y===g[1],false)||[]; m.st='enter'; }")
RP("c.st='enter'; c.path=bfs(c.x,c.y,(x,y)=>x===DX&&y===S-1,false)||[]; }","c.st='enter'; const g=lookGoal(c); c.path=bfs(c.x,c.y,(x,y)=>x===g[0]&&y===g[1],false)||[]; }")
RP(" updGroups(dt);"," updGroups(dt);\n avoidPass(dt);")
RP("let qSeq=0;","""let qSeq=0;
// file d'attente proportionnée au restaurant : places assises d'attente, sans dépasser la moitié des places à table
function queueCap(){ return Math.max(1,Math.min(waitSpots().length,Math.ceil(seatCount()*.5))); }
// là où l'on s'arrête pour regarder la salle : juste à côté de la porte, pas dans le passage
function lookGoal(c){
 const used=new Set(custs.filter(k=>k!==c&&(k.st==='enter'||k.st==='look')&&k.lookAt0).map(k=>k.lookAt0.join()));
 const cands=[[DX-1,S-2],[DX+1,S-2],[DX-1,S-1],[DX+1,S-1],[DX-2,S-2],[DX+2,S-2],[DX,S-2]];
 const L0=c.grp&&c.grp.m[0]; if(L0&&L0!==c&&L0.lookAt0){ const L=L0.lookAt0; cands.unshift([L[0]-1,L[1]],[L[0]+1,L[1]],[L[0],L[1]-1]); }
 for(const g of cands){ if(inRest(g[0],g[1])&&!blocked(g[0],g[1])&&!used.has(g.join())&&!(g[0]===DX&&g[1]===S-1)){ c.lookAt0=g; return g; } }
 c.lookAt0=[DX,S-1]; return c.lookAt0;
}
// évitement : on se décale pour se croiser, on ralentit derrière quelqu'un, on s'écarte quand on est arrêté
function avoidPass(dt){
 const ag=[]; for(const c of custs) if(!c.dead&&!c.sitting&&!c.seq) ag.push(c); for(const a of crew) ag.push(a);
 for(const a of ag){ a._tx=0; a._ty=0; a.slowTo=undefined; }
 for(let i=0;i<ag.length;i++) for(let j=i+1;j<ag.length;j++){
  const a=ag[i], b=ag[j];
  let dx=(b.fx+(b.offX||0))-(a.fx+(a.offX||0)), dy=(b.fy+(b.offY||0))-(a.fy+(a.offY||0)), d=Math.hypot(dx,dy);
  if(d>.62) continue; if(d<1e-3){ dx=.01; dy=.007; d=.012; }
  const ov=(.62-d)/.62, nx=dx/d, ny=dy/d;
  for(const [p,q,sg] of [[a,b,1],[b,a,-1]]){
   const rx=nx*sg, ry=ny*sg, hx=Math.sin(p.rot||0), hy=Math.cos(p.rot||0), front=hx*rx+hy*ry;
   if(p.moving){
    const px=-hy, py=hx, side=(px*rx+py*ry)>0?-1:1, s=ov*.5*(front>0?1:.35);
    p._tx+=px*side*s; p._ty+=py*side*s;
    if(front>.7&&d<.52){ const same=Math.sin(q.rot||0)*hx+Math.cos(q.rot||0)*hy;
     if(!q.moving) p.slowTo=Math.min(p.slowTo??9,d<.36?.18:.55); else if(same>.5) p.slowTo=Math.min(p.slowTo??9,Math.max(.2,(q.v||0)*.92)); }
   } else { p._tx-=rx*ov*.2; p._ty-=ry*ov*.2; }
  }
 }
 const k=Math.min(1,dt*4);
 for(const a of ag){ const tx=clamp(a._tx,-.34,.34), ty=clamp(a._ty,-.34,.34); a.offX=(a.offX||0)+(tx-(a.offX||0))*k; a.offY=(a.offY||0)+(ty-(a.offY||0))*k; }
 for(const c of custs) if(c.sitting||c.seq){ c.offX=(c.offX||0)*.8; c.offY=(c.offY||0)*.8; }
}""")

# ---------- v0.13 : bloc cuisine réservé + circuit de préparation des commandes ----------
RP(" stove:{n:'Fourneau',cat:'Cuisine',p:200,d:0,u:1,kind:'stove',col:'#dfe3e8',speed:1},\n stove2:{n:'Fourneau pro',cat:'Cuisine',p:650,d:1,u:4,kind:'stove',col:'#f4d35e',speed:1.6},\n counter:{n:'Comptoir',cat:'Cuisine',p:150,d:0,u:1,kind:'counter',col:'#a8693a'},",
""" stove:{n:'Gazinière',cat:'Cuisine',p:200,d:0,u:1,kind:'stove',col:'#dfe3e8',speed:1},
 stove2:{n:'Gazinière pro',cat:'Cuisine',p:650,d:1,u:4,kind:'stove',col:'#f4d35e',speed:1.6},
 oven:{n:'Four',cat:'Cuisine',p:300,d:0,u:1,kind:'oven',col:'#d9dde2',speed:1},
 oven2:{n:'Four à pizza',cat:'Cuisine',p:900,d:2,u:5,kind:'oven',col:'#b5523b',speed:1.6},
 prep:{n:'Table de préparation',cat:'Cuisine',p:150,d:0,u:1,kind:'prep',col:'#c9cfd6',speed:1},
 prep2:{n:'Plan de travail inox',cat:'Cuisine',p:450,d:0,u:4,kind:'prep',col:'#e3e7ec',speed:1.5},
 sink:{n:'Évier',cat:'Cuisine',p:120,d:1,u:1,kind:'sink',col:'#c9cfd6'},
 counter:{n:'Comptoir passe-plat',cat:'Cuisine',p:150,d:0,u:1,kind:'counter',col:'#a8693a'},""")
RP("""function defaultLayout(){
 const L=[['stove',1,0],['stove',2,0],['counter',4,0],['plant',0,0],['plant',7,0],""","""function defaultLayout(){
 const L=[['plant',7,0],['flowers',4,0],""")
RP(" state.staff.push(mkStaffData('chef'),mkStaffData('waiter'));\n}"," state.staff.push(mkStaffData('chef'),mkStaffData('waiter'));\n setSize(); installKitchen(); state.kit=1;\n}")
# zone cuisine
RP("function bfs(sx,sy,isGoal,goalPass){","""const KITCHEN_KINDS=['stove','oven','prep','sink','counter'], DINING_KINDS=['table','chair','wbench'];
const kitW=()=>S>=12?6:S>=10?5:4, kitD=()=>3;
const inKitchen=(x,y)=>x>=0&&y>=0&&x<kitW()&&y<kitD();
const kitchenEdge=(x,y)=>inKitchen(x,y)&&((x+1<S&&!inKitchen(x+1,y))||(y+1<S&&!inKitchen(x,y+1)));
function zoneErr(t,x,y){
 const k=FURN[t].kind;
 if(KITCHEN_KINDS.includes(k)&&!inKitchen(x,y)) return 'Le matériel de cuisine va dans la cuisine.';
 if(k==='counter'&&!kitchenEdge(x,y)) return 'Le passe-plat doit être au bord de la cuisine, côté salle.';
 if(DINING_KINDS.includes(k)&&inKitchen(x,y)) return 'La cuisine est réservée au matériel de cuisine.';
 return null;
}
function relocate(f,out){
 let best=null,bd=1e9;
 for(let y=0;y<S;y++) for(let x=0;x<S;x++){ if(fAt(x,y)||(x===DX&&y===S-1)||zoneErr(f.t,x,y)||(out&&inKitchen(x,y))) continue; const d=Math.hypot(x-f.x,y-f.y); if(d<bd){ bd=d; best=[x,y]; } }
 if(best){ f.x=best[0]; f.y=best[1]; rebuildOcc(); return true; }
 return false;
}
function fixZones(){
 let refund=0;
 for(const f of [...state.furn]) if(zoneErr(f.t,f.x,f.y)&&!relocate(f)){ state.furn=state.furn.filter(g=>g!==f); refund+=FURN[f.t].p; }
 rebuildOcc(); if(refund) state.coins+=refund;
}
function installKitchen(){
 let refund=0;
 state.furn=state.furn.filter(f=>{ if(KITCHEN_KINDS.includes(kindOf(f))){ refund+=FURN[f.t].p; return false; } return true; });
 rebuildOcc();
 for(const f of [...state.furn]) if(inKitchen(f.x,f.y)&&!relocate(f,true)){ state.furn=state.furn.filter(g=>g!==f); refund+=FURN[f.t].p; }
 const kw=kitW(), kd=kitD();
 for(const [t,x,y] of [['sink',0,0],['stove',1,0],['stove',2,0],['oven',3,0],['prep',0,1],['counter',kw-1,kd-1],['counter',kw-2,kd-1]]) if(!fAt(x,y)){ state.furn.push({id:state.nid++,t,x,y}); rebuildOcc(); }
 return refund;
}
function bfs(sx,sy,isGoal,goalPass,zone){
 const kz=zone==='k';""")
RP("   if(!doorOK(cx,cy,nx,ny)) continue;\n   const g=isGoal(nx,ny);","   if(!doorOK(cx,cy,nx,ny)) continue;\n   if(kz!==inKitchen(nx,ny)) continue;\n   const g=isGoal(nx,ny);")
RP("function pathToFurn(a,f){ return bfs(a.x,a.y,(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-f.x)<=1&&Math.abs(y-f.y)<=1&&!(x===f.x&&y===f.y),false); }",
   "const zoneOf=a=>a&&a.s&&a.s.role==='chef'?'k':'d';\nfunction pathToFurn(a,f){ return bfs(a.x,a.y,(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-f.x)<=1&&Math.abs(y-f.y)<=1&&!(x===f.x&&y===f.y),false,zoneOf(a)); }")
# vérification de l'agencement : salle accessible depuis la porte, cuisine d'un seul tenant
a=js.index("function layoutOK(){"); b=js.index("/* ---------------- PROGRESSION")
js=js[:a]+"""function layoutOK(){
 if(blocked(DX,S-1)) return false;
 const flood=(sx,sy,ok)=>{ const seen=new Set([sx+','+sy]), q=[[sx,sy]]; while(q.length){ const [x,y]=q.pop(); for(const [dx,dy] of D4){ const nx=x+dx, ny=y+dy, k=nx+','+ny; if(!seen.has(k)&&ok(nx,ny)){ seen.add(k); q.push([nx,ny]); } } } return seen; };
 const seen=flood(DX,S-1,(x,y)=>inRest(x,y)&&!inKitchen(x,y)&&!blocked(x,y));
 const kfree=[]; for(let y=0;y<kitD();y++) for(let x=0;x<kitW();x++) if(!blocked(x,y)) kfree.push([x,y]);
 const kseen=kfree.length?flood(kfree[0][0],kfree[0][1],(x,y)=>inKitchen(x,y)&&!blocked(x,y)):new Set();
 if(kseen.size!==kfree.length) return false;
 const near=(f,set,diag)=>{ for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){ if(!dx&&!dy) continue; if(!diag&&dx&&dy) continue; if(set.has((f.x+dx)+','+(f.y+dy))) return true; } return false; };
 for(const f of state.furn){
  const k=kindOf(f);
  if(['stove','oven','prep','counter'].includes(k)&&!near(f,kseen,true)) return false;
  if(k==='counter'&&!near(f,seen,true)) return false;
  if((k==='chair'||k==='wbench')&&!near(f,seen,false)) return false;
  if(k==='table'&&!near(f,seen,true)) return false;
 }
 return true;
}

"""+js[b:]
# placement : zones
RP("function canPlace(x,y,ignore){\n if(!inRest(x,y)) return false;","function canPlace(x,y,ignore,type){\n if(!inRest(x,y)) return false;\n if(type&&zoneErr(type,x,y)) return false;")
RP("function placeCheck(x,y,mover,type){\n if(!canPlace(x,y,mover)) return 'Case occupée ou hors du restaurant.';","function placeCheck(x,y,mover,type){\n const ze=zoneErr(type||mover.t,x,y); if(ze) return ze;\n if(!canPlace(x,y,mover)) return 'Case occupée ou hors du restaurant.';")
RP("  if(k==='stove'&&state.furn.filter(f=>kindOf(f)==='stove').length<=1){ toast('Il te faut au moins un fourneau !'); return; }",
   "  if(k==='stove'&&state.furn.filter(f=>kindOf(f)==='stove').length<=1){ toast('Il te faut au moins une gazinière !'); return; }\n  if(k==='counter'&&state.furn.filter(f=>kindOf(f)==='counter').length<=1){ toast('Il te faut au moins un passe-plat !'); return; }")
# personnel : chacun dans sa zone
RP("  const an=state.furn.filter(f=>kindOf(f)===(r==='chef'?'stove':r==='waiter'?'counter':'none'));","  const an=state.furn.filter(f=>kindOf(f)===(r==='chef'?'stove':r==='waiter'?'counter':'none')), zk=r==='chef';")
RP("  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ if(blocked(x,y)||used.has(x+','+y)) continue;","  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ if(blocked(x,y)||used.has(x+','+y)||zk!==inKitchen(x,y)) continue;")
RP("   else if(a.home&&(a.x!==a.home[0]||a.y!==a.home[1])) p=bfs(a.x,a.y,(X,Y)=>X===a.home[0]&&Y===a.home[1],false);",
   "   else if(a.home&&(a.x!==a.home[0]||a.y!==a.home[1])) p=bfs(a.x,a.y,(X,Y)=>X===a.home[0]&&Y===a.home[1],false,zoneOf(a));")
RP("   if(r==='cleaner'){ const x=ri(0,S-1),y=ri(0,S-1); if(!blocked(x,y)) p=bfs(","   if(r==='cleaner'){ const x=ri(0,S-1),y=ri(0,S-1); if(!blocked(x,y)&&!inKitchen(x,y)) p=bfs(")
RP("function updStaff(a,dt){\n a.moving=false; a.speed=1.25*staffMul(a);","""function updStaff(a,dt){
 a.moving=false; a.speed=1.25*staffMul(a);
 if(!a.job&&!a.path.length&&(a.s.role==='chef')!==inKitchen(a.x,a.y)){ assignHomes(); if(a.home){ a.x=a.fx=a.home[0]; a.y=a.fy=a.home[1]; sparkle(a.x,a.y,5,'#ffffff'); } }""")
RP("if(a.job&&a.job.stove) stoveBusy.delete(a.job.stove.id);","if(a.job&&a.job.st) stoveBusy.delete(a.job.st.id);")
RP("state.size=s; for(const c of custs) if(c.order) c.order.cancel=true; custs=[]; orders=[]; items=[]; setSize(); resetSim();","state.size=s; for(const c of custs) if(c.order) c.order.cancel=true; custs=[]; orders=[]; items=[]; setSize(); fixZones(); assignHomes(); resetSim();")
RP(" if(!loaded) defaultLayout();\n rebuildOcc(); buildCrew();"," if(!loaded) defaultLayout();\n rebuildOcc();\n if(!state.kit){ const r=installKitchen(); state.kit=1; state.coins+=r; fixZones(); queueModal(()=>({title:'Nouvelle cuisine !',html:`<div class=\"hero\">👨‍🍳</div><p class=\"center\">Ton restaurant a maintenant une <b>vraie cuisine</b> : gazinières, four, table de préparation, évier et passe-plat.</p><p class=\"center sub\">Seuls les cuisiniers y entrent. Les serveurs récupèrent les plats au passe-plat. L'ancien matériel t'a été remboursé${r?` (+${r} 🪙)`:''}.</p><p class=\"center\"><button class=\"b\" data-a=\"close\">Voir la cuisine</button></p>`})); }\n else fixZones();\n buildCrew();")
# circuit de préparation : découpe -> cuisson gaz ou four -> passe-plat
a=js.index("function chefAI(a,dt){"); b=js.index("function dirtyJob(a){")
js=js[:a]+"""const STEPS={salade:[['prep',4]],soupe:[['prep',2],['stove',3.5]],omelette:[['prep',1.5],['stove',3.5]],pizza:[['prep',3],['oven',4.5]],burger:[['prep',2.5],['stove',5.5]],
 pates:[['prep',2],['stove',5]],steak:[['prep',2],['stove',7]],poulet:[['prep',3],['oven',7]],sushi:[['prep',9]],curry:[['prep',3],['stove',7]],ramen:[['prep',4],['stove',7]],
 crepe:[['prep',2],['stove',3]],glace:[['prep',4]],tarte:[['prep',3],['oven',4.5]],gateau:[['prep',3],['oven',5.5]]};
const STEP_IC={prep:'🔪',stove:'🔥',oven:'♨️'};
function dishSteps(id){ const d=DISHM[id]; return (STEPS[id]||[['prep',d.t*.4],['stove',d.t*.6]]).map(([k,t])=>({k,t})); }
function stationKinds(k){ const has=kk=>state.furn.some(f=>kindOf(f)===kk); if(k==='oven'&&!has('oven')) return ['stove']; if(k==='prep'&&!has('prep')) return ['counter','stove']; return [k]; }
function chefAI(a,dt){
 const j=a.job;
 if(!j){
  const o=orders.find(o=>o.st==='wait'); if(!o) return;
  o.st='cooking'; o.chef=a; o.steps=dishSteps(o.dish); o.si=0; a.job={o,s:'next'}; return;
 }
 const o=j.o;
 if(o.cancel){ if(j.st) stoveBusy.delete(j.st.id); a.job=null; a.carry=null; return; }
 if(j.s==='next'){
  if(o.si>=o.steps.length){
   const r=bestPath(a,state.furn.filter(f=>kindOf(f)==='counter'&&orders.filter(x=>x.st==='ready'&&x.at===f).length<3));
   if(r){ j.s='bring'; j.ctr=r.f; a.path=r.p; a.carry=DISHM[o.dish].e; }
   return;
  }
  const ks=stationKinds(o.steps[o.si].k);
  const r=bestPath(a,state.furn.filter(f=>ks.includes(kindOf(f))&&!stoveBusy.has(f.id)));
  if(!r) return;
  stoveBusy.add(r.f.id); j.st=r.f; j.s='go'; a.path=r.p; a.carry=o.si>0?'🥘':null; return;
 }
 if(j.s==='go'){ if(arrived(a,dt,.25,j.st)){ j.s='work'; a.carry=null; const sp=FURN[j.st.t].speed||1; j.T=j.t=o.steps[o.si].t/sp/staffMul(a); } return; }
 if(j.s==='work'){ j.t-=dt; if(j.t<=0){ stoveBusy.delete(j.st.id); j.st=null; o.si++; j.s='next'; if(o.si>=o.steps.length) gainStaff(a); } return; }
 if(j.s==='bring'){ if(arrived(a,dt,.4,j.ctr)){ o.st='ready'; o.at=j.ctr; a.carry=null; a.job=null; sfx('bell'); } }
}
"""+js[b:]
RP("  else if(k==='bad'){","  else if(k==='bell'){ tone(1568,0,.25,'sine',.06); tone(2093,.05,.4,'sine',.04); }\n  else if(k==='bad'){")
RP("Les cuisiniers préparent les plats aux fourneaux puis les posent sur un comptoir où les serveurs viennent les chercher.",
   "Ce matériel se pose dans la cuisine (zone carrelée). Chaque plat passe par la table de préparation 🔪, puis la gazinière 🔥 ou le four ♨️, avant d\\'être déposé sur le passe-plat 🛎️ au bord de la cuisine, où les serveurs viennent le chercher.")
RP("const extra=f.kind==='stove'?`Cuisson ×${f.speed}`:","const extra=f.kind==='stove'||f.kind==='oven'||f.kind==='prep'?`Vitesse ×${f.speed}`:")
