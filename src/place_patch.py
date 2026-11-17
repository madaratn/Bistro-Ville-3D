# v0.21 : resto de départ 9×9, tout se pivote (y compris à la pose), règles de passage assouplies
RP("coins:600,xp:0,level:1,size:8,","coins:600,xp:0,level:1,size:9,")
RP(" setSize();\n if(!loaded) defaultLayout();"," if(loaded&&state.size<9){ state.size=9; state.grew=1; }\n setSize();\n if(!loaded) defaultLayout();")
RP(" const NEWS=[];",""" const NEWS=[];
 if(state.grew){ delete state.grew; NEWS.push(`<div class="row"><div class="emo">📐</div><div class="info"><div class="t">Restaurant agrandi</div><div class="sub">Ta salle passe gratuitement à 9×9. Tu peux aussi pivoter tous les objets, même avant de les poser.</div></div></div>`); }""")
# --- rotation ---
RP("const ROTATABLE=k=>!['table','chair','wbench'].includes(k);","const ROTATABLE=k=>k!=='table';\nconst RDIR=[[0,1],[1,0],[0,-1],[-1,0]];\nlet prot;")
RP("function furnRot(f){ if(!ROTATABLE(FURN[f.t].kind)) return 0; return f.r!==undefined?f.r:autoRot(f); }",
   "function furnRot(f){ const k=FURN[f.t].kind; if(!ROTATABLE(k)) return 0; if(k==='chair') return f.id!==undefined&&seatTable(f)?0:(f.r||0); if(k==='wbench') return f.r||0; return f.r!==undefined?f.r:autoRot(f); }")
RP("function seatTable(ch){ for(const [dx,dy] of D4){","function seatTable(ch){ if(ch.r!==undefined){ const d=RDIR[ch.r], f=fAt(ch.x+d[0],ch.y+d[1]); if(f&&kindOf(f)==='table') return f; } for(const [dx,dy] of D4){")
RP("function rotateFurn(f){ pushUndo(); f.r=(furnRot(f)+3)%4;",
   """function rotateFurn(f){ pushUndo();
 if(kindOf(f)==='chair'){ const t=seatTable(f); let cur=f.r; if(cur===undefined) cur=t?RDIR.findIndex(d=>d[0]===t.x-f.x&&d[1]===t.y-f.y):0;
  let nx=(cur+3)%4; for(let k=1;k<=4;k++){ const r=(cur+k*3)%4, d=RDIR[r], g=fAt(f.x+d[0],f.y+d[1]); if(g&&kindOf(g)==='table'){ nx=r; break; } } f.r=nx; }
 else f.r=(furnRot(f)+3)%4;""")
RP(" const f=state.furn[state.furn.length-1]; state.nid++;"," const f=state.furn[state.furn.length-1]; state.nid++; if(prot!==undefined&&ROTATABLE(F.kind)) f.r=prot;")
RP(" placing=k; sel=null; ghost=null;\n}"," placing=k; sel=null; ghost=null; prot=undefined;\n}")
RP("touche une case pour le poser</span></div><button class=\"sx\" data-e=\"cancel\">✕</button></div>`; }",
   "touche une case pour le poser</span></div>${ROTATABLE(F.kind)?'<button class=\"sx\" data-e=\"prot\" aria-label=\"Pivoter\">↻</button>':''}<button class=\"sx\" data-e=\"cancel\">✕</button></div>`; }")
RP("  if(a==='cancel'){ placing=null; ghost=null; }","  if(a==='cancel'){ placing=null; ghost=null; }\n  else if(a==='prot'){ prot=((prot??furnRot({t:placing,x:ghost?ghost.x:1,y:ghost?ghost.y:1}))+3)%4; sfx('pop'); }")
# banquettes d'attente orientables
RP("if(kindOf(f)==='wbench') for(const o of [-.22,.22]) out.push({key:'w'+f.id+'_'+o,x:f.x,y:f.y,ox:o,inside:true});",
   "if(kindOf(f)==='wbench'){ const r=f.r||0, fd=RDIR[r]; for(const o of [-.22,.22]) out.push({key:'w'+f.id+'_'+o,x:f.x,y:f.y,ox:o*fd[1],oy:-o*fd[0],fd,fr:r*Math.PI/2,inside:true}); }")
RP("const fy=s.y+1, front=!s.inside||(inRest(s.x,fy)&&!blocked(s.x,fy)); const gx=s.x, gy=front?fy:s.y;",
   "const fd=s.fd||[0,1], fxx=s.x+fd[0], fy=s.y+fd[1], front=!s.inside||(inRest(fxx,fy)&&!blocked(fxx,fy)); const gx=front?fxx:s.x, gy=front?fy:s.y;")
RP("seatSeq(c,[s.x+s.ox,s.y],[s.x+s.ox,s.y+.48],0);","{ const fd=s.fd||[0,1], bx=s.x+s.ox, by=s.y+(s.oy||0); seatSeq(c,[bx,by],[bx+fd[0]*.48,by+fd[1]*.48],s.fr||0); }")
# --- passage : on ne refuse que ce qui casse vraiment le service ; le reste est un simple avertissement ---
RP("function newIssue(before){ const after=layoutIssues(); for(const [k,r] of after) if(!before.has(k)) return r; return null; }",
   "const SOFT_ISSUE=['seat','table','service'];\nfunction newIssue(before,soft){ const after=layoutIssues(); for(const [k,r] of after) if(!before.has(k)&&SOFT_ISSUE.includes(r)===!!soft) return r; return null; }\nfunction hardIssues(){ const I=layoutIssues(); for(const [k,r] of [...I]) if(SOFT_ISSUE.includes(r)) I.delete(k); return I; }\nfunction softMsg(r){ return r==='seat'?'⚠️ Posé, mais une chaise est maintenant inaccessible : aucun client ne pourra s’y asseoir.':r==='table'?'⚠️ Posé, mais une table est inaccessible : elle ne pourra pas être débarrassée.':'⚠️ Posé, mais le frigo, le bar ou la poubelle est inaccessible.'; }")
RP(" const bad=newIssue(before);\n if(bad){ if(mover){mover.x=ox;mover.y=oy;} else state.furn.pop(); rebuildOcc(); return issueMsg(bad); }\n return null;",
   " const bad=newIssue(before);\n if(bad){ if(mover){mover.x=ox;mover.y=oy;} else state.furn.pop(); rebuildOcc(); return issueMsg(bad); }\n { const w=newIssue(before,true); if(w) setTimeout(()=>toast(softMsg(w)),60); }\n return null;")
RP("let I=layoutIssues(), stored=0;","let I=hardIssues(), stored=0;")
RP("rebuildOcc(); const n=layoutIssues().size; state.furn.splice(i,0,f);","rebuildOcc(); const n=hardIssues().size; state.furn.splice(i,0,f);")
RP("stored++; rebuildOcc(); I=layoutIssues();","stored++; rebuildOcc(); I=hardIssues();")
# le serveur peut servir depuis n'importe quel côté libre de la table
RP("function toSeat(a,c){ return (c.seat&&pathToFurn(a,c.seat))||[]; }","function toSeat(a,c){ return (c.seat&&pathToFurn(a,c.seat))||(c.table&&pathToFurn(a,c.table))||[]; }")
RP("a.path=(o.c.seat&&pathToFurn(a,o.c.seat))||[]; j.s='serve';","a.path=toSeat(a,o.c); j.s='serve';")
