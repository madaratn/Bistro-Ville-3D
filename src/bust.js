// ===================== GROS PLANS 3D (v0.97) : dans les scènes, celui qui parle est un vrai personnage, vivant =====================
// Le buste est rendu à part, dans une petite image, puis recopié dans le médaillon de la scène : il cligne des yeux,
// articule pendant que le texte s'écrit et change d'expression avec la réplique. Si quoi que ce soit coince, on garde le portrait dessiné.
const BUST={on:true,ok:true,root:null,sc:null,cm:null,keyL:null,bg:null,rt:null,N:0,who:null,ex:'',cv:null,ctx:null,img:null,buf:null,pbo:null,wait:null,T:0,acc:0,n:0,E:null,pool:{},shots:false};
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
function bustWant(k){ return BUST.on&&BUST.ok&&HD.on&&!!WHO_LOOK[k]&&typeof renderer!=='undefined'&&!!renderer; }
function bustInit(){ if(BUST.sc) return; const sc=new THREE.Scene(); sc.environment=ENV; sc.environmentIntensity=.34;
 sc.add(new THREE.HemisphereLight(0xfff1e0,0x9c8a78,.6));
 const key=new THREE.DirectionalLight(0xfff0d8,2.05); key.castShadow=!LITE; key.shadow.mapSize.set(512,512); { const c=key.shadow.camera; c.left=-.65; c.right=.65; c.top=.65; c.bottom=-.65; c.near=.5; c.far=9; c.updateProjectionMatrix(); } key.shadow.bias=-.0012; key.shadow.normalBias=.012; key.shadow.radius=3; sc.add(key,key.target);
 const rim=new THREE.DirectionalLight(0xcfe2ff,1.25); rim.position.set(2.6,2.6,-3); sc.add(rim);
 // fond : un halo aux couleurs de celui qui parle (valeurs déjà « écran » : ce plan ne passe pas par la conversion des couleurs)
 const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:{cA:{value:new THREE.Vector3(1,.97,.9)},cB:{value:new THREE.Vector3(.8,.6,.5)}},depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 v; void main(){ v=position.xy; gl_Position=vec4(position.xy,1.,1.); }',
  fragmentShader:'uniform vec3 cA,cB; varying vec2 v; void main(){ float d=length(v-vec2(0.,.12)); gl_FragColor=vec4(mix(cA,cB,smoothstep(.15,1.3,d)),1.); }'}));
 bg.frustumCulled=false; bg.renderOrder=-10; sc.add(bg);
 BUST.sc=sc; BUST.keyL=key; BUST.bg=bg; BUST.cm=new THREE.PerspectiveCamera(19,1,.1,30); }
function bustSize(n){ if(BUST.N===n&&BUST.rt) return; if(BUST.rt) BUST.rt.dispose(); if(BUST.pbo){ try{ renderer.getContext().deleteBuffer(BUST.pbo); }catch(e){} BUST.pbo=null; } BUST.wait=null;
 BUST.N=n; BUST.rt=new THREE.WebGLRenderTarget(n,n,{samples:LITE?0:4,depthBuffer:true}); BUST.buf=new Uint8Array(n*n*4); }
function bustChar(k){ let c=BUST.pool[k]; if(c) return c; const L=WHO_LOOK[k], a={id:L.id,s:{id:L.id,role:'story',outfit:L.outfit},kidF:k==='z'}, o=makeCharHD(a,HD.qBust);
 for(const p of [o.tray,o.tub,o.tab,o.tpe,o.menuB,o.fork,o.phone]) if(p) p.visible=false; o.root.position.set(0,0,0); o.root.rotation.y=.26; o.mesh.frustumCulled=false; o.root.updateMatrixWorld(true);
 const v=new THREE.Vector3(); o.B.head.getWorldPosition(v); const s=o.sc*(o.S.kid?1.1:1), hat=o.S.hatK, up=hat==='toque'?.125:hat==='captain'?.09:hat==='straw'||hat==='bcap'?.07:o.S.hr==='bun'||hat==='bow'||hat==='beret'||hat==='cap'?.06:.035;
 const top=v.y+(.326+up)*s+.015, bot=v.y-.15*s, H=top-bot; c=BUST.pool[k]={k,a,o,cy:(top+bot)/2,d:H/2/Math.tan(9.5*Math.PI/180)}; return c; }
function bustFree(){ if(BUST.root&&BUST.sc){ BUST.sc.remove(BUST.root); } BUST.root=null; for(const k in BUST.pool){ try{ charFree(BUST.pool[k].o); }catch(e){} } BUST.pool={}; }
function bustEx(k,ex){ return BUST_EX[ex]||BUST_EX[(PORTRAIT[k]||{}).expr]||BUST_EX['']; }
function bustAnim(c,dt){ const o=c.o, B=o.B, T=BUST.T, S=scOn, X=bustEx(c.k,BUST.ex), hid=.001; let E=BUST.E; if(!E){ E=BUST.E=Object.assign({tk:0},X); }
 const q=Math.min(1,dt*8); for(const f in X) E[f]+=(X[f]-E[f])*q;
 const talk=!!(S&&S.typing&&S.who===c.k), ch=talk?(S.full[S.n-1]||''):'', pause=/[\s,.;:!?…»«—-]/.test(ch); E.tk+=((talk?1:0)-E.tk)*Math.min(1,dt*10);
 // corps : au repos, il respire
 o.P.aL=o.P.aR=.12; o.P.zL=o.P.zR=.1; o.P.lean=.03+E.pit*.3; hdLimbs(c.a,o,dt,T,0,0,0,1,1+Math.sin(T*1.7)*.014);
 // tête : elle accompagne la parole
 const nod=(Math.sin(T*7.3)*.022+Math.sin(T*3.1)*.016)*E.tk;
 B.head.rotation.set(E.pit+nod+Math.sin(T*.83)*.018,-.2+Math.sin(T*.47)*.06+Math.sin(T*1.9)*.02*E.tk,E.rol+Math.sin(T*.61)*.022);
 // yeux : clignements, regard vers le lecteur, petites saccades
 o.blinkT-=dt; if(o.blinkT<=0) o.blinkT=rnd(2.2,5); const ey=o.blinkT<.12?.08:E.ey*(o.S.eyeO||1), sq=E.sq>.5&&E.tk<.5;
 if(sq){ B.eyeR.scale.setScalar(hid); B.eyeL.scale.setScalar(hid); B.arcs.scale.setScalar(1); } else { B.eyeR.scale.set(1,ey,1); B.eyeL.scale.set(1,ey,1); B.arcs.scale.setScalar(hid); }
 c.gt=(c.gt||0)-dt; if(c.gt<=0){ c.gt=rnd(.8,2.6); c.gx=rnd(-1,1)*(Math.random()<.3?.004:.0012); c.gy=rnd(-1,1)*.0012; }
 const gx=-.0012+(c.gx||0), gy=(c.gy||0)+.0006-E.pit*.012; B.irisR.position.set(gx,gy,0); B.irisL.position.set(gx,gy,0);
 // sourcils
 B.browL.rotation.z=E.bz; B.browR.rotation.z=-E.bz; B.browL.position.y=o.by0+E.by+E.sk*.007+E.tk*Math.max(0,Math.sin(T*2.3))*.003; B.browR.position.y=o.by0+E.by;
 // bouche : elle articule tant que le texte s'écrit, et se repose sur l'expression du moment
 const ph=Math.abs(Math.sin(T*12.5+Math.sin(T*4.3)*1.7)), open=E.tk>.5&&!pause&&ph>.3;
 if(open){ B.mOpen.scale.set(.72+.22*ph,.3+.7*ph,1); B.mSmile.scale.setScalar(hid); }
 else if(E.oh>.5&&E.tk<.5){ B.mOpen.scale.set(.6,.95,1); B.mSmile.scale.setScalar(hid); }
 else { B.mOpen.scale.setScalar(hid); B.mSmile.scale.set(E.sx,Math.max(.2,E.sy),1); B.mSmile.rotation.z=(E.fr>.5?Math.PI:0)+E.sk*.2; }
 const hs=Math.sin(T*1.3)*.03-nod*1.2; B.hair1.rotation.x=hs; B.hair2.rotation.x=hs; }
function bustRender(c){ const r=renderer, sm=r.shadowMap, rt0=r.getRenderTarget(), nu=sm.needsUpdate, rw=HD.rim.w, W=SAGA_WHO[c.k]||['','#8a6a4a'], col=hdSRGB(W[1]);
 if(BUST.root!==c.o.root){ if(BUST.root) BUST.sc.remove(BUST.root); BUST.sc.add(c.o.root); BUST.root=c.o.root; }
 BUST.bg.material.uniforms.cA.value.set(1,.975,.91); BUST.bg.material.uniforms.cB.value.set(.42+col[0]*.58,.4+col[1]*.6,.38+col[2]*.62);
 const cm=BUST.cm, key=BUST.keyL; cm.position.set(0,c.cy+.03,c.d); cm.lookAt(0,c.cy,0); key.position.set(-1.7,c.cy+1.9,3.2); key.target.position.set(0,c.cy,0);
 HD.out.value=1; HD.rim.w=.42; sm.needsUpdate=true;
 try{ r.setRenderTarget(BUST.rt); r.render(BUST.sc,cm); } finally{ HD.out.value=0; HD.rim.w=rw; sm.needsUpdate=nu; r.setRenderTarget(rt0); } }
function hdSRGB(hex){ const n=parseInt(String(hex).replace('#',''),16)||0; return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; }
function bustPut(cv,ctx,img){ const N=BUST.N, d=img.data, b=BUST.buf, R=N*4; for(let y=0;y<N;y++) d.set(b.subarray((N-1-y)*R,(N-y)*R),y*R); ctx.putImageData(img,0,0); }
// lecture de l'image sans bloquer la carte graphique : on demande la copie, on la récupère une image plus tard
function bustAsk(){ const gl=renderer.getContext(), N=BUST.N, fb=renderer.properties.get(BUST.rt).__webglFramebuffer; if(!fb) return false;
 renderer.state.bindFramebuffer(gl.FRAMEBUFFER,fb); if(!BUST.pbo){ BUST.pbo=gl.createBuffer(); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,BUST.pbo); gl.bufferData(gl.PIXEL_PACK_BUFFER,N*N*4,gl.STREAM_READ); } else gl.bindBuffer(gl.PIXEL_PACK_BUFFER,BUST.pbo);
 gl.readPixels(0,0,N,N,gl.RGBA,gl.UNSIGNED_BYTE,0); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null); renderer.state.bindFramebuffer(gl.FRAMEBUFFER,null); renderer.setRenderTarget(null);
 BUST.wait={s:gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0),k:BUST.who,t:0}; gl.flush(); return true; }
function bustPoll(dt){ const w=BUST.wait; if(!w) return true; const gl=renderer.getContext(), s=gl.clientWaitSync(w.s,0,0); w.t+=dt;
 if(s===gl.TIMEOUT_EXPIRED&&w.t<1.5) return false;
 BUST.wait=null; try{ gl.deleteSync(w.s); }catch(e){} if(s===gl.WAIT_FAILED||s===gl.TIMEOUT_EXPIRED) return true;
 gl.bindBuffer(gl.PIXEL_PACK_BUFFER,BUST.pbo); gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,BUST.buf); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);
 if(w.k===BUST.who&&BUST.cv){ bustPut(BUST.cv,BUST.ctx,BUST.img); if(!BUST.n++) BUST.cv.style.opacity='1'; } return true; }
function bustReadNow(){ const gl=renderer.getContext(), N=BUST.N, fb=renderer.properties.get(BUST.rt).__webglFramebuffer; renderer.state.bindFramebuffer(gl.FRAMEBUFFER,fb); gl.readPixels(0,0,N,N,gl.RGBA,gl.UNSIGNED_BYTE,BUST.buf); renderer.state.bindFramebuffer(gl.FRAMEBUFFER,null); renderer.setRenderTarget(null); }
// ---------- pendant une scène ----------
function bustSet(k,ex){ if(!k){ BUST.who=null; return; }
 const po=scEl().querySelector('.scPo'); let cv=po.querySelector('canvas'); if(!cv){ cv=document.createElement('canvas'); po.appendChild(cv); }
 const w=po.clientWidth||150, n=Math.min(LITE?256:416,Math.max(160,Math.round(w*Math.min(window.devicePixelRatio||1,LITE?1.5:2.5)/16)*16));
 bustInit(); bustSize(n); if(cv.width!==n){ cv.width=cv.height=n; BUST.ctx=null; } if(BUST.cv!==cv||!BUST.ctx){ BUST.cv=cv; BUST.ctx=cv.getContext('2d'); BUST.img=BUST.ctx.createImageData(n,n); }
 if(BUST.who!==k){ BUST.who=k; BUST.n=0; BUST.E=null; BUST.acc=1; cv.style.opacity='0'; } BUST.ex=ex||''; }
function bustFrame(dt){ if(!BUST.who||!BUST.ok||BUST.shots) return; BUST.T+=dt; BUST.acc+=dt; if(!bustPoll(dt)) return; if(BUST.acc<(LITE?.05:.03)) return;
 const c=bustChar(BUST.who); bustAnim(c,Math.min(.1,BUST.acc)); BUST.acc=0; bustRender(c);
 if(!BUST.n){ bustReadNow(); const b=BUST.buf, N=BUST.N, i=(N*(N>>1)+(N>>1))*4, j=(N*8+8)*4; if(b[i]+b[i+1]+b[i+2]+b[j]+b[j+1]+b[j+2]<12) throw new Error('image vide'); bustPut(BUST.cv,BUST.ctx,BUST.img); BUST.n=1; BUST.cv.style.opacity='1'; }
 else bustAsk(); }
function bustFail(e){ console.warn('bust',e); BUST.ok=false; BUST.who=null; try{ const po=scEl().querySelector('.scPo'); po.classList.remove('b3d'); }catch(err){} }
// ---------- les portraits fixes (fiches des voisins, journal…) : les mêmes personnages, photographiés une fois ----------
function bustShots(){ if(!BUST.on||!BUST.ok||!HD.on||BUST.shots||typeof renderer==='undefined'||!renderer) return; const keys=Object.keys(WHO_LOOK).filter(k=>PORTRAIT[k]); if(!keys.length) return;
 BUST.shots=true; const N=224, tc=document.createElement('canvas'); tc.width=tc.height=N; const tx=tc.getContext('2d'); let i=0;
 const fin=()=>{ BUST.shots=false; bustFree(); try{ for(const k in scFaceC) delete scFaceC[k]; }catch(e){} try{ icoRe=null; }catch(e){} try{ if(typeof hud==='function'&&state) hud(); }catch(e){} };
 const step=()=>{ if(scOn){ BUST.shots=false; setTimeout(()=>{ if(!BUST.shots) bustShots(); },4000); return; }
  if(BUST.wait){ try{ bustPoll(.2); }catch(e){ BUST.wait=null; } if(BUST.wait){ setTimeout(step,200); return; } }
  try{ bustInit(); const n0=BUST.N; bustSize(N); const k=keys[i], c=bustChar(k), w0=BUST.who, e0=BUST.ex, E0=BUST.E; BUST.who=k; BUST.ex=''; BUST.E=null; for(let j=0;j<6;j++){ BUST.T+=.1; bustAnim(c,.1); } c.o.blinkT=3; bustAnim(c,.01);
   bustRender(c); bustReadNow(); const b=BUST.buf, m=(N*(N>>1)+(N>>1))*4; if(b[m]+b[m+1]+b[m+2]<6) throw new Error('image vide');
   const img=tx.createImageData(N,N); bustPut(tc,tx,img); foodThumbs['who:'+k]=tc.toDataURL('image/png'); BUST.who=w0; BUST.ex=e0; BUST.E=E0; if(n0&&n0!==N) bustSize(n0);
  }catch(e){ console.warn('bust',e); BUST.ok=false; return fin(); }
  if(++i<keys.length) setTimeout(step,navigator.webdriver?0:220); else fin(); };
 setTimeout(step,navigator.webdriver?0:900); }
