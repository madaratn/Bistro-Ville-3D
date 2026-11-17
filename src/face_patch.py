# v0.39 : chaque employé se tourne exactement vers ce qu'il fait (poste, table, client, bac...)
n=js.count("function updStaff(a,dt){"); assert n==1,n
js=js.replace("function updStaff(a,dt){","""function updStaff(a,dt){ updStaff0(a,dt);
 if(!a.moving&&!(a.path&&a.path.length)){ const tg=staffTarget(a); if(tg){ const dx=tg[0]-a.fx, dy=tg[1]-a.fy, d=Math.hypot(dx,dy); if(d>.15&&d<2.6) a.rotT=Math.atan2(dx,dy); a.idleF=0; }
  else if(!a.job&&!a.detour){ a.idleF=(a.idleF||0)+dt; if(a.idleF>1.2&&a.idleF-dt<=1.2){ const f=idleFocus(a); if(f) a.rotT=Math.atan2(f[0]-a.fx,f[1]-a.fy); } } else a.idleF=0; }
 else a.idleF=0;
}
// au repos : le cuisinier regarde son poste, le barman et les serveurs regardent la salle
function idleFocus(a){ const r=a.s.role;
 if(r==='chef'){ let b=null,bd=1.7; for(const f of state.furn){ const k=kindOf(f); if(k!=='stove'&&k!=='oven'&&k!=='prep'&&k!=='counter') continue; const d=Math.hypot(f.x-a.fx,f.y-a.fy); if(d>.3&&d<bd){ bd=d; b=f; } } return b?[b.x,b.y]:null; }
 let sx=0,sy=0,n=0; for(const f of state.furn) if(kindOf(f)==='table'){ sx+=f.x; sy+=f.y; n++; } if(!n) return [DX,S-1];
 const c=[sx/n,sy/n]; if(r==='barman'){ let b=null,bd=1.6; for(const f of state.furn){ if(kindOf(f)!=='bar') continue; const d=Math.hypot(f.x-a.fx,f.y-a.fy); if(d<bd){ bd=d; b=f; } } if(b){ const ax=a.fx-b.x, ay=a.fy-b.y; if((c[0]-b.x)*ax+(c[1]-b.y)*ay<0) return [b.x,b.y]; } }   // derrière son bar : il fait face au comptoir et à la salle
 return Math.hypot(c[0]-a.fx,c[1]-a.fy)>.4?c:null; }
function updStaff0(a,dt){""")
