# v0.15 : circulation organisée (on réserve la case suivante, on attend que l'autre passe, on s'écarte poliment)
#         + frigo posable au bord de la cuisine

# ---------- frigo au bord de la cuisine ----------
RP(" if(DINING_KINDS.includes(k)&&inKitchen(x,y)) return 'La cuisine est réservée au matériel de cuisine.';",
   " if(k==='fridge'&&inKitchen(x,y)&&!kitchenEdge(x,y)) return 'Le frigo se pose dans la salle ou au bord de la cuisine, porte côté salle.';\n if(k!=='fridge'&&DINING_KINDS.includes(k)&&inKitchen(x,y)) return 'La cuisine est réservée au matériel de cuisine.';")
RP(" if(k==='counter'||k==='dish') return ({nw:0,ne:3,sw:1,se:2})[state.kz?state.kz.c:'nw'];",
   """ if(k==='counter'||k==='dish') return ({nw:0,ne:3,sw:1,se:2})[state.kz?state.kz.c:'nw'];
 if(k==='fridge'&&inKitchen(f.x,f.y)){ const y1=KR.y0+KR.d, x1=KR.x0+KR.w; if(f.y===y1-1&&y1<S) return 0; if(f.x===x1-1&&x1<S) return 1; if(f.x===KR.x0&&KR.x0>0) return 3; return 2; }""")
# après un changement de cuisine, tout objet mal placé part dans la réserve
RP(" rebuildOcc();\n if(!layoutOK()) return fail('Ça bloquerait le passage !');\n return {stored};",
   " rebuildOcc();\n for(const f of [...state.furn]) if(zoneErr(f.t,f.x,f.y)) toStore(f);\n if(!layoutOK()) return fail('Ça bloquerait le passage !');\n return {stored};")
# nouvelle partie : le frigo se met au bord de la cuisine, à côté du passe-plat
RP(" setSize(); installKitchen(); state.kit=1; autoPlace('fridge');"," setSize(); installKitchen(); state.kit=1; autoPlaceEdge('fridge')||autoPlace('fridge');")
RP("Bar:'Le frigo sert eau, sodas, jus et bière. Le bar prépare les cocktails (niv. 5).',",
   "Bar:'Le frigo se pose dans la salle ou au bord de la cuisine. Le bar prépare les cocktails (niv. 5).',")
# l'entrée reste dégagée : personne ne s'arrête juste devant la porte
RP(" const cands=[[DX-1,S-2],[DX+1,S-2],[DX-1,S-1],[DX+1,S-1],[DX-2,S-2],[DX+2,S-2],[DX,S-2]];",
   " const cands=[[DX-1,S-2],[DX+1,S-2],[DX-1,S-1],[DX+1,S-1],[DX-2,S-2],[DX+2,S-2],[DX-2,S-1],[DX+2,S-1]].sort((p,q)=>svcNear(p)-svcNear(q));")
RP("function lookGoal(c){","function svcNear(p){ let n=0; for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){ const f=fAt(p[0]+dx,p[1]+dy); if(f&&['table','chair','fridge','bar','counter','dish'].includes(kindOf(f))) n++; } return n; }\nfunction lookGoal(c){")

# ---------- circulation ----------
a=js.index("function moveAgent(a,dt){"); b=js.index("function arrived(a,dt,d,f){")
js=js[:a]+r"""// --- circulation : chacun réserve la case où il va ; on attend, on contourne ou on s'écarte ---
let TRF=[];
function buildTraffic(){ TRF=[]; for(const c of custs){ if(c.spawnWait&&!(c.pause>0)) c.spawnWait=false; if(!c.dead&&!c.spawnWait&&!(c.sitting&&!c.seq)) TRF.push(c); } for(const a of crew) TRF.push(a); }
function prio(a){ if(a.s){ if(a.carry||a.tub===2) return 4; return a.job?2.5:1; } return a.st==='pass'?0:3; }
function outranks(a,b){ const pa=prio(a), pb=prio(b); return pa!==pb?pa>pb:(a.id||a.s&&a.s.id||0)<(b.id||b.s&&b.s.id||0); }
function whoBlocks(a,x,y){
 for(const b of TRF){ if(b===a||b.ghostT>0) continue;
  if(b.claim&&b.claim[0]===x&&b.claim[1]===y) return b;
  const dx=b.fx-x, dy=b.fy-y;
  if(dx*dx+dy*dy<.36){ if(b.moving&&b.claim&&!(b.claim[0]===a.x&&b.claim[1]===a.y)&&!(b.claim[0]===x&&b.claim[1]===y)&&Math.hypot(b.fx-a.fx,b.fy-a.fy)>.5) continue; return b; } }
 return null;
}
const DUMMYF={t:'plant',x:-9,y:-9};
function bfsAvoid(a,dest,gp,cells){
 const added=[]; for(const k of cells){ if(k!==dest[0]+','+dest[1]&&!occ.has(k)){ occ.set(k,DUMMYF); added.push(k); } }
 const p=bfs(a.x,a.y,(x,y)=>x===dest[0]&&y===dest[1],gp,zoneOf(a));
 for(const k of added) occ.delete(k); return p;
}
function standingCells(a){ const s=[]; for(const b of TRF) if(b!==a&&!b.moving&&!(b.path&&b.path.length)) s.push(Math.round(b.fx)+','+Math.round(b.fy)); return s; }
function replanAround(a,extra){
 if(!a.path.length) return false; const dest=a.path[a.path.length-1], gp=inRest(dest[0],dest[1])&&blocked(dest[0],dest[1]);
 const cells=standingCells(a); if(extra) cells.push(extra);
 const p=bfsAvoid(a,dest,gp,cells); if(p&&p.length&&p.length<=a.path.length+8){ a.path=p; a.claim=null; return true; } return false;
}
function zoneCellOK(a,x,y){ const z=a.s&&a.s.role==='chef'; return z?inKitchen(x,y):!inKitchen(x,y); }
// s'écarter d'une case pour laisser passer « other », puis reprendre son chemin
function sideStep(a,other){
 if(a.seq||a.sitting) return false;
 const op=new Set([Math.round(other.fx)+','+Math.round(other.fy)]); if(other.claim) op.add(other.claim[0]+','+other.claim[1]);
 for(const p of (other.path||[]).slice(0,10)) op.add(p[0]+','+p[1]);
 const sx=a.x, sy=a.y, prev=new Map([[sx+','+sy,null]]), q=[[sx,sy,0]]; let goal=null;
 while(q.length&&!goal){ const [cx,cy,dd]=q.shift(); if(dd>=7) continue;
  for(const [dx,dy] of D4){ const x=cx+dx, y=cy+dy, k=x+','+y; if(prev.has(k)) continue;
   if(!inWalk(x,y)||blocked(x,y)||!doorOK(cx,cy,x,y)||!zoneCellOK(a,x,y)) continue;
   const o=whoBlocks(a,x,y); if(o&&o!==other) continue;
   prev.set(k,cx+','+cy);
   if(!op.has(k)){ goal=k; break; }
   q.push([x,y,dd+1]); } }
 if(!goal) return false;
 const path=[]; for(let k=goal;k&&k!==sx+','+sy;k=prev.get(k)){ const [x,y]=k.split(',').map(Number); path.unshift([x,y]); }
 const dest=a.detour?a.detour.dest:(a.path.length?a.path[a.path.length-1]:[sx,sy]);
 a.path=path; a.claim=null; a.waitT=0; a.detour={dest,gp:inRest(dest[0],dest[1])&&blocked(dest[0],dest[1]),t:rnd(.5,.8),ref:a.path,from:other};
 if(a.s&&!other.s) a.wave=.8;   // « après vous »
 return true;
}
function trafficOK(a,n,dt){
 if(a.ghostT>0){ a.ghostT-=dt; a.claim=[n[0],n[1]]; return true; }
 if(a.claim&&a.claim[0]===n[0]&&a.claim[1]===n[1]) return true;
 const b=whoBlocks(a,n[0],n[1]);
 if(!b){ a.claim=[n[0],n[1]]; a.waitT=0; a.blockBy=null; a.tried=0; a.side2=0; return true; }
 a.blockBy=b; a.waitT=(a.waitT||0)+dt;
 if(dt>0&&a.st==='pass'&&a.waitT>.7){ a.ghostT=.9; a.waitT=0; return false; }
 if(dt>0){
  const bStill=!b.moving&&!(b.path&&b.path.length);
  // face à face : le moins prioritaire s'écarte, sinon l'autre
  if(b.blockBy===a&&a.waitT>.2){ if(!outranks(a,b)){ if(sideStep(a,b)) return false; } else if(b.waitT>.6&&!sideStep(b,a)&&a.waitT>.8) sideStep(a,b); }
  // quelqu'un est arrêté sur la case
  if(bStill){
   if(a.path.length===1&&a.waitT>.5&&(a.s||a.st==='enter')){ a.path=[]; a.claim=null; return false; }   // on s'arrête juste avant sa destination
   if(b.s&&(!b.job||b.detour)&&a.waitT>.3&&!b.seq) sideStep(b,a);                // un employé au repos se pousse
   else if(a.waitT>.5&&!a.tried){ a.tried=1; if(replanAround(a,n[0]+','+n[1])) return false; }
  }
  if(a.waitT>2&&!a.side2){ a.side2=1; if(!(b.blockBy===a&&outranks(a,b))&&sideStep(a,b)) return false; }
  if(a.waitT>3&&a.tried<2){ a.tried=2; if(replanAround(a,n[0]+','+n[1])) return false; }
  if(a.waitT>6){ a.ghostT=1.4; a.waitT=0; }
 }
 return false;
}
function moveCore(a,dt){
 if(a.pause>0){ a.pause-=dt; a.v=0; a.moving=false; return false; }
 if(!a.path.length){ a.v=0; a.claim=null; return true; }
 while(a.path.length>1&&Math.hypot(a.path[0][0]-a.fx,a.path[0][1]-a.fy)<.3){ const n0=a.path[0], n1=a.path[1], gx=a.x+n1[0]-n0[0], gy=a.y+n1[1]-n0[1]; if((gx!==n0[0]||gy!==n0[1])&&inRest(gx,gy)&&blocked(gx,gy)) break; if(!trafficOK(a,n1,0)) break; const q=a.path.shift(); a.x=q[0]; a.y=q[1]; }
 if(!a.path.length) return false;
 const n=a.path[0], dx=n[0]-a.fx, dy=n[1]-a.fy, d=Math.hypot(dx,dy);
 if(!trafficOK(a,n,dt)){ a.v=0; a.moving=false; return false; }
 if(a.ghostT<=0){ const hx=dx/(d||1), hy=dy/(d||1);
  for(const b of TRF){ if(b===a||b.ghostT>0) continue; const rx=b.fx-a.fx, ry=b.fy-a.fy, ah=rx*hx+ry*hy; if(ah<=0||ah>.5) continue; const lat=Math.abs(rx*hy-ry*hx); if(lat>=.32) continue; const towards=b.moving&&(Math.sin(b.rot||0)*hx+Math.cos(b.rot||0)*hy)<-.3; if(towards) continue; a.psT=(a.psT||0)+dt; if(a.psT<1.2){ a.v=0; a.moving=false; return false; } a.ghostT=.5; a.psT=0; break; } a.psT=0; }
 if(d<.001){ a.fx=a.x=n[0]; a.fy=a.y=n[1]; a.path.shift(); if(!a.path.length){ a.v=0; a.moving=false; return true; } return false; }
 const want=Math.atan2(dx,dy); if(a.rot===undefined) a.rot=want;
 a.rot=lerpAng(a.rot,want,dt*7); a.rotT=a.rot;
 const al=Math.max(0,Math.cos(angDiff(a.rot,want)));
 const rem=d+(a.path.length-1);
 let vmax=a.speed*(rem<.7?Math.max(.3,rem/.7):1)*al*al;
 if(a.slowTo!==undefined) vmax=Math.min(vmax,a.slowTo);
 a.v=Math.min(vmax,(a.v||0)+dt*a.speed*2);
 a.moving=a.v>.04; a.ph+=dt*a.v*6.2; a.headT=(a.headT||0)*Math.max(0,1-dt*3);
 const st=a.v*dt;
 if(d<=st){ a.fx=a.x=n[0]; a.fy=a.y=n[1]; a.path.shift(); if(!a.path.length){ a.v=0; a.moving=false; return true; } return false; }
 a.fx+=dx/d*st; a.fy+=dy/d*st; return false;
}
function moveAgent(a,dt){
 if(a.detour&&a.path!==a.detour.ref) a.detour=null;     // un nouveau trajet a été donné entre-temps
 const r=moveCore(a,dt);
 if(!a.detour) return r;
 if(!r) return false;
 const D=a.detour; D.t-=dt; a.v=0; a.moving=false;
 if(D.from&&!D.from.dead) a.rotT=Math.atan2(D.from.fx-a.fx,D.from.fy-a.fy);
 if(D.t>0) return false;
 a.detour=null;
 if(a.x===D.dest[0]&&a.y===D.dest[1]) return true;
 const p=bfs(a.x,a.y,(x,y)=>x===D.dest[0]&&y===D.dest[1],D.gp,zoneOf(a));
 if(p&&p.length){ a.path=p; return false; }
 return true;
}
"""+js[b:]
RP("function update(dt){\n simT+=dt;","function update(dt){\n simT+=dt; buildTraffic();")
RP(" for(const a of crew){ a.job=null; a.carry=null; a.path=[]; a.tab=0; a.tub=0; a.wipe=0;"," for(const a of custs.concat(crew)){ a.claim=null; a.detour=null; a.waitT=0; a.ghostT=0; a.blockBy=null; }\n for(const a of crew){ a.job=null; a.carry=null; a.path=[]; a.tab=0; a.tub=0; a.wipe=0;")

# chacun sa place dans la file dehors
RP("else { c.wspot=null; const qx=clamp(DX+ri(-3,3),0,S-1); c.path=bfs(c.x,c.y,(x,y)=>x===qx&&y===S,false)||[]; }",
   "else { c.wspot=null; const taken=new Set(custs.filter(k=>k!==c&&k.st==='queue'&&!k.wspot).map(k=>k.qx)); const xs=[]; for(let d=1;d<S;d++) for(const x of [DX-d,DX+d]) if(x>=0&&x<S&&!taken.has(x)) xs.push(x); const qx=xs.length?xs[0]:clamp(DX+ri(-3,3),0,S-1); c.qx=qx; c.path=bfs(c.x,c.y,(x,y)=>x===qx&&y===S,false)||[]; }")
# un employé au repos qui se retrouve sur quelqu'un se décale
RP("function updStaff(a,dt){\n a.moving=false;","function updStaff(a,dt){\n if(!a.job&&!a.path.length&&!a.detour){ const o=TRF.find(b=>b!==a&&!b.moving&&Math.hypot(b.fx-a.fx,b.fy-a.fy)<.45); if(o) sideStep(a,o); }\n a.moving=false;")
# séparation douce : deux personnes trop proches s'écartent un peu (jamais l'une dans l'autre)
RP("  if(d>.62) continue; if(d<1e-3){ dx=.01; dy=.007; d=.012; }","  if(d>.62) continue; if(d<1e-3){ dx=.01; dy=.007; d=.012; }\n  if(d<.46){ const pu=(.46-d)*.6, ux=dx/d, uy=dy/d; a._tx-=ux*pu; a._ty-=uy*pu; b._tx+=ux*pu; b._ty+=uy*pu; }")

# les employés au repos se tiennent dans un coin tranquille, pas au milieu du passage
RP("if(r!=='cleaner'&&Math.abs(x-ax)+Math.abs(y-ay)<1) d+=5; for(const [dx,dy] of D4){ const f=fAt(x+dx,y+dy); if(f&&kindOf(f)==='chair') d+=1.5; }",
   "if(r!=='cleaner'&&Math.abs(x-ax)+Math.abs(y-ay)<1) d+=5; for(const [dx,dy] of D4){ const f=fAt(x+dx,y+dy); if(f&&kindOf(f)==='chair') d+=1.5; if(inRest(x+dx,y+dy)&&!blocked(x+dx,y+dy)) d+=.55; } if(x===DX&&y>=S-3) d+=3;")
# frigo / retour plonge posés d'office : de préférence sur le bord de la cuisine qui donne sur la salle
RP("const d=Math.min(9,...ctr.map(c=>Math.abs(c.x-x)+Math.abs(c.y-y))); cand.push([x,y,d]);","const d=Math.min(9,...ctr.map(c=>Math.abs(c.x-x)+Math.abs(c.y-y)))-(y===KR.y0+KR.d-1&&KR.y0+KR.d<S?.5:0); cand.push([x,y,d]);")
# on choisit une place libre à côté d'un meuble (pas celle où quelqu'un se tient déjà)
RP("function pathToFurn(a,f){ return bfs(a.x,a.y,(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-f.x)<=1&&Math.abs(y-f.y)<=1&&!(x===f.x&&y===f.y),false,zoneOf(a)); }",
   "function standingAt(x,y,a){ for(const b of TRF) if(b!==a&&!b.moving&&!(b.path&&b.path.length)&&Math.abs(b.fx-x)<.45&&Math.abs(b.fy-y)<.45) return true; return false; }\nfunction pathToFurn(a,f){ const ok=(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-f.x)<=1&&Math.abs(y-f.y)<=1&&!(x===f.x&&y===f.y); return bfs(a.x,a.y,(x,y)=>ok(x,y)&&!standingAt(x,y,a),false,zoneOf(a))||bfs(a.x,a.y,ok,false,zoneOf(a)); }")
# un employé qui s'est écarté termine son détour même sans travail
RP("  if(a.path.length) moveAgent(a,dt);","  if(a.path.length||a.detour) moveAgent(a,dt);")
# les clients qui arrivent ensemble apparaissent l'un après l'autre (jamais superposés au bord de l'écran)
RP("     c.pause+=i*.6; }","     c.pause+=i*.6; c.spawnWait=i>0; }")

# une nouvelle recrue arrive par la porte (le cuisinier va directement en cuisine)
RP("state.staff.push(s); crew.push(mkCrew(s));","state.staff.push(s); crew.push(mkCrew(s)); { assignHomes(); const a=crew[crew.length-1]; if(s.role==='chef'&&a.home){ a.x=a.fx=a.home[0]; a.y=a.fy=a.home[1]; } else { a.x=a.fx=DX; a.y=a.fy=S; a.idle=3; } }")
