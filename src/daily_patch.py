# v0.31 : énergie, coup de feu, missions du jour
RP("function bfs(sx,sy,isGoal,goalPass,zone){", r"""// ---------- énergie : chaque coup de main en coûte 1, elle se recharge avec le temps ----------
const EN_MAX=20, EN_MS=15*60000, RUSH_MAX=3, RUSH_COST=4, RUSH_T=120;
let rush=null;
function energyTick(){ const e=state.en||(state.en={v:EN_MAX,t:Date.now()}), now=Date.now(); if(e.v>=EN_MAX){ e.t=now; return; } while(now-e.t>=EN_MS&&e.v<EN_MAX){ e.v++; e.t+=EN_MS; } if(e.v>=EN_MAX) e.t=now; }
function energyNext(){ const e=state.en; return e.v>=EN_MAX?0:Math.max(0,EN_MS-(Date.now()-e.t)); }
// un coup de main du joueur : gratuit pendant le coup de feu (et il fait monter la série), 1 ⚡ sinon
function spendHelp(){
 if(rush){ rush.combo++; rush.best=Math.max(rush.best,rush.combo); rush.score+=10+Math.min(rush.combo,10)*2; rush.acts++; dailyAdd('help',1); rushHud(); return true; }
 energyTick(); if(state.en.v<=0){ toast('Plus d’énergie ⚡ Elle revient avec le temps (1 toutes les 15 min).'); sfx('bad'); return false; }
 state.en.v--; dailyAdd('help',1); hud(); return true;
}
// ---------- missions du jour ----------
const MISSIONS=[
 {k:'served',n:12,t:'Sers 12 clients',e:'🍽️',r:150},{k:'served',n:20,t:'Sers 20 clients',e:'🍽️',r:260},
 {k:'help',n:8,t:'Donne 8 coups de main',e:'👆',r:160},{k:'help',n:15,t:'Donne 15 coups de main',e:'👆',r:280},
 {k:'rush',n:150,t:'Fais 150 points en coup de feu',e:'🔥',r:220},{k:'rush',n:280,t:'Fais 280 points en coup de feu',e:'🔥',r:380},
 {k:'drinks',n:5,t:'Sers 5 boissons',e:'🥤',r:140},{k:'harvest',n:2,t:'Récolte 2 fois au potager',e:'🌱',r:140},{k:'earned',n:400,t:'Gagne 400 pièces',e:'🪙',r:180},{k:'happy',n:6,t:'Rends 6 clients ravis 😍',e:'😍',r:200}];
function dailyCheck(){
 const d=today(); let D=state.daily;
 if(!D||D.day!==d){ const prev=D; const r=seeded(d.split('-').reduce((a,b)=>a*37+ +b,7)); const pool=MISSIONS.map((m,i)=>i), pick3=[]; const keys=new Set();
  while(pick3.length<3&&pool.length){ const i=pool.splice(Math.floor(r()*pool.length),1)[0]; if(keys.has(MISSIONS[i].k)) continue; keys.add(MISSIONS[i].k); pick3.push(i); }
  const yest=(()=>{ const t=new Date(); t.setDate(t.getDate()-1); return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate(); })();
  state.daily=D={day:d,rush:0,c:{},m:pick3.map(i=>({i,done:false})),chest:false,streak:prev&&prev.chest&&prev.day===yest?(prev.streak||0):0}; }
 return D;
}
function dailyAdd(k,n,max){ const D=dailyCheck(); D.c[k]=max?Math.max(D.c[k]||0,n):(D.c[k]||0)+n; }
function dailyReady(){ const D=dailyCheck(); return D.m.filter(m=>!m.done&&(D.c[MISSIONS[m.i].k]||0)>=MISSIONS[m.i].n).length+(!D.chest&&D.m.every(m=>m.done)?1:0); }
// ---------- coup de feu : 2 minutes de service de pointe où le joueur aide en salle ----------
function startRush(){
 const D=dailyCheck(); energyTick();
 if(rush||mode!=='play') return; if(D.rush>=RUSH_MAX) return toast('Tes 3 coups de feu du jour sont faits. Reviens demain !');
 if(state.en.v<RUSH_COST) return toast('Il faut '+RUSH_COST+' ⚡ pour lancer un coup de feu.');
 state.en.v-=RUSH_COST; D.rush++; rush={t:RUSH_T,combo:0,best:0,score:0,served:0,lost:0,acts:0}; spawnT=0; closeModal(); sfx('level'); toast('🔥 Coup de feu ! Accueille, prends les commandes, sers et encaisse en touchant les clients.'); rushHud(); hud();
}
function rushHud(){ const el=$('#rushbar'); if(!el) return; el.classList.toggle('hide',!rush); if(rush){ const s=Math.max(0,Math.ceil(rush.t)); el.innerHTML=`<b>🔥 ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}</b><span>série ×${rush.combo}</span><span>${rush.score} pts</span>`; } }
function endRush(){
 const R=rush; rush=null; rushHud(); const medal=R.score>=280?['🥇','Or',40]:R.score>=150?['🥈','Argent',20]:['🥉','Bronze',10], gain=Math.round(R.score*1.2);
 earn(gain); addXP(medal[2]); dailyAdd('rush',R.score,true); sfx('level');
 queueModal(()=>({title:'Coup de feu terminé !',html:`<div class="hero">${medal[0]}</div><p class="center"><b style="font-size:26px">${R.score} points</b><br>Médaille ${medal[1]}</p>
  <div class="row"><div class="info">👆 Coups de main : <b>${R.acts}</b><br>🔗 Meilleure série : <b>×${R.best}</b><br>🍽️ Clients servis : <b>${R.served}</b>${R.lost?`<br>😠 Clients partis fâchés : <b>${R.lost}</b>`:''}</div></div>
  <p class="center">Récompense : <b>+${gain} 🪙</b> et <b>+${medal[2]} XP</b></p><p class="center"><button class="b" data-a="close">Super</button></p>`}));
 hud();
}
function bfs(sx,sy,isGoal,goalPass,zone){""")
RP("function update(dt){\n simT+=dt; buildTraffic();","function update(dt){\n simT+=dt; buildTraffic();\n if(rush&&!warming){ rush.t-=dt; if(rush.t<=0) endRush(); else if(Math.floor(rush.t+dt)!==Math.floor(rush.t)) rushHud(); }")
RP("\n spawnT-=dt;\n","\n spawnT-=dt*(rush?3:1);\n")
RP("function queueCap(){ return Math.max(1,Math.min(4,","function queueCap(){ return (rush?2:0)+Math.max(1,Math.min(4,")
RP("function angry(c){","function angry(c){ if(rush&&!warming){ rush.combo=0; rush.lost++; rushHud(); }")
RP("addSat(sat); state.served++;","addSat(sat); state.served++; if(!warming){ dailyAdd('served',1); dailyAdd('earned',price+tip); if(sat>80) dailyAdd('happy',1); if(rush){ rush.served++; rush.score+=5; } }")
RP("function serveDrink(d){ const c=d.c; d.st='served'; c.thankT=1.1;","function serveDrink(d){ const c=d.c; d.st='served'; c.thankT=1.1; if(!warming) dailyAdd('drinks',1);")
RP(" harvest:i=>{ i=+i; const p=state.garden[i]; if(!p) return;"," harvest:i=>{ i=+i; const p=state.garden[i]; if(!p) return; dailyAdd('harvest',1);")
RP("function enterEdit(tab){ repairNotice();","function enterEdit(tab){ if(rush){ toast('Termine d’abord le coup de feu 🔥'); return; } repairNotice();")
# l'avance rapide de l'ouverture ne compte pas
RP("function warmStart(n){","let warming=false;\nfunction warmStart(n){ warming=true; try{ warmStart0(n); } finally{ warming=false; } }\nfunction warmStart0(n){")
# panneau « Aujourd'hui »
RP("const PANELS={",r"""const PANELS={
 daily(){
  const D=dailyCheck(); energyTick(); const e=state.en, nx=energyNext();
  let html=`<div class="row"><div class="emo">⚡</div><div class="info"><div class="t">Énergie ${e.v}/${EN_MAX}</div><div class="bar" style="background:#eee"><i style="width:${e.v/EN_MAX*100}%;background:#f2b33d"></i></div><div class="sub">${e.v>=EN_MAX?'Pleine. Chaque coup de main en salle coûte 1 ⚡.':'+1 dans '+fmtT(nx/1000)+' · chaque coup de main coûte 1 ⚡'}</div></div></div>`;
  html+=`<div class="row"><div class="emo">🔥</div><div class="info"><div class="t">Coup de feu <span class="tag">${RUSH_MAX-D.rush}/${RUSH_MAX} aujourd'hui</span></div><div class="sub">2 minutes de rush : les clients affluent, tes coups de main sont gratuits et font grimper ta série. Coûte ${RUSH_COST} ⚡.</div></div><button class="b sm" data-a="rush" ${D.rush>=RUSH_MAX||e.v<RUSH_COST||rush?'disabled':''}>Lancer</button></div>`;
  html+=`<h3>Missions du jour</h3>`;
  html+=D.m.map((m,ix)=>{ const M2=MISSIONS[m.i], v=Math.min(M2.n,D.c[M2.k]||0), ok=v>=M2.n;
   return `<div class="row" ${m.done?'style="opacity:.55"':''}><div class="emo">${M2.e}</div><div class="info"><div class="t">${M2.t}</div><div class="bar" style="background:#eee"><i style="width:${v/M2.n*100}%;background:${ok?'#3fb37a':'#ffb347'}"></i></div><div class="sub">${v}/${M2.n} · récompense ${M2.r} 🪙 + 3 ⚡</div></div>${m.done?'<b>✔</b>':`<button class="b sm green" data-a="claim" data-v="${ix}" ${ok?'':'disabled'}>Récupérer</button>`}</div>`; }).join('');
  const all=D.m.every(m=>m.done);
  html+=`<div class="row" ${D.chest?'style="opacity:.55"':''}><div class="emo">🎁</div><div class="info"><div class="t">Coffre du jour</div><div class="sub">Termine les 3 missions : 3 ingrédients rares et un bonus de série. Série actuelle : <b>${D.streak||0} jour${(D.streak||0)>1?'s':''}</b>.</div></div>${D.chest?'<b>✔</b>':`<button class="b sm green" data-a="chest" ${all?'':'disabled'}>Ouvrir</button>`}</div>`;
  html+='<p class="sub center">Les missions et les coups de feu reviennent chaque jour à minuit.</p>';
  return {title:"🎯 Aujourd'hui",html};
 },""")
RP(" close:()=>closeModal(),",""" close:()=>closeModal(),
 rush:()=>startRush(),
 claim:ix=>{ const D=dailyCheck(), m=D.m[+ix]; if(!m||m.done) return; const M2=MISSIONS[m.i]; if((D.c[M2.k]||0)<M2.n) return; m.done=true; earn(M2.r); state.en.v=Math.min(EN_MAX,state.en.v+3); addXP(8); sfx('coin'); toast('Mission réussie : +'+M2.r+' 🪙 et +3 ⚡'); },
 chest:()=>{ const D=dailyCheck(); if(D.chest||!D.m.every(m=>m.done)) return; D.chest=true; D.streak=(D.streak||0)+1; const rare=Object.keys(ING).filter(k=>ING[k].b); const got=[]; for(let i=0;i<3;i++){ const k=pick(rare); state.inv[k]=(state.inv[k]||0)+1; got.push(ING[k].e); } const bonus=100+50*Math.min(D.streak,10); earn(bonus); addXP(15); sfx('level'); toast('🎁 '+got.join(' ')+' et +'+bonus+' 🪙 · série de '+D.streak+' jour'+(D.streak>1?'s':'')+' !'); },""")
RP("PICON={","PICON={daily:['star','#ffb84d','#ff8a2f','#d4601c'],")
# HUD
RP("function hud(){","""function sideInit(){ if($('#side')) return; const d=document.createElement('div'); d.id='side'; d.innerHTML='<button id="sEn" aria-label="Énergie"></button><button id="sRush" aria-label="Coup de feu">🔥<i></i></button><button id="sDay" aria-label="Missions du jour">🎯<i class="hide"></i></button>'; document.body.appendChild(d);
 const rb=document.createElement('div'); rb.id='rushbar'; rb.className='hide'; document.body.appendChild(rb);
 d.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; audioInit(); if(b.id==='sRush'&&!rush){ const D=dailyCheck(); if(D.rush<RUSH_MAX&&state.en.v>=RUSH_COST) return startRush(); } openPanel('daily'); }); }
function hud(){
 sideInit(); energyTick(); { const D=dailyCheck(), n=dailyReady(); $('#sEn').innerHTML='⚡<b>'+state.en.v+'</b>'; $('#sRush').lastChild.textContent=(RUSH_MAX-D.rush); $('#sRush').classList.toggle('off',D.rush>=RUSH_MAX||!!rush); const bd=$('#sDay').lastChild; bd.classList.toggle('hide',!n); bd.textContent=n; $('#side').classList.toggle('hide',mode!=='play'); }""")
RP(" const NEWS=[];",""" const NEWS=[];
 if(!state.day1){ state.day1=1; if(loaded) NEWS.push(`<div class="row"><div class="emo">🔥</div><div class="info"><div class="t">À toi de jouer !</div><div class="sub">Touche les clients pour les accueillir, prendre leur commande, les servir et encaisser. Chaque geste coûte 1 ⚡ (20 au maximum, 1 de plus toutes les 15 min). Lance un <b>coup de feu</b> 🔥 (3 par jour) pour un rush de 2 minutes, et remplis tes <b>3 missions du jour</b> 🎯.</div></div></div>`); }""")
