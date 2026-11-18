# v0.93 : le vaisselier d'Odette — un souvenir du quartier s'y pose à la fin de chaque chapitre
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('souv_patch',a[:70],c); js=js.replace(a,b)
RX(" plant:{n:'Plante verte',cat:'Déco',p:60,d:2,u:1,kind:'plant'},"," plant:{n:'Plante verte',cat:'Déco',p:60,d:2,u:1,kind:'plant'},\n odette:{n:'Vaisselier d’Odette',cat:'Déco',p:0,d:12,u:1,kind:'decor',m:'odette',own:1},")
RX("FURN[k].cat === etab".replace(' === ','===')+"&&stOK(FURN[k])","FURN[k].cat===etab&&stOK(FURN[k])&&(!FURN[k].own||(state.store[k]||0)>0)")
RX("else if(a==='sell') removeFurn(sel,'sell');","else if(a==='sell'){ if(FURN[sel.t].own){ sfx('bad'); toast('Le vaisselier d’Odette ne se vend pas. Tu peux le ranger dans ta réserve.'); } else removeFurn(sel,'sell'); }")
RX("const PANELS={",open('src/souv.js').read()+r"""
const PANELS={
 souvenirs(){ const n=souvN(), on=souvPlaced(); let html=`<div class="souvH">${souvSvg()}</div><p class="sub center">À chaque chapitre terminé, un souvenir du quartier se pose dans le vaisselier d’Odette. ${!n&&!on?'Mamie Odette te confiera le meuble à la fin du premier chapitre.':on?'Tes pourboires : <b>+'+2*n+' %</b>.':'<b>Place le meuble dans ta salle</b> (Déco) pour toucher le bonus de pourboires.'}</p>`;
  html+=SOUV.slice(0,n).map((S,i)=>`<div class="row carP"><div class="carN" style="background:${S[1]};color:${['#ffffff','#fbf7ee','#fff1d0','#cfd5db'].includes(S[1])?'#5a3520':'#fff'}">${i+1}</div><div class="info"><div class="t">${S[2]}</div><div class="sub carQ">${S[3]}</div></div></div>`).join('');
  if(n<SOUV.length) html+=`<div class="row carP lock"><div class="carN">${n+1}</div><div class="info"><div class="t">Étagère vide</div><div class="sub">Le prochain souvenir arrive à la fin du chapitre ${n+1}.${SOUV.length-n>1?' Encore '+(SOUV.length-n)+' à découvrir, un par chapitre.':''}</div></div></div>`;
  html+='<p class="center"><button class="b alt sm" data-a="sback">Retour à l’histoire</button></p>'; return {title:'Les souvenirs d’Odette',html}; },""")
RX(" close:()=>closeModal(),"," close:()=>closeModal(),\n souvopen:()=>{ closeModal(); openPanel('souvenirs'); },")
RX("PICON={","PICON={souvenirs:['star','#e9cc78','#c9772e','#7a4a2a'],")
RX("<p class=\"center sub\">${last?'Tu as terminé l’histoire. Bravo, et merci d’avoir pris ton temps.':'La suite demain : <b>'+SAGA[ch+1].t+'</b>'}</p><p class=\"center\"><button class=\"b\" data-a=\"close\">Continuer</button></p>`}));\n  save(); hud(); },","${souvCard(ch)}<p class=\"center sub\">${last?'Tu as terminé l’histoire. Bravo, et merci d’avoir pris ton temps.':'La suite demain : <b>'+SAGA[ch+1].t+'</b>'}</p><p class=\"center\"><button class=\"b\" data-a=\"close\">Continuer</button></p>`}));\n  try{ souvGain(ch); }catch(e){}\n  save(); hud(); },")
RX(" sideInit(); energyTick(); storyCheck();"," sideInit(); energyTick(); storyCheck(); try{ souvCheck(); }catch(e){ console.warn(e); }")
RX("*projTip()):0;","*projTip()*souvTip()):0;")
RX("<button class=\"b alt sm\" data-a=\"carnet\">Le carnet (${st.pages||0}/${SAGA.length})</button>","<button class=\"b alt sm\" data-a=\"carnet\">Le carnet (${st.pages||0}/${SAGA.length})</button> <button class=\"b alt sm\" data-a=\"souvopen\">Les souvenirs</button>")
RX("<span>Une page du carnet : <u>","<span>Un souvenir du quartier pour le vaisselier d’Odette : <u>+2 % de pourboires</u></span><span>Une page du carnet : <u>")
