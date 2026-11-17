# v0.48 : petits gestes à toucher, objectif en cours, liste « Aujourd'hui » et fin de journée
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('moments_patch',a[:70],c); js=js.replace(a,b)
RX("const PANELS={",r"""// ===================== PETITS GESTES =====================
let moms=[], momCombo={n:0,t:-99}, momCookT=14, momScanT=0;
const GEST_N=12, MOM_SVG={
 tip:'<i class="coin sm"></i>',
 calm:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.800-8 11-8 11z"/></svg>',
 cook:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 5.500 5 11a5 5 0 0 1-10 0c0-2 1-3.500 2-4.500.300 2 1 3 2 3.500C10.500 9 11 5 12 2z"/></svg>'};
function momAdd(k,x,y,z,ttl,o){ const m=Object.assign({id:uid++,k,x,y,z,t:ttl,T:ttl},o||{}); moms.push(m); return m; }
function momTip(c,price,sat){ if(warming||rush||sat<=55||mode!=='play') return; const v=Math.max(1,Math.round(price*.2));
 const near=moms.find(m=>m.k==='tip'&&Math.abs(m.gx-c.fx)+Math.abs(m.gy-c.fy)<2.2); if(near){ near.v+=v; near.t=near.T; return; }
 momAdd('tip',c.fx+.5,.95,c.fy+.5,24,{v,gx:c.fx,gy:c.fy}); }
function momTick(dt){ if(warming) return; dt/=gameSpeed();
 for(const m of moms){ m.t-=dt; if(m.k==='calm'){ const c=m.c; if(!custs.includes(c)||c.pat>60||!['queue','wait','menu','order'].includes(c.st)) m.t=0; else { m.x=c.fx+.5; m.z=c.fy+.5; } }
  else if(m.k==='cook'){ const j=m.a.job; if(!j||j!==m.j||j.s!=='work'||j.t<.3) m.t=0; } }
 moms=moms.filter(m=>m.t>0);
 if(rush||mode!=='play') return;
 momScanT-=dt; if(momScanT<=0){ momScanT=1.2; if(moms.filter(m=>m.k==='calm').length<2){ const c=custs.find(c=>!c.calmed&&c.pat<40&&c.pat>6&&['queue','wait','menu','order'].includes(c.st)&&(!c.grp||c.grp.lead===c)&&!moms.some(m=>m.c===c)); if(c) momAdd('calm',c.fx+.5,1.5,c.fy+.5,14,{c}); } }
 momCookT-=dt; if(momCookT<=0){ momCookT=11+Math.random()*10; const a=crew.find(a=>a.job&&a.job.s==='work'&&a.job.st&&a.job.t>3&&a.job.T); if(a&&!moms.some(m=>m.k==='cook')) momAdd('cook',a.job.st.x+.5,1.45,a.job.st.y+.5,7,{a,j:a.job}); else momCookT=3; }
}
function momTap(id){ const m=moms.find(m=>m.id===id); if(!m) return; m.t=0; moms=moms.filter(x=>x!==m);
 const gx=Math.round(m.x-.5), gy=Math.round(m.z-.5);
 momCombo.n=simT-momCombo.t<10*gameSpeed()?momCombo.n+1:1; momCombo.t=simT;
 if(m.k==='tip'){ earn(m.v); dayAdd('tip',m.v); dailyAdd('earned',m.v); floatAt(gx,gy,'+'+m.v,null,true); sparkle(gx,gy,5); sfx('coin'); }
 else if(m.k==='calm'){ const c=m.c; c.pat=Math.min(100,c.pat+40); c.calmed=true; c.mood='happy'; c.hop=.4; if(c.grp) for(const k of custs) if(k.grp===c.grp&&k!==c){ k.pat=Math.min(100,k.pat+25); k.calmed=true; } floatAt(gx,gy,'Merci !','#d6457a'); sparkle(gx,gy,4,'#ff9ec4'); sfx('pop'); addXP(1); }
 else if(m.k==='cook'){ m.j.t*=.3; addXP(2); floatAt(gx,gy,'Cuisson parfaite !','#e0661f'); sparkle(gx,gy,6,'#ffb020'); sfx('pop'); }
 if(momCombo.n>=3&&momCombo.n%3===0){ const b=momCombo.n/3; earn(b); dayAdd('tip',b); floatAt(gx,gy-.7,'Série ×'+momCombo.n+'  +'+b,null,true); sfx('level'); }
 dailyAdd('gest',1); const D=dailyCheck(); if((D.c.gest||0)>=GEST_N&&!D.gestR){ D.gestR=true; earn(20); toast('12 petits gestes : +20 pièces. Tes clients adorent ça !'); }
 if(navigator.vibrate) try{ navigator.vibrate(12); }catch(e){}
 hud(); goalDraw(true); }
const momEls=new Map(); let momBox=null;
function momDraw(){
 if(!momBox){ momBox=document.createElement('div'); momBox.id='momov'; document.body.appendChild(momBox); momBox.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); audioInit(); momTap(+b.dataset.id); }); }
 const on=mode==='play'&&!ui.panel&&!visit.on&&!document.body.classList.contains('watch');
 const live=new Set(); if(on) for(const m of moms){ live.add(m.id); let el=momEls.get(m.id); if(!el){ el=document.createElement('button'); el.className='mom '+m.k; el.dataset.id=m.id; el.innerHTML=MOM_SVG[m.k]; momBox.appendChild(el); momEls.set(m.id,el); }
  const p=toScreen(m.x,m.y,m.z); el.style.transform=`translate(${p[0]-22}px,${p[1]-22}px)`; const hur=m.t<4; if(el._h!==hur){ el._h=hur; el.classList.toggle('hurry',hur); } }
 for(const [id,el] of momEls) if(!live.has(id)){ el.remove(); momEls.delete(id); }
 goalDraw();
}
// ===================== OBJECTIF EN COURS ET JOURNÉE =====================
const noEmo=s=>String(s).replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,'').trim();
function todayList(){ const D=dailyCheck(), st=state.story, L=[];
 if(st&&st.v&&!storyEnd()){ const lock=storyLocked(), s=lock?null:storyStep(), fresh=!lock&&st.seen!==st.ch;
  L.push({id:'story',t:lock?'Histoire : chapitre du jour terminé':fresh?'Histoire : un nouveau chapitre t’attend':'Histoire : '+s.S.g.t,done:lock,ready:!lock&&(fresh||s.ok),v:s?Math.min(s.v,s.S.g.n):1,n:s?s.S.g.n:1,p:'story'}); }
 D.m.forEach(m=>{ const M=MISSIONS[m.i], v=Math.min(M.n,D.c[M.k]||0); L.push({id:'m'+m.i,t:noEmo(M.t),done:m.done,ready:!m.done&&v>=M.n,v,n:M.n,p:'daily',rw:M.r}); });
 L.push({id:'chest',t:'Ouvrir le coffre du jour',done:D.chest,ready:!D.chest&&D.m.every(m=>m.done),v:D.m.filter(m=>m.done).length,n:3,p:'daily'});
 L.push({id:'rush',t:'Lancer les '+RUSH_MAX+' coups de feu',done:D.rush>=RUSH_MAX,v:D.rush,n:RUSH_MAX,p:'daily'});
 L.push({id:'gest',t:'Faire '+GEST_N+' petits gestes en salle',done:(D.c.gest||0)>=GEST_N,v:Math.min(GEST_N,D.c.gest||0),n:GEST_N,p:null});
 L.push({id:'bilan',t:'Tenir jusqu’au bilan du soir',done:(D.c.bilan||0)>=1,v:Math.min(DAY_LEN,state.day?state.day.t:0),n:DAY_LEN,p:'gestion'});
 return L; }
const todayDone=()=>todayList().every(x=>x.done);
function goalPick(){ const L=todayList().filter(x=>!x.done); if(!L.length) return null; return L.find(x=>x.ready)||L.filter(x=>x.id!=='rush'&&x.id!=='chest').sort((a,b)=>b.v/b.n-a.v/a.n)[0]||L[0]; }
let goalAt=0, goalKey='';
function goalDraw(force){ const now=performance.now(); if(!force&&now-goalAt<600) return; goalAt=now;
 let el=document.getElementById('goal'); if(!el){ el=document.createElement('button'); el.id='goal'; document.body.appendChild(el); el.addEventListener('click',()=>{ audioInit(); openPanel('today'); }); }
 const show=mode==='play'&&!!state.tuto&&!rush&&!visit.on; if(el._s!==show){ el._s=show; el.classList.toggle('hide',!show); } if(!show) return;
 const g=goalPick(), pc=g?Math.round(100*g.v/g.n):100, key=g?g.id+'|'+g.t+'|'+pc+'|'+(g.ready?1:0):'fin';
 if(key!==goalKey){ const ch=goalKey.split('|')[0]!==key.split('|')[0]; goalKey=key;
  el.innerHTML=g?`<span class="gl">${g.ready?'À récupérer':'Objectif'}</span><span class="gt">${g.t}</span><span class="gb"><i style="width:${g.ready?100:pc}%"></i></span>`:'<span class="gl">Bravo</span><span class="gt">Journée terminée. À demain !</span><span class="gb"><i style="width:100%"></i></span>';
  el.classList.toggle('ready',!!g&&!!g.ready); el.classList.toggle('fin',!g); if(ch){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } }
 const D=dailyCheck(); if(!g&&!D.fin&&!ui.panel){ D.fin=true; earn(50); sfx('level'); const st=state.story, nx=st&&st.v&&!storyEnd()&&SAGA[st.ch]?SAGA[st.ch].t:null;
  queueModal(()=>({title:'Journée terminée',html:`<div class="carBig"><div class="carBn">Tout est fait</div><b>Belle journée, chef !</b><p>Tu as tout bouclé pour aujourd’hui. Prime de fin de journée : +50 pièces.</p></div><p class="center sub">Demain t’attendent :</p><div class="tmr">${nx?'<div><b>Histoire</b>'+nx+'</div>':''}<div><b>3 missions</b>et un nouveau coffre</div><div><b>${RUSH_MAX} coups de feu</b>à relancer</div></div><p class="center sub">Tu peux continuer à faire tourner le bistro, mais il n’y a plus d’objectif à remplir aujourd’hui.</p><p class="center"><button class="b" data-a="close">À demain</button></p>`})); }
}
const PANELS={
 today(){ const L=todayList(), nd=L.filter(x=>x.done).length;
  return {title:'Aujourd’hui',html:`<div class="tdH"><b>${nd}/${L.length}</b><span class="gb"><i style="width:${100*nd/L.length}%"></i></span></div>`+L.map(x=>`<div class="row td ${x.done?'done':x.ready?'ready':''}" ${x.p&&!x.done?`data-a="go" data-v="${x.p}"`:''}><div class="tdC">${x.done?'✓':''}</div><div class="info"><div class="t">${x.t}</div>${x.done?'':`<div class="bar"><i style="width:${100*x.v/x.n}%"></i></div><div class="sub">${x.ready?'Prêt : touche pour récupérer':x.id==='bilan'?'La journée se termine à 23 h':x.id==='gest'?'Pourboires, clients impatients, cuisson : touche les bulles dans la salle':x.v+' / '+x.n}</div>`}</div></div>`).join('')+(nd===L.length?'<p class="center sub">Tout est fait pour aujourd’hui. Reviens demain pour la suite !</p>':'')}; },""")
RX("function update(dt){","function update(dt){ momTick(dt);")
RX("sparkle(c.fx,c.fy,6); c.mood='happy';","momTip(c,price,sat); sparkle(c.fx,c.fy,6); c.mood='happy';")
RX("function dayEnd(){ const F=dayFigures(), d=F.d;","function dayEnd(){ dailyAdd('bilan',1); const F=dayFigures(), d=F.d;")
RX("PICON={","PICON={today:['shop','#8fe0a8','#3fb56d','#17603a'],")
