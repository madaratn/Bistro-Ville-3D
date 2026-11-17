/* ---------------- RENDU ---------------- */
const cv=$('#c'); let ctx=cv.getContext('2d'); let dpr=1;
const cam={x:0,y:0,z:1};
const FONT='Fredoka,"Trebuchet MS",sans-serif';
function resize(){ dpr=Math.min(2.5,window.devicePixelRatio||1); cv.width=innerWidth*dpr; cv.height=innerHeight*dpr; }
function centerCam(){ cam.z=clamp(Math.min(innerWidth/(S*64-10),(innerHeight-190)/(S*32+90)),.45,1.6); cam.x=innerWidth/2; cam.y=innerHeight/2-(S*16-24)*cam.z; }
const iso=(x,y)=>[(x-y)*32,(x+y)*16];
const ctr=(x,y)=>iso(x+.5,y+.5);
const _sc={};
function rgbOf(c){ if(c[0]==='#'){ const n=parseInt(c.slice(1),16); return [n>>16,n>>8&255,n&255]; } const m=c.match(/\d+/g); return [+m[0],+m[1],+m[2]]; }
function shade(c,amt){ const k=c+amt; if(_sc[k]) return _sc[k]; let [r,g,b]=rgbOf(c); const f=amt<0?0:255,p=Math.abs(amt); r=Math.round((f-r)*p+r); g=Math.round((f-g)*p+g); b=Math.round((f-b)*p+b); return _sc[k]=`rgb(${r},${g},${b})`; }
function poly(pts){ ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]); ctx.closePath(); ctx.fill(); }
function line(a,b){ ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke(); }
function ell(x,y,rx,ry){ ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill(); }
function circ(x,y,r){ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }
function rr(x,y,w,h,r){ if(w<0){x+=w;w=-w;} if(h<0){y+=h;h=-h;} r=Math.max(0,Math.min(r,w/2,h/2)); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function emo(e,x,y,s){ ctx.font=s+'px '+EMO; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(e,x,y); }
function vg(y0,y1,c0,c1){ const g=ctx.createLinearGradient(0,y0,0,y1); g.addColorStop(0,c0); g.addColorStop(1,c1); return g; }
function hg(x0,x1,st){ const g=ctx.createLinearGradient(x0,0,x1,0); for(const [o,c] of st) g.addColorStop(o,c); return g; }
function rg(x,y,r,c0,c1,fx,fy){ const g=ctx.createRadialGradient(fx??x,fy??y,0,x,y,r); g.addColorStop(0,c0); g.addColorStop(1,c1); return g; }
function soft(cx,cy,rx,ry,a){ ctx.save(); ctx.translate(cx,cy); ctx.scale(1,ry/rx); ctx.fillStyle=rg(0,0,rx,`rgba(50,30,15,${a??.28})`,'rgba(50,30,15,0)'); circ(0,0,rx); ctx.restore(); }
const G=(cx,cy,gx,gy,z)=>[cx+(gx-gy)*32,cy+(gx+gy)*16-z];
function boxG(cx,cy,ax,ay,h,z,top,left,right,hl){
 const z1=z+h;
 const T=[G(cx,cy,-ax,-ay,z1),G(cx,cy,ax,-ay,z1),G(cx,cy,ax,ay,z1),G(cx,cy,-ax,ay,z1)];
 if(h>0){
  const yb=cy-z+(ax+ay)*16, yt=cy-z1;
  ctx.fillStyle=h>5?vg(yt,yb,left,shade(left,-.14)):left; poly([G(cx,cy,-ax,ay,z),G(cx,cy,ax,ay,z),G(cx,cy,ax,ay,z1),G(cx,cy,-ax,ay,z1)]);
  ctx.fillStyle=h>5?vg(yt,yb,right,shade(right,-.14)):right; poly([G(cx,cy,ax,-ay,z),G(cx,cy,ax,ay,z),G(cx,cy,ax,ay,z1),G(cx,cy,ax,-ay,z1)]);
 }
 ctx.fillStyle=top; poly(T);
 if(hl!==false){ ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=1; ctx.lineJoin='round'; ctx.beginPath(); ctx.moveTo(T[3][0],T[3][1]); ctx.lineTo(T[2][0],T[2][1]); ctx.lineTo(T[1][0],T[1][1]); ctx.stroke(); }
}
const boxC=(cx,cy,ax,ay,h,z,c)=>boxG(cx,cy,ax,ay,h,z,shade(c,.08),shade(c,-.1),shade(c,-.26));
function cyl(cx,cy,r,h,z,top,side){
 const rx=r*45.25, ry=r*22.6, yb=cy-z, yt=yb-h;
 if(h>0){ ctx.fillStyle=hg(cx-rx,cx+rx,[[0,shade(side,.08)],[.4,side],[1,shade(side,-.32)]]);
  ctx.beginPath(); ctx.moveTo(cx-rx,yt); ctx.lineTo(cx-rx,yb); ctx.ellipse(cx,yb,rx,ry,0,Math.PI,0,true); ctx.lineTo(cx+rx,yt); ctx.closePath(); ctx.fill(); }
 ctx.fillStyle=top; ell(cx,yt,rx,ry);
}
function tile(x,y,col){ ctx.fillStyle=col; poly([iso(x,y),iso(x+1,y),iso(x+1,y+1),iso(x,y+1)]); }
function coinIcon(x,y,r){
 ctx.fillStyle='#c98a0c'; circ(x,y+r*.12,r);
 ctx.fillStyle=rg(x,y,r,'#fff4b0','#f5b81c',x-r*.35,y-r*.4); circ(x,y,r);
 ctx.strokeStyle='rgba(170,100,0,.45)'; ctx.lineWidth=r*.18; ctx.beginPath(); ctx.arc(x,y,r*.62,0,Math.PI*2); ctx.stroke();
}
function nightF(){
 if(!state.daynight) return 0;
 const d=new Date(), h=d.getHours()+d.getMinutes()/60;
 if(h>=7.5&&h<=18) return 0; if(h>18&&h<20.5) return (h-18)/2.5; if(h>=20.5||h<6) return 1; return 1-(h-6)/1.5;
}

/* --- décor statique --- */
const TUFTS=[]; (function(){ let s=7; const r=()=>{ s=(s*9301+49297)%233280; return s/233280; }; for(let i=0;i<120;i++) TUFTS.push([r()*44-22,r()*44-22,r(),r()]); })();
function backWins(){ const m=Math.floor(S/2), o=[]; for(let i=1;i<S-1;i+=2) if(Math.abs(i-m)>1) o.push(i); return o; }
function leftWins(){ const o=[]; for(let j=1;j<S-1;j+=2) if(!(j>=2&&j<=4)) o.push(j); return o; }
function drawGrass(){
 const T=performance.now()/1000;
 for(const [gx,gy,a,b] of TUFTS){
  const x=Math.round(gx), y=Math.round(gy);
  if(x>=-1&&x<=S&&y>=-1&&y<=S+3) continue;
  const p=ctr(gx,gy);
  if(a<.75){ ctx.strokeStyle='rgba(60,120,40,.35)'; ctx.lineWidth=1.6; ctx.lineCap='round'; const sw=Math.sin(T*1.5+a*9)*1.2; for(let k=-1;k<=1;k++){ ctx.beginPath(); ctx.moveTo(p[0]+k*3,p[1]); ctx.quadraticCurveTo(p[0]+k*4,p[1]-5,p[0]+k*5+sw,p[1]-8+Math.abs(k)*2); ctx.stroke(); } }
  else { const cs=['#fff','#ffd84d','#ff8fb1','#b8a6ff']; ctx.fillStyle=cs[Math.floor(b*4)]; for(let k=0;k<5;k++) circ(p[0]+Math.cos(k*1.26)*2.6,p[1]-3+Math.sin(k*1.26)*1.6,1.6); ctx.fillStyle='#ffb020'; circ(p[0],p[1]-3,1.2); }
 }
}
function drawStreet(){
 const x0=-16,x1=S+16;
 // trottoir
 for(let y=S;y<=S+1;y++) for(let x=x0;x<x1;x++) tile(x,y,(x+y)%2?'#ece6dc':'#e4ddd1');
 ctx.strokeStyle='rgba(120,100,80,.12)'; ctx.lineWidth=1;
 for(let x=x0;x<=x1;x++) line(iso(x,S),iso(x,S+2));
 line(iso(x0,S+1),iso(x1,S+1));
 // bordure
 const a=iso(x0,S+2), b=iso(x1,S+2);
 ctx.fillStyle='#cfc6b8'; poly([a,b,[b[0],b[1]+4],[a[0],a[1]+4]]);
 ctx.fillStyle='#f4efe7'; poly([[a[0],a[1]-2],[b[0],b[1]-2],b,a]);
 // route
 const c=iso(x0,S+4), d=iso(x1,S+4);
 ctx.fillStyle=vg(a[1],c[1],'#6b717c','#5c626c'); poly([[a[0],a[1]+4],[b[0],b[1]+4],d,c]);
 ctx.fillStyle='rgba(255,255,255,.85)';
 for(let x=x0;x<x1;x+=2){ const p=iso(x+.25,S+3), q=iso(x+1.1,S+3); poly([[p[0],p[1]-1.6],[q[0],q[1]-1.6],[q[0],q[1]+1.6],[p[0],p[1]+1.6]]); }
 const e=iso(x0,S+4), f=iso(x1,S+4), g=iso(x0,S+6), h=iso(x1,S+6);
 ctx.fillStyle='#e4ddd1'; poly([e,f,h,g]);
}
function drawFloor(){
 const F=FLOORS[state.floor];
 for(let y=0;y<S;y++) for(let x=0;x<S;x++) tile(x,y,F.pat==='checker'?((x+y)%2?F.a:F.b):F.a);
 if(F.pat==='plank'){
  for(let r=0;r<S*3;r++) if(r%2){ ctx.fillStyle=F.b; poly([iso(0,r/3),iso(S,r/3),iso(S,(r+1)/3),iso(0,(r+1)/3)]); }
  ctx.strokeStyle='rgba(90,50,20,.2)'; ctx.lineWidth=.8;
  for(let r=0;r<=S*3;r++) line(iso(0,r/3),iso(S,r/3));
  for(let r=0;r<S*3;r++) for(let x=0;x<S;x++){ const o=((r*7)%3)/3; if(x+o<S) line(iso(x+o,r/3),iso(x+o,(r+1)/3)); }
 } else {
  ctx.strokeStyle=F.pat==='tile'?F.b:'rgba(0,0,0,.05)'; ctx.lineWidth=F.pat==='tile'?1.6:1;
  for(let i=0;i<=S;i++){ line(iso(i,0),iso(i,S)); line(iso(0,i),iso(S,i)); }
 }
 // reflet doux
 const m=ctr(S/2-.5,S/2-.5); ctx.fillStyle=rg(m[0],m[1],S*36,'rgba(255,255,255,.16)','rgba(255,255,255,0)'); poly([iso(0,0),iso(S,0),iso(S,S),iso(0,S)]);
 // occlusion le long des murs
 let p=iso(S/2,0), q=iso(S/2,.8); let gr=ctx.createLinearGradient(p[0],p[1],q[0],q[1]); gr.addColorStop(0,'rgba(70,40,15,.22)'); gr.addColorStop(1,'rgba(70,40,15,0)'); ctx.fillStyle=gr; poly([iso(0,0),iso(S,0),iso(S,.8),iso(0,.8)]);
 p=iso(0,S/2); q=iso(.8,S/2); gr=ctx.createLinearGradient(p[0],p[1],q[0],q[1]); gr.addColorStop(0,'rgba(70,40,15,.22)'); gr.addColorStop(1,'rgba(70,40,15,0)'); ctx.fillStyle=gr; poly([iso(0,0),iso(0,S),iso(.8,S),iso(.8,0)]);
 // rayons de soleil
 const n=nightF(); if(n<1){ ctx.fillStyle=`rgba(255,246,215,${.3*(1-n)})`;
  for(const i of backWins()) poly([iso(i+.15,.04),iso(i+.85,.04),iso(i+1.25,1.5),iso(i+.55,1.5)]);
  for(const j of leftWins()) poly([iso(.04,j+.15),iso(.04,j+.85),iso(1.5,j+1.25),iso(1.5,j+.55)]); }
 // paillasson
 const dp=ctr(DX,S-1); ctx.fillStyle='#a8463c'; rr(0,0,0,0,0); poly([[dp[0],dp[1]-12],[dp[0]+24,dp[1]],[dp[0],dp[1]+12],[dp[0]-24,dp[1]]]);
 ctx.strokeStyle='rgba(255,220,180,.5)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(dp[0],dp[1]-8); ctx.lineTo(dp[0]+16,dp[1]); ctx.lineTo(dp[0],dp[1]+8); ctx.lineTo(dp[0]-16,dp[1]); ctx.closePath(); ctx.stroke();
}
function wallPanel(p0,p1,ux,base,dark){
 // ux : sens du mur (1 = mur du fond, -1 = mur gauche)
 const up=h=>[[p0[0],p0[1]-h],[p1[0],p1[1]-h]];
 const W=WALLS[state.wall];
 ctx.fillStyle=vg(p0[1]-WH,p0[1],shade(base,.06),shade(base,-.05)); poly([p0,p1,[p1[0],p1[1]-WH],[p0[0],p0[1]-WH]]);
 if(W.s){ ctx.fillStyle=W.s; for(let i=0;i<S*2;i+=2){ const a=ux>0?iso(i/2,0):iso(0,i/2), b=ux>0?iso(i/2+.22,0):iso(0,i/2+.22); poly([[a[0],a[1]-24],[b[0],b[1]-24],[b[0],b[1]-WH],[a[0],a[1]-WH]]); } }
 if(W.brick){ ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=1; for(let h=30,k=0;h<WH;h+=7,k++){ const [a,b]=up(h); line(a,b); for(let i=k%2?0:.25;i<S;i+=.5){ const q=ux>0?iso(i,0):iso(0,i); line([q[0],q[1]-h],[q[0],q[1]-h-7]); } } }
 // soubassement
 const [w0,w1]=up(24);
 ctx.fillStyle=vg(p0[1]-24,p0[1],W.w,shade(W.w,-.1)); poly([p0,p1,w1,w0]);
 ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1; for(let i=.5;i<S;i+=.5){ const q=ux>0?iso(i,0):iso(0,i); line([q[0],q[1]-4],[q[0],q[1]-22]); }
 ctx.fillStyle=shade(W.w,.35); poly([[w0[0],w0[1]],[w1[0],w1[1]],[w1[0],w1[1]-3],[w0[0],w0[1]-3]]);
 ctx.fillStyle=shade(W.w,-.35); poly([p0,p1,[p1[0],p1[1]-4],[p0[0],p0[1]-4]]);
 if(dark){ ctx.fillStyle='rgba(30,20,10,.08)'; poly([p0,p1,[p1[0],p1[1]-WH],[p0[0],p0[1]-WH]]); }
}
function windowAt(ga,gb,back,n){
 const P=(t,h)=>{ const g=back?iso(ga+(gb-ga)*t,0):iso(0,ga+(gb-ga)*t); return [g[0],g[1]-h]; };
 const z0=30,z1=58;
 ctx.fillStyle='#fffaf3'; poly([P(-.06,z0-3),P(1.06,z0-3),P(1.06,z1+3),P(-.06,z1+3)]);
 const a=P(0,z1), b=P(0,z0);
 ctx.fillStyle=n>.5?vg(a[1],b[1],'#1f2a55','#3b4a7a'):vg(a[1],b[1],'#9fd6ff','#e3f4ff'); poly([P(0,z0),P(1,z0),P(1,z1),P(0,z1)]);
 if(n>.5){ ctx.fillStyle='rgba(255,255,255,.8)'; const s=P(.3,z1-8); circ(s[0],s[1],1); const s2=P(.75,z1-15); circ(s2[0],s2[1],.8); }
 ctx.fillStyle='rgba(255,255,255,.45)'; poly([P(.1,z0+2),P(.25,z0+2),P(.55,z1-2),P(.4,z1-2)]);
 ctx.strokeStyle='#fffaf3'; ctx.lineWidth=2.2; line(P(.5,z0),P(.5,z1)); line(P(0,(z0+z1)/2),P(1,(z0+z1)/2));
 ctx.fillStyle='#e9dccb'; poly([P(-.1,z0-1),P(1.1,z0-1),P(1.1,z0-5),P(-.1,z0-5)]);
}
function drawWalls(){
 const W=WALLS[state.wall], n=nightF();
 const o=iso(0,0), r=iso(S,0), l=iso(0,S), t=.16;
 wallPanel(o,r,1,W.c,false); wallPanel(o,l,-1,shade(W.c,-.08),true);
 // épaisseur des murs
 const k=iso(-t,-t), kr=iso(S,-t), kl=iso(-t,S);
 ctx.fillStyle='#fffaf2'; poly([[k[0],k[1]-WH],[kr[0],kr[1]-WH],[r[0],r[1]-WH],[o[0],o[1]-WH]]);
 ctx.fillStyle='#f6eee2'; poly([[k[0],k[1]-WH],[o[0],o[1]-WH],[l[0],l[1]-WH],[kl[0],kl[1]-WH]]);
 ctx.fillStyle=shade(W.c,-.3); poly([r,kr,[kr[0],kr[1]-WH],[r[0],r[1]-WH]]);
 ctx.fillStyle=shade(W.c,-.18); poly([l,kl,[kl[0],kl[1]-WH],[l[0],l[1]-WH]]);
 for(const i of backWins()) windowAt(i+.15,i+.85,true,n);
 for(const j of leftWins()) windowAt(j+.15,j+.85,false,n);
 // tableaux
 for(let j=5;j<S-1;j+=2){ if(leftWins().includes(j)) continue; const a=iso(0,j+.25), b=iso(0,j+.75);
  ctx.fillStyle='#c79a52'; poly([[a[0],a[1]-30],[b[0],b[1]-30],[b[0],b[1]-54],[a[0],a[1]-54]]);
  ctx.fillStyle=['#7fc8a9','#f6a5a5','#9bb7f0'][j%3]; poly([[a[0]-2,a[1]-32],[b[0]+2,b[1]-32],[b[0]+2,b[1]-52],[a[0]-2,a[1]-52]]);
  ctx.fillStyle='rgba(255,255,255,.7)'; const m=iso(0,j+.5); circ(m[0],m[1]-44,3.5); }
 // enseigne
 const mid=Math.floor(S/2);
 ctx.save(); const sp=iso(mid,0); ctx.translate(sp[0],sp[1]-47); ctx.transform(1,.5,0,1,0,0);
 ctx.fillStyle='rgba(0,0,0,.18)'; rr(-60,-12,120,30,10); ctx.fill();
 ctx.fillStyle=vg(-15,15,'#3c6b55','#2a4d3d'); rr(-60,-15,120,30,10); ctx.fill();
 ctx.strokeStyle='#e8c46a'; ctx.lineWidth=1.5; rr(-56,-11,112,22,7); ctx.stroke();
 ctx.fillStyle='#ffe29a'; ctx.font='600 15px '+FONT; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(state.name.slice(0,16),0,1);
 ctx.restore();
 // ardoise
 ctx.save(); const mp=iso(0,3); ctx.translate(mp[0],mp[1]-42); ctx.transform(1,-.5,0,1,0,0);
 ctx.fillStyle='#8b5a34'; rr(-31,-19,62,40,6); ctx.fill(); ctx.fillStyle=vg(-16,16,'#33423a','#26322c'); rr(-28,-16,56,34,4); ctx.fill();
 ctx.fillStyle='#fff'; ctx.font='600 8px '+FONT; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('MENU',0,-10);
 state.menu.slice(0,6).forEach((id,i)=>emo(DISHM[id].e,-17+(i%3)*17,2+Math.floor(i/3)*11,9));
 ctx.restore();
}
function bushRow(cx,cy,ax,ay,seed){
 boxG(cx,cy,ax,ay,8,0,'#efe9df','#ddd5c8','#c9c0b2',false);
 const T=performance.now()/1000;
 for(let i=0;i<3;i++){ const t=(i+.5)/3-.5, p=G(cx,cy,ax*2*t*(ax>ay?1:0),ay*2*t*(ay>ax?1:0),12); const sw=Math.sin(T*1.2+seed+i)*.6;
  ctx.fillStyle=rg(p[0]+sw,p[1],11,'#7ccf5e','#3f9a45',p[0]-4,p[1]-5); circ(p[0]+sw,p[1],10.5); }
}
const hedgeX=x=>{ const p=iso(x+.5,S); bushRow(p[0],p[1],.5,.09,x); };
const hedgeY=y=>{ const p=iso(S,y+.5); bushRow(p[0],p[1],.09,.5,y*3); };
function drawDoor(){
 for(const gx of [DX,DX+1]){ const p=iso(gx,S); boxC(p[0],p[1],.05,.05,40,0,'#6d4a33'); }
 const a=iso(DX,S), b=iso(DX+1,S), a2=iso(DX,S+.45), b2=iso(DX+1,S+.45);
 for(let i=0;i<6;i++){ const t0=i/6,t1=(i+1)/6, L=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
  ctx.fillStyle=i%2?'#fff7ee':'#ef5a4f';
  const p0=L(a,b,t0),p1=L(a,b,t1),q0=L(a2,b2,t0),q1=L(a2,b2,t1);
  poly([[p0[0],p0[1]-44],[p1[0],p1[1]-44],[q1[0],q1[1]-34],[q0[0],q0[1]-34]]); }
 ctx.fillStyle='rgba(0,0,0,.12)'; poly([[a2[0],a2[1]-34],[b2[0],b2[1]-34],[b2[0],b2[1]-32],[a2[0],a2[1]-32]]);
}
function drawTree(cx,cy,seed){
 const T=performance.now()/1000, sw=Math.sin(T*.9+seed)*1.5;
 soft(cx,cy+2,22,10,.25);
 ctx.fillStyle=hg(cx-4,cx+4,[[0,'#9a6a43'],[1,'#6a4429']]); rr(cx-3.5,cy-26,7,27,3); ctx.fill();
 const L=[[0,-46,19],[-11,-36,13],[11,-37,14],[-2,-56,12]];
 for(const [dx,dy,r] of L){ ctx.fillStyle=rg(cx+dx+sw,cy+dy,r,'#8fdc6a','#3c9a47',cx+dx+sw-r*.4,cy+dy-r*.5); circ(cx+dx+sw,cy+dy,r); }
}
function drawStreetLamp(cx,cy){
 soft(cx,cy+1,8,4,.25);
 ctx.fillStyle='#3d4450'; rr(cx-2,cy-58,4,58,2); ctx.fill(); ell(cx,cy,5,2.5);
 ctx.fillStyle='#3d4450'; rr(cx-2,cy-60,14,4,2); ctx.fill();
 ctx.fillStyle=nightF()>.3?'#fff2b8':'#e9edf2'; ell(cx+10,cy-55,5,3);
}
function drawBench(cx,cy){
 soft(cx,cy,20,8,.2);
 for(const s of [-.3,.3]){ const p=G(cx,cy,s,0,0); boxC(p[0],p[1],.04,.12,10,0,'#3d4450'); }
 boxG(cx,cy,.42,.13,3,10,'#d39a5f','#b98146','#a06c37');
 const p=G(cx,cy,0,-.12,0); boxG(p[0],p[1],.42,.025,10,14,'#d39a5f','#b98146','#a06c37');
}
let cars=[],carT=3;
const CAR_COLS=['#ef5a4f','#4f8ff7','#ffd23f','#4fc28f','#f7f7f7','#9b6bf7','#ff9a3d'];
function updCars(dt){
 carT-=dt; if(carT<=0){ carT=rnd(4,10); const dirn=Math.random()<.5?1:-1; cars.push({x:dirn>0?-16:S+16,y:dirn>0?S+2.5:S+3.5,v:dirn*rnd(3,4.5),c:pick(CAR_COLS),k:Math.random()<.25}); }
 for(const c of cars) c.x+=c.v*dt; cars=cars.filter(c=>c.x>-17&&c.x<S+17);
}
function drawCar(c){
 const p=iso(c.x,c.y), cx=p[0], cy=p[1];
 soft(cx,cy+2,30,12,.3);
 for(const [gx,gy] of [[-.32,-.2],[.32,-.2],[-.32,.2],[.32,.2]]){ const q=G(cx,cy,gx,gy,4); ctx.fillStyle='#22252b'; ell(q[0],q[1],4.2,4.2); }
 if(c.k){ boxG(cx,cy,.55,.24,16,3,shade(c.c,.1),shade(c.c,-.05),shade(c.c,-.25)); const f=G(cx,cy,.55*Math.sign(c.v),0,0); boxG(f[0]-Math.sign(c.v)*0,f[1],.02,.2,8,10,'#bfe3ff','#9fd0f5','#7fb8e6',false); return; }
 boxG(cx,cy,.5,.23,8,3,shade(c.c,.1),shade(c.c,-.05),shade(c.c,-.25));
 const o=-Math.sign(c.v)*.06; const q=G(cx,cy,o,0,0);
 boxG(q[0],q[1],.27,.2,8,11,shade(c.c,.18),'#a9d8f7','#86c1ea');
 const h=G(cx,cy,.5*Math.sign(c.v),.14,8); ctx.fillStyle='#fff6c2'; circ(h[0],h[1],1.8);
}

/* --- mobilier --- */
let tableItems=new Map(),readyAt=new Map(),cookAt=new Map();
function chairBackDir(f){ if(!f) return [0,-1]; const t=seatTable(f); if(!t) return [0,-1]; return [f.x-t.x,f.y-t.y]; }
function drawChairBack(f,cx,cy,col){
 const [bx,by]=chairBackDir(f), F=f?FURN[f.t]:null;
 const big=F&&F.kind==='chair'&&F.big;
 const ax=bx?.035:(big?.21:.17), ay=by?.035:(big?.21:.17);
 const o=big?.19:.16, c2=[cx+(bx*o-by*o)*32,cy+(bx*o+by*o)*16];
 boxG(c2[0],c2[1],ax,ay,big?20:17,big?16:13,shade(col,.15),shade(col,-.02),shade(col,-.2));
}
function drawFurn(t,cx,cy,f){
 const F=FURN[t], T=performance.now()/1000;
 switch(F.kind){
 case 'table':{
  soft(cx,cy+2,25,12,.26);
  cyl(cx,cy,.17,2,0,shade(F.col,-.05),shade(F.col,-.2));
  ctx.fillStyle=hg(cx-3,cx+3,[[0,shade(F.col,.15)],[1,shade(F.col,-.3)]]); ctx.fillRect(cx-2.5,cy-17,5,16);
  if(F.marble){ cyl(cx,cy,.4,4,16,'#f4f2ee','#d9d5ce'); ctx.fillStyle='rgba(160,160,170,.25)'; ctx.lineWidth=.8; }
  else cyl(cx,cy,.41,8,14,shade(F.cloth,.05),shade(F.cloth,-.04));
  ctx.fillStyle='rgba(255,255,255,.28)'; ell(cx-7,cy-25,11,3.5);
  if(f){ const it=tableItems.get(f.id)||[]; it.forEach((e,i)=>{ const x=cx+(it.length>1?(i?9:-9):0); ctx.fillStyle='#fff'; ell(x,cy-23,8,3.5); emo(e,x,cy-28,14); });
   const dn=Math.min(dirty.get(f.id)||0,2); for(let j=0;j<dn;j++){ const x=cx+10-j*18; ctx.fillStyle='#fdfdfd'; ell(x,cy-23,7.5,3.4); ctx.fillStyle='rgba(150,110,60,.45)'; ell(x+1,cy-23,4,1.8); } }
  break;}
 case 'chair':{
  const [bx,by]=chairBackDir(f), dk=shade(F.col,-.45);
  soft(cx,cy+1,13,6,.22);
  if(F.big){ cyl(cx,cy,.21,10,0,shade(F.col,.18),F.col); }
  else { ctx.strokeStyle=dk; ctx.lineWidth=2; ctx.lineCap='round'; for(const [lx,ly] of [[-.12,-.12],[.12,-.12],[-.12,.12],[.12,.12]]) line(G(cx,cy,lx,ly,0),G(cx,cy,lx,ly,11)); cyl(cx,cy,.18,3,11,shade(F.col,.2),F.col); }
  if(!(bx>0||by>0)) drawChairBack(f,cx,cy,F.col);
  break;}
 case 'stove':{
  soft(cx,cy+2,26,12,.28);
  const pro=F.speed>1, body=pro?'#3b4049':'#dfe4ea';
  boxG(cx,cy,.38,.38,26,0,'#2b2f36',pro?'#474d57':'#e8ecf0',pro?'#31353c':'#b9c1ca');
  const cooking=f&&cookAt.has(f.id);
  // vitre du four
  const W=[G(cx,cy,-.26,.38,5),G(cx,cy,.22,.38,5),G(cx,cy,.22,.38,17),G(cx,cy,-.26,.38,17)];
  ctx.fillStyle=cooking?vg(W[2][1],W[0][1],'#ffb347','#e0522f'):'#2d3238'; poly(W);
  ctx.fillStyle='rgba(255,255,255,.18)'; poly([W[0],G(cx,cy,-.16,.38,5),G(cx,cy,-.04,.38,17),W[3]]);
  ctx.strokeStyle=pro?'#e3b04b':'#9aa3ad'; ctx.lineWidth=1.6; line(G(cx,cy,-.28,.38,21),G(cx,cy,.24,.38,21));
  for(let i=0;i<3;i++){ const p=G(cx,cy,.38,-.22+i*.2,19); ctx.fillStyle=pro?'#e3b04b':'#4a515b'; circ(p[0],p[1],2); }
  for(const [bx,by] of [[-.17,-.12],[.15,.14]]){ const p=G(cx,cy,bx,by,26); ctx.strokeStyle=cooking?'#ff7a2f':'#555b63'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.ellipse(p[0],p[1],7,3.5,0,0,Math.PI*2); ctx.stroke(); if(cooking){ ctx.fillStyle='rgba(255,110,40,.35)'; ell(p[0],p[1],6,3); } }
  if(cooking){
   const p=G(cx,cy,-.17,-.12,26); cyl(p[0],p[1],.15,9,0,'#c94a3a','#e25b48'); ctx.fillStyle='#b8b8b8'; ell(p[0],p[1]-10,7,3.2); ctx.fillStyle='#888'; circ(p[0],p[1]-12,1.6);
   for(let i=0;i<3;i++){ const ph=(T*.8+i/3)%1; ctx.fillStyle=`rgba(255,255,255,${.65*(1-ph)})`; circ(p[0]-4+i*4+Math.sin(T*3+i)*2,p[1]-16-ph*22,3+ph*5); }
  }
  if(f){ const it=readyAt.get(f.id); if(it) it.forEach((e,i)=>{ const p=G(cx,cy,.12,.1,26); ctx.fillStyle='#fff'; ell(p[0]+i*9,p[1],7,3); emo(e,p[0]+i*9,p[1]-5,13); }); }
  break;}
 case 'counter':{
  soft(cx,cy+2,27,13,.26);
  boxG(cx,cy,.43,.43,22,0,'#000',shade(F.col,.05),shade(F.col,-.18),false);
  ctx.strokeStyle='rgba(60,30,10,.25)'; ctx.lineWidth=1; for(const s of [-.14,.14]){ line(G(cx,cy,s,.43,3),G(cx,cy,s,.43,19)); line(G(cx,cy,.43,s,3),G(cx,cy,.43,s,19)); }
  boxG(cx,cy,.47,.47,3,22,'#f7f4ee','#e6e1d8','#d3ccbf');
  if(f){ const it=readyAt.get(f.id)||[]; it.forEach((e,i)=>{ const x=cx-12+i*12, y=cy-27-(i%2)*3; ctx.fillStyle='#fff'; ell(x,y+3,7.5,3.2); ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.stroke(); emo(e,x,y-2,14); }); }
  break;}
 case 'plant':{
  soft(cx,cy+1,14,6,.25);
  cyl(cx,cy,.15,12,0,'#5b3a26','#d9774f'); cyl(cx,cy,.17,3,11,'#5b3a26','#e58a62');
  const sw=Math.sin(T*1.1+cx*.1)*.06;
  for(let i=0;i<7;i++){ const a=-Math.PI/2+(i-3)*.42+sw, L=i%2?13:16, x=cx+Math.cos(a)*L*.85, y=cy-18+Math.sin(a)*L;
   ctx.save(); ctx.translate(x,y); ctx.rotate(a+Math.PI/2); ctx.fillStyle=vg(-9,9,i%2?'#6fcf74':'#4fb562',i%2?'#3f9a4f':'#2f7f40'); ell(0,0,4.8,9.5); ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=.8; line([0,-8],[0,8]); ctx.restore(); }
  break;}
 case 'flowers':{
  soft(cx,cy+1,16,7,.22);
  cyl(cx,cy,.2,10,0,'#e9dfcf','#f7f2ea');
  for(const [dx,dy,r] of [[-7,-15,8],[7,-15,8],[0,-19,9]]){ ctx.fillStyle=rg(cx+dx,cy+dy,r,'#7ccf5e','#3d9447',cx+dx-3,cy+dy-3); circ(cx+dx,cy+dy,r); }
  const cs=['#ff7aa8','#ffd23f','#ff6b6b','#c58cff','#ffffff','#ff9a3d'];
  for(let i=0;i<7;i++){ const x=cx+Math.cos(i*2.4)*10, y=cy-19+Math.sin(i*2.4)*6; ctx.fillStyle=cs[i%6]; for(let k=0;k<5;k++) circ(x+Math.cos(k*1.26)*2.2,y+Math.sin(k*1.26)*2.2,1.8); ctx.fillStyle='#ffb020'; circ(x,y,1.3); }
  break;}
 case 'lamp':{
  ctx.fillStyle=rg(cx,cy-50,36,'rgba(255,214,120,.35)','rgba(255,214,120,0)'); circ(cx,cy-50,36);
  soft(cx,cy+1,10,5,.25); cyl(cx,cy,.11,3,0,'#4a4f58','#3a3f47');
  ctx.fillStyle=hg(cx-2,cx+2,[[0,'#d8b46a'],[1,'#a07a35']]); ctx.fillRect(cx-1.5,cy-56,3,54);
  ctx.fillStyle=vg(cy-70,cy-50,'#fff1c9','#f7c860'); ctx.beginPath(); ctx.moveTo(cx-13,cy-50); ctx.quadraticCurveTo(cx-12,cy-70,cx,cy-71); ctx.quadraticCurveTo(cx+12,cy-70,cx+13,cy-50); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,250,220,.9)'; ell(cx,cy-50,13,3);
  break;}
 case 'jukebox':{
  soft(cx,cy+2,22,10,.28);
  ctx.fillStyle=vg(cy-56,cy,'#ff6fa8','#7b3fd1'); ctx.beginPath(); ctx.moveTo(cx-15,cy); ctx.lineTo(cx-15,cy-38); ctx.arc(cx,cy-38,15,Math.PI,0); ctx.lineTo(cx+15,cy); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=`hsl(${(T*80)%360},90%,70%)`; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(cx-11,cy-4); ctx.lineTo(cx-11,cy-38); ctx.arc(cx,cy-38,11,Math.PI,0); ctx.lineTo(cx+11,cy-4); ctx.stroke();
  ctx.fillStyle='#ffe9a8'; ctx.beginPath(); ctx.arc(cx,cy-36,7,Math.PI,0); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.35)'; rr(cx-8,cy-22,16,14,3); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1; for(let i=0;i<4;i++) line([cx-6,cy-19+i*3],[cx+6,cy-19+i*3]);
  ctx.globalAlpha=.55+.45*Math.sin(T*3); emo('🎵',cx+10+Math.sin(T*2)*5,cy-62-(T*12%14),12); ctx.globalAlpha=1;
  break;}
 case 'aquarium':{
  soft(cx,cy+2,28,12,.28);
  boxG(cx,cy,.42,.26,12,0,'#8a5a36','#9c6a42','#7b4f2f');
  ctx.globalAlpha=.85; boxG(cx,cy,.4,.24,24,12,'rgba(170,225,250,.9)','#6cc4ee','#45a7dc',false); ctx.globalAlpha=1;
  ctx.fillStyle='#ecd9a8'; poly([G(cx,cy,-.4,.24,12),G(cx,cy,.4,.24,12),G(cx,cy,.4,.24,16),G(cx,cy,-.4,.24,16)]);
  ctx.strokeStyle='#3fa34d'; ctx.lineWidth=2; ctx.lineCap='round'; for(const s of [-.25,.2]){ const p=G(cx,cy,s,.24,14); ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.quadraticCurveTo(p[0]+Math.sin(T*2+s*9)*4,p[1]-9,p[0]+Math.sin(T*2+s)*2,p[1]-16); ctx.stroke(); }
  for(let i=0;i<3;i++){ const fx=cx-12+((T*7+i*13)%24), fy=cy-19-i*5; ctx.fillStyle=['#ff8c1a','#ffd23f','#ff5e7e'][i]; ell(fx,fy,3.6,2.2); poly([[fx-3,fy],[fx-6,fy-2.5],[fx-6,fy+2.5]]); }
  ctx.fillStyle='rgba(255,255,255,.8)'; for(let i=0;i<2;i++) circ(cx+8-i*5,cy-20-((T*10+i*7)%16),1.3);
  ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.lineWidth=1.2; line(G(cx,cy,-.36,.24,15),G(cx,cy,-.36,.24,33));
  break;}
 case 'fountain':{
  soft(cx,cy+2,28,13,.25);
  cyl(cx,cy,.43,9,0,'#cdd5dd','#dfe5eb');
  ctx.fillStyle=rg(cx,cy-9,18,'#8fd3ff','#3c9de0'); ell(cx,cy-9,16,8);
  for(let i=0;i<2;i++){ const ph=(T*.6+i*.5)%1; ctx.strokeStyle=`rgba(255,255,255,${.6*(1-ph)})`; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(cx,cy-9,4+ph*12,2+ph*6,0,0,Math.PI*2); ctx.stroke(); }
  cyl(cx,cy,.06,18,9,'#e8edf1','#d5dbe1'); cyl(cx,cy,.16,3,27,'#8fd3ff','#d5dbe1');
  for(let i=0;i<8;i++){ const ph=(T*.9+i/8)%1, a=i*Math.PI/4; ctx.fillStyle=`rgba(140,210,255,${1-ph})`; circ(cx+Math.cos(a)*ph*15,cy-31+Math.sin(a)*ph*7-Math.sin(ph*Math.PI)*10,1.8); }
  break;}
 case 'statue':{
  soft(cx,cy+2,18,8,.26);
  boxG(cx,cy,.26,.26,16,0,'#f4f1ea','#e2ddd2','#cbc4b6');
  ctx.fillStyle=rg(cx,cy-32,14,'#ffe78a','#c98a0c',cx-4,cy-38); ell(cx,cy-30,8,12);
  ctx.fillStyle=rg(cx,cy-47,8,'#ffe78a','#c98a0c',cx-2,cy-49); circ(cx,cy-47,6.5);
  ctx.strokeStyle='#d9a21c'; ctx.lineWidth=3; ctx.lineCap='round'; line([cx+6,cy-36],[cx+12,cy-50]);
  ctx.fillStyle='#ffe78a'; circ(cx+12,cy-52,3.5);
  const tw=Math.max(0,Math.sin(T*2.5)); ctx.fillStyle=`rgba(255,255,255,${tw})`; star4(cx-6,cy-40,4*tw);
  break;}
 }
}
function star4(x,y,r){ if(r<=0) return; ctx.beginPath(); ctx.moveTo(x,y-r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.quadraticCurveTo(x,y,x,y+r); ctx.quadraticCurveTo(x,y,x-r,y); ctx.quadraticCurveTo(x,y,x,y-r); ctx.fill(); }

/* --- personnages --- */
function drawPerson(a,cx,cy){
 const L=a.look, sit=a.sitting, t=a.ph, mv=a.moving, d=a.dir, back=a.back;
 const role=a.s?a.s.role:null, now=performance.now()/1000;
 const bob=mv?Math.abs(Math.sin(t))*2:0, y=cy-(sit?10:0)-bob, hy=y-35;
 soft(cx,cy+1,11,5,.3);
 const pants=role==='chef'?'#3d3f4c':role==='waiter'?'#262833':role==='cleaner'?'#1f7d80':(L.pants||'#3b4a6b');
 const body=role==='chef'?'#fbfbfb':role==='waiter'?'#ffffff':role==='cleaner'?'#2bb3b1':L.body;
 const hc=L.hair, hs=L.hs??0;
 // cheveux longs (derrière)
 if(hs===1&&!back){ ctx.fillStyle=vg(hy-6,hy+16,shade(hc,.1),shade(hc,-.15)); rr(cx-12,hy-4,24,19,8); ctx.fill(); }
 // jambes
 if(!sit){ const sw=mv?Math.sin(t)*3:0; ctx.fillStyle=pants; rr(cx-5.5,y-10-Math.max(0,sw)*.5,4.6,10,2.3); ctx.fill(); rr(cx+.9,y-10-Math.max(0,-sw)*.5,4.6,10,2.3); ctx.fill();
  ctx.fillStyle='#2b2b30'; ell(cx-3.2+sw*.5,y-.5,3.2,1.9); ell(cx+3.2-sw*.5,y-.5,3.2,1.9); }
 else { ctx.fillStyle=pants; rr(cx-6+d*2,y-9,12,6,3); ctx.fill(); }
 // bras arrière
 const as=mv&&!a.carry?Math.sin(t)*3.2:0;
 ctx.fillStyle=shade(body,-.18); rr(cx-d*9-2,y-23-as*.4,4.5,11,2.2); ctx.fill();
 // corps
 ctx.fillStyle=vg(y-25,y-7,shade(body,.1),shade(body,-.12)); rr(cx-8.5,y-25,17,18,7); ctx.fill();
 if(role==='chef'){ ctx.fillStyle='#c9ccd3'; for(const k of [-1,1]) for(let i=0;i<2;i++) circ(cx+k*3,y-20+i*5,1.1); ctx.fillStyle='#ef5a4f'; poly([[cx-5,y-25],[cx+5,y-25],[cx,y-21]]); }
 if(role==='waiter'){ ctx.fillStyle=vg(y-25,y-7,'#3a3d4a','#22242d'); poly([[cx-8.5,y-23],[cx-2,y-25],[cx-1,y-8],[cx-8.5,y-9]]); poly([[cx+8.5,y-23],[cx+2,y-25],[cx+1,y-8],[cx+8.5,y-9]]); if(!back){ ctx.fillStyle='#e5484d'; poly([[cx-4.5,y-26],[cx,y-24],[cx-4.5,y-22]]); poly([[cx+4.5,y-26],[cx,y-24],[cx+4.5,y-22]]); circ(cx,y-24,1.3); } }
 if(role==='cleaner'){ ctx.fillStyle='#1f8f8d'; rr(cx-6,y-21,12,13,3); ctx.fill(); ctx.fillStyle='#ffd23f'; circ(cx-3,y-19,1.2); circ(cx+3,y-19,1.2); }
 // bras avant / plateau
 if(a.carry){
  ctx.fillStyle=shade(body,-.05); rr(cx+d*3-2,y-21,d*9+(d>0?0:4),4.5,2.2); ctx.fill();
  const tx=cx+d*11, ty=y-20;
  ctx.fillStyle='#c9ced6'; ell(tx,ty+1,10,3.8); ctx.fillStyle='#eef1f5'; ell(tx,ty,10,3.6);
  ctx.fillStyle='#fff'; ell(tx,ty-1,6,2.4); emo(a.carry,tx,ty-6,14);
 } else {
  ctx.fillStyle=shade(body,-.05); rr(cx+d*7-2,y-23+as*.4,4.5,11,2.2); ctx.fill();
  ctx.fillStyle=L.skin; circ(cx+d*7+.2,y-11.5+as*.4,2.4);
 }
 // tête
 ctx.fillStyle=rg(cx,hy,12,shade(L.skin,.12),shade(L.skin,-.08),cx-3,hy-4); circ(cx,hy,11);
 const gh=vg(hy-13,hy+6,shade(hc,.18),shade(hc,-.15));
 if(back){
  ctx.fillStyle=gh; ctx.beginPath(); ctx.arc(cx,hy,11.8,Math.PI*.82,Math.PI*2.18); ctx.closePath(); ctx.fill();
  if(hs===1){ rr(cx-11.5,hy-2,23,17,8); ctx.fill(); }
 } else {
  const ex=d*2.3, blink=((now+a.ph*3)%4.2)<.13;
  ctx.fillStyle='#2a1d16';
  if(blink){ ctx.fillRect(cx-5.6+ex,hy+1.3,3.6,1.2); ctx.fillRect(cx+2+ex,hy+1.3,3.6,1.2); }
  else { ell(cx-3.8+ex,hy+1.6,1.7,2.3); ell(cx+3.8+ex,hy+1.6,1.7,2.3); ctx.fillStyle='#fff'; circ(cx-3.3+ex,hy+.8,.7); circ(cx+4.3+ex,hy+.8,.7); }
  ctx.fillStyle='rgba(255,110,120,.35)'; ell(cx-6.5+ex,hy+5.2,2.5,1.4); ell(cx+6.5+ex,hy+5.2,2.5,1.4);
  ctx.strokeStyle='#7a3b2e'; ctx.lineWidth=1.1; ctx.lineCap='round'; ctx.beginPath();
  if(a.mood==='angry'){ ctx.arc(cx+ex,hy+8.5,2.2,Math.PI*1.15,Math.PI*1.85); } else if(a.mood==='happy'||a.st==='eat'){ ctx.arc(cx+ex,hy+4.8,2.6,Math.PI*.15,Math.PI*.85); } else { ctx.moveTo(cx+ex-1.6,hy+6); ctx.lineTo(cx+ex+1.6,hy+6); }
  ctx.stroke();
  if(L.gl){ ctx.strokeStyle='#2a2a30'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx-3.8+ex,hy+1.6,3.2,0,Math.PI*2); ctx.moveTo(cx+7+ex,hy+1.6); ctx.arc(cx+3.8+ex,hy+1.6,3.2,0,Math.PI*2); ctx.moveTo(cx-.6+ex,hy+1.4); ctx.lineTo(cx+.6+ex,hy+1.4); ctx.stroke(); }
  // cheveux avant
  ctx.fillStyle=gh;
  if(hs===3){ for(let i=0;i<9;i++){ const ang=Math.PI*(1.0+i/8); circ(cx+Math.cos(ang)*10,hy-1+Math.sin(ang)*10,4.6); } }
  else { ctx.beginPath(); ctx.arc(cx,hy,11.8,Math.PI*.96,Math.PI*2.04); ctx.quadraticCurveTo(cx+d*3,hy-9,cx-11.7,hy+1); ctx.closePath(); ctx.fill(); }
  if(hs===1){ rr(cx-12,hy-2,4.5,15,2.2); ctx.fill(); rr(cx+7.5,hy-2,4.5,15,2.2); ctx.fill(); }
 }
 if(hs===2){ ctx.fillStyle=gh; circ(cx,hy-12.5,5.2); }
 // chapeaux
 if(role==='chef'){ ctx.fillStyle='#e9ebef'; rr(cx-8,hy-15,16,6,2.5); ctx.fill(); ctx.fillStyle=rg(cx,hy-22,12,'#ffffff','#e3e6ea',cx-3,hy-26); circ(cx-5,hy-20,5.6); circ(cx+5,hy-20,5.6); circ(cx,hy-24,6.4); }
 if(role==='cleaner'){ ctx.fillStyle='#1f8f8d'; ctx.beginPath(); ctx.arc(cx,hy-3,11.6,Math.PI,0); ctx.fill(); if(!back){ ctx.fillStyle='#187472'; ell(cx+d*8,hy-3,7,2.2); } }
 if(L.hat&&!role){ ctx.fillStyle=L.hat; ell(cx,hy-9,14,4); rr(cx-8,hy-19,16,11,5); ctx.fill(); ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(cx-8,hy-12,16,2.5); }
}
function bubble(x,y,e,pat,icon){
 ctx.fillStyle='rgba(60,30,10,.18)'; circ(x,y-18,16.5);
 ctx.fillStyle='#fff'; circ(x,y-20,16); poly([[x-5,y-7],[x+5,y-7],[x,y-1]]);
 if(pat!=null){ ctx.lineCap='round'; ctx.lineWidth=3; ctx.strokeStyle='#efe6da'; ctx.beginPath(); ctx.arc(x,y-20,13,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle=`hsl(${pat*1.2},72%,48%)`; ctx.beginPath(); ctx.arc(x,y-20,13,-Math.PI/2,-Math.PI/2+Math.PI*2*pat/100); ctx.stroke(); }
 emo(e,x,y-20,15);
}
let parts=[];
function sparkle(wx,wy,n,col){ for(let i=0;i<n;i++) parts.push({x:wx,y:wy,vx:rnd(-40,40),vy:rnd(-70,-20),t:rnd(.5,.9),c:col||pick(['#ffd23f','#fff3a8','#ffb020'])}); }
function drawGround(){ drawGrass(); drawStreet(); }

function render(){
 const w=innerWidth,h=innerHeight, n=nightF(), T=performance.now()/1000;
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.fillStyle=vg(0,h,'#b7e38a','#93cf68'); ctx.fillRect(0,0,w,h);
 ctx.setTransform(dpr*cam.z,0,0,dpr*cam.z,cam.x*dpr,cam.y*dpr);
 tableItems=new Map(); readyAt=new Map(); cookAt=new Map();
 for(const c of custs) if(c.st==='eat'&&c.table&&c.order){ const a=tableItems.get(c.table.id)||[]; a.push(DISHM[c.order.dish].e); tableItems.set(c.table.id,a); }
 for(const o of orders) if(o.st==='ready'&&o.at){ const a=readyAt.get(o.at.id)||[]; a.push(DISHM[o.dish].e); readyAt.set(o.at.id,a); }
 for(const a of crew) if(a.job&&a.job.s==='cook') cookAt.set(a.job.stove.id,1-a.job.t/a.job.T);
 drawGround(); drawFloor(); drawWalls();
 if(mode==='edit'){
  ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.lineWidth=1;
  for(let i=0;i<=S;i++){ line(iso(i,0),iso(i,S)); line(iso(0,i),iso(S,i)); }
  if(sel){ ctx.globalAlpha=.35+.2*Math.sin(T*5); tile(sel.x,sel.y,'#ffd23f'); ctx.globalAlpha=1; }
 }
 for(const t of trash){ const p=ctr(t.x,t.y); soft(p[0],p[1],8,4,.2); emo(t.e,p[0],p[1]-4,14); }
 const Lst=[];
 for(const f of state.furn){
  const p=ctr(f.x,f.y), k=f.x+f.y;
  if(sel===f&&ghost) continue;
  Lst.push([k,()=>drawFurn(f.t,p[0],p[1],f)]);
  if(kindOf(f)==='chair'){ const [bx,by]=chairBackDir(f); if(bx>0||by>0) Lst.push([k+.04,()=>drawChairBack(f,p[0],p[1],FURN[f.t].col)]); }
 }
 for(const a of crew) Lst.push([a.fx+a.fy+.05,()=>{const p=ctr(a.fx,a.fy); drawPerson(a,p[0],p[1]);}]);
 for(const c of custs) Lst.push([c.fx+c.fy+(c.sitting?.02:.05),()=>{const p=ctr(c.fx,c.fy); ctx.globalAlpha=c.al??1; drawPerson(c,p[0],p[1]); ctx.globalAlpha=1;}]);
 for(const it of items) Lst.push([it.x+it.y,()=>{const p=ctr(it.x,it.y), b=Math.sin(T*4+it.id)*3; ctx.globalAlpha=it.t<5?(Math.sin(it.t*10)>0?1:.4):1;
  ctx.fillStyle=rg(p[0],p[1],16,'rgba(255,225,110,.7)','rgba(255,225,110,0)'); ell(p[0],p[1],16,8);
  ctx.fillStyle='rgba(255,255,255,.95)'; circ(p[0],p[1]-16+b,12); emo(ING[it.k].e,p[0],p[1]-16+b,15); ctx.fillStyle='#ffd23f'; star4(p[0]+11,p[1]-28+b,4+Math.sin(T*6)*1.5); ctx.globalAlpha=1;}]);
 for(let x=0;x<S;x++) if(x!==DX) Lst.push([x+S-.45,()=>hedgeX(x)]);
 for(let y=0;y<S;y++) Lst.push([S+y-.45,()=>hedgeY(y)]);
 Lst.push([DX+S-.4,drawDoor]);
 const trees=[[-3,1],[-2.6,4.6],[-3.4,7.2],[-2,-1.6],[S+1.5,1.6],[S+2.6,5.2],[S+1.4,-1]];
 trees.forEach(([tx,ty],i)=>Lst.push([tx+ty,()=>{const p=ctr(tx,ty); drawTree(p[0],p[1],i*1.7);}]));
 for(const lx of [-4,S+3]) Lst.push([lx+S+1.8,()=>{const p=ctr(lx,S+1.3); drawStreetLamp(p[0],p[1]);}]);
 Lst.push([-3+S+.5,()=>{const p=ctr(-3,S+.5); drawBench(p[0],p[1]);}]);
 for(const c of cars) Lst.push([c.x+c.y,()=>drawCar(c)]);
 Lst.sort((a,b)=>a[0]-b[0]); for(const [,fn] of Lst) fn();
 if(mode==='edit'&&ghost){
  const t=placing||(sel&&sel.t); if(t){ const ok=canPlace(ghost.x,ghost.y,sel); ctx.globalAlpha=.5; tile(ghost.x,ghost.y,ok?'#3bd16f':'#ff4d4d'); ctx.globalAlpha=.75; const p=ctr(ghost.x,ghost.y); drawFurn(t,p[0],p[1],null); ctx.globalAlpha=1; }
 }
 // nuit
 if(n>0){
  ctx.save(); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.globalCompositeOperation='multiply';
  const k=n*.62; ctx.fillStyle=`rgb(${Math.round(255-k*160)},${Math.round(255-k*140)},${Math.round(255-k*70)})`; ctx.fillRect(0,0,w,h); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const m=ctr(S/2-.5,S/2-.5); ctx.fillStyle=rg(m[0],m[1]-10,S*34,`rgba(255,190,110,${.22*n})`,'rgba(255,190,110,0)'); circ(m[0],m[1]-10,S*34);
  for(const f of state.furn) if(f.t==='lamp'){ const p=ctr(f.x,f.y); ctx.fillStyle=rg(p[0],p[1]-40,70,`rgba(255,200,110,${.35*n})`,'rgba(255,200,110,0)'); circ(p[0],p[1]-40,70); }
  for(const lx of [-4,S+3]){ const p=ctr(lx,S+1.3); ctx.fillStyle=rg(p[0]+10,p[1]-40,80,`rgba(255,220,140,${.4*n})`,'rgba(255,220,140,0)'); circ(p[0]+10,p[1]-40,80); }
  for(const c of cars){ const p=iso(c.x+Math.sign(c.v)*1.4,c.y); ctx.fillStyle=rg(p[0],p[1],34,`rgba(255,240,180,${.35*n})`,'rgba(255,240,180,0)'); ell(p[0],p[1],34,16); }
  ctx.restore();
 }
 // bulles & infos
 for(const c of custs){ const p=ctr(c.fx,c.fy), y=p[1]-(c.sitting?10:0)-52; if(c.st==='wait'&&c.order) bubble(p[0],y,DISHM[c.order.dish].e,c.pat); else if(c.st==='queue') bubble(p[0],y,'⏳',c.pat); }
 for(const a of crew) if(a.job&&a.job.s==='cook'){ const s=a.job.stove, p=ctr(s.x,s.y), pr=1-a.job.t/a.job.T, y=p[1]-70;
  ctx.fillStyle='rgba(60,30,10,.18)'; circ(p[0],y+1.5,11); ctx.fillStyle='#fff'; circ(p[0],y,11);
  ctx.strokeStyle='#ffe2cc'; ctx.lineWidth=3.5; ctx.beginPath(); ctx.arc(p[0],y,7.5,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle='#ff7a2f'; ctx.lineCap='round'; ctx.beginPath(); ctx.arc(p[0],y,7.5,-Math.PI/2,-Math.PI/2+pr*Math.PI*2); ctx.stroke();
  emo(DISHM[a.job.o.dish].e,p[0],y,8); }
 for(const q of parts){ const p=ctr(q.x,q.y); ctx.globalAlpha=clamp(q.t*2,0,1); ctx.fillStyle=q.c; star4(p[0]+(q.ox||0),p[1]-40+(q.oy||0),3.5); } ctx.globalAlpha=1;
 for(const f of floaters){
  const p=ctr(f.x,f.y), age=1.6-f.t, sc=age<.18?.4+age/.18*.75:age<.3?1.15-(age-.18)/.12*.15:1, y=p[1]-62-age*20;
  ctx.save(); ctx.globalAlpha=clamp(f.t*1.5,0,1); ctx.translate(p[0],y); ctx.scale(sc,sc);
  ctx.font='600 14px '+FONT+','+EMO; ctx.textAlign='center'; ctx.textBaseline='middle';
  if(f.coin){ const tw=ctx.measureText(f.s).width, W=tw+30; ctx.fillStyle='rgba(60,30,10,.2)'; rr(-W/2,-11,W,24,12); ctx.fill(); ctx.fillStyle='#fff'; rr(-W/2,-12,W,24,12); ctx.fill(); coinIcon(-W/2+13,0,7.5); ctx.fillStyle='#b26a00'; ctx.fillText(f.s,9,1); }
  else { ctx.lineWidth=4; ctx.strokeStyle='rgba(255,255,255,.95)'; ctx.strokeText(f.s,0,0); ctx.fillStyle=f.c||'#3b2a1a'; ctx.fillText(f.s,0,0); }
  ctx.restore();
 }
}
function floatAt(x,y,s,c,coin){ floaters.push({x,y,s,c,coin,t:1.6}); }
function updFx(dt){
 for(const f of floaters) f.t-=dt; floaters=floaters.filter(f=>f.t>0);
 for(const q of parts){ q.ox=(q.ox||0)+q.vx*dt; q.oy=(q.oy||0)+q.vy*dt; q.vy+=160*dt; q.t-=dt; }
 parts=parts.filter(q=>q.t>0);
 updCars(dt);
}
