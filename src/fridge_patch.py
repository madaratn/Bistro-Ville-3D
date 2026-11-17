# v0.59 : en début de partie, le frigo se pose contre le mur du fond, juste à côté de la cuisine (il ne cache plus le four)
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('fridge_patch',a[:70],c); js=js.replace(a,b)
RX(" setSize(); installKitchen(); state.kit=1; autoPlaceEdge('fridge')||autoPlace('fridge');"," setSize(); installKitchen(); state.kit=1; fridgeStart()||autoPlaceEdge('fridge')||autoPlace('fridge');")
RX("function defaultLayout(){","""function fridgeStart(){ const x=KR.x0+KR.w, y=0; if(!inRest(x,y)||inKitchen(x,y)) return null; const o=fAt(x,y);
 if(o){ if(FURN[o.t].cat!=='Déco'||!inRest(x+1,y)||fAt(x+1,y)) return null; o.x=x+1; rebuildOcc(); }
 const f={id:state.nid++,t:'fridge',x,y}; state.furn.push(f); rebuildOcc(); if(layoutOK()) return f; state.furn.pop(); if(o) o.x=x; rebuildOcc(); return null; }
function defaultLayout(){""")
