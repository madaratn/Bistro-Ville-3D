# v0.33 : une porte pour entrer (DX) et une porte pour sortir (DXO), chacune à sens unique
import re
def RPA(a,b,nmin=1):
    global js
    n=js.count(a); assert n>=nmin, ('door_patch', a, n); js=js.replace(a,b)
RPA("function doorOK(ax,ay,bx,by){","""let DXO=6, oxC=null;
function isDoorC(x,y){ return y===S-1&&(x===DX||x===DXO); }
// la sortie n'est utilisée que si elle est libre et reliée à la salle ; sinon tout le monde repasse par l'entrée
function OX(){ const key=occVer+'|'+S+'|'+KR.x0+','+KR.y0+','+KR.w+','+KR.d; if(oxC&&oxC.k===key) return oxC.v; let v=DX;
 if(DXO<S&&DXO!==DX&&!fAt(DXO,S-1)&&!inKitchen(DXO,S-1)&&!fAt(DX,S-1)){ const seen=new Set([DX+','+(S-1)]), q=[[DX,S-1]];
  for(let i=0;i<q.length&&v===DX;i++) for(const [dx,dy] of D4){ const x=q[i][0]+dx, y=q[i][1]+dy, k=x+','+y; if(!inRest(x,y)||seen.has(k)||fAt(x,y)||inKitchen(x,y)) continue; seen.add(k); if(x===DXO&&y===S-1){ v=DXO; break; } q.push([x,y]); } }
 oxC={k:key,v}; return v; }
function doorOK(ax,ay,bx,by){
 if(ay===S-1&&by===S) return ax===bx&&ax===OX();
 if(ay===S&&by===S-1) return ax===bx&&ax===DX;
 return true; }
function doorOK0(ax,ay,bx,by){""")
RPA("DX=Math.floor(S/2);","DX=Math.floor(S/2); DXO=Math.min(S-1,DX+2);")
RPA("nx===DX&&ny===S-1","isDoorC(nx,ny)")
RPA("x===DX&&y===S-1","isDoorC(x,y)")
RPA("x===DX&&y>=S-2","(x===DX||x===DXO)&&y>=S-2")
RPA("!(g[0]===DX&&g[1]===S-1)","!isDoorC(g[0],g[1])")
RPA("for(const bx of [DX-2,DX+2]) if(bx>=0&&bx<S) for(const o of [-.22,.22]) out.push({key:'b'","for(const bx of [DX-2,DX-3]) if(bx>=0&&bx<S) for(const o of [-.22,.22]) out.push({key:'b'")
js=re.sub(r"const used=new Set\(\[DX\+','\+\(S-1\)\]\), cnt=","const used=new Set([DX+','+(S-1),DXO+','+(S-1),DXO+','+(S-2)]), cnt=",js)
RPA(" const NEWS=[];",""" const NEWS=[];
 if(!state.door2){ state.door2=1; if(loaded) NEWS.push(`<div class="row"><div class="emo">🚪</div><div class="info"><div class="t">Deux portes</div><div class="sub">Les clients entrent par l'auvent rouge et sortent par l'auvent vert, à droite. Laisse cette case libre : si elle est bouchée, tout le monde repasse par l'entrée.</div></div></div>`); }""")
