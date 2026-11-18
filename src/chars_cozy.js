/* =========================================================
   PERSONNAGES « COSY » — petits bonshommes ronds, modulaires
   ---------------------------------------------------------
   Pour créer une variante (ex. un chef pâtissier) :
     1. ajoute une entrée dans STAFF_LOOKS (couleurs, coiffe, accessoires)
     2. au besoin, ajoute une pièce dans CHAR_HATS / CHAR_EXTRAS / CHAR_HAIR
     3. donne à l'employé  s.variant='patissier'  (charSpec la lit tout seul)
   ========================================================= */
const C_SKIN=['#ffdcc2','#f8cba6','#eab58c','#cf9468','#a87048','#7d5030'];
const C_HAIRC=['#3a2618','#5c3a22','#8a5a2e','#c8963e','#ecc978','#b9502e','#2a2a30','#5c3a22','#3a2618','#8a5a2e','#c8963e','#a3a3a8'];
const C_TOP=['#e8a23a','#d9694a','#8fb58a','#e3a0a0','#7fb3d5','#c8553d','#3f8f8a','#b9a2d8','#f2c94c','#5f8fbf','#e98b5b','#a7c7a0','#c96f7a','#6aa5a0','#f4ead6','#d98f4a'];
const C_BOT=['#3f5f8a','#5577a3','#c9a878','#5a4a42','#7a8a5a','#8a6a52','#2f4466','#4a5568','#a8576a'];
const C_SHOE=['#5a3a22','#f2efe6','#c8553d','#3a3a3a','#e8a23a'];
// tenues du personnel : c'est ICI qu'on décline les métiers et leurs variantes
const STAFF_LOOKS={
 chef:   {top:'#fbfbf7',bottom:'#3d3f4c',shoes:'#2b2b30',hat:'toque',extras:['buttons','scarf'],accent:'#e5484d'},
 waiter: {top:'#ffffff',bottom:'#2a2c36',shoes:'#1e1e22',extras:['vest','bowtie'],accent:'#2a2c36'},
 barman: {top:'#ffffff',bottom:'#2a2c36',shoes:'#1e1e22',extras:['vest','bowtie'],accent:'#7a1f2e'},
 cleaner:{top:'#39b8b2',bottom:'#2a8a86',shoes:'#f2efe6',hat:'cap',extras:['bib'],accent:'#1f7d80'},
 // exemples de variantes prêtes à l'emploi (s.variant)
 patissier:{top:'#fff3f6',bottom:'#8a5a6a',shoes:'#2b2b30',hat:'toque',extras:['buttons','scarf'],accent:'#f08fb0'},
 sommelier:{top:'#ffffff',bottom:'#2a2c36',shoes:'#1e1e22',extras:['vest','tie','apron'],accent:'#5a1f2e'},
};
const _cm=(c,o)=>M(c,Object.assign({roughness:.78},o||{}));
// --- coiffures : (tête, matière) ---
const CHAR_HAIR={
 bald:()=>{},
 short:(h,m)=>{ hairCap(h,m,.43,-.42); },
 tuft:(h,m)=>{ hairCap(h,m,.43,-.42); const t=mesh(SP(.06,10,8),m,0,.33,.03); t.scale.set(1,1.2,1); h.add(t); },
 bob:(h,m)=>{ hairCap(h,m,.45,-.4); for(const s of [-1,1]){ const b=mesh(SP(.085,12,10),m,s*.165,.09,-.06); b.scale.set(.6,1.2,.9); h.add(b); } },
 long:(h,m)=>{ hairCap(h,m,.45,-.4); const b=mesh(SP(.19,14,12),m,0,.06,-.1); b.scale.set(.98,1.2,.6); h.add(b); },
 bun:(h,m)=>{ hairCap(h,m,.44,-.42); h.add(mesh(SP(.075,12,10),m,0,.335,-.06)); },
 curly:(h,m)=>{ hairCap(h,m,.42,-.42); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2; h.add(mesh(SP(.07,10,8),m,Math.cos(a)*.14,.26+((i%2)*.03),Math.sin(a)*.11-.05)); } h.add(mesh(SP(.08,10,8),m,0,.31,0)); },
 pigtails:(h,m)=>{ hairCap(h,m,.44,-.42); for(const s of [-1,1]) h.add(mesh(SP(.07,10,8),m,s*.2,.2,-.04)); },
};
function hairCap(h,m,cover,tilt){ cover*=.86; tilt-=.12; const c=mesh(geo('hc'+cover,()=>new THREE.SphereGeometry(.208,22,14,0,Math.PI*2,0,Math.PI*cover)),m,0,.14,0); c.scale.set(1,.93,.96); c.rotation.x=tilt; h.add(c); }
// --- coiffes : (tête, fiche) ---
const CHAR_HATS={
 toque:(h,S)=>{ const w=_cm('#ffffff',{roughness:.6}); h.add(mesh(CY(.13,.14,.1,22),w,0,.3,-.01)); for(const [x,z] of [[-.075,0],[.075,0],[0,-.07],[0,.07]]) h.add(mesh(SP(.085,12,10),w,x,.39,z-.01)); h.add(mesh(SP(.09,12,10),w,0,.42,-.01)); },
 cap:(h,S)=>{ const c=_cm(S.accent); const d=mesh(geo('capD',()=>new THREE.SphereGeometry(.213,22,10,0,Math.PI*2,0,Math.PI*.42)),c,0,.15,0); d.scale.set(1,.93,.96); h.add(d); const br=mesh(CY(.11,.11,.018,18),c,0,.235,.17); br.scale.set(1,1,.75); h.add(br); },
 beret:(h,S)=>{ const c=_cm(S.accent); const d=mesh(SP(.17,16,10),c,.02,.31,-.01); d.scale.set(1.1,.38,1.05); h.add(d); h.add(mesh(SP(.02,8,6),c,.02,.375,-.01)); },
 strawhat:(h,S)=>{ const c=_cm('#e8c98a'); const br=mesh(CY(.3,.3,.015,24),c,0,.27,0); h.add(br); h.add(mesh(CY(.15,.17,.11,20),c,0,.32,0)); h.add(mesh(CY(.172,.172,.03,20),_cm(S.accent),0,.285,0)); },
 bow:(h,S)=>{ const c=_cm(S.accent); for(const s of [-1,1]){ const b=mesh(SP(.045,10,8),c,s*.045+.09,.33,.02); b.scale.set(1,.7,.5); h.add(b); } },
};
// --- accessoires : (corps, tête, fiche) ---
const CHAR_EXTRAS={
 buttons:(b,h,S)=>{ const m=_cm('#c9ccd3',{metalness:.3}); for(let i=0;i<3;i++) for(const s of [-1,1]) b.add(mesh(SP(.014,6,5),m,s*.04,.3-i*.065,.148-i*.004,false)); },
 scarf:(b,h,S)=>{ const t=mesh(TO(.085,.028),_cm(S.accent),0,.365,.0,false); t.rotation.x=Math.PI/2; t.scale.set(1,.85,1); b.add(t); const k=mesh(SP(.035,8,6),_cm(S.accent),0,.33,.1,false); k.scale.set(1,1.3,.6); b.add(k); },
 vest:(b,h,S)=>{ const v=_cm(S.accent,{roughness:.6}); for(const s of [-1,1]){ const p=mesh(SP(1,14,12),v,s*.085,.2,.012,false); p.scale.set(.1,.172,.148); b.add(p); } const bk=mesh(SP(1,14,12),v,0,.2,-.03,false); bk.scale.set(.168,.17,.125); b.add(bk); },
 bowtie:(b,h,S)=>{ const c=_cm(S.accent==='#2a2c36'?'#c8553d':'#1e1e22'); for(const s of [-1,1]){ const t=mesh(SP(.028,8,6),c,s*.03,.352,.125,false); t.scale.set(1,.75,.5); b.add(t); } b.add(mesh(SP(.014,6,5),c,0,.352,.13,false)); },
 tie:(b,h,S)=>{ const t=mesh(RB(.035,.16,.012,.005),_cm(S.accent),0,.27,.152,false); t.rotation.x=-.12; b.add(t); },
 apron:(b,h,S)=>{ const p=mesh(SP(1,14,12),_cm('#f4efe6'),0,.12,.02,false); p.scale.set(.16,.13,.148); b.add(p); },
 bib:(b,h,S)=>{ const p=mesh(RB(.17,.15,.02,.01),_cm(S.accent),0,.24,.142,false); p.rotation.x=-.1; b.add(p); for(const s of [-1,1]) b.add(mesh(new THREE.BoxGeometry(.025,.13,.012),_cm(S.accent),s*.07,.33,.11,false)); },
 glasses:(b,h,S)=>{ const g=_cm('#3a2a22',{roughness:.3}); for(const s of [-1,1]){ const r=mesh(TO(.04,.007),g,s*.07,.15,.182,false); h.add(r); } h.add(mesh(new THREE.BoxGeometry(.06,.008,.008),g,0,.15,.19,false)); },
};
// fiche d'un personnage : tout ce qui le décrit (facile à surcharger)
function charSpec(a){
 const id=a.id||(a.s?a.s.id:3)*7, r=seeded(id*13+5), L=a.look||{}, pk=arr=>arr[Math.floor(r()*arr.length)];
 const S={skin:pk(C_SKIN),hairC:pk(C_HAIRC),hair:pk(['short','short','tuft','bob','long','bun','curly','long','bob']),top:pk(C_TOP),bottom:pk(C_BOT),shoes:pk(C_SHOE),hat:null,extras:[],accent:pk(['#c8553d','#3f8f8a','#e8a23a','#5f8fbf','#b9a2d8']),w:.94+r()*.16,h:.95+r()*.1,kid:!!a.kidF};
 if(r()<.14) S.extras.push('glasses'); if(r()<.09) S.hat=pk(['beret','strawhat','cap']); if(r()<.1) S.extras.push('scarf');
 if(S.kid){ S.hair=pk(['tuft','pigtails','bob','short','curly']); if(r()<.3) S.hat='bow'; S.extras=S.extras.filter(e=>e!=='glasses'); }
 if(a.s){ Object.assign(S,STAFF_LOOKS[a.s.variant]||STAFF_LOOKS[a.s.role]||{},a.s.outfit||{}); S.extras=[...(S.extras||[])]; if(!S.hat&&r()<0) S.hat=null; }
 if(!a.s&&L.fit){ Object.assign(S,L.fit); S.extras=[...(S.extras||[])]; }
 return S;
}
function makeCharC(a){
 const S=charSpec(a), root=new THREE.Group(), sc=S.kid?.8:1.1; root.scale.setScalar(sc);
 const skin=_cm(S.skin,{roughness:.85}), top=_cm(S.top), bot=_cm(S.bottom), shoe=_cm(S.shoes,{roughness:.6}), hairM=_cm(S.hairC,{roughness:.9});
 // jambes
 const legs=[]; for(const s of [-1,1]){ const g=new THREE.Group(); g.position.set(s*.07,.15,0); const l=mesh(CY(.05,.047,.1,10),bot,0,-.05,0); g.add(l); const f=mesh(SP(.06,10,8),shoe,0,-.115,.025); f.scale.set(1,.62,1.4); g.add(f); root.add(g); legs.push(g); }
 // corps
 const body=new THREE.Group(); body.position.y=.15; root.add(body);
 const hips=mesh(SP(1,18,14),bot,0,.1,0); hips.scale.set(.168*S.w,.115,.148); body.add(hips);
 const torso=mesh(SP(1,20,16),top,0,.2,0); torso.scale.set(.17*S.w,.185*S.h,.15); body.add(torso);
 // bras
 const arms=[]; for(const s of [-1,1]){ const g=new THREE.Group(); g.position.set(s*.158*S.w,.29,0); g.add(mesh(CY(.04,.036,.12,10),top,0,-.06,0)); g.add(mesh(SP(.042,10,8),top,0,0,0)); g.add(mesh(SP(.044,10,8),skin,0,-.14,0)); body.add(g); arms.push(g); }
 // tête
 const head=new THREE.Group(); head.position.y=.4*S.h+.02; body.add(head); if(S.kid) head.scale.setScalar(1.12);
 const hm=mesh(SP(.2,24,18),skin,0,.14,0); hm.scale.set(1,.93,.96); head.add(hm);
 for(const s of [-1,1]) head.add(mesh(SP(.035,8,6),skin,s*.195,.12,0,false));
 (CHAR_HAIR[S.hair]||CHAR_HAIR.short)(head,hairM);
 if(S.hat&&CHAR_HATS[S.hat]) CHAR_HATS[S.hat](head,S);
 for(const e of S.extras) if(CHAR_EXTRAS[e]) CHAR_EXTRAS[e](body,head,S);
 // visage
 const dark=M('#33241c',{roughness:.15}), white=M('#ffffff',{roughness:.2,emissive:'#ffffff',emissiveIntensity:.35});
 const eyes=new THREE.Group(), arcs=new THREE.Group();
 for(const s of [-1,1]){ const e=mesh(SP(.03,12,10),dark,s*.072,.15,.17,false); e.scale.set(1,1.25,.5); eyes.add(e); eyes.add(mesh(SP(.01,8,6),white,s*.072+.01,.164,.185,false));
  const ar=mesh(geo('cArc',()=>new THREE.TorusGeometry(.028,.008,6,12,Math.PI)),dark,s*.072,.142,.178,false); arcs.add(ar); }
 const blushM=geo2('cBlush',()=>new THREE.MeshBasicMaterial({color:'#ff8a8a',transparent:true,opacity:.38,depthWrite:false}));
 for(const s of [-1,1]){ const c=new THREE.Mesh(SP(.032,10,8),blushM); c.position.set(s*.118,.092,.15); c.scale.set(1,.62,.3); head.add(c); }
 const smile=mesh(geo('cSmile',()=>new THREE.TorusGeometry(.03,.0075,6,12,Math.PI)),M('#8a3a34',{roughness:.5}),0,.085,.181,false); smile.rotation.z=Math.PI;
 const open=mesh(SP(.026,10,8),M('#7a2a2a',{roughness:.6}),0,.068,.178,false); open.scale.set(1.1,.8,.4); open.visible=false;
 arcs.visible=false; head.add(eyes,arcs,smile,open);
 // objets tenus (devant le corps)
 const hold=new THREE.Group(); body.add(hold);
 const tray=new THREE.Group(); tray.add(mesh(CY(.15,.15,.012,24),M('#cfd4db',{metalness:.6,roughness:.25}),0,0,0)); tray.add(mesh(CY(.09,.065,.015,20),M('#ffffff'),0,.014,0,false)); const tsp=emoSprite('🍽️',.24); tsp.position.y=.1; tray.add(tsp); tray.position.set(0,.22,.25);
 const tub=new THREE.Group(); const tubM=M('#8d969f',{roughness:.6}); tub.add(mesh(RB(.34,.012,.24,.01),tubM,0,0,0,false)); for(const [w,d,x,z] of [[.34,.012,0,.115],[.34,.012,0,-.115],[.012,.24,.165,0],[.012,.24,-.165,0]]) tub.add(mesh(new THREE.BoxGeometry(w,.09,d),tubM,x,.045,z,false));
 const tubPl=new THREE.Group(); for(let i=0;i<3;i++) tubPl.add(mesh(CY(.08,.06,.012,16),M('#f6f3ee',{roughness:.3}),-.06+i*.06,.02+i*.013,(i%2)*.02,false)); tub.add(tubPl); tub.position.set(0,.16,.27);
 const tab=new THREE.Group(); tab.add(mesh(RB(.2,.012,.14,.008),M('#25282e',{roughness:.35}),0,0,0,false)); tab.add(mesh(new THREE.BoxGeometry(.18,.002,.12),M('#dff3ff',{emissive:'#8fd0ff',emissiveIntensity:.7,roughness:.3}),0,.007,0,false)); tab.position.set(0,.22,.2); tab.rotation.x=-.6;
 const tpe=new THREE.Group(); tpe.add(mesh(RB(.08,.022,.14,.008),M('#2b2e34',{roughness:.4}),0,0,0,false)); tpe.add(mesh(new THREE.BoxGeometry(.06,.002,.045),M('#bfe8c9',{emissive:'#7fdc9a',emissiveIntensity:.6}),0,.012,-.03,false)); tpe.position.set(0,.22,.2); tpe.rotation.x=-.6;
 const menuB=new THREE.Group(); const cov=M('#7a2e2a',{roughness:.7}), pg=M('#fbf6ea',{roughness:.9}); for(const sd of [-1,1]){ const hh=new THREE.Group(); hh.add(mesh(new THREE.BoxGeometry(.1,.004,.14),cov,sd*.05,0,0,false)); hh.add(mesh(new THREE.BoxGeometry(.092,.003,.13),pg,sd*.05,.0035,0,false)); hh.rotation.z=sd*-.28; menuB.add(hh); } menuB.position.set(0,.27,.2); menuB.rotation.x=-1.0;
 const phone=new THREE.Group(); phone.add(mesh(RB(.05,.09,.01,.005),M('#22252b',{roughness:.3}),0,0,0,false)); phone.add(mesh(new THREE.BoxGeometry(.04,.072,.002),M('#9fd6ff',{emissive:'#6fb8ff',emissiveIntensity:.8}),0,0,-.006,false)); phone.position.set(.034,-.168,.036); phone.rotation.set(2.22,0,.3); phone.scale.setScalar(1.2);   // tenu dans la main droite, écran tourné vers le visage
 const fork=new THREE.Group(); const sil=M('#d9dde3',{metalness:.8,roughness:.25}); fork.add(mesh(new THREE.BoxGeometry(.01,.11,.006),sil,0,-.2,0,false)); for(let i=-1;i<=1;i++) fork.add(mesh(new THREE.BoxGeometry(.005,.03,.005),sil,i*.008,-.265,0,false)); arms[0].add(fork);
 for(const p of [tray,tub,tab,tpe,menuB]){ p.visible=false; hold.add(p); } phone.visible=false; arms[0].add(phone); fork.visible=false;
 root.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); torso.castShadow=hm.castShadow=hips.castShadow=true;
 // fusion des pièces fixes : jambes, bras, buste, tête, yeux, joues (environ 28 objets dessinés -> une dizaine)
 try{ for(const g of legs) bakeVC(g,'cL|'+S.bottom+'|'+S.shoes); for(const g of arms) bakeVC(g,'cA|'+S.top+'|'+S.skin); bakeVC(body,null); bakeVC(head,null,[smile,open]);
  bakeSame(eyes,'cEyeD',dark); bakeSame(eyes,'cEyeW',white); bakeSame(arcs,'cArcs',dark); bakeSame(head,'cBlush',blushM); }catch(e){ console.warn('bake',e); }
 return {cozy:true,root,body,head,legs,arms,eyes,arcs,smile,open,tray,tsp,tub,tubPl,tab,tpe,menuB,phone,fork,role:a.s?a.s.role:null,sc,sx:0,sz:0,sitK:a.sitting?1:0,mv:0,blinkT:rnd(1,4),yaw:0,pit:0,P:{aL:0,aR:0,zL:0,zR:0,lean:0,legL:0,legR:0}};
}
const _mats2=new Map(); function geo2(k,f){ let m=_mats2.get(k); if(!m){ m=f(); _mats2.set(k,m); } return m; }
// ce que l'employé est en train de faire, pour qu'il s'en approche vraiment : [x, y, distance à garder]
function staffTarget(a){
 const j=a.job; if(!j||a.moving||(a.path&&a.path.length)||a.detour) return null;
 const F=(f,d)=>f?[f.x,f.y,d||.6]:null, C=c=>c&&!c.dead?[c.fx,c.fy,.55]:null;
 if(j.pl) return j.s==='wash'||j.s==='tosink'?F(j.sink||j.st):j.s==='go'?F(j.r):null;
 if(j.cl) return j.s==='bin'?F(j.b,.45):j.s==='drop'||j.s==='todish'?F(j.r||j.b):F(j.t,.46);
 if(j.svc) return j.svc==='greet'?(j.s==='hello'||j.s==='go'?(j.c&&!j.c.dead?[j.c.fx,j.c.fy,9]:null):F(j.t2,.5)):F(j.t,.5);
 if(j.d) return j.s==='dfetch'?F(j.f,.62):j.s==='dpick'?F(j.d.at):j.s==='dserve'?C(j.d.c):F(j.st);
 if(j.s==='trash') return j.ph==='bin'?F(j.b,.5):null;
 if(j.o){ if(j.s==='pick') return F(j.o.at); if(j.s==='serve') return C(j.o.c); if(j.s==='bring') return F(j.ctr); return F(j.st); }
 return null;
}
function animCharC(a,o,dt,T){
 const id=a.id||(a.s?a.s.id:3), job=a.job;
 if(a.seq||a.seatGeo) o.sitK=a.sitK||0; else o.sitK+=((a.sitting?1:0)-o.sitK)*Math.min(1,dt*4.5); const k=o.sitK;
 // marche libre : la silhouette suit le trajet en arrondissant les angles, chacun sur sa propre trajectoire
 { const free=a.moving&&!a.seq&&k<.2, lane=(a.path&&a.path[0]&&a.path[0].length>2?0:1)*(((id*37)%7)-3)/3*.15*(o.mv||0), r0=a.rot||0;
  const tx=a.fx+Math.cos(r0)*lane, tz=a.fy-Math.sin(r0)*lane;
  if(o.vx===undefined||Math.hypot(tx-o.vx,tz-o.vz)>1.6){ o.vx=tx; o.vz=tz; o.ry=r0; }
  const sqz=a.path&&a.path[0]&&a.path[0].length>2||Math.abs(a.fx-a.x)>.05||Math.abs(a.fy-a.y)>.05&&a.y<S; const f=1-Math.exp(-dt/(free?(sqz?.12:.3):.09)), ox=o.vx, oz=o.vz; o.vx+=(tx-o.vx)*f; o.vz+=(tz-o.vz)*f;
  const sp=dt>0?Math.hypot(o.vx-ox,o.vz-oz)/dt:0; o.spd=(o.spd||0)+(sp-(o.spd||0))*Math.min(1,dt*10); o.wph=(o.wph||0)+o.spd*dt*6.4;
  o.ry=lerpAng(o.ry,free&&sp>.15?Math.atan2(o.vx-ox,o.vz-oz):(a.rot===undefined?(a.rotT??0):a.rot),Math.min(1,dt*(free?7:9))); }
 let px=o.vx+.5, pz=o.vz+.5;
 if(a.wspot) o.ox=a.wspot.ox;
 if(a.seatGeo){}
 else if(a.table&&a.st!=='queue'&&k>.01){ px+=(a.table.x-a.x)*.43*k; pz+=(a.table.y-a.y)*.43*k; }
 else if(o.ox&&k>.01) px+=o.ox*k;
 { let tx=0,tz=0; if(a.s){ const tg=staffTarget(a); if(tg){ const dx=tg[0]-a.fx, dz=tg[1]-a.fy, d=Math.hypot(dx,dz); if(d>.3&&d<2.4){ const m=clamp(d-tg[2],0,d>1.7?.3:.55); tx=dx/d*m; tz=dz/d*m; } } }
  const kk=Math.min(1,dt*6); o.nx=(o.nx||0)+(tx-(o.nx||0))*kk; o.nz=(o.nz||0)+(tz-(o.nz||0))*kk; px+=o.nx; pz+=o.nz; }
 if(a.rot===undefined) a.rot=a.rotT??0;
 if(!a.moving&&a.rotT!==undefined) a.rot=lerpAng(a.rot,a.rotT,dt*5);
 o.mv+=(((o.spd||0)>.1&&k<.3?1:0)-o.mv)*Math.min(1,dt*8);
 const sw=Math.sin(o.wph||0), mv=o.mv, sp=clamp((o.spd||0)/1.1,.45,1.2);
 let y=(.235-.15*o.sc)*k+Math.abs(Math.cos(o.wph||0))*.022*mv;
 if(a.hop>0){ a.hop-=dt; y+=Math.sin((1-a.hop/.5)*Math.PI)*.07; }
 if(a.scoot>.01) y+=a.scoot*.02;
 if(a.yOff) y+=a.yOff;
 o.root.position.set(px+o.sx,y,pz+o.sz); o.root.rotation.y=o.ry;
 // ----- pose cible -----
 const seated=k>.5&&a.sitting, talking=a.talk&&a.sitting, laughing=a.grp&&a.grp.laugh>0&&a.sitting, still=!a.moving&&k<.3;
 let aL=.05,aR=.05,zL=.12,zR=.12,lean=(a.lean||0),pit=0,gz, eating=false;
 const breathe=1+Math.sin(T*1.6+id)*.012;
 // marche : bras qui balancent
 aL+=sw*.55*mv*sp; aR-=sw*.55*mv*sp;
 if(seated){
  if(a.st==='queue'){ aL=aR=.5; }
  else { aL=aR=1.05; zL=zR=.0; lean+=.06;
   if(a.st==='menu'){ aL=aR=1.2; pit=.3; }
   else if(a.st==='order'&&a.hand>0){ const e=clamp(Math.min(a.hand*2,(1.6-a.hand)*3),0,1); aR=1.05+1.9*e; zR=.25*e; }
   else if(a.phone&&a.st==='wait'){ const sc=Math.max(0,Math.sin(T*2.3+id)); aR=.95; zR=-.62; aL=.9+sc*.1; zL=-.74+sc*.08; pit=.46+Math.sin(T*.7+id)*.04; lean+=.04; gz=-.1; }
   else if(a.st==='eat'&&!talking){ const e=Math.max(0,Math.sin(T*2.6+(a.ph||0)))*clamp(Math.sin(T*.4+id*1.7)*3+1.2,0,1); aR=1.0+e*1.0; eating=e>.7; pit=.1+e*.08; }
   if(talking){ aR=1.25+Math.sin(T*4.5+id)*.3; zR=.15+Math.sin(T*3+id)*.2; lean+=.07; pit+=Math.sin(T*6)*.04; }
   else if(a.lookAt) pit+=Math.max(0,Math.sin(T*3.2+id))*.07;
   if(laughing){ lean-=.14; pit-=.15+Math.sin(T*20)*.05; }
   if(a.thankT>0){ a.thankT-=dt; pit+=Math.max(0,Math.sin(a.thankT*9))*.22; }
   if(a.drinkOn&&(a.st==='wait'||a.st==='eat')&&!talking){ const s2=(T*.11+id*.43)%1; if(s2>.88){ const e=Math.sin((s2-.88)/.12*Math.PI); aL=1.05+e*1.0; pit-=.12*e; } }
   if(a.st==='wait'&&!a.lookAt&&!a.phone){ let bw=null,bd=2.6; for(const s2 of crew){ if(!s2.carry) continue; const d=Math.hypot(s2.fx-a.fx,s2.fy-a.fy); if(d<bd){ bd=d; bw=s2; } } if(bw) gz=clamp(angDiff(a.rot,Math.atan2(bw.fx-a.fx,bw.fy-a.fy)),-1.2,1.2); }
  }
 }
 if(a.belPiano&&seated){ // pianiste : les mains courent sur le clavier, le buste accompagne la musique
  const b=T*2.6, run=Math.sin(T*.55+1)*.5+.5, fl=(T*.13)%1;
  aL=1.12+Math.max(0,Math.sin(b*2))*.2+Math.max(0,Math.sin(b*4+1))*.08; aR=1.12+Math.max(0,Math.sin(b*2+Math.PI))*.2+Math.max(0,Math.sin(b*4+2.4))*.1;
  zL=.3-run*.38+Math.sin(T*3.1)*.06; zR=-.3+Math.sin(T*.8)*.3+Math.sin(T*4.3)*.07;
  lean=.14+Math.sin(T*1.3)*.07+Math.max(0,Math.sin(b))*.03; pit=.2+Math.sin(T*1.3+.6)*.1+Math.max(0,Math.sin(b*2))*.03; gz=Math.sin(T*.65)*.28;
  if(fl>.9){ const e=Math.sin((fl-.9)/.1*Math.PI); aR=1.12+e*.95; zR=-.1-e*.25; pit-=.22*e; lean-=.08*e; } }
 if(a.reachW>.01){ aR=Math.max(aR,1.1*a.reachW); }
 // gestes du personnel du Belmont
 if(a.belHold){ aL=aR=1.15; zL=zR=-.05; if(still&&a.wait>0&&a.face){ lean=.24; aL=aR=1.0; } }
 if(a.belCook&&still){ const ph=T*4.4+id*1.3, m=(T*.1+id*.37)%1; pit=.3; lean=.1; if(m<.55){ aR=1.15+Math.sin(ph)*.1; zR=Math.sin(ph)*.22; aL=.75; } else if(m<.85){ aL=1.0; aR=.95+Math.max(0,Math.sin(T*12+id))*.4; lean=.14; } else { aR=2.0; zR=-.2; pit=-.05; aL=.6; } }
 if(a.belInspect&&still){ lean=.2+Math.sin(T*.9)*.04; pit=.34; aR=1.75; zR=-.28; aL=.2; zL=-.2; }
 if(a.belBow>0){ const e=Math.sin(Math.min(1,a.belBow)*Math.PI); lean=.34*e; pit=.2*e; aR=.5*e; zR=-.35*e; aL=.1; }
 if(a.belPour&&still){ const e=.5+.5*Math.sin(T*2.2); aR=1.45+e*.25; zR=-.1; lean=.2; pit=.3; aL=.35; zL=-.2; }
 if(a.belIdle&&still&&!a.tab&&!a.tub&&!a.belHold&&!a.wipe){ aL=aR=.3; zL=zR=-.22; }
 // personnel : les gestes du métier
 if(a.s){
  const stK=job&&job.st?kindOf(job.st):null;
  if(a.carry||a.tub){ aL=aR=1.15; zL=zR=-.05; if(a.carry&&a.arr>0&&!a.moving){ lean=.25; aL=aR=1.0; } }
  if(a.tab){ aL=1.15; aR=1.2+(a.tab===1?Math.max(0,Math.sin(T*7))*.18:0); zL=zR=-.1; pit=.3+Math.max(0,Math.sin(T*2.2))*.1; }
  if(still&&!a.carry&&!a.tab){
   if(job&&job.s==='work'){ pit=.3;
    if(stK==='prep'||stK==='counter'){ aL=1.0; aR=.95+Math.max(0,Math.sin(T*12))*.4; lean=.12; }
    else if(stK==='oven'){ const p=.5+.5*Math.sin(T*.9+id); lean=.25+.2*p; aL=aR=1.0; }
    else { const ph=T*4.6; aR=1.15+Math.sin(ph)*.1; zR=Math.sin(ph)*.22; aL=.7; lean=.08; if(((T*.16+id*.37)%1)>.86){ aR=2.0; zR=-.2; pit=-.05; } } }
   else if(job&&job.s==='wash'){ pit=.32; lean=.16; aL=1.0+Math.sin(T*7)*.2; aR=1.0-Math.sin(T*7)*.2; }
   else if(job&&job.s==='mix'){ aL=aR=1.7+Math.sin(T*21)*.12; zL=zR=-.2; }
   else if(a.wipe){ pit=.35; lean=.38; aR=1.25; zR=Math.sin(T*5.5)*.5; aL=.6; }
   else if(a.wave>0){ const e=Math.sin(Math.min(1,a.wave)*Math.PI); lean=.22*e; aR=.9*e; zR=1.0*e; pit=.12*e; }
   else if(a.arr>0&&!a.tub){ aL=aR=.9; lean=.15; }
   else if(!job&&!a.detour){ if(a.s.role==='cleaner'){ aL=aR=-.3; zL=zR=-.1; } else { aL=aR=.3; zL=zR=-.22; } }
  }
 }
 // curiosité en marchant
 if(!a.s&&a.moving){
  o.gzT=(o.gzT??rnd(.5,2))-dt;
  if(o.gzT<=0){ if(o.gzP){ o.gzP=null; o.gzT=rnd(1.2,3.2); } else { const cand=[];
    for(const f of state.furn){ const kd=kindOf(f); if(['plant','flowers','jukebox','aquarium','fountain','statue','bar','fridge','lamp'].includes(kd)||(kd==='table'&&tableItems.has(f.id))){ const d=Math.hypot(f.x-a.fx,f.y-a.fy); if(d>1&&d<5) cand.push([f.x,f.y]); } }
    for(const p of crew.concat(custs)) if(p!==a){ const d=Math.hypot(p.fx-a.fx,p.fy-a.fy); if(d>.8&&d<3) cand.push([p.fx,p.fy]); }
    if(a.kind==='walk') cand.push([S/2,S/2-1]);
    const ok=cand.filter(p=>Math.abs(angDiff(a.rot,Math.atan2(p[0]-a.fx,p[1]-a.fy)))<1.15);
    if(ok.length){ o.gzP=ok[Math.floor(Math.random()*ok.length)]; o.gzT=rnd(.9,1.9); } else o.gzT=rnd(.6,1.5); } }
  if(o.gzP){ const d=angDiff(a.rot,Math.atan2(o.gzP[0]-a.fx,o.gzP[1]-a.fy)); if(Math.abs(d)<1.3) gz=d; else o.gzP=null; }
 }
 // ----- application lissée -----
 const s=Math.min(1,dt*10), P=o.P;
 P.aL+=(aL-P.aL)*s; P.aR+=(aR-P.aR)*s; P.zL+=(zL-P.zL)*s; P.zR+=(zR-P.zR)*s; P.lean+=(lean-P.lean)*Math.min(1,dt*6);
 // bras : [0] = main droite (x<0), [1] = main gauche
 o.arms[0].rotation.set(-P.aR,0,-P.zR); o.arms[1].rotation.set(-P.aL,0,P.zL);
 const lg=-1.45*k; o.legs[0].rotation.x=lg+sw*.75*mv*sp; o.legs[1].rotation.x=lg-sw*.75*mv*sp;
 const tap=a.sitting&&a.st==='wait'&&a.pat<35?Math.max(0,Math.sin(T*11))*.25:0; o.legs[0].rotation.x-=tap;
 o.body.rotation.x=P.lean; o.body.rotation.z=sw*.07*mv; o.body.scale.y=breathe;
 // tête
 let hT=a.headT||0;
 if(a.lookAt&&a.sitting){ const L2=a.lookAt; hT=clamp(angDiff(a.rot,Math.atan2(L2.fx-a.fx,L2.fy-a.fy)),-1.1,1.1); }
 if(a.s&&!job&&!a.moving) hT=Math.sin(T*.45+(a.ph||0))*.55;
 if(gz!==undefined) hT=gz;
 o.yaw+=(hT-o.yaw)*Math.min(1,dt*4.5); o.pit+=(pit-o.pit)*Math.min(1,dt*6);
 o.head.rotation.set(o.pit,o.yaw,Math.sin(T*.9+id)*.03+sw*.03*mv);
 // visage
 o.blinkT-=dt; if(o.blinkT<=0) o.blinkT=rnd(2,5.5);
 const happy=a.mood==='happy'||laughing||a.thankT>0||(a.s&&a.wave>0)||eating;
 const sad=a.mood==='angry'||(!a.s&&a.pat<35&&(a.st==='wait'||a.st==='order'||a.st==='queue'));
 const op=laughing||(talking&&Math.sin(T*13+id)>.1)||(a.st==='look'&&a.t>.6);
 o.eyes.visible=!happy; o.arcs.visible=happy; o.eyes.scale.y=o.blinkT<.12?.12:1; o.eyes.position.y=o.blinkT<.12?.132:0;
 o.smile.visible=!op; o.open.visible=op; o.smile.rotation.z=sad?0:Math.PI; o.smile.position.y=sad?.06:.085; o.open.scale.y=laughing?1.25:.8;
 // objets
 o.tray.visible=!!a.carry; if(a.carry) setFood(o.tray,o.tsp,a.carry,.022);
 o.tub.visible=!!a.tub&&!a.carry&&!a.wipe; o.tubPl.visible=a.tub===2;
 o.tab.visible=a.tab===1; o.tpe.visible=a.tab===2;
 o.menuB.visible=a.st==='menu'&&a.sitting&&k>.6;
 o.phone.visible=!!(a.phone&&a.sitting&&a.st==='wait');
 o.fork.visible=a.st==='eat'&&a.sitting;
}
