// joueur automatique pour l'équilibrage
window.BOT={log:[],cfg:{help:0.5,invest:2,maxLvl:6},lastN:0,tipC:0,tipV:0};
window.botSeats=function(){ return seatCount(); }
window.botAddSet=function(){ // table + 2 chaises
  const T=FURN.table, C=FURN.chair; if(state.coins<T.p+2*C.p) return false;
  for(let y=1;y<S-2;y++) for(let x=1;x<S-1;x++){
    if(fAt(x,y)||fAt(x-1,y)||fAt(x+1,y)) continue; if(zoneErr('table',x,y)||zoneErr('chair',x-1,y)||zoneErr('chair',x+1,y)) continue;
    const n0=state.furn.length; state.furn.push({id:state.nid++,t:'table',x,y},{id:state.nid++,t:'chair',x:x-1,y},{id:state.nid++,t:'chair',x:x+1,y}); rebuildOcc();
    let ok=false; try{ ok=layoutOK()&&!diningBad(); }catch(e){}
    if(ok){ state.coins-=T.p+2*C.p; try{ fixZones(); assignHomes(); }catch(e){} return true; }
    state.furn.length=n0; rebuildOcc(); }
  return false; }
window.botHire=function(role,q){ const T=TIERS[q]; if(state.coins<T.fee||state.staff.length>=maxStaff()||state.level<T.u||state.level<ROLES[role].u) return false; ACT.hrole(role); ACT.hire3(role+':'+q); return true; }
window.botMenu=function(){ const slots=menuSlots(); const un=DISH.filter(d=>d.u<=state.level); const byC={}; for(const d of un) (byC[d.c]=byC[d.c]||[]).push(d);
  const want=[]; for(const c in byC){ byC[c].sort((a,b)=>b.p-a.p); want.push(byC[c][0]); } const rest=un.filter(d=>!want.includes(d)).sort((a,b)=>b.p-a.p); while(want.length<slots&&rest.length) want.push(rest.shift());
  state.menu=want.slice(0,slots).map(d=>d.id); }
window.botEquip=function(t){ const F=FURN[t]; if(!F||state.level<(F.u||1)||state.coins<F.p) return false; let f=null; try{ f=autoPlace(t); }catch(e){} if(!f) return false; state.coins-=F.p; try{ fixZones(); assignHomes(); }catch(e){} return true; }
window.botUpg=function(spare){ let did=false; for(const id of state.menu){ const d=DISHM[id], L=lvl(id); if(L>=BOT.cfg.maxLvl) continue; let cost=0; for(const k of d.ing){ const need=Math.max(0,L-(state.inv[k]||0)); cost+=need*(ING[k].b||Math.round(ING[k].g.c*1.3)); } if(d.ing.some(k=>ING[k].r>=3)) continue; if(cost>spare) continue; for(const k of d.ing){ const need=Math.max(0,L-(state.inv[k]||0)); state.inv[k]=(state.inv[k]||0)+need; } state.coins-=cost; dayAdd('ing',cost); spare-=cost; ACT.upg(id); did=true; } return did; }
window.botMorning=function(){ const d=dayOf(); botMenu(); if(state.story) delete state.story.doneDay;
  const fixed=wagesCost()+elecCost()+LOAN; if(state.tot){ } try{ dailyAdd('help',6); dailyAdd('harvest',1); if(d.n%2===0){ dailyAdd('rush',120+d.n*8,true); } }catch(e){} let guard=0; const kq=BOT.kq||0, I=BOT.cfg.invest;
  while(guard++<14){ const seats=botSeats(), st=state.staff, chefs=st.filter(s=>s.role==='chef').length, waiters=st.filter(s=>s.role==='waiter').length, spare=state.coins-fixed*0.6;
    if(spare<160&&st.filter(s=>s.role==='chef').length&&st.filter(s=>s.role==='waiter').length) break;
    const q=state.level>=4&&spare>900?2:state.level>=2&&spare>400?1:0, kind=k=>state.furn.filter(f=>kindOf(f)===k).length;
    if(chefs<1){ if(!botHire('chef',I?q:0)) break; continue; } if(waiters<1){ if(!botHire('waiter',I?q:0)) break; continue; } if(!I) break;
    if(I>=2){
      if(kind('prep')<Math.min(3,chefs)&&botEquip('prep')) continue; if(kind('oven')<Math.min(2,Math.ceil(chefs/2))&&botEquip('oven')) continue; if(seats/waiters>8&&st.length<maxStaff()&&botHire('waiter',q)) continue; if(seats/chefs>8&&st.length<maxStaff()&&botHire('chef',q)) continue; if(kq>1.2&&!BOT.kfix){ BOT.kfix=1; if(st.length<maxStaff()&&chefs<=waiters+1&&botHire('chef',q)) continue; if(kind('stove')<chefs+1&&botEquip('stove')) continue; if(kind('prep')<chefs&&botEquip('prep')) continue; if(kind('oven')<Math.ceil(chefs/2)+1&&botEquip('oven')) continue; }
      if((BOT.wq||0)>.35&&!BOT.wfix&&st.length<maxStaff()){ BOT.wfix=1; if(botHire('waiter',q)) continue; }
      if(state.level>=2&&!st.some(s=>s.role==='cleaner')&&seats>=12&&st.length<maxStaff()&&spare>500){ if(botHire('cleaner',0)) continue; }
      if(rParts&&rParts.d<1.3&&spare>350&&!BOT.dfix){ BOT.dfix=1; if(botEquip(state.level>=2?'flowers':'plant')) { BOT.dfix=0; if(guard<8) continue; } }
      if(spare>300&&botUpg(spare*.4)) continue;
    }
    if((BOT.full>0.5&&kq<1.5)||seats<8){ if(botAddSet()) continue; }
    const e=EXP.find(x=>x.s>S&&x.u<=state.level); if(e&&state.coins-fixed>e.p*1.15&&BOT.full>0.45&&kq<1.5){ ACT.expand(e.s); continue; }
    break; }
  BOT.kfix=0; BOT.wfix=0; BOT.dfix=0;
  if(!isOpen()) setOpen(true); }
window.botStory=function(){ try{ const st=state.story; if(!st||storyEnd()) return; if(storyLocked()) return; if(st.seen!==st.ch){ st.seen=st.ch; return; } const s=storyStep(); if(s&&s.ok) ACT.sstep(); }catch(e){ BOT.err=String(e); } }
window.botRun=function(steps){ // steps de 0,1 s
  for(let i=0;i<steps;i++){ const d=dayOf();
    if(d.night||(!isOpen()&&!d.closing)){ botDayLog(); botMorning(); }
    update(.1);
    if(i%10===0){ // occupation, coups de main
      BOT.occN=(BOT.occN||0)+1; BOT.occS=(BOT.occS||0)+custs.filter(c=>c.sitting).length/Math.max(1,botSeats()); BOT.qS=(BOT.qS||0)+custs.filter(c=>c.st==='queue').length; BOT.kS=(BOT.kS||0)+orders.filter(o=>o.st==='wait').length; BOT.wS=(BOT.wS||0)+custs.filter(c=>c.sitting&&(c.st==='menu'||c.st==='call'||c.st==='seated')).length/Math.max(1,botSeats());
      for(const m of moms.slice()) if(Math.random()<BOT.cfg.help*.25){ try{ if(m.k==='tip'){ BOT.tipC++; BOT.tipV+=m.v||0; } moms=moms.filter(x=>x!==m); if(!evMom(m,m.x||0,m.z||0)){ if(m.k==='tip'){ earn(m.v); dayAdd('tip',m.v); } else if(m.fn) m.fn(); } }catch(e){} }
      if(trash.length>3&&Math.random()<BOT.cfg.help) trash.shift();
      botStory(); while(modalQ.length){ const f=modalQ.shift(); try{ const r=typeof f==='function'?f():f; if(r&&typeof r.html!=='string') throw new Error('modal sans html'); }catch(e){ (BOT.merr=BOT.merr||[]).push(String(e).slice(0,160)); } } }
  } return BOT.log.length; }
window.botDayLog=function(){ const d=dayOf(), h=d.hist[d.hist.length-1]; if(!h||h.n===BOT.lastN) return; BOT.lastN=h.n; BOT.full=BOT.occN?BOT.occS/BOT.occN:0; BOT.kq=BOT.kS/Math.max(1,BOT.occN); BOT.wq=BOT.wS/Math.max(1,BOT.occN);
  BOT.log.push({n:h.n,rev:h.rev,cost:h.cost,net:h.net,served:h.served,coins:state.coins,lvl:state.level,xp:state.xp,rating:+rating.toFixed(2),sat:Math.round(state.sat),seats:botSeats(),staff:state.staff.map(s=>s.role[0]+(s.q===undefined?1:s.q)+(s.vet?'v':'')).join(''),S,menu:state.menu.length,occ:+BOT.full.toFixed(2),q:+(BOT.qS/Math.max(1,BOT.occN)).toFixed(2),debt:state.debt,ch:state.story?state.story.ch:-1,st:state.story?state.story.step:-1,tips:BOT.tipV,ev:d.ev||0,kq:+BOT.kq.toFixed(1),wq:+BOT.wq.toFixed(2),ml:+(state.menu.reduce((a,id)=>a+lvl(id),0)/state.menu.length).toFixed(1),eq:['stove','oven','prep'].map(k=>state.furn.filter(f=>kindOf(f)===k).length).join('')});
  BOT.occN=0; BOT.occS=0; BOT.qS=0; BOT.kS=0; BOT.wS=0; BOT.tipV=0; BOT.tipC=0; }
