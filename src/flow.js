// ===================== LE SERVICE (v0.96) : élan, étoiles du soir, ardoise du jour, commandes des voisins, pièces qui volent =====================

// ---------- l'élan : une série de clients qui repartent contents ----------
// Chaque client content (70 % et plus : celui qui laisse un pourboire) fait monter la série ; les paliers multiplient les pourboires.
// Un client qui part fâché, ou vraiment déçu (moins de 45 %), remet tout à zéro.
const EL_T=[[5,1.1],[10,1.2],[18,1.3],[28,1.4],[40,1.5]], EL_OK=70, EL_KO=45;
const PDJ_P=.2, PDJ_X=1.1;                    // l'ardoise : part des clients qui suivent le plat du jour, et son prix
const elN=()=>(state.day&&state.day.el)||0;
function elMul(){ const n=elN(); let m=1; for(const [t,v] of EL_T) if(n>=t) m=v; return m; }
const elTier=n=>EL_T.filter(([t])=>n>=t).length;
const elTarget=()=>clamp(Math.round(seatCount()*1.25),8,40);
function elMeal(c,sat){ if(warming||cine) return; const d=dayOf(); d.sS=(d.sS||0)+sat; d.sN=(d.sN||0)+1;
 if(sat>=EL_OK){ const t0=elTier(d.el||0); d.el=(d.el||0)+1; d.elB=Math.max(d.elB||0,d.el); if(state.story) state.story.eb=Math.max(state.story.eb||0,d.el);
  const t1=elTier(d.el); if(t1>t0){ if((d.elT||0)<t1){ d.elT=t1; try{ energyTick(); state.en.v=Math.min(EN_MAX,state.en.v+1); }catch(e){} } scSfx('star'); vib(14); try{ floatAt(c.fx,c.fy-1.05,'Élan ×'+String(elMul()).replace('.',','),'#e5642e'); }catch(e){} elDraw('up'); } else elDraw('tick'); }
 else if(sat<EL_KO) elBreak(c); }
let elBrkT=0;
function elBreak(c){ if(warming||cine) return; const d=dayOf(), n=d.el||0; d.el=0; if(n>=3){ try{ if(c) floatAt(c.fx,c.fy-1.05,'Élan brisé','#8a8f96'); }catch(e){} if(state.sound&&AC){ try{ tone(330,0,.14,'sawtooth',.035); tone(196,.1,.22,'sawtooth',.035); }catch(e){} } vib([20,40,20]); elBrkT=performance.now()+1500; elDraw(); setTimeout(()=>{ try{ elDraw(); }catch(e){} },1560); } else elDraw(); }
const EL_FACE='<circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="8.500" cy="10" r="1.500" fill="#8a3d12"/><circle cx="15.500" cy="10" r="1.500" fill="#8a3d12"/>';
function elDraw(fx){ let el=document.getElementById('el'); if(!el){ el=document.createElement('button'); el.id='el'; el.className='hide'; el.setAttribute('aria-label','Élan du service'); document.body.appendChild(el);
   el.addEventListener('click',()=>{ try{ audioInit(); }catch(e){} const n=elN(), nx=EL_T.find(([t])=>t>n); toast('Élan : '+n+' client'+(n>1?'s':'')+' content'+(n>1?'s':'')+' d’affilée, pourboires ×'+String(elMul()).replace('.',',')+(nx?'. Prochain palier à '+nx[0]+'.':'. Palier maximum !')+' Un client qui part fâché brise la série.'); }); }
 const n=elN(), brk=performance.now()<elBrkT&&n<3, show=mode==='play'&&!!state.tuto&&!rush&&!(typeof visit!=='undefined'&&visit.on)&&!cine&&(n>=3||brk);
 if(!show){ if(el._k!=='h'){ el._k='h'; el.className='hide'; } return; }
 const m=elMul(), nx=EL_T.find(([t])=>t>n), pv=[...EL_T].reverse().find(([t])=>t<=n), a=pv?pv[0]:0, pc=nx?Math.round(100*(n-a)/(nx[0]-a)):100, k=brk?'brk':n+'|'+m+'|'+pc;
 if(el._k!==k){ el._k=k; el.innerHTML=brk?'<svg viewBox="0 0 24 24">'+EL_FACE+'<path d="M7.800 16.600c1-1.700 2.500-2.500 4.200-2.500s3.200.8 4.200 2.500" stroke="#8a3d12" stroke-width="1.900" fill="none" stroke-linecap="round"/></svg><b>0</b><span>série brisée</span>'
   :'<svg viewBox="0 0 24 24">'+EL_FACE+'<path d="M7.500 13.800c1 2 2.600 3 4.500 3s3.500-1 4.500-3" stroke="#8a3d12" stroke-width="1.900" fill="none" stroke-linecap="round"/></svg><b>'+n+'</b>'+(m>1?'<span>×'+String(m).replace('.',',')+'</span>':'')+'<i><u style="width:'+pc+'%"></u></i>'; }
 const cls=brk?'t0 brk':'t'+elTier(n); if(el.className.replace(/ (up|tick)$/,'')!==cls||fx==='up'||fx==='tick'){ el.className=cls; if(!brk&&(fx==='up'||fx==='tick')){ void el.offsetWidth; el.className=cls+' '+fx; } } }

// ---------- les étoiles du service, au bilan du soir ----------
const ST_SAT=80, ST_LOST=.08;
function dayStars(d){ const lost=d.lost||0, n=d.sN||0, avg=n?Math.round(d.sS/n):0, T=elTarget(), best=d.elB||0, mx=Math.max(2,Math.floor(n*ST_LOST));
 return [{ok:n>=5&&lost<=mx,t:'L’accueil',s:n<5?'trop peu de clients aujourd’hui':lost?lost+(lost>1?' clients repartis fâchés':' client reparti fâché')+(lost>mx?' (au plus '+mx+' pour l’étoile)':''):'personne n’est reparti fâché'},
         {ok:n>=5&&avg>=ST_SAT,t:'Le régal',s:n?'satisfaction moyenne : '+avg+' %'+(avg<ST_SAT?' (il en faut '+ST_SAT+')':''):'aucun repas servi'},
         {ok:best>=T,t:'L’élan',s:'meilleure série : '+best+' client'+(best>1?'s':'')+' content'+(best>1?'s':'')+(best<T?' (il en faut '+T+')':'')}]; }
function starsEnd(d){ const S=dayStars(d), n=S.filter(x=>x.ok).length, T=state.stars||(state.stars={t:0,s:0,b:0}); T.t+=n; if(n===3){ T.s++; T.b=Math.max(T.b,T.s); } else T.s=0;
 const I=d.inc||{}, rw=n*Math.max(20+state.level*8,Math.round(((I.food||0)+(I.drink||0))*.01/5)*5); if(rw) earn(rw); if(n){ addXP(n*4); dailyAdd('dstars',n); } return {S,n,rw,serie:T.s}; }
function starsHTML(R){ return `<div class="stH"><div class="stS">${R.S.map((x,i)=>`<i class="${x.ok?'on':''}" style="animation-delay:${(.3+i*.38).toFixed(2)}s">★</i>`).join('')}</div><div class="stT">${['Service à revoir','Service honnête','Beau service','Service parfait'][R.n]}</div><div class="stL">${R.S.map(x=>`<div class="${x.ok?'on':''}"><b>${x.t}</b><span>${x.s}</span></div>`).join('')}</div>${R.rw?`<p class="center stP">Prime de service : <b>+${fmt(R.rw)} pièces</b>${R.serie>1?'<br>'+R.serie+' soirs à trois étoiles d’affilée':''}</p>`:''}</div>`; }

// ---------- l'ardoise : le plat du jour ----------
const pdjId=()=>{ const p=state.pdj; return p&&state.menu.includes(p.id)?p.id:null; };
const pdjIs=d=>!!d&&pdjId()===d.id;
const pdjToday=()=>!!state.pdj&&state.pdj.n===dayOf().n&&!!pdjId();
const pdjPrice=d=>Math.max(dishPrice(d)+1,Math.round(dishPrice(d)*PDJ_X));
function pdjMorning(){ if(!state.tuto||state.menu.length<2||warming||pdjToday()) return false; setTimeout(()=>{ if(mode==='play'&&!pdjToday()&&!scOn) queueModal(()=>PANELS.ardoise(1)); },900); return true; }
function pdjHTML(){ const id=pdjId(); return `<div class="pdjB" data-a="go" data-v="ardoise"><span>L’ardoise du jour</span><b>${id?DISHM[id].n:'Aucun plat du jour'}</b><small>${id?(pdjToday()?'Commandé deux fois plus souvent · payé '+pdjPrice(DISHM[id])+' pièces au lieu de '+dishPrice(DISHM[id]):'Celui d’hier. Touche pour en changer.'):'Touche pour choisir : il sera commandé plus souvent et payé plus cher.'}</small><i>Changer</i></div>`; }

// ---------- les commandes des voisins ----------
const CMD_FOR={a:'mon club de bridge',l:'mes ouvriers du fournil',r:'les gens du marché',y:'l’équipage',p:'la réunion de la banque',j:'la rédaction de la Gazette',c:'un dîner que je ne peux pas rater',z:'le goûter de ma classe',o:'mes vieilles copines',b:'ma brigade. Ne le répétez pas'};
const CMD_V='apcbjz';                                   // ceux qui vouvoient le patron
function cmdOffer(k){ if(state.cmd||warming||!state.story||(state.story.pages||0)<3||state.menu.length<2) return false; const d=dayOf(); if(state.cmdD===d.n||state.cmdK===k||Math.random()>.45) return false;
 const N=NB[k], id=state.menu.includes(N.fav)?N.fav:pick(state.menu), D=DISHM[id], y=d.hist&&d.hist.length?d.hist[d.hist.length-1].served:0,
  n=clamp(Math.round((y||seatCount()*12)/Math.max(3,state.menu.length)*.8/2)*2,6,90), rw=Math.max(60,Math.round(n*dishPrice(D)/10)*10), V=CMD_V.includes(k), F=CMD_FOR[k]||'des amis', q=`${n} « ${D.n} »`;
 state.cmdD=d.n; state.cmdK=k;
 const ask=pick([V?`Dites-moi… Il me faudrait ${q} d’ici demain soir, pour ${F}. Vous pouvez me faire ça ?`:`Dis-moi… Il me faudrait ${q} d’ici demain soir, pour ${F}. Tu peux me faire ça ?`,
                 V?`J’ai un service à vous demander : ${q}, à livrer demain soir au plus tard. C’est pour ${F}.`:`J’ai un service à te demander : ${q}, à livrer demain soir au plus tard. C’est pour ${F}.`,
                 `C’est pour ${F}. ${q}, d’ici demain soir : c’est faisable ?`]);
 sceneQ({title:'Une commande',lines:[[k,ask],
  ['?','~cmd',[[`« ${V?'Comptez':'Compte'} sur moi : ${q}, demain soir au plus tard. »`,{run:()=>{ state.cmd={k,dish:id,n,got:0,due:dayOf().n+1,rw}; },tag:'Commande acceptée : '+n+' × '+D.n+' · '+fmt(rw)+' pièces à la clé'},[[k+'/grin',V?'Parfait ! Mettez-le donc à l’ardoise, ça ira plus vite.':'Parfait ! Mets-le donc à l’ardoise, ça ira plus vite.']]],
               ['« Pas cette fois, la cuisine est déjà pleine. »',{},[[k,'Tant pis. Une prochaine fois, alors.']]]]]]}); return true; }
function cmdMeal(d){ const C=state.cmd; if(!C||!d||d.id!==C.dish||warming) return; C.got++; if(C.got<C.n) return; const N=NB[C.k], V=CMD_V.includes(C.k); state.cmd=null; earn(C.rw); try{ energyTick(); state.en.v=Math.min(EN_MAX,state.en.v+2); }catch(e){} try{ const st=nbS(), v=st.v[C.k]||(st.v[C.k]={p:0,c:0}); v.p+=2; }catch(e){} dailyAdd('cmd',1);
 sceneQ({title:'Commande livrée',tags:['+ '+fmt(C.rw)+' pièces · + 2 énergie','♥ '+N.n+' s’en souviendra'],lines:[[C.k+'/grin',V?`Les ${C.n} « ${DISHM[C.dish].n} » sont prêts ? Vous me sauvez la mise. Voilà pour vous, et gardez la monnaie.`:`Les ${C.n} « ${DISHM[C.dish].n} » sont prêts ? Tu me sauves la mise. Voilà pour toi, et garde la monnaie.`]]}); }
function cmdDay(endN){ const C=state.cmd; if(!C||endN<C.due) return; state.cmd=null; try{ const st=nbS(), v=st.v[C.k]; if(v) v.p=Math.max(0,v.p-1); }catch(e){}
 sceneQ({title:'Commande manquée',tags:['Commande manquée : '+C.got+' sur '+C.n],lines:[[C.k+'/sad','Je comptais dessus pour ce soir… Tant pis. Je me débrouillerai autrement.']]}); }
function cmdHTML(){ const C=state.cmd; if(!C) return ''; const N=NB[C.k], D=DISHM[C.dish], left=C.due-dayOf().n; return `<div class="cmdB"><img src="${foodThumbs['who:'+C.k]||''}" alt=""><div><span>Commande de ${N.n}</span><b>${C.got} / ${C.n} · ${D.n}</b><small>${left>0?'À livrer avant demain soir':'À livrer avant ce soir'} · ${fmt(C.rw)} pièces${pdjId()===C.dish?'':' · mets-le à l’ardoise pour aller plus vite'}</small><i><u style="width:${Math.round(100*C.got/C.n)}%"></u></i></div></div>`; }

// ---------- les pièces volent jusqu'à la caisse, et le compteur défile ----------
let cfN=0, coinD=null, flowF=0;                 // flowF : images affichées depuis le lancement (les scènes attendent que l'écran titre soit en place)
function coinFly(gx,gy,amt){ if(warming||cine||scOn||mode!=='play'||document.hidden||(typeof visit!=='undefined'&&visit.on)) return; const tg=document.getElementById('pCoins'); if(!tg) return; let p; try{ p=toScreen(gx+.5,.9,gy+.5); }catch(e){ return; }
 if(!(p[2]<1)||p[0]<-10||p[0]>innerWidth+10||p[1]<60||p[1]>innerHeight) return; const r=tg.getBoundingClientRect(), tx=r.left+19, ty=r.top+r.height/2, k=amt<25?1:amt<70?2:amt<160?3:4;
 for(let i=0;i<k;i++){ if(cfN>=12) break; cfN++; const e=document.createElement('i'); e.className='cf'; e.style.left=(p[0]-9)+'px'; e.style.top=(p[1]-9)+'px'; document.body.appendChild(e);
  const dx=tx-p[0], dy=ty-p[1], jx=(Math.random()-.5)*30, mx=dx*.45+(Math.random()-.5)*80, my=dy*.45-30-Math.random()*50; let done=false;
  const fin=()=>{ if(done) return; done=true; e.remove(); cfN--; tg.classList.remove('bump'); void tg.offsetWidth; tg.classList.add('bump'); };
  try{ const a=e.animate([{transform:'translate(0,0) scale(.3)',opacity:0},{transform:`translate(${jx}px,${-16-Math.random()*14}px) scale(1.15)`,opacity:1,offset:.2},{transform:`translate(${mx}px,${my}px) scale(1)`,opacity:1,offset:.62},{transform:`translate(${dx}px,${dy}px) scale(.5)`,opacity:.85}],{duration:700+i*80,delay:i*60,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'both'}); a.onfinish=fin; a.oncancel=fin; }catch(err){ fin(); }
  setTimeout(fin,1600+i*150); } }
function coinTick(dt){ const t=state?state.coins:0, el=document.getElementById('coins'); if(!el) return; if(coinD===null||warming||Math.abs(t-coinD)<1.5||Math.abs(t-coinD)>20000||!dt){ if(coinD!==t||el._v!==t){ coinD=t; el._v=t; el.textContent=fmt(t); } return; }
 coinD+=(t-coinD)*Math.min(1,dt*9); const v=Math.round(coinD); if(el._v!==v){ el._v=v; el.textContent=fmt(v); } }

// ---------- l'histoire : invité du chapitre et duel contre Belmont ----------
function storyOn(){ const st=state.story; return !!st&&!!st.v&&!storyEnd()&&!storyLocked()&&st.seen===st.ch; }
function storyGuest(){ if(!storyOn()) return null; const st=state.story, C=SAGA[st.ch], S2=C.steps[st.step]; return S2&&S2.g.k==='guest'&&!st.gs&&C.guest&&NB[C.guest]?C.guest:null; }
const storyDuel=()=>storyOn()&&!!SAGA[state.story.ch].duel;
const storyAmb=()=>storyOn()?(SAGA[state.story.ch].amb||null):null;       // ambiance du chapitre : 'rain' (tempête), 'fete' (défilés, feux d'artifice)
function duelStart(){ if(!storyDuel()||!rush) return; const st=state.story, w=clamp(((state.tot&&state.tot.duel)||0)-((st.base&&st.base.duel)||0),0,2); rush.bel={T:[236,262,288][w]+Math.round(rnd(-8,8)),s:0}; setTimeout(()=>toast('Le duel ! Le score du Belmont s’affiche à côté du tien. Fais mieux que lui avant la fin.'),500); }
function duelHud(){ const B=rush&&rush.bel; if(!B) return ''; const k=clamp(1-rush.t/RUSH_T,0,1); B.s=Math.max(B.s,Math.round(B.T*Math.pow(k,.92))); const lead=rush.score>=B.s; return `<span class="rvB ${lead?'':'ld'}">Belmont ${B.s}</span>`; }
function duelEnd(R){ const B=R.bel; if(!B) return ''; const win=R.score>B.T; if(win) dailyAdd('duel',1); return `<div class="duelR ${win?'w':'l'}"><span>Toi <b>${R.score}</b></span><i>${win?'Manche gagnée':'Manche perdue'}</i><span>Belmont <b>${B.T}</b></span></div>`; }
