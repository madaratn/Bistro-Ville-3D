# v0.56 : écran-titre — Continuer, Nouvelle partie (une seule sauvegarde), Options, Multijoueur (verrouillé jusqu'à la fin de l'histoire)
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('title_patch',a[:70],c); js=js.replace(a,b)
RX(" if(!state.prolog) prologue(()=>{ if(!state.tuto) showTuto(); }); else if(!state.tuto) showTuto();"," titleScreen(!!loaded,()=>{ if(!state.prolog) prologue(()=>{ if(!state.tuto) showTuto(); }); else if(!state.tuto) showTuto(); });\n if(!state.tuto){}")
RX(" if(mode==='play'){ const n=gameSpeed();"," if(mode==='play'&&!titleOn){ const n=cine?cine.speed:gameSpeed();")
RX("function save(){ if(!state||showBak) return;","function save(){ if(!state||showBak||wiping) return;")
RX(" go:v=>{ closeModal(); openPanel(v); },"," go:v=>{ closeModal(); if(v==='quit'){ save(); location.reload(); return; } openPanel(v); },")
RX("const MORE=[","const MORE=[['quit','Menu principal','menu','#c9ced6','#8f979f','#5a626c'],")
RX("function prologue(done){",r"""let titleOn=false, wiping=false;
function titleScreen(hasSave,go){
 try{ const vb=navigator.vibrate&&navigator.vibrate.bind(navigator); if(vb) Object.defineProperty(navigator,'vibrate',{configurable:true,value:p=>state&&state.vib===false?false:vb(p)}); }catch(e){}
 let fresh=false; try{ fresh=sessionStorage.getItem('bv_new')==='1'; sessionStorage.removeItem('bv_new'); }catch(e){}
 let auto=false; try{ auto=navigator.webdriver&&!localStorage.getItem('bv_title_test'); }catch(e){}
 if(fresh||auto) return go();
 titleOn=true; const el=document.createElement('div'); el.id='title'; document.body.appendChild(el); let view='main';
 const tg=(k,on,t,s)=>`<div class="tiO"><div><b>${t}</b><span>${s}</span></div><button data-t="${k}" class="${on?'on':''}">${on?'Oui':'Non'}</button></div>`;
 const draw=()=>{ const real=hasSave&&state.prolog, fin=state.story&&state.story.v&&typeof storyEnd==='function'&&storyEnd();
  let h='<div class="tiLogo"><i>Chez</i><b>Odette</b><span>L’héritage de Mamie Odette</span></div><div class="tiBox">';
  if(view==='main'){ h+=(real?`<button class="tiB go" data-t="cont">Continuer<span>Jour ${state.day?state.day.n:1} · niveau ${state.level} · ${state.coins} pièces</span></button>`:'')+`<button class="tiB ${real?'':'go'}" data-t="new">Nouvelle partie${real?'<span>Recommence depuis le début</span>':'<span>Découvre l’histoire du bistrot</span>'}</button><button class="tiB" data-t="opt">Options</button><button class="tiB lock" data-t="multi">Multijoueur<span>${fin?'Bientôt disponible':'Se débloque à la fin de l’histoire'}</span></button>`; }
  else if(view==='opt'){ h+='<h3>Options</h3>'+tg('sound',state.sound,'Bruitages','Pièces, service, boutons')+tg('music',state.music!==false,'Musique','L’ambiance du bistrot')+tg('vib',state.vib!==false,'Vibrations','Petits retours au toucher')+tg('daynight',state.daynight!==false,'Jour et nuit','La lumière suit l’heure du jeu')+tg('lite',LITE,'Mode léger','Pour les téléphones anciens : moins de détails, plus fluide')+'<button class="tiB" data-t="back">Retour</button>'; }
  else if(view==='wipe'){ h+=`<h3>Nouvelle partie ?</h3><p>Il n’y a qu’une seule sauvegarde. Ta partie en cours (jour ${state.day?state.day.n:1}, niveau ${state.level}) sera effacée pour de bon.</p><button class="tiB red" data-t="wipe">Oui, tout recommencer</button><button class="tiB" data-t="back">Annuler</button>`; }
  else if(view==='multi'){ h+=`<h3>Multijoueur</h3><p>${fin?'Tu as terminé l’histoire : le multijoueur arrive dans une prochaine version.':'Termine d’abord l’histoire de Mamie Odette. Ensuite, tu pourras visiter les bistrots de tes amis et les inviter dans le tien.'}</p><button class="tiB" data-t="back">Retour</button>`; }
  el.innerHTML=h+'</div><div class="tiV">'+(document.title||'')+'</div>'; };
 const start=()=>{ titleOn=false; el.classList.add('out'); setTimeout(()=>el.remove(),450); go(); };
 el.addEventListener('click',e=>{ const b=e.target.closest('[data-t]'); if(!b) return; audioInit(); sfx('pop'); const t=b.dataset.t;
  if(t==='cont') return start();
  if(t==='new'){ if(hasSave&&state.prolog){ view='wipe'; return draw(); } return start(); }
  if(t==='wipe'){ wiping=true; try{ localStorage.removeItem(SAVE_KEY); sessionStorage.setItem('bv_new','1'); }catch(e){} location.reload(); return; }
  if(t==='opt'||t==='multi'){ view=t; return draw(); }
  if(t==='back'){ view='main'; return draw(); }
  if(t==='sound') state.sound=!state.sound; else if(t==='music'){ state.music=state.music===false; if(state.music) musicStart(); else musicStop(); } else if(t==='vib') state.vib=state.vib===false; else if(t==='daynight') state.daynight=state.daynight===false; else if(t==='lite'){ try{ localStorage.setItem('bv_lite',LITE?'0':'1'); }catch(e){} if(hasSave) save(); location.reload(); return; }
  if(hasSave) save(); draw(); });
 draw();
}
function prologue(done){""")
RX("Bienvenue dans Bistro Ville !","Bienvenue Chez Odette !")
