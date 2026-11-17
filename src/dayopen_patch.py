# v0.64 : après le bilan du soir, le bistrot reste fermé — la nouvelle journée ne commence que quand on le décide
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('dayopen_patch',a[:70],c); js=js.replace(a,b)
RX("function dayEnd(){ dailyAdd('bilan',1); const F=dayFigures(), d=F.d;","function dayEnd(){ dailyAdd('bilan',1); state.open=false; const F=dayFigures(), d=F.d;")
RX("<button class=\"b\" data-a=\"close\">Commencer le jour ${n+1}</button>","<button class=\"b green\" data-a=\"daygo\">Ouvrir pour le jour ${n+1}</button></p><p class=\"center sub\">Le bistrot est fermé pour la nuit. Si tu fermes cette fenêtre, il reste fermé : profites-en pour refaire la déco, puis ouvre quand tu veux.")
RX(" close:()=>closeModal(),"," close:()=>closeModal(),\n daygo:()=>{ closeModal(); if(!isOpen()) setOpen(true); },")
