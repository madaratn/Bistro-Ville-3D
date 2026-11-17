# v0.23 : à l'ouverture, le restaurant est déjà en plein service (avance rapide silencieuse, sans gains)
RP("function boot(){","""function warmStart(n){
 const keep={coins:state.coins,xp:state.xp,level:state.level,served:state.served,earned:state.earned,sat:state.sat,sound:state.sound,xpS:state.staff.map(s=>s.xp)}, mq=modalQ.length, m0=mode;
 state.sound=false; mode='play';
 if(!city.ready){ buildCity(cityRoot); cityKey=S; }
 try{ n=n||1900+Math.floor(Math.random()*700); for(let i=0;i<n;i++) update(.05); }catch(e){ console.warn(e); }
 Object.assign(state,{coins:keep.coins,xp:keep.xp,level:keep.level,served:keep.served,earned:keep.earned,sat:keep.sat,sound:keep.sound});
 state.staff.forEach((s,i)=>{ if(keep.xpS[i]!==undefined) s.xp=keep.xpS[i]; });
 modalQ.length=mq; floaters=[]; items=[]; picked=null; mode=m0;
 calcRating(); hud();
}
// après un réaménagement : on repart d'un service propre (plus de client assis sur une chaise qui n'existe plus)
let editSig='';
function layoutSig(){ return JSON.stringify([state.furn.map(f=>[f.id,f.t,f.x,f.y,f.r]),state.kz,S]); }
function freshService(){
 for(const c of custs) if(c.order) c.order.cancel=true;
 custs=[]; orders=[]; drinkOrders=[]; dirty.clear(); dishStack.clear(); freeSince.clear(); cleaning.clear(); trash=[];
 city.walkers=city.walkers.filter(w=>w.end!=='resto');
 for(const f of state.furn) if(f.pull) f.pull=0;
 resetSim(); assignHomes(); for(const a of crew) if(a.home){ a.x=a.fx=a.home[0]; a.y=a.fy=a.home[1]; a.path=[]; }
 warmStart(1500);
}
function boot(){""")
RP(" if(!state.tuto) showTuto();"," warmStart();\n if(!state.tuto) showTuto();")
RP("function enterEdit(tab){ repairNotice(); mode='edit';","function enterEdit(tab){ repairNotice(); editSig=layoutSig(); mode='edit';")
RP("c.x=c.fx=n[0]; c.y=c.fy=n[1]; c.path=[]; }\n resetSim(); save();","c.x=c.fx=n[0]; c.y=c.fy=n[1]; c.path=[]; }\n if(layoutSig()!==editSig) freshService(); else resetSim();\n save();")
# garde-fou : aucun client ne reste bloqué indéfiniment
RP("function updCust(c,dt){\n c.moving=false;","function updCust(c,dt){\n c.age=(c.age||0)+dt; if(c.age>260&&!['leave','pass','queue','standUp'].includes(c.st)){ c.age=-999; if(c.order){ c.order.cancel=true; c.order=null; } dropDrink(c); if(c.table&&c.st==='bill') {} leave(c); grpCheck(c.grp); return; }\n c.moving=false;")
