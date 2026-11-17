/* --- personnages réalistes (Quaternius, CC0) animés par squelette --- */
const REAL={ready:false,models:{},clips:{},scale:1,hipsY:.5};
const R_SKIN=['#f6d0b1','#eab48c','#d49a6a','#b07448','#8a5634','#5e3a22','#f3c9a8','#c98e63'];
const R_HAIR=['#2a1b12','#4a2e1b','#6b4226','#8a5a2e','#c8a065','#e0c88f','#9a9a9a','#8e3b22','#151515','#5a3a24'];
const R_TOP=['#e8a23a','#d9694a','#8fb58a','#e3a0a0','#7fb3d5','#c8553d','#3f8f8a','#b9a2d8','#f2c94c','#5f8fbf','#e98b5b','#a7c7a0','#d98f4a','#c96f7a','#6aa5a0'];
const R_PANTS=['#3f5f8a','#5577a3','#c9a878','#5a4a42','#7a8a5a','#8a6a52','#2f4466','#a88f7a','#4a5568'];
const R_SHOES=['#5a3a22','#f2efe6','#c8553d','#3a3a3a','#e8a23a','#8a5a3a'];
const R_CUST={F:['Female_Casual','Female_Formal','Female_Adventurer'],M:['Male_Beach','Male_Casual_2','Male_Casual_Hoodie','Male_Farmer']};
const KEEPC=/^(Eye|Eyebrows|Earrings|Gold|Metal|Metal_Dark)$/;
function b64buf(s){ const bin=atob(s), n=bin.length, u=new Uint8Array(n); for(let i=0;i<n;i++) u[i]=bin.charCodeAt(i); return u.buffer; }
async function loadReal(){
 try{
  await MeshoptDecoder.ready;
  const ld=new GLTFLoader(); ld.setMeshoptDecoder(MeshoptDecoder);
  const parse=k=>new Promise((res,rej)=>ld.parse(b64buf(CHARS_DATA[k]),'',res,rej));
  const A=await parse('ANIMS'); for(const c of A.animations) REAL.clips[c.name]=c;
  for(const k of Object.keys(CHARS_DATA)) if(k!=='ANIMS'){ const g=await parse(k); REAL.models[k]=g.scene; }
  // échelle et hauteur des hanches
  const ref=REAL.models.Male_Casual_2; ref.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(ref), h=box.getSize(new THREE.Vector3()).y;
  REAL.scale=1.22/h;
  const hp=ref.getObjectByName('Hips'); const v=hp.getWorldPosition(new THREE.Vector3()); REAL.hipsY=v.y*REAL.scale;
  REAL.ready=true;
  for(const [a,o] of aObjs) agentRoot.remove(o.root); aObjs.clear();
 }catch(e){ console.warn('Personnages réalistes indisponibles',e); }
}
function partOf(mesh){ const n=(mesh.name||'').toLowerCase(); return n.includes('head')?'head':n.includes('feet')?'feet':(n.includes('legs')||n.includes('pants'))?'legs':'body'; }
function makeCharR(a){
 const role=a.s?a.s.role:null, id=a.id||(a.s?a.s.id:3)*7, L=a.look||{};
 const r=seeded(id*13+5);
 const fem=role?((a.s.id||0)%2===1):(L.skirt||L.hs===1||L.hs===4||r()<.45);
 let key;
 if(role==='waiter'||role==='barman') key=fem?'Female_Suit':'Male_Suit';
 else if(role==='chef') key=fem?'Female_Casual':'Male_Casual_2';
 else if(role==='cleaner') key=fem?'Female_Worker':'Male_Worker';
 else { const l=R_CUST[fem?'F':'M']; key=l[Math.floor(r()*l.length)]; }
 const src=REAL.models[key]||REAL.models.Male_Casual_2;
 const sc=a.kidF?.72:1, HS=a.kidF?1.5:1.3;
 const model=SkeletonUtils.clone(src); model.scale.setScalar(REAL.scale*sc);
 const skin=R_SKIN.includes(L.skin)?L.skin:R_SKIN[Math.floor(r()*R_SKIN.length)];
 const hair=R_HAIR[Math.floor(r()*R_HAIR.length)];
 const pick2=arr=>arr[Math.floor(r()*arr.length)];
 const byName={};
 const colFor=(name,part)=>{
  if(name==='Skin'||name==='Eye') return skin; if(name==='Skin_Darker') return shade(skin,-.15);
  if(/hair|beard|eyebrow|moustache/i.test(name)) return hair;
  if(KEEPC.test(name)) return null;
  if(part==='head'&&!role&&!/hat|cap|helmet/i.test(name)) return hair;
  if(role==='waiter') return null;
  if(role==='barman') return part==='legs'?'#1d1e22':part==='feet'?'#141416':/^(Suit|Black)$/.test(name)?'#7a1f2e':name==='Tie'?'#d9a441':null;
  if(role==='chef') return part==='legs'?'#2f3038':part==='feet'?'#202024':'#f4f2ec';
  if(role==='cleaner') return /Vest/.test(name)?'#2bb3b1':/Yellow/.test(name)?'#1f8f8d':null;
  const k=part+':'+name; if(!byName[k]) byName[k]=part==='legs'?pick2(R_PANTS):part==='feet'?pick2(R_SHOES):pick2(R_TOP);
  return byName[k];
 };
 model.traverse(m=>{
  if(!m.isMesh) return;
  m.castShadow=true; m.receiveShadow=true; m.frustumCulled=false;
  const part=partOf(m);
  const one=mm=>{ const c=colFor(mm.name,part); if(!c) return mm; const n=mm.clone(); n.color.set(c); n.roughness=.7; n.metalness=0; return n; };
  m.material=Array.isArray(m.material)?m.material.map(one):one(m.material);
 });
 const root=new THREE.Group(); root.add(model);
 const B=n=>model.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(n));
 const bones={hips:B('Hips'),chest:B('Chest'),neck:B('Neck'),head:B('Head'),ulL:B('UpperLeg.L'),ulR:B('UpperLeg.R'),llL:B('LowerLeg.L'),llR:B('LowerLeg.R'),uaL:B('UpperArm.L'),uaR:B('UpperArm.R'),laL:B('LowerArm.L'),laR:B('LowerArm.R'),wL:B('Wrist.L'),wR:B('Wrist.R'),ftL:B('Foot.L'),ftR:B('Foot.R')};
 // visage expressif : grands yeux brillants, joues roses, sourire
 let face=null;
 if(bones.head){ root.updateMatrixWorld(true); const hb=bones.head, ws=hb.getWorldScale(new THREE.Vector3()).x;
  const fg=new THREE.Group(); fg.quaternion.copy(hb.getWorldQuaternion(new THREE.Quaternion()).invert()); fg.scale.setScalar(sc/ws); hb.add(fg);
  const dark=M('#33241c',{roughness:.15}), white=M('#ffffff',{roughness:.2,emissive:'#ffffff',emissiveIntensity:.35});
  const eyes=new THREE.Group(), arcs=new THREE.Group();
  for(const sx of [-1,1]){ const e=mesh(SP(.0175,12,10),dark,sx*.034,.079,.079,false); e.scale.set(1,1.3,.5); eyes.add(e); eyes.add(mesh(SP(.0055,8,6),white,sx*.034+.006,.087,.0885,false));
   arcs.add(mesh(geo('eyeArc',()=>new THREE.TorusGeometry(.015,.0042,6,12,Math.PI)),dark,sx*.034,.074,.085,false)); }
  const blushM=new THREE.MeshBasicMaterial({color:'#ff8f8f',transparent:true,opacity:.42,depthWrite:false}); blushM.userData.own=1;
  for(const sx of [-1,1]){ const c=new THREE.Mesh(SP(.017,10,8),blushM); c.position.set(sx*.052,.05,.071); c.scale.set(1,.65,.3); fg.add(c); }
  const smile=mesh(geo('smileArc',()=>new THREE.TorusGeometry(.015,.0036,6,12,Math.PI)),M('#8a3a34',{roughness:.5}),0,.043,.083,false); smile.rotation.z=Math.PI;
  const open=mesh(SP(.013,10,8),M('#7a2a2a',{roughness:.6}),0,.034,.082,false); open.scale.set(1.1,.8,.4); open.visible=false;
  arcs.visible=false; fg.add(eyes,arcs,smile,open); face={eyes,arcs,smile,open}; }
 const mixer=new THREE.AnimationMixer(model);
 const act={}; for(const k in REAL.clips) act[k]=mixer.clipAction(REAL.clips[k]);
 const idleName=role?'Idle':'Idle_Neutral';
 act[idleName].play();
 // accessoires
 const tray=new THREE.Group(); tray.add(mesh(CY(.15,.15,.012,24),M('#cfd4db',{metalness:.6,roughness:.25}),0,0,0)); tray.add(mesh(CY(.09,.065,.015,20),M('#ffffff'),0,.014,0,false)); const tsp=emoSprite('🍽️',.24); tsp.position.y=.1; tray.add(tsp); tray.visible=false; root.add(tray);
 const fork=new THREE.Group(); const sil=M('#d9dde3',{metalness:.8,roughness:.25}); fork.add(mesh(new THREE.BoxGeometry(.008,.11,.005),sil,0,.03,0,false)); for(let i=-1;i<=1;i++) fork.add(mesh(new THREE.BoxGeometry(.004,.03,.004),sil,i*.006,.095,0,false)); fork.visible=false; root.add(fork);
 const phone=new THREE.Group(); phone.add(mesh(RB(.045,.085,.01,.005),M('#22252b',{roughness:.3}),0,0,0,false)); phone.add(mesh(new THREE.BoxGeometry(.036,.068,.002),M('#9fd6ff',{emissive:'#6fb8ff',emissiveIntensity:.8}),0,0,.006,false)); phone.visible=false; root.add(phone);
 // tablette de commande / terminal de paiement, bac de débarrassage, carte du menu
 const tab=new THREE.Group(); tab.add(mesh(RB(.21,.012,.15,.008),M('#25282e',{roughness:.35}),0,0,0,false));
 const tabScr=new THREE.MeshStandardMaterial({color:'#dff3ff',emissive:'#8fd0ff',emissiveIntensity:.7,roughness:.3}); tabScr.userData.own=1;
 tab.add(mesh(new THREE.BoxGeometry(.19,.002,.13),tabScr,0,.007,0,false)); for(let i=0;i<3;i++) tab.add(mesh(new THREE.BoxGeometry(.12-i*.03,.002,.012),M('#5aa9e6',{emissive:'#3f8fd6',emissiveIntensity:.5}),-.02+i*.012,.009,-.04+i*.03,false)); tab.visible=false; root.add(tab);
 const tpe=new THREE.Group(); tpe.add(mesh(RB(.07,.02,.13,.008),M('#2b2e34',{roughness:.4}),0,0,0,false)); tpe.add(mesh(new THREE.BoxGeometry(.055,.002,.04),M('#bfe8c9',{emissive:'#7fdc9a',emissiveIntensity:.6}),0,.011,-.03,false));
 for(let i=0;i<3;i++) for(let k=0;k<3;k++) tpe.add(mesh(new THREE.BoxGeometry(.013,.004,.011),M('#dfe3e8'),(i-1)*.018,.011,.012+k*.016,false)); tpe.visible=false; root.add(tpe);
 const tub=new THREE.Group(); const tubM=M('#8d969f',{roughness:.6}); tub.add(mesh(RB(.34,.012,.24,.01),tubM,0,0,0,false));
 for(const [w,d,x,z] of [[.34,.012,0,.115],[.34,.012,0,-.115],[.012,.24,.165,0],[.012,.24,-.165,0]]) tub.add(mesh(new THREE.BoxGeometry(w,.09,d),tubM,x,.045,z,false));
 const tubPl=new THREE.Group(); for(let i=0;i<3;i++) tubPl.add(mesh(CY(.08,.06,.012,16),M('#f6f3ee',{roughness:.3}),-.06+i*.06,.02+i*.013,(i%2)*.02,false)); tubPl.add(mesh(CY(.025,.022,.06,10),M('#e8f4fb',{transparent:true,opacity:.6}),.1,.04,-.05,false)); tub.add(tubPl); tub.visible=false; root.add(tub);
 const menuB=new THREE.Group(); const cov=M('#7a2e2a',{roughness:.7}), pg=M('#fbf6ea',{roughness:.9});
 for(const sd of [-1,1]){ const h=new THREE.Group(); h.add(mesh(new THREE.BoxGeometry(.09,.004,.13),cov,sd*.045,0,0,false)); h.add(mesh(new THREE.BoxGeometry(.084,.003,.122),pg,sd*.045,.0035,0,false)); h.rotation.z=sd*-.28; menuB.add(h); }
 menuB.visible=false; root.add(menuB);
 let toque=null;
 if(role==='chef'){ toque=new THREE.Group(); const w=M('#ffffff',{roughness:.6}); toque.add(mesh(CY(.085,.09,.07,22),w,0,.035,0)); for(const [x,z] of [[-.045,0],[.045,0],[0,-.04],[0,.04]]) toque.add(mesh(SP(.055,12,10),w,x,.1,z)); toque.add(mesh(SP(.06,12,10),w,0,.13,0)); root.add(toque); }
 return {real:true,root,model,mixer,act,cur:idleName,idleName,bones,tray,tsp,fork,phone,toque,tab,tpe,tub,tubPl,menuB,face,sc,HS,role,sx:0,sz:0,sitK:a.sitting?1:0,headYaw:0,headX:0,ofs:{uaL:0,uaR:0,laL:0,laR:0,zR:0},blinkT:0};
}
const _q1=new THREE.Quaternion(), _q2=new THREE.Quaternion(), _ax=new THREE.Vector3(), _wv=new THREE.Vector3(), _wv2=new THREE.Vector3();
function rotW(bone,axisW,ang){
 if(!bone||!ang) return;
 bone.parent.getWorldQuaternion(_q1); _q1.invert();
 _ax.copy(axisW).applyQuaternion(_q1).normalize();
 _q2.setFromAxisAngle(_ax,ang); bone.quaternion.premultiply(_q2); bone.updateMatrixWorld(true);
}
const _p1=new THREE.Vector3(), _p2=new THREE.Vector3();
const _q3=new THREE.Quaternion(), _d3=new THREE.Vector3();
// oriente un os (axe Y de l'os) vers un angle dans le plan avant/bas du personnage (0 = vers le bas, π/2 = vers l'avant)
function aimBone(bone,F,R,des,k){
 if(!bone) return;
 bone.getWorldQuaternion(_q3); _d3.set(0,1,0).applyQuaternion(_q3);
 const cur=Math.atan2(_d3.dot(F),-_d3.y);
 rotW(bone,R,-(des-cur)*k);
}
const _q4=new THREE.Quaternion(), _q5=new THREE.Quaternion(), _qI=new THREE.Quaternion(), _d4=new THREE.Vector3(), _tg=new THREE.Vector3();
// oriente un os vers un point du monde (bras tendu vers une cible)
function aimTo(bone,target,w){
 if(!bone||w<=.001) return;
 bone.getWorldPosition(_p1); _d4.copy(target).sub(_p1).normalize();
 bone.getWorldQuaternion(_q3); _d3.set(0,1,0).applyQuaternion(_q3);
 _q4.setFromUnitVectors(_d3,_d4); if(w<1) _q4.slerp(_qI,1-w);
 bone.parent.getWorldQuaternion(_q1); _q5.copy(_q1).invert().multiply(_q4).multiply(_q1);
 bone.quaternion.premultiply(_q5); bone.updateMatrixWorld(true);
}
// pieds pilotés à part (IK) : on les pose au bout du tibia
function placeFoot(o,shin,foot,k){
 if(!shin||!foot) return;
 shin.getWorldPosition(_p1); shin.getWorldQuaternion(_q3); _d3.set(0,1,0).applyQuaternion(_q3);
 _p2.copy(_p1).addScaledVector(_d3,o.shin||.4);
 if(_p2.y<.03) _p2.y=.03;
 foot.getWorldPosition(_p1); _p1.lerp(_p2,k);
 foot.parent.worldToLocal(_p1); foot.position.copy(_p1); foot.updateMatrixWorld(true);
}

function aimSeg(bone,child,F,R,des,k){
 if(!bone||!child) return;
 bone.getWorldPosition(_p1); child.getWorldPosition(_p2); _p2.sub(_p1);
 const cur=Math.atan2(_p2.dot(F),-_p2.y);
 rotW(bone,R,-(des-cur)*k);
}
function playR(o,name,fade=.25){
 if(o.cur===name) return;
 const n=o.act[name], c=o.act[o.cur]; if(!n) return;
 n.reset(); n.setEffectiveWeight(1); n.fadeIn(fade).play(); if(c) c.fadeOut(fade); o.cur=name;
}
const UPV=new THREE.Vector3(0,1,0);
function animCharR(a,o,dt,T){
 const id=a.id||(a.s?a.s.id:3);
 if(a.seq||a.seatGeo) o.sitK=a.sitK||0; else o.sitK+=((a.sitting?1:0)-o.sitK)*Math.min(1,dt*4.5); const k=o.sitK;
 let px=a.fx+.5, pz=a.fy+.5;
 if(a.wspot) o.ox=a.wspot.ox;
 if(a.seatGeo){}
 else if(a.table&&a.st!=='queue'&&k>.01){ px+=(a.table.x-a.x)*.27*k; pz+=(a.table.y-a.y)*.27*k; }
 else if(o.ox&&k>.01) px+=o.ox*k;
 if(a.rot===undefined) a.rot=a.rotT??0;
 if(!a.moving&&a.rotT!==undefined) a.rot=lerpAng(a.rot,a.rotT,dt*5);
 o.root.position.set(px+o.sx,(.375-REAL.hipsY*o.sc)*k,pz+o.sz);
 o.root.rotation.y=a.rot;
 const job=a.job;
 // animation de base
 let base=o.idleName, ts=1;
 const working=(job&&(job.s==='work'||job.s==='mix'||job.s==='wash'))||a.wipe||(a.s&&a.arr>0);
 if(a.moving&&k<.3){ base='Walk'; ts=clamp((a.v||0)/(.95*(o.stride||(o.stride=.9+((id*37)%21)/100))),.4,1.45); }
 playR(o,base); o.act[base].timeScale=ts;
 const bb=o.bones, OV=[bb.chest,bb.ulL,bb.ulR,bb.llL,bb.llR,bb.ftR,bb.uaL,bb.uaR,bb.laL,bb.laR,bb.neck,bb.head].filter(Boolean);
 if(o.saved){ for(const [bn,q] of o.saved) bn.quaternion.copy(q); for(const [bn,v] of o.savedP) bn.position.copy(v); }
 else { o.saved=new Map(OV.map(bn=>[bn,new THREE.Quaternion()])); o.savedP=new Map([bb.ftL,bb.ftR].filter(Boolean).map(bn=>[bn,new THREE.Vector3()]));
  o.root.updateMatrixWorld(true); if(bb.llL&&bb.ftL) o.shin=bb.llL.getWorldPosition(new THREE.Vector3()).distanceTo(bb.ftL.getWorldPosition(new THREE.Vector3())); }
 o.mixer.update(dt); if(o.bones.head) o.bones.head.scale.setScalar(o.HS);
 for(const [bn,q] of o.saved) q.copy(bn.quaternion); for(const [bn,v] of o.savedP) v.copy(bn.position);
 o.root.updateMatrixWorld(true);
 // axes du personnage
 const right=_wv2.set(Math.cos(a.rot),0,-Math.sin(a.rot));
 const b=o.bones;
 // posture : buste, jambes (assis) et bras visés vers des angles cibles
 const lean=(a.st!=='queue'&&a.st!=='standUp'&&a.table&&a.sitting?.18*k:0)+(a.lean||0);
 if(lean) rotW(b.chest,right,-lean);
 const fwdV=new THREE.Vector3(Math.sin(a.rot),0,Math.cos(a.rot));
 if(k>.01){
  aimBone(b.ulL,fwdV,right,1.45,k); aimBone(b.ulR,fwdV,right,1.45,k);
  const tap=a.sitting&&a.st==='wait'&&a.pat<35?Math.max(0,Math.sin(T*11))*.25:0;
  aimBone(b.llL,fwdV,right,.12,k); aimBone(b.llR,fwdV,right,.12+tap,k);
  placeFoot(o,b.llL,b.ftL,k); placeFoot(o,b.llR,b.ftR,k);
 }
 const talking=a.talk&&a.sitting, laughing=a.grp&&a.grp.laugh>0&&a.sitting;
 let w=0, uaL=.3,uaR=.3,laL=1.2,laR=1.2,zR=0,hx=0, eating=false;
 if(k>.5){ w=k;
  if(a.st==='queue'){ uaL=uaR=.25; laL=laR=.95; }
  else { uaL=uaR=.3; laL=1.5+Math.sin(T*1.1+id)*.06; laR=1.5+Math.sin(T*1.5+id*2)*.07;
   if(a.st==='wait'&&!a.phone&&!a.talk&&Math.sin(T*.7+id*3)>.75){ uaR=.7; laR=2.55; hx=.1; } }
 }
 if(talking){ uaR=.45+Math.sin(T*2.2+id)*.1; laR=1.7+Math.sin(T*4.5+id)*.35; zR=Math.sin(T*3+id)*.2; }
 if(a.phone&&a.sitting&&a.st==='wait'){ uaR=.45; laR=2.05; uaL=.45; laL=1.8; hx=.35; }
 if(a.st==='eat'&&a.sitting&&!talking){ const e=Math.max(0,Math.sin(T*2.6+(a.ph||0)))*clamp(Math.sin(T*.4+id*1.7)*3+1.2,0,1); uaR=.35+e*.2; laR=1.5+e*1.05; eating=e>.7; hx=.12; }
 if(a.carry){ w=1; uaL=uaR=.3; laL=laR=1.45; }
 if(a.tub&&!a.carry){ w=1; uaL=uaR=.22; laL=laR=1.3; }
 if(a.tab){ w=1; uaL=.26; laL=1.9; uaR=.3; laR=a.tab===1?1.75+Math.max(0,Math.sin(T*7))*.14:1.8; hx=.42; }
 if(a.st==='menu'&&a.sitting&&k>.5){ uaL=uaR=.42; laL=laR=1.9; hx=.32; }
 if(a.st==='order'&&a.sitting&&a.hand>0&&k>.5){ const e=Math.min(1,a.hand*2,(1.6-a.hand)*3); uaR=.3+2.35*Math.max(0,e); laR=1.2+1.6*Math.max(0,e); }
 // ---- gestuelle : chaque métier a ses gestes, les clients sont curieux ----
 let leanX=0; o.gz=undefined;
 const role=a.s?a.s.role:null, still=!a.moving&&k<.3;
 if(a.s&&still&&!a.carry&&!a.tab){
  const stK=job&&job.st?kindOf(job.st):null;
  if(job&&job.s==='work'){ w=1; hx=.34;
   if(stK==='prep'||stK==='counter'){ const c=Math.max(0,Math.sin(T*12)); uaR=.5; laR=1.2+c*.4; uaL=.55; laL=1.25; }          // découpe
   else if(stK==='oven'){ const p=.5+.5*Math.sin(T*.9+id); leanX=.2+.18*p; uaL=uaR=.75; laL=laR=1.25+.1*p; }                  // surveille le four
   else { const ph=T*4.6; uaR=.6+Math.sin(ph)*.07; laR=1.3+Math.cos(ph)*.1; zR=Math.sin(ph)*.16; uaL=.45; laL=1.15;          // remue, puis goûte
    if(((T*.16+id*.37)%1)>.86){ uaR=.5; laR=2.45; hx=-.02; zR=0; } } }
  else if(job&&job.s==='wash'){ w=1; hx=.36; leanX=.14; uaL=uaR=.55; laL=1.15+Math.sin(T*7)*.16; laR=1.15-Math.sin(T*7)*.16; }
  else if(job&&job.s==='mix'){ w=1; uaL=uaR=.55; laL=laR=2.05+Math.sin(T*21)*.1; hx=.05; }
  else if(a.wipe){ w=1; hx=.4; leanX=.42; uaR=.95; laR=1.15; zR=Math.sin(T*5.5)*.45; uaL=.5; laL=1.0; }                          // essuie la table
  else if(a.wave>0){ w=1; const e=Math.sin(Math.min(1,a.wave)*Math.PI); leanX=.2*e; uaR=.55; laR=1.25; zR=-.75*e; uaL=.2; laL=.75; hx=.12*e; } // « par ici »
  else if(!job&&!a.detour){ w=1;                                                                                              // au repos
   if(role==='cleaner'){ uaL=uaR=-.22; laL=laR=-.1; }
   else if(role==='chef'&&((T*.09+id*.61)%1)>.8){ uaL=uaR=.3; laL=1.15+Math.sin(T*8)*.1; laR=1.15-Math.sin(T*8)*.1; hx=.3; }
   else { uaL=uaR=.2; laL=laR=.78; } }
 }
 if(a.s&&a.carry&&a.arr>0&&!a.moving){ leanX=.22; laL=laR=1.25; }   // se penche pour poser l'assiette
 if(a.tab) hx+=Math.max(0,Math.sin(T*2.2))*.1;
 if(!a.s){
  if(k>.5&&a.sitting){
   if(talking) leanX+=.07; if(laughing) leanX-=.1;
   if(a.thankT>0){ a.thankT-=dt; hx+=Math.max(0,Math.sin(a.thankT*9))*.2; }
   if(a.drinkOn&&(a.st==='wait'||a.st==='eat')&&!talking){ const sp=(T*.11+id*.43)%1; if(sp>.88){ const e=Math.sin((sp-.88)/.12*Math.PI); uaL=.35+e*.2; laL=1.5+e*1.0; hx-=.12*e; w=1; } }
   if(a.st==='wait'&&!a.lookAt&&!a.phone){ let bw=null,bd=2.6; for(const s2 of crew){ if(!s2.carry) continue; const d=Math.hypot(s2.fx-a.fx,s2.fy-a.fy); if(d<bd){ bd=d; bw=s2; } } if(bw) o.gz=clamp(angDiff(a.rot,Math.atan2(bw.fx-a.fx,bw.fy-a.fy)),-1.2,1.2); }
  } else if(a.moving){
   o.gzT=(o.gzT??rnd(.5,2))-dt;
   if(o.gzT<=0){
    if(o.gzP){ o.gzP=null; o.gzT=rnd(1.2,3.2); }
    else { const cand=[];
     for(const f of state.furn){ const kd=kindOf(f); if(['plant','flowers','jukebox','aquarium','fountain','statue','bar','fridge','lamp'].includes(kd)||(kd==='table'&&tableItems.has(f.id))){ const d=Math.hypot(f.x-a.fx,f.y-a.fy); if(d>1&&d<5) cand.push([f.x,f.y]); } }
     for(const p of crew.concat(custs)) if(p!==a){ const d=Math.hypot(p.fx-a.fx,p.fy-a.fy); if(d>.8&&d<3) cand.push([p.fx,p.fy]); }
     if(a.kind==='walk') cand.push([S/2,S/2-1]);
     const ok=cand.filter(p=>Math.abs(angDiff(a.rot,Math.atan2(p[0]-a.fx,p[1]-a.fy)))<1.15);
     if(ok.length){ o.gzP=ok[Math.floor(Math.random()*ok.length)]; o.gzT=rnd(.9,1.9); } else o.gzT=rnd(.6,1.5); } }
   if(o.gzP){ const d=angDiff(a.rot,Math.atan2(o.gzP[0]-a.fx,o.gzP[1]-a.fy)); if(Math.abs(d)<1.3) o.gz=d; else o.gzP=null; }
  }
 }
 const s=Math.min(1,dt*9), f=o.ofs;
 f.ln=(f.ln||0)+(leanX-(f.ln||0))*Math.min(1,dt*5); if(Math.abs(f.ln)>.005) rotW(b.chest,right,-f.ln);
 f.w=(f.w||0)+(w-(f.w||0))*s;
 f.uaL+=(uaL-f.uaL)*s; f.uaR+=(uaR-f.uaR)*s; f.laL+=(laL-f.laL)*s; f.laR+=(laR-f.laR)*s; f.zR+=(zR-f.zR)*s;
 const fwd=fwdV, tuck=(k>.5&&a.st!=='queue')||a.carry||(a.s&&w>=1&&!(a.wave>0))?.3:0;
 f.tk=(f.tk||0)+(tuck-(f.tk||0))*s;
 if(f.tk){ rotW(b.uaL,fwd,-f.tk); rotW(b.uaR,fwd,f.tk); }
 if(f.w>.01){ aimBone(b.uaL,fwd,right,f.uaL,f.w); aimBone(b.uaR,fwd,right,f.uaR,f.w); aimBone(b.laL,fwd,right,f.laL,f.w); aimBone(b.laR,fwd,right,f.laR,f.w); }
 if(f.zR) rotW(b.uaR,fwd,f.zR);
 // main sur le dossier quand on tire / repousse la chaise
 const G=a.seatGeo, ch=G&&G.ch;
 if(ch&&a.reachW>.01){
  const t=seatTable(ch);
  if(t){ const dx=t.x-ch.x, dz=t.y-ch.y, off=.27-.25*(ch.pull||0);
   _tg.set(ch.x+.5+dx*(off-.15),.6,ch.y+.5+dz*(off-.15));
   const side=(_tg.x-o.root.position.x)*right.x+(_tg.z-o.root.position.z)*right.z>0;
   aimTo(side?b.uaL:b.uaR,_tg,a.reachW); aimTo(side?b.laL:b.laR,_tg,a.reachW); }
 }
 // en se rapprochant de la table : mains sur les côtés de l'assise
 if(ch&&a.scoot>.01){
  for(const sd of [1,-1]){ _tg.copy(o.root.position).addScaledVector(right,sd*.2).addScaledVector(fwdV,.05); _tg.y=.36;
   aimTo(sd>0?b.uaL:b.uaR,_tg,a.scoot); aimTo(sd>0?b.laL:b.laR,_tg,a.scoot); }
  o.root.position.y+=a.scoot*.02;
 }
 // tête : regard
 let hT=a.headT||0;
 if(a.lookAt&&a.sitting){ const L2=a.lookAt; hT=clamp(angDiff(a.rot,Math.atan2(L2.fx-a.fx,L2.fy-a.fy)),-1.1,1.1); }
 if(a.s&&!job&&!a.moving) hT=Math.sin(T*.45+(a.ph||0))*.5;
 if(o.gz!==undefined) hT=o.gz;
 if(talking) hx+=Math.sin(T*6)*.05; else if(a.lookAt) hx+=Math.max(0,Math.sin(T*3.2+id))*.07;
 if(laughing) hx-=.15+Math.sin(T*20)*.05;
 o.headYaw+=(hT-o.headYaw)*Math.min(1,dt*4); o.headX+=(hx-o.headX)*Math.min(1,dt*6);
 rotW(b.neck,UPV,o.headYaw*.4); rotW(b.head,UPV,o.headYaw*.6); rotW(b.head,right,-o.headX);
 if(a.hop>0){ a.hop-=dt; o.root.position.y+=Math.sin((1-a.hop/.5)*Math.PI)*.06; }
 // accessoires
 const toLocal=(bone,v)=>o.root.worldToLocal(bone.getWorldPosition(v));
 if(a.carry){ const p1=toLocal(b.wL,_wv.clone()), p2=toLocal(b.wR,new THREE.Vector3()); o.tray.position.copy(p1.add(p2).multiplyScalar(.5)); o.tray.position.y+=.03; o.tray.position.z+=.04; o.tray.visible=true; setEmo(o.tsp,a.carry); } else o.tray.visible=false;
 o.fork.visible=a.st==='eat'&&a.sitting; if(o.fork.visible) o.fork.position.copy(toLocal(b.wR,new THREE.Vector3()));
 const mid=()=>{ const p1=toLocal(b.wL,_wv.clone()), p2=toLocal(b.wR,new THREE.Vector3()); return p1.add(p2).multiplyScalar(.5); };
 o.tab.visible=a.tab===1; o.tpe.visible=a.tab===2;
 if(a.tab){ const p=mid(), pr=a.tab===1?o.tab:o.tpe; pr.position.copy(p); pr.position.y+=.02; pr.position.z+=.02; pr.rotation.set(-.45,0,0); }
 o.tub.visible=!!a.tub&&!a.carry&&!a.wipe; if(o.tub.visible){ o.tub.position.copy(mid()); o.tub.position.y-=.02; o.tub.position.z+=.06; o.tubPl.visible=a.tub===2; }
 o.menuB.visible=a.st==='menu'&&a.sitting&&o.sitK>.6; if(o.menuB.visible){ o.menuB.position.copy(mid()); o.menuB.position.y+=.06; o.menuB.position.z+=.03; o.menuB.rotation.set(-1.05,0,0); }
 o.phone.visible=!!(a.phone&&a.sitting&&a.st==='wait'); if(o.phone.visible){ o.phone.position.copy(toLocal(b.wR,new THREE.Vector3())); o.phone.position.y+=.05; o.phone.rotation.x=-.5; }
 if(o.face){ const F=o.face; o.blinkT-=dt; if(o.blinkT<=0) o.blinkT=rnd(2,5.5);
  const happy=a.mood==='happy'||laughing||a.thankT>0||(a.s&&a.wave>0)||(a.st==='eat'&&eating);
  const sad=a.mood==='angry'||(!a.s&&a.pat<35&&(a.st==='wait'||a.st==='order'||a.st==='queue'));
  const op=laughing||(talking&&Math.sin(T*13+id)>.1)||(a.st==='look'&&a.t>.6);
  F.eyes.visible=!happy; F.arcs.visible=happy; F.eyes.scale.y=o.blinkT<.12?.12:1;
  F.smile.visible=!op; F.open.visible=op; F.smile.rotation.z=sad?0:Math.PI; F.smile.position.y=sad?.03:.043; F.open.scale.y=laughing?1.25:.8; }
 if(o.toque){ const hp=toLocal(b.head,new THREE.Vector3()); o.toque.position.set(hp.x,hp.y+.115*o.HS,hp.z-.005); o.toque.scale.setScalar(o.HS*.95); o.toque.rotation.y=o.headYaw*.8; }
}
