/* =====================================================================
   v0.99.2 — déco des murs et des sols (1/4) : outils communs et sols.
   Tout s'ajoute en fin de liste : les parties existantes gardent leurs
   numéros de sol et de mur.
   ===================================================================== */
const BX=(w,h,d)=>geo(`bx${w},${h},${d}`,()=>new THREE.BoxGeometry(w,h,d));
const PL=(w,h)=>geo(`pl${w},${h}`,()=>new THREE.PlaneGeometry(w,h));
const DK=(r,s=28)=>geo(`dk${r},${s}`,()=>new THREE.CircleGeometry(r,s));                                                    // disque face à la salle
const CZ=(rt,rb,h,s=20)=>geo(`cz${rt},${rb},${h},${s}`,()=>new THREE.CylinderGeometry(rt,rb,h,s).rotateX(Math.PI/2));         // cylindre dont l'axe sort du mur
const CX=(rt,rb,h,s=12)=>geo(`cx${rt},${rb},${h},${s}`,()=>new THREE.CylinderGeometry(rt,rb,h,s).rotateZ(Math.PI/2));         // cylindre le long du mur
const KO=(r,h,s=12)=>geo(`ko${r},${h},${s}`,()=>new THREE.ConeGeometry(r,h,s));
const hsh=(a,b)=>{ const v=Math.sin(a*127.1+b*311.7)*43758.5453; return v-Math.floor(v); };                                  // hasard stable d'une case
const dot=(x,X,Y,R,c)=>{ x.fillStyle=c; x.beginPath(); x.arc(X,Y,R,0,7); x.fill(); };
const grad=(x,w,h,...st)=>{ const g=x.createLinearGradient(0,0,0,h); st.forEach((c,i)=>g.addColorStop(i/(st.length-1),c)); x.fillStyle=g; x.fillRect(0,0,w,h); };
const hillF=(x,w,h,base,amp,f,ph,col)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(0,h); for(let X=0;X<=w;X+=4) x.lineTo(X,base-amp*Math.sin(X/w*f+ph)); x.lineTo(w,h); x.fill(); };
const tx=(x,t,X,Y,s,c,wt)=>{ x.fillStyle=c; x.font=(wt||700)+' '+s+'px '+FONT; x.textAlign='center'; x.textBaseline='middle'; x.fillText(t,X,Y); };

/* ---------- sols : un motif est un carreau qui se répète ----------
   FCELL : les pièces d'un carreau (polygones en unités de carreau, débordant au besoin) et leur couleur (0 = a, 1 = b, -1 = au hasard).
   FCUST : les motifs dessinés à la main. p(x,s,F,r,mk,par) peint un carreau de côté s ; avec mk, il ne trace que le relief
           (blanc = surface, noir = joint). all(x,W,F,r,T) peint toute la salle d'un coup (sols sans joints). */
const rcp=(X,Y,w,h)=>[X,Y,X+w,Y,X+w,Y+h,X,Y+h];
const FCELL={
 herring(){ const L=[],u=.25; for(let j=-2;j<5;j++) for(let i=-2;i<5;i++){ const t=(((i-j)%4)+4)%4; if(t===0) L.push([rcp(i*u,j*u,2*u,u),0]); else if(t===3) L.push([rcp(i*u,j*u,u,2*u),1]); } return L; },
 chevron(){ const L=[],h=.25; for(let k=-1;k<7;k++){ const y=k*h; L.push([[0,y,.5,y-.5,.5,y-.5+h,0,y+h],k&1]); L.push([[.5,y-.5,1,y,1,y+h,.5,y-.5+h],k&1]); } return L; },
 hex(){ const L=[],w=.25,v=.25,R=v/1.5,b=R/2; for(let j=-1;j<6;j++) for(let i=-1;i<6;i++){ const cx=(i+(j&1?.5:0))*w, cy=j*v, jj=((j%4)+4)%4, ii=((i%4)+4)%4; L.push([[cx,cy-R,cx+w/2,cy-b,cx+w/2,cy+b,cx,cy+R,cx-w/2,cy+b,cx-w/2,cy-b],(jj===0&&ii===0)||(jj===2&&ii===2)?1:0]); } return L; },
 octo(){ const c=.22; return [[[c,0,1-c,0,1,c,1,1-c,1-c,1,c,1,0,1-c,0,c],0],[[0,-c,c,0,0,c,-c,0],1],[[1,-c,1+c,0,1,c,1-c,0],1],[[0,1-c,c,1,0,1+c,-c,1],1],[[1,1-c,1+c,1,1,1+c,1-c,1],1]]; },
 diag(){ return [[[0,-.5,.5,0,0,.5,-.5,0],0],[[1,-.5,1.5,0,1,.5,.5,0],0],[[0,.5,.5,1,0,1.5,-.5,1],0],[[1,.5,1.5,1,1,1.5,.5,1],0],[[.5,0,1,.5,.5,1,0,.5],1]]; },
 basket(){ const L=[], s=.5/3; for(let cy=0;cy<2;cy++) for(let cx=0;cx<2;cx++) for(let k=0;k<3;k++){ const X=cx*.5, Y=cy*.5; L.push([(cx+cy)&1?rcp(X+k*s,Y,s,.5):rcp(X,Y+k*s,.5,s),(cx+cy)&1]); } return L; },
 brickf(){ const L=[]; for(let r=0;r<4;r++) for(let c=-1;c<3;c++) L.push([rcp(c*.5+(r&1?.25:0),r*.25,.5,.25),(r+c)&1]); return L; },
 deck(){ const L=[]; for(let r=0;r<4;r++){ const o=[.15,.65,.4,.9][r]; L.push([rcp(o-1,r*.25,1,.25),r&1]); L.push([rcp(o,r*.25,1,.25),r&1]); } return L; },
 plank2(){ const L=[]; for(let r=0;r<2;r++){ const o=r?.3:.8; L.push([rcp(o-1,r*.5,1,.5),r]); L.push([rcp(o,r*.5,1,.5),r]); } return L; },
 check2(){ return [[rcp(0,0,.5,.5),0],[rcp(.5,0,.5,.5),1],[rcp(0,.5,.5,.5),1],[rcp(.5,.5,.5,.5),0]]; },
 mosaic(){ const L=[],n=6; for(let j=0;j<n;j++) for(let i=0;i<n;i++) L.push([rcp(i/n,j/n,1/n,1/n),-1]); return L; },
 stone(){ return [[rcp(0,0,.6,.55),0],[rcp(.6,0,.4,.35),1],[rcp(.6,.35,.4,.65),0],[rcp(0,.55,.6,.45),1]]; },
 cobble(){ const L=[]; for(let r=0;r<4;r++) for(let c=-1;c<5;c++) L.push([rcp(c*.25+(r&1?.125:0),r*.25,.25,.25),-1]); return L; },
};
// j : largeur du joint ; jc : 0 = trait sombre du bois, 1 = joint de carrelage, 2 = calfatage noir ; rd : coins arrondis ; va : nuance d'une pièce à l'autre ; g : brillance
const FOPT={ herring:{j:.012,va:.1,g:.56}, chevron:{j:.012,va:.1,g:.56}, hex:{j:.022,jc:1,va:.06}, octo:{j:.02,jc:1}, diag:{j:.016,jc:1,g:.62}, basket:{j:.012,va:.1,g:.56}, brickf:{j:.03,jc:1,va:.1,g:.3},
 deck:{j:.022,jc:2,va:.06,g:.5}, plank2:{j:.012,va:.08,g:.52}, check2:{j:.014,jc:1,g:.6}, mosaic:{j:.03,jc:1,g:.62}, stone:{j:.05,jc:1,rd:.04,va:.08,g:.3}, cobble:{j:.045,jc:1,rd:.07,va:.08,g:.28} };
const FCELLC={};
function fpCells(x,s,F,r,mk){ const pat=F.pat, L=FCELLC[pat]||(FCELLC[pat]=FCELL[pat]()), O=FOPT[pat]||{}, jw=(O.j||.014)*s, jcol=mk?'#000':O.jc===2?'#1d1a16':O.jc?(F.j||shade(F.b,-.35)):'rgba(60,35,15,.42)';
 if(mk||O.jc){ x.fillStyle=jcol; x.fillRect(0,0,s,s); }
 for(const [p,ci] of L){ let c='#fff';
  if(!mk){ const base=ci<0?(F.pal?F.pal[Math.floor(r()*F.pal.length)]:(r()<.5?F.a:F.b)):(ci&&!F.un?F.b:F.a); c=O.va?shade(base,Math.round((r()-.5)*8)/8*O.va):base; }
  x.fillStyle=c;
  if(O.rd){ rrect(x,p[0]*s+jw/2,p[1]*s+jw/2,(p[2]-p[0])*s-jw,(p[5]-p[1])*s-jw,O.rd*s); x.fill(); }
  else { x.beginPath(); x.moveTo(p[0]*s,p[1]*s); for(let i=2;i<p.length;i+=2) x.lineTo(p[i]*s,p[i+1]*s); x.closePath(); x.fill(); x.strokeStyle=jcol; x.lineWidth=jw; x.stroke(); } } }
const FCUST={
 // carreaux de ciment : trois motifs (mo), deux couleurs sur un fond
 cement:{ p(x,s,F){ const a=F.a,b=F.b,c=F.c||'#fff',K=[[0,0],[s,0],[0,s],[s,s]], di=(X,Y,R,col)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(X-R,Y); x.lineTo(X,Y-R); x.lineTo(X+R,Y); x.lineTo(X,Y+R); x.fill(); };
   x.fillStyle=a; x.fillRect(0,0,s,s);
   if(F.mo===1){ x.fillStyle=b; x.save(); x.translate(s/2,s/2); x.fillRect(-s*.27,-s*.27,s*.54,s*.54); x.rotate(Math.PI/4); x.fillRect(-s*.27,-s*.27,s*.54,s*.54); x.restore(); dot(x,s/2,s/2,s*.17,a); dot(x,s/2,s/2,s*.09,c); for(const [X,Y] of K){ di(X,Y,s*.24,c); di(X,Y,s*.13,b); } }
   else if(F.mo===2){ x.fillStyle=b; for(let k=0;k<4;k++){ x.save(); x.translate(s/2,s/2); x.rotate(k*Math.PI/2+Math.PI/4); x.beginPath(); x.ellipse(s*.2,0,s*.19,s*.085,0,0,7); x.fill(); x.restore(); } dot(x,s/2,s/2,s*.085,c); for(const [X,Y] of K){ dot(x,X,Y,s*.2,c); dot(x,X,Y,s*.1,b); } for(const [X,Y] of [[s/2,0],[s/2,s],[0,s/2],[s,s/2]]) di(X,Y,s*.07,b); }
   else { for(const [X,Y] of K) dot(x,X,Y,s*.5,b); for(const [X,Y] of K) dot(x,X,Y,s*.36,a); for(const [X,Y] of K) dot(x,X,Y,s*.2,c); di(s/2,s/2,s*.17,c); dot(x,s/2,s/2,s*.07,b); }
   x.strokeStyle=F.j||'rgba(90,80,70,.5)'; x.lineWidth=s*.022; x.strokeRect(0,0,s,s); } },
 // marbre : une dalle veinée, jamais deux fois la même
 slab:{ g:.68, p(x,s,F,r){ x.fillStyle=F.a; x.fillRect(0,0,s,s); for(let n=0;n<3;n++){ const g=x.createRadialGradient(r()*s,r()*s,0,s/2,s/2,s*.9); g.addColorStop(0,'rgba(255,255,255,.10)'); g.addColorStop(1,'rgba(0,0,0,.05)'); x.fillStyle=g; x.fillRect(0,0,s,s); }
   x.strokeStyle=F.b; x.lineCap='round'; for(let n=0;n<3;n++){ x.globalAlpha=.25+r()*.35; x.lineWidth=s*(.006+r()*.014); let X=r()*s, Y=-2; x.beginPath(); x.moveTo(X,Y); while(Y<s+2){ X+=(r()-.5)*s*.3; Y+=s*(.1+r()*.16); x.lineTo(X,Y); if(r()<.3) x.moveTo(X,Y); } x.stroke(); }
   x.globalAlpha=1; x.strokeStyle=F.j||'rgba(60,60,60,.35)'; x.lineWidth=s*.016; x.strokeRect(0,0,s,s); } },
 // écailles : des demi-ronds qui se recouvrent
 scale:{ mk:1, g:.62, p(x,s,F,r,mk){ x.fillStyle=mk?'#000':F.b; x.fillRect(0,0,s,s); const R=s*.25; for(let w=5;w>=-1;w--) for(let c=-1;c<3;c++){ const cx=(c+.5+(w&1?.5:0))*s*.5, cy=w*s*.25; x.fillStyle=mk?'#fff':((w+c)&1?F.a:(F.c||F.a)); x.beginPath(); x.arc(cx,cy,R,0,7); x.fill(); x.strokeStyle=mk?'#000':F.b; x.lineWidth=s*.028; x.stroke(); } } },
 // tatami : natte tressée, galon sombre, posée une fois dans un sens, une fois dans l'autre
 tatami:{ p(x,s,F,r,mk,par){ x.save(); if(par){ x.translate(s,0); x.rotate(Math.PI/2); } x.fillStyle=F.a; x.fillRect(0,0,s,s); x.strokeStyle='rgba(70,80,30,.2)'; x.lineWidth=s/64; for(let Y=s/40;Y<s;Y+=s/20){ x.beginPath(); x.moveTo(0,Y); x.lineTo(s,Y); x.stroke(); } x.fillStyle=F.b; x.fillRect(0,0,s*.06,s); x.fillRect(s*.94,0,s*.06,s); x.restore(); } },
 // tôle larmée : des « larmes » en relief, croisées
 metal:{ mk:1, rel:1, g:.64, p(x,s,F,r,mk){ x.fillStyle=mk?'#666':F.a; x.fillRect(0,0,s,s); for(let j=0;j<4;j++) for(let i=0;i<4;i++){ x.save(); x.translate((i+.5)*s/4,(j+.5)*s/4); x.rotate((i+j)&1?.785:-.785); x.fillStyle=mk?'#fff':F.b; x.beginPath(); x.ellipse(0,0,s*.085,s*.026,0,0,7); x.fill(); if(!mk){ x.fillStyle='rgba(255,255,255,.4)'; x.beginPath(); x.ellipse(0,-s*.008,s*.06,s*.009,0,0,7); x.fill(); } x.restore(); } } },
 // parquet Versailles : un cadre à coupes d'onglet autour d'un tressage en biais
 versailles:{ mk:1, g:.6, p(x,s,F,r,mk){ const f=s*.12, L=mk?'#000':'rgba(60,35,15,.45)', A=mk?'#fff':F.a, B=mk?'#fff':F.b, n=s-2*f, w=n/4, poly=(p,c)=>{ x.fillStyle=c; x.beginPath(); x.moveTo(p[0],p[1]); for(let i=2;i<p.length;i+=2) x.lineTo(p[i],p[i+1]); x.closePath(); x.fill(); x.strokeStyle=L; x.lineWidth=s*.012; x.stroke(); };
   x.fillStyle=A; x.fillRect(0,0,s,s); poly([0,0,s,0,s-f,f,f,f],B); poly([0,s,s,s,s-f,s-f,f,s-f],B); poly([0,0,f,f,f,s-f,0,s],A); poly([s,0,s-f,f,s-f,s-f,s,s],A);
   x.save(); x.beginPath(); x.rect(f,f,n,n); x.clip(); for(let k=-4;k<8;k++) poly([f+k*w,f,f+(k+.5)*w,f,f+(k+.5)*w+n,s-f,f+k*w+n,s-f],k&1?B:A); for(let k=-4;k<8;k+=2) poly([f+(k+1)*w+n,f,f+(k+1.5)*w+n,f,f+(k+1.5)*w,s-f,f+(k+1)*w,s-f],B); x.restore();
   x.strokeStyle=L; x.lineWidth=s*.014; x.strokeRect(f,f,n,n); x.strokeRect(0,0,s,s); } },
 // sols sans joints : coulés ou tissés d'un seul tenant
 terrazzo:{ nj:1, g:.7, all(x,W,F,r){ x.fillStyle=F.a; x.fillRect(0,0,W,W); const P=F.pal||[F.b]; for(let n=0;n<W*W/150;n++){ const cx=r()*W, cy=r()*W, s=2+r()*5.5, k=3+Math.floor(r()*3), a0=r()*6.3; x.fillStyle=P[Math.floor(r()*P.length)]; x.beginPath(); for(let q=0;q<k;q++){ const a=a0+q/k*6.283, d=s*(.6+r()*.5); x.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d); } x.fill(); } } },
 carpet:{ nj:1, fz:1, all(x,W,F,r,T){ x.fillStyle=F.a; x.fillRect(0,0,W,W); for(let n=0;n<W*W/12;n++){ x.fillStyle=r()<.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.07)'; x.fillRect(r()*W,r()*W,2,2); }
   if(F.b){ x.fillStyle=F.b; const R=T*.07; for(let j=0;j<=W/T*2;j++) for(let i=0;i<=W/T*2;i++){ if((i+j)&1) continue; const X=i*T/2, Y=j*T/2; x.beginPath(); x.moveTo(X-R,Y); x.lineTo(X,Y-R*1.5); x.lineTo(X+R,Y); x.lineTo(X,Y+R*1.5); x.fill(); } } } },
 grass:{ nj:1, fz:1, all(x,W,F,r){ x.fillStyle=F.a; x.fillRect(0,0,W,W); x.lineCap='round'; const c1=shade(F.a,.18), c2=shade(F.a,-.12); for(let n=0;n<W*W/26;n++){ const X=r()*W, Y=r()*W, l=3+r()*5; x.strokeStyle=r()<.5?F.b:(r()<.5?c1:c2); x.lineWidth=1+r(); x.beginPath(); x.moveTo(X,Y); x.lineTo(X+(r()-.5)*3,Y-l); x.stroke(); } } },
 sand:{ nj:1, fz:1, all(x,W,F,r){ x.fillStyle=F.a; x.fillRect(0,0,W,W); for(let n=0;n<W*W/16;n++){ x.fillStyle=r()<.5?'rgba(255,255,255,.14)':'rgba(120,90,40,.10)'; x.fillRect(r()*W,r()*W,1.5,1.5); } x.strokeStyle=F.b; x.lineWidth=1.5; x.globalAlpha=.5; for(let Y=6;Y<W;Y+=11){ x.beginPath(); for(let X=0;X<=W;X+=8) x.lineTo(X,Y+Math.sin(X*.045+Y*.3)*2.5); x.stroke(); } x.globalAlpha=1; } },
};
const isNewPat=p=>!!(FCELL[p]||FCUST[p]);
function floorTex2(F,flat){ const T=LITE?64:96;
 return canvasTex(S*T,S*T,(x)=>{ const W=S*T, P=FCUST[F.pat], r=seeded(17+F.n.length*7);
  if(P&&P.all) P.all(x,W,F,r,T);
  else for(let j=0;j<S;j++) for(let i=0;i<S;i++){ x.save(); x.translate(i*T,j*T); x.beginPath(); x.rect(0,0,T,T); x.clip(); if(P) P.p(x,T,F,r,false,(i+j)&1); else fpCells(x,T,F,r,false); x.restore(); }
  const q=seeded(3); for(let i=0;i<S*S*6;i++){ x.fillStyle=`rgba(${q()<.5?255:0},${q()<.5?255:0},${q()<.5?255:0},.025)`; x.fillRect(q()*W,q()*W,3,3); }
  if(flat) return;
  let g=x.createLinearGradient(0,0,0,T); g.addColorStop(0,'rgba(60,35,15,.3)'); g.addColorStop(1,'rgba(60,35,15,0)'); x.fillStyle=g; x.fillRect(0,0,W,T);
  g=x.createLinearGradient(0,0,T,0); g.addColorStop(0,'rgba(60,35,15,.3)'); g.addColorStop(1,'rgba(60,35,15,0)'); x.fillStyle=g; x.fillRect(0,0,T,W);
 });
}
// relief d'un motif : le même tracé, en noir et blanc, lu point par point (N = côté de la texture de détail)
function fpMask(F,N){ const P=FCUST[F.pat], O=FOPT[F.pat]||{}; if(!FCELL[F.pat]&&!P) return null;
 const ro=1-((P&&P.g)||O.g||.54);
 if(P&&P.nj) return {flat:1,fz:P.fz||0,ro};
 if(P&&!P.mk) return null;                       // joints au bord du carreau seulement : le relief d'origine convient
 const c=document.createElement('canvas'); c.width=c.height=N; const x=c.getContext('2d',{willReadFrequently:true}); x.fillStyle='#fff'; x.fillRect(0,0,N,N);
 if(P) P.p(x,N,F,seeded(1),true,0); else fpCells(x,N,F,seeded(1),true);
 const d=x.getImageData(0,0,N,N).data, e=new Float32Array(N*N), o=new Float32Array(N*N); for(let i=0;i<N*N;i++) e[i]=d[i*4]/255;
 for(let j=0;j<N;j++) for(let i=0;i<N;i++){ let s=0; for(let b=-1;b<2;b++) for(let a=-1;a<2;a++) s+=e[((j+b+N)%N)*N+((i+a+N)%N)]; o[j*N+i]=s/9; }
 return {e:o,ro,rel:P&&P.rel}; }

FLOORS.push(
 {n:'Bâtons rompus',a:'#d9a56b',b:'#c79258',pat:'herring',p:700,d:5,u:4,st:'paris'},
 {n:'Bâtons rompus noyer',a:'#8a5a36',b:'#7a4c2c',pat:'herring',p:900,d:6,u:6,st:'lux'},
 {n:'Point de Hongrie',a:'#e2bb86',b:'#d4aa72',pat:'chevron',p:1000,d:6,u:6,st:'paris'},
 {n:'Chevrons gris',a:'#b9b2a6',b:'#a39c90',pat:'chevron',p:900,d:5,u:5,st:'indus'},
 {n:'Tomettes hexagonales',a:'#cf7a4a',b:'#bf6a3c',pat:'hex',un:1,j:'#8a4a2c',p:650,d:4,u:3,st:'rustic'},
 {n:'Hexagones noir et blanc',a:'#f6f3ea',b:'#2b2d33',pat:'hex',j:'#b9b4a8',p:950,d:6,u:5,st:'paris'},
 {n:'Hexagones menthe',a:'#e6f4ec',b:'#3f9a7a',pat:'hex',j:'#a9cdbd',p:800,d:5,u:4,st:'diner'},
 {n:'Cabochons noirs',a:'#f4efe2',b:'#26282e',pat:'octo',j:'#b9b4a8',p:1100,d:6,u:6,st:'paris'},
 {n:'Cabochons terre cuite',a:'#ecd8b6',b:'#b5523b',pat:'octo',j:'#a8906a',p:900,d:5,u:4},
 {n:'Damier en diagonale',a:'#f7f4ec',b:'#2b2d33',pat:'diag',j:'#8f8c86',p:1300,d:7,u:7,st:'lux'},
 {n:'Losanges pastel',a:'#fbe9d7',b:'#f3b9a6',pat:'diag',j:'#d9b9a4',p:700,d:4,u:3},
 {n:'Parquet tressé',a:'#d8a871',b:'#c9955c',pat:'basket',p:800,d:5,u:5},
 {n:'Briques de four',a:'#b5563a',b:'#a44a30',pat:'brickf',j:'#d9cbb8',p:600,d:4,u:3,st:'indus'},
 {n:'Pont de bateau',a:'#c99a62',b:'#be8e56',pat:'deck',p:750,d:5,u:4,st:'sea'},
 {n:'Lames larges',a:'#b98a5a',b:'#ab7c4e',pat:'plank2',p:500,d:3,u:2,st:'rustic'},
 {n:'Bambou',a:'#dccb8c',b:'#cfbd7c',pat:'plank2',p:600,d:4,u:4,st:'zen'},
 {n:'Petit damier menthe',a:'#f6f6f0',b:'#7fcfb6',pat:'check2',j:'#bcd9cf',p:650,d:4,u:3,st:'diner'},
 {n:'Petit damier soleil',a:'#fff8e1',b:'#f2b33d',pat:'check2',j:'#e0c98a',p:650,d:4,u:3,st:'garden'},
 {n:'Mosaïque azur',a:'#4fa3d9',b:'#2f7fbf',pal:['#2f7fbf','#4fa3d9','#8fd0ee','#e9f6fb','#1f5f9a'],pat:'mosaic',j:'#f4f1e8',p:1200,d:6,u:6,st:'sea'},
 {n:'Mosaïque romaine',a:'#e9d3b0',b:'#b5523b',pal:['#b5523b','#e9d3b0','#3a3a3a','#c9a13a','#f4efe2','#e9d3b0'],pat:'mosaic',j:'#8a8272',p:1500,d:7,u:8,st:'lux'},
 {n:'Terrazzo',a:'#efe9df',b:'#e2574c',pal:['#e2574c','#f2b33d','#3f7fbf','#57b86a','#3a3a3a','#f6a5a5'],pat:'terrazzo',p:900,d:5,u:5,st:'indus'},
 {n:'Terrazzo nuit',a:'#2b2d34',b:'#c9a13a',pal:['#e9e2d0','#c9a13a','#8f897c','#b8763c','#5d6572','#e9e2d0'],pat:'terrazzo',p:1300,d:6,u:7,st:'lux'},
 {n:'Marbre blanc',a:'#f3f1ec',b:'#9aa0a8',pat:'slab',j:'#cfcac0',p:1700,d:8,u:8,st:'lux'},
 {n:'Marbre vert',a:'#2f5a48',b:'#cfe6d6',pat:'slab',j:'#1f3d31',p:2000,d:9,u:9,st:'lux'},
 {n:'Carreaux de ciment bleus',a:'#f1ede2',b:'#3f6f9f',c:'#e9b44c',pat:'cement',mo:0,p:1000,d:6,u:5,st:'paris'},
 {n:'Carreaux de ciment ocre',a:'#f3e6c8',b:'#c8553d',c:'#2f5a48',pat:'cement',mo:1,p:1000,d:6,u:5},
 {n:'Carreaux fleuris',a:'#eef3e6',b:'#57a86a',c:'#f6a5a5',pat:'cement',mo:2,p:950,d:6,u:4,st:'garden'},
 {n:'Écailles',a:'#3f9ab6',b:'#f4f8fb',c:'#57b8c8',pat:'scale',p:1100,d:6,u:6,st:'sea'},
 {n:'Moquette rouge',a:'#8f2433',b:'#d9b24a',pat:'carpet',p:1400,d:7,u:7,st:'lux'},
 {n:'Moquette bleu nuit',a:'#27365e',pat:'carpet',p:900,d:5,u:5},
 {n:'Gazon',a:'#6fae4e',b:'#5b9a3f',pat:'grass',p:500,d:4,u:2,st:'garden'},
 {n:'Sable fin',a:'#ecd9a8',b:'#dcc58c',pat:'sand',p:450,d:3,u:2,st:'sea'},
 {n:'Tatami bordé',a:'#cdd09a',b:'#3f4a2f',pat:'tatami',p:800,d:5,u:5,st:'zen'},
 {n:'Tôle larmée',a:'#8f959c',b:'#b9bfc6',pat:'metal',p:850,d:5,u:6,st:'indus'},
 {n:'Parquet Versailles',a:'#c9955c',b:'#b5824c',pat:'versailles',p:2200,d:9,u:10,st:'lux'},
 {n:'Dalles de pierre',a:'#b9b2a2',b:'#a59d8c',pat:'stone',j:'#6f6a5e',p:600,d:4,u:3,st:'rustic'},
 {n:'Pavés',a:'#a8a39a',b:'#98938a',pal:['#a8a39a','#98938a','#b5b0a6','#8c877e'],pat:'cobble',j:'#5f5a52',p:550,d:4,u:2,st:'garden'},
 {n:'Damier turquoise',a:'#f6f6f0',b:'#3fb8b0',pat:'checker',p:700,d:4,u:4,st:'diner'},
 {n:'Parquet ébène',a:'#3a2a20',b:'#30221a',pat:'plank',p:1100,d:6,u:7,st:'lux'},
 {n:'Parquet miel',a:'#e9bb7a',b:'#dcae6c',pat:'plank',p:300,d:2,u:1}
);

/* ---------- vignettes des sols, des murs et des tapis (dessinées à la demande, puis gardées) ---------- */
const SWC={};
function swF(i){ const k='f'+i; if(SWC[k]) return SWC[k]; const F=FLOORS[i], c=document.createElement('canvas'), T=50; c.width=150; c.height=124; const x=c.getContext('2d'), P=FCUST[F.pat], r=seeded(7+i);
 try{
  if(P&&P.all) P.all(x,150,F,r,T);
  else for(let j=0;j<3;j++) for(let q=0;q<3;q++){ x.save(); x.translate(q*T,j*T-13); x.beginPath(); x.rect(0,0,T,T); x.clip();
    if(P) P.p(x,T,F,r,false,(q+j)&1); else if(FCELL[F.pat]) fpCells(x,T,F,r,false);
    else { x.fillStyle=F.pat==='checker'?((q+j)&1?F.a:F.b):F.a; x.fillRect(0,0,T,T);
     if(F.pat==='plank'){ for(let n=0;n<3;n++){ if(n&1){ x.fillStyle=F.b; x.fillRect(0,n*T/3,T,T/3); } } x.strokeStyle='rgba(90,50,20,.3)'; x.lineWidth=1; for(let n=0;n<3;n++){ x.strokeRect(-1,n*T/3,T+2,T/3); const o=((n*7)%3)/3*T; x.beginPath(); x.moveTo(o,n*T/3); x.lineTo(o,(n+1)*T/3); x.stroke(); } }
     else if(F.pat==='tile'){ x.strokeStyle=F.b; x.lineWidth=2.5; x.strokeRect(0,0,T,T); } }
    x.restore(); }
 }catch(e){ x.fillStyle=F.a; x.fillRect(0,0,150,124); }
 return SWC[k]=c.toDataURL(); }
