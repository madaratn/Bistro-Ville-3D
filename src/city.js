/* =========================================================
   QUARTIER : bar avec terrasse, cinéma, galerie marchande, immeubles
   + passants qui ont un but (lieux, trottoir d'en face, resto)
   ========================================================= */
const city={walkers:[],venues:{},terr:[],spawnT:2,ready:false};
const cityWin=new THREE.MeshStandardMaterial({color:'#ffe9c4',roughness:.15,metalness:.1,emissive:'#ffcf8a',emissiveIntensity:.15});
const cityGlass=new THREE.MeshStandardMaterial({color:'#9fc4d6',roughness:.08,metalness:.3,emissive:'#ffd79a',emissiveIntensity:.05});
const bulbMat=new THREE.MeshStandardMaterial({color:'#fff3c4',emissive:'#ffd36a',emissiveIntensity:.6});
let cWin=[], cSill=[], cChim=[];
const C_NEAR_E=()=>S+1.2, C_NEAR_W=()=>S+1.8, C_FAR_E=()=>S+4.7, C_FAR_W=()=>S+5.3;
function signBoard(txt,bg,fg,w,h,font){ return canvasTex(512,Math.round(512*h/w),(x,W,H)=>{ x.fillStyle=bg; rrect(x,4,4,W-8,H-8,Math.min(28,H/3)); x.fill(); x.strokeStyle='rgba(255,255,255,.55)'; x.lineWidth=5; rrect(x,14,14,W-28,H-28,Math.min(20,H/4)); x.stroke(); x.fillStyle=fg; x.font=(font||'600 ')+Math.round(H*.48)+'px '+FONT; x.textAlign='center'; x.textBaseline='middle'; x.fillText(txt,W/2,H/2+3); }); }
// maison de village : crépi chaud, colombages, volets, jardinières, toit de tuiles à deux pans
let cShut=[], cBox=[], cFlw=[];
const ROOFS=['#b5553a','#a84a32','#c26444','#9c4a36'], FLW=['#ff7aa8','#ffd23f','#ffffff','#e5484d','#c58cff','#ff9a3d'];
function gableRoof(root,x0,x1,zc,dep,h,rh,col){
 const sh=new THREE.Shape(); sh.moveTo(-dep/2-.18,0); sh.lineTo(dep/2+.18,0); sh.lineTo(0,rh); sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth:x1-x0+.36,bevelEnabled:false}); const m=ownMesh(g,M(col,{roughness:.92}),x0-.18,h,zc); m.rotation.y=Math.PI/2; root.add(m);
 root.add(mesh(new THREE.BoxGeometry(x1-x0+.4,.07,.14),M(shade(col,-.25),{roughness:.9}),(x0+x1)/2,h+rh+.01,zc,false));
}
function cityBlock(root,o){
 const {x0,x1,zf,dep,h,col}=o, w=x1-x0, cx=(x0+x1)/2, zc=zf-dep/2, r=seeded(Math.abs(Math.round(x0*7+zf*13))+50);
 const wall=M(col,{roughness:.92}), beam=M('#6b4630',{roughness:.85}), stone=M('#b9a58c',{roughness:.95});
 root.add(mesh(new THREE.BoxGeometry(w,h,dep),wall,cx,h/2,zc));
 root.add(mesh(new THREE.BoxGeometry(w+.06,.34,dep+.06),stone,cx,.17,zc,false));              // soubassement en pierre
 root.add(mesh(new THREE.BoxGeometry(w+.05,.09,.07),beam,cx,1.36,zf+.03,false));              // sablière
 const fl=Math.max(0,Math.floor((h-1.45)/.95));
 // colombages à l'étage
 if(fl&&o.timber!==false){ for(let x=x0;x<=x1+.01;x+=w/Math.max(2,Math.round(w/1.6))) root.add(mesh(new THREE.BoxGeometry(.07,h-1.36,.05),beam,Math.min(x1-.035,Math.max(x0+.035,x)),1.36+(h-1.36)/2,zf+.02,false));
  root.add(mesh(new THREE.BoxGeometry(w+.05,.08,.06),beam,cx,h-.04,zf+.03,false)); }
 for(let f=0;f<fl;f++){ const y=1.9+f*.95; const n=Math.max(1,Math.round(w/1.5)); for(let i=0;i<n;i++){ const x=x0+w*(i+.5)/n; cWin.push([x,y,zf+.02,0]); cSill.push([x,y-.31,zf+.05,0]);
   for(const sd of [-1,1]) cShut.push([x+sd*.36,y,zf+.035,0]);
   if(r()<.7){ cBox.push([x,y-.38,zf+.11,0]); for(let k=0;k<4;k++) cFlw.push([x-.2+k*.13,y-.3+r()*.03,zf+.12,Math.floor(r()*FLW.length)]); } } }
 if(o.side!==false) for(let f=0;f<fl;f++){ const y=1.9+f*.95; for(let z=zf-.8;z>zf-dep+.4;z-=1.4) cWin.push([x1+.02,y,z,Math.PI/2]); }
 gableRoof(root,x0,x1,zc,dep,h,o.rh||Math.min(1.5,dep*.22),o.roofC||ROOFS[Math.floor(r()*ROOFS.length)]);
 // cheminée
 { const chx=x0+w*(.25+r()*.5); root.add(mesh(new THREE.BoxGeometry(.3,.75,.3),M('#a8644a',{roughness:.95}),chx,h+.55,zc-dep*.22)); cChim.push([chx,h+1.0,zc-dep*.22]); } 
}
function shopFront(root,o){
 const {x0,x1,zf}=o, cx=(x0+x1)/2, wood=M('#6b4630',{roughness:.8});
 const nP=Math.floor((x1-x0-.5)/1.1), oP=(x1-x0-nP*1.1)/2+.1; for(let iP=0;iP<nP;iP++){ const x=x0+oP+iP*1.1; if(Math.abs(x+.45-o.door)<.85) continue; root.add(mesh(new THREE.BoxGeometry(.9,.8,.04),cityGlass,x+.45,.78,zf+.03,false)); root.add(mesh(new THREE.BoxGeometry(1,.06,.08),wood,x+.45,.36,zf+.04,false)); root.add(mesh(new THREE.BoxGeometry(.04,.8,.05),wood,x+.45,.78,zf+.05,false)); }
 root.add(mesh(new THREE.BoxGeometry(.74,1.1,.05),wood,o.door,.55,zf+.02,false));
 root.add(mesh(new THREE.BoxGeometry(.58,.9,.02),M(o.doorC||'#8a5a3a',{roughness:.6}),o.door,.49,zf+.05,false));
 root.add(mesh(SP(.022,8,6),M('#e3b04b',{metalness:.7,roughness:.3}),o.door+.2,.5,zf+.07,false));
 if(o.awn){ const aw=ownMesh(new THREE.BoxGeometry(x1-x0-.2,.04,.75),new THREE.MeshStandardMaterial({map:stripeTex(o.awn,'#fff3dc',Math.round((x1-x0)*2)),roughness:.85}),cx,1.22,zf+.36); aw.rotation.x=.32; root.add(aw); }
 if(o.sign){ const sw=o.sw||2.4, sg=ownMesh(new THREE.PlaneGeometry(sw,sw*.22),new THREE.MeshStandardMaterial({map:signBoard(o.sign,o.sbg||'#5a3a26',o.sfg||'#ffe2a8',sw,sw*.22),transparent:true,roughness:.7}),cx,o.sy||1.6,zf+.07,false); root.add(sg); }
}
function barrel(root,x,z,sc){ const g=new THREE.Group(), w=M('#9a6a3e',{roughness:.8}), ir=M('#4a4038',{metalness:.5,roughness:.5}); const b=mesh(CY(.17,.17,.4,14),w,0,.2,0); g.add(b); const mid=mesh(CY(.2,.2,.2,14),w,0,.2,0); g.add(mid); for(const y of [.07,.33]) g.add(mesh(CY(.178,.178,.03,14),ir,0,y,0,false)); g.position.set(x,0,z); g.scale.setScalar(sc||1); root.add(g); }
function crate(root,x,z,cols){ const w=M('#c79a5e',{roughness:.85}); root.add(mesh(RB(.42,.2,.3,.02),w,x,.1,z)); cols.forEach((c,i)=>root.add(mesh(SP(.07,8,6),M(c,{roughness:.6}),x-.12+(i%3)*.12,.22+Math.floor(i/3)*.07,z-.05+(i%2)*.1,false))); }
function lantern(root,x,y,z){ root.add(mesh(new THREE.BoxGeometry(.03,.03,.3),M('#3a3530',{metalness:.4}),x,y+.12,z-.12,false)); root.add(mesh(RB(.11,.16,.11,.02),bulbMat,x,y,z,false)); root.add(mesh(new THREE.ConeGeometry(.1,.07,4),M('#3a3530',{metalness:.4}),x,y+.115,z,false)); }
function garland(root,ax,ay,az,bx,by,bz,n){ for(let i=0;i<=n;i++){ const t=i/n, sag=Math.sin(t*Math.PI)*.28; root.add(mesh(SP(.04,8,6),bulbMat,ax+(bx-ax)*t,ay+(by-ay)*t-sag,az+(bz-az)*t,false)); } for(const [x,y,z] of [[ax,ay,az],[bx,by,bz]]) root.add(mesh(CY(.025,.03,y,8),M('#5a4030',{roughness:.8}),x,y/2,z)); }
function terraceTable(root,x,z,umb){
 const wd=M('#3d4450',{metalness:.4,roughness:.5});
 root.add(mesh(CY(.03,.04,.62,8),wd,x,.31,z)); root.add(mesh(CY(.28,.28,.03,20),M('#f2ece2',{roughness:.4}),x,.63,z)); root.add(mesh(CY(.16,.18,.03,16),wd,x,.015,z));
 if(umb){ root.add(mesh(CY(.02,.02,1.5,6),M('#e9e2d6'),x,1.1,z,false)); const u=mesh(new THREE.ConeGeometry(.75,.28,8,1,true),M(umb,{side:THREE.DoubleSide,roughness:.8}),x,1.72,z); root.add(u); }
}
function terraceChair(root,x,z,ang){ const g=new THREE.Group(), c=M('#3d4450',{metalness:.4,roughness:.5}), s=M('#c9693f',{roughness:.7});
 for(const [lx,lz] of [[-.12,-.12],[.12,-.12],[-.12,.12],[.12,.12]]) g.add(mesh(CY(.012,.012,.27,6),c,lx,.135,lz));
 g.add(mesh(RB(.3,.04,.3,.012),s,0,.28,0)); g.add(mesh(RB(.3,.28,.03,.01),s,0,.44,-.14));
 g.position.set(x,0,z); g.rotation.y=ang; root.add(g); }
function buildCity(root){
 const Sx=S; cWin=[]; cSill=[]; cChim=[]; city.flags=[]; city.stars=[]; cShut=[]; cBox=[]; cFlw=[]; const cStone=[];
 // --- à gauche : l'auberge-bar et sa terrasse, puis le vieux cinéma ---
 const bar={x0:-9.8,x1:-4.6,zf:Sx,dep:6,h:2.7,col:'#e9c48a'};
 cityBlock(root,bar); shopFront(root,{x0:bar.x0,x1:bar.x1,zf:Sx,door:-7.2,awn:'#a8463a',sign:'Le Comptoir',sbg:'#5a3a26',sw:2.2,sy:1.62,doorC:'#3f6b5a'});
 barrel(root,-4.95,Sx+.3); barrel(root,-9.45,Sx+.3); barrel(root,-9.1,Sx+.62,.75); lantern(root,-6.55,1.15,Sx+.2); lantern(root,-7.85,1.15,Sx+.2);
 const cin={x0:-20,x1:-10.6,zf:Sx,dep:7,h:3.7,col:'#f0dcb4',rh:1.7,roofC:'#a84a32',side:false};
 cityBlock(root,cin); shopFront(root,{x0:cin.x0,x1:cin.x1,zf:Sx,door:-15.3,sign:'CINÉMA LUMIÈRE',sbg:'#7b1f2b',sfg:'#ffe7a8',sw:4.2,sy:2.0,doorC:'#7b1f2b'});
 root.add(mesh(new THREE.BoxGeometry(3.4,.2,1.1),M('#6b2a26',{roughness:.6}),-15.3,1.42,Sx+.55));
 for(let i=0;i<14;i++) root.add(mesh(SP(.035,8,6),bulbMat,-16.9+i*.245,1.31,Sx+1.1,false));
 for(const [px,c] of [[-18.6,'#3f6f8f'],[-12,'#d9822b']]){ root.add(mesh(new THREE.BoxGeometry(.9,1.25,.05),M('#5a3a26'),px,1.1,Sx+.04,false)); root.add(mesh(new THREE.BoxGeometry(.78,1.1,.02),M(c,{roughness:.7,emissive:c,emissiveIntensity:.12}),px,1.1,Sx+.07,false)); root.add(mesh(SP(.16,12,10),M('#fff3c4',{emissive:'#ffe7a8',emissiveIntensity:.3}),px,1.3,Sx+.1,false)); }
 garland(root,-10.2,2.1,Sx+1.9,-4.4,2.1,Sx+1.9,14);
 // --- juste à côté : Le Belmont, le palace du rival ---
 { const x0=Sx+3.6, x1=Sx+10.8, cx=(x0+x1)/2, zf=Sx-.2, dep=7.2, h=4.3, w=x1-x0;
  const stone=M('#f4efe6',{roughness:.55}), gold=M('#d9b24a',{metalness:.75,roughness:.28}), dark=M('#2a2c36',{roughness:.5}), red=M('#a3232f',{roughness:.8});
  root.add(mesh(new THREE.BoxGeometry(w,h,dep),stone,cx,h/2,zf-dep/2));
  root.add(mesh(new THREE.BoxGeometry(w+.3,.22,dep+.3),M('#e2dbcd',{roughness:.6}),cx,h+.11,zf-dep/2));                // corniche
  root.add(mesh(new THREE.BoxGeometry(w+.34,.07,dep+.34),gold,cx,h+.25,zf-dep/2,false));
  root.add(mesh(new THREE.BoxGeometry(w+.1,.3,.5),M('#d8d0c0',{roughness:.7}),cx,.15,zf+.2));                          // perron
  for(let i=0;i<6;i++){ const x=x0+.45+i*(w-.9)/5; root.add(mesh(CY(.17,.19,h-.5,18),stone,x,.3+(h-.5)/2,zf+.22)); root.add(mesh(new THREE.BoxGeometry(.5,.14,.5),gold,x,h-.13,zf+.22,false)); root.add(mesh(new THREE.BoxGeometry(.5,.12,.5),M('#e2dbcd'),x,.36,zf+.22,false)); }
  for(let i=0;i<5;i++){ const x=x0+.45+(i+.5)*(w-.9)/5; if(i===2) continue; root.add(mesh(new THREE.BoxGeometry(.95,1.7,.05),gold,x,1.35,zf+.02,false)); const gl=mesh(new THREE.BoxGeometry(.83,1.58,.03),cityGlass,x,1.35,zf+.05,false); root.add(gl); const ar=mesh(CY(.475,.475,.05,20,1,false,0,Math.PI),gold,x,2.2,zf+.02,false); ar.rotation.x=Math.PI/2; ar.rotation.y=Math.PI/2; root.add(ar);
   root.add(mesh(new THREE.BoxGeometry(.7,.5,.04),M('#fff1c9',{emissive:'#ffd98a',emissiveIntensity:.5,roughness:.5}),x,3.25,zf+.03,false)); }
  root.add(mesh(new THREE.BoxGeometry(1.5,2.2,.06),gold,cx,1.4,zf+.02,false)); root.add(mesh(new THREE.BoxGeometry(1.3,2.02,.03),dark,cx,1.36,zf+.06,false));        // grande porte
  for(const sx of [-1,1]) root.add(mesh(CY(.02,.02,.5,8),gold,cx+sx*.12,1.3,zf+.1,false));
  { const sg=ownMesh(new THREE.PlaneGeometry(4.4,.8),new THREE.MeshStandardMaterial({map:signBoard('LE BELMONT','#1f2029','#f2d27a',4.4,.8),transparent:true,roughness:.5,emissive:'#f2d27a',emissiveIntensity:.18}),cx,3.42,zf+.5,false); root.add(sg);
   root.add(mesh(new THREE.BoxGeometry(4.6,.95,.1),gold,cx,3.42,zf+.42,false)); for(let i=0;i<5;i++){ const st=mesh(new THREE.OctahedronGeometry(.13),M('#ffe08a',{emissive:'#ffd24a',emissiveIntensity:.9,metalness:.5,roughness:.3}),cx-1+i*.5,4.02,zf+.5,false); st.userData.own=1; root.add(st); city.stars.push(st); } }
  const cz0=zf+.45, cz1=Sx+2;
  root.add(mesh(new THREE.BoxGeometry(1.5,.03,cz1-cz0),red,cx,.045,(cz0+cz1)/2,false));                                    // tapis rouge
  for(const sx of [-1,1]) for(let z=cz0+.2;z<Sx+.9;z+=.6){ root.add(mesh(CY(.03,.045,.5,10),gold,cx+sx*.9,.25,z)); root.add(mesh(SP(.05,10,8),gold,cx+sx*.9,.52,z,false)); if(z+.6<Sx+.9){ const rp=mesh(CY(.02,.02,.6,6),red,cx+sx*.9,.42,z+.3,false); rp.rotation.x=Math.PI/2; root.add(rp); } }
  for(const sx of [-1,1]){ const tx=cx+sx*1.9; root.add(mesh(CY(.2,.16,.36,16),dark,tx,.3+.18,zf+.75)); for(let k=0;k<3;k++) root.add(mesh(SP(.26-k*.07,14,12),M('#3f8a4f',{roughness:.85}),tx,.75+k*.3,zf+.75)); lantern(root,cx+sx*1.25,1.5,zf+.3); }
  for(const sx of [-1,1]){ const fx=cx+sx*(w/2-.3); root.add(mesh(CY(.02,.02,1.3,8),gold,fx,h+.9,zf-.1)); const fp=new THREE.Group(); fp.position.set(fx,h+1.3,zf-.1); const fl=mesh(new THREE.BoxGeometry(.6,.36,.02),red,.32,0,0,false); fp.add(fl); root.add(fp); city.flags.push(fp); }
  // Victor Belmont en personne, sur son perron
  try{ const o=makeCharC({id:9917,s:{id:9917,role:'rival',outfit:{skin:'#f1c7a3',hairC:'#2b2b30',hair:'short',top:'#f7f3ea',bottom:'#23242c',shoes:'#16161a',hat:'toque',extras:['buttons','scarf','glasses'],accent:'#d4a53a',w:1.12,h:1.05}}}); o.root.position.set(cx+.95,.3,zf+.62); o.root.rotation.y=-.5; o.root.scale.multiplyScalar(1.12); root.add(o.root); city.belmont=o; }catch(e){}
 }
 // --- à droite : les halles (galerie marchande) et leurs étals ---
 const mall={x0:Sx+12.4,x1:Sx+24,zf:Sx,dep:8,h:2.6,col:'#f2e3c2',rh:1.9,roofC:'#b5553a',timber:false};
 cityBlock(root,mall);
 const post=M('#6b4630',{roughness:.85});
 for(let x=mall.x0+.2;x<mall.x1;x+=1.9){ root.add(mesh(new THREE.BoxGeometry(.14,1.3,.14),post,x,.65,Sx+.08)); }
 for(let x=mall.x0+.5;x<mall.x1-1.7;x+=1.9) if(Math.abs(x+.75-(Sx+15.5))>1) root.add(mesh(new THREE.BoxGeometry(1.5,.95,.04),cityGlass,x+.75,.82,Sx+.03,false));
 root.add(mesh(new THREE.BoxGeometry(1.4,1.25,.05),post,Sx+15.5,.63,Sx+.02,false)); root.add(mesh(new THREE.BoxGeometry(1.2,1.1,.02),cityGlass,Sx+15.5,.58,Sx+.06,false));
 { const sg=ownMesh(new THREE.PlaneGeometry(3,.62),new THREE.MeshStandardMaterial({map:signBoard('Galerie Soleil','#c9772e','#fff3dc',3,.62),transparent:true,roughness:.7}),Sx+15.5,1.75,Sx+.07,false); root.add(sg); }
 // étal de marché : fruits, légumes, citrouilles
 { const ex=Sx+19.2, ez=Sx+.55; const aw=ownMesh(new THREE.BoxGeometry(2.2,.04,.9),new THREE.MeshStandardMaterial({map:stripeTex('#e8a23a','#fff3dc',8),roughness:.85}),ex,1.25,ez+.1); aw.rotation.x=.25; root.add(aw);
  for(const sx of [-1,1]) root.add(mesh(CY(.025,.025,1.25,8),post,ex+sx*1.05,.62,ez+.45));
  root.add(mesh(RB(2,.36,.5,.03),M('#b9895a',{roughness:.85}),ex,.18,ez));
  crate(root,ex-.7,ez,['#e5484d','#e5484d','#e5484d','#c8553d','#e5484d']); crate(root,ex-.15,ez,['#f2c94c','#f2c94c','#e8a23a','#f2c94c','#e8a23a']); crate(root,ex+.42,ez,['#6fae4f','#6fae4f','#8fc45a','#6fae4f','#8fc45a']);
  for(const [px,sc] of [[ex+.95,1],[ex+1.3,.7],[Sx+13,.85]]){ const p=mesh(SP(.16,12,10),M('#e58a2e',{roughness:.7}),px,.12*sc,ez+.25); p.scale.set(sc,.72*sc,sc); root.add(p); root.add(mesh(CY(.015,.02,.06,6),M('#5a7a3a'),px,.25*sc,ez+.25,false)); } }
 lantern(root,Sx+14.6,1.2,Sx+.2); lantern(root,Sx+16.4,1.2,Sx+.2);
 // --- derrière : les maisons du village ---
 { const cols=['#e9c48a','#dfa07c','#f1e4c8','#c9cf9c','#e8b877','#f0d2a0','#d9b08a'], r=seeded(77); let x=-15;
  while(x<Sx+24){ const w=3+Math.floor(r()*3)*.7, h=2.6+Math.floor(r()*3)*.95, dep=5+r()*1.5, ci=Math.floor(r()*cols.length), sd=r()<.5, gap=r()<.3?1.2:.12; cityBlock(root,{x0:x,x1:x+w,zf:-4.4,dep,h,col:cols[ci],side:sd&&gap>1}); x+=w+gap; } }
 // --- en face : muret de pierres sèches, bottes de foin, parterres ---
 { const st=[M('#cdb89c',{roughness:.95}),M('#bfa888',{roughness:.95}),M('#d8c6ac',{roughness:.95})], r=seeded(31);
  for(let x=-20;x<Sx+28;x+=.55){ if(Math.abs(((x+40)%9)-4.5)<.7) continue; const hh=.2+r()*.1; cStone.push([x+r()*.05,hh/2,Sx+6.45+r()*.04,hh/.25]); }
  for(const [hx,hz] of [[-9,Sx+7.6],[-8.1,Sx+7.9],[Sx+6,Sx+7.7]]){ const b=mesh(CY(.32,.32,.5,16),M('#e3c46a',{roughness:.95}),hx,.32,hz); b.rotation.z=Math.PI/2; root.add(b); }
  for(let i=0;i<60;i++){ const fx=-18+r()*(Sx+44), fz=Sx+6.9+r()*2.2; if(Math.abs(fx-Sx/2)<9.8) continue; cFlw.push([fx,.06,fz,Math.floor(r()*FLW.length)]); } }
 // --- terrasse du bar ---
 city.terr=[];
 for(const [tx,umb] of [[-8.6,'#a8463a'],[-6,'#e5a33b']]){ const tz=Sx+.62; terraceTable(root,tx,tz,umb);
  for(const sd of [-1,1]){ const sx=tx+sd*.42; terraceChair(root,sx,tz,sd<0?Math.PI/2:-Math.PI/2); city.terr.push({x:sx,z:tz,rot:sd<0?Math.PI/2:-Math.PI/2,tx,busy:null}); } }
 { const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), one=new THREE.Vector3(1,1,1), up=new THREE.Vector3(0,1,0), col=new THREE.Color();
  const inst=(list,g,mat,colors)=>{ if(!list.length) return; const im=new THREE.InstancedMesh(g,mat,list.length); list.forEach((p,i)=>{ q.setFromAxisAngle(up,colors?0:p[3]); m4.compose(new THREE.Vector3(p[0],p[1],p[2]),q,one); im.setMatrixAt(i,m4); if(colors) im.setColorAt(i,col.set(FLW[p[3]])); }); im.userData.own=1; root.add(im); };
  inst(cWin,new THREE.BoxGeometry(.5,.55,.04),cityWin); inst(cSill,new THREE.BoxGeometry(.6,.06,.1),M('#6b4630',{roughness:.8}));
  inst(cShut,new THREE.BoxGeometry(.2,.58,.035),M('#5f8a6e',{roughness:.85})); inst(cBox,new THREE.BoxGeometry(.56,.1,.14),M('#8a5a3a',{roughness:.9}));
  { const im=new THREE.InstancedMesh(new RoundedBoxGeometry(.5,.25,.26,2,.05),M('#cdb89c',{roughness:.95}),cStone.length); cStone.forEach((p,i)=>{ m4.compose(new THREE.Vector3(p[0],p[1],p[2]),q.identity(),new THREE.Vector3(1,p[3],1)); im.setMatrixAt(i,m4); im.setColorAt(i,col.set(['#cdb89c','#bfa888','#d8c6ac'][i%3])); }); im.castShadow=true; im.receiveShadow=true; im.userData.own=1; root.add(im); }
  inst(cFlw,new THREE.SphereGeometry(.06,7,6),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.8}),true); }
 city.venues={bar:{door:-7.2,side:'L'},cinema:{door:-15.3,side:'L'},mall:{door:Sx+15.5,side:'R'},rival:{door:Sx+7.2,side:'R'}};
 city.ready=true;
 try{ if(life&&life.bike){ fxRoot.remove(life.bike.g); } buildLife(root); }catch(e){ console.warn(e); }
}
/* --- passants --- */
function mkWalker(o){ return Object.assign({id:uid++,kind:'walk',look:randLook(),fx:0,fy:0,rot:0,v:0,speed:rnd(.95,1.15),moving:false,ph:Math.random()*6,route:[],path:[],sitting:false},o); }
function wSet(w,x,z){ w.fx=x-.5; w.fy=z-.5; }
const W_END_L=-23, W_END_R=()=>S+31;
function doorPts(v,out){ const dz=S-.55, fz=S+.35; return out?[[v.door,dz],[v.door,fz]]:[[v.door,fz],[v.door,dz]]; }
function laneZ(dir,far){ return far?(dir>0?C_FAR_E():C_FAR_W()):(dir>0?C_NEAR_E():C_NEAR_W()); }
// itinéraire sur le trottoir côté resto, sans jamais passer devant le resto
function nearRoute(fromX,toX){ const dir=toX>fromX?1:-1, z=laneZ(dir,false); return {dir,pts:[[fromX,z],[toX,z]]}; }
function spawnAmbient(){
 if(!city.ready) return;
 const n=city.walkers.filter(w=>!w.sit).length; if(n>=6) return;
 const r=Math.random(), gs=Math.random()<.6?1:Math.random()<.75?2:3;
 let route, start, end='vanish', venue=null;
 if(city.venues.rival&&Math.random()<rivalPull()){ // les clients que Le Belmont détourne
  const V=city.venues.rival, fromL=Math.random()<.6, sx=fromL?W_END_L:W_END_R(), d=fromL?1:-1;
  if(Math.random()<.7){ start=[sx,laneZ(d,false)]; route=[[V.door,laneZ(d,false)],[V.door,S+.4]]; end='enter'; } else { start=[V.door,S+.4]; route=[[V.door,laneZ(-d,false)],[sx,laneZ(-d,false)]]; }
  makeGroup([start],route,end,Math.random()<.5?2:gs,venue); return; }
 if(r<.38){ // traverse le quartier par le trottoir d'en face
  const dir=Math.random()<.5?1:-1, z=laneZ(dir,true); start=[dir>0?W_END_L:W_END_R(),z]; route=[[dir>0?W_END_R():W_END_L,z]];
 } else if(r<.62){ // côté gauche : va au bar / au cinéma, ou en sort
  const v=pick(['bar','cinema','bar']), V=city.venues[v];
  if(Math.random()<.5){ start=[W_END_L,laneZ(1,false)]; route=[[V.door,laneZ(1,false)],...doorPts(V,false)]; end='enter'; }
  else { const out=doorPts(V,true); start=out[0]; route=[out[1],[V.door,laneZ(-1,false)],[W_END_L,laneZ(-1,false)]]; }
 } else if(r<.82){ // côté droit : la galerie
  const V=city.venues.mall;
  if(Math.random()<.5){ start=[W_END_R(),laneZ(-1,false)]; route=[[V.door,laneZ(-1,false)],...doorPts(V,false)]; end='enter'; }
  else { const out=doorPts(V,true); start=out[0]; route=[out[1],[V.door,laneZ(1,false)],[W_END_R(),laneZ(1,false)]]; }
 } else { // prendre un verre en terrasse
  const seats=city.terr.filter(s=>!s.busy); if(!seats.length) return; const s=pick(seats);
  start=[W_END_L,laneZ(1,false)]; route=[[s.x,laneZ(1,false)],[s.x,s.z]]; end='sit'; venue=s; s.busy=true; makeGroup([start],route,end,1,venue); return;
 }
 makeGroup([start],route,end,gs,venue);
}
function makeGroup(startPts,route,end,gs,venue,extra){
 const g=[], sp=rnd(.95,1.12), st=startPts[0];
 for(let i=0;i<gs;i++){ const w=mkWalker(Object.assign({speed:sp,end,venue},extra||{})); wSet(w,st[0],st[1]); w.route=route.map(p=>[p[0],p[1]]); w.wait=i*.75; w.grp=g; g.push(w); if(gs>=2&&i>0&&Math.random()<.35) w.kidF=true;
  const d=route[0][0]-st[0], e=route[0][1]-st[1]; w.rot=Math.atan2(d,e); w.hide=i>0; city.walkers.push(w); }
 return g;
}
function walkerAhead(w,hx,hz){ let best=null,bd=9; const wx=w.fx, wz=w.fy;
 for(const o of city.walkers){ if(o===w||o.hide||o.sit) continue; if(o.moving&&Math.sin(o.rot)*hx+Math.cos(o.rot)*hz<-.2) continue; const rx=o.fx-wx, rz=o.fy-wz, ah=rx*hx+rz*hz; if(ah<=0||ah>.9) continue; if(Math.abs(rx*hz-rz*hx)<.3&&ah<bd){ bd=ah; best=o; } }
 return best?{o:best,d:bd}:null; }
function walkerStep(w,dt){
 if(w.sit){ w.sitT-=dt; w.lt=(w.lt||0)+dt; w.headT=Math.sin(w.lt*.5+w.id)*.4; if(w.sitT<=0){ w.sit=false; w.sitting=false; w.venue.busy=null; w.venue.drink=null; w.route=[[w.venue.x,laneZ(-1,false)],[W_END_L,laneZ(-1,false)]]; w.end='vanish'; } return; }
 if(w.wait>0){ w.wait-=dt; if(w.wait<=0) w.hide=false; else return; }
 if(w.hold>0){ w.hold-=dt; w.moving=false; w.v=0; return; }
 const t=w.route[0]; if(!t){ return walkerDone(w); }
 const wx=w.fx+.5, wz=w.fy+.5, dx=t[0]-wx, dz=t[1]-wz, d=Math.hypot(dx,dz);
 if(d<.06){ w.route.shift(); if(!w.route.length) walkerDone(w); return; }
 const hx=dx/d, hz=dz/d, want=Math.atan2(hx,hz);
 w.rot=lerpAng(w.rot,want,Math.min(1,dt*6)); w.rotT=w.rot;
 let vmax=w.speed; if(w.ghostW>0) w.ghostW-=dt; else { const ah=walkerAhead(w,hx,hz); if(ah){ vmax=ah.d<.6?0:Math.min(vmax,ah.o.v||0); } }
 if(vmax<.02){ w.stuckT=(w.stuckT||0)+dt; if(w.stuckT>3){ w.ghostW=1.5; w.stuckT=0; } } else w.stuckT=0;
 w.v=vmax<w.v?vmax:Math.min(vmax,(w.v||0)+dt*2); w.moving=w.v>.04; w.ph+=dt*w.v*6.2;
 const st=Math.min(d,w.v*dt); w.fx+=hx*st; w.fy+=hz*st;
}
function walkerDone(w){
 if(w.end==='sit'){ const s=w.venue; wSet(w,s.x,s.z); w.rot=w.rotT=s.rot; w.sit=true; w.sitting=true; w.sitT=rnd(22,45); s.drink=pick(['🍺','☕','🍷','🥤','🍹']); return; }
 if(w.end==='resto'){ if(!restoArrive(w)){ // complet : on va ailleurs
   const dir=w.edge===0?1:-1; w.end='vanish'; w.route=dir>0?[[-.6,laneZ(-1,false)],[W_END_L,laneZ(-1,false)]]:[[S+.6,laneZ(1,false)],[W_END_R(),laneZ(1,false)]]; }
  return; }
 w.dead=true;
}
// un groupe qui veut manger : il arrive au bord du resto, puis devient client
function spawnRestoParty(){
 if(!city.ready) return false;
 const r=Math.random(), gs=Math.min(maxTableCap()||1,r<.45?1:r<.84?2:r<.95?3:4);
 const left=Math.random()<.55, V=left?pick([city.venues.bar,city.venues.cinema,null]):pick([city.venues.mall,null]);
 const ex=left?.5:S-.5, z=laneZ(left?1:-1,false);
 let start, route;
 if(V){ const out=doorPts(V,true); start=out[0]; route=[out[1],[V.door,z],[left?-1:S+1,z],[ex,S+1.5]]; }
 else { start=[left?W_END_L:W_END_R(),z]; route=[[left?-1:S+1,z],[ex,S+1.5]]; }
 const g=makeGroup([start],route,'resto',gs,null,{edge:left?0:S-1});
 return true;
}
function restoArrive(w){ if(!isOpen()){ w.end='vanish'; w.route=[[w.x<S/2?W_END_L:W_END_R(),S+1.5]]; return true; }
 const g=w.grp.filter(m=>!m.dead&&m.end==='resto'); if(w!==g[0]) { w.hold=.3; w.route=[[w.edge+.5,S+1.5]]; return true; }
 // la case du bord doit être libre
 if(whoBlocks({fx:w.fx,fy:w.fy,id:-1},w.edge,S+1)){ w.hold=.4; w.route=[[w.edge+.5,S+1.5]]; return true; }
 const ok=spawnCust(false,{sx:w.edge,looks:g.map(m=>m.look),ids:g.map(m=>m.id),kids:g.map(m=>!!m.kidF),delays:g.map(m=>Math.hypot(m.fx-w.fx,m.fy-w.fy)/(m.speed||1))});
 if(!ok){ g.forEach(m=>{ if(m!==w){ m.end='vanish'; m.route=w.edge===0?[[-.6,laneZ(-1,false)],[W_END_L,laneZ(-1,false)]]:[[S+.6,laneZ(1,false)],[W_END_R(),laneZ(1,false)]]; } }); return false; }
 g.forEach(m=>{ if(m===w) m.dead=true; else { m.end='vanish'; m.route=[[w.edge+.5,S+1.5]]; m.fadeAtEnd=true; } });
 return true;
}
// les clients qui partent continuent leur soirée dans le quartier
function walkerFromCust(c){
 if(!city.ready) return;
 const left=c.x<=0, w=mkWalker({id:c.id,look:c.look,speed:c.speed||1,kidF:c.kidF});
 wSet(w,c.fx+.5,c.fy+.5); w.rot=c.rot||0;
 const z=laneZ(left?-1:1,false), r=Math.random();
 if(left&&r<.35){ const V=pick([city.venues.cinema,city.venues.bar]); w.route=[[-1,z],[V.door,z],...doorPts(V,false)]; }
 else if(!left&&r<.35){ const V=city.venues.mall; w.route=[[S+1,z],[V.door,z],...doorPts(V,false)]; }
 else w.route=[[left?-1:S+1,z],[left?W_END_L:W_END_R(),z]];
 w.end='vanish'; city.walkers.push(w);
}
function cityUpdate(dt){
 if(!city.ready) return;
 city.spawnT-=dt; if(city.spawnT<=0){ city.spawnT=rnd(2.2,4.5); spawnAmbient(); }
 for(const w of city.walkers) walkerStep(w,dt);
 city.walkers=city.walkers.filter(w=>!w.dead);
 // on s'écarte un peu quand on se croise (jamais l'un dans l'autre)
 const A=city.walkers.filter(w=>!w.hide&&!w.sit).concat(TRF.filter(c=>c.y>=S));
 for(const w of A){ w._sx=0; w._sz=0; }
 for(let i=0;i<A.length;i++) for(let j=i+1;j<A.length;j++){ const a=A[i], b=A[j]; let dx=b.fx-a.fx, dz=b.fy-a.fy, d=Math.hypot(dx,dz); if(d>.62) continue; if(d<1e-3){ dx=.01; dz=.007; d=.012; } const p=(.62-d)*.5; dx/=d; dz/=d; if(a.kind==='walk'){ a._sx-=dx*p; a._sz-=dz*p; } if(b.kind==='walk'){ b._sx+=dx*p; b._sz+=dz*p; } }
 const k=Math.min(1,dt*4); for(const w of A) if(w.kind==='walk'){ w.offX=(w.offX||0)+(clamp(w._sx,-.32,.32)-(w.offX||0))*k; w.offY=(w.offY||0)+(clamp(w._sz,-.32,.32)-(w.offY||0))*k; }
}
function pendingResto(){ return city.walkers.filter(w=>w.end==='resto'&&!w.dead).length; }
