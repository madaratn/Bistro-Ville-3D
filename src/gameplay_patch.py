# v0.86 : le joueur peut toujours agir — énergie rapide, coups de feu par journée de jeu, pourboires jamais perdus
import re as _re
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('gameplay_patch',a[:70],c); js=js.replace(a,b)
# énergie : 1 par minute au lieu de 1 par quart d'heure, et le plein chaque matin
RX("const EN_MAX=20, EN_MS=15*60000,","const EN_MAX=20, EN_MS=60000,")
RX("if(o&&d.night){ delete d.night; d.t=0;","if(o&&d.night){ delete d.night; d.t=0; try{ energyTick(); if(state.en&&state.en.v<EN_MAX){ state.en.v=EN_MAX; state.en.t=Date.now(); } }catch(e){}")
RX("Elle revient avec le temps (1 toutes les 15 min).","Elle revient vite : 1 par minute, et le plein à chaque nouvelle journée.")
RX("(20 au maximum, 1 de plus toutes les 15 min)","(20 au maximum, 1 de plus chaque minute, le plein chaque matin)")
# coups de feu : 3 par journée du bistrot (et plus par jour du calendrier)
n1=js.count("D.rush++"); assert n1==1,n1
js=js.replace("D.rush++","rushInc()")
n2=len(_re.findall(r"\bD\.rush\b",js)); assert n2>=6,n2
js=_re.sub(r"\bD\.rush\b","rushN()",js)
RX("const EN_MAX=20, EN_MS=60000,","const rushN=()=>dayOf().rush||0, rushInc=()=>{ const d=dayOf(); d.rush=(d.rush||0)+1; };\nconst EN_MAX=20, EN_MS=60000,")
js=js.replace("sont faits. Reviens demain !","sont faits. Ils reviennent à la prochaine journée du bistrot.")
RX("Les missions et les coups de feu reviennent chaque jour à minuit.","Les missions reviennent chaque jour à minuit. L’énergie et les coups de feu reviennent à chaque nouvelle journée du bistrot.")
# pourboires : ceux qu'on ne ramasse pas ne sont plus perdus (le serveur en récupère 60 %)
RX("moms=moms.filter(m=>m.t>0);","for(const m of moms) if(m.k==='tip'&&m.t<=0&&m.v>0){ const v=Math.max(1,Math.round(m.v*.6)); earn(v); dayAdd('tip',v); try{ floatAt(m.gx,m.gy,'+'+v,'#b9772e'); }catch(e){} } moms=moms.filter(m=>m.t>0);")
# v0.87 : on aménage et on achète sans fermer le restaurant
RX("""if(isOpen()){ wantEdit=true; queueModal(()=>({title:'Fermer pour aménager ?',html:`<p class="center">On ne déplace pas les tables au milieu du service. Ferme le restaurant : les clients présents terminent leur repas, puis tu pourras installer tes meubles et ta déco.</p><p class="center"><button class="b red" data-a="closeResto">Fermer le restaurant</button> <button class="b alt" data-a="keepOpen">Rester ouvert</button></p>`})); return; }
 if(inHouse()){ wantEdit=true; toast('Encore '+inHouse()+' clients à table. Le mode Déco s’ouvrira dès qu’ils seront partis.'); return; }
""","wantEdit=false;\n")
RX("if(layoutSig()!==editSig) freshService();","if(layoutSig()!==editSig){ const had=inHouse(); try{ for(const c of custs.slice()) if((c.st==='bill'||c.st==='eat')&&c.sitting) finishMeal(c); }catch(e){} freshService(); if(isOpen()&&had) toast('Nouvelle salle en place : les repas en cours sont encaissés et le service reprend.'); }")
# v0.89 : la salle se remplit plus vite — l'entrée laisse passer plus de groupes à la fois, et on s'installe sans attendre trop longtemps le serveur
RX("return s.size>=(rush?3:2);","return s.size>=Math.max(2,Math.ceil(seatCount()/5))+(rush?2:0);")
RX("c.hostT>(rush?4:7)||!hostOn()","c.hostT>(rush?1.5:4)||!hostOn()")
