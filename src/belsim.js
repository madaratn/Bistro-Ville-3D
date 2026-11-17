/* ===== Le Belmont : la vie de la salle (accueil, service, débarrassage, nouvelles tablées) ===== */
const BC=.4, BNX=Math.ceil(BW/BC), BNZ=Math.ceil((BD+2.4)/BC);
let belGrid=null;
const bIdx=(cx,cz)=>cz*BNX+cx, bCell=v=>Math.floor(v/BC);
function belBlockC(x,z,r){ for(let cz=bCell(z-r);cz<=bCell(z+r);cz++) for(let cx=bCell(x-r);cx<=bCell(x+r);cx++) if(cx>=0&&cz>=0&&cx<BNX&&cz<BNZ&&Math.hypot((cx+.5)*BC-x,(cz+.5)*BC-z)<r) belGrid[bIdx(cx,cz)]=1; }
function belBlockR(x0,z0,x1,z1){ for(let cz=bCell(z0);cz<=bCell(z1);cz++) for(let cx=bCell(x0);cx<=bCell(x1);cx++) if(cx>=0&&cz>=0&&cx<BNX&&cz<BNZ) belGrid[bIdx(cx,cz)]=1; }
const belFree=(x,z)=>{ const cx=bCell(x), cz=bCell(z); return cx>=0&&cz>=0&&cx<BNX&&cz<BNZ&&!belGrid[bIdx(cx,cz)]; };
function belSee(ax,az,bx,bz){ const d=Math.hypot(bx-ax,bz-az), n=Math.ceil(d/.14); for(let i=1;i<n;i++){ const t=i/n, x=ax+(bx-ax)*t, z=az+(bz-az)*t; if(!belFree(x,z)||!belFree(x+.16,z)||!belFree(x-.16,z)||!belFree(x,z+.16)||!belFree(x,z-.16)) return false; } return true; }
function belNear(x,z){ if(belFree(x,z)) return [bCell(x),bCell(z)]; let best=null,bd=1e9; const c0=bCell(x), z0=bCell(z); for(let dz=-4;dz<=4;dz++) for(let dx=-4;dx<=4;dx++){ const cx=c0+dx, cz=z0+dz; if(cx<0||cz<0||cx>=BNX||cz>=BNZ||belGrid[bIdx(cx,cz)]) continue; const d=Math.hypot((cx+.5)*BC-x,(cz+.5)*BC-z); if(d<bd){ bd=d; best=[cx,cz]; } } return best; }
// chemin : parcours en largeur sur la grille, puis on tend la ficelle pour marcher en ligne droite
function belPath(ax,az,bx,bz){
 const s=belNear(ax,az), g=belNear(bx,bz); if(!s||!g) return [[bx,bz]];
 const prev=new Int32Array(BNX*BNZ).fill(-1), q=[bIdx(s[0],s[1])]; prev[q[0]]=q[0]; const goal=bIdx(g[0],g[1]);
 for(let i=0;i<q.length;i++){ const c=q[i]; if(c===goal) break; const cx=c%BNX, cz=(c-cx)/BNX;
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){ const nx=cx+dx, nz=cz+dz; if(nx<0||nz<0||nx>=BNX||nz>=BNZ) continue; const n=bIdx(nx,nz); if(prev[n]>=0||belGrid[n]) continue; if(dx&&dz&&(belGrid[bIdx(cx+dx,cz)]||belGrid[bIdx(cx,cz+dz)])) continue; prev[n]=c; q.push(n); } }
 if(prev[goal]<0) return [[bx,bz]];
 let pts=[]; for(let c=goal;;c=prev[c]){ const cx=c%BNX; pts.push([(cx+.5)*BC,((c-cx)/BNX+.5)*BC]); if(prev[c]===c) break; } pts.reverse(); pts.push([bx,bz]);
 const out=[]; let cur=[ax,az], i=0; while(i<pts.length){ let j=pts.length-1; while(j>i&&!belSee(cur[0],cur[1],pts[j][0],pts[j][1])) j--; out.push(pts[j]); cur=pts[j]; i=j+1; }
 return out;
}
// --- protos des assiettes : pleine, entamée, finie (fusionnées par matière pour rester léger) ---
function belMergeGroup(src){ src.updateMatrixWorld(true); const by=new Map(), out=new THREE.Group();
 src.traverse(o=>{ if(!o.isMesh||o.visible===false) return; let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); g.applyMatrix4(o.matrixWorld); for(const k of Object.keys(g.attributes)) if(k!=='position'&&k!=='normal'&&k!=='uv') g.deleteAttribute(k); if(!g.attributes.uv||!g.attributes.normal) return; const m=o.material; if(!by.has(m.uuid)) by.set(m.uuid,{m,l:[]}); by.get(m.uuid).l.push(g); });
 for(const {m,l} of by.values()){ const g=mergeGeometries(l,false); l.forEach(x=>x.dispose()); if(g){ const me=new THREE.Mesh(g,m); me.castShadow=false; me.receiveShadow=true; out.add(me); } } return out; }
const belPP=[], BEL_TABLE_DISH=[0,1,2,3,4,5,7,8];
function belPlateProto(i,stage){ const key=i*3+stage; if(belPP[key]) return belPP[key]; const g=new THREE.Group(); BEL_BUILD[i](g); const n=g.children.length, keep=stage===0?n:stage===1?5+Math.ceil((n-5)*.5):6; for(let k=0;k<n;k++) g.children[k].visible=k<keep;
 if(stage===2){ const k1=mesh(new THREE.BoxGeometry(.11,.004,.012),M('#e9edf2',{metalness:.9,roughness:.2}),.01,.022,.0,false), k2=k1.clone(); k1.rotation.y=.5; k2.rotation.y=-.3; k2.position.set(-.01,.024,.01); g.add(k1,k2); for(let j=0;j<5;j++) g.add(mesh(SP(.006,5,4),M('#c9a56a',{roughness:.8}),Math.cos(j*1.9)*.06,.02,Math.sin(j*1.9)*.05,false)); }
 return belPP[key]=belMergeGroup(g); }
// --- personnages ---
let belId=9100;
const BEL_TUX={top:'#fbf8f2',bottom:'#16161c',shoes:'#0e0e12',extras:['vest','bowtie'],accent:'#16161c',hat:null}, BEL_COMMIS={top:'#fbf8f2',bottom:'#16161c',shoes:'#0e0e12',extras:['buttons','apron'],accent:'#d4a53a',hat:null},
 BEL_COOK={top:'#fbf8f2',bottom:'#2a2c36',shoes:'#16161a',hat:'toque',extras:['buttons','apron'],accent:'#d4a53a'}, BEL_SOMM={top:'#fbf8f2',bottom:'#16161c',shoes:'#0e0e12',extras:['vest','tie','apron'],accent:'#5a1f2e',hat:null};
function belAgent(o,x,z,ry){ const a=Object.assign({id:belId++,fx:x-.5,fy:z-.5,x:Math.round(x),y:Math.round(z),rot:ry||0,moving:false,path:null,spd:1.1,wait:0,blockT:0},o); visit.agents.push(a); return a; }
const belStaff=(role,outfit,x,z,ry,extra)=>belAgent(Object.assign({s:{id:belId,role,outfit},staff:role,home:[x,z,ry||0],task:null,belIdle:true},extra||{}),x,z,ry);
const belFaceRoom=(x,z)=>Math.atan2(BCX-x,BFZ-z);
const belGuest=(x,z)=>belAgent({kind:'walk',look:randLook(),guest:true,spd:.92+Math.random()*.1},x,z,Math.PI);
function belGo(a,x,z,cb){ a.path=belPath(a.fx+.5,a.fy+.5,x,z); a.cb=cb||null; a.blockT=0; }
function belDrop(a){ a.dead=true; const o=visit.objs.get(a); if(o){ belRoot.remove(o.root); visit.objs.delete(a); } const i=visit.agents.indexOf(a); if(i>=0) visit.agents.splice(i,1); }
function belCarry(a,obj){ const o=visit.objs.get(a); if(a.belObj&&o) o.root.remove(a.belObj); a.belObj=null; a.belHold=false; if(obj&&o){ obj.position.set(0,.5,.21); obj.scale.setScalar(.62); o.root.add(obj); a.belObj=obj; a.belHold=true; } }
// l'humeur de la tablée : ce que font les convives assis (lire la carte, lever la main, discuter, manger)
function belMood(t,st){ if(!t.party) return; t.party.m.forEach((g,i)=>{ if(g.dead) return; g.st=st; g.hand=0; g.talk=false; g.lookAt=false; g.phone=st==='wait'&&(g.id%5===0); g.ph=g.id*1.7; }); t.talkT=1; }
// --- tables ---
function belSetPlates(t,stage){ for(const p of t.plates) visit.dyn.remove(p); t.plates=[]; if(stage<0||!t.party) return; t.party.m.forEach(g=>{ const s=t.seats[g.seat], o=belPlateProto(g.dish,stage).clone(); o.position.set(s.px,.522,s.pz); o.scale.setScalar(.72); o.rotation.y=s.ry; visit.dyn.add(o); t.plates.push(o); }); }
function belSpotAt(t,from){ // point d'approche du serveur : dans un creux entre deux fauteuils, le plus proche possible
 let best=null,bd=1e9; const n=t.n; for(let k=0;k<n;k++){ const a=(k+.5)/n*Math.PI*2+Math.PI/4, x=t.x+Math.cos(a)*1.42, z=t.z+Math.sin(a)*1.42; if(!belFree(x,z)) continue; const d=Math.hypot(x-from[0],z-from[1]); if(d<bd){ bd=d; best=[x,z]; } } return best||[t.x+1.5,t.z]; }
const belSeatPt=(t,s)=>{ const dx=s.x-t.x, dz=s.z-t.z, d=Math.hypot(dx,dz); return [t.x+dx/d*1.42,t.z+dz/d*1.42]; };
function belSit(g,t,now){ const s=t.seats[g.seat]; g.seatGeo=true; g.sitting=true; g.st='menu'; g.fx=s.x-.5; g.fy=s.z-.5; g.rot=s.ry; g.sitT=now?1:0; g.sitK=now?1:0; g.sitDir=1; g.path=null; g.moving=false; }
function belParty(t,seatedNow){ const n=t.n===2?2:(Math.random()<.45?2:Math.random()<.5?3:4), order=t.n===2?[0,1]:n===2?[0,2]:n===3?[0,1,2]:[0,1,2,3];
 const p={t,m:[],in:0}; for(let i=0;i<n;i++){ const g=belGuest(BCX-.72+(i%2)*.55+(Math.random()-.5)*.08,BD+1.75+Math.floor(i/2)*.5); g.seat=order[i]; g.dish=BEL_TABLE_DISH[Math.floor(Math.random()*BEL_TABLE_DISH.length)]; g.party=p; p.m.push(g); if(seatedNow) belSit(g,t,true); }
 t.party=p; return p; }
function belTask(k,t){ visit.tasks.push({k,t}); }
function belSeatParty(p){ const t=p.t; p.m.forEach((g,i)=>{ g.wait=i*.45; const s=t.seats[g.seat], pt=belSeatPt(t,s); belGo(g,pt[0],pt[1],()=>{ belSit(g,t,false); p.in++; if(p.in===p.m.length){ t.state='seated'; t.t=3+Math.random()*2.5; belMood(t,'menu'); } }); }); }
function belLeave(t){ const p=t.party; belMood(t,'done'); t.state='leaving'; p.out=0; p.m.forEach((g,i)=>{ g.leaveT=.3+i*.55; }); }
// --- mise en place ---
function belSimInit(root){
 belGrid=new Uint8Array(BNX*BNZ);
 for(let cz=0;cz<BNZ;cz++) for(let cx=0;cx<BNX;cx++){ const x=(cx+.5)*BC, z=(cz+.5)*BC; if(x<.45||x>BW-.35||z<.75||(z>BD-.1&&Math.abs(x-BCX)>1.15)) belGrid[bIdx(cx,cz)]=1; }
 for(const t of visit.tables) belBlockC(t.x,t.z,1.14);
 belBlockC(BCX,BFZ,1.45); belBlockC(visit.stage.x,visit.stage.z,1.8); belBlockC(visit.trolley.x,visit.trolley.z,.62);
 belBlockR(16.5,0,BW,3.2); belBlockR(0,.6,.9,5.4); belBlockR(0,11.2,2.5,16.8); belBlockR(BW-1.3,6.2,BW,8.6); belBlockR(13.8,0,15.5,.9); belBlockR(BCX-2.15,BD-2.75,BCX-1.35,BD-2.05);
 for(const k of [-1,1]) belBlockC(BCX+k*1.9,BD-.7,.5); for(const [x,z] of visit.palms) belBlockC(x,z,.42);
 visit.dyn=new THREE.Group(); visit.dyn.userData.dyn=1; root.add(visit.dyn);
 visit.passObj=visit.pass.map(s=>{ const g=new THREE.Group(); belCloche(g,0,0,0,1.25); g.position.set(s.x,1.0,s.z); g.visible=false; visit.dyn.add(g); return g; });
 // la brigade : Belmont inspecte le passe, trois cuisiniers au piano
 visit.belmont=belStaff('rival',{skin:'#f1c7a3',hairC:'#2b2b30',hair:'short',top:'#f7f3ea',bottom:'#23242c',shoes:'#16161a',hat:'toque',extras:['buttons','scarf','glasses'],accent:'#d4a53a',w:1.12,h:1.05},20,2.0,0,{pace:[[17.8,2.05],[19.4,2.05],[21.0,2.05],[22.4,2.05],[20.2,2.05]],pi:0,spd:.7,belInspect:true,belIdle:false});
 for(const x of [18.2,20.2,22.0]) belStaff('chef',BEL_COOK,x,1.55,Math.PI,{belCook:true,belIdle:false});
 // la salle : quatre chefs de rang, deux commis débarrasseurs, le sommelier, le maître d'hôtel
 visit.waiters=[[17.0,4.1],[21.4,4.6],[1.6,8.0],[BCX+1.7,BFZ+3.4],[BCX-2.2,6.6],[19.2,4.2]].map(([x,z])=>belStaff('waiter',BEL_TUX,x,z,belFaceRoom(x,z)));
 visit.commis=[[15.9,4.4],[1.6,9.6],[BW-1.2,11.6]].map(([x,z])=>belStaff('commis',BEL_COMMIS,x,z,belFaceRoom(x,z)));
 visit.somm=belStaff('somm',BEL_SOMM,1.5,3.0,Math.PI/2,{sommT:6});
 visit.maitre=belStaff('maitre',Object.assign({},BEL_TUX,{accent:'#d4a53a',extras:['vest','tie']}),BCX-1.75,BD-3.02,.55);
 { const p=visit.pianist; belAgent({s:{id:belId,role:'pianist',outfit:Object.assign({},BEL_TUX,{top:'#16161c',extras:['bowtie'],hair:'short'})},seatGeo:true,sitK:1,sitting:true,belPiano:true,yOff:.14},p.x,p.z,Math.PI+.5); }
 BEL_INFO.push({x:20,y:1.25,z:2,a:visit.belmont,n:'Victor Belmont',d:'Trois étoiles, douze livres de cuisine, et un avis très arrêté sur ton bistrot. Il inspecte chaque assiette au passe avant qu’elle parte en salle.',k:'Rival'});
 // la salle est déjà en plein service quand on entre
 visit.tables.forEach((t,i)=>{ const r=(i*7+3)%10; if(r<6){ belParty(t,true); t.state='eat'; t.eatT=18+Math.random()*10; t.t=t.eatT*(.15+Math.random()*.8); t.stage=t.t/t.eatT<.5?1:0; belSetPlates(t,t.stage); belMood(t,'eat'); }
  else if(r<8){ belParty(t,true); t.state='cooking'; t.t=2+Math.random()*7; belMood(t,'wait'); } else if(r<9){ t.state='dirty'; t.party={t,m:[0,1].map(k=>({seat:k,dish:BEL_TABLE_DISH[(i+k)%8]}))}; belSetPlates(t,2); t.party=null; belTask('clear',t); } });
 visit.arrT=2; visit.arriving=null;
}
// --- service : qui fait quoi ---
function belAssign(){
 for(let i=0;i<visit.tasks.length;i++){ const k=visit.tasks[i], pool=(k.k==='clear'?visit.commis:visit.waiters).filter(w=>!w.task); if(!pool.length) continue;
  let w=pool[0], bd=1e9; for(const c of pool){ const d=Math.hypot(c.fx+.5-k.t.x,c.fy+.5-k.t.z); if(d<bd){ bd=d; w=c; } }
  visit.tasks.splice(i,1); i--; w.task=k; const t=k.t, here=[w.fx+.5,w.fy+.5];
  if(k.k==='order'){ const p=belSpotAt(t,here); belGo(w,p[0],p[1],()=>{ w.face=t; w.wait=3; w.tab=1; belMood(t,'order'); t.party.m.forEach(g=>{ g.lookAt=true; }); w.then=()=>{ w.tab=0; t.state='cooking'; t.t=7+Math.random()*5; belMood(t,'wait'); belDone(w); }; }); }
  else if(k.k==='serve'){ const s=visit.pass[t.slot]; belGo(w,s.x,3.62,()=>{ w.rot=Math.PI; w.wait=.9; w.reachW=1; w.then=()=>{ w.reachW=0; visit.passObj[t.slot].visible=false; s.busy=null; const tr=new THREE.Group(); belCloche(tr,0,0,0,1.1); belCarry(w,tr);
     const p=belSpotAt(t,[w.fx+.5,w.fy+.5]); belGo(w,p[0],p[1],()=>{ w.face=t; w.wait=1.8; w.then=()=>{ belCarry(w,null); t.state='eat'; t.eatT=17+Math.random()*10; t.t=t.eatT; t.stage=0; belSetPlates(t,0); belMood(t,'eat'); t.party.m.forEach(g=>{ g.thankT=1; }); belDone(w); }; }); }; }); }
  else if(k.k==='clear'){ const p=belSpotAt(t,here); w.tub=1; belGo(w,p[0],p[1],()=>{ w.face=t; w.wait=2.8; w.wipe=true; w.then=()=>{ for(const pl of t.plates) visit.dyn.remove(pl); t.plates=[]; w.wipe=false; w.tub=2;
     belGo(w,16.1-visit.commis.indexOf(w)*.5,3.75+visit.commis.indexOf(w)*.3,()=>{ w.rot=Math.atan2(1,-1.2); w.wait=.9; w.then=()=>{ w.tub=0; t.state='free'; t.t=0; belDone(w); }; }); }; }); }
 }
}
function belDone(w){ w.task=null; w.face=null; w.idleT=.6+Math.random(); }
function belUpdate(dt,T){
 for(const f of visit.anim) f(T); visit.T+=dt;
 // tables
 for(const t of visit.tables){
  if(t.party&&(t.state==='cooking'||t.state==='ready'||t.state==='eat')){ t.talkT-=dt; if(t.talkT<=0){ const m=t.party.m; m.forEach(g=>{ g.talk=false; }); if(m.length>1&&Math.random()<.75) m[Math.floor(Math.random()*m.length)].talk=true; t.talkT=2+Math.random()*3; } }
  if(t.state==='seated'){ t.t-=dt; if(t.t<=0){ t.state='ordering'; belMood(t,'order'); t.party.m[0].hand=1.6; belTask('order',t); } }
  else if(t.state==='ordering'&&t.party){ const g=t.party.m[0]; if(g.hand>0) g.hand-=dt; else if(g.st==='order'&&!g.lookAt&&Math.random()<dt*.25) g.hand=1.6; }
  else if(t.state==='cooking'){ t.t-=dt; if(t.t<=0){ const s=visit.pass.findIndex(p=>!p.busy); if(s>=0){ visit.pass[s].busy=t; t.slot=s; visit.passObj[s].visible=true; t.state='ready'; belTask('serve',t); } } }
  else if(t.state==='eat'){ t.t-=dt; const pr=1-t.t/t.eatT, st=pr>=1?2:pr>.5?1:0; if(st!==t.stage){ t.stage=st; belSetPlates(t,st); if(st===2) belMood(t,'bill'); } if(t.t<=-2.5) belLeave(t); }
  else if(t.state==='leaving'){ const p=t.party; for(const g of p.m){ if(g.gone) continue; if(g.leaveT>0){ g.leaveT-=dt; if(g.leaveT<=0){ g.sitDir=-1; g.sitting=false; } } else if(!g.seatGeo&&!g.path&&!g.going){ g.going=true; const ex=BCX+.3+(g.seat%2)*.42; belGo(g,ex,BD-.9,()=>{ g.path=[[ex,BD+2.0+(g.seat>>1)*.25]]; g.cb=()=>{ g.gone=true; p.out++; belDrop(g); }; }); } }
   if(p.out===p.m.length){ t.party=null; t.state='dirty'; belTask('clear',t); } }
 }
 // une table propre et libre : une nouvelle tablée arrive, le maître d'hôtel la place
 if(!visit.arriving){ visit.arrT-=dt; if(visit.arrT<=0){ const free=visit.tables.filter(t=>t.state==='free'); if(free.length){ const t=free[Math.floor(Math.random()*free.length)]; t.state='held'; const p=belParty(t,false); visit.arriving=p; p.host=0;
    p.m.forEach((g,i)=>{ g.wait=i*.3; belGo(g,BCX-.75+(i%2)*.55,BD-1.3-Math.floor(i/2)*.55,()=>{ p.host++; g.rot=Math.atan2(visit.maitre.fx-g.fx,visit.maitre.fy-g.fy); if(p.host===1){ visit.maitre.belBow=1.3; visit.maitre.rot=Math.atan2(g.fx-visit.maitre.fx,g.fy-visit.maitre.fy); } }); }); p.hostT=1.2; } else visit.arrT=.6; } }
 else { const p=visit.arriving; if(p.host>=p.m.length){ p.hostT-=dt; if(p.hostT<=0){ belSeatParty(p); visit.arriving=null; visit.arrT=.8+Math.random()*1.6; visit.maitre.rot=.55; } } }
 if(visit.maitre.belBow>0) visit.maitre.belBow-=dt;
 belAssign();
 // personnages
 for(const a of visit.agents.slice()){
  if(a.dead) continue;
  if(a.sitDir){ a.sitT=clamp((a.sitT||0)+a.sitDir*dt*2.6,0,1); a.sitK=a.sitT; if(a.sitDir>0&&a.sitT>=1) a.sitDir=0; if(a.sitDir<0&&a.sitT<=0){ a.sitDir=0; a.seatGeo=false; const t=a.party.t, pt=belSeatPt(t,t.seats[a.seat]); a.fx=pt[0]-.5; a.fy=pt[1]-.5; } }
  if(a.pace&&!a.path){ a.paceT=(a.paceT||0)-dt; if(a.paceT<=0){ a.pi=(a.pi+1+Math.floor(Math.random()*(a.pace.length-1)))%a.pace.length; a.path=[a.pace[a.pi]]; a.cb=()=>{ a.paceT=2.5+Math.random()*3; a.rot=0; }; } }
  if(a===visit.somm&&!a.path&&!(a.wait>0)){ a.sommT-=dt; if(a.sommT<=0){ const occ=visit.tables.filter(t=>t.state==='eat'||t.state==='cooking'); if(a.atCave!==false&&occ.length){ const t=occ[Math.floor(Math.random()*occ.length)], p=belSpotAt(t,[a.fx+.5,a.fy+.5]); a.atCave=false; belGo(a,p[0],p[1],()=>{ a.face=t; a.wait=3.4; a.belPour=true; a.then=()=>{ a.face=null; a.belPour=false; a.sommT=.2; }; }); } else { a.atCave=true; belGo(a,1.5,3.0,()=>{ a.rot=-Math.PI/2; a.sommT=5+Math.random()*6; }); } } }
  if(a.staff&&!a.task&&!a.path&&!a.pace&&a!==visit.somm&&a.home&&a.idleT!==undefined){ a.idleT-=dt; if(a.idleT<=0){ a.idleT=undefined; if(Math.hypot(a.fx+.5-a.home[0],a.fy+.5-a.home[1])>.3) belGo(a,a.home[0],a.home[1],()=>{ a.rot=a.home[2]; }); else a.rot=a.home[2]; } }
  a.moving=false;
  if(a.wait>0){ a.wait-=dt; if(a.face) a.rot=Math.atan2(a.face.x-(a.fx+.5),a.face.z-(a.fy+.5)); if(a.wait<=0&&a.then){ const f=a.then; a.then=null; f(); } }
  else if(a.path&&a.path.length){ const [tx,tz]=a.path[0], px=a.fx+.5, pz=a.fy+.5, dx=tx-px, dz=tz-pz, d=Math.hypot(dx,dz);
   if(d<.05){ a.path.shift(); if(!a.path.length){ a.path=null; const cb=a.cb; a.cb=null; if(cb) cb(); } }
   else { // on ne se rentre pas dedans : on laisse passer celui qui est devant, puis on contourne
    let blocked=false; if(a.blockT<1.1) for(const b of visit.agents){ if(b===a||b.seatGeo) continue; const bx=b.fx+.5-px, bz=b.fy+.5-pz, bd=Math.hypot(bx,bz); if(bd<.5&&bd>1e-3&&(bx*dx+bz*dz)/(bd*d)>.45&&(b.id<a.id||!b.path)){ blocked=true; break; } }
    if(blocked){ a.blockT+=dt; } else { a.blockT=Math.max(0,a.blockT-dt*.5); const s=Math.min(d,dt*a.spd); a.fx+=dx/d*s; a.fy+=dz/d*s; a.rot=Math.atan2(dx,dz); a.moving=true; a.x=Math.round(a.fx); a.y=Math.round(a.fy); } } }
  if(a.dead) continue;   // parti pendant ce tour : surtout ne pas lui recréer de silhouette
  let o=visit.objs.get(a); if(!o){ try{ o=makeCharC(a); }catch(e){ continue; } belRoot.add(o.root); visit.objs.set(a,o); }
  try{ animCharC(a,o,dt,T); }catch(e){}
 }
}
let belSunSave=null;
function belSun(on){ const sc=sun.shadow.camera;
 if(on){ belSunSave={p:sun.position.clone(),t:sun.target.position.clone(),l:sc.left,r:sc.right,tp:sc.top,b:sc.bottom}; sun.position.set(BW/2-7,18,BD/2+12); sun.target.position.set(BW/2,0,BD/2); sun.target.updateMatrixWorld(); sc.left=-17; sc.right=17; sc.top=17; sc.bottom=-17; sc.updateProjectionMatrix(); }
 else if(belSunSave){ sun.position.copy(belSunSave.p); sun.target.position.copy(belSunSave.t); sun.target.updateMatrixWorld(); sc.left=belSunSave.l; sc.right=belSunSave.r; sc.top=belSunSave.tp; sc.bottom=belSunSave.b; sc.updateProjectionMatrix(); belSunSave=null; }
}
