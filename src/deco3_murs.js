/* =====================================================================
   v0.99.2 — déco des murs et des sols (2/4) : papiers peints, fresques, soubassements.
   Un papier peint se dessine sur 384 × 256 points, pour un pan de 1,5 case de large
   et toute la hauteur du mur ; il se répète à l'horizontale, jamais à la verticale.
   ===================================================================== */
const WPAT={
 plaster(x,w,h,W,r){ for(let n=0;n<70;n++){ const X=r()*w, Y=r()*h, R=20+r()*50, lt=r()<.5; for(const o of [-w,0,w]){ const g=x.createRadialGradient(X+o,Y,0,X+o,Y,R); g.addColorStop(0,lt?'rgba(255,255,255,.045)':'rgba(0,0,0,.035)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(X+o-R,Y-R,R*2,R*2); } } },
 dots(x,w,h,W){ x.fillStyle=W.s; for(let j=0;j<7;j++) for(let i=-1;i<9;i++){ x.beginPath(); x.arc(i*48+(j&1?24:0)+24,j*42+16,7,0,7); x.fill(); } },
 gingham(x,w,h,W){ x.fillStyle=W.s; x.globalAlpha=.5; for(let i=0;i<w/32;i+=2) x.fillRect(i*32,0,32,h); for(let j=0;j<h/32;j+=2) x.fillRect(0,j*32,w,32); x.globalAlpha=1; },
 diam(x,w,h,W){ x.fillStyle=W.s; const a=32,b=h/6; for(let j=-1;j<4;j++) for(let i=-1;i<7;i++){ const X=i*64+32, Y=(2*j+1)*b; x.beginPath(); x.moveTo(X,Y-b); x.lineTo(X+a,Y); x.lineTo(X,Y+b); x.lineTo(X-a,Y); x.fill(); } if(W.g){ x.fillStyle=W.g; for(let j=0;j<7;j++) for(let i=0;i<13;i++) if((i+j)&1){ x.beginPath(); x.arc(i*32,j*b,2.6,0,7); x.fill(); } } },
 metro(x,w,h,W){ const bw=64,bh=32; for(let j=0;j<h/bh;j++) for(let i=-1;i<w/bw+1;i++){ const X=i*bw+(j&1?bw/2:0), Y=j*bh; x.fillStyle=W.c; x.fillRect(X,Y,bw,bh); x.fillStyle='rgba(255,255,255,.35)'; x.fillRect(X+3,Y+3,bw-6,3); x.fillStyle='rgba(0,0,0,.08)'; x.fillRect(X+3,Y+bh-6,bw-6,3); x.strokeStyle=W.s; x.lineWidth=2.5; x.strokeRect(X,Y,bw,bh); } },
 brick2(x,w,h,W){ const bw=48,bh=h/12; x.fillStyle=W.s; x.fillRect(0,0,w,h); for(let j=0;j<12;j++) for(let i=-1;i<9;i++){ const X=i*bw+(j&1?24:0), Y=j*bh; x.fillStyle=shade(W.c,[-.08,-.04,0,.04,.07][Math.floor(hsh((i+8)%8,j)*5)]); x.fillRect(X+1.5,Y+1.5,bw-3,bh-3); } },
 plankV(x,w,h,W){ for(let i=0;i<8;i++){ x.fillStyle=shade(W.c,[-.05,0,.04,-.02,.05,-.04,.02,0][i]); x.fillRect(i*48,0,48,h); x.fillStyle='rgba(0,0,0,.22)'; x.fillRect(i*48,0,2,h); x.fillStyle='rgba(255,255,255,.18)'; x.fillRect(i*48+2,0,1.5,h); } },
 plankH(x,w,h,W){ for(let j=0;j<8;j++){ x.fillStyle=shade(W.c,[.03,-.03,0,.04,-.05,.02,-.02,0][j]); x.fillRect(0,j*32,w,32); x.fillStyle='rgba(0,0,0,.2)'; x.fillRect(0,j*32+30,w,2); x.fillStyle='rgba(255,255,255,.2)'; x.fillRect(0,j*32,w,1.5); x.fillStyle='rgba(0,0,0,.25)'; for(const X of [40,232]){ x.beginPath(); x.arc(X+(j&1?96:0),j*32+15,1.6,0,7); x.fill(); } } },
 logs(x,w,h,W){ const n=6,H=h/n; for(let j=0;j<n;j++){ const g=x.createLinearGradient(0,j*H,0,(j+1)*H); g.addColorStop(0,shade(W.c,-.25)); g.addColorStop(.25,shade(W.c,.12)); g.addColorStop(.6,W.c); g.addColorStop(1,shade(W.c,-.4)); x.fillStyle=g; x.fillRect(0,j*H,w,H); x.strokeStyle='rgba(60,30,10,.18)'; x.lineWidth=1; for(let k=0;k<5;k++){ const Y=j*H+8+k*6; x.beginPath(); for(let X=0;X<=w;X+=24) x.lineTo(X,Y+Math.sin(X/w*Math.PI*2*(2+k)+j)*1.5); x.stroke(); } } },
 stone(x,w,h,W){ x.fillStyle=W.s; x.fillRect(0,0,w,h); const rows=6,H=h/rows, P=W.pal||[W.c], WS=[[70,58,96,50,110],[90,64,52,100,78],[60,104,72,88,60]]; for(let j=0;j<rows;j++){ const ws=WS[j%3]; let X=(j&1?-30:0)-384, i=0; while(X<w+60){ const bw=ws[i%5]; x.fillStyle=P[Math.floor(hsh(i%5+j*5,j)*P.length)]; rrect(x,X+2,j*H+2,bw-4,H-4,7); x.fill(); X+=bw; i++; } } },
 tole(x,w,h,W){ for(let i=0;i<16;i++){ const g=x.createLinearGradient(i*24,0,i*24+24,0); g.addColorStop(0,shade(W.c,-.22)); g.addColorStop(.5,shade(W.c,.2)); g.addColorStop(1,shade(W.c,-.22)); x.fillStyle=g; x.fillRect(i*24,0,24,h); } for(const [X,Y,R] of [[60,40,26],[250,180,34],[330,70,18]]) dot(x,X,Y,R,'rgba(120,60,20,.12)'); },
 panel(x,w,h,W){ const bev=(X,Y,a,b)=>{ x.strokeStyle='rgba(0,0,0,.22)'; x.lineWidth=3; x.strokeRect(X,Y,a,b); x.strokeStyle='rgba(255,255,255,.3)'; x.lineWidth=2; x.strokeRect(X+3,Y+3,a-6,b-6); x.strokeStyle='rgba(0,0,0,.12)'; x.strokeRect(X+7,Y+7,a-14,b-14); }; for(let i=0;i<3;i++){ bev(i*128+14,18,100,60); bev(i*128+14,96,100,142); } if(W.s){ x.fillStyle=W.s; x.fillRect(0,84,w,3); } },
 damask(x,w,h,W){ x.fillStyle=W.s; const mot=(X,Y)=>{ x.save(); x.translate(X,Y); for(const sx of [1,-1]){ x.save(); x.scale(sx,1); x.beginPath(); x.moveTo(0,-40); x.bezierCurveTo(26,-30,30,-4,8,6); x.bezierCurveTo(30,10,26,34,0,42); x.bezierCurveTo(6,24,4,14,0,6); x.bezierCurveTo(6,-8,8,-24,0,-40); x.fill(); x.beginPath(); x.ellipse(22,-36,7,4,-.6,0,7); x.fill(); x.beginPath(); x.ellipse(24,40,7,4,.6,0,7); x.fill(); x.restore(); } dot(x,0,-50,4,W.s); dot(x,0,52,4,W.s); x.restore(); }; for(let j=-1;j<3;j++) for(let i=-1;i<5;i++) mot(i*96+(j&1?48:0)+48,j*128+64); },
 floral(x,w,h,W){ const P=W.pal||[W.s], G=W.g||'#6fae5a'; for(let j=-1;j<5;j++) for(let i=-1;i<7;i++){ const X=i*64+(j&1?32:0)+20, Y=j*64+30, c=P[(((i%6)+6)%6+j*2+12)%P.length]; x.strokeStyle=G; x.lineWidth=2.5; x.lineCap='round'; x.beginPath(); x.moveTo(X,Y+6); x.quadraticCurveTo(X+6,Y+18,X-2,Y+28); x.stroke(); x.fillStyle=G; x.beginPath(); x.ellipse(X+7,Y+18,7,3.5,.6,0,7); x.fill(); for(let k=0;k<5;k++){ const a=k/5*6.283; dot(x,X+Math.cos(a)*7,Y+Math.sin(a)*7,5.5,c); } dot(x,X,Y,4,'#ffe08a'); } },
 leaf(x,w,h,W,r){ const P=W.pal||['#2f7a4a','#3f9a5a','#57b86a'], L=[]; for(let n=0;n<16;n++) L.push([r()*w,r()*h,40+r()*36,r()*6.283,Math.floor(r()*P.length)]); for(const [X,Y,s,a,c] of L) for(const o of [-w,0,w]){ x.save(); x.translate(X+o,Y); x.rotate(a); x.fillStyle=P[c]; x.beginPath(); x.moveTo(0,-s); x.bezierCurveTo(s*.55,-s*.5,s*.5,s*.5,0,s); x.bezierCurveTo(-s*.5,s*.5,-s*.55,-s*.5,0,-s); x.fill(); x.strokeStyle='rgba(255,255,255,.28)'; x.lineWidth=1.5; x.beginPath(); x.moveTo(0,-s*.85); x.lineTo(0,s*.9); for(let k=-2;k<3;k++){ x.moveTo(0,k*s*.3); x.lineTo(s*.3,k*s*.3-s*.14); x.moveTo(0,k*s*.3); x.lineTo(-s*.3,k*s*.3-s*.14); } x.stroke(); x.restore(); } },
 seigaiha(x,w,h,W){ const R=32; for(let j=0;j<18;j++) for(let i=-1;i<8;i++){ const X=i*64+(j&1?32:0), Y=j*16+8; x.fillStyle=W.c; x.beginPath(); x.arc(X,Y,R,Math.PI,0); x.fill(); x.strokeStyle=W.s; x.lineWidth=2; for(const q of [1,.68,.36]){ x.beginPath(); x.arc(X,Y,R*q,Math.PI,0); x.stroke(); } } },
 sakura(x,w,h,W,r){ for(const o of [-w,0,w]){ x.save(); x.translate(o,0); x.strokeStyle=W.s||'#5a3a2a'; x.lineCap='round'; x.lineWidth=5; x.beginPath(); x.moveTo(-20,70); x.bezierCurveTo(90,40,150,120,260,90); x.bezierCurveTo(310,78,350,60,404,70); x.stroke(); x.lineWidth=3; x.beginPath(); x.moveTo(120,84); x.quadraticCurveTo(150,40,190,30); x.moveTo(230,98); x.quadraticCurveTo(250,140,300,150); x.moveTo(60,58); x.quadraticCurveTo(70,100,40,130); x.stroke(); x.restore(); }
   for(const [X,Y] of [[60,52],[110,78],[150,52],[190,28],[215,100],[262,92],[300,152],[282,128],[40,128],[66,96],[330,66],[362,62],[20,70],[135,96],[240,60]]) for(const o of [-w,0,w]){ for(let k=0;k<5;k++){ const a=k/5*6.283+X; x.fillStyle=k&1?'#f9c9d8':'#f6b3c8'; x.beginPath(); x.ellipse(X+o+Math.cos(a)*6,Y+Math.sin(a)*6,5.5,4,a,0,7); x.fill(); } dot(x,X+o,Y,2.2,'#e2574c'); }
   x.fillStyle='#f9c9d8'; for(let n=0;n<14;n++){ x.beginPath(); x.ellipse(r()*w,150+r()*100,3.5,2.2,r()*3,0,7); x.fill(); } },
 bamboo(x,w,h,W){ for(const [X,R] of [[30,11],[96,8],[150,13],[226,9],[290,12],[350,8]]){ const g=x.createLinearGradient(X-R,0,X+R,0); g.addColorStop(0,shade(W.s,-.25)); g.addColorStop(.4,shade(W.s,.25)); g.addColorStop(1,shade(W.s,-.3)); x.fillStyle=g; x.fillRect(X-R,0,R*2,h); x.fillStyle=shade(W.s,-.45); for(let Y=(X*7)%50+14;Y<h;Y+=58) x.fillRect(X-R-1,Y,R*2+2,3); }
   x.fillStyle=shade(W.s,.1); for(const [X,Y,a] of [[52,60,.5],[60,70,1],[120,150,-.4],[176,40,.8],[186,52,1.3],[252,120,-.7],[316,200,.6],[324,60,1.1],[10,180,-.9]]){ x.save(); x.translate(X,Y); x.rotate(a); x.beginPath(); x.ellipse(14,0,16,4.5,0,0,7); x.fill(); x.restore(); } },
 artdeco(x,w,h,W){ const R=48; for(let j=0;j<9;j++) for(let i=-1;i<6;i++){ const X=i*96+(j&1?48:0), Y=j*32+16; x.fillStyle=W.c; x.beginPath(); x.arc(X,Y,R,Math.PI,0); x.fill(); x.strokeStyle=W.s; x.lineWidth=2.2; x.beginPath(); x.arc(X,Y,R,Math.PI,0); x.stroke(); x.lineWidth=1.3; for(let k=1;k<6;k++){ const a=Math.PI+k/6*Math.PI; x.beginPath(); x.moveTo(X,Y); x.lineTo(X+Math.cos(a)*R,Y+Math.sin(a)*R); x.stroke(); } x.beginPath(); x.arc(X,Y,R*.35,Math.PI,0); x.stroke(); } },
 stars(x,w,h,W){ const st=(X,Y,R)=>{ x.beginPath(); for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, q=k&1?R*.42:R; x.lineTo(X+Math.cos(a)*q,Y+Math.sin(a)*q); } x.closePath(); x.fill(); }; for(let j=0;j<5;j++) for(let i=-1;i<7;i++){ const m=((i%6)+6)%6; x.fillStyle=(m+j)&1?W.s:(W.g||W.s); st(i*64+(j&1?32:0)+20,j*56+28,(m*3+j*5)%3===0?13:8); } },
 chalk(x,w,h,W){ x.strokeStyle='rgba(255,255,255,.75)'; x.fillStyle='rgba(255,255,255,.8)'; x.lineCap='round'; x.lineWidth=2.5; x.textAlign='left'; x.textBaseline='alphabetic'; x.font='600 30px '+FONT; x.fillText('MENU',34,52); x.beginPath(); x.moveTo(30,62); x.lineTo(130,62); x.stroke(); x.lineWidth=2; for(let k=0;k<4;k++){ x.beginPath(); for(let X=34;X<110-k*8;X+=6) x.lineTo(X+3,86+k*20+((X/6|0)&1?-2.5:2.5)); x.stroke(); x.beginPath(); x.arc(132,86+k*20,2,0,7); x.fill(); }
   x.lineWidth=3; x.beginPath(); x.moveTo(206,120); x.lineTo(212,160); x.lineTo(248,160); x.lineTo(254,120); x.closePath(); x.stroke(); x.beginPath(); x.arc(262,136,10,-1.2,1.2); x.stroke(); x.beginPath(); x.moveTo(196,168); x.lineTo(264,168); x.stroke(); for(const X of [218,232,244]){ x.beginPath(); x.moveTo(X,110); x.bezierCurveTo(X-8,98,X+8,92,X,80); x.stroke(); }
   x.beginPath(); x.moveTo(306,40); x.lineTo(346,40); x.lineTo(326,72); x.closePath(); x.moveTo(326,72); x.lineTo(326,100); x.moveTo(312,100); x.lineTo(340,100); x.stroke(); x.font='600 20px '+FONT; x.fillText('★',170,50); x.fillText('★',290,200); x.fillText('♥',60,200); x.font='600 22px '+FONT; x.fillText('Plat du jour',214,214); x.beginPath(); x.moveTo(110,196); x.quadraticCurveTo(150,180,196,206); x.moveTo(196,206); x.lineTo(184,206); x.moveTo(196,206); x.lineTo(192,194); x.stroke();
   x.fillStyle='rgba(255,255,255,.05)'; for(let n=0;n<8;n++) x.fillRect(hsh(n,1)*w-40,hsh(n,2)*h,120,14); },
 zellige(x,w,h,W){ const P=W.pal||[W.c]; x.fillStyle=W.s||'#f4f1e8'; x.fillRect(0,0,w,h); for(let j=0;j<8;j++) for(let i=0;i<12;i++){ x.fillStyle=P[Math.floor(hsh(i,j)*P.length)]; x.fillRect(i*32+1.5,j*32+1.5,29,29); x.fillStyle='rgba(255,255,255,'+(.08+hsh(j,i)*.22).toFixed(2)+')'; x.beginPath(); x.moveTo(i*32+3,j*32+3); x.lineTo(i*32+24,j*32+3); x.lineTo(i*32+3,j*32+20); x.fill(); } },
 tartan(x,w,h,W){ x.globalAlpha=.45; x.fillStyle=W.s; for(let i=0;i<4;i++) x.fillRect(i*96+8,0,34,h); for(let j=0;j<3;j++) x.fillRect(0,j*96-8,w,34); x.globalAlpha=.7; x.fillStyle=W.g||'#f2d27a'; for(let i=0;i<4;i++){ x.fillRect(i*96+66,0,3,h); x.fillRect(i*96+76,0,3,h); } for(let j=0;j<3;j++){ x.fillRect(0,j*96+50,w,3); x.fillRect(0,j*96+60,w,3); } x.globalAlpha=1; },
 stripe2(x,w,h,W){ for(let i=0;i<4;i++){ x.fillStyle=W.s; x.fillRect(i*96,0,48,h); if(W.g){ x.fillStyle=W.g; x.fillRect(i*96+46,0,3,h); x.fillRect(i*96-1,0,3,h); } } },
 cane(x,w,h,W){ x.strokeStyle=W.s; x.lineWidth=2.4; x.beginPath(); for(let i=0;i<=w/32;i++){ x.moveTo(i*32+10,0); x.lineTo(i*32+10,h); x.moveTo(i*32+22,0); x.lineTo(i*32+22,h); } for(let j=0;j<=h/32;j++){ x.moveTo(0,j*32+10); x.lineTo(w,j*32+10); x.moveTo(0,j*32+22); x.lineTo(w,j*32+22); } x.stroke(); x.lineWidth=1.6; x.beginPath(); for(let k=-10;k<24;k++){ x.moveTo(k*32,0); x.lineTo(k*32+h,h); x.moveTo(k*32,0); x.lineTo(k*32-h,h); } x.stroke(); },
 tuft(x,w,h,W){ const a=32,b=h/8; for(let j=-1;j<10;j++) for(let i=-1;i<7;i++){ const X=i*64+(j&1?32:0), Y=j*b, g=x.createRadialGradient(X-6,Y-6,2,X,Y,34); g.addColorStop(0,shade(W.c,.22)); g.addColorStop(.6,W.c); g.addColorStop(1,shade(W.c,-.42)); x.fillStyle=g; x.beginPath(); x.moveTo(X,Y-b); x.lineTo(X+a,Y); x.lineTo(X,Y+b); x.lineTo(X-a,Y); x.fill(); } for(let j=-1;j<10;j++) for(let i=-1;i<7;i++) dot(x,i*64+(j&1?32:0)+32,j*b,3.2,W.s||'#d9b24a'); },
 checkD(x,w,h,W){ const q=16; for(let j=0;j<2;j++) for(let i=0;i<w/q;i++){ x.fillStyle=(i+j)&1?'#f6f6f0':'#26282e'; x.fillRect(i*q,96+j*q,q,q); } x.fillStyle=W.s||'#c9ced4'; x.fillRect(0,90,w,5); x.fillRect(0,129,w,5); x.fillStyle='rgba(255,255,255,.5)'; x.fillRect(0,91,w,1.5); x.fillRect(0,130,w,1.5); },
 // ---- fresques : un paysage d'un bout à l'autre du mur ----
 mMont(x,w,h){ grad(x,w,h,'#bfe0f2','#dbeaf0','#f6ead2'); const lay=(base,amp,f1,f2,ph,col)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(0,h); for(let X=0;X<=w;X+=4){ const t=X/w*Math.PI*2; x.lineTo(X,base-amp*(Math.abs(Math.sin(t*f1+ph))*.7+Math.sin(t*f2+ph*2)*.3)); } x.lineTo(w,h); x.fill(); };
   dot(x,290,54,22,'#fff6d6'); lay(150,84,1.5,4,.4,'#a9bfd6'); lay(176,66,2,5,1.7,'#7f9fbe'); lay(208,44,3,7,.9,'#5f8f7a'); lay(238,26,4,9,2.3,'#3f6f55'); x.fillStyle='#2f5a45'; for(let i=0;i<16;i++){ const X=i*24+10, Y=240+Math.sin(i*2.1)*7, s=10+((i*7)%5)*2; x.beginPath(); x.moveTo(X,Y-s*2.4); x.lineTo(X+s*.7,Y); x.lineTo(X-s*.7,Y); x.fill(); } },
 mParis(x,w,h){ grad(x,w,h,'#f6c9a0','#fbe3c4','#f3d9c0'); dot(x,84,60,20,'#fff3d6'); const B=[[0,150,44,0],[44,120,36,1],[80,160,30,0],[110,134,52,2],[162,172,28,0],[190,112,40,1],[230,146,46,0],[276,128,34,2],[310,166,30,0],[340,140,44,1]];
   x.fillStyle='#6a5f7c'; x.beginPath(); x.moveTo(298,36); x.lineTo(301,36); x.lineTo(306,92); x.lineTo(318,130); x.lineTo(311,130); x.lineTo(303,102); x.lineTo(296,102); x.lineTo(288,130); x.lineTo(281,130); x.lineTo(293,92); x.fill();
   for(const [X,Y,bw,k] of B){ x.fillStyle='#7d6f8f'; x.fillRect(X,Y,bw,h-Y); x.fillStyle='#5f5470'; x.beginPath(); x.moveTo(X-2,Y); x.lineTo(X+4,Y-14); x.lineTo(X+bw-4,Y-14); x.lineTo(X+bw+2,Y); x.fill(); x.fillStyle='#4a4158'; if(k) x.fillRect(X+bw*.6,Y-26,6,14); if(k===2) x.fillRect(X+bw*.2,Y-24,5,12); x.fillStyle='#ffe6a8'; for(let yy=Y+10;yy<h-10;yy+=22) for(let xx=X+7;xx<X+bw-8;xx+=13) if(hsh(xx,yy)>.35) x.fillRect(xx,yy,6,10); } },
 mSea(x,w,h){ const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'#bfe6f7'); g.addColorStop(.52,'#eaf6fb'); g.addColorStop(.53,'#4fa3cf'); g.addColorStop(1,'#2f7fb0'); x.fillStyle=g; x.fillRect(0,0,w,h); dot(x,70,50,20,'#fff6c9'); for(const [X,Y,s] of [[150,40,1],[300,64,.8],[236,28,.6]]) for(const [a,b,r2] of [[0,0,14],[16,4,11],[-16,5,10],[4,-8,10]]) dot(x,X+a*s,Y+b*s,r2*s,'rgba(255,255,255,.9)');
   x.strokeStyle='rgba(255,255,255,.55)'; x.lineWidth=2; for(let j=0;j<6;j++){ x.beginPath(); for(let X=0;X<=w;X+=6) x.lineTo(X,150+j*18+Math.sin(X/w*Math.PI*2*(6+j)+j)*2.5); x.stroke(); }
   const boat=(X,Y,s,c)=>{ x.fillStyle='#7a4a2c'; x.beginPath(); x.moveTo(X-14*s,Y); x.lineTo(X+14*s,Y); x.lineTo(X+9*s,Y+7*s); x.lineTo(X-9*s,Y+7*s); x.fill(); x.fillStyle='#fffaf2'; x.beginPath(); x.moveTo(X,Y-26*s); x.lineTo(X+12*s,Y-3*s); x.lineTo(X,Y-3*s); x.fill(); x.fillStyle=c; x.beginPath(); x.moveTo(X-2*s,Y-22*s); x.lineTo(X-2*s,Y-3*s); x.lineTo(X-11*s,Y-3*s); x.fill(); }; boat(120,150,1,'#e2574c'); boat(290,142,.7,'#f2b33d'); boat(210,138,.45,'#e2574c');
   x.strokeStyle='#3a4a5a'; x.lineWidth=1.5; for(const [X,Y] of [[180,70],[196,62],[330,36]]){ x.beginPath(); x.moveTo(X-6,Y); x.quadraticCurveTo(X-3,Y-5,X,Y); x.quadraticCurveTo(X+3,Y-5,X+6,Y); x.stroke(); } },
 mZen(x,w,h){ x.fillStyle='#f3ecd8'; x.fillRect(0,0,w,h); dot(x,280,70,30,'#c8423a'); const lay=(base,amp,f,ph,col)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(0,h); for(let X=0;X<=w;X+=4){ const t=X/w*Math.PI*2; x.lineTo(X,base-amp*(.5+.5*Math.sin(t*f+ph))**2); } x.lineTo(w,h); x.fill(); }; lay(170,70,2,.6,'#c9cdbf'); lay(200,60,3,2.2,'#9aa699'); lay(232,40,2,4,'#5f6f66'); x.fillStyle='rgba(243,236,216,.6)'; x.fillRect(0,176,w,10); x.fillRect(0,214,w,8);
   x.strokeStyle='#2b2b33'; x.lineWidth=1.6; for(const [X,Y] of [[90,60],[108,50],[126,64],[60,84]]){ x.beginPath(); x.moveTo(X-6,Y); x.quadraticCurveTo(X-3,Y-5,X,Y); x.quadraticCurveTo(X+3,Y-5,X+6,Y); x.stroke(); } },
 mCiel(x,w,h){ grad(x,w,h,'#8fc8ee','#d9effa'); for(const [X,Y,s] of [[60,60,1.2],[210,40,.9],[320,110,1.3],[130,160,1],[260,200,.8],[20,210,.9]]) for(const o of [-w,0,w]) for(const [a,b,r2] of [[0,0,16],[18,4,13],[-18,5,12],[5,-10,12],[-8,-6,10]]) dot(x,X+o+a*s,Y+b*s,r2*s,'rgba(255,255,255,.95)'); },
 mJardin(x,w,h){ grad(x,w,h,'#cdeaf5','#e9f1dc','#fdf3d0'); const lay=(base,amp,f,ph,col)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(0,h); for(let X=0;X<=w;X+=4){ const t=X/w*Math.PI*2; x.lineTo(X,base-amp*(.5+.5*Math.sin(t*f+ph))); } x.lineTo(w,h); x.fill(); }; lay(170,40,2,1,'#b7d98a'); lay(200,34,3,3,'#8fc46a');
   x.fillStyle='#2f6a4a'; for(const X of [40,120,150,250,330]){ x.beginPath(); x.ellipse(X,150,7,34,0,0,7); x.fill(); } x.fillStyle='#e9c9a0'; x.fillRect(180,150,44,26); x.fillStyle='#c8553d'; x.beginPath(); x.moveTo(174,152); x.lineTo(202,132); x.lineTo(230,152); x.fill(); lay(244,22,4,2,'#6fae4e'); for(let k=0;k<24;k++) dot(x,k*16+8,236+Math.sin(k*1.7)*8,2.4,k%3?'#e2574c':'#ffd23f'); },
};
// soubassements à motif (le bas du mur) : dessinés sur 256 × 128 points pour une case de large
const WNPAT={
 panel(x,w,h){ for(let i=0;i<2;i++){ const X=i*128+12; x.strokeStyle='rgba(0,0,0,.25)'; x.lineWidth=3; x.strokeRect(X,14,104,h-30); x.strokeStyle='rgba(255,255,255,.28)'; x.lineWidth=2; x.strokeRect(X+4,18,96,h-38); } },
 metro(x,w,h){ for(let j=0;j<4;j++) for(let i=-1;i<5;i++){ const X=i*64+(j&1?32:0), Y=j*32; x.fillStyle='rgba(255,255,255,.22)'; x.fillRect(X+3,Y+3,58,3); x.strokeStyle='rgba(0,0,0,.3)'; x.lineWidth=2.5; x.strokeRect(X,Y,64,32); } },
 plank(x,w,h){ for(let i=0;i<8;i++){ x.fillStyle=i&1?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'; x.fillRect(i*32,0,32,h); x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(i*32,0,2,h); } },
 check(x,w,h){ for(let j=0;j<4;j++) for(let i=0;i<8;i++){ x.fillStyle=(i+j)&1?'#f6f6f0':'#26282e'; x.fillRect(i*32,j*32,32,32); } },
};
function wallTex2(W){ return canvasTex(384,256,(x)=>{ x.fillStyle=W.c; x.fillRect(0,0,384,256); WPAT[W.pt](x,384,256,W,seeded(5)); },true); }
const WNC={};
function wainsMat(W){ const k=WALLS.indexOf(W)+'|'+S; if(WNC[k]) return WNC[k]; const t=canvasTex(256,128,(x,w,h)=>{ x.fillStyle=W.w; x.fillRect(0,0,w,h); WNPAT[W.wn](x,w,h,W); },true); t.repeat.set(S,1); return WNC[k]=new THREE.MeshStandardMaterial({map:t,roughness:.6}); }

WALLS.push(
 {n:'Blanc de chaux',c:'#f6f1e6',w:'#cdbfa6',pt:'plaster',p:250,d:2,u:1},
 {n:'Terracotta',c:'#d9825a',w:'#8a4a2c',pt:'plaster',p:350,d:3,u:2,st:'rustic'},
 {n:'Jaune safran',c:'#f2c14e',w:'#a8693a',pt:'plaster',p:350,d:3,u:2,st:'garden'},
 {n:'Vert sauge',c:'#b7c9a8',w:'#5f7a56',pt:'plaster',p:400,d:3,u:3},
 {n:'Bleu canard',c:'#2f6f7a',w:'#1f4a52',pt:'plaster',p:600,d:4,u:4,st:'paris'},
 {n:'Gris perle',c:'#d5d6d8',w:'#8a8d92',pt:'plaster',p:400,d:3,u:3,st:'indus'},
 {n:'Noir ardoise',c:'#33363d',w:'#1f2126',pt:'plaster',p:700,d:5,u:6,st:'indus'},
 {n:'Lilas',c:'#d9c9ec',w:'#8f76b8',pt:'plaster',p:450,d:3,u:3},
 {n:'Corail',c:'#f59a82',w:'#b5523b',pt:'plaster',p:450,d:3,u:3,st:'sea'},
 {n:'Rose poudré',c:'#f3d3cf',w:'#b98a84',pt:'plaster',p:400,d:3,u:2},
 {n:'Pois sauge',c:'#eef2e2',s:'#9db88a',w:'#6f8f5e',pt:'dots',p:500,d:4,u:3,st:'garden'},
 {n:'Pois roses',c:'#fdeef2',s:'#f29ab4',w:'#d9688a',pt:'dots',p:500,d:4,u:3},
 {n:'Vichy rouge',c:'#fffaf2',s:'#d8453a',w:'#a8322a',pt:'gingham',p:550,d:4,u:3,st:'garden'},
 {n:'Vichy bleu',c:'#fbfdff',s:'#3f7fbf',w:'#2f5f95',pt:'gingham',p:550,d:4,u:3,st:'sea'},
 {n:'Arlequin',c:'#f6ecd2',s:'#c8553d',g:'#3a2a1f',w:'#7a2f22',pt:'diam',p:800,d:5,u:5,st:'paris'},
 {n:'Métro blanc',c:'#f7f7f2',s:'#b9bcb6',w:'#2f5a48',wn:'metro',pt:'metro',p:700,d:5,u:4,st:'paris'},
 {n:'Métro vert',c:'#2f6a55',s:'#1f4a3a',w:'#1f3d31',wn:'metro',pt:'metro',p:900,d:6,u:6,st:'paris'},
 {n:'Brique blanche',c:'#efeae0',s:'#bdb5a6',w:'#8a8478',pt:'brick2',p:650,d:4,u:4,st:'indus'},
 {n:'Brique sombre',c:'#5a3a32',s:'#2f2220',w:'#2a1d1a',pt:'brick2',p:750,d:5,u:5,st:'indus'},
 {n:'Lambris marin',c:'#f1f4f6',w:'#5b8fc0',wn:'plank',pt:'plankV',p:500,d:4,u:3,st:'sea'},
 {n:'Bardage blanc',c:'#f4f1ea',w:'#7fa8c8',pt:'plankH',p:550,d:4,u:3,st:'sea'},
 {n:'Rondins',c:'#b07a4a',w:'#6b4022',wn:'plank',pt:'logs',p:800,d:6,u:5,st:'rustic'},
 {n:'Pierre apparente',c:'#b9b2a2',s:'#7d776a',pal:['#b9b2a2','#a8a091','#c7c0b0','#9a9384'],w:'#6f6a5e',pt:'stone',p:900,d:6,u:5,st:'rustic'},
 {n:'Tôle ondulée',c:'#9aa3ab',w:'#4a5560',pt:'tole',p:600,d:4,u:4,st:'indus'},
 {n:'Boiseries crème',c:'#f1e6cf',s:'#d9b24a',w:'#e3d5b6',wn:'panel',pt:'panel',p:1100,d:7,u:6,st:'lux'},
 {n:'Boiseries vert anglais',c:'#2f5a48',s:'#d9b24a',w:'#234536',wn:'panel',pt:'panel',p:1300,d:7,u:7,st:'lux'},
 {n:'Damas bordeaux',c:'#7a2433',s:'#9a4055',w:'#3f1019',pt:'damask',p:1400,d:8,u:8,st:'lux'},
 {n:'Damas bleu roi',c:'#27407a',s:'#3f5a9a',w:'#16254a',pt:'damask',p:1400,d:8,u:8,st:'lux'},
 {n:'Petites fleurs',c:'#fdf6e8',pal:['#f29ab4','#f2b33d','#9bb7f0','#e2574c'],w:'#c9a877',pt:'floral',p:600,d:4,u:3},
 {n:'Jungle',c:'#eaf4e2',pal:['#2f7a4a','#3f9a5a','#6fbf7a','#1f5f3a'],w:'#2f5a3a',pt:'leaf',p:800,d:5,u:5,st:'sea'},
 {n:'Vagues japonaises',c:'#f3ecd8',s:'#2f4a7a',w:'#27365e',pt:'seigaiha',p:800,d:5,u:5,st:'zen'},
 {n:'Cerisier en fleurs',c:'#fbf3ea',s:'#5a3a2a',w:'#8a5a4a',pt:'sakura',p:900,d:6,u:6,st:'zen'},
 {n:'Bambous',c:'#f1ecd2',s:'#7fae5a',w:'#5a7a3a',pt:'bamboo',p:700,d:5,u:4,st:'zen'},
 {n:'Éventails Art déco',c:'#1f2a2a',s:'#d9b24a',w:'#151c1c',pt:'artdeco',p:1700,d:9,u:9,st:'lux'},
 {n:'Étoiles rétro',c:'#fdf6e3',s:'#e2574c',g:'#3fb8b0',w:'#3fb8b0',pt:'stars',p:600,d:4,u:3,st:'diner'},
 {n:'Mur ardoise',c:'#2f3d35',w:'#8a5a36',pt:'chalk',p:900,d:6,u:5,st:'paris'},
 {n:'Zellige bleu',c:'#2f7fbf',pal:['#2f7fbf','#3f93cf','#2a6fae','#57a9dd','#3587c4'],s:'#eef3f4',w:'#f1ead8',pt:'zellige',p:1200,d:7,u:7,st:'sea'},
 {n:'Zellige émeraude',c:'#2f8f6a',pal:['#2f8f6a','#3fa37c','#277a5a','#57b890','#34946f'],s:'#eef3ea',w:'#f1ead8',pt:'zellige',p:1200,d:7,u:7,st:'garden'},
 {n:'Tartan',c:'#a82a2a',s:'#1f3d31',g:'#f2d27a',w:'#3a2414',wn:'plank',pt:'tartan',p:800,d:5,u:5,st:'rustic'},
 {n:'Rayures chapiteau',c:'#fffaf0',s:'#d8453a',w:'#a8322a',pt:'stripe2',p:500,d:4,u:2,st:'garden'},
 {n:'Rayures or',c:'#1f2a44',s:'#27365e',g:'#d9b24a',w:'#141b2e',pt:'stripe2',p:1300,d:7,u:7,st:'lux'},
 {n:'Cannage',c:'#f1e3c4',s:'#b98a4a',w:'#8a5a30',pt:'cane',p:750,d:5,u:4,st:'paris'},
 {n:'Velours capitonné',c:'#7a1f2e',s:'#d9b24a',w:'#3f1019',wn:'panel',pt:'tuft',p:2000,d:10,u:10,st:'lux'},
 {n:'Frise à damier rose',c:'#f7c9d6',s:'#c9ced4',w:'#3fb8b0',wn:'check',pt:'checkD',p:700,d:5,u:4,st:'diner'},
 {n:'Frise à damier rouge',c:'#d8453a',s:'#c9ced4',w:'#f6f6f0',wn:'check',pt:'checkD',p:700,d:5,u:4,st:'diner'},
 {n:'Fresque des sommets',c:'#bfe0f2',w:'#5a3a22',wn:'plank',pt:'mMont',p:1500,d:8,u:6,st:'rustic'},
 {n:'Fresque de Paris',c:'#f6c9a0',w:'#4a4158',pt:'mParis',p:1500,d:8,u:6,st:'paris'},
 {n:'Fresque du large',c:'#bfe6f7',w:'#f4f1ea',pt:'mSea',p:1500,d:8,u:6,st:'sea'},
 {n:'Fresque zen',c:'#f3ecd8',w:'#3a2a1f',pt:'mZen',p:1500,d:8,u:6,st:'zen'},
 {n:'Fresque de campagne',c:'#cdeaf5',w:'#5f7a56',pt:'mJardin',p:1500,d:8,u:6,st:'garden'},
 {n:'Ciel et nuages',c:'#8fc8ee',w:'#f6f6f0',pt:'mCiel',p:900,d:5,u:4}
);

function swW(i){ const k='w'+i; if(SWC[k]) return SWC[k]; const W=WALLS[i], c=document.createElement('canvas'); c.width=148; c.height=124; const x=c.getContext('2d');
 try{
  if(W.pt&&WPAT[W.pt]){ const t=document.createElement('canvas'); t.width=384; t.height=256; const y=t.getContext('2d'); y.fillStyle=W.c; y.fillRect(0,0,384,256); WPAT[W.pt](y,384,256,W,seeded(5)); if(/^m[A-Z]/.test(W.pt)) x.drawImage(t,0,0,384,256,0,0,148,84); else x.drawImage(t,0,0,296,168,0,0,148,84); }
  else { x.fillStyle=W.c; x.fillRect(0,0,148,84); if(W.s){ x.fillStyle=W.s; for(let q=0;q<148;q+=16) x.fillRect(q,0,6,84); } if(W.brick){ x.strokeStyle='rgba(255,255,255,.3)'; x.lineWidth=1.2; for(let r=0;r<9;r++){ x.beginPath(); x.moveTo(0,r*10); x.lineTo(148,r*10); x.stroke(); for(let q=(r&1)*10;q<148;q+=20){ x.beginPath(); x.moveTo(q,r*10); x.lineTo(q,r*10+10); x.stroke(); } } } }
  x.fillStyle=W.w; x.fillRect(0,84,148,40);
  if(W.wn&&WNPAT[W.wn]){ const t=document.createElement('canvas'); t.width=256; t.height=128; const y=t.getContext('2d'); y.fillStyle=W.w; y.fillRect(0,0,256,128); WNPAT[W.wn](y,256,128,W); x.drawImage(t,0,0,256,69,0,84,148,40); }
  x.fillStyle=shade(W.w,.4); x.fillRect(0,82,148,4);
 }catch(e){ x.fillStyle=W.c; x.fillRect(0,0,148,124); }
 return SWC[k]=c.toDataURL(); }
