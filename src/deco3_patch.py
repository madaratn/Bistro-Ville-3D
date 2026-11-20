# v0.99.2 : déco des murs et des sols — branchement dans l'atelier déco, l'annulation, les restaurants témoins,
# la note du restaurant et la boutique. Le contenu lui-même est dans src/deco3_*.js.

# --- vignettes : de vraies images du motif, plus un simple damier de deux couleurs ---
RX("""<span class="eim sw" style="background:repeating-conic-gradient(${f.a} 0 25%,${f.b} 0 50%) 0 0/20px 20px"></span>""","""<span class="eim sw" style="background:url(${swF(i)}) center/cover"></span>""",2)
RX("""<span class="eim sw" style="background:linear-gradient(transparent 66%,${f.w} 66%),${f.s?`repeating-linear-gradient(90deg,${f.c} 0 9px,${f.s} 9px 14px)`:f.c}"></span>""","""<span class="eim sw" style="background:url(${swW(i)}) center/cover"></span>""")
RX("""<div class="sw" style="background:repeating-conic-gradient(${f.a} 0 25%,${f.b} 0 50%) 0 0/24px 24px"></div>""","""<div class="sw" style="background:url(${swF(i)}) center/cover"></div>""")
RX("""<div class="sw" style="background:linear-gradient(transparent 68%,${f.w} 68%),${f.s?`repeating-linear-gradient(90deg,${f.c} 0 10px,${f.s} 10px 16px)`:f.c}"></div>""","""<div class="sw" style="background:url(${swW(i)}) center/cover"></div>""")

# --- onglet Sols : un troisième mode, les tapis ---
RX("""   return `<div class="emode"><button class="${tileMode?'':'on'}" data-tm="0">Toute la salle</button><button class="${tileMode?'on':''}" data-tm="1">Carreau par carreau</button></div>`+(tileMode?flT+""",
   """   return `<div class="emode e3"><button class="${tileMode||rugMode?'':'on'}" data-tm="0">Toute la salle</button><button class="${tileMode?'on':''}" data-tm="1">Carreau par carreau</button><button class="${rugMode?'on':''}" data-tm="2">Tapis</button></div>`+(rugMode?rugCards():tileMode?flT+""")

# --- onglet Murs : trois rayons (papiers peints, fenêtres et enseignes, déco murale), filtrés par style même quand un pan est déjà choisi ---
RX("""  const wo=Object.keys(WOBJ).map(k=>{ const W=WOBJ[k]; if(!wslot&&!stOK(W)) return '';""",
   """  const wsN=wslot&&wsec==='w'?'d':wsec;\n  const wo=Object.keys(WOBJ).map(k=>{ const W=WOBJ[k]; if(!!(W.win||W.uniq)!==(wsN==='f')||!stOK(W)) return '';""")
RX("""  if(wslot) return wo;
  return wl+'<i class="esep"></i>'+wo+`<button class="ecard${wsel==='x'?' on':''}" data-wo="x"><span class="eim sw" style="background:repeating-linear-gradient(45deg,#f3dfb8 0 6px,#fff 6px 12px)"></span><span class="en">Gomme</span><span class="ep">Retirer</span></button>`;""",
   """  const wmd=`<div class="emode e3">${wslot?'':`<button class="${wsN==='w'?'on':''}" data-ws="w">Papiers peints</button>`}<button class="${wsN==='f'?'on':''}" data-ws="f">Fenêtres, enseignes</button><button class="${wsN==='d'?'on':''}" data-ws="d">Déco murale</button></div>`;
  if(wsN==='w') return wmd+(wl||'<span class="enone">Aucun papier peint dans ce style.</span>');
  return wmd+(wo||'<span class="enone">Rien dans ce style ici.</span>')+`<button class="ecard${wsel==='x'?' on':''}" data-wo="x"><span class="eim sw" style="background:repeating-linear-gradient(45deg,#f3dfb8 0 6px,#fff 6px 12px)"></span><span class="en">Gomme</span><span class="ep">Retirer</span></button>`;""")
RX("const on=STYLED.includes(etab)&&!wslot; r.style.display=on?'':'none';","const on=STYLED.includes(etab); r.style.display=on?'':'none';")

# --- boutons ---
RX("if(etab!=='murs') wsel=null; if(etab!=='sols') tileMode=false;","if(etab!=='murs') wsel=null; if(etab!=='sols'){ tileMode=false; rugMode=false; }")
RX(" else if(d.tm!==undefined){ tileMode=d.tm==='1'; if(tileMode&&tileBrush===null) tileBrush=state.floor; }",
   " else if(d.tm!==undefined){ tileMode=d.tm==='1'; rugMode=d.tm==='2'; if(tileMode&&tileBrush===null) tileBrush=state.floor; $('#eitems')._tab=null; }\n else if(d.rg){ if(d.rg==='rot') rugRot=rugRot?0:1; else rugSel=rugSel===d.rg?null:d.rg; }\n else if(d.ws){ wsec=d.ws; $('#eitems')._tab=null; }")
RX("function editTap(x,y){ if(etab==='sols'&&tileMode){ if(tilePaint(x,y)) editUI(); return; }","function editTap(x,y){ if(etab==='sols'&&rugMode){ rugTap(x,y); editUI(); return; }\n if(etab==='sols'&&tileMode){ if(tilePaint(x,y)) editUI(); return; }")
RX("etab==='sols'?(tileMode?'Choisis un sol, puis touche les carreaux un par un.':'Touche un sol pour l’appliquer à toute la salle.')",
   "etab==='sols'?(rugMode?(rugSel==='x'?'Touche un tapis pour le reprendre : la moitié du prix revient.':rugSel?'Touche le sol pour dérouler le tapis. Les meubles vont dessus.':'Choisis un tapis. Toucher un tapis posé le fait tourner.'):tileMode?'Choisis un sol, puis touche les carreaux un par un.':'Touche un sol pour l’appliquer à toute la salle.')")
RX("function exitEdit(){\n mode='play'; placing=null;","function exitEdit(){\n rugMode=false; rugSel=null;\n mode='play'; placing=null;")

# --- annuler : les tapis font partie de l'instantané ---
RX("tiles:JSON.stringify(state.tiles||{}),wobj:JSON.stringify(state.wallObj||null)}; }","tiles:JSON.stringify(state.tiles||{}),wobj:JSON.stringify(state.wallObj||null),rugs:JSON.stringify(state.rugs||[])}; }")
RX("state.wallObj=JSON.parse(s.wobj); state.tv=(state.tv||0)+1; }","state.wallObj=JSON.parse(s.wobj); if(s.rugs!==undefined) state.rugs=JSON.parse(s.rugs); state.tv=(state.tv||0)+1; }")

# --- restaurants témoins : on met de côté les tapis du joueur, chaque style déroule le sien ---
RX("showBak={furn:state.furn,floor:state.floor,wall:state.wall,tiles:state.tiles,wallObj:state.wallObj}; }","showBak={furn:state.furn,floor:state.floor,wall:state.wall,tiles:state.tiles,wallObj:state.wallObj,rugs:state.rugs||[]}; }")
RX(" state.furn=F; state.floor=P.f; state.wall=P.w; state.tiles={}; state.wallObj=O; state.tv=(state.tv||0)+1; rebuildOcc(); }"," state.furn=F; state.floor=P.f; state.wall=P.w; state.tiles={}; state.wallObj=O; try{ showRug(k); }catch(e){ state.rugs=[]; } state.tv=(state.tv||0)+1; rebuildOcc(); }")
RX(" for(const t in wc){ const W=WOBJ[t]; L.push({n:W.n,sub:'Mural',q:W.uniq?1:wc[t],p:W.p*(W.uniq?1:wc[t]),u:1,img:thumbs['wo:'+t]}); } return L; }",
   " for(const t in wc){ const W=WOBJ[t]; L.push({n:W.n,sub:'Mural',q:W.uniq?1:wc[t],p:W.p*(W.uniq?1:wc[t]),u:1,img:thumbs['wo:'+t]}); } for(const r of state.rugs||[]){ const R=RUGS[r.t]; if(R) L.push({n:R.n,sub:'Tapis',q:1,p:R.p,u:R.u||1,img:swR(r.t)}); } return L; }")

# --- la note du restaurant : les tapis comptent comme de la déco ---
RX(" for(const f of state.furn) decor+=FURN[f.t].d||0;\n const d=Math.min(1.5,decor/(S*S)*4);"," for(const f of state.furn) decor+=FURN[f.t].d||0;\n for(const r of state.rugs||[]) decor+=(RUGS[r.t]&&RUGS[r.t].d)||0;\n const d=Math.min(1.5,decor/(S*S)*4);")

# --- passage de niveau : avec autant de sols et de murs, on annonce le nombre plutôt que la liste ---
RX(" FLOORS.filter(f=>f.u===L).forEach(f=>un.push('🟫 Sol : '+f.n));\n WALLS.filter(f=>f.u===L).forEach(f=>un.push('🧱 Mur : '+f.n));",
   " { const f=FLOORS.filter(f=>f.u===L), w=WALLS.filter(f=>f.u===L), r=Object.values(RUGS).filter(f=>f.u===L); if(f.length>2) un.push('🟫 '+f.length+' nouveaux sols'); else f.forEach(f=>un.push('🟫 Sol : '+f.n)); if(w.length>2) un.push('🧱 '+w.length+' nouveaux murs'); else w.forEach(f=>un.push('🧱 Mur : '+f.n)); if(r.length) un.push('🟫 '+(r.length>1?r.length+' nouveaux tapis':'Tapis : '+r[0].n)); }")

# --- la carte choisie se centre dans la partie visible de la bande (les trois boutons restent collés à gauche) ---
RX("const r=on.offsetLeft-it.clientWidth/2+on.offsetWidth/2; it.scrollTo({left:r,behavior:'smooth'}); }","const em=it.querySelector('.emode'), ew=em?em.offsetWidth:0, r=on.offsetLeft-ew-(it.clientWidth-ew)/2+on.offsetWidth/2; it.scrollTo({left:r,behavior:'smooth'}); }")
# --- toucher un pan de mur ouvre le bon rayon : fenêtres et enseignes, ou déco ---
RX("function wallPick(sd,i){ if(!wallSlotOK(sd,i)) return; wslot={sd,i};","function wallPick(sd,i){ if(!wallSlotOK(sd,i)) return; wslot={sd,i}; { const t=wallLayout()[sd][i]; wsec=t&&WOBJ[t]&&(WOBJ[t].win||WOBJ[t].uniq)?'f':'d'; }")

# --- les « + » ne se proposent plus sur les deux pans que l'enseigne recouvre (on y posait un objet pour rien) ---
# (fait directement dans src/render3d.js, qui n'est pas un fichier « patché »)
# --- la cuisine qui s'agrandit reprend les tapis qu'elle recouvre (remboursés en entier) ---
RX("state.kz={c:nkz.c,w:nkz.w,d:nkz.d,auto:nkz.auto?1:0}; updKR();\n const nR=KR,","state.kz={c:nkz.c,w:nkz.w,d:nkz.d,auto:nkz.auto?1:0}; updKR(); rugsKit();\n const nR=KR,")
# --- restaurant témoin : le total tient sur une ligne, avec le séparateur de milliers ---
RX("""<button data-sh="list">Voir la liste · ${tot} <i class="coin sm"></i></button>""","""<button data-sh="list">La liste · ${fmt(tot)} <i class="coin sm"></i></button>""")

# --- liste d'un restaurant témoin : le sol et le mur ont enfin leur vignette ; les images ne s'étirent plus ---
RX("L.push({n:FLOORS[P.f].n,sub:'Sol',","L.push({n:FLOORS[P.f].n,img:swF(P.f),sub:'Sol',")
RX("L.push({n:WALLS[P.w].n,sub:'Mur',","L.push({n:WALLS[P.w].n,img:swW(P.w),sub:'Mur',")
RX("""<img src="${x.img}" alt="" style="width:40px;height:40px">""","""<img src="${x.img}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:7px">""")
