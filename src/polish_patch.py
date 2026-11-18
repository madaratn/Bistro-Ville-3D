# v0.95 : passe de finition générale (interface petits écrans, textes, enchaînements)
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('polish_patch',a[:70],c); js=js.replace(a,b)
# -- un panneau qu'on ouvre commence toujours en haut (le défilement du précédent ne doit pas rester)
RX("function openPanel(p,tab){ ui.panel=p; ui.tab=tab||(TABS[p]?TABS[p][0][0]:null); renderPanel(); $('#modal').classList.remove('hide'); }",
   "function openPanel(p,tab){ const same=ui.panel===p; ui.panel=p; ui.tab=tab||(TABS[p]?TABS[p][0][0]:null); renderPanel(); $('#modal').classList.remove('hide'); if(!same) $('#mc').scrollTop=0; }")
RX("function nextModal(){ const fn=modalQ.shift(); if(fn){ ui.panel='custom'; ui.custom=fn; renderPanel(); $('#modal').classList.remove('hide'); } }",
   "function nextModal(){ const fn=modalQ.shift(); if(fn){ ui.panel='custom'; ui.custom=fn; renderPanel(); $('#modal').classList.remove('hide'); $('#mc').scrollTop=0; } }")
# -- les messages restent affichés assez longtemps pour être lus
RX("toastT=setTimeout(()=>t.classList.remove('on'),2200); }","toastT=setTimeout(()=>t.classList.remove('on'),Math.min(6500,1900+String(s).length*42)); }")
# -- nombres à la française : virgule décimale, espaces des milliers
RX("$('#rate').textContent=(Math.round(rating*10)/10).toFixed(1);","$('#rate').textContent=(Math.round(rating*10)/10).toFixed(1).replace('.',',');")
RX("<p class=\"center\"><b>${st} / 5</b> — plus la note est haute,","<p class=\"center\"><b>${String(st).replace('.',',')} / 5</b> : plus la note est haute,")
RX("`Satisfaction moyenne : ${Math.round(state.sat)}%. Sers vite !`","`Satisfaction moyenne : ${Math.round(state.sat)} %. Sers vite !`")
RX("`Malus : -${rParts.dirt.toFixed(1)} (déchets et tables sales)`","`Malus : −${rParts.dirt.toFixed(1).replace('.',',')} (déchets et tables sales)`")
RX("sg=v=>(v>=0?'+':'−')+Math.abs(v);\n  let html=`<div class=\"sagaH\"><div class=\"sagaS\" style=\"color:#c9772e\">${d.night?","sg=v=>(v>=0?'+':'−')+fmt(Math.abs(v));\n  let html=`<div class=\"sagaH\"><div class=\"sagaS\" style=\"color:#c9772e\">${d.night?")
RX("Dette de Mamie Odette · reste ${debtLeft()} sur ${DEBT0}</div>","Dette de Mamie Odette · reste ${fmt(debtLeft())} sur ${fmt(DEBT0)}</div>")
RX("Rembourser ${Math.min(5000,debtLeft(),Math.floor(state.coins/1000)*1000)} d’avance</button>","Rembourser ${fmt(Math.min(5000,debtLeft(),Math.floor(state.coins/1000)*1000))} d’avance</button>")
RX("<span>Jour ${h.n} · ${h.served} clients · recettes ${h.rev}, charges ${h.cost}</span>","<span>Jour ${h.n} · ${h.served} clients · recettes ${fmt(h.rev)}, charges ${fmt(h.cost)}</span>")
RX("<div class=\"sub\">Une journée dure une heure de jeu. À la fermeture : salaires, électricité, courses, et le bilan.</div>","<div class=\"sub\">Une journée dure une heure de jeu (20 minutes en vitesse ×3). À la fermeture : salaires, électricité, courses, et le bilan.</div>")
RX("<span>Jour ${state.day?state.day.n:1} · niveau ${state.level} · ${state.coins} pièces</span>","<span>Jour ${state.day?state.day.n:1} · niveau ${state.level} · ${fmt(state.coins)} pièces</span>")
# -- carte : le prix et le temps de cuisson sur leur propre ligne (ils se cassaient en deux sur petit écran)
RX("<div class=\"sub\">${svcBadges(d)} ${dishPrice(d)} 🪙 · ${d.t}s</div>${mastRow(id)}</div><button class=\"b sm alt\" data-a=\"remMenu\"","<div class=\"sub\">${svcBadges(d)}</div><div class=\"sub mnP\"><b>${dishPrice(d)}</b> 🪙 · ${d.t} s de cuisson</div>${mastRow(id)}</div><button class=\"b sm alt\" data-a=\"remMenu\"")
# -- missions : la récompense tient sur une ligne
RX("<div class=\"sub\">${v}/${M2.n} · récompense ${M2.r} 🪙 + 3 ⚡</div>","<div class=\"sub\">${v}/${M2.n} · ${M2.r} 🪙 + 3 ⚡</div>")
# -- panneau « Aujourd'hui » : les mini-jeux et les défis express y ont leur ligne
RX("  html+=`<h3>Missions du jour</h3>`;","""  { const left=mgTotal(), tot=MGS.length*MG_MAX; html+=`<div class="row"><div class="emo">🎮</div><div class="info"><div class="t">Mini-jeux <span class="tag">${left}/${tot} parties</span></div><div class="sub">Cinq petits jeux, trois parties chacun par journée. Chaque point rend 1 ⚡ et quelques pièces.</div></div><button class="b sm" data-a="mgo" ${left?'':'disabled'}>Jouer</button></div>`;
   html+=`<div class="row"><div class="emo">🎯</div><div class="info"><div class="t">Défis express <span class="tag">${dxDay()}/${DX_MAX} aujourd'hui</span></div><div class="sub">Ils apparaissent pendant le service, juste au-dessus de ton objectif. Plusieurs réussis de suite : la prime grossit.</div></div></div>`; }
  html+=`<h3>Missions du jour</h3>`;""")
RX(" close:()=>closeModal(),"," close:()=>closeModal(),\n mgo:()=>{ closeModal(); if(mgCd-performance.now()/1000>0) return toast('Les mini-jeux reviennent dans '+Math.ceil(mgCd-performance.now()/1000)+' s.'); mgOpen(); },")
RX("'Pleine. Chaque coup de main en salle coûte 1 ⚡.'","'Pleine. Chaque coup de main en salle coûte 1 ⚡. Elle revient toute seule, et les mini-jeux en rendent.'")
# -- l'épicerie (achat direct d'ingrédients) ne s'appelle plus « marché » : ce nom est réservé à la place du marché des voisins
RX("['garden','Jardin et marché','garden',","['garden','Jardin et épicerie','garden',")
RX("['marche','Marché'],['stock','Garde-manger']","['marche','Épicerie'],['stock','Garde-manger']")
RX("html+='<p class=\"sub\">Certains ingrédients ne poussent pas au jardin : achète-les ici (ou gagne-les au quiz).</p>';","html+='<p class=\"sub\">Certains ingrédients ne poussent pas au jardin : achète-les ici (ou gagne-les au quiz). Sur la place du marché, tes voisins les vendent moins cher, par lots de trois.</p>';")
RX("c’est moins cher qu’à la boutique, et c’est tout de suite dans ta réserve.","c’est moins cher qu’à l’épicerie, et c’est tout de suite dans ton garde-manger.")
# -- tutoriel : à jour avec le jeu d'aujourd'hui
RX("{q:'#sJour',t:'L’heure du jeu. Une journée dure une heure : petit-déjeuner,","{q:'#sJour',t:'L’heure du jeu. Une journée dure une heure (vingt minutes en vitesse ×3) : petit-déjeuner,")
RX("{q:'#sRush',t:'Le coup de feu : 45 secondes de rush où tout rapporte plus. Tu en as trois par jour, et chacun coûte de l’énergie.'},","{q:'#sRush',t:'Le coup de feu : deux minutes de rush. Les clients affluent et tes coups de main sont gratuits. Tu en as trois par jour, et chacun coûte 4 d’énergie.'},")
RX("{q:'#sEn',t:'Ton énergie. Elle sert aux coups de feu et aux coups de main, et se recharge toute seule avec le temps.'},","{q:'#sEn',t:'Ton énergie. Elle sert aux coups de feu et aux coups de main. Elle revient toute seule (1 toutes les 20 secondes) et fait le plein chaque matin.'},")
RX("  {q:'#bottom [data-open=\"menu\"]',t:'Le menu.","  {q:'#sMg',t:'Les mini-jeux. Cinq petits jeux, trois parties chacun par journée. Chaque point gagné rend de l’énergie et quelques pièces : parfait quand tu es à sec.'},\n  {q:'#bottom [data-open=\"menu\"]',t:'Le menu.")
RX("{q:'#bMore',t:'Ici : le jardin et le marché pour les ingrédients, les restaurants témoins, les ingrédients d’exception, les comptes et l’histoire.'},","{q:'#bMore',t:'Ici : l’histoire, le jardin, la place du marché où tes voisins tiennent boutique, tes habitués, les projets du quartier et les comptes.'},")
RX("{q:'#goal',t:'Ton objectif du moment. Touche-le pour voir la liste « Aujourd’hui ». Quand tout est coché, ta journée est bouclée.'},","{q:'#goal',t:'Ton objectif du moment. Touche-le pour voir la liste « Aujourd’hui ». Pendant le service, des défis express d’une minute apparaissent juste au-dessus.'},")
# -- déco : le vaisselier d'Odette ne se copie pas et ne se vend pas
RX("<div class=\"sa\">${ROTATABLE(k)?'<button data-e=\"rot\"><i>↻</i>Pivoter</button>':''}<button data-e=\"copy\"><i>⧉</i>Copier</button><button data-e=\"store\"><i>📦</i>Ranger</button><button data-e=\"sell\" class=\"red\"><i>🪙</i>Vendre +${Math.floor(F.p/2)}</button></div>`; }",
   "<div class=\"sa\">${ROTATABLE(k)?'<button data-e=\"rot\"><i>↻</i>Pivoter</button>':''}${F.own?'':'<button data-e=\"copy\"><i>⧉</i>Copier</button>'}<button data-e=\"store\"><i>📦</i>Ranger</button>${F.own?'':'<button data-e=\"sell\" class=\"red\"><i>🪙</i>Vendre +'+Math.floor(F.p/2)+'</button>'}</div>`; }")
RX("  let info='Glisse-le pour le déplacer';\n  if(k==='chair')","  let info=F.own?'Un souvenir par chapitre · glisse-le pour le déplacer':'Glisse-le pour le déplacer';\n  if(k==='chair')")
RX("else if(a==='copy'){ const t=sel.t; sel=null; pickItem(t); etab=FURN[t].cat; }","else if(a==='copy'){ const t=sel.t; if(FURN[t].own) return; sel=null; pickItem(t); etab=FURN[t].cat; }")
# -- écran titre : la vue en cours est connue du style (les options tiennent sur un petit écran)
RX("el.innerHTML=h+'</div><div class=\"tiV\">'+(document.title||'')+'</div>'; };","el.className='v-'+view; el.innerHTML=h+'</div><div class=\"tiV\">'+(document.title||'')+'</div>'; };")
# -- bandeau d'événement : il se replie au bout de quelques secondes pour ne plus cacher les boutons
RX(" b.className=''; b.style.setProperty('--ec',E.c); b.innerHTML=`${E.who?`<span class=\"evP\"><img src=\"${foodThumbs['who:'+E.who]||''}\" alt=\"\"></span>`:''}<div><b>${E.n}</b><span>${E.t}</span><i class=\"evBar\"><u></u></i></div>`; }",
   " b.className=''; b.style.setProperty('--ec',E.c); b.innerHTML=`${E.who?`<span class=\"evP\"><img src=\"${foodThumbs['who:'+E.who]||''}\" alt=\"\"></span>`:''}<div><b>${E.n}</b><em>${EV_SHORT[ev.k]||E.n}</em><span>${E.t}</span><i class=\"evBar\"><u></u></i></div>`; clearTimeout(b._t); const me=ev; b._t=setTimeout(()=>{ if(ev===me) b.classList.add('mini'); },6500); }\nconst EV_SHORT={car:'Car de touristes',anniv:'Anniversaire',critique:'Mme Fourchette',panne:'Panne de courant',hygiene:'Contrôle d’hygiène'};")
# -- typographie française dans les fenêtres et les messages : pas de « : », « ! », « % » ou « » » seuls en début de ligne
RX("function renderPanel(){ renderPanel0(); try{ iconizeEl($('#modal')); }catch(e){} }",
   "function typoEl(el){ if(!el) return; try{ const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT); let n; while((n=tw.nextNode())){ const v=n.nodeValue; if(v.length<3||!/[ ][:;!?»%]|« /.test(v)) continue; if(n.parentNode&&n.parentNode.closest&&n.parentNode.closest('svg,script,style,input,textarea')) continue; n.nodeValue=v.replace(/ ([:;!?»%])/g,'\\u00a0$1').replace(/« /g,'«\\u00a0'); } }catch(e){} }\nfunction renderPanel(){ renderPanel0(); try{ iconizeEl($('#modal')); }catch(e){} typoEl($('#mc')); }")
RX("try{ iconizeEl(t); }catch(e){} t.classList.add('on'); clearTimeout(toastT);","try{ iconizeEl(t); }catch(e){} typoEl(t); t.classList.add('on'); clearTimeout(toastT);")
# -- propreté : pas de « Malus : −0,0 »
RX("${rParts.dirt>0?`Malus : −${rParts.dirt.toFixed(1).replace('.',',')} (déchets et tables sales)`","${rParts.dirt>=.05?`Malus : −${rParts.dirt.toFixed(1).replace('.',',')} (déchets et tables sales)`")
# -- réglages : textes justes, et les mêmes options que sur l'écran titre
RX("<div class=\"sub\">${curTrack().e} ${curTrack().n} · ${curTrack().bpm} bpm — touche le juke-box pour changer</div>","<div class=\"sub\">${curTrack().e} ${curTrack().n} · ${curTrack().bpm} bpm · touche le juke-box pour changer</div>")
RX("<div class=\"sub\">Suit l'heure réelle de ton téléphone</div></div><button class=\"b sm ${state.daynight?'green':'alt'}\" data-a=\"dn\">${state.daynight?'Activé':'Coupé'}</button></div>`;",
   "<div class=\"sub\">La lumière suit l’heure du jeu</div></div><button class=\"b sm ${state.daynight?'green':'alt'}\" data-a=\"dn\">${state.daynight?'Activé':'Coupé'}</button></div>`;\n  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">👋 Vibrations</div><div class=\"sub\">Petits retours au toucher</div></div><button class=\"b sm ${state.vib!==false?'green':'alt'}\" data-a=\"optvib\">${state.vib!==false?'Activées':'Coupées'}</button></div>`;\n  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">✨ Effets d’image</div><div class=\"sub\">${LITE?'Indisponibles en mode léger':'Lueurs, flou de profondeur, couleurs plus riches'}</div></div><button class=\"b sm ${typeof GFX!=='undefined'&&GFX.on?'green':'alt'}\" data-a=\"optgfx\" ${LITE?'disabled':''}>${typeof GFX!=='undefined'&&GFX.on?'Activés':'Coupés'}</button></div>`;\n  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">⚡ Mode léger</div><div class=\"sub\">Moins de détails, plus fluide. Le jeu se recharge.</div></div><button class=\"b sm ${LITE?'green':'alt'}\" data-a=\"optlite\">${LITE?'Activé':'Coupé'}</button></div>`;")
RX(" dn:()=>{state.daynight=!state.daynight;},"," dn:()=>{state.daynight=!state.daynight;},\n optvib:()=>{ state.vib=state.vib===false; },\n optgfx:()=>{ if(LITE) return; try{ localStorage.setItem('bv_gfx',GFX.on?'0':'1'); }catch(e){} GFX.on=!GFX.on; },\n optlite:()=>{ try{ localStorage.setItem('bv_lite',LITE?'0':'1'); }catch(e){} save(); location.reload(); },")
RX("Les clients entrent, s'assoient et commandent un plat de ton menu. Tes cuisiniers cuisinent, tes serveurs servent. Gagne des pièces et de l'XP, décore avec la Boutique, cultive des ingrédients au Jardin pour améliorer tes recettes et fais grimper la note de ton restaurant ! Tu peux donner un coup de main : touche un plat prêt sur le passe-plat puis le client qui l'attend, ou touche une table sale pour la débarrasser. Fais glisser pour te déplacer, pince (ou molette) pour zoomer.",
   "Les clients entrent, s’assoient, commandent, mangent et paient. Ton équipe s’en occupe, mais tu peux donner un coup de main (1 d’énergie) : touche un client qui attend à l’entrée pour le placer, un client prêt à commander ou à payer, un plat prêt sur le passe puis le client qui l’attend, ou une table sale pour la débarrasser. Les bulles (pourboires, clients impatients) et les déchets sont gratuits. Améliore tes recettes avec le jardin et la place du marché, décore la salle, et suis l’histoire : chaque chapitre rend une page du carnet et un souvenir pour le vaisselier. Fais glisser pour te déplacer, pince pour zoomer, tourne la vue avec deux doigts.")
# -- récompenses : jamais deux à la fois, et jamais par-dessus la déco ou un mini-jeu (elles attendent leur tour)
RX("function rewardShow(o){ let el=$('#rw');","let rwQ=[];\nfunction rwFlush(){ if(!rwQ.length||rwS||mode!=='play'||(typeof mgOn!=='undefined'&&mgOn)) return; const o=rwQ.shift(); o._now=1; rewardShow(o); }\nfunction rewardShow(o){ if(!o._now&&(rwS||mode!=='play'||(typeof mgOn!=='undefined'&&mgOn))){ rwQ.push(o); return; } let el=$('#rw');")
RX("el.className=''; el.innerHTML=''; rwS=null; hud(); if(ui.panel) renderPanel(); }","el.className=''; el.innerHTML=''; rwS=null; hud(); if(ui.panel) renderPanel(); setTimeout(rwFlush,300); }")
RX("try{ dxTick(); nbTick(); }catch(e){}","try{ dxTick(); nbTick(); rwFlush(); }catch(e){}")
RX("L’histoire commence au niveau 2. Encore quelques clients à servir !","L’histoire commence dès la fin du tutoriel.")
RX("<p class=\"sub center\">Chez Odette — prototype v","<p class=\"sub center\">Chez Odette · prototype v")
# -- le prologue annonçait douze mille pièces de dette : c'est cinquante mille depuis l'équilibrage
RX("douze mille pièces","cinquante mille pièces",2)
# -- tutoriel : l'objectif est visible quand Odette en parle, et les guillemets ne se retrouvent plus seuls en début de ligne
RX("const show=mode==='play'&&!!state.tuto&&!rush&&!visit.on; if(el._s!==show)","const show=mode==='play'&&(!!state.tuto||!!tutS)&&!rush&&!visit.on; if(el._s!==show)")
RX("el.querySelector('.tuTxt p').textContent=s.t;","el.querySelector('.tuTxt p').textContent=String(s.t).replace(/ ([:;!?»%])/g,'\\u00a0$1').replace(/« /g,'«\\u00a0');")
# -- bilan du soir et équipe : grands nombres lisibles (48 514 et non 48514)
RX("sg=v=>(v>=0?'+':'−')+Math.abs(v), who=F.op>=0?'o':'p';","sg=v=>(v>=0?'+':'−')+fmt(Math.abs(v)), who=F.op>=0?'o':'p';")
RX("row('Dette d’Odette (reste '+debtNow+')',sg(-F.loan),'neg')","row('Dette d’Odette (reste '+fmt(debtNow)+')',sg(-F.loan),'neg')")
RX("<div class=\"bl\"><span>En caisse</span><b>${state.coins}</b></div></div>","<div class=\"bl\"><span>En caisse</span><b>${fmt(state.coins)}</b></div></div>")
RX("salaires : <b>${wagesCost()} pièces par jour</b>, payés chaque soir.</p>`;","salaires : <b>${fmt(wagesCost())} pièces par jour</b>, payés chaque soir.</p>`;")
RX("toast('Remboursé : '+n+' pièces. Il reste '+state.debt+' à la banque.');","toast('Remboursé : '+fmt(n)+' pièces. Il reste '+fmt(state.debt)+' à la banque.');")
RX(">${lock?'Niveau '+P.u:P.p+' 🪙'}</button>",">${lock?'Niveau '+P.u:fmt(P.p)+' 🪙'}</button>")
RX("<p class=\"center\">+${rw} pièces · +5 d’énergie · <b>tous tes plats","<p class=\"center\">+${fmt(rw)} pièces · +5 d’énergie · <b>tous tes plats")
RX("<span>Fin du chapitre : ${storyReward(st.ch)} pièces, 5 d’énergie","<span>Fin du chapitre : ${fmt(storyReward(st.ch))} pièces, 5 d’énergie")
RX("</em></div><p class=\"center\">+${rw} pièces${typeof MK!=='undefined'&&MK[k]?","</em></div><p class=\"center\">+${fmt(rw)} pièces${typeof MK!=='undefined'&&MK[k]?")
# -- menu « Plus » : l'histoire et la vie du quartier d'abord, les réglages à la fin
RX("const ord=['garden','daily','story','quiz','exc','habit','shows','shop','gestion','tuto','quit'];","const ord=['story','daily','market','habit','projets','garden','gestion','shop','exc','shows','quiz','tuto','quit'];")
# -- événements : pas deux fois le même dans la journée tant qu'il en reste d'autres
RX("function evPick(){ const ks=Object.keys(EVS).filter(","function evPick(){ const ks0=Object.keys(EVS).filter(")
RX("(k!=='anniv'||custs.some(c=>c.st==='eat'||c.st==='wait'||c.st==='menu'))); let tot=","(k!=='anniv'||custs.some(c=>c.st==='eat'||c.st==='wait'||c.st==='menu'))); const seenEv=dayOf().evs||'', frEv=ks0.filter(k=>!seenEv.includes(k+',')), ks=frEv.length?frEv:ks0; let tot=")
RX("function evStart(k){ const E=EVS[k]; state.evLast=k; const d=dayOf(); d.ev=(d.ev||0)+1;","function evStart(k){ const E=EVS[k]; state.evLast=k; const d=dayOf(); d.ev=(d.ev||0)+1; d.evs=(d.evs||'')+k+',';")
# -- réglages : la ligne de la musique passe ses deux boutons sous le texte sur petit écran
RX("<div class=\"row\"><div class=\"info\"><div class=\"t\">🎵 Musique d'ambiance</div>","<div class=\"row tm\"><div class=\"info\"><div class=\"t\">🎵 Musique d'ambiance</div>")
