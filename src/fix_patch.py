# v0.15.1 : un agencement déjà bancal (hérité d'anciennes versions) ne bloque plus toute la déco.
#  - on ne refuse un placement que s'il CRÉE un nouveau problème
#  - réparation automatique : les objets qui coupent le passage sont rangés dans la réserve
#  - messages précis (entrée, cuisine, chaise, table...)

a=js.index("function layoutOK(){"); b=js.index("/* ---------------- PROGRESSION")
js=js[:a]+r"""function layoutIssues(){
 const I=new Map();
 if(blocked(DX,S-1)) I.set('door','entrée');
 const flood=(sx,sy,ok)=>{ const seen=new Set([sx+','+sy]), q=[[sx,sy]]; while(q.length){ const [x,y]=q.pop(); for(const [dx,dy] of D4){ const nx=x+dx, ny=y+dy, k=nx+','+ny; if(!seen.has(k)&&ok(nx,ny)){ seen.add(k); q.push([nx,ny]); } } } return seen; };
 const seen=flood(DX,S-1,(x,y)=>inRest(x,y)&&!inKitchen(x,y)&&!blocked(x,y));
 const kfree=[]; for(let y=KR.y0;y<KR.y0+KR.d;y++) for(let x=KR.x0;x<KR.x0+KR.w;x++) if(!blocked(x,y)) kfree.push([x,y]);
 // la cuisine « principale » : la zone libre qui touche le plus de postes
 let kseen=new Set();
 if(kfree.length){ const comps=[], done=new Set();
  for(const [x,y] of kfree){ const k=x+','+y; if(done.has(k)) continue; const c=flood(x,y,(a,b)=>inKitchen(a,b)&&!blocked(a,b)); c.forEach(v=>done.add(v)); comps.push(c); }
  const score=c=>{ let n=0; for(const f of state.furn) if(KITCHEN_KINDS.includes(kindOf(f))) for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) if(c.has((f.x+dx)+','+(f.y+dy))){ n++; dx=dy=9; } return n*1000+c.size; };
  comps.sort((p,q)=>score(q)-score(p)); kseen=comps[0]; if(comps.length>1) I.set('kitchen','cuisine'); }
 const near=(f,set,diag)=>{ for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){ if(!dx&&!dy) continue; if(!diag&&dx&&dy) continue; if(set.has((f.x+dx)+','+(f.y+dy))) return true; } return false; };
 for(const f of state.furn){
  const k=kindOf(f), id='f'+f.id;
  if(['stove','oven','prep','counter','dish'].includes(k)&&!near(f,kseen,true)) I.set(id,'station');
  else if((k==='counter'||k==='dish')&&!near(f,seen,true)) I.set(id,'pass');
  else if((k==='chair'||k==='wbench')&&!near(f,seen,false)) I.set(id,'seat');
  else if(k==='table'&&!near(f,seen,true)) I.set(id,'table');
  else if((k==='fridge'||k==='bar'||k==='bin')&&!near(f,seen,true)) I.set(id,'service');
 }
 return I;
}
function layoutOK(){ return layoutIssues().size===0; }
function newIssue(before){ const after=layoutIssues(); for(const [k,r] of after) if(!before.has(k)) return r; return null; }
function issueMsg(r){ return r==='entrée'?"Ça boucherait l'entrée !":r==='cuisine'?'Ça couperait la cuisine en deux !':r==='station'?'Le cuisinier ne pourrait plus atteindre un de ses postes.':r==='pass'?'Les serveurs ne pourraient plus atteindre le passe-plat.':r==='seat'?'Une chaise deviendrait inaccessible.':r==='table'?'Une table deviendrait inaccessible.':r==='service'?'Le frigo, le bar ou la poubelle deviendrait inaccessible.':'Ça bloquerait le passage !'; }
// réparation : on range dans la réserve le moins d'objets possible pour retrouver un agencement correct
function repairLayout(){
 let I=layoutIssues(), stored=0;
 const rank=f=>{ const k=kindOf(f); return ['plant','flowers','lamp','jukebox','aquarium','fountain','statue'].includes(k)?0:k==='wbench'?1:['fridge','bin','bar'].includes(k)?2:k==='chair'?3:k==='table'?4:5; };
 for(let it=0;it<30&&I.size;it++){
  let best=null, bn=I.size, br=9;
  for(const f of [...state.furn]){ if(canRemove(f)) continue;
   const i=state.furn.indexOf(f); state.furn.splice(i,1); rebuildOcc(); const n=layoutIssues().size; state.furn.splice(i,0,f); rebuildOcc();
   if(n<bn||(n===bn&&best&&n<I.size&&rank(f)<br)){ bn=n; best=f; br=rank(f); } }
  if(!best||bn>=I.size) break;
  state.furn=state.furn.filter(g=>g!==best); state.store[best.t]=(state.store[best.t]||0)+1; stored++; rebuildOcc(); I=layoutIssues();
 }
 return stored;
}
function repairNotice(){ const n=repairLayout(); if(n){ toast(`🧹 ${n} objet${n>1?'s':''} bloquai${n>1?'ent':'t'} le passage : rangé${n>1?'s':''} dans ta réserve.`); if(mode==='edit') editUI(); } return n; }

"""+js[b:]
RP(""" rebuildOcc();
 if(!layoutOK()){ if(mover){mover.x=ox;mover.y=oy;} else state.furn.pop(); rebuildOcc(); return 'Ça bloquerait le passage !'; }
 return null;
}""",""" rebuildOcc();
 const bad=newIssue(before);
 if(bad){ if(mover){mover.x=ox;mover.y=oy;} else state.furn.pop(); rebuildOcc(); return issueMsg(bad); }
 return null;
}""")
RP(" if(!canPlace(x,y,mover)) return 'Case occupée ou hors du restaurant.';\n let f=mover, ox, oy;"," if(!canPlace(x,y,mover)) return 'Case occupée ou hors du restaurant.';\n const before=layoutIssues();\n let f=mover, ox, oy;")
RP(" const dx=x-f.x, dy=y-f.y, grp=[f,...ch], old=grp.map(g=>[g.x,g.y]), cells=new Set();"," const dx=x-f.x, dy=y-f.y, grp=[f,...ch], old=grp.map(g=>[g.x,g.y]), cells=new Set(), before=layoutIssues();")
RP(" if(layoutOK()&&ch.every(c=>seatTable(c)===f)) return true;"," if(!newIssue(before)&&ch.every(c=>seatTable(c)===f)) return true;")
# réparation au chargement et à l'ouverture du mode déco
RP("function enterEdit(tab){ mode='edit';","function enterEdit(tab){ repairNotice(); mode='edit';")
RP(" const NEWS=[];",r""" const NEWS=[];
 if(!state.fix1){ state.fix1=1; const n=repairLayout(), placed=[];
  if(!state.furn.some(f=>kindOf(f)==='dish')&&state.store.desserte>0&&autoPlaceEdge('desserte')){ state.store.desserte--; if(!state.store.desserte) delete state.store.desserte; placed.push('le retour plonge'); }
  if(!state.furn.some(f=>kindOf(f)==='bin')&&state.store.bin>0&&autoPlaceNear('bin')){ state.store.bin--; if(!state.store.bin) delete state.store.bin; placed.push('la poubelle'); }
  if(!state.furn.some(f=>kindOf(f)==='fridge')&&state.store.fridge>0&&(autoPlaceEdge('fridge')||autoPlace('fridge'))){ state.store.fridge--; if(!state.store.fridge) delete state.store.fridge; placed.push('le frigo'); }
  if(n||placed.length) NEWS.push(`<div class="row"><div class="emo">🧹</div><div class="info"><div class="t">Agencement réparé</div><div class="sub">${n?`${n} objet${n>1?'s':''} qui bloquai${n>1?'ent':'t'} le passage ${n>1?'ont':'a'} été rangé${n>1?'s':''} dans ta réserve (Déco → Réserve). `:''}${placed.length?"J'ai installé "+placed.join(', ')+'. ':''}Tu peux de nouveau poser tes meubles.</div></div></div>`); }""")
