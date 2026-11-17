# v0.43 : vraie gestion — nouvelle partie, prologue, équipe à recruter par niveau de métier,
# salaires, électricité, bilan de fin de journée (1 journée = 1 heure de jeu), revenus réduits
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('manage_patch',a[:70],c); js=js.replace(a,b)
RX("const SAVE_KEY='bistroville_v1';","const SAVE_KEY='bistroville_v2';")       # on repart de zéro
RX("coins:600,xp:0,level:1,","coins:150,xp:0,level:1,")
RX(" state.staff.push(mkStaffData('chef'),mkStaffData('waiter'),mkStaffData('waiter'));"," { const a=mkStaffData('chef'), b=mkStaffData('waiter'); a.q=0; b.q=0; state.staff.push(a,b); }   // il ne reste que deux apprentis")
RX("const dishPrice=d=>Math.round(d.p*1.4*(1+.18*(lvl(d.id)-1)));","const dishPrice=d=>Math.max(2,Math.round(d.p*.3*(1+.18*(lvl(d.id)-1))));")
RX("function drinkPay(c){ return c.drink&&c.drink.st==='served'?DRINKM[c.drink.k].p:0; }","function drinkPay(c){ return c.drink&&c.drink.st==='served'?Math.max(1,Math.round(DRINKM[c.drink.k].p*.4)):0; }")
RX("const staffMul=a=>1+.12*(staffLv(a.s)-1);","const staffMul=a=>tierOf(a.s).sp*(1+.1*(staffLv(a.s)-1));")
RX(" earn(price+tip);"," earn(price+tip); if(!warming){ const dp=drinkPay(c); dayAdd('food',price-dp); dayAdd('drink',dp); dayAdd('tip',tip); state.day.served++; }")
RX("if(state.coins<c) return; state.coins-=c; state.inv[k]=(state.inv[k]||0)+q;","if(state.coins<c) return; state.coins-=c; dayAdd('ing',c); state.inv[k]=(state.inv[k]||0)+q;")
RX("const away=(Date.now()-state.lastSave)/1000;","const away=0;   // plus de gains hors ligne : la journée se joue en salle")
RX("function update(dt){","function update(dt){ if(!warming) dayTick(dt);")
RX("gain=Math.round(R.score*1.2);","gain=Math.round(R.score*.5);")
RX("function dailyCheck(){","MISSIONS.forEach(m=>{ m.r=Math.round(m.r*.4/10)*10; });\nfunction dailyCheck(){")
RX(" if(!state.tuto) showTuto();"," gestionInit();\n if(!state.prolog) prologue(()=>{ if(!state.tuto) showTuto(); }); else if(!state.tuto) showTuto();")
RX("if(!state.story&&state.level>=2&&!warming){","if(!state.story&&state.prolog&&state.tuto&&!warming){")
RX("'<button id=\"sEn\" aria-label=\"Énergie\"></button>","'<button id=\"sJour\" aria-label=\"Journée et comptes\"></button><button id=\"sEn\" aria-label=\"Énergie\"></button>")
RX("if(b.id==='sSto') return openPanel('story');","if(b.id==='sJour') return openPanel('gestion'); if(b.id==='sSto') return openPanel('story');")
RX(" sideInit(); energyTick(); storyCheck();"," sideInit(); energyTick(); storyCheck(); { const d=dayOf(), h=8+d.t/DAY_LEN*15, hh=Math.floor(h), mm=Math.floor((h-hh)*60/5)*5; $('#sJour').innerHTML='<b>Jour '+d.n+'</b><span>'+hh+' h '+String(mm).padStart(2,'0')+'</span>'; $('#sJour').classList.toggle('neg',state.coins<0); }")
RX("const PANELS={",r"""// ===================== GESTION =====================
const DAY_LEN=3600;                                   // une journée de jeu = une heure de service
const TIERS=[{n:'Apprenti',sp:.8,wage:90,fee:40,u:1,d:'Pas cher, plein de bonne volonté, pas très rapide.'},
             {n:'Confirmé',sp:1,wage:150,fee:120,u:2,d:'Connaît le métier. Un rythme régulier.'},
             {n:'Expert',sp:1.22,wage:240,fee:300,u:4,d:'Rapide et précis. Se paie en conséquence.'}];
const tierOf=s=>TIERS[s.q===undefined?1:s.q];
const wageOf=s=>tierOf(s).wage+10*(staffLv(s)-1);       // un employé qui progresse demande un peu plus
const ELEC={stove:22,oven:28,fridge:18,bar:16,sink:9,counter:6,jukebox:9,aquarium:10,fountain:8,lamp:3};
const LOAN=80;                                        // remboursement quotidien du prêt d'Odette
const ELEC_N={stove:'Cuisinière',oven:'Four',fridge:'Frigo à boissons',bar:'Bar',sink:'Évier (eau chaude)',counter:'Passe-plat chauffant',jukebox:'Juke-box',aquarium:'Aquarium',fountain:'Fontaine',lamp:'Lampe'};
function elecParts(){ const m={}; for(const f of state.furn){ const k=kindOf(f); if(ELEC[k]) m[k]=(m[k]||0)+1; } const out=[['Éclairage et chauffage de la salle',1,30+Math.round(S*S*.15)]]; for(const k in m) out.push([ELEC_N[k],m[k],ELEC[k]*m[k]]); return out; }
const elecCost=()=>elecParts().reduce((a,p)=>a+p[2],0);
const wagesCost=()=>state.staff.reduce((a,s)=>a+wageOf(s),0);
function dayOf(){ let d=state.day; if(!d||typeof d!=='object'||d.n===undefined){ d=state.day={n:1,t:0,inc:{},exp:{},served:0,c0:state.coins,e0:state.earned,hist:[]}; } return d; }
function dayAdd(k,n){ if(!n) return; const d=dayOf(), b=(k==='ing'?d.exp:d.inc); b[k]=(b[k]||0)+n; }
let elecLast=null;
function dayTick(dt){ const d=dayOf(); d.t+=dt; if(elecLast===null) elecLast=elecCost(); else if(Math.floor(d.t)!==Math.floor(d.t-dt)){ const e=elecCost(); if(e>elecLast) toast('Électricité : +'+(e-elecLast)+' pièces par jour'); elecLast=e; }
 if(d.t>=DAY_LEN) dayEnd(); }
function dayFigures(){ const d=dayOf(), I=d.inc, meals=(I.food||0)+(I.drink||0)+(I.tip||0), other=Math.max(0,state.earned-d.e0-meals), wages=wagesCost(), elec=elecCost(), ing=d.exp.ing||0;
 const invest=Math.max(0,d.c0+meals+other-ing-state.coins); return {d,I,meals,other,wages,elec,ing,invest,op:meals+other-wages-elec-ing-LOAN}; }
function dayEnd(){ const F=dayFigures(), d=F.d; state.coins-=F.wages+F.elec+LOAN; const net=state.coins-d.c0;
 d.hist.push({n:d.n,rev:F.meals+F.other,cost:F.wages+F.elec+F.ing+LOAN,invest:F.invest,net,served:d.served}); if(d.hist.length>7) d.hist.shift();
 const row=(l,v,c)=>`<div class="bl ${c||''}"><span>${l}</span><b>${v}</b></div>`, sg=v=>(v>=0?'+':'−')+Math.abs(v), who=F.op>=0?'o':'p';
 const msg=state.coins<0?'Le compte est à découvert. Tant qu’il est dans le rouge, impossible d’acheter ou d’embaucher. Réduis les dépenses ou remplis la salle.':F.op<0?'La journée coûte plus qu’elle ne rapporte. Regarde tes salaires et tes machines.':F.op<120?'On ne perd pas d’argent. C’est déjà ça, mon grand. Demain on fera mieux.':'Belle journée ! La caisse sonne et tout le monde est payé.';
 const n=d.n, sv=d.served;
 queueModal(()=>({title:'Bilan du jour '+n,html:`<div class="bilan"><div class="bh">Recettes</div>${row('Plats',sg(F.I.food||0))}${row('Boissons',sg(F.I.drink||0))}${row('Pourboires',sg(F.I.tip||0))}${F.other?row('Missions, histoire, coups de feu',sg(F.other)):''}
  <div class="bh">Dépenses</div>${row('Salaires ('+state.staff.length+' employés)',sg(-F.wages),'neg')}${row('Électricité',sg(-F.elec),'neg')}${row('Remboursement du prêt',sg(-LOAN),'neg')}${F.ing?row('Ingrédients achetés',sg(-F.ing),'neg'):''}${F.invest?row('Achats et embauches',sg(-F.invest),'neg'):''}
  <div class="bt ${net<0?'neg':''}"><span>Résultat de la journée</span><b>${sg(net)}</b></div><div class="bl"><span>Clients servis</span><b>${sv}</b></div><div class="bl"><span>En caisse</span><b>${state.coins}</b></div></div>
  <div class="dlg"><div class="dlgA" style="width:64px;height:64px;border-color:${SAGA_WHO[who][1]}">${whoImg(who)}</div><div class="dlgT" style="text-align:center">${msg}</div></div>
  <p class="center"><button class="b" data-a="close">Commencer le jour ${n+1}</button></p>`}));
 state.day={n:d.n+1,t:0,inc:{},exp:{},served:0,c0:state.coins,e0:state.earned,hist:d.hist}; sfx('level'); save(); hud(); }
function gestionInit(){
 PANELS.staff=function(){ const full=state.staff.length>=maxStaff(); ui.hr=ui.hr&&state.level>=ROLES[ui.hr].u?ui.hr:'waiter';
  let html=`<p>Équipe : <b>${state.staff.length}/${maxStaff()}</b> · salaires : <b>${wagesCost()} pièces par jour</b>, payés chaque soir.</p>`;
  html+=state.staff.map(s=>{ const R=ROLES[s.role], L=staffLv(s), T=tierOf(s);
   return `<div class="row"><div class="info"><div class="t">${s.name} · ${R.n}</div><div class="sub"><span class="tier t${s.q===undefined?1:s.q}">${T.n}</span> niveau ${L}/5 · ${wageOf(s)} par jour</div></div><button class="b sm alt" data-a="role" data-v="${s.id}">Poste</button>${state.staff.length>1?`<button class="b sm alt" data-a="fire" data-v="${s.id}">Renvoyer</button>`:''}</div>`; }).join('');
  if(!full){ html+=`<h3>Recruter</h3><div class="chips">`+Object.entries(ROLES).map(([k,r])=>state.level<r.u?`<button class="chip" disabled>${r.n} · niv. ${r.u}</button>`:`<button class="chip ${ui.hr===k?'on':''}" data-a="hrole" data-v="${k}">${r.n}</button>`).join('')+'</div>';
   html+=TIERS.map((T,i)=>{ const lock=state.level<T.u, poor=state.coins<T.fee; return `<div class="row cand ${lock?'lock':''}"><div class="info"><div class="t"><span class="tier t${i}">${T.n}</span> ${ROLES[ui.hr].n.toLowerCase()}</div><div class="sub">${T.d}<br>Vitesse ×${String(T.sp).replace('.',',')} · salaire <b>${T.wage}</b> par jour</div></div><button class="b sm" data-a="hire3" data-v="${ui.hr}:${i}" ${lock||poor?'disabled':''}>${lock?'Niveau '+T.u:'Engager · '+T.fee}</button></div>`; }).join(''); }
  else html+=`<p class="sub">Équipe complète. Une place se libère au niveau ${state.level%2?state.level+1:state.level+2}.</p>`;
  html+=`<p class="sub">Un employé gagne de l’expérience en travaillant : il va plus vite, et demande 10 pièces de plus par niveau.</p>`;
  return {title:'Mon équipe',html}; };
 ACT.hrole=v=>{ ui.hr=v; };
 ACT.hire3=v=>{ const [r,q]=v.split(':'), T=TIERS[+q]; if(state.coins<T.fee||state.staff.length>=maxStaff()||state.level<T.u) return; state.coins-=T.fee; const s=mkStaffData(r); s.q=+q; state.staff.push(s); crew.push(mkCrew(s)); assignHomes(); const a=crew[crew.length-1]; if(s.role==='chef'&&a.home){ a.x=a.fx=a.home[0]; a.y=a.fy=a.home[1]; } else { a.x=a.fx=DX; a.y=a.fy=S; a.idle=3; } sfx('coin'); toast(s.name+' rejoint l’équipe : '+T.n.toLowerCase()+', '+T.wage+' pièces par jour'); };
 PANELS.gestion=function(){ const F=dayFigures(), d=F.d, left=Math.max(0,DAY_LEN-d.t), mn=Math.ceil(left/60), row=(l,v,c)=>`<div class="bl ${c||''}"><span>${l}</span><b>${v}</b></div>`, sg=v=>(v>=0?'+':'−')+Math.abs(v);
  let html=`<div class="sagaH"><div class="sagaS" style="color:#c9772e">Jour ${d.n} · fermeture dans ${mn} min</div><div class="sagaP" style="background:#f6e6cf"><i style="width:${Math.min(100,d.t/DAY_LEN*100)}%;background:linear-gradient(90deg,#ffb347,#e5773d)"></i></div><div class="sub">Une journée dure une heure de jeu. À la fermeture : salaires, électricité, et le bilan.</div></div>`;
  html+=`<div class="bilan"><div class="bh">Recettes du jour, jusqu’ici</div>${row('Plats',sg(F.I.food||0))}${row('Boissons',sg(F.I.drink||0))}${row('Pourboires',sg(F.I.tip||0))}${F.other?row('Missions, histoire, coups de feu',sg(F.other)):''}
   <div class="bh">À payer ce soir</div>${row('Salaires',sg(-F.wages),'neg')}${state.staff.map(s=>row('· '+s.name+', '+tierOf(s).n.toLowerCase(),wageOf(s),'sub')).join('')}${row('Électricité',sg(-F.elec),'neg')}${elecParts().map(p=>row('· '+p[0]+(p[1]>1?' ×'+p[1]:''),p[2],'sub')).join('')}${row('Remboursement du prêt à la banque',sg(-LOAN),'neg')}${F.ing?row('Ingrédients achetés',sg(-F.ing),'neg'):''}
   <div class="bt ${F.op<0?'neg':''}"><span>Résultat prévu</span><b>${sg(F.op)}</b></div></div>`;
  if(d.hist.length) html+='<h3>Derniers jours</h3><div class="bilan">'+d.hist.slice().reverse().map(h=>`<div class="bl ${h.net<0?'neg':''}"><span>Jour ${h.n} · ${h.served} clients · recettes ${h.rev}, charges ${h.cost}</span><b>${sg(h.net)}</b></div>`).join('')+'</div>';
  html+='<p class="sub">Chaque machine branchée alourdit la facture d’électricité. Un employé expérimenté sert plus vite, mais son salaire tombe tous les soirs, salle pleine ou non.</p>';
  return {title:'Les comptes',html}; };
 PICON.gestion=['star','#ffcf8a','#e5a03d','#b9772e'];
}
// ---------- prologue ----------
function prologue(done){
 const st=state.staff, a=st[0]?st[0].name:'Léa', b=st[1]?st[1].name:'Hugo';
 const S_=[['o','Ce bistrot, je l’ai ouvert il y a quarante ans, avec un fourneau d’occasion et trois chaises dépareillées. Tout le quartier y a mangé un jour ou l’autre.'],
  ['o','Mais mes genoux ne suivent plus. Alors je te le confie, à toi. Tu as passé tous tes étés dans ma cuisine : tu sais déjà l’essentiel. On ne laisse jamais partir quelqu’un le ventre vide.'],
  ['s',`Quand Odette a annoncé son départ, presque toute la brigade est partie. Il ne reste que nous deux : ${a} en cuisine, ${b} en salle. On est apprentis, on ne va pas très vite… mais on reste.`],
  ['p','Pinson, de la banque. Le bistrot doit douze mille pièces et la caisse est presque vide. Chaque soir, il faudra payer les salaires, l’électricité et la mensualité du prêt. Je regarderai les comptes de près.'],
  ['o','Recrute dès que tu peux. Un apprenti coûte peu ; quelqu’un d’expérience travaille mieux, mais son salaire tombe tous les soirs. Et surveille tes machines : chacune alourdit la facture.'],
  ['o','Une dernière chose. Mon carnet de recettes… j’en ai donné les pages aux gens du quartier, une par une. Retrouve-les. Tu comprendras pourquoi.'],
  ['o','Allez. Ouvre la porte. Le reste, tu l’apprendras en servant.']];
 let i=0; const el=document.createElement('div'); el.id='prolog'; document.body.appendChild(el);
 const draw=()=>{ const [w,t]=S_[i], W=SAGA_WHO[w]; el.innerHTML=`<div class="prB"><div class="prK">L’héritage de Mamie Odette</div><div class="prA" style="border-color:${W[1]}">${whoImg(w)}</div><div class="prN" style="color:${W[1]}">${W[0]}</div><div class="prT">${t}</div><div class="prD">${S_.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div><button class="b" id="prNext">${i<S_.length-1?'Suite ›':'Ouvrir le bistrot'}</button>${i<S_.length-1?'<button class="prS" id="prSkip">Passer</button>':''}</div>`; };
 const end=()=>{ state.prolog=1; save(); el.classList.add('out'); setTimeout(()=>el.remove(),500); done&&done(); };
 el.addEventListener('click',e=>{ if(e.target.closest('#prSkip')) return end(); if(e.target.closest('#prNext')){ audioInit(); sfx('pop'); if(i<S_.length-1){ i++; draw(); } else end(); } });
 draw();
}
const PANELS={""")
# un client ne s'assoit plus « dans le vide » : on oublie toute ancienne séquence d'assise (banc, terrasse) avant d'aller à table,
# et s'il n'est pas exactement sur sa chaise au moment de s'asseoir, on l'y remet
RX("function goSeat(c,delay){","function goSeat(c,delay){ c.seq=null; c.seatGeo=null; c.wspot=null;")
RX("function sitDown(c){","function sitDown(c){ if(c.seat&&(c.x!==c.seat.x||c.y!==c.seat.y)){ c.x=c.seat.x; c.y=c.seat.y; c.fx=c.x; c.fy=c.y; c.seq=null; c.seatGeo=null; c.path=[]; }")
