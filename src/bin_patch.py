# v0.15 : poubelle — on y vide les restes avant de déposer la vaisselle au retour plonge ;
#         les déchets ramassés y finissent aussi. Plus jamais de vaisselle sale sur le passe-plat.

RP(" desserte:{n:'Retour plonge',cat:'Cuisine',p:120,d:0,u:1,kind:'dish',col:'#9aa3ad'},",
   " desserte:{n:'Retour plonge',cat:'Cuisine',p:120,d:0,u:1,kind:'dish',col:'#9aa3ad'},\n bin:{n:'Poubelle',cat:'Cuisine',p:60,d:0,u:1,kind:'bin',col:'#5f7f6a'},")
RP(" if(k==='fridge'&&inKitchen(x,y)&&!kitchenEdge(x,y)) return 'Le frigo se pose dans la salle ou au bord de la cuisine, porte côté salle.';",
   " if(k==='fridge'&&inKitchen(x,y)&&!kitchenEdge(x,y)) return 'Le frigo se pose dans la salle ou au bord de la cuisine, porte côté salle.';\n if(k==='bin'&&inKitchen(x,y)&&!kitchenEdge(x,y)) return 'La poubelle se pose dans la salle ou au bord de la cuisine.';")
RP("DINING_KINDS=['table','chair','wbench','fridge','bar'];","DINING_KINDS=['table','chair','wbench','fridge','bar','bin'];")
RP(" if(k!=='fridge'&&DINING_KINDS.includes(k)&&inKitchen(x,y))"," if(k!=='fridge'&&k!=='bin'&&DINING_KINDS.includes(k)&&inKitchen(x,y))")
RP("  if((k==='fridge'||k==='bar')&&!near(f,seen,true)) return false;","  if((k==='fridge'||k==='bar'||k==='bin')&&!near(f,seen,true)) return false;")
RP("if((k==='table'||k==='fridge'||k==='bar')&&!near(f,true)) return f; }","if((k==='table'||k==='fridge'||k==='bar'||k==='bin')&&!near(f,true)) return f; }")
RP("Cuisine:'Le matériel se pose dans la cuisine (zone orange). Le passe-plat et le retour plonge vont sur son bord, côté salle.',",
   "Cuisine:'Le matériel se pose dans la cuisine (zone orange). Passe-plat et retour plonge vont sur son bord ; la poubelle dans la salle ou au bord.',")

# la vaisselle sale ne va qu'au retour plonge
RP("function dishReturns(){ const d=state.furn.filter(f=>kindOf(f)==='dish'); return d.length?d:state.furn.filter(f=>kindOf(f)==='counter'); }",
   """function dishReturns(){ return state.furn.filter(f=>kindOf(f)==='dish'); }
const bins=()=>state.furn.filter(f=>kindOf(f)==='bin'); const binOpen=new Map();
function dishHint(){ if(state.hintDish) return; state.hintDish=1; toast('Astuce : pose un retour plonge au bord de la cuisine pour la vaisselle sale (Déco → Équipement).'); }""")
RP("  const r=bestPath(a,dishReturns()); if(r){ j.s='drop'; j.r=r.f; a.path=r.p; } else { a.tub=0; a.job=null; } return; }",
   """  const rb=bestPath(a,bins()); if(rb){ j.s='bin'; j.b=rb.f; a.path=rb.p; return; }
  j.s='todish'; return; }
 if(j.s==='bin'){ if(!state.furn.includes(j.b)){ j.s='todish'; return; }
  if(!a.path.length&&!j.op){ j.op=1; binOpen.set(j.b.id,performance.now()); }
  if(arrived(a,dt,1,j.b)){ j.s='todish'; } return; }
 if(j.s==='todish'){ const r=bestPath(a,dishReturns()); if(r){ j.s='drop'; j.r=r.f; a.path=r.p; } else { a.tub=0; a.job=null; dishHint(); } return; }""")
# déchets ramassés : direction la poubelle
RP("function doTrash(a,j,dt){ if(!trash.includes(j.t)){a.job=null;return;} if(arrived(a,dt,.7)){ trash=trash.filter(t=>t!==j.t); floatAt(a.fx,a.fy,'✨'); gainStaff(a); a.job=null; } }",
   """function doTrash(a,j,dt){
 if(j.ph==='bin'){ if(!state.furn.includes(j.b)){ a.job=null; return; } if(!a.path.length&&!j.op){ j.op=1; binOpen.set(j.b.id,performance.now()); } if(arrived(a,dt,.8,j.b)) a.job=null; return; }
 if(!trash.includes(j.t)){a.job=null;return;}
 if(arrived(a,dt,.7)){ trash=trash.filter(t=>t!==j.t); gainStaff(a); const r=bestPath(a,bins()); if(r){ j.ph='bin'; j.b=r.f; a.path=r.p; } else { floatAt(a.fx,a.fy,'✨'); a.job=null; } }
}""")
# poser automatiquement : près du retour plonge, côté salle
RP("function autoPlace(t){","""function autoPlaceNear(t){
 const ref=state.furn.filter(f=>kindOf(f)==='dish'||kindOf(f)==='counter'), cand=[];
 for(let y=0;y<S;y++) for(let x=0;x<S;x++){ if(fAt(x,y)||(x===DX&&y>=S-2)||zoneErr(t,x,y)) continue; if(inKitchen(x,y)) continue;
  let wall=(x===0||y===0)?-2:0, free=0; for(const [dx,dy] of D4){ const f=fAt(x+dx,y+dy); if(f&&(kindOf(f)==='chair'||kindOf(f)==='table')) wall+=2; if(f&&['fridge','counter','dish','bar'].includes(kindOf(f))) wall+=3; if(inRest(x+dx,y+dy)&&!f) free++; } wall+=Math.max(0,free-2)*.5;
  const d=ref.length?Math.min(...ref.map(c=>Math.abs(c.x-x)+Math.abs(c.y-y))):9; cand.push([x,y,d+wall]); }
 cand.sort((a,b)=>a[2]-b[2]);
 for(const [x,y] of cand){ const f={id:state.nid++,t,x,y}; state.furn.push(f); rebuildOcc(); if(layoutOK()&&!diningBad()) return f; state.furn.pop(); rebuildOcc(); }
 return null;
}
function autoPlace(t){""")
RP(" autoPlaceEdge('desserte'); state.svc=1;\n}"," autoPlaceEdge('desserte'); state.svc=1; autoPlaceNear('bin'); state.bin=1;\n}")
RP("garden:[null,null,null,null],staff:[],store:{},bar:0,svc:0,","garden:[null,null,null,null],staff:[],store:{},bar:0,svc:0,bin:0,")
RP(" if(NEWS.length) queueModal(",""" if(!state.bin){ state.bin=1;
  if(!state.furn.some(f=>kindOf(f)==='dish')&&state.store.desserte>0&&autoPlaceEdge('desserte')){ state.store.desserte--; if(!state.store.desserte) delete state.store.desserte; }
  const b=autoPlaceNear('bin'); if(!b) state.store.bin=(state.store.bin||0)+1;
  NEWS.push(`<div class="row"><div class="emo">🗑️</div><div class="info"><div class="t">Poubelle et retour plonge</div><div class="sub">L'agent d'entretien vide les restes dans la poubelle${b?' (installée près de la cuisine)':' (dans ta réserve)'} puis dépose la vaisselle au retour plonge, jamais sur le passe-plat.</div></div></div>`,
   `<div class="row"><div class="emo">🚶</div><div class="info"><div class="t">Circulation polie</div><div class="sub">Chacun attend que l'autre passe ou s'écarte dans les passages étroits. Le frigo peut aussi se poser au bord de la cuisine.</div></div></div>`); }
 if(NEWS.length) queueModal(""")

# si le serveur tarde trop à venir, les clients s'installent seuls (sans attendre indéfiniment)
RP("   else if(c.hostT>10||!hostOn()) goSeat(c);","   else if(c.hostT>10||!hostOn()) goSeat(c);\n   if(c.hostBy&&c.hostT>16) goSeat(c);")
