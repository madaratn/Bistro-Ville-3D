// ===================== LA VIE DU QUARTIER (v0.73) : la place du marché, en face du bistrot =====================
// Les quatre gardiens des pages du carnet y tiennent boutique, Zoé vend sa limonade, et ça bouge partout.
let lifeA=[], life=null, lifeSay=6;
const lfM=(c,o)=>M(c,Object.assign({roughness:.75},o||{}));
function lfAgent(o,x,z){ const a=mkAgent(Object.assign({id:uid++,kind:'walk',st:'life',x:Math.round(x-.5),y:Math.round(z-.5),fx:x-.5,fy:z-.5,speed:1,plan:[],rotT:0,rot:0},o)); if(!a.look) a.look=randLook(); lifeA.push(a); return a; }
function lfStall(root,x,z,o){ const g=new THREE.Group(), wood=lfM('#8a5a36'), dk=lfM('#5e3b22');
 for(const sx of [-1,1]){ g.add(mesh(CY(.035,.035,1.75,8),dk,sx*1.05,.875,-.85)); g.add(mesh(CY(.035,.035,1.95,8),dk,sx*1.05,.975,.1)); }
 g.add(mesh(RB(2.1,.5,.5,.03),wood,0,.25,0)); g.add(mesh(RB(2.2,.05,.6,.02),lfM('#c79a5e'),0,.52,0));
 const aw=ownMesh(new THREE.BoxGeometry(2.4,.04,1.15),new THREE.MeshStandardMaterial({map:stripeTex(o.awn,'#fff3dc',9),roughness:.85}),0,1.86,-.36); aw.rotation.x=-.2; g.add(aw);
 for(let i=0;i<9;i++) g.add(mesh(new THREE.BoxGeometry(.2,.12,.02),lfM(i%2?o.awn:'#fff3dc'),-.96+i*.24,1.9,.2,false));
 const sg=ownMesh(new THREE.PlaneGeometry(2.3,.5),new THREE.MeshStandardMaterial({map:signBoard(o.sign,o.sbg,o.sfg||'#fff3dc',2.3,.5),transparent:true,roughness:.7}),0,2.3,.14,false); g.add(sg);
 lantern(g,-.8,1.5,.3); lantern(g,.8,1.5,.3);
 g.position.set(x,0,z); root.add(g); return g; }
function lfBird(){ const g=new THREE.Group(), gr=lfM(pick(['#8f97a3','#a9aeb6','#7d8794','#c9c4bb'])); const b=mesh(SP(.07,10,8),gr,0,.08,0); b.scale.set(.8,.75,1.25); g.add(b); const h=new THREE.Group(); h.position.set(0,.14,.07); h.add(mesh(SP(.04,8,6),gr,0,0,0)); const bk=mesh(new THREE.ConeGeometry(.012,.04,6),lfM('#e8a23a'),0,0,.05,false); bk.rotation.x=Math.PI/2; h.add(bk); g.add(h);
 const w=[-1,1].map(s=>{ const p=new THREE.Group(); p.position.set(s*.04,.1,0); const m=mesh(new THREE.BoxGeometry(.13,.012,.09),gr,s*.065,0,0,false); p.add(m); g.add(p); return p; }); g.userData={h,w}; return g; }
function lfCat(){ const g=new THREE.Group(), c=lfM('#e58a2e'), w=lfM('#fff3dc'); const b=mesh(CA(.07,.2),c,0,.13,0); b.rotation.x=Math.PI/2; g.add(b); const h=new THREE.Group(); h.position.set(0,.2,.17); h.add(mesh(SP(.075,10,8),c,0,0,0)); for(const s of [-1,1]){ const e=mesh(new THREE.ConeGeometry(.028,.06,4),c,s*.045,.07,0,false); h.add(e); } h.add(mesh(SP(.03,6,5),w,0,-.025,.055,false)); g.add(h);
 for(const [x,z] of [[-.04,.1],[.04,.1],[-.04,-.1],[.04,-.1]]) g.add(mesh(CY(.016,.016,.1,6),c,x,.05,z));
 const t=new THREE.Group(); t.position.set(0,.16,-.17); const tm=mesh(CY(.014,.014,.2,6),c,0,.09,-.03,false); tm.rotation.x=-.5; t.add(tm); g.add(t); g.userData={t,h}; return g; }
function lfBike(){ const g=new THREE.Group(), fr=lfM(pick(['#e5484d','#3f9bd6','#57b86a','#f2a81d']),{metalness:.3}), ti=lfM('#22252b'); const wh=[];
 for(const x of [-.34,.34]){ const w=mesh(TO(.17,.02),ti,x,.19,0); wh.push(w); g.add(w); const sp=mesh(new THREE.BoxGeometry(.3,.012,.012),lfM('#c9c9c9'),x,.19,0,false); w.userData.sp=sp; g.add(sp); }
 const bar=(x1,y1,x2,y2)=>{ const d=Math.hypot(x2-x1,y2-y1), m=mesh(CY(.016,.016,d,6),fr,(x1+x2)/2,(y1+y2)/2,0,false); m.rotation.z=Math.atan2(x2-x1,-(y2-y1))+Math.PI; g.add(m); };
 bar(-.34,.19,-.08,.42); bar(-.08,.42,.24,.46); bar(.24,.46,.34,.19); bar(-.08,.42,.02,.2); bar(-.34,.19,.02,.2); bar(.24,.46,.22,.6); g.add(mesh(new THREE.BoxGeometry(.03,.03,.3),ti,.22,.6,0,false)); g.add(mesh(RB(.14,.04,.08,.015),ti,-.1,.47,0,false));
 const L=randLook(), sk=lfM(L.skin), tp=lfM(L.body), pn=lfM(L.pants||'#3b4a6b'); const tor=mesh(CA(.09,.2),tp,-.02,.72,0); tor.rotation.z=-.45; g.add(tor); g.add(mesh(SP(.1,12,10),sk,.1,.95,0)); g.add(mesh(SP(.105,12,10,0,Math.PI*2,0,Math.PI*.55),lfM(pick(['#e5484d','#f4f4f4','#2b2b30','#ffd23f'])),.1,.97,0,false));
 const legs=[-1,1].map(s=>{ const p=new THREE.Group(); p.position.set(-.08,.52,s*.06); p.add(mesh(CA(.04,.22),pn,0,-.14,0,false)); g.add(p); return p; });
 for(const s of [-1,1]){ const a=mesh(CA(.03,.24),tp,.1,.74,s*.1,false); a.rotation.z=-1.1; g.add(a); }
 const bk=mesh(RB(.2,.14,.22,.02),lfM('#b9895a'),.42,.42,0,false); g.add(bk); g.add(mesh(CY(.02,.02,.26,6),lfM('#d9a85c'),.42,.56,.03,false)); g.userData={wh,legs}; return g; }
function buildLife(root){ lifeA=[]; const c=S/2, zs=S+8.15, L=life={birds:[],fl:[],c,zs,t:0,smoke:[],keep:[],bikeT:6,flockT:4,str:[]};
 const pl=ownMesh(new THREE.PlaneGeometry(19,7.7),new THREE.MeshStandardMaterial({map:(()=>{ const t=streetTex(); t.repeat.set(19,7.7); return t; })(),roughness:.9}),c,.012,S+10.6,false); pl.rotation.x=-Math.PI/2; root.add(pl);
 root.add(mesh(new THREE.BoxGeometry(19.2,.08,.12),lfM('#e9dfcf'),c,.03,S+14.5,false));
 // --- Le Fournil de Lucien ---
 { const g=lfStall(root,c-7.4,zs,{awn:'#c98a3e',sign:'Le Fournil de Lucien',sbg:'#6b4226',sfg:'#ffe2a8'}), br=lfM('#b5653a'), cr=lfM('#d9a85c'), dkc=lfM('#a8703a');
  g.add(mesh(RB(.9,.9,.6,.05),br,-.5,.45,-1.0)); const d=mesh(CY(.22,.22,.05,16,1,false,0,Math.PI),lfM('#2a1c14'),-.5,.42,-.69,false); d.rotation.x=Math.PI/2; g.add(d); g.add(mesh(SP(.12,8,6),lfM('#ff8a2a',{emissive:'#ff6a10',emissiveIntensity:1.6}),-.5,.47,-.74,false));
  g.add(mesh(new THREE.BoxGeometry(.24,1.5,.24),br,-.72,1.5,-1.1)); L.smoke.push([c-7.4-.72,2.35,zs-1.1]);
  const bas=mesh(CY(.2,.16,.3,12),lfM('#c79a5e'),-.75,.69,.02); g.add(bas); for(let i=0;i<5;i++){ const b=mesh(CA(.03,.5),cr,-.75+Math.cos(i*1.26)*.08,.98,.02+Math.sin(i*1.26)*.08,false); b.rotation.z=Math.cos(i*1.26)*.18; b.rotation.x=Math.sin(i*1.26)*.18; g.add(b); }
  for(let i=0;i<4;i++){ const l=mesh(SP(.11,10,8),i%2?dkc:cr,-.3+i*.27,.6,.05+(i%2)*.1,false); l.scale.y=.6; g.add(l); } for(let i=0;i<3;i++){ const t=mesh(TO(.07,.03),cr,.55+i*.03,.57+i*.05,-.1,false); t.rotation.x=Math.PI/2; g.add(t); }
  L.keep.push({k:'l',x:c-7.1,z:zs-.5,say:['Pain chaud !','Croissants du matin !','La fournée sort !','Baguette tradition !']}); }
 // --- Les paniers de Rosa ---
 { const g=lfStall(root,c-4.2,zs,{awn:'#5a9a4f',sign:'Les Paniers de Rosa',sbg:'#3f6b3a'});
  const cols=[['#e5484d','#e5484d','#c8553d'],['#f2c94c','#e8a23a','#f2c94c'],['#6fae4f','#8fc45a','#6fae4f'],['#8a4fa8','#a868c8','#8a4fa8'],['#ff8a3d','#ff8a3d','#e8772e']];
  cols.forEach((cs,i)=>{ const x=-.8+i*.4; const cr=mesh(RB(.34,.12,.4,.02),lfM('#c79a5e'),x,.6,0); cr.rotation.x=.25; g.add(cr); for(let k=0;k<6;k++) g.add(mesh(SP(.06,8,6),lfM(cs[k%3]),x-.09+(k%3)*.09,.68+(k>2?.035:0),-.07+(k>2?.1:0)+(k%2)*.03,false)); });
  for(const [px,sc] of [[-1.3,1],[1.35,.8],[1.6,.55]]){ const p=mesh(SP(.17,12,10),lfM('#e58a2e'),px,.13*sc,.5); p.scale.set(sc,.72*sc,sc); g.add(p); }
  const pot=mesh(CY(.13,.1,.2,10),lfM('#b5653a'),1.25,.1,-.6); g.add(pot); for(let i=0;i<5;i++) g.add(mesh(SP(.07,8,6),lfM(FLW[i]),1.25+Math.cos(i*1.26)*.09,.3+(i%2)*.05,-.6+Math.sin(i*1.26)*.09,false));
  L.keep.push({k:'r',x:c-4.2,z:zs-.5,say:['Tomates du jardin !','Cueilli ce matin !','Goûtez-moi ça !','Trois pour deux !']}); }
 // --- La pêche du Capitaine ---
 { const g=lfStall(root,c+4.2,zs,{awn:'#2f5f8f',sign:'La Pêche du Capitaine',sbg:'#27496b'});
  g.add(mesh(RB(1.7,.1,.46,.02),lfM('#eef6fb',{roughness:.3}),-.1,.58,0,false)); for(let i=0;i<7;i++){ const f=mesh(SP(.07,10,8),lfM(i%3===2?'#f29a8a':'#b8c4cf',{metalness:.5,roughness:.3}),-.8+i*.23,.65,(i%2)*.12-.05,false); f.scale.set(1.9,.5,.75); f.rotation.y=.5-(i%2); g.add(f); }
  const net=mesh(SP(.16,10,8),lfM('#e5484d'),.85,.68,.02,false); g.add(net); g.add(mesh(TO(.16,.03),lfM('#ffffff'),.85,.68,.02,false));
  const bt=new THREE.Group(), hull=mesh(SP(.5,16,10,0,Math.PI*2,Math.PI/2,Math.PI/2),lfM('#f4f4f4'),0,.42,0); hull.scale.set(.55,.75,1.7); bt.add(hull); const rim=mesh(TO(.5,.035),lfM('#c8423a'),0,.42,0,false); rim.rotation.x=Math.PI/2; rim.scale.set(.55,1.7,1); bt.add(rim);
  bt.add(mesh(new THREE.BoxGeometry(.5,.03,.14),lfM('#8a5a36'),0,.36,0,false)); bt.add(mesh(CY(.02,.02,1.3,6),lfM('#8a5a36'),0,.95,.25)); const fg=mesh(new THREE.BoxGeometry(.02,.2,.34),lfM('#c8423a'),0,1.48,.08,false); bt.add(fg); L.flag=fg; for(const s of [-1,1]) bt.add(mesh(CY(.07,.07,.1,10),lfM('#3a3530'),s*.2,.07,-.3)); bt.scale.setScalar(.72); bt.position.set(-1.85,0,-.5); bt.rotation.y=-.35; g.add(bt);
  L.keep.push({k:'y',x:c+4.1,z:zs-.5,say:['Pêche du jour !','Sardines toutes fraîches !','Arrivage de ce matin !','Ohé, du bistrot !']}); }
 // --- Les bouquins de Monsieur Albert ---
 { const g=lfStall(root,c+7.4,zs,{awn:'#8a6a4a',sign:'Les Bouquins d’Albert',sbg:'#5a4632',sfg:'#f2e2c4'}); const bc=['#b8323a','#2f5f8f','#3f8a4f','#d9b24a','#7a5c9a','#c9772e'];
  for(let i=0;i<14;i++){ const h=.2+((i*7)%5)*.02; g.add(mesh(new THREE.BoxGeometry(.07,h,.2),lfM(bc[i%6]),-.9+i*.085,.55+h/2,-.05,false)); }
  for(let i=0;i<4;i++) g.add(mesh(new THREE.BoxGeometry(.3,.05,.22),lfM(bc[(i+2)%6]),.6,.57+i*.05,.02,false));
  const tb=new THREE.Group(); tb.add(mesh(CY(.03,.03,.5,8),lfM('#3a3530'),0,.25,0)); tb.add(mesh(CY(.32,.32,.04,18),lfM('#c79a5e'),0,.52,0)); const bd=ownMesh(new THREE.BoxGeometry(.34,.02,.34),new THREE.MeshStandardMaterial({map:chkTex('#f2e2c4','#3a2a1f',4),roughness:.6}),0,.55,0,false); tb.add(bd); for(let i=0;i<6;i++) tb.add(mesh(CY(.018,.022,.06,8),lfM(i%2?'#2a1c14':'#fff6e0'),-.12+(i%3)*.12,.59,-.08+Math.floor(i/3)*.17,false)); tb.position.set(-1.75,0,.75); g.add(tb);
  for(const s of [-1,1]){ const st=mesh(CY(.13,.11,.3,12),lfM('#8a5a36'),-1.75+s*.5,.15,.75); g.add(st); }
  L.keep.push({k:'a',x:c+7.3,z:zs-.5,say:['Hm. Bonjour.','Un bon livre, ça nourrit aussi.','Échec et mat.','De mon temps…']}); }
 // --- la limonade de Zoé ---
 { const g=new THREE.Group(), x=c+2.3, z=S+9.75; g.add(mesh(RB(.9,.42,.4,.03),lfM('#f2a9c0'),0,.21,0)); g.add(mesh(RB(1,.04,.5,.02),lfM('#fff6e0'),0,.44,0));
  g.add(mesh(CY(.08,.07,.2,12),lfM('#ffe36a',{transparent:true,opacity:.85,roughness:.2}),-.2,.56,0,false)); for(let i=0;i<3;i++) g.add(mesh(CY(.035,.03,.08,8),lfM('#fff'),.08+i*.11,.5,.05,false)); g.add(mesh(SP(.05,8,6),lfM('#ffd23f'),.34,.5,-.1,false));
  for(const s of [-1,1]) g.add(mesh(CY(.02,.02,1.2,6),lfM('#8a5a36'),s*.47,.6,-.2)); const sg=ownMesh(new THREE.PlaneGeometry(1,.3),new THREE.MeshStandardMaterial({map:signBoard('Limonade de Zoé','#ffd23f','#b8323a',1,.3),transparent:true,roughness:.7}),0,1.12,-.19,false); g.add(sg);
  g.position.set(x,0,z); root.add(g); L.keep.push({k:'z',x,z:z-.42,kid:1,say:['Limonade ! Une pièce !','C’est moi qui l’ai faite !','Avec de vrais citrons !']}); }
 // --- la fontaine ---
 { const g=new THREE.Group(), st=lfM('#d8cdb8',{roughness:.9}); g.add(mesh(CY(1.0,1.08,.3,24),st,0,.15,0)); const wt=mesh(CY(.9,.9,.04,24),lfM('#6fc3e8',{transparent:true,opacity:.8,roughness:.1,metalness:.2}),0,.29,0,false); g.add(wt); L.water=wt;
  g.add(mesh(CY(.11,.16,.75,12),st,0,.6,0)); g.add(mesh(CY(.42,.14,.12,18),st,0,1.0,0)); g.add(mesh(CY(.36,.36,.03,18),lfM('#6fc3e8',{transparent:true,opacity:.8,roughness:.1}),0,1.06,0,false)); g.add(mesh(SP(.08,10,8),st,0,1.16,0));
  g.position.set(c-.4,0,S+9.35); root.add(g); L.fx=c-.4; L.fz=S+9.35; }
 garland(root,c-8.4,2.15,zs+.35,c-3.2,2.15,zs+.35,12); garland(root,c-3.2,2.15,zs+.35,c+3.2,2.35,zs+.35,14); garland(root,c+3.2,2.15,zs+.35,c+8.4,2.15,zs+.35,12);
 for(const bx of [c-2.6,c+1.6]){ const b=makeBench('#5f8a6e'); b.position.set(bx,0,S+10.6); b.rotation.y=Math.PI; root.add(b); }
 // --- les commerçants ---
 for(const K of L.keep){ const W=WHO_LOOK[K.k]; if(!W) continue; const a=lfAgent({id:W.id+500,s:{id:W.id,role:'story',outfit:W.outfit},kidF:K.kid},K.x,K.z); a.keep=K; K.a=a; a.idle=Math.random()*4; }
 // --- les badauds, l'enfant au ballon ---
 if(!LITE){ for(let i=0;i<6;i++){ const a=lfAgent({},c-8+i*3,S+9.2+Math.random()*.8); a.stroll=1; a.speed=.85+Math.random()*.2; L.str.push(a); }
  const k=lfAgent({kidF:1},L.fx+1.7,L.fz); k.run=1; k.speed=1.9; k.ang=0; k.prop=()=>{ const g=new THREE.Group(); g.add(mesh(SP(.12,12,10),lfM(pick(['#e5484d','#4fc3f7','#ffd23f']),{roughness:.3}),.22,1.25,0)); g.add(mesh(CY(.004,.004,.62,4),lfM('#fff'),.22,.88,0,false)); return g; }; L.kid=k; }
 // --- pigeons, chat ---
 for(let i=0;i<(LITE?3:7);i++){ const b=lfBird(); b.userData.x=L.fx+rnd(-2.4,2.4); b.userData.z=S+10.3+rnd(-.5,.5); b.userData.ph=Math.random()*6; b.userData.m=0; b.userData.t=rnd(6,16); b.position.set(b.userData.x,.02,b.userData.z); b.rotation.y=Math.random()*6; root.add(b); L.birds.push(b); }
 L.cat=lfCat(); L.cat.userData.x=c-6; L.cat.userData.d=1; L.cat.userData.p=0; L.cat.position.set(c-6,.27,S+6.45); root.add(L.cat);
 // --- au loin : la montgolfière, le vol d'oiseaux ---
 { const g=new THREE.Group(), cols=['#e5484d','#ffd23f','#3f9bd6','#fff3dc']; for(let i=0;i<8;i++){ const s=mesh(new THREE.SphereGeometry(1.5,10,14,i*Math.PI/4,Math.PI/4),lfM(cols[i%4],{side:THREE.DoubleSide}),0,0,0,false); s.scale.y=1.2; s.userData.own=1; g.add(s); } g.add(mesh(CY(.5,.3,.7,10),lfM('#e5484d'),0,-1.9,0,false)); g.add(mesh(RB(.5,.4,.5,.05),lfM('#8a5a36'),0,-2.9,0,false)); for(const [x,z] of [[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]]) g.add(mesh(CY(.01,.01,.8,4),lfM('#3a3530'),x,-2.4,z,false));
  g.position.set(c-14,11,-16); root.add(g); L.bal=g; }
 { const g=new THREE.Group(); L.flock=[]; for(let i=0;i<5;i++){ const b=new THREE.Group(), m=lfM('#3a3a44'); const w=[-1,1].map(s=>{ const p=new THREE.Group(); p.add(mesh(new THREE.BoxGeometry(.3,.015,.1),m,s*.15,0,0,false)); b.add(p); return p; }); b.userData.w=w; const r=Math.ceil(i/2), sd=i%2?1:-1; b.position.set(-r*.5,0,i?sd*r*.45:0); g.add(b); L.flock.push(b); } g.position.set(-30,7,-3); g.visible=false; root.add(g); L.flockG=g; }
 try{ buildLife2(root,L); }catch(e){ console.warn(e); }
 for(const o of root.children) if(!o.userData.side&&o.position.z>S+6.6) o.userData.side='-';
 L.trees=[[-6,S+5.3],[1.5,S+5.4],[S-2,S+5.3],[S+5,S+5.4],[-2.4,1],[S+1.6,1.6]];
}
function lfStroll(a){ const L=life, r=Math.random(); let x,z; if(r<.62){ const K=pick(L.keep); x=K.x+rnd(-.5,.5); z=K.kid?K.z+1.05:L.zs+rnd(.75,1.0); a.plan.push({pts:[[x-.5,z-.5]]},{w:rnd(3,6),fn:q=>{ q.rotT=Math.PI; if(Math.random()<.3) q.hop=.4; }}); }
 else if(r<.8){ const an=Math.random()*6.28; x=L.fx+Math.cos(an)*1.55; z=L.fz+Math.abs(Math.sin(an))*1.3+.3; a.plan.push({pts:[[x-.5,z-.5]]},{w:rnd(2,5),fn:q=>{ q.rotT=Math.atan2(L.fx-x,L.fz-z); }}); }
 else if(r<.9&&L.accP){ x=L.accP[0]+rnd(-1,1); z=L.accP[1]-rnd(1.1,1.6); a.plan.push({pts:[[x-.5,z-.5]]},{w:rnd(4,9),fn:q=>{ q.rotT=0; if(Math.random()<.5) q.hop=.4; }}); }
 else if(r<.96&&L.carP){ const an=rnd(2.2,4.2); x=L.carP[0]+Math.cos(an)*2.3; z=L.carP[1]+Math.sin(an)*2.3; a.plan.push({pts:[[x-.5,z-.5]]},{w:rnd(4,8),fn:q=>{ q.rotT=Math.atan2(L.carP[0]-x,L.carP[1]-z); }}); }
 else { x=L.c+rnd(-8.5,8.5); z=S+rnd(9.4,11.2); a.plan.push({pts:[[x-.5,z-.5]]},{w:rnd(.5,2)}); } }
function lifeTick(dt,T){ const L=life; if(!L) return; { const h=!!(cine||visit.on); if(h!==L.hid){ L.hid=h; for(const a of lifeA) a.hide=h; } if(h) return; } L.t+=dt; dt=Math.min(dt,.1);
 for(const a of lifeA){ if(a.stroll){ if(!a.plan.length&&!a.path.length) lfStroll(a); evActTick(a,dt); a.dead=0; }
  else if(a.run){ a.ang+=dt*1.9/1.75; const x=L.fx+Math.cos(a.ang)*1.75, z=L.fz+Math.sin(a.ang)*1.75; a.fx=x-.5; a.fy=z-.5; a.rot=a.rotT=Math.atan2(-Math.sin(a.ang),Math.cos(a.ang)); a.moving=true; a.v=1.9; a.ph+=dt*9; const o=aObjs.get(a); if(o&&a.prop&&!a.propOk){ a.propOk=1; o.root.add(a.prop()); } }
  else if(a.keep){ a.idle-=dt; if(a.idle<=0){ a.idle=rnd(3,7); a.rotT=rnd(-.5,.5); if(Math.random()<.35) a.hop=.4; } } }
 if(!state.lifeHint&&state.tuto&&mode==='play'&&L.t>25&&!ui.panel&&!ev){ state.lifeHint=1; toast('Nouveau : la place du marché, en face du bistrot. Fais glisser la vue pour aller voir Lucien, Rosa, le Capitaine, Albert et Zoé.'); }
 lifeSay-=dt; if(lifeSay<=0&&mode==='play'&&!ui.panel){ lifeSay=rnd(7,13); const K=pick(L.keep); if(K.a){ floatAt(K.x-.5,K.z-.5,pick(K.say),SAGA_WHO[K.k]?SAGA_WHO[K.k][1]:'#3a2a1f'); K.a.hop=.45; } }
 if(!LITE){ for(const p of L.smoke) if(Math.random()<dt*3) spawnPart(GLOW,'#f4efe6',p[0]+rnd(-.04,.04),p[1],p[2],rnd(.1,.3),rnd(.45,.7),rnd(-.05,.05),2.6,.3,3,false);
  if(Math.random()<dt*26){ const an=Math.random()*6.28; spawnPart(GLOW,'#bfe9ff',L.fx,1.22,L.fz,Math.cos(an)*rnd(.25,.5),rnd(.9,1.5),Math.sin(an)*rnd(.25,.5),.75,.09,0,false); }
  if(Math.random()<dt*.8){ const t=pick(L.trees); spawnPart(STAR,pick(['#e8a23a','#c9772e','#d9c04a','#b5653a']),t[0]+rnd(-.5,.5),rnd(1.6,2.3),t[1]+rnd(-.5,.5),rnd(-.3,.3),rnd(-.1,.2),rnd(-.2,.3),2.2,.1,0,false); } }
 if(L.water) L.water.position.y=.29+Math.sin(T*3)*.006; if(L.flag) L.flag.rotation.y=Math.sin(T*5)*.35;
 // pigeons
 let scare=false; if(L.kid&&Math.sin(L.kid.ang)>.92) scare=Math.random()<dt*1.2;
 for(const b of L.birds){ const u=b.userData; u.t-=dt;
  if(u.m===0){ u.h.rotation.x=Math.max(0,Math.sin(T*5+u.ph))*.9; if(Math.sin(T*1.3+u.ph*3)>.96){ b.rotation.y+=dt*4; b.position.x+=Math.sin(b.rotation.y)*dt*.4; b.position.z+=Math.cos(b.rotation.y)*dt*.4; } for(const w of u.w) w.rotation.z=0;
   if(u.t<=0||scare){ u.m=1; u.t=rnd(4.5,7); u.T=u.t; u.a=Math.atan2(b.position.z-L.fz,b.position.x-L.fx); u.r=Math.hypot(b.position.x-L.fx,b.position.z-L.fz); u.tx=L.fx+rnd(-3.5,3.5); u.tz=S+rnd(9.9,10.8); u.sx=b.position.x; u.sz=b.position.z; } }
  else { const k=1-u.t/u.T, e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; u.a+=dt*1.6; const R=2.6+Math.sin(k*Math.PI)*1.2, cx=L.fx+Math.cos(u.a)*R, cz=L.fz+.6+Math.sin(u.a)*R*.6, bl=Math.sin(k*Math.PI), px=b.position.x, pz=b.position.z;
   b.position.set((u.sx+(u.tx-u.sx)*e)*(1-bl)+cx*bl,.02+bl*(2.2+Math.sin(u.ph)*.5),(u.sz+(u.tz-u.sz)*e)*(1-bl)+cz*bl); b.rotation.y=Math.atan2(b.position.x-px,b.position.z-pz); u.w.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(T*26+u.ph)*.9); u.h.rotation.x=0; if(u.t<=0){ u.m=0; u.t=rnd(9,22); } } }
 // le chat sur le muret
 { const c=L.cat, u=c.userData; u.p-=dt; if(u.p>0){ u.t.rotation.z=Math.sin(T*2.2)*.5; u.h.rotation.y=Math.sin(T*.7)*.6; } else { u.x+=u.d*dt*.55; if(u.x>L.c+9||u.x<L.c-9){ u.d*=-1; } if(Math.random()<dt*.12) u.p=rnd(3,8); c.position.x=u.x; c.position.y=.27+Math.abs(Math.sin(T*7))*.012; c.rotation.y=u.d>0?Math.PI/2:-Math.PI/2; u.t.rotation.z=Math.sin(T*4)*.25; u.h.rotation.y=0; } }
 try{ lifeTick2(dt,T); }catch(e){ console.warn(e); }
 // montgolfière et vol d'oiseaux
 if(L.bal){ L.bal.position.x+=dt*.22; L.bal.position.y=11+Math.sin(T*.4)*.5; L.bal.rotation.y+=dt*.05; if(L.bal.position.x>L.c+34) L.bal.position.x=L.c-34; }
 if(L.flockG){ const g=L.flockG; if(g.visible){ g.position.x+=dt*3.2; g.position.y=7+Math.sin(T*.8)*.3; for(const b of L.flock) b.userData.w.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(T*9+b.position.z*3)*.6); if(g.position.x>S+34){ g.visible=false; L.flockT=rnd(14,30); } } else { L.flockT-=dt; if(L.flockT<=0){ g.visible=true; g.position.set(-28,7,rnd(-6,S*.4)); } } }
 // le cycliste
 if(L.bike){ const b=L.bike; b.x+=b.v*dt; b.g.position.x=b.x; for(const w of b.g.userData.wh){ w.userData.sp.rotation.z-=b.v*dt*5*(b.v>0?1:-1)*1; } b.g.userData.legs.forEach((p,i)=>p.rotation.z=Math.sin(T*8+i*Math.PI)*.6); if(b.x<-20||b.x>S+29){ fxRoot.remove(b.g); L.bike=null; L.bikeT=rnd(9,20); } }
 else { L.bikeT-=dt; if(L.bikeT<=0){ const d=Math.random()<.5?1:-1, g=lfBike(); const b={g,x:d>0?-19:S+28,v:d*rnd(2.2,2.9)}; g.position.set(b.x,0,d>0?S+2.14:S+3.88); g.rotation.y=d>0?0:Math.PI; fxRoot.add(g); L.bike=b; } }
}
