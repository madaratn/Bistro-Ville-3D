# v0.96 : élan, étoiles du service, ardoise du jour, commandes des voisins, pièces qui volent, invités et duel de l'histoire
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('flow_patch',a[:70],c); js=js.replace(a,b)
RX("const PANELS={",open('src/flow.js').read()+r"""
const PANELS={
 ardoise(am){ const cur=pdjId(), now=menuNow(); let html=(am===1?`<p class="center" style="margin:0 0 4px"><b>Jour ${dayOf().n} · 8 h.</b> Que met-on à l’ardoise aujourd’hui ?</p>`:'')+`<p class="sub center">Le plat du jour est commandé deux fois plus souvent et payé plus cher. Pense à celui dont tu veux monter la maîtrise, ou à la commande d’un voisin.</p>`;
  if(state.cmd) html+=cmdHTML();
  html+=state.menu.slice().sort((a,b)=>(b===cur)-(a===cur)||(state.cmd?(b===state.cmd.dish)-(a===state.cmd.dish):0)).map(id=>{ const d=DISHM[id], on=cur===id&&pdjToday(), was=cur===id&&!on; return `<div class="row ${on?'pdjOn':''}"><div class="emo">${foodIcon(d.e)}</div><div class="info"><div class="t">${d.n}${state.cmd&&state.cmd.dish===id?' <span class="tag">commande</span>':''}</div><div class="sub">${svcBadges(d)}</div><div class="sub mnP"><b>${dishPrice(d)}</b> → <b>${pdjPrice(d)}</b> 🪙${now.includes(id)?'':' · pas servi à cette heure-ci'}</div>${mastRow(id)}</div><button class="b sm ${on?'alt':'green'}" data-a="pdj" data-v="${id}" ${on?'disabled':''}>${on?'À l’ardoise':was?'Garder':'Choisir'}</button></div>`; }).join('');
  return {title:'L’ardoise du jour',html}; },""")
RX("PICON={","PICON={ardoise:['menu','#ffd98a','#e5a53a','#a8691a'],")
RX(" close:()=>closeModal(),"," close:()=>closeModal(),\n pdj:v=>{ if(!state.menu.includes(v)) return; state.pdj={id:v,n:dayOf().n}; sfx('pop'); scSfx('pick'); closeModal(); setTimeout(()=>{ if($('#modal').classList.contains('hide')&&!scOn) toast('À l’ardoise aujourd’hui : '+DISHM[v].n+'.'); },320); save(); hud(); },")
# --- le repas payé : prix du plat du jour, pourboire multiplié par l'élan, pièces qui volent
RX("const d=c.order?DISHM[c.order.dish]:null, L=d?lvl(d.id):3, price=(d?dishPrice(d):0)+drinkPay(c);","const d=c.order?DISHM[c.order.dish]:null, L=d?lvl(d.id):3, price=(d?(pdjIs(d)?pdjPrice(d):dishPrice(d)):0)+drinkPay(c);")
RX("const tip=sat>70?Math.round(price*(sat-70)/100*projTip()*souvTip()):0;","const tip=sat>70?Math.round(price*(sat-70)/100*projTip()*souvTip()*elMul()*axTip()):0;")
RX(" earn(price+tip); if(!warming){ const dp=drinkPay(c);"," earn(price+tip); try{ elMeal(c,sat); if(!warming){ if(d&&pdjIs(d)) dailyAdd('pdj',1); cmdMeal(d); coinFly(c.fx,c.fy,price+tip); } }catch(e){ console.warn(e); } if(!warming){ const dp=drinkPay(c);")
RX("function angry(c){ if(rush&&!warming){ rush.combo=0; rush.lost++; rushHud(); }","function angry(c){ try{ if(!warming&&!cine){ const d=dayOf(); d.lost=(d.lost||0)+1; elBreak(c); } }catch(e){} if(rush&&!warming){ rush.combo=0; rush.lost++; rushHud(); }")
RX("function pickDish(c){ const m=menuNow(); if(m.length) return pick(m);","function pickDish(c){ const m=menuNow(); if(m.length){ const p=pdjId(); if(p&&m.includes(p)&&Math.random()<PDJ_P) return p; return pick(m); }")
# --- bilan du soir : les étoiles du service
RX("function dayEnd(){ dailyAdd('bilan',1); state.open=false; const F=dayFigures(), d=F.d;","function dayEnd(){ dailyAdd('bilan',1); state.open=false; let SR=null; try{ SR=starsEnd(dayOf()); cmdDay(dayOf().n); }catch(e){ console.warn(e); } const F=dayFigures(), d=F.d;")
RX("net,served:d.served});","net,served:d.served,st:SR?SR.n:-1});")
RX("queueModal(()=>({title:'Bilan du jour '+n,html:`<div class=\"bilan\">","queueModal(()=>({title:'Bilan du jour '+n,html:`${SR?starsHTML(SR):''}<div class=\"bilan\">")
RX("<div class=\"dlgT\" style=\"text-align:center\">${msg}</div>","<div class=\"dlgT\" style=\"text-align:center\">${scT(msg)}</div>")
RX("<span>Jour ${h.n} · ${h.served} clients · recettes","<span>Jour ${h.n}${h.st>=0?' · '+'★'.repeat(h.st)+'☆'.repeat(3-h.st):''} · ${h.served} clients · recettes")
RX("if(o&&d.night){ delete d.night; d.t=0;","if(o&&d.night){ delete d.night; d.t=0; let PM=false; try{ PM=pdjMorning(); }catch(e){}")
RX("setTimeout(()=>toast('Jour '+d.n+' · 8 h. Bonne journée !'),900); } }","if(!PM) setTimeout(()=>toast('Jour '+d.n+' · 8 h. Bonne journée !'),900); } }")
# --- interface : compteur de pièces qui défile, pastille d'élan, ardoise dans la carte et dans « Aujourd'hui »
RX(" $('#coins').textContent=fmt(state.coins); $('#lvl').textContent=state.level;"," coinTick(0); try{ elDraw(); }catch(e){} $('#lvl').textContent=state.level;")
RX(" updFx(dt);\n render();\n acc+=dt;"," updFx(dt);\n try{ flowF++; coinTick(dt); }catch(e){}\n render();\n acc+=dt;")
RX("   html+=`<p class=\"sub\">Ta carte : ${state.menu.length}/${menuSlots()} plats.</p>`;","   html+=pdjHTML();\n   html+=`<p class=\"sub\">Ta carte : ${state.menu.length}/${menuSlots()} plats.</p>`;")
RX(" D.m.forEach(m=>{ const M=MISSIONS[m.i], v=Math.min(M.n,D.c[M.k]||0); L.push({id:'m'+m.i,",""" if(state.cmd){ const C=state.cmd; L.push({id:'cmd',t:'Commande de '+NB[C.k].s+' : '+DISHM[C.dish].n,done:false,ready:false,v:C.got,n:C.n,p:'habit'}); }
 if(state.tuto&&state.menu.length>1&&dayOf().n>1) L.push({id:'pdj',t:'Écrire le plat du jour sur l’ardoise',done:pdjToday(),ready:false,v:0,n:1,p:'ardoise'});
 D.m.forEach(m=>{ const M=MISSIONS[m.i], v=Math.min(M.n,D.c[M.k]||0); L.push({id:'m'+m.i,""")
# --- histoire : nouveaux objectifs (invité, élan, dette), répliques d'étape à plusieurs voix, duel, part du quartier
RX("function storyVal(g){ const st=state.story; if(g.k==='rating')","function storyVal(g){ const st=state.story; if(g.k==='guest') return st.gs||0; if(g.k==='elan') return st.eb||0; if(g.k==='debt') return Math.max(0,DEBT0-debtLeft()); if(g.k==='rating')")
RX("function storySnap(){ const st=state.story; st.rb=0;","function storySnap(){ const st=state.story; st.rb=0; st.gs=0; st.eb=0; st.gT=0;")
RX("  say([s.S.say],'Étape '+(st.step+1)+' réussie');\n  if(st.step<2){ st.step++; storySnap(); addXP(8+ch); { const r=storyStepRw(ch); earn(r); state.en.v=Math.min(EN_MAX,state.en.v+2); toast('Étape réussie : +'+r+' pièces, +2 énergie'); } save(); hud(); return; }",
   "  { const SY=Array.isArray(s.S.say[0])?s.S.say:[s.S.say], TT='Étape '+(st.step+1)+' réussie';\n  if(st.step<2){ const r=storyStepRw(ch); say(SY,TT,null,['+ '+fmt(r)+' pièces · + 2 énergie']); st.step++; storySnap(); addXP(8+ch); earn(r); state.en.v=Math.min(EN_MAX,state.en.v+2); save(); hud(); return; }\n  say(SY,TT); }")
RX("<div class=\"sub\">${S.g.k==='rating'?String(v).replace('.',','):Math.min(v,S.g.n)} / ${String(S.g.n).replace('.',',')}</div>",
   "<div class=\"sub\">${S.g.k==='guest'?(NB[C.guest]?NB[C.guest].n+(custs.some(c=>c.nb===C.guest&&!c.dead)?' est dans la salle : soigne-le':isOpen()?' arrive d’un instant à l’autre':' viendra dès que le bistrot sera ouvert'):''):S.g.k==='rating'?String(v).replace('.',',')+' / '+String(S.g.n).replace('.',','):fmt(Math.min(v,S.g.n))+' / '+fmt(S.g.n)}</div>")
RX("function storyShare(){ const st=state.story; if(!belOpen()) return 100; return storyEnd()?88:Math.round(14+(st.ch-BEL_CH)*3.1); }","function storyShare(){ const st=state.story; if(!belOpen()) return 100; const hh=Math.min(8,(state.ax&&state.ax.h)||0); return Math.min(94,(storyEnd()?88:Math.round(14+(st.ch-BEL_CH)*3.1))+hh); }")
RX("rush={t:RUSH_T,combo:0,best:0,score:0,served:0,lost:0,acts:0}; spawnT=0;","rush={t:RUSH_T,combo:0,best:0,score:0,served:0,lost:0,acts:0}; try{ duelStart(); }catch(e){} spawnT=0;")
RX("<span>${rush.score} pts</span>`; } }","<span>${rush.score} pts</span>${duelHud()}`; } }")
RX("const R=rush; rush=null; rushHud(); const medal=","const R=rush; rush=null; rushHud(); let DU=''; try{ DU=duelEnd(R); }catch(e){ console.warn(e); } const medal=")
RX("<br>Médaille ${medal[1]}</p>","<br>Médaille ${medal[1]}</p>${DU}")
