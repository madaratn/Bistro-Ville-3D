/* =========================================================
   PERSONNAGES HD (v0.97) — un seul maillage articulé par personnage
   ---------------------------------------------------------
   Chaque personnage est UN objet dessiné : une peau souple (squelette de 27 os) dont la couleur est
   portée par les sommets. Les coudes et les genoux plient, les mains tiennent les objets, le visage
   a de vrais yeux (iris, reflets, paupières), des sourcils et une bouche qui bougent.
   Pour décliner un personnage : hdSpec() (qui il est) puis hdItems() (les pièces qui le composent).
   Les pièces sont des gabarits mis en cache (hdT) : en créer un nouveau = une fonction de HDP.
   ========================================================= */
const HD={on:true,q:.72,qBust:1.25,out:{value:0},mat:null,tpl:new Map(),rim:new THREE.Vector4(1,.94,.84,.32)};
try{ if(localStorage.getItem('bv_hd')==='0') HD.on=false; }catch(e){}
try{ if(LITE) HD.q=.56; }catch(e){}
const HDN=['root','body','chest','head','armR','foreR','handR','armL','foreL','handL','legR','shinR','footR','legL','shinL','footL','eyeR','eyeL','irisR','irisL','browR','browL','arcs','mSmile','mOpen','hair1','hair2'];
const HDI={}; HDN.forEach((n,i)=>HDI[n]=i);
const HDPAR={root:null,body:'root',chest:'body',head:'body',armR:'chest',foreR:'armR',handR:'foreR',armL:'chest',foreL:'armL',handL:'foreL',legR:'root',shinR:'legR',footR:'shinR',legL:'root',shinL:'legL',footL:'shinL',eyeR:'head',eyeL:'head',irisR:'eyeR',irisL:'eyeL',browR:'head',browL:'head',arcs:'head',mSmile:'head',mOpen:'head',hair1:'head',hair2:'head'};
// position de repos de chaque os, dans le repère de son parent (w = carrure, h = taille du buste)
function hdRest(S){ const w=S.w,h=S.h; return {root:[0,0,0],body:[0,.15,0],chest:[0,.12*h,0],head:[0,.4*h+.02,0],
 armR:[-.15*w,.165*h,0],foreR:[0,-.085,0],handR:[0,-.078,0],armL:[.15*w,.165*h,0],foreL:[0,-.085,0],handL:[0,-.078,0],
 legR:[-.068,.15,0],shinR:[0,-.068,0],footR:[0,-.062,0],legL:[.068,.15,0],shinL:[0,-.068,0],footL:[0,-.062,0],
 eyeR:[-.072,.152,.168],eyeL:[.072,.152,.168],irisR:[0,0,0],irisL:[0,0,0],browR:[-.072,.209,.172],browL:[.072,.209,.172],arcs:[0,.146,.176],mSmile:[0,.086,.182],mOpen:[0,.074,.18],hair1:[0,.27,-.15],hair2:[0,.27,-.15]}; }

// ---------- géométrie : petites fabriques sans couture (les normales sont recalculées, bien lisses) ----------
const hgSeg=n=>Math.max(6,Math.round(n*HD.q));
const sst=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
function hgNormals(P,I){ const N=new Float32Array(P.length);
 for(let t=0;t<I.length;t+=3){ const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3, ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2], vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2], nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  N[a]+=nx;N[a+1]+=ny;N[a+2]+=nz;N[b]+=nx;N[b+1]+=ny;N[b+2]+=nz;N[c]+=nx;N[c+1]+=ny;N[c+2]+=nz; }
 for(let i=0;i<N.length;i+=3){ const l=Math.hypot(N[i],N[i+1],N[i+2])||1; N[i]/=l;N[i+1]/=l;N[i+2]/=l; } return N; }
// retourne les triangles si la forme (fermée) est à l'envers
function hgOut(g){ const P=g.P,I=g.I; let v=0; for(let t=0;t<I.length;t+=3){ const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3; v+=P[a]*(P[b+1]*P[c+2]-P[b+2]*P[c+1])-P[a+1]*(P[b]*P[c+2]-P[b+2]*P[c])+P[a+2]*(P[b]*P[c+1]-P[b+1]*P[c]); }
 if(v<0) for(let t=0;t<I.length;t+=3){ const x=I[t+1]; I[t+1]=I[t+2]; I[t+2]=x; } return g; }
function hgJoin(){ const P=[],I=[]; for(const g of arguments){ if(!g) continue; const o=P.length/3; for(const v of g.P) P.push(v); for(const i of g.I) I.push(i+o); } return {P,I}; }
function hgMap(g,f){ const P=g.P; for(let i=0;i<P.length;i+=3){ const p=f(P[i],P[i+1],P[i+2]); P[i]=p[0];P[i+1]=p[1];P[i+2]=p[2]; } return g; }
const hgMove=(g,x,y,z)=>hgMap(g,(a,b,c)=>[a+x,b+y,c+z]);
// rotation autour de Z (rz), puis X (rx), puis Y (ry), autour de l'origine
function hgRot(g,rx,ry,rz){ const cx=Math.cos(rx||0),sx=Math.sin(rx||0),cy=Math.cos(ry||0),sy=Math.sin(ry||0),cz=Math.cos(rz||0),sz=Math.sin(rz||0);
 return hgMap(g,(x,y,z)=>{ let a=x*cz-y*sz, b=x*sz+y*cz, c=z; let b2=b*cx-c*sx, c2=b*sx+c*cx; let a3=a*cy+c2*sy, c3=-a*sy+c2*cy; return [a3,b2,c3]; }); }
// sphère : f(x,y,z) transforme chaque point de la sphère unité
function hgSph(seg,rg,f){ seg=hgSeg(seg); rg=Math.max(4,Math.round(rg*HD.q)); const P=[],I=[]; const put=(x,y,z)=>{ const p=f?f(x,y,z):[x,y,z]; P.push(p[0],p[1],p[2]); };
 put(0,1,0); for(let j=1;j<rg;j++){ const t=j/rg*Math.PI, y=Math.cos(t), r=Math.sin(t); for(let i=0;i<seg;i++){ const a=i/seg*Math.PI*2; put(Math.sin(a)*r,y,Math.cos(a)*r); } } put(0,-1,0);
 const R=k=>1+(k-1)*seg, last=P.length/3-1;
 for(let i=0;i<seg;i++) I.push(0,R(1)+i,R(1)+(i+1)%seg);
 for(let j=1;j<rg-1;j++) for(let i=0;i<seg;i++){ const a=R(j)+i,b=R(j)+(i+1)%seg,c=R(j+1)+i,d=R(j+1)+(i+1)%seg; I.push(a,c,b,b,c,d); }
 for(let i=0;i<seg;i++) I.push(last,R(rg-1)+(i+1)%seg,R(rg-1)+i);
 return {P,I}; }
const hgEll=(seg,rg,cx,cy,cz,rx,ry,rz)=>hgSph(seg,rg,(x,y,z)=>[cx+x*rx,cy+y*ry,cz+z*rz]);
// peau tendue sur des anneaux [cx,cy,cz,rx,rz] donnés de haut en bas (flip : de bas en haut) ; a0..a1 = secteur ; capA/capB = bouchons (décalage du centre)
function hgLoft(R,seg,o){ o=o||{}; seg=hgSeg(seg); const P=[],I=[], full=o.a0===undefined, n=full?seg:seg+1, a0=full?0:o.a0, a1=full?Math.PI*2:o.a1;
 R.forEach((r,k)=>{ for(let i=0;i<n;i++){ const a=a0+(a1-a0)*i/seg, m=o.mod?o.mod(a,k,r):1; P.push(r[0]+Math.sin(a)*r[3]*m,r[1],r[2]+Math.cos(a)*r[4]*m); } });
 for(let k=0;k<R.length-1;k++) for(let i=0;i<seg;i++){ const i2=full?(i+1)%seg:i+1, a=k*n+i,b=k*n+i2,c=(k+1)*n+i,d=(k+1)*n+i2; if(o.flip) I.push(a,b,c,b,d,c); else I.push(a,c,b,b,c,d); }
 if(full&&o.capA!==undefined){ const r=R[0], c=P.length/3; P.push(r[0],r[1]+o.capA,r[2]); for(let i=0;i<seg;i++){ const i2=(i+1)%seg; if(o.flip) I.push(c,i2,i); else I.push(c,i,i2); } }
 if(full&&o.capB!==undefined){ const k=R.length-1, r=R[k], c=P.length/3; P.push(r[0],r[1]+o.capB,r[2]); for(let i=0;i<seg;i++){ const i2=(i+1)%seg; if(o.flip) I.push(c,k*n+i,k*n+i2); else I.push(c,k*n+i2,k*n+i); } }
 return {P,I}; }
const hgY=(L)=>L.map(r=>[0,r[0],0,r[1],r[2]===undefined?r[1]:r[2]]);      // anneaux centrés sur l'axe : [y, rx, rz]
// tore couché (autour de l'axe Y), elliptique : Rx/Rz rayons, r épaisseur
function hgTorus(Rx,Rz,r,seg,tb,o){ o=o||{}; seg=hgSeg(seg); tb=Math.max(5,Math.round(tb*HD.q)); const P=[],I=[], full=o.a0===undefined, n=full?seg:seg+1, a0=full?0:o.a0, a1=full?Math.PI*2:o.a1, ry=o.ry||r;
 for(let i=0;i<n;i++){ const a=a0+(a1-a0)*i/seg, sx=Math.sin(a), cz=Math.cos(a); for(let j=0;j<tb;j++){ const b=j/tb*Math.PI*2, cr=Math.cos(b)*r, sr=Math.sin(b)*ry; P.push(sx*(Rx+cr),sr,cz*(Rz+cr)); } }
 for(let i=0;i<seg;i++){ const i2=full?(i+1)%seg:i+1; for(let j=0;j<tb;j++){ const j2=(j+1)%tb, a=i*tb+j,b=i2*tb+j,c=i*tb+j2,d=i2*tb+j2; I.push(a,b,c,b,d,c); } }
 if(!full) for(const e of [0,seg]){ const c=P.length/3, a=a0+(a1-a0)*e/seg; P.push(Math.sin(a)*Rx,0,Math.cos(a)*Rz); for(let j=0;j<tb;j++){ const j2=(j+1)%tb; if(e===0) I.push(c,e*tb+j2,e*tb+j); else I.push(c,e*tb+j,e*tb+j2); } }
 return hgOut({P,I}); }
// boudin le long d'un chemin ; rad(t) = rayon ou [largeur, épaisseur]
function hgTube(pts,rad,tb,o){ o=o||{}; tb=Math.max(5,Math.round(tb*HD.q)); const up=o.up||[0,0,1], P=[],I=[], n=pts.length;
 for(let i=0;i<n;i++){ const p=pts[i], q0=pts[Math.max(0,i-1)], q1=pts[Math.min(n-1,i+1)]; let tx=q1[0]-q0[0],ty=q1[1]-q0[1],tz=q1[2]-q0[2]; const tl=Math.hypot(tx,ty,tz)||1; tx/=tl;ty/=tl;tz/=tl;
  let bx=ty*up[2]-tz*up[1], by=tz*up[0]-tx*up[2], bz=tx*up[1]-ty*up[0], bl=Math.hypot(bx,by,bz); if(bl<1e-4){ bx=1;by=0;bz=0;bl=1; } bx/=bl;by/=bl;bz/=bl; const nx=by*tz-bz*ty, ny=bz*tx-bx*tz, nz=bx*ty-by*tx;
  const t=i/(n-1), r=typeof rad==='function'?rad(t):rad, ru=Array.isArray(r)?r[0]:r, rv=Array.isArray(r)?r[1]:r;
  for(let j=0;j<tb;j++){ const b=j/tb*Math.PI*2, c=Math.cos(b)*ru, s=Math.sin(b)*rv; P.push(p[0]+bx*c+nx*s,p[1]+by*c+ny*s,p[2]+bz*c+nz*s); } }
 for(let i=0;i<n-1;i++) for(let j=0;j<tb;j++){ const j2=(j+1)%tb, a=i*tb+j,b=(i+1)*tb+j,c=i*tb+j2,d=(i+1)*tb+j2; I.push(a,b,c,b,d,c); }
 for(const e of [0,n-1]){ const c=P.length/3; P.push(pts[e][0],pts[e][1],pts[e][2]); for(let j=0;j<tb;j++){ const j2=(j+1)%tb; if(e===0) I.push(c,e*tb+j2,e*tb+j); else I.push(c,e*tb+j,e*tb+j2); } }
 return hgOut({P,I}); }
const hgArc=(n,f)=>{ const o=[]; for(let i=0;i<=n;i++) o.push(f(i/n)); return o; };
// calotte posée sur le crâne : lim(a) = jusqu'où elle descend (cosinus), rad(a,t) = épaisseur ; flipY = par-dessous (barbe)
const HDH=[.2,.186,.192,.14];     // demi-axes du crâne et hauteur de son centre
function hgCap(seg,rows,lim,rad,o){ o=o||{}; seg=hgSeg(seg); rows=Math.max(3,Math.round(rows*HD.q)); const P=[],I=[], full=o.a0===undefined, n=full?seg:seg+1, a0=full?0:o.a0, a1=full?Math.PI*2:o.a1, fy=o.flipY?-1:1, rim=o.rim===undefined?.9:o.rim;
 const pt=(a,th,m)=>{ const s=Math.sin(th); P.push(Math.sin(a)*s*HDH[0]*m,HDH[3]+Math.cos(th)*HDH[1]*m*fy,Math.cos(a)*s*HDH[2]*m); };
 pt(0,0,rad(0,0));
 for(let k=1;k<=rows+1;k++) for(let i=0;i<n;i++){ const a=a0+(a1-a0)*i/seg, tm=Math.acos(clamp(lim(a),-1,1)), t=Math.min(1,k/rows); pt(a,tm*t,rad(a,t)*(k>rows?rim:1)); }
 const R=k=>1+(k-1)*n;
 for(let i=0;i<seg;i++){ const i2=full?(i+1)%seg:i+1; I.push(0,R(1)+i,R(1)+i2); }
 for(let k=1;k<=rows;k++) for(let i=0;i<seg;i++){ const i2=full?(i+1)%seg:i+1, a=R(k)+i,b=R(k)+i2,c=R(k+1)+i,d=R(k+1)+i2; I.push(a,c,b,b,c,d); }
 if(o.flipY) for(let t=0;t<I.length;t+=3){ const x=I[t+1]; I[t+1]=I[t+2]; I[t+2]=x; }
 return {P,I}; }
// ligne d'implantation : devant, tempes, côtés, nuque
const hdHL=(f,t,s,b)=>a=>{ const p=Math.abs((((a+Math.PI)%(2*Math.PI))+2*Math.PI)%(2*Math.PI)-Math.PI), K=[[0,f],[Math.PI*.28,t],[Math.PI*.5,s],[Math.PI,b]];
 for(let i=0;i<3;i++) if(p<=K[i+1][0]){ const u=(p-K[i][0])/(K[i+1][0]-K[i][0]), e=u*u*(3-2*u); return K[i][1]+(K[i+1][1]-K[i][1])*e; } return b; };
// point du crâne dans la direction (azimut a, hauteur y entre -1 et 1), à l'épaisseur m
const hdSk=(a,y,m)=>{ const s=Math.sqrt(Math.max(0,1-y*y)); m=m||1; return [Math.sin(a)*s*HDH[0]*m,HDH[3]+y*HDH[1]*m,Math.cos(a)*s*HDH[2]*m]; };

// ---------- gabarits : géométrie + os + nuance de couleur, calculés une fois ----------
// make() rend {P,I, wf(x,y,z)->[osA,osB,poidsA] (indices locaux), xf(x,y,z,nx,ny,nz)->mélange vers la 2e couleur}
function hdT(key,make){ key=HD.q+'|'+key; let t=HD.tpl.get(key); if(t) return t; const g=make(), P=Float32Array.from(g.P), I=Uint16Array.from(g.I), n=P.length/3, N=hgNormals(P,I), B=new Uint8Array(n*2), W=new Float32Array(n), X=new Float32Array(n);
 for(let i=0;i<n;i++){ const x=P[i*3],y=P[i*3+1],z=P[i*3+2]; if(g.wf){ const r=g.wf(x,y,z); B[i*2]=r[0]; B[i*2+1]=r[1]; W[i]=r[2]; } else W[i]=1; if(g.xf) X[i]=clamp(g.xf(x,y,z,N[i*3],N[i*3+1],N[i*3+2]),0,1); }
 t={P,N,I,B,W,X,n}; HD.tpl.set(key,t); return t; }

// ---------- le corps ----------
const HDTP={ // profils du buste, du bas vers le haut : [y, rx, rz]
 m:[[-.03,.07,.06],[-.008,.118,.1],[.03,.142,.124],[.07,.152,.134],[.115,.15,.132],[.16,.15,.131],[.21,.148,.126],[.26,.14,.116],[.30,.128,.104],[.335,.102,.087],[.36,.07,.066],[.378,.055,.053]],
 f:[[-.03,.07,.06],[-.008,.12,.102],[.03,.146,.128],[.07,.156,.138],[.115,.14,.126],[.16,.141,.128],[.21,.144,.13],[.26,.134,.116],[.30,.12,.1],[.335,.096,.084],[.36,.066,.063],[.378,.052,.05]],
 r:[[-.03,.075,.07],[-.008,.13,.115],[.03,.162,.148],[.07,.176,.162],[.115,.18,.168],[.16,.18,.166],[.21,.17,.15],[.26,.154,.13],[.30,.136,.11],[.335,.106,.09],[.36,.072,.068],[.378,.056,.054]]};
const hdTr=(bt,y,ix)=>{ const P=HDTP[bt]||HDTP.m; if(y<=P[0][0]) return P[0][ix]; for(let i=0;i<P.length-1;i++) if(y<=P[i+1][0]){ const u=(y-P[i][0])/(P[i+1][0]-P[i][0]); return P[i][ix]+(P[i+1][ix]-P[i][ix])*u; } return P[P.length-1][ix]; };
// os des pièces du buste : 0 bassin, 1 poitrine, 2 tête, 3 cuisse gauche, 4 cuisse droite
const hdWT=(x,y,z)=>y<.2?[0,1,1-sst(.07,.2,y)]:y>.352?[1,2,1-sst(.352,.43,y)]:[1,1,1];
const hdWSk=(x,y,z)=>{ const f=Math.max(0,z)/(Math.hypot(x,z)||1), wl=f*sst(.08,-.04,y)*.78*sst(.004,.075,Math.abs(x)); return [0,x>0?3:4,1-wl]; };     // jupes et tabliers : le devant suit les cuisses
const hdRing=(bt,y,d)=>[0,y,0,hdTr(bt,y,1)+d,hdTr(bt,y,2)+d];
const hdFz=(bt,x,y,d)=>Math.sqrt(Math.max(0,1-Math.pow(x/hdTr(bt,y,1),2)))*hdTr(bt,y,2)+(d||0);      // où est le devant du buste
const hgTaper=(b,t)=>b*(.35+.65*Math.sin(clamp(t,0,1)*Math.PI));
const HDP={
 hips:bt=>hdT('hips'+bt,()=>{ const g=hgLoft(hgY(HDTP[bt].slice(0,5)),22,{flip:1,capA:-.012}); g.wf=hdWT; return g; }),
 shirt:bt=>hdT('shirt'+bt,()=>{ const g=hgLoft(hgY(HDTP[bt].slice(4)),22,{flip:1}); g.wf=hdWT; return g; }),
 tail:bt=>hdT('tail'+bt,()=>{ const g=hgLoft([hdRing(bt,.12,.004),hdRing(bt,.085,.009),hdRing(bt,.055,.011),hdRing(bt,.05,.004)],22,{}); g.wf=hdWT; return g; }),      // pan de chemise sorti
 neck:()=>hdT('neck',()=>{ const g=hgLoft(hgY([[.445,.047,.045],[.40,.05,.048],[.362,.057,.055]]),14,{}); g.wf=hdWT; return g; }),
 belt:bt=>hdT('belt'+bt,()=>{ const g=hgMove(hgTorus(hdTr(bt,.115,1)+.002,hdTr(bt,.115,2)+.002,.0085,26,6,{ry:.013}),0,.115,0); g.wf=hdWT; return g; }),
 buckle:bt=>hdT('buckle'+bt,()=>{ const g=hgEll(8,6,0,.115,hdTr(bt,.115,2)+.008,.02,.016,.006); g.wf=hdWT; return g; }),
 collar:()=>hdT('collar',()=>{ const g=hgMove(hgTorus(.064,.06,.014,20,7,{ry:.016}),0,.372,0); g.wf=hdWT; return g; }),
 flaps:()=>hdT('flaps',()=>{ const mk=s=>hgMove(hgRot(hgEll(8,6,0,0,0,.03,.018,.01),0,0,s*-.55),s*.03,.358,.062); const g=hgJoin(mk(-1),mk(1),hgMove(hgTorus(.058,.055,.011,18,6,{ry:.015}),0,.376,0)); g.wf=hdWT; return g; }),     // col de chemise
 buttons:(bt,n,dx)=>hdT('btn'+bt+n+dx,()=>{ const L=[]; for(let i=0;i<n;i++){ const y=.305-i*.055; for(const s of (dx?[-1,1]:[0])) L.push(hgEll(7,5,s*dx,y,hdFz(bt,s*dx,y,.0035),.011,.011,.006)); } const g=hgJoin(...L); g.wf=hdWT; return g; }),
 vest:(bt,low)=>hdT('vest'+bt+low,()=>{ const ys=[.336,.30,.26,.21,.16,low], g=hgLoft(ys.map((y,i)=>hdRing(bt,y,i===0?.004:.008)),24,{a0:.3,a1:Math.PI*2-.3}); g.wf=hdWT; return g; }),      // gilet ouvert devant (ou veste, plus longue)
 lapels:bt=>hdT('lapel'+bt,()=>{ const mk=s=>{ const y=.275; return hgMove(hgRot(hgEll(8,6,0,0,0,.022,.05,.008),0,s*.5,s*.28),s*.062,y,hdFz(bt,s*.062,y,.008)); }; const g=hgJoin(mk(-1),mk(1)); g.wf=hdWT; return g; }),
 apronBib:bt=>hdT('apB'+bt,()=>{ const g=hgLoft([.31,.26,.2,.14].map(y=>hdRing(bt,y,.011)),12,{a0:-.62,a1:.62}); g.wf=hdWT; return g; }),
 apronSkirt:(bt,low,arc,sk)=>hdT('apS'+bt+low+arc+(sk?'s':''),()=>{ const ys=[.142,.09,.03,low], R=sk?[[0,.142,0,hdTr(bt,.142,1)+.013,hdTr(bt,.142,2)+.013],[0,.128,0,hdTr(bt,.125,1)+.0145,hdTr(bt,.125,2)+.0145],[0,.07,0,.1945,.1765],[0,low,0,.2145-low*.25,.1985-low*.25]]:ys.map((y,i)=>[0,y,0,hdTr(bt,Math.max(y,.03),1)+.013+(i>1?.004:0),hdTr(bt,Math.max(y,.03),2)+.013+(i>1?.008:0)]), g=hgLoft(R,18,{a0:-arc,a1:arc}); g.wf=hdWSk; return g; }),      // sur une jupe, le tablier en suit l'évasement
 sash:bt=>hdT('sash'+bt,()=>{ const g=hgMove(hgTorus(hdTr(bt,.134,1)+.01,hdTr(bt,.134,2)+.01,.005,26,5,{ry:.014}),0,.134,0); g.wf=hdWT; return g; }),
 apronStrap:()=>hdT('apStrap',()=>{ const g=hgMove(hgTorus(.062,.058,.0055,16,5,{ry:.008}),0,.368,.004); g.wf=hdWT; return g; }),
 apronTie:bt=>hdT('apT'+bt,()=>{ const g=hgJoin(hgLoft([[.1475,.002],[.144,.0125],[.130,.0125],[.1265,.002]].map(r=>hdRing(bt,r[0],r[1])),26,{}),hgEll(7,5,.013,.137,-hdTr(bt,.137,2)-.016,.022,.012,.008),hgEll(7,5,-.015,.134,-hdTr(bt,.137,2)-.016,.022,.012,.008)); g.wf=hdWT; return g; }),
 scarf:()=>hdT('scarf',()=>{ const g=hgJoin(hgMove(hgTorus(.07,.066,.024,20,8,{ry:.022}),0,.366,0),hgEll(8,6,.028,.345,.088,.022,.026,.016),hgMove(hgRot(hgEll(8,6,0,0,0,.02,.05,.01),.25,0,-.18),.036,.295,.112)); g.wf=hdWT; return g; }),
 kerchief:()=>hdT('kerch',()=>{ const g=hgJoin(hgMove(hgTorus(.062,.058,.016,18,7,{ry:.014}),0,.37,0),hgEll(8,6,0,.352,.076,.018,.016,.012),hgMove(hgRot(hgEll(8,5,0,0,0,.026,.03,.007),.35,0,0),0,.328,.094)); g.wf=hdWT; return g; }),
 tie:bt=>hdT('tie'+bt,()=>{ const pts=hgArc(6,t=>{ const y=.35-t*.17; return [0,y,hdFz(bt,0,y,.006)-(t<.15?.02*(1-t/.15):0)]; }); const g=hgJoin(hgTube(pts,t=>[.012+.014*Math.sin(Math.min(1,t*1.25)*Math.PI*.62),.005],8,{up:[1,0,0]}),hgEll(8,6,0,.352,.082,.015,.014,.01)); g.wf=hdWT; return g; }),
 bowtie:()=>hdT('bow',()=>{ const mk=s=>hgEll(8,6,s*.027,.352,.086,.024,.016,.009); const g=hgJoin(mk(-1),mk(1),hgEll(7,5,0,.352,.091,.011,.011,.009)); g.wf=hdWT; return g; }),
 necklace:()=>hdT('neckl',()=>{ const L=[]; for(let i=-4;i<=4;i++){ const a=i*.26; L.push(hgEll(6,5,Math.sin(a)*.075,.345-Math.cos(a)*.02,Math.cos(a)*.07+.012,.0085,.0085,.0085)); } const g=hgJoin(...L); g.wf=hdWT; return g; }),
 skirt:(bt,low)=>hdT('skirt'+bt+low,()=>{ const g=hgLoft([[0,.128,0,hdTr(bt,.125,1)+.006,hdTr(bt,.125,2)+.006],[0,.07,.008,.186,.16],[0,.0,.014,.206,.176],[0,low,.016,.214-low*.25,.182-low*.25],[0,low+.004,.016,.17,.14]],24,{}); g.wf=hdWSk; return g; }),
 // bras, de l'épaule au poignet : long (manche longue), up (manche courte), low (avant-bras nu), cuff (poignet de chemise)
 arm:kind=>hdT('arm'+kind,()=>{ const SH=[[.042,.016],[.03,.033],[.014,.0435],[-.004,.047]], A=SH.concat([[-.03,.0435],[-.06,.039],[-.085,.036],[-.11,.034],[-.14,.031],[-.158,.0295]]); let R, cap={};
   if(kind==='long'){ R=A; cap={capA:.006,capB:-.006}; } else if(kind==='up'){ R=SH.map(r=>[r[0],r[1]+.002]).concat([[-.03,.0465],[-.06,.0435],[-.07,.0435],[-.066,.034]]); cap={capA:.006}; } else if(kind==='low'){ R=[[-.05,.036],[-.085,.0345],[-.11,.0325],[-.14,.0295],[-.16,.027]]; cap={capB:-.005}; }
   else { R=[[-.14,.0345],[-.146,.036],[-.16,.036],[-.166,.03]]; cap={capB:-.002}; }
   const g=hgLoft(hgY(R),12,cap); g.wf=(x,y,z)=>[0,1,sst(-.105,-.065,y)]; return g; }),
 hand:()=>hdT('hand',()=>hgJoin(hgSph(12,9,(x,y,z)=>[x*.029*(1-.12*Math.max(0,-y)),-.036+y*.042,.004+z*.035*(1+.1*Math.max(0,-y))]),hgMove(hgRot(hgEll(8,6,0,0,0,.0125,.022,.0135),.5,0,-.35),.02,-.03,.026))),
 leg:kind=>hdT('leg'+kind,()=>{ let R, cap={};
   if(kind==='long'){ R=[[.03,.052],[0,.058],[-.035,.0545],[-.068,.051],[-.10,.0475],[-.124,.0465],[-.128,.04]]; } else if(kind==='up'){ R=[[.03,.053],[0,.06],[-.035,.057],[-.066,.055],[-.07,.055],[-.066,.044]]; } else { R=[[-.05,.049],[-.068,.048],[-.10,.044],[-.13,.04]]; cap={capB:-.004}; }
   const g=hgLoft(hgY(R),12,cap); g.wf=(x,y,z)=>[0,1,sst(-.09,-.046,y)]; return g; }),
 shoe:()=>hdT('shoe',()=>{ const g=hgSph(14,10,(x,y,z)=>{ const zz=z*.079+.028, w=z<0?.86+.14*(1+z):1, yy=Math.max(-.02,-.012+y*.036*(z>0?1+.12*z:1)); return [x*.051*w,yy,zz]; }); g.xf=(x,y,z)=>y<-.0115?1:0; return g; }),
 sock:()=>hdT('sock',()=>hgLoft(hgY([[.018,.044],[.006,.045],[-.004,.044]]),10,{})),
 // ---------- la tête ----------
 head:()=>hdT('head',()=>{ const g=hgSph(28,20,(x,y,z)=>{ let fx=1,fz=1; if(y<0){ const t=-y; fx=1-.12*t*t; fz=1-.06*t*t; } if(z<0) fz*=1.03; const ch=Math.exp(-((y+.34)*(y+.34))/.07)*.04*Math.abs(x)*(z>-.2?1:.4); return [x*HDH[0]*fx*(1+ch),HDH[3]+y*HDH[1],z*HDH[2]*fz]; });
   g.xf=(x,y,z)=>{ let b=0; for(const s of [-1,1]){ const dx=x-s*.114,dy=y-.094,dz=z-.148; b=Math.max(b,Math.exp(-(dx*dx+dy*dy*1.7+dz*dz)/.0021)); } return b*.5; }; return g; }),
 ear:()=>hdT('ear',()=>{ const g=hgSph(10,8,(x,y,z)=>[.196+x*.024,.118+y*.04,-.006+z*.028]); g.xf=(x,y,z)=>sst(.2,.214,x)*sst(-.02,.01,z)*.5; return g; }),
 nose:()=>hdT('nose',()=>{ const g=hgSph(10,8,(x,y,z)=>[x*.0205,.106+y*.016,.186+z*.022]); g.xf=()=>.55; return g; }),
 // œil (dans le repère de l'œil, tourné vers l'avant) : blanc + paupière, puis iris + pupille + reflets
 eyeW:()=>hdT('eyeW',()=>hgSph(14,10,(x,y,z)=>[x*.0365,y*.0445,-.006+z*.017])),
 eyeLid:f=>hdT('eyeLid'+f,()=>{ const g=hgTube(hgArc(10,t=>{ const a=(t-.5)*(f?3.5:3.2); return [Math.sin(a)*.039,Math.cos(a)*.047-.003,.008-Math.abs(Math.sin(a))*.008]; }),t=>[hgTaper(f?.0064:.0048,t),.0045],6); return f?hgJoin(g,hgTube([[.036,.012,.004],[.047,.02,-.002],[.054,.03,-.006]],t=>.0042*(1-t*.75),5)):g; }),
 eyeI:()=>hdT('eyeI',()=>hgSph(12,8,(x,y,z)=>[x*.027,-.003+y*.033,.0092+z*.0085])),
 eyeP:()=>hdT('eyeP',()=>hgSph(10,6,(x,y,z)=>[x*.0145,-.003+y*.019,.0152+z*.0052])),
 eyeH:()=>hdT('eyeH',()=>hgJoin(hgSph(8,6,(x,y,z)=>[.0092+x*.0074,.0128+y*.0086,.0186+z*.004]),hgSph(6,5,(x,y,z)=>[-.0085+x*.0036,-.0142+y*.0036,.0182+z*.003]))),
 brow:k=>hdT('brow'+k,()=>hgTube(hgArc(6,t=>[(t-.5)*.062,Math.sin(t*Math.PI)*.006-(t-.5)*.007,-Math.pow((t-.5)*2,2)*.004]),t=>[hgTaper(k?.009:.007,t*.8+.2),.0052],6)),
 arc1:()=>hdT('arc1',()=>hgTube(hgArc(9,t=>{ const a=(t-.5)*2.5; return [Math.sin(a)*.03,Math.cos(a)*.027-.014,.009-Math.abs(Math.sin(a))*.006]; }),t=>[hgTaper(.007,t),.0052],6)),
 smile:k=>hdT('smile'+k,()=>{ const w=k===2?.042:k===1?.036:.03, d=k===2?.03:.024; return hgTube(hgArc(10,t=>{ const a=(t-.5)*2.2; return [Math.sin(a)*w,-Math.cos(a)*d+d*.72,-Math.pow(Math.sin(a)*w,2)*2.4]; }),t=>[hgTaper(.0064,t),.0048],6); }),
 mouthO:()=>hdT('mouthO',()=>hgSph(14,8,(x,y,z)=>[x*.028,y*.021,.0005+z*.0075])),
 tongue:()=>hdT('tongue',()=>hgSph(10,6,(x,y,z)=>[x*.017,-.0095+y*.0085,.0045+z*.005])),
 teeth:()=>hdT('teeth',()=>hgSph(10,5,(x,y,z)=>[x*.02,.0118+y*.0052,.0045+z*.0048])),
 wrinkles:()=>hdT('wrk',()=>{ const mk=s=>hgTube(hgArc(4,t=>hdSk(s*(.62+t*.14),.12-t*.1,1.004)),.0028,4), fr=y=>hgTube(hgArc(6,t=>hdSk((t-.5)*.62,y,1.004)),t=>hgTaper(.0027,t),4); return hgJoin(mk(-1),mk(1),fr(.6),fr(.69)); }),
 freckles:()=>hdT('frk',()=>{ const L=[]; for(const s of [-1,1]) for(const [a,y] of [[.42,-.2],[.56,-.25],[.33,-.27],[.5,-.14]]){ const p=hdSk(s*a,y,1.003); L.push(hgEll(5,4,p[0],p[1],p[2],.0048,.0048,.003)); } return hgJoin(...L); }),
 earring:k=>hdT('earr'+k,()=>k?hgMove(hgRot(hgTorus(.016,.016,.0035,12,5),Math.PI/2,Math.PI/2,0),.205,.07,0):hgEll(7,6,.207,.082,0,.0115,.0115,.0115)),
 mous:k=>hdT('mous'+k,()=>{ if(k==='curl'){ const mk=s=>hgTube(hgArc(10,t=>[s*(.003+t*.07),.097-Math.sin(t*Math.PI*.85)*.011+Math.pow(Math.max(0,t-.5)*2,1.6)*.034,.193-t*t*.03]),t=>[.0125*(1-t*.86),.0085*(1-t*.62)],6); return hgJoin(mk(-1),mk(1)); }
   const B=k==='bushy', mk=s=>hgMove(hgRot(hgEll(9,7,0,0,0,B?.034:.023,B?.0155:.0105,B?.014:.011),0,s*.34,s*(B?-.32:-.2)),s*(B?.027:.02),B?.093:.096,B?.184:.186); return hgJoin(mk(-1),mk(1)); }),
 beard:k=>hdT('beard'+k,()=>hgCap(22,7,hdHL(k?.5:.52,k?.2:.34,k?-.12:.0,-.12),(a,t)=>1.04+.065*(1-t)*Math.max(0,Math.cos(a))+(k?.04*(1-t):0),{flipY:1,a0:-1.75,a1:1.75,rim:.92})),
 glasses:k=>hdT('glas'+k,()=>{ const R=k==='thin'?.036:.041, tb=k==='thin'?.0042:k==='cat'?.0062:.0056, mk=s=>hgMap(hgRot(hgTorus(R,R,tb,18,5),Math.PI/2,0,0),(x,y,z)=>{ if(k==='rect'){ const f=1/Math.pow(Math.pow(Math.abs(x/R),4)+Math.pow(Math.abs(y/R),4)+1e-9,.25)/Math.max(1e-6,Math.hypot(x,y)/R); const q=Math.min(1.25,f); x*=q*1.2; y*=q*.8; } if(k==='cat'){ y+=Math.max(0,x*s)*.34; x*=1.12; y*=.86; } return [x+s*.0745,y+.15,z+.194-x*s*.1]; });
   const br=hgTube([[-.03,.156,.192],[0,.162,.198],[.03,.156,.192]],tb*.9,5), tp=s=>hgTube([[s*.118,.156,.176],[s*.165,.152,.11],[s*.196,.146,.03]],tb*.8,5,{up:[0,1,0]}); return hgJoin(mk(-1),mk(1),br,tp(-1),tp(1)); }),
 // ---------- cheveux ----------
 hairCap:k=>hdT('hc'+k,()=>{ const D={short:[.5,.3,.02,-.4,1.055],buzz:[.56,.36,.1,-.34,1.03],slick:[.6,.42,.06,-.42,1.045],fem:[.44,.2,-.12,-.52,1.065],bob:[.34,.08,-.62,-.66,1.085],long:[.36,.1,-.56,-.7,1.08],curly:[.46,.24,-.02,-.44,1.06],under:[.3,.1,-.1,-.46,1.03]}[k], hl=hdHL(D[0],D[1],D[2],D[3]);
   const g=hgCap(28,9,hl,(a,t)=>D[4]+(k==='bob'||k==='long'?.035*t*t+.03*Math.max(0,Math.cos(a))*t*t*t:0)+.012*Math.sin(t*Math.PI)*(1+.15*Math.cos(a*5+1)),{rim:.9}); g.xf=(x,y,z,nx,ny)=>sst(.18,.34,y)*.55+(ny>.5?.25:0); return g; }),
 hairBand:()=>hdT('hband',()=>{ const P=[],I=[], seg=hgSeg(24), rows=4, n=seg+1;      // couronne de cheveux (crâne dégarni)
   for(let k=0;k<=rows+2;k++) for(let i=0;i<=seg;i++){ const a=1.05+(Math.PI*2-2.1)*i/seg, kk=clamp(k-1,0,rows), y=.3-.66*kk/rows, ed=Math.min(1,Math.min(i,seg-i)/2.5), m=(k===0||k===rows+2)?.985:1.026+.04*Math.sin((.15+.85*kk/rows)*Math.PI*.9)*ed, p=hdSk(a,y,m); P.push(p[0],p[1],p[2]); }
   for(let k=0;k<rows+2;k++) for(let i=0;i<seg;i++){ const a=k*n+i,b=a+1,c=a+n,d=c+1; I.push(a,c,b,b,c,d); } return {P,I,xf:(x,y,z)=>sst(.12,.24,y)*.4}; }),
 fringe:k=>hdT('fr'+k,()=>{ const L=[], A=k==='side'?[[-.5,.56,.07,.05,-.5],[-.16,.6,.085,.05,-.42],[.2,.66,.07,.042,-.3]]:k==='bangs'?[[-.56,.5,.07,.058,.1],[-.28,.5,.075,.064,.05],[0,.5,.078,.066,0],[.28,.5,.075,.064,-.05],[.56,.5,.07,.058,-.1]]:[[-.36,.62,.06,.04,.25],[0,.66,.07,.042,0],[.36,.62,.06,.04,-.25]];
   for(const [a,y,rx,ry,rz] of A){ const p=hdSk(a,y,1.035); L.push(hgMove(hgRot(hgEll(10,7,0,0,0,rx,ry,.024),-.42,a,rz),p[0],p[1],p[2])); } const g=hgJoin(...L); g.xf=(x,y,z)=>sst(.2,.3,y)*.4; return g; }),
 hairBack:k=>hdT('hb'+k,()=>{ const g=k==='long'?hgLoft([[0,.2,-.03,.19,.165],[0,.08,-.05,.186,.15],[0,-.04,-.065,.166,.125],[0,-.14,-.07,.13,.1],[0,-.19,-.066,.07,.058]],20,{a0:Math.PI*.62,a1:Math.PI*1.38}):hgLoft([[0,.2,-.03,.2,.17],[0,.08,-.04,.205,.168],[0,-.03,-.045,.2,.155],[0,-.07,-.045,.17,.13]],20,{a0:Math.PI*.56,a1:Math.PI*1.44}); if(k==='long') g.wf=(x,y,z)=>[0,1,sst(-.06,.14,y)]; return g; }),      // nappe dans le dos
 hairSide:k=>hdT('hs'+k,()=>{ const mk=s=>hgTube(hgArc(6,t=>[s*(.176+.02*Math.sin(t*Math.PI)),.2-t*(k==='long'?.3:.2),.075-t*.03]),t=>{ const r=Math.sin((.3+t*(1-t)*2.8)*Math.PI*.5); return [.03*r,.027*r]; },8,{up:[1,0,0]}); return hgJoin(mk(-1),mk(1)); }),
 bun:()=>hdT('bun',()=>hgJoin(hgEll(14,10,0,.335,-.07,.082,.07,.078),hgMove(hgTorus(.05,.05,.012,12,5),0,.3,-.06))),
 tuft:()=>hdT('tuft',()=>hgTube([[0,.31,.03],[.012,.35,.05],[.03,.365,.085]],t=>[.03*(1-t*.7),.022*(1-t*.6)],7,{up:[1,0,0]})),
 pony:()=>hdT('pony',()=>{ const g=hgTube(hgArc(8,t=>[0,.3-t*.02-t*t*.2,-.16-Math.sin(t*Math.PI*.8)*.085]),t=>[.03+.022*Math.sin(Math.min(1,t*1.7)*Math.PI)*(1-t*.3),.028+.016*Math.sin(Math.min(1,t*1.7)*Math.PI)],9,{up:[1,0,0]}); g.wf=(x,y,z)=>[0,1,sst(.2,.3,y)]; return g; }),
 pigtail:()=>hdT('pigt',()=>{ const g=hgTube(hgArc(6,t=>[.205+Math.sin(t*2)*.035,.21-t*.14,-.03-t*.01]),t=>{ const r=Math.sin((.35+t*(1-t)*2.6)*Math.PI*.5); return [.034*r,.03*r]; },8,{up:[0,0,1]}); g.wf=(x,y,z)=>[0,1,sst(.1,.2,y)]; return g; }),
 curls:k=>hdT('curls'+k,()=>{ const L=[], r=seeded(7), N=k?44:38, hl=hdHL(k?.3:.4,.1,-.2,-.5); for(let i=0;i<N;i++){ const y=1-(i+.5)/N*1.4, a=i*2.39996; if(y<hl(a)+.03) continue; const p=hdSk(a,Math.max(-.6,y),k?1.11:1.065), s=(k?.062:.046)*(.85+r()*.35); L.push(hgEll(9,7,p[0],p[1],p[2],s,s*.92,s)); } return hgJoin(...L); }),
 // ---------- chapeaux ----------
 toque:k=>hdT('toque'+k,()=>{ const H=k?.3:.2, band=hgLoft(hgY([[.262,.15,.146],[.35,.156,.152]]),24,{flip:1}), top=hgLoft(hgY(hgArc(8,t=>{ const y=.345+t*H; return [y,.158+.05*Math.sin(Math.min(1,t*1.15)*Math.PI*.78)-t*t*.03]; })),24,{flip:1,capB:.012,mod:(a,i)=>1+.035*Math.cos(a*9)*Math.sin(i/8*Math.PI)}); return hgJoin(band,top); }),
 bcap:()=>hdT('bcap',()=>hgJoin(hgLoft(hgY([[.258,.15,.146],[.305,.155,.151]]),22,{flip:1}),hgLoft(hgY([[.3,.158],[.335,.178],[.37,.16],[.385,.095]]),22,{flip:1,capB:.006}))),
 cap:()=>hdT('cap',()=>hgJoin(hgCap(24,7,hdHL(.38,.3,.24,.2),()=>1.075,{rim:.94}),hgSph(14,6,(x,y,z)=>[x*.125,.222+y*.01-Math.max(0,z)*.03,.2+z*.1]),hgEll(7,5,0,.342,0,.018,.01,.018))),
 beret:()=>hdT('beret',()=>hgMove(hgJoin(hgRot(hgSph(18,9,(x,y,z)=>[x*.2,y*.06,z*.19]),0,0,-.16),hgEll(6,5,0,.07,0,.01,.02,.01)),.02,.312,-.01)),
 straw:()=>hdT('straw',()=>hgJoin(hgLoft(hgY([[.262,.33],[.27,.33],[.285,.17],[.38,.15],[.395,.12]]),26,{flip:1,capB:.008}),hgLoft(hgY([[.262,.33],[.255,.3],[.262,.15]]),26,{}))),
 strawBand:()=>hdT('strawB',()=>hgLoft(hgY([[.288,.172],[.318,.164]]),24,{flip:1})),
 captain:()=>hdT('capt',()=>hgLoft(hgY([[.262,.152,.148],[.30,.156,.152],[.318,.18,.175],[.35,.186,.18],[.366,.13,.126]]),24,{flip:1,capB:.008})),
 captVisor:()=>hdT('captV',()=>hgSph(14,6,(x,y,z)=>[x*.12,.266+y*.01-Math.max(0,z)*.035,.2+z*.09])),
 captBand:()=>hdT('captB',()=>hgLoft(hgY([[.264,.154,.15],[.298,.158,.154]]),24,{flip:1})),
 badge:()=>hdT('badge',()=>hgEll(8,6,0,.3,.157,.022,.024,.008)),
 bow:()=>hdT('bowH',()=>{ const mk=s=>hgMove(hgRot(hgEll(9,7,0,0,0,.05,.036,.022),0,0,s*.35),.09+s*.046,.335,.03); return hgJoin(mk(-1),mk(1),hgEll(7,6,.09,.33,.035,.02,.022,.02)); }),
};

// ---------- assemblage : les pièces choisies deviennent un seul maillage ----------
// pièce = {t gabarit, at ancre (repos), sx/sy échelle, ry rotation, mir miroir, bm os, c couleur, c2 seconde couleur, k matière}
const HDK={cloth:1,skin:.8,hair:.6,gloss:.4,glow:.2,metal:0};
const _hdC=new Map(); function hdC(h){ let c=_hdC.get(h); if(!c){ c=new THREE.Color(h); _hdC.set(h,c); } return c; }
function hdBuildGeo(items){ let nv=0, ni=0; for(const it of items){ nv+=it.t.n; ni+=it.t.I.length; }
 const P=new Float32Array(nv*3), N=new Float32Array(nv*3), C=new Float32Array(nv*4), SI=new Uint16Array(nv*4), SW=new Float32Array(nv*4), I=new (nv>65535?Uint32Array:Uint16Array)(ni); let v=0, k=0;
 for(const it of items){ const t=it.t, at=it.at, sx=it.sx||1, sy=it.sy||1, mir=it.mir?-1:1, bm=it.bm, c1=it.c, c2=it.c2||it.c, kd=it.k, cr=Math.cos(it.ry||0), sr=Math.sin(it.ry||0), b0=bm[0];
  for(let i=0;i<t.n;i++){ const o=(v+i)*3, q=(v+i)*4; let x=t.P[i*3]*mir*sx, y=t.P[i*3+1]*sy, z=t.P[i*3+2], nx=t.N[i*3]*mir/sx, ny=t.N[i*3+1]/sy, nz=t.N[i*3+2];
   if(sr){ const x2=x*cr+z*sr, z2=-x*sr+z*cr, n2=nx*cr+nz*sr, m2=-nx*sr+nz*cr; x=x2; z=z2; nx=n2; nz=m2; }
   P[o]=at[0]+x; P[o+1]=at[1]+y; P[o+2]=at[2]+z; const l=Math.hypot(nx,ny,nz)||1; N[o]=nx/l; N[o+1]=ny/l; N[o+2]=nz/l;
   const m=t.X[i]; C[q]=c1.r+(c2.r-c1.r)*m; C[q+1]=c1.g+(c2.g-c1.g)*m; C[q+2]=c1.b+(c2.b-c1.b)*m; C[q+3]=kd;
   const ba=bm[t.B[i*2]], bb=bm[t.B[i*2+1]]; SI[q]=ba===undefined?b0:ba; SI[q+1]=bb===undefined?b0:bb; SW[q]=t.W[i]; SW[q+1]=1-t.W[i]; }
  if(mir<0) for(let j=0;j<t.I.length;j+=3){ I[k+j]=t.I[j]+v; I[k+j+1]=t.I[j+2]+v; I[k+j+2]=t.I[j+1]+v; } else for(let j=0;j<t.I.length;j++) I[k+j]=t.I[j]+v;
  v+=t.n; k+=t.I.length; }
 const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(N,3)); g.setAttribute('color',new THREE.BufferAttribute(C,4));
 g.setAttribute('skinIndex',new THREE.BufferAttribute(SI,4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(SW,4)); g.setIndex(new THREE.BufferAttribute(I,1)); return g; }
function hdRig(S){ const R=hdRest(S), bones=HDN.map(n=>{ const b=new THREE.Bone(); b.name=n; b.position.fromArray(R[n]); return b; }); HDN.forEach((n,i)=>{ const p=HDPAR[n]; if(p) bones[HDI[p]].add(bones[i]); });
 const E=.385; bones[HDI.eyeL].rotation.y=E; bones[HDI.eyeR].rotation.y=-E; bones[HDI.browL].rotation.y=E; bones[HDI.browR].rotation.y=-E; if(S.kid) bones[HDI.head].scale.setScalar(1.1);
 const wp={}; for(const n of HDN){ const p=HDPAR[n], q=R[n]; wp[n]=p?[wp[p][0]+q[0],wp[p][1]+q[1],wp[p][2]+q[2]]:q.slice(); } return {bones,wp,E}; }
// matière unique : la « sorte » de surface (tissu, peau, cheveux, brillant, lumineux, métal) voyage dans le canal alpha des couleurs
function hdMat(){ if(HD.mat) return HD.mat; const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:0});
 m.onBeforeCompile=sh=>{ sh.uniforms.uRim={value:HD.rim}; sh.uniforms.uHdOut=HD.out;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vHdP;').replace('#include <begin_vertex>','#include <begin_vertex>\n vHdP=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec4 uRim; uniform float uHdOut; varying vec3 vHdP;\nvec3 hdRRT(vec3 v){ vec3 a=v*(v+.0245786)-.000090537, b=v*(.983729*v+.432951)+.238081; return a/b; }')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n float hdK=vColor.a, hdS=0.; roughnessFactor=hdK>.9?.88:hdK>.7?.6:hdK>.5?.4:hdK>.3?.1:hdK>.1?.5:.3;\n if(hdK>.5&&hdK<.7){ float an=atan(vHdP.x,vHdP.z), ph=an*46.+vHdP.y*34.; hdS=(sin(ph)*.6+sin(an*113.-vHdP.y*61.)*.4)*(1.-smoothstep(.7,2.2,fwidth(ph))); diffuseColor.rgb*=1.+hdS*.09; roughnessFactor+=hdS*.08; }')
   .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n if(hdS!=0.) normal=normalize(normal+normalize(cross(viewMatrix[1].xyz,normal)+vec3(1e-4))*hdS*.22);')
   .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n metalnessFactor=vColor.a<.1?.9:0.;')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n if(vColor.a>.1&&vColor.a<.3) totalEmissiveRadiance+=diffuseColor.rgb*.85; if(vColor.a>.7&&vColor.a<.9) totalEmissiveRadiance+=diffuseColor.rgb*vec3(.11,.045,.03);')
   .replace('#include <colorspace_fragment>','#include <colorspace_fragment>\n if(uHdOut>.5){ vec3 c=gl_FragColor.rgb*1.8; c=mat3(.59719,.076,.0284,.35458,.90834,.13383,.04823,.01566,.83777)*c; c=hdRRT(c); c=clamp(mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602)*c,0.,1.); gl_FragColor.rgb=mix(c*12.92,1.055*pow(c,vec3(.41666))-.055,step(.0031308,c)); }')
   .replace('#include <opaque_fragment>',' { float hdR=pow(1.-saturate(dot(normal,normalize(vViewPosition))),3.2); outgoingLight+=uRim.rgb*uRim.a*hdR*(vColor.a>.7&&vColor.a<.9?1.25:vColor.a>.5&&vColor.a<.7?1.:.6); }\n#include <opaque_fragment>'); };
 m.customProgramCacheKey=()=>'hd3'; return HD.mat=m; }

// ---------- qui est ce personnage ? (complète la fiche « cosy » : sexe, âge, visage, tenue) ----------
const HD_EYES=['#4a2f1a','#3a2616','#5a3a22','#6b4a26','#3f6f9f','#4f7a4a','#5f6b78','#2f2a26','#4a2f1a','#3a2616'];
const HD_GREY=['#d9d6d0','#c4c2c0','#a3a3a8','#e6e3dc'];
function hdWho(a){ const fit=(a.s&&a.s.outfit)||(a.look&&a.look.fit); if(fit) for(const k in WHO_LOOK) if(WHO_LOOK[k].outfit===fit) return k; return null; }
function hdSpec(a){
 const S=charSpec(a), id=a.id||(a.s?a.s.id:3)*7, r=seeded(id*29+11), L=a.look||{}, pk=arr=>arr[Math.floor(r()*arr.length)], who=hdWho(a), P=(who&&PORTRAIT[who])||{}, role=a.s?(a.s.variant||a.s.role):null, staff=!!(role&&STAFF_LOOKS[role]), ex=S.extras||[];
 S.who=who; S.fem=who?!!P.fem:staff&&a.s.name?NAMES.indexOf(a.s.name)%2===0:r()<.5; S.age=who?(P.age||0):S.kid?-1:staff?(r()<.3?1:0):(r()<.2?2:r()<.6?1:0); if(S.age<0) S.kid=true;
 if(!who&&!staff&&S.age===2&&r()<.8) S.hairC=pk(HD_GREY);
 if(S.kid&&!who){ const q=hdC(S.hairC), mx=Math.max(q.r,q.g,q.b), mn=Math.min(q.r,q.g,q.b); if(mx-mn<.1&&mx>.25) S.hairC=pk(['#6b4423','#3a2616','#c98a3a','#e0b050','#a8552a','#2b2b30']); }
 S.eye=pk(HD_EYES); { const q=hdC(S.skin); if(q.r*.3+q.g*.59+q.b*.11<.3) S.eye=pk(['#4a2f1a','#3a2616','#2f2a26','#5a3a22']); } S.bt=S.fem?'f':'m'; if(S.w>1.07||(!who&&!staff&&!S.kid&&r()<.16)){ S.bt='r'; } if(S.kid) S.bt='m';
 // coiffure
 let hr=P.hair||S.hair; if(!who){ const F=['bob','long','bun','pony','long','curly','bob','pony'], M=['short','short','tuft','slick','buzz','curly','side','side'];
  if(S.kid) hr=S.fem?pk(['pigtails','bob','pony','bun']):pk(['short','tuft','curly','side']); else if(S.fem){ if(!F.includes(hr)||r()<.5) hr=pk(F); if(r()<.06) hr='afro'; } else { if(!M.includes(hr)||r()<.5) hr=pk(M); if(S.age>=1&&r()<(S.age===2?.4:.08)) hr=r()<.6?'baldside':'bald'; } }
 if(hr==='bald'&&who) hr='baldside'; S.hr=hr;
 // couvre-chef
 let hat=P.hat||S.hat||null; if(hat==='strawhat') hat='straw'; if(staff&&role==='cleaner') hat='cap'; S.hatK=hat; S.hatC=P.hatc||null;
 // visage
 S.glasses=P.glasses||(ex.includes('glasses')?pk(['round','rect','thin','round']):(!who&&S.age===2&&r()<.4?pk(['round','rect']):null)); S.gcol=P.gcol||pk(['#2b2b30','#3a2a22','#5a1f2e','#2f3a4f']);
 S.mous=P.mous||(!who&&!S.fem&&S.age>=1&&r()<.17?pk(['small','bushy']):null); S.beard=P.beard?1:(!who&&!S.fem&&S.age>=0&&!S.kid&&r()<.1?1:0);
 S.wr=!!P.wr||(!who&&S.age===2); S.frk=!!P.frk||(!who&&S.age<=0&&r()<.2); S.lips=P.lips||(!who&&S.fem&&!S.kid&&r()<.42?pk(['#c2475a','#b8323a','#cf6a7c','#a8324a']):null);
 S.ear=P.ear||(!who&&S.fem&&!S.kid&&r()<.36?pk(['#e8c46a','#fffaf0','#d9dde3']):null); S.smile=who?(P.expr==='grin'?2:P.expr==='warm'||P.expr==='smile'?1:0):S.kid?2:r()<.5?1:0;
 // tenue
 const dark=c=>{ const q=hdC(c); return q.r+q.g+q.b<.25; };
 let fit='tee', sl='short', bot='pants', col=null, btn=0, vest=null, vlow=.125, apron=null, apC='#f4efe6', neckw=null, tail=false, belt=false, glove=null, lap=false, sock=null, neckl=false;
 if(staff||role==='rival'||S.hatK==='toque'&&a.s){
  if(role==='chef'||role==='patissier'||role==='rival'||S.hatK==='toque'){ fit='chef'; sl='long'; col='ring'; btn=-3; neckw='kerchief'; apron='short'; apC='#ece5d8'; }
  else if(role==='waiter'||role==='barman'||role==='sommelier'){ fit='waiter'; sl=role==='barman'?'short':'long'; col='flaps'; vest=S.accent; neckw=ex.includes('tie')?'tie':'bowtie'; apron='long'; apC=role==='sommelier'?'#3a1f26':'#22242c'; }
  else if(role==='cleaner'){ fit='cleaner'; sl='short'; col='ring'; apron='bib'; apC=S.accent; glove='#f2d23f'; }
 } else if(who||a.s){ sl='long'; col=ex.includes('tie')||ex.includes('bowtie')||ex.includes('vest')?'flaps':'ring'; if(ex.includes('vest')){ vest=S.accent; if(who==='p'){ vest=S.top; S.top='#f4f1ea'; vlow=.07; lap=true; } if(who==='c'){ vlow=.07; lap=true; vest=S.top; S.top='#e9e2d6'; } }
  if(ex.includes('tie')) neckw='tie'; else if(ex.includes('bowtie')) neckw='bowtie'; else if(ex.includes('scarf')) neckw='scarf'; if(ex.includes('buttons')&&!vest) btn=3; if(ex.includes('apron')){ apron='bib'; apC=who==='o'||who==='r'||who==='l'||who==='z'?'#f6efe2':apC; } if(ex.includes('bib')){ apron='bib'; apC=S.accent; }
  if(who==='o'||who==='c'||who==='r') bot='skirt'; if(who==='z'){ bot='skirt'; sl='short'; sock='#ffffff'; } if(who==='y'){ col='ring'; } if(who==='p'||who==='a'||who==='j') belt=true; if(who==='o') neckl=false; }
 else if(S.kid){ fit=pk(S.fem?['dress','tee','dung']:['tee','dung','tee']); sl='short'; col='ring'; if(fit==='dress') bot='dress'; else if(fit==='dung'){ apron='bib'; apC=S.bottom; } bot=bot==='dress'?bot:(r()<.5?'shorts':'pants'); if(r()<.5) sock='#ffffff'; tail=fit==='tee'&&r()<.5; }
 else { fit=pk(S.fem?['tee','blouse','dress','sweater','jacket','dress','blouse']:['tee','shirt','sweater','jacket','polo','shirt','tee']);
  if(fit==='tee'){ col='ring'; tail=r()<.6; } else if(fit==='shirt'||fit==='blouse'){ sl=r()<.65?'long':'short'; col='flaps'; btn=3; belt=!S.fem||r()<.4; tail=!belt; } else if(fit==='polo'){ col='flaps'; btn=2; tail=true; }
  else if(fit==='sweater'){ sl='long'; col='ring'; tail=true; } else if(fit==='jacket'){ sl='long'; col='flaps'; vest=pk(['#3a4252','#5a4632','#2f3a4f','#6b5b4a','#7a2f3a','#44505a']); vlow=.07; lap=true; S.sleeveC=vest; S.top=pk(['#f4f1ea','#e9e2d6','#dfe7ee','#f2e6e6']); belt=true; }
  else if(fit==='dress'){ bot='dress'; sl=r()<.5?'short':'none'; col=r()<.5?'ring':null; belt=r()<.5; }
  if(bot!=='dress'){ const q=r(); bot=S.fem?(q<.5?'pants':q<.82?'skirt':'shorts'):(q<.86?'pants':'shorts'); }
  if(ex.includes('scarf')) neckw='scarf'; else if(S.fem&&r()<.14) neckl=true; if((bot==='shorts'||bot==='skirt')&&r()<.35) sock='#ffffff'; }
 if(a.st==='life'&&(a.pose||a.par||a.prop)&&L.body){ S.top=L.body; if(L.pants) S.bottom=L.pants; if(L.hat&&!S.hatK){ S.hatK='cap'; S.hatC=L.hat; } }
 if(vest&&!S.sleeveC&&lap) S.sleeveC=vest;
 Object.assign(S,{fit,sl,bot,col,btn,vest,vlow,apron,apC,neckw,tail,belt,glove,lap,sock,neckl});
 S.eyeO=S.age===2?.84:1;
 S.trim=dark(S.top)?shade(S.top,.22):shade(S.top,-.14); S.sole=S.shoes==='#f2efe6'||S.shoes==='#ffffff'?'#d9d2c4':dark(S.shoes)?shade(S.shoes,.18):shade(S.shoes,-.4);
 return S; }

// ---------- la liste des pièces d'un personnage ----------
const HD_BM={};
function hdItems(S,wp,E){ if(!HD_BM.T){ const I=HDI; Object.assign(HD_BM,{T:[I.body,I.chest,I.head,I.legL,I.legR],aR:[I.armR,I.foreR],aL:[I.armL,I.foreL],hR:[I.handR],hL:[I.handL],lR:[I.legR,I.shinR],lL:[I.legL,I.shinL],fR:[I.footR],fL:[I.footL],H:[I.head],H1:[I.head,I.hair1],H2:[I.head,I.hair2],eR:[I.eyeR],eL:[I.eyeL],iR:[I.irisR],iL:[I.irisL],bR:[I.browR],bL:[I.browL],arcs:[I.arcs],mS:[I.mSmile],mO:[I.mOpen]}); }
 const it=[], T=HDP, K=HDK, bt=S.bt, w=S.w, h=S.h, M=HD_BM;
 const add=(t,at,c,k,bm,o)=>{ if(!t||!t.n) return null; const e=Object.assign({t,at,c:typeof c==='string'?hdC(c):c,k:k===undefined?1:k,bm},o||{}); if(typeof e.c2==='string') e.c2=hdC(e.c2); it.push(e); return e; };
 const tor=(t,c,k,o)=>add(t,wp.body,c,k,M.T,Object.assign({sx:w,sy:h},o||{})), hd=(t,c,k,bm,o)=>add(t,wp.head,c,k,bm||M.H,o);
 const skin=S.skin, top=S.top, botC=S.bottom, dress=S.bot==='dress', skirt=S.bot==='skirt', slC=S.sleeveC||top;
 // buste
 tor(T.hips(bt),dress?top:botC); tor(T.shirt(bt),top); tor(T.neck(),skin,K.skin);
 if(S.tail&&!dress&&!skirt&&!S.vest&&!S.apron) tor(T.tail(bt),top);
 if(S.belt&&!S.apron){ if(dress) tor(T.sash(bt),S.accent); else { tor(T.belt(bt),'#3a2a22'); tor(T.buckle(bt),'#d9b24a',K.metal); } }
 if(S.col==='flaps') tor(T.flaps(),S.fit==='waiter'||S.vest?'#ffffff':S.trim); else if(S.col==='ring') tor(T.collar(),S.fit==='chef'?top:S.trim);
 if(S.btn) tor(T.buttons(bt,Math.abs(S.btn),S.btn<0?.042:0),S.fit==='chef'?(S.who==='b'||S.accent==='#d4a53a'?'#d9b24a':'#b9bec6'):S.trim,S.fit==='chef'?K.metal:K.gloss);
 if(S.vest) tor(T.vest(bt,S.vlow),S.vest);
 const apT=shade(S.apC,hdC(S.apC).r+hdC(S.apC).g+hdC(S.apC).b<.3?.3:-.22);
 if(S.apron==='bib'){ tor(T.apronBib(bt),S.apC); tor(T.apronSkirt(bt,.0,1.25,dress||skirt),S.apC); tor(T.apronTie(bt),apT); tor(T.apronStrap(),apT); }
 else if(S.apron==='long'){ tor(T.apronSkirt(bt,-.06,1.2),S.apC); tor(T.apronTie(bt),apT); }
 else if(S.apron==='short'){ tor(T.apronSkirt(bt,.01,1.15),S.apC); tor(T.apronTie(bt),apT); }
 if(S.neckw==='scarf') tor(T.scarf(),S.accent); else if(S.neckw==='kerchief') tor(T.kerchief(),S.accent); else if(S.neckw==='tie') tor(T.tie(bt),S.fit==='waiter'?'#1e1e22':S.accent); else if(S.neckw==='bowtie') tor(T.bowtie(),S.accent==='#2a2c36'?'#c8553d':'#1e1e22');
 if(S.neckl) tor(T.necklace(),'#fffaf0',K.gloss);
 if(dress) tor(T.skirt(bt,-.055),top); else if(skirt) tor(T.skirt(bt,S.who==='o'?-.075:-.03),botC);
 // bras et mains
 for(const s of [-1,1]){ const A=s<0?wp.armR:wp.armL, bm=s<0?M.aR:M.aL, H=s<0?wp.handR:wp.handL;
  if(S.sl==='long'){ add(T.arm('long'),A,slC,1,bm); add(T.arm('cuff'),A,S.fit==='chef'||!S.sleeveC&&!S.vest?shade(slC,-.08):'#ffffff',1,bm); }
  else { add(T.arm('up'),A,S.sl==='none'?skin:slC,S.sl==='none'?K.skin:1,bm); add(T.arm('low'),A,skin,K.skin,bm); }
  add(T.hand(),H,S.glove||skin,S.glove?K.cloth:K.skin,s<0?M.hR:M.hL,{mir:s>0}); }
 // jambes et chaussures
 const bare=dress||skirt, tights=bare&&S.age===2?'#6b5b62':null;
 for(const s of [-1,1]){ const Lg=s<0?wp.legR:wp.legL, bm=s<0?M.lR:M.lL, F=s<0?wp.footR:wp.footL, fb=s<0?M.fR:M.fL;
  if(bare) add(T.leg('long'),Lg,tights||skin,tights?1:K.skin,bm); else if(S.bot==='shorts'){ add(T.leg('up'),Lg,botC,1,bm); add(T.leg('low'),Lg,skin,K.skin,bm); } else add(T.leg('long'),Lg,botC,1,bm);
  if(S.sock) add(T.sock(),F,S.sock,1,fb); add(T.shoe(),F,S.shoes,K.hair,fb,{c2:S.sole}); }
 // tête
 const skL=(()=>{ const q=hdC(skin); return q.r*.3+q.g*.59+q.b*.11; })(), blush=new THREE.Color(skin).lerp(hdC(skL<.3?'#c9584f':'#ff5f6f'),skL<.3?.26:.5), skD=shade(skin,-.2);
 hd(T.head(),skin,K.skin,null,{c2:blush}); for(const s of [-1,1]) hd(T.ear(),skin,K.skin,null,{mir:s<0,c2:blush}); hd(T.nose(),skin,K.skin,null,{c2:blush});
 const lidC=shade(S.hairC,-.5), dk='#2a1c15', browC=hdC(S.hairC).r+hdC(S.hairC).g+hdC(S.hairC).b>1.5?shade(S.hairC,-.3):shade(S.hairC,-.18);
 for(const s of [-1,1]){ const e=s<0?wp.eyeR:wp.eyeL, ry=s*E;
  add(T.eyeW(),e,'#fffdf8',K.gloss,s<0?M.eR:M.eL,{ry}); add(T.eyeLid(S.fem?1:0),e,dk,1,s<0?M.eR:M.eL,{ry,mir:s<0});
  add(T.eyeI(),e,S.eye,K.gloss,s<0?M.iR:M.iL,{ry}); add(T.eyeP(),e,'#140d0a',K.gloss,s<0?M.iR:M.iL,{ry}); add(T.eyeH(),e,'#ffffff',K.glow,s<0?M.iR:M.iL,{ry});
  add(T.brow(S.fem?0:1),s<0?wp.browR:wp.browL,browC,K.hair,s<0?M.bR:M.bL,{ry,mir:s<0}); add(T.arc1(),e,dk,1,M.arcs,{ry}); }
 add(T.smile(S.smile),wp.mSmile,S.lips||'#8a3a34',S.lips?K.hair:1,M.mS); add(T.mouthO(),wp.mOpen,'#571b21',1,M.mO); add(T.tongue(),wp.mOpen,'#e8707c',K.hair,M.mO); add(T.teeth(),wp.mOpen,'#fffaf2',K.hair,M.mO);
 if(S.wr) hd(T.wrinkles(),skD,K.skin); if(S.frk) hd(T.freckles(),shade(skin,-.3),K.skin);
 if(S.ear) for(const s of [-1,1]) hd(T.earring(S.ear==='#e8c46a'?1:0),S.ear,S.ear==='#fffaf0'?K.gloss:K.metal,null,{mir:s<0});
 // cheveux
 const hc=S.hairC, hl=shade(hc,.2), hat=S.hatK, brim=hat&&hat!=='bow'&&hat!=='beret', hair=(t,bm,o)=>hd(t,hc,K.hair,bm,Object.assign({c2:hl},o||{})), hr=S.hr;
 if(S.mous) hd(T.mous(S.mous),hc,K.hair); if(S.beard){ hd(T.beard(S.who==='y'?1:0),hc,K.hair,null,{c2:hl}); if(!S.mous) hd(T.mous('bushy'),hc,K.hair); }
 if(hr==='baldside') hair(T.hairBand()); else if(hr!=='bald'){
  const cap=brim?'under':({short:'short',tuft:'short',side:'short',buzz:'buzz',slick:'slick',bob:'bob',long:'long',bun:'fem',pony:'fem',pigtails:'fem',curly:'curly',afro:'curly'}[hr]||'short'); hair(T.hairCap(cap));
  if(hr==='tuft'&&!hat) hair(T.tuft()); if((hr==='short'||hr==='tuft')&&!brim) hair(T.fringe('up')); if((hr==='side'||hr==='bun'||hr==='pony'||hr==='slick'&&S.fem)&&!brim) hair(T.fringe('side')); if(hr==='pigtails'&&!brim) hair(T.fringe('side'));
  if(hr==='bob'&&brim){ hair(T.hairBack('bob')); hair(T.hairSide('bob')); } if(hr==='long'){ hair(T.hairBack('long'),M.H1); hair(T.hairSide('long')); }
  if(hr==='bun') hair(T.bun()); if(hr==='pony') hair(T.pony(),M.H1); if(hr==='pigtails'){ hair(T.pigtail(),M.H1); hair(T.pigtail(),M.H2,{mir:true}); }
  if(hr==='curly'&&!brim) hair(T.curls(0)); if(hr==='afro'&&!brim) hair(T.curls(1)); }
 // lunettes
 if(S.glasses) hd(T.glasses(S.glasses),S.gcol,S.gcol==='#c9a13a'?K.metal:K.hair);
 // couvre-chef
 const ac=S.hatC||S.accent;
 if(hat==='toque') hd(T.toque(S.who==='b'||S.accent==='#d4a53a'?1:0),'#ffffff'); else if(hat==='bcap') hd(T.bcap(),'#fbf8f2'); else if(hat==='cap') hd(T.cap(),ac); else if(hat==='beret') hd(T.beret(),ac);
 else if(hat==='straw'){ hd(T.straw(),'#e8c98a'); hd(T.strawBand(),S.accent==='#e8d49a'?'#c8553d':S.accent); } else if(hat==='captain'){ hd(T.captain(),'#f6f4ee'); hd(T.captVisor(),'#1b2230',K.hair); hd(T.captBand(),'#27496b'); hd(T.badge(),'#d9b24a',K.metal); }
 else if(hat==='bow') hd(T.bow(),ac);
 return it; }

// ---------- création ----------
function makeCharHD(a,q){ const q0=HD.q; let S,rig,geo; HD.q=q||q0; try{ S=hdSpec(a); rig=hdRig(S); geo=hdBuildGeo(hdItems(S,rig.wp,rig.E)); } finally{ HD.q=q0; } const mesh=new THREE.SkinnedMesh(geo,hdMat());
 mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData.cg=1; mesh.add(rig.bones[0]); mesh.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(rig.bones)); mesh.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.48,0),.74);
 const root=new THREE.Group(), sc=S.kid?.8:1.1; root.scale.setScalar(sc); root.add(mesh);
 const B={}; HDN.forEach((n,i)=>B[n]=rig.bones[i]);
 const pr=charProps(), hold=new THREE.Group(); B.body.add(hold); for(const p of [pr.tray,pr.tub,pr.tab,pr.tpe,pr.menuB]){ p.visible=false; hold.add(p); }
 pr.tray.position.set(0,.262,.275); pr.tub.position.set(0,.2,.29); pr.tab.position.set(0,.245,.215); pr.tpe.position.set(0,.245,.215); pr.menuB.position.set(0,.3,.22);
 pr.fork.visible=false; pr.fork.position.set(0,.115,.012); B.handR.add(pr.fork); pr.phone.visible=false; pr.phone.position.set(0,-.05,.03); pr.phone.rotation.set(1.95,0,0); B.handR.add(pr.phone);
 for(const g of [pr.tray,pr.tub,pr.tab,pr.tpe,pr.menuB,pr.fork,pr.phone]) g.traverse(m=>{ if(m.isMesh) m.castShadow=false; });
 B.arcs.scale.setScalar(.001); B.mOpen.scale.setScalar(.001); B.mSmile.scale.set(.9,.7,1);
 return Object.assign({hd:true,root,mesh,B,S,by0:B.browL.position.y,body:B.body,head:B.head,legs:[B.legR,B.legL],arms:[B.armR,B.armL],role:a.s?a.s.role:null,sc,sx:0,sz:0,sitK:a.sitting?1:0,mv:0,blinkT:rnd(1,4),yaw:0,pit:0,P:{aL:0,aR:0,zL:0,zR:0,lean:0,legL:0,legR:0}},pr); }

// ---------- animation : les mêmes intentions que les personnages « cosy » (animCharC), jouées par un vrai squelette ----------
const hdBend=A=>Math.max(0,Math.sin(Math.min(A,2.3)))*1.05+.16;
function hdLimbs(a,o,dt,T,k,sw,mv,sp,breathe){ const B=o.B, P=o.P, cw=Math.cos(o.wph||0);
 // bras : l'épaule donne la direction, le coude plie d'autant plus que la main monte devant
 const bR=hdBend(P.aR), bL=hdBend(P.aL); B.armR.rotation.set(-(P.aR-bR*.5),0,-P.zR); B.foreR.rotation.x=-bR; B.armL.rotation.set(-(P.aL-bL*.5),0,P.zL); B.foreL.rotation.x=-bL;
 // jambes : le genou plie pendant que la jambe revient vers l'avant ; assis, cuisses à l'horizontale et mollets pendants
 const lg=-1.45*k, tap=a.sitting&&a.st==='wait'&&a.pat<35?Math.max(0,Math.sin(T*11))*.3:0;
 const hR=lg+sw*.72*mv*sp, hL=lg-sw*.72*mv*sp, kR=1.45*k+mv*(.1+Math.max(0,-cw)*sp)-tap, kL=1.45*k+mv*(.1+Math.max(0,cw)*sp);
 B.legR.rotation.x=hR; B.shinR.rotation.x=kR; B.footR.rotation.x=-(hR+kR)+.22*k; B.legL.rotation.x=hL; B.shinL.rotation.x=kL; B.footL.rotation.x=-(hL+kL)+.22*k;
 // buste : le bassin et les épaules tournent en sens contraire quand on marche
 B.body.rotation.set(P.lean*.55,-sw*.07*mv,sw*.05*mv); B.chest.rotation.set(P.lean*.45,sw*.17*mv,-sw*.03*mv); const br=breathe-1; B.chest.scale.set(1+br*1.3,1+br*.7,1+br*1.8); }
function hdFace(a,o,dt,T,F){ const B=o.B, id=a.id||(a.s?a.s.id:3), hid=.001, blink=o.blinkT<.13, sq=F.happy&&!F.eating;
 const es=1.14, ey=(blink?.1:(o.S.eyeO||1))*es; if(sq){ B.eyeR.scale.setScalar(hid); B.eyeL.scale.setScalar(hid); B.arcs.scale.setScalar(es); } else { B.eyeR.scale.set(es,ey,1); B.eyeL.scale.set(es,ey,1); B.arcs.scale.setScalar(hid); }
 // regard : les iris devancent un peu la tête
 const gx=clamp((F.hT-o.yaw)*.9,-1,1)*.0075+Math.sin(T*.7+id)*.0012, gy=clamp(-o.pit*.4,-1,1)*.004; B.irisR.position.set(gx,gy,0); B.irisL.position.set(gx,gy,0);
 // sourcils
 const ang=a.mood==='angry', bz=F.sad?(ang?.34:-.26):F.op?-.06:0, by=(F.sad&&ang?-.006:0)+(F.happy?.005:0)+(F.op?.008:0), q=Math.min(1,dt*9);
 o.bz=(o.bz||0)+(bz-(o.bz||0))*q; o.by=(o.by||0)+(by-(o.by||0))*q; B.browL.rotation.z=o.bz; B.browR.rotation.z=-o.bz; B.browL.position.y=B.browR.position.y=o.by0+o.by;
 // bouche
 const open=F.op||F.eating;
 if(open){ B.mOpen.scale.set(F.eating?.8:1,F.laughing?1.25:F.eating?.9:.55+.45*Math.abs(Math.sin(T*13+id)),1); B.mSmile.scale.setScalar(hid); }
 else { B.mOpen.scale.setScalar(hid); B.mSmile.scale.set(F.happy?1.12:F.sad?.9:.88,F.happy?1.1:F.sad?.8:.62+(F.chew?Math.sin(T*9+id)*.22:0),1); B.mSmile.rotation.z=F.sad?Math.PI:0; }
 // cheveux qui suivent le mouvement
 const hs=clamp(-(o.spd||0)*.22,-.5,0)+Math.sin((o.wph||0)*2)*.07*o.mv+Math.sin(T*1.3+id)*.025; B.hair1.rotation.x=hs+(o.S.hr==='long'?clamp(-(o.pit+(o.P.lean||0))*.62,-.45,.3):0); B.hair2.rotation.x=hs; B.hair1.rotation.z=Math.sin(T*1.1+id)*.03; B.hair2.rotation.z=-B.hair1.rotation.z; }
