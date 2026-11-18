# v0.91 : défis express, mini-jeux, énergie qui revient plus vite
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('fun_patch',a[:70],c); js=js.replace(a,b)
RX("const PANELS={",open('src/fun.js').read()+"\nconst PANELS={")
RX("function update(dt){ momTick(dt); evTick(dt);","function update(dt){ momTick(dt); evTick(dt); try{ dxTick(); }catch(e){}")
RX("const EN_MAX=20, EN_MS=60000,","const EN_MAX=20, EN_MS=20000,")
RX("Elle revient vite : 1 par minute, et le plein à chaque nouvelle journée.","Elle revient vite (1 toutes les 20 secondes). Les défis et les mini-jeux en rendent aussi.")
RX("(20 au maximum, 1 de plus chaque minute, le plein chaque matin)","(20 au maximum, 1 de plus toutes les 20 secondes, le plein chaque matin)")
# v0.92 : les chapitres rapportent vraiment — pièces à chaque étape, et chaque page du carnet augmente tous les prix de 2 %
RX("const dishPrice=d=>(p=>Math.max(2,Math.round(p*(1+.06*mastS(d.id)+subB(d.id)))))(dishPrice0(d));","const carnetMul=()=>1+.02*((state.story&&state.story.pages)||0);\nconst dishPrice=d=>(p=>Math.max(2,Math.round(p*(1+.06*mastS(d.id)+subB(d.id))*carnetMul())))(dishPrice0(d));")
RX("const storyReward=(ch)=>{ const C=SAGA[ch]; return Math.round((100+ch*45)*(C.bonus||1)/10)*10; };","const storyReward=(ch)=>{ const C=SAGA[ch]; return Math.round(((400+ch*150)*(C.bonus||1)+state.level*60)/10)*10; };\nconst storyStepRw=(ch)=>Math.round(storyReward(ch)*.25/10)*10;")
RX("if(st.step<2){ st.step++; storySnap(); addXP(8+ch); save(); hud(); return; }","if(st.step<2){ st.step++; storySnap(); addXP(8+ch); { const r=storyStepRw(ch); earn(r); state.en.v=Math.min(EN_MAX,state.en.v+2); toast('Étape réussie : +'+r+' pièces, +2 énergie'); } save(); hud(); return; }")
RX("<p class=\"center sub\">Fin du chapitre : <b>${storyReward(st.ch)} pièces</b>, 5 d’énergie et une page du carnet${C.item?', plus la '+FURN[C.item].n+' de Belmont':''}</p>","<div class=\"sagaR\"><b>Ce que ça rapporte</b><span>Chaque étape : ${storyStepRw(st.ch)} pièces et 2 d’énergie</span><span>Fin du chapitre : ${storyReward(st.ch)} pièces, 5 d’énergie${C.item?', la '+FURN[C.item].n+' de Belmont':''}</span><span>Une page du carnet : <u>+2 % sur le prix de tous tes plats, pour toujours</u>${st.pages?' (déjà +'+2*st.pages+' %)':''}</span></div>")
RX("<p class=\"center\">+${rw} pièces · +5 d’énergie${C.item?","<p class=\"center\">+${rw} pièces · +5 d’énergie · <b>tous tes plats se vendent +2 % plus cher</b> (total +${2*(ch+1)} %)${C.item?")
RX("Le carnet de recettes de Mamie Odette. Chaque chapitre terminé te rend une page.","Le carnet de recettes de Mamie Odette. Chaque chapitre terminé te rend une page, et chaque page augmente de 2 % le prix de tous tes plats'+(n?' : tu es à <b>+'+2*n+' %</b>':'')+'.")
