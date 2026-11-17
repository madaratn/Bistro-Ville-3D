# v0.17 : interactions plus naturelles, écran allégé
RP("function updCust(c,dt){\n c.moving=false;","function updCust(c,dt){\n c.moving=false; if(!c.grp){ c.talk=false; c.lookAt=null; }")
RP("  if(j.s==='do'){ j.tt-=dt; for(const c of j.cs){ c.lookAt=a; c.hand=0; }",
   "  if(j.s==='do'){ j.tt-=dt; for(const c of j.cs){ c.lookAt=a; c.hand=0; }\n   { const ci=j.cs[Math.min(j.cs.length-1,Math.floor((1-j.tt/j.T)*j.cs.length))]; if(ci){ a.rotT=Math.atan2(ci.fx-a.fx,ci.fy-a.fy); ci.talk=want==='order'; } }")
RP("function serve(o){ const c=o.c; o.st='served';","function serve(o){ const c=o.c; o.st='served'; c.thankT=1.1;")
RP("function serveDrink(d){ const c=d.c; d.st='served';","function serveDrink(d){ const c=d.c; d.st='served'; c.thankT=1.1;")
RP("if(Math.random()<.45){ g.spk.say=pick(TOPICS); g.spk.sayT=1.7; }","if(Math.random()<.18){ g.spk.say=pick(TOPICS); g.spk.sayT=1.7; }")
RP("seated.forEach(m=>m.hop=.35); floatAt(g.spk.fx,g.spk.fy,'😂'); }","}")
RP("st:'wait',tNo:tableNo(c.table)};","st:'wait',tNo:tableNo(c.table),t0:simT};")
# garde-fou : personne n'attend l'addition indéfiniment
RP("   if(!c.billBy&&(c.billT>16||!hostOn())) finishMeal(c);","   if(!c.billBy&&(c.billT>16||!hostOn())) finishMeal(c);\n   else if(c.billT>30){ c.billBy=null; finishMeal(c); }")
