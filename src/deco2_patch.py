# v0.51 : déco « j'appuie pour sélectionner » — rien ne bouge au passage du doigt, l'objet posé est désélectionné,
#          et on touche directement une fenêtre, un tableau ou l'enseigne sur le mur pour les changer
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('deco2_patch',a[:70],c); js=js.replace(a,b)
RX(" if(!(state.store[t]>0)&&state.coins<F.p){ placing=null; ghost=null; }\n hud();"," placing=null; ghost=null;\n hud();")
RX(" if(sel&&inRest(x,y)){ moveFurn(sel,x,y); ghost=null; editUI(); return; }"," if(sel&&inRest(x,y)){ if(moveFurn(sel,x,y)) sel=null; ghost=null; editUI(); return; }")
RX(" const f=fAt(x,y);\n if(f){ if(sel===f) sel=null; else { sel=f;"," const f=fAt(x,y); wslot=null;\n if(f){ if(sel===f) sel=null; else { sel=f;")
RX("let wsel=null, tileMode=false, tileBrush=null;","""let wsel=null, tileMode=false, tileBrush=null, wslot=null;
const WSIDE={N:'mur du fond',W:'mur de gauche'};
function wallPick(sd,i){ if(!wallSlotOK(sd,i)) return; wslot={sd,i}; sel=null; placing=null; ghost=null; wsel=null; etab='murs'; ecol=false; sfx('pop'); editUI(); }
function wallHit(sx,sy){ const L=wallLayout(); let best=null, bd=1e9; for(const sd of ['N','W']) for(let i=0;i<S;i++){ const t=L[sd][i]; if(!t||!wallSlotOK(sd,i)) continue;
  for(const o of (isSign(t)?[-.6,0,.6]:t==='board'?[-.3,.3]:[0])){ const p=sd==='N'?toScreen(i+.5+o,.98,.02):toScreen(.02,.98,i+.5+o), q=sd==='N'?toScreen(i+.5+o,.6,.02):toScreen(.02,.6,i+.5+o), r=Math.max(20,Math.abs(q[1]-p[1])*1.05), d=Math.hypot(sx-p[0],sy-p[1]); if(d<r&&d<bd){ bd=d; best={sd,i}; } } }
 return best; }""")
RX("function selHTML(){","""function selHTML(){
 if(wslot){ const t=wallLayout()[wslot.sd][wslot.i], W=t?WOBJ[t]:null;
  return `<div class="sc"><span class="eim">${W?`<img src="${thumbs['wo:'+t]||''}" alt="">`:''}</span><div class="si2"><b>${W?W.n:'Emplacement libre'}</b><span>${WSIDE[wslot.sd]} · choisis en bas ce que tu veux ici</span></div><button class="sx" data-e="desel">✕</button></div>${W&&!W.uniq?'<div class="sa"><button data-e="wrem" class="red">Retirer</button></div>':''}`; }""")
RX(" else if(d.wo){ wsel=wsel===d.wo?null:d.wo; }"," else if(d.wo){ if(wslot){ const cur=wallLayout()[wslot.sd][wslot.i], t=d.wo==='x'?null:d.wo; if(cur!==t) wallSet(wslot.sd,wslot.i,t); wslot=null; } else wsel=wsel===d.wo?null:d.wo; }")
RX("  else if(a==='desel'){ sel=null; ghost=null; }","  else if(a==='desel'){ sel=null; ghost=null; wslot=null; }\n  else if(a==='wrem'){ if(wslot){ wallSet(wslot.sd,wslot.i,wallLayout()[wslot.sd][wslot.i]); wslot=null; } }")
RX(" if(d.et){ etab=d.et; ecol=false; if(etab!=='murs') wsel=null;"," if(d.et){ etab=d.et; ecol=false; wslot=null; if(etab!=='murs') wsel=null;")
RX("mode='edit'; sel=null; ghost=null; placing=null; undoS=[];","mode='edit'; wslot=null; wsel=null; sel=null; ghost=null; placing=null; undoS=[];")
RX("etab==='murs'?(wsel?'Touche un rond sur le mur pour poser ou retirer.':'Choisis une couleur de mur, ou un objet à accrocher.')","etab==='murs'?(wslot?'Choisis en bas ce que tu veux à cet endroit.':wsel?'Touche un rond sur le mur pour poser ou retirer.':'Touche une fenêtre, un tableau, l’enseigne ou un + sur le mur.')")
RX("$('#ehint').textContent=sel?'Glisse un objet pour le déplacer, ou touche une case libre.':","$('#ehint').textContent=sel?'Glisse-le ou touche une case libre pour le déplacer.':placing?'Touche une case pour le poser.':!['murs','sols','zone'].includes(etab)?'Touche un objet de la salle pour le sélectionner.':")
RX("  return wl+'<i class=\"esep\"></i>'+wo+","  if(wslot) return wo;\n  return wl+'<i class=\"esep\"></i>'+wo+")
RX(" $('#edock').classList.toggle('col',ecol);"," $('#edock').classList.toggle('col',ecol); { const on=tb.querySelector('.ech.on'); if(on&&tb._on!==etab){ tb._on=etab; tb.scrollTo({left:on.offsetLeft-tb.clientWidth/2+on.offsetWidth/2,behavior:'smooth'}); } }")
