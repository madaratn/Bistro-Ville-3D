# v0.26 : tables collées = une grande table (visuel + grandes tablées)
RP("function seatTable(ch){","""function tableJoin(t){ return [[-1,0],[1,0],[0,-1],[0,1]].map(([dx,dy])=>{ const f=fAt(t.x+dx,t.y+dy); return f&&kindOf(f)==='table'?1:0; }); }
function tableCluster(t){ const out=[t], seen=new Set([t.id]); for(let i=0;i<out.length;i++) for(const [dx,dy] of D4){ const f=fAt(out[i].x+dx,out[i].y+dy); if(f&&kindOf(f)==='table'&&!seen.has(f.id)){ seen.add(f.id); out.push(f); } } return out; }
function seatTable(ch){""")
RP("function maxTableCap(){ let m=0; for(const t of state.furn) if(kindOf(t)==='table'){ const n=state.furn.filter(f=>kindOf(f)==='chair'&&seatTable(f)===t).length; if(n>m) m=n; } return m; }",
   "function maxTableCap(){ let m=0; const done=new Set(); for(const t of state.furn) if(kindOf(t)==='table'&&!done.has(t.id)){ const cl=tableCluster(t); cl.forEach(c=>done.add(c.id)); const n=state.furn.filter(f=>kindOf(f)==='chair'&&cl.includes(seatTable(f))).length; if(n>m) m=n; } return m; }")
RP("  if(ok.length>=n) return ok.slice(0,n);\n }\n return null;\n}","""  if(ok.length>=n) return ok.slice(0,n);
 }
 // grande tablée : une table formée de plusieurs tables collées, entièrement libre
 const done=new Set();
 for(const t of tables){ if(done.has(t.id)) continue; const cl=tableCluster(t); cl.forEach(c=>done.add(c.id)); if(cl.length<2||cl.some(c=>tableBusy(c))) continue;
  const ch=state.furn.filter(f=>kindOf(f)==='chair'&&!tk.has(f.id)&&cl.includes(seatTable(f))).filter(s2=>bfs(DX,S-1,(x,y)=>x===s2.x&&y===s2.y,true));
  if(ch.length>=n){ ch.sort((a,b)=>(a.x+a.y*.01)-(b.x+b.y*.01)); return ch.slice(0,n); } }
 return null;
}""")
RP("Tables:'Une table sert dès qu’une chaise la touche par un côté.',","Tables:'Colle deux tables : elles n’en forment plus qu’une grande, pour les tablées.',")
