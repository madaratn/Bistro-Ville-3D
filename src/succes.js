// ===================== LES SUCCÈS (v0.99.5) =====================
// Des succès à quatre paliers (bronze, argent, or, diamant), des succès secrets, des récompenses qu'on récupère d'un toucher,
// des points qui font grimper un rang de chef, et à chaque rang une déco exclusive. Une bannière avec confettis à chaque palier,
// un petit « presque ! » quand il ne manque presque rien.

const ACH_T=['Bronze','Argent','Or','Diamant'], ACH_TC=['#cd8a4f','#aeb8c4','#f2b33d','#5fd0f0'], ACH_PTS=[5,10,20,40], ACH_COIN=[60,150,400,1000], ACH_XP=[20,50,120,300];
const ACH_RK=[['Commis',0],['Apprenti',40],['Chef de rang',120],['Sous-chef',250],['Chef',450],['Chef étoilé',750],['Grand chef',1150],['Légende du quartier',1700],['Légende de Paris',2400],['Immortel',3100]];
const ACH_CAT=[['srv','Service'],['inc','Imprévus'],['cui','Cuisine'],['deco','Déco'],['qrt','Quartier'],['sec','Secrets']];
const aT=k=>(state.tot&&state.tot[k])||0, aS=k=>(state.st&&state.st[k])||0, aI=k=>(state.inc&&state.inc.t&&state.inc.t[k]?state.inc.t[k][0]:0);
const achWo=()=>{ let n=0; const W=state.wallObj||{}; for(const sd in W) for(const i in W[sd]) if(W[sd][i]) n++; return n; };
const ACH=[
 {k:'served',c:'srv',i:'🍽',n:'Ça tourne !',d:'clients servis',t:[100,1000,5000,20000],v:()=>aT('served')},
 {k:'happy',c:'srv',i:'😋',n:'Ravis',d:'clients ravis',t:[50,500,3000,15000],v:()=>aT('happy')},
 {k:'cash',c:'srv',i:'🧾',n:'Tiroir-caisse',d:'tables encaissées',t:[50,500,2500,10000],v:()=>aS('cash')},
 {k:'cashF',c:'srv',i:'⏱',n:'Main rapide',d:'encaissements rapides',t:[25,250,1500,6000],v:()=>aS('cashF')},
 {k:'combo',c:'srv',i:'🎉',n:'En série',d:'gestes d’affilée',t:[10,25,50,100],v:()=>aS('comboMax')},
 {k:'vip',c:'srv',i:'👑',n:'Tapis rouge',d:'clients pressés ravis',t:[5,30,150,600],v:()=>aS('vip')},
 {k:'drinks',c:'srv',i:'🍷',n:'À la vôtre',d:'boissons servies',t:[50,500,2500,10000],v:()=>aT('drinks')},
 {k:'help',c:'srv',i:'👆',n:'Coup de main',d:'coups de main en salle',t:[20,200,1000,5000],v:()=>aT('help')},
 {k:'gest',c:'srv',i:'🤝',n:'Petits gestes',d:'petits gestes',t:[50,500,2500,10000],v:()=>aT('gest')},
 {k:'earned',c:'srv',i:'💰',n:'Bas de laine',d:'pièces gagnées',t:[10000,100000,500000,2000000],v:()=>aT('earned')},
 {k:'fire',c:'inc',i:'🔥',n:'Pompier',d:'feux éteints',t:[10,75,300,1200],v:()=>aI('fire')},
 {k:'broke',c:'inc',i:'🔧',n:'Bricoleur',d:'pannes réparées',t:[10,60,250,1000],v:()=>aI('broke')},
 {k:'spill',c:'inc',i:'🧽',n:'Serpillière d’or',d:'flaques épongées',t:[10,75,300,1200],v:()=>aI('spill')},
 {k:'complain',c:'inc',i:'💬',n:'Diplomate',d:'réclamations apaisées',t:[10,75,300,1200],v:()=>aI('complain')},
 {k:'dash',c:'inc',i:'🚪',n:'Rattrapeur',d:'resquilleurs rattrapés',t:[5,40,150,600],v:()=>aI('dash')},
 {k:'incOk',c:'inc',i:'⚡',n:'Rien ne m’échappe',d:'imprévus réglés',t:[50,400,2000,8000],v:()=>(state.inc&&state.inc.ok)||0},
 {k:'gold',c:'inc',i:'🥇',n:'Service en or',d:'médailles d’or',t:[1,15,75,300],v:()=>(state.inc&&state.inc.gold)||0},
 {k:'goldRow',c:'inc',i:'🏆',n:'Sans faute',d:'médailles d’or d’affilée',t:[2,4,8,16],v:()=>(state.inc&&state.inc.gb)||0},
 {k:'stars',c:'inc',i:'⭐',n:'Étoilé',d:'étoiles de fin de journée',t:[10,60,250,1000],v:()=>(state.stars&&state.stars.t)||0},
 {k:'rush',c:'inc',i:'♨',n:'Coup de feu',d:'points au meilleur coup de feu',t:[100,250,500,900],v:()=>aT('rush')},
 {k:'mast',c:'cui',i:'🏅',n:'Grand chef',d:'plats maîtrisés en or',t:[1,4,8,14],v:()=>Object.keys(state.dm||{}).filter(id=>mastS(id)>=3).length},
 {k:'mast1',c:'cui',i:'🎓',n:'Touche-à-tout',d:'plats maîtrisés',t:[3,8,14,20],v:()=>Object.keys(state.dm||{}).filter(id=>mastS(id)>=1).length},
 {k:'recip',c:'cui',i:'📈',n:'Recettes au sommet',d:'recettes au niveau 10',t:[1,4,8,14],v:()=>Object.values(state.dl||{}).filter(l=>l>=10).length},
 {k:'pdj',c:'cui',i:'📅',n:'Plat du jour',d:'plats du jour vendus',t:[20,150,600,2500],v:()=>aT('pdj')},
 {k:'cmd',c:'cui',i:'📝',n:'Sur commande',d:'commandes spéciales',t:[5,30,120,500],v:()=>aT('cmd')},
 {k:'harvest',c:'cui',i:'🌱',n:'Main verte',d:'récoltes au potager',t:[10,60,250,1000],v:()=>aT('harvest')},
 {k:'furn',c:'deco',i:'🪑',n:'Bien installé',d:'meubles dans la salle',t:[20,50,90,140],v:()=>state.furn.length},
 {k:'floors',c:'deco',i:'🟫',n:'Collection de sols',d:'sols achetés',t:[3,10,25,53],v:()=>(state.ownF||[]).length},
 {k:'walls',c:'deco',i:'🎨',n:'Papiers peints',d:'murs achetés',t:[3,10,30,64],v:()=>(state.ownW||[]).length},
 {k:'wobj',c:'deco',i:'🪧',n:'Mur d’exposition',d:'objets aux murs',t:[3,8,14,20],v:()=>achWo()},
 {k:'rugs',c:'deco',i:'🧺',n:'Tapis volant',d:'tapis posés',t:[1,4,8,14],v:()=>(state.rugs||[]).length},
 {k:'rating',c:'deco',i:'🌟',n:'Cinq étoiles',d:'de note',t:[3.5,4.2,4.7,5],v:()=>aS('ratMax'),dec:1},
 {k:'level',c:'qrt',i:'🏪',n:'Ça grandit',d:'niveau',t:[5,10,20,30],v:()=>state.level},
 {k:'story',c:'qrt',i:'📖',n:'Le carnet d’Odette',d:'chapitres de l’histoire',t:[3,10,20,28],v:()=>state.story?state.story.ch:0},
 {k:'regs',c:'qrt',i:'❤',n:'Mes habitués',d:'habitués conquis (trois cœurs)',t:[1,4,8,12],v:()=>Object.values(state.reg||{}).filter(r=>regHearts(r)>=3).length},
 {k:'staff',c:'qrt',i:'🤵',n:'La brigade',d:'employés',t:[3,5,7,9],v:()=>state.staff.length},
 {k:'days',c:'qrt',i:'🌙',n:'Fidèle au poste',d:'journées terminées',t:[5,30,100,365],v:()=>aT('bilan')},
 {k:'nb',c:'qrt',i:'🏡',n:'Bon voisinage',d:'repas des voisins',t:[5,25,100,400],v:()=>aT('nbmeal')},
 {k:'duel',c:'qrt',i:'💪',n:'Défis de la Ville',d:'duels',t:[1,10,50,200],v:()=>aT('duel')},
];
const ACH_SEC=[
 {k:'s_fire',i:'🔥',n:'Extincteur humain',d:'Éteindre un feu en moins d’une seconde',h:'Une histoire de réflexes en cuisine…'},
 {k:'s_dash',i:'🚪',n:'In extremis',d:'Rattraper un resquilleur à moins d’une seconde de la porte',h:'Il avait déjà un pied dehors…'},
 {k:'s_cash5',i:'💰',n:'Main d’or',d:'Encaisser 6 tables en 10 secondes',h:'La caisse chauffe…'},
 {k:'s_spill3',i:'🧽',n:'Grand ménage',d:'Éponger 3 flaques en 10 secondes',h:'Ça glisse de partout…'},
 {k:'s_chaos',i:'⚡',n:'Chaos maîtrisé',d:'Régler 6 imprévus en 30 secondes',h:'Quand tout arrive en même temps…'},
 {k:'s_zero',i:'😊',n:'Zéro fâché',d:'Finir une journée sans un seul client fâché (80 servis au moins, difficulté normale ou chef)',h:'Du premier au dernier client…'},
 {k:'s_combo',i:'🎉',n:'Chef d’orchestre',d:'Atteindre une série de 60 gestes',h:'Ne t’arrête jamais…'},
 {k:'s_chef',i:'👨‍🍳',n:'Toque d’or',d:'Décrocher une médaille d’or en difficulté chef',h:'Il faut oser le plus dur.'},
 {k:'s_vip3',i:'👑',n:'Comme des rois',d:'Ravir 3 clients pressés dans le même service',h:'Des clients très importants…'},
 {k:'s_perfect',i:'🏆',n:'Journée en or',d:'Décrocher 4 médailles d’or le même jour',h:'Du petit-déjeuner à la soirée…'},
 {k:'s_rich',i:'💎',n:'Le trésor de Mamie',d:'Avoir 100 000 pièces en caisse',h:'Un coffre bien rempli…'},
 {k:'s_full',i:'🎊',n:'Salle comble',d:'Toutes les places assises occupées en même temps (12 au moins)',h:'Plus une chaise de libre…'},
];
const ACH_SPTS=25, ACH_SCOIN=300, ACH_SXP=80;
const ACHM={}; for(const a of ACH) ACHM[a.k]=a; for(const s of ACH_SEC) ACHM[s.k]=s;

// ---------- état ----------
function achS(){ const A=state.ach||(state.ach={}); for(const k of ['u','c','s','cs','nud','seen']) if(!A[k]||typeof A[k]!=='object') A[k]={}; for(const k of ['pts','rk']) if(typeof A[k]!=='number') A[k]=0; return A; }
function stS(){ return state.st||(state.st={}); }
function stAdd(k,n=1){ const S2=stS(); S2[k]=(S2[k]||0)+n; }
function stMax(k,v){ const S2=stS(); if(v>(S2[k]||0)) S2[k]=v; }
const achRk=()=>achS().rk;
const achNext=a=>{ const u=achS().u[a.k]||0; return u>=4?null:a.t[u]; };
const achFmt=(a,v)=>a.dec?String(v).replace('.',','):fmt(v);
function achUnclaimed(cat){ const A=achS(); let n=0; for(const a of ACH){ if(cat&&a.c!==cat) continue; n+=Math.max(0,(A.u[a.k]||0)-(A.c[a.k]||0)); } if(!cat||cat==='sec') for(const s of ACH_SEC) if(A.s[s.k]&&!A.cs[s.k]) n++; return n; }

// ---------- les déblocages ----------
let achT0=0, achQ=[], achBusy=false, achNudT=0;
function achTick(force){ if(warming||!state) return; const now=performance.now(); if(!force&&now-achT0<700) return; achT0=now; const A=achS(); try{ achBtn(); }catch(e){}
 stMax('coinsMax',Math.floor(state.coins||0)); if(mode==='play'&&!(typeof visit!=='undefined'&&visit.on)) stMax('ratMax',Math.round((rating||0)*10)/10);
 if(!A.v){ A.v=1; let n=0; for(const a of ACH){ const v=a.v(); let u=0; while(u<4&&v>=a.t[u]) u++; A.u[a.k]=u; n+=u; } if(n) achCatchup(n); return; }
 for(const a of ACH){ const u=A.u[a.k]||0; if(u>=4) continue; let v=0; try{ v=a.v(); }catch(e){ continue; } if(v>=a.t[u]){ let w=u; while(w<4&&v>=a.t[w]) w++; for(let t=u;t<w;t++) achBanner(a,t); A.u[a.k]=w; try{ badgeUpd(); }catch(e){} continue; }
  // presque ! (une fois par palier, une minute au moins entre deux)
  const T=a.t[u]; if(!force&&mode==='play'&&v>=T*.9&&T-v>=(a.dec?.05:1)&&!A.nud[a.k+u]&&now-achNudT>60000&&!achBusy){ A.nud[a.k+u]=1; achNudT=now; achNudge(a,u,v); } }
 if((state.coins||0)>=100000) achSecret('s_rich');
 if(mode==='play'&&isOpen()){ const sc=seatCount(); if(sc>=12&&custs.filter(c=>c.sitting&&c.seat&&!c.dead&&!c.nb).length>=sc) achSecret('s_full'); } }
function achSecret(k){ const A=achS(); if(A.s[k]||warming) return; A.s[k]=1; achBanner(ACHM[k],-1); try{ badgeUpd(); }catch(e){} }
function achCatchup(n){ queueModal(()=>({title:'Tes succès sont arrivés',html:`<div class="acCU"><div class="acCUi">${ACH_SVG.cup}</div><p><b>${n} palier${n>1?'s':''} déjà gagné${n>1?'s':''}</b> grâce à tout ce que tu as fait au bistrot. Les récompenses t’attendent : récupère-les pour grimper en rang de chef et débloquer des décos exclusives.</p></div><p class="center"><button class="b green" data-a="go" data-v="succes">Voir mes succès</button></p>`})); }

// ---------- la bannière : badge, rayons, confettis, fanfare ----------
const ACH_SVG={
 badge:'<svg viewBox="0 0 64 64"><path d="M32 3l7.500 5.600 9.300-.400 2.900 8.900 7.600 5.400-2.900 8.900 2.900 8.900-7.600 5.400-2.900 8.900-9.300-.400L32 61l-7.500-5.600-9.300.400-2.900-8.900-7.600-5.400 2.900-8.900-2.900-8.900 7.600-5.400 2.900-8.900 9.300.400z" fill="var(--tc)" stroke="rgba(0,0,0,.22)" stroke-width="1.500"/><circle cx="32" cy="32" r="19.500" fill="rgba(255,255,255,.85)" stroke="rgba(0,0,0,.12)" stroke-width="1.200"/></svg>',
 cup:'<svg viewBox="0 0 64 64"><path d="M18 8h28v12a14 14 0 0 1-28 0z" fill="#f2b33d" stroke="#a8740f" stroke-width="2"/><path d="M18 12H9v3a10 10 0 0 0 10 10M46 12h9v3a10 10 0 0 1-10 10" fill="none" stroke="#a8740f" stroke-width="3"/><path d="M28 33h8v9h-8z" fill="#e0a12a"/><path d="M20 54h24l-3-12H23z" fill="#8a5a34"/><rect x="17" y="53" width="30" height="5" rx="2" fill="#5a3a22"/><path d="M26 14l2 4 4.500.600-3.300 3 .800 4.400L26 23.800l-4 2.200.800-4.400-3.300-3 4.500-.600z" fill="#fff3c2"/></svg>'};
function achFan(t){ if(!state.sound||!AC) return; try{ const N=t<0?[784,988,1175,1568,1976]:[[523,659,784],[587,740,880,1175],[659,831,988,1319,1661],[698,880,1047,1397,1760,2093]][t];
 N.forEach((f,i)=>tone(f,i*.085,.16+(i===N.length-1?.25:0),'triangle',.055)); if(t>=2||t<0) N.forEach((f,i)=>tone(f*2,.05+i*.085,.08,'sine',.02)); }catch(e){} }
function achBanner(a,t){ achQ.push({a,t}); if(!achBusy) achShowNext(); }
function achShowNext(){ const it=achQ.shift(); if(!it){ achBusy=false; return; }
 if(scOn||cine||titleOn||(typeof tutS!=='undefined'&&tutS)||(typeof rwS!=='undefined'&&rwS)){ achQ.unshift(it); achBusy=true; setTimeout(achShowNext,900); return; }
 achBusy=true; const {a,t}=it, sec=t<0, col=sec?'#c27cf0':ACH_TC[t];
 let e=document.getElementById('achB'); if(!e){ e=document.createElement('button'); e.id='achB'; document.body.appendChild(e); e.addEventListener('click',()=>{ e.classList.remove('on'); try{ openPanel('succes',a?(a.c||'sec'):'srv'); }catch(_){} }); }
 const rw=sec?ACH_SCOIN:ACH_COIN[t], pts=sec?ACH_SPTS:ACH_PTS[t];
 e.style.setProperty('--tc',col);
 e.innerHTML=deEmo(`<span class="abRays"></span><span class="abBadge">${ACH_SVG.badge}<i>${a.i}</i></span><span class="abTx"><small>${sec?'Succès secret !':'Succès débloqué !'}</small><b>${a.n}${sec?'':' · '+ACH_T[t]}</b><span>${sec?a.d:achFmt(a,a.t[t])+' '+a.d}</span><em>+${fmt(rw)} <i class="coin sm"></i> · +${pts} points · à récupérer</em></span><span class="abConf">${Array.from({length:22},(_,i)=>`<u style="--x:${Math.round((Math.random()-.5)*340)}px;--y:${Math.round(-40-Math.random()*130)}px;--r:${Math.round(Math.random()*720-360)}deg;--d:${(.7+Math.random()*.6).toFixed(2)}s;background:${pick(['#f2b33d','#e5484d','#3fb8b0','#8a5cf0','#45c97f','#ff7ab8',col])}"></u>`).join('')}</span>`);
 e.className='on t'+(sec?'s':t); achFan(sec?-1:t); vib(t>=2||sec?[20,40,20,40,30]:[18,30,18]);
 clearTimeout(e._t); e._t=setTimeout(()=>{ e.classList.remove('on'); setTimeout(achShowNext,380); },t>=2||sec?4600:3800); }
function achNudge(a,u,v){ let e=document.getElementById('achN'); if(!e){ e=document.createElement('button'); e.id='achN'; document.body.appendChild(e); e.addEventListener('click',()=>{ e.classList.remove('on'); openPanel('succes',e._c||'srv'); }); }
 e._c=a.c; const T=a.t[u], left=a.dec?(T-v).toFixed(1).replace('.',','):fmt(Math.ceil(T-v));
 e.style.setProperty('--tc',ACH_TC[u]); e.innerHTML=deEmo(`<i class="anI">${a.i}</i><span><b>Presque ! ${a.n} · ${ACH_T[u]}</b><small>Plus que ${left} ${a.dec?'':a.d}</small><u><s style="width:${Math.min(100,100*v/T).toFixed(0)}%"></s></u></span>`);
 e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); sfx('pop'); clearTimeout(e._t); e._t=setTimeout(()=>e.classList.remove('on'),4200); }

// ---------- récupérer : pièces qui volent, points, rang ----------
function achFly(fromEl,k){ const tg=document.getElementById('acCoin')||document.getElementById('pCoins'); if(!fromEl||!tg) return; const a=fromEl.getBoundingClientRect(), b=tg.getBoundingClientRect(), x0=a.left+a.width/2, y0=a.top+a.height/2, x1=b.left+18, y1=b.top+b.height/2;
 for(let i=0;i<k;i++){ const e=document.createElement('i'); e.className='cf acf'; e.style.left=(x0-9)+'px'; e.style.top=(y0-9)+'px'; document.body.appendChild(e); const dx=x1-x0, dy=y1-y0, mx=dx*.4+(Math.random()-.5)*90, my=dy*.4-40-Math.random()*50;
  const fin=()=>{ e.remove(); tg.classList.remove('bump'); void tg.offsetWidth; tg.classList.add('bump'); };
  try{ const an=e.animate([{transform:'translate(0,0) scale(.4)',opacity:0},{transform:`translate(${(Math.random()-.5)*40}px,${-20-Math.random()*20}px) scale(1.2)`,opacity:1,offset:.22},{transform:`translate(${mx}px,${my}px) scale(1)`,opacity:1,offset:.6},{transform:`translate(${dx}px,${dy}px) scale(.5)`,opacity:.9}],{duration:650+i*60,delay:i*45,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'both'}); an.onfinish=fin; }catch(err){ fin(); } setTimeout(()=>e.remove(),2000); } }
function achGrant(coins,xp,pts){ const A=achS(); earn(coins); dailyAdd('earned',coins); addXP(xp); A.pts+=pts; let up=0; while(A.rk<ACH_RK.length-1&&A.pts>=ACH_RK[A.rk+1][1]){ A.rk++; up++; achRankUp(A.rk); } return up; }
function achClaim(k,el,quiet){ const A=achS(), a=ACHM[k]; if(!a) return false;
 if(k.startsWith('s_')){ if(!A.s[k]||A.cs[k]) return false; A.cs[k]=1; achGrant(ACH_SCOIN,ACH_SXP,ACH_SPTS); if(el) achFly(el,quiet?2:6); if(!quiet) achFan(-1); return true; }
 const c=A.c[k]||0; if(c>=(A.u[k]||0)) return false; A.c[k]=c+1; achGrant(ACH_COIN[c],ACH_XP[c],ACH_PTS[c]); if(el) achFly(el,quiet?2:[3,4,6,8][c]); if(!quiet){ sfx('coin'); vib(12); } return true; }
function achRankUp(r){ const R=ACH_RK[r], G=ACH_GIFT[r], co=300*r, xp=60*r; earn(co); dailyAdd('earned',co); addXP(xp); try{ energyTick(); state.en.v=Math.min(EN_MAX,state.en.v+10); }catch(e){}
 const its=[{coin:1,n:'+'+fmt(co)+' pièces'},{xp:1,n:'+'+xp+' XP'},{en:1,n:'+10 énergie'}]; if(G) its.push({img:G.img(),n:G.n+' (déco exclusive)',r:4});
 rewardShow({title:'Nouveau rang : '+R[0],sub:'Tes succès te font grimper. '+(G?'Une déco exclusive t’attend dans l’atelier : '+G.w+'.':'Tu es tout en haut !'),items:its}); }

// ---------- le panneau ----------
const achPct=(a,v)=>{ const u=achS().u[a.k]||0; if(u>=4) return 100; const lo=u?a.t[u-1]:0, hi=a.t[u]; return Math.max(0,Math.min(100,100*(v-lo)/(hi-lo))); };
function achCard(a){ const A=achS(), u=A.u[a.k]||0, c=A.c[a.k]||0, cl=c<u, done=u>=4; let v=0; try{ v=a.v(); }catch(e){}
 const pips=[0,1,2,3].map(t=>`<i class="${t<c?'on':t<u?'new':''}" style="--tc:${ACH_TC[t]}"></i>`).join(''), p=achPct(a,v), p0=A.seen[a.k]!==undefined?Math.min(p,A.seen[a.k]):p;
 const tier=cl?c:Math.min(u,3), tc=done&&!cl?ACH_TC[3]:u?ACH_TC[u-1]:'#d9c8a6';
 return `<div class="acC${cl?' cl':''}${done&&!cl?' dn':''}"><div class="acI" style="--tc:${tc}">${ACH_SVG.badge}<i>${a.i}</i></div><div class="acInfo"><div class="acN">${a.n}</div>`+
  `<div class="acD">${cl?ACH_T[c]+' gagné : '+achFmt(a,a.t[c])+' '+a.d:done?'Diamant ! '+achFmt(a,a.t[3])+' '+a.d:ACH_T[u]+' : '+achFmt(a,a.t[u])+' '+a.d}</div>`+
  (done&&!cl?`<div class="acV"><span class="acP">${pips}</span></div>`:`<div class="acBar"><i style="width:${p0.toFixed(1)}%;--tc:${ACH_TC[Math.min(u,3)]}" data-w="${p.toFixed(1)}"></i></div><div class="acV"><span class="acP">${pips}</span><span>${achFmt(a,a.dec?v:Math.floor(v))} / ${achFmt(a,a.t[Math.min(u,3)])}</span></div>`)+`</div>`+
  (cl?`<button class="b green acGet" data-a="achget" data-v="${a.k}"><b>+${fmt(ACH_COIN[c])}</b><i class="coin sm"></i><small>+${ACH_PTS[c]} pts</small></button>`:done?`<div class="acRw dn">✓</div>`:`<div class="acRw"><b>+${ACH_PTS[u]}</b><small>pts</small></div>`)+`</div>`; }
function achSecCard(s){ const A=achS(), got=A.s[s.k], cl=got&&!A.cs[s.k];
 return `<div class="acC sec${cl?' cl':''}${got&&!cl?' dn':''}"><div class="acI" style="--tc:${got?'#c27cf0':'#cbbfa6'}">${ACH_SVG.badge}<i>${got?s.i:'❓'}</i></div><div class="acInfo"><div class="acN">${got?s.n:'Succès secret'}</div><div class="acD">${got?s.d:s.h}</div></div>`+
  (cl?`<button class="b green acGet" data-a="achget" data-v="${s.k}"><b>+${ACH_SCOIN}</b><i class="coin sm"></i><small>+${ACH_SPTS} pts</small></button>`:got?'<div class="acRw dn">✓</div>':`<div class="acRw"><b>+${ACH_SPTS}</b><small>pts</small></div>`)+`</div>`; }
function achPanel(){ achTick(true); const A=achS(), tab=ui.tab||'srv', rk=A.rk, R=ACH_RK[rk], N=ACH_RK[rk+1], G=N?ACH_GIFT[rk+1]:null;
 const tot=ACH.length*4+ACH_SEC.length, got=ACH.reduce((s,a)=>s+(A.c[a.k]||0),0)+ACH_SEC.filter(s=>A.cs[s.k]).length, rp=N?Math.max(0,Math.min(100,100*(A.pts-R[1])/(N[1]-R[1]))):100, un=achUnclaimed();
 let html=`<div class="acHd r${Math.min(rk,9)}"><div class="acRk">${ACH_SVG.badge}<b>${rk+1}</b></div><div class="acRkT"><small>Rang de chef</small><b>${R[0]}</b><div class="acBar big"><i style="width:${rp.toFixed(1)}%;--tc:#f2b33d"></i></div><span>${fmt(A.pts)} points${N?' · '+N[0]+' à '+fmt(N[1]):' · rang maximum'}</span>${G?`<em>${G.img?`<img src="${G.img()}" alt="">`:''}Au prochain rang : ${G.n}</em>`:''}</div><div class="acCo" id="acCoin"><i class="coin sm"></i><b>${fmt(state.coins)}</b></div></div>`;
 html+=`<div class="acSum"><span>${got} / ${tot} paliers récupérés</span>${un>1?`<button class="b green sm acAll" data-a="achall">Tout récupérer (${un})</button>`:''}</div>`;
 if(tab==='sec') html+=ACH_SEC.map(achSecCard).join('');
 else { const L=ACH.filter(a=>a.c===tab), sc=a=>{ const u=A.u[a.k]||0, c=A.c[a.k]||0; if(c<u) return 1000; if(u>=4) return -1; let v=0; try{ v=a.v(); }catch(e){} return achPct(a,v); }; L.sort((a,b)=>sc(b)-sc(a)); html+=L.map(achCard).join(''); }
 setTimeout(achAfter,0); return {title:'Succès',html}; }
function achAfter(){ const box=document.getElementById('mc'); if(!box||ui.panel!=='succes') return; const A=achS(); setTimeout(()=>{ box.querySelectorAll('.acBar i[data-w]').forEach(i=>{ i.style.width=i.dataset.w+'%'; }); },60); for(const a of ACH){ let v=0; try{ v=a.v(); }catch(e){} A.seen[a.k]=Math.round(achPct(a,v)); } }
// pendant « tout récupérer », la barre du rang se remplit en direct
function achHdLive(){ const A=achS(), R=ACH_RK[A.rk], N=ACH_RK[A.rk+1], h=document.querySelector('.acHd'); if(!h) return; const i=h.querySelector('.acBar i'), sp=h.querySelector('.acRkT>span'), b=h.querySelector('.acRkT>b'), k=h.querySelector('.acRk b');
 if(i) i.style.width=(N?Math.max(0,Math.min(100,100*(A.pts-R[1])/(N[1]-R[1]))):100).toFixed(1)+'%'; if(sp) sp.textContent=fmt(A.pts)+' points'+(N?' · '+N[0]+' à '+fmt(N[1]):' · rang maximum'); if(b&&b.textContent!==R[0]){ b.textContent=R[0]; if(k) k.textContent=A.rk+1; h.className='acHd r'+Math.min(A.rk,9)+' up'; } }
let achAllOn=false;
function achAll(btn){ if(achAllOn) return; const A=achS(), L=[]; for(const a of ACH) for(let c=A.c[a.k]||0;c<(A.u[a.k]||0);c++) L.push(a.k); for(const s of ACH_SEC) if(A.s[s.k]&&!A.cs[s.k]) L.push(s.k); if(!L.length) return;
 achAllOn=true; let i=0, sum=0; const t0=performance.now(); const step=()=>{ const want=Math.max(i+1,Math.round((performance.now()-t0)/85)); while(i<L.length&&i<want-1&&ui.panel==='succes'){ const k=L[i++], c=k.startsWith('s_')?-1:(achS().c[k]||0); sum+=c<0?ACH_SCOIN:ACH_COIN[c]; achClaim(k,null,true); } if(ui.panel!=='succes') while(i<L.length){ const k=L[i++], c=k.startsWith('s_')?-1:(achS().c[k]||0); sum+=c<0?ACH_SCOIN:ACH_COIN[c]; achClaim(k,null,true); }
  if(i>=L.length){ achAllOn=false; toast('+'+fmt(sum)+' pièces récupérées !'); achFan(2); try{ renderPanel(); }catch(e){} hud(); return; } const k=L[i++], a=ACHM[k], c=k.startsWith('s_')?-1:(A.c[k]||0); sum+=c<0?ACH_SCOIN:ACH_COIN[c]; achClaim(k,document.querySelector('.acAll')||btn,true); if(state.sound&&AC) try{ tone(660+Math.min(i,24)*28,0,.07,'triangle',.05); }catch(e){} const b=document.querySelector('.acSum span'); if(b) b.textContent='+'+fmt(sum)+' pièces…'; const co=document.querySelector('#acCoin b'); if(co) co.textContent=fmt(state.coins); achHdLive(); hud(); setTimeout(step,Math.max(45,140-i*4)); }; step(); }

// ---------- les déco exclusives, une par rang ----------
const ACH_GIFT=[null,
 {k:'achDip',n:'Diplôme d’apprenti',w:'Murs → Déco murale',img:()=>thumbs['wo:achDip']||''},
 {k:'achRugH',n:'Tapis d’honneur',w:'Sols → Tapis',img:()=>swR('achRugH'),rug:1},
 {k:'achToque',n:'Toque dorée',w:'Murs → Déco murale',img:()=>thumbs['wo:achToque']||''},
 {k:'achExt',n:'Extincteur d’or',w:'Murs → Déco murale',img:()=>thumbs['wo:achExt']||''},
 {k:'achStars',n:'Plaque des trois étoiles',w:'Murs → Déco murale',img:()=>thumbs['wo:achStars']||''},
 {k:'achRugS',n:'Tapis étoilé d’or',w:'Sols → Tapis',img:()=>swR('achRugS'),rug:1},
 {k:'achNeon',n:'Néon « Légende »',w:'Murs → Déco murale',img:()=>thumbs['wo:achNeon']||''},
 {k:'achCup',n:'Coupe de Paris',w:'Murs → Déco murale',img:()=>thumbs['wo:achCup']||''},
 {k:'achRugD',n:'Tapis de diamant',w:'Sols → Tapis',img:()=>swR('achRugD'),rug:1}];
const achLocked=o=>!!(o&&o.ach&&achRk()<o.ach);
const achLockTx=o=>'🔒 '+ACH_RK[o.ach][0];
{ const GD=()=>mt('#e8c25a',.22), GOLD='#d9b24a';
 Object.assign(WALL3D,{
  achDip(g){ return framed(g,'achDip',.56,.44,'#c79a52',(x,w,h)=>{ x.fillStyle='#fbf5e6'; x.fillRect(0,0,w,h); x.strokeStyle='#b8892e'; x.lineWidth=4; x.strokeRect(7,7,w-14,h-14); x.lineWidth=1.2; x.strokeRect(13,13,w-26,h-26); tx(x,'DIPLÔME',w/2,h*.24,18,'#3a2a1f',800); tx(x,'d’apprenti cuisinier',w/2,h*.42,11,'#6b4a2e',600); x.strokeStyle='#8a6a44'; x.lineWidth=1; for(const Y of [h*.58,h*.68]){ x.beginPath(); x.moveTo(w*.24,Y); x.lineTo(w*.76,Y); x.stroke(); } dot(x,w*.78,h*.78,15,'#c8322a'); dot(x,w*.78,h*.78,10,'#e5484d'); x.fillStyle='#c8322a'; x.beginPath(); x.moveTo(w*.74,h*.86); x.lineTo(w*.7,h*.98); x.lineTo(w*.77,h*.92); x.fill(); x.beginPath(); x.moveTo(w*.82,h*.86); x.lineTo(w*.86,h*.98); x.lineTo(w*.79,h*.92); x.fill(); },{metal:1}); },
  achToque(g){ W3(g,RB(.42,.5,.04,.012),M('#5a3a22',{roughness:.5}),0,0,.01); W3(g,RB(.34,.42,.012,.01),M('#7a5230',{roughness:.45}),0,0,.035); const gd=GD(); W3(g,CY(.1,.1,.09,20),gd,0,-.06,.12); for(const [x,y,r] of [[0,.07,.11],[-.08,.04,.075],[.08,.04,.075],[-.04,.1,.075],[.05,.1,.07]]) W3(g,SP(r,14,10),gd,x,y,.12); W3(g,TO(.1,.012),mt('#c79a52',.3),0,-.105,.12).rotation.x=Math.PI/2; W3(g,RB(.18,.045,.01,.006),M('#2a2520'),0,-.17,.044); return g; },
  achExt(g){ W3(g,RB(.36,.62,.025,.01),M('#c8322a',{roughness:.55}),0,.02,.008); const gd=GD(); W3(g,CY(.075,.075,.42,20),gd,0,-.04,.11); W3(g,SP(.075,16,8),gd,0,.17,.11,0,[1,.6,1]); W3(g,CY(.02,.026,.05,10),M('#2a2520'),0,.22,.11); W3(g,BX(.1,.025,.03),M('#2a2520'),.03,.25,.11); seg(g,M('#1d1b20'),.04,.22,.13,.02,.012,.13); W3(g,CY(.018,.01,.06,8),M('#1d1b20'),.13,-.01,.13); W3(g,BX(.17,.05,.006),M('#fffaf0'),0,-.08,.188); W3(g,RB(.13,.03,.004,.004),M('#c8322a'),0,-.08,.19); W3(g,BX(.12,.035,.04),mt('#9aa0a6',.3),0,-.2,.04); return g; },
  achStars(g){ return framed(g,'achStars',.64,.36,GOLD,(x,w,h)=>{ grad(x,w,h,'#1d2b4f','#101a33'); x.strokeStyle='#d9b24a'; x.lineWidth=3; x.strokeRect(8,8,w-16,h-16); const st=(X,Y,R)=>{ x.fillStyle='#f2c94c'; x.beginPath(); for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, q=k&1?R*.42:R; x.lineTo(X+Math.cos(a)*q,Y+Math.sin(a)*q); } x.fill(); }; st(w*.3,h*.38,15); st(w*.5,h*.33,19); st(w*.7,h*.38,15); tx(x,'TROIS ÉTOILES',w/2,h*.74,15,'#f2c94c',800); },{metal:1}); },
  achNeon(g){ return neonSign(g,'L',.9,.3,(x,w,h)=>{ glow(x,'#ffcf4a',4,()=>{ x.rect(10,10,w-20,h-20); }); x.font='800 52px '+FONT; x.textAlign='center'; x.textBaseline='middle'; x.shadowColor='#ff7ab8'; x.shadowBlur=18; x.strokeStyle='#ff9ad0'; x.lineWidth=5; x.strokeText('LÉGENDE',w/2,h/2+3); x.shadowBlur=4; x.strokeStyle='#fff'; x.lineWidth=1.8; x.strokeText('LÉGENDE',w/2,h/2+3); x.shadowBlur=0; }); },
  achCup(g){ shelfB(g,-.2,.62,'#5a3a22'); const gd=GD(); W3(g,BX(.18,.05,.13),M('#2a2520'),0,-.16,.1); W3(g,BX(.13,.03,.1),gd,0,-.12,.1); W3(g,CY(.018,.03,.1,10),gd,0,-.06,.1); W3(g,SP(.11,18,12),gd,0,.08,.1,0,[1,1.05,1]); W3(g,CY(.112,.105,.02,20),gd,0,.155,.1); for(const s of [-1,1]){ const t=W3(g,TO(.05,.012),gd,s*.12,.08,.1); t.rotation.y=Math.PI/2; } W3(g,RB(.1,.03,.006,.004),M('#2a2520'),0,-.16,.168); g.userData.y=1.02; return g; }
 });
 for(const [k,n,r] of [['achDip','Diplôme d’apprenti',1],['achToque','Toque dorée',3],['achExt','Extincteur d’or',4],['achStars','Plaque des trois étoiles',5],['achNeon','Néon « Légende »',7],['achCup','Coupe de Paris',8]]) WOBJ[k]={n,p:0,ach:r};
 Object.assign(RUGS,{
  achRugH:{n:'Tapis d’honneur',p:0,d:3,u:1,ach:2,w:3,h:1,dr(x,W,H){ rugRR(x,W,H,'#d9b24a',3,4); x.fillStyle='#b3202a'; x.fillRect(7,7,W-14,H-14); x.strokeStyle='#d9b24a'; x.lineWidth=3; x.strokeRect(13,13,W-26,H-26); x.fillStyle='#d9b24a'; for(let X=24;X<W-20;X+=18){ x.beginPath(); x.moveTo(X,H/2-5); x.lineTo(X+5,H/2); x.lineTo(X,H/2+5); x.lineTo(X-5,H/2); x.fill(); } fringe(x,W,H,'#e8c25a'); }},
  achRugS:{n:'Tapis étoilé d’or',p:0,d:5,u:1,ach:6,w:3,h:3,dr(x,W,H){ rugRR(x,W,H,'#d9b24a',4,6); x.fillStyle='#16224a'; x.fillRect(9,9,W-18,H-18); x.strokeStyle='#d9b24a'; x.lineWidth=3; x.strokeRect(17,17,W-34,H-34); const st=(X,Y,R)=>{ x.fillStyle='#f2c94c'; x.beginPath(); for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5, q=k&1?R*.42:R; x.lineTo(X+Math.cos(a)*q,Y+Math.sin(a)*q); } x.fill(); }; const r=seeded(77); for(let i=0;i<14;i++) st(30+r()*(W-60),30+r()*(H-60),4+r()*6); st(W/2,H/2,H*.17); x.strokeStyle='rgba(242,201,76,.55)'; x.lineWidth=1.5; x.beginPath(); x.arc(W/2,H/2,H*.27,0,7); x.stroke(); }},
  achRugD:{n:'Tapis de diamant',p:0,d:8,u:1,ach:9,w:4,h:3,dr(x,W,H){ rugRR(x,W,H,'#bfeeff',4,6); const g2=x.createLinearGradient(0,0,W,H); g2.addColorStop(0,'#7fd8ff'); g2.addColorStop(.35,'#c9a6ff'); g2.addColorStop(.65,'#ffd6f0'); g2.addColorStop(1,'#7fe3d0'); x.fillStyle=g2; x.fillRect(9,9,W-18,H-18); const s=H/6; x.strokeStyle='rgba(255,255,255,.75)'; x.lineWidth=2; for(let X=-H;X<W+H;X+=s){ x.beginPath(); x.moveTo(X,9); x.lineTo(X+H,H-9); x.stroke(); x.beginPath(); x.moveTo(X+H,9); x.lineTo(X,H-9); x.stroke(); } x.fillStyle='rgba(255,255,255,.9)'; for(const [X,Y] of [[W*.25,H*.3],[W*.7,H*.25],[W*.55,H*.7],[W*.2,H*.75],[W*.85,H*.65]]){ x.beginPath(); x.moveTo(X,Y-9); x.lineTo(X+3,Y); x.lineTo(X,Y+9); x.lineTo(X-3,Y); x.fill(); x.beginPath(); x.moveTo(X-9,Y); x.lineTo(X,Y+3); x.lineTo(X+9,Y); x.lineTo(X,Y-3); x.fill(); } x.strokeStyle='#ffffff'; x.lineWidth=3; x.strokeRect(15,15,W-30,H-30); }}
 }); }

// ---------- branchements : statistiques et secrets ----------
const achTs={cash:[],spill:[],inc:[]};
const achWin=(k,n,s)=>{ const L=achTs[k], t=performance.now()/1000; L.push(t); while(L.length&&t-L[0]>s) L.shift(); return L.length>=n; };
function achCash(fast){ stAdd('cash'); if(fast) stAdd('cashF'); if(achWin('cash',6,10)) achSecret('s_cash5'); }
function achIncWin(I){ if(I.k==='fire'&&I.T-I.t<1) achSecret('s_fire'); if(I.k==='dash'&&I.t<1) achSecret('s_dash'); if(I.k==='spill'&&achWin('spill',3,10)) achSecret('s_spill3'); if(achWin('inc',6,30)) achSecret('s_chaos'); }
function achCombo(n){ stMax('comboMax',n); if(n>=60) achSecret('s_combo'); }
function achSv(s,n){ if((s.vip||0)>=3) achSecret('s_vip3'); if(n===3&&incDiff()===2) achSecret('s_chef'); const D=dayOf().ix; if(D&&D.o>=4) achSecret('s_perfect'); }
function achDay(d){ if(incDiff()>0&&(d.lost||0)===0&&(d.served||0)>=80) achSecret('s_zero'); }

// ---------- le menu et le panneau ----------
ICONS.trophy='<path d="M7 4h10v3.500a5 5 0 0 1-10 0z"/><path d="M7 5.500H4.500v1a3.500 3.500 0 0 0 3.200 3.500M17 5.500h2.500v1a3.500 3.500 0 0 1-3.200 3.500"/><path d="M12 12.500V16"/><path d="M8.500 20h7M9.700 20l.600-4h3.400l.600 4"/>';
PICON.succes=['trophy','#ffe08a','#f2b33d','#b9772e'];
MORE.push(['succes','Succès','trophy','#ffe08a','#f2b33d','#b9772e']);
PANELS.succes=achPanel;
Object.defineProperty(TABS,'succes',{get(){ return ACH_CAT.map(([k,l])=>{ const n=achUnclaimed(k); return [k,l+(n?` <i class="acTd">${n>9?'9+':n}</i>`:'')]; }); },enumerable:true,configurable:true});
ACT.achget=v=>{ const b=document.querySelector(`.acGet[data-v="${v}"]`), c0=state.coins; if(achClaim(v,b)){ achPop(b,'+'+fmt(state.coins-c0)); const cd=b&&b.closest('.acC'); if(cd) cd.classList.add('got'); try{ achBtn(); }catch(e){} const co=document.querySelector('#acCoin b'); if(co) co.textContent=fmt(state.coins); setTimeout(()=>{ try{ if(ui.panel==='succes') renderPanel(); }catch(e){} },420); hud(); } };
ACT.achall=()=>achAll(document.querySelector('.acAll'));

// ---------- le bouton « Succès » sur le côté, avec le nombre de récompenses à récupérer ----------
const achBestTab=()=>{ for(const [k] of ACH_CAT) if(achUnclaimed(k)) return k; return 'srv'; };
function achBtn(){ let b=document.getElementById('sAch'); if(!b){ b=document.createElement('button'); b.id='sAch'; b.setAttribute('aria-label','Succès'); b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+ICONS.trophy+'</svg><b>Succès</b><i class="hide"></i>'; document.body.appendChild(b); b.addEventListener('click',()=>{ try{ audioInit(); }catch(e){} sfx('pop'); openPanel('succes',achBestTab()); }); }
 const n=achUnclaimed(), i=b.querySelector('i'); if(i._n!==n){ i._n=n; i.textContent=n>9?'9+':n; i.classList.toggle('hide',!n); b.classList.toggle('glow',n>0); }
 b.classList.toggle('hide',mode!=='play'||!state.tuto); }
try{ INC_HUD.push('#sAch'); }catch(e){}
// un « +80 » qui s'envole du bouton touché
function achPop(el,t){ if(!el) return; const r=el.getBoundingClientRect(), e=document.createElement('b'); e.className='acPop'; e.textContent=t; e.style.left=(r.left+r.width/2)+'px'; e.style.top=(r.top)+'px'; document.body.appendChild(e); setTimeout(()=>e.remove(),1100); }
