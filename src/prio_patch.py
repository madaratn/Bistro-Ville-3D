# v0.19 : priorité aux clients dans les déplacements, moins de monde dehors
RP("function prio(a){ if(a.s){ if(a.carry||a.tub===2) return 4; return a.job?2.5:1; } return a.st==='pass'?0:3; }",
   "function prio(a){ if(a.s){ if(a.carry||a.tub===2) return 3; return a.job?2.5:1; } return a.st==='pass'?0:5; }")
RP(" if(a.claim&&a.claim[0]===n[0]&&a.claim[1]===n[1]) return true;\n const b=whoBlocks(a,n[0],n[1]);",
   """ if(a.claim&&a.claim[0]===n[0]&&a.claim[1]===n[1]) return true;
 if(a.s&&dt>0){
  // le personnel laisse le client finir de s'asseoir ou de se lever...
  for(const c of custs){ if(c.dead||!c.seq||c.y>=S) continue; if(Math.hypot(c.fx-n[0],c.fy-n[1])<1.05&&Math.hypot(c.fx-a.fx,c.fy-a.fy)>.3){ a.yieldT=(a.yieldT||0)+dt; if(a.yieldT<5) return false; } }
  // ...et laisse passer le client dont le chemin croise le sien
  for(const c of TRF){ if(c.s||c===a||!c.moving||!c.path||c.ghostT>0) continue; if(Math.hypot(c.fx-a.fx,c.fy-a.fy)>1.8) continue; const p0=c.path[0], p1=c.path[1]; if((p0&&p0[0]===n[0]&&p0[1]===n[1])||(p1&&p1[0]===n[0]&&p1[1]===n[1])){ a.yieldT=(a.yieldT||0)+dt; if(a.yieldT<3){ a.blockBy=c; return false; } } }
  a.yieldT=0;
 }
 const b=whoBlocks(a,n[0],n[1]);""")
RP("function queueCap(){ return Math.max(1,Math.min(waitSpots().length,Math.ceil(seatCount()*.6))); }",
   "function queueCap(){ return Math.max(1,Math.min(4,waitSpots().length,Math.ceil(seatCount()*.4))); }")
RP("if(state.menu.length&&active<seatCount()+queueCap()&&!spawnRestoParty()) spawnCust(false);",
   "if(state.menu.length&&active<seatCount()+queueCap()&&!(pendingResto()>0&&custs.some(c=>c.st==='queue'))&&!spawnRestoParty()) spawnCust(false);")
