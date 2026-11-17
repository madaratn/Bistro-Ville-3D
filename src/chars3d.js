/* --- personnages (proportions naturelles) --- */
const DS=THREE.DoubleSide;
const lathe=(k,pts,seg=22,ps=0,pl=Math.PI*2)=>geo(k,()=>new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(x,y)),seg,ps,pl));
const TORSO_M=[[0,0],[.118,.004],[.128,.06],[.122,.14],[.138,.22],[.148,.27],[.122,.31],[.06,.33],[0,.335]];
const TORSO_F=[[0,0],[.122,.004],[.126,.05],[.106,.13],[.128,.2],[.136,.26],[.112,.305],[.055,.325],[0,.33]];
const SHOES=['#2b2b30','#6b4a33','#f2f2f2','#a8452f','#3a5a8c'];
function makeChar(a){
 const L=a.look, role=a.s?a.s.role:null;
 const pantsC=role==='chef'?'#3d3f4c':role==='waiter'?'#262833':role==='cleaner'?'#1f7d80':(L.pants||'#3b4a6b');
 const topC=role==='chef'?'#fbfbfb':role==='waiter'?'#ffffff':role==='cleaner'?'#2bb3b1':L.body;
 const skinC=L.skin, skin=M(skinC,{roughness:.62}), hairM=M(L.hair,{roughness:.5,side:DS}), top=M(topC,{roughness:.8}), pants=M(pantsC,{roughness:.85});
 const shoeM=M(role?'#24252b':(L.shoe||SHOES[(a.id||0)%SHOES.length]),{roughness:.45});
 const fem=!role&&(L.skirt||L.hs===1||L.hs===4);
 const shortSleeve=!role&&((a.id||0)%3===0);
 const root=new THREE.Group(), g=new THREE.Group(); root.add(g);
 // jambes : hanche -> genou -> pied
 const skirtLeg=!role&&L.skirt;
 const leg=(x)=>{ const hip=new THREE.Group(); hip.position.set(x,.5,0);
  hip.add(mesh(CA(.056,.15),skirtLeg?skin:pants,0,-.11,0));
  const kn=new THREE.Group(); kn.position.y=-.22; hip.add(kn);
  kn.add(mesh(CA(.045,.17),skirtLeg?skin:pants,0,-.125,0));
  const sh=mesh(SP(.052,14,10),shoeM,0,-.262,.03); sh.scale.set(1,.55,1.7); kn.add(sh);
  hip.userData.knee=kn; return hip; };
 const legL=leg(-.064), legR=leg(.064); g.add(legL,legR);
 if(skirtLeg) g.add(mesh(CY(.11,.19,.27,24),pants,0,.43,0));
 else g.add(mesh(CY(.118,.125,.1,22),pants,0,.5,0));
 // buste
 const torso=new THREE.Group(); torso.position.y=.52; g.add(torso);
 const body=mesh(lathe(fem?'torsoF':'torsoM',fem?TORSO_F:TORSO_M),top); body.scale.set(1,1,.72); torso.add(body);
 add(torso,mesh(TO(.05,.016),M(shade(topC,role==='chef'?-.06:.15)),0,.322,0,false)).rotation.x=Math.PI/2;
 if(role==='chef'){ const bm=M('#c9ccd3'); for(let i=0;i<3;i++) for(const s of [-1,1]) torso.add(mesh(SP(.011,6,5),bm,s*.04,.25-i*.06,.1,false)); add(torso,mesh(TO(.05,.018),M('#e5484d'),0,.31,.008,false)).rotation.x=Math.PI/2; torso.add(mesh(RB(.2,.22,.02,.01),M('#f1f1f1'),0,.07,.088,false)); }
 if(role==='waiter'){ const vest=mesh(lathe('vestM',TORSO_M.map(([x,y])=>[x*1.06,y*.97]),22,.45,Math.PI*2-.9),M('#24262f',{roughness:.6,side:DS})); vest.scale.set(1,1,.76); torso.add(vest);
  const bt=M('#e5484d'); for(const s of [-1,1]){ const c=mesh(geo('cone2',()=>new THREE.ConeGeometry(.024,.045,10)),bt,s*.022,.305,.092,false); c.rotation.z=s*Math.PI/2; torso.add(c);} torso.add(mesh(SP(.012,8,6),bt,0,.305,.094,false));
  torso.add(mesh(RB(.2,.2,.015,.008),M('#8a5a36'),0,-.04,.095,false)); }
 if(role==='cleaner'){ const st=M('#1b6f6d'); for(const s of [-1,1]) torso.add(mesh(new THREE.BoxGeometry(.022,.2,.015),st,s*.055,.2,.094,false)); torso.add(mesh(RB(.13,.1,.015,.008),st,0,.09,.095,false)); }
 if(!role) torso.add(mesh(CY(.124,.124,.02,22),M(shade(pantsC,-.3)),0,.01,0,false));
 // bras : épaule -> coude -> main
 const arm=(s)=>{ const sh=new THREE.Group(); sh.position.set(s*.158,.8,0); sh.rotation.z=s*.06;
  sh.add(mesh(SP(.05,12,10),top,0,0,0));
  sh.add(mesh(CA(.041,.13),top,0,-.1,0));
  const el=new THREE.Group(); el.position.y=-.2; sh.add(el);
  el.add(mesh(CA(.036,.11),shortSleeve?skin:top,0,-.085,0));
  if(!shortSleeve) el.add(mesh(CY(.04,.04,.025,12),M(shade(topC,-.08)),0,-.15,0,false));
  const hd=mesh(SP(.038,12,10),skin,0,-.18,.005); hd.scale.set(.85,1.1,.7); el.add(hd);
  sh.userData.el=el; return sh; };
 const armL=arm(-1), armR=arm(1); g.add(armL,armR);
 const elL=armL.userData.el, elR=armR.userData.el;
 const phone=new THREE.Group(); phone.position.set(0,-.2,.03); phone.rotation.x=-.3; phone.add(mesh(RB(.045,.085,.01,.005),M('#22252b',{roughness:.3}),0,0,0,false)); phone.add(mesh(new THREE.BoxGeometry(.036,.068,.002),M('#9fd6ff',{emissive:'#6fb8ff',emissiveIntensity:.8}),0,0,.006,false)); phone.visible=false; elR.add(phone);
 const fork=new THREE.Group(); fork.position.set(0,-.19,.025); const sil=M('#d9dde3',{metalness:.8,roughness:.25}); fork.add(mesh(new THREE.BoxGeometry(.008,.1,.005),sil,0,-.03,0,false)); for(let i=-1;i<=1;i++) fork.add(mesh(new THREE.BoxGeometry(.004,.03,.004),sil,i*.006,-.095,0,false)); fork.visible=false; elR.add(fork);
 // cou & tête
 g.add(mesh(CY(.034,.04,.08,12),skin,0,.88,0));
 const head=new THREE.Group(); head.position.y=1.0; head.scale.setScalar(.6); g.add(head);
 const hd=mesh(SP(.2,28,22),skin); hd.scale.set(.94,1.04,.97); head.add(hd);
 const jaw=mesh(SP(.15,20,14),skin,0,-.09,.03); jaw.scale.set(1,.8,1); head.add(jaw);
 for(const s of [-1,1]){ const e=mesh(SP(.04,10,8),skin,s*.188,-.01,0); e.scale.set(.45,.85,.6); head.add(e); }
 const eyes=new THREE.Group(); head.add(eyes);
 const white=M('#fbfbf8',{roughness:.3}), irisC=M(['#4a3020','#2e5c8a','#3d6b3a','#5a3a1e','#4a3020'][(a.id||0)%5],{roughness:.25}), pup=M('#120c08');
 for(const s of [-1,1]){ const sc=mesh(SP(.03,14,10),white,s*.07,.012,.172,false); sc.scale.set(1.15,.85,.5); eyes.add(sc); const ir=mesh(SP(.019,12,8),irisC,s*.07,.01,.184,false); ir.scale.set(1,1,.5); eyes.add(ir); eyes.add(mesh(SP(.01,8,6),pup,s*.07,.01,.191,false)); eyes.add(mesh(SP(.005,6,5),white,s*.07+.007,.019,.194,false)); }
 const brows=[]; for(const s of [-1,1]){ const b=mesh(RB(.06,.011,.014,.005),M(shade(L.hair,-.15)),s*.072,.062,.186,false); b.rotation.z=-s*.08; head.add(b); brows.push(b); }
 const nose=mesh(SP(.026,10,8),M(shade(skinC,-.05)),0,-.03,.198,false); nose.scale.set(.75,1.1,1); head.add(nose);
 for(const s of [-1,1]){ const b=mesh(SP(.032,10,8),M('#ff8f8a',{transparent:true,opacity:.22}),s*.105,-.05,.16,false); b.scale.set(1,.55,.35); head.add(b); }
 const mouth=mesh(TO(.024,.006,Math.PI),M('#8a4034'),0,-.095,.18,false); mouth.rotation.z=Math.PI; head.add(mouth);
 const mouthO=mesh(SP(.02,10,8),M('#6b2a22'),0,-.098,.178,false); mouthO.scale.set(1,.7,.4); mouthO.visible=false; head.add(mouthO);
 // cheveux
 const hs=L.hs??0;
 const cap=()=>{ const c=mesh(geo('hcap',()=>new THREE.SphereGeometry(.213,28,14,0,Math.PI*2,0,Math.PI*.52)),hairM,0,0,0); c.rotation.x=-.38; head.add(c); };
 const back=()=>{ const b=mesh(SP(.206,22,16),hairM,0,-.015,-.045); b.scale.set(1,.98,.92); head.add(b); };
 const fringe=()=>{ const f=mesh(SP(.1,14,10),hairM,-.035,.125,.135); f.scale.set(1.85,.5,.8); f.rotation.z=.28; head.add(f); };
 const side=(k,tl,sy)=>{ const s=mesh(geo(k,()=>new THREE.SphereGeometry(.222,24,16,Math.PI/2+.95,Math.PI*2-1.9,.35,tl)),hairM,0,-.02,-.01); s.scale.set(1,sy,1); head.add(s); };
 if(hs===3){ for(let i=0;i<12;i++){ const an=i/12*Math.PI*2; head.add(mesh(SP(.07,10,8),hairM,Math.cos(an)*.15,.09+Math.sin(i*1.7)*.03,Math.sin(an)*.15-.03)); } head.add(mesh(SP(.14,14,10),hairM,0,.14,-.03)); for(let i=0;i<5;i++) head.add(mesh(SP(.06,10,8),hairM,(i-2)*.055,.15,.12)); }
 else { cap(); back(); if(hs!==5) fringe(); }
 if(hs===1) side('hlong',2.25,1.35);
 if(hs===5){ side('hbob',1.7,.95); const f=mesh(SP(.12,14,10),hairM,0,.11,.13); f.scale.set(1.6,.45,.75); head.add(f); }
 if(hs===2){ head.add(mesh(SP(.085,14,10),hairM,0,.2,-.1)); const t=mesh(TO(.06,.014),M('#ff7aa8'),0,.165,-.085,false); t.rotation.x=1.1; head.add(t); }
 if(hs===4){ const tl=mesh(CA(.06,.2),hairM,0,-.08,-.25); tl.rotation.x=.5; head.add(tl); const t=mesh(TO(.045,.014),M('#4f8ff7'),0,.05,-.215,false); t.rotation.x=.5+Math.PI/2; head.add(t); }
 if(!role&&!fem&&(a.id||0)%5===0){ const bm=M(L.hair,{roughness:.7}); const bd=mesh(SP(.13,16,12),bm,0,-.12,.06); bd.scale.set(1.05,.75,.9); head.add(bd); }
 // accessoires
 if(role==='chef'){ const w=M('#ffffff',{roughness:.6}); head.add(mesh(CY(.15,.16,.12,22),w,0,.2,-.01)); for(const [x,z] of [[-.08,0],[.08,0],[0,-.07],[0,.07]]) head.add(mesh(SP(.1,12,10),w,x,.32,z-.01)); head.add(mesh(SP(.11,12,10),w,0,.37,-.01)); }
 if(role==='cleaner'){ const tc=M('#1f8f8d'); head.add(mesh(geo('capH',()=>new THREE.SphereGeometry(.216,22,10,0,Math.PI*2,0,Math.PI*.45)),tc,0,.02,0)); const br=mesh(CY(.14,.14,.016,22),tc,0,.085,.16,false); br.scale.set(1,1,.6); head.add(br); }
 if(!role&&L.gl){ const gm=M('#2a2a30',{metalness:.3,roughness:.4}); for(const s of [-1,1]) head.add(mesh(TO(.038,.006),gm,s*.07,.012,.2,false)); head.add(mesh(new THREE.BoxGeometry(.035,.007,.007),gm,0,.016,.205,false)); }
 if(!role&&L.hat){ const hm=M(L.hat,{roughness:.8}); head.add(mesh(CY(.27,.27,.02,28),hm,0,.13,0)); head.add(mesh(CY(.15,.17,.16,24),hm,0,.21,0)); head.add(mesh(CY(.171,.171,.035,24),M('#3a2a20'),0,.15,0,false)); }
 // plateau
 const tray=new THREE.Group(); tray.position.set(0,.6,.3); tray.add(mesh(CY(.15,.15,.012,24),M('#cfd4db',{metalness:.6,roughness:.25}),0,0,0)); tray.add(mesh(CY(.09,.065,.015,20),M('#ffffff'),0,.014,0,false)); const tsp=emoSprite('🍽️',.24); tsp.position.y=.1; tray.add(tsp); tray.visible=false; g.add(tray);
 return {root,g,phone,fork,sx:0,sz:0,torso,legL,legR,armL,armR,elL,elR,head,eyes,brows,tray,tsp,mouth,mouthO,role,sitK:a.sitting?1:0,headYaw:0,blinkT:Math.random()*4};
}
function animChar(a,o,dt,T){
 const id=a.id||(a.s?a.s.id:3);
 let px=a.fx+.5, pz=a.fy+.5;
 if(a.wspot) o.ox=a.wspot.ox;
 if(a.seatGeo){}
 else if(a.table&&a.st!=='queue'&&o.sitK>.01){ px+=(a.table.x-a.x)*.27*o.sitK; pz+=(a.table.y-a.y)*.27*o.sitK; }
 else if(o.ox&&o.sitK>.01) px+=o.ox*o.sitK;
 o.root.position.set(px+o.sx,0,pz+o.sz);
 if(a.rot===undefined) a.rot=a.rotT??0;
 if(!a.moving&&a.rotT!==undefined) a.rot=lerpAng(a.rot,a.rotT,dt*5);
 o.root.rotation.y=a.rot;
 o.sitK+=((a.sitting?1:0)-o.sitK)*Math.min(1,dt*4.5); const k=o.sitK;
 const sp=Math.min(1,(a.v||0)/1.1), s=Math.sin(a.ph*.85), c=Math.cos(a.ph*.85), walk=sp*(1-k);
 const sm=Math.min(1,dt*10);
 // jambes
 const kL=o.legL.userData.knee, kR=o.legR.userData.knee;
 o.legL.rotation.x=s*.45*walk-1.5*k; o.legR.rotation.x=-s*.45*walk-1.5*k;
 kL.rotation.x=(Math.max(0,-c)*.55+.05)*walk+1.45*k; kR.rotation.x=(Math.max(0,c)*.55+.05)*walk+1.45*k;
 if(a.sitting&&a.st==='wait'&&a.pat<35) kR.rotation.x+=Math.max(0,Math.sin(T*11))*.2;
 // corps
 let y=Math.abs(c)*.022*walk-.13*k;
 if(a.hop>0){ a.hop-=dt; y+=Math.sin((1-a.hop/.5)*Math.PI)*.07; }
 o.g.position.y=y; o.g.rotation.x=.05*walk; o.g.rotation.y=s*.05*walk;
 o.g.rotation.z=(1-walk)*(1-k)*Math.sin(T*.6+a.ph)*.012;
 o.torso.scale.y=1+Math.sin(T*2.1+a.ph)*.01*(1-walk);
 // bras : cibles épaule / coude
 let uL=-s*.35*walk+.02, uR=s*.35*walk+.02, eL=-.15-.2*walk, eR=-.15-.2*walk, zR=.06;
 const job=a.job, talking=a.talk&&a.sitting, laughing=a.grp&&a.grp.laugh>0&&a.sitting;
 let eating=false, headX=0;
 if(k>.5){
  if(a.st==='queue'){ uL=uR=-.15; eL=eR=-.75; }
  else { uL=-.35; uR=-.35; eL=-1.05+Math.sin(T*1.1+id)*.08; eR=-1.05+Math.sin(T*1.5+id*2)*.1;
   if(a.st==='wait'&&!a.phone&&!a.talk&&Math.sin(T*.7+id*3)>.75){ uR=-.6; eR=-2.3; headX=.08; } }
 }
 if(talking){ uR=-.45+Math.sin(T*2.2+id)*.15; eR=-1.25+Math.sin(T*4.5+id)*.35; zR=.15+Math.sin(T*3+id)*.2; }
 if(a.phone&&a.sitting&&a.st==='wait'){ uR=-.25; eR=-1.8; uL=-.3; eL=-1.55; headX=.35; }
 if(a.st==='eat'&&a.sitting&&!talking){ const e=Math.max(0,Math.sin(T*2.6+a.ph)); uR=-.45-e*.2; eR=-1.15-e*1.05; eating=e>.7; headX=.1; }
 if(job&&(job.s==='work'||job.s==='mix'||job.s==='wash')){ uR=-.55+Math.sin(T*6)*.08; eR=-.95+Math.sin(T*6)*.35; uL=-.35; eL=-1.0; headX=.2; }
 if(a.s&&a.arr>0&&(a.s.role==='cleaner'||(job&&job.s==='clean'))){ uL=uR=-.55+Math.sin(T*8)*.3; eL=eR=-.6; headX=.25; }
 if(a.carry){ uL=uR=-.25; eL=eR=-1.4; o.tray.visible=true; setEmo(o.tsp,a.carry); } else o.tray.visible=false;
 o.armL.rotation.x+=(uL-o.armL.rotation.x)*sm; o.armR.rotation.x+=(uR-o.armR.rotation.x)*sm;
 o.elL.rotation.x+=(eL-o.elL.rotation.x)*sm; o.elR.rotation.x+=(eR-o.elR.rotation.x)*sm;
 o.armR.rotation.z+=(zR-o.armR.rotation.z)*sm;
 o.fork.visible=a.st==='eat'&&a.sitting; o.phone.visible=!!(a.phone&&a.sitting&&a.st==='wait');
 // tête
 let hT=a.headT||0;
 if(a.lookAt&&a.sitting){ const L2=a.lookAt; hT=clamp(angDiff(a.rot,Math.atan2(L2.fx-a.fx,L2.fy-a.fy)),-1.1,1.1); }
 if(a.s&&!job&&!a.moving) hT=Math.sin(T*.45+a.ph)*.5;
 o.headYaw+=(hT-o.headYaw)*Math.min(1,dt*4); o.head.rotation.y=o.headYaw;
 if(talking) headX+=Math.sin(T*6)*.04; else if(a.lookAt) headX+=Math.max(0,Math.sin(T*3.2+id))*.06;
 o.head.rotation.x+=(headX-o.head.rotation.x)*Math.min(1,dt*6);
 o.head.rotation.z=(1-walk)*Math.sin(T*.5+id)*.04;
 if(laughing){ o.g.rotation.x=Math.sin(T*22)*.03-.06; }
 o.blinkT-=dt; if(o.blinkT<0) o.blinkT=2.5+Math.random()*3.5; o.eyes.scale.y=laughing?.4:o.blinkT<.12?.1:1;
 const angry=a.mood==='angry'||(a.st==='wait'&&a.pat<25);
 o.mouth.rotation.z=angry?0:Math.PI; o.mouth.position.y=angry?-.105:-.095;
 const open=eating||laughing||(talking&&Math.sin(T*13+id)>.1);
 o.mouth.visible=!open; o.mouthO.visible=open; o.mouthO.scale.y=laughing?1:.7;
 o.brows[0].rotation.z=angry?-.35:.08; o.brows[1].rotation.z=angry?.35:-.08;
}
