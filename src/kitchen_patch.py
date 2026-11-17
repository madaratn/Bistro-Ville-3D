# v0.61 : étape finale après cuisson (découpe, dressage) pour les plats qui sortent du feu ou du four
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('kitchen_patch',a[:70],c); js=js.replace(a,b)
RX("function dishSteps(id){ const d=DISHM[id]; return (STEPS[id]||[['prep',d.t*.4],['stove',d.t*.6]]).map(([k,t])=>({k,t})); }",
   "function dishSteps(id){ const d=DISHM[id]; let L=STEPS[id]||[['prep',d.t*.4],['stove',d.t*.6]]; if(L[L.length-1][0]!=='prep') L=[...L,['prep',1.3,'fin']]; return L.map(([k,t,f])=>({k,t,f})); }")
