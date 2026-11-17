# v0.47 : bouton d'accélération du temps ×1 / ×2 / ×3
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('speed_patch',a[:70],c); js=js.replace(a,b)
RX(" if(mode==='play') update(dt);",""" if(mode==='play'){ const n=gameSpeed(); for(let k=0;k<n;k++) update(dt); }
 { let b=document.getElementById('sSpd'); if(!b){ b=document.createElement('button'); b.id='sSpd'; b.setAttribute('aria-label','Vitesse du jeu'); document.body.appendChild(b); b.addEventListener('click',()=>{ audioInit(); state.speed=(gameSpeed()%3)+1; sfx('pop'); toast(state.speed===1?'Vitesse normale':'Temps accéléré ×'+state.speed); b._s=0; }); }
  const s=gameSpeed(), h=mode!=='play'; if(b._s!==s||b._h!==h){ b._s=s; b._h=h; b.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5l9 7-9 7zM13 5l9 7-9 7z"/></svg><b>×'+s+'</b>'; b.className=(s>1?'on ':'')+(s>2?'max ':'')+(h?'hide':''); } }""")
RX("function update(dt){","const gameSpeed=()=>{ const s=state.speed|0; return s>=1&&s<=3?s:1; };\nfunction update(dt){",1)
