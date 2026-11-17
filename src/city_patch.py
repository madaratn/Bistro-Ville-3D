# v0.16 : quartier vivant — les clients viennent du quartier et y retournent, l'entrée reste dégagée

a=js.index("function spawnCust(pass){"); b=js.index("const ACTIVE=")
js=js[:a]+r"""// une seule tablée à l'accueil à la fois : les suivants attendent assis sur les bancs
function entranceBusy(){ return custs.some(c=>!c.dead&&(c.st==='enter'||c.st==='look'||c.st==='host')); }
function spawnCust(pass,opt){
 const sx=opt?opt.sx:(Math.random()<.5?0:S-1), ex=Math.random()<.5?0:S-1;
 let mi=0;
 const mk=()=>{ const i=mi++; const c=mkAgent({id:opt&&opt.ids?opt.ids[i]:uid++,kind:'cust',look:opt&&opt.looks?opt.looks[i]:randLook(),x:sx,y:S+1,fx:sx,fy:S+1,speed:rnd(.95,1.15),ex,pat:100}); if(opt){ c.pause=(opt.delays&&opt.delays[i])||0; c.spawnWait=i>0; } return c; };
 if(!pass){
  const qn=custs.filter(k=>k.st==='queue').length, cap=queueCap(), queued=qn>0||entranceBusy();
  const r=Math.random(), gs=opt?Math.min(maxTableCap()||1,opt.looks.length):Math.min(maxTableCap(),r<.45?1:r<.84?2:r<.95?3:4);
  if(gs>1){ const seats=queued?null:groupSeats(gs);
   if(seats||qn+gs<=cap){ const g={id:uid++,m:[]}, sp=rnd(.95,1.1), qT=qSeq++;
    for(let i=0;i<gs;i++){ const c=mk(); c.speed=sp; c.grp=g; g.m.push(c); custs.push(c);
     if(seats){ const s=seats[i]; c.seat=s; c.sx=s.x; c.sy=s.y; c.st='enter'; const gl=lookGoal(c); c.path=bfs(c.x,c.y,(x,y)=>x===gl[0]&&y===gl[1],false)||[]; }
     else joinQueue(c,qT);
     if(!opt){ c.pause+=i*.6; c.spawnWait=i>0; } }
    g.lead=g.m[0]; return true; }
   if(opt) return false; }
  const c=mk();
  if(!queued&&tryGetSeat(c)){ custs.push(c); return true; }
  if(qn<cap){ joinQueue(c,qSeq++); custs.push(c); return true; }
  if(opt) return false;
 }
 const c=mk(); c.st='pass'; c.ex=S-1-sx; c.path=bfs(c.x,c.y,(x,y)=>x===c.ex&&y===S+1,false)||[]; if(!c.path.length) return false; custs.push(c); return true;
}
"""+js[b:]
# la file dehors : uniquement sur les bancs (au plus une personne debout s'il n'y a aucun banc)
RP("function queueCap(){ return Math.max(1,Math.min(waitSpots().length,Math.ceil(seatCount()*.5))); }",
   "function queueCap(){ return Math.max(1,Math.min(waitSpots().length,Math.ceil(seatCount()*.6))); }")
RP("if(isQueueFront(c)&&admitFromQueue(c)) break;","if(isQueueFront(c)&&!entranceBusy()&&admitFromQueue(c)) break;")
# les clients arrivent du quartier (et plus de passants qui traversent le trottoir du resto)
RP("  const active=custs.filter(c=>c.st!=='pass'&&c.st!=='leave').length;\n  if(state.menu.length&&active<seatCount()+queueCap()) spawnCust(false);",
   "  const active=custs.filter(c=>c.st!=='pass'&&c.st!=='leave').length+pendingResto();\n  if(state.menu.length&&active<seatCount()+queueCap()&&!spawnRestoParty()) spawnCust(false);")
RP(" passT-=dt; if(passT<=0){ passT=rnd(12,24); spawnCust(true); }"," cityUpdate(dt);")
RP("  case 'pass': case 'leave': if(moveAgent(c,dt)) c.dead=true; break;",
   "  case 'pass': case 'leave': if(moveAgent(c,dt)){ c.dead=true; if(c.y===S+1&&(c.x===0||c.x===S-1)) walkerFromCust(c); } break;")
RP("garden:[null,null,null,null],staff:[],store:{},bar:0,svc:0,bin:0,","garden:[null,null,null,null],staff:[],store:{},bar:0,svc:0,bin:0,city:0,")
RP(" autoPlaceNear('bin'); state.bin=1;\n}"," autoPlaceNear('bin'); state.bin=1; state.city=1;\n}")
RP(" const NEWS=[];",""" const NEWS=[];
 if(!state.city){ state.city=1; NEWS.push(`<div class="row"><div class="emo">🏙️</div><div class="info"><div class="t">Un quartier vivant</div><div class="sub">Un bar avec terrasse, un cinéma et une galerie marchande entourent ton resto. Les passants vont et viennent, et tes clients arrivent du quartier puis y repartent. À l'entrée, une seule tablée est accueillie à la fois : les autres patientent sur les bancs.</div></div></div>`); }""")
