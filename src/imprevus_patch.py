# v0.99.3 : les imprévus. Le code vit dans src/imprevus.js ; ici, les branchements dans la boucle du jeu.

# la boucle : les imprévus avancent avant le personnel (le cuisinier qui se bat avec sa poêle n'avance plus sa cuisson)
RX("function update(dt){ momTick(dt); evTick(dt);","function update(dt){ momTick(dt); try{ incTick(dt); }catch(e){ console.warn(e); } evTick(dt);")
# la patience des clients et l'affluence montent avec la difficulté
RX("function patRate(){ return (2.6-rating*.25)*.6; }","function patRate(){ return (2.6-rating*.25)*.6*incPatMul(); }")
RX("c.pat-=dt*(c.sitting?(c.wspot&&c.wspot.inside?.5:.8):1.4);","c.pat-=dt*(c.sitting?(c.wspot&&c.wspot.inside?.5:.8):1.4)*incPatMul();")
RX("spawnT=rnd(.8,1.3)*11/(.3+rating*.46)/projFlow();","spawnT=rnd(.8,1.3)*11/(.3+rating*.46)/projFlow()/incFlowMul();")
# repas payé, client fâché : on compte pour la médaille du service
RX("earn(price+tip); try{ elMeal(c,sat);","earn(price+tip); try{ incMeal(c,price,sat); }catch(e){ console.warn(e); } try{ elMeal(c,sat);")
RX("function angry(c){ try{ if(!warming&&!cine){ const d=dayOf(); d.lost=(d.lost||0)+1; elBreak(c); } }catch(e){}","function angry(c){ try{ if(!warming&&!cine){ const d=dayOf(); d.lost=(d.lost||0)+1; elBreak(c); incLost(c); } }catch(e){}")
# un frigo en panne ne sert plus de boissons
RX("const r=bestPath(a,state.furn.filter(f=>kindOf(f)==='fridge'));","const r=bestPath(a,state.furn.filter(f=>kindOf(f)==='fridge'&&!incBroken.has(f.id)));")
# salle réaménagée : on repart sans imprévu en cours
RX("function freshService(){","function freshService(){ try{ incClear(); }catch(e){}")
# le bilan du soir : imprévus réglés et médailles
RX("const n=d.n, sv=d.served;","const n=d.n, sv=d.served, IX=incDayHTML(d);")
RX('<div class="bl"><span>Clients servis</span><b>${sv}</b></div>','<div class="bl"><span>Clients servis</span><b>${sv}</b></div>${IX}')
# la bulle « cuisson parfaite » (un bonus) ne ressemble plus à la flamme d'un imprévu
RX("""cook:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 5.500 5 11a5 5 0 0 1-10 0c0-2 1-3.500 2-4.500.300 2 1 3 2 3.500C10.500 9 11 5 12 2z"/></svg>'""",
   """cook:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2l2.300 6.400 6.700 1.600-6.700 2.100L11 18.700l-2.300-6.600L2 10l6.700-1.600z"/><path d="M19 14.500l1 2.700 2.600.8-2.600.9-1 2.700-.9-2.700-2.600-.9 2.600-.8z"/></svg>'""")
# missions du jour : régler des imprévus, décrocher l'or (jamais tirées en mode détente)
RX("{k:'help',n:8,t:'Donne 8 coups de main',e:'👆',r:160}","{k:'help',n:8,t:'Donne 8 coups de main',e:'👆',r:160},{k:'inc',n:6,t:'Règle 6 imprévus',e:'🧯',r:180},{k:'inc',n:12,t:'Règle 12 imprévus',e:'🧯',r:320},{k:'gold',n:1,t:'Décroche une médaille d’or en service',e:'🥇',r:260}")
RX("if(keys.has(MISSIONS[i].k)) continue;","if(keys.has(MISSIONS[i].k)) continue; if((MISSIONS[i].k==='inc'||MISSIONS[i].k==='gold')&&incDiff()===0) continue;")
# réglages : la difficulté, et une aide à jour
RX("html+=optGameHTML(); html+=`<h3>Comment jouer</h3>","html+=optGameHTML(); html+=incDiffHTML(); html+=`<h3>Comment jouer</h3>")
RX("Ton équipe s’en occupe, mais tu peux donner un coup de main (1 d’énergie) :","Ton équipe s’en occupe, mais les imprévus (une poêle qui flambe, une panne, une flaque, un client qui se plaint ou qui file sans payer) n’attendent que toi : touche leur bulle avant que son cercle se vide. Chacun réglé te rend 1 d’énergie, et à chaque fin de service une médaille juge ton accueil, tes réflexes et le régal des clients. Tu peux aussi donner un coup de main (1 d’énergie) :")
RX("{q:'#sEn',t:'Ton énergie. Elle sert aux coups de feu et aux coups de main. Elle revient toute seule (1 toutes les 20 secondes) et fait le plein chaque matin.'}","{q:'#sEn',t:'Ton énergie. Elle sert aux coups de feu et aux coups de main. Elle revient toute seule (1 toutes les 20 secondes), chaque imprévu réglé en rend 1, et elle fait le plein chaque matin.'}")
# une machine en panne n'est pas une machine qui manque : le conseiller se tait tant qu'elle n'est pas réparée
RX("if(advE.b>.55) say('La cuisine attend son tour","if(advE.b>.55&&!incBroken.size&&!incSmoke.length) say('La cuisine attend son tour")
