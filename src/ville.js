// ===================== LA VILLE (v0.99) : le multijoueur. Une carte partagée, des quartiers, des voisins, des visites =====================
// Chaque joueur installe son bistrot dans un des six quartiers. Sa fiche publique (nom, niveau, points de la semaine, confrérie)
// est le seul document qu'il écrit ; classements, quartiers tenus et messages se calculent en lisant les fiches des autres.
// Des voisins « du jeu » peuplent la ville : ils sont signalés comme tels, et laissent leur place aux vrais joueurs.
const MP={on:false,real:[],all:[],byId:new Map(),G:[],gById:new Map(),sel:null,view:null,bg:null,sub:'j',t:0,snapT:0,snapH:'',cloudT:0,cloudH:'',npcK:'',npc:[],note:'',unsub:[],started:false,drag:null,lateT:0,fix:0,fixT:0,gOk:false};
const MP_D=[['Le Vieux-Port','#3f7fbf',[36,452,300,272]],['Les Halles','#c8553d',[356,452,290,272]],['La Gare','#6b7280',[666,452,298,272]],['La Butte','#8a5cf0',[36,36,290,270]],['Les Jardins','#3f9f6a',[346,36,300,270]],['Le Belvédère','#d4a53a',[666,36,298,270]]];
const MP_SLOTS=20, MP_W=1000, MP_H=760;
const MP_NPC_N=['Le Petit Zinc','Chez Lulu','La Mie Dorée','Le Fou du Roi','Au Bon Coin','La Table Ronde','Le Vieux Fourneau','Chez Paulette','Le Chat Gourmand','L’Assiette Bleue','La Cocotte','Le Comptoir','Au Fil de l’Eau','La Belle Époque','Le Pot au Feu','Chez Marius','La Bonne Étoile','Le Tablier','L’Entre-Deux','Le Grain de Sel','La Tête de Lard','Au Petit Bonheur','Le Bouchon','La Casserole','Chez Fernand','Le Moulin','La Dînette','Le Rendez-Vous','L’Ardoise','La Marmite','Le Café des Arts','Chez Suzon','Le Phare','La Guinguette','Le Zeste','La Louche d’Or'];
const MP_NPC_B=['Lulu','Marius','Paulette','Fernand','Suzon','Jeanne','Émile','Colette','Gaston','Ninon','Achille','Margot','Léon','Odile','Firmin','Rosalie','Basile','Clémence'];
const MP_NPC_G=[['npcg0','Les Toqués','TOQ',0,'#c8553d'],['npcg1','La Bonne Fourchette','BFO',1,'#3f7fbf'],['npcg2','Les Marmitons','MAR',2,'#3f9f6a']];
const mpS=()=>state.mp||(state.mp={});
const mpWeekN=t=>Math.floor(((t||Date.now())/864e5+3)/7), mpWk=t=>'w'+mpWeekN(t), mpLeft=()=>{ const ms=(mpWeekN()+1)*7*864e5-3*864e5-Date.now(), d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5); return d>0?d+' j '+h+' h':h>0?h+' h':'moins d’une heure'; };
const mpEsc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mpTxt=(t,n)=>String(t==null?'':t).replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,n);
const mpJoined=()=>!!(state.mp&&state.mp.in), mpMe=()=>NET.uid;
// ---------- les voisins du jeu : toujours les mêmes pour tout le monde, leurs points avancent avec la semaine ----------
function mpNPC(){ const wk=mpWeekN(), prog=Math.min(1,Math.max(.02,((Date.now()/864e5+3)%7)/7)), key=wk+'|'+Math.floor(prog*60); if(MP.npcK===key) return MP.npc; MP.npcK=key; const L=[];
 for(let i=0;i<MP_NPC_N.length;i++){ const r=seeded(1000+i*7), lv=3+Math.floor(r()*21), d=i%6, sl=Math.floor(r()*MP_SLOTS), g=r()<.64?'npcg'+Math.floor(r()*3):'', rate=(260+lv*95)*(.55+r()*.9), a=seeded(wk*37+i)(), b=seeded((wk-1)*37+i)();
  L.push({id:'npc'+i,npc:1,n:MP_NPC_N[i],b:MP_NPC_B[i%MP_NPC_B.length],lv,st:30+Math.floor(r()*20),sv:lv*900+Math.floor(r()*4000),ft:[Math.floor(r()*FLOORS.length),Math.floor(r()*WALLS.length)],d,sl,g,wk:'w'+wk,p:Math.floor(rate*prog*(.8+.4*a)),lw:['w'+(wk-1),Math.floor(rate*(.8+.4*b)),d,g],ms:[],hd:{},lk:{},on:0}); }
 return MP.npc=L; }
// ---------- lire la fiche d'un autre joueur : on ne fait confiance à rien ----------
function mpClean(x){ if(!x||typeof x.id!=='string'||x.id.length>80) return null; const num=(v,a,b,d)=>typeof v==='number'&&isFinite(v)?Math.min(b,Math.max(a,Math.floor(v))):d, o={id:x.id};
 o.n=mpTxt(x.n,18)||'Bistrot'; o.b=mpTxt(x.b,12); o.lv=num(x.lv,1,99,1); o.st=num(x.st,0,50,30); o.sv=num(x.sv,0,1e9,0); o.d=num(x.d,0,5,0); o.sl=num(x.sl,0,MP_SLOTS-1,0); o.p=num(x.p,0,1e7,0); o.wk=mpTxt(x.wk,12); o.g=mpTxt(x.g,80); o.on=num(x.on,0,4e12,0);
 o.ft=Array.isArray(x.ft)?[num(x.ft[0],0,FLOORS.length-1,0),num(x.ft[1],0,WALLS.length-1,0)]:[0,0];
 o.lw=Array.isArray(x.lw)&&x.lw.length>=4?[mpTxt(x.lw[0],12),num(x.lw[1],0,1e7,0),num(x.lw[2],0,5,0),mpTxt(x.lw[3],80)]:null;
 o.ms=Array.isArray(x.ms)?x.ms.slice(-6).filter(m=>Array.isArray(m)&&typeof m[0]==='number').map(m=>[m[0],mpTxt(m[1],140)]).filter(m=>m[1]):[];
 o.hp=x.hp&&typeof x.hp.t==='number'?{t:x.hp.t}:null; o.hd={}; if(x.hd&&typeof x.hd==='object') for(const k of Object.keys(x.hd).slice(0,12)) if(typeof x.hd[k]==='number') o.hd[k]=x.hd[k];
 o.lk={}; if(x.lk&&typeof x.lk==='object') for(const k of Object.keys(x.lk).slice(0,12)) if(typeof x.lk[k]==='number') o.lk[k]=x.lk[k];
 return o; }
function mpCleanG(x){ if(!x||typeof x.id!=='string') return null; return {id:x.id,n:mpTxt(x.n,20)||'Confrérie',tag:(mpTxt(x.tag,4)||'???').toUpperCase(),em:typeof x.em==='number'?Math.abs(Math.floor(x.em))%8:0,col:/^#[0-9a-f]{6}$/i.test(x.col)?x.col:'#8a6a4a',desc:mpTxt(x.desc,90),open:x.open!==false,ban:Array.isArray(x.ban)?x.ban.filter(b=>typeof b==='string').slice(0,40):[],ts:typeof x.ts==='number'?x.ts:0}; }
// ---------- la ville telle qu'on la voit : vrais joueurs d'abord, voisins du jeu sur les places restantes ----------
function mpBuild(){ const wk=mpWk(), L=[], used=new Set(), mine=mpJoined()?mpDoc():null, old=Date.now()-45*864e5, real=MP.real.filter(p=>p.id!==mpMe()&&!(p.on&&p.on<old)).slice(); if(mine) real.unshift(Object.assign({id:mpMe()||'moi',me:1},mine));
 real.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0); let lost=null;
 const place=p=>{ let s=p.sl; for(let k=0;k<MP_SLOTS;k++){ const q=(s+k)%MP_SLOTS; if(!used.has(p.d+':'+q)){ used.add(p.d+':'+q); p.sl=q; return true; } } return false; };
 for(const p of real){ if(p.wk!==wk){ if(!p.lw||p.lw[0]!==mpWk(Date.now()-7*864e5)){ if(p.wk===mpWk(Date.now()-7*864e5)) p.lw=[p.wk,p.p,p.d,p.g]; } p.p=0; } if(place(p)) L.push(p); else if(p.me) lost=p; }
 if(lost){ for(let d=0;d<MP_D.length;d++){ lost.d=d; lost.sl=0; if(place(lost)){ L.push(lost); break; } } }
 const mp0=state.mp, meP=L.find(p=>p.me); if(mp0&&meP&&(mp0.sl!==meP.sl||mp0.d!==meP.d)){ mp0.sl=meP.sl; mp0.d=meP.d; MP.fix=1; }
 for(const n of mpNPC()){ const p=Object.assign({},n); if(place(p)) L.push(p); }
 const G=[]; for(const g of MP_NPC_G) G.push({id:g[0],n:g[1],tag:g[2],em:g[3],col:g[4],desc:'Une confrérie du jeu, pour te mesurer à quelqu’un même en solitaire.',open:false,npc:1,ban:[]}); for(const g of MP.Graw||[]) G.push(g);
 MP.G=G; MP.gById=new Map(G.map(g=>[g.id,g])); for(const p of L){ if(p.g&&(!MP.gById.has(p.g)||MP.gById.get(p.g).ban.includes(p.id))){ if(p.me&&mp0&&mp0.g===p.g&&MP.gOk&&NET.kind!=='local'){ const ban=MP.gById.has(p.g); mp0.g=''; mp0.hp=null; mp0.ms=[]; mp0.gc=null; MP.fix=1; try{ toast(ban?'Tu as été exclu de ta confrérie.':'Ta confrérie a été dissoute.'); }catch(e){} } p.g=''; } }
 if(MP.fix&&!MP.fixT) MP.fixT=setTimeout(()=>{ MP.fixT=0; MP.fix=0; try{ save(); }catch(e){} try{ mpSync(true); }catch(e){} mpLive(); },0);
 MP.all=L; MP.byId=new Map(L.map(p=>[p.id,p])); return L; }
const mpGPts=(gid,last)=>MP.all.reduce((s,p)=>s+(last?(p.lw&&p.lw[3]===gid&&p.lw[0]===mpWk(Date.now()-7*864e5)?p.lw[1]:0):(p.g===gid?p.p:0)),0);
// qui tient un quartier : la confrérie qui y a marqué le plus de points (cette semaine : en cours ; la semaine passée : acquis)
function mpDistrict(d,last){ const T={}, lw=mpWk(Date.now()-7*864e5); for(const p of MP.all){ if(last){ if(p.lw&&p.lw[0]===lw&&p.lw[2]===d&&p.lw[3]) T[p.lw[3]]=(T[p.lw[3]]||0)+p.lw[1]; } else if(p.d===d&&p.g) T[p.g]=(T[p.g]||0)+p.p; }
 return Object.keys(T).map(g=>[g,T[g]]).filter(x=>x[1]>0&&MP.gById.has(x[0])).sort((a,b)=>b[1]-a[1]); }
function mpTip(){ try{ const m=state.mp; if(!m||!m.in||!m.g||!MP.all.length) return 1; const o=mpDistrict(m.d,true)[0]; return o&&o[0]===m.g?1.05:1; }catch(e){ return 1; } }
// ---------- ma fiche ----------
function mpDoc(){ const m=mpS(); return {v:1,n:mpTxt(state.name,18),b:mpTxt(state.me&&state.me.n,12),lv:state.level,st:Math.round((typeof rating==='number'?rating:(state.sat||70)/20)*10),sv:state.served||0,ft:[state.floor,state.wall],d:m.d||0,sl:m.sl||0,g:m.g||'',wk:m.wk||mpWk(),p:m.p||0,lw:m.lw||null,ms:m.ms||[],hp:m.hp||null,hd:m.hd||{},lk:m.lk||{},on:Math.floor(Date.now()/3e5)*3e5}; }
function mpTick(){ const m=state.mp; if(!m||!m.in) return; const wk=mpWk(); if(m.wk!==wk){ if(m.wk===mpWk(Date.now()-7*864e5)) m.lw=[m.wk,m.p||0,m.d||0,m.g||'']; m.wk=wk; m.p=0; m.hp=null; }
 const sv=state.served||0; if(typeof m.s0!=='number'||m.s0>sv) m.s0=sv; if(sv>m.s0){ m.p=(m.p||0)+(sv-m.s0); m.s0=sv; } }
function mpSync(now){ if(!NET.ready||!mpJoined()||MP.vis||showBak) return; mpTick(); const d=mpDoc(), on=d.on; delete d.on; const key=JSON.stringify(d); d.on=on; netPut('players/'+NET.uid,d,key); const t=Date.now();
 if(now||t-MP.snapT>3e5){ const sn=mpSnap(), h=JSON.stringify(sn); if(h!==MP.snapH){ MP.snapH=h; MP.snapT=t; netPut('bistros/'+NET.uid,sn); } else MP.snapT=t; }
 if(NET.kind!=='local'&&t-MP.cloudT>3e5&&!(MP.cloud&&MP.cloud.lv>state.level)){ MP.cloudT=t; const h=state.level+'|'+state.coins+'|'+state.served; if(h!==MP.cloudH){ MP.cloudH=h; try{ const s=JSON.stringify(state); if(s.length<8e4) netKeep('save',{s,t,lv:state.level}); }catch(e){} } } }
// l'aménagement, tel qu'un visiteur le verra
function mpSnap(){ return {v:1,n:mpTxt(state.name,18),size:state.size,floor:state.floor,wall:state.wall,kz:state.kz?{c:state.kz.c,w:state.kz.w,d:state.kz.d}:null,tiles:state.tiles||{},wallObj:state.wallObj||{},rugs:(state.rugs||[]).slice(0,RUG_MAX).map(r=>[r.t,r.x,r.y,r.r?1:0]),furn:state.furn.map(f=>[f.t,f.x,f.y,f.r||0])}; }
function mpSnapRead(x){ if(!x||!Array.isArray(x.furn)) return null; const size=Math.min(14,Math.max(8,Math.floor(+x.size||9))), ok=(a,n)=>Number.isInteger(a)&&a>=0&&a<n, F=[], seen=new Set(); let id=800000;
 for(const f of x.furn.slice(0,400)){ if(!Array.isArray(f)||!FURN[f[0]]||!ok(f[1],size)||!ok(f[2],size)||seen.has(f[1]+','+f[2])) continue; seen.add(f[1]+','+f[2]); const o={id:id++,t:f[0],x:f[1],y:f[2]}; if(ok(f[3],4)&&f[3]) o.r=f[3]; F.push(o); }
 const W={N:{},W:{}}; for(const sd of ['N','W']){ const s=x.wallObj&&x.wallObj[sd]; if(s&&typeof s==='object') for(const k of Object.keys(s).slice(0,20)){ if(ok(+k,size)&&(s[k]===null||WOBJ[s[k]])) W[sd][+k]=s[k]; } }
 const T={}; if(x.tiles&&typeof x.tiles==='object') for(const k of Object.keys(x.tiles).slice(0,220)){ if(/^\d{1,2},\d{1,2}$/.test(k)&&ok(x.tiles[k],FLOORS.length)) T[k]=x.tiles[k]; }
 const kz=x.kz&&['nw','ne','sw','se','n','w'].includes(x.kz.c)&&ok(x.kz.w,size)&&ok(x.kz.d,size)&&x.kz.w>=2&&x.kz.d>=2?{c:x.kz.c,w:x.kz.w,d:x.kz.d}:null;
 const G=[]; if(Array.isArray(x.rugs)) for(const r of x.rugs.slice(0,RUG_MAX)){ if(!Array.isArray(r)||typeof r[0]!=='string'||!Object.prototype.hasOwnProperty.call(RUGS,r[0])||!ok(r[1],size)||!ok(r[2],size)) continue; const R=RUGS[r[0]], rt=r[3]?1:0, w=rt?R.h:R.w, h=rt?R.w:R.h; if(r[1]+w<=size&&r[2]+h<=size) G.push({t:r[0],x:r[1],y:r[2],r:rt}); }
 return {n:mpTxt(x.n,18)||'Bistrot',size,floor:ok(x.floor,FLOORS.length)?x.floor:0,wall:ok(x.wall,WALLS.length)?x.wall:0,kz,tiles:T,wallObj:W,rugs:G,furn:F}; }
// ---------- mise en route ----------
function mpStart(){ if(MP.started) return; MP.started=true; netInit().then(()=>{ MP.on=true;
  const sub=()=>{ for(const u of MP.unsub) try{ u(); }catch(e){} MP.unsub=[];
   MP.note=''; clearTimeout(MP.lateT); if(NET.kind!=='local') MP.lateT=setTimeout(()=>{ MP.note='La ville tarde à répondre : en attendant, voici les voisins du jeu.'; mpLive(); },10000);
   MP.unsub.push(NET.drv.watch('players',L=>{ clearTimeout(MP.lateT); MP.note=''; MP.real=L.map(mpClean).filter(Boolean); mpBuild(); mpLive(); },e=>{ clearTimeout(MP.lateT); MP.note='La ville ne répond plus : recharge la page pour la retrouver.'; mpLive(); }));
   MP.gOk=false; MP.unsub.push(NET.drv.watch('guilds',L=>{ MP.Graw=L.map(mpCleanG).filter(Boolean); MP.gOk=true; mpBuild(); mpLive(); },()=>{})); };
  MP.sub0=sub; sub(); mpBuild(); if(mpJoined()) mpSync(true);
  setInterval(()=>{ try{ mpSync(); }catch(e){ console.warn(e); } },45000);
  if(NET.kind!=='local'&&!(state.served>0)&&state.level<=1){ NET.drv.pget('save').then(c=>{ if(c&&typeof c.s==='string'&&c.lv>1){ MP.cloud=c; try{ toast('Une partie sauvegardée t’attend : La Ville, onglet Moi.'); }catch(e){} } }).catch(()=>{}); }
 }).catch(e=>console.warn('ville',e)); }
function mpReconnect(){ return netInit(true).then(()=>{ MP.real=[]; MP.Graw=[]; if(MP.sub0) MP.sub0(); mpBuild(); if(mpJoined()) mpSync(true); mpLive(); }); }
NET.onLate=()=>{ if(!MP.vis&&!showBak) mpReconnect(); };
NET.onDeny=()=>{ const m=state.mp; if(m&&m.in){ m.in=0; try{ save(); }catch(e){} mpBuild(); mpLive(); toast('Ton accès à cette page ne permet pas de t’installer : tu restes en simple visite.'); } };
function mpLive(){ try{ if(ui.panel==='ville'&&!MP.drag&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))) renderPanel(); }catch(e){} }
function mpJoin(d){ const m=mpS(); if(!NET.can){ toast('Tu es en simple visite ici : demande un accès « contributeur » pour t’installer.'); return; } const first=!m.in; if(!first&&m.d===d) return;
 const used=new Set(MP.all.filter(p=>p.d===d&&!p.npc&&!p.me).map(p=>p.sl)); if(used.size>=MP_SLOTS){ toast('Ce quartier est complet : choisis-en un autre.'); return; }
 if(!first){ if(state.coins<300){ toast('Déménager coûte 300 pièces.'); return; } state.coins-=300; } let sl=Math.floor(Math.random()*MP_SLOTS); for(let k=0;k<MP_SLOTS;k++){ if(!used.has((sl+k)%MP_SLOTS)){ sl=(sl+k)%MP_SLOTS; break; } }
 m.in=1; m.d=d; m.sl=sl; if(!m.wk){ m.wk=mpWk(); m.p=0; m.s0=state.served||0; } save(); mpBuild(); mpSync(true); MP.sel=mpMe(); MP.view=null; toast(first?'Bienvenue en ville ! Ton bistrot s’installe : '+MP_D[d][0]+'.':'Déménagement réussi : '+MP_D[d][0]+'.'); sfx('level'); }
// ---------- visiter un bistrot : son aménagement remplace le mien le temps de la visite ----------
function mpVisit(id){ const p=MP.byId.get(id); if(!p||mode!=='play'||visit.on||MP.vis) return; closeModal();
 const go=sn=>{ if(mode!=='play'||MP.vis) return; save(); const B={furn:state.furn,floor:state.floor,wall:state.wall,tiles:state.tiles,wallObj:state.wallObj,rugs:state.rugs||[],size:state.size,kz:state.kz,name:state.name,crew,custs};
  showBak=B; MP.vis={id,p}; mode='show'; document.body.classList.add('showroom','mpvis');
  if(sn){ Object.assign(state,{furn:sn.furn,floor:sn.floor,wall:sn.wall,tiles:sn.tiles,wallObj:sn.wallObj,rugs:sn.rugs||[],size:sn.size,kz:sn.kz||{c:'nw',w:kitDefW(sn.size),d:3,auto:1},name:sn.n}); crew=[]; custs=[]; setSize(); }
  else { showSt=SHOW_KEYS[(+String(id).replace(/\D/g,'')||0)%SHOW_KEYS.length]; state.floor=p.ft[0]; state.wall=p.ft[1]; showBuild(showSt); state.name=p.n; }
  state.tv=(state.tv||0)+1; try{ centerCam(); }catch(e){} mpVisBar(); sfx('pop'); };
 if(p.npc||p.me) return go(null); toast('En route vers « '+p.n+' »…'); NET.drv.get('bistros/'+id).then(x=>go(mpSnapRead(x))).catch(()=>go(null)); }
function mpVisExit(){ const B=showBak; if(!B||!MP.vis) return; Object.assign(state,{furn:B.furn,floor:B.floor,wall:B.wall,tiles:B.tiles,wallObj:B.wallObj,rugs:B.rugs||[],size:B.size,kz:B.kz,name:B.name}); crew=B.crew; custs=B.custs; showBak=null; MP.vis=null; setSize(); state.tv=(state.tv||0)+1; mode='play'; document.body.classList.remove('showroom','mpvis'); const b=$('#vbar'); if(b) b.classList.add('hide'); try{ centerCam(); }catch(e){} hud(); try{ mpSync(); }catch(e){} openPanel('ville','carte'); }
function mpVisBar(){ let b=$('#vbar'); if(!b){ b=document.createElement('div'); b.id='vbar'; document.body.appendChild(b); b.addEventListener('click',e=>{ const t=e.target.closest('[data-vb]'); if(!t) return; audioInit(); if(t.dataset.vb==='quit') mpVisExit(); else if(t.dataset.vb==='like'){ mpLike(MP.vis.id); mpVisBar(); } }); }
 const p=MP.vis.p, g=p.g&&MP.gById.get(p.g), liked=mpLiked(p.id); b.classList.remove('hide');
 b.innerHTML=`<div class="vbT"><small>${p.npc?'Un voisin du jeu':'En visite chez'}</small><b>${mpEsc(p.n)}</b><span>Niveau ${p.lv}${g?' · '+mpEsc(g.n):''}</span></div><div class="vbB">${p.me?'':`<button data-vb="like" class="${liked?'on':''}" ${liked?'disabled':''}>♥ ${liked?'Coup de cœur donné':'Coup de cœur'}</button>`}<button data-vb="quit" class="q">Rentrer chez moi</button></div>`; }
const mpDay=()=>Math.floor(Date.now()/864e5);
const mpLiked=id=>{ const m=state.mp; return !!(m&&m.lk&&m.lk[id]===mpDay()); };
const mpLikes=id=>MP.all.reduce((s,p)=>s+(p.lk&&p.lk[id]?1:0),0)+(MP.byId.get(id)&&MP.byId.get(id).npc?(+String(id).replace(/\D/g,'')*7)%23:0);
function mpLike(id){ const m=mpS(); if(!m.in){ toast('Installe d’abord ton bistrot en ville.'); return; } if(mpLiked(id)) return; m.lk=m.lk||{}; const ks=Object.keys(m.lk); if(ks.filter(k=>m.lk[k]===mpDay()).length>=5){ toast('Cinq coups de cœur par jour, pas plus : choisis bien.'); return; }
 if(ks.length>=10) delete m.lk[ks.sort((a,b)=>m.lk[a]-m.lk[b])[0]]; m.lk[id]=mpDay(); m.p=(m.p||0)+3; save(); mpSync(); sfx('coin'); toast('Coup de cœur envoyé ! +3 points pour ta semaine.'); }
// ---------- la carte ----------
function mpPos(d,sl){ const R=MP_D[d][2], r=seeded(d*100+sl+5), cx=sl%5, cy=Math.floor(sl/5); return [R[0]+26+(cx+.5)*(R[2]-52)/5+(r()-.5)*14,R[1]+52+(cy+.5)*(R[3]-74)/4+(r()-.5)*10]; }
function mpBg(){ if(MP.bg) return MP.bg; const c=document.createElement('canvas'); c.width=MP_W; c.height=MP_H; const x=c.getContext('2d'), r=seeded(77);
 let g=x.createLinearGradient(0,0,0,MP_H); g.addColorStop(0,'#b9d47a'); g.addColorStop(1,'#a6c868'); x.fillStyle=g; x.fillRect(0,0,MP_W,MP_H);
 for(let i=0;i<260;i++){ x.fillStyle=`rgba(${r()<.5?'255,255,200':'70,120,40'},${.05+r()*.07})`; x.beginPath(); x.ellipse(r()*MP_W,r()*MP_H,10+r()*34,6+r()*18,r()*3,0,7); x.fill(); }
 // la rivière et ses ponts
 const riv=()=>{ x.beginPath(); x.moveTo(-20,372); x.bezierCurveTo(220,330,420,420,640,372); x.bezierCurveTo(800,340,900,400,1020,366); };
 x.lineCap='round'; x.strokeStyle='#8fb9c9'; x.lineWidth=92; riv(); x.stroke(); x.strokeStyle='#6fc0e0'; x.lineWidth=78; riv(); x.stroke(); x.strokeStyle='rgba(255,255,255,.28)'; x.lineWidth=3; x.setLineDash([26,34]); for(const o of [-18,6,24]){ x.save(); x.translate(0,o); riv(); x.stroke(); x.restore(); } x.setLineDash([]);
 // les rues
 const road=(pts,w)=>{ x.strokeStyle='#e9d9b6'; x.lineWidth=w; x.lineJoin='round'; x.beginPath(); pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])); x.stroke(); x.strokeStyle='rgba(255,255,255,.5)'; x.lineWidth=1.5; x.setLineDash([10,12]); x.stroke(); x.setLineDash([]); };
 road([[340,-10],[338,770]],20); road([[656,-10],[654,770]],20); road([[-10,318],[1010,316]],18); road([[-10,440],[1010,438]],18); road([[-10,18],[1010,18]],12); road([[-10,742],[1010,742]],12); road([[18,-10],[18,770]],12); road([[982,-10],[982,770]],12);
 for(const bx of [338,655]){ x.fillStyle='#c9a86a'; x.fillRect(bx-17,322,34,116); x.fillStyle='#a8834a'; x.fillRect(bx-17,322,34,5); x.fillRect(bx-17,433,34,5); x.strokeStyle='#8a6a3a'; x.lineWidth=2; for(let y=332;y<432;y+=12){ x.beginPath(); x.moveTo(bx-17,y); x.lineTo(bx+17,y); x.stroke(); } }
 // les quartiers
 MP_D.forEach((D,i)=>{ const R=D[2]; x.fillStyle=D[1]+'2b'; x.strokeStyle=D[1]; x.lineWidth=3; x.setLineDash([9,7]); x.beginPath(); x.roundRect(R[0],R[1],R[2],R[3],22); x.fill(); x.stroke(); x.setLineDash([]);
  x.fillStyle='rgba(255,250,235,.55)'; for(let s=0;s<MP_SLOTS;s++){ const p=mpPos(i,s); x.beginPath(); x.ellipse(p[0],p[1]+9,21,9,0,0,7); x.fill(); } });
 // arbres, barques, kiosque
 for(let i=0;i<150;i++){ const X=r()*MP_W, Y=r()*MP_H; if(Y>326&&Y<430) continue; if(MP_D.some(D=>X>D[2][0]+8&&X<D[2][0]+D[2][2]-8&&Y>D[2][1]+40&&Y<D[2][1]+D[2][3]-8)) continue; const s=5+r()*5; x.fillStyle='rgba(60,90,40,.25)'; x.beginPath(); x.ellipse(X+2,Y+s*.9,s,s*.4,0,0,7); x.fill(); x.fillStyle=['#5f9c3e','#77b23a','#4f8f44','#8cc43f'][i%4]; x.beginPath(); x.arc(X,Y,s,0,7); x.fill(); x.fillStyle='rgba(255,255,255,.25)'; x.beginPath(); x.arc(X-s*.3,Y-s*.3,s*.4,0,7); x.fill(); }
 for(const [bx,by,a] of [[150,366,.1],[470,392,-.12],[820,372,.08]]){ x.save(); x.translate(bx,by); x.rotate(a); x.fillStyle='#8a5a36'; x.beginPath(); x.ellipse(0,0,17,6,0,0,7); x.fill(); x.fillStyle='#fffaf0'; x.beginPath(); x.moveTo(-2,-2); x.lineTo(-2,-22); x.lineTo(12,-4); x.fill(); x.restore(); }
 return MP.bg=c; }
function mpMapHTML(){ const L=MP.all, me=mpMe(), lw=[0,1,2,3,4,5].map(d=>mpDistrict(d,true)[0]); let h=`<div class="vMap" id="vMap"><div class="vWorld" id="vWorld"><canvas width="${MP_W}" height="${MP_H}"></canvas>`;
 MP_D.forEach((D,i)=>{ const R=D[2], o=lw[i]&&MP.gById.get(lw[i][0]); h+=`<div class="vD" style="left:${R[0]+R[2]/2}px;top:${R[1]+6}px;--c:${D[1]}"><b>${D[0]}</b>${o?`<i style="background:${o.col}">${mpEsc(o.tag)}</i>`:''}</div>`; });
 for(const p of L){ const xy=mpPos(p.d,p.sl), g=p.g&&MP.gById.get(p.g); h+=`<button class="vB${p.me?' me':''}${p.npc?' npc':''}${MP.sel===p.id?' sel':''}" style="left:${xy[0].toFixed(1)}px;top:${xy[1].toFixed(1)}px;--c:${g?g.col:'#f6ead6'}" data-a="vsel" data-v="${mpEsc(p.id)}" aria-label="${mpEsc(p.n)}"><svg viewBox="0 0 40 40"><path d="M5 19 20 6l15 13v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill="#fffaf0" stroke="#5a3520" stroke-width="2.5" stroke-linejoin="round"/><path d="M3 20 20 5l17 15" fill="none" stroke="var(--c)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 20 20 5l17 15" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,-2.6)"/><rect x="16" y="23" width="8" height="13" rx="1.5" fill="#c8553d" stroke="#5a3520" stroke-width="1.6"/></svg><b>${mpEsc(p.n)}</b>${p.me?'<em>Moi</em>':''}</button>`; }
 return h+'</div><div class="vZoom"><button data-a="vzoom" data-v="1" aria-label="Zoom avant">+</button><button data-a="vzoom" data-v="-1" aria-label="Zoom arrière">−</button><button data-a="vhome" aria-label="Mon bistrot">⌂</button></div></div>'; }
function mpView(){ const el=$('#vMap'); if(!el) return; const w=el.clientWidth||320, hh=el.clientHeight||300; let V=MP.view; if(!V){ const m=state.mp, me=m&&m.in?mpPos(m.d||0,m.sl||0):[MP_W/2,MP_H/2], z=m&&m.in?.62:Math.max(w/MP_W,hh/MP_H); V=MP.view={z,x:w/2-me[0]*z,y:hh/2-me[1]*z}; }
 V.z=Math.min(1.5,Math.max(Math.max(w/MP_W,hh/MP_H),V.z)); V.x=Math.min(0,Math.max(w-MP_W*V.z,V.x)); V.y=Math.min(0,Math.max(hh-MP_H*V.z,V.y)); const wd=$('#vWorld'); wd.style.transform=`translate(${V.x.toFixed(1)}px,${V.y.toFixed(1)}px) scale(${V.z.toFixed(3)})`; el.classList.toggle('far',V.z<.5); }
// après chaque rendu du panneau : on redessine le fond et on rebranche les gestes
function mpAfter(){ if(ui.panel!=='ville') return; const el=$('#vMap'); if(!el) return; const cv=el.querySelector('canvas'); try{ cv.getContext('2d').drawImage(mpBg(),0,0); }catch(e){} mpView(); if(el._on) return; el._on=1; const P=new Map(); let d0=0, z0=1, moved=0;
 el.addEventListener('pointerdown',e=>{ P.set(e.pointerId,[e.clientX,e.clientY]); moved=0; if(P.size===2){ const a=[...P.values()]; d0=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]); z0=MP.view.z; } });
 el.addEventListener('pointermove',e=>{ const p=P.get(e.pointerId); if(!p) return; const dx=e.clientX-p[0], dy=e.clientY-p[1]; P.set(e.pointerId,[e.clientX,e.clientY]); const V=MP.view;
  if(P.size===1){ moved+=Math.abs(dx)+Math.abs(dy); if(moved>6){ MP.drag=1; V.x+=dx; V.y+=dy; mpView(); } }
  else if(P.size===2&&d0>0){ MP.drag=1; const a=[...P.values()], d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]), r=el.getBoundingClientRect(), cx=(a[0][0]+a[1][0])/2-r.left, cy=(a[0][1]+a[1][1])/2-r.top, z=Math.min(1.5,Math.max(.25,z0*d/d0)), k=z/V.z; V.x=cx-(cx-V.x)*k; V.y=cy-(cy-V.y)*k; V.z=z; mpView(); } });
 const up=e=>{ P.delete(e.pointerId); if(!P.size) setTimeout(()=>{ MP.drag=null; },30); }; el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up); el.addEventListener('pointerleave',up);
 el.addEventListener('click',e=>{ if(moved>6){ e.stopPropagation(); e.preventDefault(); } },true);
 el.addEventListener('wheel',e=>{ e.preventDefault(); const V=MP.view, r=el.getBoundingClientRect(), cx=e.clientX-r.left, cy=e.clientY-r.top, z=Math.min(1.5,Math.max(.25,V.z*(e.deltaY<0?1.15:.87))), k=z/V.z; V.x=cx-(cx-V.x)*k; V.y=cy-(cy-V.y)*k; V.z=z; mpView(); },{passive:false}); }
function mpZoom(k){ const el=$('#vMap'), V=MP.view; if(!el||!V) return; const cx=el.clientWidth/2, cy=el.clientHeight/2, z=Math.min(1.5,Math.max(.25,V.z*(k>0?1.3:.77))), r=z/V.z; V.x=cx-(cx-V.x)*r; V.y=cy-(cy-V.y)*r; V.z=z; mpView(); }
// ---------- classements ----------
const mpRank=()=>MP.all.slice().sort((a,b)=>b.p-a.p||(a.id<b.id?-1:1));
const mpRankG=last=>MP.G.map(g=>({g,p:mpGPts(g.id,last),n:MP.all.filter(p=>p.g===g.id).length})).filter(x=>x.n>0||x.p>0).sort((a,b)=>b.p-a.p);
const MP_LG=[['Diamant','#6fc0e0',.05],['Or','#d4a53a',.2],['Argent','#a9b3bd',.5],['Bronze','#b9772e',1]];
const mpLeague=(rank,n)=>MP_LG.find(l=>rank/n<=l[2])||MP_LG[3];
function mpLastWeek(){ const lw=mpWk(Date.now()-7*864e5), L=MP.all.filter(p=>p.lw&&p.lw[0]===lw).sort((a,b)=>b.lw[1]-a.lw[1]), i=L.findIndex(p=>p.me); if(i<0||!L[i].lw[1]) return null; const lg=mpLeague(i,L.length); return {wk:lw,rank:i+1,n:L.length,pts:L[i].lw[1],lg,coins:[2500,1400,800,350][MP_LG.indexOf(lg)]+(i===0?1500:0),en:[10,6,4,2][MP_LG.indexOf(lg)]}; }
function mpClaim(){ const R=mpLastWeek(), m=mpS(); if(!R||m.cl===R.wk) return; m.cl=R.wk; earn(R.coins); try{ energyTick(); state.en.v=Math.min(EN_MAX,state.en.v+R.en); }catch(e){} save(); sfx('level'); toast('Ligue '+R.lg[0]+' : +'+fmt(R.coins)+' pièces, +'+R.en+' énergie.'); }
