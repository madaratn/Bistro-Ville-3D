# v0.29 : un demi-carreau suffit pour passer — on se faufile le long d'un petit meuble (table, chaise, plante...)
a=js.index("function bfs(sx,sy,isGoal,goalPass,zone){"); b=js.index("\nconst zoneOf=")
js=js[:a]+r"""const NARROW_K=['table','chair','plant','flowers','lamp','bin'];
// peut-on traverser la case (nx,ny) occupée par un petit meuble, en la longeant ? renvoie le décalage [ox,oy] ou null
function squeezeOff(cx,cy,nx,ny,kz){
 const f=fAt(nx,ny); if(!f||!inRest(nx,ny)) return null; const k=kindOf(f); if(!NARROW_K.includes(k)) return null;
 const dx=nx-cx, dy=ny-cy; if(dx&&dy) return null;
 if(k==='chair'){ const t=seatTable(f); if(t){ const tx=t.x-f.x, ty=t.y-f.y; if((dx&&tx)||(dy&&ty)) return null; return [-tx*.3,-ty*.3]; } }
 // un quart de carreau suffit : on passe aussi entre un petit meuble et un mur ou un gros meuble (3 = case libre, 2 = petit meuble voisin, 1 = mur / gros meuble)
 const sideOK=(sx2,sy2)=>{ if(!inRest(sx2,sy2)||kz!==inKitchen(sx2,sy2)) return 1; const g=fAt(sx2,sy2); if(!g) return 3; const gk=kindOf(g); if(!NARROW_K.includes(gk)) return 1;
  if(gk==='chair'&&seatTable(g)===f) return 0; if(k==='chair'&&g===seatTable(f)) return 0; return 2; };
 let best=null,bs=0; for(const s of [1,-1]){ const sx2=nx+(dy?s:0), sy2=ny+(dx?s:0), v=sideOK(sx2,sy2); if(v>bs){ bs=v; const o=v===1?.4:.45; best=[dy?s*o:0, dx?s*o:0]; } }
 return best;
}
function bfs(sx,sy,isGoal,goalPass,zone){
 const kz=zone==='k';
 if(!inWalk(sx,sy)) return null;
 if(isGoal(sx,sy)) return [];
 const Wd=S,N=S*(S+2),prev=new Int32Array(N).fill(-2),si=sy*Wd+sx, off=new Map(); prev[si]=-1;
 const B=[[si]];   // files par coût : se faufiler coûte un peu plus cher qu'un pas libre
 for(let c=0;c<B.length;c++){ const q=B[c]; if(!q) continue;
  for(let h=0;h<q.length;h++){
   const ci=q[h], cx=ci%Wd, cy=(ci/Wd)|0, inSq=off.get(ci);
   let ddx=0, ddy=0; if(inSq&&prev[ci]>=0){ ddx=cx-prev[ci]%Wd; ddy=cy-((prev[ci]/Wd)|0); }
   for(const [dx,dy] of (bfsDiag?D8:D4)){
    const nx=cx+dx, ny=cy+dy; if(!inWalk(nx,ny)) continue;
    const ni=ny*Wd+nx; if(prev[ni]!==-2) continue;
    if(inSq&&!((dx===ddx&&dy===ddy)||(dx===Math.sign(inSq[0])&&dy===Math.sign(inSq[1])))) continue;   // on ressort droit devant ou du côté libre
    if(dx&&dy){
     if(!inRest(nx,cy)||!inRest(cx,ny)||!inRest(nx,ny)||!inRest(cx,cy)||blocked(nx,ny)) continue;
     if(kz!==inKitchen(nx,cy)||kz!==inKitchen(cx,ny)) continue;
     const f1=fAt(nx,cy), f2=fAt(cx,ny); if((f1&&HARD_K.includes(kindOf(f1)))||(f2&&HARD_K.includes(kindOf(f2)))) continue; }
    if(!doorOK(cx,cy,nx,ny)) continue;
    if(kz!==inKitchen(nx,ny)) continue;
    const g=isGoal(nx,ny); let sq=null;
    if(blocked(nx,ny)&&!(g&&goalPass)){ sq=bfsDiag?squeezeOff(cx,cy,nx,ny,kz):null; if(!sq) continue; }
    prev[ni]=ci; if(sq) off.set(ni,sq);
    if(g){ const p=[]; let k=ni; while(k!==si){ const o=off.get(k); p.push(o?[k%Wd,(k/Wd)|0,o[0],o[1]]:[k%Wd,(k/Wd)|0]); k=prev[k]; } return p.reverse(); }
    const nc=c+(sq?3:1); (B[nc]||(B[nc]=[])).push(ni);
   } } }
 return null;
}"""+js[b:]
# déplacement : les points de passage peuvent être décalés à l'intérieur d'une case
RP("while(a.path.length>1&&Math.hypot(a.path[0][0]-a.fx,a.path[0][1]-a.fy)<.3){ const n0=a.path[0], n1=a.path[1], gx=a.x+n1[0]-n0[0], gy=a.y+n1[1]-n0[1]; if((gx!==n0[0]||gy!==n0[1])&&inRest(gx,gy)&&blocked(gx,gy)) break; if(!trafficOK(a,n1,0)) break;",
   "while(a.path.length>1&&Math.hypot(a.path[0][0]-a.fx,a.path[0][1]-a.fy)<.3){ const n0=a.path[0], n1=a.path[1], gx=a.x+n1[0]-n0[0], gy=a.y+n1[1]-n0[1]; if(n0.length>2||n1.length>2||blocked(a.x,a.y)) break; if((gx!==n0[0]||gy!==n0[1])&&inRest(gx,gy)&&blocked(gx,gy)) break; if(!trafficOK(a,n1,0)) break;")
RP(" const n=a.path[0], dx=n[0]-a.fx, dy=n[1]-a.fy, d=Math.hypot(dx,dy);\n if(!trafficOK(a,n,dt))"," const n=a.path[0], dx=n[0]+(n[2]||0)-a.fx, dy=n[1]+(n[3]||0)-a.fy, d=Math.hypot(dx,dy);\n if(!trafficOK(a,n,dt))")
assert js.count("a.fx=a.x=n[0]; a.fy=a.y=n[1];")==2
js=js.replace("a.fx=a.x=n[0]; a.fy=a.y=n[1];","a.x=n[0]; a.y=n[1]; a.fx=n[0]+(n[2]||0); a.fy=n[1]+(n[3]||0);")

# une table entourée de chaises reste servie : le serveur se place derrière une chaise (à deux pas de la table)
RP("function pathToFurn(a,f){ const ok=(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-f.x)<=1&&Math.abs(y-f.y)<=1&&!(x===f.x&&y===f.y); return bfs(a.x,a.y,(x,y)=>ok(x,y)&&!standingAt(x,y,a),false,zoneOf(a))||bfs(a.x,a.y,ok,false,zoneOf(a)); }",
   "function pathToFurn(a,f){ const ok=(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.abs(x-f.x)<=1&&Math.abs(y-f.y)<=1&&!(x===f.x&&y===f.y); const ok2=(x,y)=>inRest(x,y)&&!blocked(x,y)&&Math.max(Math.abs(x-f.x),Math.abs(y-f.y))===2&&(x===f.x||y===f.y||Math.abs(x-f.x)===Math.abs(y-f.y)); return bfs(a.x,a.y,(x,y)=>ok(x,y)&&!standingAt(x,y,a),false,zoneOf(a))||bfs(a.x,a.y,ok,false,zoneOf(a))||(a.s&&a.s.role!=='chef'&&kindOf(f)!=='counter'&&kindOf(f)!=='dish'?bfs(a.x,a.y,ok2,false,zoneOf(a)):null); }")
# on ne reste pas coincé : au bout de 2 s on se croise en se serrant
RP("  if(a.waitT>6){ a.ghostT=1.4; a.waitT=0; }","  if(a.waitT>2.2){ a.ghostT=1.2; a.waitT=0; }")
