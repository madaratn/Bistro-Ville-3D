# v0.99.5 : les succès. Le code vit dans src/succes.js ; ici, les branchements.
RX("try{ incTick(dt); }catch(e){ console.warn(e); }","try{ incTick(dt); }catch(e){ console.warn(e); } try{ achTick(); }catch(e){ console.warn(e); }")
RX("T.more=T.garden+T.quiz+T.daily+T.story+T.exc; return T; }","try{ T.succes=achUnclaimed(); }catch(e){ T.succes=0; } T.more=T.garden+T.quiz+T.daily+T.story+T.exc+T.succes; return T; }")
RX("const ord=['story','daily',","const ord=['succes','story','daily',")
RX("momCombo.n=simT-momCombo.t<10*gameSpeed()?momCombo.n+1:1; momCombo.t=simT;","momCombo.n=simT-momCombo.t<10*gameSpeed()?momCombo.n+1:1; momCombo.t=simT; try{ achCombo(momCombo.n); }catch(e){}")
RX("const n=d.n, sv=d.served, IX=incDayHTML(d);","const n=d.n, sv=d.served, IX=incDayHTML(d); try{ achDay(d); }catch(e){}")
# les décos exclusives : verrouillées dans l'atelier tant que le rang n'est pas atteint
RX("""return `<button class="ecard${wsel===k?' on':''}" data-wo="${k}"><span class="eim"><img src="${thumbs['wo:'+k]||''}" alt=""></span><span class="en">${W.n}</span><span class="ep${W.p>state.coins&&!(state.wOwn||[]).includes(k)?' poor':''}">${W.p&&!(state.wOwn||[]).includes(k)?W.p+' 🪙':W.uniq?'Choisir':'Gratuit'}</span></button>`;""",
   """const lk=achLocked(W); return `<button class="ecard${wsel===k?' on':''}${lk?' lock':''}${W.ach?' excl':''}" data-wo="${k}"><span class="eim"><img src="${thumbs['wo:'+k]||''}" alt=""></span><span class="en">${W.n}</span><span class="ep${W.p>state.coins&&!(state.wOwn||[]).includes(k)?' poor':''}">${lk?achLockTx(W):W.ach?'Exclusif':W.p&&!(state.wOwn||[]).includes(k)?W.p+' 🪙':W.uniq?'Choisir':'Gratuit'}</span></button>`;""")
RX(" else if(d.wo){ if(wslot){"," else if(d.wo&&d.wo!=='x'&&achLocked(WOBJ[d.wo])){ toast('Déco exclusive : elle se débloque au rang « '+ACH_RK[WOBJ[d.wo].ach][0]+' ». Va voir tes succès !'); }\n else if(d.wo){ if(wslot){")
