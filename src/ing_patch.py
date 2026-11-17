# v0.55 : ingrédients par rareté (commun → légendaire), quêtes d'exception, plats sublimés, récompenses animées
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('ing_patch',a[:70],c); js=js.replace(a,b)
RX("const DISHM=Object.fromEntries(DISH.map(d=>[d.id,d]));","""const DISHM=Object.fromEntries(DISH.map(d=>[d.id,d]));
const RAR=[['Commun','#8b95a1'],['Peu commun','#3fb56d'],['Rare','#3f8fe0'],['Épique','#9a5ce0'],['Légendaire','#f2a81d']];
Object.assign(ING,{
 basilic:{n:'Basilic',e:'🌿',g:{c:8,t:40,y:3,u:1}}, citron:{n:'Citron',e:'🍋',g:{c:12,t:70,y:3,u:2}},
 beurre:{n:'Beurre',e:'🧈',b:14}, miel:{n:'Miel',e:'🍯',b:18}, crevette:{n:'Crevette',e:'🦐',b:36}, chocolat:{n:'Chocolat',e:'🍫',b:30},
 truffe:{n:'Truffe noire',e:'🟤'}, safran:{n:'Safran',e:'🌺'}, homard:{n:'Homard',e:'🦞'}, vanille:{n:'Vanille de Tahiti',e:'🌼'},
 caviar:{n:'Caviar doré',e:'🫧'}, wagyu:{n:'Bœuf wagyu',e:'🐂'}, truffeB:{n:'Truffe blanche',e:'⚪'}});
{ const R={laitue:0,tomate:0,ble:0,carotte:0,oeuf:0,lait:0,basilic:0,citron:0, oignon:1,patate:1,fraise:1,riz:1,fromage:1,beurre:1,miel:1, piment:2,pomme:2,champi:2,viande:2,poulet:2,poisson:2,crevette:2,chocolat:2, truffe:3,safran:3,homard:3,vanille:3, caviar:4,wagyu:4,truffeB:4};
  for(const k in ING) ING[k].r=R[k]||0;
  const add={pizza:'basilic',poulet:'citron',croissant:'beurre',tarte:'beurre',tartine:'beurre',granola:'miel',sushi:'crevette',gateau:'chocolat'}; for(const d in add) if(DISHM[d]&&!DISHM[d].ing.includes(add[d])) DISHM[d].ing.push(add[d]); }
const ingEasy=()=>Object.keys(ING).filter(k=>ING[k].r<3), rarTag=i=>`<em class="rar" style="--rc:${RAR[i.r][1]}">${RAR[i.r][0]}</em>`;
function ingRoll(w){ const t=Math.random(); let r=t<w[0]?1:t<w[0]+w[1]?2:3; const ks=Object.keys(ING).filter(k=>ING[k].r===r); return pick(ks); }
// --- quêtes des ingrédients d'exception ---
const EXQ=[
 {k:'truffe',c:'fin',n:3,t:'Boucler 3 journées complètes (liste « Aujourd’hui » terminée)'},
 {k:'safran',c:'rush',n:6,t:'Lancer 6 coups de feu'},
 {k:'homard',c:'gest',n:60,t:'Faire 60 petits gestes en salle'},
 {k:'vanille',c:'silver',n:1,t:'Obtenir une maîtrise Argent sur un plat'},
 {k:'wagyu',c:'gold',n:1,t:'Obtenir une maîtrise Or sur un plat'},
 {k:'caviar',c:'s7',n:1,t:'Ouvrir le coffre 7 jours de suite'},
 {k:'truffeB',c:'season',n:1,t:'Terminer une saison de l’histoire'}];
const xq=()=>state.xq||(state.xq={c:{},got:{}}), xqAdd=(c,n=1)=>{ const X=xq(); X.c[c]=(X.c[c]||0)+n; }, xqReady=q=>Math.floor((xq().c[q.c]||0)/q.n)-(xq().got[q.k]||0), xqAny=()=>EXQ.some(q=>xqReady(q)>0);
const subB=id=>{ const k=state.sub&&state.sub[id]; return k?(ING[k].r>=4?.3:.15):0; };
// --- écran de récompense animé : coffre qui s'ouvre, puis les lots un par un ---
let rwS=null;
function rewardShow(o){ let el=$('#rw'); if(!el){ el=document.createElement('div'); el.id='rw'; document.body.appendChild(el); el.addEventListener('click',rewardNext); }
 rwS={o,i:-1,open:false}; el.className='on'+(o.chest===false?' nochest':''); el.innerHTML=`<div class="rwRays"></div><div class="rwT"><b>${o.title}</b>${o.sub?`<span>${o.sub}</span>`:''}</div><div class="rwChest"><div class="chL"><i></i></div><div class="chB"><i></i><u></u></div><div class="chG"></div></div><div class="rwCards"></div><div class="rwHint">Touche pour ouvrir</div>`;
 sfx('pop'); if(o.chest===false) setTimeout(rewardNext,250); }
function rewardNext(){ const S2=rwS, el=$('#rw'); if(!S2||!el) return; const its=S2.o.items;
 if(!S2.open){ S2.open=true; el.classList.add('open'); sfx('level'); if(navigator.vibrate) try{ navigator.vibrate([20,40,30]); }catch(e){} el.querySelector('.rwHint').textContent='Touche pour continuer'; S2.lock=performance.now()+450; setTimeout(rewardNext,650); return; }
 if(performance.now()<(S2.lock||0)) return;
 if(S2.i>=its.length-1){ if(S2.done){ el.className=''; el.innerHTML=''; rwS=null; hud(); if(ui.panel) renderPanel(); } else { S2.done=true; el.classList.add('fin'); el.querySelector('.rwHint').textContent='Touche pour récupérer'; } return; }
 S2.i++; const it=its[S2.i], r=it.r||0, c=document.createElement('div'); c.className='rwC r'+r; c.style.setProperty('--rc',it.coin?'#f2b33d':it.xp?'#3f8fe0':it.en?'#f2a81d':RAR[r][1]);
 c.innerHTML=`<div class="rwI">${it.coin?'<i class="coin big"></i>':it.xp?'<strong class="rwX">XP</strong>':it.en?'<strong class="rwX">⚡</strong>':`<img src="${it.img||''}" alt="">`}</div><b>${it.n}</b><span>${it.coin||it.xp||it.en?'':RAR[r][0]}</span>`;
 el.querySelector('.rwCards').appendChild(c); el.style.setProperty('--rc',c.style.getPropertyValue('--rc')); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); sfx(r>=3?'level':'coin'); S2.lock=performance.now()+280;
 if(S2.i>=its.length-1){ S2.done=true; el.classList.add('fin'); el.querySelector('.rwHint').textContent='Touche pour récupérer'; } }
const rwIng=(k,q=1)=>({img:foodThumbs[ING[k].e],n:ING[k].n+(q>1?' × '+q:''),r:ING[k].r});""")
RX("pick(Object.keys(ING))","pick(ingEasy())",2)
# coffre du jour : tirage par rareté + ouverture animée
a=js.index(" chest:()=>{ const D=dailyCheck();"); b=js.index("\n",a)
assert "toast(" in js[a:b]
js=js[:a]+""" chest:()=>{ const D=dailyCheck(); if(D.chest||!D.m.every(m=>m.done)) return; D.chest=true; D.streak=(D.streak||0)+1; if(D.streak%7===0) xqAdd('s7');
  const w=D.streak>=5?[.45,.4]:D.streak>=3?[.55,.37]:[.62,.34], got={}; for(let i=0;i<3;i++){ const k=ingRoll(w); got[k]=(got[k]||0)+1; state.inv[k]=(state.inv[k]||0)+1; }
  const bonus=40+20*Math.min(D.streak,10); earn(bonus); addXP(15); closeModal();
  rewardShow({title:'Coffre du jour',sub:'Série de '+D.streak+' jour'+(D.streak>1?'s':'')+(D.streak%7?' · encore '+(7-D.streak%7)+' pour le caviar doré':' · caviar doré débloqué !'),items:[...Object.keys(got).sort((a,b)=>ING[a].r-ING[b].r).map(k=>rwIng(k,got[k])),{coin:1,n:'+'+bonus+' pièces'},{xp:1,n:'+15 XP'}]}); },"""+js[b:]
RX(" claim:ix=>{ const D=dailyCheck(), m=D.m[+ix]; if(!m||m.done) return; const M2=MISSIONS[m.i]; if((D.c[M2.k]||0)<M2.n) return; m.done=true; earn(M2.r); state.en.v=Math.min(EN_MAX,state.en.v+3); addXP(8); sfx('coin');",
   " claim:ix=>{ const D=dailyCheck(), m=D.m[+ix]; if(!m||m.done) return; const M2=MISSIONS[m.i]; if((D.c[M2.k]||0)<M2.n) return; m.done=true; earn(M2.r); state.en.v=Math.min(EN_MAX,state.en.v+3); addXP(8); rewardShow({chest:false,title:'Mission réussie',sub:noEmo(M2.t),items:[{coin:1,n:'+'+M2.r+' pièces'},{en:1,n:'+3 énergie'},{xp:1,n:'+8 XP'}]}); return;")
RX(" state.en.v-=RUSH_COST; D.rush++;"," state.en.v-=RUSH_COST; D.rush++; xqAdd('rush');")
RX("  st.pages=ch+1; st.ch=ch+1;","  if((ch+1)%7===0) xqAdd('season'); st.pages=ch+1; st.ch=ch+1;")
RX(" dailyAdd('gest',1); const D=dailyCheck();"," dailyAdd('gest',1); xqAdd('gest'); const D=dailyCheck();")
RX("const s=mastS(id);\n if(s>s0&&!warming){","const s=mastS(id); if(s>s0&&s===2) xqAdd('silver'); if(s>s0&&s===3) xqAdd('gold');\n if(s>s0&&!warming){")
RX("D.fin=true; earn(50);","D.fin=true; xqAdd('fin'); earn(50);")
RX("(p=>Math.max(2,Math.round(p*(1+.06*mastS(d.id)))))(dishPrice0(d))","(p=>Math.max(2,Math.round(p*(1+.06*mastS(d.id)+subB(d.id)))))(dishPrice0(d))")
RX("const PANELS={","""const PANELS={
 exc(){ const X=xq(), own=Object.keys(ING).filter(k=>ING[k].r>=3&&state.inv[k]>0);
  if(ui.subD){ const d=DISHM[ui.subD], cur=state.sub&&state.sub[d.id];
   return {title:'Sublimer : '+d.n,html:`<p class="center sub">Choisis l’ingrédient d’exception à marier à ce plat. Épique : +15 % sur son prix. Légendaire : +30 %. Le choix est définitif pour cet ingrédient.</p>`+(own.length?own.map(k=>`<div class="row"><div class="emo">${ING[k].e}</div><div class="info"><div class="t">${ING[k].n} ${rarTag(ING[k])}</div><div class="sub">En stock : ${state.inv[k]} · +${ING[k].r>=4?30:15} %</div></div><button class="b sm green" data-a="subdo" data-v="${k}" ${cur&&ING[cur].r>=ING[k].r?'disabled':''}>Marier</button></div>`).join(''):'<p class="center">Tu n’as pas encore d’ingrédient épique ou légendaire.</p>')+'<p class="center"><button class="b alt" data-a="subpick" data-v="">Retour</button></p>'}; }
  let html='<p class="center sub">Les ingrédients épiques et légendaires ne s’achètent pas et ne poussent pas : ils se méritent. Chacun sert à sublimer un plat.</p>';
  html+=EXQ.map(q=>{ const I=ING[q.k], v=(X.c[q.c]||0)-(X.got[q.k]||0)*q.n, rd=xqReady(q); return `<div class="row exq ${rd>0?'ready':''}" style="--rc:${RAR[I.r][1]}"><div class="emo">${I.e}</div><div class="info"><div class="t">${I.n} ${rarTag(I)}</div><div class="sub">${q.t}</div><div class="bar"><i style="width:${Math.min(100,100*v/q.n)}%"></i></div><div class="sub">${Math.min(v,q.n)} / ${q.n} · en stock : ${state.inv[q.k]||0}</div></div>${rd>0?`<button class="b sm green" data-a="xclaim" data-v="${q.k}">Récupérer</button>`:''}</div>`; }).join('');
  html+='<h3 class="exH">Sublimer un plat</h3>'+state.menu.map(id=>{ const d=DISHM[id], s=state.sub&&state.sub[id]; return `<div class="row"><div class="emo">${d.e}</div><div class="info"><div class="t">${d.n}</div><div class="sub">${s?'Sublimé : '+ING[s].n+' (+'+(ING[s].r>=4?30:15)+' %)':'Pas encore sublimé'} · ${dishPrice(d)} 🪙</div></div><button class="b sm" data-a="subpick" data-v="${id}" ${own.length?'':'disabled'}>${s?'Changer':'Sublimer'}</button></div>`; }).join('');
  return {title:'Ingrédients d’exception',html}; },""")
RX(" close:()=>closeModal(),",""" close:()=>closeModal(),
 xclaim:k=>{ const q=EXQ.find(q=>q.k===k); if(!q||xqReady(q)<=0) return; const X=xq(); X.got[k]=(X.got[k]||0)+1; state.inv[k]=(state.inv[k]||0)+1; addXP(20); closeModal(); rewardShow({title:RAR[ING[k].r][0]+' !',sub:q.t,items:[rwIng(k),{xp:1,n:'+20 XP'}]}); },
 subpick:v=>{ ui.subD=v||null; renderPanel(); },
 subdo:k=>{ const id=ui.subD; if(!id||!(state.inv[k]>0)) return; state.inv[k]--; (state.sub||(state.sub={}))[id]=k; ui.subD=null; sfx('level'); const d=DISHM[id]; closeModal(); rewardShow({chest:false,title:'Plat sublimé',sub:d.n+' se vend maintenant '+dishPrice(d)+' pièces',items:[{img:foodThumbs[d.e],n:d.n,r:ING[k].r},rwIng(k)]}); },""")
RX("const MORE=[","const MORE=[['exc','Ingrédients d’exception','quiz','#d9b8ff','#9a5ce0','#5b33c4'],")
# étiquette de rareté au jardin, au marché et dans le garde-manger
n=js.count('<div class="t">${i.n}</div>'); assert n>=2,n
js=js.replace('<div class="t">${i.n}</div>','<div class="t">${i.n} ${rarTag(i)}</div>')
RX('ks.map(k=>`<span style="font-size:15px;padding:6px 10px">${ING[k].e} ${ING[k].n} ×${state.inv[k]}</span>`)','ks.sort((a,b)=>ING[b].r-ING[a].r).map(k=>`<span class="ingR" style="font-size:15px;padding:6px 10px;--rc:${RAR[ING[k].r][1]}">${ING[k].e} ${ING[k].n} ×${state.inv[k]}</span>`)')
