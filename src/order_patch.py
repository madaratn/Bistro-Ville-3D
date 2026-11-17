# v0.40 : prise de commande fiable et dans l'ordre d'arrivée
def RX(a,b):
    global js
    n=js.count(a); assert n==1,('order_patch',a[:70],n); js=js.replace(a,b)
# 1) un groupe n'attend plus indéfiniment un retardataire : au bout de 6 s, le serveur prend la commande de ceux qui sont prêts
RX("function partyOf(c,st){ if(!c.grp) return c[st+'By']?null:[c]; const ms=c.grp.m.filter(m=>!m.dead&&ACTIVE.includes(m.st)); if(!ms.length||ms.some(m=>m.st!==st&&m.st!=='done')) return null; const r=ms.filter(m=>m.st===st&&!m[st+'By']); return r.length?r:null; }",
   "function partyOf(c,st){ if(!c.grp) return c[st+'By']?null:[c]; const ms=c.grp.m.filter(m=>!m.dead&&ACTIVE.includes(m.st)); if(!ms.length) return null; const r=ms.filter(m=>m.st===st&&!m[st+'By']); if(!r.length) return null; if(ms.some(m=>m.st!==st&&m.st!=='done')&&!r.some(m=>(st==='order'?m.ordT:m.billT)>6)) return null; return r; }")
# 2) premier assis, premier à commander (et premier arrivé, premier accueilli ; premier fini, premier encaissé)
RX(" for(const c of custs){ if(c.st!=='order'||c.orderBy||!c.table) continue; const ps=partyOf(c,'order'); if(!ps) continue;",
   " for(const c of custs.filter(c=>c.st==='order'&&!c.orderBy&&c.table).sort((x,y)=>(y.ordT||0)-(x.ordT||0))){ const ps=partyOf(c,'order'); if(!ps) continue;")
RX(" for(const c of custs){ if(c.st!=='bill'||c.billBy||!c.table) continue; const ps=partyOf(c,'bill'); if(!ps) continue;",
   " for(const c of custs.filter(c=>c.st==='bill'&&!c.billBy&&c.table).sort((x,y)=>(y.billT||0)-(x.billT||0))){ const ps=partyOf(c,'bill'); if(!ps) continue;")
RX(" for(const c of custs){ if(c.st!=='host'||c.hostBy) continue;\n  const p=bfs(a.x,a.y,(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-c.x)+Math.abs(y-c.y)===1,false,'d'); if(!p) continue;",
   " for(const c of custs.filter(c=>c.st==='host'&&!c.hostBy).sort((x,y)=>(y.hostT||0)-(x.hostT||0))){\n  const p=bfs(a.x,a.y,(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-c.x)+Math.abs(y-c.y)===1,false,'d'); if(!p) continue;")
# 3) une table difficile d'accès : le serveur s'approche au plus près au lieu de renoncer
n=js.count("function pathToFurn(a,f){"); assert n==1,n
js=js.replace("function pathToFurn(a,f){","""function pathToFurn(a,f){ const p=pathToFurn0(a,f); if(p||!f||!a.s||a.s.role==='chef') return p; const k=kindOf(f); if(k!=='table'&&k!=='chair') return p;
 for(let r=3;r<=5;r++){ const q=bfs(a.x,a.y,(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.max(Math.abs(x-f.x),Math.abs(y-f.y))===r,false,zoneOf(a)); if(q) return q; } return null; }
function pathToFurn0(a,f){""")
# 4) une commande qui attend depuis plus de 9 s passe avant le service des plats prêts
RX("  a.tab=0;\n  const o=orders.find(o=>o.st==='ready'&&!o.waiter);","  a.tab=0;\n  if(custs.some(c=>c.st==='order'&&!c.orderBy&&c.ordT>9)&&orderJob(a)) return;\n  const o=orders.find(o=>o.st==='ready'&&!o.waiter);")
