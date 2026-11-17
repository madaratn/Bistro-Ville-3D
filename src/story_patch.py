# v0.42 : l'histoire longue — « L'héritage de Mamie Odette » (4 saisons, 28 chapitres, un chapitre par jour au maximum)
# Le texte de l'histoire est dans src/saga.js ; ici, la mécanique.
RP("function dailyAdd(k,n,max){ const D=dailyCheck();","function dailyAdd(k,n,max){ { const T=state.tot||(state.tot={}); T[k]=max?Math.max(T[k]||0,n):(T[k]||0)+n; if(k==='rush'){ T.rushes=(T.rushes||0)+1; if(state.story) state.story.rb=Math.max(state.story.rb||0,n); } } const D=dailyCheck();")
RP("const PANELS={",r"""// --- l'histoire : chapitres en 3 étapes, dialogues, carnet de recettes ---
const BEL_CH=4;                      // Le Belmont ouvre au chapitre 5
let dlg=null;
function storyTot(k){ return (state.tot&&state.tot[k])||0; }
function storyVal(g){ const st=state.story; if(g.k==='rating') return Math.round(rating*10)/10; if(g.k==='staff') return state.staff.length; if(g.k==='seats') return seatCount(); if(g.k==='rush') return st.rb||0; return storyTot(g.k)-((st.base&&st.base[g.k])||0); }
const storyEnd=()=>!!state.story&&state.story.ch>=SAGA.length;
const storyLocked=()=>!!state.story&&!storyEnd()&&state.story.doneDay===today();          // un chapitre par jour : la suite s'ouvre le lendemain
function storyStep(){ const st=state.story; if(!st||storyEnd()||storyLocked()) return null; const S=SAGA[st.ch].steps[st.step], v=storyVal(S.g); return {S,v,ok:v>=S.g.n}; }
function storyReady(){ const st=state.story; if(!st||storyEnd()) return false; if(storyLocked()) return false; if(st.seen!==st.ch) return true; const s=storyStep(); return !!s&&s.ok; }
const belOpen=()=>{ const st=state.story; return !!st&&!!st.v&&(st.ch>BEL_CH||(st.ch===BEL_CH&&st.seen===BEL_CH)); };
function storyShare(){ const st=state.story; if(!belOpen()) return 100; return storyEnd()?88:Math.round(14+(st.ch-BEL_CH)*3.1); }
function storyMul(){ const st=state.story; if(!belOpen()) return 1; return .84+.02*Math.min(st.ch-BEL_CH,24); }      // la concurrence détourne une partie des clients
function rivalPull(){ const st=state.story; return belOpen()?.12+.3*(1-storyShare()/100):.05; }
function storySnap(){ const st=state.story; st.rb=0; st.base=Object.assign({},state.tot||{}); }
function storyIntro(){ const st=state.story; if(!st||storyEnd()||storyLocked()) return; const C=SAGA[st.ch]; st.seen=st.ch; if(st.step===0&&!st.started){ st.started=1; storySnap(); } say(C.intro,'Chapitre '+(st.ch+1)+' · '+C.t); save(); }
function storyCheck(){
 if(state.story&&!state.story.v){ const old=state.story.ch||0; state.story=null; if(old>0){ earn(250*old); queueModal(()=>({title:'Une nouvelle histoire',html:`<div class="hero"><img class="fi" style="width:96px;height:96px" src="${foodThumbs['who:o']||''}" alt=""></div><p class="center"><b>L’héritage de Mamie Odette</b></p><p class="center">L’histoire a été entièrement réécrite : 28 chapitres, à raison d’un par jour. Tes ${old} victoires contre Belmont te rapportent <b>${250*old} 🪙</b> de dédommagement.</p><p class="center"><button class="b" data-a="close">Commencer</button></p>`})); } }
 if(!state.story&&state.level>=2&&!warming){ state.story={v:2,ch:0,step:0,rb:0,base:{},pages:0}; }
 const st=state.story; if(st&&!storyEnd()&&!storyLocked()&&st.seen!==st.ch&&!warming&&!ui.panel&&!modalQ.length&&mode==='play'&&!(typeof visit!=='undefined'&&visit.on)&&!(typeof rush!=='undefined'&&rush)) storyIntro();
}
function say(lines,title,after){ queueModal(()=>{ if(!dlg||dlg.lines!==lines) dlg={lines,i:0,after}; const [w,txt]=lines[dlg.i], W=SAGA_WHO[w]||['?','#888'], last=dlg.i>=lines.length-1, im=whoImg(w);
  return {title:title||'Histoire',html:`<div class="dlg"><div class="dlgA" style="background:${W[1]}22;border-color:${W[1]}">${im||W[0][0]}</div><div class="dlgN" style="color:${W[1]}">${W[0]}</div><div class="dlgT">${txt}</div></div><p class="center"><button class="b" data-a="snext">${last?'OK':'Suite ›'}</button></p><p class="sub center">${dlg.i+1}/${lines.length}</p>`}; }); }
function storyWait(){ const n=new Date(), m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1), s=Math.max(0,(m-n)/1000), h=Math.floor(s/3600), mi=Math.floor(s%3600/60); return h>0?h+' h '+String(mi).padStart(2,'0'):mi+' min'; }
const storyReward=(ch)=>{ const C=SAGA[ch]; return Math.round((100+ch*45)*(C.bonus||1)/10)*10; };
const PANELS={
 story(){
  const st=state.story; if(!st) return {title:'Histoire',html:'<p class="center">L’histoire commence au niveau 2. Encore quelques clients à servir !</p>'};
  const end=storyEnd(), ch=Math.min(st.ch,SAGA.length-1), C=SAGA[ch], se=SAGA_SEASONS[C.s], sh=storyShare();
  let html=`<div class="sagaH"><div class="sagaS">Saison ${C.s+1} · ${se[0]}</div><div class="sagaP"><i style="width:${Math.round((end?SAGA.length:st.ch)/SAGA.length*100)}%"></i></div><div class="sub">${end?SAGA.length:st.ch} chapitres terminés sur ${SAGA.length} · ${st.pages||0} pages du carnet retrouvées</div></div>`;
  if(belOpen()) html+=`<div class="row"><div class="info"><div class="t">Le cœur du quartier</div><div class="duel"><i style="width:${sh}%"></i></div><div class="sub" style="display:flex;justify-content:space-between"><span>Toi ${sh} %</span><span>${100-sh} % Le Belmont</span></div></div></div>`;
  if(end){ html+=`<div class="hero"><img class="fi" style="width:110px;height:110px" src="${foodThumbs['who:o']||''}" alt=""></div><p class="center"><b>Tu as terminé « L’héritage de Mamie Odette ».</b><br>Le carnet est complet, la dette est payée, et Victor fait la plonge le lundi.</p><p class="sub center">Une lettre est arrivée de Lyon… La saison 5 est en préparation.</p>`; }
  else if(storyLocked()){ const N=SAGA[st.ch]; html+=`<h3>Chapitre ${st.ch} terminé</h3><div class="sagaL"><div class="sagaLt">La suite demain</div><p>Chapitre ${st.ch+1} · <b>${N.t}</b></p><p class="sub">${N.sub}</p><p class="sagaLc">Disponible dans ${storyWait()}</p><p class="sub">Un chapitre par jour : l’histoire prend son temps, comme un pot-au-feu.</p></div>`; }
  else { const s=storyStep();
   html+=`<h3>Chapitre ${st.ch+1}/${SAGA.length} · ${C.t}</h3><p class="sub">${C.sub}</p>`;
   html+=C.steps.map((S,i)=>{ const done=i<st.step, cur=i===st.step, v=cur?s.v:0;
     return `<div class="row sagaE ${done?'done':cur?'cur':'lock'}"><div class="sagaN">${done?'✓':i+1}</div><div class="info"><div class="t">${cur||done?S.g.t:'Étape '+(i+1)+' · à découvrir'}</div>${cur?`<div class="bar" style="background:#eee"><i style="width:${Math.min(100,v/S.g.n*100)}%;background:${s.ok?'#3fb37a':'#ffb347'}"></i></div><div class="sub">${S.g.k==='rating'?String(v).replace('.',','):Math.min(v,S.g.n)} / ${String(S.g.n).replace('.',',')}</div>`:''}</div></div>`; }).join('');
   html+=`<p class="center sub">Fin du chapitre : <b>${storyReward(st.ch)} pièces</b>, 5 d’énergie et une page du carnet${C.item?', plus la '+FURN[C.item].n+' de Belmont':''}</p><p class="center"><button class="b green" data-a="sstep" ${s.ok?'':'disabled'}>${s.ok?(st.step<2?'Étape suivante':'Terminer le chapitre'):'Étape en cours…'}</button></p>`; }
  html+=`<p class="center">${end||storyLocked()?'':'<button class="b alt sm" data-a="sagain">Revoir l’intro</button> '}<button class="b alt sm" data-a="carnet">Le carnet (${st.pages||0}/${SAGA.length})</button>${belOpen()?' <button class="b sm" data-a="visit" style="background:linear-gradient(180deg,#e9cc78,#c9972e)">Visiter Le Belmont</button>':''}</p>`;
  return {title:'Histoire',html};
 },
 carnet(){ const st=state.story, n=st?st.pages||0:0; let html='<p class="sub center">Le carnet de recettes de Mamie Odette. Chaque chapitre terminé te rend une page.</p>';
  html+=SAGA.map((C,i)=>i<n?`<div class="row carP"><div class="carN">${i+1}</div><div class="info"><div class="t">${C.page[0]}</div><div class="sub carQ">${C.page[1]}</div></div></div>`:`<div class="row carP lock"><div class="carN">${i+1}</div><div class="info"><div class="t">Page manquante</div><div class="sub">${i===n&&st&&!storyEnd()?'À retrouver au chapitre '+(i+1):'…'}</div></div></div>`).join('');
  html+='<p class="center"><button class="b alt sm" data-a="sback">Retour à l’histoire</button></p>'; return {title:'Le carnet d’Odette',html}; },""")
RP(" close:()=>closeModal(),",""" close:()=>closeModal(),
 snext:()=>{ if(!dlg) return closeModal(); if(dlg.i<dlg.lines.length-1){ dlg.i++; sfx('pop'); renderPanel(); return; } const a=dlg.after; dlg=null; closeModal(); if(a) a(); },
 sagain:()=>{ const st=state.story; closeModal(); if(st&&!storyEnd()&&!storyLocked()) say(SAGA[st.ch].intro,'Chapitre '+(st.ch+1)+' · '+SAGA[st.ch].t); },
 carnet:()=>{ closeModal(); openPanel('carnet'); }, sback:()=>{ closeModal(); openPanel('story'); },
 sstep:()=>{ const st=state.story, s=storyStep(); if(!s||!s.ok) return; const ch=st.ch, C=SAGA[ch]; closeModal(); sfx('level');
  say([s.S.say],'Étape '+(st.step+1)+' réussie');
  if(st.step<2){ st.step++; storySnap(); addXP(8+ch); save(); hud(); return; }
  const rw=storyReward(ch); earn(rw); addXP(20+ch*4); state.en.v=Math.min(EN_MAX,state.en.v+5); if(C.item) state.store[C.item]=(state.store[C.item]||0)+1;
  st.pages=ch+1; st.ch=ch+1; st.step=0; st.started=0; st.doneDay=today(); storySnap();
  say(C.outro,'Chapitre '+(ch+1)+' · '+C.t);
  const last=ch+1>=SAGA.length, sEnd=last||SAGA[ch+1].s!==C.s;
  queueModal(()=>({title:sEnd?'Saison '+(C.s+1)+' terminée':'Chapitre terminé',html:`<div class="carBig"><div class="carBn">Page ${ch+1}</div><b>${C.page[0]}</b><p>${C.page[1]}</p></div><p class="center">+${rw} pièces · +5 d’énergie${C.item?' · '+FURN[C.item].n+' dans ta réserve':''}</p><p class="center sub">${last?'Tu as terminé l’histoire. Bravo, et merci d’avoir pris ton temps.':'La suite demain : <b>'+SAGA[ch+1].t+'</b>'}</p><p class="center"><button class="b" data-a="close">Continuer</button></p>`}));
  save(); hud(); },""")
RP("PICON={","PICON={story:['star','#b98cff','#8a5cf0','#5b33c4'],carnet:['star','#e9cc78','#d4a53a','#9c7420'],")
RP("\n spawnT-=dt*(rush?3:1);\n","\n spawnT-=dt*(rush?3:1)*storyMul();\n")
RP("<button id=\"sDay\" aria-label=\"Missions du jour\">🎯<i class=\"hide\"></i></button>'","<button id=\"sDay\" aria-label=\"Missions du jour\">🎯<i class=\"hide\"></i></button><button id=\"sSto\" aria-label=\"Histoire\">📖<i class=\"hide\">!</i></button>'")
RP("if(b.id==='sRush'&&!rush){","if(b.id==='sSto') return openPanel('story'); if(b.id==='sRush'&&!rush){")
RP(" sideInit(); energyTick(); {"," sideInit(); energyTick(); storyCheck(); $('#sSto').lastChild.classList.toggle('hide',!storyReady()); {")
RP(" const NEWS=[];",""" const NEWS=[];
 if(!state.saga1){ state.saga1=1; if(loaded) NEWS.push(`<div class="row"><div class="emo">📖</div><div class="info"><div class="t">L’héritage de Mamie Odette</div><div class="sub">La grande histoire commence : 4 saisons, 28 chapitres, de nouveaux voisins et un carnet de recettes à reconstituer page par page. Un chapitre par jour au maximum, en trois étapes.</div></div></div>`); }""")
