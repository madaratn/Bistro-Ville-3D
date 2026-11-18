/* ===== v0.56 : prologue en vraie 3D — le grand bistrot d'Odette simulé pour de bon, puis son déclin ===== */
let cine=null;
const cineEase=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
function cineWorldReset(){ custs=[]; orders=[]; trash=[]; items=[]; floaters=[]; dirty.clear(); stoveBusy.clear(); cleaning.clear(); if(typeof moms!=='undefined') moms=[]; picked=null; rush=null; }
function cineGolden(){
 const g=newState(); state=g; g.name='Chez Odette'; g.size=14; g.level=12; g.coins=50000; g.tuto=true; g.prolog=1; g.open=true; g.sound=false; g.sat=96; g.music=false; g.floor=9; g.wall=9; g.ownF=[0,9]; g.ownW=[0,9];
 g.story={v:2,ch:0,step:0,seen:0,base:{},pages:0,started:1}; g.menu=['salade','pizza','burger','steak','crepe','tarte','omelette','pates'];
 defaultLayout();
 g.furn=g.furn.filter(f=>!['table','chair'].includes(FURN[f.t].kind)&&FURN[f.t].cat!=='Déco'); rebuildOcc();
 // une grande cuisine : fourneaux et fours sur tout le mur du fond
 for(let x=KR.x0;x<KR.x0+KR.w;x++) if(!fAt(x,0)){ g.furn.push({id:g.nid++,t:x%2?'stove':'oven',x,y:0}); rebuildOcc(); }
 // la salle : tables de ferme et nappes vichy, chaises paillées
 const tb=['tableR1','tableR2','tableR1','table2'], ch=['chairR1','chairR1','chair','chairR1']; let n=0;
 for(let y=1;y<S-1;y+=2) for(let x=1;x<S-2;x+=3){ let ok=true; for(const dx of [-1,0,1]) if(!inRest(x+dx,y)||inKitchen(x+dx,y)||fAt(x+dx,y)||isDoorC(x+dx,y)) ok=false; if(!ok||inKitchen(x,y-1)) continue;
  g.furn.push({id:g.nid++,t:tb[n%4],x,y},{id:g.nid++,t:ch[n%4],x:x-1,y},{id:g.nid++,t:ch[n%4],x:x+1,y}); n++; rebuildOcc(); }
 // beaucoup de décoration, dans un goût rustique
 const deco=['woodstove','barrel','winerack','lantern','olive','books','barrel','flowers','piano','lantern','winerack','candles','plant','barrel']; let d=0;
 for(let y=0;y<S-1;y++){ const x=S-1; if(fAt(x,y)||inKitchen(x,y)||isDoorC(x,y)) continue; g.furn.push({id:g.nid++,t:deco[d++%deco.length],x,y}); rebuildOcc(); }
 for(let x=KR.x0+KR.w+1;x<S-2;x+=2) if(!fAt(x,0)&&!inKitchen(x,0)){ g.furn.push({id:g.nid++,t:x%4<2?'flowers':'plant',x,y:0}); rebuildOcc(); }
 const O={N:{},W:{}}, mid=Math.floor(S/2), wo=['pans','plates','cuckoo','bottles','garland','art0','shelf','art3']; let o=0;
 for(const sd of ['N','W']) for(let i=0;i<S;i++){ let t=null; if(wallSlotOK(sd,i)){ if(sd==='N'&&i===mid) t='signW'; else if(sd==='N'&&Math.abs(i-mid)===1) t=null; else t=i%2?'winS':wo[o++%wo.length]; } O[sd][i]=t; }
 if(!wallSlotOK('N',mid)){ const j=[...Array(S).keys()].find(i=>wallSlotOK('N',i)&&wallSlotOK('N',i-1)&&wallSlotOK('N',i+1)); if(j!==undefined){ O.N[j]='signW'; O.N[j-1]=null; O.N[j+1]=null; } }
 g.wallObj=O; g.tiles={};
 for(const r of ['chef','chef','chef','waiter','waiter','waiter','waiter','waiter','waiter']){ const s=mkStaffData(r); s.q=2; s.xp=400; g.staff.push(s); } g.staff.forEach(s=>s.q=2);
 setSize(); rebuildOcc(); cineWorldReset(); buildCrew(); calcRating(); rating=5;
 const dd=dayOf(); dd.t=DAY_LEN*(12.3-8)/15; state.tv=(state.tv||0)+1;
 warming=true; try{ const m0=mode; mode='play'; for(let i=0;i<3200;i++){ if(i%16===0&&i<2900) spawnT=0; update(.05); rating=5; } mode=m0; }catch(e){ console.warn(e); } warming=false; floaters=[]; items=[]; trash=[]; modalQ.length=0;
}
// le déclin, petit à petit : la déco disparaît, les murs se vident, les déchets s'accumulent, la brigade s'en va
function cineDecay(C,k){
 C.dk=C.dk||{t:0,n:0}; const D=C.dk; if(C.t<D.t) return; D.t=C.t+.42; D.n++;
 const deco=state.furn.filter(f=>FURN[f.t].cat==='Déco');
 if(k>.08&&deco.length){ const f=deco[Math.floor(Math.random()*deco.length)]; state.furn=state.furn.filter(x=>x!==f); rebuildOcc(); }
 if(k>.15&&D.n%2===0){ const O=state.wallObj, c=[]; for(const sd of ['N','W']) for(const i in O[sd]) if(O[sd][i]&&!/^sign/.test(O[sd][i])) c.push([sd,i]); if(c.length){ const [sd,i]=c[Math.floor(Math.random()*c.length)]; O[sd][i]=null; state.tv=(state.tv||0)+1; } }
 if(k>.1&&trash.length<26){ for(let q=0;q<2;q++){ const x=Math.floor(Math.random()*S), y=1+Math.floor(Math.random()*(S-1)); if(!fAt(x,y)&&!inKitchen(x,y)) trash.push({id:uid++,x,y,e:['🍌','🧻','🥤','🍂'][Math.floor(Math.random()*4)]}); } }
 if(k>.5&&!custs.some(c=>c.st!=='leave')){ const free=state.furn.filter(f=>['table','chair'].includes(FURN[f.t].kind)); for(let q=0;q<3&&free.length>10;q++){ const f=free.splice(Math.floor(Math.random()*free.length),1)[0]; state.furn=state.furn.filter(x=>x!==f); } rebuildOcc(); }
 if(k>.45&&state.staff.length>2&&D.n%2){ try{ state.staff.pop(); orders=[]; buildCrew(); }catch(e){} }
 if(k>.85&&state.wall!==0){ state.wall=0; state.floor=0; state.tv=(state.tv||0)+1; }
}
function cinePrologue(done){
 const real=state, a=real.staff[0]?real.staff[0].name:'Léa', b=real.staff[1]?real.staff[1].name:'Hugo', P=k=>foodThumbs['who:'+k]||'';
 const who=(k,name)=>`<div class="inWho"><span style="border-color:${SAGA_WHO[k][1]}"><img src="${P(k)}" alt=""></span><b style="color:${SAGA_WHO[k][1]}">${name||SAGA_WHO[k][0]}</b></div>`;
 const el=document.createElement('div'); el.id='prolog'; el.className='cine load'; document.body.appendChild(el);
 el.innerHTML='<div class="ciTop"><div class="inBars"></div></div><div class="ciMid"><div class="ciLoad">Il y a vingt ans…</div><div class="ciCard"></div><div class="inStar"><i>★</i><span>5,0</span></div><i class="ciStamp">SAISIE</i></div><div class="inCap"><small></small><p></p><div class="inBtns"><button class="prS" id="prSkip">Passer</button><button class="b" id="prNext">Suite ›</button></div></div>';
 document.body.classList.add('cine'); wiping=true;
 const kc=()=>[KR.x0+KR.w/2,KR.y0+KR.d/2];
 const SC=[
  {y:'Il y a vingt ans',mus:{mn:0,en:1,bpm:124,snap:1},d:10,star:[5,5],cam:()=>{ const f=fitDist(); return [[S/2,S/2+.6,f*.62,Math.PI/4-.55,.62],[S/2,S/2+.3,f*.44,Math.PI/4+.25,.55]]; },t:'Chez Odette, on faisait la queue jusqu’au bout de la rue. La plus grande salle de la ville, une brigade de onze, et les meilleures assiettes de la ville.'},
  {y:'La grande salle',mus:{mn:0,en:1,bpm:124},d:8,star:[5,5],cam:()=>{ const f=fitDist(); return [[S*.2,S*.62,f*.2,Math.PI/4+.1,.36],[S*.72,S*.55,f*.24,Math.PI/4-.25,.4]]; },t:'Le poêle à bois ronflait tout l’hiver. Des cuivres aux murs, des tonneaux, des lanternes, des nappes à carreaux : on venait autant pour le décor que pour l’assiette.'},
  {y:'Aux fourneaux',mus:{mn:0,en:.9,bpm:120},d:8,star:[5,5],cam:()=>{ const f=fitDist(), k=kc(); return [[k[0]+1,k[1]+1.6,f*.3,Math.PI/4+.25,.5],[k[0]+.2,k[1]+.8,f*.2,Math.PI/4+.75,.42]]; },t:'En cuisine, Mamie Odette dirigeait tout. Les mariages, les anniversaires, les dimanches en famille : tout le quartier a un souvenir à sa table.'},
  {y:'Puis un hiver…',mus:{mn:1,en:.42,bpm:84},d:8,dim:1,card:()=>`${who('o')}<div class="inBill"><u>Clinique Saint-Roch</u><span>Soins</span><b data-cnt="18400">0</b><span>Traitement</span><b data-cnt="27900">0</b><span>Convalescence</span><b data-cnt="9600">0</b></div>`,t:'Odette tombe gravement malade. Les soins coûtent une fortune. Elle paie tout, sans rien dire à personne.'},
  {y:'Le déclin',mus:{mn:1,en:.6,bpm:92},d:14,star:[5,1.8],speed:5,decline:1,cam:()=>{ const f=fitDist(); return [[S/2,S/2+.3,f*.46,Math.PI/4+.25,.55],[S/2,S/2+.6,f*.66,Math.PI/4-.35,.68]]; },t:'Sans elle aux fourneaux, la salle se vide. Il faut vendre le piano, puis les cuivres, puis les tables. Les cuisiniers partent un à un. Les étoiles tombent.'},
  {y:'Un matin',mus:{mn:1,en:.12,bpm:60},d:8,star:[1.8,1.8],grey:1,stamp:1,card:()=>who('p'),cam:()=>{ const f=fitDist(); return [[S/2,S/2+.6,f*.66,Math.PI/4-.35,.68],[S/2,S-1,f*.4,Math.PI/4-.1,.5]]; },t:'M. Pinson, de la banque, arrive avec un avis de saisie. Le bistrot doit cinquante mille pièces. Il vient prendre les clés.'},
  {y:'Mais…',mus:{mn:1,en:.3,bpm:66},d:9,dim:1,grey:1,card:()=>`<div class="inDeed"><u>Acte de propriété</u><span>Établissement</span><b>Bistrot « Chez Odette »</b><span>Propriétaire</span><b class="inYou">Toi</b><em>Signé : Odette, il y a trois ans</em></div><div class="inDebt">Dette à reprendre<b data-cnt="12000">0</b></div>`,t:'En ouvrant le dossier, il découvre qu’Odette a mis le bistrot à ton nom. Personne ne peut le saisir… si tu acceptes l’héritage. Et la dette qui va avec.'},
  {y:'À l’hôpital',mus:{mn:1,en:.42,bpm:72},d:10,dim:1,grey:1,big:1,card:()=>who('o'),t:'« Tu viens de finir tes études, tu as la vie devant toi. Je ne t’oblige à rien. Mais ce bistrot, je l’ai ouvert avec un fourneau d’occasion et trois chaises. Il mérite mieux qu’un cadenas. »'},
  {y:'Aujourd’hui',mus:{mn:0,en:.62,bpm:96},d:10,restore:1,cam:()=>{ const f=fitDist(); return [[S/2+.25,S/2+.7,f*.8,Math.PI/4+.5,.7],[S/2+.25,S/2+.7,f*.5,Math.PI/4,.57]]; },t:`Voilà ce qu’il reste. De toute la brigade, seuls ${a} et ${b} sont encore là. Ils ne vont plus très vite, et ils ont promis à Odette de tenir un mois, pas plus. Après, il faudra recruter.`},
  {y:'À toi de jouer',mus:{mn:0,en:1,bpm:128,snap:1},d:9,last:1,big:1,card:()=>who('o'),t:'« Une dernière chose. Mon carnet de recettes, j’en ai donné les pages aux gens du quartier. Retrouve-les. Et ne laisse jamais partir quelqu’un le ventre vide. »'}];
 let i=-1, restored=false; const musOn=real.music!==false;
 const restore=()=>{ if(restored) return; restored=true; if(state===real){ el.classList.remove('grey'); return; } state=real; setSize(); rebuildOcc(); cineWorldReset(); buildCrew(); calcRating(); state.tv=(state.tv||0)+1; modalQ.length=0; closeModal(); el.classList.remove('grey'); };
 let ended=false; const end=()=>{ if(ended) return; ended=true; cineMusicStop(); restore(); setTimeout(()=>{ try{ musicStart(); }catch(e){} },1500); cine=null; wiping=false; document.body.classList.remove('cine'); cam.yaw=cam.yawT=Math.PI/4; cam.pitch=cam.pitchT=.57; centerCam(); real.prolog=1; save(); hud(); el.classList.add('out'); setTimeout(()=>el.remove(),600); done&&done(); };
 const go=()=>{ i++; if(i>=SC.length) return end(); const s=SC[i]; if(s.restore) restore(); if(musOn){ cineMusicMood(s.mus); cineMusicStart(); }
  cine={s,t:0,keys:s.cam?s.cam():null,speed:s.speed||1,go,nums:null,t0:performance.now()};
  if(s.decline){ state.open=false; }
  el.classList.toggle('dim',!!s.dim); el.classList.toggle('grey',!!s.grey&&!restored); el.classList.toggle('dying',!!s.decline); el.classList.toggle('stamp',!!s.stamp); el.classList.toggle('ciStar',!!s.star);
  const c=el.querySelector('.ciCard'); c.className='ciCard'+(s.card?' on':'')+(s.big?' big':'')+(s.stamp?' side':''); c.innerHTML=s.card?s.card():''; cine.nums=[...c.querySelectorAll('[data-cnt]')];
  el.querySelector('.inBars').innerHTML=SC.map((_,k)=>`<i class="${k<i?'done':k===i?'on':''}" style="--t:${s.d}s"></i>`).join('');
  el.querySelector('.inCap small').textContent=s.y; const p=el.querySelector('.inCap p'); p.textContent=s.t; p.classList.remove('in'); void p.offsetWidth; p.classList.add('in');
  el.querySelector('#prNext').textContent=s.last?'J’accepte le défi':'Suite ›'; el.querySelector('#prSkip').style.display=s.last?'none':''; };
 el.addEventListener('click',e=>{ if(e.target.closest('#prSkip')) return end(); if(e.target.closest('#prNext')){ audioInit(); sfx('pop'); go(); } });
 setTimeout(()=>{ if(ended) return; try{ cineGolden(); }catch(err){ console.warn(err); state=real; restored=true; setSize(); rebuildOcc(); cineWorldReset(); buildCrew(); } el.classList.remove('load'); go(); },60);
}
function cineTick(){
 const C=cine; if(!C) return; const now=performance.now(), dt=Math.min(.1,(now-(C.last||now))/1000); C.last=now; C.t+=dt; const s=C.s, k=Math.min(1,C.t/s.d), e=cineEase(k);
 if(modalQ.length||ui.panel){ modalQ.length=0; closeModal(); }
 if(C.keys){ const [A,B]=C.keys, L=j=>A[j]+(B[j]-A[j])*e; cam.tx=L(0); cam.tz=L(1); cam.dist=L(2); cam.yaw=cam.yawT=L(3); cam.pitch=cam.pitchT=L(4); updCam(); }
 if(s.decline){ CM.tg.en=.6-.4*k; CM.tg.bpm=92-26*k; try{ cineDecay(C,k); }catch(e){} const d=dayOf(); d.t=Math.min(DAY_LEN*.985,DAY_LEN*((12.3+(22.6-12.3)*e)-8)/15); C.lv=(C.lv||0)+dt; if(k>.12&&C.lv>.35){ C.lv=0; const stay=custs.filter(c=>c.st!=='leave'&&c.st!=='gone'), n=Math.max(1,Math.ceil(stay.length*.12)); for(let j=0;j<n&&stay.length;j++){ const c=stay.splice(Math.floor(Math.random()*stay.length),1)[0]; try{ c.mood='sad'; leave(c); }catch(e){} } } }
 const el=document.getElementById('prolog'); if(!el) return;
 if(s.star){ const sp=el.querySelector('.inStar span'); if(sp) sp.textContent=(s.star[0]+(s.star[1]-s.star[0])*e).toFixed(1).replace('.',','); }
 if(C.nums&&C.nums.length){ const q=Math.min(1,C.t/(s.d*.65)); for(const n of C.nums) n.textContent=Math.round(+n.dataset.cnt*q).toLocaleString('fr-FR')+' pièces'; }
 if(k>=1&&!s.last){ C.go(); }
}

/* --- musique du prologue : un vrai thème, rythmé et joyeux, qui ralentit et passe en mineur avec l'histoire, puis revient d'un coup --- */
const CM={on:false,gain:null,timer:null,next:0,step:0,bar:0,cur:{mn:0,en:1,bpm:124},tg:{mn:0,en:1,bpm:124}};
const CM_MAJ=[0,2,4,5,7,9,11], CM_MIN=[0,2,3,5,7,8,10];
// thème de 8 mesures : [degré, durée en croches] ; null = silence
const CM_TH=[[[9,2],[9,1],[8,1],[7,2],[4,2]],[[8,2],[8,1],[7,1],[6,2],[4,2]],[[7,2],[7,1],[6,1],[5,2],[7,2]],[[5,3],[7,1],[9,2],[8,2]],
 [[9,2],[9,1],[8,1],[7,2],[11,2]],[[11,2],[10,1],[9,1],[8,2],[6,2]],[[7,2],[5,2],[8,2],[6,2]],[[7,4],[null,2],[4,1],[6,1]]];
const CM_ROOT=[[0,0],[4,4],[5,5],[3,3],[0,0],[4,4],[3,4],[0,0]];
const CM_SLOTS=CM_TH.map(b=>{ const a=new Array(8).fill(null); let p=0; for(const [d,n] of b){ if(d!==null) a[p]=[d,n]; p+=n; } return a; });
function cmHz(deg,oct,mn,lead){ const sc=mn?CM_MIN:CM_MAJ, o=Math.floor(deg/7), d=((deg%7)+7)%7; let st=sc[d]; if(lead&&mn&&d===6) st=11; return 261.63*Math.pow(2,(st+12*(o+oct))/12); }
function cmEnv(node,t,a,d,v){ const g=AC.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+a); g.gain.exponentialRampToValueAtTime(1e-4,t+a+d); node.connect(g); g.connect(CM.gain); return g; }
function cmPluck(f,t,d,v,bright){ for(const [m,ty,vv] of [[1,'triangle',1],[2,'sine',.35],[bright?3:1,bright?'sine':'sine',bright?.12:.3]]){ const o=AC.createOscillator(); o.type=ty; o.frequency.value=f*m; cmEnv(o,t,.008,d,v*vv); o.start(t); o.stop(t+d+.1); } }
function cmPad(f,t,d,v){ const o=AC.createOscillator(), lp=AC.createBiquadFilter(), g=AC.createGain(); o.type='triangle'; o.frequency.value=f; lp.type='lowpass'; lp.frequency.value=900; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+d*.3); g.gain.linearRampToValueAtTime(v*.8,t+d*.75); g.gain.linearRampToValueAtTime(0,t+d*1.05); o.connect(lp); lp.connect(g); g.connect(CM.gain); o.start(t); o.stop(t+d*1.1); }
function cmBass(f,t,d,v){ const o=AC.createOscillator(), lp=AC.createBiquadFilter(); o.type='triangle'; o.frequency.value=f; lp.type='lowpass'; lp.frequency.value=420; o.connect(lp); cmEnv(lp,t,.01,d,v); o.start(t); o.stop(t+d+.1); }
function cmKick(t,v){ const o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(45,t+.12); cmEnv(o,t,.004,.16,v); o.start(t); o.stop(t+.25); }
function cmNoise(t,d,v,type,fq){ const n=Math.floor(AC.sampleRate*d), b=AC.createBuffer(1,n,AC.sampleRate), dd=b.getChannelData(0); for(let i=0;i<n;i++) dd[i]=(Math.random()*2-1)*Math.pow(1-i/n,2); const s=AC.createBufferSource(), g=AC.createGain(), fl=AC.createBiquadFilter(); fl.type=type; fl.frequency.value=fq; s.buffer=b; g.gain.value=v; s.connect(fl); fl.connect(g); g.connect(CM.gain); s.start(t); }
function cineMusicTick(){ if(!CM.on||!AC) return; const c=CM.cur, g=CM.tg;
 while(CM.next<AC.currentTime+.35){ const st=CM.step%8, bar=CM.bar%8;
  if(st===0){ c.mn=g.mn; if(g.snap){ c.bpm=g.bpm; c.en=g.en; g.snap=0; } else { c.bpm+=(g.bpm-c.bpm)*.6; c.en+=(g.en-c.en)*.7; } }
  const e8=30/c.bpm, mn=c.mn, en=c.en, t=CM.next+(st%2&&en>.6?e8*.14:0), root=CM_ROOT[bar][st<4?0:1], dom=root===4, full=en>.75;
  // batterie : grosse caisse, claquement, charleston
  if(full){ if(st===0||st===4) cmKick(t,.5); if(st===2||st===6){ cmNoise(t,.13,.2,'bandpass',1700); cmNoise(t+.012,.1,.12,'bandpass',2300); } cmNoise(t,.035,st%2?.07:.04,'highpass',7000); if(en>.95&&bar%4===3&&st===7) cmNoise(t,.2,.14,'bandpass',1200); }
  else if(en>.5){ if(st===0) cmKick(t,.3); if(st%2===0) cmNoise(t,.03,.03,'highpass',7000); }
  // basse qui rebondit
  if(en>.5){ if(st%4===0) cmBass(cmHz(root,-2,mn),t,e8*1.5,.34); else if(st%4===2) cmBass(cmHz(root+4,-2,mn,dom),t,e8*1.2,.24); else if(full&&st%4===3) cmBass(cmHz(root+7,-2,mn),t,e8*.7,.16); }
  else if(en>.2&&st===0) cmBass(cmHz(root,-2,mn),t,e8*7,.22);
  // accords : contretemps sautillants quand tout va bien, nappe quand ça va mal
  if(full&&st%2===1) for(const k of [0,2,4]) cmPluck(cmHz(root+k,-1,mn,dom),t,.16,.045,false);
  if(!full&&(st===0||(st===4&&CM_ROOT[bar][0]!==CM_ROOT[bar][1]))) for(const k of [0,2,4]) cmPad(cmHz(root+k,-1,mn,dom),t,e8*(CM_ROOT[bar][0]!==CM_ROOT[bar][1]?4:8),.035+.03*en);
  // le thème
  const n=CM_SLOTS[bar][st];
  if(n){ const f=cmHz(n[0],0,mn,dom), d=e8*n[1];
   if(full){ cmPluck(f,t,Math.min(.5,d*1.1),.2,true); if(en>.95) cmPluck(f*2,t,Math.min(.35,d),.06,true); }
   else if(en>.3) cmPluck(f,t,Math.max(.5,d*1.5),.17,false);
   else if(st===0||n[1]>=3) cmPluck(f/2,t,Math.max(1.2,d*2),.16,false); }
  CM.next+=e8; CM.step++; if(CM.step%8===0) CM.bar++; } }
function cineMusicStart(){ if(CM.on||!AC) return; try{ musicStop(); }catch(e){} CM.gain=AC.createGain(); CM.gain.gain.value=0; CM.gain.connect(AC.destination); CM.gain.gain.linearRampToValueAtTime(.6,AC.currentTime+.8); CM.on=true; CM.next=AC.currentTime+.1; CM.step=0; CM.bar=0; CM.cur={mn:CM.tg.mn,en:CM.tg.en,bpm:CM.tg.bpm}; CM.timer=setInterval(cineMusicTick,90); }
function cineMusicMood(m){ if(!m) return; Object.assign(CM.tg,m); }
function cineMusicStop(){ if(!CM.on) return; CM.on=false; clearInterval(CM.timer); try{ CM.gain.gain.cancelScheduledValues(AC.currentTime); CM.gain.gain.setValueAtTime(CM.gain.gain.value,AC.currentTime); CM.gain.gain.linearRampToValueAtTime(0,AC.currentTime+1.4); }catch(e){} }
