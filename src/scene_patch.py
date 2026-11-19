# v0.96 : les dialogues deviennent des scènes (bandes cinéma, portraits, texte qui s'écrit, choix)
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('scene_patch',a[:70],c); js=js.replace(a,b)
# l'ancien say() (fenêtre de dialogue) est remplacé par celui de scene.js
_a=js.index("function say(lines,title,after){ queueModal(()=>{"); _b=js.index("function storyWait(){",_a)
js=js[:_a]+js[_b:]
RX("const PANELS={",open('src/scene.js').read()+"\nconst PANELS={\n scene(){ return {title:' ',html:''}; },")
RX("function nextModal(){ const fn=modalQ.shift(); if(fn){ ui.panel='custom';",
   "function nextModal(){ const fn=modalQ.shift(); if(fn&&fn.scene){ ui.panel='scene'; $('#modal').classList.add('hide'); scenePlay(fn.scene,()=>{ ui.panel=null; try{ fn.scene.after&&fn.scene.after(); }catch(e){ console.warn(e); } if(modalQ.length) setTimeout(nextModal,150); }); return; } if(fn){ ui.panel='custom';")
# le service est en pause pendant une scène
RX(" if(mode==='play'&&!titleOn){ const n=cine?cine.speed:gameSpeed(); for(let k=0;k<n;k++) update(dt); }",
   " if(mode==='play'&&!titleOn&&!scOn){ const n=cine?cine.speed:gameSpeed(); for(let k=0;k<n;k++) update(dt); }")
# ouverture de chapitre : carte de titre, puis la scène
RX("say(C.intro,'Chapitre '+(st.ch+1)+' · '+C.t); save(); }",
   "{ const ch0=st.ch; sceneQ({lines:C.intro,title:C.t,story:1,mus:C.musI,card:{top:'Saison '+(C.s+1)+' · '+SAGA_SEASONS[C.s][0],n:'Chapitre '+(st.ch+1),t:C.t,sub:C.sub},after:()=>{ if(state.story&&state.story.ch===ch0) state.story.seen=ch0; save(); hud(); }}); } save(); }")
RX("const C=SAGA[st.ch]; st.seen=st.ch; if(st.step===0&&!st.started){ st.started=1; storySnap(); }","const C=SAGA[st.ch]; if(st.step===0&&!st.started){ st.started=1; storySnap(); }")
RX("  say(C.outro,'Chapitre '+(ch+1)+' · '+C.t);","  st.out=ch; sceneQ({lines:C.outro,title:C.t,story:1,mus:C.musO,after:()=>{ if(state.story) delete state.story.out; save(); }});")
# le prologue annonçait encore 12 000 pièces sur l'acte de propriété
RX('<div class="inDebt">Dette à reprendre<b data-cnt="12000">0</b></div>','<div class="inDebt">Dette à reprendre<b data-cnt="50000">0</b></div>')

# une scène ne se fait jamais couper : ni par une fenêtre qui se ferme, ni par une récompense qui tombe
RX("function nextModal(){ const fn=modalQ.shift(); if(fn&&fn.scene){","function nextModal(){ if(scOn) return; if(modalQ.length&&modalQ[0].scene&&typeof rush!=='undefined'&&rush){ clearTimeout(nextModal._t); nextModal._t=setTimeout(nextModal,1200); return; } const fn=modalQ.shift(); if(fn&&fn.scene){")
RX("queueModal(()=>({title:'Coup de feu terminé !',","queueFirst(()=>({title:'Coup de feu terminé !',")
RX("function queueModal(fn){","function queueFirst(fn){ modalQ.unshift(fn); if(!ui.panel) nextModal(); }\nfunction queueModal(fn){")
RX("function closeModal(){ $('#modal').classList.add('hide'); ui.panel=null;","function closeModal(){ if(scOn){ $('#modal').classList.add('hide'); return; } $('#modal').classList.add('hide'); ui.panel=null;")
RX("function rwFlush(){ if(!rwQ.length||rwS||mode!=='play'||","function rwFlush(){ if(!rwQ.length||rwS||mode!=='play'||scBusy()||")
RX("function rewardShow(o){ if(!o._now&&(rwS||mode!=='play'||","function rewardShow(o){ if(!o._now&&(rwS||mode!=='play'||scBusy()||")
