// ===================== ÉVÉNEMENTS SURPRISES =====================
let ev=null, evT=200;
Object.assign(MOM_SVG,{cake:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 1.500 1.500 2.200 1.500 3a1.500 1.500 0 0 1-3 0c0-.800.500-1.500 1.500-3zM11 7h2v3h5a2 2 0 0 1 2 2v2c-1.300 0-1.700 1-3 1s-1.700-1-3-1-1.700 1-3 1-1.700-1-3-1-1.700 1-3 1v-3a2 2 0 0 1 2-2h4zm-7 9.800c1 0 1.500-.800 3-.800s1.700 1 3 1 1.700-1 3-1 1.700 1 3 1 2-.800 3-.800V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/></svg>',
 fuse:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'});
const EVS={
 car:{n:'Un car de touristes !',t:'Trente personnes descendent d’un coup. Les pourboires sont doublés pendant deux minutes.',d:120,c:'#3f9bd6',w:3},
 anniv:{n:'Un anniversaire en salle',t:'Touche le gâteau au-dessus de la table pour l’offrir (15 pièces). La tablée s’en souviendra.',d:60,c:'#e0457f',w:3},
 critique:{n:'Mme Fourchette est là',t:'La critique observe le service pendant 90 secondes. Des clients ravis, et c’est une bonne chronique.',d:90,c:'#8a5cc8',w:2,who:'c'},
 panne:{n:'Panne de courant !',t:'La cuisine tourne au ralenti. Touche l’éclair pour remettre le disjoncteur.',d:45,c:'#f2a81d',w:2},
 hygiene:{n:'Contrôle d’hygiène dans 25 secondes',t:'L’inspecteur arrive. Ramasse les déchets : deux au maximum, sinon c’est l’amende.',d:25,c:'#27a05c',w:2},
 rosa:{n:'Rosa passe avec sa brouette',t:'',d:0,c:'#4f9a54',w:2,who:'r'}};
function evPick(){ const ks=Object.keys(EVS).filter(k=>k!==(state.evLast||'')&&(k!=='hygiene'||trash.length>0||Math.random()<.5)&&(k!=='anniv'||custs.some(c=>c.st==='eat'||c.st==='wait'||c.st==='menu'))); let tot=ks.reduce((s,k)=>s+EVS[k].w,0), r=Math.random()*tot; for(const k of ks){ r-=EVS[k].w; if(r<=0) return k; } return ks[0]; }
function evStart(k){ const E=EVS[k]; state.evLast=k; const d=dayOf(); d.ev=(d.ev||0)+1; ev={k,t:E.d,T:E.d,sat:[],n:0}; sfx('level');
 if(k==='car'){ ev.sp=5; }
 else if(k==='anniv'){ const c=custs.find(c=>c.st==='eat')||custs.find(c=>c.st==='wait'||c.st==='menu'); if(c){ ev.m=momAdd('cake',c.fx+.5,1.35,c.fy+.5,E.d,{c}); } else { ev=null; return; } }
 else if(k==='panne'){ document.body.classList.add('blackout'); ev.m=momAdd('fuse',KR.x0+KR.w-.5,1.5,KR.y0+.4,E.d,{}); }
 else if(k==='rosa'){ ev=null; const ks=[0,1,2].map(()=>ingRoll([.6,.4])), cost=Math.round(ks.reduce((s,q)=>s+(ING[q].b||ING[q].g.c*2.2),0)*.6);
  queueModal(()=>({title:'Rosa, du potager',html:`<div class="tmC"><div class="tmP" style="border-color:#4f9a54"><img src="${foodThumbs['who:r']||''}" alt=""></div><div><b style="color:#3f8a44">Rosa</b><p>« J’ai trop récolté ce matin. Je te fais le lot à moitié prix, mais c’est maintenant ou jamais. »</p></div></div><div class="evL">${ks.map(q=>`<span>${ING[q].e} ${ING[q].n} ${rarTag(ING[q])}</span>`).join('')}</div><p class="center"><button class="b green" data-a="evbuy" data-v="${ks.join(',')}:${cost}" ${state.coins<cost?'disabled':''}>Prendre le lot · ${cost}</button> <button class="b alt" data-a="close">Non merci</button></p>`})); return; }
 evBanner(); }
function evEnd(why){ const E=ev; if(!E) return; ev=null; document.body.classList.remove('blackout'); if(E.m) moms=moms.filter(m=>m!==E.m);
 if(E.k==='critique'){ const n=E.sat.length, avg=n?E.sat.reduce((a,b)=>a+b,0)/n:0; if(n>=2&&avg>=72){ state.sat=Math.min(100,state.sat+6); earn(60); calcRating(); rewardShow({chest:false,title:'Une belle chronique',sub:'« Une adresse à retenir. » — Mme Fourchette',items:[{coin:1,n:'+60 pièces'},{xp:1,n:'Note en hausse'}]}); }
  else { state.sat=Math.max(0,state.sat-3); calcRating(); toast(n<2?'Mme Fourchette repart sans avoir vu grand-chose. Elle reviendra.':'Mme Fourchette fait la moue : « Peut mieux faire. » La note baisse un peu.'); } }
 else if(E.k==='hygiene'){ if(trash.length<=2){ earn(40); state.sat=Math.min(100,state.sat+3); calcRating(); rewardShow({chest:false,title:'Contrôle réussi',sub:'Salle impeccable. L’inspecteur te félicite.',items:[{coin:1,n:'+40 pièces'},{xp:1,n:'Note en hausse'}]}); } else { state.coins-=30; sfx('bad'); toast('L’inspecteur compte '+trash.length+' déchets : 30 pièces d’amende.'); } }
 else if(E.k==='panne'&&why!=='fix') toast('Le courant est revenu tout seul.');
 else if(E.k==='car') toast('Le car repart. Les touristes ont laissé '+(E.n||0)+' pourboires doublés.');
 const b=$('#evb'); if(b) b.classList.add('hide'); hud(); }
function evBanner(){ let b=$('#evb'); if(!b){ b=document.createElement('div'); b.id='evb'; document.body.appendChild(b); } const E=EVS[ev.k];
 b.className=''; b.style.setProperty('--ec',E.c); b.innerHTML=`${E.who?`<span class="evP"><img src="${foodThumbs['who:'+E.who]||''}" alt=""></span>`:''}<div><b>${E.n}</b><span>${E.t}</span><i class="evBar"><u></u></i></div>`; }
function evTick(dt){ if(warming||cine||mode!=='play'||!state.tuto) return;
 if(ev){ ev.t-=dt; if(ev.k==='car'&&ev.sp>0&&ev.t<ev.T-(5-ev.sp)*6){ ev.sp--; spawnT=0; }
  if((ev.k==='anniv'||ev.k==='panne')&&ev.m&&!moms.includes(ev.m)&&ev.t>0){ return evEnd('gone'); }
  const u=document.querySelector('#evb .evBar u'); if(u) u.style.width=Math.max(0,100*ev.t/ev.T)+'%'; if(ev.t<=0) evEnd('time'); return; }
 if(!isOpen()||rush||visit.on||ui.panel||tutS) return; evT-=dt; if(evT>0) return; evT=300+Math.random()*240; const d=dayOf(); if((d.ev||0)>=5||custs.length<2) { evT=60; return; } evStart(evPick()); }
function evMeal(c,d,price,sat){ if(ev&&ev.k==='critique') ev.sat.push(sat); if(ev&&ev.k==='car'&&sat>55) ev.n++; regMeal(c,d,price,sat); }
function evMom(m,gx,gy){ if(m.k==='cake'){ if(state.coins<15){ toast('Il faut 15 pièces pour offrir le gâteau.'); moms.push(m); m.t=Math.max(m.t,4); return true; } state.coins-=15; const tip=40+Math.round(Math.random()*20); earn(tip); state.sat=Math.min(100,state.sat+2); for(const k of custs) if(m.c&&(k===m.c||(k.grp&&k.grp===m.c.grp))){ k.pat=100; k.mood='happy'; k.hop=.5; } floatAt(gx,gy,'Joyeux anniversaire ! +'+tip,null,true); sparkle(gx,gy,10,'#ff9ec4'); sfx('level'); if(ev&&ev.m===m){ ev.m=null; evEnd('fix'); } return true; }
 if(m.k==='fuse'){ floatAt(gx,gy,'Courant rétabli !','#e0a02a'); sparkle(gx,gy,8,'#ffd23f'); sfx('level'); addXP(3); if(ev&&ev.m===m){ ev.m=null; evEnd('fix'); } return true; }
 return false; }
// ===================== LES HABITUÉS =====================
const REG_T=[3,8,15], regHearts=r=>!r?0:r.n>=REG_T[2]?3:r.n>=REG_T[1]?2:r.n>=REG_T[0]?1:0;
function regMeal(c,d,price,sat){ if(warming||cine||!d||sat<60||Math.random()>.14) return; const R=state.reg||(state.reg={}), pool=REGULARS.filter(r=>DISHM[r.fav]&&(state.menu.includes(r.fav)||R[r.k]||Math.random()<.35)), g=pool[Math.floor(Math.random()*pool.length)]; if(!g) return;
 const me=R[g.k]||(R[g.k]={n:0,fav:0}), h0=regHearts(me), first=me.n===0; me.n++; const isFav=d.id===g.fav; if(isFav){ me.fav++; const b=Math.max(3,Math.round(price*.5)); earn(b); floatAt(c.fx,c.fy-.6,g.n+' adore ! +'+b,null,true); } else floatAt(c.fx,c.fy-.6,g.n,'#8a5730');
 const h=regHearts(me);
 if(first) rewardShow({chest:false,title:'Un nouvel habitué',sub:g.t,items:[{img:regImg(g.k),n:g.n,r:1},{img:foodThumbs[DISHM[g.fav].e],n:'Adore : '+DISHM[g.fav].n,r:0}]});
 else if(h>h0){ const rw=[30,80,200][h-1], its=[{img:regImg(g.k),n:g.n+' · '+'♥'.repeat(h),r:h+1},{coin:1,n:'+'+rw+' pièces'}]; earn(rw); if(h===3){ const k=pick(Object.keys(ING).filter(q=>ING[q].r===3)); state.inv[k]=(state.inv[k]||0)+1; its.push(rwIng(k)); } rewardShow({chest:false,title:h===3?'Un ami pour la vie':'Un habitué fidèle',sub:g.n+' est venu '+me.n+' fois.',items:its}); } }
