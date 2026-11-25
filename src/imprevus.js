// ===================== LES IMPRÉVUS (v0.99.3) : la salle a besoin de toi =====================
// Ce que l'équipe ne sait pas faire seule : une poêle qui flambe, une machine en panne, une flaque, un client qui se plaint,
// un client qui file sans payer. Le joueur règle ça en touchant la bulle avant que son cercle se vide.
// À chaque fin de service, une médaille (accueil, réflexes, régal). La pression monte avec le niveau.
// Difficulté (Réglages → Jeu) : 0 détente (le service d'avant), 1 normale (par défaut), 2 chef.

const incDiff=()=>{ const v=optG('diff',1); return v===0||v===2?v:1; };
function incP(){ const L=(state&&state.level)||1, D=incDiff(); return D===0?0:D===2?Math.min(1.4,.5+(L-1)*.08):clamp((L-2)/12,0,1); }
const incPatMul=()=>{ const D=incDiff(); if(D===0) return 1; const p=Math.min(1,incP()); return D===2?1.45+.45*p:1.2+.5*p; };
// heures de pointe : midi pile et le début de soirée, les clients arrivent en masse
const incPkOK=()=>incDiff()>0&&!!state.tuto&&dayOf().n>=2&&!dayOf().night&&!dayOf().closing;
const incPeak=()=>{ if(!incPkOK()) return false; const h=gameHour(); return (h>=12&&h<13.5)||(h>=19.5&&h<21); };
const incFlowMul=()=>{ const D=incDiff(); if(D===0) return 1; return (1+.15*Math.min(1,incP())+(D===2?.1:0))*(incPeak()?(D===2?1.6:1.45):1); };
// la caisse : en normal et en chef, c'est le joueur qui encaisse (l'équipe n'y touche plus)
const incCash=()=>incDiff()>0&&incOn();
const incCashTime=()=>{ const p=Math.min(1,incP()); return incDiff()===2?Math.max(8,12-4*p):Math.max(11,18-7*p); };
// la réputation : chaque client parti fâché, chaque imprévu raté la fait baisser ; elle pèse sur la note
const incRepV=()=>incDiff()>0?Math.min(1.5,Math.max(0,state.rep||0)):0;
function incRepAdd(v){ if(warming||cine||incDiff()===0) return; state.rep=Math.min(1.5,(state.rep||0)+v*(incDiff()===2?1.3:1)); }
const INC_U={spill:2,complain:2,fire:3,vip:3,broke:4,dash:5};          // niveau où chaque imprévu apparaît (difficulté normale)
const incUnl=k=>incDiff()===2||((state&&state.level)||1)>=INC_U[k];
const INC_TAPS={fire:3,broke:4,spill:1,complain:1,dash:1};
let incCashing=0, incPkOn=false;
const INC_N={fire:'Ça brûle !',broke:'Panne',spill:'Flaque',complain:'Réclamation',dash:'Resquilleur'};
const INC_COMP=['C’est froid !','Trop salé !','Il y a un cheveu !','J’avais dit sans oignons !','On a oublié mon pain !','Ma fourchette est sale !','C’est pas assez cuit !','J’attends mon verre !'];
const INC_TEACH={
 fire:'Ça brûle ! Touche trois fois la flamme rouge avant que son cercle se vide, sinon le plat part à la poubelle.',
 broke:'Une machine tombe en panne. Touche quatre fois la clé pour la réparer, sinon le dépanneur passera… et il est cher.',
 spill:'Une flaque ! Touche-la pour éponger avant que quelqu’un glisse : un serveur qui glisse peut casser l’assiette.',
 complain:'Un client se plaint. Touche la bulle violette pour t’excuser et lui offrir le café, sinon il part fâché sans payer.',
 dash:'Ce client file sans payer ! Touche la bulle orange avant qu’il passe la porte.',
 cash:'Une table veut payer : touche sa bulle verte avant que le cercle se vide. Ton équipe ne touche pas à la caisse : sans toi, ils partent sans payer. Plus tu es rapide, plus le pourboire est gros.',
 vip:'Un client pressé, badge doré au-dessus de la tête. Place-le, prends sa commande et sers-le vite : s’il repart content, il paie presque double.'};
const INC_SVG={
 fire:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.500c1.300 4.200 5.800 5.900 5.800 11.800A5.800 5.800 0 0 1 6.200 13.300c0-2.400 1.200-4.100 2.400-5.200.300 2.300 1.200 3.400 2.300 4 .200-3.900.700-7.400 1.100-10.600z"/><path d="M12 13c.700 1.700 2.400 2.500 2.400 4.700a2.400 2.400 0 0 1-4.800 0c0-1.200.600-1.900 1.200-2.400.100 1 .500 1.400 1 1.600 0-1.500.100-2.800.200-3.900z" fill="#ffd23f"/></svg>',
 broke:'<svg viewBox="0 0 24 24" fill="currentColor"><g transform="rotate(-45 12 12)"><rect x="10.600" y="10" width="2.800" height="12.500" rx="1.400"/><path fill-rule="evenodd" d="M12 1.200a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM10.700 .500h2.600v4.800h-2.600z"/></g></svg>',
 spill:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.300c-3 4.500-6.200 8-6.200 11.700a6.200 6.200 0 0 0 12.400 0C18.200 10.300 15 6.800 12 2.300z"/><path d="M9.300 14.200a2.900 2.900 0 0 0 2.700 2.900" stroke="#bfe9ff" stroke-width="1.700" fill="none" stroke-linecap="round"/></svg>',
 complain:'<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.500 2.800h15a2.300 2.300 0 0 1 2.300 2.300v9.800a2.300 2.300 0 0 1-2.300 2.300H10l-5 4.100v-4.100h-.500a2.300 2.300 0 0 1-2.300-2.300V5.100a2.300 2.300 0 0 1 2.300-2.300zM10.800 5.600v6.200h2.400V5.600zm0 7.700v2.300h2.400v-2.300z"/></svg>',
 dash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.300" stroke-linecap="round" stroke-linejoin="round"><circle cx="15.500" cy="4.300" r="2.200" fill="currentColor" stroke="none"/><path d="M14 8.300l-2.800 5 3.400 2.600-1.200 5.300M11.200 13.300l-4.300 1.800M14 8.300l3.200 3.500 3.200-.6M14 8.300l-4.100-.4-2 3.200M2.500 9h3.500M1.500 12.500h3"/></svg>',
 cash:'<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M5 2h11v17.500l-1.800-1.300-1.800 1.300-1.800-1.300-1.800 1.300-1.900-1.300L5 19.500zm2.500 3.500v1.600h6V5.500zm0 3.500v1.600h6V9zm0 3.500v1.600h3.800v-1.600z"/><circle cx="17.500" cy="17" r="4.800" fill="#ffd23f" stroke="#a8740f" stroke-width="1.300"/><path d="M17.500 14.300v5.400M15.900 15.600h2.400a1 1 0 0 1 0 2h-1.600a1 1 0 0 0 0 2h2.400" stroke="#a8740f" stroke-width="1.200" fill="none" stroke-linecap="round"/></svg>',
 vip:'<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10 1.500h4v2h-1v1.600a8.200 8.200 0 1 1-2 0V3.500h-1zm2 5.400a6.300 6.300 0 1 0 0 12.600 6.300 6.300 0 0 0 0-12.600zm-.9 1.800h1.800v4.700l3 1.800-.9 1.500-3.900-2.400z"/></svg>',
 medal:'<svg viewBox="0 0 24 24"><path d="M7 1.500h3.400l1.600 5-2.800 2.200zM17 1.500h-3.400l-1.600 5 2.800 2.200z" fill="#d6453d"/><circle cx="12" cy="15" r="7.300" fill="currentColor" stroke="rgba(0,0,0,.25)" stroke-width="1"/><path d="M12 10.300l1.400 2.900 3.200.4-2.300 2.200.6 3.200-2.900-1.600-2.900 1.600.6-3.200-2.300-2.200 3.200-.4z" fill="rgba(255,255,255,.75)"/></svg>'};

let incs=[], incT=45, incBroken=new Set(), incSmoke=[], incLastK='', incPan=null, incReport=null;
function incS(){ const s=state.inc||(state.inc={}); if(!s.seen) s.seen={}; if(!s.t) s.t={}; for(const k of ['ok','ko','gold','gs','gb']) if(typeof s[k]!=='number') s[k]=0; return s; }
function incDay(){ const d=dayOf(); return d.ix||(d.ix={ok:0,ko:0,slip:0,dash:0,o:0,a:0,b:0}); }
function incOn(){ return !warming&&incDiff()>0&&mode==='play'&&!!state.tuto&&!tutS&&!cine&&!scOn&&!titleOn&&!(typeof visit!=='undefined'&&visit.on)&&dayOf().n>=2&&!dayOf().night; }
function incLive(){ return incOn()&&!ui.panel&&!document.body.classList.contains('watch'); }

// ---------- la boucle ----------
function incTick(dt){
 if(warming) return;
 if(incDiff()===0){ if(incs.length) incClear(); return; }
 const on=incOn(), live=on&&incLive(), rt=dt/gameSpeed();
 if(on&&live&&!incS().intro){ incS().intro=1; incS().intro2=1; incIntro('La salle a besoin de toi'); }
 else if(on&&live&&!incS().intro2){ incS().intro2=1; incIntro('La caisse, c’est toi'); }
 if(live&&isOpen()) state.rep=Math.max(0,(state.rep||0)-rt*(.08/60));
 { const pk=incPeak(); if(pk&&!incPkOn&&live&&isOpen()){ incPkOn=true; toast('Heure de pointe ! Les clients arrivent en masse : ouvre l’œil.'); incSfx('alarm'); vib([20,30,20]); } else if(!pk) incPkOn=false; }
 incCashTick(rt,live);
 if(incs.length){ for(const I of incs) if(!I.done) incStep(I,dt,rt,live); incs=incs.filter(I=>!I.done); }
 for(const s of incSmoke){ if(live) s.t-=rt; if(s.t>0||incBroken.has(s.f.id)) stoveBusy.add(s.f.id); else stoveBusy.delete(s.f.id); } incSmoke=incSmoke.filter(s=>s.t>0);
 incSlipTick(); incVipTick(dt);
 try{ incSvTick(); }catch(e){ console.warn(e); }
 if(!live||!isOpen()||rush) return;
 incT-=dt*(typeof ev!=='undefined'&&ev?.5:1); if(incT>0) return;
 const p=Math.min(1,incP()), D=incDiff(), base=D===2?40-20*p:50-25*p;
 incT=base/Math.max(.6,svcNow().flow)/(incPeak()?1.3:1)*rnd(.75,1.25);
 const cap=2+Math.round(1.6*p)+(D===2?1:0); if(incs.filter(I=>I.k!=='spill').length>=cap){ incT=6; return; }
 if(!incSpawn()) incT=8;
}
function incStep(I,dt,rt,live){
 switch(I.k){
  case 'fire': { const a=I.a, j=a&&a.job; if(!a||!crew.includes(a)||j!==I.j||j.s!=='work'||!state.furn.includes(I.f)){ incEnd(I); return; } j.t+=dt; break; }   // le cuisinier se bat avec sa poêle : la cuisson n'avance plus
  case 'broke': if(!state.furn.includes(I.f)){ incEnd(I); return; } incBlock(I.f); break;
  case 'complain': { const c=I.c; if(c.dead||!custs.includes(c)||c.st!=='eat'){ incEnd(I); return; } c.t+=dt; break; }    // il repose sa fourchette
  case 'dash': { const c=I.c; if(c.dead||!custs.includes(c)||c.y>=S){ incFail(I); return; } if(!live) c.pause=Math.max(c.pause||0,.05); else { I.t=incDashLeft(c); I.T=Math.max(I.T,I.t); I.life=(I.life||0)+rt; if(I.life>30) incFail(I); } return; }
 }
 if(!live) return;
 I.t-=rt; if(I.t<=0) incFail(I);
}
function incEnd(I){ I.done=true; incFinish(I); }
function incClear(){ for(const I of incs){ I.done=true; incFinish(I); } incs=[]; for(const s of incSmoke) if(!incBroken.has(s.f.id)) stoveBusy.delete(s.f.id); incSmoke=[]; for(const id of incBroken){ stoveBusy.delete(id); barBusy.delete(id); } incBroken.clear(); }
function incFinish(I){
 if(I.fl){ try{ fxRoot.remove(I.fl); for(const m of I.fl.children) m.material.dispose(); }catch(e){} I.fl=null; }
 if(I.k==='broke'&&I.f){ incBroken.delete(I.f.id); if(!incSmoke.some(s=>s.f===I.f)) stoveBusy.delete(I.f.id); barBusy.delete(I.f.id); }
 if(I.k==='spill'&&I.g){ try{ fxRoot.remove(I.g); I.g.children[0].material.dispose(); I.g.children[I.g.children.length-1].material.dispose(); }catch(e){} I.g=null; }
 if(I.k==='dash'&&I.c&&I.c.dash===1&&I.done&&!I.won&&!I.lost) I.c.dash=0;
}
// une machine en panne ne sert plus : on la garde « occupée » tant qu'elle n'est pas réparée
function incBlock(f){ const k=kindOf(f); if(k==='bar') barBusy.add(f.id); else if(k!=='fridge') stoveBusy.add(f.id); }

// ---------- qui peut tomber en panne, prendre feu, se plaindre… ----------
const INC_MK={stove:3,oven:2,fridge:2,sink:1,bar:1};
function incFireCand(){ return crew.filter(a=>a.s.role==='chef'&&a.job&&a.job.s==='work'&&a.job.st&&a.job.o&&['stove','oven'].includes(kindOf(a.job.st))&&a.job.t>1.1&&(a.job.T||0)>2&&!incs.some(I=>I.f===a.job.st)); }
function incBrokeCand(){ return state.furn.filter(f=>{ const k=kindOf(f); if(!INC_MK[k]||incBroken.has(f.id)||incs.some(I=>I.f===f)||!inRest(f.x,f.y)) return false; if(k==='bar') return !barBusy.has(f.id); if(k==='fridge') return !crew.some(a=>a.job&&a.job.f===f); return !stoveBusy.has(f.id); }); }
function incSpillCand(){ const L=[]; for(const c of custs){ if(!c.sitting||!c.seat||c.nb||!['wait','eat','order'].includes(c.st)) continue;
  for(const [dx,dy] of D4){ const x=c.seat.x+dx, y=c.seat.y+dy; if(!inRest(x,y)||inKitchen(x,y)||blocked(x,y)||isDoorC(x,y)||incs.some(I=>I.k==='spill'&&Math.abs(I.x-x)+Math.abs(I.y-y)<2)) continue; L.push([c,x,y]); } }
 return L; }
function incCompCand(){ return custs.filter(c=>c.st==='eat'&&c.sitting&&c.order&&!c.nb&&!c.ix&&c.t>2.5&&c.t<(c.eatT||8)*.8&&!incs.some(I=>I.c===c)); }
function incDashCand(){ return custs.filter(c=>c.st==='bill'&&!c.grp&&c.sitting&&c.order&&!c.nb&&!c.vip&&!c.kidF&&!(c.billBy&&c.billBy.job&&c.billBy.job.s==='do')&&(c.billT||0)>.3&&!incs.some(I=>I.c===c)); }
function incSpawn(){
 const W=[];
 if(incUnl('fire')){ const L=incFireCand(); if(L.length) W.push(['fire',3,L]); }
 if(incUnl('broke')&&!incs.some(I=>I.k==='broke')){ const L=incBrokeCand(); if(L.length) W.push(['broke',1.3,L]); }
 if(incUnl('spill')&&incs.filter(I=>I.k==='spill').length<3){ const L=incSpillCand(); if(L.length) W.push(['spill',3,L]); }
 if(incUnl('complain')){ const L=incCompCand(); if(L.length) W.push(['complain',3,L]); }
 if(incUnl('dash')){ const L=incDashCand(); if(L.length) W.push(['dash',2,L]); }
 if(!W.length) return false;
 for(const w of W) if(w[0]===incLastK) w[1]*=.4;
 let r=Math.random()*W.reduce((s,w)=>s+w[1],0), w=W[0]; for(const x of W){ r-=x[1]; if(r<=0){ w=x; break; } }
 const k=w[0], L=w[2], p=Math.min(1,incP());
 if(k==='fire'){ const a=pick(L); incFlame(incAdd('fire',{a,j:a.job,f:a.job.st,T:Math.max(4.5,7-2.5*p)})); }
 else if(k==='broke'){ let t=Math.random()*L.reduce((s,f)=>s+INC_MK[kindOf(f)],0), f=L[0]; for(const x of L){ t-=INC_MK[kindOf(x)]; if(t<=0){ f=x; break; } }
  incBroken.add(f.id); incBlock(f); incAdd('broke',{f,T:incDiff()===2?25:32}); }
 else if(k==='spill'){ const [c,x,y]=pick(L); c.say='Oups !'; c.sayT=1.3; const I=incAdd('spill',{x,y,T:crew.some(a=>a.s.role==='cleaner')?30:90}); incPuddle(I); }
 else if(k==='complain'){ const c=pick(L); c.ix=1; c.say=pick(INC_COMP); c.sayT=2.6; c.mood='angry'; incAdd('complain',{c,T:Math.max(6,10-3*p)}); }
 else if(k==='dash'){ const c=pick(L), first=!incS().seen.dash; c.dash=1; if(!first) c.speed=(c.speed||1)*1.5; c.billBy=null; leave(c); incAdd('dash',{c,T:10}); }
 return true;
}
let incCone=null;
function incFlame(I){ if(!incCone) incCone=new THREE.ConeGeometry(.5,1,10,1,true); const g=new THREE.Group();
 for(const [c,sx,sy,x,z,o] of [['#ff5a1f',.34,.62,0,0,.92],['#ff9a1f',.24,.5,.09,.05,.95],['#ffd23f',.15,.36,-.04,.03,1],['#ff6a1f',.2,.42,-.12,-.06,.9]]){
  const m=new THREE.Mesh(incCone,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,side:THREE.DoubleSide})); m.scale.set(sx,sy,sx); m.position.set(x,sy/2,z); m.userData.b=[sx,sy]; m.renderOrder=4; g.add(m); }
 const v=incTop(I.f); g.position.set(v.x,v.y-.04,v.z); fxRoot.add(g); I.fl=g; }
function incAdd(k,o){ const first=incTeach(k); const I=Object.assign({id:uid++,k,n:0,need:INC_TAPS[k]},o); if(first&&k!=='dash') I.T*=1.7; I.t=I.T; incs.push(I); incLastK=k; incSfx('alarm'); vib(18); return I; }
function incTeach(k){ const S2=incS(); if(S2.seen[k]) return false; S2.seen[k]=1; toast(INC_TEACH[k]); return true; }
function incDashLeft(c){ let n=0; if(c.path) for(const q of c.path){ n++; if(q[1]>=S) break; } if(!c.path||!c.path.length) n=Math.max(0,S-c.fy)+1; return (n+(c.st==='standUp'?1.2:0))/Math.max(.4,c.speed||1)/gameSpeed(); }

// ---------- le joueur touche une bulle ----------
function incTap(id){ const I=incs.find(x=>x.id===id); if(!I||I.done||!incLive()) return;
 I.n++; const el=incEls.get('i'+id); if(el){ el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
 const [gx,gy]=incCell(I); vib(10);
 if(I.n<I.need){ incSfx('tap'); if(I.k==='fire') sparkle(gx,gy,4,'#9fe0ff'); else if(I.k==='broke') sparkle(gx,gy,3,'#d8dde3'); return; }
 incWin(I,gx,gy);
}
function incWin(I,gx,gy){ I.done=true; I.won=true; incFinish(I); try{ achIncWin(I); }catch(e){}
 const S2=incS(), D=incDay(); S2.ok++; D.ok++; (S2.t[I.k]||(S2.t[I.k]=[0,0]))[0]++; incSvAdd('ok'); dailyAdd('inc',1);
 try{ energyTick(); state.en.v=Math.min(EN_MAX,state.en.v+1); }catch(e){}
 addXP(2);
 if(I.k==='fire'){ floatAt(gx,gy,'Rattrapé ! +1 ⚡','#2f9e63'); sparkle(gx,gy,8,'#9fe0ff'); }
 else if(I.k==='broke'){ floatAt(gx,gy,'Réparé ! +1 ⚡','#2f9e63'); sparkle(gx,gy,8); }
 else if(I.k==='spill'){ floatAt(gx,gy,'Épongé ! +1 ⚡','#2f9e63'); sparkle(gx,gy,6,'#bfe9ff'); }
 else if(I.k==='complain'){ const c=I.c; c.pat=100; c.mood='happy'; c.hop=.4; c.say='Merci, c’est gentil'; c.sayT=1.6; c.comp=1; floatAt(gx,gy,'Excuses acceptées ! +1 ⚡','#7a43c2'); sparkle(gx,gy,6,'#d9b8ff'); }
 else if(I.k==='dash') incDashPay(I.c,gx,gy);
 incSfx('win'); incGest(gx,gy); hud(); try{ goalDraw(true); }catch(e){}
}
function incFail(I){ if(I.done) return; I.done=true; I.lost=true; incFinish(I);
 const S2=incS(), D=incDay(); S2.ko++; D.ko++; (S2.t[I.k]||(S2.t[I.k]=[0,0]))[1]++; incSvAdd('ko');
 const [gx,gy]=incCell(I);
 if(I.k==='fire'){ const a=I.a, j=a&&a.job; if(j&&j===I.j){ const o=j.o; stoveBusy.delete(j.st.id); a.job=null; a.carry=null; if(o&&!o.cancel){ o.st='wait'; o.chef=null; o.si=0; o.steps=null; } }
  incSmoke.push({f:I.f,t:10}); stoveBusy.add(I.f.id); floatAt(gx,gy,'Plat brûlé !','#e5484d');
  for(const c of custs) if(c.sitting&&['wait','order','menu','eat'].includes(c.st)) c.pat=Math.max(1,c.pat-8); const oc=I.j&&I.j.o&&I.j.o.c; if(oc&&custs.includes(oc)) oc.pat=Math.max(1,oc.pat-15); addSat(45); }
 else if(I.k==='broke'){ const cost=Math.round((20+5*(state.level||1))*(incDiff()===2?1.3:1)); state.coins-=cost; dayAdd('ing',cost); floatAt(gx,gy,'Dépanneur : −'+cost,'#e5484d'); const S3=incS(); S3.rp=(S3.rp||0)+1; if(S3.rp<=2) toast('Le dépanneur est passé : '+cost+' pièces. La prochaine fois, quatre petits coups de clé suffisent.'); }
 else if(I.k==='spill'){ floatAt(gx,gy,'La flaque a séché','#5a8fb0'); }
 else if(I.k==='complain'){ const c=I.c; c.say='Je m’en vais !'; c.sayT=1.6; floatAt(gx,gy-.4,'Mauvais avis','#e5484d'); angry(c); }
 else if(I.k==='dash'){ const c=I.c, v=incPrice(c); D.dash++; if(c) c.order=null; floatAt(c?c.fx:DX,c?Math.min(c.fy,S-1):S-1,'Parti sans payer ! −'+v,'#e5484d'); }
 if(I.k!=='spill'){ incSfx('fail'); vib([25,40,25]); rateHit(); incRepAdd(.05); } else incRepAdd(.02);
 hud();
}
function incPrice(c){ if(!c) return 0; const d=c.order?DISHM[c.order.dish]:null; return (d?(pdjIs(d)?pdjPrice(d):dishPrice(d)):0)+drinkPay(c); }
function incDashPay(c,gx,gy){ const price=incPrice(c); if(!price){ floatAt(gx,gy,'Oups, pardon !','#2f9e63'); return; }
 const dp=drinkPay(c), bonus=Math.max(1,Math.round(price*.25)); earn(price+bonus); dayAdd('food',price-dp); dayAdd('drink',dp); dayAdd('tip',bonus);
 state.day.served++; state.served++; dailyAdd('served',1); dailyAdd('earned',price+bonus); addXP(3+Math.round(price/12));
 c.order=null; c.dash=2; c.say='Oups… pardon !'; c.sayT=1.6; c.mood='happy'; try{ coinFly(c.fx,c.fy,price+bonus); }catch(e){} floatAt(gx,gy,'Rattrapé ! +'+(price+bonus)+' · +1 ⚡',null,true); sfx('coin'); }
function incGest(gx,gy){ momCombo.n=simT-momCombo.t<10*gameSpeed()?momCombo.n+1:1; momCombo.t=simT; try{ achCombo(momCombo.n); }catch(e){}
 if(momCombo.n>=3&&momCombo.n%3===0){ const b=momCombo.n/3; earn(b); dayAdd('tip',b); floatAt(gx,gy-.7,'Série ×'+momCombo.n+'  +'+b,null,true); }
 dailyAdd('gest',1); xqAdd('gest'); const D=dailyCheck(); if((D.c.gest||0)>=GEST_N&&!D.gestR){ D.gestR=true; earn(20); toast('12 petits gestes : +20 pièces. Tes clients adorent ça !'); } }

// ---------- les flaques : on glisse dessus ----------
function incSlipTick(){ let P=null; for(const I of incs) if(I.k==='spill'&&!I.done) (P||(P=[])).push(I); if(!P) return;
 for(const I of P){
  for(const a of crew) if(a.moving&&Math.abs(a.fx-I.x)<.34&&Math.abs(a.fy-I.y)<.34&&!(a.slipU>simT)) incSlip(a,true);
  for(const c of custs) if(c.moving&&!c.sitting&&c.st!=='pass'&&Math.abs(c.fx-I.x)<.34&&Math.abs(c.fy-I.y)<.34&&!(c.slipU>simT)) incSlip(c,false); } }
function incSlip(a,staff){ a.slipU=simT+3; a.pause=Math.max(a.pause||0,.85); incDay().slip++;
 if(staff){ const j=a.job;
  if(j&&j.o&&j.s==='serve'&&Math.random()<.45){ const o=j.o; o.st='wait'; o.chef=null; o.si=0; o.steps=null; o.waiter=null; o.at=null; a.job=null; a.carry=null; floatAt(a.fx,a.fy,'Assiette cassée !','#e5484d'); try{ sparkle(a.fx,a.fy,6,'#ffffff'); }catch(e){} incSfx('fail'); rateHit(); return; }
  if(j&&j.d&&j.s==='dserve'&&Math.random()<.45){ const d=j.d; d.st='wait'; d.w=null; d.at=null; a.job=null; a.carry=null; floatAt(a.fx,a.fy,'Verre renversé !','#e5484d'); incSfx('fail'); return; }
  floatAt(a.fx,a.fy,'Ouh là !','#2f8fd0'); }
 else { a.pat=Math.max(1,(a.pat||0)-20); addSat(35); floatAt(a.fx,a.fy,'Aïe !','#2f8fd0'); }
 sfx('pop'); }
let incPG=null;
function incPuddle(I){ if(!incPG) incPG=new THREE.CircleGeometry(.5,24);
 const m=new THREE.MeshStandardMaterial({color:'#5fb4e6',emissive:'#1d5f8c',emissiveIntensity:.25,transparent:true,opacity:.72,roughness:.03,metalness:.25,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 const g=new THREE.Group(); for(const [x,z,sx,sz] of [[0,0,.72,.54],[.24,.17,.26,.2],[-.26,-.12,.22,.17],[.06,-.27,.17,.13]]){ const e=new THREE.Mesh(incPG,m); e.rotation.x=-Math.PI/2; e.scale.set(sx,sz,1); e.position.set(x,0,z); e.renderOrder=2; g.add(e); }
 const hl=new THREE.Mesh(incPG,new THREE.MeshBasicMaterial({color:'#e8f7ff',transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5})); hl.rotation.x=-Math.PI/2; hl.scale.set(.22,.07,1); hl.position.set(-.1,.002,-.08); hl.renderOrder=3; g.add(hl);
 g.rotation.y=Math.random()*6.28; g.position.set(I.x+.5,.012,I.y+.5); fxRoot.add(g); I.g=g; }

// ---------- la caisse : le joueur encaisse ----------
function incCashTick(rt,live){ if(!incCash()) return; for(const c of custs){ if(c.st!=='bill'||c.dead||c.nb||c.dash) continue;
  if(c.cashT===undefined){ c.cashT=c.cashT0=incCashTime()*(incS().seen.cash?1:1.8); incTeach('cash'); }
  if(!live) continue; c.cashT-=rt; if(c.cashT<=0) incUnpaid(c); } }
function incUnpaid(c){ const v=incPrice(c), D=incDay(); c.cashT=undefined; D.unp=(D.unp||0)+1; floatAt(c.fx,c.fy-.5,'Parti sans payer ! −'+v,'#e5484d'); c.say='Personne pour encaisser ?'; c.sayT=1.6; angry(c); }
function incCashTap(c){ if(!c||!incLive()) return; const grp=(c.grp?c.grp.m:[c]).filter(m=>!m.dead&&m.st==='bill'); if(!grp.length) return;
 const fast=grp.every(m=>m.cashT===undefined||m.cashT>(m.cashT0||10)*.5);
 if(rush){ try{ spendHelp(); }catch(e){} }
 incCashing=fast?2:1; try{ for(const m of grp){ m.billBy=null; m.cashT=undefined; finishMeal(m); } }catch(e){ console.warn(e); } finally{ incCashing=0; }
 try{ achCash(fast); }catch(e){}
 dailyAdd('help',1); incGest(c.fx,c.fy); vib(8); hud(); try{ goalDraw(true); }catch(e){} }
// le pourboire du patron qui encaisse lui-même : plus gros s'il est rapide (remplace la bulle de pourboire)
function incCashTip(c,price){ const b=Math.max(1,Math.round(price*(incCashing===2?.25:.1))); earn(b); dayAdd('tip',b); dailyAdd('earned',b); floatAt(c.fx,c.fy-.6,(incCashing===2?'Rapide ! +':'+')+b,null,true); }

// ---------- le client pressé ----------
function incVipTick(dt){ for(const c of custs){
  if(c.vk){ if(c.vip&&!c.vipDone&&(c.st==='wait'||c.st==='order')) c.pat-=dt*patRate()*.8; continue; }
  c.vk=1; if(!incOn()||!incUnl('vip')||c.grp||c.nb||c.kidF||c.st==='pass'||!['enter','queue','walkIn','look','host'].includes(c.st)) continue;
  if(Math.random()<.05+.06*Math.min(1,incP())+(incDiff()===2?.04:0)){ c.vip=1; incTeach('vip'); } } }
function incMeal(c,price,sat){ if(warming||cine) return; incSvAdd('meal',sat);
 if(c&&c.vip&&!c.vipDone){ c.vipDone=1; if(sat>=65){ const b=Math.max(2,Math.round(price*.8*(incDiff()===2?1.25:1))); earn(b); dayAdd('tip',b); dailyAdd('earned',b); floatAt(c.fx,c.fy-.9,'Client pressé ravi ! +'+b,null,true); incSvAdd('vip'); try{ stAdd('vip'); }catch(e){} } else floatAt(c.fx,c.fy-.9,'Le client pressé a trop attendu','#8a8f96'); } }
function incLost(c){ if(warming||cine) return; incSvAdd('lost'); rateHit(); incRepAdd(.035); if(c&&c.vip) c.vipDone=1; }

// ---------- la médaille de chaque service ----------
function incSvOn(){ return incDiff()>0&&!!state.tuto&&dayOf().n>=2&&!dayOf().night; }
function incSvNew(k){ return {k,n:0,ss:0,lost:0,ok:0,ko:0,vip:0}; }
function incSvCur(){ const d=dayOf(); if(d.night) return null; if(!d.sv) d.sv=incSvNew(svcNow().k); return d.sv; }
function incSvAdd(k,v){ if(!incSvOn()) return; const s=incSvCur(); if(!s||s.fin) return; if(k==='meal'){ s.n++; s.ss+=v; } else s[k]=(s[k]||0)+1; }
function incSvTick(){ if(!incSvOn()) return; const d=dayOf(), s=incSvCur(); if(!s||s.fin) return;
 if(d.closing){ s.fin=1; incSvEnd(s); return; }
 const k=svcNow().k; if(s.k!==k){ incSvEnd(s); d.sv=incSvNew(k); } }
function incSvEnd(s){ const tot=s.n+s.lost; if(tot<4) return;
 const SV=SVC.find(x=>x.k===s.k)||SVC[0], avg=s.n?Math.round(s.ss/s.n):0, mx=Math.max(1,Math.round(tot*.06)), ni=s.ok+s.ko;
 const C=[{ok:s.lost<=mx,t:'Accueil',s:s.lost?s.lost+' client'+(s.lost>1?'s':'')+' parti'+(s.lost>1?'s':'')+' fâché'+(s.lost>1?'s':''):'personne n’est parti fâché'},
          {ok:!ni||s.ok/ni>=.8,t:'Réflexes',s:ni?s.ok+' imprévu'+(s.ok>1?'s':'')+' réglé'+(s.ok>1?'s':'')+' sur '+ni:'aucun imprévu'},
          {ok:avg>=75,t:'Régal',s:'clients ravis à '+avg+' %'}];
 const n=C.filter(x=>x.ok).length, L=state.level||1, rw=Math.round([0,1,2,4][n]*(8+3*L)*(incDiff()===2?1.5:1));
 if(rw) earn(rw); if(n) addXP([0,2,4,8][n]);
 const D=incDay(), S2=incS(); if(n>=2) state.rep=Math.max(0,(state.rep||0)-(n===3?.25:.1)); if(n===3){ D.o++; S2.gold++; S2.gs++; S2.gb=Math.max(S2.gb,S2.gs); dailyAdd('gold',1); } else { if(n===2) D.a++; else if(n===1) D.b++; S2.gs=0; }
 incReport={sv:SV.n,n,C,rw,gs:S2.gs,shown:false}; try{ achSv(s,n); }catch(e){} }
const INC_MED=['Service à revoir','Médaille de bronze','Médaille d’argent','Médaille d’or'], INC_MEDC=['#9aa0a6','#c8834a','#b9c3cc','#f2b33d'];
function incRepShow(){ const R=incReport; if(!R) return; R.shown=true; let e=document.getElementById('svr');
 if(!e){ e=document.createElement('button'); e.id='svr'; document.body.appendChild(e); e.addEventListener('click',()=>{ e.classList.remove('on'); }); }
 e.style.setProperty('--mc',INC_MEDC[R.n]);
 e.innerHTML=`<span class="svM">${INC_SVG.medal}</span><span class="svT"><b>${R.sv}</b><span>${INC_MED[R.n]}${R.rw?' · +'+fmt(R.rw)+' <i class="coin sm"></i>':''}${R.n===3&&R.gs>1?' · '+R.gs+' d’affilée':''}</span><em>${R.C.map(x=>`<i class="${x.ok?'ok':''}">${x.ok?'✓':'✗'} ${x.t}</i>`).join('')}</em></span>`;
 const evOn=!!document.querySelector('#evb:not(.hide)'); e.className='on'+(evOn?' low':'')+' m'+R.n; sfx(R.n===3?'level':'pop'); if(R.n===3) vib([15,30,15]);
 clearTimeout(e._t); e._t=setTimeout(()=>e.classList.remove('on'),7500); }
function incDayHTML(d){ const X=d.ix; if(!X||!(X.ok+X.ko+X.o+X.a+X.b+(X.unp||0))) return ''; const r=(l,v)=>`<div class="bl"><span>${l}</span><b>${v}</b></div>`;
 return (X.unp?r('Partis sans payer (caisse)',X.unp):'')+(X.ok+X.ko?r('Imprévus réglés',X.ok+' / '+(X.ok+X.ko)):'')+(X.o+X.a+X.b?r('Médailles de service',[[X.o,'or'],[X.a,'argent'],[X.b,'bronze']].filter(x=>x[0]).map(x=>x[0]+' '+x[1]).join(' · ')):''); }

// ---------- la note qui baisse se voit ----------
let rateHitT=0;
function rateHit(){ if(warming) return; const e=document.getElementById('pRate'); if(!e) return; const now=performance.now(); if(now-rateHitT<700) return; rateHitT=now; e.classList.remove('hit'); void e.offsetWidth; e.classList.add('hit'); }

// ---------- sons ----------
function incSfx(k){ if(!state.sound||!AC) return; try{
 if(k==='alarm'){ tone(988,0,.08,'square',.03); tone(784,.1,.08,'square',.03); tone(988,.2,.11,'square',.03); }
 else if(k==='tap'){ tone(700,0,.05,'triangle',.06); tone(880,.03,.05,'triangle',.04); }
 else if(k==='win'){ tone(784,0,.07,'triangle',.06); tone(1047,.06,.08,'triangle',.06); tone(1319,.12,.15,'triangle',.05); }
 else if(k==='fail'){ tone(262,0,.18,'sawtooth',.035); tone(196,.14,.28,'sawtooth',.035); }
}catch(e){} }

// ---------- la première fois : Odette prévient ----------
function incIntro(T){ queueModal(()=>({title:T,html:`<div class="dlg"><div class="dlgA" style="width:64px;height:64px;border-color:${SAGA_WHO.o[1]}">${whoImg('o')}</div><div class="dlgT">${scT('« À partir d’aujourd’hui, {{N}}, la caisse, c’est toi. Et un bistrot, ce n’est jamais tranquille : une poêle qui flambe, un verre renversé, un client qui râle… Ton équipe ne peut pas tout faire. »')}</div></div>
 <div class="incL"><div><span class="incI cash">${INC_SVG.cash}</span><p><b>La caisse.</b> Quand une table veut payer, touche sa bulle verte avant que le cercle se vide, sinon elle part sans payer. Plus tu es rapide, plus le pourboire est gros.</p></div>
 <div><span class="incI fire">${INC_SVG.fire}</span><p><b>Les imprévus.</b> Touche-les avant que leur cercle se vide. Certains demandent plusieurs coups. Chacun réglé te rend 1 d’énergie.</p></div>
 <div><span class="incI rep">★</span><p><b>Ta réputation.</b> Chaque client parti fâché, chaque imprévu raté fait baisser ta note. Elle remonte quand le service est bien tenu.</p></div>
 <div><span class="incI med">${INC_SVG.medal}</span><p><b>Heures de pointe</b> à midi et en début de soirée : les clients arrivent en masse. À la fin de chaque service, une médaille.</p></div></div>
 <p class="center sub">Trop dur, ou pas assez ? Réglages → Jeu → Difficulté.</p><p class="center"><button class="b green" data-a="close">C’est parti !</button></p>`})); }

// ---------- dessin : bulles, flèches vers les imprévus hors de l'écran, badges dorés ----------
const incEls=new Map(); let incBox=null, incHud=null, incHudT=0;
// les boutons de l'interface (colonnes de côté, barre du haut, objectif…) : une bulle cachée dessous devient une flèche
const INC_HUD=['#top','#bottom','#side','#sideL','#goal','#dx','#sJour','#sMg','#sSpd','#sVille','#el','#rushbar','#evb'];
function incHudRects(){ const now=performance.now(); if(incHud&&now-incHudT<500) return incHud; incHudT=now; const R=[]; let l=0, r=innerWidth, t=0, b=innerHeight;
 for(const q of INC_HUD){ const e=document.querySelector(q); if(!e) continue; const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.1||e.classList.contains('hide')) continue;
  for(const el of (q==='#top'||q==='#bottom'||q==='#side'||q==='#sideL')?[...e.children]:[e]){ const k=el.getBoundingClientRect(); if(k.width<4||k.height<4) continue; R.push(k);
   if(k.right<innerWidth*.34&&k.top>60&&k.bottom<innerHeight-120) l=Math.max(l,k.right); else if(k.left>innerWidth*.66&&k.top>60&&k.bottom<innerHeight-120) r=Math.min(r,k.left);
   const mx=(k.left+k.right)/2; if(k.top<innerHeight*.3&&mx>innerWidth*.3&&mx<innerWidth*.7&&k.width<innerWidth*.8) t=Math.max(t,k.bottom); if(k.bottom>innerHeight*.6&&k.width>innerWidth*.4) b=Math.min(b,k.top); } }
 incHud={R,l,r,t,b}; return incHud; }
const incUnder=(H,x,y)=>H.R.some(k=>x>k.left-20&&x<k.right+20&&y>k.top-20&&y<k.bottom+20);
function incAnchor(I){ switch(I.k){ case 'fire': case 'broke': return [I.f.x+.5,1.32,I.f.y+.5]; case 'spill': return [I.x+.5,.32,I.y+.5]; case 'complain': return [I.c.fx+.5,1.62,I.c.fy+.5]; default: return [I.c.fx+.5,1.5,I.c.fy+.5]; } }
function incCell(I){ const a=incAnchor(I); return [a[0]-.5,a[2]-.5]; }
function incGo(id){ const I=incs.find(x=>x.id===id); if(!I) return; const a=incAnchor(I); incPan=[a[0],a[2]]; sfx('pop'); }
function incDraw(){
 if(!incBox){ incBox=document.createElement('div'); incBox.id='incov'; document.body.appendChild(incBox);
  incBox.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation(); try{ audioInit(); }catch(_){} if(b.dataset.go) incGo(+b.dataset.go); else if(b.dataset.goc){ const c=custs.find(c=>c.id===+b.dataset.goc); if(c){ incPan=[c.fx+.5,c.fy+.5]; sfx('pop'); } } else if(b.dataset.cash){ const id=+b.dataset.cash; incCashTap(custs.find(c=>c.id===id)); } else incTap(+b.dataset.id); }); }
 if(incReport&&!incReport.shown&&mode==='play'&&!scOn&&!cine&&!ui.panel) incRepShow();
 const vis=mode==='play'&&!ui.panel&&!(typeof visit!=='undefined'&&visit.on)&&!document.body.classList.contains('watch')&&!cine&&!scOn&&!titleOn;
 const used=new Set(), W=innerWidth, H=innerHeight, HU=incHudRects(), L=Math.min(W*.4,Math.max(30,HU.l+28)), R=Math.max(W*.6,Math.min(W-30,HU.r-28)), T=Math.min(H*.4,Math.max(110,HU.t+34)), B=Math.max(H*.55,Math.min(H-150,HU.b-34));
 const PS=[], AS=[];
 if(vis){
  for(const I of incs){ if(I.done) continue; const a=incAnchor(I); const [sx,sy,sz]=toScreen(a[0],a[1],a[2]);
   const off=sz>1||sx<16||sx>W-16||sy<24||sy>H-24||incUnder(HU,sx,sy), key='i'+I.id;
   let el=incEls.get(key); if(!el){ el=document.createElement('button'); el.className='inc '+I.k; el.dataset.id=I.id; el.setAttribute('aria-label',INC_N[I.k]); el.innerHTML='<i>'+INC_SVG[I.k]+'</i>'+(I.need>1?'<span class="pp">'+'<b></b>'.repeat(I.need)+'</span>':''); incBox.appendChild(el); incEls.set(key,el); }
   used.add(key);
   const p=I.k==='spill'?100:Math.max(0,Math.min(100,100*I.t/I.T)), urg=I.k!=='spill'&&(I.t<2.6||p<30), pk=Math.round(p)+'|'+urg+'|'+I.n+'|'+off;
   if(el._k!==pk){ el._k=pk; el.style.setProperty('--p',p.toFixed(0)+'%'); el.classList.toggle('urg',urg); el.classList.toggle('off',off); if(I.need>1){ const bs=el.querySelectorAll('.pp b'); bs.forEach((b,i)=>b.classList.toggle('on',i<I.n)); } }
   if(!off) PS.push({el,x:sx,y:sy});
   if(off){ const cx=(L+R)/2, cy=(T+B)/2; let dx=sx-cx, dy=sy-cy; if(sz>1){ dx=-dx; dy=-dy; } const k=Math.min(Math.abs((dx>0?R-cx:cx-L)/(dx||1e-6)),Math.abs((dy>0?B-cy:cy-T)/(dy||1e-6)));
    const ax=cx+dx*k, ay=cy+dy*k, ak='a'+I.id; let ar=incEls.get(ak);
    if(!ar){ ar=document.createElement('button'); ar.className='incA '+I.k; ar.dataset.go=I.id; ar.setAttribute('aria-label','Aller voir : '+INC_N[I.k]); ar.innerHTML='<u></u><i>'+INC_SVG[I.k]+'</i>'; incBox.appendChild(ar); incEls.set(ak,ar); }
    used.add(ak); AS.push({el:ar,x:ax,y:ay}); ar.style.setProperty('--a',(Math.atan2(dy,dx)*180/Math.PI).toFixed(0)+'deg'); }
  }
  if(incCash()) for(const c of custs){ if(c.st!=='bill'||c.dead||c.nb||c.dash||c.cashT===undefined) continue; if(c.grp&&c.grp.m.find(m=>!m.dead&&m.st==='bill'&&!m.nb)!==c) continue;
   const [sx,sy,sz]=toScreen(c.fx+.5,1.42,c.fy+.5);
   if(sz>1||sx<16||sx>W-16||sy<24||sy>H-24||incUnder(HU,sx,sy)){ const cx=(L+R)/2, cy=(T+B)/2; let dx=sx-cx, dy=sy-cy; if(sz>1){ dx=-dx; dy=-dy; } const k=Math.min(Math.abs((dx>0?R-cx:cx-L)/(dx||1e-6)),Math.abs((dy>0?B-cy:cy-T)/(dy||1e-6))), ak='ac'+c.id;
    let ar=incEls.get(ak); if(!ar){ ar=document.createElement('button'); ar.className='incA cash'; ar.dataset.goc=c.id; ar.setAttribute('aria-label','Aller encaisser'); ar.innerHTML='<u></u><i>'+INC_SVG.cash+'</i>'; incBox.appendChild(ar); incEls.set(ak,ar); }
    used.add(ak); AS.push({el:ar,x:cx+dx*k,y:cy+dy*k}); ar.style.setProperty('--a',(Math.atan2(dy,dx)*180/Math.PI).toFixed(0)+'deg'); continue; }
   const key='c'+c.id;
   let el=incEls.get(key); if(!el){ el=document.createElement('button'); el.className='inc cash'; el.dataset.cash=c.id; el.setAttribute('aria-label','Encaisser'); el.innerHTML='<i>'+INC_SVG.cash+'</i>'; incBox.appendChild(el); incEls.set(key,el); }
   used.add(key); const p=Math.max(0,Math.min(100,100*c.cashT/(c.cashT0||10))), urg=c.cashT<3.5, pk=Math.round(p)+'|'+urg; if(el._k!==pk){ el._k=pk; el.style.setProperty('--p',p.toFixed(0)+'%'); el.classList.toggle('urg',urg); el.classList.toggle('fast',p>50); }
   PS.push({el,x:sx,y:sy}); }
  // deux bulles voisines (deux fourneaux côte à côte) ne se cachent pas l'une l'autre
  for(let it=0;it<4;it++) for(let i=0;i<PS.length;i++) for(let j=i+1;j<PS.length;j++){ const A=PS[i], B=PS[j]; let dx=B.x-A.x, dy=B.y-A.y; const d=Math.hypot(dx,dy); if(d>=56) continue; if(d<.5){ dx=1; dy=0; } const k=(56-Math.max(d,.5))/2/Math.max(d,.5); A.x-=dx*k; A.y-=dy*k; B.x+=dx*k; B.y+=dy*k; }
  for(const P of PS) P.el.style.transform=`translate(${(P.x-27).toFixed(1)}px,${(P.y-27).toFixed(1)}px)`;
  for(let it=0;it<4;it++) for(let i=0;i<AS.length;i++) for(let j=i+1;j<AS.length;j++){ const A=AS[i], B2=AS[j]; let dx=B2.x-A.x, dy=B2.y-A.y; const d=Math.hypot(dx,dy); if(d>=50) continue; if(d<.5){ dx=0; dy=1; } const k=(50-Math.max(d,.5))/2/Math.max(d,.5); A.x-=dx*k; A.y-=dy*k; B2.x+=dx*k; B2.y+=dy*k; }
  for(const P of AS) P.el.style.transform=`translate(${(P.x-22).toFixed(1)}px,${(P.y-22).toFixed(1)}px)`;
  for(const c of custs){ if(!c.vip||c.vipDone||c.dead||!['enter','look','host','walkIn','queue','menu','order','wait','eat','bill'].includes(c.st)) continue;
   const [sx,sy,sz]=toScreen(c.fx+.5,c.sitting?1.74:1.62,c.fy+.5); if(sz>1||sx<-20||sx>W+20||sy<-20||sy>H+20) continue; const key='v'+c.id;
   let el=incEls.get(key); if(!el){ el=document.createElement('div'); el.className='vipB'; el.innerHTML=INC_SVG.vip; incBox.appendChild(el); incEls.set(key,el); }
   used.add(key); const p=Math.max(0,Math.min(100,c.pat)).toFixed(0); if(el._p!==p){ el._p=p; el.style.setProperty('--p',p+'%'); }
   el.style.transform=`translate(${(sx-15).toFixed(1)}px,${(sy-15).toFixed(1)}px)`; }
 }
 for(const [k,el] of incEls) if(!used.has(k)){ el.remove(); incEls.delete(k); }
}
// effets 3D (flammes, étincelles, fumée, reflets des flaques) et caméra qui file vers l'imprévu touché sur le bord
let incFxA=0; const _iv=new THREE.Vector3();
function incTop(f){ const o=fObjs.get(f.id); if(o&&o.g.userData.steamAt) return o.g.localToWorld(_iv.copy(o.g.userData.steamAt)); return _iv.set(f.x+.5,.95,f.y+.5); }
function incFx(dt){
 if(incPan){ const k=Math.min(1,dt*7); cam.tx+=(incPan[0]-cam.tx)*k; cam.tz+=(incPan[1]-cam.tz)*k; try{ clampCam(); }catch(e){} if(Math.hypot(incPan[0]-cam.tx,incPan[1]-cam.tz)<.06) incPan=null; }
 const shown=mode==='play'; for(const I of incs){ if(I.g&&I.g.visible!==shown) I.g.visible=shown; if(I.fl&&I.fl.visible!==shown) I.fl.visible=shown; }
 if(!shown) return;
 incFxA+=dt; if(incFxA<.06) return; const st=incFxA; incFxA=0;
 for(const I of incs){ if(I.done) continue;
  if(I.k==='fire'){ const v=incTop(I.f); if(I.fl){ if(!I.fl.parent) fxRoot.add(I.fl); I.fl.position.set(v.x,v.y-.04,v.z); const T2=performance.now()/1000; I.fl.children.forEach((m,i)=>{ const [sx,sy]=m.userData.b, k=1+.22*Math.sin(T2*17+i*2.1)+.12*Math.sin(T2*29+i), w=1+.1*Math.sin(T2*23+i*1.3), sh=Math.max(.45,I.t/I.T); m.scale.set(sx*w*(.7+.3*sh),sy*k*(.6+.4*sh)*(1-.18*I.n),sx*w*(.7+.3*sh)); m.position.y=m.scale.y/2; m.rotation.y=T2*(1+i*.3); }); }
   for(let i=0;i<(LITE?1:2);i++) spawnPart(GLOW,pick(['#ff7a1a','#ffb020','#ff4d1a','#ffd23f']),v.x+rnd(-.12,.12),v.y+.02,v.z+rnd(-.12,.12),rnd(-.1,.1),rnd(.9,1.5),rnd(-.1,.1),rnd(.35,.6),rnd(.22,.36),.4,true);
   if(Math.random()<.35) spawnPart(GLOW,'#4b4f55',v.x,v.y+.25,v.z,rnd(-.05,.05),.5,rnd(-.05,.05),1.4,.3,2.2,false); }
  else if(I.k==='broke'){ const v=incTop(I.f); if(Math.random()<.3) for(let i=0;i<(LITE?3:7);i++) spawnPart(STAR,pick(['#ffd23f','#fff3a8','#9fe0ff']),v.x,v.y,v.z,rnd(-1,1),rnd(.6,1.6),rnd(-1,1),rnd(.25,.45),.17,0,true);
   if(Math.random()<.3) spawnPart(GLOW,'#8d939a',v.x+rnd(-.1,.1),v.y+.1,v.z+rnd(-.1,.1),0,.4,0,1.5,.26,2.4,false); }
  else if(I.k==='spill'&&I.g){ if(!I.g.parent) fxRoot.add(I.g); I.ph=(I.ph||0)+st; I.g.children[0].material.opacity=.55+.08*Math.sin(I.ph*3); }
 }
 for(const s of incSmoke){ const v=incTop(s.f); if(Math.random()<.6) spawnPart(GLOW,pick(['#3d4045','#55595f']),v.x+rnd(-.1,.1),v.y+.1,v.z+rnd(-.1,.1),rnd(-.06,.06),.55,rnd(-.06,.06),1.8,.34,2.6,false); }
}

// réglages → Jeu : la difficulté
function incDiffHTML(){ const d=incDiff(); return `<h3>Difficulté</h3><div class="row col"><div class="info"><div class="t">Le rythme du service</div><div class="sub">${['Détente : pas d’imprévus, des clients patients. Ton équipe encaisse et gère tout, comme avant.','Normale : tu tiens la caisse et tu règles les imprévus, avec des heures de pointe à midi et le soir. Ça se corse à mesure que le bistrot grandit.','Chef : caisse pressée, imprévus en rafale, clients impatients, réputation fragile. Pour ceux qui trouvent ça encore trop facile. Les médailles rapportent 50 % de plus.'][d]}</div></div>${oSeg('diff',[[0,'Détente'],[1,'Normale'],[2,'Chef']],d)}</div>`; }
