# v0.99.1 : plus d'attente entre les chapitres. L'ancienne règle (un chapitre par jour, la suite le lendemain) disparaît :
# dès qu'un chapitre est terminé, le suivant s'ouvre. Seuls ses objectifs en fixent le rythme.
RX("const storyLocked=()=>!!state.story&&!storyEnd()&&state.story.doneDay===today();          // un chapitre par jour : la suite s'ouvre le lendemain",
   "const storyLocked=()=>false;          // plus de verrou : les chapitres s'enchaînent (ancienne règle : un par jour)")
# l'ouverture du chapitre suivant arrive après un court répit (2,5 s sans fenêtre ni scène), pas dans la foulée d'un appui
RX(" const st=state.story; if(st&&!storyEnd()&&!storyLocked()&&st.seen!==st.ch&&!warming&&!ui.panel&&!modalQ.length&&mode==='play'&&!(typeof visit!=='undefined'&&visit.on)&&!(typeof rush!=='undefined'&&rush)) storyIntro();",
   " const st=state.story; if(ui.panel||modalQ.length||scBusy()) storyCheck.hold=Date.now()+2500;\n if(st&&!storyEnd()&&st.seen!==st.ch&&!warming&&!ui.panel&&!modalQ.length&&!scBusy()&&mode==='play'&&!(typeof visit!=='undefined'&&visit.on)&&!(typeof rush!=='undefined'&&rush)&&Date.now()>=(storyCheck.hold||0)) storyIntro();")
# le panneau Histoire : entre deux chapitres, une carte « Commencer le chapitre » remplace l'ancienne attente
RX("""  else if(storyLocked()){ const N=SAGA[st.ch]; html+=`<h3>Chapitre ${st.ch} terminé</h3><div class="sagaL"><div class="sagaLt">La suite demain</div><p>Chapitre ${st.ch+1} · <b>${N.t}</b></p><p class="sub">${N.sub}</p><p class="sagaLc">Disponible dans ${storyWait()}</p><p class="sub">Un chapitre par jour : l’histoire prend son temps, comme un pot-au-feu.</p></div>`; }""",
   """  else if(st.seen!==st.ch){ html+=`<h3>Chapitre ${st.ch+1}/${SAGA.length} · ${C.t}</h3><p class="sub">${C.sub}</p><div class="sagaL"><div class="sagaLt">${st.ch>0?'Chapitre '+st.ch+' terminé':'L’histoire commence'}</div><p>${st.ch>0?'La suite t’attend : aucun délai entre les chapitres.':'Tout commence ici.'}</p><p class="center"><button class="b green" data-a="snow">Commencer le chapitre</button></p></div>`; }""")
RX("""${end||storyLocked()?'':'<button class="b alt sm" data-a="sagain">Revoir l’intro</button> <button class="b alt sm" data-a="scGalOpen">Mes scènes</button> '}""",
   """${end||st.seen!==st.ch?'':'<button class="b alt sm" data-a="sagain">Revoir l’intro</button> '}${end?'':'<button class="b alt sm" data-a="scGalOpen">Mes scènes</button> '}""")
RX(" sagain:()=>{ const st=state.story; closeModal(); if(st&&!storyEnd()&&!storyLocked())",
   " snow:()=>{ const st=state.story; closeModal(); if(st&&!storyEnd()&&st.seen!==st.ch&&mode==='play'){ storyCheck.hold=0; storyIntro(); } },\n sagain:()=>{ const st=state.story; closeModal(); if(st&&!storyEnd()&&!storyLocked())")
# une étape ne se valide qu'une fois l'ouverture du chapitre vue
RX(" sstep:()=>{ const st=state.story, s=storyStep(); if(!s||!s.ok) return;"," sstep:()=>{ const st=state.story, s=storyStep(); if(!s||!s.ok||st.seen!==st.ch) return;")
# les textes qui annonçaient l'attente
RX("'La suite demain : <b>'+SAGA[ch+1].t+'</b>'","'La suite t’attend : <b>'+SAGA[ch+1].t+'</b>'")
RX("Un chapitre par jour au maximum, en trois étapes.","Chaque chapitre se joue en trois étapes, à ton rythme.")
RX("28 chapitres, à raison d’un par jour.","28 chapitres, à jouer à ton rythme.")
RX("t:lock?'Histoire : chapitre du jour terminé':fresh?","t:fresh?")

# --- la liste « Aujourd'hui » : terminer un chapitre dans la journée coche toujours la case Histoire,
#     mais la suite reste proposée (ligne cochée, encore cliquable, avec l'objectif du chapitre suivant) ---
RX("done:lock,ready:!lock&&(fresh||s.ok),","done:st.doneDay===today(),more:st.doneDay===today(),ready:fresh||s.ok,")
RX("function goalPick(){ const L=todayList().filter(x=>!x.done);","function goalPick(){ const L=todayList().filter(x=>!x.done||x.more);")
# la prime de fin de journée ne dépend plus de « plus aucun objectif à montrer »
RX(" const D=dailyCheck(); if(!g&&!D.fin&&!ui.panel){ D.fin=true;"," const D=dailyCheck(); if(!D.fin&&!ui.panel&&todayDone()){ D.fin=true;")
RX("""<div class="tmr">${nx?'<div><b>Histoire</b>'+nx+'</div>':''}<div><b>3 missions</b>et un nouveau coffre</div><div><b>${RUSH_MAX} coups de feu</b>à relancer</div></div><p class="center sub">Tu peux continuer à faire tourner le bistro, mais il n’y a plus d’objectif à remplir aujourd’hui.</p><p class="center"><button class="b" data-a="close">À demain</button></p>""",
   """<div class="tmr"><div><b>3 missions</b>et un nouveau coffre</div><div><b>${RUSH_MAX} coups de feu</b>à relancer</div></div><p class="center sub">${nx?'L’histoire, elle, continue quand tu veux : « '+nx+' ».':'Tu peux continuer à faire tourner le bistro, mais il n’y a plus d’objectif à remplir aujourd’hui.'}</p><p class="center"><button class="b" data-a="close">${nx?'Continuer':'À demain'}</button></p>""")
RX("""<div class="row td ${x.done?'done':x.ready?'ready':''}" ${x.p&&!x.done?`data-a="go" data-v="${x.p}"`:''}><div class="tdC">${x.done?'✓':''}</div><div class="info"><div class="t">${x.t}</div>${x.done?'':`<div class="bar">""",
   """<div class="row td ${x.more?'more'+(x.ready?' ready':''):x.done?'done':x.ready?'ready':''}" ${x.p&&(!x.done||x.more)?`data-a="go" data-v="${x.p}"`:''}><div class="tdC">${x.done?'✓':''}</div><div class="info"><div class="t">${x.t}</div>${x.done&&!x.more?'':`<div class="bar">""")
RX("""<div class="sub">${x.ready?'Prêt : touche pour récupérer':x.id==='bilan'?""","""<div class="sub">${x.more?'Chapitre du jour terminé, la suite est ouverte · ':''}${x.ready?(x.id==='story'?'touche pour continuer l’histoire':'Prêt : touche pour récupérer'):x.id==='bilan'?""")
RX("""(nd===L.length?'<p class="center sub">Tout est fait pour aujourd’hui. Reviens demain pour la suite !</p>':'')""",
   """(nd===L.length?'<p class="center sub">'+(L.some(x=>x.more)?'Tout est fait pour aujourd’hui. L’histoire, elle, continue quand tu veux.':'Tout est fait pour aujourd’hui. Reviens demain pour la suite !')+'</p>':'')""")
