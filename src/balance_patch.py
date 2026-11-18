# v0.84 : équilibrage — courses du jour, vraie dette à rembourser, cuisine moins bloquée, conseils quand ça coince
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('balance_patch',a[:70],c); js=js.replace(a,b)
RX("const LOAN=80; ","""const LOAN=80, DEBT0=50000, FOOD_COST=.34;                // minimum du prêt, dette d'Odette, part des courses dans le prix des plats
function debtLeft(){ if(state.debt===undefined) state.debt=DEBT0; return state.debt; }
const foodRate=()=>Math.max(.18,FOOD_COST-.01*['l','r','y','a','z'].reduce((s,k)=>s+(typeof mkLv==='function'?mkLv(k):0),0));
function coursesDue(){ const I=dayOf().inc; return Math.round(((I.food||0)+(I.drink||0))*foodRate()); }
function loanDue(){ const I=dayOf().inc, left=debtLeft(); if(left<=0) return 0; return Math.min(left,Math.max(LOAN,Math.round(((I.food||0)+(I.drink||0))*.10))); }
function debtDone(){ addXP(150); queueModal(()=>({title:'La dette est remboursée !',html:`<div class="hero"><img class="fi" style="width:110px;height:110px" src="${foodThumbs['who:o']||''}" alt=""></div><p class="center"><b>Le bistrot est à toi, pour de bon.</b></p><p class="center">« Trente mille pièces… Je n’aurais jamais cru voir ce jour. Plus de banquier, plus de traites : chaque soir, tout ce que tu gagnes reste dans la caisse. Je suis fière de toi, mon grand. »</p><p class="center"><button class="b green" data-a="close">Merci, Mamie</button></p>`})); }
// conseils : une phrase quand quelque chose coince vraiment, pas plus d'une toutes les trois minutes
let advT=0, advE={k:0,r:0,b:0}, advW=60, advBk=null;
function advTick(dt){ if(warming||!isOpen()||mode!=='play'||cine) return; advT+=dt; if(advT<1) return; const d=advT; advT=0; const a=Math.min(1,d/30);
 const kq=orders.filter(o=>o.st==='wait').length, rd=orders.filter(o=>o.st==='ready').length; let bl=0;
 for(const c of crew) if(c.s.role==='chef'&&c.job&&c.job.s==='next'&&c.job.o&&c.job.o.steps&&c.job.o.si<c.job.o.steps.length){ bl++; advBk=c.job.o.steps[c.job.o.si].k; }
 advE.k+=(kq-advE.k)*a; advE.r+=(rd-advE.r)*a; advE.b+=(bl-advE.b)*a; advW-=d; if(advW>0||ui.panel||rush||ev) return;
 const say=t=>{ advW=180; toast(t); };
 if(advE.b>.55) say('La cuisine attend son tour : il manque '+({prep:'un plan de travail',stove:'une plaque de cuisson',oven:'un four'}[advBk]||'un poste')+'. Déco → Cuisine.');
 else if(advE.k>2.6) say(state.staff.length<maxStaff()?'Les commandes s’empilent : un cuisinier de plus ferait du bien. Équipe → Recruter.':'Les commandes s’empilent. Un cuisinier plus expérimenté, ou une carte plus courte, soulagerait la cuisine.');
 else if(advE.r>2.4) say(state.staff.length<maxStaff()?'Les plats attendent sur le passe : il manque un serveur. Équipe → Recruter.':'Les plats attendent sur le passe : tes serveurs sont débordés.');
 else advW=20; }
""")
RX("op:meals+other-wages-elec-ing-LOAN};","loan:loanDue(),courses:coursesDue(),op:meals+other-wages-elec-ing-loanDue()-coursesDue()};")
RX("state.coins-=F.wages+F.elec+LOAN;","state.coins-=F.wages+F.elec+F.loan+F.courses; const debt0=debtLeft(); state.debt=Math.max(0,debt0-F.loan); const debtNow=state.debt; if(debt0>0&&debtNow<=0) debtDone();")
RX("cost:F.wages+F.elec+F.ing+LOAN,","cost:F.wages+F.elec+F.ing+F.loan+F.courses,")
RX("${row('Remboursement du prêt',sg(-LOAN),'neg')}","${row('Courses du jour ('+Math.round(100*F.courses/Math.max(1,(F.I.food||0)+(F.I.drink||0)))+' % des plats)',sg(-F.courses),'neg')}${F.loan?row('Dette d’Odette (reste '+debtNow+')',sg(-F.loan),'neg'):''}")
RX("${row('Remboursement du prêt à la banque',sg(-LOAN),'neg')}","${row('Courses du jour · '+Math.round(foodRate()*100)+' % du prix des plats',sg(-F.courses),'neg')}${foodRate()<FOOD_COST?row('· tes voisins du marché te font un prix',Math.round((FOOD_COST-foodRate())*100)+' % de moins','sub'):row('· deviens ami avec les commerçants du marché pour payer moins','','sub')}${debtLeft()>0?row('Dette d’Odette · 10 % des ventes',sg(-F.loan),'neg'):''}")
RX("À la fermeture : salaires, électricité, et le bilan.</div>","À la fermeture : salaires, électricité, courses, et le bilan.</div>")
RX("html+=`<div class=\"bilan\"><div class=\"bh\">Recettes du jour, jusqu’ici</div>","html+=(debtLeft()>0?`<div class=\"sagaH\"><div class=\"sagaS\" style=\"color:#8a5cc8\">Dette de Mamie Odette · reste ${debtLeft()} sur ${DEBT0}</div><div class=\"sagaP\" style=\"background:#ece2f6\"><i style=\"width:${Math.round(100*(1-debtLeft()/DEBT0))}%;background:linear-gradient(90deg,#b98cff,#8a5cf0)\"></i></div><div class=\"sub\">Chaque soir, 10 % de tes ventes partent à la banque. Quand tout est remboursé, le bistrot est à toi.</div></div>`:`<div class=\"sagaH\"><div class=\"sagaS\" style=\"color:#27a05c\">Dette remboursée · le bistrot est à toi</div></div>`); html+=`<div class=\"bilan\"><div class=\"bh\">Recettes du jour, jusqu’ici</div>")
# la finition d'un plat ne bloque plus la cuisine quand le plan de travail est pris
RX("  const r=bestPath(a,state.furn.filter(f=>ks.includes(kindOf(f))&&!stoveBusy.has(f.id)));","  const r=bestPath(a,state.furn.filter(f=>ks.includes(kindOf(f))&&!stoveBusy.has(f.id))); if(!r&&o.steps[o.si].f==='fin'){ o.si++; return; }")
# une mauvaise note fait venir moins de monde (et une bonne en fait venir autant qu'avant)
RX("spawnT=rnd(.8,1.3)*11/(.6+rating*.4);","spawnT=rnd(.8,1.3)*11/(.3+rating*.46);")
RX("function update(dt){ momTick(dt); evTick(dt);","function update(dt){ momTick(dt); evTick(dt); try{ advTick(dt); }catch(e){}")

# --- réglages chiffrés (issus des parties simulées) ---
RX("d.p*.3*(1+.18*(lvl(d.id)-1))","d.p*.3*(1+.11*(lvl(d.id)-1))")
RX("{n:'Apprenti',sp:.8,wage:90,fee:40,u:1,","{n:'Apprenti',sp:.8,wage:110,fee:60,u:1,")
RX("{n:'Confirmé',sp:1,wage:150,fee:120,u:2,","{n:'Confirmé',sp:1,wage:230,fee:180,u:2,")
RX("{n:'Expert',sp:1.22,wage:240,fee:300,u:4,","{n:'Expert',sp:1.22,wage:400,fee:450,u:4,")
RX("const ELEC={stove:22,oven:28,fridge:18,bar:16,sink:9,counter:6,jukebox:9,aquarium:10,fountain:8,lamp:3};","const ELEC={stove:33,oven:42,fridge:27,bar:24,sink:14,counter:9,jukebox:12,aquarium:14,fountain:11,lamp:4};")
RX("30+Math.round(S*S*.15)","45+Math.round(S*S*.25)")
RX("const EXP=[{s:8,u:1,p:0},{s:9,u:3,p:800},{s:10,u:5,p:2500},{s:12,u:8,p:7000},{s:14,u:12,p:18000}];","const EXP=[{s:8,u:1,p:0},{s:9,u:3,p:1000},{s:10,u:5,p:3500},{s:12,u:8,p:11000},{s:14,u:12,p:30000}];")
# agrandir ne fait plus disparaître le frigo
RX("setSize(); kitchenResized(oR); fixZones(); assignHomes(); resetSim();","const fr0=state.furn.filter(f=>kindOf(f)==='fridge').map(f=>f.t); setSize(); kitchenResized(oR); fixZones(); { const have=state.furn.filter(f=>kindOf(f)==='fridge').map(f=>f.t); for(const t of fr0){ const i=have.indexOf(t); if(i>=0){ have.splice(i,1); continue; } const f=fridgeStart()||autoPlaceEdge('fridge')||autoPlace('fridge'); if(f){ f.t=t; if(state.store&&state.store[t]>0) state.store[t]--; else state.coins-=FURN[t].p; rebuildOcc(); } } } assignHomes(); resetSim();")
RX(" else advW=20; }"," else if(!state.furn.some(f=>kindOf(f)==='fridge'||kindOf(f)==='bar')) say('Il n’y a plus de frigo en salle : plus aucune boisson ne sort. Regarde dans Déco → Réserve.');\n else advW=20; }")

RX("Quand tout est remboursé, le bistrot est à toi.</div></div>`:", r"""Quand tout est remboursé, le bistrot est à toi.</div>${state.coins>=1000?`<p class="center" style="margin:8px 0 0"><button class="b sm" data-a="debtpay">Rembourser ${Math.min(5000,debtLeft(),Math.floor(state.coins/1000)*1000)} d’avance</button></p>`:''}</div>`:""")
RX(" close:()=>closeModal(),", r""" close:()=>closeModal(),
 debtpay:()=>{ const n=Math.min(5000,debtLeft(),Math.floor(state.coins/1000)*1000); if(n<=0) return; state.coins-=n; state.debt=debtLeft()-n; sfx('coin'); if(state.debt<=0){ closeModal(); debtDone(); } else toast('Remboursé : '+n+' pièces. Il reste '+state.debt+' à la banque.'); },""")
