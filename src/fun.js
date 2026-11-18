// ===================== DE QUOI S'OCCUPER TOUTE LA JOURNÉE (v0.91) : défis express et mini-jeux =====================
let dx=null, dxNext=0, dxStreak=0, dxMsg=null, dxRate={t:0,s:0,e:0,rs:0,re:0}, dxLast='';
const DXS=[
 {k:'served',dur:70,t:n=>'Sers '+n+' clients',n:R=>Math.max(2,Math.ceil(R.rs*70*1.15))},
 {k:'happy',dur:80,t:n=>'Rends '+n+' clients ravis',n:R=>Math.max(2,Math.ceil(R.rs*80*.55))},
 {k:'gest',dur:60,t:n=>'Ramasse '+n+' pourboires',n:()=>4},
 {k:'help',dur:60,t:n=>'Donne '+n+' coups de main en salle',n:()=>5,need:()=>state.en&&state.en.v>=6},
 {k:'earned',dur:70,t:n=>'Encaisse '+n+' pièces',n:R=>Math.max(30,Math.round(R.re*70*1.1/10)*10)}];
function dxOk(){ return isOpen()&&mode==='play'&&!rush&&!ev&&!cine&&!ui.panel&&state.tuto&&!tutS&&!(typeof visit!=='undefined'&&visit.on)&&!warming&&!mgOn; }
function dxTick(){ const now=performance.now()/1000, T=state.tot||(state.tot={}); if(warming) return;
 if(!dxRate.t){ dxRate.t=now; dxRate.s=T.served||0; dxRate.e=T.earned||0; } else if(now-dxRate.t>20){ const d=now-dxRate.t, rs=((T.served||0)-dxRate.s)/d, re=((T.earned||0)-dxRate.e)/d; dxRate.rs=dxRate.rs?dxRate.rs*.5+rs*.5:rs; dxRate.re=dxRate.re?dxRate.re*.5+re*.5:re; dxRate.t=now; dxRate.s=T.served||0; dxRate.e=T.earned||0; }
 const el=dxEl(), ok=dxOk();
 if(dxMsg){ if(now>dxMsg.t){ dxMsg=null; } }
 if(dx){ if(!ok){ dx.t0+=now-(dx.lt||now); dx.lt=now; } else { dx.lt=now; const v=(T[dx.k]||0)-dx.base, left=dx.dur-(now-dx.t0);
   if(v>=dx.n){ dxStreak++; const rw=Math.round((15+state.level*5)*(1+.15*Math.min(dxStreak-1,5))); earn(rw); energyTick(); state.en.v=Math.min(EN_MAX,state.en.v+2); addXP(3); sfx('level'); dxMsg={t:now+2.6,h:'<b class="ok">Défi réussi !</b><span>+'+rw+' pièces · +2 énergie'+(dxStreak>1?' · série ×'+dxStreak:'')+'</span>'}; dx=null; dxNext=now+10; hud(); }
   else if(left<=0){ dxStreak=0; dxMsg={t:now+2.2,h:'<b class="ko">Défi manqué</b><span>Le prochain arrive.</span>'}; dx=null; dxNext=now+10; } } }
 else if(ok&&now>dxNext&&!dxMsg&&dxRate.rs>0){ const L=DXS.filter(D=>D.k!==dxLast&&(!D.need||D.need())), D=L[Math.floor(Math.random()*L.length)], n=D.n(dxRate); dxLast=D.k; dx={k:D.k,n,base:T[D.k]||0,t0:now,lt:now,dur:D.dur,txt:D.t(n)}; sfx('pop'); }
 const show=mode==='play'&&!cine&&(dx||dxMsg)&&!rush&&!mgOn&&!(typeof visit!=='undefined'&&visit.on), key=!show?'':dxMsg?'m'+dxMsg.t:'d'+dx.k+dx.n+'|'+Math.min(dx.n,(T[dx.k]||0)-dx.base)+'|'+Math.ceil(dx.dur-(now-dx.t0));
 if(el._k!==key){ el._k=key; el.className=show?(dxMsg?'msg':''):'hide'; if(show) el.innerHTML=dxMsg?dxMsg.h:`<em>DÉFI</em><b>${dx.txt}</b><span>${Math.min(dx.n,(T[dx.k]||0)-dx.base)}/${dx.n} · ${Math.max(0,Math.ceil(dx.dur-(now-dx.t0)))} s</span><i><u style="width:${Math.min(100,100*((T[dx.k]||0)-dx.base)/dx.n)}%"></u></i>`; }
 mgBtn(); }
function dxEl(){ let el=$('#dx'); if(!el){ el=document.createElement('div'); el.id='dx'; el.className='hide'; document.body.appendChild(el); } return el; }
// ---------- mini-jeux : ils rendent de l'énergie ----------
let mgOn=null, mgCd=0;
function mgBtn(){ let b=$('#sMg'); if(!b){ b=document.createElement('button'); b.id='sMg'; b.setAttribute('aria-label','Mini-jeux'); document.body.appendChild(b); b.addEventListener('click',()=>{ audioInit(); const w=mgCd-performance.now()/1000; if(w>0) return toast('Les mini-jeux reviennent dans '+Math.ceil(w)+' s.'); sfx('pop'); mgOpen(); }); }
 const w=Math.ceil(mgCd-performance.now()/1000), show=mode==='play'&&!cine&&!rush&&state.tuto&&!tutS&&!(typeof visit!=='undefined'&&visit.on), k=(show?1:0)+'|'+(w>0?w:0);
 if(b._k!==k){ b._k=k; b.className=(show?'':'hide ')+(w>0?'cd':''); b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 10.500v4M6 12.500h4"/><circle cx="15.500" cy="11.500" r="1" fill="currentColor"/><circle cx="18" cy="14" r="1" fill="currentColor"/></svg><span>'+(w>0?w+' s':'Jeux')+'</span>'; } }
function mgEl(){ let el=$('#mg'); if(!el){ el=document.createElement('div'); el.id='mg'; el.className='hide'; document.body.appendChild(el); el.addEventListener('pointerdown',e=>{ const b=e.target.closest('[data-m]'); if(b){ e.preventDefault(); mgAct(b.dataset.m,b.dataset.v); } else if(mgOn&&mgOn.g==='cook'&&mgOn.run) { e.preventDefault(); mgCookTap(); } }); } return el; }
function mgOpen(){ mgOn={g:'menu'}; const el=mgEl(); el.className=''; el.innerHTML=`<div class="mgB"><h3>Une petite pause ?</h3><p>Chaque point gagné te rend 1 point d’énergie, et quelques pièces.</p><button class="mgC" data-m="cook"><b>Cuisson parfaite</b><span>Arrête le curseur dans la zone verte. Trois essais.</span></button><button class="mgC" data-m="memo"><b>La commande de la tablée</b><span>Retiens les plats dans l’ordre, puis refais la suite.</span></button><button class="b alt" data-m="quit">Retour au service</button></div>`; }
function mgEnd(pts,max,name){ const e=state.en||(state.en={v:0,t:Date.now()}), ge=Math.min(pts,EN_MAX-e.v), gc=pts*(4+state.level*2); energyTick(); e.v=Math.min(EN_MAX,e.v+pts); if(gc) earn(gc); if(pts) addXP(pts); mgCd=performance.now()/1000+45; sfx(pts?'level':'pop'); mgOn={g:'end'};
 mgEl().innerHTML=`<div class="mgB"><h3>${name}</h3><div class="mgS">${pts} / ${max}</div><p>${pts?'+'+pts+' énergie'+(gc?' · +'+gc+' pièces':''):'Pas de chance cette fois. Tu pourras retenter dans 45 secondes.'}</p><button class="b green" data-m="quit">Retour au service</button></div>`; hud(); }
function mgAct(m,v){ if(m==='quit'){ mgOn=null; mgEl().className='hide'; return; }
 if(m==='cook'){ mgOn={g:'cook',r:0,pts:0,run:false}; mgCookRound(); return; }
 if(m==='memo'){ const ids=(state.menu.length>=4?state.menu:DISH.map(d=>d.id)).slice(0,4); mgOn={g:'memo',ids,r:0,pts:0,seq:[],i:0,show:true}; mgMemoRound(); return; }
 if(m==='pick'&&mgOn&&mgOn.g==='memo'&&!mgOn.show){ const G=mgOn, ok=G.seq[G.i]===+v; const b=mgEl().querySelector('[data-v="'+v+'"]'); if(b){ b.classList.add(ok?'hit':'bad'); setTimeout(()=>b.classList.remove('hit','bad'),260); } sfx(ok?'coin':'bad');
  if(!ok){ G.r++; return setTimeout(()=>{ if(mgOn===G){ if(G.r>=3) mgEnd(G.pts,6,'La commande de la tablée'); else mgMemoRound(); } },600); }
  G.i++; if(G.i>=G.seq.length){ G.pts+=2; G.r++; setTimeout(()=>{ if(mgOn===G){ if(G.r>=3) mgEnd(G.pts,6,'La commande de la tablée'); else mgMemoRound(); } },500); } } }
function mgCookRound(){ const G=mgOn, w=[26,20,15][G.r], x=8+Math.random()*(84-w); G.z=[x,x+w]; G.sp=[.85,1.15,1.5][G.r]; G.t0=performance.now(); G.run=true;
 mgEl().innerHTML=`<div class="mgB"><h3>Cuisson parfaite</h3><p>Essai ${G.r+1} sur 3 · touche l’écran au bon moment</p><div class="mgBar"><i style="left:${x}%;width:${w}%"></i><u></u></div><div class="mgS">${G.pts} pt${G.pts>1?'s':''}</div></div>`;
 const step=()=>{ if(mgOn!==G||!G.run) return; const p=mgCookPos(G); const u=mgEl().querySelector('.mgBar u'); if(u) u.style.left=p+'%'; requestAnimationFrame(step); }; requestAnimationFrame(step); }
function mgCookPos(G){ const t=(performance.now()-G.t0)/1000*G.sp, f=t%2; return (f<1?f:2-f)*100; }
function mgCookTap(){ const G=mgOn; if(!G||!G.run) return; G.run=false; const p=mgCookPos(G), [a,b]=G.z, mid=(a+b)/2, hit=p>=a&&p<=b, perf=hit&&Math.abs(p-mid)<(b-a)*.17, g=perf?2:hit?1:0; G.pts+=g; sfx(g?'coin':'bad');
 const bar=mgEl().querySelector('.mgBar'); if(bar) bar.classList.add(perf?'perf':hit?'hit':'miss'); const s=mgEl().querySelector('.mgS'); if(s) s.textContent=perf?'Parfait ! +2':hit?'Bien ! +1':'Raté…';
 G.r++; setTimeout(()=>{ if(mgOn===G){ if(G.r>=3) mgEnd(G.pts,6,'Cuisson parfaite'); else mgCookRound(); } },850); }
function mgMemoRound(){ const G=mgOn, n=3+G.r; G.seq=Array.from({length:n},()=>Math.floor(Math.random()*4)); G.i=0; G.show=true;
 mgEl().innerHTML=`<div class="mgB"><h3>La commande de la tablée</h3><p class="mgP">Manche ${G.r+1} sur 3 · regarde bien…</p><div class="mgG">${G.ids.map((id,i)=>`<button class="mgD" data-m="pick" data-v="${i}">${foodIcon(DISHM[id].e)}</button>`).join('')}</div><div class="mgS">${G.pts} pt${G.pts>1?'s':''}</div></div>`;
 try{ iconizeEl(mgEl()); }catch(e){}
 let k=0; const flash=()=>{ if(mgOn!==G) return; const bs=mgEl().querySelectorAll('.mgD'); bs.forEach(b=>b.classList.remove('on')); if(k>=G.seq.length){ G.show=false; const p=mgEl().querySelector('.mgP'); if(p) p.textContent='À toi : refais la suite dans l’ordre'; return; } const b=bs[G.seq[k]]; setTimeout(()=>{ if(mgOn!==G) return; if(b) b.classList.add('on'); sfx('pop'); k++; setTimeout(flash,520); },160); }; setTimeout(flash,650); }
