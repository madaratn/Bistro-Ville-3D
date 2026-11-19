// ===================== OPTIONS (v0.98) : un vrai écran de réglages, par onglets =====================
// Image, Son, Jeu, Confort, Partie. Chaque réglage agit tout de suite ; ceux du jeu vivent dans la sauvegarde (state.opt),
// ceux de l'appareil (mode léger, effets, personnages) restent propres au téléphone.
const VOL={s:null,m:null};
function volBus(k){ if(!VOL[k]){ VOL[k]=AC.createGain(); VOL[k].gain.value=optG(k==='s'?'vs':'vm',1); VOL[k].connect(AC.destination); } return VOL[k]; }
function optApply(){ const b=document.body, fs=optG('fs',0); b.classList.toggle('fs1',fs===1); b.classList.toggle('fs2',fs===2); b.classList.toggle('rm',!!optG('rm',0)); b.classList.toggle('hc',!!optG('hc',0)); }
function optAO(on){ if(GFX.aoOn===on) return; GFX.aoOn=on; try{ localStorage.setItem('bv_ao',on?'1':'0'); }catch(e){} if(GFX.comp){ try{ for(const p of GFX.comp.passes) if(p.dispose) p.dispose(); GFX.comp.dispose(); }catch(e){} GFX.comp=null; GFX.ao=null; } }
function optQual(){ const r=optG('res',0); return LITE?2:(GFX.on&&GFX.aoOn&&r===0&&HD.on)?0:(GFX.on&&!GFX.aoOn&&r===1)?1:-1; }
function optSet(k,v){ optS(k,v); if(k==='res'){ try{ resize(); }catch(e){} } if(k==='fs'||k==='rm'||k==='hc') optApply(); if(k==='vs'&&VOL.s) VOL.s.gain.value=v; if(k==='vm'&&VOL.m) VOL.m.gain.value=v; }
const oRow=(t,sub,ctl,cls)=>`<div class="row ${cls||''}"><div class="info"><div class="t">${t}</div>${sub?`<div class="sub">${sub}</div>`:''}</div>${ctl||''}</div>`;
const oTog=(a,on,l1,l0,dis)=>`<button class="b sm ${on?'green':'alt'}" data-a="${a}" ${dis?'disabled':''}>${on?(l1||'Activé'):(l0||'Coupé')}</button>`;
const oSeg=(k,vals,cur,act)=>`<div class="oSeg">${vals.map(([v,l])=>`<button class="${v===cur?'on':''}" data-a="${act||'opt'}" data-v="${act?v:k+':'+v}">${l}</button>`).join('')}</div>`;
const oRng=(k)=>{ const v=Math.round(optG(k,1)*100); return `<div class="oRng"><input type="range" min="0" max="100" step="5" value="${v}" data-o="${k}" aria-label="Volume"><b>${v} %</b></div>`; };
function optTabHTML(T){ let h='';
 if(T==='img'){ const q=optQual();
  h+=`<div class="row col"><div class="info"><div class="t">Qualité de l’image</div><div class="sub">${q===0?'Tout est activé : ombres de contact, reflets, personnages détaillés.':q===1?'Un bon compromis : plus fluide, presque aussi beau.':q===2?'Pour les appareils modestes : moins de détails, plus fluide.':'Réglage personnalisé.'}</div></div>${oSeg('',[[0,'Haute'],[1,'Équilibrée'],[2,'Légère']],q,'optq')}</div>`;
  h+=oRow('Effets d’image',LITE?'Indisponibles en qualité légère':'Lueurs, couleurs plus riches',oTog('optgfx',GFX.on,'Activés','Coupés',LITE));
  h+=oRow('Ombres de contact','Un ombrage doux sous les meubles et les personnages',oTog('optao',GFX.on&&GFX.aoOn&&!LITE,'Activées','Coupées',LITE||!GFX.on));
  h+=oRow('Flou de profondeur','Le haut et le bas de l’image s’adoucissent, comme une maquette',oTog('optdof',!!optG('dof',1)&&GFX.on&&!LITE,'Activé','Coupé',LITE||!GFX.on));
  h+=oRow('Personnages détaillés','Visages, coiffures et tenues en haute définition',oTog('opthd',HD.on,'Activés','Coupés'));
  h+=oRow('Acteurs 3D dans les dialogues','Les personnages jouent la scène au-dessus du texte',oTog('optbust',BUST.on&&BUST.ok&&HD.on,'Activés','Coupés',!HD.on||!BUST.ok));
  h+=`<div class="row col"><div class="info"><div class="t">Finesse de l’image</div><div class="sub">Moins de points à dessiner : le jeu chauffe moins et la batterie dure plus longtemps.</div></div>${oSeg('res',[[0,'100 %'],[1,'80 %'],[2,'60 %']],optG('res',0))}</div>`;
  h+=`<div class="row col"><div class="info"><div class="t">Images par seconde</div><div class="sub">30 images par seconde économisent la batterie.</div></div>${oSeg('fps',[[0,'60'],[1,'30']],optG('fps',0))}</div>`;
  h+=oRow('Cycle jour / nuit','La lumière suit l’heure du jeu',oTog('dn',state.daynight));
 } else if(T==='son'){
  h+=oRow('Effets sonores','',oTog('sound',state.sound,'Activés','Coupés'));
  h+=`<div class="row col"><div class="info"><div class="t">Volume des effets</div></div>${oRng('vs')}</div>`;
  h+=`<div class="row tm"><div class="info"><div class="t">Musique d’ambiance</div><div class="sub">${curTrack().e} ${curTrack().n} · ${curTrack().bpm} bpm · touche le juke-box pour changer</div></div><button class="b sm alt" data-a="track">Suivante</button> ${oTog('music',state.music!==false,'Activée','Coupée')}</div>`;
  h+=`<div class="row col"><div class="info"><div class="t">Volume de la musique</div></div>${oRng('vm')}</div>`;
  h+=oRow('Voix des personnages','Un petit son par syllabe pendant les dialogues, différent pour chacun',oTog('optvb',!!optG('vb',1),'Activées','Coupées'));
  h+=oRow('Vibrations','Petits retours au toucher',oTog('optvib',state.vib!==false,'Activées','Coupées'));
 } else if(T==='confort'){
  h+=`<div class="row col"><div class="info"><div class="t">Taille du texte</div><div class="sub">Dialogues, fenêtres et messages.</div></div>${oSeg('fs',[[0,'Normale'],[1,'Grande'],[2,'Très grande']],optG('fs',0))}</div>`;
  h+=`<div class="row col"><div class="info"><div class="t">Vitesse du texte</div><div class="sub">La vitesse à laquelle les répliques s’écrivent.</div></div>${oSeg('txt',[[0,'Lente'],[1,'Normale'],[2,'Rapide'],[3,'Immédiate']],optG('txt',1))}</div>`;
  h+=oRow('Dialogues en avance automatique','La réplique suivante arrive toute seule, le temps de lire',oTog('optauto',!!optG('auto',0)));
  h+=oRow('Contraste renforcé','Textes plus sombres, contours plus marqués',oTog('opthc',!!optG('hc',0)));
  h+=oRow('Animations réduites','Moins de mouvements dans l’interface',oTog('optrm',!!optG('rm',0),'Activées','Coupées'));
 }
 return h; }
function optGameHTML(){ let h=`<h3>Nom du restaurant</h3><div style="display:flex;gap:8px"><input type="text" id="rname" maxlength="16" value="${state.name.replace(/"/g,'&quot;')}"><button class="b" data-a="rename">OK</button></div><h3>Partie</h3>`;
 h+=oRow('Le registre du bistrot',state.me?`${state.me.n?state.me.n+' · ':''}Odette dit « ${state.me.g==='f'?'ma grande':'mon grand'} »`:'Pas encore signé : Odette te le proposera',state.me?'<button class="b sm alt" data-a="meEdit">Changer</button>':'');
 h+=oRow('Recentrer la caméra','Revenir à la vue d’ensemble du bistrot','<button class="b sm alt" data-a="recenter">Recentrer</button>');
 return h; }
function optSaveHTML(){ const S=ui.sv||{}; let h='<h3>Sauvegarde</h3>';
 h+=`<div class="row col"><div class="info"><div class="t">Mettre ma partie à l’abri</div><div class="sub">Le jeu enregistre tout seul sur cet appareil. Ce code contient toute ta partie : garde-le dans tes notes pour la retrouver sur un autre téléphone.</div></div>${S.code?`<textarea class="oTxt" id="svOut" readonly>${S.code.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</textarea><div class="oBt"><button class="b sm green" data-a="savCopy">${S.copied?'Copié !':'Copier le code'}</button></div>`:'<div class="oBt"><button class="b sm" data-a="savExp">Afficher mon code</button></div>'}</div>`;
 h+=`<div class="row col"><div class="info"><div class="t">Reprendre une partie</div><div class="sub">Colle ici un code de sauvegarde. La partie en cours sera remplacée.</div></div><textarea class="oTxt" id="svIn" placeholder="Colle ton code ici">${S.inp?S.inp.replace(/&/g,'&amp;').replace(/</g,'&lt;'):''}</textarea>${S.err?`<div class="sub oErr">${S.err}</div>`:''}<div class="oBt"><button class="b sm ${S.sure?'red':''}" data-a="savImp">${S.sure?'Sûr ? Touche encore pour remplacer':'Charger ce code'}</button></div></div>`;
 h+=`<h3>Danger</h3><button class="b red" data-a="reset">${ui.cr?'Sûr ? Touche encore pour tout effacer':'Recommencer à zéro'}</button>`;
 return h; }
function optSaveRead(txt){ let o=null; try{ o=JSON.parse(String(txt).trim()); }catch(e){ return null; } return o&&o.v===1&&typeof o.coins==='number'&&Array.isArray(o.furn)&&Array.isArray(o.staff)?o:null; }
try{ document.addEventListener('input',ev=>{ const r=ev.target&&ev.target.closest&&ev.target.closest('[data-o]'); if(r){ const v=+r.value/100; if(!state.opt) state.opt={}; state.opt[r.dataset.o]=v; if(r.dataset.o==='vs'&&VOL.s) VOL.s.gain.value=v; if(r.dataset.o==='vm'&&VOL.m) VOL.m.gain.value=v; const b=r.parentNode.querySelector('b'); if(b) b.textContent=Math.round(v*100)+' %'; return; }
  if(ev.target&&ev.target.id==='svIn'){ ui.sv=ui.sv||{}; ui.sv.inp=ev.target.value; ui.sv.sure=false; } });
 document.addEventListener('change',ev=>{ const r=ev.target&&ev.target.closest&&ev.target.closest('[data-o]'); if(r){ try{ save(); if(r.dataset.o==='vs') sfx('coin'); }catch(e){} } }); }catch(e){}
setTimeout(()=>{ try{ optApply(); }catch(e){} },0);
// l'entrée en cascade du contenu d'une fenêtre : à l'ouverture ou au changement d'onglet, pas à chaque action
function uiFresh(){ const k=ui.panel+'|'+ui.tab; if(uiFresh.k===k) return; uiFresh.k=k; const s=document.querySelector('#modal .sheet'); if(!s||!ui.panel) return; s.classList.remove('fresh'); void s.offsetWidth; s.classList.add('fresh'); clearTimeout(uiFresh.t); uiFresh.t=setTimeout(()=>s.classList.remove('fresh'),800); }
try{ document.addEventListener('click',()=>{ setTimeout(()=>{ try{ if(!ui.panel) uiFresh.k=''; }catch(e){} },60); },true); }catch(e){}
// ---------- histoire : « Mes scènes » et « Précédemment » ----------
const AWAY0=(()=>{ try{ const s=JSON.parse(localStorage.getItem('bistroville_v2')||'null'); return s&&s.lastSave?Date.now()-s.lastSave:0; }catch(e){ return 0; } })();
function scGalPanel(){ const st=state.story, n=st&&st.v?Math.min(SAGA.length,st.ch+((st.seen===st.ch||st.step>0||st.started)?1:0)):0;
 let html='<p class="sub center">Les scènes d’ouverture des chapitres que tu as vécus. Tes choix y sont rejoués tels que tu les as faits.</p>';
 for(let i=n-1;i>=0;i--){ const C=SAGA[i]; let w='o'; for(const l of C.intro){ const k=String(l[0]).split('/')[0]; if(SAGA_WHO[k]){ w=k; break; } }
  html+=`<div class="row"><div class="emo scG">${whoImg(w)}</div><div class="info"><div class="t">${i+1}. ${C.t}</div><div class="sub">${C.sub}</div></div><button class="b sm alt" data-a="scGal" data-v="${i}">Revoir</button></div>`; }
 if(!n) html+='<p class="center sub">Aucune scène pour l’instant : l’histoire commence dès ton premier service.</p>';
 html+='<p class="center"><button class="b alt sm" data-a="sback">Retour à l’histoire</button></p>'; return {title:'🎬 Mes scènes',html}; }
function storyRecap(){ if(storyRecap.done) return; storyRecap.done=1; const st=state.story; if(!st||!st.v||AWAY0<3*3600e3||storyEnd()||storyLocked()||!((st.pages||0)>0||st.started)) return;
 const C=SAGA[st.ch]; if(!C) return; let goal=''; try{ const S=storyStep(); if(S&&S.S&&S.S.g) goal=S.S.g.t; }catch(e){}
 sceneQ({title:'Précédemment',lines:[['#','Précédemment…','« '+state.name+' » · saison '+(C.s+1)+', « '+SAGA_SEASONS[C.s][0]+' ». Chapitre '+(st.ch+1)+' : '+C.t+'. '+C.sub+(goal?' Là où tu en étais : '+goal.charAt(0).toLowerCase()+goal.slice(1)+'.':'')],['o/warm','Te revoilà, {{N}} ! Le bistrot t’attendait. On reprend ?']]}); }
