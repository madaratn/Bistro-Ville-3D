// ===================== ACTEURS 3D (v0.97 puis v0.98) : dans les scènes, ceux qui parlent sont de vrais personnages, vivants =====================
// Chaque acteur est rendu à part, dans une petite image, puis recopié dans la page : il cligne des yeux, articule pendant que le texte
// s'écrit, fait des gestes et change d'expression avec la réplique. v0.98 : deux acteurs en pied se font face au-dessus du texte ;
// celui qui écoute reste dans l'ombre. Si quoi que ce soit coince, on garde le portrait dessiné.
const BUST={on:true,ok:true,root:null,sc:null,cm:null,keyL:null,bg:null,rt:null,W:0,H:0,buf:null,pbo:null,wait:null,T:0,acc:0,tick:0,cur:0,pool:{},shots:false,
 slots:[{k:null,ex:'',cv:null,ctx:null,img:null,n:0,dirty:false,t:0},{k:null,ex:'',cv:null,ctx:null,img:null,n:0,dirty:false,t:0}]};
try{ if(localStorage.getItem('bv_bust')==='0') BUST.on=false; }catch(e){}
const BUST_EX={ // sourire (largeur, hauteur), moue, sourcils (angle, hauteur), ouverture des yeux, yeux rieurs, bouche ronde, tête (penchée, inclinée), sourire en coin
 '':    {sx:.95,sy:.7,  fr:0,bz:0,   by:0,    ey:1,   sq:0,oh:0,pit:0,   rol:0,   sk:0},
 warm:  {sx:1.1,sy:1.0, fr:0,bz:-.05,by:.004, ey:.92, sq:0,oh:0,pit:.03, rol:.06, sk:0},
 smile: {sx:1.05,sy:.9, fr:0,bz:0,   by:.003, ey:1,   sq:0,oh:0,pit:0,   rol:.03, sk:0},
 grin:  {sx:1.25,sy:1.25,fr:0,bz:-.04,by:.007,ey:1,   sq:1,oh:0,pit:-.04,rol:-.04,sk:0},
 smirk: {sx:.95,sy:.75, fr:0,bz:.1,  by:.002, ey:.84, sq:0,oh:0,pit:-.03,rol:-.07,sk:1},
 sad:   {sx:.9, sy:.75, fr:1,bz:-.3, by:.003, ey:.84, sq:0,oh:0,pit:.12, rol:.05, sk:0},
 oh:    {sx:.9, sy:.7,  fr:0,bz:-.1, by:.012, ey:1.14,sq:0,oh:1,pit:-.05,rol:0,   sk:0},
 stern: {sx:.85,sy:.32, fr:1,bz:.3,  by:-.006,ey:.86, sq:0,oh:0,pit:.04, rol:0,   sk:0},
 pursed:{sx:.7, sy:.4,  fr:0,bz:.16, by:-.003,ey:.88, sq:0,oh:0,pit:-.02,rol:.03, sk:0},
};
BUST_EX.gruff=BUST_EX.stern;
// les gestes : épaule gauche, épaule droite (0 = bras le long du corps, 1,6 = à l'horizontale), écartement, et l'ampleur du geste quand on parle
const BUST_G={'':[.12,.12,.1,.1,1],warm:[.78,.78,-.26,-.26,.35],smile:[.14,.2,.1,.1,1],grin:[.25,2.25,.12,.38,.5],smirk:[.42,.16,.5,.1,.8],sad:[.04,.04,.03,.03,.25],oh:[1.75,1.75,.14,.14,.2],stern:[1.02,1.02,-.5,-.5,.15],pursed:[.3,1.85,.1,-.32,.2]};
BUST_G.gruff=BUST_G.stern;
const BUST_EM={oh:'!',sad:'…',grin:'♪',warm:'♥',stern:'!!',gruff:'!!',smirk:'✦'};
function bustWant(k){ return BUST.on&&BUST.ok&&HD.on&&!!WHO_LOOK[k]&&typeof renderer!=='undefined'&&!!renderer; }
function bustInit(){ if(BUST.sc) return; const sc=new THREE.Scene(); sc.environment=ENV; sc.environmentIntensity=.34;
 sc.add(new THREE.HemisphereLight(0xfff1e0,0x9c8a78,.6));
 const key=new THREE.DirectionalLight(0xfff0d8,2.05); key.castShadow=!LITE; key.shadow.mapSize.set(512,512); { const c=key.shadow.camera; c.left=-.7; c.right=.7; c.top=.7; c.bottom=-.7; c.near=.5; c.far=9; c.updateProjectionMatrix(); } key.shadow.bias=-.0012; key.shadow.normalBias=.012; key.shadow.radius=3; sc.add(key,key.target);
 const rim=new THREE.DirectionalLight(0xcfe2ff,1.25); rim.position.set(2.6,2.6,-3); sc.add(rim);
 // fond du médaillon : un halo aux couleurs du personnage (valeurs déjà « écran » : ce plan ne passe pas par la conversion des couleurs)
 const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:{cA:{value:new THREE.Vector3(1,.97,.9)},cB:{value:new THREE.Vector3(.8,.6,.5)}},depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 v; void main(){ v=position.xy; gl_Position=vec4(position.xy,1.,1.); }',
  fragmentShader:'uniform vec3 cA,cB; varying vec2 v; void main(){ float d=length(v-vec2(0.,.12)); gl_FragColor=vec4(mix(cA,cB,smoothstep(.15,1.3,d)),1.); }'}));
 bg.frustumCulled=false; bg.renderOrder=-10; sc.add(bg);
 BUST.sc=sc; BUST.keyL=key; BUST.bg=bg; BUST.cm=new THREE.PerspectiveCamera(19,1,.1,30); }
function bustSize(w,h){ if(BUST.W===w&&BUST.H===h&&BUST.rt) return; if(BUST.rt) BUST.rt.dispose(); if(BUST.pbo){ try{ renderer.getContext().deleteBuffer(BUST.pbo); }catch(e){} BUST.pbo=null; } BUST.wait=null;
 BUST.W=w; BUST.H=h; BUST.rt=new THREE.WebGLRenderTarget(w,h,{samples:LITE?0:4,depthBuffer:true}); BUST.buf=new Uint8Array(w*h*4); }
function bustChar(k){ let c=BUST.pool[k]; if(c) return c; const L=WHO_LOOK[k], a={id:L.id,s:{id:L.id,role:'story',outfit:L.outfit},kidF:k==='z'}, o=makeCharHD(a,HD.qBust);
 for(const p of [o.tray,o.tub,o.tab,o.tpe,o.menuB,o.fork,o.phone]) if(p) p.visible=false; o.root.position.set(0,0,0); o.root.rotation.y=.26; o.mesh.frustumCulled=false; o.root.updateMatrixWorld(true);
 const v=new THREE.Vector3(); o.B.head.getWorldPosition(v); const s=o.sc*(o.S.kid?1.1:1), hat=o.S.hatK, up=hat==='toque'?.125:hat==='captain'?.09:hat==='straw'||hat==='bcap'?.07:o.S.hr==='bun'||hat==='bow'||hat==='beret'||hat==='cap'?.06:.035;
 const top=v.y+(.326+up)*s+.015, bot=v.y-.15*s, H=top-bot, tall=hat==='toque'?.1:hat==='captain'||hat==='straw'?.04:0;
 c=BUST.pool[k]={k,a,o,cy:(top+bot)/2,d:H/2/Math.tan(9.5*Math.PI/180),ay:.12+(1.02+tall)/2,ad:(1.02+tall)/2/Math.tan(9.5*Math.PI/180),E:null}; return c; }
function bustFree(){ if(BUST.root&&BUST.sc){ BUST.sc.remove(BUST.root); } BUST.root=null; for(const k in BUST.pool){ try{ charFree(BUST.pool[k].o); }catch(e){} } BUST.pool={}; }
function bustEx(k,ex){ return BUST_EX[ex]||BUST_EX[(PORTRAIT[k]||{}).expr]||BUST_EX['']; }
// m : {act: acteur en pied (sinon médaillon), on: c'est lui qui parle, side: 0 à gauche, 1 à droite, ex: expression}
function bustAnim(c,dt,m){ const o=c.o, B=o.B, T=BUST.T, S=scOn, ex=m.ex||'', X=bustEx(c.k,ex), hid=.001, sd=m.side?-1:1; let E=c.E; if(!E){ E=c.E=Object.assign({tk:0,aL:.12,aR:.12,zL:.1,zR:.1},X); }
 const q=Math.min(1,dt*8); for(const f in X) E[f]+=(X[f]-E[f])*q;
 const talk=!!(m.on&&S&&S.typing&&S.who===c.k&&!(S.hold>0)), ch=talk?(S.full[S.n-1]||''):'', pause=/[\s,.;:!?…»«—-]/.test(ch); E.tk+=((talk?1:0)-E.tk)*Math.min(1,dt*10);
 // corps : il respire, et ses mains parlent avec lui
 const G=(m.act&&m.on&&(BUST_G[ex]||BUST_G[(PORTRAIT[c.k]||{}).expr]))||BUST_G[''], id=c.a.id, gk=m.act?G[4]*E.tk:0, qa=Math.min(1,dt*6);
 let aL=G[0], aR=G[1], zL=G[2], zR=G[3]; if(gk>0){ const b=Math.max(0,Math.sin(T*1.15+id)); aR=Math.max(aR,.2+.95*b)+Math.sin(T*4.6+id)*.2*gk*b; zR+=Math.sin(T*3.1+id)*.16*gk*b; aL+=Math.max(0,Math.sin(T*.8+id*2))*.3*gk; }
 if(ex==='grin'&&m.act&&m.on){ aR+=Math.sin(T*7)*.12; zR+=Math.sin(T*7+1)*.1; }
 E.aL+=(aL-E.aL)*qa; E.aR+=(aR-E.aR)*qa; E.zL+=(zL-E.zL)*qa; E.zR+=(zR-E.zR)*qa;
 o.P.aL=E.aL; o.P.aR=E.aR; o.P.zL=E.zL; o.P.zR=E.zR; o.P.lean=.03+E.pit*.3; hdLimbs(c.a,o,dt,T,0,0,0,1,1+Math.sin(T*1.7+id)*.014);
 if(m.act){ o.root.rotation.y=sd*.3+Math.sin(T*.5+id)*.02; B.body.rotation.z=Math.sin(T*.7+id)*.012+(ex==='smirk'?-.03*sd:0); }
 // tête : elle accompagne la parole ; celui qui écoute regarde l'autre
 const nod=(Math.sin(T*7.3)*.022+Math.sin(T*3.1)*.016)*E.tk, yaw=m.act?(m.on?-sd*.2:sd*.12):-.2, lst=m.act&&!m.on?Math.max(0,Math.sin(T*.9+id))*.04:0;
 B.head.rotation.set(E.pit+nod+lst+Math.sin(T*.83+id)*.018,yaw+Math.sin(T*.47+id)*.06+Math.sin(T*1.9)*.02*E.tk,(m.act?sd:1)*E.rol+Math.sin(T*.61+id)*.022);
 // yeux : clignements, regard vers le lecteur, petites saccades
 o.blinkT-=dt; if(o.blinkT<=0) o.blinkT=rnd(2.2,5); const ey=o.blinkT<.12?.08:E.ey*(o.S.eyeO||1), sq=E.sq>.5&&E.tk<.5;
 if(sq){ B.eyeR.scale.setScalar(hid); B.eyeL.scale.setScalar(hid); B.arcs.scale.setScalar(1); } else { B.eyeR.scale.set(1,ey,1); B.eyeL.scale.set(1,ey,1); B.arcs.scale.setScalar(hid); }
 c.gt=(c.gt||0)-dt; if(c.gt<=0){ c.gt=rnd(.8,2.6); c.gx=rnd(-1,1)*(Math.random()<.3?.004:.0012); c.gy=rnd(-1,1)*.0012; }
 const gx=(m.act?(m.on?-sd*.0016:sd*.004):-.0012)+(c.gx||0), gy=(c.gy||0)+.0006-E.pit*.012; B.irisR.position.set(gx,gy,0); B.irisL.position.set(gx,gy,0);
 // sourcils
 B.browL.rotation.z=E.bz; B.browR.rotation.z=-E.bz; B.browL.position.y=o.by0+E.by+E.sk*.007+E.tk*Math.max(0,Math.sin(T*2.3))*.003; B.browR.position.y=o.by0+E.by;
 // bouche : elle articule tant que le texte s'écrit, et se repose sur l'expression du moment
 const ph=Math.abs(Math.sin(T*12.5+Math.sin(T*4.3)*1.7)), open=E.tk>.5&&!pause&&ph>.3;
 if(open){ B.mOpen.scale.set(.72+.22*ph,.3+.7*ph,1); B.mSmile.scale.setScalar(hid); }
 else if(E.oh>.5&&E.tk<.5){ B.mOpen.scale.set(.6,.95,1); B.mSmile.scale.setScalar(hid); }
 else { B.mOpen.scale.setScalar(hid); B.mSmile.scale.set(E.sx,Math.max(.2,E.sy),1); B.mSmile.rotation.z=(E.fr>.5?Math.PI:0)+E.sk*.2; }
 const hs=Math.sin(T*1.3+id)*.03-nod*1.2; B.hair1.rotation.x=hs; B.hair2.rotation.x=hs; }
function bustRender(c,m){ const r=renderer, sm=r.shadowMap, rt0=r.getRenderTarget(), nu=sm.needsUpdate, rw=HD.rim.w, W=SAGA_WHO[c.k]||['','#8a6a4a'], col=hdSRGB(W[1]), act=!!(m&&m.act);
 if(BUST.root!==c.o.root){ if(BUST.root) BUST.sc.remove(BUST.root); BUST.sc.add(c.o.root); BUST.root=c.o.root; }
 BUST.bg.visible=!act; BUST.bg.material.uniforms.cA.value.set(1,.975,.91); BUST.bg.material.uniforms.cB.value.set(.42+col[0]*.58,.4+col[1]*.6,.38+col[2]*.62);
 const cm=BUST.cm, key=BUST.keyL, cy=act?c.ay:c.cy, d=act?c.ad:c.d, as=BUST.W/BUST.H; if(cm.aspect!==as){ cm.aspect=as; cm.updateProjectionMatrix(); }
 if(!act) c.o.root.rotation.y=.26;
 cm.position.set(0,cy+.03,d); cm.lookAt(0,cy,0); key.position.set(act&&m.side?1.5:-1.7,cy+1.9,3.2); key.target.position.set(0,cy,0);
 const ca=r.getClearAlpha(), cc=BUST.cc||(BUST.cc=new THREE.Color()); r.getClearColor(cc);
 HD.out.value=1; HD.rim.w=.42; sm.needsUpdate=true;
 try{ r.setRenderTarget(BUST.rt); if(act) r.setClearColor(0x000000,0); r.clear(); r.render(BUST.sc,cm); } finally{ HD.out.value=0; HD.rim.w=rw; sm.needsUpdate=nu; r.setClearColor(cc,ca); r.setRenderTarget(rt0); } }
function hdSRGB(hex){ const n=parseInt(String(hex).replace('#',''),16)||0; return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; }
// recopie dans la page : l'image arrive à l'envers, et les bords adoucis d'un acteur détouré doivent retrouver leur vraie couleur
function bustPut(ctx,img,alpha){ const W=BUST.W, H=BUST.H, d=img.data, b=BUST.buf, R=W*4;
 if(!alpha){ for(let y=0;y<H;y++) d.set(b.subarray((H-1-y)*R,(H-y)*R),y*R); }
 else { const s=new Uint32Array(b.buffer,b.byteOffset,W*H), t=new Uint32Array(d.buffer,d.byteOffset,W*H); for(let y=0;y<H;y++){ let si=(H-1-y)*W, di=y*W; for(let x=0;x<W;x++,si++,di++){ let p=s[si]; const a=p>>>24; if(a>0&&a<255){ const f=255/a; p=(a<<24)|(Math.min(255,((p>>>16)&255)*f)<<16)|(Math.min(255,((p>>>8)&255)*f)<<8)|Math.min(255,(p&255)*f); } t[di]=p; } } }
 ctx.putImageData(img,0,0); }
// lecture de l'image sans bloquer la carte graphique : on demande la copie, on la récupère une image plus tard
function bustAsk(slot){ const gl=renderer.getContext(), W=BUST.W, H=BUST.H, fb=renderer.properties.get(BUST.rt).__webglFramebuffer; if(!fb) return false;
 renderer.state.bindFramebuffer(gl.FRAMEBUFFER,fb); if(!BUST.pbo){ BUST.pbo=gl.createBuffer(); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,BUST.pbo); gl.bufferData(gl.PIXEL_PACK_BUFFER,W*H*4,gl.STREAM_READ); } else gl.bindBuffer(gl.PIXEL_PACK_BUFFER,BUST.pbo);
 gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,0); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null); renderer.state.bindFramebuffer(gl.FRAMEBUFFER,null); renderer.setRenderTarget(null);
 BUST.wait={s:gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0),slot,k:BUST.slots[slot].k,t:0}; gl.flush(); return true; }
function bustPoll(dt){ const w=BUST.wait; if(!w) return true; const gl=renderer.getContext(), s=gl.clientWaitSync(w.s,0,0); w.t+=dt;
 if(s===gl.TIMEOUT_EXPIRED&&w.t<1.5) return false;
 BUST.wait=null; try{ gl.deleteSync(w.s); }catch(e){} if(s===gl.WAIT_FAILED||s===gl.TIMEOUT_EXPIRED) return true;
 gl.bindBuffer(gl.PIXEL_PACK_BUFFER,BUST.pbo); gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,BUST.buf); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);
 const sl=BUST.slots[w.slot]; if(sl&&sl.k===w.k&&sl.ctx){ bustPut(sl.ctx,sl.img,true); sl.n++; } return true; }
function bustReadNow(){ const gl=renderer.getContext(), fb=renderer.properties.get(BUST.rt).__webglFramebuffer; renderer.state.bindFramebuffer(gl.FRAMEBUFFER,fb); gl.readPixels(0,0,BUST.W,BUST.H,gl.RGBA,gl.UNSIGNED_BYTE,BUST.buf); renderer.state.bindFramebuffer(gl.FRAMEBUFFER,null); renderer.setRenderTarget(null); }
// ---------- pendant une scène : deux places, celui qui parle passe dans la lumière ----------
function actDom(){ const e=scEl(); let A=e.querySelector('.scActs'); if(!A){ A=document.createElement('div'); A.className='scActs'; A.innerHTML='<canvas class="a0"></canvas><canvas class="a1"></canvas><i class="scEm"></i>'; const st=e.querySelector('.scStage'); st.insertBefore(A,st.querySelector('.scBox')); }
 const cv=A.querySelectorAll('canvas'), hpx=Math.max(120,Math.min(innerWidth*.68,innerHeight*.42,320)), dpr=Math.min(window.devicePixelRatio||1,LITE?1.5:2.5), H=Math.min(LITE?320:640,Math.round(hpx*dpr/8)*8), W=Math.round(H*5/6/4)*4;
 bustInit(); bustSize(W,H); BUST.slots.forEach((s,i)=>{ const c=cv[i]; if(s.cv!==c||c.width!==W||c.height!==H){ c.width=W; c.height=H; s.cv=c; s.ctx=c.getContext('2d'); s.img=s.ctx.createImageData(W,H); s.n=0; c.classList.remove('vis'); } }); return A; }
function actClear(){ BUST.slots.forEach(s=>{ s.k=null; s.n=0; s.ex=''; if(s.cv) s.cv.classList.remove('vis','on'); }); BUST.cur=0; try{ scEl().classList.remove('act','actR'); }catch(e){} }
// une réplique : qui parle, avec quelle expression. Renvoie vrai si les acteurs 3D s'en chargent.
function actLine(w,ex){ const e=scEl(), A=BUST.slots; if(!bustWant(w)){ e.classList.remove('act','actR'); return false; }
 const box=actDom(), si=A[0].k===w?0:A[1].k===w?1:!A[0].k?0:!A[1].k?1:1-BUST.cur, s=A[si], fresh=s.k!==w;
 if(fresh){ s.k=w; s.n=0; s.cv.classList.remove('vis'); const c=BUST.pool[w]; if(c) c.E=null; }
 s.ex=ex||''; s.dirty=true; A[1-si].dirty=true; BUST.cur=si; BUST.acc=1;
 e.classList.add('act'); e.classList.toggle('actR',si===1); A.forEach((x,i)=>{ if(x.cv) x.cv.classList.toggle('on',i===si); });
 const em=box.querySelector('.scEm'), g=BUST_EM[ex||'']; em.className='scEm'; if(g){ em.textContent=g; void em.offsetWidth; em.className='scEm on '+(si?'r':'l'); }
 return true; }
function bustFrame(dt){ if(!BUST.ok||BUST.shots) return; const A=BUST.slots; if(!A[0].k&&!A[1].k) return; BUST.T+=dt; BUST.acc+=dt; if(!bustPoll(dt)) return; if(BUST.acc<(LITE?.05:.03)) return;
 const cur=BUST.cur, oth=1-cur; let si=cur; BUST.tick++; if(A[oth].k&&(!A[oth].n||A[oth].dirty||BUST.tick%12===0)&&A[cur].n) si=oth; if(!A[si].k) si=cur; const s=A[si]; if(!s.k||!s.ctx) return;
 const c=bustChar(s.k), d=si===cur?Math.min(.1,BUST.acc):Math.min(.4,Math.max(.03,BUST.T-(s.t||BUST.T))); s.t=BUST.T; s.dirty=false; if(si===cur) BUST.acc=0;
 const m={act:1,on:si===cur,side:si,ex:s.ex}; bustAnim(c,d,m); bustRender(c,m);
 if(!s.n){ bustReadNow(); const b=BUST.buf; let sum=0; for(let i=3;i<b.length;i+=388) sum+=b[i]; if(!sum) throw new Error('image vide'); bustPut(s.ctx,s.img,true); s.n=1; s.cv.classList.add('vis'); }
 else bustAsk(si); }
function bustFail(e){ console.warn('acteurs',e); BUST.ok=false; try{ actClear(); }catch(err){} }
// ---------- les portraits fixes (fiches des voisins, journal, tutoriel…) : les mêmes personnages, photographiés une fois ----------
function bustShots(){ if(!BUST.on||!BUST.ok||!HD.on||BUST.shots||typeof renderer==='undefined'||!renderer) return; const keys=Object.keys(WHO_LOOK).filter(k=>PORTRAIT[k]); if(!keys.length) return;
 BUST.shots=true; const N=224, tc=document.createElement('canvas'); tc.width=tc.height=N; const tx=tc.getContext('2d'); let i=0;
 const fin=()=>{ BUST.shots=false; bustFree(); try{ for(const k in scFaceC) delete scFaceC[k]; }catch(e){} try{ icoRe=null; }catch(e){} try{ if(typeof hud==='function'&&state) hud(); }catch(e){} };
 const step=()=>{ if(scOn){ BUST.shots=false; setTimeout(()=>{ if(!BUST.shots) bustShots(); },4000); return; }
  if(BUST.wait){ try{ bustPoll(.2); }catch(e){ BUST.wait=null; } if(BUST.wait){ setTimeout(step,200); return; } }
  try{ bustInit(); bustSize(N,N); const k=keys[i], c=bustChar(k); c.E=null; for(let j=0;j<6;j++){ BUST.T+=.1; bustAnim(c,.1,{}); } c.o.blinkT=3; bustAnim(c,.01,{});
   bustRender(c,null); bustReadNow(); const b=BUST.buf, m=(N*(N>>1)+(N>>1))*4; if(b[m]+b[m+1]+b[m+2]<6) throw new Error('image vide');
   const img=tx.createImageData(N,N); bustPut(tx,img,false); foodThumbs['who:'+k]=tc.toDataURL('image/png');
  }catch(e){ console.warn('acteurs',e); BUST.ok=false; return fin(); }
  if(++i<keys.length) setTimeout(step,navigator.webdriver?0:220); else fin(); };
 setTimeout(step,navigator.webdriver?0:900); }
