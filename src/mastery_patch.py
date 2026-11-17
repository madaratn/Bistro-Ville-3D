# v0.50 : niveaux plus lents + maîtrise des plats (étoiles gagnées à force de servir)
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('mastery_patch',a[:70],c); js=js.replace(a,b)
RX("const xpNeed=l=>Math.round(40*Math.pow(l,1.45));","""const xpNeed=l=>Math.round(150*Math.pow(l,1.6)/10)*10;
const MAST=[20,80,250], MAST_N=['Bronze','Argent','Or'], MAST_C=['#c98a4b','#aab4c2','#f2b33d'];
const mastN=id=>(state.dm&&state.dm[id])||0, mastS=id=>{ const n=mastN(id); return n>=MAST[2]?3:n>=MAST[1]?2:n>=MAST[0]?1:0; };
function mastAdd(id){ const M=state.dm||(state.dm={}), s0=mastS(id); M[id]=(M[id]||0)+1; const s=mastS(id);
 if(s>s0&&!warming){ const d=DISHM[id], rw=[30,80,200][s-1]; earn(rw); addXP(10*s); sfx('level');
  queueModal(()=>({title:'Maîtrise '+MAST_N[s-1],html:`<div class="carBig"><div class="mstBig">${foodIcon(d.e)}</div><b>${d.n}</b><p>${mastStars(s)}</p><p>Servi ${M[id]} fois. Tes cuisiniers le connaissent par cœur : il se vend ${s*6} % plus cher et se prépare ${s*5} % plus vite.</p></div><p class="center">+${rw} pièces</p><p class="center"><button class="b" data-a="close">Super</button></p>`})); } }
const mastStars=s=>'<span class="mst">'+[0,1,2].map(i=>`<i style="color:${i<s?MAST_C[s-1]:'#d9c8a6'}">★</i>`).join('')+'</span>';
function mastRow(id){ const n=mastN(id), s=mastS(id), a=s?MAST[s-1]:0, b=MAST[Math.min(s,2)]; return `<div class="mstR">${mastStars(s)}<span class="bar"><i style="width:${s>=3?100:100*(n-a)/(b-a)}%"></i></span><em>${s>=3?'Maîtrisé':n+' / '+b}</em></div>`; }""")
RX("const dishPrice=d=>","const dishPrice=d=>(p=>Math.max(2,Math.round(p*(1+.06*mastS(d.id)))))(dishPrice0(d));\nconst dishPrice0=d=>")
RX("momTip(c,price,sat);","momTip(c,price,sat); if(d) mastAdd(d.id);")
RX("j.T=j.t=o.steps[o.si].t/sp/staffMul(a);","j.T=j.t=o.steps[o.si].t/sp/staffMul(a)*(1-.05*mastS(o.dish));")
RX("${svcBadges(d)} ${dishPrice(d)} 🪙 · ${d.t}s</div>","${svcBadges(d)} ${dishPrice(d)} 🪙 · ${d.t}s</div>${mastRow(id)}")
import re as _re
_n=len(_re.findall(r"Niv\. \$\{L\}/10 · \$\{dishPrice\(d\)\} 🪙</div>",js)); assert _n==1,_n
js=js.replace("Niv. ${L}/10 · ${dishPrice(d)} 🪙</div>","Niv. ${L}/10 · ${dishPrice(d)} 🪙</div>${mastRow(d.id)}")
# la maîtrise la plus proche peut devenir l'objectif affiché quand rien d'autre n'est plus avancé
RX("function goalPick(){ const L=todayList().filter(x=>!x.done);","function goalPick(){ const L=todayList().filter(x=>!x.done); if(L.length&&!L.some(x=>x.ready)){ let b=null; for(const id of state.menu){ const s=mastS(id); if(s>=3) continue; const n=mastN(id), a=s?MAST[s-1]:0, t=MAST[s], r=(n-a)/(t-a); if(r>=.5&&(!b||r>b.r)) b={id:'mast',t:'Maîtrise '+MAST_N[s]+' : '+DISHM[id].n,v:n-a,n:t-a,r,p:'menu'}; } if(b){ const top=L.filter(x=>x.id!=='rush'&&x.id!=='chest').reduce((m,x)=>Math.max(m,x.v/x.n),0); if(b.r>top) return b; } }")
