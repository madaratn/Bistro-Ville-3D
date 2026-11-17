# v0.32 : file d'attente qui ne bloque plus
# 1) un groupe s'installe sur une portion libre d'une longue tablée (plus besoin qu'elle soit entièrement vide)
RP(""" for(const t of tables){ if(done.has(t.id)) continue; const cl=tableCluster(t); cl.forEach(c=>done.add(c.id)); if(cl.length<2||cl.some(c=>tableBusy(c))) continue;
  const ch=state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&cl.includes(seatTable(f))).filter(s2=>bfs(DX,S-1,(x,y)=>x===s2.x&&y===s2.y,true));
  if(ch.length>=n){ ch.sort((a,b)=>(a.x+a.y*.01)-(b.x+b.y*.01)); return ch.slice(0,n); } }
 return null;""",""" { const free=new Set(tables.map(t=>t.id)), okSeat=new Map(); let best=null;
  const chairsOf=t=>{ if(!okSeat.has(t.id)) okSeat.set(t.id,state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&seatTable(f)===t&&bfs(DX,S-1,(x,y)=>x===f.x&&y===f.y,true))); return okSeat.get(t.id); };
  for(const t of tables){ const run=[t], seen=new Set([t.id]); let ch=[...chairsOf(t)];
   for(let i=0;i<run.length&&ch.length<n;i++) for(const [dx,dy] of D4){ const f=fAt(run[i].x+dx,run[i].y+dy); if(f&&kindOf(f)==='table'&&free.has(f.id)&&!seen.has(f.id)&&ch.length<n){ seen.add(f.id); run.push(f); ch=ch.concat(chairsOf(f)); } }
   if(ch.length>=n&&run.length>1&&(!best||run.length<best.k)){ best={k:run.length,ch}; if(run.length===2) break; } }
  if(best){ return best.ch.slice(0,n); } }
 return null;""")
# 2) si la tête de file ne trouve pas de place, les suivants passent ; un groupe qui attend trop se répartit
RP("if(isQueueFront(c)&&!entranceBusy()&&admitFromQueue(c)) break;",
 """if(!entranceBusy()){
      if(isQueueFront(c)){ if(admitFromQueue(c)) break; c.qB=(c.qB||0)+.6;
        if(c.grp&&c.qB>7){ const g=c.grp, n=g.m.filter(m=>m.st==='queue').length; if(freeSeats().length>=n){ for(const m of g.m){ m.grp=null; m.qB=0; } } } }
      else if(!custs.some(k=>k.st==='queue'&&(!k.grp||k.grp.lead===k)&&k.qT<c.qT&&!(k.qB>1))&&admitFromQueue(c)) break;
     }""")
# 3) l'entrée laisse passer deux tablées à la fois (trois en coup de feu)
RP("function entranceBusy(){ return custs.some(c=>!c.dead&&(c.st==='enter'||c.st==='look'||c.st==='host')); }",
 "function entranceBusy(){ const s=new Set(); for(const c of custs) if(!c.dead&&(c.st==='enter'||c.st==='look'||c.st==='host')) s.add(c.grp?'g'+c.grp.id:c.id); return s.size>=(rush?3:2); }")
# 4) on n'attend pas le serveur indéfiniment à l'accueil
RP("   else if(c.hostT>10||!hostOn()) goSeat(c);\n   if(c.hostBy&&c.hostT>16) goSeat(c);","   else if(c.hostT>(rush?4:7)||!hostOn()) goSeat(c);\n   if(c.hostBy&&c.hostT>12) goSeat(c);")
# 5) garde-fou : personne ne reste coincé devant la porte
RP("function updCust(c,dt){\n c.age=(c.age||0)+dt;","function updCust(c,dt){\n if(c.st==='enter'||c.st==='look'||c.st==='host'){ c.entT=(c.entT||0)+dt; if(c.entT>16&&c.st==='enter') c.ghostT=Math.max(c.ghostT||0,1); if(c.entT>28){ c.entT=0; if(c.st==='enter'){ c.x=DX; c.y=S-1; c.fx=DX; c.fy=S-1; } c.pause=0; goSeat(c); } } else c.entT=0;\n c.age=(c.age||0)+dt;")
