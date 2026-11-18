/* ================= RENDU 3D (Three.js) ================= */
const FONT='Fredoka,"Trebuchet MS",sans-serif';
const cv=$('#c');
let LITE=false; try{ const ua=navigator.userAgent||'', q=new URLSearchParams(location.search), pref=localStorage.getItem('bv_lite'); LITE=q.get('lite')==='1'||pref==='1'||(pref!=='0'&&((navigator.deviceMemory&&navigator.deviceMemory<=3)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||/Android [4-8][.;]/.test(ua))); }catch(e){}
const PXR=()=>LITE?1:Math.min(2,window.devicePixelRatio||1);
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!LITE,powerPreference:'high-performance'});
renderer.setPixelRatio(PXR());
renderer.shadowMap.enabled=!LITE; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
const SKY_D=new THREE.Color('#f2dfae'), SKY_N=new THREE.Color('#2a2238');
scene.background=SKY_D.clone(); scene.fog=new THREE.Fog(SKY_D.clone(),70,170);
const FOV0=26, camera=new THREE.PerspectiveCamera(FOV0,1,1,500);
const cam={tx:4,tz:4,dist:40,yaw:Math.PI/4,pitch:.57};
const pmrem=new THREE.PMREMGenerator(renderer); const ENV=pmrem.fromScene(new RoomEnvironment(),.04).texture; scene.environment=ENV; scene.environmentIntensity=.25;
const hemi=new THREE.HemisphereLight(0xffe6c4,0xc49a62,1.0); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d6,2.7); sun.castShadow=!LITE; sun.shadow.mapSize.set(LITE?512:2048,LITE?512:2048); sun.shadow.bias=-.0004; sun.shadow.normalBias=.03; sun.shadow.radius=3; scene.add(sun,sun.target);
const inLight=new THREE.PointLight(0xffbf73,0,0,1.1); scene.add(inLight);
const C_SUN_D=new THREE.Color('#ffd49a'), C_SUN_N=new THREE.Color('#7f8fd0'), C_HEMI_D=new THREE.Color('#ffe6c4'), C_HEMI_N=new THREE.Color('#6d7ab8');
const staticRoot=new THREE.Group(), furnRoot=new THREE.Group(), agentRoot=new THREE.Group(), fxRoot=new THREE.Group();
scene.add(staticRoot,furnRoot,agentRoot,fxRoot);
const SRGB=THREE.SRGBColorSpace;

/* --- utilitaires --- */
function rgbOf(c){ if(c[0]==='#'){ const n=parseInt(c.slice(1),16); return [n>>16,n>>8&255,n&255]; } const m=c.match(/\d+/g); return [+m[0],+m[1],+m[2]]; }
const _sc={};
function shade(c,amt){ const k=c+amt; if(_sc[k]) return _sc[k]; let [r,g,b]=rgbOf(c); const f=amt<0?0:255,p=Math.abs(amt); r=Math.round((f-r)*p+r); g=Math.round((f-g)*p+g); b=Math.round((f-b)*p+b); return _sc[k]='#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1); }
const _m=new Map();
function M(c,o){ const k=c+(o?JSON.stringify(o):''); let m=_m.get(k); if(!m){ m=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.72,metalness:0},o||{})); _m.set(k,m);} return m; }
const _g=new Map();
const geo=(k,f)=>{ let g=_g.get(k); if(!g){ g=f(); _g.set(k,g);} return g; };
const RB=(w,h,d,r)=>geo(`rb${w},${h},${d},${r}`,()=>new RoundedBoxGeometry(w,h,d,3,r));
const CY=(rt,rb,h,s=24)=>geo(`cy${rt},${rb},${h},${s}`,()=>new THREE.CylinderGeometry(rt,rb,h,s));
const SP=(r,w=20,h=14)=>geo(`sp${r},${w},${h}`,()=>new THREE.SphereGeometry(r,w,h));
const CA=(r,l)=>geo(`ca${r},${l}`,()=>new THREE.CapsuleGeometry(r,l,6,12));
const IC=(r,d=1)=>geo(`ic${r},${d}`,()=>new THREE.IcosahedronGeometry(r,d));
const TO=(r,t,arc=Math.PI*2)=>geo(`to${r},${t},${arc}`,()=>new THREE.TorusGeometry(r,t,8,28,arc));
function mesh(g,m,x=0,y=0,z=0,cast=true){ const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.castShadow=cast; o.receiveShadow=true; return o; }
function add(p,o){ p.add(o); return o; }
function canvasTex(w,h,draw,rep){ const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); draw(x,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=SRGB; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); if(rep) t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
function rrect(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
const _et=new Map(), _em=new Map();
function emoMat(e){ let m=_em.get(e); if(m) return m;
 const t=canvasTex(128,128,(x)=>{ x.font='96px '+EMO; x.textAlign='center'; x.textBaseline='middle'; x.fillText(e,64,70); });
 m=new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}); _em.set(e,m); return m; }
function emoSprite(e,s=.3){ const sp=new THREE.Sprite(emoMat(e)); sp.scale.set(s,s,s); sp.userData.e=e; return sp; }
function setEmo(sp,e){ if(sp.userData.e!==e){ sp.material=emoMat(e); sp.userData.e=e; } }
function nightF(){
 if(!state.daynight) return 0;
 const h=gameHour(); if(h<8.6) return (8.6-h)/.6*.25; if(h<=18.2) return 0; return Math.min(1,(h-18.2)/2.3);
}
function backWins(){ const m=Math.floor(S/2), o=[]; for(let i=1;i<S-1;i+=2) if(Math.abs(i-m)>1) o.push(i); return o; }
function leftWins(){ const o=[]; for(let j=1;j<S-1;j+=2) if(!(j>=2&&j<=4)) o.push(j); return o; }
function chairBackDir(f){ if(!f) return [0,-1]; const t=seatTable(f); if(!t) return [0,-1]; return [f.x-t.x,f.y-t.y]; }
function seeded(n){ let s=n; return ()=>{ s=(s*9301+49297)%233280; return s/233280; }; }

/* --- textures --- */
function floorTex(F,flat){
 return canvasTex(S*64,S*64,(x)=>{
  const T=64;
  for(let j=0;j<S;j++) for(let i=0;i<S;i++){ x.fillStyle=F.pat==='checker'?((i+j)%2?F.a:F.b):F.a; x.fillRect(i*T,j*T,T,T); }
  if(F.pat==='plank'){
   for(let r=0;r<S*3;r++) if(r%2){ x.fillStyle=F.b; x.fillRect(0,r*T/3,S*T,T/3); }
   x.strokeStyle='rgba(90,50,20,.28)'; x.lineWidth=1.5;
   for(let r=0;r<=S*3;r++){ x.beginPath(); x.moveTo(0,r*T/3); x.lineTo(S*T,r*T/3); x.stroke(); }
   for(let r=0;r<S*3;r++) for(let i=0;i<S;i++){ const o=((r*7)%3)/3; x.beginPath(); x.moveTo((i+o)*T,r*T/3); x.lineTo((i+o)*T,(r+1)*T/3); x.stroke(); }
  } else {
   x.strokeStyle=F.pat==='tile'?F.b:'rgba(0,0,0,.07)'; x.lineWidth=F.pat==='tile'?3:1.5;
   for(let i=0;i<=S;i++){ x.beginPath(); x.moveTo(i*T,0); x.lineTo(i*T,S*T); x.moveTo(0,i*T); x.lineTo(S*T,i*T); x.stroke(); }
  }
  const r=seeded(3); for(let i=0;i<S*S*6;i++){ x.fillStyle=`rgba(${r()<.5?255:0},${r()<.5?255:0},${r()<.5?255:0},.025)`; x.fillRect(r()*S*T,r()*S*T,3,3); }
  if(flat) return;
  let g=x.createLinearGradient(0,0,0,T); g.addColorStop(0,'rgba(60,35,15,.3)'); g.addColorStop(1,'rgba(60,35,15,0)'); x.fillStyle=g; x.fillRect(0,0,S*T,T);
  g=x.createLinearGradient(0,0,T,0); g.addColorStop(0,'rgba(60,35,15,.3)'); g.addColorStop(1,'rgba(60,35,15,0)'); x.fillStyle=g; x.fillRect(0,0,T,S*T);
 });
}
function wallTex(W){
 return canvasTex(128,128,(x)=>{
  x.fillStyle=W.c; x.fillRect(0,0,128,128);
  if(W.s){ x.fillStyle=W.s; for(let i=0;i<128;i+=32) x.fillRect(i,0,12,128); }
  if(W.brick){ x.strokeStyle='rgba(255,255,255,.28)'; x.lineWidth=2; for(let r=0;r<8;r++){ const y=r*16; x.beginPath(); x.moveTo(0,y); x.lineTo(128,y); x.stroke(); for(let i=(r%2)*16;i<128;i+=32){ x.beginPath(); x.moveTo(i,y); x.lineTo(i,y+16); x.stroke(); } }
   const r=seeded(9); for(let i=0;i<30;i++){ x.fillStyle=`rgba(0,0,0,${r()*.08})`; x.fillRect(Math.floor(r()*4)*32,Math.floor(r()*8)*16,30,14); } }
 },true);
}
function stripeTex(a,b,n){ return canvasTex(128,32,(x)=>{ for(let i=0;i<n;i++){ x.fillStyle=i%2?b:a; x.fillRect(i*128/n,0,128/n,32); } }); }
function streetTex(){ return canvasTex(128,128,(x)=>{ x.fillStyle='#b99a76'; x.fillRect(0,0,128,128); const r=seeded(9), cols=['#ecd2aa','#e4c596','#f0dab6','#dcb98a','#e8cca0'];
 for(let row=0;row<4;row++){ let xx=(row%2)*-16; while(xx<128){ const w=24+Math.floor(r()*3)*8; x.fillStyle=cols[Math.floor(r()*cols.length)]; rrect(x,xx+1.5,row*32+1.5,w-3,29,5); x.fill(); xx+=w; } } },true); }
function roadTex(){ return canvasTex(128,128,(x)=>{ x.fillStyle='#7d6652'; x.fillRect(0,0,128,128); const r=seeded(5), cols=['#b39a80','#a88d72','#bca48a','#9c826a','#c2ab92'];
 for(let row=0;row<8;row++) for(let c=-1;c<8;c++){ x.fillStyle=cols[Math.floor(r()*cols.length)]; rrect(x,c*16+(row%2)*8+1,row*16+1,14,14,4.5); x.fill(); } },true); }
function signTex(st){ return canvasTex(512,128,(x)=>{ if(st) return signStyle(x,st);
 const g=x.createLinearGradient(0,0,0,128); g.addColorStop(0,'#3f7059'); g.addColorStop(1,'#2a4d3d'); x.fillStyle=g; rrect(x,4,4,504,120,30); x.fill();
 x.strokeStyle='#e8c46a'; x.lineWidth=5; rrect(x,16,16,480,96,22); x.stroke();
 x.fillStyle='#ffe29a'; x.font='600 64px '+FONT; x.textAlign='center'; x.textBaseline='middle'; x.fillText(state.name.slice(0,16),256,68); }); }
function boardTex(){ return canvasTex(256,160,(x)=>{
 x.fillStyle='#8b5a34'; rrect(x,0,0,256,160,14); x.fill(); x.fillStyle='#2f3d35'; rrect(x,10,10,236,140,8); x.fill();
 x.fillStyle='#fff'; x.font='600 26px '+FONT; x.textAlign='center'; x.textBaseline='middle'; x.fillText('MENU',128,34);
 state.menu.slice(0,6).forEach((id,i)=>{ x.font='34px '+EMO; x.fillText(DISHM[id].e,62+(i%3)*66,82+Math.floor(i/3)*44); }); }); }
function glowTex(){ return canvasTex(64,64,(x)=>{ const g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); }); }
function starTex(){ return canvasTex(64,64,(x)=>{ x.fillStyle='#fff'; x.beginPath(); x.moveTo(32,2); x.quadraticCurveTo(32,32,62,32); x.quadraticCurveTo(32,32,32,62); x.quadraticCurveTo(32,32,2,32); x.quadraticCurveTo(32,32,32,2); x.fill(); }); }
const GLOW=glowTex(), STAR=starTex();

/* --- décor statique --- */
let kdsCv=null, kdsTex=null, kdsSig='', kdsT=0;
const cityRoot=new THREE.Group(); scene.add(cityRoot); let cityKey=-1; const terrSp=new Map();
function syncTerrace(){ for(const s of city.terr){ let sp=terrSp.get(s); if(!sp){ sp=emoSprite('🍺',.22); fxRoot.add(sp); terrSp.set(s,sp); } sp.visible=!!s.drink; if(s.drink){ setEmo(sp,s.drink); sp.position.set(s.tx+(s.x-s.tx)*.45,.78,s.z); } } for(const [s,sp] of terrSp) if(!city.terr.includes(s)){ fxRoot.remove(sp); terrSp.delete(s); } }
let kitTint=null, statKey='', winMat=null, shaftMat=null, streetLights=[], gridLines=null, statAnim=[];
const WH=1.45, WT=.14;
function disposeTree(o){ o.traverse(c=>{ if(c.userData.own){ c.geometry&&c.geometry.dispose(); if(c.material){ c.material.map&&c.material.map.dispose(); c.material.dispose(); } } else if(c.userData.cg&&c.geometry) c.geometry.dispose(); }); }
// ---------- fusion des pièces fixes (v0.95) : beaucoup moins d'objets à dessiner, même rendu ----------
// Un meuble ou un personnage est fait de nombreuses petites pièces. Celles qui ne bougent jamais les unes
// par rapport aux autres sont soudées en un seul objet : par matière pour les meubles (rendu identique),
// avec la couleur portée par les sommets pour les personnages.
const BAKE=(()=>{ try{ return localStorage.getItem('bv_nobake')!=='1'; }catch(e){ return true; } })();
const _bkInv=new THREE.Matrix4(), _bkRel=new THREE.Matrix4(), _bkCache=new Map();
let _vcMat=null; const vcMat=()=>_vcMat||(_vcMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0}));
function bakeClone(m,mat,col){ if(mat.determinant()<0) return null; const g=m.geometry.clone(); for(const k of Object.keys(g.attributes)) if(k!=='position'&&k!=='normal') g.deleteAttribute(k); if(!g.attributes.normal) g.computeVertexNormals(); g.morphAttributes={}; g.clearGroups();
 if(!g.index){ const n=g.attributes.position.count, ix=new (n>65535?Uint32Array:Uint16Array)(n); for(let i=0;i<n;i++) ix[i]=i; g.setIndex(new THREE.BufferAttribute(ix,1)); }
 g.applyMatrix4(mat);
 if(col){ const n=g.attributes.position.count, c=new Float32Array(n*3); for(let i=0;i<n;i++){ c[i*3]=col.r; c[i*3+1]=col.g; c[i*3+2]=col.b; } g.setAttribute('color',new THREE.BufferAttribute(c,3)); }
 return g; }
function bakeMerge(list){ const out=mergeGeometries(list,false); list.forEach(g=>g.dispose()); return out; }
// par matière, sur tout un meuble (les sous-groupes cités dans `skip`, ou invisibles, ne sont pas touchés)
function bakeByMat(root,skip,key){ if(!BAKE) return;
 const pick=[]; const walk=o=>{ for(const c of o.children){ if(!c.visible||(skip&&skip.has(c))) continue; const t=c.material;
   if(c.isMesh){ if(!c.isInstancedMesh&&!c.children.length&&t&&!Array.isArray(t)&&!t.transparent&&!c.userData.keep&&!c.userData.own) pick.push(c); }
   else if(!c.isSprite&&!c.isLight&&!c.isLine&&!c.isPoints&&c.children.length) walk(c); } }; walk(root);
 if(pick.length<2) return;
 let C=key?_bkCache.get(key):null;
 if(!C){ root.updateWorldMatrix(true,true); _bkInv.copy(root.matrixWorld).invert(); const by=new Map();
  pick.forEach((m,i)=>{ const k=m.material.uuid+(m.castShadow?'c':'')+(m.receiveShadow?'r':''); let b=by.get(k); if(!b){ b={mat:m.material,cast:m.castShadow,recv:m.receiveShadow,l:[],idx:[]}; by.set(k,b); } const g=bakeClone(m,_bkRel.multiplyMatrices(_bkInv,m.matrixWorld),null); if(g){ b.l.push(g); b.idx.push(i); } });
  C=[]; for(const b of by.values()){ if(b.l.length<2){ b.l.forEach(g=>g.dispose()); continue; } const geo=bakeMerge(b.l); if(geo) C.push({geo,mat:b.mat,cast:b.cast,recv:b.recv,idx:b.idx}); }
  if(key) _bkCache.set(key,C); }
 for(const b of C){ for(const i of b.idx){ const m=pick[i]; if(m&&m.parent) m.parent.remove(m); } const me=new THREE.Mesh(b.geo,b.mat); me.castShadow=b.cast; me.receiveShadow=b.recv; if(!key) me.userData.cg=1; root.add(me); } }
// personnages : les pièces directes d'un groupe, soudées en une seule avec leurs couleurs
function bakeVCOK(m){ const t=m.material; return !!(m.isMesh&&m.visible&&!m.children.length&&t&&!Array.isArray(t)&&t.isMeshStandardMaterial&&!t.transparent&&!t.map&&!t.vertexColors&&!t.flatShading&&(t.metalness||0)<.5&&t.side===THREE.FrontSide&&!(t.emissive&&t.emissiveIntensity>0&&(t.emissive.r+t.emissive.g+t.emissive.b)>0)); }
function bakeVC(grp,key,skip){ if(!BAKE) return null; const list=grp.children.filter(m=>bakeVCOK(m)&&!(skip&&skip.includes(m))); if(list.length<2) return null;
 let g=key?_bkCache.get(key):null; if(!g){ const l=[]; for(const m of list){ m.updateMatrix(); const c=bakeClone(m,m.matrix,m.material.color); if(!c){ l.forEach(x=>x.dispose()); return null; } l.push(c); } g=bakeMerge(l); if(!g) return null; if(key) _bkCache.set(key,g); }
 const me=new THREE.Mesh(g,vcMat()); me.castShadow=list.some(m=>m.castShadow); me.receiveShadow=true; if(!key) me.userData.cg=1; for(const m of list) grp.remove(m); grp.add(me); return me; }
// pièces identiques d'une même matière (yeux, joues) : géométrie commune à tous les personnages
function bakeSame(grp,key,mat){ if(!BAKE) return null; const list=grp.children.filter(m=>m.isMesh&&m.visible&&m.material===mat&&!m.children.length); if(list.length<2) return null;
 let g=_bkCache.get(key); if(!g){ const l=[]; for(const m of list){ m.updateMatrix(); const c=bakeClone(m,m.matrix,null); if(!c){ l.forEach(x=>x.dispose()); return null; } l.push(c); } g=bakeMerge(l); if(!g) return null; _bkCache.set(key,g); }
 const me=new THREE.Mesh(g,mat); me.castShadow=false; me.receiveShadow=list[0].receiveShadow; for(const m of list) grp.remove(m); grp.add(me); return me; }
function charFree(o){ if(o&&o.root) o.root.traverse(c=>{ if(c.userData.cg&&c.geometry) c.geometry.dispose(); }); }
function ownMesh(g,m,x,y,z,cast){ const o=mesh(g,m,x,y,z,cast); o.userData.own=1; return o; }
function makeWindow(){
 const g=new THREE.Group(), white=M('#fffaf3',{roughness:.5});
 g.add(mesh(RB(.74,.66,.06,.02),white,0,0,0,false));
 g.add(mesh(new THREE.BoxGeometry(.62,.54,.02),winMat,0,0,.025,false));
 g.add(mesh(new THREE.BoxGeometry(.035,.54,.03),white,0,0,.04,false));
 g.add(mesh(new THREE.BoxGeometry(.62,.035,.03),white,0,0,.04,false));
 g.add(mesh(RB(.84,.05,.14,.02),M('#e9dccb'),0,-.35,.06));
 return g;
}
function makeTree(seed){
 const g=new THREE.Group(), r=seeded(seed*31+7);
 g.add(mesh(CY(.07,.1,1,8),M('#8a5a36'),0,.5,0));
 const greens=[['#8cc43f','#77b23a','#a5d150'],['#e3b53c','#d99a2e','#efc95a'],['#dd8a3a','#c96f2e','#e9a24a'],['#9dbf45','#c9b83e','#86b03a']][(((seed|0)%4)+4)%4];
 for(let i=0;i<4;i++){ const s=.42+r()*.25; const m=mesh(IC(s,1),M(greens[i%3],{flatShading:true,roughness:.85}),(r()-.5)*.5,1.15+i*.18+(r()*.2),(r()-.5)*.5); g.add(m); }
 g.userData.seed=seed; return g;
}
function makeStreetLamp(){
 const g=new THREE.Group(), dark=M('#3d4450',{roughness:.5,metalness:.4});
 g.add(mesh(CY(.04,.06,2.2,10),dark,0,1.1,0));
 g.add(mesh(CY(.1,.12,.08,12),dark,0,.04,0));
 const arm=mesh(RB(.5,.05,.06,.02),dark,.22,2.18,0); g.add(arm);
 const head=mesh(RB(.24,.08,.16,.03),M('#fff6d0',{emissive:'#ffd88a',emissiveIntensity:0}),.42,2.13,0,false); g.add(head);
 const L=new THREE.PointLight(0xffd59a,0,9,1.3); L.position.set(.42,1.9,0); g.add(L);
 g.userData={head,L}; return g;
}
function makeBench(col,w){
 w=w||1; const g=new THREE.Group(), wood=M(col||'#c9904f',{roughness:.6}), dark=M('#3d4450',{metalness:.4,roughness:.5});
 for(const x of [-.42*w,.42*w]) g.add(mesh(RB(.06,.27,.34,.02),dark,x,.135,0));
 g.add(mesh(RB(.95*w,.06,.38,.025),wood,0,.27,0));
 if(col) g.add(mesh(RB(.9*w,.04,.34,.02),M(shade(col,.25),{roughness:.95}),0,.31,0));
 g.add(mesh(RB(.95*w,.3,.05,.02),wood,0,.52,-.17));
 for(const x of [-.38*w,.38*w]) g.add(mesh(RB(.05,.22,.05,.01),dark,x,.38,-.17));
 g.children.forEach(c=>{ c.position.y*=.78; c.scale.y=.78; });
 return g;
}
function rebuildStatic(){
 disposeTree(staticRoot); staticRoot.clear(); streetLights=[]; statAnim=[];
 const F=FLOORS[state.floor], W=WALLS[state.wall];
 winMat=new THREE.MeshStandardMaterial({color:'#ffe7c2',roughness:.08,metalness:.1,emissive:'#ffd79a',emissiveIntensity:.35});
 shaftMat=new THREE.MeshBasicMaterial({color:'#ffcf85',transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending});
 // sol extérieur
 const ground=ownMesh(new THREE.PlaneGeometry(260,260),new THREE.MeshStandardMaterial({map:grassTex(),roughness:1}),S/2,-.02,S/2,false); ground.receiveShadow=true; ground.rotation.x=-Math.PI/2; staticRoot.add(ground);
 // sol du resto
 const floor=ownMesh(new THREE.PlaneGeometry(S,S),new THREE.MeshStandardMaterial({map:floorTex(F),roughness:.55}),S/2,.001,S/2,false); floor.rotation.x=-Math.PI/2; staticRoot.add(floor);
 const mat=mesh(RB(.8,.02,.6,.008),M('#b0443a',{roughness:.95}),DX+.5,.01,S-.5,false); staticRoot.add(mat); if(DXO!==DX) staticRoot.add(mesh(RB(.8,.02,.6,.008),M('#4f8f5b',{roughness:.95}),DXO+.5,.01,S-.5,false));
 // rayons de soleil
 const shaft=(pts)=>{ const sh=new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z))); const m=ownMesh(new THREE.ShapeGeometry(sh),shaftMat,0,.004,0,false); m.rotation.x=-Math.PI/2; m.receiveShadow=false; staticRoot.add(m); };
 const WL=wallLayout();
 WL.N.forEach((t,i)=>{ if(t&&WOBJ[t]&&WOBJ[t].win) shaft([[i+.18,.05],[i+.82,.05],[i+1.35,1.7],[i+.7,1.7]]); });
 WL.W.forEach((t,j)=>{ if(t&&WOBJ[t]&&WOBJ[t].win) shaft([[.05,j+.18],[.05,j+.82],[1.7,j+1.35],[1.7,j+.7]]); });
 // murs
 const wt=wallTex(W); wt.repeat.set(S/1.5,1);
 const upper=new THREE.MeshStandardMaterial({map:wt,roughness:.85}); upper.userData={};
 const wt2=wt.clone(); wt2.needsUpdate=true; wt2.repeat.set(S/1.5,1);
 const upperL=new THREE.MeshStandardMaterial({map:wt2,roughness:.85,color:'#eeeeee'});
 const wains=M(W.w,{roughness:.6}), trim=M(shade(W.w,.4)), cap=M('#fff1dc');
 const hU=WH-.48;
 staticRoot.add(ownMesh(new THREE.BoxGeometry(S+WT,hU,WT),upper,S/2-WT/2,.48+hU/2,-WT/2));
 staticRoot.add(ownMesh(new THREE.BoxGeometry(WT,hU,S),upperL,-WT/2,.48+hU/2,S/2));
 staticRoot.add(mesh(new THREE.BoxGeometry(S,.48,WT+.04),wains,S/2,.24,-WT/2+.02));
 staticRoot.add(mesh(new THREE.BoxGeometry(WT+.04,.48,S),wains,-WT/2+.02,.24,S/2));
 staticRoot.add(mesh(new THREE.BoxGeometry(S,.04,.07),trim,S/2,.49,.02,false));
 staticRoot.add(mesh(new THREE.BoxGeometry(.07,.04,S),trim,.02,.49,S/2,false));
 staticRoot.add(mesh(new THREE.BoxGeometry(S+WT+.02,.05,WT+.04),cap,S/2-WT/2,WH+.02,-WT/2));
 staticRoot.add(mesh(new THREE.BoxGeometry(WT+.04,.05,S),cap,-WT/2,WH+.02,S/2));
 WL.N.forEach((t,i)=>{ if(!t) return; const o=wallObj3D(t); if(!o) return; o.position.set(i+.5,o.userData.y||.98,.006); staticRoot.add(o); });
 WL.W.forEach((t,j)=>{ if(!t) return; const o=wallObj3D(t); if(!o) return; o.position.set(.006,o.userData.y||.98,j+.5); o.rotation.y=Math.PI/2; staticRoot.add(o); });
 const mid=Math.floor(S/2);
 // carreaux posés un par un : un seul maillage par style, découpé dans la texture complète du sol
 { const by={}; const T=state.tiles||{}; for(const k in T){ const [x,y]=k.split(',').map(Number); if(x<S&&y<S&&FLOORS[T[k]]&&T[k]!==state.floor) (by[T[k]]=by[T[k]]||[]).push([x,y]); }
  for(const fi in by){ const cells=by[fi], pos=[], uv=[], idx=[], nor=[]; cells.forEach(([x,y],n)=>{ pos.push(x,0,y, x+1,0,y, x+1,0,y+1, x,0,y+1); uv.push(x/S,1-y/S,(x+1)/S,1-y/S,(x+1)/S,1-(y+1)/S,x/S,1-(y+1)/S); nor.push(0,1,0,0,1,0,0,1,0,0,1,0); idx.push(n*4,n*4+2,n*4+1,n*4,n*4+3,n*4+2); });
   const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setIndex(idx);
   const m=ownMesh(g,new THREE.MeshStandardMaterial({map:floorTex(FLOORS[fi],true),roughness:.55}),0,.0025,0,false); staticRoot.add(m); } }
 // haies
 const planter=M('#e9cfa8'), b1=M('#86bf45',{roughness:.9}), b2=M('#73ad3c',{roughness:.9});
 const hedge=(x,z,alongX)=>{ const g=new THREE.Group(); g.add(mesh(RB(alongX?.98:.24,.2,alongX?.24:.98,.04),planter,0,.1,0)); for(let k=0;k<2;k++){ const o=k?.24:-.24; g.add(mesh(SP(.19,12,10),k?b1:b2,alongX?o:0,.3,alongX?0:o)); } g.position.set(x,0,z); staticRoot.add(g); };
 for(let x=0;x<S;x++) if(x!==DX&&x!==DXO) hedge(x+.5,S,true);
 for(let z=0;z<S;z++) hedge(S,z+.5,false);
 // porte & auvent
 const post=M('#6d4a33');
 for(const x of [DX,DX+1]) staticRoot.add(mesh(CY(.045,.045,1.2,10),post,x,.6,S));
 const aw=ownMesh(new THREE.BoxGeometry(1.1,.03,.6),new THREE.MeshStandardMaterial({map:stripeTex('#ef5a4f','#fff7ee',8),roughness:.8}),DX+.5,1.12,S+.22); aw.rotation.x=.35; staticRoot.add(aw);
 if(DXO!==DX){ for(const x of [DXO,DXO+1]) staticRoot.add(mesh(CY(.045,.045,1.2,10),post,x,.6,S)); const aw2=ownMesh(new THREE.BoxGeometry(1.1,.03,.6),new THREE.MeshStandardMaterial({map:stripeTex('#4f9d63','#fff7ee',8),roughness:.8}),DXO+.5,1.12,S+.22); aw2.rotation.x=.35; staticRoot.add(aw2); }
 // rue
 const x0=-18,x1=S+27, wS=x1-x0;
 const swt=streetTex(); swt.repeat.set(wS,2);
 const side=ownMesh(new THREE.BoxGeometry(wS,.05,2),new THREE.MeshStandardMaterial({map:swt,roughness:.9}),(x0+x1)/2,.0,S+1,false); staticRoot.add(side);
 staticRoot.add(mesh(new THREE.BoxGeometry(wS,.07,.1),M('#f4efe7'),(x0+x1)/2,.0,S+2,false));
 const rt=roadTex(); rt.repeat.set(wS/2,1);
 const road=ownMesh(new THREE.PlaneGeometry(wS,2),new THREE.MeshStandardMaterial({map:rt,roughness:.95}),(x0+x1)/2,-.01,S+3,false); road.rotation.x=-Math.PI/2; staticRoot.add(road);
 const swt2=streetTex(); swt2.repeat.set(wS,2);
 staticRoot.add(ownMesh(new THREE.BoxGeometry(wS,.05,2),new THREE.MeshStandardMaterial({map:swt2,roughness:.9}),(x0+x1)/2,0,S+5,false));
 // arbres, lampadaires, banc, buissons
 const trees=[[-2.4,1],[-2,4.6],[-3,7.4],[-1.4,-1.6],[S+1.6,1.6],[S+2.6,5.2],[S+1.4,-1.2],[-6,S+5.3],[1.5,S+5.4],[S-2,S+5.3],[S+5,S+5.4]];
 trees.forEach(([x,z],i)=>{ const t=makeTree(i); t.position.set(x,0,z); staticRoot.add(t); statAnim.push(t); });
 for(const x of [-3.5,S+2.5]){ const l=makeStreetLamp(); l.position.set(x,0,S+1.75); staticRoot.add(l); streetLights.push(l); }
 const bench=makeBench(); bench.position.set(-2.5,0,S+.5); staticRoot.add(bench);
 for(const bx of [DX-2,DX-3]) if(bx>=0&&bx<S){ const wb=makeBench('#c9904f'); wb.position.set(bx+.5,0,S+.5); staticRoot.add(wb); }
 const r=seeded(11), bush=[M('#6cc35a',{flatShading:true}),M('#57b04f',{flatShading:true})], fl=['#ff7aa8','#ffd23f','#ffffff','#c58cff'];
 for(let i=0;i<26;i++){ let x=r()*40-16, z=r()*36-14; if(x>-1.2&&x<S+1.2&&z>-1.2&&z<S+6.5) continue; if(z>S+6.5) continue; if(x>1.5&&x<5.8&&z>-3.5&&z<-1.1) continue; if(r()<.55){ staticRoot.add(mesh(IC(.18+r()*.2,1),bush[i%2],x,.12,z)); } else { const c=M(fl[i%4]); for(let k=0;k<4;k++) staticRoot.add(mesh(SP(.05,8,6),c,x+(r()-.5)*.4,.06,z+(r()-.5)*.4,false)); } }
 // cuisine : carrelage, muret et enseigne (rectangle réglable dans un coin)
 { const kw=KR.w, kd=KR.d, X0=KR.x0, Y0=KR.y0;
  const kt=canvasTex(kw*64,kd*64,(x)=>{ for(let j=0;j<kd*4;j++) for(let i=0;i<kw*4;i++){ x.fillStyle=(i+j)%2?'#f4f1ec':'#e2ded7'; x.fillRect(i*16,j*16,16,16); } x.strokeStyle='rgba(120,110,100,.25)'; x.lineWidth=1; for(let i=0;i<=kw*4;i++){ x.beginPath(); x.moveTo(i*16,0); x.lineTo(i*16,kd*64); x.stroke(); } for(let j=0;j<=kd*4;j++){ x.beginPath(); x.moveTo(0,j*16); x.lineTo(kw*64,j*16); x.stroke(); } });
  const kf=ownMesh(new THREE.PlaneGeometry(kw,kd),new THREE.MeshStandardMaterial({map:kt,roughness:.35}),X0+kw/2,.003,Y0+kd/2,false); kf.rotation.x=-Math.PI/2; staticRoot.add(kf);
  const tileM=M('#f3efe8',{roughness:.5}), capM=M('#a8693a',{roughness:.5});
  const isCtr=(x,y)=>{ const f=fAt(x,y); return f&&['counter','dish','fridge'].includes(kindOf(f)); };
  const sS=Y0+kd<S, sN=Y0>0, sE=X0+kw<S, sW=X0>0;
  const segX=(z,ky)=>{ for(let x=X0;x<X0+kw;x++) if(!isCtr(x,ky)){ staticRoot.add(mesh(new THREE.BoxGeometry(1,.012,.1),capM,x+.5,.01,z,false)); } };
  const segZ=(xw,kx)=>{ for(let y=Y0;y<Y0+kd;y++) if(!isCtr(kx,y)){ staticRoot.add(mesh(new THREE.BoxGeometry(.1,.012,1),capM,xw,.01,y+.5,false)); } };
  if(sS) segX(Y0+kd,Y0+kd-1); if(sN) segX(Y0,Y0); if(sE) segZ(X0+kw,X0+kw-1); if(sW) segZ(X0,X0);
  for(const [px,pz,ok] of [[X0+kw,Y0+kd,sS&&sE],[X0,Y0+kd,sS&&sW],[X0+kw,Y0,sN&&sE],[X0,Y0,sN&&sW]]) if(ok) staticRoot.add(mesh(RB(.14,.18,.14,.02),capM,px,.09,pz));
  const st=canvasTex(256,64,(x)=>{ x.fillStyle='#2f3d35'; rrect(x,2,2,252,60,14); x.fill(); x.strokeStyle='#e8c46a'; x.lineWidth=3; rrect(x,8,8,240,48,10); x.stroke(); x.fillStyle='#fff'; x.font='600 30px '+FONT; x.textAlign='center'; x.textBaseline='middle'; x.fillText('CUISINE',140,34); x.font='30px '+EMO; x.fillText('👨‍🍳',42,34); });
  const sz=sS?Y0+kd:Y0, ky=sS?Y0+kd-1:Y0;
  let sx0=X0+1; for(let x=X0;x<X0+kw-1;x++) if(!isCtr(x,ky)&&!isCtr(x+1,ky)){ sx0=x+1; break; }
  const sg=ownMesh(new THREE.PlaneGeometry(.9,.22),new THREE.MeshStandardMaterial({map:st,transparent:true,roughness:.6}),sx0,.72,sz+.06,false); staticRoot.add(sg);
  for(const sx of [-.42,.42]) staticRoot.add(mesh(new THREE.BoxGeometry(.03,.84,.03),M('#3a3a3a'),sx0+sx,.42,sz+.05,false));
  // écran de commandes : la tablette du serveur envoie la commande ici
  { const W=.8,H=.42; let px,py=1.14,pz,ry=0,pole=false;
   if(Y0===0){ const bw=backWins(), xs=[]; for(let i=X0;i<X0+kw;i++) if(!bw.includes(i)) xs.push(i); const cx=X0+kw/2-.5; xs.sort((a,b)=>Math.abs(a-cx)-Math.abs(b-cx)); px=(xs.length?xs[0]:Math.floor(cx))+.5; pz=.04; }
   else if(X0===0){ const lw=leftWins(), ys=[]; for(let j=Y0;j<Y0+kd;j++) if(!lw.includes(j)) ys.push(j); const cy=Y0+kd/2-.5; ys.sort((a,b)=>Math.abs(a-cy)-Math.abs(b-cy)); pz=(ys.length?ys[0]:Math.floor(cy))+.5; px=.04; ry=Math.PI/2; }
   else { px=X0+kw/2; pz=Y0+.07; py=.98; pole=true; }
   kdsCv=document.createElement('canvas'); kdsCv.width=512; kdsCv.height=272; kdsTex=new THREE.CanvasTexture(kdsCv); kdsTex.colorSpace=THREE.SRGBColorSpace; kdsSig='~';
   const grp=new THREE.Group(); grp.position.set(px,py,pz); grp.rotation.y=ry;
   grp.add(mesh(RB(W+.05,H+.05,.03,.012),M('#23272c',{roughness:.4,metalness:.3}),0,0,0,false));
   const scr=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:kdsTex,toneMapped:false})); scr.position.z=.017; scr.userData.own=1; grp.add(scr);
   if(pole) grp.add(mesh(CY(.016,.016,.46,8),M('#3a3d42',{metalness:.5,roughness:.4}),0,-.43,-.01,false));
   staticRoot.add(grp); drawKDS(true); }
  kitTint=ownMesh(new THREE.PlaneGeometry(kw,kd),new THREE.MeshBasicMaterial({color:'#ff9a3d',transparent:true,opacity:.18,depthWrite:false}),X0+kw/2,.009,Y0+kd/2,false); kitTint.rotation.x=-Math.PI/2; staticRoot.add(kitTint);
 }
 // grille (mode déco)
 const pts=[]; for(let i=0;i<=S;i++){ pts.push(i,.006,0,i,.006,S, 0,.006,i,S,.006,i); }
 const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
 gridLines=new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:'#8a6a4a',transparent:true,opacity:.45})); gridLines.userData.own=1; staticRoot.add(gridLines);
 // ombres du soleil
 const c=S/2; sun.position.set(c-7,18,c+12); sun.target.position.set(c,0,c+1);
 const sc=sun.shadow.camera; sc.left=-(S+6); sc.right=S+6; sc.top=S+6; sc.bottom=-(S+6); sc.near=1; sc.far=70; sc.updateProjectionMatrix();
 inLight.position.set(c,2.4,c); inLight.distance=S*1.6;
}

/* --- mobilier --- */
function itemsGroup(g,y,n,spread){ const it=new THREE.Group(); it.position.y=y; const pm=M('#ffffff',{roughness:.25});
 for(let i=0;i<n;i++){ const slot=new THREE.Group(); slot.position.x=(i-(n-1)/2)*spread; slot.add(mesh(CY(.12,.085,.022,24),pm,0,-.105,0,false)); slot.add(mesh(TO(.1,.008),M('#e9e3d8'),0,-.093,0,false)).children; slot.children[1].rotation.x=Math.PI/2; const s=emoSprite('🍽️',.27); slot.add(s); slot.userData.sp=s; slot.visible=false; it.add(slot); }
 g.add(it); g.userData.items=it; }
function setItems(g,list){ const it=g.userData.items; if(!it) return; it.children.forEach((slot,i)=>{ const e=list[i]; if(e){ slot.visible=true; setFood(slot,slot.userData.sp,e.e||e,-.092); if(slot.userData.fo) eatFood(slot.userData.fo,e.pr||0); slot.children[0].visible=slot.children[1].visible=!e.dr; if(e.dx!==undefined) slot.position.set(e.dx*.15,0,e.dz*.15); } else slot.visible=false; }); }
function buildFurn(t,f){
 const F=FURN[t], g=new THREE.Group(), ud=g.userData; ud.kind=F.kind;
 switch(F.kind){
 case 'table':{
  // petite table ; collée à une voisine, son plateau se prolonge pour n'en former qu'une grande
  const H=.4, wood=M(F.col,{roughness:.5}), dark=M(shade(F.col,-.2),{roughness:.5});
  const legM=F.marble?M('#3a3d44',{metalness:.6,roughness:.35}):dark;
  const J=f?tableJoin(f):[0,0,0,0], x0=J[0]?-.5:-.27, x1=J[1]?.5:.27, z0=J[2]?-.5:-.27, z1=J[3]?.5:.27, tw=x1-x0, td=z1-z0, cx=(x0+x1)/2, cz=(z0+z1)/2;
  if(F.leg) tableLegs(g,F,H,cx,cz,tw,td); else
  for(const [x,z] of [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]]) g.add(mesh(RB(.045,H-.03,.045,.015),legM,x,(H-.03)/2,z));
  if(F.top) tableTop(g,F,H,cx,cz,tw,td,x0,x1,z0,z1,J); else
  if(F.marble) g.add(mesh(RB(tw,.05,td,.02),M('#f3f1ec',{roughness:.18,metalness:.05}),cx,H-.025,cz));
  else if(F.cloth&&F.cloth!=='#fff0d6'&&F.cloth!=='#ffffff'){ g.add(mesh(RB(tw-.02,.04,td-.02,.015),wood,cx,H-.03,cz)); const cl=M(F.cloth,{roughness:.95}); g.add(mesh(RB(tw+.03,.014,td+.03,.006),cl,cx,H-.004,cz));
   if(!J[2]) g.add(mesh(new THREE.BoxGeometry(tw+.03,.06,.012),cl,cx,H-.035,z0-.015,false)); if(!J[3]) g.add(mesh(new THREE.BoxGeometry(tw+.03,.06,.012),cl,cx,H-.035,z1+.015,false));
   if(!J[0]) g.add(mesh(new THREE.BoxGeometry(.012,.06,td+.03),cl,x0-.015,H-.035,cz,false)); if(!J[1]) g.add(mesh(new THREE.BoxGeometry(.012,.06,td+.03),cl,x1+.015,H-.035,cz,false)); }
  else { g.add(mesh(RB(tw,.05,td,.02),wood,cx,H-.025,cz)); g.add(mesh(new THREE.BoxGeometry(tw-.22,.004,td-.22),M('#fff3dc',{roughness:.95}),cx,H+.002,cz,false)); }
  if(F.runner) g.add(mesh(new THREE.BoxGeometry(tw+(J[0]||J[1]?0:.05),.006,.17),M(F.runner,{roughness:.9}),cx,H+.012,cz,false));
  if(F.edge) g.add(mesh(RB(tw+.025,.022,td+.025,.01),M(F.edge,{metalness:.7,roughness:.3}),cx,H-.03,cz,false));
  ud.top=H+(F.runner?.016:.004);
  // grandes assiettes avec restes : miettes, couverts croisés, serviette froissée
  ud.plates=[]; const pw=M('#ffffff',{roughness:.3}), sil=M('#d9dde3',{metalness:.8,roughness:.25});
  for(const [x,z,ry] of [[.12,.05,.4],[-.12,-.05,2.2]]){ const p=new THREE.Group(); p.scale.setScalar(.8);
   p.add(mesh(CY(.145,.105,.022,24),pw,0,0,0,false)); const rim=mesh(TO(.125,.008),M('#ece6da'),0,.012,0,false); rim.rotation.x=Math.PI/2; p.add(rim);
   for(const [cx,cz,c,r2] of [[.03,.02,'#b98a52',.022],[-.04,.03,'#d9a05a',.016],[.0,-.045,'#8fae5a',.018],[-.05,-.02,'#c8553d',.014],[.055,-.03,'#e8c46a',.012]]) p.add(mesh(SP(r2,6,5),M(c,{roughness:.8}),cx,.02,cz,false));
   const fk=mesh(new THREE.BoxGeometry(.012,.006,.2),sil,.02,.03,0,false); fk.rotation.y=.5; p.add(fk); const kn=mesh(new THREE.BoxGeometry(.012,.006,.2),sil,-.01,.034,0,false); kn.rotation.y=-.45; p.add(kn);
   const nap=mesh(SP(.045,7,5),M('#fff7ea',{roughness:.95,flatShading:true}),.15,.02,.09,false); nap.scale.set(1,.5,.8); p.add(nap);
   p.position.set(x,ud.top+.012,z); p.rotation.y=ry; p.visible=false; g.add(p); ud.plates.push(p); }
  itemsGroup(g,ud.top+.1,8,0); ud.items.scale.setScalar(.88);
  break;}
 case 'chair':{
  const [bx,by]=chairBackDir(f), c=M(F.col,{roughness:.6}), dk=M(shade(F.col,-.45));
  if(F.cs){ const q=new THREE.Group(); q.rotation.y=Math.atan2(bx,by); chairStyle(q,F); g.add(q); break; }
  if(F.big){ g.add(mesh(RB(.4,.19,.4,.07),c,0,.095,0)); g.add(mesh(RB(.36,.07,.36,.04),M(shade(F.col,.18),{roughness:.9}),0,.2,0));
   g.add(mesh(RB(bx?.09:.4,.3,by?.09:.4,.04),c,bx*.165,.3,by*.165));
   for(const s2 of [-1,1]) g.add(mesh(RB(by?.08:.4,.13,bx?.08:.4,.035),c,by?s2*.17:0,.22,bx?s2*.17:0)); }
  else { for(const [lx,lz] of [[-.12,-.12],[.12,-.12],[-.12,.12],[.12,.12]]) g.add(mesh(CY(.018,.015,.18,8),dk,lx,.09,lz));
   g.add(mesh(RB(.32,.045,.32,.022),c,0,.2,0)); g.add(mesh(RB(.29,.025,.29,.012),M(shade(F.col,.25),{roughness:.95}),0,.228,0));
   g.add(mesh(RB(bx?.045:.3,.2,by?.045:.3,.02),c,bx*.14,.34,by*.14)); }
  break;}
 case 'stove':{
  const pro=F.speed>1;
  const body=M(pro?'#4a3c34':'#efe4d6',{roughness:.32,metalness:pro?.35:.2});
  g.add(mesh(RB(.82,.56,.82,.05),body,0,.28,0));
  g.add(mesh(RB(.8,.03,.8,.012),M('#202329',{roughness:.12,metalness:.2}),0,.57,0));
  const trimC=M(pro?'#e3b04b':'#9aa3ad',{metalness:.7,roughness:.25});
  for(const sx of [-.2,.2]) g.add(mesh(RB(.34,.42,.02,.01),M(pro?'#3e322b':'#e6dccd',{roughness:.4}),sx,.27,.41,false));
  for(const sx of [-.2,.2]){ const h=add(g,mesh(CY(.012,.012,.2,8),trimC,sx,.44,.44,false)); h.rotation.z=Math.PI/2; }
  for(let i=0;i<4;i++){ const k=add(g,mesh(CY(.03,.03,.03,12),trimC,-.3+i*.2,.53,.42,false)); k.rotation.x=Math.PI/2; }
  const grate=M('#15171b',{roughness:.6});
  const bpos=[[-.2,-.18],[.2,-.18],[-.2,.18],[.2,.18]];
  const flameM=new THREE.MeshStandardMaterial({color:'#7fb8ff',emissive:'#2f7bff',emissiveIntensity:2.5,transparent:true,opacity:.85}); flameM.userData.own=1;
  const flames=[];
  for(const [x,z] of bpos){ const tr=add(g,mesh(TO(.085,.012),grate,x,.595,z,false)); tr.rotation.x=Math.PI/2; g.add(mesh(new THREE.BoxGeometry(.2,.012,.015),grate,x,.6,z,false)); g.add(mesh(new THREE.BoxGeometry(.015,.012,.2),grate,x,.6,z,false));
   const fl=new THREE.Group(); for(let i=0;i<8;i++){ const c=mesh(geo('flame',()=>new THREE.ConeGeometry(.018,.06,6)),flameM,Math.cos(i*Math.PI/4)*.06,.615,Math.sin(i*Math.PI/4)*.06,false); fl.add(c); } fl.position.set(x,0,z); fl.position.x=x; fl.visible=false; g.add(fl); flames.push(fl); }
  const pot=new THREE.Group(); pot.add(mesh(CY(.13,.12,.15,24),M('#c8ccd2',{metalness:.7,roughness:.25}),0,.075,0)); pot.add(mesh(CY(.135,.135,.015,24),M('#a7abb2',{metalness:.7,roughness:.3}),0,.155,0)); pot.add(mesh(SP(.022),M('#33363c'),0,.17,0));
  pot.position.set(bpos[0][0],.6,bpos[0][1]); pot.visible=false; g.add(pot);
  const pan=new THREE.Group(); pan.add(mesh(CY(.14,.12,.04,24),M('#2b2d31',{metalness:.5,roughness:.4}),0,.02,0)); const hd=mesh(CY(.012,.012,.2,8),M('#2b2d31'),0,.03,.2,false); hd.rotation.x=Math.PI/2; pan.add(hd);
  pan.position.set(bpos[3][0],.6,bpos[3][1]); pan.visible=false; g.add(pan);
  ud.cook=stoveStage(g,flames,pot,pan,bpos);
  ud.steamAt=new THREE.Vector3(bpos[0][0],.8,bpos[0][1]);
  itemsGroup(g,.75,2,.3); ud.items.position.x=.12;
  break;}
 case 'oven':{
  if(F.speed>1){ // four à pizza en briques
   const brick=M('#b5523b',{roughness:.9}), stone=M('#d8cdbf',{roughness:.8});
   g.add(mesh(RB(.86,.45,.8,.04),stone,0,.225,0));
   const dome=mesh(geo('dome',()=>new THREE.SphereGeometry(.4,24,14,0,Math.PI*2,0,Math.PI/2)),brick,0,.45,-.02); dome.scale.set(1,.85,1); g.add(dome);
   const mouthM=new THREE.MeshStandardMaterial({color:'#1a0f0a',emissive:'#ff6a1f',emissiveIntensity:.15,roughness:.9}); mouthM.userData.own=1;
   const mouth=mesh(geo('mouth',()=>new THREE.CircleGeometry(.14,20,0,Math.PI)),mouthM,0,.47,.355,false); g.add(mouth);
   g.add(mesh(CY(.05,.06,.3,12),M('#8a3c2b',{roughness:.9}),.12,.85,-.12));
   { const sl=ovenSlide(g,.5,.36); ud.cook=(dish,info)=>{ mouthM.emissiveIntensity=dish?1.8+Math.sin(performance.now()/90)*.3:.15; sl(dish,info); }; }
   ud.steamAt=new THREE.Vector3(.12,1.02,-.12);
  } else { // four électrique en colonne
   const st=M('#d9dde2',{roughness:.3,metalness:.4});
   g.add(mesh(RB(.8,.95,.76,.04),st,0,.475,0));
   g.add(mesh(RB(.78,.14,.02,.01),M('#2b2e34',{roughness:.3}),0,.85,.385,false));
   for(let i=0;i<3;i++){ const k=add(g,mesh(CY(.028,.028,.02,12),M('#c9ccd3',{metalness:.7,roughness:.25}),-.2+i*.2,.85,.4,false)); k.rotation.x=Math.PI/2; }
   const glass=new THREE.MeshStandardMaterial({color:'#1d2026',emissive:'#ff7a2f',emissiveIntensity:0,roughness:.1,metalness:.2}); glass.userData.own=1;
   g.add(mesh(RB(.62,.48,.02,.012),glass,0,.45,.385,false));
   const h=add(g,mesh(CY(.014,.014,.5,8),M('#9aa3ad',{metalness:.7,roughness:.25}),0,.73,.42,false)); h.rotation.z=Math.PI/2;
   { const sl=ovenSlide(g,.47,.41); ud.cook=(dish,info)=>{ glass.emissiveIntensity=dish?1.3+Math.sin(performance.now()/300)*.2:0; sl(dish,info); }; }
  }
  break;}
 case 'prep':{
  const steel=M('#d7dce2',{roughness:.25,metalness:.55}), pro=F.speed>1;
  for(const [x,z] of [[-.36,-.33],[.36,-.33],[-.36,.33],[.36,.33]]) g.add(mesh(CY(.02,.02,.53,8),steel,x,.265,z));
  g.add(mesh(RB(.8,.02,.72,.008),steel,0,.14,0,false));
  g.add(mesh(RB(.86,.05,.8,.012),pro?steel:M('#c9935e',{roughness:.6}),0,.555,0));
  if(pro) g.add(mesh(RB(.86,.18,.03,.01),steel,0,.67,-.39));
  g.add(mesh(RB(.36,.025,.26,.01),M('#e8c48f',{roughness:.7}),-.08,.592,.05,false));
  const knife=new THREE.Group(); knife.add(mesh(new THREE.BoxGeometry(.16,.004,.035),M('#e9edf1',{metalness:.8,roughness:.2}),0,0,0,false)); knife.add(mesh(new THREE.BoxGeometry(.08,.015,.022),M('#2b2d31'),-.12,0,0,false)); knife.position.set(.08,.61,.06); g.add(knife);
  for(const [x,z,c] of [[.26,-.22,'#e74c3c'],[.3,-.12,'#f39c12'],[.2,-.28,'#5fb54f']]) g.add(mesh(SP(.04,10,8),M(c,{roughness:.5}),x,.61,z,false));
  const ing=emoSprite('🥬',.2); ing.position.set(-.08,.68,.05); ing.visible=false; g.add(ing); const ingH=new THREE.Group(); ingH.position.set(-.1,.605,.03); ingH.scale.setScalar(.85); g.add(ingH);
  ud.cook=prepStage(g,ing,ingH,knife);
  break;}
 case 'sink':{
  const wood=M('#c9935e',{roughness:.6}), steel=M('#d7dce2',{roughness:.2,metalness:.6});
  g.add(mesh(RB(.82,.52,.74,.03),wood,0,.26,0));
  g.add(mesh(RB(.86,.05,.78,.012),steel,0,.545,0));
  g.add(mesh(RB(.5,.04,.4,.02),M('#5a6068',{roughness:.3,metalness:.4}),0,.555,.03,false));
  const fa=new THREE.Group(); fa.add(mesh(CY(.02,.02,.22,10),steel,0,.11,0)); const sp=mesh(CY(.018,.018,.16,10),steel,0,.22,.07); sp.rotation.x=Math.PI/2; fa.add(sp); fa.position.set(0,.57,-.27); g.add(fa);
  const wM=new THREE.MeshStandardMaterial({color:'#bfe6ff',transparent:true,opacity:.6,roughness:.05}); wM.userData.own=1;
  const water=mesh(CY(.008,.012,.17,8),wM,0,.66,-.2,false); water.visible=false; g.add(water);
  const foam=new THREE.Group(); for(let i=0;i<7;i++) foam.add(mesh(SP(.035+(i%3)*.01,8,6),M('#ffffff',{roughness:.9}),((i*53)%11-5)*.03,.585,((i*31)%7-3)*.035+.03,false)); foam.visible=false; g.add(foam);
  const sp2=new THREE.Group(); for(let i=0;i<3;i++){ const pl=mesh(CY(.1,.075,.014,16),M('#f6f3ee',{roughness:.3}),-.08+i*.08,.6,.05,false); pl.rotation.z=.5-i*.3; sp2.add(pl); } sp2.visible=false; g.add(sp2);
  ud.cook=(on)=>{ water.visible=foam.visible=sp2.visible=!!on; if(on){ const T=performance.now()/1000; water.scale.x=water.scale.z=1+Math.sin(T*30)*.15; sp2.position.y=Math.sin(T*6)*.012; } };
  break;}
 case 'bin':{
  const body=M(F.col,{roughness:.4,metalness:.3}), dk=M(shade(F.col,-.35),{roughness:.5});
  g.add(mesh(CY(.19,.16,.52,22),body,0,.26,0));
  const rim=add(g,mesh(TO(.19,.014),dk,0,.52,0,false)); rim.rotation.x=Math.PI/2;
  g.add(mesh(RB(.12,.025,.09,.01),M('#2a2d31',{metalness:.4}),0,.03,.19));
  const lid=new THREE.Group(); lid.position.set(0,.53,-.19); lid.add(mesh(CY(.2,.2,.035,22),M(shade(F.col,.1),{roughness:.35,metalness:.35}),0,.017,.19)); lid.add(mesh(RB(.06,.02,.03,.008),dk,0,.045,.36,false)); g.add(lid);
  ud.lid=lid;
  break;}
 case 'dish':{
  const steel=M('#c9cfd6',{roughness:.3,metalness:.55}), dk=M('#8d969f',{roughness:.5});
  g.add(mesh(RB(.86,.5,.8,.03),M('#e4e7eb',{roughness:.4,metalness:.3}),0,.25,0));
  g.add(mesh(RB(.92,.04,.86,.012),steel,0,.52,0));
  for(const x of [-.2,.2]) g.add(mesh(RB(.32,.36,.02,.01),M('#d3d8de',{roughness:.35,metalness:.4}),x,.26,.41,false));
  // bacs gris empilés et piles d'assiettes sales
  for(let i=0;i<2;i++) g.add(mesh(RB(.34,.07,.24,.015),dk,.22,.58+i*.075,-.18,true));
  const st=new THREE.Group(); st.position.set(-.18,.54,.05); g.add(st);
  const plM=M('#f6f3ee',{roughness:.3}), spM=M('#c9a46a',{roughness:.8});
  const pls=[]; for(let i=0;i<12;i++){ const pp=new THREE.Group(); pp.add(mesh(CY(.11,.08,.016,18),plM,0,0,0,false)); if(i%3===0) pp.add(mesh(CY(.04,.04,.003,8),spM,.02,.01,0,false)); pp.position.set((i>=6?.22:0)+((i*37)%7-3)*.003,.01+(i%6)*.019,(i>=6?.12:0)); pp.visible=false; st.add(pp); pls.push(pp); }
  ud.stack=n=>{ pls.forEach((p,i)=>p.visible=i<n); };
  break;}
 case 'counter':{
  const wood=M(F.col,{roughness:.55});
  g.add(mesh(RB(.88,.5,.88,.04),wood,0,.25,0));
  for(const s of [-.15,.15]){ g.add(mesh(new THREE.BoxGeometry(.012,.36,.005),M(shade(F.col,-.3)),s,.25,.443,false)); g.add(mesh(new THREE.BoxGeometry(.005,.36,.012),M(shade(F.col,-.3)),.443,.25,s,false)); }
  g.add(mesh(RB(.96,.06,.96,.02),M('#f6f3ee',{roughness:.2}),0,.53,0));
  itemsGroup(g,.7,3,.28);
  break;}
 case 'plant':{
  g.add(mesh(CY(.17,.12,.3,20),M('#d9774f'),0,.15,0)); g.add(mesh(CY(.19,.19,.05,20),M('#e58a62'),0,.31,0)); g.add(mesh(CY(.16,.16,.02,20),M('#5b3a26'),0,.335,0,false));
  const L=new THREE.Group(); L.position.y=.34; g.add(L);
  const leafG=SP(1,12,8), greens=[M('#4fb562',{roughness:.6}),M('#6fcf74',{roughness:.6}),M('#3f9a4f',{roughness:.6})];
  for(let i=0;i<9;i++){ const p=new THREE.Group(); p.rotation.y=i*2*Math.PI/9+(i%2)*.3; const lf=mesh(leafG,greens[i%3],0,.12,.17); lf.scale.set(.085,.025,.2); lf.rotation.x=-(.55+(i%3)*.25); p.add(lf); L.add(p); }
  for(let i=0;i<3;i++){ const lf=mesh(leafG,greens[1],(i-1)*.05,.3,0); lf.scale.set(.06,.2,.02); lf.rotation.z=(i-1)*.4; L.add(lf); }
  ud.anim=(T)=>{ L.rotation.y=Math.sin(T*.7+g.id)*.08; L.rotation.z=Math.sin(T*1.1+g.id)*.03; };
  break;}
 case 'flowers':{
  g.add(mesh(CY(.2,.16,.26,20),M('#f7f2ea',{roughness:.4}),0,.13,0));
  const gr=M('#5fb54f',{flatShading:true,roughness:.85});
  for(const [x,z,s] of [[-.08,0,.16],[.08,.03,.15],[0,-.07,.15],[0,.06,.13]]) g.add(mesh(IC(s,1),gr,x,.36,z));
  const cs=['#ff7aa8','#ffd23f','#ff6b6b','#c58cff','#ffffff','#ff9a3d'];
  for(let i=0;i<10;i++){ const a=i*2.4, r=.1+(i%3)*.05; g.add(mesh(SP(.045,10,8),M(cs[i%6],{roughness:.5}),Math.cos(a)*r,.44+(i%2)*.06,Math.sin(a)*r,false)); }
  break;}
 case 'lamp':{
  const brass=M('#d8b46a',{metalness:.7,roughness:.3});
  g.add(mesh(CY(.13,.15,.05,20),M('#3a3f47',{metalness:.4,roughness:.4}),0,.025,0));
  g.add(mesh(CY(.02,.02,1.3,10),brass,0,.67,0));
  g.add(mesh(CY(.12,.24,.24,24,1),M('#fff3d6',{emissive:'#ffd27a',emissiveIntensity:.25,roughness:.8}),0,1.4,0));
  const bulb=add(g,mesh(SP(.06),M('#fff8e0',{emissive:'#ffe2a0',emissiveIntensity:1}),0,1.29,0,false));
  const L=new THREE.PointLight(0xffc77a,0,5,1.4); L.position.y=1.2; g.add(L); ud.light=L;
  break;}
 case 'jukebox':{
  g.add(mesh(RB(.58,.62,.42,.06),M('#b04bd6',{roughness:.35}),0,.31,0));
  const top=add(g,mesh(CY(.29,.29,.42,28),M('#ff8fb8',{roughness:.35}),0,.62,0)); top.rotation.x=Math.PI/2;
  const neon=new THREE.MeshStandardMaterial({color:'#ffffff',emissive:'#44e0ff',emissiveIntensity:1.8}); neon.userData.own=1;
  const n1=add(g,mesh(TO(.24,.022,Math.PI),neon,0,.62,.215,false));
  g.add(mesh(new THREE.BoxGeometry(.04,.5,.03),neon,-.24,.37,.215,false)); g.add(mesh(new THREE.BoxGeometry(.04,.5,.03),neon,.24,.37,.215,false));
  g.add(mesh(RB(.3,.2,.02,.02),M('#2b1d33'),0,.3,.215,false));
  g.add(mesh(CY(.14,.14,.02,24,1),M('#ffe9a8',{emissive:'#ffcf5a',emissiveIntensity:.6}),0,.62,.215,false)).children;
  ud.anim=(T)=>{ neon.emissive.setHSL((T*.15)%1,.9,.55); const on=MUS.on&&state.music!==false, ph=on?(T*curTrack().bpm/60)%1:0, k=on?Math.exp(-ph*5):0; neon.emissiveIntensity=on?1.2+k*1.6:.5; g.scale.y=1+k*.035; };
  break;}
 case 'aquarium':{
  g.add(mesh(RB(.88,.32,.54,.04),M('#8a5a36',{roughness:.5}),0,.16,0));
  g.add(mesh(new THREE.BoxGeometry(.8,.06,.46),M('#ecd9a8'),0,.35,0,false));
  const water=new THREE.MeshStandardMaterial({color:'#4aa8db',transparent:true,opacity:.45,roughness:.1,depthWrite:false}); water.userData.own=1;
  g.add(mesh(new THREE.BoxGeometry(.78,.4,.44),water,0,.56,0,false));
  const glass=new THREE.MeshStandardMaterial({color:'#dff4ff',transparent:true,opacity:.22,roughness:.02,metalness:.1,depthWrite:false}); glass.userData.own=1;
  g.add(mesh(new THREE.BoxGeometry(.82,.48,.48),glass,0,.56,0,false));
  for(const x of [-.25,.22]){ const w=mesh(CY(.015,.02,.28,6),M('#3fa34d'),x,.5,-.1,false); g.add(w); }
  const fish=[]; ['#ff8c1a','#ffd23f','#ff5e7e'].forEach((c,i)=>{ const fsh=mesh(SP(.045,10,8),M(c,{roughness:.4}),0,.5+i*.08,(i-1)*.1,false); fsh.scale.set(1.7,1,.6); g.add(fsh); fish.push(fsh); });
  ud.anim=(T)=>{ fish.forEach((fh,i)=>{ const p=Math.sin(T*.6+i*2); fh.position.x=p*.3; fh.rotation.y=Math.cos(T*.6+i*2)>0?0:Math.PI; }); };
  break;}
 case 'fountain':{
  const stone=M('#d7dde3',{roughness:.6});
  g.add(mesh(CY(.44,.47,.2,36),stone,0,.1,0));
  g.add(mesh(CY(.39,.39,.02,36),M('#5bb8ef',{roughness:.05,emissive:'#2a7fc0',emissiveIntensity:.15}),0,.19,0,false));
  g.add(mesh(CY(.06,.08,.42,14),stone,0,.4,0));
  g.add(mesh(CY(.18,.11,.08,24),stone,0,.64,0)); g.add(mesh(CY(.15,.15,.01,24),M('#5bb8ef',{roughness:.05}),0,.68,0,false));
  const drops=[]; for(let i=0;i<10;i++){ const d=mesh(SP(.022,6,5),M('#9fdcff',{emissive:'#5bb8ef',emissiveIntensity:.4}),0,.7,0,false); g.add(d); drops.push(d); }
  ud.anim=(T)=>{ drops.forEach((d,i)=>{ const ph=(T*.8+i/10)%1, a=i*Math.PI/5; d.position.set(Math.cos(a)*ph*.3,.7+Math.sin(ph*Math.PI)*.18-ph*.48,Math.sin(a)*ph*.3); }); };
  break;}
 case 'wbench':{ const bb=makeBench(F.col,.95); bb.children.forEach(c=>g.add(c.clone())); break;}
 case 'fridge':{
  const big=!!F.big, H=big?1.16:1.04, W=big?.86:.7, D=.6, body=M(F.col,{roughness:.32,metalness:.25});
  // caisson ouvert à l'avant (on voit les bouteilles derrière la vitre)
  g.add(mesh(RB(W,H,.05,.015),body,0,H/2,-.325)); for(const sx of [-1,1]) g.add(mesh(RB(.05,H,D,.015),body,sx*(W/2-.025),H/2,-.05));
  g.add(mesh(RB(W,.1,D,.02),body,0,.05,-.05));
  g.add(mesh(RB(W+.01,.14,D+.01,.03),M('#fbf7f0',{roughness:.4}),0,H-.07,-.05));
  const logo=emoSprite(big?'🧃':'🥤',.13); logo.position.set(0,H-.07,.27); g.add(logo);
  const inM=new THREE.MeshStandardMaterial({color:'#f2f8ff',emissive:'#d7ebff',emissiveIntensity:.55,roughness:.5}); inM.userData.own=1;
  const iw=W-.12, ih=H-.3, iy=.1+ih/2;
  g.add(mesh(new THREE.BoxGeometry(iw,ih,.02),inM,0,iy,-.29,false));
  const shelfM=M('#dfe6ee',{roughness:.3,metalness:.3}), cols=['#3fa34d','#e84b3c','#f2b33d','#2f7fd6','#a7d8f5','#7a3b1f','#f07ad0'];
  const rows=big?4:3, per=big?6:4;
  for(let r=0;r<rows;r++){ const y=.12+r*(ih/rows); g.add(mesh(new THREE.BoxGeometry(iw,.012,.5),shelfM,0,y,-.05,false));
   for(let i=0;i<per;i++){ const c=cols[(r*3+i*2)%cols.length], x=-iw/2+.06+i*(iw-.12)/(per-1);
    if((r+i)%3===0){ g.add(mesh(CY(.032,.032,.1,10),M(c,{roughness:.25,metalness:.5}),x,y+.056,0,false)); }
    else { g.add(mesh(CY(.024,.028,.13,10),M(c,{roughness:.1,transparent:true,opacity:.85}),x,y+.072,0,false)); g.add(mesh(CY(.01,.016,.04,8),M(c,{roughness:.1}),x,y+.155,0,false)); } } }
  // porte vitrée sur charnière
  const door=new THREE.Group(); door.position.set(-W/2+.03,0,D/2-.04); g.add(door);
  const fr=M(shade(F.col,-.25),{roughness:.4,metalness:.3}), dw=W-.06;
  door.add(mesh(new THREE.BoxGeometry(dw,.04,.03),fr,dw/2,.08,0,false)); door.add(mesh(new THREE.BoxGeometry(dw,.04,.03),fr,dw/2,H-.16,0,false));
  door.add(mesh(new THREE.BoxGeometry(.04,H-.24,.03),fr,.02,(H-.08)/2+.02,0,false)); door.add(mesh(new THREE.BoxGeometry(.04,H-.24,.03),fr,dw-.02,(H-.08)/2+.02,0,false));
  const glass=new THREE.MeshStandardMaterial({color:'#dff1ff',transparent:true,opacity:.18,roughness:.05,metalness:.1}); glass.userData.own=1;
  door.add(mesh(new THREE.BoxGeometry(dw-.06,H-.28,.008),glass,dw/2,(H-.08)/2+.02,0,false));
  door.add(mesh(CY(.012,.012,.32,8),M('#d7dce2',{metalness:.8,roughness:.2}),dw-.07,H/2,.03,false));
  ud.door=door; ud.inM=inM;
  break;}
 case 'bar':{
  const wood=M(F.col,{roughness:.5}), dark=M(shade(F.col,-.3),{roughness:.5});
  const top=F.marble?M('#f1eee8',{roughness:.15}):M('#3a2a20',{roughness:.25,metalness:.1});
  g.add(mesh(RB(.9,.58,.5,.03),wood,0,.29,.16));
  for(const x of [-.29,0,.29]) g.add(mesh(RB(.25,.4,.02,.01),M(shade(F.col,.14),{roughness:.5}),x,.31,.415,false));
  g.add(mesh(RB(.98,.05,.6,.015),top,0,.605,.16));
  const brass=M('#d4a64a',{metalness:.85,roughness:.25});
  const rail=mesh(CY(.014,.014,.9,8),brass,0,.1,.47,false); rail.rotation.z=Math.PI/2; g.add(rail);
  // étagère à bouteilles au fond
  g.add(mesh(RB(.92,.06,.2,.01),dark,0,.62,-.33)); g.add(mesh(RB(.92,.05,.2,.01),dark,0,.93,-.33)); g.add(mesh(RB(.92,.05,.2,.01),dark,0,1.22,-.33));
  for(const x of [-.44,.44]) g.add(mesh(RB(.04,.64,.2,.01),dark,x,.93,-.33));
  const bc=['#3c7a3a','#7a2a1a','#e8c06a','#2a5f9e','#c9d6df','#a33a6b','#5b3a1e'];
  for(const [y,n] of [[.65,7],[.955,6]]) for(let i=0;i<n;i++){ const c=bc[(i*3+(y>.8?2:0))%bc.length], x=-.36+i*.72/(n-1);
   g.add(mesh(CY(.03,.034,.17,10),M(c,{roughness:.08,transparent:true,opacity:.88}),x,y+.085,-.33,false)); g.add(mesh(CY(.011,.018,.07,8),M(c,{roughness:.1}),x,y+.2,-.33,false)); }
  // tireuse à bière et verres
  for(const x of [.24,.34]){ g.add(mesh(CY(.018,.018,.16,8),brass,x,.71,.06,false)); g.add(mesh(CY(.012,.016,.09,8),M('#222'),x,.83,.06,false)); }
  for(const x of [-.36,-.3]) g.add(mesh(CY(.03,.025,.08,12),M('#e8f4fb',{transparent:true,opacity:.5,roughness:.05}),x,.67,.3,false));
  const shk=new THREE.Group(); shk.add(mesh(CY(.04,.048,.15,14),M('#d7dce2',{metalness:.85,roughness:.18}),0,.075,0)); shk.add(mesh(CY(.028,.04,.05,14),M('#c3c9d0',{metalness:.85,roughness:.2}),0,.175,0));
  shk.position.set(-.12,.63,.12); shk.visible=false; g.add(shk);
  ud.cook=(on)=>{ shk.visible=!!on; if(on){ const T=performance.now()/1000; shk.position.y=.63+Math.abs(Math.sin(T*11))*.07; shk.rotation.z=Math.sin(T*11)*.35; } };
  itemsGroup(g,.76,3,.24); ud.items.position.z=.2;
  break;}
 case 'decor': decor3D(g,F.m,ud); break;
 case 'statue':{
  const gold=M('#e8b423',{metalness:.85,roughness:.25});
  g.add(mesh(RB(.5,.34,.5,.04),M('#f4f1ea',{roughness:.3}),0,.17,0));
  g.add(mesh(CA(.11,.2),gold,0,.62,0)); g.add(mesh(SP(.1),gold,0,.92,0));
  const arm=add(g,mesh(CA(.035,.22),gold,.14,.86,0)); arm.rotation.z=-.6;
  g.add(mesh(SP(.06),gold,.24,1.0,0));
  break;}
 }
 return g;
}

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

/* --- voitures --- */
let cars=[],carT=2;
const CAR_COLS=['#ef5a4f','#4f8ff7','#ffd23f','#4fc28f','#f4f4f4','#9b6bf7','#ff9a3d'];
const headMat=new THREE.MeshStandardMaterial({color:'#fff6c2',emissive:'#ffe9a0',emissiveIntensity:.2});
function makeCar(c){
 if(c.t){ try{ return lfVehicle(c); }catch(e){} }
 const g=new THREE.Group(), body=M(c.c,{roughness:.3,metalness:.2}), glass=M('#3a4f66',{roughness:.15,metalness:.3}), tire=M('#22252b',{roughness:.8});
 if(c.k){ g.add(mesh(RB(1.5,.62,.62,.08),M('#f4f4f4',{roughness:.4}),-.2,.48,0)); g.add(mesh(RB(.5,.5,.6,.08),body,.6,.42,0)); g.add(mesh(RB(.06,.2,.5,.02),glass,.85,.55,0,false)); }
 else { g.add(mesh(RB(1.15,.3,.56,.12),body,0,.3,0)); g.add(mesh(RB(.62,.26,.5,.1),glass,-.06,.52,0)); g.add(mesh(RB(.5,.05,.46,.02),body,-.06,.66,0)); }
 for(const [x,z] of [[-.36,-.27],[.36,-.27],[-.36,.27],[.36,.27]]){ const w=mesh(CY(.13,.13,.09,16),tire,x,.14,z); w.rotation.x=Math.PI/2; g.add(w); }
 for(const z of [-.18,.18]) g.add(mesh(SP(.05,8,6),headMat,c.k?.86:.58,.33,z,false));
 g.position.set(c.x,0,c.z); g.rotation.y=c.v>0?0:Math.PI; return g;
}
function updCars(dt){
 carT-=dt; if(carT<=0&&!lifeRoadBusy){ carT=rnd(4,10); const d=evBusOn?-1:Math.random()<.5?1:-1; const c={x:d>0?-18:S+27,z:d>0?S+2.5:S+3.5,v:d*rnd(2.8,4.2),c:pick(CAR_COLS),k:Math.random()<.2}; { const q=Math.random(); c.t=q<.09?'tractor':q<.2?'scoot':q<.29?'van':q<.36?'bus':null; if(c.t==='tractor') c.v=d*1.5; } c.g=makeCar(c); fxRoot.add(c.g); cars.push(c); }
 for(const c of cars){ c.x+=c.v*dt; c.g.position.x=c.x; if(c.x<-19||c.x>S+28){ fxRoot.remove(c.g); c.dead=1; } }
 cars=cars.filter(c=>!c.dead);
}

/* --- particules & textes flottants --- */
let parts=[];
function spawnPart(tex,col,x,y,z,vx,vy,vz,life,size,grow,add){
 const m=new THREE.SpriteMaterial({map:tex,color:col,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});
 const sp=new THREE.Sprite(m); sp.position.set(x,y,z); sp.scale.setScalar(size); fxRoot.add(sp);
 parts.push({sp,vx,vy,vz,t:life,T:life,size,grow:grow||0});
}
function sparkle(gx,gy,n,col){ for(let i=0;i<n;i++) spawnPart(STAR,col||pick(['#ffd23f','#fff3a8','#ffb020']),gx+.5,.95,gy+.5,rnd(-.8,.8),rnd(1,2.2),rnd(-.8,.8),rnd(.5,.9),.16,0,true); }
function floatAt(x,y,s,c,coin){ if(String(s).includes('🪙')){ s=s.replace(/ ?🪙/,''); coin=true; } floaters.push({id:uid++,x,y,s,c,coin,t:1.6}); }
let steamAcc=0; const _sv=new THREE.Vector3();
function updFx(dt){
 for(const f of floaters) f.t-=dt; floaters=floaters.filter(f=>f.t>0);
 for(const p of parts){ p.t-=dt; p.sp.position.x+=p.vx*dt; p.sp.position.y+=p.vy*dt; p.sp.position.z+=p.vz*dt; p.vy-=p.grow?-.1*dt:3*dt; const k=p.t/p.T; p.sp.material.opacity=Math.min(1,k*2)*(p.grow?.6:1); p.sp.scale.setScalar(p.size*(p.grow?1+(1-k)*p.grow:1)); if(p.t<=0){ fxRoot.remove(p.sp); p.sp.material.dispose(); } }
 parts=parts.filter(p=>p.t>0);
 steamAcc+=dt; if(steamAcc>.22){ steamAcc=0; for(const a of crew) if(a.job&&a.job.s==='work'&&a.job.st){ const S2=a.job.st, o=fObjs.get(S2.id); if(o&&o.g.userData.steamAt){ const v=o.g.localToWorld(_sv.copy(o.g.userData.steamAt)); spawnPart(GLOW,'#ffffff',v.x+rnd(-.04,.04),v.y,v.z+rnd(-.04,.04),rnd(-.05,.05),.45,rnd(-.05,.05),1.1,.18,2.2,false); } } }
 updCars(dt);
}

/* --- synchronisation scène / jeu --- */
const fObjs=new Map(), aObjs=new Map(), tObjs=new Map(), iObjs=new Map();
let tableItems=new Map(),readyAt=new Map(),cookAt=new Map(),cookInfo=new Map();
const FURN_STILL=['kind','top','plates','items'];
function furnBake(g,key){ const ud=g.userData; if(!BAKE||Object.keys(ud).some(k=>!FURN_STILL.includes(k))) return; const skip=new Set(); if(ud.items) skip.add(ud.items); if(ud.plates) for(const p of ud.plates) skip.add(p); bakeByMat(g,skip,'F|'+key); }
function syncFurn(T,n){
 const seen=new Set();
 for(const f of state.furn){
  let o=fObjs.get(f.id);
  const key=f.t+(f.t==='odette'?'|'+souvN():'')+(kindOf(f)==='chair'?chairBackDir(f).join():kindOf(f)==='table'?tableJoin(f).join(''):'');
  if(o&&o.key!==key){ furnRoot.remove(o.g); disposeTree(o.g); o=null; }
  if(!o){ o={g:buildFurn(f.t,f),key}; try{ furnBake(o.g,key); }catch(e){ console.warn('bake',f.t,e); } furnRoot.add(o.g); fObjs.set(f.id,o); }
  const g=o.g, ud=g.userData; g.position.set(f.x+.5,0,f.y+.5);
  if(ud.kind==='chair'){ const t=seatTable(f); if(t){ const off=.43-.25*(f.pull||0); g.position.x+=(t.x-f.x)*off; g.position.z+=(t.y-f.y)*off; } } g.visible=!((sel===f||ghostChairs.has(f))&&ghost);
  g.rotation.y=furnRot(f)*Math.PI/2;
  { const pt=popAt.get(f.id); if(pt!==undefined){ const k=(performance.now()-pt)/380; if(k>=1){ popAt.delete(f.id); g.scale.setScalar(1); } else g.scale.setScalar(1+.18*Math.sin(k*Math.PI)*(1-k)); } }
  if(ud.anim) ud.anim(T);
  if(ud.stack) ud.stack(Math.min(12,dishStack.get(f.id)||0));
  if(ud.lid){ const t0=binOpen.get(f.id); let k=0; if(t0!==undefined){ const e=(performance.now()-t0)/1000; k=e<.25?e/.25:e<.95?1:e<1.3?1-(e-.95)/.35:0; if(e>1.3) binOpen.delete(f.id); } ud.lid.rotation.x=-k*1.15; }
  if(ud.door){ const t0=fridgeOpen.get(f.id); let k=0; if(t0!==undefined){ const e=(performance.now()-t0)/1000; k=e<.3?e/.3:e<.95?1:e<1.4?1-(e-.95)/.45:0; if(e>1.4) fridgeOpen.delete(f.id); } ud.door.rotation.y=-k*1.6; ud.inM.emissiveIntensity=.55+k*.6; }
  if(ud.cook) ud.cook(cookAt.get(f.id),cookInfo.get(f.id));
  if(ud.light) ud.light.intensity=n*4;
  if(ud.kind==='table'){ setItems(g,tableItems.get(f.id)||[]); const dn=Math.min(dirty.get(f.id)||0,2); ud.plates.forEach((p,i)=>p.visible=i<dn); }
  else if(ud.items) setItems(g,readyAt.get(f.id)||[]);
  seen.add(f.id);
 }
 for(const [id,o] of fObjs) if(!seen.has(id)){ furnRoot.remove(o.g); disposeTree(o.g); fObjs.delete(id); }
}
function syncAgents(dt,T){
 const seen=new Set();
 for(const a of crew.concat(custs,city.walkers,evA,lifeA)){
  let o=aObjs.get(a);
  if(o&&a.s&&o.role!==a.s.role){ agentRoot.remove(o.root); charFree(o); o=null; }
  if(!o){ o=makeCharC(a); agentRoot.add(o.root); aObjs.set(a,o); }
  animCharC(a,o,dt,T); seen.add(a);
  o.root.visible=!a.spawnWait&&!a.hide;
 }
 // décalages d'évitement calculés par la logique
 for(const [a,o] of aObjs){ o.sx=a.offX||0; o.sz=a.offY||0; }
 for(const [a,o] of aObjs) if(!seen.has(a)){ agentRoot.remove(o.root); charFree(o); aObjs.delete(a); }
}
function syncSmall(T){
 const seen=new Set();
 for(const t of trash){ let s=tObjs.get(t.id); if(!s){ s=litter3D(t); fxRoot.add(s); tObjs.set(t.id,s); } s.position.set(t.x+.5,.004,t.y+.5); seen.add(t.id); }
 for(const [id,s] of tObjs) if(!seen.has(id)){ fxRoot.remove(s); tObjs.delete(id); }
 const seen2=new Set();
 for(const it of items){ let o=iObjs.get(it.id); if(!o){ const g=new THREE.Group(); const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#ffd860',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.setScalar(.9); g.add(glow); const pr=foodProto(ING[it.k].e); let e; if(pr){ e=pr.clone(true); e.scale.setScalar(2.1); e.position.y=-.14; } else e=emoSprite(ING[it.k].e,.42); g.add(e); g.userData={glow,e}; fxRoot.add(g); o=g; iObjs.set(it.id,o); }
  const b=Math.sin(T*4+it.id)*.06; o.position.set(it.x+.5,.45+b,it.y+.5); const fade=Math.min(1,it.t/4); o.userData.glow.material.opacity=.5*fade; if(o.userData.e.material) o.userData.e.material.opacity=fade; else o.userData.e.rotation.y=T*1.2+it.id; o.scale.setScalar(.75+.25*fade); seen2.add(it.id); }
 for(const [id,o] of iObjs) if(!seen2.has(id)){ fxRoot.remove(o); o.userData.glow.material.dispose(); iObjs.delete(id); }
}

/* --- mode déco : grille, sélection, fantôme, cases valides, poignée cuisine --- */
let edWas=false, edPlan=false, edPitch0=.57; const _selBox=new THREE.Box3();
const selArrow=new THREE.Group(); { const c1=new THREE.Mesh(new THREE.ConeGeometry(.2,.36,4),new THREE.MeshBasicMaterial({color:'#ffd23f',depthTest:false,transparent:true})); c1.renderOrder=10; const c0=new THREE.Mesh(new THREE.ConeGeometry(.27,.47,4),new THREE.MeshBasicMaterial({color:'#5e3719',depthTest:false,transparent:true})); c0.renderOrder=9; c0.position.y=.02; selArrow.add(c0,c1); } selArrow.rotation.x=Math.PI; selArrow.visible=false; scene.add(selArrow);
function edPlanBtn(ed){ let b=$('#ePlan'); if(!b){ b=document.createElement('button'); b.id='ePlan'; b.setAttribute('aria-label','Vue de dessus'); document.body.appendChild(b); b.addEventListener('click',()=>{ audioInit(); sfx('pop'); edPlan=!edPlan; if(edPlan){ edPitch0=cam.pitchT; cam.pitchT=CAM_PMAX; } else cam.pitchT=edPitch0; b._k=null; }); } const k=(ed?'1':'0')+(edPlan?'1':'0'); if(b._k!==k){ b._k=k; b.className=(ed?'':'hide ')+(edPlan?'on':''); b.innerHTML=edPlan?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l9-5 9 5-9 5z"/><path d="M12 12V3M8 6l4-3 4 3"/></svg><span>Vue normale</span>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16M12 4v16"/></svg><span>Vue de dessus</span>'; } }
// toucher un meuble là où on le voit (et pas seulement sur sa case au sol)
function pickFurn(sx,sy){ try{ _v2.set(sx/innerWidth*2-1,-(sy/innerHeight)*2+1); ray.setFromCamera(_v2,camera); const hits=ray.intersectObjects(furnRoot.children,true); for(const h of hits){ let o=h.object; if(o.isSprite||o.visible===false) continue; while(o&&o.parent!==furnRoot) o=o.parent; if(!o||o.visible===false) continue; for(const [id,v] of fObjs) if(v.g===o){ const f=state.furn.find(x=>x.id===id); if(f) return f; } } }catch(e){} return null; }
const selMesh=new THREE.Mesh(new THREE.PlaneGeometry(.96,.96),new THREE.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:.4,depthWrite:false})); selMesh.rotation.x=-Math.PI/2; scene.add(selMesh);
const ghostTile=new THREE.Mesh(new THREE.PlaneGeometry(.96,.96),new THREE.MeshBasicMaterial({color:'#3bd16f',transparent:true,opacity:.45,depthWrite:false})); ghostTile.rotation.x=-Math.PI/2; scene.add(ghostTile);
const ghostMat=new THREE.MeshStandardMaterial({color:'#7dffa6',transparent:true,opacity:.55,depthWrite:false});
let ghostObj=null, ghostType=null;
const cellTex=canvasTex(64,64,(x)=>{ x.fillStyle='rgba(255,255,255,.42)'; rrect(x,6,6,52,52,12); x.fill(); x.strokeStyle='rgba(255,255,255,.95)'; x.lineWidth=3; rrect(x,7.5,7.5,49,49,11); x.stroke(); });
const validMat=new THREE.MeshBasicMaterial({map:cellTex,transparent:true,opacity:.6,depthWrite:false});
const validIM=new THREE.InstancedMesh(new THREE.PlaneGeometry(.92,.92).rotateX(-Math.PI/2),validMat,400); validIM.count=0; validIM.frustumCulled=false; scene.add(validIM);
const C_OK=new THREE.Color('#3fd57a'), C_SOFT=new THREE.Color('#bde8c9'), _m4=new THREE.Matrix4();
let validKey='';
let ghostChairs=new Map();
function updGhostChairs(gt){
 const want=gt&&sel&&kindOf(sel)==='table'?attachedChairs(sel):[], keep=new Set(want);
 for(const [c,m] of ghostChairs) if(!keep.has(c)){ scene.remove(m); ghostChairs.delete(c); }
 for(const c of want){ let m=ghostChairs.get(c); if(!m){ m=buildFurn(c.t,c); m.traverse(o=>{ if(o.isMesh){ o.material=ghostMat; o.castShadow=false; } if(o.isSprite) o.visible=false; }); scene.add(m); ghostChairs.set(c,m); }
  m.position.set(c.x+ghost.x-sel.x+.5,0,c.y+ghost.y-sel.y+.5); const dx=sel.x-c.x, dz=sel.y-c.y; m.position.x+=dx*.43; m.position.z+=dz*.43; }
}
const kPrev=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ff7a2f',transparent:true,opacity:.3,depthWrite:false})); kPrev.visible=false; scene.add(kPrev);
const kEdge=[0,1,2,3].map(()=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(1,.03,.07),new THREE.MeshBasicMaterial({color:'#ff6f2b'})); m.visible=false; scene.add(m); return m; });
function updEditVis(T){
 const ed=mode==='edit', zt=ed&&etab==='zone';
 if(gridLines) gridLines.visible=ed;
 if(kitTint){ kitTint.visible=ed; kitTint.material.opacity=zt?.32:.16; }
 if(ed&&!edWas){ try{ centerCam(); cam.dist*=1.14; clampCam(); }catch(e){} } if(!ed&&edWas&&edPlan){ edPlan=false; cam.pitchT=edPitch0; } edWas=ed; edPlanBtn(ed);
 selMesh.visible=ed&&!!sel; selArrow.visible=ed&&!!sel&&!odrag; if(sel){ const k=.5+.5*Math.sin(T*5); selMesh.position.set(sel.x+.5,.012,sel.y+.5); selMesh.material.opacity=.38+.3*k; selMesh.scale.setScalar(1+.06*k); const o=fObjs.get(sel.id); let top=1.1; if(o){ try{ _selBox.setFromObject(o.g); top=_selBox.max.y+.42; }catch(e){} } selArrow.position.set(sel.x+.5,top+.08*Math.sin(T*4),sel.y+.5); selArrow.rotation.y=T*1.5; }
 const gt=ed&&ghost?(placing||(sel&&sel.t)):null;
 if(gt!==ghostType){ if(ghostObj){ scene.remove(ghostObj); ghostObj=null; } ghostType=gt; if(gt){ ghostObj=buildFurn(gt,null); ghostObj.traverse(o=>{ if(o.isMesh){ o.material=ghostMat; o.castShadow=false; } if(o.isSprite) o.visible=false; }); scene.add(ghostObj); } }
 ghostTile.visible=!!gt;
 if(gt){ const ok=canPlace(ghost.x,ghost.y,sel,gt); ghostObj.position.set(ghost.x+.5,0,ghost.y+.5); ghostTile.position.set(ghost.x+.5,.014,ghost.y+.5); ghostTile.material.color.set(ok?'#3bd16f':'#ff4d4d'); ghostMat.color.set(ok?'#7dffa6':'#ff8080');
  ghostObj.rotation.y=furnRot({t:gt,x:ghost.x,y:ghost.y,r:sel?sel.r:prot})*Math.PI/2; }
 updGhostChairs(gt);
 // cases où l'objet peut aller (vert vif : une chaise y touchera une table)
 const vt=ed&&!zt?(placing||(sel&&sel.t)):null;
 const vk=vt?vt+'|'+occVer+'|'+(sel?sel.id:'')+'|'+S+'|'+KR.x0+KR.y0+KR.w+KR.d:'';
 if(vk!==validKey){ validKey=vk; let n=0;
  if(vt){ const ch=FURN[vt].kind==='chair';
   for(let y=0;y<S;y++) for(let x=0;x<S;x++){ if(sel&&sel.x===x&&sel.y===y) continue; if(!canPlace(x,y,sel,vt)) continue;
    const good=!ch||D4.some(([dx,dy])=>{ const t=fAt(x+dx,y+dy); return t&&t!==sel&&kindOf(t)==='table'; });
    _m4.makeTranslation(x+.5,.011,y+.5); validIM.setMatrixAt(n,_m4); validIM.setColorAt(n,good?C_OK:C_SOFT); n++; } }
  validIM.count=n; validIM.instanceMatrix.needsUpdate=true; if(validIM.instanceColor) validIM.instanceColor.needsUpdate=true; }
 validIM.visible=!!vt&&validIM.count>0; validMat.opacity=placing||odrag?.75:.4;
 // espace cuisine : aperçu du rectangle
 const kz=state.kz, R=kdrag?kitRectOf({c:kz.c,w:kdrag.w,d:kdrag.d},S):KR, bad=!!(kdrag&&kitBoundsErr({c:kz.c,w:kdrag.w,d:kdrag.d}));
 kPrev.visible=zt&&!!kdrag; if(kPrev.visible){ kPrev.position.set(R.x0+R.w/2,.02,R.y0+R.d/2); kPrev.scale.set(R.w,1,R.d); kPrev.material.color.set(bad?'#ff4d4d':'#ff7a2f'); }
 const E=[[R.x0+R.w/2,R.y0,R.w,0],[R.x0+R.w/2,R.y0+R.d,R.w,0],[R.x0,R.y0+R.d/2,R.d,1],[R.x0+R.w,R.y0+R.d/2,R.d,1]];
 kEdge.forEach((m,i)=>{ m.visible=zt; if(!zt) return; const [x,z,l,v]=E[i]; m.position.set(x,.03,z); m.scale.set(l+.07,1,1); m.rotation.y=v?Math.PI/2:0; m.material.color.set(bad?'#ff4d4d':'#ff6f2b'); });
}
// poignée de redimensionnement de la cuisine (élément HTML posé sur l'angle intérieur)
const kh=document.createElement('div'); kh.id='khandle'; kh.innerHTML='<span>⤡</span><b></b>'; kh.style.display='none'; document.body.appendChild(kh);
let khd=null;
function khCalc(e){ const p=groundAt(e.clientX,e.clientY); if(!p) return; const c=state.kz.c; const w=c[1]==='e'?S-Math.round(p.x):Math.round(p.x), d=c[0]==='s'?S-Math.round(p.z):Math.round(p.z); kdrag={w:clamp(w,KMIN_W,kMaxW()),d:clamp(d,KMIN_D,kMaxD())}; }
kh.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); audioInit(); try{kh.setPointerCapture(e.pointerId);}catch(_){} khd=e.pointerId; kdrag={w:state.kz.w,d:state.kz.d}; kh.classList.add('drag'); });
kh.addEventListener('pointermove',e=>{ if(khd===e.pointerId) khCalc(e); });
function khEnd(e){ if(khd!==e.pointerId) return; khd=null; kh.classList.remove('drag'); const k=kdrag; kdrag=null; if(k&&e.type==='pointerup'&&(k.w!==state.kz.w||k.d!==state.kz.d)) kitchenSet(k.w,k.d,state.kz.c); }
kh.addEventListener('pointerup',khEnd); kh.addEventListener('pointercancel',khEnd);
function updHandle(){
 const zt=mode==='edit'&&etab==='zone'&&!ui.panel;
 kh.style.display=zt?'flex':'none'; if(!zt) return;
 const kz=state.kz, R=kdrag?kitRectOf({c:kz.c,w:kdrag.w,d:kdrag.d},S):KR;
 const hx=kz.c[1]==='e'?R.x0:R.x0+R.w, hz=kz.c[0]==='s'?R.y0:R.y0+R.d, [sx,sy]=toScreen(hx,.55,hz);
 kh.style.transform=`translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`;
 const t=R.w+'×'+R.d; if(kh._t!==t){ kh._t=t; kh.lastChild.textContent=t; }
 kh.classList.toggle('bad',!!(kdrag&&kitBoundsErr({c:kz.c,w:kdrag.w,d:kdrag.d})));
}
// en mode déco, la scène remonte pour ne pas être cachée par le catalogue
let vOff=0;
function viewShift(dt){
 const dock=$('#edock'), tgt=mode==='edit'&&dock?Math.min(innerHeight*.4,dock.offsetHeight*.9):0;
 vOff+=(tgt-vOff)*Math.min(1,dt*7); if(Math.abs(tgt-vOff)<.5) vOff=tgt;
 const w=innerWidth, h=innerHeight;
 if(vOff<.5){ if(camera.view&&camera.view.enabled) camera.clearViewOffset(); if(camera.fov!==FOV0||Math.abs(camera.aspect-w/h)>1e-6){ camera.fov=FOV0; camera.aspect=w/h; camera.updateProjectionMatrix(); } return; }
 const H=h+vOff; camera.fov=2*Math.atan(Math.tan(FOV0*Math.PI/360)*H/h)*180/Math.PI; camera.aspect=w/H; camera.setViewOffset(w,H,0,vOff,w,h);
}

const foodThumbs={};
function foodIcon(e){ const t=foodThumbs[e]; return t?`<img class="fi" src="${t}" alt="">`:e; }
/* --- surcouche HTML (bulles, textes) --- */
const ov=$('#ov'), ovEls=new Map(); let ovUsed=new Set();
const _v=new THREE.Vector3();
function toScreen(x,y,z){ _v.set(x,y,z).project(camera); return [(_v.x*.5+.5)*innerWidth,(-_v.y*.5+.5)*innerHeight,_v.z]; }
function ovPut(key,x,y,z,cls,html){
 const [sx,sy,sz]=toScreen(x,y,z); if(sz>1) return null;
 let e=ovEls.get(key); if(!e){ e=document.createElement('div'); e.className=cls; ov.appendChild(e); ovEls.set(key,e); }
 if(e._h!==html){ e.innerHTML=deEmo(html); e._h=html; }
 e.style.transform=`translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${ovScale.toFixed(3)})`; ovUsed.add(key); return e;
}
let ovScale=1;
function updOverlay(){
 ovUsed=new Set(); ovScale=clamp(fitDist()*.5/cam.dist,.5,1);
 const ED=mode==='edit';
 for(const c of (ED?[]:custs)){
  const h=(c.sitting?1.3:1.18)*(c.kidF?.82:1);
  if(c.st==='wait'&&c.order&&(simT-(c.order.t0||0)<4||c.pat<50||(picked&&picked.o.c===c))){ const dk=c.drink&&!c.drink.cancel&&c.drink.st!=='served'?`<i class="dk">${foodIcon(DRINKM[c.drink.k].e)}</i>`:''; const e=ovPut('c'+c.id,c.fx+.5,h,c.fy+.5,'ob',`<div class="bb${picked&&picked.o.c===c?' pk':''}"><span>${foodIcon(DISHM[c.order.dish].e)}</span>${dk}</div>`); if(e){ e.style.setProperty('--p',c.pat.toFixed(0)+'%'); e.style.setProperty('--c',`hsl(${c.pat*1.2},72%,48%)`); } }
  if(c.say) ovPut('s'+c.id,c.fx+.5,c.sitting?1.2:1.1,c.fy+.5,'ob','<div class="say">'+c.say+'</div>');
  if(c.st==='look'&&c.grp&&c.grp.lead!==c){}
  else if(c.st==='look'){ ovPut('c'+c.id,c.fx+.5,1.18,c.fy+.5,'ob','<div class="th">'+(c.t>.6?'🤔':'👀')+'</div>'); }
  else if(c.st==='order'&&!c.orderBy&&c.ordT>2.5){ const e=ovPut('c'+c.id,c.fx+.5,1.3,c.fy+.5,'ob',`<div class="bb"><span>📝</span></div>`); if(e){ e.style.setProperty('--p',c.pat.toFixed(0)+'%'); e.style.setProperty('--c',`hsl(${c.pat*1.2},62%,52%)`); } }
  else if(c.st==='bill'&&!c.billBy&&c.billT>2){ const e=ovPut('c'+c.id,c.fx+.5,1.3,c.fy+.5,'ob',`<div class="bb"><span>🧾</span></div>`); if(e){ e.style.setProperty('--p','100%'); e.style.setProperty('--c','#c9b79c'); } }
  else if(c.st==='queue'&&c.pat<55){ const e=ovPut('c'+c.id,c.fx+.5,h,c.fy+.5,'ob',`<div class="bb"><span>⏳</span></div>`); if(e){ e.style.setProperty('--p',c.pat.toFixed(0)+'%'); e.style.setProperty('--c',`hsl(${c.pat*1.2},72%,48%)`); } }
 }
 for(const a of (ED?[]:crew)) if(a.job&&a.job.s==='work'&&a.job.st){ const s=a.job.st, o=a.job.o, pr=1-a.job.t/a.job.T; const e=ovPut('k'+s.id,s.x+.5,1.3,s.y+.5,'ob',`<div class="ck"><span>${foodIcon(DISHM[o.dish].e)}</span><i class="si">${STEP_IC[o.steps[o.si].k]||''}</i></div>`); if(e) e.style.setProperty('--p',(pr*100).toFixed(0)+'%'); }
 for(const a of (ED?[]:crew)) if(a.job&&a.job.s==='mix'&&a.job.st&&a.job.d){ const s=a.job.st, pr=1-a.job.t/a.job.T; const e=ovPut('m'+s.id,s.x+.5,1.45,s.y+.5,'ob',`<div class="ck"><span>${foodIcon(DRINKM[a.job.d.k].e)}</span><i class="si">🍸</i></div>`); if(e) e.style.setProperty('--p',(pr*100).toFixed(0)+'%'); }
 for(const f of floaters){ ovPut('f'+f.id,f.x+.5,1.25,f.y+.5,'ob',f.coin?`<div class="flt coinp"><i class="coin sm"></i>${f.s}</div>`:`<div class="flt" style="color:${f.c||'#3a2a1f'}">${f.s}</div>`); }
 for(const [k,e] of ovEls) if(!ovUsed.has(k)){ e.remove(); ovEls.delete(k); }
}

/* --- carnet de commandes : compact, repliable, sans animation clignotante --- */
let railT=0, railH='', railOpen=false, railB=null, railX=null;
function railInit(){ const el=$('#rail'); el.innerHTML='<button class="rp hide" aria-label="Commandes"></button><div class="rx hide"></div>'; railB=el.firstChild; railX=el.lastChild;
 railB.addEventListener('click',()=>{ railOpen=!railOpen; railT=0; railH=''; sfx('pop'); }); }
railInit();
function oProg(o){ const st=o.steps||dishSteps(o.dish), n=st.length+1; if(o.st==='wait') return .04; if(o.st==='ready'||o.st==='carried') return 1; let p=o.si||0; const a=o.chef; if(a&&a.job&&a.job.o===o&&a.job.s==='work'&&a.job.T) p+=1-a.job.t/a.job.T; return Math.max(.04,p/n); }
function dProg(d){ if(d.st==='wait') return .04; if(d.st==='fetch') return .5; if(d.st==='mixing'){ const a=d.w; return a&&a.job&&a.job.s==='mix'&&a.job.T?.15+.7*(1-a.job.t/a.job.T):.15; } return 1; }
function updRail(dt){
 railT-=dt; if(railT>0) return; railT=.3;
 const hidden=true; // v0.50 : le bandeau des commandes en haut à gauche est retiré
 const all=hidden?[]:orders.filter(o=>!o.cancel&&o.st!=='served').map(o=>({o,id:o.id,e:DISHM[o.dish].e,p:oProg(o),ok:o.st==='ready'||o.st==='carried',pat:o.c?o.c.pat:100}))
  .concat(drinkOrders.filter(d=>!d.cancel&&d.st!=='served').map(d=>({d,id:d.id,e:DRINKM[d.k].e,p:dProg(d),ok:d.st==='ready'||d.st==='carried',pat:d.c?d.c.pat:100,dr:1})))
  .sort((a,b)=>a.id-b.id);
 const vis=railOpen?all.slice(0,10):all.slice(0,5);
 const stepsOf=it=>{ let steps='';
  if(it.o){ const o=it.o, st=o.steps||dishSteps(o.dish); st.forEach((s,i)=>{ const c=o.st==='wait'?'':o.st!=='cooking'||i<o.si?'d':i===o.si?'c':''; steps+=`<i class="${c}">${STEP_IC[s.k]}</i>`; }); steps+=`<i class="${o.st==='ready'?'c':o.st==='carried'?'d':''}">🛎️</i>`; }
  else { const d=it.d, D=DRINKM[d.k]; steps=D.src==='fridge'?`<i class="${d.st==='fetch'?'c':d.st==='carried'?'d':''}">🧊</i>`:`<i class="${d.st==='mixing'?'c':d.st==='ready'||d.st==='carried'?'d':''}">🍸</i><i class="${d.st==='ready'?'c':d.st==='carried'?'d':''}">🛎️</i>`; }
  return steps; };
 // la structure n'est reconstruite que si la liste change ; les jauges glissent en douceur
 const sig=(railOpen?'o':'c')+all.length+'|'+vis.map(it=>it.id+(it.ok?'k':'')+(railOpen?stepsOf(it):'')).join(',');
 if(sig!==railH){ railH=sig;
  railB.classList.toggle('hide',!all.length); railB.classList.toggle('open',railOpen);
  railB.innerHTML=`<span class="rc">${all.length}</span>`+(railOpen?'<span class="rt">Commandes</span>':vis.map(it=>`<span class="mi${it.ok?' ok':''}"><b>${foodIcon(it.e)}</b><i><s data-k="${it.id}"></s></i></span>`).join('')+(all.length>5?`<span class="rm">+${all.length-5}</span>`:''))+`<span class="rv">${railOpen?'▴':'▾'}</span>`;
  railX.classList.toggle('hide',!(railOpen&&all.length));
  railX.innerHTML=railOpen?vis.map(it=>`<div class="tk${it.ok?' ready':''}${it.dr?' dr':''}" data-t="${it.id}"><b>${foodIcon(it.e)}</b><span class="st">${stepsOf(it)}</span><span class="tp"><s data-k="${it.id}"></s></span></div>`).join(''):'';
 }
 for(const it of vis){ for(const e of $('#rail').querySelectorAll(`s[data-k="${it.id}"]`)) e.style.width=Math.round(it.p*100)+'%';
  const t=railX.querySelector(`[data-t="${it.id}"]`); if(t) t.style.setProperty('--c',`hsl(${Math.round(it.pat*1.1)},55%,55%)`); }
}

/* --- mode « Regarder » : plus d'interface, la caméra flâne dans le restaurant --- */
const watch={on:false,t:0,focus:null,pt:null,dist:0,T0:0,hintT:0};
function watchPick(){
 const pool=[];
 for(const c of custs) if(c.sitting&&(c.st==='eat'||c.st==='wait')) pool.push(c);
 for(const a of crew) if(a.job||a.carry) pool.push(a);
 const r=Math.random();
 if(pool.length&&r<.78){ watch.focus=pick(pool); watch.pt=null; }
 else { watch.focus=null; watch.pt=[S*rnd(.3,.7),S*rnd(.3,.7)]; }
 watch.dist=fitDist()*(watch.focus?rnd(.26,.36):rnd(.42,.52)); watch.t=rnd(8,12);
}
$('#pWatch').onclick=()=>watchStart();
function watchStart(){ if(mode!=='play'||ui.panel||visit.on) return; watch.on=true; watch.T0=performance.now(); document.body.classList.add('watch'); watchPick(); railT=0;
 const hint=$('#whint'); hint.classList.remove('off'); clearTimeout(watch.hintT); watch.hintT=setTimeout(()=>hint.classList.add('off'),2600); }
function watchStop(){ if(!watch.on) return; watch.on=false; document.body.classList.remove('watch'); $('#whint').classList.add('off'); clampCam(); }
function watchCam(dt){
 if(watch.on&&(ui.panel||mode!=='play')) watchStop();
 if(!watch.on){ viewEase(dt); return; }
 watch.t-=dt; if(watch.t<=0||(watch.focus&&(watch.focus.dead||!(custs.includes(watch.focus)||crew.includes(watch.focus))))) watchPick();
 const tx=watch.focus?watch.focus.fx+.5:watch.pt[0], tz=watch.focus?watch.focus.fy+.5:watch.pt[1];
 const k=Math.min(1,dt*.45);
 cam.tx+=(tx-cam.tx)*k; cam.tz+=(tz+.4-cam.tz)*k; cam.dist+=(watch.dist-cam.dist)*Math.min(1,dt*.3);
 const el=(performance.now()-watch.T0)/1000; cam.yaw=cam.yawT+Math.sin(el*.045)*.16;
}

/* --- écran de commandes de la cuisine --- */
function drawKDS(force){
 if(!kdsCv) return;
 const list=orders.filter(o=>!o.cancel&&o.st!=='served'&&o.st!=='carried').sort((a,b)=>a.id-b.id);
 const sig=list.map(o=>o.id+o.st+(o.si||0)+':'+Math.round(oProg(o)*12)).join(',');
 if(sig===kdsSig&&!force) return; kdsSig=sig;
 const x=kdsCv.getContext('2d'), Wc=512, Hc=272;
 x.fillStyle='#151a1e'; x.fillRect(0,0,Wc,Hc);
 x.fillStyle='#e8c46a'; x.font='600 21px '+FONT; x.textAlign='left'; x.textBaseline='middle'; x.fillText('COMMANDES',18,26);
 x.fillStyle='#7f948a'; x.font='500 18px '+FONT; x.textAlign='right'; x.fillText(list.length?list.length+' en cours':'',Wc-18,26);
 if(!list.length){ x.fillStyle='#55665d'; x.font='500 22px '+FONT; x.textAlign='center'; x.fillText('Aucune commande',Wc/2,Hc/2+14); }
 const cw=156, ch=100, gx=10;
 list.slice(0,6).forEach((o,i)=>{ const cx=18+(i%3)*(cw+gx), cy=50+Math.floor(i/3)*(ch+gx), ok=o.st==='ready';
  x.fillStyle=ok?'#1d3a2a':'#232b31'; rrect(x,cx,cy,cw,ch,12); x.fill();
  { const im=foodImg(DISHM[o.dish].e); if(im) x.drawImage(im,cx+4,cy+8,60,60); else { x.font='40px '+EMO; x.textAlign='left'; x.fillText(DISHM[o.dish].e,cx+12,cy+42); if(foodThumbs[DISHM[o.dish].e]) kdsSig=''; } }
  x.fillStyle=ok?'#8fe0b0':'#c9d4cf'; x.font='600 17px '+FONT; x.textAlign='right'; x.fillText(o.tNo?'T'+o.tNo:'',cx+cw-12,cy+22);
  const st=o.steps||dishSteps(o.dish); x.font='15px '+EMO; x.textAlign='right';
  st.forEach((s2,k)=>{ x.globalAlpha=o.st==='wait'?.35:k<(o.si||0)||ok?.45:k===(o.si||0)?1:.35; x.fillText(STEP_IC[s2.k],cx+cw-12-(st.length-1-k)*20,cy+52); }); x.globalAlpha=1;
  x.fillStyle='rgba(255,255,255,.1)'; rrect(x,cx+12,cy+ch-20,cw-24,7,4); x.fill();
  x.fillStyle=ok?'#3fb37a':'#f0a04b'; rrect(x,cx+12,cy+ch-20,Math.max(7,(cw-24)*oProg(o)),7,4); x.fill(); });
 kdsTex.needsUpdate=true;
}

/* --- caméra --- */
function camOK(){ return isFinite(cam.dist)&&isFinite(cam.tx)&&isFinite(cam.tz)&&cam.dist>0; }
function updCam(){ if(!camOK()){ if(!(innerWidth>0&&innerHeight>0)) return; camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); cam.tx=S/2+.25; cam.tz=S/2+.7; cam.dist=fitDist()*.5; if(!camOK()) return; } const cp=Math.cos(cam.pitch); camera.position.set(cam.tx+cam.dist*cp*Math.sin(cam.yaw),cam.dist*Math.sin(cam.pitch),cam.tz+cam.dist*cp*Math.cos(cam.yaw)); camera.lookAt(cam.tx,0,cam.tz); }
function resize(){ if(!(innerWidth>0&&innerHeight>0)) return; renderer.setPixelRatio(PXR()); renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();  gfxResize(); }
function fitDist(){ const vf=FOV0*Math.PI/180, hf=2*Math.atan(Math.tan(vf/2)*innerWidth/innerHeight); const dw=(S*1.5)/(2*Math.tan(hf/2)), dh=(S*1.25+1.5)/(2*Math.tan(vf/2)); return Math.max(dw,dh)*1.05; }
function centerCam(){ if(!(innerWidth>0&&innerHeight>0)){ cam.dist=NaN; return; } camera.aspect=innerWidth/innerHeight; cam.tx=S/2+.25; cam.tz=S/2+.7; cam.dist=fitDist()*.5; updCam(); }

/* --- rendu --- */
let lastR=performance.now();
function render(){
 const now=performance.now(), dt=Math.min(.1,(now-lastR)/1000); lastR=now;
 const T=now/1000, n=nightF();
 const key=[state.tv||0,S,state.floor,state.wall,state.name,state.menu.join(),KR.x0,KR.y0,KR.w,KR.d,state.furn.filter(f=>['counter','dish','fridge'].includes(kindOf(f))).map(f=>f.x+','+f.y).join(';')].join('|');
 if(key!==statKey){ statKey=key; rebuildStatic(); viewStale=true; }
 if(cityKey!==S){ cityKey=S; cityRoot.traverse(o=>{ if(o.userData&&o.userData.own){ o.geometry&&o.geometry.dispose(); if(o.material&&o.material!==cityWin){ o.material.map&&o.material.map.dispose(); o.material.dispose(); } } }); cityRoot.clear(); buildCity(cityRoot); }
 cityWin.emissiveIntensity=.12+n*.85; bulbMat.emissiveIntensity=.5+n*2.2; cityGlass.emissiveIntensity=.04+n*.7;
 syncTerrace();
 tableItems=new Map(); readyAt=new Map(); cookAt=new Map(); cookInfo=new Map();
 for(const c of custs) if(c.st==='eat'&&c.table&&c.order){ const a=tableItems.get(c.table.id)||[]; a.push({e:DISHM[c.order.dish].e,dx:c.x-c.table.x,dz:c.y-c.table.y,pr:clamp(1-c.t/(c.eatT||8.5),0,.97)}); tableItems.set(c.table.id,a); }
 for(const o of orders) if(o.st==='ready'&&o.at){ const a=readyAt.get(o.at.id)||[]; a.push(DISHM[o.dish].e); readyAt.set(o.at.id,a); }
 for(const d of drinkOrders) if(d.st==='ready'&&d.at){ const a=readyAt.get(d.at.id)||[]; a.push({e:DRINKM[d.k].e,dr:1}); readyAt.set(d.at.id,a); }
 for(const c of custs) if(c.sitting&&c.table&&c.drinkOn&&(c.st==='wait'||c.st==='eat'||c.st==='done')){ const a=tableItems.get(c.table.id)||[]; const dx=c.x-c.table.x, dz=c.y-c.table.y; a.push({e:c.drinkOn,dr:1,dx:(dx*.22-dz*.2)/.24,dz:(dz*.22+dx*.2)/.24}); tableItems.set(c.table.id,a); }
 for(const a of crew) if(a.job&&a.job.s==='work'&&a.job.st){ const j=a.job, o=j.o, sp=o.steps&&o.steps[o.si]; cookAt.set(j.st.id,o.dish); cookInfo.set(j.st.id,{k:j.T?Math.min(1,Math.max(0,1-j.t/j.T)):0,fin:!!(sp&&sp.f),last:!!(o.steps&&o.si>=o.steps.length-1)}); }
 for(const a of crew) if(a.job&&(a.job.s==='mix'||a.job.s==='wash')&&a.job.st) cookAt.set(a.job.st.id,true);
 syncFurn(T,n); syncAgents(dt,T); agentRoot.visible=mode!=='edit'&&mode!=='show'; syncSmall(T); updEditVis(T);
 const vis=visit.on; staticRoot.visible=furnRoot.visible=cityRoot.visible=fxRoot.visible=!vis; agentRoot.visible=!vis&&mode!=='edit'; belRoot.visible=vis; if(vis) belUpdate(dt,T);
 for(const t of statAnim){ t.rotation.z=Math.sin(T*.8+t.userData.seed)*.015; }
 // jour / nuit
 hemi.intensity=.95-.7*n; scene.environmentIntensity=.25-.18*n; hemi.color.lerpColors(C_HEMI_D,C_HEMI_N,n);
 sun.intensity=3*(1-n)+.35*n; sun.color.lerpColors(C_SUN_D,C_SUN_N,n);
 scene.background.lerpColors(SKY_D,SKY_N,n); scene.fog.color.copy(scene.background);
 inLight.intensity=n*S*1.2;
 if(winMat){ winMat.emissive.set(n>.5?'#ffb35c':'#ffd79a'); winMat.emissiveIntensity=n>.5?1.1*n:.3; shaftMat.opacity=.16*(1-n); }
 for(const l of streetLights){ l.userData.L.intensity=n*10; l.userData.head.material.emissiveIntensity=n*2.5; }
 headMat.emissiveIntensity=.2+n*2.5;
 if(vis){ scene.background.set('#120f1a'); scene.fog.color.copy(scene.background); hemi.intensity=.42; hemi.color.set('#ffe2c0'); sun.intensity=.9; sun.color.set('#ffd9a8'); scene.environmentIntensity=.4; inLight.intensity=0; belLight.intensity=75; } else belLight.intensity=0;
 edgePan(dt); viewShift(dt); watchCam(dt); updCam(); doorSign(T); viewUpdate(); gfxRender(); updOverlay(); wallMarks(); momDraw(); cineTick(); try{ evFxTick(dt); lifeTick(dt,T); }catch(e){ console.warn(e); } if(vis) belHot(); updRail(dt); updHandle(); kdsT-=dt; if(kdsT<=0){ kdsT=.4; drawKDS(); }
}

/* --- entrées --- */
const ray=new THREE.Raycaster(), gPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0), _v2=new THREE.Vector2();
function groundAt(sx,sy){ _v2.set(sx/innerWidth*2-1,-(sy/innerHeight)*2+1); ray.setFromCamera(_v2,camera); const p=new THREE.Vector3(); return ray.ray.intersectPlane(gPlane,p)?p:null; }
function screenToGrid(sx,sy){ const p=groundAt(sx,sy); return p?[Math.floor(p.x),Math.floor(p.z)]:[-99,-99]; }
const ptrs=new Map(); let drag=null,pinch=null,moved=false,dragPt=null;
const pd=()=>{const [a,b]=[...ptrs.values()]; return Math.hypot(a.x-b.x,a.y-b.y);};
const pa=()=>{const [a,b]=[...ptrs.values()]; return Math.atan2(b.y-a.y,b.x-a.x);}, pcy=()=>{const [a,b]=[...ptrs.values()]; return (a.y+b.y)/2;};
function clampCam(){ if(visit.on){ cam.tx=clamp(cam.tx,1,BW-1); cam.tz=clamp(cam.tz,1,BD); const fd=belFit(); cam.dist=clamp(cam.dist,fd*.2,fd*.72); return; } cam.tx=clamp(cam.tx,-15,S+19); cam.tz=clamp(cam.tz,-6,S+19); const fd=fitDist(); cam.dist=clamp(cam.dist,Math.max(6,fd*.3),fd*1.6); }
const liftY=t=>t==='touch'?34:0;   // sur mobile, l'objet saisi apparaît au-dessus du doigt
function dragGhost(){ if(!dragPt) return; const g=screenToGrid(dragPt.x,dragPt.y-liftY(dragPt.t)); if(inRest(g[0],g[1])) ghost={x:g[0],y:g[1]}; }
function edgePan(dt){
 if(!odrag||!dragPt) return;
 const dock=$('#edock'), bot=(dock?dock.getBoundingClientRect().top:innerHeight)-24;
 let vx=0, vy=0; if(dragPt.x<44) vx=-1; else if(dragPt.x>innerWidth-44) vx=1; if(dragPt.y<96) vy=-1; else if(dragPt.y>bot) vy=1;
 if(!vx&&!vy) return;
 const sp=cam.dist*.35*dt, cy=Math.cos(cam.yaw), sy=Math.sin(cam.yaw);
 cam.tx+=(cy*vx+sy*vy)*sp; cam.tz+=(-sy*vx+cy*vy)*sp; clampCam(); updCam(); dragGhost();
}
cv.addEventListener('pointerdown',e=>{
 audioInit(); if(watch.on){ watchStop(); return; } try{cv.setPointerCapture(e.pointerId);}catch(_){}
 ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 holdStop(); if(ptrs.size===1&&mode==='play'&&!visit.on&&near(e.clientX,e.clientY,(DX+DXO+1)/2,1.02,S+.08,42)) holdStart(e.clientX,e.clientY);
 if(ptrs.size===1){ drag={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,orbit:e.button===2||e.shiftKey}; moved=false;
  if(mode==='edit'&&!placing&&sel){ const g=screenToGrid(e.clientX,e.clientY), f=pickFurn(e.clientX,e.clientY)||fAt(g[0],g[1]); if(f&&f===sel) drag.f=f; } }
 else if(ptrs.size===2){ pinch={d:pd(),dist:cam.dist,a:pa(),yaw:cam.yawT,cy:pcy(),pitch:cam.pitchT,rot:false,tilt:false}; moved=true; drag=null; if(odrag){ odrag=null; dragPt=null; ghost=null; editUI(); } }
});
cv.addEventListener('pointermove',e=>{
 if(!ptrs.has(e.pointerId)){ if(mode==='edit'&&(placing||sel)&&e.pointerType==='mouse'){ const g=screenToGrid(e.clientX,e.clientY); if(inRest(g[0],g[1])) ghost={x:g[0],y:g[1]}; } return; }
 ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&ptrs.size===2){ cam.dist=pinch.dist*pinch.d/pd();
  const da=angNorm(pa()-pinch.a), dy=pcy()-pinch.cy;   // deux doigts : tourner = pivoter la vue, glisser vers le haut ou le bas = incliner
  if(!pinch.rot&&Math.abs(da)>.12){ pinch.rot=true; pinch.a=pa(); pinch.yaw=cam.yawT; } else if(pinch.rot) cam.yaw=cam.yawT=pinch.yaw-angNorm(pa()-pinch.a);
  if(!pinch.tilt&&!pinch.rot&&Math.abs(dy)>26&&Math.abs(pinch.d-pd())<pinch.d*.12){ pinch.tilt=true; pinch.cy=pcy(); pinch.pitch=cam.pitchT; } else if(pinch.tilt) cam.pitch=cam.pitchT=clamp(pinch.pitch+(pcy()-pinch.cy)*.005,CAM_PMIN,CAM_PMAX);
  clampCam(); }
 else if(drag&&drag.orbit){ cam.yaw=cam.yawT=cam.yawT-(e.clientX-drag.lx)*.007; cam.pitch=cam.pitchT=clamp(cam.pitchT+(e.clientY-drag.ly)*.005,CAM_PMIN,CAM_PMAX); drag.lx=e.clientX; drag.ly=e.clientY; moved=true; }
 else if(drag){ if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>9){ moved=true; holdStop(); }
  if(moved&&drag.f){ if(!odrag){ odrag=drag.f; drag.f0=[drag.f.x,drag.f.y]; odrag0=drag.f0; sel=drag.f; const c=FURN[sel.t].cat; if(['Tables','Chaises','Cuisine','Déco','Bar'].includes(c)) etab=c; editUI(); } dragPt={x:e.clientX,y:e.clientY,t:e.pointerType}; dragGhost(); }
  else if(moved){ const a=groundAt(drag.lx,drag.ly), b=groundAt(e.clientX,e.clientY); if(a&&b){ cam.tx+=a.x-b.x; cam.tz+=a.z-b.z; clampCam(); updCam(); } drag.lx=e.clientX; drag.ly=e.clientY; } }
});
let odrag0=null;
function endPtr(e){
 if(!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); const held=holdDone; holdStop(); if(held){ holdDone=false; moved=true; }
 if(ptrs.size===0){
  if(odrag){ const f=odrag; odrag=null; dragPt=null; if(e.type==='pointerup'&&ghost){ if(moveFurn(f,ghost.x,ghost.y)&&odrag0&&(f.x!==odrag0[0]||f.y!==odrag0[1])) sel=null; } ghost=null; editUI(); }
  else if(!moved&&drag&&e.type==='pointerup') tap(e.clientX,e.clientY);
  drag=null; pinch=null; }
 else if(ptrs.size<2) pinch=null;
}
cv.addEventListener('pointerup',endPtr); cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{ if(ui.panel||e.target.tagName==='INPUT') return; if(e.key==='q'||e.key==='Q') rotView(-1); else if(e.key==='e'||e.key==='E') rotView(1); });
cv.addEventListener('wheel',e=>{ e.preventDefault(); cam.dist*=e.deltaY<0?.9:1.1; clampCam(); },{passive:false});
function near(sx,sy,x,y,z,r){ const [px,py,pz]=toScreen(x,y,z); return pz<1&&Math.hypot(px-sx,py-sy)<r; }
function tap(sx,sy){
 if(mode==='show') return;
 // le vaisselier d'Odette, adossé au mur : il passe avant le décor du quartier qui se trouve derrière lui à l'écran,
 // mais après les clients et les tables à débarrasser (le service d'abord)
 if(mode==='play'&&!visit.on&&!picked&&!cine){ const f=state.furn.find(f=>f.t==='odette');
  if(f&&(near(sx,sy,f.x+.5,.6,f.y+.5,30)||near(sx,sy,f.x+.5,1.15,f.y+.5,30))&&!custs.some(k=>!k.dead&&((k.st==='host'||(k.st==='look'&&k.seat))||(k.sitting&&k.table&&((k.st==='order'&&!k.orderBy)||(k.st==='bill'&&!k.billBy))))&&near(sx,sy,k.fx+.5,.55,k.fy+.5,40))&&![...dirty].some(([id,n])=>{ if(n<=0) return false; const t=state.furn.find(x=>x.id===id); return !!t&&near(sx,sy,t.x+.5,.42,t.y+.5,36); })){ sfx('pop'); openPanel('souvenirs'); return; } }
 try{ if(lifeTap(sx,sy)) return; }catch(e){}
 if(mode==='play'&&!visit.on&&!picked&&near(sx,sy,(DX+DXO+1)/2,1.02,S+.08,26)){ toast('Garde le doigt appuyé 2 secondes sur le panneau pour '+(isOpen()?'fermer':'ouvrir')+'.'); return; }
 if(visit.on){ $('#vcard').classList.add('hide'); visit.sel=null; return; }
 if(mode==='play'&&!picked&&city.ready&&near(sx,sy,S+7.2,1.5,S,Math.max(46,innerHeight*.07))){ enterVisit(); return; }
 const [gx,gy]=screenToGrid(sx,sy);
 if(mode==='edit'){ if(!placing&&!(etab==='sols'&&tileMode)){ const pf=pickFurn(sx,sy); if(pf&&!(sel&&pf!==sel&&!fAt(gx,gy)&&inRest(gx,gy)&&canPlace(gx,gy,sel,sel.t))) return editTap(pf.x,pf.y); } if(!placing&&!(etab==='sols'&&tileMode)&&!(inRest(gx,gy)&&fAt(gx,gy))){ const h=wallHit(sx,sy); if(h) return wallPick(h.sd,h.i); } return editTap(gx,gy); }
 if(picked&&(simT-picked.t>12||picked.o.cancel||picked.o.st!=='ready')) picked=null;
 if(picked){ const c=picked.o.c, hit=custs.find(k=>k.sitting&&k.table&&near(sx,sy,k.fx+.5,.6,k.fy+.5,42));
  if(hit===c){ if(!spendHelp()){ picked=null; return; } const it=picked.o; picked=null; if(it.k) serveDrink(it); else serve(it); it.w=null; sparkle(c.fx,c.fy,8); floatAt(c.fx,c.fy,'👍 +1 XP','#2f9e63'); addXP(1); return; }
  if(hit){ toast('Ce n’est pas sa commande…'); return; }
  picked=null; }
 // le joueur en salle : accueillir, prendre la commande, encaisser
 { const c=custs.find(k=>!k.dead&&((k.st==='host'||(k.st==='look'&&k.seat))||(k.sitting&&k.table&&((k.st==='order'&&!k.orderBy)||(k.st==='bill'&&!k.billBy))))&&near(sx,sy,k.fx+.5,.55,k.fy+.5,40));
  if(c){ const grp=c.grp?c.grp.m.filter(m=>!m.dead):[c];
   if(c.st==='host'||c.st==='look'){ if(!spendHelp()) return; grp.filter(m=>m.st==='host'||m.st==='look').forEach((m,i)=>goSeat(m,i*.4)); c.say='👋'; c.sayT=1; sfx('pop'); floatAt(c.fx,c.fy,'👍 +1 XP','#2f9e63'); addXP(1); return; }
   if(c.st==='order'){ const ps=grp.filter(m=>m.st==='order'&&!m.orderBy&&m.sitting); if(grp.some(m=>m.sitting&&m.st==='menu')){ toast('Ils n’ont pas encore choisi…'); return; } if(!spendHelp()) return; ps.forEach(m=>placeOrder(m)); sfx('send'); floatAt(c.fx,c.fy,'📝 +1 XP','#2f9e63'); addXP(1); return; }
   if(c.st==='bill'){ if(!spendHelp()) return; grp.filter(m=>m.st==='bill'&&!m.billBy).forEach(m=>finishMeal(m)); return; } } }
 for(const f of state.furn){ const k=kindOf(f); if(k!=='counter'&&k!=='bar') continue; if(!near(sx,sy,f.x+.5,.72,f.y+.5,38)) continue;
  const it=orders.find(o=>o.st==='ready'&&o.at===f&&!o.cancel)||drinkOrders.find(d=>d.st==='ready'&&d.at===f&&!d.cancel);
  if(it){ picked={o:it,t:simT}; sfx('pop'); toast((it.k?DRINKM[it.k].e:DISHM[it.dish].e)+' Touche maintenant le client qui l’attend'); return; } }
 for(const [id,n] of dirty){ if(n<=0) continue; const t=state.furn.find(f=>f.id===id); if(!t||!near(sx,sy,t.x+.5,.42,t.y+.5,36)) continue;
  if(tableOccupied(t)){ toast('Les clients sont encore à table'); return; }
  if(!spendHelp()) return;
  dirty.delete(id); freeSince.delete(id); cleaning.delete(id); sparkle(t.x,t.y,8,'#ffffff'); floatAt(t.x,t.y,'Propre ! +1 XP','#2f9e63'); addXP(1); sfx('pop'); return; }
 for(const f of state.furn) if(f.t==='odette'&&(near(sx,sy,f.x+.5,.6,f.y+.5,34)||near(sx,sy,f.x+.5,1.15,f.y+.5,34))){ sfx('pop'); openPanel('souvenirs'); return; }
 for(const f of state.furn) if(kindOf(f)==='jukebox'&&near(sx,sy,f.x+.5,.5,f.y+.5,40)){ setTrack((state.track||0)+(state.music===false?0:1),f); sfx('pop'); return; }
 for(const it of items){ if(near(sx,sy,it.x+.5,.45,it.y+.5,38)){ state.inv[it.k]=(state.inv[it.k]||0)+1; items=items.filter(i=>i!==it); floatAt(it.x,it.y,'+1 '+ING[it.k].e,'#2f9e63'); sparkle(it.x,it.y,6); toast('Tu as trouvé : '+ING[it.k].e+' '+ING[it.k].n+' !'); sfx('pop'); return; } }
 for(const t of trash){ if(near(sx,sy,t.x+.5,.13,t.y+.5,32)){ trash=trash.filter(x=>x!==t); if(t.tg&&t.tg.job&&t.tg.job.t===t) t.tg.job=null; floatAt(t.x,t.y,'Propre ! +1 XP','#2f9e63'); addXP(1); sfx('pop'); return; } }
 for(const a of crew){ if(near(sx,sy,a.fx+.5,.55,a.fy+.5,30)){ toast(ROLES[a.s.role].e+' '+a.s.name+' — '+ROLES[a.s.role].n+' niv. '+staffLv(a.s)); return; } }
 for(const c of custs){ if(c.st==='wait'&&near(sx,sy,c.fx+.5,.55,c.fy+.5,30)){ toast('Ce client attend : '+DISHM[c.order.dish].e+' '+DISHM[c.order.dish].n); return; } }
}

/* --- vignettes boutique --- */
let thumbsReady=false;
function makeThumbs(){ const g=makeThumbsGen(); let auto=false; try{ auto=!!navigator.webdriver; }catch(e){}
 const fin=()=>{ thumbsReady=true; try{ icoRe=null; }catch(e){} try{ if(typeof hud==='function'&&state) hud(); }catch(e){} };
 if(auto){ try{ for(const _ of g){} }catch(e){ console.warn(e); } return fin(); }
 const step=()=>{ const t0=performance.now(); try{ while(performance.now()-t0<16){ if(g.next().done) return fin(); } }catch(e){ console.warn(e); return fin(); } setTimeout(step,4); }; step(); }
function* makeThumbsGen(){
 try{ portraitsInit(); }catch(e){}
 const TS=LITE?112:192, c=document.createElement('canvas'); c.width=c.height=TS; let r;
 try{ r=new THREE.WebGLRenderer({canvas:c,antialias:!LITE,alpha:true,preserveDrawingBuffer:true}); }catch(e){ return; }
 r.outputColorSpace=SRGB; r.toneMapping=THREE.ACESFilmicToneMapping; r.setPixelRatio(1); r.setSize(TS,TS,false); yield;
 const sc=new THREE.Scene(); { const pm=new THREE.PMREMGenerator(r); sc.environment=pm.fromScene(new RoomEnvironment(),.04).texture; sc.environmentIntensity=.6; } sc.add(new THREE.HemisphereLight(0xfff8ee,0xb89a7a,1.6)); const d=new THREE.DirectionalLight(0xffffff,2.2); d.position.set(-2,4,3); sc.add(d);
 const cm=new THREE.PerspectiveCamera(26,1,.05,50), box=new THREE.Box3(), cen=new THREE.Vector3(), sz=new THREE.Vector3();
 for(const k in FURN){ const g=buildFurn(k,null); g.traverse(o=>{ if(o.isSprite) o.visible=false; }); sc.add(g); box.setFromObject(g); box.getCenter(cen); box.getSize(sz);
  const rad=sz.length()/2, dist=rad/Math.sin(13*Math.PI/180)*1.02; cm.position.set(cen.x+dist*.55,cen.y+dist*.5,cen.z+dist*.67); cm.lookAt(cen); r.render(sc,cm); thumbs[k]=c.toDataURL(); sc.remove(g); yield; }
 // vignettes des plats et boissons (utilisées dans les bulles, le carnet de commandes et les menus)
 { const em=new Map([['pot','🥘']]); for(const d of DISH) em.set(d.id,d.e); for(const d of DRINKS) em.set(d.id,d.e);
  for(const id in FOOD_BUILD){ const e=em.get(id), p=e&&foodProto(e); if(!p) continue; const g=new THREE.Group(); const o=p.clone(true); g.add(o);
   if(DISHM[id]){ g.add(mesh(CY(.125,.09,.02,24),M('#ffffff',{roughness:.3}),0,-.011,0,false)); }
   sc.add(g); box.setFromObject(g); box.getCenter(cen); box.getSize(sz);
   const rad=sz.length()/2, dist=rad/Math.sin(13*Math.PI/180)*.92; cm.position.set(cen.x+dist*.25,cen.y+dist*.8,cen.z+dist*.55); cm.lookAt(cen); r.render(sc,cm); foodThumbs[e]=c.toDataURL(); sc.remove(g); yield; } }
 try{ const bx=new THREE.Box3(), cn=new THREE.Vector3(), sz2=new THREE.Vector3(); if(!winMat) winMat=new THREE.MeshStandardMaterial({color:'#ffe7c2',roughness:.08,emissive:'#ffd79a',emissiveIntensity:.35}); for(const k in WOBJ){ const o=wallObj3D(k); if(!o) continue; sc.add(o); bx.setFromObject(o); bx.getCenter(cn); bx.getSize(sz2); const d=sz2.length()/2/Math.sin(13*Math.PI/180)*1.05; cm.position.set(cn.x+d*.3,cn.y+d*.18,cn.z+d*.93); cm.lookAt(cn); r.render(sc,cm); thumbs['wo:'+k]=c.toDataURL(); sc.remove(o); yield; } }catch(e){}
 yield; try{ gourmetThumbs(r,sc,cm,c); }catch(e){}
 yield; r.dispose(); if(r.forceContextLoss) r.forceContextLoss();
}

/* --- l'écriteau « Ouvert / Fermé » suspendu à l'auvent : on le touche pour ouvrir ou fermer --- */
let signG=null, signP=null, signState=null;
const openSignTex=(open)=>canvasTex(256,112,(x)=>{ x.fillStyle=open?'#2f9e63':'#c8423a'; rrect(x,4,4,248,104,22); x.fill(); x.strokeStyle='#fff6e0'; x.lineWidth=7; rrect(x,10,10,236,92,17); x.stroke(); x.fillStyle='#fff6e0'; x.font='700 54px Fredoka, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(open?'OUVERT':'FERMÉ',128,60); });
function doorSign(T){
 if(!signG){ signG=new THREE.Group(); const wood=M('#7a4a26',{roughness:.6}); signG.add(mesh(new THREE.BoxGeometry(.7,.34,.04),wood,0,0,0)); signG.add(mesh(new THREE.BoxGeometry(.76,.05,.07),M('#5e3719'),0,.19,0));
  const mk=(open)=>{ const m=new THREE.MeshBasicMaterial({map:openSignTex(open),transparent:true}); const a=new THREE.Mesh(new THREE.PlaneGeometry(.65,.285),m), b=a.clone(); a.position.z=.022; b.position.z=-.022; b.rotation.y=Math.PI; const g=new THREE.Group(); g.add(a,b); return g; };
  signG.userData={o:mk(true),c:mk(false)}; signG.add(signG.userData.o,signG.userData.c); scene.add(signG); signP=mesh(CY(.03,.035,.9,8),M('#5e3719',{roughness:.6}),0,.45,0); scene.add(signP); }
 const o=isOpen(); if(o!==signState){ signState=o; signG.userData.o.visible=o; signG.userData.c.visible=!o; signG.userData.t=T; }
 const k=Math.max(0,1-(T-(signG.userData.t||0))/1.2);
 const sx=(DX+DXO+1)/2; signG.scale.setScalar(1.3); signG.visible=signP.visible=!visit.on&&mode!=='edit'&&Math.cos(cam.yaw)>-.03; signP.position.set(sx,.45,S+.02); signG.position.set(sx,1.04,S+.08); signG.rotation.y=Math.sin(T*14)*.45*k*k; signG.rotation.z=Math.sin(T*1.3)*.015;
}

/* --- objets muraux : fenêtres, tableaux, miroir, horloge, étagère, applique, enseigne, ardoise --- */
function wallObj3D(t){
 const white=M('#fffaf3',{roughness:.5}), gold=M('#c79a52',{roughness:.4,metalness:.3}), g=new THREE.Group();
 if(t==='win') return makeWindow();
 if(t==='winR'){ const fr=mesh(TO(.31,.045,12,28),white,0,0,.02,false); g.add(fr); g.add(mesh(CY(.3,.3,.02,28).clone().rotateX(Math.PI/2),winMat,0,0,.012,false)); g.add(mesh(new THREE.BoxGeometry(.03,.6,.03),white,0,0,.03,false)); g.add(mesh(new THREE.BoxGeometry(.6,.03,.03),white,0,0,.03,false)); return g; }
 if(t==='winA'){ g.add(mesh(RB(.66,.5,.06,.02),white,0,-.1,0,false)); g.add(mesh(new THREE.BoxGeometry(.54,.42,.02),winMat,0,-.1,.025,false)); const top=mesh(CY(.33,.33,.06,24,1,false,0,Math.PI).clone().rotateX(Math.PI/2).rotateZ(Math.PI/2),white,0,.15,0,false); g.add(top); g.add(mesh(CY(.27,.27,.03,24,1,false,0,Math.PI).clone().rotateX(Math.PI/2).rotateZ(Math.PI/2),winMat,0,.15,.02,false)); g.add(mesh(new THREE.BoxGeometry(.035,.7,.03),white,0,0,.04,false)); g.add(mesh(new THREE.BoxGeometry(.54,.035,.03),white,0,.1,.04,false)); g.add(mesh(RB(.8,.05,.1,.02),white,0,-.37,.03,false)); return g; }
 if(/^art/.test(t)){ const c=['#7fc8a9','#f6a5a5','#9bb7f0','#ffd58a'][+t[3]||0]; g.add(mesh(RB(.5,.4,.04,.01),gold,0,0,0,false)); g.add(mesh(new THREE.BoxGeometry(.4,.3,.01),M(c),0,0,.02,false)); g.add(mesh(SP(.06),M('#ffffff'),.05,.03,.025,false)); g.add(mesh(new THREE.BoxGeometry(.4,.1,.012),M(shade(c,-.25)),0,-.1,.021,false)); return g; }
 if(t==='mirror'){ const fr=mesh(TO(.27,.04,10,28),M('#d9b24a',{metalness:.8,roughness:.25}),0,0,.02,false); fr.scale.y=1.3; g.add(fr); const gl=mesh(CY(.26,.26,.02,28).clone().rotateX(Math.PI/2),M('#cfe6ee',{metalness:.9,roughness:.08}),0,0,.012,false); gl.scale.y=1.3; g.add(gl); return g; }
 if(t==='clock'){ g.add(mesh(CY(.26,.26,.05,28).clone().rotateX(Math.PI/2),M('#3e2a1c',{roughness:.5}),0,0,.02,false)); g.add(mesh(CY(.22,.22,.052,28).clone().rotateX(Math.PI/2),M('#fffaf0',{roughness:.6}),0,0,.022,false)); for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; add(g,mesh(new THREE.BoxGeometry(.012,k%3?.025:.045,.01),M('#3e2a1c'),Math.sin(a)*.18,Math.cos(a)*.18,.05,false)).rotation.z=-a; } const h1=mesh(new THREE.BoxGeometry(.016,.12,.012),M('#3e2a1c'),.03,.04,.055,false); h1.rotation.z=-.65; g.add(h1); const h2=mesh(new THREE.BoxGeometry(.012,.17,.012),M('#c8423a'),-.035,.06,.058,false); h2.rotation.z=.55; g.add(h2); g.add(mesh(SP(.02,8,6),gold,0,0,.06,false)); return g; }
 if(t==='shelf'){ g.add(mesh(RB(.72,.04,.2,.012),M('#b8743f',{roughness:.55}),0,-.12,.1,false)); for(const s of [-1,1]) g.add(mesh(new THREE.BoxGeometry(.03,.12,.14),M('#8a5730'),s*.28,-.2,.07,false)); for(const [x,c,h] of [[-.2,'#5fa84f',.16],[.03,'#7fc46a',.11],[.23,'#4a9a3c',.14]]){ g.add(mesh(CY(.05,.04,.08,10),M('#c8553d',{roughness:.8}),x,-.06,.1,false)); const l=mesh(IC(.07,0),M(c,{flatShading:true,roughness:.8}),x,.02+h*.3,.1,false); l.scale.y=h/.1; g.add(l); } g.userData.y=.95; return g; }
 if(t==='lampW'){ g.add(mesh(CY(.05,.05,.02,12).clone().rotateX(Math.PI/2),gold,0,0,.012,false)); const arm=mesh(CY(.012,.012,.14,6),gold,0,.03,.08,false); arm.rotation.x=1.1; g.add(arm); g.add(mesh(CY(.09,.05,.11,14),M('#fff1c9',{emissive:'#ffd98a',emissiveIntensity:1.1,roughness:.6}),0,.1,.15,false)); g.userData.y=1.02; return g; }
 if(/^sign/.test(t)){ const st=t.slice(4), neon=st==='N'; const m=ownMesh(new THREE.PlaneGeometry(1.9,.48),new THREE.MeshStandardMaterial(Object.assign({map:signTex(st),transparent:true,roughness:.5},neon?{emissive:'#ffffff',emissiveMap:signTex(st),emissiveIntensity:.9}:{})),0,0,.024,false); g.add(m); g.userData.y=1.02; return g; }
 if(WALL3D[t]) return WALL3D[t](g,white,gold);
 if(t==='board'){ const m=ownMesh(new THREE.PlaneGeometry(1.25,.78),new THREE.MeshStandardMaterial({map:boardTex(),roughness:.8}),0,0,.024,false); g.add(m); return g; }
 return null;
}
// en mode Déco, onglet Murs : des ronds sur chaque pan de mur libre, à toucher pour accrocher ou retirer
const wallEls=[];
function wallMarks(){
 let box=document.getElementById('wov'); const on=mode==='edit'&&(etab==='murs'||!!wslot)&&!ui.panel;
 if(!on){ if(box&&box.style.display!=='none') box.style.display='none'; return; }
 if(!box){ box=document.createElement('div'); box.id='wov'; document.body.appendChild(box); box.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; audioInit(); if(wsel){ wallSet(b.dataset.s,+b.dataset.i,wsel==='x'?null:wsel); editUI(); } else wallPick(b.dataset.s,+b.dataset.i); }); }
 box.style.display='';
 const L=wallLayout(); let n=0;
 for(const sd of ['N','W']) for(let i=0;i<S;i++){ if(!wallSlotOK(sd,i)) continue; const isSel=!!wslot&&wslot.sd===sd&&wslot.i===i; if(wsel==='x'&&!L[sd][i]) continue; if(!wsel&&L[sd][i]&&!isSel) continue; if(!wsel&&wslot&&!isSel) continue; let el=wallEls[n]; if(!el){ el=document.createElement('button'); el.className='whot'; box.appendChild(el); wallEls[n]=el; } n++;
  const hy=isSel?.98:1.42, p=sd==='N'?toScreen(i+.5,hy,.02):toScreen(.02,hy,i+.5), hw=isSel?17:12; el.style.display=''; el.style.transform=`translate(${p[0]-hw}px,${p[1]-hw}px)`; el.dataset.s=sd; el.dataset.i=i; el.classList.toggle('has',!!L[sd][i]&&!isSel); el.classList.toggle('sel',isSel); el.textContent=isSel?'':wsel==='x'?'×':L[sd][i]?'↺':'+'; }
 for(let k=n;k<wallEls.length;k++) wallEls[k].style.display='none';
}

/* --- petits déchets au sol, en volume : peau de banane, serviette froissée, gobelet renversé, feuilles mortes --- */
const LIT={};
function litter3D(t){
 const g=new THREE.Group(), r=seeded(t.id*13+5), k={'🍌':0,'🧻':1,'🥤':2,'🍂':3}[t.e]??Math.floor(r()*4);
 const m=(c,o)=>LIT[c]||(LIT[c]=M(c,Object.assign({roughness:.8},o||{})));
 if(k===0){ // peau de banane : un bout de tige et quatre pans retombés
  g.add(mesh(CY(.016,.022,.05,8),m('#6b4a1e'),0,.085,0));
  for(let i=0;i<4;i++){ const a=i*Math.PI/2+.3, p=new THREE.Group(); p.rotation.y=a;
   const up=mesh(RB(.05,.07,.02,.008),m('#f4cf3a'),.018,.045,0); up.rotation.z=-.35; p.add(up);
   const fl=mesh(RB(.13,.018,.066,.008),m('#f4cf3a'),.085,.012,0); fl.rotation.z=-.12; p.add(fl);
   const inn=mesh(RB(.115,.006,.046,.002),m('#fff3c4'),.085,.023,0,false); inn.rotation.z=-.12; p.add(inn);
   p.add(mesh(SP(.012,8,6),m('#5a3d18'),.15,.012,0,false)); g.add(p); }
 } else if(k===1){ // serviette en papier froissée
  for(let i=0;i<5;i++){ const b=mesh(IC(.045,0),m('#fbf7ee',{flatShading:true,roughness:.95}),(r()-.5)*.07,.035+r()*.03,(r()-.5)*.07); b.rotation.set(r()*3,r()*3,r()*3); b.scale.set(.8+r()*.6,.6+r()*.5,.8+r()*.6); g.add(b); }
  const fl=mesh(RB(.11,.006,.09,.002),m('#f3eee2'),.05,.006,.03,false); fl.rotation.y=.6; g.add(fl);
 } else if(k===2){ // gobelet renversé, couvercle, paille et petite flaque
  const cup=new THREE.Group(); cup.add(mesh(CY(.045,.034,.12,16),m('#fdfdfb',{roughness:.5}),0,0,0)); cup.add(mesh(CY(.0465,.041,.045,16),m('#e2574c',{roughness:.5}),0,.005,0,false)); cup.add(mesh(CY(.05,.05,.014,16),m('#ffffff',{roughness:.4}),0,.064,0));
  const st=mesh(CY(.006,.006,.11,6),m('#e2574c'),.012,.11,0); st.rotation.z=-.25; cup.add(st);
  cup.rotation.z=Math.PI/2; cup.position.set(-.03,.046,0); g.add(cup);
  const pd=mesh(CY(.085,.085,.004,20),m('#c98a4b',{roughness:.15,transparent:true,opacity:.75}),.085,.003,.01,false); pd.scale.set(1.2,1,.8); g.add(pd);
  g.add(mesh(CY(.03,.03,.004,12),m('#c98a4b',{roughness:.15,transparent:true,opacity:.75}),.17,.003,-.04,false));
 } else { // feuilles mortes
  const cols=['#c8642a','#d99a2b','#a6492a'];
  for(let i=0;i<3;i++){ const lf=new THREE.Group(), c=m(cols[i],{roughness:.9,side:THREE.DoubleSide});
   const a=mesh(SP(.05,10,6),c,0,0,0); a.scale.set(1.25,.07,.62); lf.add(a); const b=mesh(SP(.03,8,6),c,.055,0,0,false); b.scale.set(1.2,.07,.5); lf.add(b);
   const n=mesh(CY(.004,.004,.15,5),m('#6b3d1a'),.0,.004,0,false); n.rotation.z=Math.PI/2; lf.add(n);
   lf.scale.setScalar(1.7); lf.position.set((r()-.5)*.26,.014+i*.008,(r()-.5)*.26); lf.rotation.set((r()-.5)*.5,r()*6.3,(r()-.5)*.4); g.add(lf); }
 }
 g.rotation.y=r()*6.3; g.scale.setScalar(1.55); return g;
}

/* ===== v0.52 : enseignes de style, nouveaux objets muraux, nouveaux objets de salle ===== */
function signStyle(x,st){ const n=state.name.slice(0,16); x.textAlign='center'; x.textBaseline='middle';
 if(st==='Z'){ x.fillStyle='#1d1d22'; rrect(x,4,4,504,120,6); x.fill(); x.fillStyle='#c8423a'; x.beginPath(); x.arc(64,64,34,0,7); x.fill(); x.fillStyle='#f3ecd8'; x.font='600 58px '+FONT; x.fillText(n,286,68); x.fillStyle='#c8423a'; x.fillRect(4,112,504,8); return; }
 if(st==='I'){ x.fillStyle='#4a5560'; rrect(x,4,4,504,120,6); x.fill(); x.strokeStyle='#2b2f36'; x.lineWidth=6; rrect(x,10,10,492,108,4); x.stroke(); for(const [a,b] of [[24,24],[488,24],[24,104],[488,104]]){ x.fillStyle='#c9ced4'; x.beginPath(); x.arc(a,b,7,0,7); x.fill(); } x.fillStyle='#f2b33d'; x.font='700 60px '+FONT; x.fillText(n.toUpperCase(),256,68); return; }
 if(st==='S'){ x.fillStyle='#f4f8fb'; rrect(x,4,4,504,120,60); x.fill(); x.strokeStyle='#2f6f9f'; x.lineWidth=7; rrect(x,10,10,492,108,54); x.stroke(); x.fillStyle='#2f6f9f'; x.font='700 58px '+FONT; x.fillText(n,256,62); x.strokeStyle='#9cc4e4'; x.lineWidth=4; x.beginPath(); for(let i=0;i<8;i++){ x.moveTo(140+i*30,100); x.quadraticCurveTo(147+i*30,92,155+i*30,100); x.quadraticCurveTo(162+i*30,108,170+i*30,100); } x.stroke(); return; }
 if(st==='G'){ x.fillStyle='#3f8f5a'; rrect(x,4,4,504,120,34); x.fill(); x.strokeStyle='#fff6d6'; x.lineWidth=4; x.setLineDash([10,8]); rrect(x,16,16,480,96,24); x.stroke(); x.setLineDash([]); x.fillStyle='#fff6d6'; x.font='700 60px '+FONT; x.fillText(n,256,68); for(const a of [44,468]){ x.fillStyle='#ffd23f'; x.beginPath(); x.arc(a,64,10,0,7); x.fill(); } return; }
 if(st==='L'){ x.fillStyle='#5a1826'; rrect(x,4,4,504,120,10); x.fill(); x.strokeStyle='#e0bd5a'; x.lineWidth=5; rrect(x,14,14,484,100,6); x.stroke(); x.lineWidth=2; rrect(x,24,24,464,80,3); x.stroke(); x.fillStyle='#f0d27a'; x.font='600 56px '+FONT; x.fillText(n,256,62); x.font='600 15px '+FONT; x.fillText('★ ★ ★',256,98); return; }
 if(st==='N'){ x.fillStyle='#1d1830'; rrect(x,4,4,504,120,26); x.fill(); x.strokeStyle='#ff5fa8'; x.lineWidth=6; x.shadowColor='#ff5fa8'; x.shadowBlur=18; rrect(x,16,16,480,96,20); x.stroke(); x.fillStyle='#ffe3f1'; x.shadowColor='#ff3f98'; x.shadowBlur=22; x.font='600 62px '+FONT; x.fillText(n,256,68); x.fillText(n,256,68); x.shadowBlur=0; }
 else if(st==='W'){ x.fillStyle='#8a5a30'; rrect(x,4,10,504,108,10); x.fill(); for(let i=0;i<4;i++){ x.fillStyle=i%2?'#9a6a3c':'#7c4f29'; x.fillRect(8,14+i*26,496,24); } x.strokeStyle='rgba(50,28,10,.5)'; x.lineWidth=2; for(let i=1;i<4;i++){ x.beginPath(); x.moveTo(8,13+i*26); x.lineTo(504,13+i*26); x.stroke(); } for(const [a,b] of [[26,30],[486,30],[26,98],[486,98]]){ x.fillStyle='#3a2414'; x.beginPath(); x.arc(a,b,6,0,7); x.fill(); } x.fillStyle='#fff3d6'; x.font='700 62px '+FONT; x.fillText(n,256,68); }
 else if(st==='B'){ x.fillStyle='#15171c'; rrect(x,4,4,504,120,8); x.fill(); x.strokeStyle='#d9b24a'; x.lineWidth=4; rrect(x,14,14,484,100,4); x.stroke(); x.lineWidth=1.5; rrect(x,22,22,468,84,2); x.stroke(); x.fillStyle='#e9c96a'; x.font='600 58px '+FONT; x.fillText(n.toUpperCase(),256,60); x.font='600 17px '+FONT; x.fillText('• BISTROT •',256,100); }
 else if(st==='R'){ for(let i=0;i<12;i++){ x.fillStyle=i%2?'#fff6e6':'#d8453a'; x.fillRect(4+i*42,4,42,120); } x.fillStyle='#fffaf0'; rrect(x,46,26,420,76,38); x.fill(); x.strokeStyle='#b52f26'; x.lineWidth=4; rrect(x,46,26,420,76,38); x.stroke(); x.fillStyle='#b52f26'; x.font='700 54px '+FONT; x.fillText(n,256,66); }
}
const WALL3D={
 scroll(g){ const t=canvasTex(96,224,(x)=>{ x.fillStyle='#f3ecd8'; x.fillRect(0,0,96,224); x.fillStyle='#c8423a'; x.beginPath(); x.arc(48,54,22,0,7); x.fill(); x.strokeStyle='#1d1d22'; x.lineWidth=7; x.lineCap='round'; x.beginPath(); x.moveTo(26,104); x.lineTo(70,104); x.moveTo(48,92); x.lineTo(48,170); x.moveTo(30,134); x.lineTo(66,134); x.moveTo(34,176); x.quadraticCurveTo(48,196,66,172); x.stroke(); }); g.add(ownMesh(new THREE.PlaneGeometry(.32,.76),new THREE.MeshStandardMaterial({map:t,roughness:.9}),0,0,.014,false)); for(const y of [.39,-.39]) g.add(mesh(CY(.018,.018,.38,8).clone().rotateZ(Math.PI/2),M('#3a2a1f'),0,y,.02,false)); return g; },
 fan(g){ for(let i=0;i<9;i++){ const a=(i-4)*.2, b=mesh(new THREE.BoxGeometry(.075,.34,.008),M(i%2?'#c8423a':'#f3ecd8',{roughness:.8}),Math.sin(a)*.2,-.16+Math.cos(a)*.2,.012+i*.001,false); b.rotation.z=-a; g.add(b); } g.add(mesh(SP(.03,8,6),M('#d9b24a',{metalness:.7}),0,-.16,.03,false)); return g; },
 pipes(g){ const m=M('#3a3f47',{metalness:.7,roughness:.35}); for(const y of [-.14,.14]){ g.add(mesh(RB(.8,.03,.18,.008),M('#7a5230',{roughness:.6}),0,y,.09,false)); for(const x of [-.32,.32]){ g.add(mesh(CY(.016,.016,.16,8).clone().rotateX(Math.PI/2),m,x,y-.03,.08,false)); g.add(mesh(CY(.03,.03,.012,10).clone().rotateX(Math.PI/2),m,x,y-.03,.008,false)); } } for(const [x,c] of [[-.2,'#c8553d'],[0,'#e9e2d2'],[.2,'#3f6b3a']]) g.add(mesh(CY(.04,.035,.1,10),M(c),x,.205,.09,false)); g.add(mesh(RB(.2,.1,.12,.01),M('#f2b33d'),.1,-.075,.09,false)); return g; },
 clockI(g){ const m=M('#2b2f36',{metalness:.6,roughness:.4}); g.add(mesh(CY(.34,.34,.05,28).clone().rotateX(Math.PI/2),m,0,0,.025,false)); g.add(mesh(CY(.3,.3,.052,28).clone().rotateX(Math.PI/2),M('#e9e2d2',{roughness:.7}),0,0,.027,false)); for(let k=0;k<12;k++){ const a=k/12*Math.PI*2, b=mesh(new THREE.BoxGeometry(.02,.07,.01),m,Math.sin(a)*.24,Math.cos(a)*.24,.056,false); b.rotation.z=-a; g.add(b); } const h1=mesh(new THREE.BoxGeometry(.024,.16,.012),m,.04,.055,.06,false); h1.rotation.z=-.62; g.add(h1); const h2=mesh(new THREE.BoxGeometry(.016,.24,.012),m,-.06,.085,.063,false); h2.rotation.z=.6; g.add(h2); return g; },
 buoy(g){ const r=mesh(TO(.22,.07),M('#fffaf2',{roughness:.6}),0,0,.07,false); g.add(r); for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4, b=mesh(TO(.22,.072,.5),M('#e2574c',{roughness:.6}),0,0,.07,false); b.rotation.z=a-.25; g.add(b); } return g; },
 winS(g,white){ g.add(makeWindow()); const sh=M('#3f8f7a',{roughness:.6}); for(const s of [-1,1]){ g.add(mesh(RB(.2,.74,.035,.01),sh,s*.42,0,.03,false)); for(let k=0;k<6;k++) g.add(mesh(new THREE.BoxGeometry(.16,.02,.02),M('#327564'),s*.42,-.28+k*.11,.052,false)); } return g; },
 winV(g,white){ g.add(mesh(RB(.66,.78,.06,.02),M('#4a3423',{roughness:.5}),0,0,0,false)); const cs=['#e2574c','#f2b33d','#3f9bd6','#57b86a','#b06fd8','#f28a3d']; let n=0; for(let r=0;r<3;r++) for(let c=0;c<2;c++){ g.add(mesh(new THREE.BoxGeometry(.25,.21,.02),M(cs[n%6],{roughness:.15,emissive:cs[n%6],emissiveIntensity:.35}),-.135+c*.27,-.235+r*.235,.03,false)); n++; } return g; },
 plates(g){ for(const [x,y,r,c] of [[-.2,.08,.13,'#3f7fbf'],[.12,.16,.1,'#c8553d'],[.14,-.14,.12,'#3f9a6a']]){ g.add(mesh(CY(r,r,.02,24).clone().rotateX(Math.PI/2),M('#fffaf0',{roughness:.25}),x,y,.014,false)); g.add(mesh(TO(r*.72,.012),M(c),x,y,.026,false)); g.add(mesh(CY(r*.3,r*.3,.022,16).clone().rotateX(Math.PI/2),M(c),x,y,.016,false)); } return g; },
 pans(g,white,gold){ const cu=M('#c9773f',{metalness:.75,roughness:.3}); g.add(mesh(new THREE.BoxGeometry(.8,.03,.03),M('#3a3f47',{metalness:.5}),0,.26,.04,false)); for(const [x,r] of [[-.27,.11],[0,.14],[.28,.1]]){ g.add(mesh(new THREE.BoxGeometry(.02,.2,.012),cu,x,.15,.04,false)); g.add(mesh(CY(r,r*.85,.045,22).clone().rotateX(Math.PI/2),cu,x,-.02-r*.3,.05,false)); g.add(mesh(CY(r*.84,r*.7,.03,22).clone().rotateX(Math.PI/2),M('#8a4a22',{metalness:.5,roughness:.5}),x,-.02-r*.3,.07,false)); } return g; },
 bottles(g){ const w=M('#7a4a26',{roughness:.6}); for(const y of [-.2,.1]){ g.add(mesh(RB(.8,.035,.17,.01),w,0,y,.085,false)); let k=0; for(let x=-.32;x<=.33;x+=.13){ const c=['#3f6b3a','#7a2233','#2f4f6f','#c9a13a','#4a2a1a'][k++%5]; g.add(mesh(CY(.035,.035,.14,10),M(c,{roughness:.2}),x,y+.09,.085,false)); g.add(mesh(CY(.013,.02,.07,8),M(c,{roughness:.2}),x,y+.195,.085,false)); } } return g; },
 poster1(g){ const t=canvasTex(160,224,(x)=>{ x.fillStyle='#f3e3c0'; x.fillRect(0,0,160,224); x.fillStyle='#d8453a'; x.beginPath(); x.arc(80,84,52,0,7); x.fill(); x.fillStyle='#fff6e0'; x.beginPath(); x.arc(80,84,34,0,7); x.fill(); x.fillStyle='#3a2a1f'; x.fillRect(58,76,44,26); x.fillRect(102,82,10,12); x.font='700 25px '+FONT; x.textAlign='center'; x.fillText('CAFÉ',80,172); x.font='600 13px '+FONT; x.fillText('depuis 1952',80,196); x.strokeStyle='#3a2a1f'; x.lineWidth=4; x.strokeRect(6,6,148,212); }); g.add(mesh(RB(.5,.68,.03,.006),M('#3a2a1f'),0,0,0,false)); g.add(ownMesh(new THREE.PlaneGeometry(.46,.64),new THREE.MeshStandardMaterial({map:t,roughness:.8}),0,0,.017,false)); return g; },
 poster2(g){ const t=canvasTex(160,224,(x)=>{ const gr=x.createLinearGradient(0,0,0,224); gr.addColorStop(0,'#2f6f8f'); gr.addColorStop(.6,'#f2b98a'); gr.addColorStop(1,'#e2804c'); x.fillStyle=gr; x.fillRect(0,0,160,224); x.fillStyle='#fff3c4'; x.beginPath(); x.arc(112,70,24,0,7); x.fill(); x.fillStyle='#27455a'; x.beginPath(); x.moveTo(0,150); x.lineTo(50,96); x.lineTo(92,140); x.lineTo(124,112); x.lineTo(160,150); x.lineTo(160,224); x.lineTo(0,224); x.fill(); x.fillStyle='#fff6e0'; x.font='700 22px '+FONT; x.textAlign='center'; x.fillText('RIVIERA',80,196); }); g.add(mesh(RB(.5,.68,.03,.006),M('#c79a52',{metalness:.3}),0,0,0,false)); g.add(ownMesh(new THREE.PlaneGeometry(.46,.64),new THREE.MeshStandardMaterial({map:t,roughness:.8}),0,0,.017,false)); return g; },
 neon(g){ const n=M('#ff7ab8',{emissive:'#ff3f98',emissiveIntensity:1.6,roughness:.4}), b=M('#7fe0ff',{emissive:'#3fc8ff',emissiveIntensity:1.6,roughness:.4}); g.add(mesh(RB(.62,.56,.02,.01),M('#22202b'),0,0,0,false)); g.add(mesh(TO(.13,.016,Math.PI).clone().rotateZ(Math.PI),n,-.03,-.02,.03,false)); g.add(mesh(new THREE.BoxGeometry(.3,.022,.022),n,-.03,-.02,.03,false)); g.add(mesh(TO(.06,.014,Math.PI).clone().rotateZ(-Math.PI/2),n,.12,-.07,.03,false)); for(const x of [-.1,-.03,.04]){ const st=mesh(new THREE.BoxGeometry(.016,.1,.016),b,x,.1,.03,false); st.rotation.z=.25; g.add(st); } g.add(mesh(new THREE.BoxGeometry(.36,.02,.02),b,-.02,-.2,.03,false)); return g; },
 bunting(g){ g.add(mesh(new THREE.BoxGeometry(.98,.012,.012),M('#6b4a33'),0,.2,.02,false)); const cs=['#e2574c','#f2b33d','#3f9bd6','#57b86a','#b06fd8','#ff8a5c','#e2574c']; for(let i=0;i<7;i++){ const f=mesh(CY(.065,0,.13,3),M(cs[i],{roughness:.8,flatShading:true}),-.42+i*.14,.125,.02,false); f.scale.z=.15; g.add(f); } g.userData.y=1.25; return g; },
 garland(g){ g.add(mesh(new THREE.BoxGeometry(.98,.01,.01),M('#2f2a26'),0,.16,.03,false)); const cs=['#ffd98a','#ff9a7a','#9ad8ff','#b8f0a0']; for(let i=0;i<8;i++){ const c=cs[i%4]; g.add(mesh(SP(.032,10,8),M(c,{emissive:c,emissiveIntensity:1.3,roughness:.4}),-.43+i*.123,.12-Math.sin(i/7*Math.PI)*.06,.04,false)); } g.userData.y=1.3; return g; },
 mirrorR(g,white,gold){ g.add(mesh(RB(.56,.8,.05,.02),M('#d9b24a',{metalness:.8,roughness:.25}),0,0,0,false)); g.add(mesh(new THREE.BoxGeometry(.46,.7,.02),M('#cfe6ee',{metalness:.9,roughness:.08}),0,0,.02,false)); return g; },
 cuckoo(g){ const w=M('#6b4022',{roughness:.6}); g.add(mesh(RB(.32,.34,.12,.02),w,0,0,.06,false)); const rf=mesh(CY(.26,.26,.14,3).clone().rotateX(Math.PI/2).rotateZ(Math.PI),M('#4a2a14'),0,.21,.07,false); rf.scale.y=.6; g.add(rf); g.add(mesh(CY(.1,.1,.02,20).clone().rotateX(Math.PI/2),M('#fffaf0'),0,.02,.125,false)); const h=mesh(new THREE.BoxGeometry(.012,.07,.01),M('#3a2414'),.012,.045,.14,false); h.rotation.z=-.5; g.add(h); g.add(mesh(new THREE.BoxGeometry(.06,.06,.02),M('#3a2414'),0,.13,.125,false)); for(const s of [-1,1]){ g.add(mesh(CY(.004,.004,.24,5),M('#c79a52'),s*.07,-.29,.07,false)); g.add(mesh(CY(.03,.022,.08,8),M('#7a4a26'),s*.07,-.43,.07,false)); } return g; },
 coat(g,white,gold){ g.add(mesh(RB(.8,.1,.035,.012),M('#8a5730',{roughness:.6}),0,.1,.018,false)); for(let i=0;i<4;i++){ const x=-.3+i*.2; const k=mesh(CY(.012,.012,.08,6),gold,x,.07,.06,false); k.rotation.x=1.2; g.add(k); g.add(mesh(SP(.02,8,6),gold,x,.085,.1,false)); } const sc=mesh(RB(.09,.42,.04,.015),M('#c8423a',{roughness:.9}),-.1,-.13,.07,false); g.add(sc); const hat=mesh(CY(.1,.11,.07,16),M('#3a2a1f',{roughness:.8}),.3,.05,.11,false); hat.rotation.x=1.3; g.add(hat); return g; },
};
function decor3D(g,m,ud){
 if(m==='odette'){ souvBuild(g,ud); return; }
 if(m==='bonsai'){ g.add(mesh(RB(.44,.12,.3,.02),M('#3a4a6a',{roughness:.4}),0,.06,0)); g.add(mesh(RB(.4,.02,.26,.008),M('#5b3a26'),0,.125,0,false)); const tr=M('#6b4a2a',{roughness:.8}); const a=mesh(CY(.03,.05,.3,8),tr,-.03,.27,0); a.rotation.z=.35; g.add(a); const b=mesh(CY(.02,.03,.24,8),tr,.06,.45,0); b.rotation.z=-.7; g.add(b); const gr=M('#4f8a4a',{flatShading:true,roughness:.8}); for(const [x,y,z,r] of [[-.12,.5,0,.13],[.17,.55,.02,.12],[.02,.66,-.03,.11]]){ const c=mesh(IC(r,1),gr,x,y,z); c.scale.y=.6; g.add(c); } return; }
 if(m==='andon'){ const dk=M('#3a2a1f',{roughness:.5}); for(const [x,z] of [[-.1,-.1],[.1,-.1],[-.1,.1],[.1,.1]]) g.add(mesh(new THREE.BoxGeometry(.022,.9,.022),dk,x,.45,z)); g.add(mesh(new THREE.BoxGeometry(.19,.5,.19),M('#fff6e0',{emissive:'#ffcf80',emissiveIntensity:.9,roughness:.9}),0,.6,0,false)); for(const y of [.34,.6,.86]) g.add(mesh(new THREE.BoxGeometry(.23,.02,.23),dk,0,y,0,false)); const L=new THREE.PointLight(0xffc070,0,4,1.5); L.position.y=.7; g.add(L); ud.light=L; return; }
 if(m==='gumball'){ const red=M('#e2574c',{roughness:.3}); g.add(mesh(CY(.13,.16,.05,16),red,0,.025,0)); g.add(mesh(CY(.03,.03,.5,10),M('#d9dde3',{metalness:.8,roughness:.2}),0,.3,0)); g.add(mesh(CY(.13,.11,.16,16),red,0,.62,0)); g.add(mesh(SP(.17,18,14),M('#e8f6ff',{transparent:true,opacity:.45,roughness:.05}),0,.85,0,false)); const cs=['#ff7aa8','#ffd23f','#3f9bd6','#57b86a','#b06fd8','#ff8a3d']; const r=seeded(7); for(let i=0;i<22;i++){ const a=r()*6.3, d=r()*.11, y=.74+r()*.12; g.add(mesh(SP(.03,8,6),M(cs[i%6],{roughness:.4}),Math.cos(a)*d,y,Math.sin(a)*d,false)); } g.add(mesh(CY(.06,.06,.04,12),red,0,1.03,0)); g.add(mesh(new THREE.BoxGeometry(.07,.05,.03),M('#d9dde3',{metalness:.8}),0,.6,.12,false)); return; }
 if(m==='spot'){ const mt=M('#2b2f36',{metalness:.6,roughness:.4}); for(let i=0;i<3;i++){ const a=i*2.094, l=mesh(CY(.014,.014,1.0,6),mt,Math.cos(a)*.14,.48,Math.sin(a)*.14); l.rotation.z=-Math.cos(a)*.3; l.rotation.x=Math.sin(a)*.3; g.add(l); } const h=new THREE.Group(); h.position.set(0,1.05,0); h.rotation.x=.5; h.add(mesh(CY(.15,.1,.2,16),mt,0,0,0)); h.add(mesh(CY(.135,.135,.01,16),M('#fff3c4',{emissive:'#ffd98a',emissiveIntensity:1.5}),0,.101,0,false)); h.rotation.z=Math.PI/2; g.add(h); const L=new THREE.PointLight(0xffd9a0,0,5,1.4); L.position.set(.2,1.05,0); g.add(L); ud.light=L; return; }
 if(m==='surf'){ g.add(mesh(RB(.5,.06,.3,.02),M('#d9c7a8',{roughness:.8}),0,.03,0)); const b=mesh(SP(.5,20,12),M('#fffaf2',{roughness:.35}),0,.72,-.05); b.scale.set(.42,1.36,.07); b.rotation.x=-.12; g.add(b); const st=mesh(SP(.5,20,12),M('#3fb3c8',{roughness:.35}),0,.72,-.038); st.scale.set(.13,1.3,.06); st.rotation.x=-.12; g.add(st); const c=mesh(SP(.5,16,10),M('#ff8a5c',{roughness:.35}),0,.5,-.03); c.scale.set(.4,.12,.065); c.rotation.x=-.12; g.add(c); return; }
 if(m==='woodstove'){ const ir=M('#2b2b30',{metalness:.5,roughness:.5}); for(const [x,z] of [[-.2,-.15],[.2,-.15],[-.2,.15],[.2,.15]]) g.add(mesh(CY(.025,.02,.1,8),ir,x,.05,z)); g.add(mesh(RB(.56,.5,.44,.04),ir,0,.35,0)); g.add(mesh(RB(.62,.04,.5,.015),ir,0,.62,0)); g.add(mesh(RB(.3,.24,.02,.01),M('#ff8a3d',{emissive:'#ff5a1a',emissiveIntensity:1.6,roughness:.4}),0,.36,.225,false)); for(const x of [-.09,0,.09]) g.add(mesh(new THREE.BoxGeometry(.012,.24,.03),ir,x,.36,.232,false)); g.add(mesh(CY(.06,.06,.9,12),ir,.12,1.08,-.1)); const L=new THREE.PointLight(0xff8a40,0,4,1.6); L.position.set(0,.4,.4); g.add(L); ud.light=L; g.add(mesh(CY(.05,.05,.26,8).clone().rotateZ(Math.PI/2),M('#8a5a30'),-.3,.06,.3)); g.add(mesh(CY(.05,.05,.26,8).clone().rotateZ(Math.PI/2),M('#9a6a3c'),-.3,.15,.27)); return; }
 const pot=(x,z,r,h,c)=>{ g.add(mesh(CY(r,r*.78,h,18),M(c||'#d9774f'),x,h/2,z)); g.add(mesh(CY(r*.86,r*.86,.02,18),M('#5b3a26'),x,h+.005,z,false)); };
 const wood=M('#8a5730',{roughness:.6}), dark=M('#5e3719',{roughness:.6}), gold=M('#d9b24a',{metalness:.75,roughness:.3});
 if(m==='cactus'){ pot(0,0,.15,.22,'#e58a62'); const gr=M('#4f9a54',{roughness:.7}); g.add(mesh(CA(.085,.42),gr,0,.52,0)); const a=mesh(CA(.05,.16),gr,.14,.5,0); g.add(a); g.add(mesh(CA(.05,.1),gr,.14,.62,0)); const b=mesh(CA(.045,.14),gr,-.13,.42,0); g.add(b); g.add(mesh(SP(.035,8,6),M('#ff7aa8'),0,.83,0,false)); }
 else if(m==='olive'){ pot(0,0,.2,.3,'#e9e2d2'); g.add(mesh(CY(.03,.04,.6,8),M('#7a5a3a'),0,.6,0)); const gr=[M('#7fae6a',{flatShading:true,roughness:.8}),M('#6a9a58',{flatShading:true,roughness:.8})]; for(const [x,y,z,r] of [[0,1.05,0,.26],[.16,.95,.08,.18],[-.15,.98,-.06,.19],[.02,1.24,.03,.17]]) g.add(mesh(IC(r,1),gr[(r*100|0)%2],x,y,z)); }
 else if(m==='palm'){ pot(0,0,.2,.26,'#3a3f47'); const tr=M('#8a6a42',{roughness:.8}); for(let i=0;i<5;i++) g.add(mesh(CY(.045-i*.004,.055-i*.004,.2,8),tr,Math.sin(i*.4)*.02,.36+i*.19,0)); const lg=SP(1,10,6), gr=M('#3f9a4f',{roughness:.6}); const L=new THREE.Group(); L.position.y=1.28; g.add(L); for(let i=0;i<7;i++){ const p=new THREE.Group(); p.rotation.y=i*Math.PI*2/7; const lf=mesh(lg,gr,0,-.04,.24); lf.scale.set(.07,.02,.3); lf.rotation.x=.55; p.add(lf); L.add(p); } ud.anim=(T)=>{ L.rotation.z=Math.sin(T*.9+g.id)*.04; }; }
 else if(m==='vase'){ g.add(mesh(lathe('vaseD',[[0,0],[.1,0],[.15,.12],[.13,.3],[.06,.44],[.09,.52]],20),M('#3f7fbf',{roughness:.25}),0,0,0)); const st=M('#4f9a54'); const cs=['#ff7aa8','#ffd23f','#ffffff','#ff6b6b','#c58cff']; for(let i=0;i<5;i++){ const a=i*1.26, r=.07, h=.5+i%2*.12; const s=mesh(CY(.008,.008,h,5),st,Math.cos(a)*r*.5,.5+h/2,Math.sin(a)*r*.5,false); s.rotation.z=Math.cos(a)*.18; s.rotation.x=Math.sin(a)*.18; g.add(s); g.add(mesh(SP(.06,10,8),M(cs[i],{roughness:.6}),Math.cos(a)*(r+.06),.52+h,Math.sin(a)*(r+.06))); } }
 else if(m==='barrel'){ g.add(mesh(lathe('barD',[[0,0],[.2,0],[.26,.2],[.27,.32],[.26,.44],[.2,.64],[0,.64]],20),wood,0,0,0)); for(const y of [.1,.32,.54]) add(g,mesh(TO(y===.32?.272:.238,.012),M('#3a3f47',{metalness:.6}),0,y,0,false)).rotation.x=Math.PI/2; g.add(mesh(CY(.03,.03,.14,10),M('#fffaf0'),.05,.71,0)); g.add(mesh(SP(.02,8,6),M('#ffd98a',{emissive:'#ffb040',emissiveIntensity:1.5}),.05,.8,0,false)); g.add(mesh(CY(.035,.035,.2,10),M('#3f6b3a',{roughness:.2}),-.08,.74,.04)); g.add(mesh(CY(.012,.02,.08,8),M('#3f6b3a',{roughness:.2}),-.08,.88,.04)); }
 else if(m==='lantern'){ g.add(mesh(CY(.12,.14,.04,6),dark,0,.02,0)); g.add(mesh(CY(.018,.018,.9,8),dark,0,.47,0)); const lg=mesh(CY(.1,.08,.22,6),M('#fff1c9',{emissive:'#ffc060',emissiveIntensity:1.1,roughness:.5,transparent:true,opacity:.92}),0,1.03,0); g.add(lg); g.add(mesh(CY(.02,.13,.09,6),dark,0,1.185,0)); g.add(mesh(CY(.11,.11,.02,6),dark,0,.915,0)); const L=new THREE.PointLight(0xffb060,0,4,1.5); L.position.y=1.05; g.add(L); ud.light=L; }
 else if(m==='winerack'){ g.add(mesh(RB(.8,1.1,.32,.02),dark,0,.55,0)); for(let r=0;r<4;r++) for(let c=0;c<4;c++){ g.add(mesh(CY(.06,.06,.3,10).clone().rotateX(Math.PI/2),M('#2a1a10'),-.27+c*.18,.2+r*.24,.03,false)); if((r+c)%4!==3) g.add(mesh(CY(.04,.04,.06,10).clone().rotateX(Math.PI/2),M(['#7a2233','#3f6b3a','#c9a13a'][(r+c)%3],{roughness:.2}),-.27+c*.18,.2+r*.24,.17,false)); } }
 else if(m==='books'){ g.add(mesh(RB(.82,1.25,.3,.02),wood,0,.625,0)); const cs=['#c8423a','#3f7fbf','#57b86a','#f2b33d','#b06fd8','#e9e2d2','#3a3f47']; let k=0; for(let r=0;r<4;r++){ g.add(mesh(new THREE.BoxGeometry(.74,.25,.02),M('#3a2414'),0,.2+r*.29,.14,false)); let x=-.34; while(x<.3){ const w=.04+((k*7)%4)*.012, h=.17+((k*5)%3)*.03; g.add(mesh(new THREE.BoxGeometry(w,h,.16),M(cs[k%7],{roughness:.8}),x+w/2,.085+r*.29+h/2,.08,false)); x+=w+.006; k++; if(r===2&&x>.05) break; } } g.add(mesh(SP(.07,10,8),M('#5fa84f',{flatShading:true}),.2,.085+2*.29+.07,.08,false)); }
 else if(m==='screen'){ const fr=M('#5e3719',{roughness:.5}), pa=M('#f6ead2',{roughness:.9}); for(let i=0;i<3;i++){ const p=new THREE.Group(); p.position.set(-.3+i*.3,0,i%2?.05:-.05); p.rotation.y=i%2?-.45:.45; p.add(mesh(RB(.3,1.2,.03,.008),fr,0,.62,0)); p.add(mesh(new THREE.BoxGeometry(.24,1.06,.034),pa,0,.62,0,false)); for(const y of [.36,.62,.88]) p.add(mesh(new THREE.BoxGeometry(.24,.014,.04),fr,0,y,0,false)); p.add(mesh(SP(.035,8,6),M('#e2574c'),.03,.75,.02,false)); g.add(p); } }
 else if(m==='gramo'){ g.add(mesh(RB(.5,.5,.5,.03),wood,0,.25,0)); g.add(mesh(RB(.38,.1,.38,.02),dark,0,.55,0)); g.add(mesh(CY(.15,.15,.015,24),M('#1d1d22',{roughness:.3}),0,.61,0,false)); g.add(mesh(CY(.04,.04,.017,12),M('#e2574c'),0,.612,0,false)); const horn=mesh(CY(.2,.025,.34,20,1),gold,.1,.88,-.08); horn.rotation.z=-.7; horn.rotation.x=.25; g.add(horn); g.add(mesh(CY(.014,.014,.2,6),gold,-.06,.7,-.1)); }
 else if(m==='coatrack'){ g.add(mesh(CY(.16,.18,.04,16),dark,0,.02,0)); g.add(mesh(CY(.022,.022,1.45,8),dark,0,.74,0)); for(let i=0;i<4;i++){ const a=i*Math.PI/2; const h=mesh(CY(.012,.012,.2,6),dark,Math.cos(a)*.08,1.38,Math.sin(a)*.08); h.rotation.z=-Math.cos(a)*.9; h.rotation.x=Math.sin(a)*.9; g.add(h); } const c=mesh(CA(.09,.34),M('#b8743f',{roughness:.9}),.11,1.1,0); g.add(c); g.add(mesh(CY(.1,.12,.06,16),M('#3a2a1f'),-.02,1.5,0)); g.add(mesh(CY(.16,.16,.012,16),M('#3a2a1f'),-.02,1.47,0,false)); }
 else if(m==='easel'){ for(const s of [-1,1]){ const l=mesh(new THREE.BoxGeometry(.03,1.0,.03),wood,s*.2,.48,.06); l.rotation.z=s*-.14; l.rotation.x=-.12; g.add(l); } const bk=mesh(new THREE.BoxGeometry(.03,.95,.03),wood,0,.46,-.14); bk.rotation.x=.3; g.add(bk); const t=canvasTex(128,160,(x)=>{ x.fillStyle='#2f3d35'; x.fillRect(0,0,128,160); x.fillStyle='#fff'; x.font='700 20px '+FONT; x.textAlign='center'; x.fillText('Plat du jour',64,34); x.strokeStyle='#ffd98a'; x.lineWidth=2; x.beginPath(); x.moveTo(24,46); x.lineTo(104,46); x.stroke(); x.font='600 14px '+FONT; x.fillStyle='#ffe9b8'; ['Soupe maison','Quiche','Tarte fine'].forEach((s,i)=>x.fillText(s,64,74+i*26)); }); const b=new THREE.Group(); b.position.set(0,.62,.075); b.rotation.x=-.12; b.add(mesh(RB(.5,.62,.03,.008),wood,0,0,0)); b.add(ownMesh(new THREE.PlaneGeometry(.44,.56),new THREE.MeshStandardMaterial({map:t,roughness:.9}),0,0,.017,false)); g.add(b); }
 else if(m==='piano'){ const bl=M('#1d1d22',{roughness:.25}); g.add(mesh(RB(.92,.8,.36,.02),bl,0,.5,-.1)); g.add(mesh(RB(.92,.06,.26,.01),bl,0,.5,.18)); g.add(mesh(new THREE.BoxGeometry(.84,.02,.17),M('#fffaf0',{roughness:.3}),0,.535,.2,false)); for(let i=0;i<14;i++) if(i%7!==2&&i%7!==6) g.add(mesh(new THREE.BoxGeometry(.03,.02,.1),bl,-.39+i*.06+.03,.55,.17,false)); for(const s of [-1,1]){ g.add(mesh(RB(.06,.5,.06,.01),bl,s*.42,.25,.24)); g.add(mesh(RB(.1,.1,.4,.01),bl,s*.42,.05,0)); } add(g,mesh(RB(.3,.2,.02,.005),M('#fffaf0'),0,.78,.09,false)).rotation.x=-.25; g.add(mesh(CY(.03,.04,.1,8),gold,.32,.95,-.1)); g.add(mesh(SP(.02,8,6),M('#ffd98a',{emissive:'#ffb040',emissiveIntensity:1.4}),.32,1.02,-.1,false)); }
 else if(m==='cage'){ g.add(mesh(CY(.14,.16,.04,16),gold,0,.02,0)); g.add(mesh(CY(.016,.016,1.0,8),gold,0,.52,0)); const cg=new THREE.Group(); cg.position.y=1.12; g.add(cg); cg.add(mesh(CY(.17,.17,.03,16),gold,0,0,0)); for(let i=0;i<12;i++){ const a=i*Math.PI/6; cg.add(mesh(CY(.005,.005,.3,4),gold,Math.cos(a)*.16,.16,Math.sin(a)*.16,false)); } cg.add(mesh(SP(.165,16,8,0,Math.PI*2,0,Math.PI/2),M('#d9b24a',{metalness:.75,roughness:.3,wireframe:true}),0,.31,0,false)); cg.add(mesh(SP(.02,8,6),gold,0,.49,0,false)); const bird=new THREE.Group(); bird.position.y=.14; bird.add(mesh(SP(.05,10,8),M('#ffd23f'),0,0,0)); bird.add(mesh(SP(.034,10,8),M('#ffd23f'),.04,.045,0)); add(bird,mesh(CY(0,.012,.03,6),M('#ff8a3d'),.08,.045,0,false)).rotation.z=-Math.PI/2; cg.add(bird); cg.add(mesh(CY(.006,.006,.3,5).clone().rotateZ(Math.PI/2),M('#7a5a3a'),0,.09,0,false)); ud.anim=(T)=>{ bird.position.y=.14+Math.abs(Math.sin(T*3+g.id))*.02; bird.rotation.y=Math.sin(T*.8+g.id)*.9; }; }
 else if(m==='globe'){ g.add(mesh(CY(.14,.17,.05,16),dark,0,.025,0)); g.add(mesh(CY(.02,.02,.5,8),dark,0,.3,0)); const gl=mesh(SP(.2,20,14),M('#3f8fd0',{roughness:.5}),0,.72,0); g.add(gl); for(const [a,b,r] of [[.5,.3,.09],[2.2,-.2,.11],[3.8,.5,.07],[5,-.4,.08]]) gl.add(mesh(SP(r,8,6),M('#6fbf6a',{flatShading:true}),Math.cos(a)*Math.cos(b)*.14,Math.sin(b)*.14,Math.sin(a)*Math.cos(b)*.14,false)); const rg=mesh(TO(.23,.012),gold,0,.72,0,false); rg.rotation.x=.4; g.add(rg); ud.anim=(T)=>{ gl.rotation.y=T*.25; }; }
 else if(m==='candles'){ g.add(mesh(RB(.4,.6,.4,.03),wood,0,.3,0)); g.add(mesh(CY(.19,.19,.02,20),M('#fffaf0'),0,.61,0,false)); for(const [x,z,h] of [[-.06,0,.2],[.07,.04,.14],[.02,-.08,.1]]){ g.add(mesh(CY(.03,.03,h,10),M('#fff3e0',{roughness:.6}),x,.62+h/2,z)); g.add(mesh(SP(.018,8,6),M('#ffd98a',{emissive:'#ffb040',emissiveIntensity:1.8}),x,.64+h,z,false)); } const L=new THREE.PointLight(0xffb060,0,3,1.6); L.position.y=.9; g.add(L); ud.light=L; }
}

/* ===== v0.53 : styles de tables et de chaises ===== */
function tableLegs(g,F,H,cx,cz,tw,td){
 const m=F.legc?M(F.legc,{metalness:F.legm===0?0:.7,roughness:F.legm===0?.6:.3}):M(shade(F.col,-.25),{roughness:.5}), h=H-.03;
 if(F.leg==='ped'){ g.add(mesh(CY(.2,.22,.03,24),m,cx,.015,cz)); g.add(mesh(CY(.035,.05,h-.03,14),m,cx,h/2+.015,cz)); g.add(mesh(CY(.12,.04,.03,16),m,cx,h-.015,cz)); }
 else if(F.leg==='pin'){ for(const [x,z] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]]){ for(const d of [-1,1]){ const l=mesh(CY(.009,.009,h+.01,6),m,x-Math.sign(x)*.02+d*.012,h/2,z-Math.sign(z)*.02); l.rotation.z=Math.sign(x)*.1+d*.07; l.rotation.x=-Math.sign(z)*.1; g.add(l); } } }
 else if(F.leg==='x'){ for(const z of [-.18,.18]) for(const d of [-1,1]){ const l=mesh(new THREE.BoxGeometry(.035,h*1.3,.035),m,0,h/2,z); l.rotation.z=d*.7; g.add(l); } g.add(mesh(new THREE.BoxGeometry(.03,.03,.36),m,0,h/2,0)); }
 else if(F.leg==='blk'){ for(const [x,z] of [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]]) g.add(mesh(RB(.085,h,.085,.015),m,x,h/2,z)); for(const z of [-.19,.19]) g.add(mesh(new THREE.BoxGeometry(.38,.04,.03),m,0,h-.06,z)); }
 else if(F.leg==='low'){ g.add(mesh(RB(.36,h,.36,.03),m,cx,h/2,cz)); g.add(mesh(RB(.44,.03,.44,.012),m,cx,.015,cz)); }
}
const CHK={};
function chkTex(a,b,n){ const k=a+b+n; return CHK[k]||(CHK[k]=(()=>{ const t=canvasTex(64,64,(x)=>{ if(n==='v'){ x.fillStyle='#fffaf2'; x.fillRect(0,0,64,64); x.fillStyle=a; x.globalAlpha=.55; x.fillRect(0,0,32,64); x.fillRect(0,0,64,32); x.globalAlpha=1; } else { x.fillStyle=b; x.fillRect(0,0,64,64); x.fillStyle=a; x.fillRect(0,0,32,32); x.fillRect(32,32,32,32); } }); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; })()); }
function tableTop(g,F,H,cx,cz,tw,td,x0,x1,z0,z1,J){
 const base=M(F.col,{roughness:.5});
 const plane=(tex,u)=>{ const t=tex.clone(); t.needsUpdate=true; t.repeat.set(Math.max(1,Math.round(tw/u)),Math.max(1,Math.round(td/u))); const m=ownMesh(new THREE.PlaneGeometry(tw-.012,td-.012),new THREE.MeshStandardMaterial({map:t,roughness:.6}),cx,H+.0035,cz,false); m.rotation.x=-Math.PI/2; g.add(m); };
 if(F.top==='glass'){ g.add(mesh(RB(tw,.028,td,.012),M('#cfe9f2',{transparent:true,opacity:.5,roughness:.04,metalness:.1}),cx,H-.014,cz,false)); }
 else if(F.top==='metal'){ g.add(mesh(RB(tw,.035,td,.012),M(F.col,{metalness:.75,roughness:.32}),cx,H-.018,cz)); }
 else if(F.top==='paint'){ g.add(mesh(RB(tw,.045,td,.02),M(F.col,{roughness:F.gloss?.12:.45,metalness:F.gloss?.15:0}),cx,H-.022,cz)); }
 else if(F.top==='tile'){ g.add(mesh(RB(tw,.045,td,.02),base,cx,H-.022,cz)); plane(chkTex(F.ta,F.tb,'t'),.135); }
 else if(F.top==='vichy'){ const cl=M(F.ta,{roughness:.95}); g.add(mesh(RB(tw-.02,.04,td-.02,.015),base,cx,H-.03,cz)); g.add(mesh(RB(tw+.03,.014,td+.03,.006),M('#fffaf2',{roughness:.95}),cx,H-.004,cz)); plane(chkTex(F.ta,'','v'),.09);
  if(!J[2]) g.add(mesh(new THREE.BoxGeometry(tw+.03,.07,.012),cl,cx,H-.04,z0-.015,false)); if(!J[3]) g.add(mesh(new THREE.BoxGeometry(tw+.03,.07,.012),cl,cx,H-.04,z1+.015,false));
  if(!J[0]) g.add(mesh(new THREE.BoxGeometry(.012,.07,td+.03),cl,x0-.015,H-.04,cz,false)); if(!J[1]) g.add(mesh(new THREE.BoxGeometry(.012,.07,td+.03),cl,x1+.015,H-.04,cz,false)); }
 else { g.add(mesh(RB(tw,.05,td,.02),base,cx,H-.025,cz)); if(F.top==='plank') for(let x=x0+.09;x<x1-.02;x+=.09) g.add(mesh(new THREE.BoxGeometry(.006,.004,td-.03),M(shade(F.col,-.3)),x,H+.001,cz,false)); }
}
function chairStyle(q,F){
 const c=M(F.col,{roughness:.6}), a=M(F.acc||shade(F.col,-.45),{roughness:.6}), chrome=M('#d9dde3',{metalness:.85,roughness:.2}), k=F.cs;
 const legs=(m,r=.016,d=.12,h=.19)=>{ for(const [x,z] of [[-d,-d],[d,-d],[-d,d],[d,d]]) q.add(mesh(CY(r,r*.85,h,8),m,x,h/2,z)); };
 const sideX=(m,x)=>{ for(const d of [-1,1]){ const l=mesh(new THREE.BoxGeometry(.02,.3,.02),m,x,.12,0); l.rotation.x=d*.62; q.add(l); } };
 if(k==='bistro'||k==='thonet'){ legs(a,.013,.11); q.add(mesh(CY(.165,.165,.035,22),c,0,.207,0)); if(k==='bistro') q.add(mesh(CY(.14,.14,.012,22),M(shade(F.col,.2),{roughness:.95}),0,.228,0,false));
  q.add(mesh(TO(.145,.012,Math.PI),a,0,.24,.145)); for(const s of [-1,1]) q.add(mesh(CY(.012,.012,.06,6),a,s*.145,.21,.145));
  if(k==='thonet') q.add(mesh(TO(.085,.01,Math.PI),a,0,.24,.145)); else q.add(mesh(RB(.2,.1,.014,.006),c,0,.3,.147)); }
 else if(k==='deck'){ for(const x of [-.155,.155]){ sideX(c,x); q.add(mesh(CY(.012,.012,.3,6),c,x,.33,.13)); q.add(mesh(new THREE.BoxGeometry(.035,.016,.28),c,x,.315,0)); } q.add(mesh(RB(.3,.014,.27,.006),a,0,.218,0)); q.add(mesh(RB(.3,.11,.014,.006),a,0,.4,.13)); }
 else if(k==='wicker'){ q.add(mesh(CY(.175,.14,.2,18),c,0,.1,0)); q.add(mesh(CY(.155,.155,.045,18),a,0,.222,0)); const sh=mesh(new THREE.CylinderGeometry(.2,.175,.26,18,1,true,-Math.PI/2,Math.PI),M(F.col,{roughness:.7,side:THREE.DoubleSide}),0,.33,0); q.add(sh); const rim=mesh(TO(.2,.014,Math.PI),c,0,.46,0,false); rim.rotation.x=-Math.PI/2; rim.rotation.z=0; q.add(rim); }
 else if(k==='diner'){ legs(chrome,.014,.13); q.add(mesh(RB(.34,.07,.32,.03),c,0,.205,0)); q.add(mesh(RB(.34,.25,.07,.03),c,0,.385,.14)); q.add(mesh(new THREE.BoxGeometry(.345,.02,.076),M('#ffffff'),0,.385,.14,false)); for(const s of [-1,1]) q.add(mesh(CY(.012,.012,.3,6),chrome,s*.175,.36,.14)); }
 else if(k==='stool'){ const m=F.acc?a:chrome; q.add(mesh(CY(.13,.14,.02,20),m,0,.01,0)); q.add(mesh(CY(.028,.028,.17,10),m,0,.095,0)); q.add(mesh(CY(.165,.15,.05,22),c,0,.207,0)); q.add(mesh(TO(.16,.01),m,0,.185,0,false)); const r=q.children[q.children.length-1]; r.rotation.x=Math.PI/2; }
 else if(k==='zen'){ q.add(mesh(RB(.4,.13,.4,.02),M('#d8c79a',{roughness:.9}),0,.065,0)); q.add(mesh(RB(.36,.012,.36,.004),M('#8a9a5a',{roughness:.95}),0,.134,0,false)); q.add(mesh(RB(.32,.08,.32,.035),c,0,.19,0)); const b=mesh(RB(.32,.2,.03,.012),M('#3a2a1f',{roughness:.5}),0,.34,.165); b.rotation.x=.12; q.add(b); }
 else if(k==='ladder'){ for(const x of [-.13,.13]){ q.add(mesh(CY(.016,.016,.19,8),c,x,.095,-.12)); q.add(mesh(CY(.017,.017,.58,8),c,x,.29,.14)); } q.add(mesh(RB(.32,.035,.32,.012),a,0,.207,0)); for(const y of [.33,.42,.51]) q.add(mesh(new THREE.BoxGeometry(.26,.04,.014),c,0,y,.14)); }
 else if(k==='log'){ q.add(mesh(CY(.17,.18,.215,14),c,0,.108,0)); q.add(mesh(CY(.158,.158,.006,14),M(shade(F.col,.45),{roughness:.9}),0,.219,0,false)); for(const r of [.05,.1]){ const t=mesh(TO(r,.004),M(shade(F.col,.1)),0,.223,0,false); t.rotation.x=Math.PI/2; q.add(t); } }
 else if(k==='tolix'){ const m=M(F.col,{metalness:.6,roughness:.35}); for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const l=mesh(CY(.014,.02,.21,6),m,x*.135,.1,z*.135); l.rotation.z=-x*.1; l.rotation.x=z*.1; q.add(l); } q.add(mesh(RB(.3,.022,.3,.01),m,0,.212,0)); q.add(mesh(RB(.24,.17,.016,.008),m,0,.4,.142)); for(const s of [-1,1]) q.add(mesh(CY(.012,.012,.26,6),m,s*.125,.34,.142)); }
 else if(k==='royal'){ legs(a,.016,.13); q.add(mesh(RB(.34,.06,.34,.025),c,0,.205,0)); q.add(mesh(RB(.36,.025,.36,.01),a,0,.172,0)); const d=mesh(CY(.145,.145,.035,24).clone().rotateX(Math.PI/2),c,0,.43,.15); d.scale.y=1.25; q.add(d); const t=mesh(TO(.15,.017),a,0,.43,.15); t.scale.y=1.25; q.add(t); for(const s of [-1,1]) q.add(mesh(CY(.014,.014,.1,6),a,s*.09,.26,.15)); }
 else if(k==='fold'){ const m=M(F.col,{metalness:.4,roughness:.45}); for(const x of [-.15,.15]){ sideX(m,x); q.add(mesh(CY(.011,.011,.26,6),m,x,.34,.135)); } for(let i=0;i<4;i++) q.add(mesh(new THREE.BoxGeometry(.3,.014,.055),a,0,.218,-.105+i*.07)); for(const y of [.36,.43]) q.add(mesh(new THREE.BoxGeometry(.3,.05,.014),a,0,y,.135)); }
}

/* --- appui long sur le panneau de la porte : 2 secondes pour ouvrir ou fermer --- */
let holdTm=null, holdDone=false, holdEl=null;
function holdStart(x,y){ if(!holdEl){ holdEl=document.createElement('div'); holdEl.id='hold'; holdEl.innerHTML='<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="25"/><circle class="p" cx="30" cy="30" r="25"/></svg>'; document.body.appendChild(holdEl); }
 holdEl.style.transform=`translate(${x-36}px,${y-36}px)`; holdEl.classList.remove('on'); void holdEl.offsetWidth; holdEl.classList.add('on');
 holdTm=setTimeout(()=>{ holdTm=null; holdEl.classList.remove('on'); holdDone=true; if(navigator.vibrate) try{ navigator.vibrate(30); }catch(e){} toggleOpen(); },2000); }
function holdStop(){ if(holdTm){ clearTimeout(holdTm); holdTm=null; } if(holdEl) holdEl.classList.remove('on'); }

/* ===== v0.61 : la préparation en cuisine, étape par étape ===== */
const ING_ACT={ble:'roll',oeuf:'whisk',lait:'whisk',beurre:'whisk',chocolat:'whisk',miel:'whisk',riz:'whisk'};
const POT_DISH=['soupe','pates','curry','ramen'], CUT_DISH={pizza:'wheel',poulet:'knife',tarte:'knife',gateau:'knife',steak:'knife',croissant:'sugar'};
function prepStage(g,ing,ingH,knife){
 const steel=M('#d9dde3',{metalness:.8,roughness:.25}), wood=M('#c9935e',{roughness:.6});
 const dough=mesh(SP(.07,16,12),M('#f3e2bd',{roughness:.85}),-.08,.62,.05,false); dough.visible=false; g.add(dough);
 const pin=new THREE.Group(); pin.add(mesh(CY(.022,.022,.26,12).clone().rotateZ(Math.PI/2),wood,0,0,0,false)); for(const d of [-1,1]) pin.add(mesh(CY(.01,.01,.07,8).clone().rotateZ(Math.PI/2),M('#8a5730'),d*.16,0,0,false)); pin.visible=false; g.add(pin);
 const flour=mesh(CY(.13,.13,.003,18),M('#fffaf0',{roughness:1,transparent:true,opacity:.7}),-.08,.606,.05,false); flour.visible=false; g.add(flour);
 const bowl=new THREE.Group(); bowl.add(mesh(CY(.11,.07,.08,20),M('#f4f1ea',{roughness:.3}),0,.04,0,false)); const mix=mesh(CY(.095,.095,.006,18),M('#f6dc7a',{roughness:.4}),0,.07,0,false); bowl.add(mix);
 const whisk=new THREE.Group(); whisk.add(mesh(CY(.006,.006,.16,6),steel,0,.1,0,false)); for(let i=0;i<4;i++){ const w=mesh(TO(.022,.003),steel,0,.03,0,false); w.rotation.y=i*Math.PI/4; w.scale.y=1.6; whisk.add(w); } whisk.rotation.z=.35; bowl.add(whisk);
 bowl.position.set(-.08,.6,.05); bowl.visible=false; g.add(bowl);
 const fin=new THREE.Group(); fin.position.set(-.08,.607,.04); fin.scale.setScalar(.95); g.add(fin); const finS=emoSprite('🍽️',.2); finS.visible=false; fin.add(finS);
 const wheel=new THREE.Group(); const wd=mesh(CY(.045,.045,.006,20).clone().rotateX(Math.PI/2),steel,0,0,0,false); wheel.add(wd); const wh=mesh(CY(.01,.01,.12,8),M('#c8423a'),0,.07,0,false); wh.rotation.z=.5; wh.position.x=-.03; wheel.add(wh); wheel.visible=false; g.add(wheel);
 const dust=[]; for(let i=0;i<7;i++){ const d=mesh(SP(.008,6,5),M('#fffaf0'),0,0,0,false); d.visible=false; g.add(d); dust.push(d); }
 const hideAll=()=>{ dough.visible=pin.visible=flour.visible=bowl.visible=fin.visible=wheel.visible=false; for(const d of dust) d.visible=false; ingH.visible=false; ing.visible=false; knife.position.set(.08,.61,.06); knife.rotation.set(0,0,0); };
 const chop=(T)=>{ knife.position.set(.03,.61+Math.max(0,Math.sin(T*14))*.05,.06); knife.rotation.z=Math.max(0,Math.sin(T*14))*.3; };
 const sprinkle=(T,col)=>{ dust.forEach((d,i)=>{ const ph=(T*1.6+i/7)%1; d.visible=true; d.material=M(col||'#fffaf0'); d.position.set(-.08+Math.sin(i*2.4)*.07,.78-ph*.16,.04+Math.cos(i*1.7)*.06); }); };
 return (dish,info)=>{ hideAll(); if(!dish||!DISHM[dish]) return; const d=DISHM[dish], T=performance.now()/1000, k=info?info.k:0;
  if(info&&info.fin){ // après la cuisson : on découpe, on tranche ou on saupoudre, puis on dresse
   fin.visible=true; setFood(fin,finS,d.e,0); const c=CUT_DISH[dish];
   if(c==='wheel'){ wheel.visible=true; const u=(k*2)%1, sec=k<.5; wheel.position.set(sec?-.08+(u-.5)*.22:-.08,.66,sec?.04:.04+(u-.5)*.22); wheel.rotation.y=sec?0:Math.PI/2; wd.rotation.z=-u*14; }
   else if(c==='knife'){ const u=(k*3)%1; knife.position.set(-.08+(Math.floor(k*3)-1)*.05,.67-Math.sin(u*Math.PI)*.05,.06); knife.rotation.set(0,Math.PI/2,0); }
   else sprinkle(T,c==='sugar'?'#fffaf0':'#6fbf55');
   return; }
  const nI=d.ing.length, segs=nI+(info&&info.last?1:0), seg=Math.min(segs-1,Math.floor(k*segs)), kk=k*segs-seg;
  if(seg>=nI){ fin.visible=true; setFood(fin,finS,d.e,0); const e=Math.min(1,kk*1.6); fin.scale.setScalar(.95*(.3+.7*e)); sprinkle(T,'#6fbf55'); return; }
  fin.scale.setScalar(.95); const key=d.ing[seg], act=ING_ACT[key]||'chop';
  if(act==='roll'){ dough.visible=pin.visible=flour.visible=true; const f=.6+kk*1.3; dough.scale.set(f,Math.max(.14,1-kk*.86),f); dough.position.y=.607+.07*Math.max(.14,1-kk*.86); pin.position.set(-.08,.64+.03*(1-kk),.05+Math.sin(T*7)*.09); }
  else if(act==='whisk'){ bowl.visible=true; whisk.position.set(Math.cos(T*13)*.04,0,Math.sin(T*13)*.04); mix.material=M(key==='chocolat'?'#5a3422':key==='lait'||key==='riz'?'#fffaf0':'#f6dc7a',{roughness:.4});
   if(kk<.45){ ingH.visible=true; setFood(ingH,ing,ING[key]?ING[key].e:'🥚',0); ingH.position.set(-.08,.78-kk*.3,.05); ingH.scale.setScalar(.6); ing.visible=!ingH.userData.fo; } }
  else { ingH.visible=true; ingH.position.set(-.1,.605,.03); ingH.scale.setScalar(.85); setFood(ingH,ing,ING[key]?ING[key].e:'🥬',0); ing.visible=!ingH.userData.fo; chop(T); }
 };
}
function stoveStage(g,flames,pot,pan,bpos){
 const item=new THREE.Group(); item.position.set(0,.035,0); item.scale.setScalar(.62); pan.add(item); const itS=emoSprite('🍳',.16); itS.visible=false; item.add(itS);
 const ladle=new THREE.Group(); ladle.add(mesh(CY(.007,.007,.2,6),M('#8a5730'),0,.1,0,false)); ladle.rotation.z=.35; pot.add(ladle); ladle.position.y=.1;
 const soup=mesh(CY(.115,.115,.004,18),M('#e8823a',{roughness:.3}),0,.15,0,false); pot.add(soup); const lid=pot.children[1], knob=pot.children[2];
 const p0=pan.position.clone();
 return (dish,info)=>{ const on=!!dish, isPot=on&&POT_DISH.includes(dish), T=performance.now()/1000, k=info?info.k:0;
  pot.visible=on&&isPot; pan.visible=on&&!isPot; flames[0].visible=on&&isPot; flames[3].visible=on&&!isPot;
  if(!on||!DISHM[dish]){ pan.position.copy(p0); pan.rotation.set(0,0,0); return; }
  flames[0].scale.y=flames[3].scale.y=.8+Math.sin(T*20)*.2;
  if(isPot){ lid.visible=knob.visible=false; soup.material=M(dish==='pates'?'#f2e2a0':dish==='ramen'?'#e9c98a':dish==='curry'?'#e0a02a':'#e8823a',{roughness:.3}); soup.position.y=.148+Math.sin(T*9)*.003; ladle.position.set(Math.cos(T*3.2)*.06,.1,Math.sin(T*3.2)*.06); ladle.rotation.y=-T*3.2; }
  else { setFood(item,itS,DISHM[dish].e,0); itS.visible=!item.userData.fo; const u=k>.42&&k<.6?(k-.42)/.18:0, h=Math.sin(u*Math.PI); // on fait sauter à mi-cuisson
   pan.position.set(p0.x,p0.y+h*.05,p0.z); pan.rotation.x=-h*.35; item.position.y=.035+h*.16; item.rotation.x=u*Math.PI*2; if(!u){ pan.position.x=p0.x+Math.sin(T*9)*.006; item.rotation.x=0; } }
 };
}
// four : le plat entre au début de la cuisson et ressort à la fin
function ovenSlide(g,y,z){ const h=new THREE.Group(); h.scale.setScalar(.8); g.add(h); const sp=emoSprite('🍕',.18); sp.visible=false; h.add(sp);
 const peel=mesh(RB(.3,.012,.26,.004),M('#c9935e',{roughness:.6}),0,-.012,0,false); h.add(peel); const hd=mesh(CY(.012,.012,.3,8).clone().rotateX(Math.PI/2),M('#8a5730'),0,-.012,.27,false); h.add(hd);
 return (dish,info)=>{ const k=info?info.k:0, inn=k<.16, out=k>.84; if(!dish||!DISHM[dish]||(!inn&&!out)){ h.visible=false; return; } h.visible=true; setFood(h,sp,DISHM[dish].e,0); sp.visible=!h.userData.fo;
  const u=inn?k/.16:(1-k)/.16, e=u*u*(3-2*u); h.position.set(0,y+.02,z+.02+(1-e)*.36); h.scale.setScalar(.8*(inn?1:1.05)); }; }
