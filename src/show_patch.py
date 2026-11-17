# v0.54 : styles étendus (sols, murs, déco, objets muraux, enseignes) + restaurants témoins à visiter
def RX(a,b,n=1):
    global js
    c=js.count(a); assert c==n,('show_patch',a[:70],c); js=js.replace(a,b)
# --- nouveaux sols et murs, un par style ---
RX(" {n:'Marbre rose',a:'#f8e4e9',b:'#ecc9d2',pat:'tile',p:1500,d:7,u:8},\n];",""" {n:'Marbre rose',a:'#f8e4e9',b:'#ecc9d2',pat:'tile',p:1500,d:7,u:8},
 {n:'Tomettes',a:'#c96a4a',b:'#a8523a',pat:'tile',p:400,d:3,u:3,st:'paris'},
 {n:'Parquet blanchi',a:'#eadfca',b:'#dfd2b8',pat:'plank',p:350,d:2,u:2,st:'sea'},
 {n:'Damier rouge',a:'#fafaf6',b:'#d8453a',pat:'checker',p:600,d:4,u:3,st:'diner'},
 {n:'Tatami',a:'#cfd3a0',b:'#c2c890',pat:'plank',p:500,d:3,u:3,st:'zen'},
 {n:'Vieux plancher',a:'#9a6a40',b:'#8a5c36',pat:'plank',p:400,d:3,u:2,st:'rustic'},
 {n:'Béton ciré',a:'#b9bcc0',b:'#a3a7ac',pat:'tile',p:600,d:4,u:4,st:'indus'},
 {n:'Dalles de jardin',a:'#d9cfb8',b:'#c9d6b0',pat:'checker',p:350,d:2,u:2,st:'garden'},
 {n:'Marbre noir et or',a:'#2b2d33',b:'#c9a13a',pat:'tile',p:1800,d:8,u:8,st:'lux'},
];""")
RX(" {n:'Rose bonbon',c:'#fadbe6',s:'#f5c6d8',w:'#e59bba',p:1200,d:6,u:8},\n];",""" {n:'Rose bonbon',c:'#fadbe6',s:'#f5c6d8',w:'#e59bba',p:1200,d:6,u:8},
 {n:'Vert bistrot',c:'#2f5a48',w:'#1f3d31',p:500,d:4,u:3,st:'paris'},
 {n:'Rayures marine',c:'#f4f8fb',s:'#9cc4e4',w:'#5b8fc0',p:400,d:3,u:2,st:'sea'},
 {n:'Turquoise diner',c:'#8fdcd6',w:'#e5484d',p:500,d:4,u:3,st:'diner'},
 {n:'Papier washi',c:'#f3ecd8',w:'#5a4630',p:500,d:4,u:3,st:'zen'},
 {n:'Lambris bois',c:'#b98a5a',s:'#a87a4c',w:'#7a5230',p:450,d:3,u:2,st:'rustic'},
 {n:'Béton brut',c:'#a9adb2',w:'#6f747c',p:550,d:4,u:4,st:'indus'},
 {n:'Treillage vert',c:'#e6f2d8',s:'#cfe6b8',w:'#7fae6a',p:350,d:2,u:2,st:'garden'},
 {n:'Bordeaux et or',c:'#6a1f2e',w:'#d9b24a',p:1600,d:8,u:8,st:'lux'},
];
FLOORS[2].st='sea'; FLOORS[3].st='diner'; FLOORS[4].st='lux'; WALLS[2].st='indus';""")
# --- nouveaux objets de salle ---
RX(" cactus:{n:'Cactus',cat:'Déco',",""" bonsai:{n:'Bonsaï',cat:'Déco',st:'zen',p:130,d:4,u:3,kind:'decor',m:'bonsai'},
 andon:{n:'Lampe en papier',cat:'Déco',st:'zen',p:110,d:3,u:3,kind:'decor',m:'andon'},
 gumball:{n:'Distributeur de bonbons',cat:'Déco',st:'diner',p:160,d:4,u:3,kind:'decor',m:'gumball'},
 spot:{n:'Projecteur d’atelier',cat:'Déco',st:'indus',p:150,d:4,u:4,kind:'decor',m:'spot'},
 surf:{n:'Planche de surf',cat:'Déco',st:'sea',p:120,d:3,u:2,kind:'decor',m:'surf'},
 woodstove:{n:'Poêle à bois',cat:'Déco',st:'rustic',p:240,d:6,u:3,kind:'decor',m:'woodstove'},
 cactus:{n:'Cactus',cat:'Déco',""")
RX("function editUI(){ { let r=$('#estyle');","""const FST={jukebox:'diner',aquarium:'sea',fountain:'garden',statue:'lux',cactus:'indus',vase:'paris',coatrack:'paris',easel:'paris',olive:'garden',lantern:'rustic',barrel:'rustic',candles:'lux',palm:'sea',screen:'zen',winerack:'rustic',cage:'garden',gramo:'paris',piano:'lux'};
for(const k in FST) if(FURN[k]) FURN[k].st=FST[k];
const WST={winR:'sea',winA:'paris',mirror:'paris',shelf:'garden',winS:'rustic',winV:'lux',poster1:'paris',poster2:'sea',plates:'rustic',pans:'rustic',bottles:'paris',mirrorR:'lux',cuckoo:'rustic',bunting:'garden',garland:'garden',neon:'diner',signW:'rustic',signB:'paris',signR:'diner',signN:'diner'};
for(const k in WST) if(WOBJ[k]) WOBJ[k].st=WST[k];
Object.assign(WOBJ,{scroll:{n:'Kakemono',p:60,st:'zen'},fan:{n:'Éventail',p:45,st:'zen'},pipes:{n:'Étagère en tuyaux',p:70,st:'indus'},clockI:{n:'Horloge d’usine',p:85,st:'indus'},buoy:{n:'Bouée',p:40,st:'sea'},
 signZ:{n:'Enseigne japonaise',p:90,uniq:'sign',st:'zen'},signI:{n:'Enseigne métal',p:90,uniq:'sign',st:'indus'},signS:{n:'Enseigne marine',p:90,uniq:'sign',st:'sea'},signG:{n:'Enseigne guinguette',p:90,uniq:'sign',st:'garden'},signL:{n:'Enseigne palace',p:180,uniq:'sign',st:'lux'}});
const STYLED=['Tables','Chaises','Déco','sols','murs'], stOK=o=>estyle==='all'||(o.st||'classic')===estyle;
// ===================== RESTAURANTS TÉMOINS =====================
const SHOWS={
 paris:{f:5,w:5,t:['tableP1','tableP2'],c:['chairP1','chairP2'],d:['gramo','vase','easel','coatrack','plant'],win:'winA',sign:'signB',o:['poster1','bottles','mirror','lampW']},
 sea:{f:6,w:6,t:['tableS1','tableS2'],c:['chairS1','chairS2'],d:['palm','surf','aquarium','palm','flowers'],win:'winR',sign:'signS',o:['buoy','poster2','buoy','shelf']},
 diner:{f:7,w:7,t:['tableD1','tableD2'],c:['chairD1','chairD2'],d:['jukebox','gumball','lamp','gumball'],win:'win',sign:'signN',o:['neon','clock','neon','art1']},
 zen:{f:8,w:8,t:['tableZ1','tableZ2'],c:['chairZ1','chairZ2'],d:['bonsai','andon','screen','andon','bonsai'],win:'win',sign:'signZ',o:['scroll','fan','scroll','fan']},
 rustic:{f:9,w:9,t:['tableR1','tableR2'],c:['chairR1','chairR2'],d:['woodstove','barrel','winerack','lantern','barrel'],win:'winS',sign:'signW',o:['pans','cuckoo','plates','coat']},
 indus:{f:10,w:2,t:['tableI1','tableI2'],c:['chairI1','chairI2'],d:['spot','cactus','books','spot','cactus'],win:'win',sign:'signI',o:['pipes','clockI','pipes','poster1']},
 garden:{f:11,w:11,t:['tableG1','tableG2'],c:['chairG1','chairG2'],d:['fountain','olive','cage','olive','flowers'],win:'winS',sign:'signG',o:['garland','bunting','shelf','garland']},
 lux:{f:12,w:12,t:['tableL1','tableL2'],c:['chairL1','chairL2'],d:['piano','statue','candles','candles','vase'],win:'winV',sign:'signL',o:['mirrorR','lampW','mirrorR','lampW']},
};
let showBak=null, showSt=null;
const SHOW_KEYS=Object.keys(SHOWS), stName=k=>(ESTYLES.find(e=>e[0]===k)||[0,k])[1];
function showBuild(k){ const P=SHOWS[k], B=showBak, keep=B.furn.filter(f=>inKitchen(f.x,f.y)||['Cuisine','Bar'].includes(FURN[f.t].cat)||KITCHEN_KINDS.includes(FURN[f.t].kind)), F=keep.slice(); let id=900000;
 const used=new Set(keep.map(f=>f.x+','+f.y)), free=(x,y)=>inRest(x,y)&&!inKitchen(x,y)&&!used.has(x+','+y)&&y<S-1, put=(t,x,y)=>{ F.push({id:id++,t,x,y,r:0}); used.add(x+','+y); };
 let n=0; for(let y=1;y<S-1;y+=2) for(let x=2;x<S-1;x+=3){ if(!(free(x,y)&&free(x-1,y)&&free(x+1,y))) continue; put(P.t[n%2],x,y); const c=P.c[n%2]; put(c,x-1,y); put(c,x+1,y); n++; }
 let d=0; const spots=[]; for(let y=S-2;y>=0;y-=2) spots.push([0,y]); for(let x=S-1;x>1;x-=3) spots.push([x,0]); spots.push([S-1,S-2],[S-1,Math.floor(S/2)]);
 for(const [x,y] of spots){ if(!free(x,y)||[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{ const f=F.find(f=>f.x===x+a&&f.y===y+b); return f&&FURN[f.t].kind==='table'; })) continue; put(P.d[d%P.d.length],x,y); d++; }
 const O={N:{},W:{}}, mid=Math.floor(S/2); let o=0; for(const sd of ['N','W']) for(let i=0;i<S;i++){ let t=null; if(wallSlotOK(sd,i)){ if(sd==='N'&&i===mid) t=P.sign; else if(sd==='N'&&Math.abs(i-mid)===1) t=null; else t=(i%2?P.win:P.o[o++%P.o.length]); } O[sd][i]=t; }
 if(!wallSlotOK('N',mid)){ const j=[...Array(S).keys()].find(i=>wallSlotOK('W',i)&&wallSlotOK('W',i-1)&&wallSlotOK('W',i+1)); if(j!==undefined){ O.W[j]=P.sign; O.W[j-1]=null; O.W[j+1]=null; } }
 state.furn=F; state.floor=P.f; state.wall=P.w; state.tiles={}; state.wallObj=O; state.tv=(state.tv||0)+1; rebuildOcc(); }
function showEnter(k){ if(mode!=='play'&&mode!=='show') return; if(visit.on) return; closeModal();
 if(!showBak){ save(); showBak={furn:state.furn,floor:state.floor,wall:state.wall,tiles:state.tiles,wallObj:state.wallObj}; }
 showSt=k||showSt||SHOW_KEYS[0]; mode='show'; document.body.classList.add('showroom'); showBuild(showSt); showBar(); sfx('pop'); }
function showExit(){ if(!showBak) return; Object.assign(state,showBak); showBak=null; state.tv=(state.tv||0)+1; rebuildOcc(); mode='play'; document.body.classList.remove('showroom'); const b=$('#showbar'); if(b) b.classList.add('hide'); hud(); }
function showItems(k){ const P=SHOWS[k], cnt={}; for(const f of state.furn) if(f.id>=900000) cnt[f.t]=(cnt[f.t]||0)+1; const wc={}; for(const sd of ['N','W']) for(const i in state.wallObj[sd]){ const t=state.wallObj[sd][i]; if(t&&WOBJ[t].p) wc[t]=(wc[t]||0)+1; }
 const L=[]; L.push({n:FLOORS[P.f].n,sub:'Sol',p:state.ownF.includes(P.f)?0:FLOORS[P.f].p,u:FLOORS[P.f].u,own:state.ownF.includes(P.f)}); L.push({n:WALLS[P.w].n,sub:'Mur',p:state.ownW.includes(P.w)?0:WALLS[P.w].p,u:WALLS[P.w].u,own:state.ownW.includes(P.w)});
 for(const t in cnt){ const F=FURN[t]; L.push({n:F.n,sub:F.cat==='Déco'?'Objet':F.cat==='Tables'?'Table':'Chaise',q:cnt[t],p:F.p*cnt[t],u:F.u,img:thumbs[t]}); }
 for(const t in wc){ const W=WOBJ[t]; L.push({n:W.n,sub:'Mural',q:W.uniq?1:wc[t],p:W.p*(W.uniq?1:wc[t]),u:1,img:thumbs['wo:'+t]}); } return L; }
function showBar(){ let b=$('#showbar'); if(!b){ b=document.createElement('div'); b.id='showbar'; document.body.appendChild(b);
  b.addEventListener('click',e=>{ const t=e.target.closest('[data-sh]'); if(!t) return; audioInit(); const a=t.dataset.sh, i=SHOW_KEYS.indexOf(showSt);
   if(a==='prev') showEnter(SHOW_KEYS[(i+SHOW_KEYS.length-1)%SHOW_KEYS.length]); else if(a==='next') showEnter(SHOW_KEYS[(i+1)%SHOW_KEYS.length]); else if(a==='list') openPanel('showlist'); else if(a==='quit') showExit(); }); }
 const L=showItems(showSt), tot=L.reduce((s,x)=>s+x.p,0);
 b.classList.remove('hide'); b.innerHTML=`<div class="shT"><button data-sh="prev" aria-label="Style précédent">‹</button><div><small>Restaurant témoin</small><b>${stName(showSt)}</b></div><button data-sh="next" aria-label="Style suivant">›</button></div><div class="shB"><button data-sh="list">Voir la liste · ${tot} <i class="coin sm"></i></button><button data-sh="quit" class="q">Revenir chez moi</button></div>`; }
function editUI(){ { let r=$('#estyle');""")
RX("const on=etab==='Tables'||etab==='Chaises'; r.style.display=on?'':'none';","const on=STYLED.includes(etab)&&!wslot; r.style.display=on?'':'none';")
RX("(estyle==='all'||!['Tables','Chaises'].includes(etab)||(FURN[k].st||'classic')===estyle)","stOK(FURN[k])")
RX("  const fl=FLOORS.map((f,i)=>{ const l","  const fl=FLOORS.map((f,i)=>{ if(!stOK(f)) return ''; const l")
RX("  const wl=WALLS.map((f,i)=>{ const lo","  const wl=WALLS.map((f,i)=>{ if(!stOK(f)) return ''; const lo")
RX("const flT=FLOORS.map((f,i)=>{ const own","const flT=FLOORS.map((f,i)=>{ if(!stOK(f)) return ''; const own")
RX("  const wo=Object.keys(WOBJ).map(k=>{ const W=WOBJ[k]; return `<button class=","  const wo=Object.keys(WOBJ).map(k=>{ const W=WOBJ[k]; if(!wslot&&!stOK(W)) return ''; return `<button class=")
RX("function save(){ if(!state) return;","function save(){ if(!state||showBak) return;")
RX("const PANELS={","""const PANELS={
 shows(){ return {title:'Restaurants témoins',html:'<p class="center sub">Visite un bistro d’exposition pour chaque style, puis reproduis-le chez toi.</p><div class="shG">'+SHOW_KEYS.map(k=>{ const P=SHOWS[k]; return `<button class="shC" data-a="show" data-v="${k}"><span class="shI"><img src="${thumbs[P.t[0]]||''}" alt=""><img src="${thumbs[P.c[0]]||''}" alt=""></span><b>${stName(k)}</b></button>`; }).join('')+'</div>'}; },
 showlist(){ const L=showItems(showSt), tot=L.reduce((s,x)=>s+x.p,0), mx=L.reduce((m,x)=>Math.max(m,x.u),1);
  return {title:'Style '+stName(showSt),html:`<p class="center sub">Tout ce qu’il faut pour ce décor. Niveau conseillé : ${mx}.</p>`+L.map(x=>`<div class="row"><div class="ic">${x.img?`<img src="${x.img}" alt="" style="width:40px;height:40px">`:''}</div><div class="info"><div class="t">${x.n}${x.q>1?' × '+x.q:''}</div><div class="sub">${x.sub}${x.u>state.level?' · niveau '+x.u:''}</div></div><div class="shP">${x.own?'Déjà à toi':x.p+' <i class="coin sm"></i>'}</div></div>`).join('')+`<div class="row"><div class="info"><div class="t">Total</div></div><div class="shP"><b>${tot}</b> <i class="coin sm"></i></div></div><p class="center"><button class="b" data-a="showdeco">Décorer dans ce style</button></p>`}; },""",1)
RX("const MORE=[","const MORE=[['shows','Restaurants témoins','shop','#8fe0d6','#2fb5a8','#1c7d74'],")
RX(" close:()=>closeModal(),"," close:()=>closeModal(),\n show:v=>{ closeModal(); showEnter(v); },\n showdeco:()=>{ closeModal(); const k=showSt; showExit(); estyle=k; enterEdit('Tables'); },")
