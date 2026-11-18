// ===================== ÉVÉNEMENTS : ce qu'on voit dans le restaurant (v0.71) =====================
let evA=[], evFx=null, evBusOn=false;
const evM=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o||{}));
function evActor(look,x,y,prop){ const a=mkAgent({id:uid++,kind:'cust',st:'ev',look:Object.assign(randLook(),look),x:Math.round(x),y:Math.round(y),fx:x,fy:y,speed:1.25,plan:[],prop}); evA.push(a); return a; }
function evGo(a,pts,sp){ a.plan.push({pts,sp}); } function evWait(a,t,fn){ a.plan.push({w:t,fn}); }
function evInside(a,tx,ty){ a.plan.push({in:[tx,ty]}); }
function evActTick(a,dt){
 const o=aObjs.get(a); if(o&&a.prop&&!a.propOk){ a.propOk=1; try{ const p=a.prop(); if(p) o.root.add(p); }catch(e){} }
 if(a.path.length){ moveAgent(a,dt); return; } a.moving=false; a.v=0;
 const s=a.plan[0]; if(!s){ a.dead=1; return; }
 if(s.pts){ a.plan.shift(); a.x=Math.round(a.fx); a.y=Math.round(a.fy); a.path=s.pts.map(p=>[p[0],p[1],1]); if(s.sp) a.speed=s.sp; }
 else if(s.in){ a.plan.shift(); a.x=Math.round(a.fx); a.y=Math.round(a.fy); a.speed=1.05; let p=null; try{ p=bfs(a.x,a.y,(x,y)=>x===s.in[0]&&y===s.in[1],false); }catch(e){} a.path=p||[]; }
 else { if(!s.on){ s.on=1; if(s.fn) try{ s.fn(a); }catch(e){} } s.w-=dt; if(s.w<=0) a.plan.shift(); }
}
function evFreeCell(){ for(let i=0;i<40;i++){ const x=1+Math.floor(Math.random()*(S-2)), y=2+Math.floor(Math.random()*(S-3)); if(x>=KR.x0-1&&x<=KR.x0+KR.w&&y>=KR.y0-1&&y<=KR.y0+KR.d) continue; if(state.furn.some(f=>f.x===x&&f.y===y)) continue; return [x,y]; } return [DX,S-2]; }
function evHat(col,brim){ return ()=>{ const g=new THREE.Group(); g.add(mesh(CY(brim||.19,brim||.19,.02,20),evM(col),0,1.0,0)); g.add(mesh(CY(.1,.115,.1,18),evM(col),0,1.05,0)); return g; }; }
function evClip(){ const g=new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(.16,.2,.02),evM('#8a5730'),.17,.56,.14)); g.add(mesh(new THREE.BoxGeometry(.13,.16,.022),evM('#ffffff'),.17,.555,.143)); return g; }
function evBarrow(){ const g=new THREE.Group(), gr=evM('#4f9a54'), wd=evM('#8a5730'); g.add(mesh(RB(.42,.2,.36,.04),gr,0,.3,.46)); const w=mesh(CY(.1,.1,.05,14),evM('#2b2b30'),0,.1,.72); w.rotation.z=Math.PI/2; g.add(w);
 for(const x of [-.16,.16]){ const h=mesh(CY(.014,.014,.5,6),wd,x,.36,.22); h.rotation.x=Math.PI/2-.25; g.add(h); }
 const cs=['#e5484d','#ff9a3d','#7bc86c','#f2d24a','#b65cc8','#e5484d']; cs.forEach((c,i)=>g.add(mesh(SP(.06,10,8),evM(c),-.12+(i%3)*.12,.43+(i>2?.05:0),.38+(i%2)*.14))); return g; }
function evCam(){ const g=new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(.1,.07,.05),evM('#2b2b30'),0,.62,.16)); g.add(mesh(CY(.025,.025,.04,10),evM('#555'),0,.62,.2)); g.children[1].rotation.x=Math.PI/2; return g; }
function evBus(){ const g=new THREE.Group(), wh=evM('#fbfbfb',{roughness:.35}), bl=evM('#3f9bd6',{roughness:.35}), gl=evM('#2e4660',{roughness:.15,metalness:.3}), ti=evM('#22252b');
 g.add(mesh(RB(3.3,.86,.82,.12),wh,0,.66,0)); g.add(mesh(RB(3.32,.2,.84,.05),bl,0,.4,0)); g.add(mesh(RB(3.0,.05,.7,.02),bl,0,1.11,0));
 for(let i=0;i<6;i++) for(const z of [-.415,.415]) g.add(mesh(new THREE.BoxGeometry(.38,.3,.02),gl,-1.2+i*.46,.8,z,false));
 g.add(mesh(new THREE.BoxGeometry(.02,.4,.66),gl,1.655,.78,0,false));
 for(const x of [-1.1,1.1]) for(const z of [-.4,.4]){ const w=mesh(CY(.19,.19,.12,16),ti,x,.19,z); w.rotation.x=Math.PI/2; g.add(w); }
 for(const z of [-.28,.28]) g.add(mesh(SP(.06,8,6),headMat,1.66,.42,z,false));
 const d=mesh(new THREE.BoxGeometry(.4,.62,.03),evM('#27405a'),.95,.56,-.42,false); g.add(d); g.userData.door=d; return g; }
function evSplash(k){ const E=EVS[k]; let s=$('#evS'); if(!s){ s=document.createElement('div'); s.id='evS'; document.body.appendChild(s); } s.style.setProperty('--ec',E.c); s.innerHTML='<i></i><b>'+E.n+'</b>'; s.className=''; void s.offsetWidth; s.className='go'; }
function evConf(x,y,z,n){ const cs=['#ff5d8f','#ffd23f','#4fc3f7','#7bd66c','#b388ff','#ff9a3d']; for(let i=0;i<n;i++) spawnPart(STAR,pick(cs),x+rnd(-.5,.5),y+rnd(0,.4),z+rnd(-.5,.5),rnd(-.5,.5),rnd(.2,1.4),rnd(-.5,.5),rnd(1.1,1.8),.13,0,false); }
function evFxStart(k,E){ evFx={k,E,t:0,objs:[],acts:[]}; const F=evFx; evSplash(k); const add3=o=>{ fxRoot.add(o); F.objs.push(o); return o; };
 if(k==='car'){ evBusOn=true; for(const c of cars) if(c.v>0&&c.x<DX+6){ fxRoot.remove(c.g); c.dead=1; } F.bus=add3(evBus()); F.bx=-16; F.stop=DX+3.2; F.bus.position.set(F.bx,0,S+2.55);
  for(let i=0;i<5;i++){ const cols=['#ff5d8f','#ffd23f','#4fc3f7','#7bd66c','#ff9a3d'], a=evActor({body:cols[i],hat:null},F.stop+.9,S+1.3,i%2?evCam():evHat(pick(['#f3e3b0','#ffffff','#e5484d']))); a.hide=true; F.acts.push(a);
   evWait(a,4.6+i*.7,q=>{ q.hide=false; }); evGo(a,[[DX+1.2+i*.8,S+1]],1.2); const snap=q=>{ q.rotT=Math.PI; q.hop=.5; const o=aObjs.get(q); spawnPart(GLOW,'#ffffff',q.fx+.5,.75,q.fy+.3,0,0,0,.25,.9,0,true); }; for(let j=0;j<40;j++) evWait(a,2+Math.random()*3,snap); } }
 else if(k==='anniv'){ const c=E.m&&E.m.c, t=c&&c.table; const tx=(t?t.x:c?c.x:DX)+.5, tz=(t?t.y:c?c.y:S-3)+.5; F.p=[tx,tz];
  const cake=new THREE.Group(); cake.add(mesh(CY(.13,.13,.09,20),evM('#fff3f6'),0,.045,0)); cake.add(mesh(CY(.135,.135,.025,20),evM('#ff8fb6'),0,.085,0)); cake.add(mesh(CY(.16,.16,.012,20),evM('#ffffff'),0,.006,0));
  F.fl=[]; for(let i=0;i<5;i++){ const a=i*1.257; cake.add(mesh(CY(.008,.008,.07,6),evM(pick(['#4fc3f7','#ffd23f','#7bd66c'])),Math.cos(a)*.07,.13,Math.sin(a)*.07)); const f=mesh(SP(.016,6,5),evM('#ffd23f',{emissive:'#ffb020',emissiveIntensity:2}),Math.cos(a)*.07,.18,Math.sin(a)*.07,false); cake.add(f); F.fl.push(f); }
  cake.position.set(tx,.78,tz); add3(cake); F.cake=cake; F.bal=[];
  ['#ff5d8f','#4fc3f7','#ffd23f','#7bd66c'].forEach((col,i)=>{ const b=new THREE.Group(); b.add(mesh(SP(.13,14,10),evM(col,{roughness:.25}),0,0,0)); b.children[0].scale.y=1.2; b.add(mesh(CY(.004,.004,.9,4),evM('#ffffff'),0,-.6,0,false)); b.position.set(tx+[-.55,.55,-.45,.5][i],1.55+i*.08,tz+[-.5,-.45,.5,.55][i]); b.userData.ph=i*1.7; add3(b); F.bal.push(b); }); evConf(tx,1.9,tz,26); }
 else if(k==='critique'){ const a=evActor({skin:'#f3d2b3',hair:'#5a3a78',body:'#8a5cc8',pants:'#3a2a4a',gl:true,skirt:true,hat:null,hs:2},DX-7,S+1,()=>{ const g=evHat('#5b3a8f',.2)(); g.add(evClip()); return g; }); F.acts.push(a); F.cr=a;
  evGo(a,[[DX,S+1],[DX,S-1]],1.5); const note=q=>{ floatAt(q.fx,q.fy-.7,pick(['Elle note…','Hmm…','Elle observe','Elle goûte l’ambiance']),'#8a5cc8'); sparkle(q.fx,q.fy,3,'#c9a6ff'); q.hop=.3; };
  for(let i=0;i<14;i++){ const p=evFreeCell(); evInside(a,p[0],p[1]); evWait(a,3.2,note); }
  const r=mesh(new THREE.RingGeometry(.3,.4,28),new THREE.MeshBasicMaterial({color:'#b388ff',transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}),0,.03,0,false); r.rotation.x=-Math.PI/2; add3(r); F.ring=r; }
 else if(k==='panne'){ F.sp=[KR.x0+KR.w-.5,KR.y0+.4]; F.cd=[]; for(const f of state.furn) if(kindOf(f)==='table'){ const g=new THREE.Group(); g.add(mesh(CY(.025,.025,.09,8),evM('#fff6e0'),0,.045,0)); g.add(mesh(SP(.02,6,5),evM('#ffd23f',{emissive:'#ff9a20',emissiveIntensity:3}),0,.11,0,false)); const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#ffb347',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); sp.position.y=.14; sp.scale.setScalar(1.5); g.add(sp); g.position.set(f.x+.5,.78,f.y+.5); g.userData.sp=sp; g.userData.ph=Math.random()*6; add3(g); F.cd.push(g); } }
 else if(k==='hygiene'){ const a=evActor({skin:'#e8c4a0',hair:'#3a3a3a',body:'#ffffff',pants:'#2f3a4a',gl:true,hat:null,skirt:false},DX-10,S+1,evClip); F.acts.push(a); F.ins=a; evWait(a,Math.max(0,E.T-9)); evGo(a,[[DX-1,S+1]],1.15); evWait(a,.1,q=>{ q.rotT=Math.PI/2; }); F.rings=[]; }
 else if(k==='rosa'){ const a=evActor({skin:'#d9a67c',hair:'#6b3f22',body:'#4f9a54',pants:'#6b4a33',skirt:true,gl:false,hat:null},DX+9,S+1,()=>{ const g=evHat('#e8c36a',.24)(); g.add(evBarrow()); return g; }); F.acts.push(a); F.solo=1;
  evGo(a,[[DX+1,S+1]],2.6); evWait(a,1,q=>{ q.rotT=Math.PI; q.hop=.5; sparkle(q.fx,q.fy,6,'#7bd66c'); }); evWait(a,14); evGo(a,[[DX+10,S+1]],1.4); }
}
function evFxOut(){ const F=evFx; if(!F||F.out) return; F.out=1;
 for(const a of F.acts){ a.plan.length=0; a.path.length=0; a.hide=false;
  if(F.k==='car'){ evGo(a,[[F.stop+.9,S+1.3]],1.6); evWait(a,.1,q=>{ q.hide=true; }); }
  else if(F.k==='critique'){ evInside(a,DX,S-1); evGo(a,[[DX,S+1],[DX+9,S+1]],1.5); }
  else if(F.k==='hygiene'){ evGo(a,[[DX,S+1],[DX,S-2]],1.6); evWait(a,2.2,q=>{ q.rotT=Math.PI; q.hop=.4; floatAt(q.fx,q.fy-.7,trash.length<=2?'Impeccable !':'Hum, hum…',trash.length<=2?'#27a05c':'#c8423a'); }); evGo(a,[[DX,S+1],[DX-9,S+1]],1.5); } }
 if(F.k==='anniv'&&F.p){ evConf(F.p[0],1.7,F.p[1],40); } F.ot=0; }
function evFxEnd(){ const F=evFx; if(!F) return; for(const o of F.objs){ fxRoot.remove(o); } for(const a of F.acts) a.dead=1; evA=evA.filter(a=>!a.dead); evBusOn=false; evFx=null; }
function evFxTick(dt){ const T=performance.now()/1000;
 if(ev&&(!evFx||evFx.E!==ev)){ if(evFx) evFxEnd(); try{ evFxStart(ev.k,ev); }catch(e){ console.warn(e); } }
 const F=evFx; if(!F){ if(evA.length) evA=[]; return; }
 if(cine||warming){ return evFxEnd(); }
 if(!F.solo&&!F.out&&ev!==F.E) evFxOut();
 F.t+=dt; if(F.out) F.ot+=dt;
 for(const a of F.acts) if(!a.dead) evActTick(a,dt);
 if(F.k==='car'){ const b=F.bus; if(!F.out){ if(F.bx<F.stop){ F.bx=Math.min(F.stop,F.bx+Math.max(1.2,Math.min(6,(F.stop-F.bx)*1.6))*dt); if(F.bx>=F.stop){ sfx('pop'); F.arr=1; } } else { b.position.y=Math.sin(T*9)*.004; if(Math.random()<dt*2.2) spawnPart(GLOW,'#ffffff',F.bx+rnd(-1.3,1.3),.85,S+2.1,0,0,0,.22,.7,0,true); } }
   else if(F.ot>2.6){ F.bx+=Math.min(6,1+(F.ot-2.6)*3)*dt; if(Math.random()<dt*8) spawnPart(GLOW,'#cfcfcf',F.bx-1.7,.25,S+2.55,-.4,.2,0,.9,.2,2.5,false); }
   b.position.x=F.bx; b.userData.door.visible=!(F.arr&&!(F.out&&F.ot>2.2)); if(F.out&&F.bx>S+26) return evFxEnd(); return; }
 if(F.k==='anniv'){ for(const f of F.fl) f.scale.setScalar(.8+Math.sin(T*14+f.position.x*40)*.3); for(const b of F.bal){ b.position.y+=Math.sin(T*1.7+b.userData.ph)*.0016; b.rotation.z=Math.sin(T*1.3+b.userData.ph)*.08; if(F.out){ b.position.y+=dt*1.6; } }
  if(!F.out&&Math.random()<dt*1.6) evConf(F.p[0],1.9,F.p[1],3); if(!F.out&&Math.random()<dt*.5) floatAt(F.p[0]-.5,F.p[1]-1,pick(['Joyeux anniversaire !','Hip hip…','Hourra !']),'#e0457f');
  if(F.out){ F.cake.scale.setScalar(Math.max(.01,1-F.ot*.6)); if(F.ot>3) return evFxEnd(); } return; }
 if(F.k==='critique'){ const a=F.cr; F.ring.position.set(a.fx+.5,.03,a.fy+.5); F.ring.scale.setScalar(1+Math.sin(T*4)*.12); F.ring.visible=!a.dead; if(F.out&&a.dead) return evFxEnd(); if(!F.out&&!a.plan.length&&!a.path.length){ const p=evFreeCell(); evInside(a,p[0],p[1]); evWait(a,3); } return; }
 if(F.k==='panne'){ if(!F.out){ if(F.t<1.5) document.body.classList.toggle('blackout',Math.sin(F.t*40)>-.2); else if(!F.dk){ F.dk=1; document.body.classList.add('blackout'); }
   if(Math.random()<dt*7) spawnPart(STAR,pick(['#ffe27a','#ffffff','#9fd8ff']),F.sp[0]+.5,1.35,F.sp[1]+.5,rnd(-1.4,1.4),rnd(.5,2.2),rnd(-1.4,1.4),rnd(.3,.6),.12,0,true);
   for(const g of F.cd){ g.userData.sp.scale.setScalar(1.4+Math.sin(T*11+g.userData.ph)*.18+Math.random()*.08); } }
  else { for(const g of F.cd) g.scale.setScalar(Math.max(.01,1-F.ot*2)); if(F.ot<.2) for(const g of F.cd) sparkle(g.position.x-.5,g.position.z-.5,2,'#fff3a8'); if(F.ot>.6) return evFxEnd(); } return; }
 if(F.k==='hygiene'){ if(!F.out){ while(F.rings.length<trash.length){ const r=mesh(new THREE.RingGeometry(.26,.36,24),new THREE.MeshBasicMaterial({color:'#ff4d4d',transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}),0,.035,0,false); r.rotation.x=-Math.PI/2; fxRoot.add(r); F.objs.push(r); F.rings.push(r); }
   F.rings.forEach((r,i)=>{ const t=trash[i]; r.visible=!!t; if(t){ r.position.set(t.x+.5,.035,t.y+.5); r.scale.setScalar(1+((T*1.6+i*.3)%1)*.7); r.material.opacity=.9-((T*1.6+i*.3)%1)*.8; } }); }
  else { for(const r of F.rings) r.visible=false; if(F.ins.dead) return evFxEnd(); } return; }
 if(F.k==='rosa'){ if(F.acts[0].dead) return evFxEnd(); }
}
