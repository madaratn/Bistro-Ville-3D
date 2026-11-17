# v0.28 : tout le monde coupe en diagonale et se faufile entre tables et chaises (trajets plus courts)
RP("function bfs(sx,sy,isGoal,goalPass,zone){","let bfsDiag=true;\nconst D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];\nconst HARD_K=['counter','dish','fridge','stove','oven','prep','sink','bar'];\nfunction bfs(sx,sy,isGoal,goalPass,zone){")
RP("  for(const [dx,dy] of D4){\n   const nx=cx+dx, ny=cy+dy; if(!inWalk(nx,ny)) continue;\n   const ni=ny*Wd+nx; if(prev[ni]!==-2) continue;",
   """  for(const [dx,dy] of (bfsDiag?D8:D4)){
   const nx=cx+dx, ny=cy+dy; if(!inWalk(nx,ny)) continue;
   const ni=ny*Wd+nx; if(prev[ni]!==-2) continue;
   if(dx&&dy){ // diagonale : on se faufile entre deux meubles de salle, mais pas à travers un comptoir ni le muret de la cuisine
    if(!inRest(nx,cy)||!inRest(cx,ny)||!inRest(nx,ny)||!inRest(cx,cy)||blocked(nx,ny)) continue;
    if(kz!==inKitchen(nx,cy)||kz!==inKitchen(cx,ny)) continue;
    const f1=fAt(nx,cy), f2=fAt(cx,ny); if((f1&&HARD_K.includes(kindOf(f1)))||(f2&&HARD_K.includes(kindOf(f2)))) continue; }""")

# on suit la personne de devant à son allure au lieu de s'arrêter net
RP("a.psT=(a.psT||0)+dt; if(a.psT<1.2){ a.v=0; a.moving=false; return false; } a.ghostT=.5; a.psT=0; break; } a.psT=0; }",
   "if(b.moving&&(b.v||0)>.2){ a.slowTo=Math.max(.25,(b.v||0)*.92); continue; } a.psT=(a.psT||0)+dt; if(a.psT<1.2){ a.v=Math.max(0,(a.v||0)-dt*5); a.moving=a.v>.04; if(a.v<=.04) return false; break; } a.ghostT=.5; a.psT=0; break; } }")
