# v0.14 : cuisine réglable (taille + coin), nouveau mode déco (catalogue intégré, glisser-déposer,
# pivoter, ranger dans la réserve, annuler)

# ---------- géométrie de la cuisine : rectangle réglable ancré dans un coin ----------
RP("""const kitW=()=>S>=12?6:S>=10?5:4, kitD=()=>3;
const inKitchen=(x,y)=>x>=0&&y>=0&&x<kitW()&&y<kitD();
const kitchenEdge=(x,y)=>inKitchen(x,y)&&((x+1<S&&!inKitchen(x+1,y))||(y+1<S&&!inKitchen(x,y+1)));""",
r"""let KR={x0:0,y0:0,w:4,d:3};
const KCORN={nw:'Fond gauche',ne:'Fond droit',sw:'Devant gauche',se:'Devant droit'};
const kitDefW=s=>s>=12?6:s>=10?5:4;
function kitRectOf(kz,s){ return {x0:kz.c[1]==='e'?s-kz.w:0, y0:kz.c[0]==='s'?s-kz.d:0, w:kz.w, d:kz.d}; }
function updKR(){ if(!state.kz) state.kz={c:'nw',w:kitDefW(S),d:3,auto:1}; KR=kitRectOf(state.kz,S); }
const kitW=()=>KR.w, kitD=()=>KR.d;
const inKitchen=(x,y)=>x>=KR.x0&&y>=KR.y0&&x<KR.x0+KR.w&&y<KR.y0+KR.d;
const inRect=(R,x,y)=>x>=R.x0&&y>=R.y0&&x<R.x0+R.w&&y<R.y0+R.d;
const kitchenEdge=(x,y)=>inKitchen(x,y)&&D4.some(([dx,dy])=>inRest(x+dx,y+dy)&&!inKitchen(x+dx,y+dy));
// coordonnées relatives au coin des murs (u le long de la largeur, v le long de la profondeur)
function kUV(x,y,R,c){ return [c[1]==='e'?R.x0+R.w-1-x:x-R.x0, c[0]==='s'?R.y0+R.d-1-y:y-R.y0]; }
function kXY(u,v,R,c){ return [c[1]==='e'?R.x0+R.w-1-u:R.x0+u, c[0]==='s'?R.y0+R.d-1-v:R.y0+v]; }
const KMIN_W=3, KMIN_D=2, kMaxW=()=>S-2, kMaxD=()=>S-3;
function kitBoundsErr(kz){
 if(kz.w<KMIN_W||kz.d<KMIN_D) return 'La cuisine ne peut pas être plus petite.';
 if(kz.w>kMaxW()||kz.d>kMaxD()) return 'La cuisine ne peut pas être plus grande.';
 const R=kitRectOf(kz,S);
 if(inRect(R,DX,S-1)||inRect(R,DX,S-2)) return "La cuisine ne peut pas boucher l'entrée.";
 return null;
}
// orientation des objets : r = quart de tour (0 face à la rue, 1 vers la droite, 2 vers le fond, 3 vers la gauche)
const ROTATABLE=k=>!['table','chair','wbench'].includes(k);
function autoRot(f){
 const k=FURN[f.t].kind;
 if(k==='counter') return ({nw:0,ne:3,sw:1,se:2})[state.kz?state.kz.c:'nw'];
 if(KITCHEN_KINDS.includes(k)&&inKitchen(f.x,f.y)){
  if(f.y===0) return 0; if(f.x===0) return 1; if(f.x===S-1) return 3; if(f.y===S-1) return 2;
  if(f.y===KR.y0) return 0; if(f.y===KR.y0+KR.d-1) return 2; if(f.x===KR.x0) return 1; if(f.x===KR.x0+KR.w-1) return 3;
  return 0;
 }
 if(f.y===0) return 0; if(f.x===0) return 1;
 return 0;
}
function furnRot(f){ if(!ROTATABLE(FURN[f.t].kind)) return 0; return f.r!==undefined?f.r:autoRot(f); }""")
RP("function setSize(){ S=state.size; DX=Math.floor(S/2); rebuildOcc(); }","function setSize(){ S=state.size; DX=Math.floor(S/2); updKR(); rebuildOcc(); }")
RP("function rebuildOcc(){ occ=new Map();","let occVer=0;\nfunction rebuildOcc(){ occVer++; occ=new Map();")
RP("for(let y=0;y<kitD();y++) for(let x=0;x<kitW();x++) if(!blocked(x,y)) kfree.push([x,y]);",
   "for(let y=KR.y0;y<KR.y0+KR.d;y++) for(let x=KR.x0;x<KR.x0+KR.w;x++) if(!blocked(x,y)) kfree.push([x,y]);")
# repli d'urgence : jamais dans la cuisine (les cuisiniers sont ensuite renvoyés à leur poste)
RP("  if(inRest(nx,ny)&&!blocked(nx,ny)) return [nx,ny];","  if(inRest(nx,ny)&&!blocked(nx,ny)&&!inKitchen(nx,ny)) return [nx,ny];")
RP("garden:[null,null,null,null],staff:[],","garden:[null,null,null,null],staff:[],store:{},")

# ---------- réglage de la cuisine ----------
RP("function bfs(sx,sy,isGoal,goalPass,zone){", r"""function diningBad(){
 if(blocked(DX,S-1)) return fAt(DX,S-1)||null;
 const seen=new Set([DX+','+(S-1)]), q=[[DX,S-1]];
 while(q.length){ const [x,y]=q.pop(); for(const [dx,dy] of D4){ const nx=x+dx, ny=y+dy, k=nx+','+ny; if(!seen.has(k)&&inRest(nx,ny)&&!inKitchen(nx,ny)&&!blocked(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
 const near=(f,diag)=>{ for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){ if(!dx&&!dy) continue; if(!diag&&dx&&dy) continue; if(seen.has((f.x+dx)+','+(f.y+dy))) return true; } return false; };
 for(const f of state.furn){ const k=kindOf(f); if(KITCHEN_KINDS.includes(k)) continue;
  if((k==='chair'||k==='wbench')&&!near(f,false)) return f;
  if((k==='table'||k==='fridge'||k==='bar')&&!near(f,true)) return f; }
 return null;
}
// change la taille ou le coin de la cuisine ; le matériel suit, ce qui gêne part dans la réserve
function applyKitchen(nkz){
 const err=kitBoundsErr(nkz); if(err) return {err};
 const snap=snapAll(), oR=Object.assign({},KR), oc=state.kz.c;
 const fail=e=>{ restoreAll(snap); return {err:e}; };
 state.kz={c:nkz.c,w:nkz.w,d:nkz.d,auto:nkz.auto?1:0}; updKR();
 const nR=KR, nc=state.kz.c, stored=[];
 const toStore=f=>{ state.furn=state.furn.filter(g=>g!==f); state.store[f.t]=(state.store[f.t]||0)+1; stored.push(f.t); rebuildOcc(); };
 const kit=state.furn.filter(f=>KITCHEN_KINDS.includes(kindOf(f)));
 const tgt=new Map();
 for(const f of kit){
  let [u,v]=kUV(f.x,f.y,oR,oc); const isC=kindOf(f)==='counter';
  u=isC&&u===oR.w-1?nR.w-1:Math.min(u,nR.w-1); v=isC&&v===oR.d-1?nR.d-1:Math.min(v,nR.d-1);
  tgt.set(f,kXY(u,v,nR,nc));
 }
 state.furn=state.furn.filter(f=>!kit.includes(f)); rebuildOcc();
 for(const f of [...state.furn]) if(inKitchen(f.x,f.y)&&(!inRect(oR,f.x,f.y)||DINING_KINDS.includes(kindOf(f))||oc!==nc)) toStore(f);
 for(let i=0;i<60;i++){ const b=diningBad(); if(!b) break; toStore(b); }
 if(diningBad()||!layoutOK()) return fail('Ça bloquerait le passage !');
 { const used=new Set(); let ok=true;
  for(const f of kit){ const [x,y]=tgt.get(f), k=x+','+y; if(used.has(k)||fAt(x,y)||zoneErr(f.t,x,y)){ ok=false; break; } used.add(k); }
  if(ok){ for(const f of kit){ const [x,y]=tgt.get(f); f.x=x; f.y=y; state.furn.push(f); } rebuildOcc();
   if(layoutOK()){ if(oc!==nc) kit.forEach(f=>delete f.r); return {stored}; }
   state.furn=state.furn.filter(f=>!kit.includes(f)); rebuildOcc(); } }
 const ord=['counter','stove','oven','prep','sink'];
 kit.sort((a,b)=>ord.indexOf(kindOf(a))-ord.indexOf(kindOf(b)));
 for(const f of kit){
  const [tx,ty]=tgt.get(f), cands=[];
  for(let y=nR.y0;y<nR.y0+nR.d;y++) for(let x=nR.x0;x<nR.x0+nR.w;x++) if(!fAt(x,y)&&!zoneErr(f.t,x,y)) cands.push([x,y,Math.hypot(x-tx,y-ty)+(x===tx&&y===ty?-1:0)]);
  cands.sort((a,b)=>a[2]-b[2]);
  let ok=false;
  for(const [x,y] of cands){ f.x=x; f.y=y; state.furn.push(f); rebuildOcc(); if(layoutOK()){ ok=true; break; } state.furn.pop(); rebuildOcc(); }
  if(ok){ if(oc!==nc) delete f.r; continue; }
  const k=kindOf(f);
  if((k==='stove'||k==='counter')&&!state.furn.some(g=>kindOf(g)===k)) return fail(k==='stove'?'Pas assez de place pour une gazinière.':'Pas assez de place pour le passe-plat.');
  state.store[f.t]=(state.store[f.t]||0)+1; stored.push(f.t);
 }
 rebuildOcc();
 if(!layoutOK()) return fail('Ça bloquerait le passage !');
 return {stored};
}
function kitchenSet(w,d,c){
 const kz=state.kz; if(w===kz.w&&d===kz.d&&c===kz.c) return;
 const snap=snapAll(), r=applyKitchen({c,w,d,auto:0});
 if(r.err){ toast(r.err); sfx('bad'); editUI(); return; }
 undoS.push(snap); sel=null; sfx('pop');
 const n=r.stored.length;
 toast(`👨‍🍳 Cuisine ${KCORN[c].toLowerCase()} · ${w}×${d}`+(n?` · ${n} objet${n>1?'s':''} rangé${n>1?'s':''} dans la réserve 📦`:''));
 for(let y=KR.y0;y<KR.y0+KR.d;y++) for(let x=KR.x0;x<KR.x0+KR.w;x++) if(Math.random()<.35) sparkle(x,y,2,'#ffffff');
 editUI();
}
// agrandissement du restaurant : la cuisine garde sa taille et suit son coin
function kitchenResized(oR){
 const c=state.kz.c;
 for(const f of state.furn) if(inRect(oR,f.x,f.y)){ const [u,v]=kUV(f.x,f.y,oR,c), p=kXY(u,v,KR,c); f.x=p[0]; f.y=p[1]; }
 rebuildOcc();
 if(state.kz.auto&&kitDefW(S)!==state.kz.w){ const r=applyKitchen({c,w:kitDefW(S),d:state.kz.d,auto:1}); if(r.stored&&r.stored.length) toast('📦 '+r.stored.length+' objet(s) rangé(s) dans la réserve'); }
 undoS=[];
 if(mode==='edit') editUI();
}
function bfs(sx,sy,isGoal,goalPass,zone){""")
RP("state.coins-=e.p; state.size=s;","state.coins-=e.p; const oR=Object.assign({},KR); state.size=s;")
RP("setSize(); fixZones(); assignHomes(); resetSim();","setSize(); kitchenResized(oR); fixZones(); assignHomes(); resetSim();")

# ---------- nouveau mode déco ----------
a=js.index("/* ---------------- MODE DÉCO"); b=js.index("/* ---------------- INTERFACE")
js=js[:a]+r"""/* ---------------- MODE DÉCO ---------------- */
function canPlace(x,y,ignore,type){
 if(!inRest(x,y)) return false;
 if(type&&zoneErr(type,x,y)) return false;
 if(x===DX&&y===S-1) return false;
 const o=fAt(x,y); if(o&&o!==ignore) return false;
 return true;
}
function placeCheck(x,y,mover,type){
 const ze=zoneErr(type||mover.t,x,y); if(ze) return ze;
 if(!canPlace(x,y,mover)) return 'Case occupée ou hors du restaurant.';
 let f=mover, ox, oy;
 if(mover){ ox=mover.x; oy=mover.y; mover.x=x; mover.y=y; }
 else { f={id:state.nid,t:type,x,y}; state.furn.push(f); }
 rebuildOcc();
 if(!layoutOK()){ if(mover){mover.x=ox;mover.y=oy;} else state.furn.pop(); rebuildOcc(); return 'Ça bloquerait le passage !'; }
 return null;
}
let etab='Tables', ecol=false, undoS=[], odrag=null, kdrag=null;
const popAt=new Map();
const ETABS=[['Tables','🍽️','Tables'],['Chaises','🪑','Chaises'],['Cuisine','🥘','Équipement'],['zone','📐','Espace cuisine'],['Déco','🪴','Déco'],['style','🎨','Sols & murs'],['store','📦','Réserve']];
const EHINT={Tables:'Une table sert dès qu’une chaise la touche par un côté.',Chaises:'Colle la chaise à une table (pas en diagonale). Les banquettes servent de salle d’attente.',Cuisine:'Le matériel se pose dans la cuisine (zone orange). Le passe-plat va sur son bord, côté salle.',zone:'Touche un coin du plan ou glisse la poignée ⤡ dans la scène.',Déco:'La déco fait monter la note ★ de ton restaurant.',style:'Touche un sol ou un mur pour l’appliquer.',store:'Les objets rangés se replacent gratuitement.'};
// annuler : instantanés légers de l'agencement
function snapAll(){ return {furn:state.furn.map(f=>({id:f.id,t:f.t,x:f.x,y:f.y,r:f.r})),coins:state.coins,store:Object.assign({},state.store),kz:Object.assign({},state.kz),floor:state.floor,wall:state.wall,ownF:[...state.ownF],ownW:[...state.ownW]}; }
function pushUndo(){ undoS.push(snapAll()); if(undoS.length>40) undoS.shift(); }
function restoreAll(s){
 const m=new Map(state.furn.map(f=>[f.id,f]));
 state.furn=s.furn.map(o=>{ const f=m.get(o.id)||{id:o.id}; f.t=o.t; f.x=o.x; f.y=o.y; if(o.r===undefined) delete f.r; else f.r=o.r; return f; });
 Object.assign(state,{coins:s.coins,store:s.store,kz:s.kz,floor:s.floor,wall:s.wall,ownF:s.ownF,ownW:s.ownW});
 updKR(); rebuildOcc(); hud();
}
function undo(){ const s=undoS.pop(); if(!s) return; restoreAll(s); if(sel&&!state.furn.includes(sel)) sel=null; ghost=null; sfx('pop'); toast('↶ Annulé'); }
function canRemove(f){ const k=kindOf(f); if((k==='stove'||k==='counter')&&state.furn.filter(g=>kindOf(g)===k).length<=1) return k==='stove'?'Il te faut au moins une gazinière !':'Il te faut au moins un passe-plat !'; return null; }
function placeNew(x,y){
 const t=placing, F=FURN[t], fromStore=(state.store[t]||0)>0;
 if(!fromStore&&state.coins<F.p){ toast('Pas assez de pièces !'); return; }
 const snap=snapAll(), err=placeCheck(x,y,null,t);
 if(err){ ghost={x,y}; toast(err); sfx('bad'); return; }
 undoS.push(snap); if(undoS.length>40) undoS.shift();
 const f=state.furn[state.furn.length-1]; state.nid++;
 if(fromStore){ state.store[t]--; if(!state.store[t]) delete state.store[t]; floatAt(x,y,'📦'); }
 else { state.coins-=F.p; floatAt(x,y,'-'+F.p,null,true); }
 sfx('pop'); sparkle(x,y,8,'#ffffff'); popAt.set(f.id,performance.now());
 if(!(state.store[t]>0)&&state.coins<F.p){ placing=null; ghost=null; }
 hud();
}
function attachedChairs(t){ return kindOf(t)==='table'?state.furn.filter(c=>kindOf(c)==='chair'&&seatTable(c)===t):[]; }
function moveGroup(f,x,y){
 const ch=attachedChairs(f); if(!ch.length) return false;
 const dx=x-f.x, dy=y-f.y, grp=[f,...ch], old=grp.map(g=>[g.x,g.y]), cells=new Set();
 for(const g of grp){ const nx=g.x+dx, ny=g.y+dy, k=nx+','+ny, o=fAt(nx,ny);
  if(!inRest(nx,ny)||(nx===DX&&ny===S-1)||zoneErr(g.t,nx,ny)||cells.has(k)||(o&&!grp.includes(o))) return false; cells.add(k); }
 grp.forEach(g=>{ g.x+=dx; g.y+=dy; }); rebuildOcc();
 if(layoutOK()&&ch.every(c=>seatTable(c)===f)) return true;
 grp.forEach((g,i)=>{ g.x=old[i][0]; g.y=old[i][1]; }); rebuildOcc(); return false;
}
function moveFurn(f,x,y){
 if(f.x===x&&f.y===y) return true;
 { const snap=snapAll(); if(moveGroup(f,x,y)){ undoS.push(snap); sfx('pop'); popAt.set(f.id,performance.now()); for(const c of attachedChairs(f)) popAt.set(c.id,performance.now()); return true; } }
 const snap=snapAll(), err=placeCheck(x,y,f,null);
 if(err){ toast(err); sfx('bad'); return false; }
 undoS.push(snap); sfx('pop'); popAt.set(f.id,performance.now()); return true;
}
function rotateFurn(f){ pushUndo(); f.r=(furnRot(f)+3)%4; sfx('pop'); popAt.set(f.id,performance.now()); }
function removeFurn(f,how){
 const e=canRemove(f); if(e){ toast(e); sfx('bad'); return; }
 pushUndo(); state.furn=state.furn.filter(g=>g!==f); rebuildOcc(); sel=null; ghost=null;
 if(how==='store'){ state.store[f.t]=(state.store[f.t]||0)+1; sfx('pop'); toast('📦 '+FURN[f.t].n+' rangé dans la réserve'); }
 else { const v=Math.floor(FURN[f.t].p/2); state.coins+=v; floatAt(f.x,f.y,'+'+v,null,true); sfx('coin'); }
 hud();
}
function styleAct(kind,i){
 const L=kind==='f'?FLOORS:WALLS, own=kind==='f'?state.ownF:state.ownW, it=L[i], key=kind==='f'?'floor':'wall';
 if(state.level<it.u) return toast('🔒 Débloqué au niveau '+it.u);
 if(state[key]===i) return;
 if(own.includes(i)){ pushUndo(); state[key]=i; sfx('pop'); }
 else { if(state.coins<it.p) return toast('Pas assez de pièces !'); pushUndo(); state.coins-=it.p; (kind==='f'?state.ownF:state.ownW).push(i); state[key]=i; sfx('coin'); }
 hud();
}
function pickItem(k){
 const F=FURN[k];
 if(state.level<F.u){ toast('🔒 '+F.n+' : débloqué au niveau '+F.u); return; }
 if(placing===k){ placing=null; ghost=null; return; }
 if(!(state.store[k]>0)&&state.coins<F.p){ toast('Pas assez de pièces !'); sfx('bad'); return; }
 placing=k; sel=null; ghost=null;
}
function editTap(x,y){
 if(placing){
  if(!inRest(x,y)){ placing=null; ghost=null; editUI(); return; }
  if(fAt(x,y)){ ghost={x,y}; toast('Case occupée'); return; }
  placeNew(x,y); editUI(); return;
 }
 const f=fAt(x,y);
 if(f){ if(sel===f) sel=null; else { sel=f; if(['Tables','Chaises','Cuisine','Déco'].includes(FURN[f.t].cat)) etab=FURN[f.t].cat; } ghost=null; editUI(); return; }
 if(sel&&inRest(x,y)){ moveFurn(sel,x,y); ghost=null; editUI(); return; }
 sel=null; ghost=null; editUI();
}
function enterEdit(tab){ mode='edit'; sel=null; ghost=null; placing=null; undoS=[]; if(tab) etab=tab; $('#bottom').classList.add('hide'); $('#editbar').classList.remove('hide'); editUI(); }
function exitEdit(){
 mode='play'; placing=null; sel=null; ghost=null; odrag=null; kdrag=null; undoS=[];
 $('#bottom').classList.remove('hide'); $('#editbar').classList.add('hide');
 assignHomes();
 for(const a of crew){ if((a.s.role==='chef')!==inKitchen(a.x,a.y)&&a.home){ a.x=a.fx=a.home[0]; a.y=a.fy=a.home[1]; a.path=[]; } }
 for(const c of custs) if(c.y<S&&inKitchen(c.x,c.y)){ const n=nearestFree(c.x,c.y); c.x=c.fx=n[0]; c.y=c.fy=n[1]; c.path=[]; }
 resetSim(); save();
}
const editBar=()=>editUI();
function cardHTML(k){
 const f=FURN[k], lock=state.level<f.u, st=state.store[k]||0, poor=!st&&state.coins<f.p;
 return `<button class="ecard${placing===k?' on':''}${lock?' lock':''}${sel&&sel.t===k?' cur':''}" data-ek="${k}">${st?`<i class="est">×${st}</i>`:''}<span class="eim"><img src="${thumbs[k]||''}" alt=""></span><span class="en">${f.n}</span><span class="ep${poor?' poor':''}${st?' free':''}">${lock?'🔒 niv. '+f.u:st?'Gratuit':f.p+' 🪙'}</span></button>`;
}
function zoneHTML(){
 const kz=state.kz, R=KR, pc=v=>(v/S*100).toFixed(1)+'%';
 const cb=Object.keys(KCORN).map(c=>`<button class="kc ${c}${kz.c===c?' on':''}" data-kc="${c}" aria-label="${KCORN[c]}"></button>`).join('');
 const step=(l,k,v,mn,mx)=>`<div class="kst"><span>${l}</span><button data-kd="${k}-" ${v<=mn?'disabled':''}>−</button><b>${v}</b><button data-kd="${k}+" ${v>=mx?'disabled':''}>+</button></div>`;
 return `<div class="kz"><div class="kmap"><div class="kmr" style="left:${pc(R.x0)};top:${pc(R.y0)};width:${pc(R.w)};height:${pc(R.d)}"><span>🔥</span></div><i class="kdoor" style="left:${pc(DX+.5)}"></i>${cb}</div>
 <div class="kctl"><div class="kcn">${KCORN[kz.c]}</div>${step('Largeur','w',kz.w,KMIN_W,kMaxW())}${step('Profondeur','d',kz.d,KMIN_D,kMaxD())}</div></div>`;
}
function tabHTML(){
 if(etab==='zone') return zoneHTML();
 if(etab==='style'){
  const fl=FLOORS.map((f,i)=>{ const lock=state.level<f.u, own=state.ownF.includes(i), on=state.floor===i;
   return `<button class="ecard${on?' on':''}${lock?' lock':''}" data-ef="${i}"><span class="eim sw" style="background:repeating-conic-gradient(${f.a} 0 25%,${f.b} 0 50%) 0 0/20px 20px"></span><span class="en">${f.n}</span><span class="ep${!own&&state.coins<f.p?' poor':''}">${lock?'🔒 niv. '+f.u:on?'✔ Sol':own?'Sol':f.p+' 🪙'}</span></button>`; }).join('');
  const wl=WALLS.map((f,i)=>{ const lock=state.level<f.u, own=state.ownW.includes(i), on=state.wall===i;
   return `<button class="ecard${on?' on':''}${lock?' lock':''}" data-ew="${i}"><span class="eim sw" style="background:linear-gradient(transparent 66%,${f.w} 66%),${f.s?`repeating-linear-gradient(90deg,${f.c} 0 9px,${f.s} 9px 14px)`:f.c}"></span><span class="en">${f.n}</span><span class="ep${!own&&state.coins<f.p?' poor':''}">${lock?'🔒 niv. '+f.u:on?'✔ Mur':own?'Mur':f.p+' 🪙'}</span></button>`; }).join('');
  return fl+'<i class="esep"></i>'+wl;
 }
 if(etab==='store'){
  const ks=Object.keys(state.store).filter(k=>state.store[k]>0&&FURN[k]);
  return ks.length?ks.map(cardHTML).join(''):'<div class="eempty">📦 Ta réserve est vide.<br><span>Sélectionne un objet puis « Ranger » pour le garder de côté et le replacer gratuitement.</span></div>';
 }
 return Object.keys(FURN).filter(k=>FURN[k].cat===etab).map(cardHTML).join('');
}
function selHTML(){
 if(placing){ const F=FURN[placing], st=state.store[placing]||0;
  return `<div class="sc"><span class="eim"><img src="${thumbs[placing]||''}" alt=""></span><div class="si2"><b>${F.n}</b><span>${st?'Réserve ×'+st:F.p+' 🪙'} · touche une case pour le poser</span></div><button class="sx" data-e="cancel">✕</button></div>`; }
 if(sel){ const F=FURN[sel.t], k=kindOf(sel);
  let info='Glisse-le pour le déplacer';
  if(k==='chair') info=seatTable(sel)?'✔ Touche une table':'⚠️ Doit toucher une table';
  else if(F.speed) info='Vitesse ×'+F.speed+' · glisse pour déplacer';
  return `<div class="sc"><span class="eim"><img src="${thumbs[sel.t]||''}" alt=""></span><div class="si2"><b>${F.n}</b><span>${info}</span></div><button class="sx" data-e="desel">✕</button></div>
  <div class="sa">${ROTATABLE(k)?'<button data-e="rot"><i>↻</i>Pivoter</button>':''}<button data-e="copy"><i>⧉</i>Copier</button><button data-e="store"><i>📦</i>Ranger</button><button data-e="sell" class="red"><i>🪙</i>Vendre +${Math.floor(F.p/2)}</button></div>`; }
 return '';
}
function editUI(){
 if(mode!=='edit') return;
 const tb=$('#etabs'), it=$('#eitems'), sl=tb.scrollLeft;
 tb.innerHTML=ETABS.map(([id,e,n])=>`<button class="ech${etab===id?' on':''}" data-et="${id}"><span>${e}</span>${n}${id==='store'&&Object.values(state.store).some(v=>v>0)?`<i>${Object.values(state.store).reduce((a,b)=>a+b,0)}</i>`:''}</button>`).join('')+'<button class="ech" data-e="grand"><span>🏠</span>Agrandir</button>';
 tb.scrollLeft=sl;
 const key=etab; const isl=it._tab===key?it.scrollLeft:0;
 it.innerHTML=coinify(tabHTML()); it._tab=key; it.scrollLeft=isl;
 it.classList.toggle('zone',etab==='zone');
 const sh=selHTML(), es=$('#esel'); es.innerHTML=coinify(sh); es.classList.toggle('hide',!sh);
 $('#eundo').disabled=!undoS.length;
 $('#ehint').textContent=sel?'Glisse un objet pour le déplacer, ou touche une case libre.':(EHINT[etab]||'');
 $('#edock').classList.toggle('col',ecol);
 const on=it.querySelector('.ecard.on,.ecard.cur'); if(on&&it._scrollTo!==on.dataset.ek+etab){ it._scrollTo=on.dataset.ek+etab; const r=on.offsetLeft-it.clientWidth/2+on.offsetWidth/2; it.scrollTo({left:r,behavior:'smooth'}); }
}
$('#editbar').addEventListener('click',e=>{
 const b=e.target.closest('button'); if(!b||b.disabled) return; const d=b.dataset;
 audioInit();
 if(d.et){ etab=d.et; ecol=false; if(etab==='zone'){ placing=null; sel=null; } }
 else if(d.ek) pickItem(d.ek);
 else if(d.ef!==undefined) styleAct('f',+d.ef);
 else if(d.ew!==undefined) styleAct('w',+d.ew);
 else if(d.kc){ let w=state.kz.w, dd=Math.min(state.kz.d,kMaxD()); while(w>KMIN_W&&kitBoundsErr({c:d.kc,w,d:dd})) w--; kitchenSet(w,dd,d.kc); }
 else if(d.kd){ const kz=state.kz, k=d.kd[0], s=d.kd[1]==='+'?1:-1; kitchenSet(kz.w+(k==='w'?s:0),kz.d+(k==='d'?s:0),kz.c); }
 else if(d.e){ const a=d.e;
  if(a==='cancel'){ placing=null; ghost=null; }
  else if(a==='desel'){ sel=null; ghost=null; }
  else if(a==='done') return exitEdit();
  else if(a==='undo') undo();
  else if(a==='col') ecol=!ecol;
  else if(a==='grand') return openPanel('shop','grand');
  else if(sel){
   if(a==='rot') rotateFurn(sel);
   else if(a==='copy'){ const t=sel.t; sel=null; pickItem(t); etab=FURN[t].cat; }
   else if(a==='store') removeFurn(sel,'store');
   else if(a==='sell') removeFurn(sel,'sell');
  }
 }
 editUI();
});
$('#eitems').addEventListener('wheel',e=>{ if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ e.currentTarget.scrollLeft+=e.deltaY; e.preventDefault(); } },{passive:false});
$('#bEdit').onclick=()=>enterEdit();

"""+js[b:]
RP("buy:k=>{ const F=FURN[k]; if(state.coins<F.p) return toast('Pas assez de pièces !'); closeModal(); if(mode!=='edit') enterEdit(); placing=k; sel=null; ghost=null; editBar(); },",
   "buy:k=>{ const F=FURN[k]; if(state.coins<F.p&&!(state.store[k]>0)) return toast('Pas assez de pièces !'); closeModal(); if(mode!=='edit') enterEdit(F.cat); etab=F.cat; placing=k; sel=null; ghost=null; editUI(); },")
RP("Achète des meubles et décore en mode <b>Déco</b> pour faire monter ta <span class=\"stars\">★</span> note.",
   "En mode <b>Déco</b>, choisis tes meubles dans le catalogue en bas, glisse-les pour les déplacer et règle l'espace cuisine pour faire monter ta <span class=\"stars\">★</span> note.")
