# v0.98 : l'écran de réglages par onglets (src/opts.js), les volumes, la finesse de l'image, la limite d'images par seconde
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('opt_patch',a[:70],c); js=js.replace(a,b)
i=js.index("settings(){"); j=js.index("return {title:'⚙️ Réglages',html};",i)
old=js[i:j]
st=old[old.index("html+=`<h3>Statistiques</h3>"):old.index("html+=`<h3>Comment jouer</h3>")]
hp=old[old.index("html+=`<h3>Comment jouer</h3>"):old.index("html+=`<h3>Danger</h3>")]
ver=old[old.index("html+=`<p class=\"sub center\">Chez Odette"):]
js=js[:i]+"settings(){\n  let html=''; const T=ui.tab||'img';\n  if(T==='partie'){ "+st+" html+=optSaveHTML(); "+ver+" }\n  else if(T==='jeu'){ html+=optGameHTML(); "+hp+" }\n  else html+=optTabHTML(T);\n  "+js[j:]
RX("const TABS={","const TABS={settings:[['img','Image'],['son','Son'],['confort','Confort'],['jeu','Jeu'],['partie','Partie']],")
RX(" optgfx:()=>{ if(LITE) return;",""" opt:(v)=>{ const p=String(v).split(':'); optSet(p[0],+p[1]); },
 optq:(v)=>{ v=+v; if(v===2){ if(!LITE){ try{ localStorage.setItem('bv_lite','1'); }catch(e){} save(); location.reload(); } return; }
  if(LITE){ try{ localStorage.setItem('bv_lite','0'); localStorage.setItem('bv_gfx','1'); localStorage.setItem('bv_ao',v===0?'1':'0'); if(v===0) localStorage.setItem('bv_hd','1'); }catch(e){} optS('res',v); save(); location.reload(); return; }
  try{ localStorage.setItem('bv_gfx','1'); }catch(e){} GFX.on=true; optAO(v===0); if(v===0&&!HD.on) ACT.opthd(); optSet('res',v); },
 optao:()=>{ if(LITE||!GFX.on) return; optAO(!GFX.aoOn); },
 optdof:()=>{ optS('dof',optG('dof',1)?0:1); },
 optbust:()=>{ BUST.on=!BUST.on; try{ localStorage.setItem('bv_bust',BUST.on?'1':'0'); }catch(e){} },
 optvb:()=>{ optS('vb',optG('vb',1)?0:1); },
 optauto:()=>{ optS('auto',optG('auto',0)?0:1); },
 opthc:()=>{ optSet('hc',optG('hc',0)?0:1); },
 optrm:()=>{ optSet('rm',optG('rm',0)?0:1); },
 savExp:()=>{ save(); ui.sv=Object.assign(ui.sv||{},{code:JSON.stringify(state),copied:false}); },
 savCopy:()=>{ const S=ui.sv||{}; if(!S.code) return; const ok=()=>{ S.copied=true; try{ renderPanel(); }catch(e){} }; try{ const t=document.getElementById('svOut'); if(t){ t.focus(); t.select(); } }catch(e){} try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(S.code).then(ok,()=>{ try{ if(document.execCommand('copy')) ok(); }catch(e){} }); } else if(document.execCommand('copy')) S.copied=true; }catch(e){} },
 savImp:()=>{ const S=ui.sv=ui.sv||{}; const t=document.getElementById('svIn'); if(t) S.inp=t.value; const o=optSaveRead(S.inp||''); if(!o){ S.err='Ce code n’est pas une sauvegarde de Chez Odette. Vérifie qu’il est entier.'; S.sure=false; return; } S.err='';
  if(!S.sure){ S.sure=true; return; } try{ wiping=true; localStorage.setItem(SAVE_KEY,JSON.stringify(o)); location.reload(); }catch(e){ wiping=false; S.err='Impossible d’enregistrer ce code sur cet appareil.'; S.sure=false; } },
 optgfx:()=>{ if(LITE) return;""")
# les volumes : deux sorties, effets et musique
RX("o.connect(g); g.connect(AC.destination); o.start(AC.currentTime+t0);","o.connect(g); g.connect(volBus('s')); o.start(AC.currentTime+t0);")
RX("MUS.gain=AC.createGain(); MUS.gain.gain.value=0; MUS.gain.connect(AC.destination);","MUS.gain=AC.createGain(); MUS.gain.gain.value=0; MUS.gain.connect(volBus('m'));")
# finesse de l'image et images par seconde
RX("function frame(t){\n const dt=Math.min(.1,(t-last)/1000); last=t;","function frame(t){\n if(optG('fps',0)===1&&t-last<30){ requestAnimationFrame(frame); return; }\n const dt=Math.min(.1,(t-last)/1000); last=t;")

# v0.98 : la carte en fiches illustrées (src/menu2.js)
i=js.index("menu(){\n  let html='';\n  if(ui.tab==='boissons')"); j=js.index("return {title:'📖 Menu & recettes',html};",i)
js=js[:i]+"menu(){ const html=menuHTML2();\n  "+js[j:]

# v0.98 : les fenêtres s'ouvrent avec une entrée en cascade de leur contenu (seulement à l'ouverture ou au changement d'onglet)
RX("function renderPanel(){ renderPanel0(); try{ iconizeEl($('#modal')); }catch(e){} typoEl($('#mc')); }",
   "function renderPanel(){ renderPanel0(); try{ iconizeEl($('#modal')); }catch(e){} typoEl($('#mc')); try{ uiFresh(); }catch(e){} }")

# v0.98 : « Mes scènes » (revoir l'ouverture des chapitres vécus) et le rappel « Précédemment » au retour d'une longue absence
RX("'<button class=\"b alt sm\" data-a=\"sagain\">Revoir l’intro</button> '","'<button class=\"b alt sm\" data-a=\"sagain\">Revoir l’intro</button> <button class=\"b alt sm\" data-a=\"scGalOpen\">Mes scènes</button> '")
RX(" carnet:()=>{ closeModal(); openPanel('carnet'); },"," carnet:()=>{ closeModal(); openPanel('carnet'); },\n scGalOpen:()=>{ closeModal(); openPanel('scenes'); },\n scGal:(v)=>{ const i=+v, C=SAGA[i]; if(!C) return; closeModal(); sceneQ({lines:C.intro,title:'Chapitre '+(i+1)+' · '+C.t,mus:C.musI,card:{top:'Saison '+(C.s+1)+' · '+SAGA_SEASONS[C.s][0],n:'Chapitre '+(i+1),t:C.t,sub:C.sub}}); },")
RX("const PANELS={","const PANELS={\n scenes(){ return scGalPanel(); },")
RX(" if((state.n96!==0&&state.n97!==0)||warming||!state.tuto||"," if(warming||!state.tuto||")
RX("(typeof titleOn!=='undefined'&&titleOn)) return;\n if(state.n96!==0){ state.n97=1;","(typeof titleOn!=='undefined'&&titleOn)) return;\n if(!storyRecap.done){ try{ storyRecap(); }catch(e){} if(modalQ.length||scBusy()) return; }\n if(state.n96!==0&&state.n97!==0) return;\n if(state.n96!==0){ state.n97=1;")

# v0.99 : la Ville (multijoueur) : après chaque rendu de panneau on rebranche la carte ; le bouton d'accès suit l'état du jeu
RX("typoEl($('#mc')); try{ uiFresh(); }catch(e){} }","typoEl($('#mc')); try{ uiFresh(); }catch(e){} try{ mpAfter(); }catch(e){} }")
RX(" updFx(dt);\n try{ flowF++; coinTick(dt); }catch(e){}"," updFx(dt);\n try{ flowF++; coinTick(dt); }catch(e){}\n try{ mpButton(); }catch(e){}")

# v0.99 : une courte scène annonce l'ouverture de la ville aux joueurs qui ont déjà une partie
RX("if(!storyRecap.done){ try{ storyRecap(); }catch(e){} if(modalQ.length||scBusy()) return; }\n if(state.n96!==0&&state.n97!==0) return;",
   "if(!storyRecap.done){ try{ storyRecap(); }catch(e){} if(modalQ.length||scBusy()) return; }\n if(state.n99===undefined){ const s0=state.story; state.n99=(s0&&s0.v&&((s0.pages||0)>0||s0.seen===s0.ch))?0:1; }\n if(state.n96!==0&&state.n97!==0){ if(state.n99===0){ state.n99=1; sceneQ({title:'La ville s’ouvre',lines:[['j/grin','Édition spéciale de la Gazette ! Toute la ville tient désormais sur une seule carte : chaque bistrot y a son adresse, et le tien aussi.'],['o/warm','Installe-toi dans un quartier, {{N}}, et va voir les voisins. Une confrérie, c’est une tablée de patrons qui se serrent les coudes : rejoins-en une, ou fonde la tienne.'],['j','Le bouton « Ville » est à gauche de l’écran. Chaque client servi compte pour ta semaine, pour ta confrérie et pour le quartier qu’elle défend.']]}); } return; }")
