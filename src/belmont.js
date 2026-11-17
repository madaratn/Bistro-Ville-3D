/* ===== Le Belmont : l'intérieur du palace rival, à visiter ===== */
const BW=24, BD=17.5, BH=3.6, BCX=BW/2, BFZ=9.4;
const belRoot=new THREE.Group(); belRoot.visible=false; scene.add(belRoot);
const belLight=new THREE.PointLight(0xffd9a0,0,0,1.2); belLight.position.set(BW/2,4.2,BD/2+.5); scene.add(belLight);
const visit={on:false,built:false,cam:null,agents:[],objs:new Map(),spots:[],anim:[],sel:null,els:[],pass:[],tables:[],tasks:[],T:0};
// objets que le joueur peut découvrir : [x,y,z, nom, description, famille]
const BEL_INFO=[];
function belSpot(x,y,z,n,d,k){ BEL_INFO.push({x,y,z,n,d,k}); }
const BEL_MENU=[
 ['🥚','Œuf parfait à la truffe noire','Cuit 64 minutes à basse température, mouillettes dorées au beurre noisette.',42],
 ['🦪','Saint-Jacques et caviar','Noix juste saisies, crème de chou-fleur, grains de caviar osciètre.',58],
 ['🦞','Homard bleu rôti','Sorti du vivier, beurre de corail, bisque montée à la minute.',68],
 ['🐟','Bar de ligne en écailles','Écailles de pomme de terre croustillantes, sauce au champagne.',60],
 ['🥩','Bœuf Wagyu grillé','Braise de sarment, jus corsé, pommes soufflées.',95],
 ['🍗','Volaille en vessie','Farcie sous la peau, découpée en salle sur le guéridon.',64],
 ['🧀','Chariot de fromages affinés','Trente fromages de maîtres affineurs, servis à la demande.',24],
 ['🍮','Soufflé au Grand Marnier','Monté à la commande, flambé devant vous.',28],
 ['🍫','Sphère chocolat et feuille d’or','Coque fondant sous un caramel chaud, cœur praliné.',32],
 ['🍾','Champagne millésimé','La coupe, tirée de la fontaine de la salle.',26],
];
function belTexFloor(){ return canvasTex(256,256,(x)=>{ x.fillStyle='#f3efe6'; x.fillRect(0,0,256,256); x.fillStyle='#1d1e26'; x.fillRect(0,0,128,128); x.fillRect(128,128,128,128);
  const r=seeded(11); for(let i=0;i<70;i++){ const d=r()<.5; x.strokeStyle=d?'rgba(255,255,255,.09)':'rgba(120,110,95,.16)'; x.lineWidth=.6+r()*1.4; x.beginPath(); const sx=r()*256, sy=r()*256; x.moveTo(sx,sy); x.bezierCurveTo(sx+r()*60-30,sy+r()*60-30,sx+r()*90-45,sy+r()*90-45,sx+r()*120-60,sy+r()*120-60); x.stroke(); }
  x.strokeStyle='#c9a24a'; x.lineWidth=2; x.strokeRect(1,1,126,126); x.strokeRect(129,129,126,126); x.strokeRect(129,1,126,126); x.strokeRect(1,129,126,126); },true); }
function belTexWall(){ return canvasTex(256,256,(x)=>{ x.fillStyle='#16233a'; x.fillRect(0,0,256,256); x.fillStyle='rgba(212,170,82,.22)';
  for(let j=0;j<4;j++) for(let i=0;i<4;i++){ const cx=i*64+(j%2?32:0)+16, cy=j*64+32; x.beginPath(); x.moveTo(cx,cy-20); x.quadraticCurveTo(cx+16,cy-6,cx,cy+20); x.quadraticCurveTo(cx-16,cy-6,cx,cy-20); x.fill(); x.beginPath(); x.arc(cx,cy+24,3,0,7); x.fill(); } },true); }
function belChair(root,x,z,ang,col){ const g=new THREE.Group(), gold=M('#d9b24a',{metalness:.75,roughness:.3}), v=M(col||'#7a1f2e',{roughness:.95});
 for(const [lx,lz] of [[-.13,-.13],[.13,-.13],[-.13,.13],[.13,.13]]) g.add(mesh(CY(.016,.012,.27,8),gold,lx,.135,lz));
 g.add(mesh(RB(.36,.08,.36,.03),v,0,.3,0)); const b=mesh(RB(.36,.44,.07,.03),v,0,.56,-.16); g.add(b); g.add(mesh(RB(.4,.03,.09,.012),gold,0,.79,-.16,false));
 g.position.set(x,0,z); g.rotation.y=ang; root.add(g); }
const belProtos=[];
function belDish(root,x,y,z,i,ry){ let p=belProtos[i]; if(!p){ p=new THREE.Group(); BEL_BUILD[i](p); belProtos[i]=p; } const o=p.clone(true); o.position.set(x,y,z); o.scale.setScalar(.72); o.rotation.y=ry||0; root.add(o); }
function belCloche(root,x,y,z,s){ const sil=M('#e9edf2',{metalness:.9,roughness:.16}); const d=mesh(geo('clo',()=>new THREE.SphereGeometry(.09,18,10,0,Math.PI*2,0,Math.PI/2)),sil,x,y,z); d.scale.setScalar(s||1); root.add(d); root.add(mesh(SP(.016,8,6),sil,x,y+.095*(s||1),z,false)); root.add(mesh(CY(.105*(s||1),.105*(s||1),.008,20),M('#ffffff',{roughness:.2}),x,y,z,false)); }
function belPlate(root,x,y,z,kind){ const pm=M('#ffffff',{roughness:.18}), gold=M('#d9b24a',{metalness:.8,roughness:.25});
 root.add(mesh(CY(.105,.08,.012,22),pm,x,y,z,false)); const rim=mesh(TO(.1,.004),gold,x,y+.007,z,false); rim.rotation.x=Math.PI/2; root.add(rim);
 if(kind===0){ const l=mesh(CA(.022,.07),M('#e2502f',{roughness:.5}),x,y+.03,z,false); l.rotation.z=Math.PI/2; root.add(l); root.add(mesh(SP(.018,8,6),M('#f0c64a'),x+.05,y+.02,z+.03,false)); root.add(mesh(SP(.012,6,5),M('#6fae4f'),x-.04,y+.02,z-.04,false)); }
 else if(kind===1){ root.add(mesh(CY(.04,.045,.035,14),M('#7a3b26',{roughness:.6}),x,y+.025,z,false)); root.add(mesh(SP(.012,6,5),M('#2b2b30'),x,y+.05,z,false)); for(let k=0;k<3;k++) root.add(mesh(SP(.01,6,5),M('#c8553d'),x+Math.cos(k*2.1)*.065,y+.014,z+Math.sin(k*2.1)*.065,false)); }
 else if(kind===2){ root.add(mesh(SP(.04,14,10),M('#3a2118',{roughness:.3,metalness:.2}),x,y+.045,z,false)); root.add(mesh(new THREE.BoxGeometry(.02,.002,.02),gold,x,y+.087,z,false)); }
 else { for(let k=0;k<3;k++){ root.add(mesh(CY(.022,.022,.016,12),M('#fbf1dc',{roughness:.5}),x+Math.cos(k*2.1)*.04,y+.016,z+Math.sin(k*2.1)*.04,false)); root.add(mesh(SP(.008,6,5),M('#1d1e26'),x+Math.cos(k*2.1)*.04,y+.03,z+Math.sin(k*2.1)*.04,false)); } } }
function belTable(root,x,z,n){ const cloth=M('#fbf8f2',{roughness:.9}), gold=M('#d9b24a',{metalness:.8,roughness:.25});
 root.add(mesh(CY(.56,.6,.5,28),cloth,x,.25,z)); root.add(mesh(CY(.58,.58,.02,28),cloth,x,.51,z)); const tr=mesh(TO(.585,.008),gold,x,.1,z,false); tr.rotation.x=Math.PI/2; root.add(tr);
 root.add(mesh(CY(.03,.045,.03,12),gold,x,.535,z,false)); root.add(mesh(CY(.008,.008,.16,6),gold,x,.61,z,false));                                  // chandelier de table
 for(let k=0;k<3;k++){ const a=k*2.094; root.add(mesh(CY(.006,.006,.07,6),M('#fff8e8'),x+Math.cos(a)*.04,.71,z+Math.sin(a)*.04,false)); const fl=mesh(SP(.012,8,6),M('#ffd27a',{emissive:'#ffb347',emissiveIntensity:2}),x+Math.cos(a)*.04,.76,z+Math.sin(a)*.04,false); root.add(fl); root.add(mesh(CY(.004,.004,.08,5),gold,x+Math.cos(a)*.02,.66,z+Math.sin(a)*.02,false)); }
 const seats=[]; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+Math.PI/4, cx=x+Math.cos(a)*.82, cz=z+Math.sin(a)*.82, ry=Math.atan2(x-cx,z-cz); belChair(root,cx,cz,ry,(Math.round(x)+Math.round(z))%2?'#7a1f2e':'#1f4a3d');
  const px=x+Math.cos(a)*.36, pz=z+Math.sin(a)*.36; seats.push({x:cx,z:cz,ry,px,pz}); for(const s of [-1,1]) root.add(mesh(new THREE.BoxGeometry(.012,.004,.1),M('#e9edf2',{metalness:.9,roughness:.2}),px-Math.sin(a)*.14*s,.523,pz+Math.cos(a)*.14*s,false));
  const gl=mesh(CY(.028,.012,.07,10),M('#ffffff',{transparent:true,opacity:.35,roughness:.05}),x+Math.cos(a+.5)*.3,.6,z+Math.sin(a+.5)*.3,false); root.add(gl); root.add(mesh(CY(.004,.004,.05,5),M('#ffffff',{transparent:true,opacity:.5}),gl.position.x,.545,gl.position.z,false)); }
 return seats; }
function belChandelier(root,x,z,sc){ const g=new THREE.Group(), gold=M('#e2bd58',{metalness:.85,roughness:.22}), cry=new THREE.MeshStandardMaterial({color:'#fff7e0',emissive:'#ffe2a0',emissiveIntensity:1.6,roughness:.05,metalness:.2,transparent:true,opacity:.92});
 g.add(mesh(CY(.012,.012,1.4,6),gold,0,.9,0,false)); g.add(mesh(SP(.07,12,10),gold,0,.2,0,false));
 const pts=[]; for(const [r,y,n] of [[.62,0,22],[.42,-.22,16],[.22,-.42,10]]){ const ring=mesh(TO(r,.018),gold,0,y,0,false); ring.rotation.x=Math.PI/2; g.add(ring);
   for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; pts.push([Math.cos(a)*r,y-.09,Math.sin(a)*r,1]); pts.push([Math.cos(a)*r,y-.2,Math.sin(a)*r,.6]); if(i%2===0){ const c=mesh(CY(.008,.008,.09,5),M('#fff8e8'),Math.cos(a)*r,y+.06,Math.sin(a)*r,false); g.add(c); g.add(mesh(SP(.016,6,5),M('#ffd27a',{emissive:'#ffb347',emissiveIntensity:2.4}),Math.cos(a)*r,y+.12,Math.sin(a)*r,false)); } } }
 for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const arm=mesh(CY(.008,.008,.64,5),gold,Math.cos(a)*.31,.1,Math.sin(a)*.31,false); arm.rotation.z=Math.PI/2-.33; arm.rotation.y=-a; g.add(arm); }
 pts.push([0,-.62,0,1.8]);
 const im=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.035),cry,pts.length), m4=new THREE.Matrix4(); pts.forEach((p,i)=>{ m4.makeScale(p[3],p[3]*1.7,p[3]); m4.setPosition(p[0],p[1],p[2]); im.setMatrixAt(i,m4); }); g.add(im);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#ffd9a0',transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(2.6,2.6,1); glow.position.y=-.2; g.add(glow);
 g.position.set(x,2.75,z); g.scale.setScalar(sc||1); root.add(g); glow.userData.dyn=1; visit.anim.push(T=>{ cry.emissiveIntensity=1.5+Math.sin(T*2.3+x)*.2; glow.material.opacity=.45+Math.sin(T*2.3+x)*.06; }); }
function belPalm(root,x,z){ const gold=M('#d9b24a',{metalness:.8,roughness:.25}), lf=M('#2f7a4a',{roughness:.8,side:THREE.DoubleSide}); root.add(mesh(CY(.2,.14,.36,16),gold,x,.18,z)); root.add(mesh(CY(.035,.05,.9,8),M('#6b4a33'),x,.8,z));
 for(let i=0;i<9;i++){ const a=i/9*Math.PI*2, l=mesh(geo('plf',()=>new THREE.SphereGeometry(.34,8,6)),lf,x+Math.cos(a)*.3,1.3+(i%3)*.06,z+Math.sin(a)*.3); l.scale.set(1,.08,.3); l.rotation.y=-a; l.rotation.z=-.35; root.add(l); } }
function buildBelmont(root){
 const gold=M('#d9b24a',{metalness:.8,roughness:.25}), gold2=M('#e9cc78',{metalness:.7,roughness:.3}), marble=M('#f4f0e8',{roughness:.2,metalness:.05}), dark=M('#1d1e26',{roughness:.35}), copper=M('#c9713d',{metalness:.85,roughness:.25}),
  velvet=M('#7a1f2e',{roughness:.95}), green=M('#17382f',{roughness:.6}), glass=new THREE.MeshStandardMaterial({color:'#bfe6f2',transparent:true,opacity:.28,roughness:.05,metalness:.1}), wood=M('#3b241a',{roughness:.5});
 // sol de marbre, socle
 const ft=belTexFloor(); ft.repeat.set(BW/1.7,BD/1.7); const fl=ownMesh(new THREE.PlaneGeometry(BW,BD),new THREE.MeshStandardMaterial({map:ft,roughness:.16,metalness:.12}),BW/2,0,BD/2,false); fl.userData.dyn=1; fl.rotation.x=-Math.PI/2; root.add(fl);
 root.add(mesh(new THREE.BoxGeometry(BW+.6,.5,BD+.6),dark,BW/2,-.26,BD/2,false)); root.add(mesh(new THREE.BoxGeometry(BW+.7,.06,BD+.7),gold,BW/2,-.05,BD/2,false));
 // murs : soubassement vert, damas bleu nuit, moulures dorées
 const wt=belTexWall(); wt.repeat.set(6,1.4); const wallM=new THREE.MeshStandardMaterial({map:wt,roughness:.8});
 root.add(ownMesh(new THREE.BoxGeometry(BW+.2,BH,.2),wallM,BW/2-.1,BH/2,-.1)); const lw=ownMesh(new THREE.BoxGeometry(.2,BH,BD),wallM,-.1,BH/2,BD/2); root.add(lw);
 root.add(mesh(new THREE.BoxGeometry(BW,.9,.06),green,BW/2,.45,.03,false)); root.add(mesh(new THREE.BoxGeometry(.06,.9,BD),green,.03,.45,BD/2,false));
 for(const y of [.92,BH-.08,BH+.05]){ root.add(mesh(new THREE.BoxGeometry(BW+.1,y>BH?.14:.06,y>BH?.34:.09),gold,BW/2,y,y>BH?-.06:.05,false)); root.add(mesh(new THREE.BoxGeometry(y>BH?.34:.09,y>BH?.14:.06,BD+.1),gold,y>BH?-.06:.05,y,BD/2,false)); }
 for(let x=.9;x<BW;x+=1.35) root.add(mesh(new THREE.BoxGeometry(.9,.55,.02),M('#1f4a3d',{roughness:.5}),x,.47,.065,false));
 // hautes fenêtres en arc + rideaux de velours
 const winM=new THREE.MeshStandardMaterial({color:'#26345c',emissive:'#5a78c8',emissiveIntensity:.55,roughness:.2});
 for(const x of [1.9,4.5,7.1,9.7,12.3]){ root.add(mesh(new THREE.BoxGeometry(1.25,1.7,.05),gold,x,1.85,.04,false)); root.add(mesh(new THREE.BoxGeometry(1.1,1.6,.04),winM,x,1.85,.07,false));
  const ar=mesh(geo('bar',()=>new THREE.CylinderGeometry(.625,.625,.05,24,1,false,0,Math.PI)),gold,x,2.7,.04,false); ar.rotation.x=Math.PI/2; ar.rotation.y=Math.PI/2; root.add(ar); const ag=mesh(geo('bag',()=>new THREE.CylinderGeometry(.55,.55,.04,24,1,false,0,Math.PI)),winM,x,2.7,.07,false); ag.rotation.x=Math.PI/2; ag.rotation.y=Math.PI/2; root.add(ag);
  for(const b of [-.36,0,.36]) root.add(mesh(new THREE.BoxGeometry(.025,1.6,.02),gold,x+b,1.85,.1,false)); root.add(mesh(new THREE.BoxGeometry(1.1,.025,.02),gold,x,1.85,.1,false));
  for(const s of [-1,1]){ const cu=mesh(RB(.34,2.35,.12,.05),velvet,x+s*.72,1.95,.14); cu.scale.x=.9; root.add(cu); root.add(mesh(RB(.4,.07,.15,.02),gold,x+s*.72,1.5,.15,false)); } root.add(mesh(RB(1.85,.2,.16,.05),velvet,x,3.08,.14,false)); }
 belSpot(7.1,2.2,.2,'Rideaux de velours et hautes fenêtres','Cinq baies en arc de plus de deux mètres, drapées de velours grenat retenu par des embrasses dorées.','Décor');
 belSpot(BW*.45,.05,BD*.62,'Sol en marbre damier','Marbre noir et blanc veiné, chaque dalle cerclée d’un filet de laiton. Poli tous les matins.','Décor');
 // cave à vins vitrée (mur de gauche)
 { const z0=.8, z1=5.2; root.add(mesh(new THREE.BoxGeometry(.1,2.6,z1-z0),wood,.04,1.3,(z0+z1)/2)); for(const y of [.03,2.6]) root.add(mesh(new THREE.BoxGeometry(.5,.06,z1-z0),wood,.3,y,(z0+z1)/2)); root.add(mesh(new THREE.BoxGeometry(.03,2.5,z1-z0-.1),new THREE.MeshStandardMaterial({color:'#dff3f8',transparent:true,opacity:.1,roughness:.05}),.57,1.3,(z0+z1)/2,false));
  for(const z of [z0,(z0+z1)/2,z1]) root.add(mesh(new THREE.BoxGeometry(.56,2.66,.06),gold,.3,1.33,z,false)); root.add(mesh(new THREE.BoxGeometry(.6,.08,z1-z0+.1),gold,.3,2.66,(z0+z1)/2,false));
  const bots=[]; for(let y=.25;y<2.5;y+=.22) for(let z=z0+.18;z<z1-.1;z+=.15) if(Math.abs(z-(z0+z1)/2)>.1) bots.push([.36,y,z]);
  const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.045,.045,.3,8).rotateZ(Math.PI/2),M('#1f3a2a',{roughness:.25,metalness:.2}),bots.length), m4=new THREE.Matrix4(), col=new THREE.Color(); bots.forEach((p,i)=>{ m4.makeTranslation(p[0],p[1],p[2]); im.setMatrixAt(i,m4); im.setColorAt(i,col.set(['#1f3a2a','#3a1f26','#2a2a1f','#1d2a3a'][i%4])); }); root.add(im);
  const gl=mesh(new THREE.BoxGeometry(.02,2.4,z1-z0-.2),new THREE.MeshBasicMaterial({color:'#e8b46a'}),.1,1.3,(z0+z1)/2,false); root.add(gl);
  belSpot(.7,1.5,3,'Cave à vins vitrée','Trois cents bouteilles à température, du sol au plafond. Le sommelier y monte à l’échelle.','Équipement'); }
 // bar à champagne en marbre (mur de gauche)
 { const z0=11.4, z1=16.6, zc=(z0+z1)/2; root.add(mesh(new THREE.BoxGeometry(.22,2.2,z1-z0),wood,.15,1.6,zc)); for(const y of [1.25,1.75,2.25]){ root.add(mesh(new THREE.BoxGeometry(.3,.04,z1-z0-.1),gold,.22,y,zc,false)); root.add(mesh(new THREE.BoxGeometry(.02,.42,z1-z0-.2),new THREE.MeshBasicMaterial({color:'#ffd9a0',transparent:true,opacity:.35}),.28,y+.24,zc,false));
   for(let z=z0+.2;z<z1-.1;z+=.2){ const c=['#2f6b4a','#c98a2e','#7a1f2e','#e8e2d0','#3a5a8c'][Math.floor((z*7+y*3)%5)]; root.add(mesh(CY(.04,.045,.24,8),M(c,{roughness:.2,metalness:.1}),.24,y+.14,z,false)); root.add(mesh(CY(.014,.016,.08,6),M(c),.24,y+.3,z,false)); } }
  root.add(mesh(RB(.75,1.0,z1-z0,.05),dark,1.25,.5,zc)); root.add(mesh(RB(.9,.07,z1-z0+.14,.03),marble,1.25,1.04,zc)); root.add(mesh(new THREE.BoxGeometry(.03,.06,z1-z0+.1),gold,1.66,.2,zc,false)); for(let z=z0+.3;z<z1;z+=.9) root.add(mesh(new THREE.BoxGeometry(.02,.7,.5),gold,1.635,.55,z,false));
  for(let z=z0+.5;z<z1;z+=.85){ root.add(mesh(CY(.025,.025,.62,8),gold,2.15,.31,z)); root.add(mesh(CY(.17,.17,.07,16),velvet,2.15,.65,z)); root.add(mesh(CY(.13,.15,.02,14),gold,2.15,.01,z,false)); }
  { const bx=1.25, bz=z0+.8; root.add(mesh(CY(.17,.12,.2,16),M('#e9edf2',{metalness:.9,roughness:.18}),bx,1.18,bz)); for(let k=0;k<3;k++){ const b=mesh(CY(.035,.04,.26,8),M('#1f3a2a',{roughness:.2}),bx+Math.cos(k*2.1)*.06,1.3,bz+Math.sin(k*2.1)*.06,false); b.rotation.z=.25*Math.cos(k*2.1); root.add(b); root.add(mesh(CY(.02,.02,.06,6),gold,b.position.x,1.45,b.position.z,false)); } }
  for(let k=0;k<5;k++){ const z=z0+1.8+k*.55; root.add(mesh(CY(.04,.008,.07,10),M('#ffffff',{transparent:true,opacity:.4,roughness:.05}),1.2,1.16,z,false)); root.add(mesh(CY(.005,.005,.07,5),M('#ffffff',{transparent:true,opacity:.5}),1.2,1.1,z,false)); }
  belSpot(1.3,1.25,zc,'Bar à champagne','Comptoir en marbre de Carrare, étagères rétro-éclairées, seau en argent toujours plein.','Équipement'); }
 // cuisine ouverte : piano de cuisson en cuivre, hotte dorée, rôtissoire, passe en marbre
 { const x0=16.6, x1=23.4, xc=(x0+x1)/2;
  root.add(mesh(new THREE.BoxGeometry(x1-x0,BH-1,.04),M('#f7f4ee',{roughness:.25}),xc,1+ (BH-1)/2,.03,false)); for(let x=x0;x<=x1;x+=.4) root.add(mesh(new THREE.BoxGeometry(.012,BH-1,.01),M('#d8d2c6'),x,1+(BH-1)/2,.055,false));
  // piano
  const px0=17.2, px1=21.2, pc=(px0+px1)/2; root.add(mesh(RB(px1-px0,.86,.85,.04),copper,pc,.43,.6)); root.add(mesh(RB(px1-px0+.06,.05,.9,.02),dark,pc,.89,.6)); root.add(mesh(CY(.02,.02,px1-px0+.1,8).clone().rotateZ(Math.PI/2),gold,pc,.62,1.08,false));
  for(let i=0;i<4;i++){ const x=px0+.5+i*1; root.add(mesh(RB(.8,.5,.03,.02),M('#8a4a26',{metalness:.7,roughness:.3}),x,.4,1.035,false)); root.add(mesh(new THREE.BoxGeometry(.5,.2,.01),M('#2a1a12',{emissive:'#ff7a2a',emissiveIntensity:i%2?.9:.25}),x,.42,1.055,false)); root.add(mesh(CY(.012,.012,.56,6).clone().rotateZ(Math.PI/2),gold,x,.7,1.07,false));
   for(const dz of [-.18,.2]){ const bz=.6+dz; const rg=mesh(TO(.12,.014),dark,x,.925,bz,false); rg.rotation.x=Math.PI/2; root.add(rg); const fl=mesh(TO(.07,.012),new THREE.MeshBasicMaterial({color:'#6fb7ff'}),x,.93,bz,false); fl.rotation.x=Math.PI/2; root.add(fl); }
   const pot=mesh(CY(.13,.12,.16+i%2*.08,18),copper,x,1.02,.42+ (i%2)*.38); root.add(pot); root.add(mesh(CY(.012,.012,.2,6).clone().rotateZ(Math.PI/2),gold,x+.2,1.06,pot.position.z,false));
   for(const k of [-1,1]) root.add(mesh(SP(.022,8,6),gold,x+k*.2,.75,1.06,false)); }
  // hotte
  root.add(mesh(new THREE.BoxGeometry(px1-px0+.3,.5,.95),gold2,pc,2.35,.52)); const hd=mesh(new THREE.BoxGeometry(px1-px0-.6,.5,.6),gold2,pc,2.83,.36); root.add(hd); root.add(mesh(new THREE.BoxGeometry(px1-px0+.34,.05,1),copper,pc,2.1,.52,false)); for(let x=px0+.4;x<px1;x+=.8) root.add(mesh(SP(.05,10,8),M('#fff1c9',{emissive:'#ffd98a',emissiveIntensity:1.6}),x,2.07,.6,false));
  for(let i=0;i<7;i++){ const x=px0+.3+i*.55; root.add(mesh(CY(.008,.008,.12,5),gold,x,2.0,.95,false)); const pn=mesh(CY(.09-(i%3)*.015,.07-(i%3)*.01,.04,14),copper,x,1.9,.95,false); pn.rotation.x=Math.PI/2; root.add(pn); }
  belSpot(pc,1.2,.9,'Piano de cuisson en cuivre','Huit feux, quatre fours, fabriqué sur mesure. Les casseroles sont étamées à la main.','Équipement');
  belSpot(pc,2.6,.6,'Hotte en laiton doré','Elle aspire toute la brigade sans un bruit, et brille comme un bijou.','Équipement');
  // rôtissoire
  { const rx=22.3; root.add(mesh(RB(1.5,2.0,.8,.04),dark,rx,1.0,.55)); root.add(mesh(new THREE.BoxGeometry(1.25,1.2,.04),M('#2a1208',{emissive:'#ff6a1e',emissiveIntensity:.8}),rx,1.2,.9,false)); root.add(mesh(new THREE.BoxGeometry(1.3,1.25,.02),glass,rx,1.2,.97,false)); root.add(mesh(new THREE.BoxGeometry(1.4,.06,.06),gold,rx,1.85,.97,false)); root.add(mesh(new THREE.BoxGeometry(1.4,.06,.06),gold,rx,.56,.97,false));
   for(const [y,ph] of [[1.45,0],[.95,1.5]]){ const sp=new THREE.Group(); sp.position.set(rx,y,.86); sp.add(mesh(CY(.012,.012,1.2,6).clone().rotateZ(Math.PI/2),gold,0,0,0,false)); for(const dx of [-.36,0,.36]){ const ch=mesh(SP(.11,12,10),M('#c98a3e',{roughness:.5}),dx,0,0,false); ch.scale.set(1.25,.9,.9); sp.add(ch); for(const s of [-1,1]) sp.add(mesh(SP(.04,8,6),M('#b87a34'),dx+s*.1,-.06,.05,false)); } sp.userData.dyn=1; root.add(sp); visit.anim.push(T=>{ sp.rotation.x=T*1.2+ph; }); }
   const fg=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#ff8a3a',transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending})); fg.scale.set(1.6,1.4,1); fg.position.set(rx,1.1,1.05); root.add(fg); visit.anim.push(T=>{ fg.material.opacity=.45+Math.sin(T*7)*.08+Math.sin(T*13)*.05; });
   belSpot(rx,1.3,1.05,'Rôtissoire à flammes','Six volailles de Bresse tournent devant un vrai feu de bois, toute la journée.','Équipement'); }
  // passe en marbre chauffant, lampes en cuivre, cloches
  { const z=2.7; root.add(mesh(RB(x1-x0-.4,.92,.7,.04),dark,xc,.46,z)); root.add(mesh(RB(x1-x0-.3,.07,.82,.03),marble,xc,.955,z)); root.add(mesh(new THREE.BoxGeometry(x1-x0-.4,.03,.02),gold,xc,.3,z+.36,false)); for(let x=x0+.5;x<x1-.3;x+=.9) root.add(mesh(new THREE.BoxGeometry(.6,.5,.015),M('#2a2c36',{roughness:.3}),x,.55,z+.36,false));
   for(let i=0;i<6;i++){ const x=x0+.9+i*1.05; root.add(mesh(CY(.006,.006,1.5,5),gold,x,2.4,z,false)); const sh=mesh(geo('lsh',()=>new THREE.SphereGeometry(.16,16,8,0,Math.PI*2,0,Math.PI/2)),copper,x,1.62,z); root.add(sh); root.add(mesh(SP(.05,10,8),M('#fff1c9',{emissive:'#ffb347',emissiveIntensity:2.2}),x,1.63,z,false));
    visit.pass.push({x,z,busy:null}); }
   belSpot(xc,1.15,z,'Passe en marbre chauffant','Les assiettes y attendent sous des lampes de cuivre et des cloches d’argent. Rien ne sort tiède. Enfin, presque.','Équipement'); } }
 // vivier à homards
 { const x=23.2, z=7.4; root.add(mesh(RB(.8,.7,2.0,.04),dark,x,.35,z)); root.add(mesh(new THREE.BoxGeometry(.7,.9,1.9),new THREE.MeshStandardMaterial({color:'#3fb6d8',transparent:true,opacity:.34,roughness:.05,emissive:'#1e6f9a',emissiveIntensity:.5}),x,1.16,z,false)); for(const dz of [-.97,.97]) root.add(mesh(new THREE.BoxGeometry(.76,.96,.04),gold,x,1.16,z+dz,false)); root.add(mesh(RB(.8,.06,2.0,.02),gold,x,1.65,z,false));
  root.add(mesh(new THREE.BoxGeometry(.66,.05,1.85),M('#d9c9a0',{roughness:.9}),x,.74,z,false));
  for(let i=0;i<4;i++){ const L=new THREE.Group(), red=M(i%2?'#2c4a8a':'#c9402a',{roughness:.4}); const b=mesh(CA(.035,.12),red,0,0,0,false); b.rotation.x=Math.PI/2; L.add(b); for(const s of [-1,1]){ const c=mesh(SP(.03,8,6),red,s*.06,0,.12,false); c.scale.set(.8,.6,1.5); L.add(c); } const t=mesh(SP(.04,8,6),red,0,0,-.13,false); t.scale.set(1.4,.4,.8); L.add(t); L.position.set(x,.83+i%2*.25,z-.6+i*.4); L.userData.dyn=1; root.add(L); visit.anim.push(T=>{ L.position.z=z+Math.sin(T*.35+i*1.7)*.65; L.rotation.y=Math.cos(T*.35+i*1.7)>0?0:Math.PI; L.position.y=.85+(i%2)*.3+Math.sin(T*.8+i)*.04; }); }
  for(let i=0;i<8;i++){ const bb=mesh(SP(.012,6,5),M('#ffffff',{transparent:true,opacity:.6}),x+((i%3)-1)*.2,.8,z-.8+i*.22,false); bb.userData.dyn=1; root.add(bb); visit.anim.push(T=>{ bb.position.y=.8+((T*.35+i*.13)%1)*.75; }); }
  belSpot(x-.3,1.3,z,'Vivier à homards','Les homards bleus arrivent de Bretagne deux fois par semaine. Le client choisit le sien.','Équipement'); }
 // fontaine de champagne au centre
 { const x=BCX, z=BFZ; root.add(mesh(CY(1.25,1.25,.012,40),velvet,x,.012,z,false)); const rr=mesh(TO(1.25,.02),gold,x,.02,z,false); rr.rotation.x=Math.PI/2; root.add(rr);
  root.add(mesh(CY(.5,.56,.7,28),marble,x,.35,z)); root.add(mesh(CY(.62,.62,.05,28),gold,x,.72,z)); const cg=M('#fff6dc',{transparent:true,opacity:.55,roughness:.05,metalness:.2,emissive:'#ffe2a0',emissiveIntensity:.35});
  const cups=[]; let y=.76; for(const [n,r] of [[14,.48],[10,.33],[6,.19],[1,0]]){ for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+y; cups.push([x+Math.cos(a)*r,y,z+Math.sin(a)*r]); } y+=.13; }
  const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.06,.012,.1,10),cg,cups.length), m4=new THREE.Matrix4(); cups.forEach((p,i)=>{ m4.makeTranslation(p[0],p[1]+.05,p[2]); im.setMatrixAt(i,m4); }); root.add(im);
  const st=mesh(CY(.012,.03,.5,8),new THREE.MeshBasicMaterial({color:'#ffe9b0',transparent:true,opacity:.6}),x,1.5,z,false); st.userData.dyn=1; root.add(st); visit.anim.push(T=>{ st.scale.x=st.scale.z=1+Math.sin(T*11)*.25; });
  for(let i=0;i<10;i++){ const d=mesh(SP(.014,6,5),new THREE.MeshBasicMaterial({color:'#fff1c0'}),x,1.2,z,false); d.userData.dyn=1; root.add(d); visit.anim.push(T=>{ const p=(T*.9+i*.1)%1, a=i*2.3; d.position.set(x+Math.cos(a)*p*.5,1.28-p*p*.5,z+Math.sin(a)*p*.5); }); }
  belSpot(x,1.25,z,'Fontaine de champagne','Une pyramide de quarante coupes de cristal. Le champagne coule du sommet, du matin au soir.','Décor'); }
 // tapis rouge de l'entrée à la fontaine, statues dorées, pupitre du maître d'hôtel
 { const L=BD-BFZ-1.25, zc=BD-L/2; root.add(mesh(new THREE.BoxGeometry(1.6,.016,L),velvet,BCX,.01,zc,false)); for(const k of [-1,1]) root.add(mesh(new THREE.BoxGeometry(.05,.02,L),gold,BCX+k*.77,.012,zc,false)); }
 for(const k of [-1,1]){ const sx=BCX+k*1.9, sz=BD-.7; root.add(mesh(CY(.26,.3,.5,20),marble,sx,.25,sz)); root.add(mesh(CY(.1,.16,.5,12),gold,sx,.75,sz)); root.add(mesh(SP(.13,14,12),gold,sx,1.1,sz)); const w=mesh(SP(.2,12,10),gold,sx,.95,sz-.08); w.scale.set(1.4,.9,.25); root.add(w); root.add(mesh(SP(.07,10,8),gold,sx,1.3,sz)); }
 belSpot(BCX+1.9,1.1,BD-.7,'Statues dorées','Deux victoires ailées à la feuille d’or gardent l’entrée. Belmont dit qu’elles lui ressemblent.','Décor');
 root.add(mesh(RB(.5,1.0,.4,.03),wood,BCX-1.75,.5,BD-2.4)); { const lec=mesh(RB(.56,.04,.46,.01),gold,BCX-1.75,1.03,BD-2.4,false); lec.rotation.x=.2; root.add(lec); }
 // deux grands tableaux dorés sur le mur de gauche
 for(const [z,c1,c2] of [[6.9,'#3f6f8f','#e8b46a'],[9.2,'#6b4a6a','#f0d2a0']]){ root.add(mesh(new THREE.BoxGeometry(.06,1.5,1.7),gold,.04,2.05,z,false)); root.add(mesh(new THREE.BoxGeometry(.03,1.3,1.5),M(c1,{roughness:.8}),.08,2.05,z,false)); root.add(mesh(new THREE.BoxGeometry(.02,.5,1.5),M(c2,{roughness:.8}),.095,1.72,z,false)); root.add(mesh(SP(.16,12,10),M('#fff1c9',{emissive:'#ffd98a',emissiveIntensity:.5}),.1,2.35,z-.3,false)); }
 // piano à queue sur son estrade
 { const x=BW-4.4, z=BD-3.8; visit.stage={x,z}; root.add(mesh(CY(1.55,1.6,.14,36),wood,x,.07,z)); const rr=mesh(TO(1.56,.025),gold,x,.14,z,false); rr.rotation.x=Math.PI/2; root.add(rr);
  const pb=M('#101014',{roughness:.12,metalness:.3}); const sh=new THREE.Shape(); sh.moveTo(-.55,-.35); sh.lineTo(.55,-.35); sh.lineTo(.55,.2); sh.quadraticCurveTo(.5,.95,.05,1.0); sh.quadraticCurveTo(-.35,1.0,-.4,.5); sh.quadraticCurveTo(-.42,.25,-.55,.2); sh.closePath();
  const bg=new THREE.ExtrudeGeometry(sh,{depth:.22,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2}); const body=new THREE.Mesh(bg,pb); body.rotation.x=-Math.PI/2; body.position.set(x,.62,z); body.rotation.z=.5; body.castShadow=true; root.add(body);
  const lid=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:false}),pb); lid.rotation.set(-Math.PI/2+.0,0,.5); lid.position.set(x,.9,z); const lg=new THREE.Group(); lg.add(lid); lg.rotation.z=0; root.add(lg); lid.rotation.y=-.45; lid.position.y=1.08; lid.position.x=x+.2;
  for(const [lx,lz] of [[-.4,.25],[.4,.25],[.1,-.75]]){ const c=Math.cos(.5), s=Math.sin(.5); root.add(mesh(CY(.035,.025,.48,10),pb,x+lx*c+lz*s,.38,z-lx*s+lz*c)); }
  const kb=mesh(new THREE.BoxGeometry(.98,.03,.12),M('#fbf8f2',{roughness:.3}),x+.2,.7,z+.365,false); kb.rotation.y=.5; root.add(kb);
  { const bn=new THREE.Group(); bn.position.set(x+.335,.14,z+.615); bn.rotation.y=.5; bn.add(mesh(RB(.56,.07,.28,.025),velvet,0,.275,0)); bn.add(mesh(RB(.58,.02,.3,.008),gold,0,.235,0,false)); for(const [lx,lz] of [[-.24,-.1],[.24,-.1],[-.24,.1],[.24,.1]]) bn.add(mesh(CY(.018,.014,.23,8),gold,lx,.115,lz)); root.add(bn); }
  visit.pianist={x:x+.335,z:z+.615};
  // les touches, le pupitre et la partition
  { const kg=new THREE.Group(); kg.position.set(x+.2,.7,z+.365); kg.rotation.y=.5; for(let i=0;i<22;i++) if(i%7!==2&&i%7!==6) kg.add(mesh(new THREE.BoxGeometry(.022,.02,.07),M('#15151a',{roughness:.3}),-.45+i*.0425,.02,-.022,false)); kg.add(mesh(new THREE.BoxGeometry(.5,.26,.012),pb,0,.2,-.13,false)).rotation.x=-.2; kg.add(mesh(new THREE.BoxGeometry(.36,.2,.006),M('#fbf8f2',{roughness:.6}),0,.2,-.118,false)).rotation.x=-.2; root.add(kg); }
  // des notes s'envolent du piano
  { const nt=canvasTex(64,64,(c)=>{ c.fillStyle='#ffe9a8'; c.font='700 52px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('\u266A',32,34); }); for(let i=0;i<5;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:nt,transparent:true,depthWrite:false})); sp.userData.dyn=1; root.add(sp); visit.anim.push(T=>{ const p=((T*.22+i*.2)%1); sp.position.set(x+.15+Math.sin(T*.9+i*2)*.25+i*.08,1.15+p*1.5,z-.1+Math.cos(T*.7+i)*.2); sp.material.opacity=Math.sin(p*Math.PI)*.85; sp.scale.setScalar(.2+p*.12); }); } }
  belSpot(x,1.25,z,'Piano à queue de concert','Un pianiste joue tous les soirs, sur une estrade en acajou. Jamais deux fois le même morceau.','Décor'); }
 // chariot de desserts
 { const x=16.0, z=5.9; visit.trolley={x,z}; const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=.4; for(const y of [.32,.66]) g.add(mesh(RB(.8,.03,.46,.01),marble,0,y,0)); for(const [lx,lz] of [[-.37,-.2],[.37,-.2],[-.37,.2],[.37,.2]]){ g.add(mesh(CY(.014,.014,.75,6),gold,lx,.4,lz)); g.add(mesh(CY(.05,.05,.03,10).clone().rotateZ(Math.PI/2),dark,lx,.05,lz,false)); } g.add(mesh(CY(.012,.012,.5,6).clone().rotateX(Math.PI/2),gold,.42,.8,0,false));
  const cols=['#f6c9d6','#7a3b26','#f4e3a8','#c8553d','#ffffff']; for(let i=0;i<5;i++){ const cx=-.3+i*.15; g.add(mesh(CY(.055,.055,.06,14),M(cols[i],{roughness:.5}),cx,.71,(i%2)*.14-.07,false)); g.add(mesh(SP(.016,8,6),M(i%2?'#c8553d':'#3a2118'),cx,.75,(i%2)*.14-.07,false)); }
  { const d=mesh(geo('clo2',()=>new THREE.SphereGeometry(.14,18,10,0,Math.PI*2,0,Math.PI/2)),new THREE.MeshStandardMaterial({color:'#ffffff',transparent:true,opacity:.3,roughness:.05}),.2,.34,0,false); g.add(d); g.add(mesh(CY(.1,.1,.09,16),M('#fbf1dc'),.2,.38,0,false)); for(let k=0;k<6;k++) g.add(mesh(SP(.018,6,5),M('#c8553d'),.2+Math.cos(k)*.07,.44,Math.sin(k)*.07,false)); } root.add(g);
  belSpot(x,1.0,z,'Chariot de desserts','Tartes fines, opéras, religieuses, soufflés : il roule de table en table et personne ne lui résiste.','Équipement'); }
 // cheminée de marbre entre les fenêtres et la cuisine
 { const x=14.65; root.add(mesh(RB(1.3,1.5,.4,.04),marble,x,.75,.22)); root.add(mesh(RB(1.5,.1,.5,.03),marble,x,1.52,.24)); root.add(mesh(new THREE.BoxGeometry(.8,.85,.1),M('#15100c'),x,.47,.4,false)); const fire=mesh(new THREE.ConeGeometry(.2,.5,8),new THREE.MeshBasicMaterial({color:'#ff9a3a',transparent:true,opacity:.9}),x,.35,.42,false); fire.userData.dyn=1; root.add(fire); const f2=mesh(new THREE.ConeGeometry(.12,.34,8),new THREE.MeshBasicMaterial({color:'#ffe08a'}),x+.05,.28,.44,false); f2.userData.dyn=1; root.add(f2); visit.anim.push(T=>{ fire.scale.y=1+Math.sin(T*8)*.18; fire.scale.x=1+Math.sin(T*11)*.1; f2.scale.y=1+Math.sin(T*13+1)*.25; });
  for(let k=0;k<3;k++){ const lg=mesh(CY(.05,.05,.5,8).clone().rotateZ(Math.PI/2),M('#4a2e1c'),x,.1+k%2*.07,.4+k*.03,false); lg.rotation.y=k*.4-.4; root.add(lg); }
  root.add(mesh(new THREE.BoxGeometry(.9,1.1,.04),gold,x,2.3,.06,false)); root.add(mesh(new THREE.BoxGeometry(.76,.96,.03),M('#8fb7c8',{metalness:.9,roughness:.08}),x,2.3,.08,false)); for(const s of [-1,1]){ root.add(mesh(CY(.03,.05,.22,10),gold,x+s*.52,1.68,.24)); root.add(mesh(SP(.03,8,6),M('#ffd27a',{emissive:'#ffb347',emissiveIntensity:2}),x+s*.52,1.84,.24,false)); }
  belSpot(x,1.2,.5,'Cheminée en marbre','Un vrai feu de bois sous un miroir doré à la feuille. Les meilleures tables sont juste devant.','Décor'); }
 // palmiers, lustres
 visit.palms=[[.7,5.9],[.7,10.6],[BW-.7,4.2],[BW-.7,BD-.8],[.8,BD-.5],[BCX-3.4,BD-.7],[BCX+3.4,BD-.7],[15.9,3.3]]; for(const [x,z] of visit.palms) belPalm(root,x,z);
 belChandelier(root,5.2,6.2,1.2); belChandelier(root,BCX,BFZ,1.7); belChandelier(root,17.2,6.6,1.2); belChandelier(root,5.6,12.6,1.2); belChandelier(root,17.0,12.2,1.1); belChandelier(root,BCX,4.0,1.1);
 belSpot(BCX,2.6,BFZ,'Lustres en cristal','Six lustres, plus de trois mille pampilles taillées à la main. Le plus grand pèse autant qu’un piano.','Décor');
 // tables rondes nappées, fauteuils de velours : de larges allées entre chaque table
 const tabs=[[3.6,4.7,4],[6.9,4.7,2],[10.2,4.7,4],[13.4,4.9,2],[3.6,7.9,2],[6.9,7.9,4],[16.2,8.6,4],[19.4,7.2,2],[4.6,11.1,4],[7.9,11.1,2],[15.6,11.8,4],[4.9,14.4,2],[8.2,14.4,4],[14.9,15.0,2],[21.2,10.2,2]];
 visit.tables=tabs.map(([x,z,n],i)=>({i,x,z,n,seats:belTable(root,x,z,n),state:'free',t:0,party:null,plates:[]}));
 belSpot(6.9,.95,7.9,'Tables nappées et fauteuils de velours','Nappes blanches jusqu’au sol, couverts en argent, chandelier sur chaque table. Les fauteuils sont rembourrés à la main.','Décor');
 // vestibule : les clients entrent et sortent par un porche doré, au bout du tapis
 { const z0=BD+.3, z1=BD+2.75, zc=(z0+z1)/2; root.add(mesh(new THREE.BoxGeometry(3.4,.5,z1-z0+.1),dark,BCX,-.26,zc,false)); root.add(mesh(new THREE.BoxGeometry(3.4,.02,z1-z0),M('#2a2b35',{roughness:.3}),BCX,-.005,zc,false)); root.add(mesh(new THREE.BoxGeometry(1.6,.016,z1-BD+.35),velvet,BCX,.01,(BD-.35+z1)/2,false));
  for(const k of [-1,1]){ root.add(mesh(new THREE.BoxGeometry(.05,.02,z1-BD+.35),gold,BCX+k*.77,.012,(BD-.35+z1)/2,false)); root.add(mesh(CY(.11,.13,2.5,16),marble,BCX+k*1.45,1.25,z1-.15)); root.add(mesh(new THREE.BoxGeometry(.36,.12,.36),gold,BCX+k*1.45,2.52,z1-.15,false)); root.add(mesh(new THREE.BoxGeometry(.36,.1,.36),gold,BCX+k*1.45,.05,z1-.15,false)); lantern(root,BCX+k*1.45,1.5,z1+.08); }
  root.add(mesh(new THREE.BoxGeometry(3.4,.28,.34),marble,BCX,2.72,z1-.15)); root.add(mesh(new THREE.BoxGeometry(3.5,.06,.4),gold,BCX,2.89,z1-.15,false)); root.add(mesh(new THREE.BoxGeometry(1.5,.2,.04),gold,BCX,2.72,z1+.03,false)); }
 belMerge(root);
 belSimInit(root);
}
// fusionne tout le décor fixe par matière : quelques dizaines d'objets à dessiner au lieu de milliers
function belMerge(root){
 root.updateMatrixWorld(true); const by=new Map(), gone=[];
 root.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh||o.userData.dyn) return; for(let p=o.parent;p&&p!==root;p=p.parent) if(p.userData.dyn) return;
  const m=o.material; if(!m||m.isSpriteMaterial) return; let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); g.applyMatrix4(o.matrixWorld); for(const k of Object.keys(g.attributes)) if(k!=='position'&&k!=='normal'&&k!=='uv') g.deleteAttribute(k); if(!g.attributes.uv||!g.attributes.normal) return;
  const key=m.uuid+(o.castShadow?'c':'n'); if(!by.has(key)) by.set(key,{m,c:o.castShadow,l:[]}); by.get(key).l.push(g); gone.push(o); });
 for(const o of gone) o.parent.remove(o);
 for(const {m,c,l} of by.values()){ const g=mergeGeometries(l,false); l.forEach(x=>x.dispose()); if(!g) continue; const me=new THREE.Mesh(g,m); me.castShadow=c; me.receiveShadow=true; me.userData.dyn=1; root.add(me); }
}
function belFit(){ const vf=FOV0*Math.PI/180, hf=2*Math.atan(Math.tan(vf/2)*innerWidth/innerHeight); return Math.max((BW*1.25)/(2*Math.tan(hf/2)),(BD*1.3+2)/(2*Math.tan(vf/2)))*1.02; }
function belHot(){ // pastilles dorées cliquables au-dessus des objets
 const box=$('#vov'); if(!box) return;
 BEL_INFO.forEach((h,i)=>{ let el=visit.els[i]; if(!el){ el=document.createElement('button'); el.className='vhot'; el.textContent='✦'; el.dataset.i=i; box.appendChild(el); visit.els[i]=el; }
  const p=h.a?toScreen(h.a.fx+.5,1.25,h.a.fy+.5):toScreen(h.x,h.y,h.z); el.style.transform=`translate(${p[0]-15}px,${p[1]-15}px) scale(.8)`; el.classList.toggle('on',visit.sel===i); });
}
function belCard(i){ visit.sel=i; const h=BEL_INFO[i], c=$('#vcard'); c.innerHTML=`${h.k==='Rival'&&whoImg('b')?'<div class="vp">'+whoImg('b')+'</div>':''}<div class="vk">${h.k}</div><b>${h.n}</b><p>${h.d}</p><div class="vl">${h.k==='Rival'?'Ton rival':'Pas encore dans ta boutique'}</div>`; c.classList.remove('hide'); sfx('pop'); }
function enterVisit(){
 if(visit.on||mode!=='play') return; if(state.story&&state.story.v&&!belOpen()){ toast('Le palace d’à côté est encore en travaux… Reviens au chapitre 5.'); return; } if(typeof rush!=='undefined'&&rush){ toast('Termine d’abord le coup de feu 🔥'); return; }
 if(watch.on) watchStop(); closeModal();
 if(!visit.built){ visit.built=true; buildBelmont(belRoot); }
 visit.on=true; belSun(true); visit.cam=Object.assign({},cam); visit.sel=null; cam.tx=BW/2+.3; cam.tz=BD/2+.4; cam.dist=belFit()*.42; cam.yaw=cam.yawT=Math.PI/4; cam.pitch=cam.pitchT=CAM_P0; document.body.classList.add('visit'); $('#vcard').classList.add('hide'); $('#vui').classList.remove('hide');
 if(!state.belSeen){ state.belSeen=1; save(); } toast('Bienvenue au Belmont ★★★★★ — touche les ✦ pour tout découvrir');
}
function exitVisit(){ if(!visit.on) return; visit.on=false; belSun(false); Object.assign(cam,visit.cam); document.body.classList.remove('visit'); $('#vui').classList.add('hide'); belRoot.visible=false; belLight.intensity=0; clampCam(); }
function visitInit(){
 const d=document.createElement('div'); d.id='vui'; d.className='hide';
 d.innerHTML='<div id="vtop"><button id="vback">‹ Mon bistrot</button><div id="vtitle"><b>Le Belmont</b><span>★★★★★</span></div><button id="vmenu">La carte</button></div><div id="vov"></div><div id="vcard" class="hide"></div>';
 document.body.appendChild(d);
 d.addEventListener('click',e=>{ const h=e.target.closest('.vhot'); if(h) return belCard(+h.dataset.i); if(e.target.closest('#vback')) return exitVisit(); if(e.target.closest('#vmenu')) return openPanel('belmenu'); if(e.target.closest('#vcard')){ $('#vcard').classList.add('hide'); visit.sel=null; } });
}
visitInit();
