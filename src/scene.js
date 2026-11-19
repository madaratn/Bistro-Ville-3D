// ===================== SCÈNES (v0.96) : les dialogues mis en scène =====================
// Un script est une liste de nœuds :
//   ['o','texte']                      une réplique (o = clé de SAGA_WHO ; 'o/sad' change l'expression du portrait)
//   ['o','texte',f=>f.x===1]           une réplique conditionnelle (f = les choix déjà faits, a = cœur et panache)
//   ['?','id',[ ['« réponse »',{effets},[répliques…]], … ]]   un choix du joueur
//   ['@']                              la signature du registre (prénom du joueur), posée une seule fois
//   ['#','titre','texte']              une carte plein écran (épilogue)
// Pendant une scène, le service est en pause : on lit tranquillement, personne ne s'impatiente.
let scOn=null; const scFaceC={};
function scBusy(){ try{ return !!scOn; }catch(e){ return false; } }
function vib(p){ try{ if(state.vib!==false&&navigator.vibrate) navigator.vibrate(p); }catch(e){} }
const meG=()=>!!state.me&&state.me.g==='f', meN=()=>(state.me&&state.me.n)||'';
const scFl=()=>state.fl||(state.fl={}), scAx=()=>state.ax||(state.ax={h:0,p:0});
const axTip=()=>1+.01*Math.min(12,(state.ax&&state.ax.p)||0);          // le panache fait grimper les pourboires (le cœur, lui, ramène le quartier : voir storyShare)
function scT(s){ return String(s).replace(/\{\{N\}\}/g,meN()||(meG()?'ma grande':'mon grand')).replace(/\{\{([^|}]*)\|([^}]*)\}\}/g,(m,a,b)=>meG()?b:a).replace(/ ([:;!?»%])/g,' $1').replace(/« /g,'« '); }
function scFace(k,ex){ const key=k+'|'+(ex||''); if(!scFaceC[key]){ let u=''; try{ u=ex&&PORTRAIT[k]?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(portraitSVG(k,null,Object.assign({},PORTRAIT[k],{expr:ex}))):(foodThumbs['who:'+k]||portraitURL(k)); }catch(e){ u=foodThumbs['who:'+k]||''; } scFaceC[key]=u; } return scFaceC[key]; }
const SC_VOICE={o:330,b:233,c:494,j:440,s:392,p:220,l:277,r:466,y:196,a:247,z:587};
function scBlip(w){ if(!state.sound||!AC) return; try{ const f=(SC_VOICE[w]||350)*(1+(Math.random()-.5)*.14); tone(f,0,.045,'triangle',.022); }catch(e){} }
function scSfx(k){ if(!state.sound||!AC) return; try{
  if(k==='page'){ [392,523,659].forEach((f,i)=>tone(f,i*.11,.5,'sine',.045)); }
  else if(k==='pick'){ tone(660,0,.09,'triangle',.06); tone(990,.07,.16,'triangle',.05); }
  else if(k==='heart'){ [523,784,1047].forEach((f,i)=>tone(f,i*.08,.3,'sine',.05)); }
  else if(k==='star'){ [587,880,1175].forEach((f,i)=>tone(f,i*.07,.28,'triangle',.05)); } }catch(e){} }
function scEl(){ let e=$('#sc'); if(e) return e; e=document.createElement('div'); e.id='sc'; e.className='hide';
 e.innerHTML='<i class="scBar scTop"><b></b></i><i class="scBar scBot"></i><div class="scCard"></div><div class="scTag"></div><div class="scStage"><div class="scPo"><img alt=""></div><div class="scBox"><div class="scName"></div><div class="scTxt"><span></span><span class="scR"></span></div><div class="scCh"></div><div class="scMe"></div><i class="scNext"></i></div></div><button class="scSkip">Passer</button>';
 document.body.appendChild(e);
 e.addEventListener('click',ev=>{ const S=scOn; if(!S) return; try{ audioInit(); }catch(err){}
  if(ev.target.closest('.scSkip')) return scSkip();
  const c=ev.target.closest('[data-c]'); if(c){ if(!c.disabled) scPick(+c.dataset.c); return; }
  const g=ev.target.closest('[data-g]'); if(g) return scSign(g.dataset.g);
  if(ev.target.closest('.scMe')) return;
  scTap(); });
 return e; }
// ---------- lancement et fin ----------
function scenePlay(o,done){
 if(scOn||flowF<2||(typeof titleOn!=='undefined'&&titleOn)||(typeof cine!=='undefined'&&cine)){ setTimeout(()=>scenePlay(o,done),400); return; }
 const e=scEl(), lines=(o.lines||[]).slice();
 if(o.story&&!state.me) lines.unshift(['o',state.story&&state.story.ch>0?'Attends. Le registre du bistrot : tu ne l’as pas encore signé. C’est la tradition, le nom du patron sur la première page.':'Avant toute chose : le registre du bistrot. Le nom du patron sur la première page, c’est la tradition depuis quarante ans.'],['@'],['o/warm','Voilà. C’est signé, c’est officiel : le bistrot est entre tes mains, {{N}}.']);
 scOn={q:lines,o,done,who:null,full:'',n:0,typing:false,wait:null,skip:false,t0:performance.now(),d0:cam.dist,mus:false,last:null,acc:0,lt:performance.now()};
 try{ for(const a of [...custs,...crew]){ a.moving=false; a.v=0; } }catch(err){}
 e.className='in'+(o.card?' card':''); document.body.classList.add('scn'); e.querySelector('.scTop b').textContent=o.title?scT(o.title):''; e.querySelector('.scSkip').style.display='';
 { const tg=e.querySelector('.scTag'); tg.className='scTag'; tg.innerHTML=''; }
 e.querySelector('.scPo').className='scPo'; e.querySelector('.scName').textContent=''; e.querySelector('.scTxt').firstChild.textContent=''; e.querySelector('.scR').textContent=''; e.querySelector('.scCh').innerHTML=''; e.querySelector('.scMe').innerHTML='';
 if(o.mus&&state.music!==false&&AC){ try{ cineMusicMood(Object.assign({snap:1},o.mus)); cineMusicStart(); scOn.mus=true; }catch(err){} }
 requestAnimationFrame(scRaf);
 if(o.card){ const C=o.card, c=e.querySelector('.scCard'); c.className='scCard on'; c.innerHTML=`<small>${C.top||''}</small><em>${C.n||''}</em><b>${scT(C.t||'')}</b><span>${scT(C.sub||'')}</span>`; scOn.wait='card'; scSfx('page'); scOn.cardT=setTimeout(()=>{ if(scOn&&scOn.wait==='card') scCardOff(); },3400); }
 else scNode();
 if(o.tags&&o.tags.length&&!o.card) setTimeout(()=>{ if(scOn&&scOn.o===o) scTags(o.tags); },350); }
function scCardOff(){ const S=scOn; if(!S) return; clearTimeout(S.cardT); S.wait=null; const e=scEl(); e.classList.remove('card'); e.querySelector('.scCard').className='scCard'; scNode(); }
function sceneEnd(){ const S=scOn; if(!S) return; const e=scEl(); e.className='out'; document.body.classList.remove('scn'); scOn=null; cam.dist=S.d0;
 if(S.mus){ try{ cineMusicStop(); }catch(err){} setTimeout(()=>{ try{ musicStart(); }catch(err){} },1300); }
 try{ if(typeof dx!=='undefined'&&dx) dx.t0+=(performance.now()-S.t0)/1000; }catch(err){}
 setTimeout(()=>{ if(!scOn) e.className='hide'; },380); setTimeout(()=>{ try{ if(!scOn) rwFlush(); }catch(err){} },520); save(); try{ S.done&&S.done(); }catch(err){ console.warn(err); } }
// ---------- déroulé ----------
function scNode(){ const S=scOn; if(!S) return; const e=scEl();
 for(;;){ const nd=S.q.shift(); if(!nd) return sceneEnd();
  if(nd[0]==='?'){ const v=nd[1][0]==='~'?undefined:scFl()[nd[1]]; if(v!==undefined){ const O=nd[2][v]; if(O&&O[2]) S.q.unshift(...O[2]); continue; } return scAsk(nd); }
  if(nd[0]==='!'){ const F=scFl(); if(!F['!'+nd[1]]){ F['!'+nd[1]]=1; let tg=[]; try{ tg=nd[2]()||[]; }catch(err){ console.warn(err); } if(tg.length) scTags(tg); } continue; }
  if(nd[0]==='@'){ if(state.me) continue; return scMe(); }
  if(nd[0]==='#'){ if(S.skip) continue; S.wait='card2'; const c=e.querySelector('.scCard'); e.classList.add('card'); c.className='scCard on txt'; c.innerHTML=`<b>${scT(nd[1]||'')}</b><p>${scT(nd[2]||'')}</p><u>Touche pour continuer</u>`; scSfx('page'); return; }
  if(typeof nd[2]==='function'){ let ok=false; try{ ok=!!nd[2](scFl(),scAx()); }catch(err){} if(!ok) continue; }
  S.last=nd; if(S.skip) continue; return scLine(nd); } }
function scLine(nd,instant){ const S=scOn, e=scEl(), [w0,txt]=nd, w=w0.split('/')[0], ex=w0.split('/')[1], W=SAGA_WHO[w]||['','#8a6a4a'], po=e.querySelector('.scPo'), im=po.querySelector('img');
 e.classList.remove('card'); e.querySelector('.scCard').className='scCard'; e.querySelector('.scCh').innerHTML=''; e.querySelector('.scMe').innerHTML='';
 const src=scFace(w,ex); if(S.who!==w){ po.className='scPo'; void po.offsetWidth; po.className='scPo on'; } else if(im.getAttribute('src')!==src){ po.classList.remove('nod'); void po.offsetWidth; po.classList.add('nod'); }
 im.src=src; po.style.setProperty('--wc',W[1]); S.who=w;
 const nm=e.querySelector('.scName'); nm.textContent=W[0].split(',')[0]; nm.style.background=W[1];
 S.full=scT(txt); S.n=instant?S.full.length:0; S.typing=!instant; S.wait=null; S.acc=0; scDraw(); e.classList.toggle('typing',S.typing); }
function scDraw(){ const S=scOn, t=scEl().querySelector('.scTxt'); t.firstChild.textContent=S.full.slice(0,S.n); t.lastChild.textContent=S.full.slice(S.n); }
function scRaf(now){ const S=scOn; if(!S) return; const dt=Math.min(.3,Math.max(0,(now-S.lt)/1000||0)); S.lt=now;
 if(S.typing){ S.acc+=dt*52; const k=Math.floor(S.acc); if(k>0){ S.acc-=k; const n0=S.n; S.n=Math.min(S.full.length,S.n+k); if(Math.floor(S.n/3)!==Math.floor(n0/3)&&/\S/.test(S.full[S.n-1]||'')) scBlip(S.who); scDraw(); if(S.n>=S.full.length){ S.typing=false; scEl().classList.remove('typing'); } } }
 const k=Math.min(1,(now-S.t0)/1400), ez=1-Math.pow(1-k,3); cam.dist=S.d0*(1-.07*ez);
 requestAnimationFrame(scRaf); }
function scTap(){ const S=scOn; if(!S) return;
 if(S.wait==='card') return scCardOff();
 if(S.wait==='card2'){ S.wait=null; sfx('pop'); return scNode(); }
 if(S.wait) return;
 if(S.typing){ S.n=S.full.length; S.typing=false; scDraw(); scEl().classList.remove('typing'); return; }
 sfx('pop'); scNode(); }
function scSkip(){ const S=scOn; if(!S) return; if(S.wait==='card') clearTimeout(S.cardT); if(S.wait==='ask'||S.wait==='me') return; S.wait=null; S.skip=true; S.typing=false; scEl().classList.remove('card'); scEl().querySelector('.scCard').className='scCard'; scNode(); }
// ---------- choix ----------
function scCost(fx){ return fx&&fx.cost?Math.max(0,Math.round(typeof fx.cost==='function'?fx.cost():fx.cost)):0; }
function scAsk(nd){ const S=scOn, e=scEl(); if(S.skip&&S.last){ scLine(S.last,true); } S.skip=false; S.typing=false; S.n=S.full.length; if(S.full) scDraw(); e.classList.remove('typing'); S.wait='ask'; S.ask=nd;
 e.querySelector('.scSkip').style.display='none';
 e.querySelector('.scCh').innerHTML='<small>À toi de répondre</small>'+nd[2].map((O,i)=>{ const c=scCost(O[1]), poor=c>state.coins; return `<button data-c="${i}" ${poor?'disabled':''}><span>${scT(O[0])}</span>${c?`<i>${poor?'Il te faudrait ':'− '}${fmt(c)} pièces</i>`:''}</button>`; }).join(''); scSfx('pick'); }
function scFx(fx){ const tags=[]; if(!fx) return tags; const A=scAx();
 if(fx.h){ A.h+=fx.h; tags.push('♥ Le quartier s’en souviendra'); }
 if(fx.p){ A.p+=fx.p; tags.push('★ Ça, c’est du panache'); }
 if(fx.fr){ const [k,n]=fx.fr; try{ const st=nbS(), v=st.v[k]||(st.v[k]={p:0,c:0}); v.p=Math.max(0,v.p+n); }catch(e){} tags.push('♥ '+((SAGA_WHO[k]||[''])[0].split(',')[0])+' t’apprécie davantage'); }
 const c=scCost(fx); if(c){ state.coins-=c; tags.push('− '+fmt(c)+' pièces'); }
 if(fx.coins){ earn(fx.coins); tags.push('+ '+fmt(fx.coins)+' pièces'); }
 if(fx.en){ try{ energyTick(); state.en.v=Math.min(EN_MAX,state.en.v+fx.en); }catch(e){} tags.push('+ '+fx.en+' énergie'); }
 if(fx.xp){ addXP(fx.xp); tags.push('+ '+fx.xp+' XP'); }
 if(fx.ing&&ING[fx.ing[0]]){ state.inv[fx.ing[0]]=(state.inv[fx.ing[0]]||0)+fx.ing[1]; tags.push('+ '+fx.ing[1]+' '+ING[fx.ing[0]].n); }
 if(fx.run) try{ fx.run(); }catch(err){ console.warn(err); }
 if(fx.tag) tags.unshift(fx.tag); return tags; }
function scTags(tags){ const t=scEl().querySelector('.scTag'); t.innerHTML=tags.map(x=>`<span>${x}</span>`).join(''); t.className='scTag'; void t.offsetWidth; t.className='scTag on'; scSfx(/♥/.test(tags[0])?'heart':'star'); }
function scPick(i){ const S=scOn; if(!S||S.wait!=='ask') return; const nd=S.ask, O=nd[2][i]; if(!O) return; if(scCost(O[1])>state.coins) return; if(nd[1][0]!=='~') scFl()[nd[1]]=i; const e=scEl(), tags=scFx(O[1]);
 e.querySelector('.scCh').innerHTML=''; e.querySelector('.scSkip').style.display=''; S.wait=null; S.ask=null;
 if(tags.length) scTags(tags); else sfx('pop');
 vib(18);
 if(O[2]) S.q.unshift(...O[2]); save(); hud(); scNode(); }
// ---------- le registre : prénom du joueur ----------
function scMe(){ const S=scOn, e=scEl(); if(S.skip&&S.last) scLine(S.last,true); S.skip=false; S.typing=false; S.n=S.full.length; if(S.full) scDraw(); e.classList.remove('typing'); S.wait='me'; e.querySelector('.scSkip').style.display='none';
 e.querySelector('.scMe').innerHTML='<small>Le registre du bistrot</small><input type="text" maxlength="12" placeholder="Ton prénom" autocomplete="off" autocapitalize="words" spellcheck="false"><div class="scG"><button data-g="m">Signer<i>Odette dit « mon grand »</i></button><button data-g="f">Signer<i>Odette dit « ma grande »</i></button></div>';
 { const inp=e.querySelector('.scMe input'); inp.addEventListener('focus',()=>e.classList.add('kb')); inp.addEventListener('keydown',ev=>{ if(ev.key==='Enter'){ ev.preventDefault(); inp.blur(); } }); } }
function scSign(g){ const S=scOn; if(!S||S.wait!=='me') return; const e=scEl(), inp=e.querySelector('.scMe input'); let n=(inp?inp.value:'').replace(/[<>&"'{}|\\\/]/g,'').trim().slice(0,12); if(n) n=n[0].toUpperCase()+n.slice(1);
 state.me={n,g:g==='f'?'f':'m'}; try{ inp&&inp.blur(); }catch(err){} e.classList.remove('kb'); e.querySelector('.scMe').innerHTML=''; e.querySelector('.scSkip').style.display=''; S.wait=null; scSfx('heart'); save(); scNode(); }
// ---------- raccord avec le reste du jeu : say() et la file des fenêtres ----------
function sceneQ(o){ const fn=()=>({title:' ',html:''}); fn.scene=o; queueModal(fn); }
function say(lines,title,after,tags){ sceneQ({lines,title,after,tags}); }
