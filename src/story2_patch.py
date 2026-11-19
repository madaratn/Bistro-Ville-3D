# v0.96 : épilogue, caractère du joueur, prénom modifiable
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('story2_patch',a[:70],c); js=js.replace(a,b)
RX("  try{ souvGain(ch); }catch(e){}\n  save(); hud(); },","  try{ souvGain(ch); }catch(e){}\n  if(last) try{ sceneQ({title:'Épilogue',lines:storyEpilogue(),mus:{mn:0,en:.5,bpm:86}}); }catch(e){ console.warn(e); }\n  save(); hud(); },")
RX("<p class=\"center\"><b>Tu as terminé « L’héritage de Mamie Odette ».</b><br>Le carnet est complet, la dette est payée, et Victor fait la plonge le lundi.</p><p class=\"sub center\">Une lettre est arrivée de Lyon… La saison 5 est en préparation.</p>`; }",
   "<p class=\"center\"><b>Tu as terminé « L’héritage de Mamie Odette ».</b><br>Le carnet est complet, la dette est payée, et Victor fait la plonge le lundi.</p><p class=\"center\"><button class=\"b sm\" data-a=\"epi\">Revoir l’épilogue</button></p><p class=\"sub center\">Une lettre est arrivée de Lyon… La saison 5 est en préparation.</p>`; }")
# le caractère du joueur, visible dans le panneau de l'histoire
RX("  if(end){ html+=`<div class=\"hero\"><img class=\"fi\" style=\"width:110px;height:110px\"",
   "  { const A=state.ax||{h:0,p:0}, n=A.h+A.p; if(n>0) html+=`<div class=\"row axR\"><div class=\"info\"><div class=\"t\">Ta façon de faire</div><div class=\"axB\"><i style=\"flex:${A.h||.001}\"></i><u style=\"flex:${A.p||.001}\"></u></div><div class=\"sub\" style=\"display:flex;justify-content:space-between\"><span>♥ Cœur ${A.h}</span><span>${A.h>A.p?'Le quartier d’abord':A.p>A.h?'La tête haute':'Les deux à la fois'}</span><span>Panache ${A.p} ★</span></div><div class=\"sub\" style=\"margin-top:4px\">Tes réponses comptent : le cœur ramène le quartier chez toi${A.h?' (+'+Math.min(8,A.h)+' points face au Belmont)':''}, le panache fait grimper les pourboires${A.p?' (+'+Math.min(12,A.p)+' %)':''}.</div></div></div>`; }\n  if(end){ html+=`<div class=\"hero\"><img class=\"fi\" style=\"width:110px;height:110px\"")
RX(" close:()=>closeModal(),"," close:()=>closeModal(),\n epi:()=>{ closeModal(); sceneQ({title:'Épilogue',lines:storyEpilogue(),mus:{mn:0,en:.5,bpm:86}}); },\n meEdit:()=>{ const was=!!state.me; closeModal(); state.me=null; sceneQ({title:'Le registre',lines:[['o',was?'Tu veux corriger le registre ? Tiens, prends mon stylo. Il bave un peu.':'Le registre du bistrot : le nom du patron sur la première page. C’est la tradition.'],['@'],['o/warm','Voilà. C’est signé, c’est officiel, {{N}}.']]}); },")
# réglages : le prénom
RX("  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">👋 Vibrations</div>","  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">✍️ Le registre du bistrot</div><div class=\"sub\">${state.me?(state.me.n?'Signé : '+state.me.n+' · ':'')+'Odette dit « '+(state.me.g==='f'?'ma grande':'mon grand')+' »':'Pas encore signé'}</div></div><button class=\"b sm alt\" data-a=\"meEdit\">${state.me?'Changer':'Signer'}</button></div>`;\n  html+=`<div class=\"row\"><div class=\"info\"><div class=\"t\">👋 Vibrations</div>")
# cohérence : la dette fait cinquante mille pièces partout, et Odette s'adresse au joueur par son prénom
RX("« Trente mille pièces… Je n’aurais jamais cru voir ce jour.","« Cinquante mille pièces… Je n’aurais jamais cru voir ce jour.")
RX("Je suis fière de toi, mon grand. »","Je suis fière de toi, ${meN()||(meG()?'ma grande':'mon grand')}. »")
RX("C’est déjà ça, mon grand. Demain on fera mieux.","C’est déjà ça, {{N}}. Demain on fera mieux.")

# accords : « 1 chapitre terminé », « 1 page retrouvée »
RX("<div class=\"sub\">${end?SAGA.length:st.ch} chapitres terminés sur ${SAGA.length} · ${st.pages||0} pages du carnet retrouvées</div>",
   "<div class=\"sub\">${(n=>n+' chapitre'+(n>1?'s':'')+' terminé'+(n>1?'s':''))(end?SAGA.length:st.ch)} sur ${SAGA.length} · ${(n=>n+' page'+(n>1?'s':'')+' du carnet retrouvée'+(n>1?'s':''))(st.pages||0)}</div>")

# les joueurs qui reprennent une ancienne partie : Odette présente les nouveautés une fois, et fait signer le registre
RX("function storyCheck(){\n","""function storyNews(){ if(state.n96===undefined){ const s0=state.story; state.n96=(s0&&s0.v&&((s0.pages||0)>0||s0.seen===s0.ch))?0:1; }
 if(state.n97===undefined){ const s0=state.story; state.n97=(s0&&s0.v&&((s0.pages||0)>0||s0.seen===s0.ch))?0:1; }
 if((state.n96!==0&&state.n97!==0)||warming||!state.tuto||mode!=='play'||ui.panel||modalQ.length||scBusy()||(typeof visit!=='undefined'&&visit.on)||(typeof rush!=='undefined'&&rush)||(typeof titleOn!=='undefined'&&titleOn)) return;
 if(state.n96!==0){ state.n97=1; sceneQ({title:'Le bistrot s’est fait beau',lines:[['o/grin','Regarde-moi ça ! On a tous refait notre portrait. Tu as vu ? Je cligne des yeux, maintenant. Et je te parle pour de vrai.'],
  ['s','Nouvelles tenues, nouvelles coiffures : toute l’équipe est passée chez le tailleur, Chef. Les clients aussi, on dirait.'],
  ['o/warm','La salle a suivi : le carrelage brille, les ombres sont plus douces. Si ton téléphone peine, tout se règle dans Plus, puis Réglages.']]}); return; }
 state.n96=1;
 sceneQ({title:'Du nouveau au bistrot',lines:[['o/grin','Ah, te voilà ! J’ai remis de l’ordre dans mes vieux papiers, et j’ai retrouvé trois habitudes de la maison.'],
  ['o','L’ardoise : chaque matin, on y écrit le plat du jour. Il part deux fois plus vite, et il se paie mieux. Tu la trouveras dans ton menu.'],
  ['o','L’élan : tant que tes clients repartent contents, les pourboires grimpent. Un seul qui s’en va fâché, et tout retombe à zéro.'],
  ['o','Et le soir, je note le service sur trois étoiles : l’accueil, le régal, l’élan. Trois étoiles, et on dort comme un loir.'],
  ['o/warm','Dernière chose. Dans le quartier, les gens vont te demander ton avis, et parfois te passer commande. Réponds comme tu le sens : ils s’en souviendront.'],
  ['o','Ah, et le registre ! Tu ne l’as jamais signé. Le nom du patron sur la première page, c’est la tradition.',()=>!state.me],['@'],['o/warm','Voilà, {{N}}. Maintenant, c’est officiel.']]}); }
function storyCheck(){ try{ storyNews(); }catch(e){ console.warn(e); }
 { const s9=state.story; if(s9&&s9.out!==undefined&&!warming&&state.tuto&&mode==='play'&&!ui.panel&&!modalQ.length&&!scBusy()&&!(typeof visit!=='undefined'&&visit.on)&&!(typeof rush!=='undefined'&&rush)){ const C9=SAGA[s9.out]; if(!C9) delete s9.out; else sceneQ({lines:C9.outro,title:C9.t,story:1,mus:C9.musO,after:()=>{ if(state.story) delete state.story.out; save(); }}); } }
""")
